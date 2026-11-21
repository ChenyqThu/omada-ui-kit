# Omada UI Kit

High-fidelity **TP-Link Omada Controller v6.3** React UI component library built on Ant Design 6, complete with Omada Design Tokens (Light/Dark), bundled Figma icons/illustrations/device photos, dual distribution formats (ESM + Single-File Browser Bundle), and an Agent Skill catalog.

## 1. Usage in React / Vite Projects (like `antd`)

```bash
pnpm add @<npm-username>/omada-ui-kit
```

Import the stylesheet once at app entry and use components directly:

```tsx
import '@<npm-username>/omada-ui-kit/style.css';
import {
  OmadaProvider,
  SEmulatorShell,
  SPageHeader,
  STable,
  SButton,
  SIcon,
  SProductImage,
} from '@<npm-username>/omada-ui-kit';

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

## 2. Usage in a Single HTML File (Zero Build)

For quick PRD prototypes, load `dist/style.css` and `dist/standalone.js` (bundles React 19, AntD 6, ECharts, and all Omada `S*` components under `window.OmadaUI`):

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@<npm-username>/omada-ui-kit@latest/dist/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/@<npm-username>/omada-ui-kit@latest/dist/standalone.js"></script>
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

## 3. Agent Skill & Component Catalog

The npm package includes `skills/omada-ui-kit/` containing `SKILL.md`, `references/catalog.json`, and `scripts/query-catalog.mjs` so coding agents can inspect component props, icons, hardware product images, and design tokens without guessing:

```bash
node skills/omada-ui-kit/scripts/query-catalog.mjs info
node skills/omada-ui-kit/scripts/query-catalog.mjs component SEmulatorShell
node skills/omada-ui-kit/scripts/query-catalog.mjs search-assets products eap
```

## 4. Development & Build Scripts

- `pnpm dev` — Start local Showcase & Omada Controller v6.3 Emulator
- `pnpm build:lib` — Build ESM (`dist/index.js`), CSS (`dist/style.css`), Standalone IIFE (`dist/standalone.js`), `.d.ts` (`dist/types/`), and `dist/catalog.json` (also syncs Skill bundles)
- `pnpm test` — Run unit test suite
