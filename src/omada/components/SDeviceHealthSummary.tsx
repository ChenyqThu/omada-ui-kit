import React from 'react';
import { SIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';

export interface DeviceHealthCounts {
  good: number;
  fair: number;
  poor: number;
  noData: number;
}

export interface DeviceHealthSummaryItem {
  key: 'gateway' | 'switch' | 'ap' | 'olt' | string;
  label: string;
  icon: OmadaIconName;
  /** Single score label (e.g. `"Good - 10"`) or single count (e.g. `"1"`). */
  summaryText?: string;
  /** Semantic tone when rendering `summaryText` without `counts` breakdown. */
  summaryTone?: 'good' | 'fair' | 'poor' | 'muted';
  /** 4-bucket health distribution rendered as `G / F / P / N` + 200x4px segmented bar. */
  counts?: DeviceHealthCounts;
  /** Whether to show the 200x4px segmented distribution bar beneath `counts`. */
  showBar?: boolean;
}

export interface SDeviceHealthSummaryProps {
  /** Health summary items across device categories (defaults to Gateway / Switches / APs / OLTs). */
  items?: DeviceHealthSummaryItem[];
  /** Optional click handler when a category block is clicked. */
  onCategoryClick?: (key: string) => void;
  className?: string;
}

export const DEFAULT_DEVICE_HEALTH_SUMMARY_ITEMS: DeviceHealthSummaryItem[] = [
  {
    key: 'gateway',
    label: 'Gateway',
    icon: 'gateway',
    summaryText: 'Good - 10',
    summaryTone: 'good',
  },
  {
    key: 'switch',
    label: 'Switches',
    icon: 'switch',
    counts: { good: 1, fair: 1, poor: 1, noData: 0 },
    showBar: true,
  },
  {
    key: 'ap',
    label: 'APs',
    icon: 'ap',
    counts: { good: 1, fair: 1, poor: 0, noData: 1 },
    showBar: true,
  },
  {
    key: 'olt',
    label: 'OLTs',
    icon: 'olt',
    summaryText: '1',
    summaryTone: 'muted',
  },
];

const TONE_COLOR: Record<'good' | 'fair' | 'poor' | 'muted', string> = {
  good: 'var(--omada-brand-hover)',
  fair: 'var(--omada-color-warning)',
  poor: 'var(--omada-color-error)',
  muted: 'var(--omada-border-strong)',
};

/**
 * 4-column device health summary strip displayed above the Emulator Devices toolbar.
 * Shows category icon, health score or `Good / Fair / Poor / No Data` counts, and a 200x4px segmented bar.
 */
export const SDeviceHealthSummary: React.FC<SDeviceHealthSummaryProps> = ({
  items = DEFAULT_DEVICE_HEALTH_SUMMARY_ITEMS,
  onCategoryClick,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label="Device health summary"
      className={`omada-device-health-summary grid h-[59px] grid-cols-4 items-center gap-4 ${className}`.trim()}
    >
      {items.map((item) => {
        const counts = item.counts;
        const total = counts
          ? counts.good + counts.fair + counts.poor + counts.noData
          : 0;

        const segments = counts
          ? (
              [
                { key: 'good', count: counts.good, color: TONE_COLOR.good },
                { key: 'fair', count: counts.fair, color: TONE_COLOR.fair },
                { key: 'poor', count: counts.poor, color: TONE_COLOR.poor },
                { key: 'noData', count: counts.noData, color: TONE_COLOR.muted },
              ] as const
            ).filter((seg) => seg.count > 0)
          : [];

        const content = (
          <>
            <SIcon
              name={item.icon}
              size={40}
              className="shrink-0 text-[var(--omada-text-primary)]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] leading-[18px] text-[var(--omada-text-secondary)]">
                {item.label}
              </div>
              {counts ? (
                <>
                  <div className="tabular-nums mt-0.5 flex items-center text-[18px] font-medium leading-[22px]">
                    <span style={{ color: TONE_COLOR.good }}>{counts.good}</span>
                    <span className="mx-1.5 text-[14px] text-[var(--omada-text-tertiary)]">/</span>
                    <span style={{ color: TONE_COLOR.fair }}>{counts.fair}</span>
                    <span className="mx-1.5 text-[14px] text-[var(--omada-text-tertiary)]">/</span>
                    <span style={{ color: TONE_COLOR.poor }}>{counts.poor}</span>
                    <span className="mx-1.5 text-[14px] text-[var(--omada-text-tertiary)]">/</span>
                    <span style={{ color: TONE_COLOR.muted }}>{counts.noData}</span>
                  </div>
                  {item.showBar && total > 0 && (
                    <div
                      aria-hidden="true"
                      className="mt-1.5 flex h-[4px] w-[200px] max-w-full overflow-hidden rounded-full bg-[var(--omada-bg-field)]"
                    >
                      {segments.map((seg, idx) => (
                        <span
                          key={seg.key}
                          className={`h-full ${idx > 0 ? 'ml-[1px]' : ''}`}
                          style={{
                            width: `${(seg.count / total) * 100}%`,
                            backgroundColor: seg.color,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="tabular-nums mt-0.5 text-[18px] font-medium leading-[22px]"
                  style={{ color: TONE_COLOR[item.summaryTone ?? 'good'] }}
                >
                  {item.summaryText ?? '--'}
                </div>
              )}
            </div>
          </>
        );

        if (onCategoryClick) {
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onCategoryClick(item.key)}
              className="flex cursor-pointer items-center gap-3 rounded-md py-1 text-left transition-opacity hover:opacity-85"
            >
              {content}
            </button>
          );
        }

        return (
          <div key={item.key} className="flex items-center gap-3">
            {content}
          </div>
        );
      })}
    </div>
  );
};
