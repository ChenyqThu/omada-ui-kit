import React from 'react';
import { useOmadaAgentControl } from '../agent';
import { STable, type STableProps } from '../components/STable';
import { STabs } from '../components/STabs';

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
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
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
  agentId,
  className = '',
}: SFilterTableBlockProps<T>) {
  const clearanceClass = clearQuickDrawer ? 'pr-9' : '';
  const resolvedActiveTab = activeTab ?? tabs?.[0]?.key;

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'table',
          label: typeof title === 'string' ? title : searchPlaceholder,
          value: {
            activeTab: resolvedActiveTab ?? null,
            searchValue: searchValue ?? '',
            rowCount: (tableProps.dataSource ?? []).length,
            selectedCount: selectedCount ?? 0,
          },
          options: tabs?.map((tab) => ({
            value: tab.key,
            label: typeof tab.label === 'string' ? tab.label : tab.key,
          })),
          meta: {
            rowCount: (tableProps.dataSource ?? []).length,
            selectedCount: selectedCount ?? 0,
          },
          actions: {
            search: (query: unknown) => {
              onSearchChange?.(String(query ?? ''));
            },
            setValue: (query: unknown) => {
              onSearchChange?.(String(query ?? ''));
            },
            clear: () => {
              onSearchChange?.('');
              return '';
            },
            ...(tabs && tabs.length > 0
              ? {
                  selectTab: (nextTab: unknown) => {
                    const target = tabs.find((t) => t.key === String(nextTab));
                    if (!target) {
                      throw new Error(`Unknown tab "${String(nextTab)}".`);
                    }
                    onTabChange?.(target.key);
                    return target.key;
                  },
                }
              : {}),
            ...(onClearSelection
              ? {
                  clearSelection: () => {
                    onClearSelection();
                  },
                }
              : {}),
          },
        }
      : null,
  );

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
        <STabs
          variant="page"
          size="lg"
          bordered
          aria-label={typeof title === 'string' ? `${title} tabs` : 'Table views'}
          items={tabs}
          activeKey={resolvedActiveTab}
          onChange={onTabChange}
          className={`mb-4 ${clearanceClass}`.trim()}
        />
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
