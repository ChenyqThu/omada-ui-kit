# Omada UI Kit — Design Paradigm & Component Contract

All contributors, coding agents, and multi-agent swarm workers MUST follow this contract so every component, block, template, and page integrates seamlessly, preserves Light/Dark design tokens, adheres to Ant Design 6 APIs, and fulfills **both pillars of the Agent-UI Design Paradigm**.

---

## 1. Core Design Paradigm — Dual Agent-UI Pillars

`omada-ui-kit` treats **human operators**, **code-generating agents**, and **browser-operating agents** as first-class citizens under two complementary architectural pillars:

### Pillar 1 — Let Agents Build Pages Better (生成侧友好)
1. **Zero-Drift TypeChecker Schema**: Every public component, block, hook, and helper MUST declare strict TypeScript interfaces (`S<Name>Props` with concise JSDoc). `scripts/generate-catalog.mjs` extracts real `ts.TypeChecker` signatures directly from source into `dist/catalog.json`, `dist/llms.txt`, and 9 progressive-disclosure `references/docs/*.md` slices — never hand-maintain diverging prop docs or invent undocumented props/asset slugs.
2. **Progressive Disclosure & High-Level Blocks First**: Agents load `SKILL.md` (`~2.2k` tokens) plus only the needed domain slice (`references/docs/blocks.md`, `input.md`, `agent.md`, etc., saving `~96%` context tokens vs. monolithic catalogs), and compose pages from verified Blocks (`SEmulatorShell`, `SFilterTableBlock`, `SSettingsPageShell`, `SDetailInspectorDrawer`, `SInlineRuleEditorLayout`, `SAclRuleBuilder`) and starter templates (`skills/omada-ui-kit/templates/*.{html,tsx}`).
3. **Lightweight Standalone + Scoped Isolation**: Keep `dist/standalone.js` within `<= 4.50 MB` (heavy `products`, `illustrations`, `clients`, and `brand` media externalized under `dist/assets/` via `__OMADA_ASSET_BASE__`). Support host-safe micro-frontend embedding via `@chenyqthu/omada-ui-kit/style.scoped.css` + `<OmadaProvider syncDocumentTheme={false}>`.
4. **Static + Live Browser Verification Loop**: Every demo or template MUST pass both static AST/lexical verification (`verify-demo.mjs`) and Headless Chrome live rendering (`verify-demo.mjs --render`, checking `0` runtime/console errors, `0` broken `<img>` decodes, `0` `<||` quick-drawer handle geometry overlaps, and `0` `axe-core` WCAG 2.1 A/AA violations).

### Pillar 2 — Let Agents Read & Operate Pages Better (读取与操作侧友好)
1. **Agent-Ready Interactive Primitives (`agentId`)**: Every stateful input, selector, checkbox/radio, number/date picker, tab bar, table, expandable section, modal/step-modal, drawer, or settings shell MUST accept `agentId?: string` and register deterministic `{ kind, label, value, options, disabled, actions, meta }` via `useOmadaAgentControl`.
2. **Secret Redaction by Default**: Password and credential controls (`SPasswordInput`, or `SInput` with `secret`) MUST mask values as `OMADA_SECRET_MASK` (`'[REDACTED]'`) across `snapshot()`, `query()`, `act()`, `actAsync()`, and WebMCP tool responses — plaintext secrets MUST NEVER be echoed back.
3. **Default Window Bridge + Standard WebMCP Exposure**: Full pages, templates, and standalone HTML demos MUST mount `<OmadaAgentProvider exposeWindowBridge>` so external browser agents immediately discover both `window.__OMADA_AGENT__` and standard WebMCP site tools (`OMADA_AGENT_TOOLS`: `snapshot`, `query`, `act` on `document.modelContext` / `navigator.modelContext` with `readOnlyHint`, `consequentialHint`, and `untrustedContentHint: true` annotations).
4. **Domain Actions & Batch Execution**: Pages SHOULD register 2–3 high-value domain actions via `useOmadaAgentAction` (e.g., `dns.applySecurityPreset`, `devices.inspectByName`, `wlan.createSsid`) so multi-step cross-route/modal workflows execute deterministically in 1 batch call via `await actAsync({ steps })`, guarded by `allow` permission policies.
5. **Dual-Channel Parity (Human A11y + Agent Bridge)**: Deterministic Agent Bridge bindings complement — and NEVER replace — semantic HTML, WAI-ARIA labels (`aria-label` on icon-only buttons and standalone controls), roving keyboard focus (`useRovingFocus`), and Light/Dark contrast.

