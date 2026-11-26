#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_APP_DIR = path.join(ROOT_DIR, 'dist-app');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'skills/omada-ui-kit/templates');

const MIME_TYPES = {
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

function resolveChromeExecutable() {
  const envPath =
    process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  return candidates.find((p) => fs.existsSync(p));
}

function assert(condition, msg) {
  if (!condition) {
    throw new Error(`BENCHMARK ASSERTION FAILED: ${msg}`);
  }
}

function utf8Bytes(val) {
  const str = typeof val === 'string' ? val : JSON.stringify(val);
  return Buffer.byteLength(str, 'utf8');
}

function estTokens(bytes) {
  return Math.ceil(bytes / 4);
}

function compileTemplateHtml(templateName) {
  const rawHtml = fs.readFileSync(path.join(TEMPLATES_DIR, templateName), 'utf8');
  return rawHtml
    .replace(
      /(?:https?:)?\/\/cdn\.jsdelivr\.net\/npm\/@chenyqthu\/omada-ui-kit@[^/"']+\/dist\//g,
      '/__omada_dist__/',
    )
    .replace(
      /<script\b[^>]*src\s*=\s*["'][^"']*@babel\/standalone[^"']*["'][^>]*>\s*<\/script>/gi,
      '',
    )
    .replace(
      /<script\b([^>]*\btype\s*=\s*["']text\/babel["'][^>]*)>([\s\S]*?)<\/script>/gi,
      (_full, _attrs, code) => {
        const out = ts.transpileModule(code, {
          fileName: `${templateName}.tsx`,
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
            jsx: ts.JsxEmit.React,
            jsxFactory: 'OmadaUI.React.createElement',
            jsxFragmentFactory: 'OmadaUI.React.Fragment',
          },
        });
        return `<script>\n${out.outputText.replace(/<\/script>/gi, '<\\/script>')}\n</script>`;
      },
    );
}

/**
 * Injects a spec-compliant browser WebMCP host (`document.modelContext`) so
 * `<OmadaAgentProvider exposeWindowBridge>` registers `snapshot`, `query`, and `act`
 * directly with the browser model context on page boot.
 */
const WEBMCP_HOST_INIT_SCRIPT = `
(() => {
  const tools = new Map();
  const modelContext = {
    registerTool(tool, options) {
      tools.set(tool.name, tool);
      if (options && options.signal) {
        options.signal.addEventListener('abort', () => {
          tools.delete(tool.name);
        });
      }
      return () => tools.delete(tool.name);
    },
    unregisterTool(name) {
      tools.delete(name);
    },
  };
  Object.defineProperty(document, 'modelContext', {
    value: modelContext,
    configurable: true,
  });
  window.__WEBMCP_HOST__ = {
    listTools() {
      return Array.from(tools.values()).map(({ name, description, inputSchema, annotations }) => ({
        name,
        description,
        inputSchema,
        annotations,
      }));
    },
    async callTool(name, input = {}) {
      const t = tools.get(name);
      if (!t) throw new Error('WebMCP tool not registered: ' + name);
      return await t.execute(input);
    },
  };
})();
`;

function createMetricsRecorder() {
  let toolCalls = 0;
  let totalBytes = 0;
  const transcript = [];

  return {
    record(name, inputPayload, outputPayload) {
      toolCalls += 1;
      const inStr = typeof inputPayload === 'string' ? inputPayload : JSON.stringify(inputPayload);
      const outStr =
        typeof outputPayload === 'string' ? outputPayload : JSON.stringify(outputPayload);
      totalBytes += utf8Bytes(inStr) + utf8Bytes(outStr);
      transcript.push({ name, inStr, outStr });
    },
    summary(elapsedMs) {
      return {
        toolCalls,
        bytes: totalBytes,
        tokens: estTokens(totalBytes),
        ms: Number(elapsedMs.toFixed(1)),
        transcriptText: transcript.map((t) => `${t.inStr}\n${t.outStr}`).join('\n'),
      };
    },
  };
}

async function observeAria(page, rec) {
  const snap = await page.locator('body').ariaSnapshot();
  rec.record('browser_snapshot', {}, snap);
  return snap;
}

async function domAct(rec, desc, fn) {
  await fn();
  rec.record('browser_act', desc, { ok: true });
}

async function webMcpCall(page, rec, toolName, input = {}) {
  const res = await page.evaluate(
    async ({ name, args }) => {
      return await window.__WEBMCP_HOST__.callTool(name, args);
    },
    { name: toolName, args: input },
  );
  // WebMCP returns content[0].text (serialized JSON); count exact JSON tool wire payload once
  const outText = res?.content?.[0]?.text ?? JSON.stringify(res);
  rec.record(`webmcp:${toolName}`, input, outText);
  return res;
}

async function main() {
  assert(
    fs.existsSync(path.join(DIST_DIR, 'standalone.js')),
    'Missing dist/standalone.js — run "pnpm build:lib" first.',
  );
  assert(
    fs.existsSync(path.join(DIST_APP_DIR, 'index.html')),
    'Missing dist-app/index.html — run "pnpm build:app" first.',
  );

  const compiledTemplates = new Map([
    ['settings.html', compileTemplateHtml('settings.html')],
    ['inventory.html', compileTemplateHtml('inventory.html')],
  ]);

  const server = http.createServer((req, res) => {
    const reqUrl = (req.url || '/').split('?')[0];

    if (reqUrl.startsWith('/templates/')) {
      const name = reqUrl.slice('/templates/'.length);
      const html = compiledTemplates.get(name);
      if (!html) {
        res.writeHead(404);
        res.end('Template not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (reqUrl.startsWith('/__omada_dist__/')) {
      const rel = decodeURIComponent(reqUrl.slice('/__omada_dist__/'.length));
      const fullPath = path.resolve(DIST_DIR, rel);
      if (!fullPath.startsWith(DIST_DIR) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(fullPath).pipe(res);
      return;
    }

    // Serve built Emulator/Showcase app from dist-app/
    const relApp = reqUrl === '/' ? 'index.html' : decodeURIComponent(reqUrl.replace(/^\//, ''));
    const appPath = path.resolve(DIST_APP_DIR, relApp);
    if (appPath.startsWith(DIST_APP_DIR) && fs.existsSync(appPath) && fs.statSync(appPath).isFile()) {
      const ext = path.extname(appPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(appPath).pipe(res);
      return;
    }

    res.writeHead(204);
    res.end();
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const executablePath = resolveChromeExecutable();

  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const results = [];

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(WEBMCP_HOST_INIT_SCRIPT);

    // =========================================================================
    // TASK 1: Multi-Field DNS DoT Cutover (templates/settings.html)
    // =========================================================================
    {
      // Track A: Browser DOM / ARIA
      const pageA = await context.newPage();
      await pageA.goto(`${baseUrl}/templates/settings.html`, { waitUntil: 'load' });
      await pageA.waitForFunction(() => Boolean(document.querySelector('#root > *')));
      const recA = createMetricsRecorder();
      const t0A = performance.now();

      await observeAria(pageA, recA);
      await domAct(recA, { click: 'Expand Advanced Options' }, () =>
        pageA.getByRole('button', { name: /Advanced Options/i }).click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { click: 'Resolver Mode combobox' }, () =>
        pageA.getByRole('combobox', { name: 'Resolver Mode' }).click(),
      );
      await domAct(recA, { click: 'DNS over TLS (DoT)' }, () =>
        pageA.getByTitle('DNS over TLS (DoT)').click(),
      );
      await domAct(recA, { fill: 'Site Identifier -> HQ-Core-Gateway' }, () =>
        pageA.getByLabel('Site Identifier').fill('HQ-Core-Gateway'),
      );
      const octets = pageA.locator('input[aria-label^="Octet "]');
      const quad9 = ['9', '9', '9', '9'];
      for (let i = 0; i < 4; i += 1) {
        await domAct(recA, { fillOctet: i + 1, value: quad9[i] }, () =>
          octets.nth(i).fill(quad9[i]),
        );
      }
      await domAct(recA, { click: 'Apply' }, () =>
        pageA.getByRole('button', { name: 'Apply' }).click(),
      );
      await observeAria(pageA, recA);
      const metricsA = recA.summary(performance.now() - t0A);

      const verifyA = await pageA.evaluate(() => window.__OMADA_AGENT__.snapshot());
      assert(
        verifyA.controls.find((c) => c.id === 'dns.siteName')?.value === 'HQ-Core-Gateway' &&
          verifyA.controls.find((c) => c.id === 'dns.resolverMode')?.value === 'dot' &&
          verifyA.controls.find((c) => c.id === 'dns.settings')?.value?.dirty === false,
        'Task 1 Track A end-state mismatch',
      );
      await pageA.close();

      // Track B: Agent Bridge / WebMCP
      const pageB = await context.newPage();
      await pageB.goto(`${baseUrl}/templates/settings.html`, { waitUntil: 'load' });
      await pageB.waitForFunction(() => Boolean(window.__OMADA_AGENT__));
      const recB = createMetricsRecorder();
      const t0B = performance.now();

      await webMcpCall(pageB, recB, 'snapshot', {});
      const actResB = await webMcpCall(pageB, recB, 'act', {
        steps: [
          { id: 'dns.advanced', action: 'expand' },
          { id: 'dns.resolverMode', action: 'setValue', value: 'dot' },
          { id: 'dns.siteName', action: 'setValue', value: 'HQ-Core-Gateway' },
          { id: 'dns.setUpstreamServer', value: '9.9.9.9' },
          { id: 'dns.saveConfiguration' },
        ],
      });
      const metricsB = recB.summary(performance.now() - t0B);
      assert(actResB.structuredContent?.ok === true, 'Task 1 Track B batch act failed');
      const snapB = actResB.structuredContent.snapshot;
      assert(
        snapB.controls.find((c) => c.id === 'dns.siteName')?.value === 'HQ-Core-Gateway' &&
          snapB.controls.find((c) => c.id === 'dns.resolverMode')?.value === 'dot' &&
          snapB.controls.find((c) => c.id === 'dns.settings')?.value?.dirty === false,
        'Task 1 Track B end-state mismatch',
      );
      await pageB.close();

      results.push({
        id: 'Task 1: DNS DoT Security Cutover (settings.html)',
        dom: metricsA,
        bridge: metricsB,
      });
    }

    // =========================================================================
    // TASK 2: Faulty Outdoor AP Triage & Batch Upgrade (templates/inventory.html)
    // =========================================================================
    {
      // Track A: Browser DOM / ARIA
      const pageA = await context.newPage();
      await pageA.goto(`${baseUrl}/templates/inventory.html`, { waitUntil: 'load' });
      await pageA.waitForFunction(() => Boolean(document.querySelector('#root > *')));
      const recA = createMetricsRecorder();
      const t0A = performance.now();

      await observeAria(pageA, recA);
      await domAct(recA, { click: 'Filter by status' }, () =>
        pageA.getByRole('combobox', { name: 'Filter by status' }).click(),
      );
      await domAct(recA, { select: 'Heartbeat Missed' }, () =>
        pageA.getByTitle('Heartbeat Missed').click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { clickRow: 'EAP610-Courtyard' }, () =>
        pageA.getByText('EAP610-Courtyard').click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { selectDrawerTab: 'Radios' }, () =>
        pageA.getByRole('tab', { name: 'Radios' }).click(),
      );
      await domAct(recA, { closeDrawer: true }, () =>
        pageA.locator('.ant-drawer-close').click(),
      );
      await domAct(recA, { click: 'Filter by status' }, () =>
        pageA.getByRole('combobox', { name: 'Filter by status' }).click(),
      );
      await domAct(recA, { select: 'All Statuses' }, () =>
        pageA.getByTitle('All Statuses').click(),
      );
      await domAct(recA, { click: 'Batch Upgrade' }, () =>
        pageA.getByRole('button', { name: 'Batch Upgrade' }).click(),
      );
      await observeAria(pageA, recA);
      const metricsA = recA.summary(performance.now() - t0A);

      const rowsA = await pageA.evaluate(
        () => window.__OMADA_AGENT__.query({ id: 'devices.table' })[0]?.meta?.rows,
      );
      assert(
        Array.isArray(rowsA) &&
          rowsA.length === 3 &&
          rowsA.find((r) => r.name === 'EAP650-Lobby')?.firmware === '1.5.0 Build 202611' &&
          rowsA.find((r) => r.name === 'EAP610-Courtyard')?.firmware === '1.3.0 Build 202609',
        'Task 2 Track A end-state mismatch',
      );
      await pageA.close();

      // Track B: Agent Bridge / WebMCP
      const pageB = await context.newPage();
      await pageB.goto(`${baseUrl}/templates/inventory.html`, { waitUntil: 'load' });
      await pageB.waitForFunction(() => Boolean(window.__OMADA_AGENT__));
      const recB = createMetricsRecorder();
      const t0B = performance.now();

      await webMcpCall(pageB, recB, 'snapshot', {});
      const actResB = await webMcpCall(pageB, recB, 'act', {
        steps: [
          { id: 'devices.statusFilter', action: 'setValue', value: 'heartbeat-missed' },
          { id: 'devices.inspectByName', value: 'EAP610-Courtyard' },
          { id: 'devices.inspector', action: 'selectTab', value: 'radios' },
          { id: 'devices.inspector', action: 'close' },
          { id: 'devices.resetFilters' },
          { id: 'devices.batchUpgradeConnected' },
        ],
      });
      const metricsB = recB.summary(performance.now() - t0B);
      assert(actResB.structuredContent?.ok === true, 'Task 2 Track B batch act failed');
      const rowsB =
        actResB.structuredContent.snapshot.controls.find((c) => c.id === 'devices.table')?.meta
          ?.rows ?? [];
      assert(
        rowsB.length === 3 &&
          rowsB.find((r) => r.name === 'EAP650-Lobby')?.firmware === '1.5.0 Build 202611' &&
          rowsB.find((r) => r.name === 'EAP610-Courtyard')?.firmware === '1.3.0 Build 202609',
        'Task 2 Track B end-state mismatch',
      );
      await pageB.close();

      results.push({
        id: 'Task 2: AP Triage + Drawer + Batch Upgrade (inventory.html)',
        dom: metricsA,
        bridge: metricsB,
      });
    }

    // =========================================================================
    // TASK 3: Cross-Route Controller Provisioning (EmulatorApp: Dashboard -> WLAN -> DNS)
    // =========================================================================
    {
      const SECRET_PSK = 'OmadaBenchSecret#2026';

      // Track A: Browser DOM / ARIA
      const pageA = await context.newPage();
      await pageA.goto(`${baseUrl}/#/dashboard`, { waitUntil: 'networkidle' });
      await pageA.waitForSelector('[data-nav-key="dashboard"]');
      const recA = createMetricsRecorder();
      const t0A = performance.now();

      await observeAria(pageA, recA);
      await domAct(recA, { hoverNav: 'Network Config' }, () =>
        pageA.locator('[data-nav-key="network-config"]').hover(),
      );
      await domAct(recA, { clickSubmenu: 'wlan' }, () =>
        pageA.locator('[data-submenu-key="wlan"]').click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { click: 'Add SSID' }, () =>
        pageA.getByRole('button', { name: /Add SSID/i }).click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { fill: 'SSID Name -> Corp-WiFi7' }, () =>
        pageA.getByLabel('SSID Name', { exact: true }).fill('Corp-WiFi7'),
      );
      await domAct(recA, { fill: 'Security Key -> [secret]' }, () =>
        pageA.getByLabel('Security Key').fill(SECRET_PSK),
      );
      await domAct(recA, { fill: 'VLAN ID -> 20' }, () =>
        pageA.getByLabel('VLAN ID').fill('20'),
      );
      await domAct(recA, { click: 'Create SSID' }, () =>
        pageA.getByRole('button', { name: 'Create' }).click(),
      );
      await domAct(recA, { hoverNav: 'Device Config' }, () =>
        pageA.locator('[data-nav-key="device-config"]').hover(),
      );
      await domAct(recA, { clickSubmenu: 'dns' }, () =>
        pageA.locator('[data-submenu-key="dns"]').click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { clickTab: 'DNS Proxy' }, () =>
        pageA.getByRole('tab', { name: 'DNS Proxy' }).click(),
      );
      await observeAria(pageA, recA);
      await domAct(recA, { selectRadio: 'DoT' }, () =>
        pageA.getByRole('radio', { name: 'DoT' }).check(),
      );
      await domAct(recA, { click: 'Apply DNS Proxy' }, () =>
        pageA.getByRole('button', { name: 'Apply' }).click(),
      );
      await observeAria(pageA, recA);
      const metricsA = recA.summary(performance.now() - t0A);

      const proxyTypeA = await pageA.evaluate(
        () => window.__OMADA_AGENT__.query({ id: 'dns.proxyType' })[0]?.value,
      );
      assert(proxyTypeA === 'DoT', 'Task 3 Track A DNS Proxy Type mismatch');
      await pageA.close();

      // Track B: Agent Bridge / WebMCP
      const pageB = await context.newPage();
      await pageB.goto(`${baseUrl}/#/dashboard`, { waitUntil: 'networkidle' });
      await pageB.waitForFunction(() => Boolean(window.__OMADA_AGENT__));
      const recB = createMetricsRecorder();
      const t0B = performance.now();

      await webMcpCall(pageB, recB, 'snapshot', {});
      const actResB = await webMcpCall(pageB, recB, 'act', {
        steps: [
          { id: 'emulator.navigate', value: 'wlan' },
          { id: 'wlan.openAddSsidModal' },
          { id: 'wlan.form.ssidName', action: 'setValue', value: 'Corp-WiFi7' },
          { id: 'wlan.form.passphrase', action: 'setValue', value: SECRET_PSK },
          { id: 'wlan.form.vlan', action: 'setValue', value: '20' },
          { id: 'wlan.ssidModal', action: 'confirm' },
          { id: 'emulator.navigate', value: 'dns' },
          { id: 'dns.subTabs', action: 'selectTab', value: 'dns-proxy' },
          { id: 'dns.proxyType', action: 'setValue', value: 'DoT' },
          { id: 'dns.applyProxySettings' },
        ],
      });
      const metricsB = recB.summary(performance.now() - t0B);
      assert(actResB.structuredContent?.ok === true, 'Task 3 Track B batch act failed');
      const snapB = actResB.structuredContent.snapshot;
      assert(
        snapB.controls.find((c) => c.id === 'dns.proxyType')?.value === 'DoT',
        'Task 3 Track B DNS Proxy Type mismatch',
      );
      // Verify secret passphrase never appeared in ANY WebMCP output!
      const actOutStr = actResB.content?.[0]?.text ?? '';
      assert(
        !actOutStr.includes(SECRET_PSK) && actOutStr.includes('[REDACTED]'),
        'Task 3 Track B leaked plaintext passphrase in WebMCP output!',
      );
      await pageB.close();

      results.push({
        id: 'Task 3: Cross-Route WLAN SSID + DNS Proxy (EmulatorApp)',
        dom: metricsA,
        bridge: metricsB,
      });
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  // Compute aggregate comparison
  const totals = results.reduce(
    (acc, r) => {
      acc.domCalls += r.dom.toolCalls;
      acc.bridgeCalls += r.bridge.toolCalls;
      acc.domTokens += r.dom.tokens;
      acc.bridgeTokens += r.bridge.tokens;
      acc.domMs += r.dom.ms;
      acc.bridgeMs += r.bridge.ms;
      return acc;
    },
    {
      domCalls: 0,
      bridgeCalls: 0,
      domTokens: 0,
      bridgeTokens: 0,
      domMs: 0,
      bridgeMs: 0,
    },
  );

  const callReductionPct = (
    ((totals.domCalls - totals.bridgeCalls) / totals.domCalls) *
    100
  ).toFixed(1);
  const tokenReductionPct = (
    ((totals.domTokens - totals.bridgeTokens) / totals.domTokens) *
    100
  ).toFixed(1);
  const latencyReductionPct = (
    ((totals.domMs - totals.bridgeMs) / totals.domMs) *
    100
  ).toFixed(1);

  console.log('\n=== Omada UI Kit — 3-Task PRD Browser Agent Benchmark (Headless Chrome) ===\n');
  for (const r of results) {
    const taskCallSave = (((r.dom.toolCalls - r.bridge.toolCalls) / r.dom.toolCalls) * 100).toFixed(1);
    const taskTokSave = (((r.dom.tokens - r.bridge.tokens) / r.dom.tokens) * 100).toFixed(1);
    const taskMsSave = (((r.dom.ms - r.bridge.ms) / r.dom.ms) * 100).toFixed(1);
    console.log(`• ${r.id}`);
    console.log(
      `    Browser DOM/ARIA : ${String(r.dom.toolCalls).padStart(2)} calls | ~${String(r.dom.tokens).padStart(5)} tokens (${r.dom.bytes} B) | ${r.dom.ms} ms`,
    );
    console.log(
      `    WebMCP Bridge    : ${String(r.bridge.toolCalls).padStart(2)} calls | ~${String(r.bridge.tokens).padStart(5)} tokens (${r.bridge.bytes} B) | ${r.bridge.ms} ms`,
    );
    console.log(
      `    Delta            : -${taskCallSave}% calls | -${taskTokSave}% tokens | -${taskMsSave}% latency\n`,
    );
  }

  console.log('--- Aggregate Across All 3 PRD Tasks ---');
  console.log(
    `  Tool Calls : ${totals.domCalls} -> ${totals.bridgeCalls} (-${callReductionPct}%)`,
  );
  console.log(
    `  Est Tokens : ~${totals.domTokens} -> ~${totals.bridgeTokens} (-${tokenReductionPct}%)`,
  );
  console.log(
    `  Wall Time  : ${totals.domMs.toFixed(1)} ms -> ${totals.bridgeMs.toFixed(1)} ms (-${latencyReductionPct}%)\n`,
  );

  assert(
    Number(callReductionPct) >= 65,
    `Expected >=65% tool-call reduction, got ${callReductionPct}%`,
  );
  assert(
    Number(tokenReductionPct) >= 50,
    `Expected >=50% token reduction, got ${tokenReductionPct}%`,
  );

  console.log('PASS: 3-task Headless Chrome benchmark verified end-state parity & [REDACTED] safety.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
