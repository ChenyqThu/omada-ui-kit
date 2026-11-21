import React, { useMemo } from 'react';
import { Steps, type StepsProps } from 'antd';
import { Loader2 } from 'lucide-react';

export type SStepsOrientation = 'horizontal' | 'vertical';
export type SStepsType = 'default' | 'navigation' | 'inline' | 'dot';
export type SStepsSize = 'small' | 'medium';

export interface SStepItem {
  key?: React.Key;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  /** Primary step helper text (mapped directly to AntD 6 `content`). */
  content?: React.ReactNode;
  /** Convenience alias mapped cleanly to AntD 6 `content` without deprecation warnings. */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
  /** Renders a spinner inside the step icon when the step is actively running. */
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  style?: React.CSSProperties;
}

export interface SStepsProps
  extends Omit<
    StepsProps,
    | 'direction'
    | 'labelPlacement'
    | 'progressDot'
    | 'size'
    | 'items'
    | 'type'
  > {
  /** Step definitions rendered in sequence. */
  items: SStepItem[];
  /** Layout orientation (AntD 6 `orientation`; defaults to `'horizontal'`). */
  orientation?: SStepsOrientation;
  /** Visual style (`default`, `navigation`, `inline`, or `dot`). */
  type?: SStepsType;
  /** Title/content placement relative to icon (`horizontal` or `vertical`). */
  titlePlacement?: 'horizontal' | 'vertical';
  /** Step size (`small` or `medium`; never passes deprecated `size="default"`). */
  size?: SStepsSize;
  /** Displays a spinning loader on the active (`current`) step item. */
  loading?: boolean;
}

/**
 * Omada Steps (`3:64441`) supporting horizontal, vertical, navigation, dot, and loading states
 * using AntD 6 `orientation`, `titlePlacement`, and `content` APIs.
 */
export const SSteps: React.FC<SStepsProps> = ({
  items,
  orientation = 'horizontal',
  type = 'default',
  titlePlacement = 'horizontal',
  size = 'medium',
  variant = 'filled',
  current = 0,
  loading = false,
  className = '',
  classNames,
  ...rest
}) => {
  const mappedItems = useMemo<NonNullable<StepsProps['items']>>(
    () =>
      items.map((item, idx) => {
        const { description, content, loading: itemLoading, icon, ...other } = item;
        const isSpinning = Boolean(itemLoading || (loading && idx === current));
        return {
          ...other,
          content: content ?? description,
          icon:
            icon ??
            (isSpinning ? (
              <Loader2 size={14} className="animate-spin" aria-label="In progress" />
            ) : undefined),
        };
      }),
    [items, loading, current],
  );

  const resolvedClassNames: StepsProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const res = classNames(info);
          return {
            ...res,
            root: `omada-steps ${res?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-steps ${classNames?.root ?? ''}`.trim(),
        };

  return (
    <Steps
      current={current}
      orientation={orientation}
      type={type}
      titlePlacement={titlePlacement}
      variant={variant}
      size={size === 'small' ? 'small' : undefined}
      items={mappedItems}
      className={className}
      classNames={resolvedClassNames}
      {...rest}
    />
  );
};
