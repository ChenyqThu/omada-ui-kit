/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as omadaBarrel from '../omada';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');
const SKILL_DIR = path.join(ROOT_DIR, 'skills/omada-ui-kit');
const WORKSPACE_SKILL_DIR = path.join(ROOT_DIR, '.agents/skills/omada-ui-kit');
const CATALOG_PATH = path.join(SKILL_DIR, 'references/catalog.json');
const DIST_CATALOG_PATH = path.join(ROOT_DIR, 'dist/catalog.json');
const COMPONENTS_MD_PATH = path.join(ROOT_DIR, 'COMPONENTS.md');

interface CatalogProp {
  name: string;
  type: string;
  optional: boolean;
}

interface CatalogComponent {
  name: string;
  category: string;
  kind: 'component' | 'hook' | 'helper' | 'data' | 'antd-primitive';
  subpath?: string;
  props?: CatalogProp[];
  antdProps?: string[];
  commonProps?: string[];
  acceptsDomProps?: boolean;
}

interface CatalogJson {
  schemaVersion: number;
  generatedAt?: string;
  counts: {
    components: number;
    blocks: number;
    antdPrimitives: number;
    hooksAndHelpers: number;
    templates: number;
    icons: number;
    products: number;
    illustrations: number;
    clients: number;
    brand: number;
  };
  components: CatalogComponent[];
}

function listFilesRelative(baseDir: string, currentDir = baseDir): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const full = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRelative(baseDir, full));
    } else if (entry.isFile()) {
      results.push(path.relative(baseDir, full).replace(/\\/g, '/'));
    }
  }
  return results.sort();
}

