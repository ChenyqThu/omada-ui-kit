import React from 'react';
import { Tooltip } from 'antd';
import { ArrowLeft, Info } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import { SButton } from '../components/SButton';

export interface SInlineFormRowProps {
  /** Left-column label (`210px` fixed on desktop). */
  label: React.ReactNode;
  /** Optional `<label htmlFor>` target ID. */
  htmlFor?: string;
  /** Optional green info icon tooltip placed next to the label. */
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard Omada Controller `210px`-label / flexible-control row for inline rule & policy editors.
 */
export const SInlineFormRow: React.FC<SInlineFormRowProps> = ({
  label,
  htmlFor,
  tooltip,
  children,
  className = '',
}) => {
  return (
    <div className={`omada-acl-editor-row ${className}`.trim()}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="omada-acl-editor-label inline-flex items-center gap-1.5">
          <span>{label}</span>
          {tooltip && (
            <Tooltip title={tooltip}>
              <span className="omada-acl-info-icon" aria-label="Help">
                <Info size={14} />
              </span>
            </Tooltip>
          )}
        </label>
      ) : (
        <span className="omada-acl-editor-label inline-flex items-center gap-1.5">
          <span>{label}</span>
          {tooltip && (
            <Tooltip title={tooltip}>
              <span className="omada-acl-info-icon" aria-label="Help">
                <Info size={14} />
              </span>
            </Tooltip>
          )}
        </span>
      )}
      <div className="omada-acl-editor-control">{children}</div>
    </div>
  );
};

export interface SInlineRuleEditorLayoutProps {
  /** Heading rendered beside the `<-` back arrow (`Create New Rule`, `Edit Profile`, etc.). */
  title: React.ReactNode;
  /** Callback invoked when clicking the `<-` back title button. */
  onBack: () => void;
  /** Optional callback for the top-right circular green `(?)` Help button. */
  onHelpClick?: () => void;
  /** Primary action button label (default `'Create'`). */
  primaryText?: string;
  /** Cancel button label (default `'Cancel'`). */
  cancelText?: string;
  /** Submit handler for the primary button. */
  onSubmit?: () => void;
  /** Cancel handler (defaults to `onBack`). */
  onCancel?: () => void;
  /** Loading state for the primary action button. */
  submitting?: boolean;
  /** Optional extra actions rendered on the bottom action bar. */
  footerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-pane inline rule / profile editor layout with `<- Back` header,
 * top-right `(?)` Help icon (`pr-9` clearance), structured `SInlineFormRow` stack,
 * and `Create` / `Cancel` footer buttons.
 */
export const SInlineRuleEditorLayout: React.FC<SInlineRuleEditorLayoutProps> = ({
  title,
  onBack,
  onHelpClick,
  primaryText = 'Create',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
  submitting = false,
  footerExtra,
  children,
  className = '',
}) => {
  return (
    <div className={`omada-inline-rule-editor ${className}`.trim()}>
      <div className="omada-acl-editor-header pr-9">
        <button type="button" onClick={onBack} className="omada-acl-back-btn">
          <ArrowLeft size={18} />
          <span>{title}</span>
        </button>

        {onHelpClick && (
          <Tooltip title="Help">
            <button
              type="button"
              aria-label="Help"
              onClick={onHelpClick}
              className="omada-cfg-help-btn"
            >
              <SIcon name="question" size={20} />
            </button>
          </Tooltip>
        )}
      </div>

      <div className="omada-acl-editor-form">
        {children}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onSubmit && (
            <SButton variant="primary" loading={submitting} onClick={onSubmit}>
              {primaryText}
            </SButton>
          )}
          <SButton variant="secondary" onClick={onCancel ?? onBack}>
            {cancelText}
          </SButton>
          {footerExtra}
        </div>
      </div>
    </div>
  );
};