---

## 2. Runtime & Toolchain Stack

- **Framework**: React `19.3` + TypeScript (`strict`, checked via `pnpm typecheck` across `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.lib.json`, and `tsconfig.templates.json` — never run bare `tsc` without `-p`)
- **UI Primitive Base**: Ant Design `6.7` + `@ant-design/cssinjs` (`<StyleProvider layer>` in `src/omada/theme/OmadaProvider.tsx`)
- **Styling**: Tailwind CSS v4 with explicit cascade layers in `src/styles/tokens.css`:
  ```css
  @layer theme, base, antd, components, utilities;
  ```
- **Charts, Tests & Browser Gates**: Modular ECharts `5.6` (`echarts/core`), Vitest `5.1` (`jsdom` + `@testing-library/react`), `playwright-core` + `axe-core` (`devDependencies` only — zero runtime dependency bloat)

---

## 3. Ant Design v6 API Rules

Use Ant Design v6 APIs exclusively; never rely on removed or deprecated v4/v5 props:

- **Buttons**: Use `<SButton variant="primary" | "secondary" | "outline" | "danger">` (never AntD `type="primary"`).
- **Semantic Slots**: Style internal sub-elements using AntD v6 `classNames` and `styles` props (e.g., `styles={{ body: ..., header: ... }}`) rather than brittle deep descendant selectors.
- **Filled Controls**: Use `variant="filled"` / `variant="outlined"` instead of `bordered={false}`.
- **Overlay Sizing & Destruction**:
  - `Drawer`: use `size` (NOT `width`).
  - `Modal` / `Drawer`: use `destroyOnHidden` (NOT `destroyOnClose` or `visible`).
  - Popups (`Dropdown`, `Select`, `Tooltip`, `Popover`): use `styles={{ popup: { root: ... } }}` or `classNames={{ popup: { root: ... } }}` instead of `dropdownStyle`, `overlayStyle`, `popupClassName`, `overlayClassName`, `dropdownClassName`.
- **Imperative Feedback (`App.useApp()`)**:
  - Consume `{ message, notification, modal }` from `App.useApp()` (or `useOmadaFeedback` / `useOmadaNotification` / `useOmadaConfirm`) so overlays inherit dynamic Light/Dark tokens and scoped containers.
- **Pagination & Form**: Do NOT pass `size="default"` to `Pagination`; use `labelAlign="start" | "end"` on `Form` (NOT `'left' | 'right'`).
- **Refs (React 19)**: Ensure interactive trigger and input wrappers forward `ref` cleanly (`React.forwardRef` or React 19 `ref` prop) for `<Tooltip>` / `<Dropdown>` / `<Popover>` composition.

---

## 4. Design Tokens, Layout Clearance & Dark Mode

- **Single Source of Truth**:
  - Use `--omada-*` CSS custom properties (`src/styles/tokens.css`) and `omadaSemanticTokens` / `useOmadaTheme()` (`src/omada/theme/tokens.ts`, `OmadaProvider.tsx`).
  - **NEVER** hardcode hex colors (e.g., `#FFFFFF`, `#2B2B2B`, `#00A870`) in component TSX or module CSS:
    - Brand: `--omada-brand`, `--omada-brand-hover`, `--omada-brand-active`, `--omada-brand-text`, `--omada-brand-bg-subtle`, `--omada-brand-bg-subtlest`
    - Text: `--omada-text-primary`, `--omada-text-secondary`, `--omada-text-tertiary`, `--omada-text-disabled`, `--omada-text-inverse`
    - Surfaces: `--omada-bg-page`, `--omada-bg-surface`, `--omada-bg-field`, `--omada-bg-field-hover`, `--omada-bg-overlay`, `--omada-bg-popover`
    - Borders & Shadows: `--omada-border-divider`, `--omada-border-focus`, `--omada-shadow-dropdown`, `--omada-shadow-popover`, `--omada-shadow-drawer`
    - Status: `--omada-color-success`, `--omada-color-warning`, `--omada-color-error`, `--omada-color-info` (plus `*-bg`)
