#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../references/catalog.json');

const DEPRECATED_ANTD_PROPS = new Map([
  ['overlayClassName', 'Use AntD 6 `classNames={{ root: "..." }}` instead.'],
  ['dropdownClassName', 'Use AntD 6 `classNames={{ popup: { root: "..." } }}` instead.'],
  ['popupClassName', 'Use AntD 6 `classNames={{ popup: { root: "..." } }}` instead.'],
  ['bodyStyle', 'Use AntD 6 `styles={{ body: { ... } }}` instead.'],
  ['headStyle', 'Use AntD 6 `styles={{ header: { ... } }}` instead.'],
  ['maskStyle', 'Use AntD 6 `styles={{ mask: { ... } }}` instead.'],
  ['destroyOnClose', 'Use AntD 6 `destroyOnHidden` instead.'],
]);

const VISIBLE_DEPRECATED_TAGS = new Set([
  'SModal',
  'SDrawer',
  'SDetailInspectorDrawer',
  'SWizardModal',
  'SStepModal',
  'SInfoDialog',
  'SPopover',
  'SPopconfirm',
  'STooltip',
  'SMask',
  'Modal',
  'Drawer',
  'Popover',
  'Tooltip',
]);

const BORDERED_DEPRECATED_TAGS = new Set([
  'SCard',
  'SInput',
  'SSearchInput',
  'SPasswordInput',
  'SNumberInput',
  'STextArea',
  'SSelect',
  'SCascader',
  'STreeSelect',
  'SDatePicker',
  'SRangePicker',
  'STimePicker',
  'STimeRangePicker',
]);

const EXTRA_DOM_PASSTHROUGH_PROPS = new Set([
  'accept',
  'alt',
  'autoCapitalize',
  'autoComplete',
  'autoCorrect',
  'capture',
  'contentEditable',
  'crossOrigin',
  'decoding',
  'dir',
  'download',
  'draggable',
  'enterKeyHint',
  'form',
  'formAction',
  'height',
  'hidden',
  'inputMode',
  'lang',
  'list',
  'loading',
  'multiple',
  'pattern',
  'poster',
  'preload',
  'spellCheck',
  'src',
  'srcSet',
  'suppressContentEditableWarning',
  'suppressHydrationWarning',
  'translate',
  'width',
]);

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Missing catalog.json at ${CATALOG_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
}

function extractBabelScriptsFromHtml(html) {
  const cleaned = stripHtmlComments(html);
  const blocks = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRe.exec(cleaned)) !== null) {
    const attrs = match[1] ?? '';
    const body = match[2] ?? '';
    if (/type\s*=\s*["']text\/babel["']/i.test(attrs)) {
      const bodyStartOffset = match.index + match[0].indexOf(body);
      const startLineOffset = lineNumberAt(cleaned, bodyStartOffset) - 1;
      blocks.push({ code: body, lineOffset: startLineOffset });
    }
  }
  return blocks;
}

function collectLocalDeclarations(code) {
  const locals = new Set();
  const re = /\b(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9_]*)\b/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    locals.add(m[1]);
  }
  return locals;
}

