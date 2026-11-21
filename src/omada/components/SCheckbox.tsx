import React, { useState } from 'react';
import {
  Checkbox,
  type CheckboxOptionType,
  type CheckboxProps,
  type CheckboxRef,
} from 'antd';
import type { CheckboxGroupProps } from 'antd/es/checkbox';

export type SCheckboxGroupVariant = 'default' | 'button';

export interface SCheckboxProps extends CheckboxProps {
  /** Optional explanatory copy rendered 4px beneath the checkbox label. */
  description?: React.ReactNode;
  /** Ref forwarded to the underlying AntD 6 Checkbox instance. */
  ref?: React.Ref<CheckboxRef>;
}

/**
 * Omada Checkbox with optional secondary `description` line aligned cleanly under the label.
 */
export const SCheckbox: React.FC<SCheckboxProps> & {
  Group: typeof SCheckboxGroup;
} = Object.assign(
  (({ description, children, className = '', ref, ...rest }: SCheckboxProps) => {
    return (
      <Checkbox
        ref={ref}
        className={`omada-checkbox-wrapper ${className}`.trim()}
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
      </Checkbox>
    );
  }) as React.FC<SCheckboxProps>,
  {
    Group: undefined as unknown as typeof SCheckboxGroup,
  },
);

export interface SCheckboxOption<T = string | number>
  extends CheckboxOptionType<T> {
  /** Optional secondary description line shown below the option label (default variant). */
  description?: React.ReactNode;
  /** Optional leading icon inside the option label or button pill. */
  icon?: React.ReactNode;
}

export interface SCheckboxGroupProps<T = string | number>
  extends Omit<CheckboxGroupProps<T>, 'options'> {
  /** Visual variant: standard checkboxes (`default`) or linear selectable button pills (`button`). */
  variant?: SCheckboxGroupVariant;
  /** Array of checkbox options or primitive values. */
  options?: Array<SCheckboxOption<T> | string | number>;
  /** Renders a Select All header checkbox with automatic indeterminate state. */
  showSelectAll?: boolean;
  /** Label for the Select All header checkbox (defaults to `'Select All'`). */
  selectAllLabel?: React.ReactNode;
  /** Arrangement axis of group items (`horizontal` wraps cleanly; `vertical` stacks). */
  direction?: 'horizontal' | 'vertical';
  /** Optional fixed width per item (e.g. `160` for Figma's 160px grid alignment). */
  itemWidth?: number | string;
}

/**
 * Omada Checkbox Group supporting `default` and linear `button` variants,
 * option descriptions, fixed-width grid alignment, and an integrated `showSelectAll` toggle.
 */
export function SCheckboxGroup<T extends string | number = string | number>({
  variant = 'default',
  options,
  showSelectAll = false,
  selectAllLabel = 'Select All',
  direction = 'horizontal',
  itemWidth,
  value,
  defaultValue,
  onChange,
  disabled = false,
  name,
  className = '',
  style,
  children,
  ...rest
}: SCheckboxGroupProps<T>) {
  const [innerValue, setInnerValue] = useState<T[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;

  const normalizedOptions: SCheckboxOption<T>[] = (options ?? []).map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? ({ label: String(opt), value: opt as T } satisfies SCheckboxOption<T>)
      : opt,
  );

  const commitChange = (nextValues: T[]) => {
    if (!isControlled) {
      setInnerValue(nextValues);
    }
    onChange?.(nextValues);
  };

  const enabledValues = normalizedOptions
    .filter((opt) => !disabled && !opt.disabled)
    .map((opt) => opt.value);

  const allChecked =
    enabledValues.length > 0 &&
    enabledValues.every((v) => currentValue.includes(v));
  const someChecked =
    !allChecked && enabledValues.some((v) => currentValue.includes(v));

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const merged = Array.from(new Set([...currentValue, ...enabledValues]));
      commitChange(merged);
    } else {
      const enabledSet = new Set(enabledValues);
      commitChange(currentValue.filter((v) => !enabledSet.has(v)));
    }
  };

  const handleToggleOption = (opt: SCheckboxOption<T>, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...currentValue, opt.value]))
      : currentValue.filter((v) => v !== opt.value);
    commitChange(next);
  };

  const selectAllNode = showSelectAll && normalizedOptions.length > 0 && (
    <div className="mb-2.5 border-b border-[var(--omada-border-divider)] pb-2">
      <SCheckbox
        checked={allChecked}
        indeterminate={someChecked}
        disabled={disabled || enabledValues.length === 0}
        onChange={(e) => handleSelectAllChange(e.target.checked)}
      >
        <span className="font-medium">{selectAllLabel}</span>
      </SCheckbox>
    </div>
  );

  if (variant === 'button') {
    return (
      <div className={className} style={style} {...rest}>
        {selectAllNode}
        <div
          role="group"
          className={`flex flex-wrap gap-2 ${
            direction === 'vertical' ? 'flex-col items-start' : 'items-center'
          }`}
        >
          {normalizedOptions.map((opt) => {
            const isChecked = currentValue.includes(opt.value);
            const isItemDisabled = Boolean(disabled || opt.disabled);
            return (
              <label
                key={String(opt.value)}
                title={opt.title}
                style={{
                  width: itemWidth,
                  ...opt.style,
                }}
                className={`relative inline-flex h-8 select-none items-center justify-center gap-1.5 rounded-[4px] border px-3 text-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--omada-brand-bg-subtle)] ${
                  isItemDisabled
                    ? 'cursor-not-allowed border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] text-[var(--omada-text-disabled)] opacity-60'
                    : isChecked
                      ? 'cursor-pointer border-[var(--omada-brand-text)] bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
                      : 'cursor-pointer border-[var(--omada-border-outline-btn)] bg-[var(--omada-bg-surface)] text-[var(--omada-text-primary)] hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)]'
                } ${opt.className ?? ''}`.trim()}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={String(opt.value)}
                  checked={isChecked}
                  disabled={isItemDisabled}
                  onChange={(e) => handleToggleOption(opt, e.target.checked)}
                  className="sr-only"
                />
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span>{opt.label}</span>
              </label>
            );
          })}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {selectAllNode}
      <Checkbox.Group<T>
        {...rest}
        name={name}
        disabled={disabled}
        value={currentValue}
        onChange={(vals) => commitChange(vals)}
        className={`w-full ${
          direction === 'vertical'
            ? '!flex !flex-col !gap-2.5'
            : '!flex !flex-wrap !gap-x-4 !gap-y-2.5'
        }`}
      >
        {normalizedOptions.length > 0
          ? normalizedOptions.map((opt) => (
              <SCheckbox
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                description={opt.description}
                title={opt.title}
                className={opt.className}
                style={{
                  ...(itemWidth !== undefined ? { width: itemWidth } : {}),
                  ...opt.style,
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  {opt.icon}
                  <span>{opt.label}</span>
                </span>
              </SCheckbox>
            ))
          : children}
      </Checkbox.Group>
    </div>
  );
}

SCheckbox.Group = SCheckboxGroup;
