import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BABEL_CDN_URL = 'https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js';

const CORE_DOM_REACT_PROPS = new Set([
  'autoFocus',
  'checked',
  'children',
  'className',
  'cols',
  'defaultChecked',
  'defaultValue',
  'disabled',
  'href',
  'htmlFor',
  'id',
  'max',
  'maxLength',
  'min',
  'minLength',
  'name',
  'onBlur',
  'onChange',
  'onClick',
  'onDoubleClick',
  'onFocus',
  'onInput',
  'onKeyDown',
  'onKeyUp',
  'onMouseEnter',
  'onMouseLeave',
  'onSubmit',
  'placeholder',
  'readOnly',
  'rel',
  'required',
  'role',
  'rows',
  'step',
  'style',
  'tabIndex',
  'target',
  'title',
  'type',
  'value',
]);

const NON_CORE_DOM_SIGNAL_PROPS = new Set([
  'contentEditable',
  'contextMenu',
  'dir',
  'draggable',
  'hidden',
  'lang',
  'onDragStart',
  'onPointerDown',
  'spellCheck',
  'translate',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function evaluateAstLiteral(node, sourceFile) {
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node)) {
    return evaluateAstLiteral(node.expression, sourceFile);
  }
  if (ts.isParenthesizedExpression(node)) {
    return evaluateAstLiteral(node.expression, sourceFile);
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) return undefined;
  if (ts.isPrefixUnaryExpression(node)) {
    const operand = evaluateAstLiteral(node.operand, sourceFile);
    if (node.operator === ts.SyntaxKind.MinusToken && typeof operand === 'number') return -operand;
    if (node.operator === ts.SyntaxKind.PlusToken && typeof operand === 'number') return +operand;
    if (node.operator === ts.SyntaxKind.ExclamationToken) return !operand;
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((el) => evaluateAstLiteral(el, sourceFile));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        let key;
        if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) || ts.isNumericLiteral(prop.name)) {
          key = prop.name.text;
        } else {
          key = prop.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
        }
        obj[key] = evaluateAstLiteral(prop.initializer, sourceFile);
      }
    }
    return obj;
  }
  throw new Error(
    `Unsupported non-literal AST node (${ts.SyntaxKind[node.kind]}) in ${sourceFile.fileName}`,
  );
}

function readTsConstant(filePath, constName, fallback) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.ES2022, true);
  let result = undefined;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === constName &&
      node.initializer
    ) {
      result = evaluateAstLiteral(node.initializer, sourceFile);
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return result ?? fallback;
}

function classifySourcePath(relPath, symbolName) {
  if (relPath.startsWith('node_modules/')) return 'antd-reexport';
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized.includes('omada/agent/')) {
    return 'agent';
  }
  if (normalized.includes('omada/theme/') || symbolName === 'OmadaProvider' || symbolName === 'useOmadaTheme') {
    return 'theme';
  }
  if (normalized.includes('omada/behaviors/')) {
    return 'layout';
  }
  if (
    normalized.includes('omada/blocks/') ||
    normalized.includes('layout/SEmulatorShell') ||
    symbolName === 'SEmulatorShell' ||
    symbolName === 'EMULATOR_NAV_GROUPS' ||
    symbolName === 'EMULATOR_GLOBAL_NAV_GROUPS'
  ) {
    return 'blocks';
  }
  if (normalized.includes('omada/layout/')) {
    return 'layout';
  }
  if (normalized.includes('omada/assets/') || normalized.includes('omada/icons/')) {
    return 'assets';
  }
  if (
    normalized.includes('/SChart.tsx') ||
    normalized.includes('/SDonutSummaryCard.tsx') ||
    normalized.includes('/SHealthGauge.tsx') ||
    normalized.includes('/SHealthTrendBar.tsx') ||
    normalized.includes('/SChannelUtilization.tsx')
  ) {
    return 'charts';
  }
  const emulatorFiles = new Set([
    'SClientOverviewStrip',
    'STopologyCanvas',
    'SCategoryKpiCarousel',
    'SApDistributionRuler',
    'SDeviceHealthSummary',
    'SDevicePortGraphic',
    'SSettingsPageShell',
    'STerminalConsole',
    'SExpandableSection',
    'SAclRuleBuilder',
    'SPortPanel',
    'SDeviceStatus',
  ]);
  for (const name of emulatorFiles) {
    if (normalized.includes(`/${name}.tsx`) || symbolName.startsWith(name)) {
      return 'emulator-v6';
    }
  }
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
    normalized.includes('/SDivider.tsx')
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

function formatCompactType(checker, propSym, anchorDecl) {
  for (const d of propSym.declarations ?? []) {
    if ((ts.isPropertySignature(d) || ts.isParameter(d)) && d.type) {
      const sf = d.getSourceFile();
      const raw = d.type.getText(sf).replace(/\s+/g, ' ').trim();
      return raw.length > 140 ? `${raw.slice(0, 137)}...` : raw;
    }
    if (ts.isMethodSignature(d)) {
      const sf = d.getSourceFile();
      const raw = d.getText(sf).replace(/;$/, '').replace(/\s+/g, ' ').trim();
      return raw.length > 140 ? `${raw.slice(0, 137)}...` : raw;
    }
  }
  const propType = checker.getTypeOfSymbolAtLocation(propSym, anchorDecl);
  const printed = checker
    .typeToString(propType, anchorDecl, ts.TypeFormatFlags.NoTruncation)
    .replace(/\s+/g, ' ')
    .trim();
  return printed.length > 140 ? `${printed.slice(0, 137)}...` : printed;
}

