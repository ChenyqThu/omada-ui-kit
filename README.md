# Omada UI Kit

High-fidelity **TP-Link Omada Controller v6.3** React UI component library built on Ant Design 6, complete with Omada Design Tokens (Light/Dark), bundled Figma icons/illustrations/device photos, dual distribution formats (ESM + Single-File Browser Bundle), and an Agent Skill catalog.

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
| `@chenyqthu/omada-ui-kit/core` | `OmadaProvider`, `SAppShell`, `SPageHeader`, `SButton`, `STable`, `SForm`, `SModal`, `SDrawer`, inputs, selects, feedback, AntD primitives | ECharts, full Illustration/Product/Client catalogs |
| `@chenyqthu/omada-ui-kit/blocks` | `SEmulatorShell`, `EMULATOR_NAV_GROUPS`, `EMULATOR_GLOBAL_NAV_GROUPS`, `SFilterTableBlock`, `SInlineRuleEditorLayout`, `SInlineFormRow`, `SDetailInspectorDrawer`, `SMasterDetailSplitBlock`, `SWizardModal`, `SSwitchPortPicker` | ECharts, full Illustration/Product/Client catalogs |
| `@chenyqthu/omada-ui-kit/charts` | `SChart` (modular `echarts/core`), `SLineChart`, `SBarChart`, `SDonutChart`, `SSparkChart`, `SDonutSummaryCard`, `SHealthGauge`, `SHealthRadar`, `SHealthTrendBar`, `SChannelUtilization` | Full Illustration/Product/Client catalogs |
| `@chenyqthu/omada-ui-kit/emulator` | All Controller v6.3 domain components (`STopologyCanvas`, `SAclRuleBuilder`, `SSettingsPageShell`, `STerminalConsole`, `SDevicePortGraphic`, etc.) | — |
| `@chenyqthu/omada-ui-kit/assets` | `SIcon`, `SProductImage`, `SIllustration`, `SClientIcon`, `SBrandAsset`, `OmadaLogo`, `SDeviceIcon`, asset & icon manifests | ECharts |
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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@latest/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@latest/dist/standalone.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script type="text/babel">
      const { OmadaProvider, SEmulatorShell, SCard, SButton } = window.OmadaUI;
      OmadaUI.render(
        <OmadaProvider>
          <SEmulatorShell activeKey="dashboard" onSelect={() => {}}>
            <div style={{ padding: 24 }}>
              <SCard title="PRD Demo"><SButton variant="primary">Action</SButton></SCard>
            </div>
          </SEmulatorShell>
        </OmadaProvider>,
      );
    </script>
  </body>
</html>
```

See [examples/single-file-demo.html](./examples/single-file-demo.html) for a full interactive AP Monitor example with drawer & Dark Mode toggle.

## 3. Live Showcase, Agent Skill, Blocks, & Page Templates

- **Showcase Gallery**: **https://pages.chenge.ink/omada-ui-kit/#/showcase**
- **Blocks Gallery**: **https://pages.chenge.ink/omada-ui-kit/#/showcase/blocks**
- **Page Templates**: **https://pages.chenge.ink/omada-ui-kit/#/showcase/templates**
- **Omada Controller v6.3 Emulator**: **https://pages.chenge.ink/omada-ui-kit/#/dashboard**

Install the Skill directly from GitHub into Antigravity / Claude Code / Codex / Cursor:

```bash
npx skills add ChenyqThu/omada-ui-kit
```

The npm package bundles `skills/omada-ui-kit/` containing `SKILL.md`, `references/catalog.json`, `templates/` (`dashboard`, `inventory`, `acl-rules`, `settings`, `analytics-logs` in both HTML & TSX), `scripts/query-catalog.mjs`, and `scripts/verify-demo.mjs`:

```bash
node skills/omada-ui-kit/scripts/query-catalog.mjs list-components blocks
node skills/omada-ui-kit/scripts/query-catalog.mjs templates
node skills/omada-ui-kit/scripts/query-catalog.mjs template inventory --html > demo.html
node skills/omada-ui-kit/scripts/verify-demo.mjs demo.html
```

## 4. Development & Build Scripts

- `pnpm dev` — Start local Showcase & Omada Controller v6.3 Emulator
- `pnpm build:lib` — Build ESM (`dist/index.js`), CSS (`dist/style.css`), Standalone IIFE (`dist/standalone.js`), `.d.ts` (`dist/types/`), and `dist/catalog.json` (also syncs Skill bundles)
- `pnpm build:pages` — Build static site for GitHub Pages (`dist-app/`)
- `pnpm test` — Run unit test suite
