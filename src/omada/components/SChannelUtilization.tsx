import React from 'react';
import { STooltip } from './STooltip';

export type SChannelUtilizationLevel = 'low' | 'medium' | 'high';

export interface SChannelItem {
  channel: number;
  /** Utilization percentage (`0..100`). `0` renders an idle track bar. */
  utilization: number;
  /** Utilization severity override (auto-derived from `utilization` if omitted). */
  level?: SChannelUtilizationLevel;
}

export interface SChannelBand {
  key: string;
  label: string;
  channels: SChannelItem[];
}

export interface SChannelUtilizationProps {
  /** Radio band groups (`2.4 GHz`, `5 GHz`, `6 GHz`) rendered side by side. */
  bands: SChannelBand[];
  className?: string;
  style?: React.CSSProperties;
}

function getChannelColor(item: SChannelItem): string {
  const level =
    item.level ??
    (item.utilization >= 70 ? 'high' : item.utilization >= 40 ? 'medium' : 'low');

  switch (level) {
    case 'high':
      return 'var(--omada-color-error)';
    case 'medium':
      return 'var(--omada-color-warning)';
    case 'low':
    default:
      return 'var(--omada-brand-hover)';
  }
}

/**
 * Multi-band wireless Channel Utilization mini-bar chart across `2.4 GHz`, `5 GHz`, and `6 GHz`
 * with color-coded Low / Medium / High utilization levels and band underline labels.
 */
export const SChannelUtilization: React.FC<SChannelUtilizationProps> = ({
  bands,
  className = '',
  style,
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`.trim()} style={style}>
      <div className="flex min-w-[660px] items-start gap-2">
        {bands.map((band) => {
          const bandFlexWeight = band.channels.reduce(
            (sum, ch) => sum + (ch.channel >= 100 ? 1.24 : 0.92),
            0,
          );
          return (
            <div
              key={band.key}
              className="flex min-w-0 flex-col"
              style={{ flex: bandFlexWeight }}
            >
              {/* Channel Vertical Bars + Numbers */}
              <div
                className="grid items-end gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${band.channels.length}, minmax(0, 1fr))`,
                }}
              >
                {band.channels.map((ch) => {
                  const pct = Math.max(0, Math.min(ch.utilization, 100));
                  const barColor = getChannelColor(ch);

                  return (
                    <STooltip
                      key={`${band.key}-${ch.channel}`}
                      title={`${band.label} · Ch ${ch.channel}: ${pct}% utilization`}
                    >
                      <div
                        className="flex min-w-0 flex-col items-center gap-1"
                        data-channel={`${band.key}-${ch.channel}`}
                        data-utilization={pct}
                      >
                        <div
                          className="relative flex h-[22px] w-full items-end overflow-hidden rounded-t-[2px]"
                          style={{
                            backgroundColor:
                              'var(--omada-dash-channel-track, rgba(0, 0, 0, 0.05))',
                          }}
                        >
                          {pct > 0 && (
                            <span
                              className="block w-full rounded-t-[2px] transition-all"
                              style={{
                                height: `${Math.max(pct, 14)}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          )}
                        </div>
                        <span className="tabular-nums whitespace-nowrap text-[8.5px] leading-3 tracking-[-0.04em] text-[var(--omada-text-tertiary)]">
                          {ch.channel}
                        </span>
                      </div>
                    </STooltip>
                  );
                })}
              </div>

              {/* Band Underline & Centered Label */}
              <div className="mt-2 border-t border-[var(--omada-dash-card-border,var(--omada-border-divider))] pt-1.5 text-center text-[12px] leading-4 text-[var(--omada-text-secondary)]">
                {band.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
