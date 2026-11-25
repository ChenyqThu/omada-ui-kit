import React, { useMemo, useState } from 'react';
import { useRovingFocus } from '../behaviors/useRovingFocus';
import { SSearchInput } from '../components/SInput';
import { SEmpty } from '../components/SEmpty';

export interface SMasterDetailItem {
  key: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SMasterDetailSplitBlockProps {
  /** Left rail heading. */
  masterTitle?: React.ReactNode;
  /** Optional control placed to the right of `masterTitle`. */
  masterExtra?: React.ReactNode;
  /** Width of the left master rail in pixels (default `260`). */
  masterWidth?: number;
  /** Adds a compact filled search filter at the top of the left rail. */
  searchable?: boolean;
  searchPlaceholder?: string;
  items: SMasterDetailItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Right detail pane header title. */
  detailTitle?: React.ReactNode;
  /** Right detail pane header extra controls. */
  detailExtra?: React.ReactNode;
  /** Empty placeholder rendered when `items` is empty and no detail applies. */
  emptyDetail?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Split master-detail workspace combining a searchable left selection list (`listbox` + vertical roving focus)
 * and a bordered right detail/canvas surface (`LAN VLANs`, `Terminal`, `Switch Ports`).
 */
export const SMasterDetailSplitBlock: React.FC<SMasterDetailSplitBlockProps> = ({
  masterTitle,
  masterExtra,
  masterWidth = 260,
  searchable = false,
  searchPlaceholder = 'Search',
  items,
  activeKey,
  onSelect,
  detailTitle,
  detailExtra,
  emptyDetail,
  children,
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = `${typeof item.title === 'string' ? item.title : ''} ${typeof item.subtitle === 'string' ? item.subtitle : ''}`.toLowerCase();
      return text.includes(q) || item.key.toLowerCase().includes(q);
    });
  }, [items, query]);

  const rovingItems = useMemo(
    () => filteredItems.map((item) => ({ key: item.key })),
    [filteredItems],
  );

  const { getItemProps } = useRovingFocus({
    items: rovingItems,
    activeKey,
    onActivate: onSelect,
    orientation: 'vertical',
    activationMode: 'automatic',
  });

  return (
    <div className={`omada-master-detail ${className}`.trim()}>
      <aside className="omada-master-rail" style={{ width: masterWidth }}>
        {(masterTitle || masterExtra) && (
          <div className="omada-master-header">
            <span className="text-[14px] font-semibold text-[var(--omada-text-primary)]">
              {masterTitle}
            </span>
            {masterExtra}
          </div>
        )}

        {searchable && (
          <div className="px-3 pb-2.5">
            <SSearchInput
              width="100%"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}

        <div
          className="omada-master-list"
          role="listbox"
          aria-label={typeof masterTitle === 'string' ? masterTitle : 'Master list'}
        >
          {filteredItems.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[var(--omada-text-tertiary)]">
              No matching items
            </div>
          ) : (
            filteredItems.map((item) => {
              const selected = item.key === activeKey;
              const rovingProps = getItemProps<HTMLButtonElement>(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onSelect(item.key)}
                  className={`omada-master-item ${selected ? 'is-active' : ''}`}
                  {...rovingProps}
                >
                  {item.icon && (
                    <span className="inline-flex shrink-0 items-center justify-center leading-none">
                      {item.icon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-[13px] font-medium text-[var(--omada-text-primary)]">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="block truncate text-[12px] text-[var(--omada-text-tertiary)]">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                  {item.badge && <span className="shrink-0">{item.badge}</span>}
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="omada-detail-pane">
        {(detailTitle || detailExtra) && (
          <div className="omada-detail-header">
            <div className="text-[15px] font-semibold text-[var(--omada-text-primary)]">
              {detailTitle}
            </div>
            {detailExtra && <div className="flex items-center gap-2">{detailExtra}</div>}
          </div>
        )}
        <div className="omada-detail-body">
          {items.length === 0 && emptyDetail ? (
            <SEmpty title="No Selection" description={String(emptyDetail)} />
          ) : (
            children
          )}
        </div>
      </section>
    </div>
  );
};
