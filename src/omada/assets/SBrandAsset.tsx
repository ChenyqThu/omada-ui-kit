import React from 'react';
import { OMADA_BRAND_ASSETS, type OmadaBrandAssetName } from './assetsManifest';
import { ThemedAssetImage } from './ThemedAssetImage';

const BRAND_URL_MAP = import.meta.glob<string>('../../assets/brand/**/*.{svg,png}', {
  eager: true,
  import: 'default',
});

export interface SBrandAssetProps {
  name: OmadaBrandAssetName;
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
 * Official Omada wordmark, app icon, and OAuth brand asset backed by `src/assets/brand/`.
 */
export const SBrandAsset: React.FC<SBrandAssetProps> = ({ name, className = '', ...rest }) => {
  return (
    <ThemedAssetImage
      name={name}
      entries={OMADA_BRAND_ASSETS}
      urlMap={BRAND_URL_MAP}
      urlPrefix="../../assets/brand/"
      className={`object-contain ${className}`.trim()}
      {...rest}
    />
  );
};
