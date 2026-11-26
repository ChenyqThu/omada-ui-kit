---
name: omada-ui-kit
description: >-
  Build high-fidelity TP-Link Omada Controller v6.3 PRD demos and React UI prototypes
  using the omada-ui-kit component library (`S*` components, Ant Design 6 overrides,
  Figma icons/products/illustrations, and single-file zero-build HTML standalone bundle).
  Activate whenever a user asks to build an Omada demo, network management prototype,
  Controller UI page, or single-file HTML mockup.
---

# Omada UI Kit (`@chenyqthu/omada-ui-kit@0.7.0`)

Build authentic **Omada Controller v6.3** interfaces under our **Dual Agent-UI Design Paradigm**:
- **Build Pages Better**: Load **only** the progressive-disclosure slice needed below, compose verified `S*` Blocks/templates, and validate with `verify-demo.mjs --render` (Headless Chrome + `axe-core` WCAG 2.1 A/AA + `<||` overlap check).
- **Read & Operate Pages Better**: Wrap pages with `<OmadaAgentProvider exposeWindowBridge>`, attach `agentId` to interactive controls/tables/drawers/modals (`[REDACTED]` secret masking), and expose 2–3 `useOmadaAgentAction` domain actions over `window.__OMADA_AGENT__` and WebMCP (`snapshot` / `query` / batch `act`).

## 1. Progressive Disclosure Index (Read On Demand)

| Task / Domain | Read File or Run Command |
| :--- | :--- |
| Fast overview & subpath map | `references/llms.txt` |
| Single-file HTML (`window.OmadaUI`, offline `dist/assets/`) | `references/standalone.md` |
| Page shells & reusable blocks (`SEmulatorShell`, `SFilterTableBlock`, drawers, wizards) | `references/docs/blocks.md` |
| App layout & headers (`OmadaProvider`, `SAppShell`, `SPageHeader`) | `references/docs/layout.md` |
| Inputs, selects, switches, schedules, forms | `references/docs/input.md` |
| Cards, KPIs, `STable`, `STabs` (`page`/`filter`/`capsule`/`line`), tags, port panels | `references/docs/data-display.md` |
| ECharts & health gauges/radars/rulers | `references/docs/charts.md` |
| Alerts, modals, drawers, empty states, toasts | `references/docs/feedback.md` |
| Controller v6.3 topology, ACL builder, settings shells, CLI console | `references/docs/emulator-v6.md` |
| Verified `SIcon`, `SProductImage`, `SIllustration`, `SClientIcon`, `SBrandAsset` slugs | `references/docs/assets.md` or `node scripts/query-catalog.mjs search-icons <q>` |
| Agent Bridge & WebMCP (`OmadaAgentProvider`, `agentId`, `window.__OMADA_AGENT__`, `snapshot`/`query`/`act`) | `references/docs/agent.md` |
| Authoring custom widgets (`useControllableState`, `useSelection`, `useDragSelect`, `useRovingFocus`) | `references/docs/custom-component.md` |
| Exact single-component props / starter template | `node scripts/query-catalog.mjs component <Name>` / `template <id> --html` |

## 2. Choose Output Mode

### Mode A — Single-File HTML Demo (Zero Build, `file://` Safe)

Use classic `<script>` tags (never `<script type="module">`) and **always pin exact CDN versions** (`@0.7.0` + `@babel/standalone@7.28.4` — never `@latest` or unversioned Babel):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Omada PRD Demo</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.7.0/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.7.0/dist/standalone.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script type="text/babel">
      const { useState } = OmadaUI.React;
      const { OmadaProvider, OmadaAgentProvider, SEmulatorShell, SPageHeader, STable, SButton, SDeviceStatus } = window.OmadaUI;

      function DemoApp() {
        const [activeKey, setActiveKey] = useState('devices');
        return (
          <SEmulatorShell activeKey={activeKey} onSelect={setActiveKey} controllerName="Headquarters Building">
            <div style={{ padding: '20px 44px 24px 24px' }}>
              <SPageHeader
                title="AP Health Overview"
                description="Real-time telemetry across managed access points"
                extra={<SButton variant="primary">Run Diagnostic</SButton>}
              />
              <STable
                agentId="ap.table"
                rowKey="id"
                dataSource={[{ id: '1', name: 'EAP650-Lobby', status: 'connected', clients: 42 }]}
                columns={[
                  { title: 'Device', dataIndex: 'name', key: 'name' },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (v) => <SDeviceStatus status={v} /> },
                  { title: 'Clients', dataIndex: 'clients', key: 'clients' },
                ]}
              />
            </div>
          </SEmulatorShell>
        );
      }

      OmadaUI.render(
        <OmadaProvider defaultThemeMode="light">
          <OmadaAgentProvider exposeWindowBridge>
            <DemoApp />
          </OmadaAgentProvider>
        </OmadaProvider>,
        '#root',
      );
    </script>
  </body>
