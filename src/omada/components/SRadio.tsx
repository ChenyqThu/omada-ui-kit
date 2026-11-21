import React, { useId, useState } from 'react';
import {
  Radio,
  type RadioChangeEvent,
  type RadioGroupProps,
  type RadioProps,
  type RadioRef,
} from 'antd';

export type SRadioGroupVariant = 'default' | 'button' | 'capsule';

export interface SRadioProps extends RadioProps {
  /** Optional explanatory copy rendered 4px beneath the radio label. */
  description?: React.ReactNode;
  /** Ref forwarded to the underlying AntD 6 Radio instance. */
  ref?: React.Ref<RadioRef>;
}

/**
 * Omada Radio control with optional secondary `description` line.
 */
export const SRadio: React.FC<SRadioProps> & {
  Group: typeof SRadioGroup;
  Button: typeof Radio.Button;
} = ({ description, children, className = '', ref, ...rest }) => {
  return (
    <Radio
      ref={ref}
      className={`omada-radio-wrapper ${className}`.trim()}
      {...rest}
    >
      {description ? (
        <span className="inline-flex flex-col gap-1">
          <span className="text-sm font-normal leading-5 text-[var(--omada-text-primary)]">
            {children}
          </span>
          <span className="text-xs leading-4 text-[var(--omada-text-secondary)]">
            {description}
          </span>
        </span>
      ) : (
        children
      )}
    </Radio>
  );
};

export interface SRadioOption<T = string | number> {
  label: React.ReactNode;
  value: T;
  disabled?: boolean;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface SRadioGroupProps<T = string | number>
  extends Omit<RadioGroupProps, 'options' | 'optionType'> {
  /** Visual presentation: standard radios (`default`), linear buttons (`button`), or segmented pill (`capsule`). */
  variant?: SRadioGroupVariant;
  /** Array of radio options or primitive values. */
  options?: Array<SRadioOption<T> | string | number>;
  /** Layout axis for `default` radio items. */
  direction?: 'horizontal' | 'vertical';
  /** Rounded-full pill shape when `variant="capsule"`. */
  pill?: boolean;
}

/**
 * Omada Radio Group supporting `default` circle radios (with optional descriptions),
 * linear `button` groups, and segmented `capsule` switchers matching `STabs`.
 */
export function SRadioGroup<T extends string | number = string | number>({
  variant = 'default',
  options,
  direction,
  vertical,
  pill = false,
  value,
  defaultValue,
  onChange,
  disabled = false,
  name,
  buttonStyle = 'outline',
  className = '',
  style,
  children,
  ...rest
}: SRadioGroupProps<T>) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const [innerValue, setInnerValue] = useState<T | undefined>(defaultValue as T | undefined);
  const isControlled = value !== undefined;
  const currentValue = (isControlled ? value : innerValue) as T | undefined;
  const isVertical = Boolean(vertical || direction === 'vertical');

  const normalizedOptions: SRadioOption<T>[] = (options ?? []).map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? ({ label: String(opt), value: opt as T } satisfies SRadioOption<T>)
      : opt,
  );

  const handleAntdChange = (e: RadioChangeEvent) => {
    if (!isControlled) {
      setInnerValue(e.target.value as T);
    }
    onChange?.(e);
  };

  if (variant === 'capsule') {
    const handleCapsuleChange = (
      opt: SRadioOption<T>,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      if (!isControlled) {
        setInnerValue(opt.value);
      }
      const syntheticEvent: RadioChangeEvent = {
        target: {
          value: opt.value,
          checked: true,
          disabled: Boolean(disabled || opt.disabled),
        },
        stopPropagation: () => e.stopPropagation(),
        preventDefault: () => e.preventDefault(),
        nativeEvent: e.nativeEvent as unknown as MouseEvent,
      };
      onChange?.(syntheticEvent);
    };

    return (
      <div
        role="radiogroup"
        aria-disabled={disabled}
        style={style}
        className={`inline-flex flex-wrap items-center gap-1 bg-[var(--omada-bg-field)] p-0.5 ${
          pill ? 'rounded-full' : 'rounded-[4px]'
        } ${isVertical ? 'flex-col items-stretch' : ''} ${className}`.trim()}
      >
        {normalizedOptions.map((opt) => {
          const isActive = opt.value === currentValue;
          const isItemDisabled = Boolean(disabled || opt.disabled);
          return (
            <label
              key={String(opt.value)}
              style={opt.style}
              className={`inline-flex h-7 select-none items-center justify-center gap-1.5 px-3 text-xs transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--omada-brand-bg-subtle)] ${
                pill ? 'rounded-full' : 'rounded-[3px]'
              } ${
                isItemDisabled
                  ? 'cursor-not-allowed opacity-40'
                  : 'cursor-pointer'
              } ${
                isActive
                  ? 'bg-[var(--omada-brand)] font-semibold text-[var(--omada-text-inverse)]'
                  : 'bg-transparent font-medium text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
              } ${opt.className ?? ''}`.trim()}
            >
              <input
                type="radio"
                name={groupName}
                value={String(opt.value)}
                checked={isActive}
                disabled={isItemDisabled}
                onChange={(e) => handleCapsuleChange(opt, e)}
                className="sr-only"
              />
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
            </label>
          );
        })}
        {children}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Radio.Group
        {...rest}
        name={groupName}
        disabled={disabled}
        value={currentValue}
        onChange={handleAntdChange}
        optionType="button"
        buttonStyle={buttonStyle}
        vertical={isVertical}
        style={style}
        className={`omada-radio-button ${className}`.trim()}
      >
        {normalizedOptions.length > 0
          ? normalizedOptions.map((opt) => (
              <Radio.Button
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                className={opt.className}
                style={opt.style}
              >
                <span className="inline-flex items-center gap-1.5">
                  {opt.icon}
                  <span>{opt.label}</span>
                </span>
              </Radio.Button>
            ))
          : children}
      </Radio.Group>
    );
  }

  return (
    <Radio.Group
      {...rest}
      name={groupName}
      disabled={disabled}
      value={currentValue}
      onChange={handleAntdChange}
      optionType="default"
      vertical={isVertical}
      style={style}
      className={`omada-radio-group ${
        isVertical ? '!flex !flex-col !gap-2.5' : '!inline-flex !flex-wrap !gap-x-4 !gap-y-2'
      } ${className}`.trim()}
    >
      {normalizedOptions.length > 0
        ? normalizedOptions.map((opt) => (
            <SRadio
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
              description={opt.description}
              className={opt.className}
              style={opt.style}
            >
              <span className="inline-flex items-center gap-1.5">
                {opt.icon}
                <span>{opt.label}</span>
              </span>
            </SRadio>
          ))
        : children}
    </Radio.Group>
  );
}

SRadio.Group = SRadioGroup;
SRadio.Button = Radio.Button;
