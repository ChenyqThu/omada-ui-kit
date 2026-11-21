import React from 'react';
import { SProductImage } from '../assets/SProductImage';
import type { OmadaProductName } from '../assets/assetsManifest';
import { STooltip } from './STooltip';

export interface SApDistributionCluster {
  id: string;
  /** Signal strength in dBm (`-90` .. `-30`). */
  dbm: number;
  /** Number of APs grouped at this RSSI bucket. */
  count: number;
  /** Ring highlight color status (`warning` = amber/yellow ring, `good` = green ring). */
  status: 'good' | 'warning' | 'poor';
  /** Product thumbnail inside the circular AP bubble. */
  productSlug: OmadaProductName;
  /** AP names included in this cluster for hover tooltip. */
  apNames: string[];
}

export interface SApDistributionRulerProps {
  /** AP signal distribution clusters plotted along the `-90dBm .. -30dBm` ruler. */
  clusters: SApDistributionCluster[];
  /** Minimum scale value in dBm (defaults to `-90`). */
  minDbm?: number;
  /** Maximum scale value in dBm (defaults to `-30`). */
  maxDbm?: number;
  /** Step between ruler tick marks (defaults to `5`). */
  step?: number;
  className?: string;
  style?: React.CSSProperties;
}

const RING_COLOR_MAP: Record<SApDistributionCluster['status'], string> = {
  good: 'var(--omada-brand-hover)',
  warning: 'var(--omada-color-warning-minor)',
  poor: 'var(--omada-color-error)',
};

/**
 * RSSI AP Distribution ruler (`-90dBm` to `-30`) with rainbow signal-quality gradient bar,
 * 5 dBm tick marks, and circular AP device cluster markers with green count badges.
 */
export const SApDistributionRuler: React.FC<SApDistributionRulerProps> = ({
  clusters,
  minDbm = -90,
  maxDbm = -30,
  step = 5,
  className = '',
  style,
}) => {
  const ticks: number[] = [];
  for (let v = minDbm; v <= maxDbm; v += step) {
    ticks.push(v);
  }

  // Ruler visually extends ~6% beyond -90dBm and -30 so edge labels sit cleanly inside the bar.
  const toPercent = (dbm: number) => {
    const clamped = Math.max(minDbm, Math.min(dbm, maxDbm));
    const ratio = (clamped - minDbm) / Math.max(maxDbm - minDbm, 1);
    return 7 + ratio * 86;
  };

  return (
    <div className={`w-full select-none ${className}`.trim()} style={style}>
      {/* Upper marker lane + rainbow gradient line */}
      <div className="relative h-[44px] w-full">
        {clusters.map((cluster) => {
          const leftPct = toPercent(cluster.dbm);
          const ringColor = RING_COLOR_MAP[cluster.status];
          const tooltipTitle = `${cluster.dbm} dBm · ${cluster.apNames.join(', ')}`;

          return (
            <STooltip key={cluster.id} title={tooltipTitle}>
              <div
                className="group absolute bottom-[1px] -translate-x-1/2 cursor-pointer"
                style={{ left: `${leftPct}%` }}
                data-testid={`ap-cluster-${cluster.id}`}
              >
                <div className="relative flex flex-col items-center">
                  {/* Circular AP marker */}
                  <div
                    className="relative flex h-[28px] w-[28px] items-center justify-center rounded-full shadow-xs transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: 'var(--omada-dash-ap-bubble-bg, var(--omada-text-inverse))',
                      border: `2px solid ${ringColor}`,
                    }}
                  >
                    <SProductImage
                      name={cluster.productSlug}
                      size={18}
                      theme="light"
                      alt={cluster.apNames.join(', ')}
                    />
                    <span
                      className="tabular-nums absolute -top-[5px] -right-[7px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--omada-brand)] px-1 text-[10px] font-semibold leading-none text-white"
                      aria-label={`${cluster.count} APs`}
                    >
                      {cluster.count}
                    </span>
                  </div>
                  {/* Tiny stem connecting marker down to gradient line */}
                  <span
                    className="block h-[2px] w-[1.5px]"
                    style={{ backgroundColor: ringColor }}
                  />
                </div>
              </div>
            </STooltip>
          );
        })}

        {/* 2px Rainbow Gradient Line */}
        <div className="omada-dash-rainbow-ruler absolute inset-x-0 bottom-0" />
      </div>

      {/* Tick Marks and dBm Labels */}
      <div className="relative h-[24px] w-full">
        {ticks.map((tick, index) => {
          const leftPct = toPercent(tick);
          return (
            <div
              key={tick}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${leftPct}%` }}
            >
              <span className="block h-[4px] w-px bg-[var(--omada-border-strong)]" />
              <span className="tabular-nums mt-1 whitespace-nowrap text-[11px] leading-none text-[var(--omada-text-tertiary)]">
                {index === 0 ? `${tick}dBm` : tick}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