</html>
```

### Mode B — React / Vite Project (ESM Subpaths)

Import tree-shakeable subpaths (`/core`, `/blocks`, `/charts`, `/emulator`, `/assets`, `/agent`):

```tsx
import '@chenyqthu/omada-ui-kit/style.css';
// Or '@chenyqthu/omada-ui-kit/style.scoped.css' with <OmadaProvider syncDocumentTheme={false}>
import { OmadaProvider, SPageHeader, SButton } from '@chenyqthu/omada-ui-kit/core';
import { SEmulatorShell, SFilterTableBlock } from '@chenyqthu/omada-ui-kit/blocks';
import { OmadaAgentProvider } from '@chenyqthu/omada-ui-kit/agent';
```

## 3. Universal Engineering Guardrails

1. **No Hallucinated Components, Props, or Slugs**: Never invent `<S*>` components, prop names, `SIcon` slugs, or `SProductImage` slugs. Query `node scripts/query-catalog.mjs component <Name>` or `search-icons` / `search-assets` first.
2. **Quick-Drawer `<||` Clearance (`44px` / `pr-9`)**: `<SEmulatorShell>` renders a fixed `36px` `<||` quick-drawer handle at top-right (`top: 12px, right: 0`).
   - Top-level content wrappers inside `<SEmulatorShell>` MUST reserve right clearance via `style={{ padding: '20px 44px 24px 24px' }}` (or rely on `SFilterTableBlock` / `SSettingsPageShell` default `clearQuickDrawer={true}`).
   - **NEVER** combine `className="pr-9"` with an inline shorthand `style={{ padding: 20 }}` — inline `padding` overwrites `padding-right` and causes button overlap!
3. **Theme & Token Discipline**: Always wrap once with `<OmadaProvider>`. Use `var(--omada-*)` CSS custom properties (`--omada-bg-surface`, `--omada-text-primary`, `--omada-border-divider`, `--omada-brand`) instead of hardcoded hex colors so Light/Dark mode works automatically. For embedded micro-frontends, use `import '@chenyqthu/omada-ui-kit/style.scoped.css'` + `<OmadaProvider syncDocumentTheme={false}>`.
4. **Ant Design 6 + Accessibility**:
   - Use `<SButton variant="primary" | "secondary" | "outline" | "danger">` (never AntD `type="primary"`).
   - Never use deprecated AntD v4/v5 props (`visible`, `destroyOnClose`, `overlayClassName`, `dropdownClassName`, `popupClassName`, `bodyStyle`, `headStyle`, `maskStyle`, `bordered={false}`).
   - Icon-only buttons (`<SButton icon={...} />`) and standalone inputs/switches without visible labels MUST provide `aria-label`.
5. **Agent-Ready Pages & External Browser Agent Fast-Path**:
   - Wrap pages in `<OmadaAgentProvider exposeWindowBridge>` (enabled in all `templates/*.{html,tsx}`), attach `agentId="domain.control"` to interactive inputs/tables/tabs/drawers/modals, and register 2–3 high-value domain actions via `useOmadaAgentAction`.
   - When operating a live Omada page as a browser agent, check `window.__OMADA_AGENT__` (or WebMCP tools `snapshot`, `query`, `act` on `document.modelContext`) **before** taking screenshots or clicking DOM selectors: read state via `window.__OMADA_AGENT__.snapshot()` / `query(...)` (`[REDACTED]` secrets) and run multi-step flows in 1 call via `await window.__OMADA_AGENT__.actAsync({ steps: [...] })`.
6. **TypeScript Project Flag**: Never run bare `tsc` without `-p` in project roots (`tsconfig.json` is a solution-style `files: []` config). Always run `pnpm typecheck` or pass `-p tsconfig.app.json` / `-p tsconfig.templates.json`.
7. **Custom Component 4-Layer Formula**: When building a novel domain widget not in the kit, reuse AntD shells (`Popover`/`SModal`/`SDrawer` — never custom `createPortal` or `mousedown` outside traps), compose `useControllableState` + `useSelection` + `useDragSelect` + `useRovingFocus` (`@chenyqthu/omada-ui-kit/core`), style with `var(--omada-*)`, and bind `useOmadaAgentControl` (see `references/docs/custom-component.md`).

## 4. Mandatory Verification Gate & Reporting

Before declaring any HTML demo or TSX page complete:

1. Run the bundled AST + lexical verifier on every generated/edited demo file (pass `--render` when Chromium is available to also run live runtime + WCAG 2.1 A/AA `axe` checks):
   ```bash
   node scripts/verify-demo.mjs <path-to-demo.html-or-Demo.tsx>
   # Optional headless Chromium + axe-core runtime verification:
   node scripts/verify-demo.mjs --render <path-to-demo.html-or-Demo.tsx>
   ```
2. In React/TSX repositories, also run `pnpm typecheck` (or `npx tsc --noEmit -p <tsconfig.json>`).
3. Fix all `[ERROR]` findings until exit code is `0`.
4. **In your final response, explicitly report the exact verification command(s) executed and their exit code(s).**
