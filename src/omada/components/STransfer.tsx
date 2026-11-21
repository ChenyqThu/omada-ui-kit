import React, { useMemo, useState } from 'react';
import { Checkbox, Transfer, type TransferProps } from 'antd';
import type { TransferKey } from 'antd/es/transfer/interface';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import { SButton } from './SButton';
import { SEmpty } from './SEmpty';

export interface STransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  /** Group identifier for 2-level grouped tree mode (`grouped={true}`). */
  group?: string;
  /** Display label for the group header in `grouped` mode. */
  groupTitle?: string;
  /** Optional nested children (automatically flattened into 2-level grouped items). */
  children?: STransferItem[];
  [key: string]: unknown;
}

export interface STransferProps
  extends Omit<
    TransferProps<STransferItem>,
    'dataSource' | 'pagination' | 'listStyle' | 'operationStyle' | 'operations'
  > {
  dataSource: STransferItem[];
  /** Enable pagination in standard 2-column mode (`true` defaults to `{ pageSize: 8 }`). Ignored when `grouped` is true. */
  pagination?: boolean | TransferProps<STransferItem>['pagination'];
  /** Enable 2-level collapsible category/group tree mode. */
  grouped?: boolean;
  /** Render leading item icons when provided on `STransferItem.icon`. */
  showIcon?: boolean;
  /** Column width (Figma baseline: `240`). */
  listWidth?: number | string;
  /** Column height (Figma baseline: `368`). */
  listHeight?: number | string;
}

