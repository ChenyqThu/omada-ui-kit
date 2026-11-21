import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { ChevronRight, X } from 'lucide-react';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaChartPalette } from '../theme/tokens';
import { SChart } from './SChart';

export interface SDonutSummaryItem {
  /** Unique item identifier. */
  key: string;
  /** Display label for the slice and breakdown row. */
  label: React.ReactNode;
  /** Numeric metric value used to compute slice proportions. */
  value: number;
  /** Formatted readout rendered on the right (e.g. `"58.30 MB"` or `"2 (50%)"`). */
  displayValue?: React.ReactNode;
  /** Optional override color for this slice and legend swatch. */
  color?: string;
  /** Optional leading icon/badge rendered before `label` in vertical item rows. */
  icon?: React.ReactNode;
  /** When true, styles the right value as a clickable action link with chevron. */
  clickable?: boolean;
}

export interface SDonutSummaryCardProps {
  /** Card header title. */
  title: React.ReactNode;
  /** Optional icon rendered before `title`. */
  titleIcon?: React.ReactNode;
  /** Primary metric centered inside the donut ring (e.g. `"58.33 MB"` or `"4"`). */
  centerValue: React.ReactNode;
  /** Secondary subtitle centered below `centerValue` (e.g. `"Traffic"` or `"Total"`). */
  centerLabel?: React.ReactNode;
  /** Breakdown items powering both the donut slices and the item/legend list. */
  data: SDonutSummaryItem[];
  /**
   * `'vertical'` stacks the donut above clickable breakdown rows (Application Analytics).
   * `'horizontal'` aligns the donut on the left and a compact legend on the right (Reports).
   */
  layout?: 'vertical' | 'horizontal';
  /** Number of columns for horizontal legend layout (`1` or `2`). */
  legendColumns?: 1 | 2;
  /** Donut canvas diameter in pixels. */
  donutSize?: number;
  /** ECharts pie inner/outer radius percentages. */
  radius?: [string, string];
  /** Show a close (`×`) button in the card header. */
  closable?: boolean;
  /** Callback invoked when the close (`×`) button is clicked. */
  onClose?: () => void;
  /** Accessibility label for the close button. */
  closeAriaLabel?: string;
  /** Callback invoked when a clickable breakdown row is activated. */
  onItemClick?: (item: SDonutSummaryItem) => void;
  /** Optional extra header element rendered when `closable` is false. */
  extra?: React.ReactNode;
  /** Optional accessible label or test id on the card root. */
  'data-testid'?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Omada Donut Summary Card pairing a ring chart with centered metric overlay and
 * either vertical interactive breakdown rows (`Application Analytics`) or a compact
 * side-by-side legend (`Reports`).
 */
export const SDonutSummaryCard: React.FC<SDonutSummaryCardProps> = ({
  title,
  titleIcon,
  centerValue,
  centerLabel,
  data,
  layout = 'vertical',
  legendColumns = 1,
  donutSize,
  radius = ['74%', '92%'],
  closable = false,
  onClose,
  closeAriaLabel,
  onItemClick,
  extra,
  'data-testid': dataTestId,
  className = '',
  style,
}) => {
  const { resolvedTheme, tokens } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];
  const resolvedSize = donutSize ?? (layout === 'vertical' ? 168 : 124);
  const surfaceBg = resolvedTheme === 'dark' ? tokens.bgOverlay : tokens.bgSurface;

  const resolvedData = useMemo(
    () =>
      data.map((item, idx) => ({
        ...item,
        resolvedColor: item.color ?? palette[idx % palette.length],
      })),
    [data, palette],
  );

  const positiveItems = useMemo(
    () => resolvedData.filter((item) => item.value > 0),
    [resolvedData],
  );

