import React, { useState } from 'react';
import { Rate, type RateProps } from 'antd';
import { SIcon } from '../assets/SIcon';

export type SRateSize = 'sm' | 'md' | 'lg';

const RATE_PIXEL_SIZES: Record<SRateSize, number> = {
  sm: 12,
  md: 20,
  lg: 32,
};

export interface SRateProps extends Omit<RateProps, 'size'> {
  /** Named Omada sizes (`sm`: 12px, `md`: 20px, `lg`: 32px) or custom numeric px. */
  size?: SRateSize | number;
  /** Read-only alias for `disabled`. */
  readonly?: boolean;
  /** Show rating summary caption (`1–2`: Fair/Poor, `3–4`: Good/Very Good, `5`: Excellent). */
  showCaption?: boolean;
  /** Optional custom captions indexed `0..(count - 1)`. */
  captions?: React.ReactNode[];
  /** Custom caption formatter receiving the active/hovered numeric value. */
  captionRenderer?: (value: number) => React.ReactNode;
}

function defaultCaption(value: number): string {
  if (value <= 0) return 'Not rated';
  if (value <= 1) return 'Poor';
  if (value <= 2) return 'Fair';
  if (value <= 3) return 'Good';
  if (value <= 4) return 'Very Good';
  return 'Excellent';
}

/**
 * Omada 5-star Rate component backed by the official Figma star SVG, supporting
 * `sm` (12px), `md` (20px), `lg` (32px), half-stars, `readonly` mode, and rating captions.
 */
export const SRate: React.FC<SRateProps> = ({
  size = 'md',
  readonly = false,
  disabled = false,
  count = 5,
  allowHalf = false,
  value,
  defaultValue = 0,
  onChange,
  onHoverChange,
  showCaption = false,
  captions,
  captionRenderer,
  character,
  className = '',
  style,
  ...rest
}) => {
  const [innerValue, setInnerValue] = useState<number>(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const pxSize = typeof size === 'number' ? size : RATE_PIXEL_SIZES[size];
  const isReadonly = Boolean(readonly || disabled);
  const currentValue = value !== undefined ? value : innerValue;
  const activeDisplayValue = hoverValue !== undefined ? hoverValue : currentValue;

  const handleChange = (nextVal: number) => {
    if (value === undefined) {
      setInnerValue(nextVal);
    }
    onChange?.(nextVal);
  };

  const handleHoverChange = (nextVal: number) => {
    setHoverValue(nextVal > 0 ? nextVal : undefined);
    onHoverChange?.(nextVal);
  };

  const resolvedCaption = (() => {
    if (!showCaption) return null;
    if (captionRenderer) return captionRenderer(activeDisplayValue);
    if (captions && activeDisplayValue > 0) {
      const idx = Math.min(captions.length - 1, Math.max(0, Math.ceil(activeDisplayValue) - 1));
      return captions[idx];
    }
    return defaultCaption(activeDisplayValue);
  })();

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <Rate
        count={count}
        allowHalf={allowHalf}
        disabled={isReadonly}
        value={currentValue}
        onChange={handleChange}
        onHoverChange={handleHoverChange}
        character={character ?? <SIcon name="rate-off" size={pxSize} aria-hidden />}
        className="omada-rate"
        style={{ fontSize: pxSize, ...style }}
        {...rest}
      />
      {showCaption && (
        <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
          {resolvedCaption}
        </span>
      )}
    </span>
  );
};
