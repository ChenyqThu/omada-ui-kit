#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const MANIFEST_DIR = path.join(ROOT, 'src', 'omada', 'assets');

const CATEGORY_EXACT_MAP = new Map([
  ['Button icon 按钮图标', 'button'],
  ['Table icon 表格图标', 'table'],
  ['Sidebar icon导航栏图标', 'sidebar'],
  ['app category icon  app分类图标', 'app-category'],
  ['Event icon 侦测功能图标', 'event'],
  ['map icon 地图图标', 'map'],
  ['status icon 状态图标', 'status'],
  ['topo icon 拓扑图标', 'topo'],
  ['qiuck action icon', 'quick-action'],
  ['scence icon场景分类图标', 'scene'],
  ['Dashboard图标', 'dashboard'],
  ['System&Organization 图标', 'system'],
  ['顶部栏 图标', 'topbar'],
  ['交互自定义', 'custom'],
  ['通用', 'general'],
  ['其他', 'other'],
]);

const ZH_TERM_MAP = new Map([
  ['网桥', 'bridge'],
  ['链路测速', 'speed-test'],
  ['线缆测试', 'cable-test'],
  ['help中心', 'help-center'],
  ['帮助中心', 'help-center'],
  ['通信设备', 'telecom'],
  ['外部设备', 'external-device'],
  ['网络设备', 'network-device'],
  ['可穿戴设备', 'wearable'],
  ['按钮图标', 'button-icon'],
  ['表格图标', 'table-icon'],
  ['导航栏图标', 'sidebar-icon'],
  ['顶部栏', 'topbar'],
  ['通用', 'general'],
  ['其他', 'other'],
  ['分类图标', 'category'],
  ['侦测功能图标', 'event'],
  ['地图图标', 'map'],
  ['拓扑图标', 'topo'],
  ['状态图标', 'status'],
  ['场景分类图标', 'scene'],
  ['交互自定义', 'custom'],
  ['图标', ''],
  ['安装失败', 'install-failed'],
  ['没有查看权限', 'no-permission'],
  ['添加硬件失败', 'add-hardware-failed'],
  ['地图不可用', 'map-unavailable'],
  ['认证所用账号已超出限流值', 'auth-account-rate-limit'],
  ['认证所用code已超出限流值', 'auth-code-rate-limit'],
  ['重置密码成功', 'reset-password-success'],
  ['申请提交', 'request-submitted'],
  ['需要认证2FA', 'require-2fa'],
  ['关闭2FA', 'disable-2fa'],
  ['重置密码链接超时', 'reset-password-expired'],
  ['页面不存在', 'page-not-found'],
  ['过期', 'expired'],
  ['设备供电不足', 'insufficient-poe-power'],
  ['文件下载失败', 'file-download-failed'],
  ['文件下载成功', 'file-download-success'],
  ['安装controller', 'install-controller'],
  ['设备固件升级', 'firmware-upgrade'],
  ['批量重新下发', 'batch-reprovision'],
  ['解除绑定', 'unbind'],
  ['加载', 'loading'],
  ['添加', 'add'],
  ['导入', 'import'],
  ['导出', 'export'],
  ['购买', 'shop'],
  ['返回', 'back'],
  ['占位图标', 'placeholder'],
  ['堆叠', 'stack'],
  ['办公电脑', 'office-pc'],
  ['一体机', 'all-in-one'],
  ['无天线', 'no-antenna'],
  ['多设备', 'multi-device'],
  ['多ap', 'multi-ap'],
  ['多bridge', 'multi-bridge'],
  ['多switch设备', 'multi-switch'],
  ['登录页卡片', 'login-card'],
  ['侧边栏', 'sidebar'],
]);

function parseArgs(argv) {
  const inputs = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--inputs') {
      for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) {
        inputs.push(argv[j]);
      }
    }
  }
  if (inputs.length === 0) {
    console.error('Usage: node scripts/unpack-figma-assets.mjs --inputs <file1> <file2> ...');
    process.exit(1);
  }
  return inputs;
}

function parseJsonPayload(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error(`Unable to parse JSON payload from ${filePath}`);
  }
}

