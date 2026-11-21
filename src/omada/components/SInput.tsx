import React, { useState } from 'react';
import {
  Input,
  InputNumber,
  type InputNumberProps,
  type InputProps,
} from 'antd';
import type { PasswordProps, TextAreaProps } from 'antd/es/input';
import { Search } from 'lucide-react';

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

export interface SPasswordInputProps extends PasswordProps {
  showStrength?: boolean;
}

/**
 * Omada password input with optional 4-segment strength meter (`Weak` -> `Very Strong`).
 */
export const SPasswordInput: React.FC<SPasswordInputProps> = ({
  variant = 'filled',
  showStrength = false,
  value,
  defaultValue,
  onChange,
  className = '',
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState<string>(
    typeof defaultValue === 'string' ? defaultValue : '',
  );
  const currentValue = typeof value === 'string' ? value : innerValue;
  const strength = evaluatePasswordStrength(currentValue);

  const handleChange: PasswordProps['onChange'] = (e) => {
    if (value === undefined) {
      setInnerValue(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <div className="w-full">
      <Input.Password
        variant={variant}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
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