function extractPropsViaChecker(checker, propsType, anchorDecl) {
  const candidateTypes = propsType.isUnion() ? propsType.types : [propsType];
  const symbolsByName = new Map();

  for (const branchType of candidateTypes) {
    for (const propSym of branchType.getProperties()) {
      const name = propSym.getName();
      if (
        name === 'key' ||
        name === 'ref' ||
        name === 'prefixCls' ||
        name.startsWith('_') ||
        name.startsWith('aria-') ||
        name.startsWith('data-')
      ) {
        continue;
      }
      if (!symbolsByName.has(name)) {
        symbolsByName.set(name, []);
      }
      symbolsByName.get(name).push(propSym);
    }
  }

  const ownProps = [];
  const antdProps = new Set();
  const commonProps = new Set();
  let acceptsDomProps = false;

  for (const [name, propSyms] of symbolsByName.entries()) {
    const primarySym = propSyms[0];
    const allDecls = propSyms.flatMap((s) => s.declarations ?? []);
    const declFiles = allDecls.map((d) =>
      path.relative(ROOT_DIR, d.getSourceFile().fileName).replace(/\\/g, '/'),
    );

    const isOwn = declFiles.some(
      (f) => f.startsWith('src/omada/') && !f.startsWith('node_modules/'),
    );
    const isAntd = declFiles.some(
      (f) =>
        f.includes('/antd/') ||
        f.includes('/@rc-component/') ||
        f.includes('/rc-') ||
        f.startsWith('node_modules/antd/'),
    );
    const isReactOrDom = declFiles.some(
      (f) =>
        f.includes('/@types/react/') ||
        f.includes('/typescript/lib/lib.dom') ||
        f.endsWith('lib.dom.d.ts'),
    );

    const presentInAllBranches = propSyms.length === candidateTypes.length;
    const isOptional =
      !presentInAllBranches ||
      propSyms.some((s) => Boolean(s.flags & ts.SymbolFlags.Optional)) ||
      allDecls.some((d) => Boolean(d.questionToken));

    const isDeprecated = propSyms.every((s) =>
      s.getJsDocTags(checker).some((tag) => tag.name === 'deprecated'),
    );

    if (isOwn) {
      const distinctTypes = [];
      for (const sym of propSyms) {
        const ownDecl =
          (sym.declarations ?? []).find((d) =>
            path
              .relative(ROOT_DIR, d.getSourceFile().fileName)
              .replace(/\\/g, '/')
              .startsWith('src/omada/'),
          ) ?? anchorDecl;
        const t = formatCompactType(checker, sym, ownDecl);
        if (!distinctTypes.includes(t)) {
          distinctTypes.push(t);
        }
      }
      const mergedType = distinctTypes.join(' | ');
      const description =
        propSyms.map((s) => getJsDocSummary(checker, s)).find(Boolean) ?? '';
      ownProps.push({
        name,
        type: mergedType.length > 140 ? `${mergedType.slice(0, 137)}...` : mergedType,
        optional: isOptional,
        ...(description ? { description } : {}),
      });
    } else if (isAntd) {
      if (!isDeprecated) {
        antdProps.add(name);
      }
    } else if (isReactOrDom) {
      if (CORE_DOM_REACT_PROPS.has(name)) {
        commonProps.add(name);
      }
      if (NON_CORE_DOM_SIGNAL_PROPS.has(name)) {
        acceptsDomProps = true;
      }
    } else if (!isDeprecated) {
      ownProps.push({
        name,
        type: formatCompactType(checker, primarySym, anchorDecl),
        optional: isOptional,
      });
    }
  }

  ownProps.sort((a, b) => a.name.localeCompare(b.name));

  return {
    ownProps,
    antdProps: Array.from(antdProps).sort((a, b) => a.localeCompare(b)),
    commonProps: Array.from(commonProps).sort((a, b) => a.localeCompare(b)),
    acceptsDomProps,
  };
}

function resolveComponentPropsTypeFromValue(checker, valueSym, decl) {
  const symType = checker.getTypeOfSymbolAtLocation(valueSym, decl);
  const callSigs = symType.getCallSignatures();
  if (callSigs.length > 0 && callSigs[0].parameters.length > 0) {
    const firstParam = callSigs[0].parameters[0];
    return checker.getTypeOfSymbolAtLocation(firstParam, decl);
  }
  const constructSigs = symType.getConstructSignatures();
  if (constructSigs.length > 0 && constructSigs[0].parameters.length > 0) {
    const firstParam = constructSigs[0].parameters[0];
    return checker.getTypeOfSymbolAtLocation(firstParam, decl);
  }
  return null;
}

function buildSubpathLookup(program, checker, pkgName) {
  const orderedSubpaths = [
    ['agent', path.join(ROOT_DIR, 'src/lib/agent.ts')],
    ['blocks', path.join(ROOT_DIR, 'src/lib/blocks.ts')],
    ['charts', path.join(ROOT_DIR, 'src/lib/charts.ts')],
    ['assets', path.join(ROOT_DIR, 'src/lib/assets.ts')],
    ['core', path.join(ROOT_DIR, 'src/lib/core.ts')],
    ['emulator', path.join(ROOT_DIR, 'src/lib/emulator.ts')],
  ];
  const map = new Map();
  for (const [subName, filePath] of orderedSubpaths) {
    const sf = program.getSourceFile(filePath);
    if (!sf) continue;
    const modSym = checker.getSymbolAtLocation(sf);
    if (!modSym) continue;
    for (const exp of checker.getExportsOfModule(modSym)) {
      if (!map.has(exp.name)) {
        map.set(exp.name, `${pkgName}/${subName}`);
      }
    }
  }
  return map;
}