  const option = useMemo<EChartsOption>(() => {
    const hasData = positiveItems.length > 0;
    const hasMultiple = positiveItems.length > 1;
    return {
      animation: false,
      tooltip: hasData
        ? {
            trigger: 'item',
            confine: true,
            formatter: '{b}: {d}%',
          }
        : { show: false },
      series: [
        {
          type: 'pie',
          radius,
          center: ['50%', '50%'],
          silent: !hasData,
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            scale: hasData,
            scaleSize: 3,
          },
          itemStyle: {
            borderColor: surfaceBg,
            borderWidth: hasMultiple ? 1.5 : 0,
          },
          data: hasData
            ? positiveItems.map((item) => ({
                name: typeof item.label === 'string' ? item.label : item.key,
                value: item.value,
                itemStyle: { color: item.resolvedColor },
              }))
            : [
                {
                  name: 'No Data',
                  value: 1,
                  itemStyle: { color: tokens.borderDivider, borderWidth: 0 },
                },
              ],
        },
      ],
    };
  }, [positiveItems, radius, surfaceBg, tokens.borderDivider]);

  const isCompactLegend = layout === 'horizontal' && data.length > 4;

  return (
    <section
      data-testid={dataTestId}
      style={style}
      className={`omada-donut-summary-card flex h-full flex-col rounded-[8px] border border-[var(--omada-insights-card-border,var(--omada-border-divider))] bg-[var(--omada-insights-card-bg,var(--omada-bg-surface))] px-4 py-3.5 ${className}`.trim()}
    >
      {/* Header Row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {titleIcon && (
            <span className="inline-flex shrink-0 items-center text-[var(--omada-text-secondary)]">
              {titleIcon}
            </span>
          )}
          <h3 className="m-0 truncate text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
            {title}
          </h3>
        </div>
        {closable ? (
          <button
            type="button"
            aria-label={
              closeAriaLabel ??
              (typeof title === 'string' ? `Remove ${title}` : 'Remove card')
            }
            onClick={onClose}
            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-text-tertiary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
          >
            <X size={16} />
          </button>
        ) : (
          extra && <div className="shrink-0">{extra}</div>
        )}
      </div>

      {/* Body */}
      {layout === 'vertical' ? (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-center py-1">
            <div
              className="relative shrink-0"
              style={{ width: resolvedSize, height: resolvedSize }}
            >
              <SChart option={option} height={resolvedSize} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                <span className="tabular-nums text-[20px] font-semibold leading-[26px] text-[var(--omada-text-primary)]">
                  {centerValue}
                </span>
                {centerLabel !== undefined && (
                  <span className="mt-0.5 text-[12px] leading-[16px] text-[var(--omada-text-tertiary)]">
                    {centerLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {resolvedData.length > 0 && (
            <div className="flex flex-col gap-2">
              {resolvedData.map((item) => {
                const isInteractive = Boolean(item.clickable || onItemClick);
                return (
                  <div
                    key={item.key}
                    className="flex min-w-0 items-center justify-between gap-3 text-[13px] leading-[20px]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{ backgroundColor: item.resolvedColor }}
                      />
                      {item.icon && (
                        <span className="inline-flex shrink-0 items-center">
                          {item.icon}
                        </span>
                      )}
                      <span className="truncate text-[var(--omada-text-primary)]">
                        {item.label}
                      </span>
                    </div>

                    {isInteractive ? (
                      <button
                        type="button"
                        onClick={() => onItemClick?.(item)}
                        className="tabular-nums inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[13px] font-medium text-[var(--omada-link)] hover:underline"
                      >
                        <span>{item.displayValue ?? item.value}</span>
                        <ChevronRight size={14} className="shrink-0" />
                      </button>
                    ) : (
                      <span className="tabular-nums shrink-0 text-[13px] text-[var(--omada-text-secondary)]">
                        {item.displayValue ?? item.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <div
            className="relative shrink-0"
            style={{ width: resolvedSize, height: resolvedSize }}
          >
            <SChart option={option} height={resolvedSize} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
              <span className="tabular-nums text-[22px] font-semibold leading-[26px] text-[var(--omada-text-primary)]">
                {centerValue}
              </span>
              {centerLabel !== undefined && (
                <span className="mt-0.5 text-[12px] leading-[16px] text-[var(--omada-text-secondary)]">
                  {centerLabel}
                </span>
              )}
            </div>
          </div>

          <div
            className={
              legendColumns === 2
                ? 'grid min-w-0 flex-1 grid-cols-2 gap-x-2.5 gap-y-1.5'
                : `flex min-w-0 flex-1 flex-col ${isCompactLegend ? 'gap-1' : 'gap-2'}`
            }
          >
            {resolvedData.map((item) => (
              <div
                key={item.key}
                className={`flex min-w-0 items-center justify-between gap-2 ${
                  isCompactLegend
                    ? 'text-[11.5px] leading-[17px]'
                    : 'text-[12.5px] leading-[18px]'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-[6px] w-[6px] shrink-0 rounded-[1px]"
                    style={{ backgroundColor: item.resolvedColor }}
                  />
                  <span
                    className="truncate text-[var(--omada-text-primary)]"
                    title={typeof item.label === 'string' ? item.label : undefined}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="tabular-nums shrink-0 whitespace-nowrap text-[var(--omada-text-secondary)]">
                  {item.displayValue ?? item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
