import React from 'react';
import { OMADA_PRODUCTS, type OmadaProductName } from './assetsManifest';
import { ThemedAssetImage } from './ThemedAssetImage';

const PRODUCT_URL_MAP = import.meta.glob<string>('../../assets/products/**/*.{svg,png}', {
  eager: true,
  import: 'default',
});

const PRODUCT_NAMES = new Set<string>(OMADA_PRODUCTS.map((entry) => entry.name));

export interface SProductImageProps {
  name: OmadaProductName;
  size?: number | string;
  theme?: 'light' | 'dark' | 'auto';
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fallback?: React.ReactNode;
}

/**
 * Checks whether a hardware product slug exists in the bundled Figma product library.
 */
export function hasOmadaProductImage(name: string): boolean {
  return PRODUCT_NAMES.has(name);
}

/**
 * Theme-aware Omada hardware product thumbnail backed by `src/assets/products/{light,dark}/`.
 */
export const SProductImage: React.FC<SProductImageProps> = ({
  name,
  size = 36,
  className = '',
  ...rest
}) => {
  return (
    <ThemedAssetImage
      name={name}
      entries={OMADA_PRODUCTS}
      urlMap={PRODUCT_URL_MAP}
      urlPrefix="../../assets/products/"
      width={size}
      height={size}
      className={`object-contain ${className}`.trim()}
      {...rest}
    />
  );
};
