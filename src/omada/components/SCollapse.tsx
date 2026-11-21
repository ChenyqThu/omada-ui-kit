import React from 'react';
import { Collapse, type CollapseProps } from 'antd';
import { ChevronRight } from 'lucide-react';

export type SCollapseVariant = 'default' | 'card' | 'ghost';

export interface SCollapseItem {
  key: string;
  label: React.ReactNode;
  /** Optional subtitle displayed below the panel header title. */
  subtitle?: React.ReactNode;
  /** Optional status tag/badge/summary rendered on the right side of the header. */
  status?: React.ReactNode;
  /** Additional right-side header action/content. */
  extra?: React.ReactNode;
  disabled?: boolean;
  collapsible?: 'header' | 'icon' | 'disabled';
  showArrow?: boolean;
  children: React.ReactNode;
}

export interface SCollapseProps
  extends Omit<CollapseProps, 'items' | 'bordered' | 'ghost' | 'size'> {
  items: SCollapseItem[];
  variant?: SCollapseVariant;
  /** AntD 6 size (`'small' | 'medium' | 'large'`). */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Omada Collapse / Accordion panel supporting `default`, `card`, and `ghost` variants,
 * header status/extra slots, smooth chevron rotation, and Light/Dark parity.
 */
export const SCollapse: React.FC<SCollapseProps> = ({
  items,
  variant = 'default',
  size = 'medium',
  expandIconPlacement = 'start',
  destroyOnHidden = false,
  expandIcon,
  className = '',
  classNames,
  styles,
  ...rest
}) => {
  const variantClass =
    variant === 'card'
      ? 'omada-collapse omada-collapse-card'
      : variant === 'ghost'
        ? 'omada-collapse omada-collapse-ghost'
        : 'omada-collapse';

  const mappedItems: NonNullable<CollapseProps['items']> = items.map((item) => {
    const rightSlot =
      item.status || item.extra ? (
        <div
          className="flex items-center gap-2"
          onClick={(e) => {
            if (item.extra) {
              e.stopPropagation();
            }
          }}
        >
          {item.status}
          {item.extra}
        </div>
      ) : undefined;

    return {
      key: item.key,
      label: (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[var(--omada-text-primary)]">
            {item.label}
          </div>
          {item.subtitle && (
            <div className="mt-0.5 text-xs font-normal text-[var(--omada-text-secondary)]">
              {item.subtitle}
            </div>
          )}
        </div>
      ),
      extra: rightSlot,
      collapsible: item.disabled ? 'disabled' : item.collapsible,
      showArrow: item.showArrow,
      children: item.children,
    };
  });

  const resolvedExpandIcon: CollapseProps['expandIcon'] =
    expandIcon ??
    (({ isActive }) => (
      <ChevronRight
        size={15}
        className={`omada-collapse-arrow text-[var(--omada-text-secondary)] transition-transform duration-200 ${
          isActive ? 'rotate-90 text-[var(--omada-brand-text)]' : ''
        }`}
      />
    ));

  return (
    <Collapse
      items={mappedItems}
      size={size}
      bordered={variant !== 'ghost'}
      ghost={variant === 'ghost'}
      expandIconPlacement={expandIconPlacement}
      destroyOnHidden={destroyOnHidden}
      expandIcon={resolvedExpandIcon}
      className={`${variantClass} ${className}`.trim()}
      classNames={classNames}
      styles={styles}
      {...rest}
    />
  );
};
