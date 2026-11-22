import React from 'react';
import { OMADA_ILLUSTRATIONS, type OmadaIllustrationName } from './assetsManifest';
import { ThemedAssetImage } from './ThemedAssetImage';

const ILLUSTRATION_URL_MAP = import.meta.glob<string>(
  '../../assets/illustrations/**/*.{svg,png}',
  { eager: true, import: 'default' },
);

let illustrationNamesCache: Set<string> | null = null;

function getIllustrationNames(): Set<string> {
  if (!illustrationNamesCache) {
    illustrationNamesCache = new Set<string>(OMADA_ILLUSTRATIONS.map((entry) => entry.name));
  }
  return illustrationNamesCache;
}

export interface SIllustrationProps {
  name: OmadaIllustrationName;
  theme?: 'light' | 'dark' | 'auto';
  width?: number | string;
  height?: number | string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fallback?: React.ReactNode;
}

/**
 * Checks whether an illustration slug exists in the bundled Figma illustration library.
 */
export function hasOmadaIllustration(name: string): boolean {
  return getIllustrationNames().has(name);
}

/**
 * Theme-aware Omada illustration backed by `src/assets/illustrations/{light,dark}/`.
 * Automatically selects the dark variant in Dark Mode when available.
 */
export const SIllustration: React.FC<SIllustrationProps> = ({
  name,
  width = 240,
  ...rest
}) => {
  return (
    <ThemedAssetImage
      name={name}
      entries={OMADA_ILLUSTRATIONS}
      urlMap={ILLUSTRATION_URL_MAP}
      urlPrefix="../../assets/illustrations/"
      width={width}
      {...rest}
    />
  );
};
