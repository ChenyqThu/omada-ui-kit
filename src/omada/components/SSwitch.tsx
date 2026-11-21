import React, { useId } from 'react';
import { Switch, type SwitchProps } from 'antd';

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
  /** Ref forwarded to the underlying AntD 6 Switch button element. */
  ref?: React.Ref<HTMLButtonElement>;
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
export const SSwitch: React.FC<SSwitchProps> = ({
  size = 'medium',
  label,
  description,
  layout = 'horizontal',
  labelPlacement = 'end',
  gap = 'md',
  id,
  disabled,
  className = '',
  ref,
  ...rest
}) => {
  const autoId = useId();
  const switchId = id ?? autoId;
  const resolvedAntdSize: SwitchProps['size'] = size === 'small' ? 'small' : 'medium';

  const switchEl = (
    <Switch
      ref={ref}
      id={switchId}
      size={resolvedAntdSize}
      disabled={disabled}
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
};
