# Omada UI Kit

High-fidelity **TP-Link Omada Controller v6.3** React UI component library built on Ant Design 6 under the **Dual Agent-UI Design Paradigm** (**Let Agents Build Pages Better** via progressive-disclosure docs, verified `S*` Blocks, zero-build `standalone.js`, and `--render` + `axe` WCAG gates; **Let Agents Read & Operate Pages Better** via deterministic `agentId` controls, `window.__OMADA_AGENT__`, WebMCP `snapshot`/`query`/`act` tools, and `[REDACTED]` secret masking).

## 1. Usage in React / Vite Projects (like `antd`)

```bash
pnpm add @chenyqthu/omada-ui-kit
```

Import the stylesheet once at app entry and use components directly:

```tsx
import '@chenyqthu/omada-ui-kit/style.css';
import {
  OmadaProvider,
  SEmulatorShell,
  SPageHeader,
  STable,
  SButton,
  SIcon,
  SProductImage,
} from '@chenyqthu/omada-ui-kit';

export function App() {
  return (
    <OmadaProvider defaultThemeMode="light">
      <SEmulatorShell activeKey="dashboard" onSelect={() => {}}>
        <SPageHeader title="Site Overview" extra={<SButton variant="primary">Save</SButton>} />
      </SEmulatorShell>
    </OmadaProvider>
  );
}
```

### ESM Subpath Imports (Recommended for Tree-Shaking)

In Vite / Rollup / webpack builds, import from dedicated subpath entrypoints instead of the full root barrel so bundlers never pull ECharts or the full Figma hardware/illustration catalogs when you only need core UI or Blocks:

| Subpath | Contents | Skips |
| :--- | :--- | :--- |
| `@chenyqthu/omada-ui-kit/core` | `OmadaProvider`, headless hooks (`useControllableState`, `useSelection`, `useDragSelect`, `useRovingFocus`), `SAppShell`, `SPageHeader`, `SButton`, `STable`, `SForm`, `SModal`, `SDrawer`, inputs, selects, feedback, AntD primitives | ECharts, full Illustration/Product/Client catalogs |
| `@chenyqthu/omada-ui-kit/blocks` | `SEmulatorShell`, `EMULATOR_NAV_GROUPS`, `EMULATOR_GLOBAL_NAV_GROUPS`, `SFilterTableBlock`, `SInlineRuleEditorLayout`, `SInlineFormRow`, `SDetailInspectorDrawer`, `SMasterDetailSplitBlock`, `SWizardModal`, `SSwitchPortPicker` | ECharts, full Illustration/Product/Client catalogs |
| `@chenyqthu/omada-ui-kit/charts` | `SChart` (modular `echarts/core`), `SLineChart`, `SBarChart`, `SDonutChart`, `SSparkChart`, `SDonutSummaryCard`, `SHealthGauge`, `SHealthRadar`, `SHealthTrendBar`, `SChannelUtilization` | Full Illustration/Product/Client catalogs |
| `@chenyqthu/omada-ui-kit/emulator` | All Controller v6.3 domain components (`STopologyCanvas`, `SAclRuleBuilder`, `SSettingsPageShell`, `STerminalConsole`, `SDevicePortGraphic`, etc.) | — |
| `@chenyqthu/omada-ui-kit/assets` | `SIcon`, `SProductImage`, `SIllustration`, `SClientIcon`, `SBrandAsset`, `OmadaLogo`, `SDeviceIcon`, asset & icon manifests | ECharts |
| `@chenyqthu/omada-ui-kit/agent` | Deterministic Agent Bridge & WebMCP (`OmadaAgentProvider`, `useOmadaAgent`, `useOmadaAgentControl`, `useOmadaAgentAction`, `registerWebMcpTools`, `OMADA_AGENT_TOOLS`) with `snapshot()` / `query()` / batch `actAsync({ steps })` / `allow` & `[REDACTED]` secret masking | ECharts, AntD, asset catalogs |
| `@chenyqthu/omada-ui-kit/style.scoped.css` | Scoped stylesheet (no Tailwind `preflight` global reset; tokens scoped to `.omada-scope, .omada-emulator-root` for `<OmadaProvider syncDocumentTheme={false}>`) | Global CSS reset |
| `@chenyqthu/omada-ui-kit/llms.txt` | Compact LLM/Agent index mapping subpaths, components, templates, and progressive-disclosure docs | — |
| `@chenyqthu/omada-ui-kit` | Convenience root re-export of all modules (full backward compatibility) | — |

