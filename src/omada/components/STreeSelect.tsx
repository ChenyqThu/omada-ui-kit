import React, { useState } from 'react';
import { Input, TreeSelect, type RefSelectProps, type TreeSelectProps } from 'antd';
import { SIcon } from '../assets/SIcon';
import { SCustomTag } from './STag';

type TreeSelectDataNode = NonNullable<TreeSelectProps['treeData']>[number];

export type STreeSelectNode = TreeSelectDataNode;

export interface STreeSelectProps<
  ValueType = unknown,
  OptionType extends TreeSelectDataNode = TreeSelectDataNode,
> extends TreeSelectProps<ValueType, OptionType> {
  /** Renders a dedicated filled search bar inside the dropdown popup header. */
  popupSearch?: boolean;
  /** Placeholder text for the popup search input when `popupSearch` is enabled. */
  searchPlaceholder?: string;
  /** Ref forwarded to the underlying AntD 6 TreeSelect instance. */
  ref?: React.Ref<RefSelectProps>;
}

/**
 * Omada TreeSelect control defaulting to `variant="filled"`, supporting single selection,
 * checkable / multi-select trees with removable Omada tags, and inline or popup search filtering.
 */
export function STreeSelect<
  ValueType = unknown,
  OptionType extends TreeSelectDataNode = TreeSelectDataNode,
>({
  variant = 'filled',
  listHeight = 256,
  treeCheckable,
  multiple,
  showSearch,
  popupSearch = false,
  searchPlaceholder = 'Search',
  popupRender,
  tagRender,
  fieldNames,
  className = '',
  classNames,
  styles,
  ref,
  ...rest
}: STreeSelectProps<ValueType, OptionType>) {
  const [popupSearchValue, setPopupSearchValue] = useState('');
  const isMulti = Boolean(treeCheckable || multiple);

  const labelField = (fieldNames?.label as string | undefined) ?? 'title';
  const valueField = (fieldNames?.value as string | undefined) ?? 'value';

  const defaultFilterTreeNode = (input: string, treeNode: TreeSelectDataNode) => {
    const q = input.trim().toLowerCase();
    if (!q) return true;
    const record = treeNode as Record<string, unknown>;
    const candidates = [
      record[labelField],
      record.title,
      record.label,
      record[valueField],
    ];
    return candidates.some(
      (item) =>
        (typeof item === 'string' || typeof item === 'number') &&
        String(item).toLowerCase().includes(q),
    );
  };

  const userSearchConfig =
    typeof showSearch === 'object' && showSearch !== null ? showSearch : {};

  const activeSearchValue =
    popupSearch && userSearchConfig.searchValue === undefined
      ? popupSearchValue
      : userSearchConfig.searchValue;

  const resolvedShowSearch: TreeSelectProps<ValueType, OptionType>['showSearch'] =
    popupSearch || showSearch
      ? {
          ...userSearchConfig,
          ...(popupSearch
            ? {
                searchValue: activeSearchValue,
                onSearch: (val: string) => {
                  setPopupSearchValue(val);
                  userSearchConfig.onSearch?.(val);
                },
              }
            : {}),
          ...(userSearchConfig.filterTreeNode === undefined &&
          userSearchConfig.treeNodeFilterProp === undefined
            ? { filterTreeNode: defaultFilterTreeNode }
            : {}),
        }
      : showSearch;

  const defaultTagRender: NonNullable<
    TreeSelectProps<ValueType, OptionType>['tagRender']
  > = ({ label, closable, onClose, isMaxTag }) => {
    const canClose = Boolean(closable && !isMaxTag);
    return (
      <span
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="inline-flex max-w-full items-center py-[1px] pe-1"
      >
        <SCustomTag
          closable={canClose}
          onClose={() => onClose()}
          className={
            variant === 'filled'
              ? '!h-[22px] border border-[var(--omada-border-divider)] !bg-[var(--omada-bg-surface)]'
              : '!h-[22px]'
          }
        >
          {label}
        </SCustomTag>
      </span>
    );
  };

  const resolvedPopupRender: TreeSelectProps<ValueType, OptionType>['popupRender'] =
    popupSearch || popupRender
      ? (menu) => {
          const renderedMenu = popupRender ? popupRender(menu) : menu;
          if (!popupSearch) return renderedMenu;
          return (
            <div>
              <div
                className="mb-1.5 px-1 pt-0.5"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  variant="filled"
                  size="small"
                  allowClear
                  value={activeSearchValue ?? ''}
                  placeholder={searchPlaceholder}
                  prefix={
                    <SIcon
                      name="input-search"
                      size={13}
                      className="text-[var(--omada-text-tertiary)]"
                    />
                  }
                  onChange={(e) => {
                    const next = e.target.value;
                    setPopupSearchValue(next);
                    userSearchConfig.onSearch?.(next);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="omada-input"
                />
              </div>
              {renderedMenu}
            </div>
          );
        }
      : undefined;

  const resolvedClassNames: TreeSelectProps<ValueType, OptionType>['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const user = classNames(info);
          return {
            ...user,
            popup: {
              ...user?.popup,
              root: `omada-tree-select-popup ${user?.popup?.root ?? ''}`.trim(),
            },
          };
        }
      : {
          ...classNames,
          popup: {
            ...classNames?.popup,
            root: `omada-tree-select-popup ${classNames?.popup?.root ?? ''}`.trim(),
          },
        };

  return (
    <TreeSelect<ValueType, OptionType>
      ref={ref}
      variant={variant}
      listHeight={listHeight}
      treeCheckable={treeCheckable}
      multiple={multiple}
      showSearch={resolvedShowSearch}
      fieldNames={fieldNames}
      popupRender={resolvedPopupRender}
      tagRender={isMulti ? (tagRender ?? defaultTagRender) : tagRender}
      className={`omada-tree-select ${className}`.trim()}
      classNames={resolvedClassNames}
      styles={styles}
      {...rest}
    />
  );
}

STreeSelect.TreeNode = TreeSelect.TreeNode;
STreeSelect.SHOW_ALL = TreeSelect.SHOW_ALL;
STreeSelect.SHOW_PARENT = TreeSelect.SHOW_PARENT;
STreeSelect.SHOW_CHILD = TreeSelect.SHOW_CHILD;
