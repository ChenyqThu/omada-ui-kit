import React, { useState } from 'react';
import {
  Input,
  InputNumber,
  type InputNumberProps,
  type InputProps,
} from 'antd';
import type { PasswordProps, TextAreaProps } from 'antd/es/input';
import { Check, Circle, Search, X } from 'lucide-react';
import { SIcon } from '../assets/SIcon';

export interface SInputProps extends InputProps {}

/**
 * Omada text input defaulting to filled grey background (`#F4F4F4` / `#272727`).
 */
export const SInput: React.FC<SInputProps> = ({
  variant = 'filled',
  className = '',
  ...rest
}) => {
  return (
    <Input
      variant={variant}
      className={`omada-input ${className}`.trim()}
      {...rest}
    />
  );
};

export interface SSearchInputProps extends InputProps {
  width?: number | string;
}

/**
 * Omada search input (260px default width, leading search icon, clearable).
 */
export const SSearchInput: React.FC<SSearchInputProps> = ({
  variant = 'filled',
  allowClear = true,
  width = 260,
  placeholder = 'Search',
  prefix,
  style,
  className = '',
  ...rest
}) => {
  return (
    <Input
      variant={variant}
      allowClear={allowClear}
      placeholder={placeholder}
      prefix={prefix ?? <Search size={15} className="text-[var(--omada-text-tertiary)]" />}
      className={`omada-input ${className}`.trim()}
      style={{ width, ...style }}
      {...rest}
    />
  );
};

interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

function evaluatePasswordStrength(val: string): PasswordStrengthResult {
  if (!val) {
    return { score: 0, label: '', color: 'var(--omada-border-divider)' };
  }
  let checks = 0;
  if (val.length >= 8) checks++;
  if (/[a-z]/.test(val) && /[A-Z]/.test(val)) checks++;
  if (/\d/.test(val)) checks++;
  if (/[^a-zA-Z0-9]/.test(val)) checks++;

  if (val.length < 6 || checks <= 1) {
    return { score: 1, label: 'Weak', color: 'var(--omada-color-error)' };
  }
  if (checks === 2) {
    return { score: 2, label: 'Medium', color: 'var(--omada-color-warning)' };
  }
  if (checks === 3) {
    return { score: 3, label: 'Strong', color: '#87C969' };
  }
  return { score: 4, label: 'Very Strong', color: 'var(--omada-color-success)' };
}

export interface PasswordRuleConfig {
  key: string;
  label: string;
  validate: (value: string) => boolean;
}

export const DEFAULT_PASSWORD_RULES: PasswordRuleConfig[] = [
  {
    key: 'minLength',
    label: 'At least 8 characters',
    validate: (val) => val.length >= 8,
  },
  {
    key: 'mixedCase',
    label: 'Contains uppercase and lowercase letters',
    validate: (val) => /[a-z]/.test(val) && /[A-Z]/.test(val),
  },
  {
    key: 'digit',
    label: 'Contains at least one number (0-9)',
    validate: (val) => /\d/.test(val),
  },
  {
    key: 'special',
    label: 'Contains a special character (!@#$%^&*)',
    validate: (val) => /[^a-zA-Z0-9]/.test(val),
  },
];

export interface SPasswordInputProps extends PasswordProps {
  /** Show the 4-segment password strength indicator bar. */
  showStrength?: boolean;
  /** Show live validation checklist rules below the password field. */
  showRules?: boolean;
  /** Custom validation rules for `showRules` (defaults to Omada's 4 complexity rules). */
  rules?: PasswordRuleConfig[];
}

/**
 * Omada password input with optional 4-segment strength meter (`Weak` -> `Very Strong`)
 * and live password rule validation checklist (`showRules`).
 */
export const SPasswordInput: React.FC<SPasswordInputProps> = ({
  variant = 'filled',
  showStrength = false,
  showRules = false,
  rules = DEFAULT_PASSWORD_RULES,
  value,
  defaultValue,
  onChange,
  iconRender,
  className = '',
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState<string>(
    typeof defaultValue === 'string' ? defaultValue : '',
  );
  const currentValue =
    typeof value === 'string'
      ? value
      : value === undefined || value === null
        ? innerValue
        : String(value);
  const strength = evaluatePasswordStrength(currentValue);

  const handleChange: PasswordProps['onChange'] = (e) => {
    if (value === undefined) {
      setInnerValue(e.target.value);
    }
    onChange?.(e);
  };

  const defaultIconRender: PasswordProps['iconRender'] = (visible) => (
    <span className="inline-flex items-center text-[var(--omada-text-tertiary)] hover:text-[var(--omada-text-secondary)]">
      <SIcon name={visible ? 'input-visable' : 'input-invisable'} size={16} />
    </span>
  );

  return (
    <div className="w-full">
      <Input.Password
        variant={variant}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        iconRender={iconRender ?? defaultIconRender}
        className={`omada-input ${className}`.trim()}
        {...rest}
      />
      {showStrength && (
        <div className="mt-1.5">
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className="h-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    strength.score >= step ? strength.color : 'var(--omada-border-divider)',
                }}
              />
            ))}
          </div>
          {strength.label && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-[var(--omada-text-secondary)]">Password Strength</span>
              <span className="font-medium" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>
      )}
      {showRules && rules.length > 0 && (
        <ul
          role="list"
          aria-label="Password requirements"
          className="mt-2 space-y-1 rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] px-3 py-2 text-xs"
        >
          {rules.map((rule) => {
            const hasInput = currentValue.length > 0;
            const passed = hasInput && rule.validate(currentValue);
            const failed = hasInput && !passed;

            return (
              <li
                key={rule.key}
                data-rule-key={rule.key}
                data-rule-passed={String(passed)}
                className="flex items-center gap-2 leading-4"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    color: passed
                      ? 'var(--omada-color-success)'
                      : failed
                        ? 'var(--omada-color-error)'
                        : 'var(--omada-text-tertiary)',
                    backgroundColor: passed
                      ? 'var(--omada-color-success-bg)'
                      : failed
                        ? 'var(--omada-color-error-bg)'
                        : 'transparent',
                  }}
                >
                  {passed ? (
                    <Check size={10} strokeWidth={2.5} />
                  ) : failed ? (
                    <X size={10} strokeWidth={2.5} />
                  ) : (
                    <Circle size={8} />
                  )}
                </span>
                <span
                  style={{
                    color: passed
                      ? 'var(--omada-text-primary)'
                      : failed
                        ? 'var(--omada-color-error)'
                        : 'var(--omada-text-secondary)',
                  }}
                >
                  {rule.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export interface SNumberInputProps extends InputNumberProps {}

/**
 * Omada numeric input defaulting to filled grey background.
 */
export const SNumberInput: React.FC<SNumberInputProps> = ({
  variant = 'filled',
  className = '',
  ...rest
}) => {
  return (
    <InputNumber
      variant={variant}
      className={`omada-input ${className}`.trim()}
      {...rest}
    />
  );
};

export interface STextAreaProps extends TextAreaProps {}

/**
 * Omada multiline text input defaulting to filled grey background.
 */
export const STextArea: React.FC<STextAreaProps> = ({
  variant = 'filled',
  className = '',
  ...rest
}) => {
  return (
    <Input.TextArea
      variant={variant}
      className={`omada-input ${className}`.trim()}
      {...rest}
    />
  );
};
