import React, { useMemo } from 'react';
import { Breadcrumb, Tooltip, type BreadcrumbProps } from 'antd';
import type { ItemType as AntdBreadcrumbItem } from 'antd/es/breadcrumb/Breadcrumb';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

export interface SBreadcrumbItem {
  key?: React.Key;
  /** Display label for this breadcrumb node. */
  title?: React.ReactNode;
  /** Convenience alias for `title`. */
  label?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Render only the icon inside the breadcrumb item while keeping `tooltip` / `ariaLabel` accessible. */
  iconOnly?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
  menu?: AntdBreadcrumbItem['menu'];
  tooltip?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface SBreadcrumbProps
  extends Omit<BreadcrumbProps, 'items' | 'routes' | 'children'> {
  /** Breadcrumb hierarchy items (AntD 6 `items` API). */
  items: SBreadcrumbItem[];
  /** Built-in separator glyph when `separator` prop is omitted. */
  separatorVariant?: 'chevron' | 'slash';
  /** Maximum visible items before middle ancestors collapse into a `...` dropdown menu. */
  maxItems?: number;
  /** Optional pixel width cap on item text triggering ellipsis truncation + hover Tooltip. */
  maxItemWidth?: number;
}

function buildCollapsedDropdownItem(hiddenItems: SBreadcrumbItem[]): AntdBreadcrumbItem {
  const keyToItem = new Map<string, SBreadcrumbItem>();
  const menuItems = hiddenItems.map((item, idx) => {
    const itemKey = String(item.key ?? `collapsed-${idx}`);
    keyToItem.set(itemKey, item);
    const text = item.title ?? item.label;
    return {
      key: itemKey,
      label: item.href ? <a href={item.href}>{text}</a> : <span>{text}</span>,
    };
  });

  return {
    key: '__omada-breadcrumb-collapsed__',
    title: (
      <span
        aria-label={`Show ${hiddenItems.length} hidden levels`}
        className="inline-flex h-5 items-center rounded px-1 text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]"
      >
        <MoreHorizontal size={14} />
      </span>
    ),
    menu: {
      items: menuItems,
      onClick: (info) => {
        const target = keyToItem.get(String(info.key));
        target?.onClick?.(
          info.domEvent as unknown as React.MouseEvent<HTMLSpanElement>,
        );
      },
    },
  };
}

/**
 * Omada Breadcrumb (`35368:151120`) supporting text, icon-only, icon + text,
 * automatic middle `...` collapse dropdown for deep paths, and truncated ellipsis tooltips.
 */
export const SBreadcrumb: React.FC<SBreadcrumbProps> = ({
  items,
  separator,
  separatorVariant = 'chevron',
  maxItems,
  maxItemWidth,
  className = '',
  classNames,
  ...rest
}) => {
  const mappedItems = useMemo<AntdBreadcrumbItem[]>(() => {
    const renderNode = (item: SBreadcrumbItem, isLast: boolean): AntdBreadcrumbItem => {
      const textContent = item.title ?? item.label;
      const accessibleLabel =
        item.ariaLabel ??
        (typeof textContent === 'string' || typeof textContent === 'number'
          ? String(textContent)
          : undefined);

      const labelSpan =
        !item.iconOnly && textContent !== undefined ? (
          maxItemWidth ? (
            <Tooltip title={item.tooltip ?? textContent}>
              <span
                className="inline-block truncate align-bottom"
                style={{ maxWidth: maxItemWidth }}
              >
                {textContent}
              </span>
            </Tooltip>
          ) : (
            <span>{textContent}</span>
          )
        ) : null;

      const inner = (
        <span
          aria-label={item.iconOnly ? accessibleLabel : undefined}
          className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 ${
            !isLast && (item.onClick || item.href)
              ? 'cursor-pointer hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]'
              : ''
          }`}
        >
          {item.icon && <span className="inline-flex shrink-0 items-center">{item.icon}</span>}
          {labelSpan}
        </span>
      );

      const nodeTitle =
        item.iconOnly && (item.tooltip ?? textContent) ? (
          <Tooltip title={item.tooltip ?? textContent}>{inner}</Tooltip>
        ) : (
          inner
        );

      return {
        key: item.key,
        href: item.href,
        onClick: item.onClick,
        menu: item.menu,
        className: item.className,
        style: item.style,
        title: nodeTitle,
      };
    };

    if (maxItems && maxItems >= 3 && items.length > maxItems) {
      const tailCount = Math.max(1, maxItems - 2);
      const head = items[0];
      const hidden = items.slice(1, items.length - tailCount);
      const tail = items.slice(items.length - tailCount);

      return [
        renderNode(head, false),
        buildCollapsedDropdownItem(hidden),
        ...tail.map((item, idx) => renderNode(item, idx === tail.length - 1)),
      ];
    }

    return items.map((item, idx) => renderNode(item, idx === items.length - 1));
  }, [items, maxItems, maxItemWidth]);

  const resolvedSeparator =
    separator ??
    (separatorVariant === 'slash' ? (
      '/'
    ) : (
      <ChevronRight size={13} className="text-[var(--omada-text-tertiary)]" />
    ));

  const resolvedClassNames: BreadcrumbProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const res = classNames(info);
          return {
            ...res,
            root: `omada-breadcrumb ${res?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-breadcrumb ${classNames?.root ?? ''}`.trim(),
        };

  return (
    <Breadcrumb
      items={mappedItems}
      separator={resolvedSeparator}
      className={className}
      classNames={resolvedClassNames}
      {...rest}
    />
  );
};
