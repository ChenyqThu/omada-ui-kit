#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../references/catalog.json');

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Missing catalog.json at ${CATALOG_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function main() {
  const targetArg = process.argv[2];
  if (!targetArg) {
    console.error('Usage: node verify-demo.mjs <path-to-demo.html|tsx>');
    process.exit(1);
  }

  const targetPath = path.resolve(process.cwd(), targetArg);
  if (!fs.existsSync(targetPath)) {
    console.error(`File not found: ${targetPath}`);
    process.exit(1);
  }

  const catalog = loadCatalog();
  const content = fs.readFileSync(targetPath, 'utf8');
  const isHtml = targetPath.toLowerCase().endsWith('.html');

  const sets = {
    SIcon: new Set((catalog.assets?.icons ?? []).map((i) => i.name)),
    SProductImage: new Set((catalog.assets?.products ?? []).map((p) => p.name)),
    SIllustration: new Set((catalog.assets?.illustrations ?? []).map((i) => i.name)),
    SClientIcon: new Set((catalog.assets?.clients ?? []).map((c) => c.name)),
    SBrandAsset: new Set((catalog.assets?.brand ?? []).map((b) => b.name)),
  };

  const errors = [];
  const warnings = [];
  let checkedAssetSlugs = 0;

  // 1. Validate static asset slug literals against catalog.json
  for (const [tag, validSet] of Object.entries(sets)) {
    const regex = new RegExp(`<${tag}\\b[^>]*\\bname\\s*=\\s*(["'])([^"']+)\\1`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      checkedAssetSlugs++;
      const slug = match[2];
      if (!validSet.has(slug)) {
        const line = lineNumberAt(content, match.index);
        errors.push(`Line ${line}: Unknown ${tag} name="${slug}". Query valid slugs with query-catalog.mjs.`);
      }
    }
  }

  // 2. Ensure OmadaProvider is present in standalone HTML demos
  if (isHtml && !content.includes('<OmadaProvider')) {
    errors.push('Missing <OmadaProvider>: Single-file HTML demos must wrap the root UI with <OmadaProvider>.');
  }

  // 3. Flag deprecated AntD 5 props
  const deprecatedProps = [
    { token: 'overlayClassName', hint: 'Use AntD 6 `classNames={{ root: "..." }}` instead.' },
    { token: 'dropdownClassName', hint: 'Use AntD 6 `classNames={{ popup: { root: "..." } }}` instead.' },
    { token: 'bodyStyle', hint: 'Use AntD 6 `styles={{ body: { ... } }}` instead.' },
    { token: 'destroyOnClose', hint: 'Use AntD 6 `destroyOnHidden` instead.' },
  ];
  for (const item of deprecatedProps) {
    const regex = new RegExp(`\\b${item.token}\\s*=`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const line = lineNumberAt(content, match.index);
      errors.push(`Line ${line}: Deprecated AntD prop \`${item.token}\`. ${item.hint}`);
    }
  }

  // 4. Flag `<SButton type=...>` (SButton omits `type` and expects `variant=`)
  const sButtonRegex = /<SButton\b([^>]*)>/g;
  let btnMatch;
  while ((btnMatch = sButtonRegex.exec(content)) !== null) {
    const attrs = btnMatch[1];
    if (/\btype\s*=/.test(attrs)) {
      const line = lineNumberAt(content, btnMatch.index);
      errors.push(`Line ${line}: <SButton> does not accept \`type=\`; use \`variant="primary" | "secondary" | ...\` instead.`);
    }
  }

  // 5. Helpful warning if SEmulatorShell is used without any quick-drawer right padding hint
  if (content.includes('<SEmulatorShell') && !content.includes('showQuickDrawerHandle={false}') && !content.includes('pr-9') && !content.includes('SFilterTableBlock') && !content.includes('SInlineRuleEditorLayout') && !content.includes('SSettingsPageShell') && !content.includes('44px') && !content.includes('36')) {
    warnings.push('SEmulatorShell renders a right-edge `<||` quick-drawer handle by default; add `pr-9` / `paddingRight: 44px` on top-right controls.');
  }

  for (const w of warnings) {
    console.warn(`WARN [${targetArg}]: ${w}`);
  }

  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`ERROR [${targetArg}] ${err}`);
    }
    process.exit(1);
  }

  console.log(`PASS [${targetArg}]: verified ${checkedAssetSlugs} static asset slug(s), 0 AntD6/Omada violations.`);
}

main();
