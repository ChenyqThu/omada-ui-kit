import React, { useEffect, useRef, useState } from 'react';
import {
  Input,
  InputNumber,
  type InputNumberProps,
  type InputProps,
  type InputRef,
} from 'antd';
import type { PasswordProps, TextAreaProps } from 'antd/es/input';
import { Check, Circle, Search, X } from 'lucide-react';
import { useOmadaAgentControl } from '../agent';
import { SIcon } from '../assets/SIcon';

type TextAreaElementRef = React.ComponentRef<typeof Input.TextArea>;

export interface SInputProps extends InputProps {
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
  /** Masks value in Agent Bridge `snapshot()` / `query()` / `act()` when `true`. */
  secret?: boolean;
}

/**
 * Omada text input defaulting to filled grey background (`#F4F4F4` / `#272727`).
 */
export const SInput = React.forwardRef<InputRef, SInputProps>(
  (
    {
      variant = 'filled',
      value,
      defaultValue,
      onChange,
      disabled,
      agentId,
      secret = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState<string>(
      defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : '',
    );
    const isControlled = value !== undefined;
    const wasControlledRef = useRef<boolean>(isControlled);
    const currentValue = isControlled
      ? value === null
        ? ''
        : String(value)
      : innerValue;

    useEffect(() => {
      if (wasControlledRef.current && !isControlled) {
        setInnerValue(
          defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : '',
        );
      }
      wasControlledRef.current = isControlled;
    }, [isControlled, defaultValue]);

    const commitValue = (
      nextVal: string,
      nativeEvent?: React.ChangeEvent<HTMLInputElement>,
    ) => {
      if (!isControlled) {
        setInnerValue(nextVal);
      }
      if (nativeEvent) {
        onChange?.(nativeEvent);
      } else {
        onChange?.({
          target: { value: nextVal },
          currentTarget: { value: nextVal },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };

    useOmadaAgentControl(
      agentId
        ? {
            id: agentId,
            kind: 'input',
            label:
              (rest['aria-label'] as string | undefined) ?? rest.placeholder,
            value: currentValue,
            secret,
            disabled: Boolean(disabled),
            actions: {
              setValue: (next: unknown) => {
                const str = next === undefined || next === null ? '' : String(next);
                commitValue(str);
                return str;
              },
              clear: () => {
                commitValue('');
                return '';
              },
            },
          }
        : null,
    );

    return (
      <Input
        ref={ref}
        variant={variant}
        value={isControlled ? value : (agentId ? innerValue : undefined)}
        defaultValue={agentId ? undefined : defaultValue}
        disabled={disabled}
        onChange={(e) => commitValue(e.target.value, e)}
        className={`omada-input ${className}`.trim()}
        {...rest}
      />
    );
  },
);
SInput.displayName = 'SInput';

export interface SSearchInputProps extends InputProps {
  width?: number | string;
}

/**
 * Omada search input (260px default width, leading search icon, clearable).
 */
export const SSearchInput = React.forwardRef<InputRef, SSearchInputProps>(
  (
    {
      variant = 'filled',
      allowClear = true,
      width = 260,
      placeholder = 'Search',
      prefix,
      style,
      className = '',
      ...rest
    },
    ref,
  ) => {
    return (
      <Input
        ref={ref}
        variant={variant}
        allowClear={allowClear}
        placeholder={placeholder}
        prefix={prefix ?? <Search size={15} className="text-[var(--omada-text-tertiary)]" />}
        className={`omada-input ${className}`.trim()}
        style={{ width, ...style }}
        {...rest}
      />
    );
  },
);
SSearchInput.displayName = 'SSearchInput';

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
    return { score: 3, label: 'Strong', color: 'var(--omada-color-strength-strong)' };
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
  /** Optional deterministic Agent Bridge control ID (masked with `secret: true` by default). */
  agentId?: string;
  /** Masks value in Agent Bridge `snapshot()` / `query()` / `act()` (defaults to `true`). */
  secret?: boolean;
}

/**
 * Omada password input with optional 4-segment strength meter (`Weak` -> `Very Strong`)
 * and live password rule validation checklist (`showRules`).
 */
export const SPasswordInput = React.forwardRef<InputRef, SPasswordInputProps>(
  (
    {
      variant = 'filled',
      showStrength = false,
      showRules = false,
      rules = DEFAULT_PASSWORD_RULES,
      value,
      defaultValue,
      onChange,
      disabled,
      iconRender,
      agentId,
      secret = true,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState<string>(
      typeof defaultValue === 'string' ? defaultValue : '',
    );
    const isControlled = value !== undefined;
    const wasControlledRef = useRef<boolean>(isControlled);
    const currentValue =
      typeof value === 'string'
        ? value
        : value === undefined || value === null
          ? innerValue
          : String(value);
    const strength = evaluatePasswordStrength(currentValue);

    useEffect(() => {
      if (wasControlledRef.current && !isControlled) {
        setInnerValue(typeof defaultValue === 'string' ? defaultValue : '');
      }
      wasControlledRef.current = isControlled;
    }, [isControlled, defaultValue]);

    const commitPassword = (
      nextVal: string,
      nativeEvent?: React.ChangeEvent<HTMLInputElement>,
    ) => {
      if (!isControlled) {
        setInnerValue(nextVal);
      }
      if (nativeEvent) {
        onChange?.(nativeEvent);
      } else {
        onChange?.({
          target: { value: nextVal },
          currentTarget: { value: nextVal },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };

    useOmadaAgentControl(
      agentId
        ? {
            id: agentId,
            kind: 'password',
            label:
              (rest['aria-label'] as string | undefined) ?? rest.placeholder,
            value: currentValue,
            secret,
            disabled: Boolean(disabled),
            actions: {
              setValue: (next: unknown) => {
                const str = next === undefined || next === null ? '' : String(next);
                commitPassword(str);
                return str;
              },
              clear: () => {
                commitPassword('');
                return '';
              },
            },
          }
        : null,
    );

    const handleChange: PasswordProps['onChange'] = (e) => {
      commitPassword(e.target.value, e);
    };

    const defaultIconRender: PasswordProps['iconRender'] = (visible) => (
      <span className="inline-flex items-center text-[var(--omada-text-tertiary)] hover:text-[var(--omada-text-secondary)]">
        <SIcon name={visible ? 'input-visable' : 'input-invisable'} size={16} />
      </span>
    );

    return (
      <div className="w-full">
        <Input.Password
          ref={ref}
          variant={variant}
          value={isControlled ? value : (agentId ? innerValue : undefined)}
          defaultValue={agentId ? undefined : defaultValue}
          disabled={disabled}
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
  },
);
SPasswordInput.displayName = 'SPasswordInput';

export interface SNumberInputProps extends InputNumberProps {}

/**
 * Omada numeric input defaulting to filled grey background.
 */
export const SNumberInput = React.forwardRef<HTMLInputElement, SNumberInputProps>(
  ({ variant = 'filled', className = '', ...rest }, ref) => {
    return (
      <InputNumber
        ref={ref as React.Ref<React.ComponentRef<typeof InputNumber>>}
        variant={variant}
        className={`omada-input ${className}`.trim()}
        {...rest}
      />
    );
  },
);
SNumberInput.displayName = 'SNumberInput';

export interface STextAreaProps extends TextAreaProps {}

/**
 * Omada multiline text input defaulting to filled grey background.
 */
export const STextArea = React.forwardRef<TextAreaElementRef, STextAreaProps>(
  ({ variant = 'filled', className = '', ...rest }, ref) => {
    return (
      <Input.TextArea
        ref={ref}
        variant={variant}
        className={`omada-input ${className}`.trim()}
        {...rest}
      />
    );
  },
);
STextArea.displayName = 'STextArea';
