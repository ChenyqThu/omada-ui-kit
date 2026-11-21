import React, { useState } from 'react';
import { App as AntdApp } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import { X } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';

export type SNotificationType = 'info' | 'success' | 'warning' | 'error';

const NOTIFICATION_ICONS: Record<SNotificationType, OmadaIconName> = {
  info: 'alert-status-info',
  success: 'alert-status-success',
  warning: 'alert-status-warning',
  error: 'alert-status-failed',
};

export interface SNotificationProps {
  /** Semantic notification level (`info` | `success` | `warning` | `error`) */
  type?: SNotificationType;
  /** Primary notification heading */
  title: React.ReactNode;
  /** Optional multi-line body description */
  description?: React.ReactNode;
  /** Custom icon overriding the semantic status icon */
  icon?: React.ReactNode;
  /** Action buttons rendered at the bottom-right of the notification card */
  actions?: React.ReactNode;
  /** Whether the close button is displayed (defaults to `true`) */
  closable?: boolean;
  /** Fired when the user clicks the close button */
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Static/inline Omada notification card matching Figma `43:34759` specs
 * (`--omada-bg-popover`, `--omada-shadow-popover`, semantic Figma status icons, and action slots).
 */
export const SNotification: React.FC<SNotificationProps> = ({
  type = 'info',
  title,
  description,
  icon,
  actions,
  closable = true,
  onClose,
  className = '',
  style,
}) => {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const iconNode =
    icon !== undefined ? (
      icon
    ) : (
      <SIcon name={NOTIFICATION_ICONS[type]} size={20} />
    );

  return (
    <div
      role="status"
      data-notification-type={type}
      className={`omada-notification-card flex items-start gap-3 ${className}`.trim()}
      style={style}
    >
      {iconNode && <span className="mt-0.5 shrink-0">{iconNode}</span>}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold leading-5 text-[var(--omada-text-primary)]">
            {title}
          </div>
          {closable && (
            <button
              type="button"
              aria-label="Close notification"
              onClick={() => {
                setClosed(true);
                onClose?.();
              }}
              className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-[var(--omada-text-tertiary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {description && (
          <div className="mt-1 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
            {description}
          </div>
        )}
        {actions && (
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export interface OmadaNotificationOptions {
  key?: React.Key;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Action buttons rendered inside the AntD 6 notification card (`actions` slot) */
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  placement?: NotificationPlacement;
  duration?: number | false;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

type NotificationTrigger = (
  optionsOrTitle: OmadaNotificationOptions | React.ReactNode,
  description?: React.ReactNode,
) => void;

export interface OmadaNotificationApi {
  info: NotificationTrigger;
  success: NotificationTrigger;
  warning: NotificationTrigger;
  error: NotificationTrigger;
  open: (options: OmadaNotificationOptions & { type?: SNotificationType }) => void;
  destroy: (key?: React.Key) => void;
}

function normalizeNotificationOptions(
  optionsOrTitle: OmadaNotificationOptions | React.ReactNode,
  description?: React.ReactNode,
): OmadaNotificationOptions {
  if (
    typeof optionsOrTitle === 'object' &&
    optionsOrTitle !== null &&
    !React.isValidElement(optionsOrTitle) &&
    'title' in optionsOrTitle
  ) {
    return optionsOrTitle as OmadaNotificationOptions;
  }
  return {
    title: optionsOrTitle as React.ReactNode,
    description,
  };
}

/**
 * Theme-aware Omada notification hook backed by Ant Design 6 `App.useApp().notification`.
 * Uses AntD 6 `{ title, description, actions }` APIs and official Figma semantic status icons.
 */
export function useOmadaNotification(): OmadaNotificationApi {
  const { notification } = AntdApp.useApp();

  const trigger = (
    level: SNotificationType,
    options: OmadaNotificationOptions,
  ) => {
    notification[level]({
      key: options.key,
      title: options.title,
      description: options.description,
      actions: options.actions,
      icon: options.icon ?? <SIcon name={NOTIFICATION_ICONS[level]} size={20} />,
      placement: options.placement ?? 'topRight',
      duration: options.duration,
      showProgress: options.showProgress,
      pauseOnHover: options.pauseOnHover,
      closable: options.closable,
      onClose: options.onClose,
      onClick: options.onClick,
      className: options.className,
      style: options.style,
    });
  };

  return {
    info: (optionsOrTitle, description) =>
      trigger('info', normalizeNotificationOptions(optionsOrTitle, description)),
    success: (optionsOrTitle, description) =>
      trigger('success', normalizeNotificationOptions(optionsOrTitle, description)),
    warning: (optionsOrTitle, description) =>
      trigger('warning', normalizeNotificationOptions(optionsOrTitle, description)),
    error: (optionsOrTitle, description) =>
      trigger('error', normalizeNotificationOptions(optionsOrTitle, description)),
    open: ({ type = 'info', ...rest }) => trigger(type, rest),
    destroy: (key) => notification.destroy(key),
  };
}
