import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTsArrayConstant(filePath, constName) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.ES2022, true);
  let result = null;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === constName &&
      node.initializer
    ) {
      const slice = sourceText.slice(node.initializer.getStart(sourceFile), node.initializer.getEnd());
      const normalized = slice.replace(/\s+as\s+const\b/g, '');
      result = Function(`"use strict"; return (${normalized});`)();
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return result ?? [];
}

function readTsObjectConstant(filePath, constName) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.ES2022, true);
  let result = null;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === constName &&
      node.initializer
    ) {
      const slice = sourceText.slice(node.initializer.getStart(sourceFile), node.initializer.getEnd());
      const normalized = slice.replace(/\s+as\s+const\b/g, '');
      result = Function(`"use strict"; return (${normalized});`)();
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return result ?? {};
}

function classifySourcePath(relPath, symbolName) {
  if (relPath.startsWith('node_modules/')) return 'antd-reexport';
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.includes('omada/theme/') || symbolName === 'OmadaProvider' || symbolName === 'useOmadaTheme') {
    return 'theme';
  }
  if (normalized.includes('omada/layout/')) {
    return normalized.includes('SEmulatorShell') ? 'emulator-v6' : 'layout';
  }
  if (normalized.includes('omada/assets/') || normalized.includes('omada/icons/')) {
    return 'assets';
  }
  const emulatorFiles = new Set([
    'SClientOverviewStrip',
    'STopologyCanvas',
    'SDonutSummaryCard',
    'SCategoryKpiCarousel',
    'SHealthGauge',
    'SHealthTrendBar',
    'SApDistributionRuler',
    'SChannelUtilization',
    'SDeviceHealthSummary',
    'SDevicePortGraphic',
    'SSettingsPageShell',
    'STerminalConsole',
    'SPortPanel',
    'SDeviceStatus',
  ]);
  for (const name of emulatorFiles) {
    if (normalized.includes(`/${name}.tsx`) || symbolName.startsWith(name)) {
      return 'emulator-v6';
    }
  }
  if (normalized.includes('/SChart.tsx')) return 'charts';
  if (
    normalized.includes('/SButton.tsx') ||
    normalized.includes('/SInput.tsx') ||
    normalized.includes('/SIpInput.tsx') ||
    normalized.includes('/SMacInput.tsx') ||
    normalized.includes('/SSelect.tsx') ||
    normalized.includes('/SCascader.tsx') ||
    normalized.includes('/STreeSelect.tsx') ||
    normalized.includes('/SSlider.tsx') ||
    normalized.includes('/SRadio.tsx') ||
    normalized.includes('/SCheckbox.tsx') ||
    normalized.includes('/SSwitch.tsx') ||
    normalized.includes('/SColorPicker.tsx') ||
    normalized.includes('/SRate.tsx') ||
    normalized.includes('/STransfer.tsx') ||
    normalized.includes('/SUpload.tsx') ||
    normalized.includes('/SDatePicker.tsx') ||
    normalized.includes('/STimePicker.tsx') ||
    normalized.includes('/SSchedule.tsx') ||
    normalized.includes('/SForm.tsx')
  ) {
    return 'input';
  }
  if (
    normalized.includes('/SAlert.tsx') ||
    normalized.includes('/SModal.tsx') ||
    normalized.includes('/SDrawer.tsx') ||
    normalized.includes('/SNotification.tsx') ||
    normalized.includes('/SLoading.tsx') ||
    normalized.includes('/SEmpty.tsx') ||
    normalized.includes('/STooltip.tsx') ||
    normalized.includes('/SPopover.tsx')
  ) {
    return 'feedback';
  }
  if (
    normalized.includes('/SDropdown.tsx') ||
    normalized.includes('/SPagination.tsx') ||
    normalized.includes('/SSteps.tsx') ||
    normalized.includes('/SBreadcrumb.tsx') ||
    normalized.includes('/SAnchor.tsx') ||
    normalized.includes('/SDivider.tsx') ||
    normalized.includes('/STabs.tsx')
  ) {
    return 'layout';
  }
  if (normalized.includes('omada/components/')) {
    return 'data-display';
  }
  return 'utility';
}

function getJsDocSummary(checker, symbol) {
  const docs = symbol.getDocumentationComment(checker);
  if (!docs || docs.length === 0) return '';
  return ts.displayPartsToString(docs).replace(/\s+/g, ' ').trim();
}

