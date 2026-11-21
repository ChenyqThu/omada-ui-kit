import React, { useEffect, useRef, useState } from 'react';

export type MacSeparator = '-' | ':';

export interface SMacInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  separator?: MacSeparator;
  disabled?: boolean;
  status?: 'error' | 'warning';
  size?: 'middle' | 'large';
  className?: string;
  'aria-label'?: string;
}

type SixPairs = [string, string, string, string, string, string];

function parseMacSegments(raw = ''): SixPairs {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return ['', '', '', '', '', ''];

  if (/[-:.]/.test(trimmed)) {
    const parts = trimmed.split(/[-:.]/);
    return [
      (parts[0] ?? '').replace(/[^0-9A-F]/g, '').slice(0, 2),
      (parts[1] ?? '').replace(/[^0-9A-F]/g, '').slice(0, 2),
      (parts[2] ?? '').replace(/[^0-9A-F]/g, '').slice(0, 2),
      (parts[3] ?? '').replace(/[^0-9A-F]/g, '').slice(0, 2),
      (parts[4] ?? '').replace(/[^0-9A-F]/g, '').slice(0, 2),
      (parts[5] ?? '').replace(/[^0-9A-F]/g, '').slice(0, 2),
    ];
  }

  const hex = trimmed.replace(/[^0-9A-F]/g, '').slice(0, 12);
  return [
    hex.slice(0, 2),
    hex.slice(2, 4),
    hex.slice(4, 6),
    hex.slice(6, 8),
    hex.slice(8, 10),
    hex.slice(10, 12),
  ];
}

function serializeMac(pairs: SixPairs, separator: MacSeparator): string {
  if (pairs.every((p) => p === '')) return '';
  return pairs.join(separator);
}

/**
 * Normalizes any MAC address string (`aa:bb:cc:dd:ee:ff` or `aabbccddeeff`) into uppercase separated form.
 */
export function normalizeMac(
  raw: string,
  separator: MacSeparator = '-',
): string {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  if (hex.length !== 12) return raw.trim().toUpperCase();
  return (hex.match(/.{2}/g) ?? []).join(separator);
}

/**
 * Validates whether a string is a complete 6-byte MAC address with `-` or `:` separators.
 */
export function validateMac(mac: string): boolean {
  return /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac.trim());
}

/**
 * 6-segment hexadecimal MAC address input matching Omada's filled control specification.
 * Auto-uppercases, filters non-hex input, auto-advances across pairs, and formats pasted MACs.
 */
export const SMacInput: React.FC<SMacInputProps> = ({
  value,
  defaultValue = '',
  onChange,
  separator = '-',
  disabled = false,
  status,
  size = 'middle',
  className = '',
  'aria-label': ariaLabel = 'MAC address',
}) => {
  const [inner, setInner] = useState<SixPairs>(() =>
    parseMacSegments(value ?? defaultValue),
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (value !== undefined) {
      setInner(parseMacSegments(value));
    }
  }, [value]);

  const current = value !== undefined ? parseMacSegments(value) : inner;

  const commit = (next: SixPairs) => {
    if (value === undefined) {
      setInner(next);
    }
    onChange?.(serializeMac(next, separator));
  };

  const handleSegmentChange = (index: number, raw: string) => {
    const clean = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 2);
    const nextPairs: SixPairs = [...current] as SixPairs;
    nextPairs[index] = clean;
    commit(nextPairs);

    if (clean.length === 2 && index < 5) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if ((e.key === '-' || e.key === ':') && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
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
    const hexOnly = text.replace(/[^0-9a-fA-F]/g, '');
    if (hexOnly.length >= 4 || /[-:.]/.test(text)) {
      e.preventDefault();
      commit(parseMacSegments(text));
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
      {current.map((pair, idx) => (
        <React.Fragment key={idx}>
          <input
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            aria-label={`MAC pair ${idx + 1}`}
            disabled={disabled}
            value={pair}
            placeholder="00"
            onChange={(e) => handleSegmentChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-7 flex-1 bg-transparent text-center text-sm uppercase text-[var(--omada-text-primary)] placeholder:text-[var(--omada-text-tertiary)] focus:outline-none disabled:cursor-not-allowed"
          />
          {idx < 5 && (
            <span className="select-none px-0.5 text-sm font-semibold text-[var(--omada-text-tertiary)]">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
