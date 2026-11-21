---
name: omada-ui-kit
description: >-
  Build high-fidelity TP-Link Omada Controller v6.3 PRD demos and React UI prototypes
  using the omada-ui-kit component library (`S*` components, Ant Design 6 overrides,
  Figma icons/products/illustrations, and single-file zero-build HTML standalone bundle).
  Activate whenever a user asks to build an Omada demo, network management prototype,
  Controller UI page, or single-file HTML mockup.
---

# Omada UI Kit — PRD Demo & Component Skill

Build authentic **Omada Controller v6.3** demos using verified exports from `@chenyqthu/omada-ui-kit` (check `references/catalog.json` via `query-catalog.mjs info` for the active version and CDN URLs).

---

## 1. Choose the Right Output Format

| User Need | Mode | Why |
| :--- | :--- | :--- |
| Quick PRD mockup, shareable link/file, zero-install preview | **Single-File HTML Demo** (`standalone.js` + `style.css`) | One `.html` file (~45–80 lines), opens cleanly via `file://` double-click or any static server |
| Multi-page app, TypeScript checking, Vite project | **React / Vite Project** (`@pkg` ESM + CSS) | Full tree-shaking, IDE IntelliSense (`.d.ts`), and standard `import` ergonomics |

---

## 2. Mode A — Single-File HTML Starter (Zero Build)

Use classic `<script>` tags (NOT `<script type="module">`) so local `file://` double-click works without CORS failures.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Omada PRD Demo</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@latest/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@latest/dist/standalone.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body style="margin: 0;">
    <div id="root"></div>
    <script type="text/babel">
      const { useState } = OmadaUI.React;
      const {
        OmadaProvider,
        SEmulatorShell,
        SPageHeader,
        SKpiCard,
        STable,
        SButton,
        SDeviceStatus,
        useOmadaTheme,
      } = window.OmadaUI;

      function DemoApp() {
        const [activeKey, setActiveKey] = useState('devices');
        return (
          <SEmulatorShell
            activeKey={activeKey}
            onSelect={setActiveKey}
            controllerName="Headquarters Building"
          >
            <div className="pr-9" style={{ padding: 20 }}>
              <SPageHeader
                title="AP Health Overview"
                extra={<SButton variant="primary">Run Diagnostic</SButton>}
              />
              <STable
                rowKey="id"
                dataSource={[{ id: '1', name: 'AP-Lobby-01', status: 'connected', clients: 42 }]}
                columns={[
                  { title: 'Device', dataIndex: 'name', key: 'name' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (v) => <SDeviceStatus status={v} />,
                  },
                  { title: 'Clients', dataIndex: 'clients', key: 'clients' },
                ]}
              />
            </div>
          </SEmulatorShell>
        );
      }

      OmadaUI.render(
        <OmadaProvider defaultThemeMode="light">
          <DemoApp />
        </OmadaProvider>,
        '#root',
      );
    </script>
  </body>
</html>
```

> All 58+ Omada `S*` components, `antd`, `AntdIcons`, `React`, `ReactDOM`, `OmadaUI.render`, and all Figma SVG/PNG assets are bundled on `window.OmadaUI`.

---

## 3. Mode B — React / Vite Project Starter

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
```

Wrap the application root with `<OmadaProvider defaultThemeMode="light">` (never nest multiple providers).

---

## 4. Mandatory Catalog Lookup Workflow (No Guessing!)

**NEVER invent component prop names, `SIcon` names, or `SProductImage` slugs from memory.** Always query the local catalog script bundled with this skill:

```bash
# 1. Check active package name, CDN URLs, and counts
node scripts/query-catalog.mjs info

# 2. List all exported Omada components (or filter by category)
node scripts/query-catalog.mjs list-components
node scripts/query-catalog.mjs list-components emulator-v6

# 3. Inspect exact Props interface and description for a component
node scripts/query-catalog.mjs component SEmulatorShell
node scripts/query-catalog.mjs component SSettingsPageShell

# 4. Search verified Figma asset slugs before writing <SIcon> or <SProductImage>
node scripts/query-catalog.mjs search-icons status 20
node scripts/query-catalog.mjs search-icons sidebar 20
node scripts/query-catalog.mjs search-assets products eap 20
node scripts/query-catalog.mjs search-assets illustrations empty 20
node scripts/query-catalog.mjs search-assets clients apple 20

# 5. Inspect Light/Dark tokens or Omada v6.3 page recipes
node scripts/query-catalog.mjs tokens light
node scripts/query-catalog.mjs recipes
```

