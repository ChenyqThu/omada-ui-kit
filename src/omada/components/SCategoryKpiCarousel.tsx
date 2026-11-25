import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  IdCard,
  Link2,
  LogIn,
  Radar,
  Radio,
} from 'lucide-react';
import { SIcon, hasOmadaIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';
import { useRovingFocus } from '../behaviors/useRovingFocus';

export interface CategoryKpiItem {
  key: string;
  label: string;
  count: number;
  /** Optional Figma `SIcon` slug or custom icon element. */
  icon?: OmadaIconName | React.ReactNode;
}

export interface SCategoryKpiCarouselProps {
  /** Category KPI cards rendered horizontally inside the carousel. */
  items?: CategoryKpiItem[];
  /** Controlled active category key. */
  activeKey?: string;
  /** Uncontrolled initial active category key (defaults to `'overview'`). */
  defaultActiveKey?: string;
  /** Fired when a category card is selected. */
  onSelect?: (key: string) => void;
  className?: string;
}

export const DEFAULT_INCIDENT_CATEGORY_ITEMS: CategoryKpiItem[] = [
  { key: 'overview', label: 'Overview', count: 2 },
  { key: 'access', label: 'Access', count: 0 },
  { key: 'authentication', label: 'Authentication', count: 0 },
  { key: 'roaming', label: 'Roaming', count: 0 },
  { key: 'wireless-network', label: 'Wireless Network', count: 2 },
  { key: 'wired-network', label: 'Wired Network', count: 0 },
  { key: 'link', label: 'Link', count: 0 },
  { key: 'wan-services', label: 'WAN & Services', count: 0 },
  { key: 'device-status', label: 'Device Status', count: 0 },
  { key: 'security', label: 'Security', count: 0 },
];

function renderCategoryIcon(item: CategoryKpiItem): React.ReactNode {
  if (typeof item.icon === 'string' && hasOmadaIcon(item.icon)) {
    return <SIcon name={item.icon as OmadaIconName} size={26} />;
  }
  if (item.icon !== undefined && typeof item.icon !== 'string') {
    return item.icon;
  }

  switch (item.key) {
    case 'overview':
      return <SIcon name="sidebar-icon-icon-overview-off" size={26} />;
    case 'access':
      return <LogIn size={24} strokeWidth={1.35} aria-hidden="true" />;
    case 'authentication':
      return <IdCard size={26} strokeWidth={1.3} aria-hidden="true" />;
    case 'roaming':
      return <Radar size={24} strokeWidth={1.35} aria-hidden="true" />;
    case 'wireless-network':
      return <Radio size={25} strokeWidth={1.35} aria-hidden="true" />;
    case 'wired-network':
      return <SIcon name="wired-user" size={26} />;
    case 'link':
      return <Link2 size={24} strokeWidth={1.35} aria-hidden="true" />;
    case 'wan-services':
      return <SIcon name="sidebar-icon-icon-network-config-off" size={26} />;
    case 'device-status':
      return <SIcon name="sidebar-icon-icon-device-off" size={26} />;
    case 'security':
      return <SIcon name="sidebar-icon-icon-security-off" size={26} />;
    default:
      return <SIcon name="sidebar-icon-icon-overview-off" size={26} />;
  }
}

/**
 * Horizontal scrollable KPI category strip with `<` / `>` scroll arrows,
 * roving keyboard focus, active `#00A870` border + subtle tint highlight, and Light/Dark theme support.
 */
export const SCategoryKpiCarousel: React.FC<SCategoryKpiCarouselProps> = ({
  items = DEFAULT_INCIDENT_CATEGORY_ITEMS,
  activeKey,
  defaultActiveKey,
  onSelect,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [innerActiveKey, setInnerActiveKey] = useState<string>(
    defaultActiveKey ?? items[0]?.key ?? 'overview',
  );
  const resolvedActiveKey = activeKey ?? innerActiveKey;

  const handleSelect = (key: string, targetEl?: HTMLElement | null) => {
    if (activeKey === undefined) {
      setInnerActiveKey(key);
    }
    targetEl?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    onSelect?.(key);
  };

  const rovingItems = useMemo(
    () => items.map((item) => ({ key: item.key })),
    [items],
  );

  const { getItemProps } = useRovingFocus({
    items: rovingItems,
    activeKey: resolvedActiveKey,
    onActivate: (key) => handleSelect(key),
    orientation: 'horizontal',
    activationMode: 'automatic',
  });

  const handleScroll = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const offset = direction * 340;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: offset, behavior: 'smooth' });
    } else {
      el.scrollLeft += offset;
    }
  };

  return (
    <div
      role="region"
      aria-label="Incident category summary"
      className={`omada-kpi-carousel flex items-center gap-1.5 ${className}`.trim()}
    >
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => handleScroll(-1)}
        className="omada-kpi-carousel-arrow"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={trackRef}
        role="tablist"
        aria-label="Incident categories"
        className="omada-kpi-carousel-track flex min-w-0 flex-1 items-center gap-3 overflow-x-auto scroll-smooth py-0.5"
      >
        {items.map((item) => {
          const isActive = item.key === resolvedActiveKey;
          const rovingProps = getItemProps<HTMLButtonElement>(item.key);
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-category-key={item.key}
              onClick={(e) => handleSelect(item.key, e.currentTarget)}
              className={`omada-kpi-carousel-card ${isActive ? 'is-active' : ''}`}
              {...rovingProps}
            >
              <span className="inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center text-[var(--omada-text-secondary)]">
                {renderCategoryIcon(item)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block whitespace-nowrap text-[12px] font-normal leading-[16px] text-[var(--omada-text-secondary)]">
                  {item.label}
                </span>
                <span className="tabular-nums mt-0.5 block text-[18px] font-semibold leading-[24px] text-[var(--omada-text-primary)]">
                  {item.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => handleScroll(1)}
        className="omada-kpi-carousel-arrow"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
