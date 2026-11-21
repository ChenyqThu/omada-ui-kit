# Omada UI Kit

Reusable **Omada Web UI Component Library & Demo Workspace** built on **React 18 + TypeScript + Vite + Ant Design 5 + Tailwind CSS v4 + ECharts 5**.

## Quick Start

```bash
pnpm install
pnpm dev       # Start local dev server (default http://localhost:5173)
pnpm test      # Run Vitest unit tests
pnpm typecheck # Run strict TypeScript checks
pnpm build     # Build production bundle into dist/
```

## Architecture & Design Token Reconciliation

The live **Omada Controller v6.3.0.34** runs on an Ant Design-based (`S*`) component system styled with `--s-color-*` CSS variables, `Manrope` typography, and `ECharts 5`. In the TP Web Figma library, the newer `Color` and `Size` variable collections currently contain unfilled placeholders (`#ffffff` / `"String value"` / empty collections), while production components bind to the `原内容` collection and `🌟Shadow 投影` / `✍️✅设备端口` / Local Text Styles.

To prevent placeholder regressions, `src/omada/theme/tokens.ts` and `src/styles/tokens.css` establish a clean **three-layer token pipeline**:
1. **L1 Primitives**: `Manrope` + monospace font stacks, spacing scale (`0..40px`), radius scale (`0..9999px`), 11 physical port speed colors, and the 20-color Omada categorical chart palette.
2. **L2 Semantic Tokens**: Light & Dark `--omada-*` CSS variables verified against Figma `原内容` and the live Omada v6.3.0.34 emulator (`#00A870` brand green, `56px` gradient Top Bar, `216px`/`52px` Sidebar, `4`-level shadows).
3. **L3 AntD 5 Theme + Overrides**: `buildOmadaAntdTheme()` (`ConfigProvider`) combined with `<StyleProvider layer>` and `src/styles/omada-antd-overrides.css` inside `@layer components` after `@layer antd`.

## Directory Layout

- `src/omada/` — Theme provider, tokens, Omada SVG logo, `SAppShell`, and all `S*` components (`index.ts` barrel export)
- `src/styles/` — `tokens.css` (Tailwind v4 `@layer` ordering + CSS vars) and `omada-antd-overrides.css`
- `src/showcase/` — Default live **Devices Demo** + interactive Showcase for Tokens, Inputs & Forms, Data Display & Charts, and Feedback & Overlays
- `src/demos/` — Directory for future PRD product demos
- `COMPONENTS.md` — Scannable component catalog & instructions for adding new PRD demos
