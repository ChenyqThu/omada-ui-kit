import React, { useId, useState } from 'react';
import {
  Radio,
  type RadioChangeEvent,
  type RadioGroupProps,
  type RadioProps,
  type RadioRef,
} from 'antd';
import { useOmadaAgentControl } from '../agent';

export type SRadioGroupVariant = 'default' | 'button' | 'capsule';

export interface SRadioProps extends RadioProps {
  /** Optional explanatory copy rendered 4px beneath the radio label. */
  description?: React.ReactNode;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

const BaseSRadio = React.forwardRef<RadioRef, SRadioProps>(
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

    const commitSelect = (next: boolean, nativeEvent?: RadioChangeEvent) => {
      if (!isControlled) {
        setInnerChecked(next);
      }
      if (nativeEvent) {
        onChange?.(nativeEvent);
      } else {
        onChange?.({
          target: {
            checked: next,
            value: rest.value,
            disabled: Boolean(disabled),
          },
          stopPropagation: () => {},
          preventDefault: () => {},
          nativeEvent: new MouseEvent('click'),
        } as RadioChangeEvent);
      }
    };

    useOmadaAgentControl(
      agentId
        ? {
            id: agentId,
            kind: 'radio',
            label:
              typeof children === 'string'
                ? children
                : ((rest as Record<string, unknown>)['aria-label'] as
                    | string
                    | undefined),
            value: currentChecked,
            disabled: Boolean(disabled),
            actions: {
              select: () => {
                commitSelect(true);
                return true;
              },
              setValue: (next: unknown) => {
                const bool = Boolean(next);
                commitSelect(bool);
                return bool;
              },
            },
          }
        : null,
    );

    return (
      <Radio
        ref={ref}
        checked={isControlled ? checked : agentId ? innerChecked : undefined}
        defaultChecked={agentId ? undefined : defaultChecked}
        disabled={disabled}
        onChange={(e) => commitSelect(e.target.checked, e)}
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
  },
);
BaseSRadio.displayName = 'SRadio';

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
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
  'aria-label'?: string;
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
  agentId,
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

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'radio-group',
          label: rest['aria-label'],
          value: currentValue ?? null,
          disabled: Boolean(disabled),
          options: normalizedOptions.map((opt) => ({
            value: opt.value as string | number,
            label: typeof opt.label === 'string' ? opt.label : String(opt.value),
            disabled: Boolean(disabled || opt.disabled),
          })),
          actions: {
            setValue: (next: unknown) => {
              if (normalizedOptions.length > 0) {
                const match = normalizedOptions.find(
                  (o) => o.value === next || String(o.value) === String(next),
                );
                if (!match) {
                  throw new Error(`Unknown radio option "${String(next)}".`);
                }
                if (match.disabled) {
                  throw new Error(`Radio option "${String(next)}" is disabled.`);
                }
                if (!isControlled) {
                  setInnerValue(match.value);
                }
                onChange?.({
                  target: {
                    value: match.value,
                    checked: true,
                    disabled: false,
                  },
                  stopPropagation: () => {},
                  preventDefault: () => {},
                  nativeEvent: new MouseEvent('click'),
                } as RadioChangeEvent);
                return match.value;
              }
              if (!isControlled) {
                setInnerValue(next as T);
              }
              onChange?.({
                target: {
                  value: next,
                  checked: true,
                  disabled: false,
                },
                stopPropagation: () => {},
                preventDefault: () => {},
                nativeEvent: new MouseEvent('click'),
              } as RadioChangeEvent);
              return next;
            },
          },
        }
      : null,
  );

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
        aria-label={rest['aria-label']}
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
            <BaseSRadio
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
            </BaseSRadio>
          ))
        : children}
    </Radio.Group>
  );
}

/**
 * Omada Radio control with optional secondary `description` line.
 */
export const SRadio = Object.assign(BaseSRadio, {
  Group: SRadioGroup,
  Button: Radio.Button,
});
