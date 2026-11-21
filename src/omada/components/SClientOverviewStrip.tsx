import React from 'react';
import { SClientIcon } from '../assets/SClientIcon';
import type { OmadaClientIconName } from '../assets/assetsManifest';

export interface ClientOverviewItem {
  /** Logical category identifier (`online-clients`, `mobile`, `others`, `office`). */
  key: string;
  /** Numeric KPI value rendered above the category label. */
  count: number;
  /** Category label displayed beneath the numeric KPI. */
  label: string;
  /** Official Figma client icon slug from `OMADA_CLIENTS`. */
  icon: OmadaClientIconName;
  /** Forces the light asset variant when the dark asset contains upstream artifacts. */
  forceLightIcon?: boolean;
}

export interface SClientOverviewStripProps {
  /** 4 horizontal client overview KPI blocks (`Online Clients`, `Mobile`, `Others`, `Office`). */
  items?: ClientOverviewItem[];
  /** Optional currently active category filter key. */
  activeKey?: string | null;
  /** Optional click handler invoked when a KPI block is clicked. */
  onItemClick?: (key: string) => void;
  className?: string;
}

export const DEFAULT_CLIENT_OVERVIEW_ITEMS: ClientOverviewItem[] = [
  {
    key: 'online-clients',
    count: 4,
    label: 'Online Clients',
    icon: 'group',
  },
  {
    key: 'mobile',
    count: 2,
    label: 'Mobile',
    icon: 'iphone',
  },
  {
    key: 'others',
    count: 1,
    label: 'Others',
    icon: 'other',
    forceLightIcon: true,
  },
  {
    key: 'office',
    count: 1,
    label: 'Office',
    icon: 'office-pc',
  },
];

/**
 * 4-column client overview KPI strip displayed above the Emulator Clients toolbar.
 * Shows client category artwork (`SClientIcon`) paired with count and category label.
 */
export const SClientOverviewStrip: React.FC<SClientOverviewStripProps> = ({
  items = DEFAULT_CLIENT_OVERVIEW_ITEMS,
  activeKey = null,
  onItemClick,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label="Client overview summary"
      className={`omada-client-overview-strip grid h-[82px] grid-cols-4 items-center gap-4 ${className}`.trim()}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const content = (
          <>
            <SClientIcon
              name={item.icon}
              theme={item.forceLightIcon ? 'light' : 'auto'}
              size={40}
              alt={item.label}
              className="shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <div className="tabular-nums text-[18px] font-semibold leading-[24px] text-[var(--omada-text-primary)]">
                {item.count}
              </div>
              <div className="mt-0.5 truncate text-[13px] leading-[18px] text-[var(--omada-text-secondary)]">
                {item.label}
              </div>
            </div>
          </>
        );

        if (onItemClick) {
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onItemClick(item.key)}
              className={`omada-client-overview-item -ml-1.5 flex cursor-pointer items-center gap-3 rounded-md px-1.5 py-1.5 text-left transition-colors ${
                isActive ? 'is-active' : ''
              }`.trim()}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={item.key} className="flex items-center gap-3 py-1.5">
            {content}
          </div>
        );
      })}
    </div>
  );
};
