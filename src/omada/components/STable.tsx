import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Checkbox,
  Pagination,
  Popover,
  Select,
  Table,
  type TablePaginationConfig,
  type TableProps,
} from 'antd';
import type { ColumnGroupType, ColumnType, ColumnsType } from 'antd/es/table';
import {
  Check,
  ChevronRight,
  Columns3,
  Pencil,
  Rows3,
  Rows4,
  X,
} from 'lucide-react';
import { SButton } from './SButton';
import { SInput, SNumberInput, SSearchInput } from './SInput';

export type STableDensity = 'compact' | 'default';

export interface STableColumnSettingItem {
  key: string;
  label: React.ReactNode;
  visible: boolean;
  disabled?: boolean;
}

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
  /** Show a column visibility checklist popover button in the toolbar. */
  columnSettings?: boolean;
  /** Show a `'default' | 'compact'` row density switcher in the toolbar. */
  densityToggle?: boolean;
  /** Controlled table density (`'default' | 'compact'`). */
  density?: STableDensity;
  /** Initial uncontrolled density when `densityToggle` is enabled. */
  defaultDensity?: STableDensity;
  /** Callback invoked when density changes via `densityToggle`. */
  onDensityChange?: (density: STableDensity) => void;
}

function getColumnKey<T>(col: ColumnType<T> | ColumnGroupType<T>, index: number): string {
  if (col.key !== undefined && col.key !== null) {
    return String(col.key);
  }
  if ('dataIndex' in col && col.dataIndex !== undefined) {
    return Array.isArray(col.dataIndex)
      ? col.dataIndex.map(String).join('.')
      : String(col.dataIndex);
  }
  return `__col_${index}`;
}

function getColumnTitleText<T>(col: ColumnType<T> | ColumnGroupType<T>, fallbackKey: string): React.ReactNode {
  if (typeof col.title === 'function') {
    return fallbackKey;
  }
  return col.title ?? fallbackKey;
}

/**
 * Omada Data Table wrapping AntD `Table` with an integrated toolbar (tabs, search,
 * filters, column settings popover, density toggle, slide-in batch action bar),
 * expandable row styling, and Omada's `Showing X-Y of Z records` footer.
 */
