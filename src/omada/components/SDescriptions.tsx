import React from 'react';
import { Descriptions, type DescriptionsProps } from 'antd';
import type { DescriptionsItemType } from 'antd/es/descriptions';

export type SDescriptionsVariant = 'bordered' | 'filled' | 'borderless';

export interface SDescriptionItem extends DescriptionsItemType {
  /** Render the value in monospace font (ideal for IPs, MACs, serial numbers). */
  mono?: boolean;
}

export interface SDescriptionsProps
  extends Omit<DescriptionsProps, 'bordered' | 'size' | 'items'> {
  items: SDescriptionItem[];
  variant?: SDescriptionsVariant;
  /** AntD 6 size (`'small' | 'medium' | 'large'`; never deprecated `'default'`). */
  size?: 'small' | 'medium' | 'large';
  /** Fixed label column width in horizontal mode (defaults to `200` per Omada Figma spec). */
  labelWidth?: number | string;
}

/**
 * Omada Descriptions component supporting `bordered`, `filled`, and `borderless` variants,
 * `horizontal` (`200px` fixed label column) and `vertical` layouts, and Light/Dark tokens.
 */
export const SDescriptions: React.FC<SDescriptionsProps> = ({
  items,
  variant = 'bordered',
  layout = 'horizontal',
  size = 'medium',
  column = 2,
  colon = false,
  labelWidth = 200,
  className = '',
  classNames,
  styles,
  ...rest
}) => {
  const isBordered = variant === 'bordered';
  const isFilled = variant === 'filled';

  const mappedItems: DescriptionsItemType[] = items.map(({ mono, children, ...itemRest }) => ({
    ...itemRest,
    children: mono ? (
      <span className="whitespace-nowrap font-mono text-[13px]">{children}</span>
    ) : (
      children
    ),
  }));

  const labelStyle: React.CSSProperties = {
    color: 'var(--omada-text-secondary)',
    fontSize: size === 'small' ? 12 : 13,
    ...(!isBordered && layout === 'horizontal'
      ? {
          width: labelWidth,
          minWidth: labelWidth,
          flexShrink: 0,
          marginInlineEnd: 12,
        }
      : isBordered && layout === 'horizontal' && column === 1
        ? { width: labelWidth }
        : {}),
    ...(typeof styles === 'object' && styles ? styles.label : undefined),
  };

  const contentStyle: React.CSSProperties = {
    color: 'var(--omada-text-primary)',
    fontSize: size === 'small' ? 12 : 13,
    ...(typeof styles === 'object' && styles ? styles.content : undefined),
  };

  const rootWrapperClass = isFilled
    ? `rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-5 py-4 ${className}`.trim()
    : className;

  const antdDescriptions = (
    <Descriptions
      bordered={isBordered}
      layout={layout}
      size={size}
      column={column}
      colon={colon}
      items={mappedItems}
      className={`omada-descriptions ${!isFilled ? className : ''}`.trim()}
      classNames={classNames}
      styles={
        typeof styles === 'function'
          ? styles
          : {
              ...styles,
              header: {
                marginBottom: 12,
                ...styles?.header,
              },
              title: {
                color: 'var(--omada-text-primary)',
                fontSize: 15,
                fontWeight: 600,
                ...styles?.title,
              },
              label: labelStyle,
              content: contentStyle,
            }
      }
      {...rest}
    />
  );

  if (isFilled) {
    return <div className={rootWrapperClass}>{antdDescriptions}</div>;
  }

  return antdDescriptions;
};
