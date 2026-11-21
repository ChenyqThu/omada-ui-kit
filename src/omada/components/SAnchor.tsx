import React, { useMemo } from 'react';
import { Anchor, type AnchorProps } from 'antd';
import type { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';

export type SAnchorDirection = 'vertical' | 'horizontal';

export interface SAnchorItem {
  key: React.Key;
  href: string;
  title: React.ReactNode;
  target?: string;
  disabled?: boolean;
  /** Marks a section anchor as having validation errors or alerts. */
  status?: 'default' | 'error';
  /** Convenience boolean alias for `status="error"`. */
  error?: boolean;
  children?: SAnchorItem[];
  className?: string;
}

export interface SAnchorProps
  extends Omit<AnchorProps, 'items' | 'children' | 'direction'> {
  /** Anchor TOC items supporting L1 + L2 nesting (in vertical direction). */
  items: SAnchorItem[];
  /** Optional TOC rail heading rendered above the anchor list. */
  title?: React.ReactNode;
  /** Layout orientation (`vertical` right-rail TOC or `horizontal` strip). */
  direction?: SAnchorDirection;
  /** Optional controlled/highlighted active href when not relying solely on scroll spy. */
  activeHref?: string;
}

function collectDisabledHrefs(items: SAnchorItem[]): Set<string> {
  const disabled = new Set<string>();
  const visit = (list: SAnchorItem[]) => {
    for (const item of list) {
      if (item.disabled) {
        disabled.add(item.href);
      }
      if (item.children?.length) {
        visit(item.children);
      }
    }
  };
  visit(items);
  return disabled;
}

function mapAnchorItems(
  items: SAnchorItem[],
  allowChildren: boolean,
): AnchorLinkItemProps[] {
  return items.map((item) => {
    const isError = item.status === 'error' || Boolean(item.error);
    const isDisabled = Boolean(item.disabled);

    const itemClasses = [
      item.className ?? '',
      isDisabled ? 'omada-anchor-item-disabled' : '',
      isError ? 'omada-anchor-item-error' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const renderedTitle = isDisabled ? (
      <span
        aria-disabled="true"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="cursor-not-allowed text-[var(--omada-text-disabled)]"
      >
        {item.title}
      </span>
    ) : isError ? (
      <span className="inline-flex items-center gap-1.5 text-[var(--omada-color-error)]">
        <span>{item.title}</span>
        <span
          aria-label="Section has errors"
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--omada-color-error)]"
        />
      </span>
    ) : (
      item.title
    );

    const mapped: AnchorLinkItemProps = {
      key: item.key,
      href: item.href,
      target: item.target,
      title: renderedTitle,
      className: itemClasses || undefined,
    };

    if (allowChildren && item.children?.length) {
      mapped.children = mapAnchorItems(item.children, true);
    }

    return mapped;
  });
}

/**
 * Omada Anchor (`35368:149692`):
 * - Right-rail vertical TOC (and horizontal strip) with optional section `title`
 * - Supports L1 + L2 indented links plus Normal, Hover, Active, Disabled, and Error states.
 */
export const SAnchor: React.FC<SAnchorProps> = ({
  items,
  title,
  direction = 'vertical',
  affix = false,
  showInkInFixed = true,
  activeHref,
  getCurrentAnchor,
  onClick,
  className = '',
  classNames,
  ...rest
}) => {
  const allowChildren = direction === 'vertical';
  const disabledHrefs = useMemo(() => collectDisabledHrefs(items), [items]);
  const mappedItems = useMemo(
    () => mapAnchorItems(items, allowChildren),
    [items, allowChildren],
  );

  const handleAnchorClick: AnchorProps['onClick'] = (e, link) => {
    if (disabledHrefs.has(link.href)) {
      e.preventDefault();
      return;
    }
    onClick?.(e, link);
  };

  const resolvedGetCurrentAnchor: AnchorProps['getCurrentAnchor'] =
    getCurrentAnchor ?? (activeHref !== undefined ? () => activeHref : undefined);

  const resolvedClassNames: AnchorProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const res = classNames(info);
          return {
            ...res,
            root: `omada-anchor ${res?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-anchor ${classNames?.root ?? ''}`.trim(),
        };

  return (
    <div className={`omada-anchor-wrapper ${className}`.trim()}>
      {title && direction === 'vertical' && (
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--omada-text-tertiary)]">
          {title}
        </div>
      )}
      <Anchor
        direction={direction}
        affix={affix}
        showInkInFixed={showInkInFixed}
        items={mappedItems}
        getCurrentAnchor={resolvedGetCurrentAnchor}
        onClick={handleAnchorClick}
        classNames={resolvedClassNames}
        {...rest}
      />
    </div>
  );
};
