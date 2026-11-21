import React, { useMemo, useState } from 'react';
import { Dropdown, type DropdownProps, type MenuProps } from 'antd';
import { Check, Search } from 'lucide-react';

export type SDropdownWidthPreset = 'compact' | 'default' | 'wide';
export type SDropdownPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

export type SDropdownItem = NonNullable<MenuProps['items']>[number];

export interface SDropdownProps
  extends Omit<
    DropdownProps,
    | 'dropdownRender'
    | 'destroyPopupOnHide'
    | 'overlayClassName'
    | 'overlayStyle'
    | 'placement'
  > {
  /** Convenience menu items array when not passing a full `menu` object. */
  items?: SDropdownItem[];
  /** Selected item keys highlighted with brand tint and check indicator. */
  selectedKeys?: string[];
  /** Convenience click handler invoked with the clicked menu item key. */
  onSelect?: (key: string) => void;
  /** Enables check indicator rendering on selected items. */
  selectable?: boolean;
  /** Width preset matching Figma `3:64442` (`compact`: 178px, `default`: 216px, `wide`: 275px). */
  widthPreset?: SDropdownWidthPreset;
  /** Explicit popup menu width override. */
  menuWidth?: number | string;
  /** Displays a search input at the top of the dropdown panel. */
  searchable?: boolean;
  /** Placeholder for the dropdown search input. */
  searchPlaceholder?: string;
  /** Optional header element rendered above the menu list. */
  header?: React.ReactNode;
  /** Optional footer element rendered below the menu list. */
  footer?: React.ReactNode;
  /** Popup placement (uses AntD 6 non-deprecated placement tokens). */
  placement?: SDropdownPlacement;
}

const WIDTH_PRESETS: Record<SDropdownWidthPreset, number> = {
  compact: 178,
  default: 216,
  wide: 275,
};

function extractSearchText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractSearchText).join(' ');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractSearchText(node.props.children);
  }
  return '';
}

function filterMenuItems(
  items: MenuProps['items'] | undefined,
  query: string,
): MenuProps['items'] {
  if (!items) return undefined;
  const q = query.trim().toLowerCase();
  if (!q) return items;

  const result: NonNullable<MenuProps['items']> = [];

  for (const item of items) {
    if (!item || item.type === 'divider') {
      continue;
    }

    if ('children' in item && Array.isArray(item.children)) {
      const labelText = extractSearchText(item.label).toLowerCase();
      if (labelText.includes(q)) {
        result.push(item);
        continue;
      }
      const filteredChildren = filterMenuItems(item.children, q);
      if (filteredChildren && filteredChildren.length > 0) {
        result.push({
          ...item,
          children: filteredChildren,
        } as SDropdownItem);
      }
      continue;
    }

    const text = [
      'label' in item ? extractSearchText(item.label) : '',
      'title' in item && typeof item.title === 'string' ? item.title : '',
    ]
      .join(' ')
      .toLowerCase();

    if (text.includes(q)) {
      result.push(item);
    }
  }

  return result;
}

function decorateSelectableItems(
  items: MenuProps['items'] | undefined,
  selectedSet: Set<string>,
  selectable: boolean,
): MenuProps['items'] {
  if (!items || !selectable) return items;

  return items.map((item) => {
    if (!item || item.type === 'divider') return item;

    if ('children' in item && Array.isArray(item.children)) {
      return {
        ...item,
        children: decorateSelectableItems(item.children, selectedSet, selectable),
      } as SDropdownItem;
    }

    const keyStr = item.key !== undefined ? String(item.key) : '';
    const isSelected = keyStr !== '' && selectedSet.has(keyStr);
    if (!isSelected) return item;

    return {
      ...item,
      label: (
        <span className="flex w-full items-center justify-between gap-2">
          <span className="truncate">{'label' in item ? item.label : null}</span>
          <Check size={14} className="shrink-0 text-[var(--omada-brand-text)]" />
        </span>
      ),
    } as SDropdownItem;
  });
}

/**
 * Omada Dropdown Menu (`3:64442`):
 * - AntD 6 `popupRender` + `destroyOnHidden` + semantic `classNames`/`styles`
 * - Width presets (`178px`, `216px`, `275px`), grouped sections, checkable items,
 *   nested submenus, and optional built-in search & footer slots.
 */
