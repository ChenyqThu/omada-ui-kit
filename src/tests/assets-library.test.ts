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
  SEmpty,
  SIcon,
  SIllustration,
  hasOmadaIcon,
  hasOmadaIllustration,
  hasOmadaProductImage,
} from '@/omada';

const ASSETS_ROOT = path.resolve(import.meta.dirname, '..', 'assets');

describe('Omada Figma Asset Library', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('meets expected Figma asset inventory thresholds with both light and dark variants', () => {
    expect(OMADA_ICONS.length).toBeGreaterThanOrEqual(550);
    expect(OMADA_ILLUSTRATIONS.length).toBeGreaterThanOrEqual(180);
    expect(OMADA_CLIENTS.length).toBeGreaterThanOrEqual(90);
    expect(OMADA_PRODUCTS.length).toBeGreaterThanOrEqual(100);
    expect(OMADA_BRAND_ASSETS.length).toBeGreaterThanOrEqual(8);

    const illThemes = new Set(OMADA_ILLUSTRATIONS.map((entry) => entry.theme));
    expect(illThemes.has('light')).toBe(true);
    expect(illThemes.has('dark')).toBe(true);

    expect(hasOmadaIcon('app-category-ai')).toBe(true);
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
});
