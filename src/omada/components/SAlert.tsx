import React, { useState } from 'react';
import { App as AntdApp } from 'antd';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type SAlertType = 'success' | 'error' | 'warning' | 'info';

export interface SAlertProps {
  type?: SAlertType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

const ALERT_META: Record<
  SAlertType,
  {
    bg: string;
    color: string;
    Icon: LucideIcon;
  }
> = {
  success: {
    bg: 'var(--omada-color-success-bg)',
    color: 'var(--omada-color-success)',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'var(--omada-color-error-bg)',
    color: 'var(--omada-color-error)',
    Icon: XCircle,
  },
  warning: {
    bg: 'var(--omada-color-warning-bg)',
    color: 'var(--omada-color-warning)',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'var(--omada-color-info-bg)',
    color: 'var(--omada-color-info)',
    Icon: Info,
  },
};

/**
 * Omada borderless 12%-tinted banner alert (`6px` radius, `12px 16px` padding).
 */
export const SAlert: React.FC<SAlertProps> = ({
  type = 'info',
  title,
  description,
  closable = false,
  onClose,
  action,
  align = 'left',
  className = '',
}) => {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const { bg, color, Icon } = ALERT_META[type];

  return (
    <div
      role="alert"
      className={`omada-alert flex items-start gap-3 ${
        align === 'center' ? 'justify-center text-center' : 'justify-between'
      } ${className}`.trim()}
      style={{ backgroundColor: bg }}
    >
      <div
        className={`flex items-start gap-3 ${
          align === 'center' ? 'justify-center' : 'flex-1'
        }`}
      >
        <span className="mt-0.5 shrink-0" style={{ color }}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          {title && (
            <div className="text-sm font-medium leading-5 text-[var(--omada-text-primary)]">
              {title}
            </div>
          )}
          {description && (
            <div
              className={`text-[13px] leading-5 text-[var(--omada-text-secondary)] ${
                title ? 'mt-0.5' : ''
              }`}
            >
              {description}
            </div>
          )}
        </div>
      </div>

      {(action || closable) && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {closable && (
            <button
              type="button"
              aria-label="Close alert"
              onClick={() => {
                setClosed(true);
                onClose?.();
              }}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[var(--omada-text-tertiary)] transition-colors hover:text-[var(--omada-text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Theme-aware Toast (`message`) and Notification (`notification`) hooks backed by `App.useApp()`.
 */
export function useOmadaFeedback() {
  const { message, notification } = AntdApp.useApp();

  const toast = {
    success: (content: React.ReactNode, duration = 3) =>
      message.success(content, duration),
    error: (content: React.ReactNode, duration = 4) =>
      message.error(content, duration),
    warning: (content: React.ReactNode, duration = 3.5) =>
      message.warning(content, duration),
    info: (content: React.ReactNode, duration = 3) =>
      message.info(content, duration),
    loading: (content: React.ReactNode, duration = 2) =>
      message.loading(content, duration),
  };

  const notify = {
    success: (title: React.ReactNode, description?: React.ReactNode) =>
      notification.success({ title, description, placement: 'topRight' }),
    error: (title: React.ReactNode, description?: React.ReactNode) =>
      notification.error({ title, description, placement: 'topRight' }),
    warning: (title: React.ReactNode, description?: React.ReactNode) =>
      notification.warning({ title, description, placement: 'topRight' }),
    info: (title: React.ReactNode, description?: React.ReactNode) =>
      notification.info({ title, description, placement: 'topRight' }),
  };

  return { toast, notify };
}
