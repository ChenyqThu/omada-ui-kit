import React from 'react';
import { OMADA_ICONS, type OmadaIconMeta, type OmadaIconName } from './iconsManifest';

const ICON_RAW_MAP = import.meta.glob<string>('../../assets/icons/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ICON_LOOKUP = new Map<string, { meta: OmadaIconMeta; rawSvg: string }>();

for (const meta of OMADA_ICONS) {
  const rawSvg = ICON_RAW_MAP[`../../assets/icons/${meta.relPath}`];
  if (rawSvg) {
    ICON_LOOKUP.set(meta.name, { meta, rawSvg });
  }
}

export interface SIconProps {
  name: OmadaIconName;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

/**
 * Checks whether an icon slug exists in the bundled Figma icon library.
 */
export function hasOmadaIcon(name: string): boolean {
  return ICON_LOOKUP.has(name);
}

/**
 * Official Omada SVG icon component backed by the 586 Figma icons in `src/assets/icons/`.
 * Monochrome icons inherit `currentColor`; multi-color icons preserve Figma fills.
 */
export const SIcon: React.FC<SIconProps> = ({
  name,
  size = 16,
  color,
  className = '',
  style,
  title,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}) => {
  const entry = ICON_LOOKUP.get(name);
  if (!entry) {
    return null;
  }

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
      title={title}
      data-omada-icon={name}
      data-monochrome={String(entry.meta.monochrome)}
      className={`inline-flex shrink-0 items-center justify-center leading-none [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`.trim()}
      style={{ width: size, height: size, color, ...style }}
      dangerouslySetInnerHTML={{ __html: entry.rawSvg }}
    />
  );
};