function buildComponentCatalog(pkgName) {
  const entryPath = path.join(ROOT_DIR, 'src/omada/index.ts');
  const subpathFiles = ['agent', 'blocks', 'charts', 'assets', 'core', 'emulator'].map((s) =>
    path.join(ROOT_DIR, `src/lib/${s}.ts`),
  );
  const configPath = path.join(ROOT_DIR, 'tsconfig.lib.json');
  const rawConfig = readJson(configPath);
  const parsed = ts.parseJsonConfigFileContent(rawConfig, ts.sys, ROOT_DIR);
  const program = ts.createProgram([entryPath, ...subpathFiles], parsed.options);
  const checker = program.getTypeChecker();
  const subpathMap = buildSubpathLookup(program, checker, pkgName);

  const entrySource = program.getSourceFile(entryPath);
  if (!entrySource) {
    throw new Error(`Could not load entry file: ${entryPath}`);
  }
  const entrySymbol = checker.getSymbolAtLocation(entrySource);
  if (!entrySymbol) {
    throw new Error(`Could not resolve exports of ${entryPath}`);
  }

  const exports = checker.getExportsOfModule(entrySymbol);
  const propsTypeDecls = new Map();
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
        const declaredType = checker.getDeclaredTypeOfSymbol(resolved);
        propsTypeDecls.set(sym.name, {
          propsTypeName: sym.name,
          decl,
          type: declaredType,
          extendsText:
            ts.isInterfaceDeclaration(decl) && decl.heritageClauses
              ? decl.heritageClauses.map((h) => h.getText(sf)).join(' ')
              : '',
        });
      }
      continue;
    }

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

    const kind = isAntdReexport
      ? 'antd-primitive'
      : isManifestOrTokenData
        ? 'data'
        : sym.name.startsWith('use')
          ? 'hook'
          : /^[A-Z]/.test(sym.name)
            ? 'component'
            : 'helper';

    valueEntries.push({
      name: sym.name,
      category: classifySourcePath(relPath, sym.name),
      kind,
      subpath: subpathMap.get(sym.name) ?? pkgName,
      sourcePath: relPath,
      description,
      _resolved: resolved,
      _decl: decl,
    });
  }

  const components = valueEntries
    .map(({ _resolved, _decl, ...entry }) => {
      if (entry.kind !== 'component') {
        return entry;
      }

      const explicitProps = propsTypeDecls.get(`${entry.name}Props`);
      const targetType =
        explicitProps?.type ?? resolveComponentPropsTypeFromValue(checker, _resolved, _decl);

      if (!targetType) {
        return entry;
      }

      const extracted = extractPropsViaChecker(
        checker,
        targetType,
        explicitProps?.decl ?? _decl,
      );

      return {
        ...entry,
        ...(explicitProps ? { propsType: explicitProps.propsTypeName } : {}),
        ...(explicitProps?.extendsText ? { extends: explicitProps.extendsText } : {}),
        props: extracted.ownProps,
        ...(extracted.antdProps.length > 0 ? { antdProps: extracted.antdProps } : {}),
        ...(extracted.commonProps.length > 0 ? { commonProps: extracted.commonProps } : {}),
        acceptsDomProps: extracted.acceptsDomProps,
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
  const pinnedCss = `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}/dist/style.css`;
  const pinnedJs = `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}/dist/standalone.js`;

  return [
    {
      id: 'single-file-html',
      title: 'Zero-Build Single-File HTML Demo (~45 lines)',
      summary:
        'Fastest shareable PRD prototype that runs via file:// double-click or static hosting using pinned dist/standalone.js + dist/style.css.',
      components: ['OmadaProvider', 'SEmulatorShell', 'SPageHeader', 'SKpiCard', 'STable', 'SDrawer', 'SIcon'],
      cdnUrls: {
        css: pinnedCss,
        js: pinnedJs,
        babel: BABEL_CDN_URL,
      },
      pinnedUrls: {
        css: pinnedCss,
        js: pinnedJs,
        babel: BABEL_CDN_URL,
      },
    },
    {
      id: 'controller-shell',
      title: 'Omada Controller v6.3 Shell + Page Header',
      summary:
        'Full 56px emerald topbar, 216px collapsible sidebar with grouped mega-popovers, site switcher pill, and Light/Dark theme sync.',
      components: ['OmadaProvider', 'SEmulatorShell', 'EMULATOR_NAV_GROUPS', 'SPageHeader', 'useOmadaTheme'],
      notes:
        'Reserve >=36px/44px right padding (e.g. padding: "20px 44px 24px 24px" or pr-9 without conflicting inline padding shorthand) inside <SEmulatorShell> to clear the fixed <|| quick-drawer handle.',
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
        'Dense 12px/14px tabular inventory with SFilterTableBlock, status dots, real product photos, and right slide-out SDetailInspectorDrawer.',
      components: ['SFilterTableBlock', 'STable', 'SDeviceStatus', 'SProductImage', 'SClientIcon', 'SSearchInput', 'SSelect', 'STag', 'SDetailInspectorDrawer', 'SDescriptions', 'SDevicePortGraphic', 'SPortPanel'],
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
        'Structured configuration sections with 200px left labels, 350px controls, contextual SSettingsInfoBanner, quick-drawer clearance, and sticky bottom Apply/Cancel footer.',
      components: ['SSettingsPageShell', 'SSettingsSection', 'SSettingsRow', 'SSettingsInfoBanner', 'SExpandableSection', 'SInput', 'SIpInput', 'SMacInput', 'SSelect', 'SSwitch', 'SButton'],
    },
    {
      id: 'acl-rule-editor',
      title: 'ACL Security Rule Builder (Gateway / Switch / EAP ACL)',
      summary:
        'Inline full-pane rule editor with multi-select Direction/Protocols, Source → Policy Arrow → Destination dual-card builder, ACL Binding, and Advanced Settings.',
      components: ['SInlineRuleEditorLayout', 'SInlineFormRow', 'SAclRuleBuilder', 'SExpandableSection', 'SInput', 'SSelect', 'SButton', 'SModal', 'SIcon'],
    },
    {
      id: 'agent-bridge',
      title: 'Deterministic Agent Bridge & WebMCP (snapshot / query / act / allow)',
      summary:
        'Register interactive controls via agentId and domain actions via useOmadaAgentAction inside <OmadaAgentProvider exposeWindowBridge> for deterministic UI state inspection, multi-step batch actAsync({ steps }), WebMCP tool registration, allowlist permissions, and automatic [REDACTED] secret masking.',
      components: [
        'OmadaAgentProvider',
        'useOmadaAgent',
        'useOmadaAgentControl',
        'useOmadaAgentAction',
        'registerWebMcpTools',
        'SSwitch',
        'SSelect',
        'SInput',
        'SPasswordInput',
        'SNumberInput',
        'SCheckbox',
        'SCheckboxGroup',
        'SRadio',
        'SRadioGroup',
        'SDatePicker',
        'SRangePicker',
        'STabs',
        'STable',
        'SFilterTableBlock',
        'SDrawer',
        'SDetailInspectorDrawer',
        'SModal',
        'SStepModal',
        'SExpandableSection',
        'SSettingsPageShell',
      ],
    },
  ];
}

function buildTemplatesMetadata() {
  return [
    {
      id: 'dashboard',
      title: 'Site Overview Dashboard',
      summary: 'Full site telemetry homepage with KPI strip, 180-degree Health Gauge, 24h Trend Bar, WAN Line Chart, and Radio Channel Utilization.',
      blocks: ['SEmulatorShell'],
      components: ['OmadaProvider', 'SPageHeader', 'SKpiCard', 'SHealthGauge', 'SHealthTrendBar', 'SLineChart', 'SChannelUtilization'],
      htmlFile: 'templates/dashboard.html',
      tsxFile: 'templates/dashboard.tsx',
    },
    {
      id: 'inventory',
      title: 'Devices Inventory + 2-Stage Drawer (Agent-Ready)',
      summary: 'Searchable and filterable device inventory using SFilterTableBlock + OmadaAgentProvider paired with a 420px/1040px expandable SDetailInspectorDrawer.',
      blocks: ['SEmulatorShell', 'SFilterTableBlock', 'SDetailInspectorDrawer'],
      components: ['OmadaAgentProvider', 'SProductImage', 'SDeviceStatus', 'SDescriptions', 'SSelect', 'STag', 'SButton'],
      htmlFile: 'templates/inventory.html',
      tsxFile: 'templates/inventory.tsx',
    },
    {
      id: 'acl-rules',
      title: 'ACL Policy List + Inline Rule Builder',
      summary: 'Tabbed Gateway/Switch/EAP ACL rules table transitioning inline into SInlineRuleEditorLayout + SAclRuleBuilder dual-card builder.',
      blocks: ['SEmulatorShell', 'SFilterTableBlock', 'SInlineRuleEditorLayout', 'SInlineFormRow'],
      components: ['SAclRuleBuilder', 'SExpandableSection', 'SSwitch', 'SInput', 'SSelect', 'SButton'],
      htmlFile: 'templates/acl-rules.html',
      tsxFile: 'templates/acl-rules.tsx',
    },
    {
      id: 'settings',
      title: 'Multi-Tab Network Settings Form (Agent-Ready)',
      summary: 'Settings workspace combining SSettingsPageShell sticky Apply/Cancel bar, OmadaAgentProvider agentId bindings, SSettingsInfoBanner, SIpInput, SSwitch, and SExpandableSection.',
      blocks: ['SEmulatorShell'],
      components: ['OmadaAgentProvider', 'SSettingsPageShell', 'SSettingsSection', 'SSettingsRow', 'SSettingsInfoBanner', 'SExpandableSection', 'SIpInput', 'SSwitch', 'SInput', 'SSelect'],
      htmlFile: 'templates/settings.html',
      tsxFile: 'templates/settings.tsx',
    },
    {
      id: 'analytics-logs',
      title: 'Incident & Event Analytics',
      summary: 'Category KPI Carousel, horizontal Severity Donut summary card, and searchable live event timeline powered by SFilterTableBlock.',
      blocks: ['SEmulatorShell', 'SFilterTableBlock'],
      components: ['SPageHeader', 'SCategoryKpiCarousel', 'SDonutSummaryCard', 'STag'],
      htmlFile: 'templates/analytics-logs.html',
      tsxFile: 'templates/analytics-logs.tsx',
    },
  ];
}

function renderComponentMarkdownBlock(item) {
  const lines = [`### \`${item.name}\` (\`${item.kind}\` · \`${item.subpath}\`)`];
  if (item.description) {
    lines.push(item.description);
  }
  if (item.props && item.props.length > 0) {
    lines.push('');
    lines.push('| Prop | Type | Req | Notes |');
    lines.push('| :--- | :--- | :---: | :--- |');
    for (const p of item.props) {
      const safeType = p.type.replace(/\|/g, '\\|');
      const safeDesc = (p.description ?? '').replace(/\|/g, '\\|');
      lines.push(`| \`${p.name}\` | \`${safeType}\` | ${p.optional ? 'No' : 'Yes'} | ${safeDesc} |`);
    }
  }
  if (item.antdProps && item.antdProps.length > 0) {
    lines.push(`- **Inherited AntD props**: \`${item.antdProps.join('`, `')}\``);
  }
  if (item.commonProps && item.commonProps.length > 0) {
    lines.push(`- **Common React/DOM props**: \`${item.commonProps.join('`, `')}\``);
  }
  if (item.acceptsDomProps) {
    lines.push('- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.');
  }
  return lines.join('\n');
}

function buildCategoryDoc(title, intro, items, extraFooter = '') {
  const lines = [`# ${title}`, '', intro, ''];
  for (const item of items) {
    lines.push(renderComponentMarkdownBlock(item));
    lines.push('');
  }
  if (extraFooter) {
    lines.push(extraFooter.trim());
    lines.push('');
  }
  return `${lines.join('\n').trim()}\n`;
}

function generateLlmsTxt(catalog) {
  const { name, version, cdn } = catalog.package;
  const byCategory = (cat) =>
    catalog.components
      .filter((c) => c.category === cat && c.kind !== 'antd-primitive' && c.kind !== 'data')
      .map((c) => c.name)
      .join(', ');

  return `# ${name}@${version}

> TP-Link Omada Controller v6.3 React 19 + Ant Design 6 UI component kit with Light/Dark design tokens, scoped micro-frontend CSS, bundled Figma assets, deterministic Agent Bridge, and zero-build single-file HTML standalone bundle.

## Subpath Entrypoints
- \`${name}/core\`: Theme (\`OmadaProvider\`, \`useOmadaTheme\`, \`useRovingFocus\`), layout, base \`S*\` inputs/tables/feedback
- \`${name}/blocks\`: \`SEmulatorShell\`, \`SFilterTableBlock\`, \`SInlineRuleEditorLayout\`, \`SInlineFormRow\`, \`SDetailInspectorDrawer\`, \`SMasterDetailSplitBlock\`, \`SWizardModal\`, \`SSwitchPortPicker\`
- \`${name}/charts\`: Modular ECharts (\`SChart\`, \`SLineChart\`, \`SBarChart\`, \`SDonutChart\`, \`SSparkChart\`, \`SDonutSummaryCard\`, \`SHealthGauge\`, \`SHealthRadar\`, \`SHealthTrendBar\`, \`SChannelUtilization\`)
- \`${name}/emulator\`: Controller v6.3 domain widgets (\`STopologyCanvas\`, \`SAclRuleBuilder\`, \`SSettingsPageShell\`, \`STerminalConsole\`, \`SDevicePortGraphic\`, \`SPortPanel\`)
- \`${name}/assets\`: \`SIcon\` (${catalog.counts.icons}), \`SProductImage\` (${catalog.counts.products}), \`SIllustration\` (${catalog.counts.illustrations}), \`SClientIcon\` (${catalog.counts.clients}), \`SBrandAsset\` (${catalog.counts.brand}), \`OmadaLogo\`, \`SDeviceIcon\`
- \`${name}/agent\`: \`OmadaAgentProvider\` (\`exposeWindowBridge\` + WebMCP), \`useOmadaAgent\`, \`useOmadaAgentControl\`, \`useOmadaAgentAction\`, \`registerWebMcpTools\`, \`OMADA_AGENT_TOOLS\`, \`OMADA_SECRET_MASK\`
- \`${name}/style.css\`: Full stylesheet (includes Tailwind v4 preflight)
- \`${name}/style.scoped.css\`: Scoped stylesheet without global reset (pair with \`<OmadaProvider syncDocumentTheme={false}>\`)
- \`${name}/standalone\`: Browser IIFE bundle (\`window.OmadaUI\`)

## External Browser Agent Protocol (\`window.__OMADA_AGENT__\` + WebMCP)
1. **Discover**: Check \`Boolean(window.__OMADA_AGENT__)\` (or browser WebMCP site tools \`snapshot\`, \`query\`, \`act\` on \`document.modelContext\`) before taking screenshots or clicking DOM selectors.
2. **Read**: Call \`window.__OMADA_AGENT__.snapshot()\` for deterministic \`{ controls, actions }\` (secrets masked as \`[REDACTED]\`), or \`window.__OMADA_AGENT__.query({ kind, text, id })\` on large pages.
3. **Operate**: Call \`await window.__OMADA_AGENT__.actAsync({ steps: [{ id, action, value }, ...] })\` (or sync \`act(...)\`) to mutate controls, navigate routes, open drawers/modals, and run domain actions in 1 batch call.

## Pinned Single-File HTML CDN URLs
- CSS: \`${cdn.pinnedCss}\`
- JS: \`${cdn.pinnedStandalone}\`
- Babel: \`${cdn.babelStandalone}\`

## Progressive-Disclosure Skill References (\`skills/omada-ui-kit/\`)
- \`SKILL.md\`: Entrypoint workflow, output mode selection, universal guardrails & verification gate
- \`references/standalone.md\`: Zero-build HTML globals, curated \`antd\`/\`AntdIcons\` subset, and \`dist/assets/\` resolution
- \`references/docs/blocks.md\`: ${byCategory('blocks')}
- \`references/docs/layout.md\`: ${byCategory('theme')}, ${byCategory('layout')}
- \`references/docs/input.md\`: ${byCategory('input')}
- \`references/docs/data-display.md\`: ${byCategory('data-display')}
- \`references/docs/charts.md\`: ${byCategory('charts')}
- \`references/docs/feedback.md\`: ${byCategory('feedback')}
- \`references/docs/emulator-v6.md\`: ${byCategory('emulator-v6')}
- \`references/docs/assets.md\`: ${byCategory('assets')}
- \`references/docs/agent.md\`: ${byCategory('agent')}

## Starter Templates & Verification CLI
- Templates (\`templates/*.{html,tsx}\`): ${catalog.templates.map((t) => `\`${t.id}\``).join(', ')}
- Query CLI: \`node skills/omada-ui-kit/scripts/query-catalog.mjs component <Name>\`
- Verifier CLI: \`node skills/omada-ui-kit/scripts/verify-demo.mjs [--render] <demo.html|Demo.tsx>\`
`;
}

