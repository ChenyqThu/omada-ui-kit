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

function summarizeFilterRow<T extends object>(
  row: T,
  rowKeyProp: STableProps<T>['rowKey'],
  index: number,
): Record<string, string | number | boolean | null> {
  let rowKeyVal: string | number = index;
  if (typeof rowKeyProp === 'function') {
    rowKeyVal = String(rowKeyProp(row, index));
  } else if (typeof rowKeyProp === 'string' && rowKeyProp in row) {
    const raw = (row as Record<string, unknown>)[rowKeyProp];
    if (typeof raw === 'string' || typeof raw === 'number') rowKeyVal = raw;
  } else if ('key' in row) {
    const raw = (row as Record<string, unknown>).key;
    if (typeof raw === 'string' || typeof raw === 'number') rowKeyVal = raw;
  } else if ('id' in row) {
    const raw = (row as Record<string, unknown>).id;
    if (typeof raw === 'string' || typeof raw === 'number') rowKeyVal = raw;
  }

  const summary: Record<string, string | number | boolean | null> = {
    _rowKey: String(rowKeyVal),
  };
  let count = 0;
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    if (count >= 12) break;
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      v === null
    ) {
      summary[k] = v;
      count += 1;
    }
  }
  return summary;
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
  const rowsData = tableProps.dataSource ?? [];

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'table',
          label: typeof title === 'string' ? title : searchPlaceholder,
          value: {
            activeTab: resolvedActiveTab ?? null,
            searchValue: searchValue ?? '',
            rowCount: rowsData.length,
            selectedCount: selectedCount ?? 0,
          },
          options: tabs?.map((tab) => ({
            value: tab.key,
            label: typeof tab.label === 'string' ? tab.label : tab.key,
          })),
          meta: {
            rowCount: rowsData.length,
            selectedCount: selectedCount ?? 0,
            rows: rowsData
              .slice(0, 25)
              .map((row, idx) => summarizeFilterRow(row, tableProps.rowKey, idx)),
          },
          actions: {
            search: (query: unknown) => {
              const nextQ = String(query ?? '');
              onSearchChange?.(nextQ);
              return nextQ;
            },
            setValue: (query: unknown) => {
              const nextQ = String(query ?? '');
              onSearchChange?.(nextQ);
              return nextQ;
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
            ...(tableProps.onRow
              ? {
                  clickRow: (keyOrIdx: unknown) => {
                    const targetStr = String(keyOrIdx ?? '');
                    let foundIdx = rowsData.findIndex(
                      (row, idx) =>
                        summarizeFilterRow(row, tableProps.rowKey, idx)._rowKey ===
                        targetStr,
                    );
                    if (foundIdx < 0 && /^\d+$/.test(targetStr)) {
                      const numericIdx = Number(targetStr);
                      if (numericIdx >= 0 && numericIdx < rowsData.length) {
                        foundIdx = numericIdx;
                      }
                    }
                    if (foundIdx < 0) {
                      throw new Error(
                        `Row "${targetStr}" not found in table "${agentId}".`,
                      );
                    }
                    const record = rowsData[foundIdx];
                    tableProps.onRow?.(record, foundIdx)?.onClick?.(
                      {} as React.MouseEvent<HTMLElement>,
                    );
                    return summarizeFilterRow(record, tableProps.rowKey, foundIdx);
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