---

## 5. Quick Component Map

- **Theme & Layout**: `OmadaProvider`, `useOmadaTheme`, `SEmulatorShell`, `EMULATOR_NAV_GROUPS`, `SAppShell`, `SPageHeader`
- **Data Display & Tables**: `SCard`, `SKpiCard`, `STable`, `STabs`, `STag`, `SCustomTag`, `SDeviceStatus`, `SDescriptions`, `SCollapse`, `SPortPanel`, `SDevicePortGraphic`, `STopologyCanvas`
- **Charts & Health**: `SLineChart`, `SBarChart`, `SDonutChart`, `SSparkChart`, `SDonutSummaryCard`, `SHealthGauge`, `SHealthRadar`, `SHealthTrendBar`, `SApDistributionRuler`, `SChannelUtilization`, `SDeviceHealthSummary`, `SClientOverviewStrip`, `SCategoryKpiCarousel`
- **Inputs & Settings**: `SButton`, `SInput`, `SSearchInput`, `SPasswordInput`, `SNumberInput`, `STextArea`, `SIpInput`, `SMacInput`, `SSelect`, `SSwitch`, `SSlider`, `SRadio`, `SCheckbox`, `SDatePicker`, `STimePicker`, `SSchedule`, `SForm`, `SFormSection`, `SFormItem`, `SSettingsPageShell`, `SSettingsSection`, `SSettingsRow`, `SSettingsInfoBanner`
- **Feedback & Diagnostics**: `SAlert`, `SModal`, `useOmadaConfirm`, `SDrawer`, `SEmpty`, `useOmadaFeedback`, `STerminalConsole`
- **Bundled Figma Assets**: `SIcon`, `SProductImage`, `SIllustration`, `SClientIcon`, `SBrandAsset`, `SDeviceIcon`, `OmadaLogo`
- **Ant Design 6 Re-exports**: `Row`, `Col`, `Space`, `Badge`, `Popover`, `Tooltip`, `Dropdown`, `Progress`, `Pagination`, `Divider`, `Switch`, `Select`, etc.

---

## 6. Omada v6.3 Visual & AntD 6 Guardrails

1. **Always wrap with `<OmadaProvider>`** so Ant Design 6 tokens, `@ant-design/cssinjs` Cascade Layers (`<StyleProvider layer>`), and `--omada-*` CSS variables initialize properly.
2. **Respect Light/Dark Mode**: Use CSS variables (`var(--omada-bg-surface)`, `var(--omada-text-primary)`, `var(--omada-border-divider)`, `var(--omada-brand)`) instead of hardcoding `#fff` or `#000`. Toggle theme programmatically via `const { setThemeMode } = useOmadaTheme()`.
3. **Clear the `SEmulatorShell` quick-drawer handle**: When rendering content inside `<SEmulatorShell>` with `showQuickDrawerHandle` enabled (default), add right padding (`pr-9` / `paddingRight: 36`) on top-right toolbars or KPI strips so rightmost buttons/arrows never sit behind the floating `<||` handle.
4. **Ant Design 6 & Omada Props hygiene**: Use `classNames` / `styles` props on AntD `Drawer`, `Modal`, `Dropdown`, `Popover` (not removed v4/v5 props like `overlayClassName`, `bodyStyle`, `destroyOnClose`). Use `variant="primary" | "secondary" | "outline" | "danger"` on `<SButton>` instead of AntD's `type` prop.
5. **Layout without consumer Tailwind**: Inside `dist/standalone.js` / `style.css` single-file HTML demos, prefer `S*` layout components, AntD `Row` / `Col` / `Space` / `Flex`, standard inline `style={{ display: 'flex', gap: 16 }}`, or classes from `style.css` rather than assuming arbitrary Tailwind JIT classes exist outside this repo.