function generateStandaloneMd(catalog) {
  const { name, version, cdn } = catalog.package;
  return `# Single-File HTML Standalone Bundle (\`window.OmadaUI\`)

Use \`dist/standalone.js\` + \`dist/style.css\` for zero-build PRD mockups that open directly via \`file://\` or any static host.

## 1. Pinned Script & Stylesheet Tags

Always pin both \`${name}@${version}\` and \`@babel/standalone@7.28.4\` (never \`@latest\`):

\`\`\`html
<link rel="stylesheet" href="${cdn.pinnedCss}" />
<script src="${cdn.pinnedStandalone}"></script>
<script src="${cdn.babelStandalone}"></script>
\`\`\`

For offline repository demos (such as \`examples/single-file-demo.html\`), reference \`../dist/style.css\` and \`../dist/standalone.js\`.

## 2. \`window.OmadaUI\` Runtime Surface

- **All Omada \`S*\` Components, Blocks, Charts, Assets & Hooks**: Destructure directly from \`window.OmadaUI\` (e.g. \`const { OmadaProvider, OmadaAgentProvider, SEmulatorShell, SFilterTableBlock, SButton } = window.OmadaUI;\`).
- **React 19**: \`OmadaUI.React\` (\`useState\`, \`useMemo\`, \`useEffect\`, \`useRef\`) and \`OmadaUI.ReactDOM\`.
- **Mount Helper**: \`OmadaUI.render(<OmadaProvider><App /></OmadaProvider>, '#root')\` (reuses the React root across re-renders).
- **Agent Bridge Namespace**: \`OmadaUI.agent\` (\`OmadaAgentProvider\`, \`useOmadaAgent\`, \`useOmadaAgentControl\`, \`useOmadaAgentAction\`, \`registerWebMcpTools\`, \`OMADA_AGENT_TOOLS\`, \`OMADA_SECRET_MASK\`).
- **Curated \`OmadaUI.antd\` Compatibility Subset**: \`Alert\`, \`Anchor\`, \`App\`, \`Avatar\`, \`Badge\`, \`Breadcrumb\`, \`Button\`, \`Card\`, \`Cascader\`, \`Checkbox\`, \`Col\`, \`Collapse\`, \`ColorPicker\`, \`ConfigProvider\`, \`DatePicker\`, \`Descriptions\`, \`Divider\`, \`Drawer\`, \`Dropdown\`, \`Empty\`, \`Flex\`, \`Form\`, \`Grid\`, \`Input\`, \`InputNumber\`, \`Layout\`, \`Modal\`, \`Pagination\`, \`Popconfirm\`, \`Popover\`, \`Progress\`, \`Radio\`, \`Rate\`, \`Row\`, \`Segmented\`, \`Select\`, \`Skeleton\`, \`Slider\`, \`Space\`, \`Spin\`, \`Statistic\`, \`Steps\`, \`Switch\`, \`Table\`, \`Tabs\`, \`Tag\`, \`TimePicker\`, \`Tooltip\`, \`Transfer\`, \`TreeSelect\`, \`Typography\`, \`Upload\`, \`message\`, \`notification\`, \`theme\`.
- **Curated \`OmadaUI.AntdIcons\` Subset**: Common outlined/filled icons (\`PlusOutlined\`, \`SearchOutlined\`, \`ReloadOutlined\`, \`SettingOutlined\`, \`DeleteOutlined\`, \`EditOutlined\`, etc.). Prefer \`<SIcon name="..." />\` from the official Figma icon library whenever an Omada icon exists.

## 3. Asset Resolution Architecture (\`__OMADA_ASSET_BASE__\`)

- **100% Inline**: All ${catalog.counts.icons} \`<SIcon>\` SVGs and builtin empty/upload illustrations (\`no-data\`, \`upgrade\`) are embedded directly inside \`standalone.js\`.
- **Externalized Heavy Media (\`dist/assets/\`)**: \`products\`, remaining \`illustrations\`, \`clients\`, and \`brand\` assets resolve relative to \`globalThis.__OMADA_ASSET_BASE__\` (auto-detected from \`<script src=".../standalone.js">\`, falling back to \`https://cdn.jsdelivr.net/npm/${name}@${version}/dist/\` when inlined). Whether loaded from jsDelivr CDN, inlined in an HTML file, or loaded via local \`../dist/standalone.js\` (\`file://\`), \`<SProductImage>\`, \`<SIllustration>\`, \`<SClientIcon>\`, and \`<SBrandAsset>\` automatically load \`assets/<group>/<theme>/<slug>.<ext>\` beside \`standalone.js\`.

## 4. External Browser Agent Discovery (\`window.__OMADA_AGENT__\` & WebMCP)

Wrap standalone demos with \`<OmadaAgentProvider exposeWindowBridge>\` (enabled by default across all starter templates and \`examples/single-file-demo.html\`):

- Exposes \`window.__OMADA_AGENT__\` (\`snapshot()\`, \`query(filter)\`, \`act(...)\`, \`actAsync({ steps })\`, \`canAct(id, action)\`).
- Automatically registers WebMCP site tools (\`snapshot\`, \`query\`, \`act\`) on \`document.modelContext\` / \`navigator.modelContext\` when the host browser supports WebMCP.

\`\`\`js
// External Playwright / DevTools / browser agent fast-path:
if (window.__OMADA_AGENT__) {
  const state = window.__OMADA_AGENT__.snapshot();
  await window.__OMADA_AGENT__.actAsync({
    steps: [
      { id: 'dns.mode', action: 'setValue', value: 'dot' },
      { id: 'dns.saveConfiguration' },
    ],
  });
}
\`\`\`
`;
}

