import React from 'react';
import { SIcon } from '../assets/SIcon';
import { STooltip } from './STooltip';

export interface SHealthGaugeProps {
  /** Current site/device health score from `0` to `maxScore`. */
  score?: number;
  /** Maximum gauge score (defaults to `100`). */
  maxScore?: number;
  /** Subtitle beneath the large numeric score. */
  label?: React.ReactNode;
  /** Optional tooltip text displayed on the info icon next to `label`. */
  tooltip?: React.ReactNode;
  /** Width of the gauge SVG in pixels (defaults to `248`). */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GAUGE_TICKS = [0, 25, 50, 75, 100] as const;

function polarPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
}

function resolveScoreColor(ratio: number): string {
  if (ratio >= 0.8) return 'var(--omada-dash-arc-fill, var(--omada-brand-hover))';
  if (ratio >= 0.6) return 'var(--omada-color-warning)';
  return 'var(--omada-color-error)';
}

/**
 * 180-degree Omada Network Health semi-circle gauge featuring outer `0..100` ticks,
 * rounded emerald progress arc, centered large numeric readout, and info tooltip.
 */
export const SHealthGauge: React.FC<SHealthGaugeProps> = ({
  score = 90,
  maxScore = 100,
  label = 'Health Score',
  tooltip = 'Overall site health aggregated from Device, Client, Wi-Fi, and WAN telemetry.',
  width = 252,
  className = '',
  style,
}) => {
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const ratio = maxScore > 0 ? clampedScore / maxScore : 0;

  const vw = 252;
  const vh = 130;
  const cx = vw / 2;
  const cy = 112;
  const r = 82;
  const labelRadius = 99;

  const arcStart = polarPoint(cx, cy, r, 180);
  const arcEnd = polarPoint(cx, cy, r, 0);
  const trackPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  const endAngle = 180 - ratio * 180;
  const progressEnd = polarPoint(cx, cy, r, endAngle);
  const progressPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${progressEnd.x} ${progressEnd.y}`;
  const arcColor = resolveScoreColor(ratio);

  return (
    <div
      className={`relative mx-auto flex flex-col items-center select-none ${className}`.trim()}
      style={{ width, ...style }}
      aria-label={`Health Score ${clampedScore} out of ${maxScore}`}
    >
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        width={width}
        height={Math.round((width * vh) / vw)}
        className="block overflow-visible"
        role="img"
        aria-hidden="true"
      >
        {/* Background 180° Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="var(--omada-dash-arc-track, var(--omada-border-divider))"
          strokeWidth={8}
          strokeLinecap="round"
        />

        {/* Active Score Arc */}
        {ratio > 0 && (
          <path
            d={progressPath}
            fill="none"
            stroke={arcColor}
            strokeWidth={8}
            strokeLinecap="round"
          />
        )}

        {/* Outer Scale Tick Labels (0, 25, 50, 75, 100) */}
        {GAUGE_TICKS.map((tick) => {
          const angle = 180 - (tick / 100) * 180;
          const pt = polarPoint(cx, cy, labelRadius, angle);
          const dy = tick === 0 || tick === 100 ? 3 : tick === 50 ? 2 : 3;
          return (
            <text
              key={tick}
              x={pt.x}
              y={pt.y + dy}
              textAnchor="middle"
              fontSize={10}
              fill="var(--omada-text-tertiary)"
              className="tabular-nums"
            >
              {tick}
            </text>
          );
        })}
      </svg>

      {/* Centered Score + Subtitle aligned over arc baseline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[6px] flex flex-col items-center">
        <div
          className="tabular-nums text-[32px] font-medium leading-[36px] text-[var(--omada-text-primary)]"
          data-testid="health-gauge-score"
        >
          {Math.round(clampedScore)}
        </div>
        <div className="pointer-events-auto mt-1 flex items-center gap-1 text-[12px] leading-4 text-[var(--omada-text-secondary)]">
          <span>{label}</span>
          {tooltip ? (
            <STooltip title={tooltip}>
              <button
                type="button"
                aria-label="Health score details"
                className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0"
              >
                <SIcon name="info" size={14} />
              </button>
            </STooltip>
          ) : (
            <SIcon name="info" size={14} />
          )}
        </div>
      </div>
    </div>
  );
};

export interface SHealthRadarProps {
  /** Wi-Fi dimension health score (`0..maxValue`). */
  wifi?: number;
  /** Client dimension health score (`0..maxValue`). */
  client?: number;
  /** WAN dimension health score (`0..maxValue`). */
  wan?: number;
  /** Device dimension health score (`0..maxValue`). */
  device?: number;
  /** Maximum dimension scale (defaults to `100`). */
  maxValue?: number;
  /** Optional tooltip shown on the WAN `(i)` icon. */
  wanTooltip?: React.ReactNode;
  /** SVG width/height square box in pixels (defaults to `252` wide × `180` tall). */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

const RADAR_RINGS = [0.25, 0.5, 0.75, 1] as const;

/**
 * 4-axis concentric circular radar visualization (`Wi-Fi`, `Client`, `WAN`, `Device`)
 * with translucent emerald polygon fill and vertex markers.
 */
export const SHealthRadar: React.FC<SHealthRadarProps> = ({
  wifi = 86,
  client = 85,
  wan = 0,
  device = 80,
  maxValue = 100,
  wanTooltip = 'WAN health score is unavailable when no active WAN traffic is detected.',
  width = 252,
  className = '',
  style,
}) => {
  const height = 176;
  const cx = width / 2;
  const cy = 88;
  const maxR = 60;

  const norm = (val: number) => Math.max(0, Math.min(val / maxValue, 1));
  const wifiR = norm(wifi) * maxR;
  const clientR = norm(client) * maxR;
  const wanR = norm(wan) * maxR;
  const deviceR = norm(device) * maxR;

  const points: Array<{ key: string; x: number; y: number; value: number }> = [
    { key: 'Wi-Fi', x: cx, y: cy - wifiR, value: wifi },
    { key: 'Client', x: cx + clientR, y: cy, value: client },
    { key: 'WAN', x: cx, y: cy + wanR, value: wan },
    { key: 'Device', x: cx - deviceR, y: cy, value: device },
  ];

  const polygonPoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div
      className={`relative mx-auto select-none ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-label={`Health Radar: Wi-Fi ${wifi}, Client ${client}, WAN ${wan}, Device ${device}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="block"
        role="img"
        aria-hidden="true"
      >
        {/* 4 Concentric Rings */}
        {RADAR_RINGS.map((ring) => (
          <circle
            key={ring}
            cx={cx}
            cy={cy}
            r={maxR * ring}
            fill="none"
            stroke="var(--omada-dash-radar-grid, var(--omada-border-divider))"
            strokeWidth={1}
          />
        ))}

        {/* Vertical & Horizontal Axes */}
        <line
          x1={cx}
          y1={cy - maxR}
          x2={cx}
          y2={cy + maxR}
          stroke="var(--omada-dash-radar-grid, var(--omada-border-divider))"
          strokeWidth={1}
        />
        <line
          x1={cx - maxR}
          y1={cy}
          x2={cx + maxR}
          y2={cy}
          stroke="var(--omada-dash-radar-grid, var(--omada-border-divider))"
          strokeWidth={1}
        />

        {/* Score Polygon */}
        <polygon
          points={polygonPoints}
          fill="var(--omada-dash-radar-fill, rgba(5, 193, 120, 0.14))"
          stroke="var(--omada-dash-radar-stroke, var(--omada-brand-hover))"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Vertex Dots */}
        {points.map((pt) => (
          <circle
            key={pt.key}
            cx={pt.x}
            cy={pt.y}
            r={2.8}
            fill="var(--omada-dash-radar-stroke, var(--omada-brand-hover))"
          />
        ))}
      </svg>

      {/* Axis Labels Positioned Around Concentric Rings */}
      <STooltip title={`Wi-Fi: ${wifi}`}>
        <span className="absolute top-[4px] left-1/2 -translate-x-1/2 cursor-default text-[12px] leading-4 text-[var(--omada-text-secondary)]">
          Wi-Fi
        </span>
      </STooltip>

      <STooltip title={`Client: ${client}`}>
        <span className="absolute top-1/2 right-[18px] -translate-y-1/2 cursor-default text-[12px] leading-4 text-[var(--omada-text-secondary)]">
          Client
        </span>
      </STooltip>

      <div className="absolute bottom-[4px] left-1/2 flex -translate-x-1/2 items-center gap-1 text-[12px] leading-4 text-[var(--omada-text-secondary)]">
        <STooltip title={`WAN: ${wan}`}>
          <span className="cursor-default">WAN</span>
        </STooltip>
        <STooltip title={wanTooltip}>
          <button
            type="button"
            aria-label="WAN health details"
            className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <SIcon name="info" size={14} />
          </button>
        </STooltip>
      </div>

      <STooltip title={`Device: ${device}`}>
        <span className="absolute top-1/2 left-[14px] -translate-y-1/2 cursor-default text-[12px] leading-4 text-[var(--omada-text-secondary)]">
          Device
        </span>
      </STooltip>
    </div>
  );
};
