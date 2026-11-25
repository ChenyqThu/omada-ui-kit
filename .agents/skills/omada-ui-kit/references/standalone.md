# Single-File HTML Standalone Bundle (`window.OmadaUI`)

Use `dist/standalone.js` + `dist/style.css` for zero-build PRD mockups that open directly via `file://` or any static host.

## 1. Pinned Script & Stylesheet Tags

Always pin both `@chenyqthu/omada-ui-kit@0.6.0` and `@babel/standalone@7.28.4` (never `@latest`):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.6.0/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.6.0/dist/standalone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js"></script>
```

For offline repository demos (such as `examples/single-file-demo.html`), reference `../dist/style.css` and `../dist/standalone.js`.

## 2. `window.OmadaUI` Runtime Surface

- **All Omada `S*` Components, Blocks, Charts, Assets & Hooks**: Destructure directly from `window.OmadaUI` (e.g. `const { OmadaProvider, OmadaAgentProvider, SEmulatorShell, SFilterTableBlock, SButton } = window.OmadaUI;`).
- **React 19**: `OmadaUI.React` (`useState`, `useMemo`, `useEffect`, `useRef`) and `OmadaUI.ReactDOM`.
- **Mount Helper**: `OmadaUI.render(<OmadaProvider><App /></OmadaProvider>, '#root')` (reuses the React root across re-renders).
- **Agent Bridge Namespace**: `OmadaUI.agent` (`OmadaAgentProvider`, `useOmadaAgent`, `useOmadaAgentControl`, `useOmadaAgentAction`, `registerWebMcpTools`, `OMADA_AGENT_TOOLS`, `OMADA_SECRET_MASK`).
- **Curated `OmadaUI.antd` Compatibility Subset**: `Alert`, `Anchor`, `App`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Card`, `Cascader`, `Checkbox`, `Col`, `Collapse`, `ColorPicker`, `ConfigProvider`, `DatePicker`, `Descriptions`, `Divider`, `Drawer`, `Dropdown`, `Empty`, `Flex`, `Form`, `Grid`, `Input`, `InputNumber`, `Layout`, `Modal`, `Pagination`, `Popconfirm`, `Popover`, `Progress`, `Radio`, `Rate`, `Row`, `Segmented`, `Select`, `Skeleton`, `Slider`, `Space`, `Spin`, `Statistic`, `Steps`, `Switch`, `Table`, `Tabs`, `Tag`, `TimePicker`, `Tooltip`, `Transfer`, `TreeSelect`, `Typography`, `Upload`, `message`, `notification`, `theme`.
- **Curated `OmadaUI.AntdIcons` Subset**: Common outlined/filled icons (`PlusOutlined`, `SearchOutlined`, `ReloadOutlined`, `SettingOutlined`, `DeleteOutlined`, `EditOutlined`, etc.). Prefer `<SIcon name="..." />` from the official Figma icon library whenever an Omada icon exists.

## 3. Asset Resolution Architecture (`__OMADA_ASSET_BASE__`)

- **100% Inline**: All 590 `<SIcon>` SVGs and builtin empty/upload illustrations (`no-data`, `upgrade`) are embedded directly inside `standalone.js`.
- **Externalized Heavy Media (`dist/assets/`)**: `products`, remaining `illustrations`, `clients`, and `brand` assets resolve relative to `globalThis.__OMADA_ASSET_BASE__` (auto-detected from `<script src=".../standalone.js">`, falling back to `https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.6.0/dist/` when inlined). Whether loaded from jsDelivr CDN, inlined in an HTML file, or loaded via local `../dist/standalone.js` (`file://`), `<SProductImage>`, `<SIllustration>`, `<SClientIcon>`, and `<SBrandAsset>` automatically load `assets/<group>/<theme>/<slug>.<ext>` beside `standalone.js`.

## 4. External Browser Agent Discovery (`window.__OMADA_AGENT__` & WebMCP)

Wrap standalone demos with `<OmadaAgentProvider exposeWindowBridge>` (enabled by default across all starter templates and `examples/single-file-demo.html`):

- Exposes `window.__OMADA_AGENT__` (`snapshot()`, `query(filter)`, `act(...)`, `actAsync({ steps })`, `canAct(id, action)`).
- Automatically registers WebMCP site tools (`snapshot`, `query`, `act`) on `document.modelContext` / `navigator.modelContext` when the host browser supports WebMCP.

```js
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
```
