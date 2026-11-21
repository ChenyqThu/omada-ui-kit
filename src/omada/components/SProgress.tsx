import React from 'react';
import { Progress, theme as antdTheme, type ProgressProps } from 'antd';
import { SIcon } from '../assets/SIcon';

export type SProgressStatus =
  | 'normal'
  | 'active'
  | 'success'
  | 'warning'
  | 'exception';

export type SProgressVariant = 'default' | 'budget';

export interface SProgressProps
  extends Omit<ProgressProps, 'status' | 'trailColor' | 'gapPosition' | 'width'> {
  /** All 5 Figma visual states: `normal`, `active`, `success`, `warning`, `exception` */
  status?: SProgressStatus;
  /** Standard progress bar/ring (`default`) or resource/PoE power budget readout (`budget`) */
  variant?: SProgressVariant;
  /** Animated indeterminate linear progress bar (ignores `percent`) */
  indeterminate?: boolean;
  /** Optional header label rendered above linear progress or budget bar */
  label?: React.ReactNode;
  /** Used resource value for `variant="budget"` (e.g., `186.4`) */
  used?: number;
  /** Total capacity value for `variant="budget"` (e.g., `384`) */
  total?: number;
  /** Unit suffix for `variant="budget"` readout (defaults to `'W'`) */
  unit?: string;
  /** Percentage threshold switching `budget` status to `warning` (defaults to `80`) */
  warningThreshold?: number;
  /** Percentage threshold switching `budget` status to `exception` (defaults to `95`) */
  dangerThreshold?: number;
  /** Linear stroke thickness in px (defaults to `6` matching Figma spec) */
  strokeHeight?: number;
}

/**
 * Omada-styled Progress component supporting linear (`6px` pill bar), circular (`112px` ring),
 * all 5 Figma visual states (`normal`, `active`, `success`, `warning`, `exception`),
 * `indeterminate` animation, and a `variant="budget"` PoE power budget preset.
 */
export const SProgress: React.FC<SProgressProps> = ({
  type = 'line',
  variant = 'default',
  status,
  percent = 0,
  indeterminate = false,
  label,
  used,
  total,
  unit = 'W',
  warningThreshold = 80,
  dangerThreshold = 95,
  strokeHeight = 6,
  size,
  strokeColor,
  railColor,
  strokeLinecap = 'round',
  showInfo = true,
  format,
  className = '',
  ...rest
}) => {
  const { token } = antdTheme.useToken();
  const isBudget = variant === 'budget';
  const isCircle = type === 'circle' || type === 'dashboard';

  const computedPercent =
    isBudget && typeof used === 'number' && typeof total === 'number' && total > 0
      ? Math.min(100, Math.round((used / total) * 1000) / 10)
      : percent;

  const resolvedStatus: SProgressStatus =
    status ??
    (isBudget
      ? computedPercent >= dangerThreshold
        ? 'exception'
        : computedPercent >= warningThreshold
          ? 'warning'
          : 'normal'
      : 'normal');

  const statusColorMap: Record<SProgressStatus, string> = {
    normal: token.colorPrimary,
    active: token.colorPrimary,
    success: token.colorSuccess,
    warning: token.colorWarning,
    exception: token.colorError,
  };

  const resolvedStrokeColor = strokeColor ?? statusColorMap[resolvedStatus];
  const resolvedRailColor = railColor ?? token.colorFillTertiary;

  const antdStatus: ProgressProps['status'] =
    resolvedStatus === 'warning' ? 'normal' : resolvedStatus;

  const iconSize = isCircle ? 26 : 14;

  const resolvedFormat: ProgressProps['format'] =
    format ??
    (resolvedStatus === 'warning'
      ? () => (
          <span
            aria-label="Warning"
            className="inline-flex items-center justify-center"
          >
            <SIcon name="alert-status-warning" size={iconSize} />
          </span>
        )
      : resolvedStatus === 'exception' && !isCircle
        ? () => (
            <span
              aria-label="Error"
              className="inline-flex items-center justify-center"
            >
              <SIcon name="alert-status-failed" size={iconSize} />
            </span>
          )
        : resolvedStatus === 'success' && !isCircle
          ? () => (
              <span
                aria-label="Success"
                className="inline-flex items-center justify-center"
              >
                <SIcon name="alert-status-success" size={iconSize} />
              </span>
            )
          : undefined);

  const resolvedSize: ProgressProps['size'] = isCircle
    ? typeof size === 'number' || size === 'small' || size === 'medium'
      ? size
      : 112
    : (size ?? { height: strokeHeight });

  if (indeterminate && !isCircle) {
    return (
      <div
        data-progress-status={resolvedStatus}
        data-progress-indeterminate="true"
        className={`omada-progress w-full ${className}`.trim()}
      >
        {label && (
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-[var(--omada-text-primary)]">
            <span>{label}</span>
          </div>
        )}
        <div
          role="progressbar"
          aria-busy="true"
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative w-full overflow-hidden rounded-full"
          style={{
            height: strokeHeight,
            backgroundColor: resolvedRailColor,
          }}
        >
          <div
            className="omada-progress-indeterminate-bar h-full rounded-full"
            style={{
              backgroundColor:
                typeof resolvedStrokeColor === 'string'
                  ? resolvedStrokeColor
                  : token.colorPrimary,
            }}
          />
        </div>
      </div>
    );
  }

  const budgetReadout =
    isBudget && typeof used === 'number' && typeof total === 'number' ? (
      <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
        <strong className="font-semibold text-[var(--omada-text-primary)]">
          {used}
          {unit}
        </strong>{' '}
        / {total}
        {unit} ({computedPercent}%)
      </span>
    ) : isBudget ? (
      <span className="tabular-nums text-xs font-medium text-[var(--omada-text-secondary)]">
        {computedPercent}%
      </span>
    ) : null;

  const headerRow =
    (label || isBudget) && !isCircle ? (
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--omada-text-primary)]">
          {label && <span>{label}</span>}
          {isBudget && resolvedStatus === 'warning' && (
            <SIcon name="alert-status-warning" size={14} />
          )}
          {isBudget && resolvedStatus === 'exception' && (
            <SIcon name="alert-status-failed" size={14} />
          )}
        </div>
        {budgetReadout}
      </div>
    ) : null;

  return (
    <div
      data-progress-status={resolvedStatus}
      data-progress-variant={variant}
      className={`omada-progress ${isCircle ? 'inline-flex flex-col items-center gap-2' : 'w-full'} ${className}`.trim()}
    >
      {headerRow}
      <Progress
        type={type}
        percent={computedPercent}
        status={antdStatus}
        size={resolvedSize}
        strokeColor={resolvedStrokeColor}
        railColor={resolvedRailColor}
        strokeLinecap={strokeLinecap}
        showInfo={isBudget ? false : showInfo}
        format={resolvedFormat}
        {...rest}
      />
      {label && isCircle && (
        <div className="text-xs font-medium text-[var(--omada-text-secondary)]">
          {label}
        </div>
      )}
    </div>
  );
};
