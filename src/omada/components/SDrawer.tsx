import React from 'react';
import { Drawer, type DrawerProps } from 'antd';

export type SDrawerSize = 'sm' | 'md' | 'lg';

const DRAWER_WIDTHS: Record<SDrawerSize, number> = {
  sm: 480,
  md: 640,
  lg: 880,
};

export interface SDrawerProps extends Omit<DrawerProps, 'size' | 'width'> {
  size?: SDrawerSize;
  width?: number | string;
  subtitle?: React.ReactNode;
  statusSlot?: React.ReactNode;
  headerTabs?: React.ReactNode;
}

/**
 * Omada slide-over Drawer (`sm`: 480px, `md`: 640px, `lg`: 880px)
 * supporting a rich header slot with subtitle, status badge, and tabs.
 */
export const SDrawer: React.FC<SDrawerProps> = ({
  size = 'md',
  width,
  title,
  subtitle,
  statusSlot,
  headerTabs,
  extra,
  children,
  styles,
  ...rest
}) => {
  const headerNode = (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="truncate text-base font-semibold text-[var(--omada-text-primary)]">
              {title}
            </span>
            {statusSlot}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs text-[var(--omada-text-secondary)]">
              {subtitle}
            </div>
          )}
        </div>
        {extra && <div className="flex items-center gap-2">{extra}</div>}
      </div>
      {headerTabs && <div className="mt-3">{headerTabs}</div>}
    </div>
  );

  return (
    <Drawer
      size={width ?? DRAWER_WIDTHS[size]}
      title={headerNode}
      styles={{
        header: {
          padding: '16px 24px',
          borderBottom: '1px solid var(--omada-border-divider)',
        },
        body: {
          padding: '20px 24px',
        },
        footer: {
          padding: '12px 24px',
          borderTop: '1px solid var(--omada-border-divider)',
        },
        ...styles,
      }}
      {...rest}
    >
      {children}
    </Drawer>
  );
};
