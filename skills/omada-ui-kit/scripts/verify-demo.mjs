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

  // 8. Advisory warning if SEmulatorShell is used without any quick-drawer right padding hint
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

const USAGE_TEXT = 'Usage: node verify-demo.mjs [--engine=ts-ast|lexical] <path-to-demo.html|tsx> [...]';

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

  return { forceLexical, showHelp, positional };
}

async function main() {
  const { forceLexical, showHelp, positional } = parseCliArgs(process.argv.slice(2));

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
        }
      }
      continue;
    }
    if (!verifySingleTarget(targetArg, ctx)) {
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exit(1);
  }
}

main();
