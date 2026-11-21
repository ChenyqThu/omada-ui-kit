import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaChartPalette, omadaFontFamily } from '../theme/tokens';
import { SEmpty } from './SEmpty';

export interface SChartProps {
  option: EChartsOption;
  height?: number | string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  renderer?: 'canvas' | 'svg';
  className?: string;
  style?: React.CSSProperties;
}

function withAlpha(hexOrColor: string, alpha: number): string {
  const hex = hexOrColor.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrColor;
}

function applyAxisTheme<T extends EChartsOption['xAxis'] | EChartsOption['yAxis']>(
  axis: T,
  borderColor: string,
  labelColor: string,
  defaultDashedGrid: boolean,
): T {
  if (!axis) return axis;
  const decorate = (single: Record<string, unknown>) => {
    const isValueAxis = single.type === 'value';
    const shouldShowSplit =
      single.splitLine !== undefined
        ? false
        : defaultDashedGrid || isValueAxis;

    return {
      ...single,
      axisLine: {
        lineStyle: { color: borderColor },
        ...(typeof single.axisLine === 'object' ? single.axisLine : {}),
      },
      axisTick: {
        lineStyle: { color: borderColor },
        ...(typeof single.axisTick === 'object' ? single.axisTick : {}),
      },
      axisLabel: {
        color: labelColor,
        fontSize: 11,
        fontFamily: omadaFontFamily.sans,
        ...(typeof single.axisLabel === 'object' ? single.axisLabel : {}),
      },
      splitLine: shouldShowSplit
        ? {
            show: true,
            lineStyle: {
              color: 'rgba(128, 128, 128, 0.16)',
              type: 'dashed' as const,
            },
          }
        : single.splitLine,
    };
  };

  if (Array.isArray(axis)) {
    return axis.map((a) => decorate(a as Record<string, unknown>)) as T;
  }
  return decorate(axis as Record<string, unknown>) as T;
}

const ChartLoadingSkeleton: React.FC<{ height: number | string; className?: string; style?: React.CSSProperties }> = ({
  height,
  className = '',
  style,
}) => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading chart"
    className={`flex w-full flex-col justify-between rounded-lg bg-[var(--omada-bg-field)]/50 p-4 ${className}`.trim()}
    style={{ height, ...style }}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="h-3 w-28 animate-pulse rounded bg-[var(--omada-border-divider)]" />
      <div className="flex gap-3">
        <div className="h-3 w-16 animate-pulse rounded bg-[var(--omada-border-divider)]" />
        <div className="h-3 w-16 animate-pulse rounded bg-[var(--omada-border-divider)]" />
      </div>
    </div>
    <div className="my-3 flex flex-1 items-end gap-2.5 px-2 pt-4">
      {[42, 68, 54, 86, 62, 92, 74, 58].map((pct, idx) => (
        <div
          key={idx}
          className="flex-1 animate-pulse rounded-t bg-[var(--omada-border-divider)]"
          style={{ height: `${pct}%` }}
        />
      ))}
    </div>
    <div className="flex justify-between gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="h-2.5 w-10 animate-pulse rounded bg-[var(--omada-border-divider)]" />
      ))}
    </div>
  </div>
);

/**
 * ECharts 5 chart wrapper pre-configured with Omada's 20-color categorical palette,
 * `Manrope` typography, dashed gridlines, Light/Dark live theme sync, `ResizeObserver`,
 * loading skeleton, and `<SEmpty>` empty state.
 */