function collectOwnPropsFromType(checker, sourceFile, typeNode) {
  const props = [];
  const seen = new Set();

  function addProp(propName, typeText, optional, description) {
    if (seen.has(propName)) return;
    seen.add(propName);
    props.push({
      name: propName,
      type: typeText.replace(/\s+/g, ' ').trim(),
      optional,
      ...(description ? { description } : {}),
    });
  }

  function extractFromMembers(members) {
    for (const member of members) {
      if (ts.isPropertySignature(member) && member.name) {
        const propName = member.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
        const typeText = member.type ? member.type.getText(sourceFile) : 'unknown';
        const optional = Boolean(member.questionToken);
        const sym = checker.getSymbolAtLocation(member.name);
        const description = sym ? getJsDocSummary(checker, sym) : '';
        addProp(propName, typeText, optional, description);
      } else if (ts.isMethodSignature(member) && member.name) {
        const propName = member.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
        const sigText = member.getText(sourceFile).replace(/;$/, '');
        addProp(propName, sigText, Boolean(member.questionToken), '');
      }
    }
  }

  if (ts.isInterfaceDeclaration(typeNode)) {
    extractFromMembers(typeNode.members);
  } else if (ts.isTypeAliasDeclaration(typeNode)) {
    const visitType = (node) => {
      if (ts.isTypeLiteralNode(node)) {
        extractFromMembers(node.members);
      } else if (ts.isIntersectionTypeNode(node)) {
        for (const sub of node.types) visitType(sub);
      }
    };
    visitType(typeNode.type);
  }

  return props;
}

