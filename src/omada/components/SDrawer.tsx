import React from 'react';
import { Drawer, type DrawerProps } from 'antd';
import { useOmadaAgentControl } from '../agent';
import { SButton } from './SButton';

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
  /** Displays a skeleton placeholder inside the drawer body while data loads */
  loading?: boolean;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

/**
 * Omada slide-over Drawer (`sm`: 480px, `md`: 640px, `lg`: 880px)
 * supporting a rich header slot with subtitle, status badge, tabs, and loading skeleton.
 */
export const SDrawer: React.FC<SDrawerProps> = ({
  size = 'md',
  width,
  title,
  subtitle,
  statusSlot,
  headerTabs,
  extra,
  loading = false,
  agentId,
  children,
  styles,
  ...rest
}) => {
  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'drawer',
          label:
            typeof title === 'string'
              ? title
              : typeof subtitle === 'string'
                ? subtitle
                : undefined,
          value: Boolean(rest.open),
          meta: {
            open: Boolean(rest.open),
            size: width ?? size,
            loading,
          },
          actions: {
            close: () => {
              rest.onClose?.({} as React.MouseEvent<Element, MouseEvent>);
              return false;
            },
          },
        }
      : null,
  );
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

  const baseStyles: NonNullable<Exclude<DrawerProps['styles'], (...args: never[]) => unknown>> = {
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
  };

  const mergedStyles: DrawerProps['styles'] =
    typeof styles === 'function'
      ? (info) => {
          const resolved = styles(info);
          return {
            ...baseStyles,
            ...resolved,
            header: { ...baseStyles.header, ...resolved?.header },
            body: { ...baseStyles.body, ...resolved?.body },
            footer: { ...baseStyles.footer, ...resolved?.footer },
          };
        }
      : {
          ...baseStyles,
          ...styles,
          header: { ...baseStyles.header, ...styles?.header },
          body: { ...baseStyles.body, ...styles?.body },
          footer: { ...baseStyles.footer, ...styles?.footer },
        };

  return (
    <Drawer
      size={width ?? DRAWER_WIDTHS[size]}
      title={headerNode}
      loading={loading}
      styles={mergedStyles}
      {...rest}
    >
      {children}
    </Drawer>
  );
};

export interface SDrawerFooterProps {
  onCancel?: () => void;
  onOk?: () => void;
  cancelText?: React.ReactNode | null;
  okText?: React.ReactNode | null;
  loading?: boolean;
  okDisabled?: boolean;
  danger?: boolean;
  align?: 'left' | 'right' | 'between';
  /** Make footer sticky inside scrollable drawer body (adds top border & surface fill) */
  sticky?: boolean;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standardized Omada drawer footer bar for `SDrawer`'s `footer` prop or sticky bottom body placement.
 */
export const SDrawerFooter: React.FC<SDrawerFooterProps> = ({
  onCancel,
  onOk,
  cancelText = 'Cancel',
  okText = 'Apply',
  loading = false,
  okDisabled = false,
  danger = false,
  align = 'right',
  sticky = false,
  extra,
  children,
  className = '',
}) => {
  const stickyClasses = sticky
    ? 'sticky bottom-0 z-10 -mx-6 -mb-5 mt-5 border-t border-[var(--omada-border-divider)] bg-[var(--omada-bg-overlay)] px-6 py-3'
    : '';

  const buttonGroup = children ?? (
    <>
      {cancelText !== null && cancelText !== undefined && (
        <SButton variant="secondary" disabled={loading} onClick={onCancel}>
          {cancelText}
        </SButton>
      )}
      {okText !== null && okText !== undefined && (
        <SButton
          variant={danger ? 'danger' : 'primary'}
          loading={loading}
          disabled={okDisabled}
          onClick={onOk}
        >
          {okText}
        </SButton>
      )}
    </>
  );

  const alignClass =
    align === 'left'
      ? 'justify-start'
      : align === 'between'
        ? 'justify-between'
        : 'justify-end';

  return (
    <div
      className={`flex w-full flex-wrap items-center justify-between gap-3 ${stickyClasses} ${className}`.trim()}
    >
      {extra && <div className="flex items-center gap-2 text-xs text-[var(--omada-text-secondary)]">{extra}</div>}
      <div className={`flex flex-1 items-center gap-2.5 ${alignClass}`}>
        {buttonGroup}
      </div>
    </div>
  );
};