export const SChart: React.FC<SChartProps> = ({
  option,
  height = 260,
  loading = false,
  empty = false,
  emptyTitle = 'No chart data',
  emptyDescription = 'Telemetry will appear here once data points are recorded.',
  renderer,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<ECharts | null>(null);
  const { resolvedTheme, tokens } = useOmadaTheme();

  useEffect(() => {
    if (loading || empty) return;
    const el = containerRef.current;
    if (!el) return;

    const isJsdom =
      typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom');
    const resolvedRenderer = renderer ?? (isJsdom ? 'svg' : 'canvas');

    let chart: ECharts;
    try {
      chart = echarts.init(el, undefined, {
        renderer: resolvedRenderer,
        ...(isJsdom && el.clientWidth === 0 ? { width: 600, height: typeof height === 'number' ? height : 260 } : {}),
      });
    } catch {
      chart = echarts.init(el, undefined, { renderer: 'svg' });
    }
    instanceRef.current = chart;

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        chart.resize();
      });
      observer.observe(el);
    }

    return () => {
      observer?.disconnect();
      chart.dispose();
      instanceRef.current = null;
    };
  }, [loading, empty, renderer, height]);

  useEffect(() => {
    if (loading || empty) return;
    const chart = instanceRef.current;
    if (!chart) return;

    const palette = [...omadaChartPalette[resolvedTheme]];
    const mergedTooltip =
      option.tooltip === undefined ||
      (typeof option.tooltip === 'object' && !Array.isArray(option.tooltip))
        ? {
            backgroundColor: tokens.bgTooltip,
            borderColor: 'transparent',
            borderWidth: 0,
            padding: [8, 12],
            textStyle: {
              color: tokens.textInverse,
              fontSize: 12,
              fontFamily: omadaFontFamily.sans,
            },
            ...(typeof option.tooltip === 'object' ? option.tooltip : {}),
          }
        : option.tooltip;

    const mergedLegend =
      option.legend && typeof option.legend === 'object' && !Array.isArray(option.legend)
        ? {
            itemGap: 24,
            selectedMode: true,
            textStyle: {
              color: tokens.textSecondary,
              fontSize: 12,
              fontFamily: omadaFontFamily.sans,
              ...(option.legend.textStyle ?? {}),
            },
            ...option.legend,
          }
        : option.legend;

    const themedOption: EChartsOption = {
      ...option,
      color: option.color ?? palette,
      backgroundColor: option.backgroundColor ?? 'transparent',
      textStyle: {
        fontFamily: omadaFontFamily.sans,
        color: tokens.textSecondary,
        ...option.textStyle,
      },
      tooltip: mergedTooltip,
      legend: mergedLegend,
      xAxis: applyAxisTheme(option.xAxis, tokens.borderDivider, tokens.textTertiary, false),
      yAxis: applyAxisTheme(
        option.yAxis,
        tokens.borderDivider,
        tokens.textTertiary,
        true,
      ) as EChartsOption['yAxis'],
    };

    chart.setOption(themedOption, true);
  }, [option, resolvedTheme, tokens, loading, empty]);

  if (loading) {
    return <ChartLoadingSkeleton height={height} className={className} style={style} />;
  }

  if (empty) {
    return (
      <div
        className={`flex w-full items-center justify-center ${className}`.trim()}
        style={{ height, ...style }}
      >
        <SEmpty
          title={emptyTitle}
          description={emptyDescription}
          illustrationWidth={120}
          className="h-full w-full py-4"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`.trim()}
      style={{ height, ...style }}
    />
  );
};

export interface SLineChartSeries {
  name: string;
  data: (number | null)[];
  color?: string;
  area?: boolean;
  smooth?: boolean;
  dashed?: boolean;
  showSymbol?: boolean;
  stack?: string;
}

export interface SLineChartProps {
  xData: string[];
  series: SLineChartSeries[];
  area?: boolean;
  smooth?: boolean;
  /** Fixes Y-axis to 0%–100% with 6 ticks (`0, 20, 40, 60, 80, 100`). */
  percentage?: boolean;
  yUnit?: string;
  yMin?: number;
  yMax?: number;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom';
  height?: number | string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  optionOverride?: EChartsOption;
}

/**
 * Omada multi-series Line / Area chart preset with 5-tick default or 6-tick percentage Y-axis,
 * gradient area fill, interactive legend toggling, loading skeleton, and empty state.
 */
export const SLineChart: React.FC<SLineChartProps> = ({
  xData,
  series,
  area = true,
  smooth = true,
  percentage = false,
  yUnit,
  yMin,
  yMax,
  showLegend = true,
  legendPosition = 'top',
  height = 260,
  loading = false,
  empty,
  emptyTitle,
  emptyDescription,
  className = '',
  style,
  optionOverride,
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];

  const isAutoEmpty =
    xData.length === 0 ||
    series.length === 0 ||
    series.every((s) => s.data.length === 0);
  const isEmpty = empty ?? isAutoEmpty;

  const option = useMemo<EChartsOption>(() => {
    const unitSuffix = percentage ? '%' : yUnit ? ` ${yUnit}` : '';

    return {
      tooltip: {
        trigger: 'axis',
        valueFormatter: unitSuffix
          ? (val) => `${val ?? '—'}${unitSuffix}`
          : undefined,
      },
      legend: showLegend
        ? {
            data: series.map((s) => s.name),
            icon: 'roundRect',
            itemWidth: 16,
            itemHeight: 3,
            itemGap: 24,
            ...(legendPosition === 'bottom'
              ? { bottom: 0, left: 'center' }
              : { top: 0, right: 0 }),
          }
        : undefined,
      grid: {
        left: 44,
        right: 16,
        top: showLegend && legendPosition === 'top' ? 36 : 16,
        bottom: showLegend && legendPosition === 'bottom' ? 36 : 26,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
      },
      yAxis: {
        type: 'value',
        ...(percentage
          ? {
              min: 0,
              max: 100,
              interval: 20,
              axisLabel: { formatter: '{value}%' },
            }
          : {
              min: yMin,
              max: yMax,
              splitNumber: 5,
              axisLabel: yUnit ? { formatter: `{value}${yUnit}` } : undefined,
            }),
      },
      series: series.map((s, idx) => {
        const lineColor = s.color ?? palette[idx % palette.length];
        const useArea = s.area ?? area;
        return {
          name: s.name,
          type: 'line',
          smooth: s.smooth ?? smooth,
          showSymbol: s.showSymbol ?? false,
          stack: s.stack,
          lineStyle: {
            width: 2,
            color: lineColor,
            type: s.dashed ? 'dashed' : 'solid',
          },
          itemStyle: { color: lineColor },
          areaStyle: useArea
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: withAlpha(lineColor, 0.24) },
                  { offset: 1, color: withAlpha(lineColor, 0.02) },
                ]),
              }
            : undefined,
          data: s.data,
        };
      }),
      ...optionOverride,
    };
  }, [
    xData,
    series,
    area,
    smooth,
    percentage,
    yUnit,
    yMin,
    yMax,
    showLegend,
    legendPosition,
    palette,
    optionOverride,
  ]);

  return (
    <SChart
      option={option}
      height={height}
      loading={loading}
      empty={isEmpty}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      className={className}
      style={style}
    />
  );
};

export interface SBarChartSeries {
  name: string;
  data: number[];
  color?: string;
  stack?: string;
}

export interface SBarChartProps {
  categories: string[];
  series: SBarChartSeries[];
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
  barWidth?: number;
  percentage?: boolean;
  unit?: string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom';
  height?: number | string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  optionOverride?: EChartsOption;
}

/**
 * Omada Bar chart preset supporting vertical, stacked, and horizontal layouts
 * with 5-tick (or 6-tick percentage) axis scaling, loading skeleton, and empty state.
 */
export const SBarChart: React.FC<SBarChartProps> = ({
  categories,
  series,
  layout = 'vertical',
  stacked = false,
  barWidth = 18,
  percentage = false,
  unit,
  showLegend,
  legendPosition = 'top',
  height = 260,
  loading = false,
  empty,
  emptyTitle,
  emptyDescription,
  className = '',
  style,
  optionOverride,
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];
  const isHorizontal = layout === 'horizontal';
  const resolvedShowLegend = showLegend ?? series.length > 1;

  const isAutoEmpty =
    categories.length === 0 ||
    series.length === 0 ||
    series.every((s) => s.data.length === 0);
  const isEmpty = empty ?? isAutoEmpty;

  const option = useMemo<EChartsOption>(() => {
    const unitSuffix = percentage ? '%' : unit ? ` ${unit}` : '';
    const valueAxis: EChartsOption['yAxis'] = {
      type: 'value',
      ...(percentage
        ? {
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: { formatter: '{value}%' },
          }
        : {
            splitNumber: 5,
            axisLabel: unit ? { formatter: `{value}${unit}` } : undefined,
          }),
    };

    const categoryAxis: EChartsOption['xAxis'] = {
      type: 'category',
      data: categories,
      splitLine: { show: false },
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: unitSuffix
          ? (val) => `${val ?? '—'}${unitSuffix}`
          : undefined,
      },
      legend: resolvedShowLegend
        ? {
            data: series.map((s) => s.name),
            icon: 'roundRect',
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 24,
            ...(legendPosition === 'bottom'
              ? { bottom: 0, left: 'center' }
              : { top: 0, right: 0 }),
          }
        : undefined,
      grid: {
        left: isHorizontal ? 90 : 44,
        right: 18,
        top: resolvedShowLegend && legendPosition === 'top' ? 36 : 16,
        bottom: resolvedShowLegend && legendPosition === 'bottom' ? 36 : 26,
      },
      xAxis: isHorizontal ? (valueAxis as EChartsOption['xAxis']) : categoryAxis,
      yAxis: isHorizontal ? (categoryAxis as EChartsOption['yAxis']) : valueAxis,
      series: series.map((s, idx) => {
        const barColor = s.color ?? palette[idx % palette.length];
        const stackKey = s.stack ?? (stacked ? 'total' : undefined);
        const isTopOfStack = !stackKey || idx === series.length - 1;
        const borderRadius = isTopOfStack
          ? isHorizontal
            ? [0, 4, 4, 0]
            : [4, 4, 0, 0]
          : 0;
        return {
          name: s.name,
          type: 'bar',
          stack: stackKey,
          barWidth,
          itemStyle: {
            color: barColor,
            borderRadius,
          },
          data: s.data,
        };
      }),
      ...optionOverride,
    };
  }, [
    categories,
    series,
    isHorizontal,
    stacked,
    barWidth,
    percentage,
    unit,
    resolvedShowLegend,
    legendPosition,
    palette,
    optionOverride,
  ]);

  return (
    <SChart
      option={option}
      height={height}
      loading={loading}
      empty={isEmpty}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      className={className}
      style={style}
    />
  );
};

export interface SDonutChartDatum {
  name: string;
  value: number;
  color?: string;
}

export interface SDonutChartProps {
  data: SDonutChartDatum[];
  centerValue?: React.ReactNode;
  centerLabel?: React.ReactNode;
  radius?: [string, string];
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'right';
  unit?: string;
  height?: number | string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  optionOverride?: EChartsOption;
}

/**
 * Omada Donut ring chart preset with optional center KPI metric overlay,
 * interactive legend, loading skeleton, and empty state.
 */
export const SDonutChart: React.FC<SDonutChartProps> = ({
  data,
  centerValue,
  centerLabel,
  radius = ['56%', '76%'],
  showLegend = true,
  legendPosition = 'bottom',
  unit,
  height = 240,
  loading = false,
  empty,
  emptyTitle,
  emptyDescription,
  className = '',
  style,
  optionOverride,
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];

  const isAutoEmpty = data.length === 0 || data.every((d) => d.value <= 0);
  const isEmpty = empty ?? isAutoEmpty;

  const ringCenter: [string, string] = showLegend
    ? legendPosition === 'right'
      ? ['34%', '50%']
      : ['50%', '43%']
    : ['50%', '50%'];

  const option = useMemo<EChartsOption>(() => {
    const unitSuffix = unit ? ` ${unit}` : '';
    return {
      tooltip: {
        trigger: 'item',
        valueFormatter: unitSuffix
          ? (val) => `${val ?? '—'}${unitSuffix}`
          : undefined,
      },
      legend: showLegend
        ? legendPosition === 'right'
          ? {
              orient: 'vertical',
              right: 8,
              top: 'middle',
              itemWidth: 10,
              itemHeight: 10,
              itemGap: 12,
            }
          : {
              bottom: 0,
              left: 'center',
              itemWidth: 10,
              itemHeight: 10,
              itemGap: 18,
            }
        : undefined,
      series: [
        {
          type: 'pie',
          radius,
          center: ringCenter,
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: data.map((item, idx) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color ?? palette[idx % palette.length],
            },
          })),
        },
      ],
      ...optionOverride,
    };
  }, [data, radius, ringCenter, showLegend, legendPosition, unit, palette, optionOverride]);

  return (
    <div className={`relative w-full ${className}`.trim()} style={{ height, ...style }}>
      <SChart
        option={option}
        height={height}
        loading={loading}
        empty={isEmpty}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      {!loading && !isEmpty && (centerValue !== undefined || centerLabel !== undefined) && (
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center"
          style={{ left: ringCenter[0], top: ringCenter[1] }}
        >
          {centerValue !== undefined && (
            <div className="tabular-nums text-xl font-semibold leading-tight text-[var(--omada-text-primary)]">
              {centerValue}
            </div>
          )}
          {centerLabel !== undefined && (
            <div className="mt-0.5 text-[11px] font-medium text-[var(--omada-text-secondary)]">
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export interface SSparkChartProps {
  data: number[];
  labels?: string[];
  seriesName?: string;
  variant?: 'line' | 'area' | 'bar';
  color?: string;
  unit?: string;
  /** Shows strictly 2 Y-axis ticks (`min` and `max`) per Omada widget spec. */
  showAxisTicks?: boolean;
  height?: number | string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  optionOverride?: EChartsOption;
}

/**
 * Compact dashboard widget spark chart featuring strictly 2 Y-axis ticks (`min` and `max`),
 * supporting `area`, `line`, and `bar` modes.
 */
export const SSparkChart: React.FC<SSparkChartProps> = ({
  data,
  labels,
  seriesName = 'Value',
  variant = 'area',
  color,
  unit,
  showAxisTicks = true,
  height = 96,
  loading = false,
  empty,
  emptyTitle,
  emptyDescription,
  className = '',
  style,
  optionOverride,
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];
  const resolvedColor = color ?? palette[0];
  const isEmpty = empty ?? data.length === 0;

  const option = useMemo<EChartsOption>(() => {
    const rawMin = data.length > 0 ? Math.min(...data) : 0;
    const rawMax = data.length > 0 ? Math.max(...data) : 100;
    const axisMin = rawMin === rawMax ? 0 : rawMin;
    const axisMax = rawMin === rawMax ? (rawMax === 0 ? 10 : rawMax) : rawMax;
    const span = Math.max(axisMax - axisMin, 1);
    const xLabels = labels ?? data.map((_, i) => String(i + 1));
    const unitSuffix = unit ? `${unit}` : '';

    return {
      tooltip: {
        trigger: 'axis',
        valueFormatter: unitSuffix
          ? (val) => `${val ?? '—'}${unitSuffix}`
          : undefined,
      },
      grid: {
        left: showAxisTicks ? 42 : 4,
        right: 6,
        top: 10,
        bottom: 10,
      },
      xAxis: {
        type: 'category',
        boundaryGap: variant === 'bar',
        data: xLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'value',
        min: axisMin,
        max: axisMax,
        interval: span,
        splitNumber: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: showAxisTicks,
          formatter: (val: number) => `${val}${unitSuffix}`,
        },
      },
      series:
        variant === 'bar'
          ? [
              {
                name: seriesName,
                type: 'bar',
                barWidth: '55%',
                itemStyle: {
                  color: resolvedColor,
                  borderRadius: [2, 2, 0, 0],
                },
                data,
              },
            ]
          : [
              {
                name: seriesName,
                type: 'line',
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 2, color: resolvedColor },
                itemStyle: { color: resolvedColor },
                areaStyle:
                  variant === 'area'
                    ? {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                          { offset: 0, color: withAlpha(resolvedColor, 0.25) },
                          { offset: 1, color: withAlpha(resolvedColor, 0.02) },
                        ]),
                      }
                    : undefined,
                data,
              },
            ],
      ...optionOverride,
    };
  }, [
    data,
    labels,
    seriesName,
    variant,
    resolvedColor,
    unit,
    showAxisTicks,
    optionOverride,
  ]);

  return (
    <SChart
      option={option}
      height={height}
      loading={loading}
      empty={isEmpty}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      className={className}
      style={style}
    />
  );
};