function generateDomainDocs(catalog) {
  const nonAntd = (cats) =>
    catalog.components.filter(
      (c) => cats.includes(c.category) && c.kind !== 'antd-primitive' && c.kind !== 'data',
    );

  const sampleIcons = catalog.assets.icons.slice(0, 20).map((i) => i.name);
  const sampleProducts = catalog.assets.products.slice(0, 20).map((p) => p.name);
  const sampleIllustrations = catalog.assets.illustrations.slice(0, 15).map((i) => i.name);
  const sampleClients = catalog.assets.clients.slice(0, 15).map((c) => c.name);
  const sampleBrand = catalog.assets.brand.map((b) => b.name);

  return {
    'blocks.md': buildCategoryDoc(
      'Omada Reusable Page Blocks (`@chenyqthu/omada-ui-kit/blocks`)',
      'High-level Controller v6.3 shells, filterable tables, inline rule editors, 2-stage inspector drawers, master-detail splits, wizards, and switch port pickers.',
      nonAntd(['blocks']),
      `## Quick-Drawer Handle Clearance\n\`SEmulatorShell\` mounts a fixed \`36px\` \`<||\` quick-drawer handle at top-right. \`SFilterTableBlock\` defaults to \`clearQuickDrawer={true}\` (\`pr-9\`). Custom top wrappers inside \`SEmulatorShell\` should use \`style={{ padding: '20px 44px 24px 24px' }}\`.`,
    ),
    'layout.md': buildCategoryDoc(
      'Theme, Layout, Navigation & Headless Focus (`@chenyqthu/omada-ui-kit/core`)',
      'Application theme provider (global or scoped micro-frontend mode), classic app shell, page headers, steps/breadcrumbs/pagination, and WAI-ARIA roving focus.',
      nonAntd(['theme', 'layout', 'utility']),
      `## Scoped Micro-Frontend Mode\nImport \`@chenyqthu/omada-ui-kit/style.scoped.css\` and render \`<OmadaProvider syncDocumentTheme={false}>\` to scope CSS custom properties and AntD popup portals inside \`.omada-scope\` without mutating \`document.documentElement\`.`,
    ),
    'input.md': buildCategoryDoc(
      'Inputs, Selections, Schedules & Forms (`@chenyqthu/omada-ui-kit/core`)',
      'Omada filled-surface text/IP/MAC/password/search inputs (`forwardRef` enabled), selects, cascaders, tree-selects, switches, sliders, grouped tree transfers, 7x24 schedules, and forms.',
      nonAntd(['input']),
    ),
    'data-display.md': buildCategoryDoc(
      'Data Display, Tables, Tabs & Tiles (`@chenyqthu/omada-ui-kit/core`)',
      'Cards, KPI cards, dense/editable tables, 4-variant `STabs` (`line` / `capsule` / `page` / `filter`), semantic tags, descriptions, collapses, and selectable radio/checkbox tiles.',
      nonAntd(['data-display']),
    ),
    'charts.md': buildCategoryDoc(
      'Charts & Network Health Visualizations (`@chenyqthu/omada-ui-kit/charts`)',
      'Modular ECharts wrappers (`SChart`, `SLineChart`, `SBarChart`, `SDonutChart`, `SSparkChart`) and Omada v6.3 telemetry cards (`SDonutSummaryCard`, `SHealthGauge`, `SHealthRadar`, `SHealthTrendBar`, `SChannelUtilization`).',
      nonAntd(['charts']),
    ),
    'feedback.md': buildCategoryDoc(
      'Feedback, Overlays & Empty States (`@chenyqthu/omada-ui-kit/core`)',
      'Contextual banners, modals (`useOmadaConfirm`), slide-out drawers, toast/notification hooks (`useOmadaFeedback`), tooltips, popovers, loading states, and themed empty states.',
      nonAntd(['feedback']),
    ),
    'emulator-v6.md': buildCategoryDoc(
      'Omada Controller v6.3 Domain Widgets (`@chenyqthu/omada-ui-kit/emulator`)',
      'Topology canvas, ACL source-policy-destination rule builder, multi-tab settings page shell (`clearQuickDrawer`), interactive dark CLI terminal, AP distribution ruler, port graphics, and device/client status widgets.',
      nonAntd(['emulator-v6']),
    ),
    'assets.md': buildCategoryDoc(
      'Bundled Figma Icons, Hardware Photos & Illustrations (`@chenyqthu/omada-ui-kit/assets`)',
      `Verified asset components backed by ${catalog.counts.icons} icons, ${catalog.counts.products} hardware models, ${catalog.counts.illustrations} Light/Dark illustrations, ${catalog.counts.clients} client icons, and ${catalog.counts.brand} brand SVGs. Never guess slugs — search with \`query-catalog.mjs\`.`,
      nonAntd(['assets']),
      `## Asset Counts & Sample Verified Slugs
- **Icons (${catalog.counts.icons})** — Categories: \`${catalog.assets.iconCategories.join('`, `')}\`
  - Sample slugs: \`${sampleIcons.join('`, `')}\`
  - Search: \`node scripts/query-catalog.mjs search-icons <keyword> 25\`
- **Products (${catalog.counts.products})** — Sample slugs: \`${sampleProducts.join('`, `')}\`
  - Search: \`node scripts/query-catalog.mjs search-assets products <keyword> 25\`
- **Illustrations (${catalog.counts.illustrations})** — Sample slugs: \`${sampleIllustrations.join('`, `')}\`
  - Search: \`node scripts/query-catalog.mjs search-assets illustrations <keyword> 25\`
- **Client Icons (${catalog.counts.clients})** — Sample slugs: \`${sampleClients.join('`, `')}\`
  - Search: \`node scripts/query-catalog.mjs search-assets clients <keyword> 25\`
- **Brand Assets (${catalog.counts.brand})** — Slugs: \`${sampleBrand.join('`, `')}\``,
    ),
    'agent.md': buildCategoryDoc(
      'Agent Bridge & WebMCP Runtime (`@chenyqthu/omada-ui-kit/agent`)',
      'Deterministic in-page UI state inspection, multi-step batch action execution (`snapshot()`, `query()`, `act()`, `actAsync()`, `allow`), `window.__OMADA_AGENT__` exposure, and WebMCP (`document.modelContext`) tool registration with automatic `[REDACTED]` secret masking.',
      nonAntd(['agent']),
      `## Built-in \`agentId\` Component Coverage
Pass \`agentId="domain.control"\` inside \`<OmadaAgentProvider>\` to register deterministic controls automatically:
- **Inputs & Selections**: \`SSwitch\`, \`SSelect\`, \`SInput\` (optional \`secret\`), \`SPasswordInput\` (\`secret: true\` default), \`SNumberInput\`, \`SCheckbox\`, \`SCheckboxGroup\` (\`SCheckbox.Group\`), \`SRadio\`, \`SRadioGroup\` (\`SRadio.Group\`), \`SDatePicker\`, \`SRangePicker\`
- **Navigation, Tables & Shells**: \`STabs\`, \`STable\`, \`SFilterTableBlock\`, \`SExpandableSection\`, \`SSettingsPageShell\`
- **Overlays & Wizards**: \`SDrawer\`, \`SDetailInspectorDrawer\`, \`SModal\`, \`SInfoDialog\`, \`SStepModal\`

## External Browser Agent & WebMCP Protocol
Mounting \`<OmadaAgentProvider exposeWindowBridge>\` enables both \`window.__OMADA_AGENT__\` and WebMCP tool registration (\`OMADA_AGENT_TOOLS\`: \`snapshot\`, \`query\`, \`act\` with \`readOnlyHint\` / \`consequentialHint\` / \`untrustedContentHint\`) on \`document.modelContext\` / \`navigator.modelContext\`:

\`\`\`tsx
import {
  OmadaAgentProvider,
  useOmadaAgent,
  useOmadaAgentAction,
} from '@chenyqthu/omada-ui-kit/agent';

// 1. Register page-level domain actions alongside agentId controls:
useOmadaAgentAction({
  id: 'dns.applySecurityPreset',
  label: 'Apply Quad9 DoT Security Preset',
  handler: () => ({ mode: 'dot', primaryDns: '9.9.9.9' }),
});

// 2. External browser agent / WebMCP execution in 1 batch call:
if (window.__OMADA_AGENT__) {
  const snap = window.__OMADA_AGENT__.snapshot(); // { controls, actions } ([REDACTED] secrets)
  await window.__OMADA_AGENT__.actAsync({
    steps: [
      { id: 'dns.mode', action: 'setValue', value: 'dot' },
      { id: 'dns.primaryServer', action: 'setValue', value: '9.9.9.9' },
      { id: 'dns.shell', action: 'apply' },
    ],
  });
}
\`\`\``,
    ),
  };
}

