import React from 'react';
import { useOmadaTheme } from '../theme/OmadaProvider';
import type { OmadaAssetMeta } from './assetsManifest';

export interface ThemedAssetImageProps {
  name: string;
  entries: readonly OmadaAssetMeta[];
  urlMap: Record<string, string>;
  urlPrefix: string;
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
 * Resolves a themed asset entry matching `preferredTheme` (`light` | `dark`) first,
 * falling back to any available variant with the same logical `name`.
 */
export function resolveThemedAssetEntry(
  entries: readonly OmadaAssetMeta[],
  name: string,
  preferredTheme: 'light' | 'dark',
): OmadaAssetMeta | undefined {
  let fallbackMatch: OmadaAssetMeta | undefined;
  for (const entry of entries) {
    if (entry.name !== name) continue;
    if (entry.theme === preferredTheme) {
      return entry;
    }
    fallbackMatch ??= entry;
  }
  return fallbackMatch;
}

/**
 * Resolves relative asset paths emitted by library/IIFE builds against an explicit
 * runtime base URL (`globalThis.__OMADA_ASSET_BASE__`), while leaving data URIs,
 * blob URLs, HTTP(S) URLs, and root-relative paths untouched.
 */
export function resolveRuntimeAssetUrl(url: string): string {
  if (
    !url ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('/')
  ) {
    return url;
  }
  const rawBase = (globalThis as { __OMADA_ASSET_BASE__?: string }).__OMADA_ASSET_BASE__?.trim();
  if (!rawBase) {
    return url;
  }
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  try {
    return new URL(url, normalizedBase).href;
  } catch {
    return `${normalizedBase}${url.replace(/^\.\//, '')}`;
  }
}

/**
 * Shared image renderer for theme-aware Figma assets (illustrations, client icons,
 * product model images, and brand assets).
 */
export const ThemedAssetImage: React.FC<ThemedAssetImageProps> = ({
  name,
  entries,
  urlMap,
  urlPrefix,
  theme = 'auto',
  width,
  height,
  alt,
  className,
  style,
  loading = 'lazy',
  fallback = null,
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const targetTheme = theme === 'auto' ? resolvedTheme : theme;
  const entry = resolveThemedAssetEntry(entries, name, targetTheme);

  if (!entry) {
    return <>{fallback}</>;
  }

  const rawUrl = urlMap[`${urlPrefix}${entry.relPath}`];
  if (!rawUrl) {
    return <>{fallback}</>;
  }
  const url = resolveRuntimeAssetUrl(rawUrl);

  let resolvedWidth = width;
  let resolvedHeight = height;
  if (
    typeof width === 'number' &&
    height === undefined &&
    entry.width > 0 &&
    entry.height > 0
  ) {
    resolvedHeight = Math.round((width * entry.height) / entry.width);
  } else if (
    typeof height === 'number' &&
    width === undefined &&
    entry.width > 0 &&
    entry.height > 0
  ) {
    resolvedWidth = Math.round((height * entry.width) / entry.height);
  } else if (
    width === undefined &&
    height === undefined &&
    entry.width > 0 &&
    entry.height > 0
  ) {
    resolvedWidth = entry.width;
    resolvedHeight = entry.height;
  }

  return (
    <img
      src={url}
      alt={alt ?? entry.figmaName}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={loading}
      data-omada-asset={entry.name}
      data-asset-theme={entry.theme}
      className={className}
      style={style}
    />
  );
};
