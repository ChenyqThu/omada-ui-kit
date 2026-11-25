import React, { useState } from 'react';
import { Popover } from 'antd';
import { Info } from 'lucide-react';
import { useOmadaAgentControl } from '../agent';
import { SIcon } from '../assets/SIcon';
import { SButton } from './SButton';
import { STabs } from './STabs';
import { STooltip } from './STooltip';

export interface SSettingsTabItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SSettingsPageShellProps {
  /** Optional 20px page heading (omitted on tab-first pages like LAN). */
  title?: React.ReactNode;
  /** Optional top-right circular green `(?)` Help icon (defaults to `true`). */
  showHelp?: boolean;
  /** Heading inside the Help popover when `(?)` is clicked. */
  helpTitle?: React.ReactNode;
  /** Body description inside the Help popover when `(?)` is clicked. */
  helpDescription?: React.ReactNode;
  /** Optional click callback overriding default Help popover behavior. */
  onHelpClick?: () => void;
  /** Extra controls placed left of the `(?)` Help button in the header bar. */
  headerExtra?: React.ReactNode;
  /** Optional underline sub-tabs (`18px` Omada tab bar). */
  tabs?: SSettingsTabItem[];
  /** Controlled active tab key. */
  activeTab?: string;
  /** Initial uncontrolled active tab key. */
  defaultActiveTab?: string;
  /** Invoked when an underline sub-tab is clicked. */
  onTabChange?: (key: string) => void;
  /** Accessible `aria-label` for the underline sub-tabs tablist. */
  tabAriaLabel?: string;
  /** Shows the sticky bottom `Apply` / `Cancel` bar when `true`. */
  dirty?: boolean;
  /** Callback invoked when the sticky `Apply` button is clicked. */
  onApply?: () => void;
  /** Callback invoked when the sticky `Cancel` button is clicked. */
  onCancel?: () => void;
  /** Custom primary action label (defaults to `'Apply'`). */
  applyText?: string;
  /** Custom secondary action label (defaults to `'Cancel'`). */
  cancelText?: string;
  /** Loading state for the sticky `Apply` button. */
  applying?: boolean;
  /** Disables the sticky `Apply` button while keeping `Cancel` active. */
  applyDisabled?: boolean;
  /** Optional auxiliary content shown on the right of the sticky footer bar. */
  footerExtra?: React.ReactNode;
  /** Adds `>=44px` right clearance on top header/tab rows so `(?)` Help clears `<SEmulatorShell>`'s `<||` quick-drawer handle. Default `true`. */
  clearQuickDrawer?: boolean;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
  /** Optional data-testid applied to the root shell container. */
  'data-testid'?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable Omada Controller v6.3 configuration page container providing:
 * - `20px` title header + optional top-right circular green `(?)` Help trigger
 * - Optional `18px` underline sub-tab bar (`<STabs variant="page" />`)
 * - Automatic `>=44px` right clearance (`clearQuickDrawer`) for `<SEmulatorShell>`'s `<||` handle
 * - Clean borderless content workspace + optional dirty-state sticky `Apply` / `Cancel` footer bar
 */
export const SSettingsPageShell: React.FC<SSettingsPageShellProps> = ({
  title,
  showHelp = true,
  helpTitle,
  helpDescription,
  onHelpClick,
  headerExtra,
  tabs,
  activeTab,
  defaultActiveTab,
  onTabChange,
  tabAriaLabel = 'Settings sections',
  dirty = false,
  onApply,
  onCancel,
  applyText = 'Apply',
  cancelText = 'Cancel',
  applying = false,
  applyDisabled = false,
  footerExtra,
  clearQuickDrawer = true,
  agentId,
  'data-testid': testId,
  className = '',
  children,
}) => {
  const [innerTab, setInnerTab] = useState<string>(
    defaultActiveTab ?? tabs?.[0]?.key ?? '',
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const currentTab = activeTab ?? innerTab;

  const handleTabClick = (key: string) => {
    if (activeTab === undefined) {
      setInnerTab(key);
    }
    onTabChange?.(key);
  };

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'settings',
          label: typeof title === 'string' ? title : tabAriaLabel,
          value: {
            activeTab: currentTab || null,
            dirty: Boolean(dirty),
            applying: Boolean(applying),
            applyDisabled: Boolean(applyDisabled),
          },
          options: tabs?.map((t) => ({
            value: t.key,
            label: typeof t.label === 'string' ? t.label : t.key,
            disabled: t.disabled,
          })),
          actions: {
            ...(tabs && tabs.length > 0
              ? {
                  selectTab: (nextKey: unknown) => {
                    const target = tabs.find((t) => t.key === String(nextKey));
                    if (!target) {
                      throw new Error(`Unknown tab "${String(nextKey)}".`);
                    }
                    if (target.disabled) {
                      throw new Error(`Tab "${target.key}" is disabled.`);
                    }
                    handleTabClick(target.key);
                    return target.key;
                  },
                }
              : {}),
            apply: () => {
              if (applyDisabled || applying) {
                throw new Error('Apply action is currently disabled.');
              }
              onApply?.();
            },
            cancel: () => {
              if (applying) {
                throw new Error('Cannot cancel while applying.');
              }
              onCancel?.();
            },
          },
        }
      : null,
  );

