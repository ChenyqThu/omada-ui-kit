import React from 'react';

export type SHealthTickStatus = 'good' | 'fair' | 'poor' | 'none';

export interface SHealthTrendRow {
  key: string;
  label: string;
  /** ~96 vertical status ticks ordered oldest -> newest. */
  ticks: SHealthTickStatus[];
}

export interface SHealthTrendBarProps {
  /** Dimension rows (`Device`, `Client`, `Wi-Fi`, `WAN`). */
  rows: SHealthTrendRow[];
  /** Optional labels per tick index for hover inspection. */
  tickLabels?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const TICK_COLOR_VAR: Record<SHealthTickStatus, string> = {
  good: 'var(--omada-dash-tick-good, rgba(5, 193, 120, 0.5))',
  fair: 'var(--omada-dash-tick-fair, rgba(255, 140, 39, 0.5))',
  poor: 'var(--omada-dash-tick-poor, rgba(238, 56, 92, 0.5))',
  none: 'var(--omada-dash-tick-empty, rgba(204, 204, 204, 0.45))',
};

const TICK_STATUS_LABEL: Record<SHealthTickStatus, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  none: 'No Data',
};

/**
 * Multi-row 24h Network Health Trend timeline rendering ~96 thin vertical ticks per row
 * across `Device`, `Client`, `Wi-Fi`, and `WAN` dimensions.
 */
export const SHealthTrendBar: React.FC<SHealthTrendBarProps> = ({
  rows,
  tickLabels,
  className = '',
  style,
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()} style={style}>
      {rows.map((row) => {
        const count = Math.max(row.ticks.length, 1);
        return (
          <div key={row.key} className="flex items-center gap-3">
            <span className="w-[46px] shrink-0 text-[12px] leading-4 text-[var(--omada-text-secondary)]">
              {row.label}
            </span>
            <div
              className="grid flex-1 items-center gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
              role="img"
              aria-label={`${row.label} health trend across ${row.ticks.length} intervals`}
            >
              {row.ticks.map((status, idx) => {
                const timePrefix = tickLabels?.[idx] ? `${tickLabels[idx]} · ` : '';
                return (
                  <span
                    key={idx}
                    data-status={status}
                    title={`${row.label}: ${timePrefix}${TICK_STATUS_LABEL[status]}`}
                    className="block h-[9px] w-full rounded-[1px] transition-opacity hover:opacity-80"
                    style={{ backgroundColor: TICK_COLOR_VAR[status] }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