- **Quick-Drawer `<||` Clearance (`44px` / `pr-9`)**:
  - `<SEmulatorShell>` renders a fixed `36px` `<||` quick-drawer handle on the right edge. Top-level content wrappers inside `<SEmulatorShell>` MUST reserve right clearance (`style={{ padding: '20px 44px 24px 24px' }}` or `clearQuickDrawer={true}` on `SFilterTableBlock` / `SSettingsPageShell`), and MUST NEVER override `className="pr-9"` with inline shorthand `style={{ padding: 20 }}`.
- **Dark Mode & Cascade Layering**:
  - Every component and showcase section MUST render legibly in both `light` and `dark` modes.
  - Custom AntD overrides in `src/styles/modules/<group>.css` MUST be wrapped inside `@layer components { ... }`.

---

## 5. Official Figma Asset Components

Reuse bundled Figma assets exported via `@chenyqthu/omada-ui-kit/assets` (or `@/omada`) instead of drawing ad-hoc SVGs or guessing URLs:

- `<SIcon name="..." size={16} />` — `590` Figma SVG icons across `16` categories (`currentColor` adaptive)
- `<SIllustration name="..." width={180} />` — `122` Light/Dark auto-switching illustrations (including `<SEmpty />` default `'no-data'`)
- `<SClientIcon name="..." size={24} />` — `217` Light/Dark client/OS/vendor icons
- `<SProductImage name="..." size={36} />` — `83` Light/Dark hardware gateway/switch/EAP/camera thumbnails
- `<SBrandAsset name="..." />` — `47` Omada brand, Pro, and OAuth SVGs

Use `lucide-react` only when an icon concept does not exist in `OMADA_ICONS`.

---

## 6. Conflict-Free Multi-Agent / Swarm File Ownership

When running parallel subagents or swarm workers in isolated `share` workspaces, each worker **ONLY creates or edits its assigned group files**:

| Owned Artifact | Path Pattern | Notes |
|---|---|---|
| Components | `src/omada/components/S<Name>.tsx` | Only the component(s) explicitly assigned to the worker |
| Module Barrel | `src/omada/modules/<group>.ts` | Export all public components & TypeScript prop/option types for `<group>` |
| Group CSS (optional) | `src/styles/modules/<group>.css` | Wrap AntD overrides inside `@layer components` |
| Group Showcase | `src/showcase/sections/<Group>Section.tsx` | Interactive showcase section demonstrating all states & variants |
| Group Tests | `src/tests/<group>.test.tsx` | Vitest + Testing Library suite covering behavior, a11y, and `agentId` registration |

Shared coordination files (`src/omada/index.ts`, `src/lib/*.ts`, `src/showcase/ShowcaseApp.tsx`, `src/styles/tokens.css`, `package.json`, `scripts/generate-catalog.mjs`, `COMPONENTS.md`) are owned exclusively by the Coordinator to guarantee conflict-free merges.

---

## 7. Definition of Done (DoD)

Every component, template, or release change MUST satisfy all gates with exit code `0`:

1. **Typed API + Catalog Sync**: Clean `S<Name>Props` + `agentId` support (where interactive), synced via `pnpm build:lib && pnpm sync:local-skill` with zero `COMPONENTS.md` or `.agents/skills/` drift.
2. **Typecheck & Behavioral Unit Tests**: `pnpm typecheck && pnpm test`.
3. **Agent Readiness & Live `--render` WCAG Gate**: `pnpm test:agent-eval` and `node skills/omada-ui-kit/scripts/verify-demo.mjs --render <targets>`.
4. **3-Task Headless Chrome Benchmark**: `pnpm test:agent-bench` verifying Browser DOM vs. WebMCP Bridge parity and `[REDACTED]` secret safety.
