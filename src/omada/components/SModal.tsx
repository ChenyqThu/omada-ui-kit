import React, { useEffect, useState } from 'react';
import { App as AntdApp, Modal, Steps, type ModalProps, type StepsProps } from 'antd';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';
import { useOmadaAgentControl } from '../agent';
import { SIcon } from '../assets/SIcon';
import { SBuiltinIllustration } from '../assets/builtinIllustrations';
import type { OmadaIllustrationName } from '../assets/assetsManifest';
import type { OmadaIconName } from '../assets/iconsManifest';
import { SButton, type SButtonProps } from './SButton';

const LazySIllustration = React.lazy(() =>
  import('../assets/SIllustration').then((m) => ({ default: m.SIllustration })),
);

export type SModalSize = 'sm' | 'confirm' | 'default' | 'centered' | 'form' | 'xl';

const SIZE_WIDTHS: Record<SModalSize, number> = {
  sm: 480,
  confirm: 540,
  default: 640,
  centered: 764,
  form: 880,
  xl: 1040,
};

export interface SModalProps
  extends Omit<ModalProps, 'width' | 'okButtonProps' | 'cancelButtonProps'> {
  size?: SModalSize;
  width?: number | string;
  danger?: boolean;
  /** Optional subtitle rendered beneath the modal title */
  subtitle?: React.ReactNode;
  /** Optional leading icon rendered in the modal header */
  icon?: React.ReactNode;
  /** Alignment of the default modal footer actions */
  footerAlign?: 'left' | 'right';
  okButtonProps?: SButtonProps;
  cancelButtonProps?: SButtonProps;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

/**
 * Omada-styled Modal supporting preset sizes (`sm`: 480px, `confirm`: 540px,
 * `default`: 640px, `centered`: 764px, `form`: 880px, `xl`: 1040px),
 * optional header icon/subtitle slots, and Omada Secondary/Primary/Danger footer buttons.
 */
export const SModal: React.FC<SModalProps> = ({
  size = 'default',
  width,
  danger = false,
  title,
  subtitle,
  icon,
  footerAlign = 'right',
  footer,
  centered,
  okText = 'OK',
  cancelText = 'Cancel',
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  agentId,
  className = '',
  children,
  ...rest
}) => {
  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'modal',
          label:
            typeof title === 'string'
              ? title
              : typeof subtitle === 'string'
                ? subtitle
                : ((rest as Record<string, unknown>)['aria-label'] as string | undefined),
          value: Boolean(rest.open),
          disabled: Boolean(confirmLoading),
          meta: {
            open: Boolean(rest.open),
            size,
            danger,
          },
          actions: {
            close: () => {
              onCancel?.({} as React.MouseEvent<HTMLButtonElement>);
              return false;
            },
            ...(onOk
              ? {
                  confirm: () => {
                    onOk({} as React.MouseEvent<HTMLButtonElement>);
                    return true;
                  },
                }
              : {}),
          },
        }
      : null,
  );
  const resolvedTitle =
    title !== undefined && (subtitle || icon) ? (
      <div className="flex items-start gap-3 pr-6">
        {icon && (
          <span className="mt-0.5 inline-flex shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold leading-6 text-[var(--omada-text-primary)]">
            {title}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs font-normal leading-4 text-[var(--omada-text-secondary)]">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    ) : (
      title
    );

  const resolvedFooter =
    footer === undefined
      ? () => (
          <div
            className={`flex items-center gap-2.5 pt-2 ${
              footerAlign === 'left' ? 'justify-start' : 'justify-end'
            }`}
          >
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
      title={resolvedTitle}
      centered={centered ?? size === 'centered'}
      footer={resolvedFooter}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      className={`omada-modal ${confirmClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export type SInfoDialogStatus = 'info' | 'success' | 'warning' | 'error' | 'loading';

const INFO_STATUS_ICONS: Record<SInfoDialogStatus, OmadaIconName> = {
  info: 'alert-status-info',
  success: 'alert-status-success',
  warning: 'alert-status-warning',
  error: 'alert-status-failed',
  loading: 'alert-status-loading',
};

export interface SInfoDialogProps
  extends Omit<SModalProps, 'title' | 'footer' | 'children' | 'okText' | 'cancelText'> {
  /** Semantic status icon state matching Figma Dialog specs */
  status?: SInfoDialogStatus;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional Figma illustration slug (`<SIllustration />`) displayed above the title */
  illustration?: OmadaIllustrationName;
  /** Custom icon overriding the default status icon */
  icon?: React.ReactNode;
  /** Centered hero dialog (`centered`) or compact top-aligned header (`header`) */
  layout?: 'centered' | 'header';
  /** Optional extra body content (e.g., progress bar, status metadata) */
  children?: React.ReactNode;
  /** Primary action label; pass `null` to omit */
  okText?: React.ReactNode | null;
  /** Optional secondary/stop action label (e.g., `'Stop'` or `'Cancel'`) */
  cancelText?: React.ReactNode | null;
  /** Variant override for the primary action button */
  okVariant?: SButtonProps['variant'];
  /** Custom action nodes replacing the default footer buttons */
  actions?: React.ReactNode;
  footer?: SModalProps['footer'];
}

/**
 * Status/result information dialog using official Figma status icons or illustrations,
 * supporting centered result layouts, progress content, and Stop/OK actions.
 */
export const SInfoDialog: React.FC<SInfoDialogProps> = ({
  status = 'info',
  title,
  description,
  illustration,
  icon,
  layout = 'centered',
  size,
  centered,
  destroyOnHidden = true,
  okText = 'OK',
  cancelText = null,
  okVariant,
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  actions,
  footer,
  children,
  className = '',
  ...rest
}) => {
  const iconSize = layout === 'centered' ? 48 : 24;
  const resolvedIcon =
    icon !== undefined ? (
      icon
    ) : (
      <SIcon
        name={INFO_STATUS_ICONS[status]}
        size={iconSize}
        className={status === 'loading' ? 'omada-spin' : ''}
      />
    );

  const resolvedSize: SModalSize =
    size ?? (layout === 'centered' && illustration ? 'centered' : 'confirm');

  const resolvedOkVariant: SButtonProps['variant'] =
    okVariant ?? (status === 'error' ? 'danger' : 'primary');

  const handlePrimaryClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (onOk) {
      onOk(e as React.MouseEvent<HTMLButtonElement>);
    } else {
      onCancel?.(e as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const defaultFooter =
    footer !== undefined
      ? footer
      : actions !== undefined
        ? () => <div className="flex items-center justify-center gap-2.5 pt-2">{actions}</div>
        : okText === null && cancelText === null
          ? null
          : () => (
              <div
                className={`flex items-center gap-2.5 pt-2 ${
                  layout === 'centered' ? 'justify-center' : 'justify-end'
                }`}
              >
                {cancelText !== null && cancelText !== undefined && (
                  <SButton
                    variant="secondary"
                    onClick={onCancel as React.MouseEventHandler<HTMLElement>}
                    {...cancelButtonProps}
                  >
                    {cancelText}
                  </SButton>
                )}
                {okText !== null && okText !== undefined && (
                  <SButton
                    variant={resolvedOkVariant}
                    loading={confirmLoading}
                    onClick={handlePrimaryClick}
                    {...okButtonProps}
                  >
                    {okText}
                  </SButton>
                )}
              </div>
            );

  if (layout === 'header') {
    return (
      <SModal
        size={resolvedSize}
        centered={centered}
        destroyOnHidden={destroyOnHidden}
        title={title}
        subtitle={description}
        icon={resolvedIcon}
        footer={defaultFooter}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        className={`omada-info-dialog ${className}`.trim()}
        {...rest}
      >
        {children && <div className="pt-2">{children}</div>}
      </SModal>
    );
  }

  return (
    <SModal
      size={resolvedSize}
      centered={centered ?? true}
      destroyOnHidden={destroyOnHidden}
      title={null}
      aria-label={typeof title === 'string' ? title : undefined}
      footer={defaultFooter}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      className={`omada-info-dialog omada-info-dialog-centered ${className}`.trim()}
      {...rest}
    >
      <div className="flex flex-col items-center px-4 py-3 text-center">
        {illustration === 'no-data' || illustration === 'upgrade' ? (
          <SBuiltinIllustration
            name={illustration}
            width={160}
            className="mb-4 max-w-full object-contain"
          />
        ) : illustration ? (
          <React.Suspense fallback={null}>
            <LazySIllustration
              name={illustration}
              width={160}
              className="mb-4 max-w-full object-contain"
            />
          </React.Suspense>
        ) : (
          resolvedIcon && <div className="mb-4 inline-flex">{resolvedIcon}</div>
        )}
        <h3 className="m-0 text-lg font-semibold leading-7 text-[var(--omada-text-primary)]">
          {title}
        </h3>
        {description && (
          <div className="mt-2 max-w-md text-sm leading-5 text-[var(--omada-text-secondary)]">
            {description}
          </div>
        )}
        {children && <div className="mt-4 w-full max-w-md text-left">{children}</div>}
      </div>
    </SModal>
  );
};

export interface SStepModalStep {
  key?: string;
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Step body content rendered when this step is active */
  content: React.ReactNode;
}

export interface SStepModalProps
  extends Omit<SModalProps, 'children' | 'onOk' | 'footer'> {
  steps: SStepModalStep[];
  /** Controlled 0-based active step index */
  current?: number;
  /** Initial 0-based step index when uncontrolled */
  defaultCurrent?: number;
  /** Fired whenever the active step changes */
  onStepChange?: (nextStep: number, prevStep: number) => void;
  /** Optional guard run before advancing with Next; return `false` or reject to stay on current step */
  onBeforeNext?: (currentStep: number) => boolean | void | Promise<boolean | void>;
  /** Fired when clicking Finish on the final step */
  onFinish?: () => void | Promise<void>;
  /** Enable clicking step headers to navigate directly */
  allowStepClick?: boolean;
  backText?: React.ReactNode;
  nextText?: React.ReactNode;
  finishText?: React.ReactNode;
  cancelText?: React.ReactNode;
  /** Optional left-side footer content (defaults to step counter) */
  footerExtra?: React.ReactNode;
}

/**
 * Multi-step wizard modal embedding an Ant Design 6 `<Steps>` bar and
 * Back / Next / Finish navigation footer.
 */
export const SStepModal: React.FC<SStepModalProps> = ({
  steps,
  current,
  defaultCurrent = 0,
  onStepChange,
  onBeforeNext,
  onFinish,
  allowStepClick = false,
  backText = 'Back',
  nextText = 'Next',
  finishText = 'Finish',
  cancelText = 'Cancel',
  footerExtra,
  size = 'default',
  open,
  destroyOnHidden = true,
  confirmLoading = false,
  onCancel,
  okButtonProps,
  cancelButtonProps,
  agentId,
  className = '',
  ...rest
}) => {
  const [innerStep, setInnerStep] = useState(defaultCurrent);
  const [stepLoading, setStepLoading] = useState(false);

  const isControlled = current !== undefined;
  const maxStep = Math.max(0, steps.length - 1);
  const activeStep = Math.min(Math.max(0, isControlled ? current : innerStep), maxStep);

  useEffect(() => {
    if (!open && destroyOnHidden && !isControlled) {
      setInnerStep(defaultCurrent);
      setStepLoading(false);
    }
  }, [open, destroyOnHidden, isControlled, defaultCurrent]);

  const setStep = (next: number) => {
    const clamped = Math.min(Math.max(0, next), maxStep);
    if (!isControlled) {
      setInnerStep(clamped);
    }
    if (clamped !== activeStep) {
      onStepChange?.(clamped, activeStep);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setStep(activeStep - 1);
    }
  };

  const isPromiseLike = (val: unknown): val is PromiseLike<unknown> =>
    (typeof val === 'object' || typeof val === 'function') &&
    val !== null &&
    'then' in val &&
    typeof (val as { then?: unknown }).then === 'function';

  const handleNext = async () => {
    if (onBeforeNext) {
      const maybePromise = onBeforeNext(activeStep);
      if (isPromiseLike(maybePromise)) {
        try {
          setStepLoading(true);
          const result = await maybePromise;
          if (result === false) {
            return;
          }
        } finally {
          setStepLoading(false);
        }
      } else if (maybePromise === false) {
        return;
      }
    }
    if (activeStep < maxStep) {
      setStep(activeStep + 1);
    }
  };

  const handleFinish = async () => {
    if (!onFinish) return;
    const maybePromise = onFinish();
    if (isPromiseLike(maybePromise)) {
      try {
        setStepLoading(true);
        await maybePromise;
      } finally {
        setStepLoading(false);
      }
    }
  };

  const stepItems: StepsProps['items'] = steps.map((step, idx) => ({
    key: step.key ?? idx,
    title: step.title,
    subTitle: step.subTitle,
    content: step.description,
    icon: step.icon,
    disabled: step.disabled,
  }));

  const isFirst = activeStep === 0;
  const isLast = activeStep >= maxStep;
  const busy = confirmLoading || stepLoading;

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'modal',
          label: typeof rest.title === 'string' ? rest.title : undefined,
          value: {
            open: Boolean(open),
            activeStep,
            stepCount: steps.length,
          },
          disabled: Boolean(busy),
          options: steps.map((step, idx) => ({
            value: idx,
            label:
              typeof step.title === 'string'
                ? step.title
                : String(step.key ?? idx),
            disabled: step.disabled,
          })),
          actions: {
            nextStep: () => {
              void handleNext();
              return Math.min(activeStep + 1, maxStep);
            },
            prevStep: () => {
              handleBack();
              return Math.max(activeStep - 1, 0);
            },
            setStep: (idx: unknown) => {
              const parsed = Number(idx);
              if (!Number.isFinite(parsed)) {
                throw new Error(`Invalid step index "${String(idx)}".`);
              }
              const clamped = Math.min(Math.max(0, Math.floor(parsed)), maxStep);
              setStep(clamped);
              return clamped;
            },
            finish: () => {
              void handleFinish();
              return true;
            },
            close: () => {
              onCancel?.({} as React.MouseEvent<HTMLButtonElement>);
              return false;
            },
          },
        }
      : null,
  );

  const wizardFooter = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <div className="text-xs text-[var(--omada-text-secondary)]">
        {footerExtra ?? (
          <span>
            Step {steps.length > 0 ? activeStep + 1 : 0} of {steps.length}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <SButton
          variant="secondary"
          disabled={busy}
          onClick={onCancel as React.MouseEventHandler<HTMLElement>}
          {...cancelButtonProps}
        >
          {cancelText}
        </SButton>
        {!isFirst && (
          <SButton variant="outline" disabled={busy} onClick={handleBack}>
            {backText}
          </SButton>
        )}
        {isLast ? (
          <SButton
            variant="primary"
            loading={busy}
            onClick={handleFinish}
            {...okButtonProps}
          >
            {finishText}
          </SButton>
        ) : (
          <SButton
            variant="primary"
            loading={busy}
            onClick={handleNext}
            {...okButtonProps}
          >
            {nextText}
          </SButton>
        )}
      </div>
    </div>
  );

  return (
    <SModal
      size={size}
      open={open}
      destroyOnHidden={destroyOnHidden}
      onCancel={onCancel}
      footer={wizardFooter}
      className={`omada-step-modal ${className}`.trim()}
      {...rest}
    >
      {steps.length > 0 && (
        <div className="mb-5 border-b border-[var(--omada-border-divider)] pb-4 pt-1">
          <Steps
            current={activeStep}
            size="small"
            orientation="horizontal"
            items={stepItems}
            onChange={allowStepClick ? (idx) => setStep(idx) : undefined}
          />
        </div>
      )}
      <div className="min-h-[120px]">{steps[activeStep]?.content}</div>
    </SModal>
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
      className: 'omada-modal omada-modal-confirm',
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
      className: 'omada-modal omada-modal-confirm',
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
      className: 'omada-modal omada-modal-confirm',
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
