import React from 'react';
import { Badge, type BadgeProps } from 'antd';

export type SBadgeStatus = 'success' | 'warning' | 'error' | 'processing' | 'default';
export type SBadgeTone = 'error' | 'brand' | 'info' | 'warning' | 'neutral';

export interface SBadgeProps extends Omit<BadgeProps, 'size' | 'status'> {
  /** AntD 6 size (`'small' | 'medium'`; never deprecated `'default'`). */
  size?: 'small' | 'medium';
  /** Semantic status dot mode (`success`, `warning`, `error`, `processing`, `default`). */
  status?: SBadgeStatus;
  /** Count/dot semantic color tone when `color` is not manually provided. */
  tone?: SBadgeTone;
}

const TONE_COLORS: Record<SBadgeTone, string> = {
  error: 'var(--omada-color-error)',
  brand: 'var(--omada-brand)',
  info: 'var(--omada-color-info)',
  warning: 'var(--omada-color-warning)',
  neutral: 'var(--omada-text-tertiary)',
};

const STATUS_META: Record<SBadgeStatus, { color: string; pulse?: boolean }> = {
  success: { color: 'var(--omada-color-success)' },
  warning: { color: 'var(--omada-color-warning)' },
  error: { color: 'var(--omada-color-error)' },
  processing: { color: 'var(--omada-color-info)', pulse: true },
  default: { color: 'var(--omada-text-tertiary)' },
};

/**
 * Omada Badge supporting `20px`-tall capsule counts (`99+` overflow), standalone dots,
 * and semantic status indicators (`success`, `warning`, `error`, `processing`, `default`).
 */
export const SBadge: React.FC<SBadgeProps> = ({
  size = 'medium',
  status,
  tone = 'error',
  color,
  text,
  children,
  overflowCount = 99,
  className = '',
  styles,
  ...rest
}) => {
  if (status && !children) {
    const meta = STATUS_META[status];
    return (
      <span
        className={`inline-flex items-center gap-2 text-[13px] text-[var(--omada-text-primary)] ${className}`.trim()}
      >
        <span className="relative inline-flex h-2 w-2 shrink-0 items-center justify-center">
          {meta.pulse && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: color ?? meta.color }}
            />
          )}
          <span
            className="relative inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: color ?? meta.color }}
          />
        </span>
        {text !== undefined && <span>{text}</span>}
      </span>
    );
  }

  const resolvedColor =
    color ?? (status ? STATUS_META[status].color : TONE_COLORS[tone]);

  return (
    <Badge
      size={size}
      status={status}
      color={resolvedColor}
      text={text}
      overflowCount={overflowCount}
      className={`omada-badge ${className}`.trim()}
      styles={
        typeof styles === 'function'
          ? styles
          : {
              ...styles,
              indicator: {
                backgroundColor: !status ? resolvedColor : undefined,
                color: !status ? 'var(--omada-text-inverse)' : undefined,
                ...styles?.indicator,
              },
            }
      }
      {...rest}
    >
      {children}
    </Badge>
  );
};
