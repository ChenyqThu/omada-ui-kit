import React, { useEffect, useRef, useState } from 'react';

export type SIpInputMode = 'ip' | 'cidr' | 'port';

export interface ParsedIpValue {
  octets: [string, string, string, string];
  extra: string;
}

export interface SIpInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  mode?: SIpInputMode;
  disabled?: boolean;
  status?: 'error' | 'warning';
  size?: 'middle' | 'large';
  placeholder?: [string, string, string, string];
  extraPlaceholder?: string;
  className?: string;
  'aria-label'?: string;
}

function clampNumeric(raw: string, max: number): string {
  const digits = raw.replace(/\D/g, '').slice(0, max >= 1000 ? 5 : 3);
  if (!digits) return '';
  const num = Number(digits);
  if (num > max) return String(max);
  return String(num);
}

/**
 * Parses an IPv4, IPv4/CIDR, or IPv4:Port string into 4 octet strings + optional extra suffix.
 */
export function parseIpValue(
  raw = '',
  mode: SIpInputMode = 'ip',
): ParsedIpValue {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { octets: ['', '', '', ''], extra: '' };
  }

  let ipPart = trimmed;
  let extra = '';

  if (mode === 'cidr' && trimmed.includes('/')) {
    const [left, right = ''] = trimmed.split('/');
    ipPart = left;
    extra = clampNumeric(right, 32);
  } else if (mode === 'port' && trimmed.includes(':')) {
    const [left, right = ''] = trimmed.split(':');
    ipPart = left;
    extra = clampNumeric(right, 65535);
  } else {
    ipPart = trimmed.split(/[/:]/)[0] ?? '';
  }

  const parts = ipPart.split('.');
  const octets: [string, string, string, string] = [
    clampNumeric(parts[0] ?? '', 255),
    clampNumeric(parts[1] ?? '', 255),
    clampNumeric(parts[2] ?? '', 255),
    clampNumeric(parts[3] ?? '', 255),
  ];

  return { octets, extra };
}

function serializeIpValue(parsed: ParsedIpValue, mode: SIpInputMode): string {
  const hasOctets = parsed.octets.some((o) => o !== '');
  if (!hasOctets && !parsed.extra) return '';
  const base = parsed.octets.join('.');
  if (mode === 'cidr' && parsed.extra !== '') {
    return `${base}/${parsed.extra}`;
  }
  if (mode === 'port' && parsed.extra !== '') {
    return `${base}:${parsed.extra}`;
  }
  return base;
}

/**
 * Validates whether a string is a complete, in-range IPv4 address (`0.0.0.0` - `255.255.255.255`).
 */
export function validateIpv4(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

/**
 * Validates whether a string is a valid IPv4/CIDR address (`a.b.c.d/0..32`).
 */
export function validateCidr(cidr: string): boolean {
  const parts = cidr.trim().split('/');
  if (parts.length !== 2) return false;
  const [ip, mask] = parts;
  if (!validateIpv4(ip) || !/^\d{1,2}$/.test(mask)) return false;
  const maskNum = Number(mask);
  return maskNum >= 0 && maskNum <= 32;
}

/**
 * Segmented IPv4 / CIDR / IP:Port input matching Omada's filled control specification.
 * Supports dot-key advance, auto-advance, Backspace navigation, and smart clipboard paste.
 */
export const SIpInput: React.FC<SIpInputProps> = ({
  value,
  defaultValue = '',
  onChange,
  mode = 'ip',
  disabled = false,
  status,
  size = 'middle',
  placeholder = ['192', '168', '0', '1'],
  extraPlaceholder,
  className = '',
  'aria-label': ariaLabel = 'IP address',
}) => {
  const [inner, setInner] = useState<ParsedIpValue>(() =>
    parseIpValue(value ?? defaultValue, mode),
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (value !== undefined) {
      setInner(parseIpValue(value, mode));
    }
  }, [value, mode]);

  const current = value !== undefined ? parseIpValue(value, mode) : inner;

  const commit = (next: ParsedIpValue) => {
    if (value === undefined) {
      setInner(next);
    }
    onChange?.(serializeIpValue(next, mode));
  };

  const handleOctetChange = (index: number, raw: string) => {
    const nextVal = clampNumeric(raw, 255);
    const nextOctets: [string, string, string, string] = [...current.octets] as [
      string,
      string,
      string,
      string,
    ];
    nextOctets[index] = nextVal;
    commit({ ...current, octets: nextOctets });

    if (nextVal.length === 3 && index < 3) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    } else if (nextVal.length === 3 && index === 3 && mode !== 'ip') {
      inputRefs.current[4]?.focus();
      inputRefs.current[4]?.select();
    }
  };

  const handleExtraChange = (raw: string) => {
    const max = mode === 'cidr' ? 32 : 65535;
    commit({ ...current, extra: clampNumeric(raw, max) });
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === '.' && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    } else if (e.key === '/' && mode === 'cidr') {
      e.preventDefault();
      inputRefs.current[4]?.focus();
      inputRefs.current[4]?.select();
    } else if (e.key === ':' && mode === 'port') {
      e.preventDefault();
      inputRefs.current[4]?.focus();
      inputRefs.current[4]?.select();
    } else if (
      e.key === 'Backspace' &&
      e.currentTarget.value === '' &&
      index > 0
    ) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (/[.:/]/.test(text)) {
      e.preventDefault();
      const parsed = parseIpValue(text, mode);
      commit(parsed);
    }
  };

  const heightPx = size === 'large' ? 40 : 32;
  const statusClass =
    status === 'error' ? 'is-error' : status === 'warning' ? 'is-warning' : '';

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`omada-segmented-field w-full max-w-[350px] ${statusClass} ${
        disabled ? 'is-disabled' : ''
      } ${className}`.trim()}
      style={{ height: heightPx }}
    >
      {current.octets.map((octet, idx) => (
        <React.Fragment key={idx}>
          <input
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            aria-label={`Octet ${idx + 1}`}
            disabled={disabled}
            value={octet}
            placeholder={placeholder[idx]}
            onChange={(e) => handleOctetChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-10 flex-1 bg-transparent text-center text-sm text-[var(--omada-text-primary)] placeholder:text-[var(--omada-text-tertiary)] focus:outline-none disabled:cursor-not-allowed"
          />
          {idx < 3 && (
            <span className="select-none px-0.5 text-sm font-semibold text-[var(--omada-text-tertiary)]">
              .
            </span>
          )}
        </React.Fragment>
      ))}

      {mode !== 'ip' && (
        <>
          <span className="select-none px-1 text-sm font-semibold text-[var(--omada-text-secondary)]">
            {mode === 'cidr' ? '/' : ':'}
          </span>
          <input
            ref={(el) => {
              inputRefs.current[4] = el;
            }}
            type="text"
            inputMode="numeric"
            aria-label={mode === 'cidr' ? 'Subnet mask' : 'Port'}
            disabled={disabled}
            value={current.extra}
            placeholder={extraPlaceholder ?? (mode === 'cidr' ? '24' : '8080')}
            onChange={(e) => handleExtraChange(e.target.value)}
            onKeyDown={(e) => handleKeyDown(4, e)}
            onPaste={handlePaste}
            className={`bg-transparent text-center text-sm text-[var(--omada-text-primary)] placeholder:text-[var(--omada-text-tertiary)] focus:outline-none disabled:cursor-not-allowed ${
              mode === 'cidr' ? 'w-9' : 'w-14'
            }`}
          />
        </>
      )}
    </div>
  );
};
