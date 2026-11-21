import React from 'react';
import { App as AntdApp, Modal, type ModalProps } from 'antd';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';
import { SButton, type SButtonProps } from './SButton';

export type SModalSize = 'confirm' | 'default' | 'form';

const SIZE_WIDTHS: Record<SModalSize, number> = {
  confirm: 540,
  default: 640,
  form: 880,
};

export interface SModalProps
  extends Omit<ModalProps, 'width' | 'okButtonProps' | 'cancelButtonProps'> {
  size?: SModalSize;
  width?: number | string;
  danger?: boolean;
  okButtonProps?: SButtonProps;
  cancelButtonProps?: SButtonProps;
}

/**
 * Omada-styled Modal supporting preset sizes (`confirm`: 540px, `default`: 640px, `form`: 880px)
 * and Omada Secondary/Primary/Danger footer buttons.
 */
export const SModal: React.FC<SModalProps> = ({
  size = 'default',
  width,
  danger = false,
  footer,
  okText = 'OK',
  cancelText = 'Cancel',
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  className = '',
  children,
  ...rest
}) => {
  const resolvedFooter =
    footer === undefined
      ? () => (
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <SButton
              variant="secondary"
              onClick={onCancel as React.MouseEventHandler<HTMLElement>}
              {...cancelButtonProps}
            >
              {cancelText}
            </SButton>
            <SButton
              variant={danger ? 'danger' : 'primary'}
              loading={confirmLoading}
              onClick={onOk as React.MouseEventHandler<HTMLElement>}
              {...okButtonProps}
            >
              {okText}
            </SButton>
          </div>
        )
      : footer;

  const confirmClass = size === 'confirm' ? 'omada-modal-confirm' : '';

  return (
    <Modal
      width={width ?? SIZE_WIDTHS[size]}
      footer={resolvedFooter}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      className={`${confirmClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export interface OmadaConfirmOptions {
  title: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Theme-aware confirmation dialog presets (`confirm`, `confirmDanger`, `confirmLeave`)
 * backed by `App.useApp().modal`.
 */
export function useOmadaConfirm() {
  const { modal } = AntdApp.useApp();

  const confirm = (opts: OmadaConfirmOptions) =>
    modal.confirm({
      width: 540,
      className: 'omada-modal-confirm',
      icon: <HelpCircle size={20} className="mr-2 mt-0.5 text-[var(--omada-brand-text)]" />,
      title: opts.title,
      content: opts.content,
      okText: opts.okText ?? 'Confirm',
      cancelText: opts.cancelText ?? 'Cancel',
      okButtonProps: { className: 's-btn' },
      cancelButtonProps: { className: 's-btn s-btn-secondary' },
      onOk: opts.onOk,
      onCancel: opts.onCancel,
    });

  const confirmDanger = (opts: OmadaConfirmOptions) =>
    modal.confirm({
      width: 540,
      className: 'omada-modal-confirm',
      icon: <AlertTriangle size={20} className="mr-2 mt-0.5 text-[var(--omada-color-error)]" />,
      title: opts.title,
      content: opts.content,
      okText: opts.okText ?? 'Delete',
      cancelText: opts.cancelText ?? 'Cancel',
      okButtonProps: { danger: true, className: 's-btn' },
      cancelButtonProps: { className: 's-btn s-btn-secondary' },
      onOk: opts.onOk,
      onCancel: opts.onCancel,
    });

  const confirmLeave = (opts: Partial<OmadaConfirmOptions> = {}) =>
    modal.confirm({
      width: 540,
      className: 'omada-modal-confirm',
      icon: <Info size={20} className="mr-2 mt-0.5 text-[var(--omada-color-warning)]" />,
      title: opts.title ?? 'Unsaved Changes',
      content:
        opts.content ??
        'You have unsaved configuration changes. Leaving this page will discard them.',
      okText: opts.okText ?? 'Leave',
      cancelText: opts.cancelText ?? 'Stay',
      okButtonProps: { className: 's-btn' },
      cancelButtonProps: { className: 's-btn s-btn-secondary' },
      onOk: opts.onOk,
      onCancel: opts.onCancel,
    });

  return { confirm, confirmDanger, confirmLeave };
}