```tsx
import '@chenyqthu/omada-ui-kit/style.css';
import { OmadaProvider, SPageHeader, SButton } from '@chenyqthu/omada-ui-kit/core';
import { SEmulatorShell, SFilterTableBlock } from '@chenyqthu/omada-ui-kit/blocks';
import { SLineChart } from '@chenyqthu/omada-ui-kit/charts';
```

## 2. Usage in a Single HTML File (Zero Build)

For quick PRD prototypes, load `dist/style.css` and `dist/standalone.js` (bundles React 19, AntD 6, ECharts, and all Omada `S*` components under `window.OmadaUI`):

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.7.1/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.7.1/dist/standalone.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script type="text/babel">
      const { OmadaProvider, OmadaAgentProvider, SEmulatorShell, SCard, SButton } = window.OmadaUI;
      OmadaUI.render(
        <OmadaProvider>
          <OmadaAgentProvider exposeWindowBridge>
            <SEmulatorShell activeKey="dashboard" onSelect={() => {}}>
              <div style={{ padding: '20px 44px 24px 24px' }}>
                <SCard title="PRD Demo"><SButton variant="primary">Action</SButton></SCard>
              </div>
            </SEmulatorShell>
          </OmadaAgentProvider>
        </OmadaProvider>,
      );
    </script>
  </body>
</html>
```

See [examples/single-file-demo.html](./examples/single-file-demo.html) for a full interactive AP Monitor example with drawer & Dark Mode toggle.

## 3. Live Showcase & Online Demos

- **Showcase Gallery**: **https://pages.chenge.ink/omada-ui-kit/#/showcase**
- **Agent Skill & Issue Guide**: **https://pages.chenge.ink/omada-ui-kit/#/showcase/agent-skill**
- **Blocks Gallery**: **https://pages.chenge.ink/omada-ui-kit/#/showcase/blocks**
- **Page Templates**: **https://pages.chenge.ink/omada-ui-kit/#/showcase/templates**
- **Omada Controller v6.3 Emulator**: **https://pages.chenge.ink/omada-ui-kit/#/dashboard**

## 4. Agent Skill Installation & Usage (All Coding Agents)

### Quick Install (CLI)

Install `skills/omada-ui-kit/` directly from GitHub — the CLI auto-detects your installed coding agents:

```bash
# Project-level install
npx skills add ChenyqThu/omada-ui-kit

# Global user-level install (available across all repositories)
npx skills add ChenyqThu/omada-ui-kit -g
```

### Supported Agents & Skill Directory Paths

| Coding Agent | Project / Workspace Path | Global User Path |
| :--- | :--- | :--- |
| **Claude Code** | `.claude/skills/omada-ui-kit/` | `~/.claude/skills/omada-ui-kit/` |
| **Cursor** | `.cursor/skills/omada-ui-kit/` (or `.agents/skills/omada-ui-kit/`) | `~/.cursor/skills/omada-ui-kit/` |
| **OpenAI Codex** | `.agents/skills/omada-ui-kit/` | `~/.agents/skills/omada-ui-kit/` (or `~/.codex/skills/`) |
| **Google Antigravity** | `.agents/skills/omada-ui-kit/` | `~/.gemini/config/skills/omada-ui-kit/` |
| **GitHub Copilot / VS Code** | `.github/skills/omada-ui-kit/` | `~/.copilot/skills/omada-ui-kit/` |
| **Windsurf** | `.windsurf/skills/omada-ui-kit/` | `~/.codeium/windsurf/skills/omada-ui-kit/` |
| **OpenCode** | `.opencode/skills/omada-ui-kit/` | `~/.config/opencode/skills/omada-ui-kit/` |

### Manual Install (from npm or GitHub Clone)

The npm package bundles the full `skills/omada-ui-kit/` folder (`SKILL.md`, `references/catalog.json`, `templates/`, `scripts/query-catalog.mjs`, `scripts/verify-demo.mjs`). Copy it into your agent's skill directory if you prefer manual or offline setup:

```bash
# Option A: Copy from installed npm package (swap .agents/skills for .claude/skills or .cursor/skills)
pnpm add @chenyqthu/omada-ui-kit
mkdir -p .agents/skills
cp -r node_modules/@chenyqthu/omada-ui-kit/skills/omada-ui-kit .agents/skills/

