import React, { useMemo, useState } from 'react';
import { Pagination, Table, type TablePaginationConfig, type TableProps } from 'antd';
import { SSearchInput } from './SInput';

export interface STableToolbarProps {
  tabs?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  selectedCount?: number;
  batchActions?: React.ReactNode;
  onClearSelection?: () => void;
}

export interface STableProps<T extends object>
  extends Omit<TableProps<T>, 'pagination'> {
  toolbar?: STableToolbarProps;
  pagination?: false | TablePaginationConfig;
}

/**
 * Omada Data Table wrapping AntD `Table` with an integrated toolbar (tabs, search,
 * filters, slide-in batch action bar) and Omada's `Showing X-Y of Z records` footer.
 */
export function STable<T extends object>({
  toolbar,
  pagination,
  dataSource = [],
  className = '',
  ...rest
}: STableProps<T>) {
  const isControlledCurrent =
    typeof pagination === 'object' && pagination.current !== undefined;
  const isControlledSize =
    typeof pagination === 'object' && pagination.pageSize !== undefined;

  const [innerPage, setInnerPage] = useState(
    typeof pagination === 'object' && pagination.defaultCurrent
      ? pagination.defaultCurrent
      : 1,
  );
  const [innerSize, setInnerSize] = useState(
    typeof pagination === 'object' && pagination.defaultPageSize
      ? pagination.defaultPageSize
      : 10,
  );

  const pageSize =
    typeof pagination === 'object'
      ? (pagination.pageSize ?? innerSize)
      : 10;
  const current =
    typeof pagination === 'object'
      ? (pagination.current ?? innerPage)
      : 1;
  const total =
    typeof pagination === 'object'
      ? (pagination.total ?? dataSource.length)
      : dataSource.length;

  const visibleData = useMemo(() => {
    if (pagination === false) return dataSource;
    if (dataSource.length <= pageSize && total > dataSource.length) {
      return dataSource;
    }
    const start = (current - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  }, [pagination, dataSource, current, pageSize, total]);

  const handlePageChange = (nextPage: number, nextSize: number) => {
    if (!isControlledCurrent) {
      setInnerPage(nextSize !== pageSize ? 1 : nextPage);
    }
    if (!isControlledSize && nextSize !== pageSize) {
      setInnerSize(nextSize);
    }
    if (typeof pagination === 'object') {
      pagination.onChange?.(nextPage, nextSize);
    }
  };

  const startIdx = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const endIdx = Math.min(current * pageSize, total);
  const hasSelected = (toolbar?.selectedCount ?? 0) > 0;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] ${className}`.trim()}
    >
      {toolbar && (
        <div className="border-b border-[var(--omada-border-divider)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {toolbar.tabs}
              {toolbar.onSearchChange && (
                <SSearchInput
                  placeholder={toolbar.searchPlaceholder ?? 'Search'}
                  value={toolbar.searchValue}
                  onChange={(e) => toolbar.onSearchChange?.(e.target.value)}
                />
              )}
              {toolbar.filters}
            </div>
            {toolbar.actions && (
              <div className="flex flex-wrap items-center gap-2">
                {toolbar.actions}
              </div>
            )}
          </div>

          {hasSelected && toolbar.batchActions && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded bg-[var(--omada-brand-bg-subtlest)] px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--omada-text-primary)]">
                <span>
                  <strong className="text-[var(--omada-brand-text)]">
                    {toolbar.selectedCount}
                  </strong>{' '}
                  item{toolbar.selectedCount === 1 ? '' : 's'} selected
                </span>
                {toolbar.onClearSelection && (
                  <button
                    type="button"
                    onClick={toolbar.onClearSelection}
                    className="cursor-pointer text-[var(--omada-link)] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">{toolbar.batchActions}</div>
            </div>
          )}
        </div>
      )}

      <Table<T>
        {...rest}
        dataSource={visibleData}
        pagination={false}
        className="omada-table"
      />

      {pagination !== false && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--omada-border-divider)] px-4 py-3">
          <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
            Showing {startIdx}–{endIdx} of {total} records
          </span>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            showSizeChanger={pagination?.showSizeChanger ?? true}
            pageSizeOptions={pagination?.pageSizeOptions ?? ['10', '20', '50', '100']}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