function slugifyName(rawName, fallbackPrefix, nodeId) {
  let cleaned = String(rawName ?? '')
    .replace(/^(类型|Property\s*\d*|mode|状态|样式)\s*=\s*/gi, '')
    .replace(/^(icon|Image|Omada logo)\//i, '')
    .replace(/\s+(dark|light)$/i, '')
    .trim();

  for (const [zh, en] of ZH_TERM_MAP.entries()) {
    if (cleaned.includes(zh)) {
      cleaned = cleaned.split(zh).join(en ? ` ${en} ` : ' ');
    }
  }

  const ascii = cleaned
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  if (ascii.length >= 2) {
    return ascii;
  }
  const safeId = String(nodeId ?? 'item').replace(/[^a-zA-Z0-9]+/g, '-');
  return `${fallbackPrefix}-${safeId}`;
}

function parseColorRgb(colorStr) {
  if (!colorStr) return null;
  const s = colorStr.trim().toLowerCase();
  if (
    s === 'none' ||
    s === 'transparent' ||
    s === 'currentcolor' ||
    s === 'inherit' ||
    s.startsWith('url(')
  ) {
    return { skip: true };
  }
  if (s === 'black') return { r: 0, g: 0, b: 0 };
  if (s === 'white') return { r: 255, g: 255, b: 255 };
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return {
      r: parseInt(s[1] + s[1], 16),
      g: parseInt(s[2] + s[2], 16),
      b: parseInt(s[3] + s[3], 16),
    };
  }
  if (/^#[0-9a-f]{6}$/.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  if (/^#[0-9a-f]{8}$/.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
    };
  }
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  return null;
}

