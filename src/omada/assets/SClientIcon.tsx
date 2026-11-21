import React from 'react';
import { OMADA_CLIENTS, type OmadaClientIconName } from './assetsManifest';
import { ThemedAssetImage } from './ThemedAssetImage';

const CLIENT_URL_MAP = import.meta.glob<string>('../../assets/clients/**/*.{svg,png}', {
  eager: true,
  import: 'default',
});

export interface SClientIconProps {
  name: OmadaClientIconName;
  size?: number | string;
  theme?: 'light' | 'dark' | 'auto';
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fallback?: React.ReactNode;
}

/**
 * Theme-aware Omada client device / OS / vendor icon backed by `src/assets/clients/{light,dark}/`.
 */
export const SClientIcon: React.FC<SClientIconProps> = ({
  name,
  size = 24,
  className = '',
  ...rest
}) => {
  return (
    <ThemedAssetImage
      name={name}
      entries={OMADA_CLIENTS}
      urlMap={CLIENT_URL_MAP}
      urlPrefix="../../assets/clients/"
      width={size}
      height={size}
      className={`object-contain ${className}`.trim()}
      {...rest}
    />
  );
};