function syncSkillVersionStrings(skillDir, pkgName, pkgVersion) {
  const escapedPkg = pkgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pkgVerRe = new RegExp(`${escapedPkg}@\\d+\\.\\d+\\.\\d+`, 'g');
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (fs.existsSync(skillMdPath)) {
    const updatedSkill = fs
      .readFileSync(skillMdPath, 'utf8')
      .replace(pkgVerRe, `${pkgName}@${pkgVersion}`)
      .replace(/\(`@\d+\.\d+\.\d+` \+/g, `(\`@${pkgVersion}\` +`);
    fs.writeFileSync(skillMdPath, updatedSkill, 'utf8');
  }
  const tplDir = path.join(skillDir, 'templates');
  if (fs.existsSync(tplDir)) {
    for (const entry of fs.readdirSync(tplDir)) {
      if (!entry.endsWith('.html')) continue;
      const tplPath = path.join(tplDir, entry);
      const updatedHtml = fs
        .readFileSync(tplPath, 'utf8')
        .replace(pkgVerRe, `${pkgName}@${pkgVersion}`);
      fs.writeFileSync(tplPath, updatedHtml, 'utf8');
    }
  }
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

  const components = buildComponentCatalog(pkg.name);
  const semanticTokens = readTsConstant(tokensPath, 'omadaSemanticTokens', {});
  const layoutTokens = readTsConstant(tokensPath, 'omadaLayout', {});
  const radiusTokens = readTsConstant(tokensPath, 'omadaRadius', {});
  const portColors = readTsConstant(tokensPath, 'omadaPortColors', {});
  const chartPalette = readTsConstant(tokensPath, 'omadaChartPalette', {});

  const iconCategories = readTsConstant(iconsManifestPath, 'OMADA_ICON_CATEGORIES', []);
  const iconsRaw = readTsConstant(iconsManifestPath, 'OMADA_ICONS', []);
  const illustrationsRaw = readTsConstant(assetsManifestPath, 'OMADA_ILLUSTRATIONS', []);
  const productsRaw = readTsConstant(assetsManifestPath, 'OMADA_PRODUCTS', []);
  const clientsRaw = readTsConstant(assetsManifestPath, 'OMADA_CLIENTS', []);
  const brandRaw = readTsConstant(assetsManifestPath, 'OMADA_BRAND_ASSETS', []);

  const pinnedCss = `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/style.css`;
  const pinnedStandalone = `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/standalone.js`;

  const catalog = {
    schemaVersion: 2,
    package: {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description ?? '',
      entries: {
        import: pkg.name,
        core: `${pkg.name}/core`,
        blocks: `${pkg.name}/blocks`,
        charts: `${pkg.name}/charts`,
        emulator: `${pkg.name}/emulator`,
        assets: `${pkg.name}/assets`,
        agent: `${pkg.name}/agent`,
        styleCss: `${pkg.name}/style.css`,
        styleScopedCss: `${pkg.name}/style.scoped.css`,
        standalone: `${pkg.name}/standalone`,
        catalog: `${pkg.name}/catalog.json`,
        llmsTxt: `${pkg.name}/llms.txt`,
      },
      cdn: {
        jsdelivrCss: pinnedCss,
        jsdelivrStandalone: pinnedStandalone,
        pinnedCss,
        pinnedStandalone,
        babelStandalone: BABEL_CDN_URL,
      },
    },
    counts: {
      components: components.filter((c) => c.kind === 'component').length,
      blocks: components.filter((c) => c.category === 'blocks' && c.kind === 'component').length,
      antdPrimitives: components.filter((c) => c.kind === 'antd-primitive').length,
      hooksAndHelpers: components.filter((c) => c.kind === 'hook' || c.kind === 'helper').length,
      templates: buildTemplatesMetadata().length,
      icons: iconsRaw.length,
      products: dedupeAssetManifest(productsRaw).length,
      illustrations: dedupeAssetManifest(illustrationsRaw).length,
      clients: dedupeAssetManifest(clientsRaw).length,
      brand: dedupeAssetManifest(brandRaw).length,
    },
    components,
    templates: buildTemplatesMetadata(),
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
  const llmsTxtPayload = generateLlmsTxt(catalog);
  const standaloneMdPayload = generateStandaloneMd(catalog);
  const domainDocs = generateDomainDocs(catalog);

  // 1. Write dist artifacts (`dist/catalog.json` + `dist/llms.txt`)
  const distDir = path.join(ROOT_DIR, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'catalog.json'), jsonPayload, 'utf8');
  fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxtPayload, 'utf8');

  // 2. Write canonical skill references (`skills/omada-ui-kit/references/**`)
  const skillRefsDir = path.join(ROOT_DIR, 'skills/omada-ui-kit/references');
  const skillDocsDir = path.join(skillRefsDir, 'docs');
  fs.rmSync(skillDocsDir, { recursive: true, force: true });
  fs.mkdirSync(skillDocsDir, { recursive: true });
  fs.writeFileSync(path.join(skillRefsDir, 'catalog.json'), jsonPayload, 'utf8');
  fs.writeFileSync(path.join(skillRefsDir, 'llms.txt'), llmsTxtPayload, 'utf8');
  fs.writeFileSync(path.join(skillRefsDir, 'standalone.md'), standaloneMdPayload, 'utf8');
  for (const [docName, content] of Object.entries(domainDocs)) {
    fs.writeFileSync(path.join(skillDocsDir, docName), content, 'utf8');
  }

  // 3. Sync version strings & copy canonical skill (`skills/omada-ui-kit`) -> `.agents/skills/omada-ui-kit`
  const canonicalSkillDir = path.join(ROOT_DIR, 'skills/omada-ui-kit');
  syncSkillVersionStrings(canonicalSkillDir, pkg.name, pkg.version);
  const workspaceAgentSkillDir = path.join(ROOT_DIR, '.agents/skills/omada-ui-kit');
  fs.rmSync(workspaceAgentSkillDir, { recursive: true, force: true });
  copyDirRecursive(canonicalSkillDir, workspaceAgentSkillDir);

  console.log(
    `Generated deterministic catalog.json & progressive docs: ${catalog.counts.components} Omada components, ` +
      `${catalog.counts.blocks} blocks, ${catalog.counts.antdPrimitives} AntD primitives, ` +
      `${catalog.counts.icons} icons, ${catalog.counts.products} products, ` +
      `${catalog.counts.illustrations} illustrations, ${catalog.counts.clients} clients, ` +
      `${catalog.counts.brand} brand assets.`,
  );
  console.log(`Synced clean workspace skill bundle to ${workspaceAgentSkillDir}`);
}

main();
