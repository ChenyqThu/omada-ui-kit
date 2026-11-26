import React, { useRef, useState } from 'react';
import {
  Checkbox,
  type CheckboxChangeEvent,
  type CheckboxOptionType,
  type CheckboxProps,
  type CheckboxRef,
} from 'antd';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import { useOmadaAgentControl } from '../agent';

export type SCheckboxGroupVariant = 'default' | 'button';

export interface SCheckboxProps extends CheckboxProps {
  /** Optional explanatory copy rendered 4px beneath the checkbox label. */
  description?: React.ReactNode;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

const BaseSCheckbox = React.forwardRef<CheckboxRef, SCheckboxProps>(
  (
    {
      description,
      checked,
      defaultChecked,
      disabled,
      onChange,
      agentId,
      children,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [innerChecked, setInnerChecked] = useState<boolean>(
      Boolean(defaultChecked),
    );
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? Boolean(checked) : innerChecked;
    const liveCheckedRef = useRef<boolean>(currentChecked);
    liveCheckedRef.current = currentChecked;

    const commitChecked = (next: boolean, nativeEvent?: CheckboxChangeEvent) => {
      liveCheckedRef.current = next;
      if (!isControlled) {
        setInnerChecked(next);
      }
      if (nativeEvent) {
        onChange?.(nativeEvent);
      } else {
        onChange?.({
          target: { checked: next },
          stopPropagation: () => {},
          preventDefault: () => {},
          nativeEvent: new MouseEvent('click'),
        } as unknown as CheckboxChangeEvent);
      }
    };

    useOmadaAgentControl(
      agentId
        ? {
            id: agentId,
            kind: 'checkbox',
            label:
              typeof children === 'string'
                ? children
                : ((rest as Record<string, unknown>)['aria-label'] as
                    | string
                    | undefined),
            value: currentChecked,
            getValue: () => liveCheckedRef.current,
            disabled: Boolean(disabled),
            actions: {
              setValue: (next: unknown) => {
                const bool = Boolean(next);
                commitChecked(bool);
                return bool;
              },
              toggle: () => {
                const next = !liveCheckedRef.current;
                commitChecked(next);
                return next;
              },
            },
          }
        : null,
    );

    return (
      <Checkbox
        ref={ref}
        checked={isControlled ? checked : agentId ? innerChecked : undefined}
        defaultChecked={agentId ? undefined : defaultChecked}
        disabled={disabled}
        onChange={(e) => commitChecked(e.target.checked, e)}
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
  },
);
BaseSCheckbox.displayName = 'SCheckbox';

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
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
  'aria-label'?: string;
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
  agentId,
  className = '',
  style,
  children,
  ...rest
}: SCheckboxGroupProps<T>) {
  const [innerValue, setInnerValue] = useState<T[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;
  const liveGroupRef = useRef<T[]>(currentValue);
  liveGroupRef.current = currentValue;

  const normalizedOptions: SCheckboxOption<T>[] = (options ?? []).map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? ({ label: String(opt), value: opt as T } satisfies SCheckboxOption<T>)
      : opt,
  );

  const commitChange = (nextValues: T[]) => {
    liveGroupRef.current = nextValues;
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

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'checkbox-group',
          label: rest['aria-label'],
          value: currentValue,
          getValue: () => liveGroupRef.current,
          disabled: Boolean(disabled),
          options: normalizedOptions.map((opt) => ({
            value: opt.value as string | number,
            label: typeof opt.label === 'string' ? opt.label : String(opt.value),
            disabled: Boolean(disabled || opt.disabled),
          })),
          actions: {
            setValue: (next: unknown) => {
              if (!Array.isArray(next)) {
                throw new Error(
                  'Expected an array of values for checkbox-group setValue.',
                );
              }
              if (normalizedOptions.length > 0) {
                const resolved: T[] = [];
                for (const item of next) {
                  const match = normalizedOptions.find(
                    (o) => o.value === item || String(o.value) === String(item),
                  );
                  if (!match) {
                    throw new Error(`Unknown checkbox option "${String(item)}".`);
                  }
                  if (match.disabled && !liveGroupRef.current.includes(match.value)) {
                    throw new Error(`Option "${String(item)}" is disabled.`);
                  }
                  if (!resolved.includes(match.value)) {
                    resolved.push(match.value);
                  }
                }
                commitChange(resolved);
                return resolved;
              }
              const typed = Array.from(new Set(next as T[]));
              commitChange(typed);
              return typed;
            },
            toggleOption: (optVal: unknown) => {
              const match = normalizedOptions.find(
                (o) => o.value === optVal || String(o.value) === String(optVal),
              );
              if (!match) {
                throw new Error(`Unknown checkbox option "${String(optVal)}".`);
              }
              if (match.disabled) {
                throw new Error(`Option "${String(optVal)}" is disabled.`);
              }
              const current = liveGroupRef.current;
              const exists = current.includes(match.value);
              const next = exists
                ? current.filter((v) => v !== match.value)
                : [...current, match.value];
              commitChange(next);
              return next;
            },
            selectAll: () => {
              const merged = Array.from(
                new Set([...liveGroupRef.current, ...enabledValues]),
              );
              commitChange(merged);
              return merged;
            },
            clear: () => {
              const enabledSet = new Set(enabledValues);
              const remaining = liveGroupRef.current.filter(
                (v) => !enabledSet.has(v),
              );
              commitChange(remaining);
              return remaining;
            },
          },
        }
      : null,
  );

  const selectAllNode = showSelectAll && normalizedOptions.length > 0 && (
    <div className="mb-2.5 border-b border-[var(--omada-border-divider)] pb-2">
      <BaseSCheckbox
        checked={allChecked}
        indeterminate={someChecked}
        disabled={disabled || enabledValues.length === 0}
        onChange={(e) => handleSelectAllChange(e.target.checked)}
      >
        <span className="font-medium">{selectAllLabel}</span>
      </BaseSCheckbox>
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
                {opt.icon && (
                  <span className="inline-flex shrink-0 items-center justify-center leading-none">
                    {opt.icon}
                  </span>
                )}
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
              <BaseSCheckbox
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
              </BaseSCheckbox>
            ))
          : children}
      </Checkbox.Group>
    </div>
  );
}

/**
 * Omada Checkbox with optional secondary `description` line aligned cleanly under the label.
 */
export const SCheckbox = Object.assign(BaseSCheckbox, {
  Group: SCheckboxGroup,
});
