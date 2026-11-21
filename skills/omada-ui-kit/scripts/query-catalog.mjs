#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../references/catalog.json');

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Missing catalog.json at ${CATALOG_PATH}. Run "pnpm build:catalog" in the repo root.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function usage() {
  console.log(`Omada UI Kit Catalog Query CLI

Usage:
  node query-catalog.mjs info
  node query-catalog.mjs list-components [category]
  node query-catalog.mjs component <NameOrSubstring>
  node query-catalog.mjs search-icons <keyword> [limit=25]
  node query-catalog.mjs search-assets <products|illustrations|clients|brand> [keyword] [limit=25]
  node query-catalog.mjs tokens [light|dark]
  node query-catalog.mjs recipes [keyword]`);
}

function cmdInfo(catalog) {
  console.log(`Package: ${catalog.package.name}@${catalog.package.version}`);
  console.log(`CDN CSS:        ${catalog.package.cdn.jsdelivrCss}`);
  console.log(`CDN Standalone: ${catalog.package.cdn.jsdelivrStandalone}`);
  console.log('Counts:', JSON.stringify(catalog.counts));
}

function cmdListComponents(catalog, category) {
  const items = catalog.components.filter((c) => {
    if (!category) return c.kind !== 'antd-primitive' && c.kind !== 'data';
    return c.category.toLowerCase() === category.toLowerCase();
  });
  if (items.length === 0) {
    const categories = [...new Set(catalog.components.map((c) => c.category))];
    console.log(`No items matched category "${category}". Available: ${categories.join(', ')}`);
    return;
  }
  const grouped = new Map();
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category).push(item);
  }
  for (const [cat, list] of grouped) {
    console.log(`\n## ${cat} (${list.length})`);
    for (const c of list) {
      const propCount = c.props ? ` (${c.props.length} props)` : '';
      const desc = c.description ? ` — ${c.description}` : '';
      console.log(`- ${c.name} [${c.kind}]${propCount}${desc}`);
    }
  }
}

function cmdComponent(catalog, query) {
  if (!query) {
    console.error('Provide a component name, e.g. node query-catalog.mjs component SEmulatorShell');
    process.exit(1);
  }
  const lower = query.toLowerCase();
  const exact = catalog.components.find((c) => c.name.toLowerCase() === lower);
  const matches = exact
    ? [exact]
    : catalog.components.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 8);

  if (matches.length === 0) {
    console.log(`No exported symbol matches "${query}".`);
    return;
  }
  for (const item of matches) {
    console.log(`\n### ${item.name} (${item.category} / ${item.kind})`);
    if (item.description) console.log(item.description);
    console.log(`Import: import { ${item.name} } from '${catalog.package.name}';`);
    if (item.sourcePath) console.log(`Source: ${item.sourcePath}`);
    if (item.extends) console.log(`Extends: ${item.extends}`);
    if (item.props && item.props.length > 0) {
      console.log('\nProps:');
      for (const p of item.props) {
        const req = p.optional ? '?' : '';
        const desc = p.description ? `  // ${p.description}` : '';
        console.log(`  ${p.name}${req}: ${p.type}${desc}`);
      }
    } else {
      console.log('(No dedicated *Props interface extracted; check extends / AntD primitive signature.)');
    }
  }
}

function cmdSearchIcons(catalog, keyword = '', limitArg = '25') {
  const limit = Math.max(1, Number.parseInt(limitArg, 10) || 25);
  const lower = keyword.toLowerCase();
  const matches = catalog.assets.icons.filter(
    (icon) =>
      !lower ||
      icon.name.toLowerCase().includes(lower) ||
      icon.category.toLowerCase().includes(lower) ||
      (icon.figmaName && icon.figmaName.toLowerCase().includes(lower)),
  );
  console.log(
    `Matched ${matches.length} icons${lower ? ` for "${keyword}"` : ''} (showing ${Math.min(limit, matches.length)}):`,
  );
  for (const icon of matches.slice(0, limit)) {
    console.log(`- ${icon.name} [${icon.category}, ${icon.width}x${icon.height}]`);
  }
  if (matches.length === 0) {
    console.log(`Categories: ${catalog.assets.iconCategories.join(', ')}`);
  }
}

function cmdSearchAssets(catalog, group, keyword = '', limitArg = '25') {
  const validGroups = ['products', 'illustrations', 'clients', 'brand'];
  if (!validGroups.includes(group)) {
    console.error(`Asset group must be one of: ${validGroups.join(', ')}`);
    process.exit(1);
  }
  const limit = Math.max(1, Number.parseInt(limitArg, 10) || 25);
  const lower = keyword.toLowerCase();
  const list = catalog.assets[group] ?? [];
  const matches = list.filter(
    (entry) =>
      !lower ||
      entry.name.toLowerCase().includes(lower) ||
      (entry.category && entry.category.toLowerCase().includes(lower)),
  );
  console.log(
    `Matched ${matches.length} ${group}${lower ? ` for "${keyword}"` : ''} (showing ${Math.min(limit, matches.length)}):`,
  );
  for (const item of matches.slice(0, limit)) {
    console.log(
      `- ${item.name} [themes: ${item.themes.join('/')}, ${item.width}x${item.height}]`,
    );
  }
}

function cmdTokens(catalog, mode = 'light') {
  const normalized = mode === 'dark' ? 'dark' : 'light';
  console.log(`=== Omada Semantic Tokens (${normalized}) ===`);
  console.log(JSON.stringify(catalog.tokens.semantic[normalized], null, 2));
  console.log('\n=== Layout Tokens ===');
  console.log(JSON.stringify(catalog.tokens.layout, null, 2));
  console.log('\n=== Port Speed Colors ===');
  console.log(JSON.stringify(catalog.tokens.portColors[normalized], null, 2));
}

function cmdRecipes(catalog, keyword = '') {
  const lower = keyword.toLowerCase();
  const matches = catalog.recipes.filter(
    (r) =>
      !lower ||
      r.id.toLowerCase().includes(lower) ||
      r.title.toLowerCase().includes(lower) ||
      r.summary.toLowerCase().includes(lower),
  );
  for (const r of matches) {
    console.log(`\n## ${r.title} (${r.id})`);
    console.log(r.summary);
    console.log(`Components: ${r.components.join(', ')}`);
    if (r.cdnUrls) {
      console.log(`CDN CSS: ${r.cdnUrls.css}`);
      console.log(`CDN JS:  ${r.cdnUrls.js}`);
    }
    if (r.notes) console.log(`Note: ${r.notes}`);
  }
}

const [, , subcmd, ...rest] = process.argv;
const catalog = loadCatalog();

switch (subcmd) {
  case 'info':
    cmdInfo(catalog);
    break;
  case 'list-components':
    cmdListComponents(catalog, rest[0]);
    break;
  case 'component':
    cmdComponent(catalog, rest[0]);
    break;
  case 'search-icons':
    cmdSearchIcons(catalog, rest[0], rest[1]);
    break;
  case 'search-assets':
    cmdSearchAssets(catalog, rest[0], rest[1], rest[2]);
    break;
  case 'tokens':
    cmdTokens(catalog, rest[0]);
    break;
  case 'recipes':
    cmdRecipes(catalog, rest[0]);
    break;
  default:
    usage();
    if (subcmd) process.exit(1);
}
