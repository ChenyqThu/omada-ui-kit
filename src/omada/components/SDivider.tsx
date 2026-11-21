import React from 'react';
import { Divider, type DividerProps } from 'antd';

export type SDividerOrientation = 'horizontal' | 'vertical';
export type SDividerVariant = 'solid' | 'dashed' | 'dotted';
export type SDividerTitlePlacement = 'left' | 'right' | 'center' | 'start' | 'end';
export type SDividerSize = 'small' | 'medium';

export interface SDividerProps
  extends Omit<
    DividerProps,
    'type' | 'orientation' | 'orientationMargin' | 'size' | 'dashed'
  > {
  /** Divider orientation (AntD 6 `orientation`; replaces deprecated `type`). */
  orientation?: SDividerOrientation;
  /** Stroke style (`solid`, `dashed`, or `dotted`). */
  variant?: SDividerVariant;
  /** Title position when children are provided. */
  titlePlacement?: SDividerTitlePlacement;
  /** Vertical spacing density (`small` or `medium`). */
  size?: SDividerSize;
  /** Adds Figma's 24px (`px-6`) horizontal inset margin for settings form panels. */
  inset?: boolean;
  /** Convenience dashed toggle mapped cleanly to `variant="dashed"`. */
  dashed?: boolean;
}

/**
 * Omada Divider (`3:64432`):
 * - `1px` `--omada-border-divider` hairline horizontal & vertical dividers
 * - Titled dividers (`Manrope 12px` `--omada-text-tertiary`) and `inset` form margins (`24px`).
 */
export const SDivider: React.FC<SDividerProps> = ({
  orientation = 'horizontal',
  variant,
  dashed = false,
  titlePlacement = 'start',
  size = 'medium',
  inset = false,
  plain = true,
  className = '',
  classNames,
  styles,
  children,
  ...rest
}) => {
  const resolvedVariant: SDividerVariant = variant ?? (dashed ? 'dashed' : 'solid');
  const insetClass = inset && orientation === 'horizontal' ? 'omada-divider-inset' : '';
  const verticalGapClass = orientation === 'vertical' ? 'mx-1' : '';

  const resolvedClassNames: DividerProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const res = classNames(info);
          return {
            ...res,
            root: `omada-divider ${insetClass} ${verticalGapClass} ${res?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-divider ${insetClass} ${verticalGapClass} ${classNames?.root ?? ''}`.trim(),
        };

  const resolvedStyles: DividerProps['styles'] =
    typeof styles === 'function'
      ? (info) => {
          const res = styles(info);
          return {
            ...res,
            rail: {
              borderColor: 'var(--omada-border-divider)',
              ...res?.rail,
            },
            content: {
              color: 'var(--omada-text-tertiary)',
              fontSize: 12,
              fontWeight: 400,
              ...res?.content,
            },
          };
        }
      : {
          ...styles,
          rail: {
            borderColor: 'var(--omada-border-divider)',
            ...styles?.rail,
          },
          content: {
            color: 'var(--omada-text-tertiary)',
            fontSize: 12,
            fontWeight: 400,
            ...styles?.content,
          },
        };

  return (
    <Divider
      orientation={orientation}
      variant={resolvedVariant}
      titlePlacement={titlePlacement}
      size={size}
      plain={plain}
      className={className}
      classNames={resolvedClassNames}
      styles={resolvedStyles}
      {...rest}
    >
      {children}
    </Divider>
  );
};
