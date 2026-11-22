/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as assetsEntry from '../lib/assets';
import * as blocksEntry from '../lib/blocks';
import * as chartsEntry from '../lib/charts';
import * as coreEntry from '../lib/core';
import * as emulatorEntry from '../lib/emulator';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function collectStaticImportClosure(entryFile: string): string[] {
  const visited = new Set<string>();
  const queue = [path.resolve(entryFile)];
  const importRe = /(?:import\s+[^'"]*?from\s+|import\s+)['"]([^'"]+)['"]/g;

  while (queue.length > 0) {
    const file = queue.shift()!;
    if (visited.has(file) || !fs.existsSync(file)) continue;
    visited.add(file);
    const code = fs.readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;
    importRe.lastIndex = 0;
    while ((match = importRe.exec(code)) !== null) {
      const spec = match[1];
      if (spec.startsWith('./') || spec.startsWith('../')) {
        queue.push(path.resolve(path.dirname(file), spec));
      } else {
        visited.add(`pkg:${spec}`);
      }
    }
  }

  return Array.from(visited);
}

describe('ESM Subpath Entrypoints & Tree-Shaking', () => {
  it('exports expected symbols from each subpath source module', () => {
    expect(coreEntry.OmadaProvider).toBeDefined();
    expect(coreEntry.SPageHeader).toBeDefined();
    expect(coreEntry.SButton).toBeDefined();
    expect(coreEntry.STable).toBeDefined();
    expect(coreEntry.SEmpty).toBeDefined();
    expect('SChart' in coreEntry).toBe(false);
    expect('SIllustration' in coreEntry).toBe(false);
    expect('SProductImage' in coreEntry).toBe(false);

    expect(blocksEntry.SEmulatorShell).toBeDefined();
    expect(blocksEntry.EMULATOR_NAV_GROUPS).toBeDefined();
    expect(blocksEntry.EMULATOR_GLOBAL_NAV_GROUPS).toBeDefined();
    expect(blocksEntry.SFilterTableBlock).toBeDefined();
    expect(blocksEntry.SInlineRuleEditorLayout).toBeDefined();
    expect(blocksEntry.SInlineFormRow).toBeDefined();
    expect(blocksEntry.SDetailInspectorDrawer).toBeDefined();
    expect(blocksEntry.SMasterDetailSplitBlock).toBeDefined();
    expect(blocksEntry.SWizardModal).toBeDefined();
    expect(blocksEntry.SSwitchPortPicker).toBeDefined();

    expect(chartsEntry.SChart).toBeDefined();
    expect(chartsEntry.SLineChart).toBeDefined();
    expect(chartsEntry.SBarChart).toBeDefined();
    expect(chartsEntry.SDonutChart).toBeDefined();
    expect(chartsEntry.SSparkChart).toBeDefined();
    expect(chartsEntry.SDonutSummaryCard).toBeDefined();
    expect(chartsEntry.SHealthGauge).toBeDefined();
    expect(chartsEntry.SHealthRadar).toBeDefined();
    expect(chartsEntry.SHealthTrendBar).toBeDefined();
    expect(chartsEntry.SChannelUtilization).toBeDefined();

    expect(emulatorEntry.STopologyCanvas).toBeDefined();
    expect(emulatorEntry.SAclRuleBuilder).toBeDefined();
    expect(emulatorEntry.SSettingsPageShell).toBeDefined();
    expect(emulatorEntry.STerminalConsole).toBeDefined();

    expect(assetsEntry.SIcon).toBeDefined();
    expect(assetsEntry.SProductImage).toBeDefined();
    expect(assetsEntry.SIllustration).toBeDefined();
    expect(assetsEntry.SClientIcon).toBeDefined();
    expect(assetsEntry.SBrandAsset).toBeDefined();
  });

  it('keeps heavy ECharts and full asset catalogs decoupled from dist subpaths when dist/ exists', () => {
    const coreDist = path.join(DIST_DIR, 'core.js');
    if (!fs.existsSync(coreDist)) return;

    const coreClosure = collectStaticImportClosure(coreDist);
    expect(coreClosure.some((id) => id.includes('echarts'))).toBe(false);
    expect(coreClosure.some((id) => id.includes('asset-illustrations'))).toBe(false);
    expect(coreClosure.some((id) => id.includes('asset-products'))).toBe(false);
    expect(coreClosure.some((id) => id.includes('asset-clients'))).toBe(false);

    const blocksClosure = collectStaticImportClosure(path.join(DIST_DIR, 'blocks.js'));
    expect(blocksClosure.some((id) => id.includes('echarts'))).toBe(false);
    expect(blocksClosure.some((id) => id.includes('asset-illustrations'))).toBe(false);
    expect(blocksClosure.some((id) => id.includes('asset-products'))).toBe(false);
    expect(blocksClosure.some((id) => id.includes('asset-clients'))).toBe(false);

    const chartsClosure = collectStaticImportClosure(path.join(DIST_DIR, 'charts.js'));
    expect(chartsClosure.some((id) => id.includes('echarts'))).toBe(true);
    expect(chartsClosure.some((id) => id.includes('asset-illustrations'))).toBe(false);
    expect(chartsClosure.some((id) => id.includes('asset-products'))).toBe(false);
    expect(chartsClosure.some((id) => id.includes('asset-clients'))).toBe(false);
    expect(chartsClosure.some((id) => id.includes('asset-brand'))).toBe(false);

    for (const entry of ['index', 'core', 'blocks', 'charts', 'emulator', 'assets']) {
      const dtsPath = path.join(DIST_DIR, 'types', 'lib', `${entry}.d.ts`);
      expect(fs.existsSync(dtsPath), `Missing .d.ts: ${dtsPath}`).toBe(true);
      const dtsText = fs.readFileSync(dtsPath, 'utf8');
      expect(dtsText.includes('.css')).toBe(false);
    }
  });
});
