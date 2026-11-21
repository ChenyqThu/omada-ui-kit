import React from 'react';
import {
  Popconfirm,
  Popover,
  type PopconfirmProps,
  type PopoverProps,
} from 'antd';
import type { TooltipRef } from 'antd/es/tooltip';
import { SIcon } from '../assets/SIcon';

export interface SPopoverProps extends PopoverProps {
  /** Optional leading icon rendered alongside the popover title */
  icon?: React.ReactNode;
  /** Optional subtitle rendered beneath the popover title */
  subtitle?: React.ReactNode;
  /** Optional footer bar rendered below the popover body content */
  footer?: React.ReactNode;
}

/**
 * Omada-styled Ant Design 6 Popover with Light/Dark elevation (`--omada-bg-popover`,
 * `--omada-shadow-popover`) and optional header icon/subtitle and footer slots.
 */
export const SPopover = React.forwardRef<TooltipRef, SPopoverProps>(
  ({ icon, subtitle, title, content, footer, classNames, styles, ...rest }, ref) => {
    const resolvedTitle: PopoverProps['title'] =
      title !== undefined && (icon || subtitle)
        ? () => {
            const titleNode = typeof title === 'function' ? title() : title;
            return (
              <div className="flex items-start gap-2">
                {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-5 text-[var(--omada-text-primary)]">
                    {titleNode}
                  </div>
                  {subtitle && (
                    <div className="mt-0.5 text-xs font-normal leading-4 text-[var(--omada-text-secondary)]">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>
            );
          }
        : title;

    const resolvedContent: PopoverProps['content'] = footer
      ? () => {
          const contentNode = typeof content === 'function' ? content() : content;
          return (
            <div>
              {contentNode && <div>{contentNode}</div>}
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-[var(--omada-border-divider)] pt-2.5">
                {footer}
              </div>
            </div>
          );
        }
      : content;

    const mergedClassNames: PopoverProps['classNames'] =
      typeof classNames === 'function'
        ? (info) => {
            const resolved = classNames(info);
            return {
              ...resolved,
              root: `omada-popover ${resolved?.root ?? ''}`.trim(),
            };
          }
        : {
            ...classNames,
            root: `omada-popover ${classNames?.root ?? ''}`.trim(),
          };

    const mergedStyles: PopoverProps['styles'] =
      typeof styles === 'function'
        ? (info) => {
            const resolved = styles(info);
            return {
              ...resolved,
              container: {
                backgroundColor: 'var(--omada-bg-popover)',
                boxShadow: 'var(--omada-shadow-popover)',
                ...resolved?.container,
              },
            };
          }
        : {
            ...styles,
            container: {
              backgroundColor: 'var(--omada-bg-popover)',
              boxShadow: 'var(--omada-shadow-popover)',
              ...styles?.container,
            },
          };

    return (
      <Popover
        ref={ref}
        title={resolvedTitle}
        content={resolvedContent}
        classNames={mergedClassNames}
        styles={mergedStyles}
        {...rest}
      />
    );
  },
);

SPopover.displayName = 'SPopover';

export interface SPopconfirmProps extends Omit<PopconfirmProps, 'icon'> {
  /** Custom icon node, or pass `null`/`false` to hide the icon (supporting all 4 Figma variants) */
  icon?: React.ReactNode | false | null;
  /** Styles the confirm button as a destructive Omada danger action */
  danger?: boolean;
}

/**
 * Omada-styled Ant Design 6 Popconfirm supporting all 4 Figma icon/description
 * combinations with Omada Primary/Danger and Neutral Secondary action buttons.
 */
export const SPopconfirm = React.forwardRef<TooltipRef, SPopconfirmProps>(
  (
    {
      icon,
      danger = false,
      okText = 'Yes',
      cancelText = 'No',
      okButtonProps,
      cancelButtonProps,
      classNames,
      styles,
      ...rest
    },
    ref,
  ) => {
    const resolvedIcon =
      icon === false || icon === null ? null : icon !== undefined ? (
        icon
      ) : (
        <SIcon
          name={danger ? 'alert-status-failed' : 'alert-status-warning'}
          size={16}
        />
      );

    const mergedClassNames: PopconfirmProps['classNames'] =
      typeof classNames === 'function'
        ? (info) => {
            const resolved = classNames(info);
            return {
              ...resolved,
              root: `omada-popconfirm ${resolved?.root ?? ''}`.trim(),
            };
          }
        : {
            ...classNames,
            root: `omada-popconfirm ${classNames?.root ?? ''}`.trim(),
          };

    const mergedStyles: PopconfirmProps['styles'] =
      typeof styles === 'function'
        ? (info) => {
            const resolved = styles(info);
            return {
              ...resolved,
              container: {
                backgroundColor: 'var(--omada-bg-popover)',
                boxShadow: 'var(--omada-shadow-popover)',
                ...resolved?.container,
              },
            };
          }
        : {
            ...styles,
            container: {
              backgroundColor: 'var(--omada-bg-popover)',
              boxShadow: 'var(--omada-shadow-popover)',
              ...styles?.container,
            },
          };

    return (
      <Popconfirm
        ref={ref}
        icon={resolvedIcon}
        okText={okText}
        cancelText={cancelText}
        okButtonProps={{
          danger,
          ...okButtonProps,
          className: `s-btn ${okButtonProps?.className ?? ''}`.trim(),
        }}
        cancelButtonProps={{
          ...cancelButtonProps,
          className: `s-btn s-btn-secondary ${cancelButtonProps?.className ?? ''}`.trim(),
        }}
        classNames={mergedClassNames}
        styles={mergedStyles}
        {...rest}
      />
    );
  },
);

SPopconfirm.displayName = 'SPopconfirm';
