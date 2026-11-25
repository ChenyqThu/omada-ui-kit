import React, { useEffect, useId, useRef, useState } from 'react';
import { Switch, type SwitchProps } from 'antd';
import { useOmadaAgentControl } from '../agent';

export interface SSwitchProps extends Omit<SwitchProps, 'size'> {
  /** Switch track geometry (`medium`: 36×22px default, `small`: 28×16px). */
  size?: 'small' | 'medium';
  /** Optional primary label rendered alongside the switch. */
  label?: React.ReactNode;
  /** Optional explanatory copy rendered beneath `label`. */
  description?: React.ReactNode;
  /** Companion text alignment relative to the switch (`horizontal` or `vertical`). */
  layout?: 'horizontal' | 'vertical';
  /** Placement of the companion text relative to the switch in horizontal mode. */
  labelPlacement?: 'end' | 'start';
  /** Spacing between the switch and companion label (`sm`: 4px, `md`: 8px, `lg`: 12px). */
  gap?: 'sm' | 'md' | 'lg';
  /** Accessible name when no visible `label` is rendered. */
  'aria-label'?: string;
  /** Accessible description ID(s) merged with the generated `description` element ID. */
  'aria-describedby'?: string;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

const GAP_CLASS: Record<NonNullable<SSwitchProps['gap']>, string> = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-3',
};

/**
 * Omada Switch matching the exact `36×22px` (`medium`) and `28×16px` (`small`) pill geometry,
 * with optional companion `label` and `description` in horizontal or vertical layouts.
 */
export const SSwitch = React.forwardRef<HTMLButtonElement, SSwitchProps>(
  (
    {
      size = 'medium',
      label,
      description,
      layout = 'horizontal',
      labelPlacement = 'end',
      gap = 'md',
      id,
      checked,
      defaultChecked = false,
      onChange,
      disabled,
      agentId,
      'aria-describedby': ariaDescribedBy,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const switchId = id ?? autoId;
    const descriptionId = `${switchId}-desc`;
    const [innerChecked, setInnerChecked] = useState<boolean>(Boolean(defaultChecked));
    const isControlled = checked !== undefined;
    const wasControlledRef = useRef<boolean>(isControlled);
    const currentChecked = Boolean(isControlled ? checked : innerChecked);
    const resolvedAntdSize: SwitchProps['size'] = size === 'small' ? 'small' : 'medium';

    useEffect(() => {
      if (wasControlledRef.current && !isControlled) {
        setInnerChecked(Boolean(defaultChecked));
      }
      wasControlledRef.current = isControlled;
    }, [isControlled, defaultChecked]);

    const commitChecked = (
      next: boolean,
      event?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (!isControlled) {
        setInnerChecked(next);
      }
      onChange?.(
        next,
        (event ?? ({} as React.MouseEvent<HTMLButtonElement>)) as Parameters<
          NonNullable<SwitchProps['onChange']>
        >[1],
      );
    };

    useOmadaAgentControl(
      agentId
        ? {
            id: agentId,
            kind: 'switch',
            label:
              typeof label === 'string'
                ? label
                : (rest['aria-label'] as string | undefined),
            value: currentChecked,
            disabled: Boolean(disabled),
            actions: {
              setValue: (val: unknown) => {
                const next = Boolean(val);
                commitChecked(next);
                return next;
              },
              toggle: () => {
                const next = !currentChecked;
                commitChecked(next);
                return next;
              },
            },
          }
        : null,
    );

    const mergedDescribedBy =
      [ariaDescribedBy, description ? descriptionId : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    const switchEl = (
      <Switch
        ref={ref}
        id={switchId}
        size={resolvedAntdSize}
        checked={currentChecked}
        disabled={disabled}
        aria-describedby={mergedDescribedBy}
        onChange={(next, e) => commitChecked(next, e)}
        className={`omada-switch ${!label && !description ? className : ''}`.trim()}
        {...rest}
      />
    );

    if (!label && !description) {
      return switchEl;
    }

    const textBlock = (
      <div className="flex min-w-0 flex-col gap-1">
        {label && (
          <label
            htmlFor={switchId}
            className={`text-sm font-medium leading-[22px] ${
              disabled
                ? 'cursor-not-allowed text-[var(--omada-text-disabled)]'
                : 'cursor-pointer text-[var(--omada-text-primary)]'
            }`}
          >
            {label}
          </label>
        )}
        {description && (
          <span
            id={descriptionId}
            className={`text-xs leading-4 ${
              disabled
                ? 'text-[var(--omada-text-disabled)]'
                : 'text-[var(--omada-text-secondary)]'
            }`}
          >
            {description}
          </span>
        )}
      </div>
    );

    if (layout === 'vertical') {
      return (
        <div className={`inline-flex flex-col items-start ${GAP_CLASS[gap]} ${className}`.trim()}>
          {textBlock}
          {switchEl}
        </div>
      );
    }

    return (
      <div
        className={`inline-flex ${
          description ? 'items-start' : 'items-center'
        } ${GAP_CLASS[gap]} ${className}`.trim()}
      >
        {labelPlacement === 'start' ? (
          <>
            {textBlock}
            {switchEl}
          </>
        ) : (
          <>
            {switchEl}
            {textBlock}
          </>
        )}
      </div>
    );
  },
);
SSwitch.displayName = 'SSwitch';
