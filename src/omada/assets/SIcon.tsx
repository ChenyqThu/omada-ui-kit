import React from 'react';
import { OMADA_ICONS, type OmadaIconMeta, type OmadaIconName } from './iconsManifest';
import { resolveRuntimeAssetUrl } from './ThemedAssetImage';

const ICON_RAW_MAP = import.meta.glob<string>('../../assets/icons/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ICON_PNG_MAP = import.meta.glob<string>('../../assets/icons/**/*.png', {
  import: 'default',
  eager: true,
});

interface IconLookupEntry {
  meta: OmadaIconMeta;
  rawSvg?: string;
  imgUrl?: string;
}

let iconLookupCache: Map<string, IconLookupEntry> | null = null;

function getIconLookup(): Map<string, IconLookupEntry> {
  if (iconLookupCache) return iconLookupCache;
  const map = new Map<string, IconLookupEntry>();
  for (const meta of OMADA_ICONS) {
    const key = `../../assets/icons/${meta.relPath}`;
    if (meta.format === 'png') {
      const imgUrl = ICON_PNG_MAP[key];
      if (imgUrl) {
        map.set(meta.name, { meta, imgUrl });
      }
    } else {
      const rawSvg = ICON_RAW_MAP[key];
      if (rawSvg) {
        map.set(meta.name, { meta, rawSvg });
      }
    }
  }
  iconLookupCache = map;
  return map;
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
  return getIconLookup().has(name);
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
  const entry = getIconLookup().get(name);
  if (!entry) {
    return null;
  }

  if (entry.imgUrl) {
    return (
      <span
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
        title={title}
        data-omada-icon={name}
        data-monochrome="false"
        className={`inline-flex shrink-0 items-center justify-center align-middle leading-none ${className}`.trim()}
        style={{ width: size, height: size, color, ...style }}
      >
        <img
          src={resolveRuntimeAssetUrl(entry.imgUrl)}
          alt={ariaLabel ?? name}
          className="block h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? !ariaLabel}
      title={title}
      data-omada-icon={name}
      data-monochrome={String(entry.meta.monochrome)}
      className={`inline-flex shrink-0 items-center justify-center align-middle leading-none [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`.trim()}
      style={{ width: size, height: size, color, ...style }}
      dangerouslySetInnerHTML={{ __html: entry.rawSvg ?? '' }}
    />
  );
};