function parsePaddingRightFromShorthand(rawVal) {
  const trimmed = rawVal.trim().replace(/^['"`]|['"`]$/g, '').trim();
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || parts.length > 4) return null;
  const rightToken = parts.length === 1 ? parts[0] : parts[1];
  const numMatch = /^(\d+(?:\.\d+)?)(px)?$/i.exec(rightToken);
  if (!numMatch) return null;
  return Number(numMatch[1]);
}

function checkInlineStylePaddingConflict(classNameValue, styleText) {
  if (!classNameValue || !styleText) return false;
  if (!/\bpr-(?:9|10|11|12)\b/.test(classNameValue)) return false;
  if (/\bpaddingRight\s*:/.test(styleText)) return false;

  const padMatch = /(?:^|[,{\s])padding\s*:\s*([^,}]+)/.exec(styleText);
  if (!padMatch) return false;

  const rightPx = parsePaddingRightFromShorthand(padMatch[1]);
  return rightPx !== null && rightPx < 36;
}

async function tryLoadTypeScript(forceLexical) {
  if (forceLexical) return null;
  try {
    const mod = await import('typescript');
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

/**
 * Engine 1: TypeScript AST JSX extraction (used automatically whenever `typescript` is resolvable).
 */
function extractJsxElementsWithTsAst(ts, code, lineOffset, fileLabel, errors) {
  const sf = ts.createSourceFile(
    fileLabel,
    code,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );

  if (Array.isArray(sf.parseDiagnostics) && sf.parseDiagnostics.length > 0) {
    const diag = sf.parseDiagnostics[0];
    const line =
      diag.start !== undefined
        ? sf.getLineAndCharacterOfPosition(diag.start).line + 1 + lineOffset
        : 1 + lineOffset;
    const msg = ts.flattenDiagnosticMessageText(diag.messageText, ' ');
    errors.push(`Line ${line}: JSX/TS syntax error — ${msg}`);
  }

  const elements = [];

  function extractOpeningLike(openingNode, hasNonEmptyChildren) {
    const tagName = openingNode.tagName.getText(sf);
    const line =
      sf.getLineAndCharacterOfPosition(openingNode.getStart(sf)).line + 1 + lineOffset;
    let hasSpread = false;
    const attrs = [];

    for (const prop of openingNode.attributes.properties) {
      if (ts.isJsxSpreadAttribute(prop)) {
        hasSpread = true;
        continue;
      }
      if (ts.isJsxAttribute(prop)) {
        const attrName = prop.name.getText(sf);
        const attrLine =
          sf.getLineAndCharacterOfPosition(prop.getStart(sf)).line + 1 + lineOffset;
        let staticString = null;
        let rawValueText = '';
        if (!prop.initializer) {
          staticString = 'true';
          rawValueText = 'true';
        } else if (ts.isStringLiteral(prop.initializer)) {
          staticString = prop.initializer.text;
          rawValueText = prop.initializer.getText(sf);
        } else if (ts.isJsxExpression(prop.initializer) && prop.initializer.expression) {
          const expr = prop.initializer.expression;
          rawValueText = expr.getText(sf);
          if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
            staticString = expr.text;
          }
        }
        attrs.push({
          name: attrName,
          line: attrLine,
          staticString,
          rawValueText,
        });
      }
    }

    elements.push({
      tagName,
      line,
      hasSpread,
      hasNonEmptyChildren,
      attrs,
    });
  }

  function visit(node) {
    if (ts.isJsxSelfClosingElement(node)) {
      extractOpeningLike(node, false);
    } else if (ts.isJsxElement(node)) {
      const hasContent = node.children.some((ch) => {
        if (ts.isJsxText(ch)) {
          return ch.getText(sf).trim().length > 0;
        }
        return true;
      });
      extractOpeningLike(node.openingElement, hasContent);
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return elements;
}

/**
 * Engine 2: Zero-dependency brace/quote-aware lexical JSX scanner (fallback when `typescript` is absent).
 */
function skipBalancedBraces(code, openBraceIdx) {
  let depth = 0;
  let i = openBraceIdx;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      i += 1;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i += 2;
        else i += 1;
      }
      i += 1;
      continue;
    }
    if (ch === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
    i += 1;
  }
  return i;
}

const HTML_VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function extractJsxElementsLexical(code, lineOffset) {
  const elements = [];
  const jsxStack = [];
  let i = 0;

  const markParentHasContent = () => {
    if (jsxStack.length > 0) {
      const top = jsxStack[jsxStack.length - 1];
      if (top.record) {
        top.record.hasNonEmptyChildren = true;
      }
    }
  };

  while (i < code.length) {
    const ch = code[i];
    const inJsxChildren = jsxStack.length > 0;

    if (inJsxChildren) {
      if (ch === '{') {
        const exprStartLine = lineNumberAt(code, i + 1) - 1 + lineOffset;
        const endBrace = skipBalancedBraces(code, i);
        const innerExpr = code.slice(i + 1, endBrace - 1);
        const strippedExpr = innerExpr
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/[^\n]*/g, '')
          .trim();
        if (strippedExpr.length > 0) {
          markParentHasContent();
        }
        if (innerExpr.includes('<')) {
          elements.push(...extractJsxElementsLexical(innerExpr, exprStartLine));
        }
        i = endBrace;
        continue;
      }

      if (ch === '<' && code[i + 1] === '/') {
        i += 2;
        while (i < code.length && /\s/.test(code[i])) i += 1;
        const closeMatch = /^[A-Za-z_$][A-Za-z0-9_$.]*/.exec(code.slice(i));
        const closeName = closeMatch ? closeMatch[0] : '';
        if (closeMatch) i += closeName.length;
        while (i < code.length && code[i] !== '>') i += 1;
        if (code[i] === '>') i += 1;

        if (!closeName) {
          jsxStack.pop();
        } else {
          for (let s = jsxStack.length - 1; s >= 0; s -= 1) {
            if (jsxStack[s].tagName === closeName) {
              jsxStack.length = s;
              break;
            }
          }
        }
        continue;
      }

      if (ch === '<' && code[i + 1] === '>') {
        markParentHasContent();
        jsxStack.push({ tagName: '', record: null });
        i += 2;
        continue;
      }

      if (ch !== '<') {
        if (!/\s/.test(ch)) {
          markParentHasContent();
        }
        i += 1;
        continue;
      }
    } else {
      // JS expression/statement mode: skip comments, strings, and template literal text
      if (ch === '/' && code[i + 1] === '/') {
        while (i < code.length && code[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '/' && code[i + 1] === '*') {
        i += 2;
        while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i += 1;
        i += 2;
        continue;
      }
      if (ch === "'" || ch === '"') {
        const q = ch;
        i += 1;
        while (i < code.length && code[i] !== q) {
          if (code[i] === '\\') i += 2;
          else i += 1;
        }
        i += 1;
        continue;
      }
      if (ch === '`') {
        i += 1;
        while (i < code.length && code[i] !== '`') {
          if (code[i] === '\\') {
            i += 2;
            continue;
          }
          if (code[i] === '$' && code[i + 1] === '{') {
            const exprStartLine = lineNumberAt(code, i + 2) - 1 + lineOffset;
            const endBrace = skipBalancedBraces(code, i + 1);
            const innerExpr = code.slice(i + 2, endBrace - 1);
            if (innerExpr.includes('<')) {
              elements.push(...extractJsxElementsLexical(innerExpr, exprStartLine));
            }
            i = endBrace;
            continue;
          }
          i += 1;
        }
        i += 1;
        continue;
      }
      if (ch === '<' && code[i + 1] === '>') {
        jsxStack.push({ tagName: '', record: null });
        i += 2;
        continue;
      }
    }

    if (ch === '<' && /[A-Za-z]/.test(code[i + 1] ?? '')) {
      if (!inJsxChildren) {
        // Ensure previous non-space char is not an identifier/number (avoid `<` comparison `a < B`)
        let prevIdx = i - 1;
        while (prevIdx >= 0 && /\s/.test(code[prevIdx])) prevIdx -= 1;
        const prevCh = prevIdx >= 0 ? code[prevIdx] : '';
        if (prevCh && /[A-Za-z0-9_$)\]]/.test(prevCh)) {
          const prevWordMatch = /([A-Za-z_$][A-Za-z0-9_$]*)$/.exec(code.slice(0, prevIdx + 1));
          const kw = prevWordMatch ? prevWordMatch[1] : '';
          if (!['return', 'case', 'yield', 'await', 'void', 'else', 'throw', 'typeof'].includes(kw)) {
            i += 1;
            continue;
          }
        }
      }

      const tagStart = i;
      const tagLine = lineNumberAt(code, tagStart) + lineOffset;
      i += 1;
      const nameMatch = /^[A-Za-z_$][A-Za-z0-9_$.]*/.exec(code.slice(i));
      if (!nameMatch) {
        continue;
      }
      const tagName = nameMatch[0];
      i += tagName.length;

      // Skip optional JSX generic type arguments `<SFilterTableBlock<RowType> ...>`
      if (code[i] === '<') {
        let angleDepth = 1;
        i += 1;
        while (i < code.length && angleDepth > 0) {
          if (code[i] === '<') angleDepth += 1;
          else if (code[i] === '>') angleDepth -= 1;
          i += 1;
        }
      }

      let hasSpread = false;
      const attrs = [];
      let selfClosing = false;

      while (i < code.length) {
        while (i < code.length && /\s/.test(code[i])) i += 1;
        if (code[i] === '/' && code[i + 1] === '>') {
          selfClosing = true;
          i += 2;
          break;
        }
        if (code[i] === '>') {
          i += 1;
          break;
        }
        if (code[i] === '{') {
          const endBrace = skipBalancedBraces(code, i);
          if (/^\{\s*\.\.\./.test(code.slice(i, endBrace))) {
            hasSpread = true;
          }
          i = endBrace;
          continue;
        }

        const attrMatch = /^[A-Za-z_:][A-Za-z0-9_.:-]*/.exec(code.slice(i));
        if (!attrMatch) {
          i += 1;
          continue;
        }
        const attrName = attrMatch[0];
        const attrLine = lineNumberAt(code, i) + lineOffset;
        i += attrName.length;
        while (i < code.length && /\s/.test(code[i])) i += 1;

        let staticString = null;
        let rawValueText = '';
        if (code[i] === '=') {
          i += 1;
          while (i < code.length && /\s/.test(code[i])) i += 1;
          if (code[i] === '"' || code[i] === "'") {
            const q = code[i];
            const startStr = i + 1;
            i += 1;
            while (i < code.length && code[i] !== q) {
              if (code[i] === '\\') i += 2;
              else i += 1;
            }
            staticString = code.slice(startStr, i);
            rawValueText = `${q}${staticString}${q}`;
            i += 1;
          } else if (code[i] === '{') {
            const exprStartLine = lineNumberAt(code, i + 1) - 1 + lineOffset;
            const endBrace = skipBalancedBraces(code, i);
            const innerExpr = code.slice(i + 1, endBrace - 1);
            rawValueText = innerExpr.trim();
            const strLit = /^(['"`])([\s\S]*)\1$/.exec(rawValueText);
            if (strLit && (strLit[1] !== '`' || !strLit[2].includes('${'))) {
              staticString = strLit[2];
            } else if (innerExpr.includes('<')) {
              elements.push(...extractJsxElementsLexical(innerExpr, exprStartLine));
            }
            i = endBrace;
          }
        } else {
          staticString = 'true';
          rawValueText = 'true';
        }

        attrs.push({ name: attrName, line: attrLine, staticString, rawValueText });
      }

      markParentHasContent();

      const record = {
        tagName,
        line: tagLine,
        hasSpread,
        hasNonEmptyChildren: false,
        attrs,
      };
      elements.push(record);

      if (!selfClosing && !HTML_VOID_TAGS.has(tagName.toLowerCase())) {
        jsxStack.push({ tagName, record });
      }
      continue;
    }

    i += 1;
  }

  return elements;
}

function validateHtmlDocumentHygiene(htmlContent, errors, expectedVersion = '0.5.0') {
  const cleaned = stripHtmlComments(htmlContent);

  if (!cleaned.includes('<OmadaProvider')) {
    errors.push(
      'Missing <OmadaProvider>: Single-file HTML demos must wrap the root UI with <OmadaProvider>.',
    );
  }

  if (/<script\b[^>]*type\s*=\s*["']module["']/i.test(cleaned) && cleaned.includes('standalone.js')) {
    errors.push(
      'Do not use <script type="module"> with standalone.js; use classic <script> + <script type="text/babel"> so file:// double-click works.',
    );
  }

  if (
    /<script\b[^>]*type\s*=\s*["']text\/babel["']/i.test(cleaned) &&
    !/babel/i.test(cleaned.replace(/type\s*=\s*["']text\/babel["']/gi, ''))
  ) {
    errors.push(
      'Missing @babel/standalone script: <script type="text/babel"> requires loading https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js.',
    );
  }

  const tagAttrRe = /<(?:link|script)\b[^>]*\b(?:href|src)\s*=\s*(["'])([^"']+)\1/gi;
  let match;
  while ((match = tagAttrRe.exec(cleaned)) !== null) {
    const url = match[2];
    const line = lineNumberAt(cleaned, match.index);
    if (!/^(?:https?:)?\/\//i.test(url)) {
      continue; // Local relative paths such as ../dist/standalone.js are permitted
    }
    if (url.includes('@latest')) {
      errors.push(
        `Line ${line}: Unpinned @latest CDN URL "${url}". Lock to exact package version (e.g. @${expectedVersion}).`,
      );
    } else if (
      url.includes('@chenyqthu/omada-ui-kit') &&
      !/@chenyqthu\/omada-ui-kit@\d+\.\d+\.\d+/.test(url)
    ) {
      errors.push(
        `Line ${line}: Unpinned Omada UI Kit CDN URL "${url}". Lock to @chenyqthu/omada-ui-kit@${expectedVersion}.`,
      );
    }
    if (
      url.includes('@babel/standalone') &&
      !/@babel\/standalone@\d+\.\d+\.\d+/.test(url)
    ) {
      errors.push(
        `Line ${line}: Unpinned Babel CDN URL "${url}". Lock to @babel/standalone@7.28.4.`,
      );
    }
  }
}

function verifySingleTarget(targetArg, ctx) {
  const { ts, engineName, assetSets, compMap, knownExports, expectedVersion } = ctx;
  const targetPath = path.resolve(process.cwd(), targetArg);
  if (!fs.existsSync(targetPath)) {
    console.error(`ERROR [${targetArg}] File not found: ${targetPath}`);
    return false;
  }
  if (!fs.statSync(targetPath).isFile()) {
    console.error(`ERROR [${targetArg}] Expected a file, got non-file path: ${targetPath}`);
    return false;
  }

  const content = fs.readFileSync(targetPath, 'utf8');
  const isHtml = targetPath.toLowerCase().endsWith('.html');

  const errors = [];
  const warnings = [];
  let checkedAssetSlugs = 0;
  let checkedJsxTags = 0;
  const seenStaticAgentIds = new Map();

  const codeBlocks = [];
  if (isHtml) {
    validateHtmlDocumentHygiene(content, errors, expectedVersion);
    const extracted = extractBabelScriptsFromHtml(content);
    if (extracted.length === 0) {
      errors.push(
        'Missing <script type="text/babel"> block: Single-file HTML demos must place JSX application code inside <script type="text/babel">.',
      );
    }
    for (const b of extracted) {
      codeBlocks.push(b);
    }
  } else {
    codeBlocks.push({ code: content, lineOffset: 0 });
  }

  for (const block of codeBlocks) {
    const localDecls = collectLocalDeclarations(block.code);
    const elements = ts
      ? extractJsxElementsWithTsAst(ts, block.code, block.lineOffset, targetPath, errors)
      : extractJsxElementsLexical(block.code, block.lineOffset);

    // If TS AST executed, also run lexical quick check only as cross-check? No, TS AST is authoritative;
    // when forceLexical or TS absent, lexical runs with identical element schema!
    for (const el of elements) {
      checkedJsxTags += 1;
      const { tagName, line, hasSpread, hasNonEmptyChildren, attrs } = el;
      const baseTag = tagName.split('.')[0];

      const agentIdAttr = attrs.find((a) => a.name === 'agentId');
      if (agentIdAttr && agentIdAttr.staticString) {
        const prevLine = seenStaticAgentIds.get(agentIdAttr.staticString);
        if (prevLine !== undefined) {
          errors.push(
            `Line ${agentIdAttr.line}: Duplicate static agentId="${agentIdAttr.staticString}" (first declared on line ${prevLine}). Each control must have a unique agentId.`,
          );
        } else {
          seenStaticAgentIds.set(agentIdAttr.staticString, agentIdAttr.line);
        }
      }

      // 1. Unknown <S*> component check
      if (
        /^S[A-Z]/.test(baseTag) &&
        !knownExports.has(baseTag) &&
        !localDecls.has(baseTag)
      ) {
        errors.push(
          `Line ${line}: Unknown Omada component <${tagName}>. Query valid components with "node query-catalog.mjs list-components".`,
        );
        continue;
      }

      const attrMap = new Map(attrs.map((a) => [a.name, a]));

      // 2. Deprecated AntD v4/v5 props
      for (const attr of attrs) {
        if (DEPRECATED_ANTD_PROPS.has(attr.name)) {
          errors.push(
            `Line ${attr.line}: Deprecated AntD prop \`${attr.name}\` on <${tagName}>. ${DEPRECATED_ANTD_PROPS.get(attr.name)}`,
          );
        }
        if (attr.name === 'visible' && VISIBLE_DEPRECATED_TAGS.has(tagName)) {
          errors.push(
            `Line ${attr.line}: Deprecated prop \`visible\` on <${tagName}>. Use AntD 6 \`open\` instead.`,
          );
        }
        if (attr.name === 'bordered' && BORDERED_DEPRECATED_TAGS.has(tagName)) {
          errors.push(
            `Line ${attr.line}: Deprecated prop \`bordered\` on <${tagName}>. Use AntD 6 \`variant="borderless" | "outlined" | "filled"\` instead.`,
          );
        }
      }

      // 3. <SButton type=...> check
      if (tagName === 'SButton' && attrMap.has('type')) {
        const tAttr = attrMap.get('type');
        errors.push(
          `Line ${tAttr.line}: <SButton> does not accept \`type=\`; use \`variant="primary" | "secondary" | "outline" | "danger"\` instead.`,
        );
      }

      // 4. Static asset slug check
      if (Object.prototype.hasOwnProperty.call(assetSets, tagName)) {
        const nameAttr = attrMap.get('name');
        if (nameAttr && nameAttr.staticString !== null) {
          checkedAssetSlugs += 1;
          if (!assetSets[tagName].has(nameAttr.staticString)) {
            errors.push(
              `Line ${nameAttr.line}: Unknown ${tagName} name="${nameAttr.staticString}". Query valid slugs with query-catalog.mjs.`,
            );
          }
        }
      }
      if ((tagName === 'SEmpty' || tagName === 'SInfoDialog') && attrMap.has('illustration')) {
        const illAttr = attrMap.get('illustration');
        if (
          illAttr.staticString !== null &&
          illAttr.staticString !== 'true' &&
          illAttr.staticString !== 'false'
        ) {
          checkedAssetSlugs += 1;
          if (!assetSets.SIllustration.has(illAttr.staticString)) {
            errors.push(
              `Line ${illAttr.line}: Unknown illustration="${illAttr.staticString}" on <${tagName}>.`,
            );
          }
        }
      }

      // 5. Ghost prop check against TypeChecker catalog schema
      const compSchema = compMap.get(tagName);
      if (compSchema) {
        for (const attr of attrs) {
          if (
            attr.name === 'key' ||
            attr.name === 'ref' ||
            attr.name.startsWith('aria-') ||
            attr.name.startsWith('data-') ||
            DEPRECATED_ANTD_PROPS.has(attr.name) ||
            (attr.name === 'type' && tagName === 'SButton') ||
            (attr.name === 'visible' && VISIBLE_DEPRECATED_TAGS.has(tagName)) ||
            (attr.name === 'bordered' && BORDERED_DEPRECATED_TAGS.has(tagName))
          ) {
            continue;
          }

          if (compSchema.validProps.has(attr.name)) {
            continue;
          }

          if (
            compSchema.acceptsDomProps &&
            (/^on[A-Z]/.test(attr.name) || EXTRA_DOM_PASSTHROUGH_PROPS.has(attr.name))
          ) {
            continue;
          }

          errors.push(
            `Line ${attr.line}: Unknown/ghost prop \`${attr.name}\` on <${tagName}>. Run \`node query-catalog.mjs component ${tagName}\` to verify supported props.`,
          );
        }
      }

      // 6. Quick-drawer `pr-9` overridden by inline `style={{ padding: ... }}` shorthand
      const clsAttr = attrMap.get('className');
      const styleAttr = attrMap.get('style');
      if (
        clsAttr?.staticString &&
        styleAttr?.rawValueText &&
        checkInlineStylePaddingConflict(clsAttr.staticString, styleAttr.rawValueText)
      ) {
        errors.push(
          `Line ${styleAttr.line}: \`className="${clsAttr.staticString}"\` is overridden by inline \`style={{ ${styleAttr.rawValueText} }}\` shorthand, causing <SEmulatorShell> \`<||\` overlap! Use \`padding: '20px 44px 24px 24px'\` or separate padding properties.`,
        );
      }

      // 7. Accessible name check on icon-only buttons
      if (
        (tagName === 'SButton' || tagName === 'button') &&
        !hasNonEmptyChildren &&
        !hasSpread &&
        !attrMap.has('children') &&
        !attrMap.has('aria-label') &&
        !attrMap.has('aria-labelledby') &&
        !attrMap.has('title')
      ) {
        errors.push(
          `Line ${line}: Icon-only <${tagName}> is missing an accessible name; add \`aria-label="..."\`.`,
        );
      }
    }
  }

  // 8. Standalone HTML Agent Bridge provider wiring check
  if (
    isHtml &&
    (seenStaticAgentIds.size > 0 || content.includes('useOmadaAgentAction')) &&
    !content.includes('<OmadaAgentProvider')
  ) {
    errors.push(
      'Standalone HTML declares `agentId` or `useOmadaAgentAction` without `<OmadaAgentProvider>`; wrap the app in `<OmadaAgentProvider exposeWindowBridge>`.',
    );
  }

  // 9. Advisory warning if SEmulatorShell is used without any quick-drawer right padding hint
  if (
    content.includes('<SEmulatorShell') &&
    !content.includes('showQuickDrawerHandle={false}') &&
    !content.includes('pr-9') &&
    !content.includes('pr-10') &&
    !content.includes('pr-11') &&
    !content.includes('SFilterTableBlock') &&
    !content.includes('SInlineRuleEditorLayout') &&
    !content.includes('SSettingsPageShell') &&
    !content.includes('44px') &&
    !content.includes('36')
  ) {
    warnings.push(
      'SEmulatorShell renders a right-edge `<||` quick-drawer handle by default; add `padding: "20px 44px 24px 24px"` or `pr-9` on top-right controls.',
    );
  }

  for (const w of warnings) {
    console.warn(`WARN [${targetArg}]: ${w}`);
  }

  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`ERROR [${targetArg}] ${err}`);
    }
    return false;
  }

  console.log(
    `PASS [${targetArg}] (${engineName}): verified ${checkedJsxTags} JSX element(s), ${checkedAssetSlugs} static asset slug(s), 0 violations.`,
  );
  return true;
}

const USAGE_TEXT =
  'Usage: node verify-demo.mjs [--engine=ts-ast|lexical] [--render] [--strict-contrast] <path-to-demo.html|tsx> [...]';

const MIME_BY_EXT = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveDistDir() {
  const candidates = [
    path.resolve(__dirname, '../../../dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'node_modules/@chenyqthu/omada-ui-kit/dist'),
    path.resolve(__dirname, '../../../../../@chenyqthu/omada-ui-kit/dist'),
  ];
  for (const dir of candidates) {
    if (
      fs.existsSync(path.join(dir, 'standalone.js')) &&
      fs.existsSync(path.join(dir, 'style.css'))
    ) {
      return dir;
    }
  }
  return null;
}

function resolveChromeExecutable() {
  const envPath =
    process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

function buildRenderableHtmlForTarget(targetPath, rawContent, ts) {
  const isHtml = targetPath.toLowerCase().endsWith('.html');
  if (isHtml) {
    let rewritten = rawContent
      // Route CDN or relative ../dist/* URLs to local ephemeral /__omada_dist__/*
      .replace(
        /(?:https?:)?\/\/cdn\.jsdelivr\.net\/npm\/@chenyqthu\/omada-ui-kit@[^/"']+\/dist\//g,
        '/__omada_dist__/',
      )
      .replace(/(["'])\.\.\/dist\//g, '$1/__omada_dist__/');

    if (ts) {
      // Remove external @babel/standalone script and pre-transpile <script type="text/babel"> locally
      rewritten = rewritten.replace(
        /<script\b[^>]*src\s*=\s*["'][^"']*@babel\/standalone[^"']*["'][^>]*>\s*<\/script>/gi,
        '',
      );
      rewritten = rewritten.replace(
        /<script\b([^>]*\btype\s*=\s*["']text\/babel["'][^>]*)>([\s\S]*?)<\/script>/gi,
        (_full, _attrs, code) => {
          const transpiled = ts.transpileModule(code, {
            fileName: path.basename(targetPath) + '.tsx',
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              module: ts.ModuleKind.None,
              jsx: ts.JsxEmit.React,
              jsxFactory: 'OmadaUI.React.createElement',
              jsxFragmentFactory: 'OmadaUI.React.Fragment',
            },
          });
          const safeJs = transpiled.outputText.replace(/<\/script>/gi, '<\\/script>');
          return `<script>\n${safeJs}\n</script>`;
        },
      );
    }
    return rewritten;
  }

  if (!ts) {
    throw new Error(
      'Rendering .tsx files with --render requires the "typescript" package to be installed.',
    );
  }

  const transpiled = ts.transpileModule(rawContent, {
    fileName: path.basename(targetPath),
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  });

  const safeCjs = transpiled.outputText.replace(/<\/script>/gi, '<\\/script>');
  const alreadyHasProvider = rawContent.includes('<OmadaProvider');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Omada Render Check — ${path.basename(targetPath)}</title>
    <link rel="stylesheet" href="/__omada_dist__/style.css" />
    <script src="/__omada_dist__/standalone.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script>
      (function () {
        const React = window.OmadaUI.React;
        const lucideFallback = new Proxy({}, {
          get: (_target, prop) => {
            if (prop === '__esModule') return true;
            return function LucideStub(props) {
              const sz = (props && props.size) || 16;
              return React.createElement('svg', {
                width: sz,
                height: sz,
                viewBox: '0 0 16 16',
                'aria-hidden': 'true',
                className: props && props.className,
                style: props && props.style,
              });
            };
          }
        });
        function requireShim(spec) {
          if (spec === 'react') return window.OmadaUI.React;
          if (spec === 'react-dom' || spec === 'react-dom/client') return window.OmadaUI.ReactDOM;
          if (spec.endsWith('.css')) return {};
          if (spec === 'antd' || spec.startsWith('antd/')) return window.OmadaUI.antd;
          if (spec === '@ant-design/icons') return window.OmadaUI.AntdIcons;
          if (spec === 'lucide-react') return lucideFallback;
          if (
            spec === '@chenyqthu/omada-ui-kit' ||
            spec.startsWith('@chenyqthu/omada-ui-kit/') ||
            spec === '@/omada' ||
            spec.startsWith('@/omada/')
          ) {
            return window.OmadaUI;
          }
          throw new Error('Unsupported import in standalone --render harness: ' + spec);
        }
        const module = { exports: {} };
        const exports = module.exports;
        (function (require, module, exports, React) {
${safeCjs}
        })(requireShim, module, exports, React);

        const modExports = module.exports || {};
        let TargetComp = modExports.default;
        if (typeof TargetComp !== 'function') {
          for (const key of Object.keys(modExports)) {
            if (/^[A-Z]/.test(key) && typeof modExports[key] === 'function') {
              TargetComp = modExports[key];
              break;
            }
          }
        }
        if (typeof TargetComp !== 'function') {
          throw new Error('No exported React component found in ${path.basename(targetPath)}');
        }
        const node = React.createElement(TargetComp);
        const tree = ${alreadyHasProvider ? 'node' : "React.createElement(window.OmadaUI.OmadaProvider, { defaultThemeMode: 'light' }, node)"};
        window.OmadaUI.render(tree, '#root');
      })();
    </script>
  </body>
</html>`;
}

async function runRenderAndAxeVerification(targets, options) {
  const { ts, strictContrast } = options;
  const distDir = resolveDistDir();
  if (!distDir) {
    console.error(
      'ERROR [--render] Missing built dist/standalone.js + dist/style.css. Run "pnpm build:lib" before running --render.',
    );
    return false;
  }

  let playwrightMod;
  let axeMod;
  try {
    playwrightMod = await import('playwright-core');
    axeMod = await import('axe-core');
  } catch (err) {
    console.error(
      `ERROR [--render] Optional devDependencies "playwright-core" and "axe-core" are required for --render (${err instanceof Error ? err.message : String(err)}).`,
    );
    return false;
  }

  const http = await import('node:http');
  const axeSource = axeMod.default?.source ?? axeMod.source;
  const pageHtmlById = new Map();

  const server = http.createServer((req, res) => {
    const reqUrl = (req.url || '/').split('?')[0];
    if (reqUrl.startsWith('/__render__/')) {
      const id = reqUrl.slice('/__render__/'.length);
      const html = pageHtmlById.get(id);
      if (!html) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (reqUrl.startsWith('/__omada_dist__/')) {
      const rel = decodeURIComponent(reqUrl.slice('/__omada_dist__/'.length));
      const fullPath = path.resolve(distDir, rel);
      if (!fullPath.startsWith(distDir) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        res.writeHead(404);
        res.end('Asset not found');
        return;
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_BY_EXT[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(fullPath).pipe(res);
      return;
    }

    if (reqUrl === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  const executablePath = resolveChromeExecutable();
  let browser;
  let allPassed = true;

  try {
    browser = await playwrightMod.chromium.launch({
      ...(executablePath ? { executablePath } : {}),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    for (let idx = 0; idx < targets.length; idx += 1) {
      const targetArg = targets[idx];
      const targetPath = path.resolve(process.cwd(), targetArg);
      const rawContent = fs.readFileSync(targetPath, 'utf8');
      const pageErrors = [];

      let htmlPayload;
      try {
        htmlPayload = buildRenderableHtmlForTarget(targetPath, rawContent, ts);
      } catch (err) {
        console.error(
          `ERROR [${targetArg}] (--render) ${err instanceof Error ? err.message : String(err)}`,
        );
        allPassed = false;
        continue;
      }

      const routeId = String(idx);
      pageHtmlById.set(routeId, htmlPayload);

      const page = await context.newPage();
      page.on('pageerror', (err) => {
        pageErrors.push(`Uncaught pageerror: ${err.message}`);
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(`console.error: ${msg.text()}`);
        }
      });
      page.on('requestfailed', (req) => {
        pageErrors.push(
          `Failed asset/script request ${req.url()}: ${req.failure()?.errorText || 'failed'}`,
        );
      });

      try {
        await page.goto(`${baseUrl}/__render__/${routeId}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await page.waitForTimeout(120);

        const expectsWindowBridge = /exposeWindowBridge\b/.test(rawContent);
        const declaresAgentTargets =
          /\bagentId\s*=/.test(rawContent) ||
          /\buseOmadaAgentAction\s*\(/.test(rawContent) ||
          /\buseOmadaAgentControl\s*\(/.test(rawContent);

        const domChecks = await page.evaluate(
          ({ expectBridge, expectTargets }) => {
            const issues = [];
            const root = document.getElementById('root');
            if (!root || root.children.length === 0) {
              issues.push('Mounted #root container is empty after rendering.');
            } else {
              const rootRect = root.getBoundingClientRect();
              if (rootRect.height <= 0 || rootRect.width <= 0) {
                issues.push(
                  `Mounted #root has zero dimensions (${rootRect.width}x${rootRect.height}).`,
                );
              }
            }

            const imgs = Array.from(document.querySelectorAll('img'));
            for (const img of imgs) {
              const src = img.getAttribute('src') || '';
              if (!src) continue;
              if (!img.complete || img.naturalWidth === 0) {
                issues.push(`Broken <img> asset failed to decode: "${src}"`);
              }
            }

            const handle = document.querySelector('[data-testid="quick-drawer-handle"]');
            if (handle) {
              const hr = handle.getBoundingClientRect();
              if (hr.width > 0 && hr.height > 0) {
                const interactive = Array.from(
                  document.querySelectorAll(
                    'main button, main a, main input, main [role="tab"], main [role="combobox"]',
                  ),
                );
                for (const el of interactive) {
                  if (el === handle || handle.contains(el)) continue;
                  const style = window.getComputedStyle(el);
                  if (
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    style.opacity === '0'
                  ) {
                    continue;
                  }
                  const r = el.getBoundingClientRect();
                  if (r.width <= 0 || r.height <= 0) continue;
                  const overlapX = Math.min(hr.right, r.right) - Math.max(hr.left, r.left);
                  const overlapY = Math.min(hr.bottom, r.bottom) - Math.max(hr.top, r.top);
                  if (overlapX > 2 && overlapY > 2) {
                    const label =
                      el.getAttribute('aria-label') ||
                      (el.textContent || '').trim().slice(0, 40) ||
                      el.tagName.toLowerCase();
                    issues.push(
                      `Interactive control "${label}" physically overlaps <SEmulatorShell> <|| quick-drawer handle (${Math.round(overlapX)}x${Math.round(overlapY)}px). Add >=36px/44px right clearance.`,
                    );
                  }
                }
              }
            }

            const bridge = window.__OMADA_AGENT__;
            let agentSummary = '';
            if (expectBridge && !bridge) {
              issues.push(
                'Source sets `exposeWindowBridge`, but `window.__OMADA_AGENT__` was not mounted.',
              );
            }
            if (bridge) {
              try {
                const snap = bridge.snapshot();
                const queried = bridge.query();
                if (!snap || !Array.isArray(snap.controls) || !Array.isArray(snap.actions)) {
                  issues.push(
                    '`window.__OMADA_AGENT__.snapshot()` returned an invalid structure.',
                  );
                } else {
                  if (!Array.isArray(queried) || queried.length !== snap.controls.length) {
                    issues.push(
                      '`window.__OMADA_AGENT__.query()` count did not match `snapshot().controls`.',
                    );
                  }
                  if (
                    expectTargets &&
                    snap.controls.length === 0 &&
                    snap.actions.length === 0
                  ) {
                    issues.push(
                      'Source declares `agentId` / `useOmadaAgentAction`, but 0 controls/actions registered with `<OmadaAgentProvider>` (check provider tree placement).',
                    );
                  }
                  for (const ctrl of snap.controls) {
                    if (ctrl.secret && ctrl.value !== '[REDACTED]') {
                      issues.push(
                        `Secret control "${ctrl.id}" leaked non-redacted value in snapshot().`,
                      );
                    }
                    if (!ctrl.disabled && (!Array.isArray(ctrl.actions) || ctrl.actions.length === 0)) {
                      issues.push(
                        `Enabled control "${ctrl.id}" registered with 0 callable actions.`,
                      );
                    }
                  }
                  agentSummary = `Agent Bridge verified (${snap.controls.length} controls, ${snap.actions.length} actions)`;
                }
              } catch (err) {
                issues.push(
                  `Agent Bridge self-check threw an error: ${err instanceof Error ? err.message : String(err)}`,
                );
              }
            }

            return { issues, agentSummary };
          },
          { expectBridge: expectsWindowBridge, expectTargets: declaresAgentTargets },
        );

        pageErrors.push(...domChecks.issues);

        await page.addScriptTag({ content: axeSource });
        const axeResults = await page.evaluate(async (enableContrast) => {
          return await window.axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
            },
            rules: {
              'color-contrast': { enabled: Boolean(enableContrast) },
            },
          });
        }, strictContrast);

        for (const v of axeResults.violations || []) {
          const firstTarget = v.nodes?.[0]?.target?.join(' ') || 'document';
          pageErrors.push(
            `axe [${v.id}] (${v.impact || 'moderate'}): ${v.help} at "${firstTarget}"`,
          );
        }

        if (pageErrors.length > 0) {
          for (const err of pageErrors) {
            console.error(`ERROR [${targetArg}] (--render) ${err}`);
          }
          allPassed = false;
        } else {
          console.log(
            `PASS [${targetArg}] (--render @1440x900 + axe WCAG 2.1 A/AA${strictContrast ? ' + color-contrast' : ', contrast opt-in'}): 0 runtime errors, 0 broken images, 0 overlaps, 0 axe violations${domChecks.agentSummary ? `, ${domChecks.agentSummary}` : ''}.`,
          );
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve) => server.close(resolve));
  }

  return allPassed;
}

function wildcardSegmentToRegExp(segment) {
  const escaped = segment
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]');
  return new RegExp(`^${escaped}$`);
}

function expandWildcardPattern(rawPattern, cwd) {
  const isAbs = path.isAbsolute(rawPattern);
  const parsedRoot = isAbs ? path.parse(rawPattern).root : '';
  const remainder = isAbs ? rawPattern.slice(parsedRoot.length) : rawPattern;
  const segments = remainder
    .replace(/\\/g, '/')
    .split('/')
    .filter((s) => s.length > 0 && s !== '.');
  const startDir = isAbs ? parsedRoot : cwd;
  const matchedFiles = new Set();

  function walk(currDir, idx) {
    if (!fs.existsSync(currDir)) return;
    if (idx >= segments.length) {
      try {
        if (fs.statSync(currDir).isFile()) {
          matchedFiles.add(isAbs ? currDir : path.relative(cwd, currDir));
        }
      } catch {
        // Ignore unreadable entries
      }
      return;
    }

    const seg = segments[idx];
    if (seg === '**') {
      walk(currDir, idx + 1);
      let entries = [];
      try {
        entries = fs.readdirSync(currDir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.isDirectory()) {
          walk(path.join(currDir, entry.name), idx);
        }
      }
      return;
    }

    if (/[*?]/.test(seg)) {
      let entries = [];
      try {
        entries = fs.readdirSync(currDir, { withFileTypes: true });
      } catch {
        return;
      }
      const re = wildcardSegmentToRegExp(seg);
      for (const entry of entries) {
        if (re.test(entry.name)) {
          walk(path.join(currDir, entry.name), idx + 1);
        }
      }
      return;
    }

    walk(path.join(currDir, seg), idx + 1);
  }

  walk(startDir, 0);
  return Array.from(matchedFiles).sort();
}

function parseCliArgs(argv) {
  let forceLexical = false;
  let renderMode = false;
  let strictContrast = false;
  let showHelp = false;
  const positional = [];
  let afterDoubleDash = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (afterDoubleDash) {
      positional.push(arg);
      continue;
    }
    if (arg === '--') {
      afterDoubleDash = true;
      continue;
    }
    if (arg === '-h' || arg === '--help') {
      showHelp = true;
      continue;
    }
    if (arg === '--render') {
      renderMode = true;
      continue;
    }
    if (arg === '--strict-contrast') {
      strictContrast = true;
      continue;
    }
    if (arg === '--engine=lexical') {
      forceLexical = true;
      continue;
    }
    if (arg === '--engine=ts-ast') {
      forceLexical = false;
      continue;
    }
    if (arg === '--engine') {
      const next = argv[i + 1];
      if (next === 'lexical' || next === 'ts-ast') {
        forceLexical = next === 'lexical';
        i += 1;
        continue;
      }
      console.error(`ERROR: Invalid --engine value "${next ?? ''}". Expected "ts-ast" or "lexical".\n${USAGE_TEXT}`);
      process.exit(1);
    }
    if (arg.startsWith('-')) {
      console.error(`ERROR: Unknown CLI option "${arg}".\n${USAGE_TEXT}`);
      process.exit(1);
    }
    positional.push(arg);
  }

  return { forceLexical, renderMode, strictContrast, showHelp, positional };
}

async function main() {
  const { forceLexical, renderMode, strictContrast, showHelp, positional } = parseCliArgs(
    process.argv.slice(2),
  );

  if (showHelp && positional.length === 0) {
    console.log(USAGE_TEXT);
    return;
  }

  if (positional.length === 0) {
    console.error(USAGE_TEXT);
    process.exit(1);
  }

  const catalog = loadCatalog();
  const ts = await tryLoadTypeScript(forceLexical);
  const engineName = ts ? 'ts-ast' : 'lexical';

  const assetSets = {
    SIcon: new Set((catalog.assets?.icons ?? []).map((i) => i.name)),
    SProductImage: new Set((catalog.assets?.products ?? []).map((p) => p.name)),
    SIllustration: new Set((catalog.assets?.illustrations ?? []).map((i) => i.name)),
    SClientIcon: new Set((catalog.assets?.clients ?? []).map((c) => c.name)),
    SBrandAsset: new Set((catalog.assets?.brand ?? []).map((b) => b.name)),
  };

  const compMap = new Map();
  const knownExports = new Set();
  for (const item of catalog.components ?? []) {
    knownExports.add(item.name);
    if (item.kind === 'component') {
      const validProps = new Set([
        ...(item.props ?? []).map((p) => p.name),
        ...(item.antdProps ?? []),
        ...(item.commonProps ?? []),
      ]);
      compMap.set(item.name, {
        ...item,
        validProps,
      });
    }
  }

  const expectedVersion = catalog.package?.version || '0.5.0';
  const ctx = { ts, engineName, assetSets, compMap, knownExports, expectedVersion };
  let hasFailure = false;
  const staticallyPassedTargets = [];

  for (const targetArg of positional) {
    const literalPath = path.resolve(process.cwd(), targetArg);
    if (!fs.existsSync(literalPath) && /[*?]/.test(targetArg)) {
      const expanded = expandWildcardPattern(targetArg, process.cwd());
      if (expanded.length === 0) {
        console.error(`ERROR [${targetArg}] No files matched pattern: ${targetArg}`);
        hasFailure = true;
        continue;
      }
      for (const matchedTarget of expanded) {
        if (!verifySingleTarget(matchedTarget, ctx)) {
          hasFailure = true;
        } else {
          staticallyPassedTargets.push(matchedTarget);
        }
      }
      continue;
    }
    if (!verifySingleTarget(targetArg, ctx)) {
      hasFailure = true;
    } else {
      staticallyPassedTargets.push(targetArg);
    }
  }

  if (renderMode && staticallyPassedTargets.length > 0) {
    const tsForRender = ts ?? (await tryLoadTypeScript(false));
    const renderOk = await runRenderAndAxeVerification(staticallyPassedTargets, {
      ts: tsForRender,
      strictContrast,
    });
    if (!renderOk) {
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}

main();
