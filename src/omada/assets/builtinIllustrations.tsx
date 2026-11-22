import React from 'react';
import darkNoDataUrl from '../../assets/illustrations/dark/no-data.svg';
import darkUpgradeUrl from '../../assets/illustrations/dark/upgrade.svg';
import lightNoDataUrl from '../../assets/illustrations/light/no-data.svg';
import lightUpgradeUrl from '../../assets/illustrations/light/upgrade.svg';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { resolveRuntimeAssetUrl } from './ThemedAssetImage';

export type BuiltinIllustrationName = 'no-data' | 'upgrade';

interface BuiltinIllustrationEntry {
  light: string;
  dark: string;
  width: number;
  height: number;
  defaultAlt: string;
}

const BUILTIN_ILLUSTRATIONS: Record<BuiltinIllustrationName, BuiltinIllustrationEntry> = {
  'no-data': {
    light: lightNoDataUrl,
    dark: darkNoDataUrl,
    width: 300,
    height: 160,
    defaultAlt: 'no data',
  },
  upgrade: {
    light: lightUpgradeUrl,
    dark: darkUpgradeUrl,
    width: 100,
    height: 100,
    defaultAlt: 'upgrade',
  },
};

export interface SBuiltinIllustrationProps {
  name: BuiltinIllustrationName;
  theme?: 'light' | 'dark' | 'auto';
  width?: number | string;
  height?: number | string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

/**
 * Lightweight built-in illustration renderer for `'no-data'` and `'upgrade'`
 * used inside `SEmpty`, `SUpload`, and `SAclRuleBuilder` without bundling the full
 * Figma illustration catalog.
 */
export const SBuiltinIllustration: React.FC<SBuiltinIllustrationProps> = ({
  name,
  theme = 'auto',
  width = 240,
  height,
  alt,
  className,
  style,
  loading = 'lazy',
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const targetTheme = theme === 'auto' ? resolvedTheme : theme;
  const entry = BUILTIN_ILLUSTRATIONS[name];
  const rawUrl = targetTheme === 'dark' ? entry.dark : entry.light;
  const url = resolveRuntimeAssetUrl(rawUrl);

  let resolvedWidth = width;
  let resolvedHeight = height;
  if (typeof width === 'number' && height === undefined) {
    resolvedHeight = Math.round((width * entry.height) / entry.width);
  } else if (typeof height === 'number' && width === undefined) {
    resolvedWidth = Math.round((height * entry.width) / entry.height);
  }

  return (
    <img
      src={url}
      alt={alt ?? entry.defaultAlt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={loading}
      data-omada-asset={name}
      data-asset-theme={targetTheme}
      className={className}
      style={style}
    />
  );
};
