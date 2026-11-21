import React from 'react';
import { X } from 'lucide-react';

export type STagColor =
  | 'green'
  | 'orange'
  | 'blue'
  | 'red'
  | 'magenta'
  | 'purple'
  | 'grey';

export interface STagProps {
  color?: STagColor;
  variant?: 'subtle' | 'solid';
  children: React.ReactNode;
  className?: string;
}

const COLOR_STYLES: Record<
  STagColor,
  { solidBg: string; subtleBg: string; text: string }
> = {
  green: {
    solidBg: 'var(--omada-color-success)',
    subtleBg: 'var(--omada-color-success-bg)',
    text: 'var(--omada-color-success)',
  },
  orange: {
    solidBg: 'var(--omada-color-warning)',
    subtleBg: 'var(--omada-color-warning-bg)',
    text: 'var(--omada-color-warning)',
  },
  blue: {
    solidBg: 'var(--omada-color-info)',
    subtleBg: 'var(--omada-color-info-bg)',
    text: 'var(--omada-color-info)',
  },
  red: {
    solidBg: 'var(--omada-color-error)',
    subtleBg: 'var(--omada-color-error-bg)',
    text: 'var(--omada-color-error)',
  },
  magenta: {
    solidBg: 'var(--omada-color-magenta)',
    subtleBg: 'var(--omada-color-magenta-bg)',
    text: 'var(--omada-color-magenta)',
  },
  purple: {
    solidBg: 'var(--omada-color-purple)',
    subtleBg: 'var(--omada-color-purple-bg)',
    text: 'var(--omada-color-purple)',
  },
  grey: {
    solidBg: 'var(--omada-text-tertiary)',
    subtleBg: 'var(--omada-bg-field)',
    text: 'var(--omada-text-secondary)',
  },
};

/**
 * Omada status/category tag (`20px` height, `3px` radius, `subtle` or `solid` fill).
 */
export const STag: React.FC<STagProps> = ({
  color = 'grey',
  variant = 'subtle',
  children,
  className = '',
}) => {
  const palette = COLOR_STYLES[color];
  const isSolid = variant === 'solid';

  return (
    <span
      className={`inline-flex h-5 items-center rounded-[3px] px-1.5 text-xs font-medium leading-4 whitespace-nowrap ${className}`.trim()}
      style={{
        backgroundColor: isSolid ? palette.solidBg : palette.subtleBg,
        color: isSolid ? '#FFFFFF' : palette.text,
      }}
    >
      {children}
    </span>
  );
};

export interface SCustomTagProps {
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * 24px neutral tag for multi-select values and editable tag lists.
 */
export const SCustomTag: React.FC<SCustomTagProps> = ({
  children,
  closable = false,
  onClose,
  onClick,
  className = '',
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex h-6 items-center gap-1 rounded-[3px] bg-[var(--omada-bg-field)] px-2 text-xs font-medium text-[var(--omada-text-primary)] transition-colors hover:bg-[var(--omada-bg-field-hover)] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`.trim()}
    >
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          aria-label="Remove tag"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-sm text-[var(--omada-text-tertiary)] hover:text-[var(--omada-text-primary)]"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
};