  const renderHelpButton = () => {
    if (!showHelp) return null;

    const btn = (
      <button
        type="button"
        aria-label="Help"
        data-testid="settings-help-btn"
        onClick={() => {
          if (onHelpClick) {
            onHelpClick();
          } else {
            setHelpOpen((prev) => !prev);
          }
        }}
        className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-80"
      >
        <SIcon name="question" size={20} />
      </button>
    );

    if (onHelpClick) {
      return <STooltip title={helpTitle ?? 'Help'}>{btn}</STooltip>;
    }

    return (
      <Popover
        open={helpOpen}
        onOpenChange={setHelpOpen}
        trigger="click"
        placement="bottomRight"
        content={
          <div className="w-[280px] space-y-1.5 text-[13px]">
            <div className="font-semibold text-[var(--omada-text-primary)]">
              {helpTitle ?? (typeof title === 'string' ? `${title} Guide` : 'Configuration Help')}
            </div>
            <p className="m-0 leading-[19px] text-[var(--omada-text-secondary)]">
              {helpDescription ??
                'Modify parameters below and click Apply to save changes across the active site.'}
            </p>
          </div>
        }
      >
        {btn}
      </Popover>
    );
  };

  const hasTabs = Boolean(tabs && tabs.length > 0);
  const topClearanceStyle: React.CSSProperties | undefined = clearQuickDrawer
    ? { paddingRight: 44 }
    : undefined;

  return (
    <div
      data-testid={testId}
      className={`omada-config-root relative flex min-h-full flex-col bg-[var(--omada-bg-surface)] ${className}`.trim()}
    >
      <div className="flex-1 px-6 pt-5 pb-6">
        {/* Title Row (when title is provided) */}
        {title !== undefined && (
          <div
            style={topClearanceStyle}
            className={`mb-4 flex items-center justify-between gap-4 ${
              clearQuickDrawer ? 'pr-11' : ''
            }`.trim()}
          >
            <h1 className="m-0 text-[20px] font-medium leading-[28px] text-[var(--omada-text-primary)]">
              {title}
            </h1>
            <div className="flex shrink-0 items-center gap-3">
              {headerExtra}
              {!hasTabs && renderHelpButton()}
            </div>
          </div>
        )}

        {/* Underline Sub-Tabs Row (when tabs are provided) */}
        {hasTabs && tabs && (
          <div
            style={topClearanceStyle}
            className={`mb-4 ${clearQuickDrawer ? 'pr-11' : ''}`.trim()}
          >
            <STabs
              variant="page"
              size="lg"
              bordered
              aria-label={tabAriaLabel}
              items={tabs}
              activeKey={currentTab}
              onChange={handleTabClick}
              extra={
                <>
                  {title === undefined && headerExtra}
                  {renderHelpButton()}
                </>
              }
            />
          </div>
        )}

        {/* Main Content Workspace */}
        <div>{children}</div>
      </div>

      {/* Optional Dirty-State Sticky Apply / Cancel Footer Bar */}
      {dirty && (
        <div
          data-testid="settings-dirty-footer"
          className="omada-cfg-sticky-footer flex h-[56px] shrink-0 items-center justify-between px-6"
        >
          <div className="flex items-center gap-3">
            <SButton
              variant="primary"
              loading={applying}
              disabled={applyDisabled}
              onClick={onApply}
            >
              {applyText}
            </SButton>
            <SButton
              variant="secondary"
              disabled={applying}
              onClick={onCancel}
            >
              {cancelText}
            </SButton>
          </div>
          {footerExtra && <div className="flex items-center gap-2">{footerExtra}</div>}
        </div>
      )}
    </div>
  );
};

