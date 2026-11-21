import React, { useState } from 'react';
import { Form, Tooltip, type FormItemProps, type FormProps } from 'antd';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { SButton } from './SButton';

export interface SFormProps<Values = Record<string, unknown>>
  extends Omit<FormProps<Values>, 'children'> {
  children?: React.ReactNode;
}

/**
 * Omada-configured AntD Form.
 * Defaults to horizontal layout with 200px left-aligned labels and no trailing colon.
 */
export function SForm<Values = Record<string, unknown>>({
  layout = 'horizontal',
  colon = false,
  labelAlign = 'left',
  labelCol,
  wrapperCol,
  className = '',
  children,
  ...rest
}: SFormProps<Values>) {
  const resolvedLabelCol =
    labelCol ?? (layout === 'horizontal' ? { flex: '200px' } : undefined);
  const resolvedWrapperCol =
    wrapperCol ?? (layout === 'horizontal' ? { flex: '1 1 0' } : undefined);

  return (
    <Form<Values>
      layout={layout}
      colon={colon}
      labelAlign={labelAlign}
      labelCol={resolvedLabelCol}
      wrapperCol={resolvedWrapperCol}
      className={`omada-form ${className}`.trim()}
      {...rest}
    >
      {children}
    </Form>
  );
}

SForm.useForm = Form.useForm;
SForm.useWatch = Form.useWatch;
SForm.List = Form.List;

export interface SFormItemProps
  extends Pick<
    FormItemProps,
    | 'name'
    | 'rules'
    | 'valuePropName'
    | 'initialValue'
    | 'dependencies'
    | 'validateTrigger'
    | 'required'
    | 'className'
    | 'style'
    | 'children'
  > {
  label?: React.ReactNode;
  tooltip?: React.ReactNode;
  optional?: boolean;
  fieldWidth?: number | 'full';
  hint?: React.ReactNode;
}

/**
 * Omada form row item supporting label info tooltips, 350px default field cap,
 * inline `(Optional)` label, and helper hints.
 */
export const SFormItem: React.FC<SFormItemProps> = ({
  label,
  tooltip,
  optional = false,
  fieldWidth = 350,
  hint,
  name,
  rules,
  valuePropName,
  initialValue,
  dependencies,
  validateTrigger,
  required,
  className = '',
  style,
  children,
}) => {
  const hasRequiredRule = Array.isArray(rules)
    ? rules.some(
        (r) => typeof r === 'object' && r !== null && 'required' in r && Boolean(r.required),
      )
    : false;

  const labelNode =
    label !== undefined ? (
      <span className="inline-flex items-center gap-1.5 text-sm font-normal text-[var(--omada-text-primary)]">
        <span>{label}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <Info
              size={14}
              className="cursor-help text-[var(--omada-text-tertiary)] transition-colors hover:text-[var(--omada-text-secondary)]"
            />
          </Tooltip>
        )}
      </span>
    ) : undefined;

  return (
    <Form.Item
      label={labelNode}
      required={required ?? hasRequiredRule}
      className={`!mb-4 ${className}`.trim()}
      style={style}
    >
      <div className="flex flex-wrap items-start gap-3">
        <Form.Item
          name={name}
          rules={rules}
          valuePropName={valuePropName}
          initialValue={initialValue}
          dependencies={dependencies}
          validateTrigger={validateTrigger}
          extra={hint}
          className="!mb-0 w-full"
          style={{
            maxWidth: fieldWidth === 'full' ? undefined : fieldWidth,
          }}
        >
          {children}
        </Form.Item>
        {optional && (
          <span className="inline-flex h-8 items-center text-xs text-[var(--omada-text-tertiary)]">
            (Optional)
          </span>
        )}
      </div>
    </Form.Item>
  );
};

export interface SFormSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Collapsible form section header + divider matching Omada configuration panels.
 */
export const SFormSection: React.FC<SFormSectionProps> = ({
  title,
  description,
  collapsible = true,
  defaultOpen = true,
  extra,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`mb-6 ${className}`.trim()}>
      <div className="mb-4 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2.5">
        <button
          type="button"
          disabled={!collapsible}
          onClick={() => collapsible && setOpen((v) => !v)}
          className={`flex items-center gap-2 text-left ${
            collapsible ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          {collapsible && (
            <span className="text-[var(--omada-text-secondary)]">
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          <div>
            <h3 className="m-0 text-sm font-semibold text-[var(--omada-text-primary)]">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-xs text-[var(--omada-text-secondary)]">
                {description}
              </p>
            )}
          </div>
        </button>
        {extra && <div>{extra}</div>}
      </div>
      {open && <div>{children}</div>}
    </section>
  );
};

export interface SFormFooterProps {
  onCancel?: () => void;
  onApply?: () => void;
  cancelText?: string;
  applyText?: string;
  loading?: boolean;
  disabled?: boolean;
  align?: 'left' | 'right';
  sticky?: boolean;
  extra?: React.ReactNode;
  className?: string;
}

/**
 * 56px Omada form action bar with top divider and Apply/Cancel buttons.
 */
export const SFormFooter: React.FC<SFormFooterProps> = ({
  onCancel,
  onApply,
  cancelText = 'Cancel',
  applyText = 'Apply',
  loading = false,
  disabled = false,
  align = 'left',
  sticky = true,
  extra,
  className = '',
}) => {
  return (
    <div
      className={`flex h-14 items-center justify-between border-t border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] px-6 ${
        sticky ? 'sticky bottom-0 z-10' : ''
      } ${className}`.trim()}
    >
      <div
        className={`flex flex-1 items-center gap-3 ${
          align === 'right' ? 'justify-end' : 'justify-start'
        }`}
      >
        {onApply ? (
          <SButton
            variant="primary"
            onClick={onApply}
            loading={loading}
            disabled={disabled}
          >
            {applyText}
          </SButton>
        ) : (
          <SButton
            variant="primary"
            htmlType="submit"
            loading={loading}
            disabled={disabled}
          >
            {applyText}
          </SButton>
        )}
        {onCancel && (
          <SButton variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </SButton>
        )}
      </div>
      {extra && <div className="ml-4 flex items-center gap-2">{extra}</div>}
    </div>
  );
};