function buildComponentCatalog() {
  const entryPath = path.join(ROOT_DIR, 'src/omada/index.ts');
  const configPath = path.join(ROOT_DIR, 'tsconfig.lib.json');
  const rawConfig = readJson(configPath);
  const parsed = ts.parseJsonConfigFileContent(rawConfig, ts.sys, ROOT_DIR);
  const program = ts.createProgram([entryPath], parsed.options);
  const checker = program.getTypeChecker();
  const entrySource = program.getSourceFile(entryPath);
  if (!entrySource) {
    throw new Error(`Could not load entry file: ${entryPath}`);
  }
  const entrySymbol = checker.getSymbolAtLocation(entrySource);
  if (!entrySymbol) {
    throw new Error(`Could not resolve exports of ${entryPath}`);
  }

  const exports = checker.getExportsOfModule(entrySymbol);
  const propsMap = new Map();
  const valueEntries = [];

  for (const sym of exports) {
    const resolved =
      sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
    const decl = resolved.declarations?.[0] ?? sym.declarations?.[0];
    if (!decl) continue;
    const sf = decl.getSourceFile();
    const relPath = path.relative(ROOT_DIR, sf.fileName).replace(/\\/g, '/');

    if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) {
      if (sym.name.endsWith('Props') && !relPath.startsWith('node_modules/')) {
        propsMap.set(sym.name, {
          propsTypeName: sym.name,
          props: collectOwnPropsFromType(checker, sf, decl),
          extendsText:
            ts.isInterfaceDeclaration(decl) && decl.heritageClauses
              ? decl.heritageClauses.map((h) => h.getText(sf)).join(' ')
              : '',
        });
      }
      continue;
    }

    // Collect runtime exports (React components, hooks, constants, functions)
    const isAntdReexport =
      relPath.startsWith('node_modules/antd') || relPath.includes('/node_modules/antd/');
    const isManifestOrTokenData =
      sym.name.startsWith('OMADA_') ||
      sym.name.startsWith('omada') ||
      sym.name.startsWith('DEFAULT_') ||
      sym.name.startsWith('EMULATOR_');

    let description = getJsDocSummary(checker, resolved);
    if (!description && ts.isVariableDeclaration(decl) && decl.parent?.parent) {
      const varStmt = decl.parent.parent;
      const jsDocs = ts.getJSDocCommentsAndTags(varStmt);
      if (jsDocs.length > 0 && jsDocs[0].comment) {
        description =
          typeof jsDocs[0].comment === 'string'
            ? jsDocs[0].comment.replace(/\s+/g, ' ').trim()
            : '';
      }
    }

    valueEntries.push({
      name: sym.name,
      category: classifySourcePath(relPath, sym.name),
      kind: isAntdReexport
        ? 'antd-primitive'
        : isManifestOrTokenData
          ? 'data'
          : sym.name.startsWith('use')
            ? 'hook'
            : /^[A-Z]/.test(sym.name)
              ? 'component'
              : 'helper',
      sourcePath: relPath,
      description,
    });
  }

  const components = valueEntries
    .map((entry) => {
      const exactProps = propsMap.get(`${entry.name}Props`);
      // Some sub-components expose Props without matching prefix or with exact match
      const propsInfo = exactProps ?? null;
      return {
        ...entry,
        ...(propsInfo ? { propsType: propsInfo.propsTypeName, props: propsInfo.props } : {}),
        ...(propsInfo?.extendsText ? { extends: propsInfo.extendsText } : {}),
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  return components;
}

function dedupeAssetManifest(entries) {
  const map = new Map();
  for (const entry of entries) {
    const existing = map.get(entry.name);
    if (!existing) {
      map.set(entry.name, {
        name: entry.name,
        category: entry.category,
        themes: [entry.theme],
        width: entry.width,
        height: entry.height,
        format: entry.format,
      });
    } else if (!existing.themes.includes(entry.theme)) {
      existing.themes.push(entry.theme);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildRecipes(pkgName, pkgVersion) {
  return [
    {
      id: 'single-file-html',
      title: 'Zero-Build Single-File HTML Demo (~45 lines)',
      summary:
        'Fastest shareable PRD prototype that runs via file:// double-click or static hosting using dist/standalone.js + dist/style.css.',
      components: ['OmadaProvider', 'SEmulatorShell', 'SPageHeader', 'SKpiCard', 'STable', 'SDrawer', 'SIcon'],
      cdnUrls: {
        css: `https://cdn.jsdelivr.net/npm/${pkgName}@latest/dist/style.css`,
        js: `https://cdn.jsdelivr.net/npm/${pkgName}@latest/dist/standalone.js`,
      },
      pinnedUrls: {
        css: `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}/dist/style.css`,
        js: `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}/dist/standalone.js`,
      },
    },
    {
      id: 'controller-shell',
      title: 'Omada Controller v6.3 Shell + Page Header',
      summary:
        'Full 56px emerald topbar, 216px collapsible sidebar with grouped mega-popovers, site switcher pill, and Light/Dark theme sync.',
      components: ['OmadaProvider', 'SEmulatorShell', 'EMULATOR_NAV_GROUPS', 'SPageHeader', 'useOmadaTheme'],
      notes: 'Add pr-9 on the rightmost top toolbar/KPI strip inside <main> so content clears SEmulatorShell’s fixed <|| quick-drawer handle.',
    },
    {
      id: 'overview-dashboard',
      title: 'Site Health Dashboard & AP Telemetry',
      summary:
        '24h health gauge/trend cards, AP channel distribution ruler, 2.4/5/6 GHz channel utilization bars, and client distribution strips.',
      components: ['SHealthGauge', 'SHealthRadar', 'SHealthTrendBar', 'SApDistributionRuler', 'SChannelUtilization', 'SDeviceHealthSummary', 'SClientOverviewStrip', 'SLineChart', 'SDonutSummaryCard'],
    },
    {
      id: 'device-inventory-drawer',
      title: 'Devices / Clients Inventory Table + Two-Stage Drawer',
      summary:
        'Dense 12px/14px tabular inventory with SSearchInput, status dots, real product photos, and right slide-out detail drawer.',
      components: ['STable', 'SDeviceStatus', 'SProductImage', 'SClientIcon', 'SSearchInput', 'SSelect', 'STag', 'SDrawer', 'SDescriptions', 'SDevicePortGraphic', 'SPortPanel'],
    },
    {
      id: 'topology-map',
      title: 'Interactive Topology & Floorplan Map',
      summary:
        'Zoomable network hierarchy canvas with device status badges, link speeds, and layer filter toggles.',
      components: ['STopologyCanvas', 'SCard', 'SDeviceIcon', 'SSelect', 'STag'],
    },
    {
      id: 'settings-form',
      title: 'Omada v6.3 Site / Network / Device Settings Page',
      summary:
        'Structured configuration sections with 200px left labels, 350px controls, contextual SSettingsInfoBanner, and sticky bottom Save/Cancel footer.',
      components: ['SSettingsPageShell', 'SSettingsSection', 'SSettingsRow', 'SSettingsInfoBanner', 'SInput', 'SIpInput', 'SMacInput', 'SSelect', 'SSwitch', 'SButton'],
    },
    {
      id: 'tools-terminal',
      title: 'Network Tools & Interactive Dark CLI Terminal',
      summary:
        'Diagnostic tabs + interactive dark SSH/CLI console supporting search highlights, command history, and multi-device selection.',
      components: ['STabs', 'STerminalConsole', 'SSelect', 'SInput', 'SButton', 'SAlert'],
    },
  ];
}

function copyDirRecursive(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const pkg = readJson(path.join(ROOT_DIR, 'package.json'));
  const tokensPath = path.join(ROOT_DIR, 'src/omada/theme/tokens.ts');
  const iconsManifestPath = path.join(ROOT_DIR, 'src/omada/assets/iconsManifest.ts');
  const assetsManifestPath = path.join(ROOT_DIR, 'src/omada/assets/assetsManifest.ts');

  const components = buildComponentCatalog();
  const semanticTokens = readTsObjectConstant(tokensPath, 'omadaSemanticTokens');
  const layoutTokens = readTsObjectConstant(tokensPath, 'omadaLayout');
  const radiusTokens = readTsObjectConstant(tokensPath, 'omadaRadius');
  const portColors = readTsObjectConstant(tokensPath, 'omadaPortColors');
  const chartPalette = readTsObjectConstant(tokensPath, 'omadaChartPalette');

  const iconCategories = readTsArrayConstant(iconsManifestPath, 'OMADA_ICON_CATEGORIES');
  const iconsRaw = readTsArrayConstant(iconsManifestPath, 'OMADA_ICONS');
  const illustrationsRaw = readTsArrayConstant(assetsManifestPath, 'OMADA_ILLUSTRATIONS');
  const productsRaw = readTsArrayConstant(assetsManifestPath, 'OMADA_PRODUCTS');
  const clientsRaw = readTsArrayConstant(assetsManifestPath, 'OMADA_CLIENTS');
  const brandRaw = readTsArrayConstant(assetsManifestPath, 'OMADA_BRAND_ASSETS');

  const catalog = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    package: {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description ?? '',
      entries: {
        import: pkg.name,
        styleCss: `${pkg.name}/style.css`,
        standalone: `${pkg.name}/standalone`,
        catalog: `${pkg.name}/catalog.json`,
      },
      cdn: {
        jsdelivrCss: `https://cdn.jsdelivr.net/npm/${pkg.name}@latest/dist/style.css`,
        jsdelivrStandalone: `https://cdn.jsdelivr.net/npm/${pkg.name}@latest/dist/standalone.js`,
        pinnedCss: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/style.css`,
        pinnedStandalone: `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/standalone.js`,
      },
    },
    counts: {
      components: components.filter((c) => c.kind === 'component').length,
      antdPrimitives: components.filter((c) => c.kind === 'antd-primitive').length,
      hooksAndHelpers: components.filter((c) => c.kind === 'hook' || c.kind === 'helper').length,
      icons: iconsRaw.length,
      products: dedupeAssetManifest(productsRaw).length,
      illustrations: dedupeAssetManifest(illustrationsRaw).length,
      clients: dedupeAssetManifest(clientsRaw).length,
      brand: dedupeAssetManifest(brandRaw).length,
    },
    components,
    tokens: {
      layout: layoutTokens,
      radius: radiusTokens,
      semantic: semanticTokens,
      portColors,
      chartPalette,
    },
    assets: {
      iconCategories,
      icons: iconsRaw.map((entry) => ({
        name: entry.name,
        category: entry.category,
        figmaName: entry.figmaName,
        width: entry.width,
        height: entry.height,
        monochrome: entry.monochrome,
      })),
      products: dedupeAssetManifest(productsRaw),
      illustrations: dedupeAssetManifest(illustrationsRaw),
      clients: dedupeAssetManifest(clientsRaw),
      brand: dedupeAssetManifest(brandRaw),
    },
    recipes: buildRecipes(pkg.name, pkg.version),
  };

  const jsonPayload = `${JSON.stringify(catalog, null, 2)}\n`;

  const distCatalogPath = path.join(ROOT_DIR, 'dist/catalog.json');
  fs.mkdirSync(path.dirname(distCatalogPath), { recursive: true });
  fs.writeFileSync(distCatalogPath, jsonPayload, 'utf8');

  const skillRefPath = path.join(ROOT_DIR, 'skills/omada-ui-kit/references/catalog.json');
  fs.mkdirSync(path.dirname(skillRefPath), { recursive: true });
  fs.writeFileSync(skillRefPath, jsonPayload, 'utf8');

  // Sync canonical skill bundle (`skills/omada-ui-kit`) to `.agents/skills/` and `~/.gemini/config/skills/`
  const canonicalSkillDir = path.join(ROOT_DIR, 'skills/omada-ui-kit');
  const syncTargets = [
    path.join(ROOT_DIR, '.agents/skills/omada-ui-kit'),
    path.join(os.homedir(), '.gemini/config/skills/omada-ui-kit'),
  ];
  for (const targetDir of syncTargets) {
    copyDirRecursive(canonicalSkillDir, targetDir);
  }

  console.log(
    `Generated catalog.json: ${catalog.counts.components} Omada components, ` +
      `${catalog.counts.antdPrimitives} AntD primitives, ${catalog.counts.icons} icons, ` +
      `${catalog.counts.products} products, ${catalog.counts.illustrations} illustrations, ` +
      `${catalog.counts.clients} client icons, ${catalog.counts.brand} brand assets.`,
  );
  console.log(`Synced skill bundle to ${syncTargets.join(', ')}`);
}

main();