export function STable<T extends object>({
  toolbar,
  pagination,
  dataSource = [],
  columns,
  expandable,
  components,
  columnSettings = false,
  densityToggle = false,
  density,
  defaultDensity = 'default',
  onDensityChange,
  size,
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
  const [innerDensity, setInnerDensity] = useState<STableDensity>(defaultDensity);
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<string[]>(() => {
    if (!columns) return [];
    return columns
      .map((col, idx) => ({ col, key: getColumnKey(col, idx) }))
      .filter(({ col }) => Boolean((col as ColumnType<T>).hidden))
      .map(({ key }) => key);
  });

  const activeDensity = density ?? innerDensity;

  const handleDensityChange = (nextDensity: STableDensity) => {
    if (density === undefined) {
      setInnerDensity(nextDensity);
    }
    onDensityChange?.(nextDensity);
  };

  const columnEntries = useMemo(() => {
    if (!columns) return [];
    return columns.map((col, idx) => {
      const key = getColumnKey(col, idx);
      return {
        key,
        label: getColumnTitleText(col, key),
        col,
      };
    });
  }, [columns]);

  const visibleColumns = useMemo<ColumnsType<T> | undefined>(() => {
    if (!columns) return undefined;
    if (!columnSettings || hiddenColumnKeys.length === 0) {
      return columns;
    }
    const hiddenSet = new Set(hiddenColumnKeys);
    return columns.filter((col, idx) => !hiddenSet.has(getColumnKey(col, idx)));
  }, [columns, columnSettings, hiddenColumnKeys]);

  const visibleColumnCount = visibleColumns?.length ?? columnEntries.length;

  const toggleColumnVisibility = (key: string) => {
    setHiddenColumnKeys((prev) => {
      const isHidden = prev.includes(key);
      if (isHidden) {
        return prev.filter((item) => item !== key);
      }
      if (visibleColumnCount <= 1) {
        return prev;
      }
      return [...prev, key];
    });
  };

  const resetColumnVisibility = () => {
    setHiddenColumnKeys([]);
  };

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
  const showToolbar = Boolean(toolbar || columnSettings || densityToggle);

  const resolvedComponents = useMemo<TableProps<T>['components']>(() => {
    if (!expandable || expandable.expandIcon || components?.ExpandIcon) {
      return components;
    }
    const OmadaExpandIcon: NonNullable<TableProps<T>['components']>['ExpandIcon'] = ({
      expanded,
      onClick,
      expandable: rowCanExpand,
      type,
    }) => {
      if (!rowCanExpand) {
        return <span className="inline-block h-6 w-6" aria-hidden="true" />;
      }
      const label =
        type === 'all'
          ? expanded
            ? 'Collapse all rows'
            : 'Expand all rows'
          : expanded
            ? 'Collapse row'
            : 'Expand row';
      return (
        <button
          type="button"
          aria-label={label}
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation();
            onClick(e);
          }}
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-transparent text-[var(--omada-text-secondary)] transition-all hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-brand-text)]"
        >
          <ChevronRight
            size={14}
            className={`transition-transform duration-150 ${expanded ? 'rotate-90 text-[var(--omada-brand-text)]' : ''}`}
          />
        </button>
      );
    };
    return {
      ...components,
      ExpandIcon: OmadaExpandIcon,
    };
  }, [expandable, components]);

  const columnSettingsPopoverContent = (
    <div className="w-[220px]">
      <div className="mb-2 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Visible Columns
        </span>
        <button
          type="button"
          onClick={resetColumnVisibility}
          disabled={hiddenColumnKeys.length === 0}
          className="cursor-pointer text-xs text-[var(--omada-link)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
      </div>
      <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
        {columnEntries.map(({ key, label }) => {
          const checked = !hiddenColumnKeys.includes(key);
          const disableUncheck = checked && visibleColumnCount <= 1;
          return (
            <label
              key={key}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors hover:bg-[var(--omada-bg-field)] ${
                disableUncheck ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              <Checkbox
                checked={checked}
                disabled={disableUncheck}
                onChange={() => toggleColumnVisibility(key)}
              />
              <span className="truncate text-[var(--omada-text-primary)]">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const tableClassName = [
    'omada-table',
    activeDensity === 'compact' ? 'omada-table-compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`overflow-hidden rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] ${className}`.trim()}
    >
      {showToolbar && (
        <div className="border-b border-[var(--omada-border-divider)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {toolbar?.tabs}
              {toolbar?.onSearchChange && (
                <SSearchInput
                  placeholder={toolbar.searchPlaceholder ?? 'Search'}
                  value={toolbar.searchValue}
                  onChange={(e) => toolbar.onSearchChange?.(e.target.value)}
                />
              )}
              {toolbar?.filters}
            </div>
            {(toolbar?.actions || densityToggle || columnSettings) && (
              <div className="flex flex-wrap items-center gap-2">
                {toolbar?.actions}
                {densityToggle && (
                  <div
                    role="group"
                    aria-label="Table density"
                    className="inline-flex h-8 items-center rounded bg-[var(--omada-bg-field)] p-0.5"
                  >
                    <button
                      type="button"
                      aria-label="Default density"
                      aria-pressed={activeDensity === 'default'}
                      onClick={() => handleDensityChange('default')}
                      className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-[2px] px-2 text-xs font-medium transition-colors ${
                        activeDensity === 'default'
                          ? 'bg-[var(--omada-bg-surface)] text-[var(--omada-text-primary)] shadow-2xs'
                          : 'text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                      }`}
                    >
                      <Rows3 size={13} />
                      <span>Default</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Compact density"
                      aria-pressed={activeDensity === 'compact'}
                      onClick={() => handleDensityChange('compact')}
                      className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-[2px] px-2 text-xs font-medium transition-colors ${
                        activeDensity === 'compact'
                          ? 'bg-[var(--omada-bg-surface)] text-[var(--omada-text-primary)] shadow-2xs'
                          : 'text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                      }`}
                    >
                      <Rows4 size={13} />
                      <span>Compact</span>
                    </button>
                  </div>
                )}
                {columnSettings && columnEntries.length > 0 && (
                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    content={columnSettingsPopoverContent}
                    styles={{ container: { padding: 12 } }}
                  >
                    <SButton
                      variant="secondary"
                      icon={<Columns3 size={14} />}
                      aria-label="Column settings"
                    >
                      Columns
                    </SButton>
                  </Popover>
                )}
              </div>
            )}
          </div>

          {hasSelected && toolbar?.batchActions && (
            <div className="mt-2.5 flex min-h-12 flex-wrap items-center justify-between gap-4 rounded-[10px] border border-[var(--omada-brand)]/20 bg-[var(--omada-brand-bg-subtlest)] px-4 py-2">
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--omada-text-primary)]">
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
              <div className="flex flex-wrap items-center gap-2">{toolbar.batchActions}</div>
            </div>
          )}
        </div>
      )}

      <Table<T>
        {...rest}
        columns={visibleColumns}
        dataSource={visibleData}
        expandable={expandable}
        components={resolvedComponents}
        size={activeDensity === 'compact' ? 'small' : size}
        pagination={false}
        className={tableClassName}
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
            pageSizeOptions={pagination?.pageSizeOptions ?? [10, 20, 50, 100]}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export interface SEditableCellOption {
  label: React.ReactNode;
  value: string | number;
}

export interface SEditableCellProps<V extends string | number = string> {
  /** Current committed cell value (or live value in controlled batch mode). */
  value: V;
  /** Invoked when the user commits an edit in single-cell mode (Enter, Save button, or blur). */
  onSave?: (nextValue: V) => void | Promise<void>;
  /** Immediate change callback for controlled / batch row editing. */
  onChange?: (nextValue: V) => void;
  /** Controlled editing state (set `true` on all cells in a row for batch editing). */
  editing?: boolean;
  /** Initial uncontrolled editing state. */
  defaultEditing?: boolean;
  /** Notifies when single-cell editing starts or exits. */
  onEditingChange?: (editing: boolean) => void;
  /** Input control variant rendered during edit mode. */
  type?: 'text' | 'number' | 'select';
  /** Select options when `type="select"`. */
  options?: SEditableCellOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Render explicit Save / Cancel icon buttons next to the input (defaults to `true` when `editing` is uncontrolled). */
  showActions?: boolean;
  /** Commit on blur instead of requiring explicit Enter / Save click. */
  saveOnBlur?: boolean;
  /** Optional synchronous validator returning an error message string. */
  validate?: (value: V) => string | null | undefined;
  /** Custom display renderer when not editing. */
  renderDisplay?: (value: V) => React.ReactNode;
  /** Optional width constraint for the inline editor (e.g. `254`). */
  inputWidth?: number | string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Compact `28px`-high inline editable table cell supporting both single-cell click-to-edit
 * (Enter/Save/Cancel) and controlled `editing` mode for batch row editing.
 */
export function SEditableCell<V extends string | number = string>({
  value,
  onSave,
  onChange,
  editing,
  defaultEditing = false,
  onEditingChange,
  type = 'text',
  options = [],
  placeholder = 'Enter value',
  disabled = false,
  showActions,
  saveOnBlur = false,
  validate,
  renderDisplay,
  inputWidth,
  ariaLabel = 'Edit cell',
  className = '',
}: SEditableCellProps<V>) {
  const isControlledEditing = editing !== undefined;
  const [innerEditing, setInnerEditing] = useState(defaultEditing);
  const isEditing = isControlledEditing ? editing : innerEditing;

  const [draft, setDraft] = useState<V>(value);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft(value);
    setErrorMsg(null);
  }, [value, isEditing]);

  const setEditingState = (next: boolean) => {
    if (!isControlledEditing) {
      setInnerEditing(next);
    }
    onEditingChange?.(next);
  };

  const enterEdit = () => {
    if (disabled) return;
    setDraft(value);
    setErrorMsg(null);
    setEditingState(true);
  };

  const handleCancel = () => {
    setDraft(value);
    setErrorMsg(null);
    setEditingState(false);
  };

  const handleCommit = async (nextVal: V = draft) => {
    if (validate) {
      const err = validate(nextVal);
      if (err) {
        setErrorMsg(err);
        return;
      }
    }
    setErrorMsg(null);
    if (onSave) {
      try {
        setSaving(true);
        await onSave(nextVal);
      } finally {
        setSaving(false);
      }
    }
    if (!isControlledEditing) {
      setEditingState(false);
    }
  };

  const handleDraftUpdate = (nextVal: V) => {
    setDraft(nextVal);
    if (validate) {
      setErrorMsg(validate(nextVal) ?? null);
    } else {
      setErrorMsg(null);
    }
    onChange?.(nextVal);
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    if (!saveOnBlur || isControlledEditing) return;
    const related = e.relatedTarget as Node | null;
    if (related && containerRef.current?.contains(related)) return;
    void handleCommit(draft);
  };

  const resolvedShowActions = showActions ?? !isControlledEditing;

  if (!isEditing) {
    const displayContent = renderDisplay
      ? renderDisplay(value)
      : type === 'select'
        ? (options.find((opt) => opt.value === value)?.label ?? String(value))
        : String(value);

    return (
      <div className={`group inline-flex min-h-7 max-w-full items-center gap-1.5 ${className}`.trim()}>
        <span className="truncate text-[13px] text-[var(--omada-text-primary)]">
          {displayContent || (
            <span className="text-[var(--omada-text-tertiary)]">{placeholder}</span>
          )}
        </span>
        {!disabled && (
          <button
            type="button"
            aria-label={ariaLabel}
            onClick={enterEdit}
            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-[var(--omada-text-tertiary)] opacity-70 transition-all hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-brand-text)] group-hover:opacity-100"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onBlur={handleBlur}
      className={`inline-flex flex-col gap-1 ${className}`.trim()}
      style={{ width: inputWidth ?? '100%', maxWidth: '100%' }}
    >
      <div className="flex items-center gap-1">
        {type === 'select' ? (
          <Select
            size="small"
            variant="filled"
            value={draft}
            disabled={disabled || saving}
            status={errorMsg ? 'error' : undefined}
            options={options}
            onChange={(val) => handleDraftUpdate(val as V)}
            className="min-w-[110px] flex-1"
            style={{ height: 28 }}
          />
        ) : type === 'number' ? (
          <SNumberInput
            size="small"
            value={typeof draft === 'number' ? draft : Number(draft)}
            disabled={disabled || saving}
            status={errorMsg ? 'error' : undefined}
            placeholder={placeholder}
            onChange={(val) => {
              if (val !== null) {
                handleDraftUpdate(val as V);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleCommit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
            className="flex-1"
            style={{ height: 28 }}
          />
        ) : (
          <SInput
            size="small"
            value={String(draft)}
            disabled={disabled || saving}
            status={errorMsg ? 'error' : undefined}
            placeholder={placeholder}
            autoFocus={!isControlledEditing}
            onChange={(e) => handleDraftUpdate(e.target.value as V)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleCommit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
            className="h-7 flex-1 text-[13px]"
          />
        )}

        {resolvedShowActions && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="Save cell"
              disabled={saving}
              onClick={() => void handleCommit()}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--omada-brand)] text-white transition-colors hover:bg-[var(--omada-brand-hover)] disabled:opacity-50"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              aria-label="Cancel edit"
              disabled={saving}
              onClick={handleCancel}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[var(--omada-bg-field)] text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)] disabled:opacity-50"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
      {errorMsg && (
        <span className="text-[11px] leading-tight text-[var(--omada-color-error)]">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