export const SDropdown: React.FC<SDropdownProps> = ({
  menu,
  items,
  selectedKeys,
  onSelect,
  selectable = false,
  widthPreset,
  menuWidth,
  searchable = false,
  searchPlaceholder = 'Search...',
  header,
  footer,
  placement = 'bottomLeft',
  destroyOnHidden = true,
  popupRender,
  onOpenChange,
  classNames,
  styles,
  children,
  ...rest
}) => {
  const [searchValue, setSearchValue] = useState('');

  const resolvedPreset = widthPreset ?? (searchable ? 'wide' : 'default');
  const resolvedWidth = menuWidth ?? WIDTH_PRESETS[resolvedPreset];

  const mergedSelectedKeys = selectedKeys ?? menu?.selectedKeys;
  const selectedSet = useMemo(
    () => new Set((mergedSelectedKeys ?? []).map(String)),
    [mergedSelectedKeys],
  );

  const rawItems = menu?.items ?? items;

  const processedItems = useMemo(() => {
    const filtered = searchable ? filterMenuItems(rawItems, searchValue) : rawItems;
    const decorated = decorateSelectableItems(
      filtered,
      selectedSet,
      selectable || Boolean(menu?.selectable),
    );
    if (searchable && (!decorated || decorated.length === 0)) {
      return [
        {
          key: '__omada-empty-search__',
          disabled: true,
          label: (
            <span className="block py-2 text-center text-xs text-[var(--omada-text-tertiary)]">
              No matching options
            </span>
          ),
        },
      ];
    }
    return decorated;
  }, [rawItems, searchable, searchValue, selectedSet, selectable, menu?.selectable]);

  const mergedMenu: MenuProps | undefined = useMemo(() => {
    if (!menu && !items) return undefined;
    return {
      ...menu,
      items: processedItems,
      selectedKeys: mergedSelectedKeys,
      selectable: selectable || menu?.selectable,
      onClick: (info) => {
        menu?.onClick?.(info);
        onSelect?.(String(info.key));
      },
    };
  }, [menu, items, processedItems, mergedSelectedKeys, selectable, onSelect]);

  const hasCustomFrame = searchable || Boolean(header) || Boolean(footer) || Boolean(popupRender);

  const handleOpenChange: DropdownProps['onOpenChange'] = (open, info) => {
    if (!open && searchValue) {
      setSearchValue('');
    }
    onOpenChange?.(open, info);
  };

  const resolvedPopupRender: DropdownProps['popupRender'] = hasCustomFrame
    ? (originNode) => {
        const content = (
          <div className="omada-dropdown-panel" style={{ width: resolvedWidth }}>
            {header && (
              <div className="border-b border-[var(--omada-border-divider)] px-3 py-2 text-xs font-semibold text-[var(--omada-text-secondary)]">
                {header}
              </div>
            )}
            {searchable && (
              <div className="border-b border-[var(--omada-border-divider)] p-2">
                <div className="flex h-8 items-center gap-1.5 rounded border border-transparent bg-[var(--omada-bg-field)] px-2.5 focus-within:border-[var(--omada-border-focus)]">
                  <Search size={14} className="shrink-0 text-[var(--omada-text-tertiary)]" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="w-full bg-transparent text-xs text-[var(--omada-text-primary)] placeholder:text-[var(--omada-text-tertiary)] focus:outline-none"
                  />
                </div>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto p-1">{originNode}</div>
            {footer && (
              <div className="border-t border-[var(--omada-border-divider)] px-3 py-2">
                {footer}
              </div>
            )}
          </div>
        );

        return popupRender ? popupRender(content) : content;
      }
    : undefined;

  const resolvedClassNames: DropdownProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const res = classNames(info);
          return {
            ...res,
            root: `omada-dropdown-root ${res?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-dropdown-root ${classNames?.root ?? ''}`.trim(),
        };

  const resolvedStyles: DropdownProps['styles'] =
    typeof styles === 'function'
      ? (info) => {
          const res = styles(info);
          return {
            ...res,
            menu: {
              minWidth: hasCustomFrame ? undefined : resolvedWidth,
              ...res?.menu,
            },
          };
        }
      : {
          ...styles,
          menu: {
            minWidth: hasCustomFrame ? undefined : resolvedWidth,
            ...styles?.menu,
          },
        };

  return (
    <Dropdown
      menu={mergedMenu}
      placement={placement}
      destroyOnHidden={destroyOnHidden}
      popupRender={resolvedPopupRender}
      onOpenChange={handleOpenChange}
      classNames={resolvedClassNames}
      styles={resolvedStyles}
      {...rest}
    >
      {children}
    </Dropdown>
  );
};