function flattenTransferItems(items: STransferItem[]): STransferItem[] {
  const result: STransferItem[] = [];
  for (const item of items) {
    if (Array.isArray(item.children) && item.children.length > 0) {
      for (const child of item.children) {
        result.push({
          ...child,
          group: child.group ?? item.key,
          groupTitle: child.groupTitle ?? item.title,
          disabled: child.disabled ?? item.disabled,
        });
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Omada dual-list Transfer supporting search, pagination, item counts (`selected/total`),
 * row icons, empty states, and 2-level collapsible grouped tree selection (`grouped`).
 */
export const STransfer: React.FC<STransferProps> = ({
  dataSource,
  titles = ['Unselected', 'Selected'],
  showSearch = true,
  pagination = false,
  grouped = false,
  showIcon = true,
  listWidth = 240,
  listHeight = 368,
  render,
  filterOption,
  selectAllLabels,
  actions,
  locale,
  className = '',
  classNames,
  styles,
  children,
  ...rest
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const normalizedData = useMemo(
    () => flattenTransferItems(dataSource),
    [dataSource],
  );

  const resolvedPagination = useMemo(() => {
    if (grouped || !pagination) return false;
    return pagination === true ? { pageSize: 8 } : pagination;
  }, [grouped, pagination]);

  const defaultFilterOption: NonNullable<TransferProps<STransferItem>['filterOption']> = (
    inputValue,
    item,
  ) => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false) ||
      (item.groupTitle?.toLowerCase().includes(q) ?? false)
    );
  };

  const defaultRender: NonNullable<TransferProps<STransferItem>['render']> = (item) => {
    if (!showIcon || !item.icon) {
      return item.description ? (
        <span className="inline-flex flex-col leading-tight">
          <span className="truncate text-[13px] text-[var(--omada-text-primary)]">
            {item.title}
          </span>
          <span className="truncate text-[11px] text-[var(--omada-text-tertiary)]">
            {item.description}
          </span>
        </span>
      ) : (
        item.title
      );
    }

    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex shrink-0 items-center text-[var(--omada-text-secondary)]">
          {item.icon}
        </span>
        <span className="min-w-0 truncate">{item.title}</span>
      </span>
    );
  };

  const defaultSelectAllLabels = useMemo<
    TransferProps<STransferItem>['selectAllLabels']
  >(
    () => [
      ({ selectedCount, totalCount }) => (
        <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
          {selectedCount}/{totalCount}
        </span>
      ),
      ({ selectedCount, totalCount }) => (
        <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
          {selectedCount}/{totalCount}
        </span>
      ),
    ],
    [],
  );

  const toggleGroup = (compositeKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [compositeKey]: !prev[compositeKey],
    }));
  };

  const groupedBodyRenderer: TransferProps<STransferItem>['children'] = ({
    direction,
    filteredItems,
    selectedKeys,
    disabled: listDisabled,
    onItemSelect,
    onItemSelectAll,
  }) => {
    if (filteredItems.length === 0) {
      return (
        <div className="flex h-full items-center justify-center px-3 py-6">
          <SEmpty
            illustration="no-data"
            illustrationWidth={92}
            title="No items"
            description={null}
            className="border-0 bg-transparent p-2"
          />
        </div>
      );
    }

    const groupsMap = new Map<
      string,
      { key: string; title: string; items: STransferItem[] }
    >();
    for (const item of filteredItems) {
      const groupKey = item.group ?? '__default__';
      const groupTitle = item.groupTitle ?? 'General';
      const existing = groupsMap.get(groupKey);
      if (existing) {
        existing.items.push(item);
      } else {
        groupsMap.set(groupKey, {
          key: groupKey,
          title: groupTitle,
          items: [item],
        });
      }
    }

    const selectedSet = new Set<TransferKey>(selectedKeys);

    return (
      <div
        role="tree"
        aria-label={`${direction === 'left' ? 'Unselected' : 'Selected'} grouped items`}
        className="h-full overflow-y-auto py-1"
      >
        {Array.from(groupsMap.values()).map((grp) => {
          const compositeKey = `${direction}:${grp.key}`;
          const isCollapsed = Boolean(collapsedGroups[compositeKey]);
          const enabledKeys = grp.items
            .filter((item) => !item.disabled)
            .map((item) => item.key);
          const allChecked =
            enabledKeys.length > 0 &&
            enabledKeys.every((key) => selectedSet.has(key));
          const someChecked =
            !allChecked && enabledKeys.some((key) => selectedSet.has(key));

          return (
            <div key={grp.key} role="treeitem" aria-expanded={!isCollapsed}>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[var(--omada-bg-field)]">
                <button
                  type="button"
                  aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${grp.title}`}
                  onClick={() => toggleGroup(compositeKey)}
                  className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-[var(--omada-text-tertiary)] hover:text-[var(--omada-text-primary)]"
                >
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  disabled={listDisabled || enabledKeys.length === 0}
                  aria-label={`Select group ${grp.title}`}
                  onChange={() => onItemSelectAll(enabledKeys, !allChecked)}
                />
                <button
                  type="button"
                  onClick={() => toggleGroup(compositeKey)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left"
                >
                  <span className="truncate text-xs font-semibold text-[var(--omada-text-primary)]">
                    {grp.title}
                  </span>
                  <span className="tabular-nums shrink-0 text-[11px] text-[var(--omada-text-tertiary)]">
                    {grp.items.length}
                  </span>
                </button>
              </div>

              {!isCollapsed && (
                <div role="group" className="space-y-0.5">
                  {grp.items.map((item) => {
                    const checked = selectedSet.has(item.key);
                    const itemDisabled = Boolean(listDisabled || item.disabled);
                    return (
                      <div
                        key={item.key}
                        role="treeitem"
                        aria-selected={checked}
                        aria-disabled={itemDisabled}
                        onClick={() => {
                          if (!itemDisabled) {
                            onItemSelect(item.key, !checked);
                          }
                        }}
                        className={`flex items-center gap-2 py-1.5 pl-8 pr-3 text-[13px] transition-colors ${
                          itemDisabled
                            ? 'cursor-not-allowed opacity-45'
                            : 'cursor-pointer hover:bg-[var(--omada-bg-field)]'
                        } ${checked ? 'bg-[var(--omada-brand-bg-subtlest)]' : ''}`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={itemDisabled}
                          tabIndex={-1}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => {
                            if (!itemDisabled) {
                              onItemSelect(item.key, !checked);
                            }
                          }}
                        />
                        {showIcon && item.icon && (
                          <span className="inline-flex shrink-0 items-center text-[var(--omada-text-secondary)]">
                            {item.icon}
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-[var(--omada-text-primary)]">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const mergedStyles: TransferProps<STransferItem>['styles'] =
    typeof styles === 'function'
      ? (info) => {
          const resolved = styles(info);
          return {
            ...resolved,
            section: {
              width: listWidth,
              height: listHeight,
              ...resolved?.section,
            },
          };
        }
      : {
          ...styles,
          section: {
            width: listWidth,
            height: listHeight,
            ...styles?.section,
          },
        };

  const mergedClassNames: TransferProps<STransferItem>['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const resolved = classNames(info);
          return {
            ...resolved,
            root: `omada-transfer ${resolved?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-transfer ${classNames?.root ?? ''}`.trim(),
        };

  return (
    <Transfer<STransferItem>
      dataSource={normalizedData}
      titles={titles}
      showSearch={showSearch}
      pagination={resolvedPagination}
      render={render ?? defaultRender}
      filterOption={filterOption ?? defaultFilterOption}
      selectAllLabels={selectAllLabels ?? defaultSelectAllLabels}
      actions={
        actions ?? [
          <SButton
            key="move-right"
            size="small"
            variant="primary"
            aria-label="Move selected right"
            icon={<SIcon name="arrow-right" size={14} />}
          />,
          <SButton
            key="move-left"
            size="small"
            variant="primary"
            aria-label="Move selected left"
            icon={<SIcon name="arrow-left" size={14} />}
          />,
        ]
      }
      locale={{
        searchPlaceholder: 'Search',
        itemUnit: 'item',
        itemsUnit: 'items',
        notFoundContent: (
          <SEmpty
            illustration="no-data"
            illustrationWidth={92}
            title="No items"
            description={null}
            className="border-0 bg-transparent p-2"
          />
        ),
        ...locale,
      }}
      className={className}
      classNames={mergedClassNames}
      styles={mergedStyles}
      {...rest}
    >
      {children ?? (grouped ? groupedBodyRenderer : undefined)}
    </Transfer>
  );
};