# Option B: Copy directly from GitHub without installing npm dependencies
git clone --depth 1 https://github.com/ChenyqThu/omada-ui-kit.git /tmp/omada-ui-kit
mkdir -p .agents/skills
cp -r /tmp/omada-ui-kit/skills/omada-ui-kit .agents/skills/
```

### How to Use the Skill

- **In chat / Agent mode**: Mention `omada-ui-kit` or describe an Omada Controller UI / PRD mockup, e.g.:
  > *"Using the omada-ui-kit skill, build a single-file HTML PRD prototype for an Omada Controller v6.3 AP Health Monitor using SEmulatorShell, SFilterTableBlock, and SDetailInspectorDrawer. Support Light/Dark mode and run verify-demo.mjs before finishing."*
- **Bundled Catalog & Demo Verifier CLI** (agents run these so they never guess props or `SIcon` slugs):

```bash
node skills/omada-ui-kit/scripts/query-catalog.mjs info
node skills/omada-ui-kit/scripts/query-catalog.mjs list-components blocks
node skills/omada-ui-kit/scripts/query-catalog.mjs templates
node skills/omada-ui-kit/scripts/query-catalog.mjs template inventory --html > demo.html
node skills/omada-ui-kit/scripts/verify-demo.mjs demo.html
node skills/omada-ui-kit/scripts/verify-demo.mjs --render demo.html
```

*(If installed under `.claude/skills/omada-ui-kit/`, `.cursor/skills/omada-ui-kit/`, or `.agents/skills/omada-ui-kit/`, adjust the `skills/omada-ui-kit/` path prefix accordingly.)*

## 5. Missing Components & Bug Reports

Found a missing Omada Controller v6.3 component, icon/product asset, or visual/behavior issue? Please open a structured GitHub Issue:

- **Request Missing Component / Asset**: https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=missing-component.yml
- **Report Component Bug / Visual Issue**: https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=component-bug.yml
- **Browse All Issues**: https://github.com/ChenyqThu/omada-ui-kit/issues

Including the Omada Controller v6.3 page/section name, usage mode (Single-File HTML CDN vs. React ESM), Light/Dark mode, and screenshots or minimal reproduction steps helps implement additions and fixes quickly.

## 6. Development & Build Scripts

- `pnpm dev` — Start local Showcase & Omada Controller v6.3 Emulator
- `pnpm build:lib` — Build ESM (`dist/index.js`, `./core`, `./blocks`, `./charts`, `./emulator`, `./assets`, `./agent`), CSS (`dist/style.css` + `dist/style.scoped.css`), Standalone IIFE (`dist/standalone.js` + `dist/assets/`), `.d.ts` (`dist/types/`), `dist/catalog.json`, and `dist/llms.txt`
- `pnpm typecheck` — Type-check `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.lib.json`, and `tsconfig.templates.json`
- `pnpm sync:local-skill` — Sync `skills/omada-ui-kit/` into local user `~/.gemini/config/skills/omada-ui-kit/`
- `pnpm build:pages` — Build static site for GitHub Pages (`dist-app/`)
- `pnpm test` — Run unit test suite
- `pnpm test:agent-eval` — Run Agent readiness benchmark (progressive disclosure token budget, `verify-demo.mjs` static + `--render` axe suite, and Agent Bridge schema audit)
- `pnpm test:agent-bench` — Run 3-task Headless Chrome PRD benchmark comparing Browser DOM/ARIA clicking vs. Agent Bridge / WebMCP (`snapshot` + batch `act`)
