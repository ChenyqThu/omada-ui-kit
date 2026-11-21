import React from 'react';
import { Spin, type SpinProps } from 'antd';
import { SIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';

export type SLoadingSize = 'sm' | 'md' | 'lg' | number;
export type SLoadingTone = 'brand' | 'neutral' | 'inverse';

const LOADING_SIZES: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 20,
  lg: 32,
};

const LOADING_ICONS: Record<SLoadingTone, OmadaIconName> = {
  brand: 'loading-icon-loading',
  neutral: 'loading-icon-loading-grey',
  inverse: 'loading-icon-loading-white',
};

interface SpinIconIndicatorProps {
  pixelSize: number;
  tone: SLoadingTone;
  percent?: number;
  className?: string;
  style?: React.CSSProperties;
}

const SpinIconIndicator: React.FC<SpinIconIndicatorProps> = ({
  pixelSize,
  tone,
  percent: _percent,
  className = '',
  style,
}) => {
  const toneClass = tone === 'neutral' ? 'omada-spinner-neutral' : '';
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`.trim()}
      style={{ width: pixelSize, height: pixelSize, ...style }}
    >
      <SIcon
        name={LOADING_ICONS[tone]}
        size={pixelSize}
        className={`omada-spin ${toneClass}`.trim()}
      />
    </span>
  );
};

export interface SLoadingProps
  extends Omit<SpinProps, 'size' | 'tip' | 'wrapperClassName'> {
  /** Spinner diameter preset (`sm`: 16px, `md`: 20px, `lg`: 32px) or custom px */
  size?: SLoadingSize;
  /** Visual spinner color tone (`brand`: Omada Green, `neutral`: grey/adaptive, `inverse`: white) */
  tone?: SLoadingTone;
  /** Optional loading label rendered with 8px gap next to or below the spinner */
  description?: React.ReactNode;
  /** Inline arrangement (`horizontal` matches Figma `Loading..` bar; `vertical` stacks centered) */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Omada loading spinner & container overlay backed by official Figma conic-ring SVG icons
 * (`16px` inline, `20px` default, `32px` container/fullscreen) and Ant Design 6 `<Spin>`.
 */
export const SLoading: React.FC<SLoadingProps> = ({
  size = 'md',
  tone = 'brand',
  spinning = true,
  description,
  layout,
  fullscreen = false,
  delay = 0,
  indicator,
  children,
  className = '',
  style,
  ...rest
}) => {
  const pixelSize = typeof size === 'number' ? size : LOADING_SIZES[size];
  const antdSize: SpinProps['size'] =
    pixelSize <= 16 ? 'small' : pixelSize >= 28 ? 'large' : 'medium';

  const resolvedIndicator =
    indicator ?? <SpinIconIndicator pixelSize={pixelSize} tone={tone} />;

  if (children !== undefined || fullscreen) {
    return (
      <Spin
        spinning={spinning}
        delay={delay}
        fullscreen={fullscreen}
        size={antdSize}
        description={description}
        indicator={resolvedIndicator}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </Spin>
    );
  }

  if (!spinning) {
    return null;
  }

  const resolvedLayout = layout ?? 'horizontal';
  const textToneClass =
    tone === 'inverse'
      ? 'text-[var(--omada-text-inverse)]'
      : tone === 'neutral'
        ? 'text-[var(--omada-text-secondary)]'
        : 'text-[var(--omada-brand-text)]';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-loading-size={pixelSize}
      data-loading-tone={tone}
      className={`inline-flex items-center justify-center gap-2 ${
        resolvedLayout === 'vertical' ? 'flex-col' : 'flex-row'
      } ${className}`.trim()}
      style={style}
    >
      <SpinIconIndicator pixelSize={pixelSize} tone={tone} />
      {description && (
        <span className={`text-[13px] font-medium leading-5 ${textToneClass}`}>
          {description}
        </span>
      )}
    </div>
  );
};

export type SSkeletonPreset = 'default' | 'list' | 'table' | 'card';

export interface SSkeletonProps {
  /** Layout preset (`default` text lines, `list` items, `table` grid, `card` surface) */
  preset?: SSkeletonPreset;
  /** When `false`, renders `children` instead of the skeleton placeholder */
  loading?: boolean;
  /** Enables animated Light/Dark gradient shimmer (defaults to `true`) */
  active?: boolean;
  /** Number of placeholder lines/rows (preset-dependent defaults) */
  rows?: number;
  /** Column count for `table` preset (defaults to `4`) */
  columns?: number;
  /** Shows circular avatar placeholder in `default` / `list` / `card` presets */
  avatar?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Omada skeleton loading placeholder (`default`, `list`, `table`, `card` presets)
 * using Light/Dark token gradient shimmer (`--omada-bg-field` -> `--omada-bg-field-hover`).
 */
export const SSkeleton: React.FC<SSkeletonProps> = ({
  preset = 'default',
  loading = true,
  active = true,
  rows,
  columns = 4,
  avatar,
  children,
  className = '',
  style,
}) => {
  if (!loading && children !== undefined) {
    return <>{children}</>;
  }

  const barClass = `omada-skeleton-bar ${active ? 'is-active' : ''}`.trim();
  const showAvatar = avatar ?? preset === 'list';

  if (preset === 'list') {
    const itemCount = rows ?? 4;
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading list"
        data-skeleton-preset="list"
        className={`divide-y divide-[var(--omada-border-divider)] ${className}`.trim()}
        style={style}
      >
        {Array.from({ length: itemCount }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {showAvatar && (
              <div className={`${barClass} h-8 w-8 shrink-0 !rounded-full`} />
            )}
            <div className="flex-1 space-y-2">
              <div className={`${barClass} h-3.5 w-2/5`} />
              <div className={`${barClass} h-3 w-4/5`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (preset === 'table') {
    const rowCount = rows ?? 4;
    const colCount = Math.max(1, columns);
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading table"
        data-skeleton-preset="table"
        className={`overflow-hidden rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] ${className}`.trim()}
        style={style}
      >
        <div
          className="grid gap-4 border-b border-[var(--omada-border-divider)] bg-[var(--omada-bg-table-header)] px-4 py-3"
          style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: colCount }).map((_, colIdx) => (
            <div key={colIdx} className={`${barClass} h-3 w-3/4`} />
          ))}
        </div>
        <div className="divide-y divide-[var(--omada-border-divider)]">
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid gap-4 px-4 py-3"
              style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: colCount }).map((__, colIdx) => (
                <div
                  key={colIdx}
                  className={`${barClass} h-3.5 ${
                    colIdx === colCount - 1 ? 'w-1/2' : 'w-5/6'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (preset === 'card') {
    const lineCount = rows ?? 3;
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading card"
        data-skeleton-preset="card"
        className={`rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-5 ${className}`.trim()}
        style={style}
      >
        <div className="mb-4 flex items-center gap-3 border-b border-[var(--omada-border-divider)] pb-3">
          {avatar && <div className={`${barClass} h-9 w-9 shrink-0 !rounded-full`} />}
          <div className="flex-1 space-y-2">
            <div className={`${barClass} h-4 w-1/3`} />
            <div className={`${barClass} h-3 w-1/2`} />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div
              key={idx}
              className={`${barClass} h-3.5 ${
                idx === lineCount - 1 ? 'w-1/2' : 'w-full'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  const lineCount = rows ?? 3;
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      data-skeleton-preset="default"
      className={`flex items-start gap-3 ${className}`.trim()}
      style={style}
    >
      {avatar && <div className={`${barClass} h-9 w-9 shrink-0 !rounded-full`} />}
      <div className="flex-1 space-y-2.5">
        {Array.from({ length: lineCount }).map((_, idx) => (
          <div
            key={idx}
            className={`${barClass} h-3.5 ${
              idx === lineCount - 1 && lineCount > 1 ? 'w-1/2' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export interface SMaskProps {
  /** Controls visibility of the backdrop mask */
  open?: boolean;
  /** Covers either its positioned parent (`container`) or the full viewport (`page`) */
  scope?: 'container' | 'page';
  /** Applies a 4px frosted glass backdrop blur */
  blur?: boolean;
  /** Renders a centered inverse loading spinner inside the mask */
  loading?: boolean;
  /** Optional text beneath the mask loading spinner */
  loadingText?: React.ReactNode;
  /** Optional backdrop click handler */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Custom z-index (`10` for container, `1100` for page by default) */
  zIndex?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Omada backdrop overlay (`rgba(0, 0, 0, 0.40)` matching Figma `43:34769` Mask)
 * for page-level or container/card-level blocking with optional frosted blur and centered content.
 */
export const SMask: React.FC<SMaskProps> = ({
  open = true,
  scope = 'container',
  blur = false,
  loading = false,
  loadingText,
  onClick,
  zIndex,
  children,
  className = '',
  style,
}) => {
  if (!open) {
    return null;
  }

  const resolvedZIndex = zIndex ?? (scope === 'page' ? 1100 : 10);
  const positionClass =
    scope === 'page' ? 'fixed inset-0' : 'absolute inset-0 rounded-[inherit]';

  return (
    <div
      role="presentation"
      aria-modal={scope === 'page' ? true : undefined}
      data-smask-scope={scope}
      data-smask-blur={String(blur)}
      onClick={onClick}
      className={`omada-mask ${blur ? 'omada-mask-blur' : ''} ${positionClass} flex items-center justify-center p-4 transition-opacity ${className}`.trim()}
      style={{ zIndex: resolvedZIndex, ...style }}
    >
      {children ??
        (loading ? (
          <SLoading
            size="lg"
            tone="inverse"
            layout="vertical"
            description={loadingText}
          />
        ) : null)}
    </div>
  );
};