describe('Catalog, Progressive Docs, Skill Bundle & COMPONENTS.md Zero-Drift Gate', () => {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')) as CatalogJson;
  const componentsMd = fs.readFileSync(COMPONENTS_MD_PATH, 'utf8');

  it('produces deterministic catalog.json without generatedAt and matches runtime barrel exports', () => {
    expect('generatedAt' in catalog).toBe(false);
    expect(fs.existsSync( path.join(ROOT_DIR, 'templates') )).toBe(false);

    if (fs.existsSync(DIST_CATALOG_PATH)) {
      expect(fs.readFileSync(DIST_CATALOG_PATH, 'utf8')).toBe(
        fs.readFileSync(CATALOG_PATH, 'utf8'),
      );
    }
    const distLlmsPath = path.join(ROOT_DIR, 'dist/llms.txt');
    if (fs.existsSync(distLlmsPath)) {
      expect(fs.readFileSync(distLlmsPath, 'utf8')).toBe(
        fs.readFileSync(path.join(SKILL_DIR, 'references/llms.txt'), 'utf8'),
      );
    }

    const catalogNames = new Set(catalog.components.map((c) => c.name));
    for (const runtimeExport of Object.keys(omadaBarrel)) {
      expect(
        catalogNames.has(runtimeExport),
        `Runtime export "${runtimeExport}" from src/omada/index.ts missing in catalog.json`,
      ).toBe(true);
    }
  });

  it('generates complete TypeChecker props (own + antd + common + union branches) without @deprecated AntD leaks', () => {
    const compMap = new Map(catalog.components.map((c) => [c.name, c]));

    const sInput = compMap.get('SInput')!;
    expect(sInput.props?.map((p) => p.name)).toEqual(['agentId', 'secret']);
    expect(sInput.antdProps).toContain('allowClear');
    expect(sInput.antdProps).not.toContain('bordered');
    expect(sInput.commonProps).toContain('placeholder');
    expect(sInput.acceptsDomProps).toBe(true);

    const tileGroup = compMap.get('STileGroup')!;
    const modeProp = tileGroup.props?.find((p) => p.name === 'mode');
    expect(modeProp?.optional).toBe(true);
    expect(modeProp?.type).toContain("'single'");
    expect(modeProp?.type).toContain("'multiple'");

    const lagGlyph = compMap.get('LagGlyph')!;
    expect(lagGlyph.props?.some((p) => p.name === 'size')).toBe(true);
  });

  it('generates llms.txt, standalone.md, and all 10 progressive-disclosure domain docs in sync with .agents/skills', () => {
    const requiredDocs = [
      'blocks.md',
      'layout.md',
      'input.md',
      'data-display.md',
      'charts.md',
      'feedback.md',
      'emulator-v6.md',
      'assets.md',
      'agent.md',
      'custom-component.md',
    ];

    expect(fs.existsSync(path.join(SKILL_DIR, 'references/llms.txt'))).toBe(true);
    expect(fs.existsSync(path.join(SKILL_DIR, 'references/standalone.md'))).toBe(true);

    const combinedDocs = requiredDocs
      .map((doc) => {
        const p = path.join(SKILL_DIR, 'references/docs', doc);
        expect(fs.existsSync(p), `Missing domain doc: ${doc}`).toBe(true);
        return fs.readFileSync(p, 'utf8');
      })
      .join('\n');

    for (const comp of catalog.components) {
      if (comp.kind === 'component' || comp.kind === 'hook') {
        expect(
          combinedDocs.includes(`\`${comp.name}\``),
          `Exported ${comp.kind} "${comp.name}" missing from progressive-disclosure references/docs/*.md`,
        ).toBe(true);
      }
    }

    const canonicalFiles = listFilesRelative(SKILL_DIR);
    const syncedFiles = listFilesRelative(WORKSPACE_SKILL_DIR);
    expect(syncedFiles).toEqual(canonicalFiles);

    for (const rel of canonicalFiles) {
      expect(
        fs.readFileSync(path.join(WORKSPACE_SKILL_DIR, rel), 'utf8'),
        `Skill file drift detected in ${rel}`,
      ).toBe(fs.readFileSync(path.join(SKILL_DIR, rel), 'utf8'));
    }
  });

  it('keeps COMPONENTS.md counts, exported symbols, and documented prop names 100% free of drift or ghost props', () => {
    expect(componentsMd).toContain(`\`${catalog.counts.components}\` Components`);
    expect(componentsMd).toContain(`\`${catalog.counts.blocks}\` Blocks`);
    expect(componentsMd).toContain(`\`${catalog.counts.icons}\` slugs`);
    expect(componentsMd).toContain(`\`${catalog.counts.illustrations}\` slugs`);
    expect(componentsMd).toContain(`\`${catalog.counts.clients}\` slugs`);
    expect(componentsMd).toContain(`\`${catalog.counts.products}\` slugs`);
    expect(componentsMd).toContain(`\`${catalog.counts.brand}\` slugs`);

    for (const entry of catalog.components) {
      if (entry.kind === 'component' || entry.kind === 'hook') {
        expect(
          new RegExp(`\`${entry.name}(?:<|\`|\\()`).test(componentsMd),
          `${entry.kind} "${entry.name}" is exported from src/omada/index.ts but missing in COMPONENTS.md`,
        ).toBe(true);
      }
    }

    const compMap = new Map(catalog.components.map((c) => [c.name, c]));
    let inRefSections = false;
    for (const line of componentsMd.split('\n')) {
      if (line.startsWith('## 1.')) {
        inRefSections = true;
        continue;
      }
      if (inRefSections && line.startsWith('## 4.')) {
        break;
      }
      if (!inRefSections || !line.startsWith('| `')) continue;

      const cells = line
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      if (cells.length < 3) continue;

      const names = [...cells[0].matchAll(/`([A-Za-z0-9_]+)`/g)].map((m) => m[1]);
      const matchedComps = names
        .map((n) => compMap.get(n))
        .filter((c): c is CatalogComponent => Boolean(c && c.kind === 'component'));
      if (matchedComps.length === 0) continue;

      const validProps = new Set<string>();
      for (const comp of matchedComps) {
        for (const p of comp.props ?? []) validProps.add(p.name);
        for (const p of comp.antdProps ?? []) validProps.add(p);
        for (const p of comp.commonProps ?? []) validProps.add(p);
      }

      const apiCell = cells[cells.length - 1];
      const propTokens = [...apiCell.matchAll(/`([a-z][a-zA-Z0-9_]*)`/g)].map((m) => m[1]);

      for (const tok of propTokens) {
        if (tok === 'toast' || tok === 'notify' || tok === 'true' || tok === 'false') continue;
        expect(
          validProps.has(tok),
          `Ghost prop "${tok}" documented in COMPONENTS.md row [${names.join(', ')}]`,
        ).toBe(true);
      }
    }
  });
});
