import React, { useId, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import { useOmadaAgentControl } from '../agent';
import { useRovingFocus } from '../behaviors/useRovingFocus';

export type STabsVariant = 'line' | 'page' | 'capsule' | 'segment' | 'filter';
export type STabsPageSize = 'lg' | 'md';

export interface STabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  dotColor?: string;
  /** Optional item count or trailing badge rendered inside `page` / `filter` / `segment` / `capsule` tabs. */
  count?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface STabsProps {
  items: STabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: STabsVariant;
  /** Font/spacing scale for `variant="page"` (`'lg'`: 18px header tabs, `'md'`: 15px sub-section/drawer tabs). */
  size?: STabsPageSize;
  /** Renders the full-width bottom divider line when `variant="page"` (default `true`). */
  bordered?: boolean;
  /** Expands `filter` / `segment` / `capsule` track to full width with equal-width tab buttons. */
  block?: boolean;
  pill?: boolean;
  extra?: React.ReactNode;
  /** Accessible name applied to the underlying `role="tablist"`. */
  'aria-label'?: string;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
  className?: string;
}

function renderTabLabelAndCount(
  label: React.ReactNode,
  count: React.ReactNode,
  truncate?: boolean,
): React.ReactNode {
  const cls = [truncate ? 'truncate' : '', count !== undefined && count !== null ? 'tabular-nums' : '']
    .filter(Boolean)
    .join(' ') || undefined;

  if (count === undefined || count === null) {
    return <span className={cls}>{label}</span>;
  }
  if (typeof count === 'number' || typeof count === 'string') {
    if (typeof label === 'string' || typeof label === 'number') {
      return <span className={cls}>{`${label} (${count})`}</span>;
    }
    return (
      <>
        <span className={truncate ? 'truncate' : undefined}>{label}</span>
        <span className="tabular-nums">{`(${count})`}</span>
      </>
    );
  }
  return (
    <>
      <span className={truncate ? 'truncate' : undefined}>{label}</span>
      {count}
    </>
  );
}

/**
 * Omada Tabs supporting:
 * - `line`: AntD primary underline tabs (`34px` height, `#00A870` indicator)
 * - `page`: Omada Controller v6.3 `18px` (`lg`) or `15px` (`md`) underline page/settings sub-tabs
 * - `filter`: Omada Controller v6.3 `32px` neutral track + active green-text surface pill switcher (`dotColor`, `count`, `block`)
 * - `capsule`: Omada green active capsule tabs (or `pill` rounded-full)
 * - `segment`: neutral surface segmented switcher with optional legend dot
 */
export const STabs: React.FC<STabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = 'line',
  size = 'lg',
  bordered = true,
  block = false,
  pill = false,
  extra,
  'aria-label': ariaLabel,
  agentId,
  className = '',
}) => {
  const baseId = useId();
  const [innerKey, setInnerKey] = useState<string>(
    defaultActiveKey ?? items.find((i) => !i.disabled)?.key ?? items[0]?.key ?? '',
  );
  const currentKey = activeKey ?? innerKey;

  const handleSelect = (key: string) => {
    if (activeKey === undefined) {
      setInnerKey(key);
    }
    onChange?.(key);
  };

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'tabs',
          label: ariaLabel,
          value: currentKey,
          options: items.map((item) => ({
            value: item.key,
            label: typeof item.label === 'string' ? item.label : item.key,
            disabled: item.disabled,
          })),
          actions: {
            setValue: (nextKey: unknown) => {
              const target = items.find((i) => i.key === String(nextKey));
              if (!target) {
                throw new Error(`Unknown tab "${String(nextKey)}".`);
              }
              if (target.disabled) {
                throw new Error(`Tab "${target.key}" is disabled.`);
              }
              handleSelect(target.key);
              return target.key;
            },
            selectTab: (nextKey: unknown) => {
              const target = items.find((i) => i.key === String(nextKey));
              if (!target) {
                throw new Error(`Unknown tab "${String(nextKey)}".`);
              }
              if (target.disabled) {
                throw new Error(`Tab "${target.key}" is disabled.`);
              }
              handleSelect(target.key);
              return target.key;
            },
          },
        }
      : null,
  );

  const rovingItems = useMemo(
    () => items.map((item) => ({ key: item.key, disabled: item.disabled })),
    [items],
  );

  const { getItemProps } = useRovingFocus({
    items: rovingItems,
    activeKey: currentKey,
    onActivate: handleSelect,
    orientation: 'horizontal',
    activationMode: 'automatic',
  });

  if (variant === 'line') {
    return (
      <Tabs
        activeKey={currentKey}
        onChange={handleSelect}
        tabBarExtraContent={extra}
        aria-label={ariaLabel}
        className={className}
        items={items.map((item) => ({
          key: item.key,
          label: (
            <span className="inline-flex items-center gap-1.5">
              {item.icon}
              {renderTabLabelAndCount(item.label, item.count)}
            </span>
          ),
          disabled: item.disabled,
          children: item.children,
        }))}
      />
    );
  }

  const activeItem = items.find((i) => i.key === currentKey);
  const hasPanel = activeItem?.children !== undefined;
  const getTabDomId = (key: string) => `${baseId}-tab-${key}`;
  const getPanelDomId = (key: string) => `${baseId}-panel-${key}`;

  if (variant === 'page') {
    const isMd = size === 'md';
    return (
      <div className={className}>
        <div
          className={`omada-tabs-page-bar ${
            bordered ? 'omada-tabs-page-bar--bordered' : ''
          }`.trim()}
        >
          <div
            role="tablist"
            aria-label={ariaLabel}
            className={`omada-tabs-page-list ${
              isMd ? 'omada-tabs-page-list--md' : ''
            }`.trim()}
          >
            {items.map((item) => {
              const isActive = item.key === currentKey;
              const rovingProps = getItemProps<HTMLButtonElement>(item.key, {
                disabled: item.disabled,
              });
              const itemHasPanel = item.children !== undefined;
              return (
                <button
                  key={item.key}
                  id={getTabDomId(item.key)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={itemHasPanel ? getPanelDomId(item.key) : undefined}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && handleSelect(item.key)}
                  className={`omada-tabs-page-btn ${
                    isMd ? 'omada-tabs-page-btn--md' : ''
                  } ${isActive ? 'is-active' : ''}`.trim()}
                  {...rovingProps}
                >
                  {item.dotColor && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.dotColor }}
                      aria-hidden="true"
                    />
                  )}
                  {item.icon}
                  {renderTabLabelAndCount(item.label, item.count)}
                  {isActive && (
                    <span className="omada-tabs-page-indicator" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
          {extra && <div className="mb-2 flex shrink-0 items-center gap-2">{extra}</div>}
        </div>

        {hasPanel && activeItem && (
          <div
            id={getPanelDomId(activeItem.key)}
            role="tabpanel"
            aria-labelledby={getTabDomId(activeItem.key)}
            className="mt-4"
          >
            {activeItem.children}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'filter') {
    const trackNode = (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`omada-tabs-filter-track ${
          block ? 'omada-tabs-filter-track--block' : ''
        } ${pill ? '!rounded-full' : ''}`.trim()}
      >
        {items.map((item) => {
          const isActive = item.key === currentKey;
          const rovingProps = getItemProps<HTMLButtonElement>(item.key, {
            disabled: item.disabled,
          });
          const itemHasPanel = item.children !== undefined;
          return (
            <button
              key={item.key}
              id={getTabDomId(item.key)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={itemHasPanel ? getPanelDomId(item.key) : undefined}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleSelect(item.key)}
              className={`omada-tabs-filter-pill ${
                block ? 'omada-tabs-filter-pill--block' : ''
              } ${pill ? '!rounded-full' : ''} ${isActive ? 'is-active' : ''}`.trim()}
              {...rovingProps}
            >
              {item.dotColor && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.dotColor }}
                  aria-hidden="true"
                />
              )}
              {item.icon}
              {renderTabLabelAndCount(item.label, item.count, block)}
            </button>
          );
        })}
      </div>
    );

    if (!extra && !hasPanel) {
      return className ? <div className={className}>{trackNode}</div> : trackNode;
    }

    return (
      <div className={className}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {trackNode}
          {extra && <div>{extra}</div>}
        </div>
        {hasPanel && activeItem && (
          <div
            id={getPanelDomId(activeItem.key)}
            role="tabpanel"
            aria-labelledby={getTabDomId(activeItem.key)}
            className="mt-3"
          >
            {activeItem.children}
          </div>
        )}
      </div>
    );
  }

  const isCapsule = variant === 'capsule';

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label={ariaLabel}
          className={`${block ? 'flex w-full' : 'inline-flex'} items-center gap-1 bg-[var(--omada-bg-field)] ${
            isCapsule ? 'p-0.5' : 'p-1'
          } ${pill ? 'rounded-full' : 'rounded'}`}
        >
          {items.map((item) => {
            const isActive = item.key === currentKey;
            const rovingProps = getItemProps<HTMLButtonElement>(item.key, {
              disabled: item.disabled,
            });
            const itemHasPanel = item.children !== undefined;
            return (
              <button
                key={item.key}
                id={getTabDomId(item.key)}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={itemHasPanel ? getPanelDomId(item.key) : undefined}
                disabled={item.disabled}
                onClick={() => !item.disabled && handleSelect(item.key)}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  block ? 'min-w-0 flex-1' : ''
                } ${pill ? 'rounded-full' : 'rounded-[2px]'} ${
                  isCapsule ? 'h-7 px-3' : 'h-6 px-3'
                } ${
                  isActive
                    ? isCapsule
                      ? 'bg-[var(--omada-brand)] font-semibold text-[var(--omada-text-inverse)]'
                      : 'bg-[var(--omada-bg-sidebar-active)] font-semibold text-[var(--omada-text-primary)] shadow-2xs'
                    : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                }`}
                {...rovingProps}
              >
                {item.dotColor && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        isActive && isCapsule
                          ? 'var(--omada-text-inverse)'
                          : item.dotColor,
                    }}
                    aria-hidden="true"
                  />
                )}
                {item.icon}
                {renderTabLabelAndCount(item.label, item.count, block)}
              </button>
            );
          })}
        </div>
        {extra && <div>{extra}</div>}
      </div>

      {hasPanel && activeItem && (
        <div
          id={getPanelDomId(activeItem.key)}
          role="tabpanel"
          aria-labelledby={getTabDomId(activeItem.key)}
          className="mt-3"
        >
          {activeItem.children}
        </div>
      )}
    </div>
  );
};
