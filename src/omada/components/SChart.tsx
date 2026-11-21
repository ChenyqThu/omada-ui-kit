import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaChartPalette, omadaFontFamily } from '../theme/tokens';

export interface SChartProps {
  option: EChartsOption;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

function applyAxisTheme<T extends EChartsOption['xAxis'] | EChartsOption['yAxis']>(
  axis: T,
  borderColor: string,
  labelColor: string,
  dashedGrid: boolean,
): T {
  if (!axis) return axis;
  const decorate = (single: Record<string, unknown>) => ({
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
    splitLine: dashedGrid
      ? {
          show: true,
          lineStyle: {
            color: 'rgba(128, 128, 128, 0.16)',
            type: 'dashed' as const,
          },
          ...(typeof single.splitLine === 'object' ? single.splitLine : {}),
        }
      : single.splitLine,
  });

  if (Array.isArray(axis)) {
    return axis.map((a) => decorate(a as Record<string, unknown>)) as T;
  }
  return decorate(axis as Record<string, unknown>) as T;
}

/**
 * ECharts 5 chart wrapper pre-configured with Omada's 20-color categorical palette,
 * `Manrope` typography, dashed horizontal gridlines, Light/Dark live theme sync, and `ResizeObserver`.
 */
export const SChart: React.FC<SChartProps> = ({
  option,
  height = 260,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<ECharts | null>(null);
  const { resolvedTheme, tokens } = useOmadaTheme();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = echarts.init(el);
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
  }, []);

  useEffect(() => {
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
              color: '#FFFFFF',
              fontSize: 12,
              fontFamily: omadaFontFamily.sans,
            },
            ...(typeof option.tooltip === 'object' ? option.tooltip : {}),
          }
        : option.tooltip;

    const mergedLegend =
      option.legend && typeof option.legend === 'object' && !Array.isArray(option.legend)
        ? {
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
  }, [option, resolvedTheme, tokens]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`.trim()}
      style={{ height, ...style }}
    />
  );
};
