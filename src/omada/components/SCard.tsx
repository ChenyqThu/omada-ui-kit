import React from 'react';

export interface SCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PADDING_MAP: Record<NonNullable<SCardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

/**
 * Omada surface card (`#FFFFFF` light / `#1A1A1A` dark, 8px radius, 1px hairline border).
 */
export const SCard: React.FC<SCardProps> = ({
  title,
  subtitle,
  extra,
  padding = 'md',
  children,
  className = '',
  style,
}) => {
  return (
    <div
      className={`rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] ${className}`.trim()}
      style={style}
    >
      {(title || extra) && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--omada-border-divider)] px-5 py-3.5">
          <div>
            {title && (
              <h3 className="m-0 text-[15px] font-semibold leading-5 text-[var(--omada-text-primary)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--omada-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div className="flex items-center gap-2">{extra}</div>}
        </div>
      )}
      <div className={PADDING_MAP[padding]}>{children}</div>
    </div>
  );
};

export interface SKpiCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  accentColor?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

/**
 * Compact Omada KPI metric tile with tabular numerals, optional icon, and breakdown meta line.
 */
export const SKpiCard: React.FC<SKpiCardProps> = ({
  title,
  value,
  icon,
  meta,
  accentColor,
  onClick,
  active = false,
  className = '',
}) => {
  const interactive = Boolean(onClick);
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`rounded-lg border bg-[var(--omada-bg-surface)] px-4 py-3.5 transition-colors ${
        active
          ? 'border-[var(--omada-brand)] ring-1 ring-[var(--omada-brand)]'
          : 'border-[var(--omada-border-divider)]'
      } ${
        interactive ? 'cursor-pointer hover:border-[var(--omada-brand)]' : ''
      } ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
          {title}
        </span>
        {icon && (
          <span className="inline-flex shrink-0 items-center justify-center leading-none">
            {icon}
          </span>
        )}
      </div>
      <div
        className="tabular-nums mt-1.5 text-2xl font-semibold leading-8 text-[var(--omada-text-primary)]"
        style={accentColor ? { color: accentColor } : undefined}
      >
        {value}
      </div>
      {meta && (
        <div className="mt-1 text-xs text-[var(--omada-text-tertiary)]">{meta}</div>
      )}
    </div>
  );
};