function normalizeIconSvg(svgRaw, width, height) {
  let svg = svgRaw.trim();

  // Ensure viewBox exists and strip root width/height so SIcon controls sizing cleanly
  const openTagMatch = svg.match(/<svg\b([^>]*)>/i);
  if (openTagMatch) {
    let attrs = openTagMatch[1];
    const hasViewBox = /\bviewBox\s*=/i.test(attrs);
    const wMatch = attrs.match(/\bwidth\s*=\s*["']([^"']+)["']/i);
    const hMatch = attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i);
    const vbW = Math.round(Number(wMatch?.[1]) || width || 20);
    const vbH = Math.round(Number(hMatch?.[1]) || height || 20);
    attrs = attrs
      .replace(/\s*\bwidth\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s*\bheight\s*=\s*["'][^"']*["']/gi, '');
    if (!hasViewBox) {
      attrs += ` viewBox="0 0 ${vbW} ${vbH}"`;
    }
    svg = svg.replace(/<svg\b[^>]*>/i, `<svg${attrs}>`);
  }

  // Detect whether SVG has chromatic colors (outside white and neutral greys)
  const colorMatches = [];
  const attrRegex = /\b(fill|stroke)\s*=\s*["']([^"']+)["']/gi;
  for (const m of svg.matchAll(attrRegex)) {
    colorMatches.push(m[2]);
  }
  const styleRegex = /\b(fill|stroke)\s*:\s*([^;"']+)/gi;
  for (const m of svg.matchAll(styleRegex)) {
    colorMatches.push(m[2]);
  }

  let hasChromatic = false;
  let hasNeutralDark = false;
  for (const rawColor of colorMatches) {
    const rgb = parseColorRgb(rawColor);
    if (!rgb || rgb.skip) continue;
    const isNearWhite = rgb.r >= 245 && rgb.g >= 245 && rgb.b >= 245;
    if (isNearWhite) continue;
    const chroma = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
    if (chroma > 18) {
      hasChromatic = true;
      break;
    }
    hasNeutralDark = true;
  }

  const monochrome = !hasChromatic && (hasNeutralDark || colorMatches.length === 0);
  if (monochrome) {
    svg = svg.replace(/\b(fill|stroke)\s*=\s*["']([^"']+)["']/gi, (full, prop, val) => {
      const rgb = parseColorRgb(val);
      if (!rgb || rgb.skip) return full;
      if (rgb.r >= 245 && rgb.g >= 245 && rgb.b >= 245) return full;
      return `${prop}="currentColor"`;
    });
    svg = svg.replace(/\b(fill|stroke)\s*:\s*([^;"']+)/gi, (full, prop, val) => {
      const rgb = parseColorRgb(val);
      if (!rgb || rgb.skip) return full;
      if (rgb.r >= 245 && rgb.g >= 245 && rgb.b >= 245) return full;
      return `${prop}:currentColor`;
    });
  }

  return { svg, monochrome };
}

function ensureUniqueName(usedMap, scopeKey, baseSlug) {
  const existing = usedMap.get(scopeKey);
  if (!existing) {
    usedMap.set(scopeKey, new Set([baseSlug]));
    return baseSlug;
  }
  if (!existing.has(baseSlug)) {
    existing.add(baseSlug);
    return baseSlug;
  }
  let idx = 2;
  while (existing.has(`${baseSlug}-${idx}`)) {
    idx++;
  }
  const unique = `${baseSlug}-${idx}`;
  existing.add(unique);
  return unique;
}

function writeAssetFile(absPath, format, data) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  if (format === 'png') {
    fs.writeFileSync(absPath, Buffer.from(data, 'base64'));
  } else {
    fs.writeFileSync(absPath, data, 'utf8');
  }
}

function main() {
  const inputFiles = parseArgs(process.argv.slice(2));
  const payloads = inputFiles.map(parseJsonPayload);

  // Clean previous generated directories so stale files never linger
  for (const sub of ['icons', 'illustrations', 'clients', 'products', 'brand']) {
    fs.rmSync(path.join(ASSETS_DIR, sub), { recursive: true, force: true });
  }
  fs.mkdirSync(MANIFEST_DIR, { recursive: true });

  const usedNames = new Map();
  const icons = [];
  const illustrations = [];
  const clients = [];
  const products = [];
  const brand = [];
  const errors = [];

  for (const payload of payloads) {
    const group = payload.group;
    const items = Array.isArray(payload.items) ? payload.items : [];
    for (const item of items) {
      if (item.error || !item.data) {
        errors.push({ group, id: item.id, name: item.name, error: item.error ?? 'empty data' });
        continue;
      }

      const format = item.format === 'png' ? 'png' : 'svg';
      const w = Math.round(Number(item.w) || 0);
      const h = Math.round(Number(item.h) || 0);

      if (group === 'icons') {
        const rawCat = item.category || 'general';
        const category = CATEGORY_EXACT_MAP.get(rawCat) || slugifyName(rawCat, 'cat', item.id) || 'general';
        const baseName = slugifyName(item.name, 'icon', item.id);
        const uniqueName = ensureUniqueName(usedNames, 'icons', baseName);
        const relPath = `${category}/${uniqueName}.${format}`;
        const absPath = path.join(ASSETS_DIR, 'icons', relPath);

        let monochrome = false;
        let outData = item.data;
        if (format === 'svg') {
          const norm = normalizeIconSvg(item.data, w || 20, h || 20);
          outData = norm.svg;
          monochrome = norm.monochrome;
        }
        writeAssetFile(absPath, format, outData);
        icons.push({
          name: uniqueName,
          category,
          figmaName: item.name,
          figmaCategory: item.category || 'general',
          figmaId: item.id,
          relPath,
          format,
          width: w || 20,
          height: h || 20,
          monochrome,
        });
      } else if (group === 'illustrations' || group === 'clients' || group === 'products') {
        const theme = item.theme === 'dark' ? 'dark' : 'light';
        const prefix = group === 'illustrations' ? 'illus' : group === 'clients' ? 'client' : 'product';
        const baseName = slugifyName(item.name, prefix, item.id);
        const uniqueName = ensureUniqueName(usedNames, `${group}:${theme}`, baseName);
        const relPath = `${theme}/${uniqueName}.${format}`;
        const absPath = path.join(ASSETS_DIR, group, relPath);
        writeAssetFile(absPath, format, item.data);

        const record = {
          name: uniqueName,
          category: item.category || 'general',
          figmaName: item.name,
          figmaId: item.id,
          theme,
          format,
          width: w,
          height: h,
          relPath,
        };
        if (group === 'illustrations') illustrations.push(record);
        else if (group === 'clients') clients.push(record);
        else products.push(record);
      } else if (group === 'brand') {
        const baseName = slugifyName(item.name, 'brand', item.id);
        const uniqueName = ensureUniqueName(usedNames, 'brand', baseName);
        const relPath = `${uniqueName}.${format}`;
        const absPath = path.join(ASSETS_DIR, 'brand', relPath);
        writeAssetFile(absPath, format, item.data);
        brand.push({
          name: uniqueName,
          category: item.category || 'brand',
          figmaName: item.name,
          figmaId: item.id,
          theme: item.theme === 'dark' ? 'dark' : 'light',
          format,
          width: w,
          height: h,
          relPath,
        });
      }
    }
  }

  icons.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const iconCategories = Array.from(new Set(icons.map((i) => i.category))).sort();

  const iconsManifestSrc = `/* Auto-generated by scripts/unpack-figma-assets.mjs — do not edit manually */

export interface OmadaIconMeta {
  name: string;
  category: string;
  figmaName: string;
  figmaCategory: string;
  figmaId: string;
  relPath: string;
  format: 'svg' | 'png';
  width: number;
  height: number;
  monochrome: boolean;
}

export const OMADA_ICON_CATEGORIES = ${JSON.stringify(iconCategories, null, 2)} as const;

export const OMADA_ICONS: readonly OmadaIconMeta[] = ${JSON.stringify(icons, null, 2)};

export type OmadaIconName = (typeof OMADA_ICONS)[number]['name'];
`;

  const assetsManifestSrc = `/* Auto-generated by scripts/unpack-figma-assets.mjs — do not edit manually */

export interface OmadaAssetMeta {
  name: string;
  category: string;
  figmaName: string;
  figmaId: string;
  theme: 'light' | 'dark';
  format: 'svg' | 'png';
  width: number;
  height: number;
  relPath: string;
}

export const OMADA_ILLUSTRATIONS: readonly OmadaAssetMeta[] = ${JSON.stringify(illustrations, null, 2)};

export const OMADA_CLIENTS: readonly OmadaAssetMeta[] = ${JSON.stringify(clients, null, 2)};

export const OMADA_PRODUCTS: readonly OmadaAssetMeta[] = ${JSON.stringify(products, null, 2)};

export const OMADA_BRAND_ASSETS: readonly OmadaAssetMeta[] = ${JSON.stringify(brand, null, 2)};

export type OmadaIllustrationName = (typeof OMADA_ILLUSTRATIONS)[number]['name'];
export type OmadaClientIconName = (typeof OMADA_CLIENTS)[number]['name'];
export type OmadaProductName = (typeof OMADA_PRODUCTS)[number]['name'];
export type OmadaBrandAssetName = (typeof OMADA_BRAND_ASSETS)[number]['name'];
`;

  fs.writeFileSync(path.join(MANIFEST_DIR, 'iconsManifest.ts'), iconsManifestSrc, 'utf8');
  fs.writeFileSync(path.join(MANIFEST_DIR, 'assetsManifest.ts'), assetsManifestSrc, 'utf8');

  const monoCount = icons.filter((i) => i.monochrome).length;
  console.log('=== Figma Asset Unpack Summary ===');
  console.log(`Icons:         ${icons.length} (${monoCount} monochrome, ${icons.length - monoCount} multicolor, ${iconCategories.length} categories)`);
  console.log(`Illustrations: ${illustrations.length} (light: ${illustrations.filter((i) => i.theme === 'light').length}, dark: ${illustrations.filter((i) => i.theme === 'dark').length})`);
  console.log(`Clients:       ${clients.length} (light: ${clients.filter((i) => i.theme === 'light').length}, dark: ${clients.filter((i) => i.theme === 'dark').length})`);
  console.log(`Products:      ${products.length} (light: ${products.filter((i) => i.theme === 'light').length}, dark: ${products.filter((i) => i.theme === 'dark').length})`);
  console.log(`Brand:         ${brand.length}`);
  console.log(`Errors:        ${errors.length}`);
  if (errors.length > 0) {
    console.log('Error details:', JSON.stringify(errors, null, 2));
  }
}

main();