export interface SSettingsSectionProps {
  /** Section title (`16px` medium weight). */
  title: React.ReactNode;
  /** Optional muted subtitle rendered below the section title. */
  description?: React.ReactNode;
  /** Optional right-aligned header action slot. */
  extra?: React.ReactNode;
  /** Renders a hairline horizontal divider above this section. */
  dividerTop?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Borderless Omada settings section block with optional hairline top divider and `16px` title.
 */
export const SSettingsSection: React.FC<SSettingsSectionProps> = ({
  title,
  description,
  extra,
  dividerTop = false,
  className = '',
  children,
}) => (
  <section
    className={`${
      dividerTop ? 'mt-7 border-t border-[var(--omada-border-divider)] pt-6' : ''
    } ${className}`.trim()}
  >
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="m-0 text-[16px] font-medium leading-[24px] text-[var(--omada-text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="m-0 mt-1 text-[13px] leading-[18px] text-[var(--omada-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

export interface SSettingsRowProps {
  /** Left column label (`210px` default width). */
  label: React.ReactNode;
  /** Optional tooltip shown via inline `(i)` icon next to the label. */
  tooltip?: React.ReactNode;
  /** Width of left label column in px (defaults to `210`). */
  labelWidth?: number;
  /** Width constraint for the control column (`350` default, or `'auto' | 'full'`). */
  controlWidth?: number | 'auto' | 'full';
  /** Optional muted helper description rendered directly below the control. */
  hint?: React.ReactNode;
  /** Optional trailing text or element rendered immediately right of the control box. */
  after?: React.ReactNode;
  /** Vertical alignment of label relative to control (`'center'` or `'start'`). */
  align?: 'center' | 'start';
  className?: string;
  children: React.ReactNode;
}

/**
 * Horizontal Omada settings field row (`210px` left label / `350px` right filled control).
 */
export const SSettingsRow: React.FC<SSettingsRowProps> = ({
  label,
  tooltip,
  labelWidth = 210,
  controlWidth = 350,
  hint,
  after,
  align = 'center',
  className = '',
  children,
}) => {
  const controlWidthStyle: React.CSSProperties | undefined =
    controlWidth === 'full'
      ? { width: '100%' }
      : controlWidth === 'auto'
        ? undefined
        : { width: '100%', maxWidth: controlWidth };

  return (
    <div
      className={`flex flex-wrap ${
        align === 'start' ? 'items-start' : 'items-center'
      } gap-y-2 ${className}`.trim()}
    >
      <div
        className={`flex shrink-0 items-center gap-1.5 pr-4 text-[14px] leading-[20px] text-[var(--omada-text-primary)] ${
          align === 'start' ? 'pt-1.5' : ''
        }`}
        style={{ width: labelWidth }}
      >
        <span>{label}</span>
        {tooltip && (
          <STooltip title={tooltip}>
            <span
              tabIndex={0}
              aria-label={typeof label === 'string' ? `${label} info` : 'More info'}
              className="inline-flex cursor-help items-center text-[var(--omada-text-tertiary)] transition-colors hover:text-[var(--omada-brand-text)]"
            >
              <Info size={15} />
            </span>
          </STooltip>
        )}
      </div>

      <div className="omada-cfg-control-wrap min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0" style={controlWidthStyle}>
            {children}
          </div>
          {after && (
            <div className="shrink-0 text-[13px] text-[var(--omada-text-tertiary)]">
              {after}
            </div>
          )}
        </div>
        {hint && (
          <div
            className="mt-1.5 text-[12px] leading-[17px] text-[var(--omada-text-tertiary)]"
            style={
              typeof controlWidth === 'number'
                ? { maxWidth: controlWidth }
                : undefined
            }
          >
            {hint}
          </div>
        )}
      </div>
    </div>
  );
};

export interface SSettingsInfoBannerProps {
  /** Numbered or rich informational items displayed inside the soft blue banner. */
  children: React.ReactNode;
  className?: string;
}

/**
 * Soft blue `#F0F5FA` (Light) / `#1D2939` (Dark) informational banner for Omada settings pages.
 */
export const SSettingsInfoBanner: React.FC<SSettingsInfoBannerProps> = ({
  children,
  className = '',
}) => (
  <div
    role="note"
    className={`omada-settings-info-banner flex items-start gap-2.5 text-[13px] leading-[20px] ${className}`.trim()}
  >
    <span className="omada-settings-info-banner-icon mt-0.5 inline-flex shrink-0 items-center">
      <Info size={16} />
    </span>
    <div className="min-w-0 flex-1 text-[var(--omada-text-primary)]">{children}</div>
  </div>
);
