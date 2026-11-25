/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  OMADA_BRAND_ASSETS,
  OMADA_CLIENTS,
  OMADA_ICONS,
  OMADA_ILLUSTRATIONS,
  OMADA_PRODUCTS,
  OmadaProvider,
  SBrandAsset,
  SEmpty,
  SIcon,
  SIllustration,
  hasOmadaIcon,
  hasOmadaIllustration,
  hasOmadaProductImage,
} from '@/omada';
import { resolveRuntimeAssetUrl } from '@/omada/assets/ThemedAssetImage';
import { resolveStandaloneScriptBase } from '@/lib/standalone';

const ASSETS_ROOT = path.resolve(import.meta.dirname, '..', 'assets');
const assetGlobal = globalThis as { __OMADA_ASSET_BASE__?: string };

describe('Omada Figma Asset Library', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete assetGlobal.__OMADA_ASSET_BASE__;
  });

  afterEach(() => {
    cleanup();
    delete assetGlobal.__OMADA_ASSET_BASE__;
  });

  it('meets expected Figma asset inventory thresholds with both light and dark variants', () => {
    expect(OMADA_ICONS.length).toBeGreaterThanOrEqual(590);
    expect(OMADA_ILLUSTRATIONS.length).toBeGreaterThanOrEqual(210);
    expect(OMADA_CLIENTS.length).toBeGreaterThanOrEqual(245);
    expect(OMADA_PRODUCTS.length).toBeGreaterThanOrEqual(108);
    expect(OMADA_BRAND_ASSETS.length).toBeGreaterThanOrEqual(75);

    const illThemes = new Set(OMADA_ILLUSTRATIONS.map((entry) => entry.theme));
    expect(illThemes.has('light')).toBe(true);
    expect(illThemes.has('dark')).toBe(true);

    expect(hasOmadaIcon('app-category-ai')).toBe(true);
    expect(hasOmadaIcon('member-zoe')).toBe(true);
    expect(hasOmadaIcon('member-phoenix')).toBe(true);
    expect(hasOmadaIllustration('no-data')).toBe(true);
    expect(hasOmadaProductImage('er8411')).toBe(true);
  });

  it('has zero duplicate keys across all asset manifests', () => {
    const iconNames = OMADA_ICONS.map((entry) => entry.name);
    expect(new Set(iconNames).size).toBe(iconNames.length);

    for (const group of [
      OMADA_ILLUSTRATIONS,
      OMADA_CLIENTS,
      OMADA_PRODUCTS,
      OMADA_BRAND_ASSETS,
    ]) {
      const keys = group.map((entry) => `${entry.name}::${entry.theme}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('resolves every manifest entry to an existing non-empty asset file on disk', () => {
    for (const icon of OMADA_ICONS) {
      const fullPath = path.join(ASSETS_ROOT, 'icons', icon.relPath);
      expect(fs.existsSync(fullPath), `Missing icon file: ${fullPath}`).toBe(true);
      expect(fs.statSync(fullPath).size, `Empty icon file: ${fullPath}`).toBeGreaterThan(0);
    }

    const themedGroups = [
      { dir: 'illustrations', entries: OMADA_ILLUSTRATIONS },
      { dir: 'clients', entries: OMADA_CLIENTS },
      { dir: 'products', entries: OMADA_PRODUCTS },
      { dir: 'brand', entries: OMADA_BRAND_ASSETS },
    ] as const;

    for (const { dir, entries } of themedGroups) {
      for (const entry of entries) {
        const fullPath = path.join(ASSETS_ROOT, dir, entry.relPath);
        expect(fs.existsSync(fullPath), `Missing ${dir} file: ${fullPath}`).toBe(true);
        expect(fs.statSync(fullPath).size, `Empty ${dir} file: ${fullPath}`).toBeGreaterThan(0);
      }
    }
  });

  it('renders monochrome <SIcon> inline SVG inheriting currentColor', () => {
    const { container } = render(
      React.createElement(SIcon, { name: 'app-category-ai', size: 20 }),
    );
    const wrapper = container.querySelector('[data-omada-icon="app-category-ai"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-monochrome', 'true');
    const svg = wrapper?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(wrapper?.innerHTML).toContain('currentColor');
  });

  it('switches <SIllustration name="no-data" /> automatically between light and dark themes', () => {
    const { unmount } = render(
      React.createElement(OmadaProvider, {
        defaultThemeMode: 'light',
        children: React.createElement(SIllustration, { name: 'no-data' }),
      }),
    );
    const lightImg = screen.getByRole('img');
    const lightSrc = lightImg.getAttribute('src');
    expect(lightImg).toHaveAttribute('data-omada-asset', 'no-data');
    expect(lightImg).toHaveAttribute('data-asset-theme', 'light');
    expect(lightSrc).toBeTruthy();
    unmount();

    render(
      React.createElement(OmadaProvider, {
        defaultThemeMode: 'dark',
        children: React.createElement(SIllustration, { name: 'no-data' }),
      }),
    );
    const darkImg = screen.getByRole('img');
    const darkSrc = darkImg.getAttribute('src');
    expect(darkImg).toHaveAttribute('data-omada-asset', 'no-data');
    expect(darkImg).toHaveAttribute('data-asset-theme', 'dark');
    expect(darkSrc).toBeTruthy();
    expect(darkSrc).not.toBe(lightSrc);
  });

  it('renders the default no-data illustration inside <SEmpty /> unless illustration={false}', () => {
    const { unmount } = render(
      React.createElement(OmadaProvider, {
        defaultThemeMode: 'light',
        children: React.createElement(SEmpty, { title: 'Empty Table' }),
      }),
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('data-omada-asset', 'no-data');
    unmount();

    render(
      React.createElement(OmadaProvider, {
        defaultThemeMode: 'light',
        children: React.createElement(SEmpty, { title: 'Minimal Empty', illustration: false }),
      }),
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Minimal Empty')).toBeInTheDocument();
  });

  it('switches <SBrandAsset name="oauth-google" /> automatically between light and dark themes', () => {
    const { unmount } = render(
      React.createElement(OmadaProvider, {
        defaultThemeMode: 'light',
        children: React.createElement(SBrandAsset, { name: 'oauth-google' }),
      }),
    );
    const lightImg = screen.getByRole('img');
    const lightSrc = lightImg.getAttribute('src');
    expect(lightImg).toHaveAttribute('data-omada-asset', 'oauth-google');
    expect(lightImg).toHaveAttribute('data-asset-theme', 'light');
    expect(lightSrc).toBeTruthy();
    unmount();

    render(
      React.createElement(OmadaProvider, {
        defaultThemeMode: 'dark',
        children: React.createElement(SBrandAsset, { name: 'oauth-google' }),
      }),
    );
    const darkImg = screen.getByRole('img');
    const darkSrc = darkImg.getAttribute('src');
    expect(darkImg).toHaveAttribute('data-omada-asset', 'oauth-google');
    expect(darkImg).toHaveAttribute('data-asset-theme', 'dark');
    expect(darkSrc).toBeTruthy();
    expect(darkSrc).not.toBe(lightSrc);
  });

  it('resolves standalone __OMADA_ASSET_BASE__ from script src or falls back to pinned jsDelivr CDN when inlined', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(import.meta.dirname, '..', '..', 'package.json'), 'utf8'),
    ) as { version: string };
    const expectedCdnBase = `https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@${pkg.version}/dist/`;
    const origCurrentScript = Object.getOwnPropertyDescriptor(document, 'currentScript');

    try {
      // 1. Direct currentScript with src attribute
      const cdnScript = document.createElement('script');
      cdnScript.setAttribute('src', 'https://mirror.example.com/omada/dist/standalone.js');
      Object.defineProperty(document, 'currentScript', {
        configurable: true,
        get: () => cdnScript,
      });
      expect(resolveStandaloneScriptBase()).toBe('https://mirror.example.com/omada/dist/');

      // 2. Fallback to DOM <script src=".../standalone.js"> when currentScript is null
      Object.defineProperty(document, 'currentScript', {
        configurable: true,
        get: () => null,
      });
      const domScript = document.createElement('script');
      domScript.setAttribute('src', 'https://static.example.org/ui/standalone.js?v=0.4.1');
      document.head.appendChild(domScript);
      expect(resolveStandaloneScriptBase()).toBe('https://static.example.org/ui/');
      domScript.remove();

      // 3. Inline <script> (plus @babel/standalone tag in <head>) falls back to pinned jsDelivr CDN, never window.location.href
      const inlineScript = document.createElement('script');
      inlineScript.textContent = '/* inlined standalone bundle */';
      const babelScript = document.createElement('script');
      babelScript.setAttribute(
        'src',
        'https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js',
      );
      document.head.appendChild(babelScript);
      Object.defineProperty(document, 'currentScript', {
        configurable: true,
        get: () => inlineScript,
      });

      const inlineFallbackBase = resolveStandaloneScriptBase();
      expect(inlineFallbackBase).toBe(expectedCdnBase);
      assetGlobal.__OMADA_ASSET_BASE__ = inlineFallbackBase;
      expect(resolveRuntimeAssetUrl('assets/products/light/eap650.png')).toBe(
        `${expectedCdnBase}assets/products/light/eap650.png`,
      );
      babelScript.remove();

      // 4. Empty or whitespace src="" / src="   " and blob:/data: script URLs fall back to jsDelivr CDN, never window.location.href
      for (const edgeSrc of ['', '   ', 'blob:https://example.com/1234', 'data:text/javascript,1']) {
        const edgeScript = document.createElement('script');
        edgeScript.setAttribute('src', edgeSrc);
        Object.defineProperty(document, 'currentScript', {
          configurable: true,
          get: () => edgeScript,
        });
        expect(resolveStandaloneScriptBase()).toBe(expectedCdnBase);
      }

      // 5. Explicit __OMADA_ASSET_BASE__ without trailing slash or using root-relative / relative paths resolves cleanly
      assetGlobal.__OMADA_ASSET_BASE__ = 'https://my-cdn.example.com/omada/dist';
      expect(resolveRuntimeAssetUrl('assets/products/light/eap650.png')).toBe(
        'https://my-cdn.example.com/omada/dist/assets/products/light/eap650.png',
      );
      assetGlobal.__OMADA_ASSET_BASE__ = '/vendor/omada/dist';
      expect(resolveRuntimeAssetUrl('assets/products/light/eap650.png')).toBe(
        '/vendor/omada/dist/assets/products/light/eap650.png',
      );
      assetGlobal.__OMADA_ASSET_BASE__ = '../dist';
      expect(resolveRuntimeAssetUrl('assets/products/light/eap650.png')).toBe(
        '../dist/assets/products/light/eap650.png',
      );
    } finally {
      if (origCurrentScript) {
        Object.defineProperty(document, 'currentScript', origCurrentScript);
      } else {
        delete (document as { currentScript?: unknown }).currentScript;
      }
    }
  });
});
