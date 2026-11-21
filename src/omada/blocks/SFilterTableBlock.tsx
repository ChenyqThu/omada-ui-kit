import React from 'react';
import { STable, type STableProps } from '../components/STable';

export interface SFilterTableTab {
  key: string;
  label: React.ReactNode;
}

export interface SFilterTableBlockProps<T extends object> {
  /** Optional section heading rendered to the left of the toolbar. */
  title?: React.ReactNode;
  /** Optional helper/subtitle text placed beside `title`. */
  subtitle?: React.ReactNode;
  /** Optional top underline tabs rendered above the toolbar. */
  tabs?: SFilterTableTab[];
  /** Controlled active tab key when `tabs` is provided. */
  activeTab?: string;
  /** Invoked when a top underline tab is clicked. */
  onTabChange?: (key: string) => void;
  /** Placeholder text for the integrated search input. */
  searchPlaceholder?: string;
  /** Controlled search string. */
  searchValue?: string;
  /** Callback invoked on search input change. */
  onSearchChange?: (value: string) => void;
  /** Filter controls placed alongside the search input. */
  filters?: React.ReactNode;
  /** Primary right-side action button (e.g. `+ Create New Rule`). */
  primaryAction?: React.ReactNode;
  /** Secondary right-side actions before `primaryAction`. */
  extraActions?: React.ReactNode;
  /** Number of selected rows to trigger the batch selection strip. */
  selectedCount?: number;
  /** Batch actions displayed inside the selection strip when `selectedCount > 0`. */
  batchActions?: React.ReactNode;
  /** Callback to clear row selection. */
  onClearSelection?: () => void;
  /** Props forwarded to the underlying `<STable>`. */
  tableProps: STableProps<T>;
  /** Adds right padding (`pr-9`) on top header/toolbar rows to clear `<SEmulatorShell>`'s `<||` handle. Default `true`. */
  clearQuickDrawer?: boolean;
  className?: string;
}

/**
 * Reusable Omada Controller list + toolbar block combining optional underline tabs,
 * search/filter toolbar, `<||` quick-drawer clearance, batch selection strip, and `<STable>`.
 */
export function SFilterTableBlock<T extends object>({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  primaryAction,
  extraActions,
  selectedCount,
  batchActions,
  onClearSelection,
  tableProps,
  clearQuickDrawer = true,
  className = '',
}: SFilterTableBlockProps<T>) {
  const clearanceClass = clearQuickDrawer ? 'pr-9' : '';
  const mergedToolbar =
    tableProps.toolbar ??
    (searchPlaceholder !== undefined ||
    onSearchChange ||
    filters ||
    extraActions ||
    primaryAction ||
    selectedCount !== undefined
      ? {
          searchPlaceholder,
          searchValue,
          onSearchChange,
          filters,
          selectedCount,
          batchActions,
          onClearSelection,
          actions:
            extraActions || primaryAction ? (
              <div className="flex flex-wrap items-center gap-2">
                {extraActions}
                {primaryAction}
              </div>
            ) : undefined,
        }
      : undefined);

  const hasSimpleTopRow = Boolean((title || subtitle) && !mergedToolbar);

  return (
    <div className={`omada-filter-table-block ${className}`.trim()}>
      {tabs && tabs.length > 0 && (
        <div
          className={`mb-4 flex items-center justify-between border-b border-[var(--omada-border-divider)] ${clearanceClass}`.trim()}
        >
          <div role="tablist" className="flex items-center gap-8">
            {tabs.map((tab) => {
              const isActive = tab.key === (activeTab ?? tabs[0].key);
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange?.(tab.key)}
                  className={`omada-cfg-subtab-btn cursor-pointer pb-2.5 text-[18px] leading-[26px] ${
                    isActive ? 'is-active font-medium' : 'font-normal'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="omada-cfg-subtab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {title && mergedToolbar && (
        <div className={`mb-2 flex flex-wrap items-center gap-3 ${clearanceClass}`.trim()}>
          <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[13px] text-[var(--omada-text-tertiary)]">{subtitle}</span>
          )}
        </div>
      )}

      {hasSimpleTopRow && (
        <div
          className={`mb-3 flex flex-wrap items-center justify-between gap-3 ${clearanceClass}`.trim()}
        >
          <div className="flex flex-wrap items-center gap-3">
            {title && (
              <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <span className="text-[13px] text-[var(--omada-text-tertiary)]">{subtitle}</span>
            )}
          </div>
          {(extraActions || primaryAction) && (
            <div className="flex flex-wrap items-center gap-2">
              {extraActions}
              {primaryAction}
            </div>
          )}
        </div>
      )}

      <div className={mergedToolbar ? `omada-filter-table-toolbar-wrap ${clearanceClass}`.trim() : ''}>
        <STable<T>
          {...tableProps}
          toolbar={mergedToolbar}
        />
      </div>
    </div>
  );
}
