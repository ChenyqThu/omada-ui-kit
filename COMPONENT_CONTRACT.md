# Omada UI Kit — Component Contract (Phase 1 Swarm)

All Phase 1 Swarm workers MUST follow this contract so components integrate seamlessly, respect Light/Dark theming, use Ant Design 6 APIs, and merge without git conflicts.

---

## 1. Runtime & Toolchain Stack

- **Framework**: React `19.3` + TypeScript (`strict`, checked via `tsc --noEmit -p tsconfig.app.json`)
- **UI Primitive Base**: Ant Design `6.7` + `@ant-design/cssinjs` (`<StyleProvider layer>` in `src/omada/theme/OmadaProvider.tsx`)
- **Styling**: Tailwind CSS v4 with explicit cascade layers in `src/styles/tokens.css`:
  ```css
  @layer theme, base, antd, components, utilities;
  ```
- **Charts & Tests**: ECharts `5.6`, Vitest `5.1` (`jsdom` + `@testing-library/react`), `pnpm`

---

## 2. Ant Design v6 API Rules

Use Ant Design v6 APIs exclusively; never rely on removed or deprecated v5 props:

- **Semantic Slots**: Style internal sub-elements using AntD v6 `classNames` and `styles` props (e.g., `styles={{ body: ..., header: ... }}`) rather than brittle deep descendant selectors where semantic props exist.
- **Filled Controls**: Use `variant="filled"` / `variant="outlined"` instead of `bordered={false}`.
- **Overlay Sizing & Destruction**:
  - `Drawer`: use `size` (NOT `width`).
  - `Modal` / `Drawer`: use `destroyOnHidden` (NOT `destroyOnClose`).
  - Popups (`Dropdown`, `Select`, `Tooltip`, `Popover`): use `styles={{ popup: { root: ... } }}` or `classNames={{ popup: { root: ... } }}` instead of `dropdownStyle`, `overlayStyle`, `popupClassName` where replaced in v6.
- **Imperative Feedback (`App.useApp()`)**:
  - Use `notification[level]({ title, description })` (NOT `message`).
  - Consume `{ message, notification, modal }` from `App.useApp()` so overlays inherit dynamic Light/Dark tokens.
- **Pagination**: Do NOT pass `size="default"` (`Pagination` `size` accepts `'small' | 'medium' | 'large'` or omit for default).
- **Form**: Use `labelAlign="start" | "end"` (NOT `'left' | 'right'`, which AntD 6 warns as deprecated).
- **Refs (React 19)**: React 19 passes `ref` directly as a prop (`React.Ref<...>`), or `React.forwardRef` remains compatible; ensure interactive trigger wrappers (buttons, custom triggers) accept refs cleanly for `<Tooltip>` / `<Dropdown>` / `<Popover>`.

---

## 3. Design Tokens, CSS Cascade & Dark Mode

- **Single Source of Truth**:
  - Use `--omada-*` CSS custom properties (`src/styles/tokens.css`) and `omadaSemanticTokens` / `useOmadaTheme()` (`src/omada/theme/tokens.ts`, `OmadaProvider.tsx`).
  - **NEVER** hardcode hex colors (e.g., `#FFFFFF`, `#2B2B2B`, `#00A870`) in component TSX or module CSS. Key tokens:
    - Brand: `--omada-brand`, `--omada-brand-hover`, `--omada-brand-active`, `--omada-brand-text`, `--omada-brand-bg-subtle`, `--omada-brand-bg-subtlest`
    - Text: `--omada-text-primary`, `--omada-text-secondary`, `--omada-text-tertiary`, `--omada-text-disabled`, `--omada-text-inverse`
    - Surfaces: `--omada-bg-page`, `--omada-bg-surface`, `--omada-bg-field`, `--omada-bg-field-hover`, `--omada-bg-overlay`, `--omada-bg-popover`
    - Borders & Shadows: `--omada-border-divider`, `--omada-border-focus`, `--omada-shadow-dropdown`, `--omada-shadow-popover`, `--omada-shadow-drawer`
    - Status: `--omada-color-success`, `--omada-color-warning`, `--omada-color-error`, `--omada-color-info` (plus `*-bg`)
- **Dark Mode**:
  - Every component and showcase section MUST render legibly in both `light` (`[data-theme="light"]`) and `dark` (`[data-theme="dark"]` / `.dark`).
- **Cascade Layering**:
  - Any custom AntD component overrides in `src/styles/modules/<group>.css` MUST be wrapped inside `@layer components { ... }` so Tailwind utility classes (`@layer utilities`) still override cleanly.
- **Warning on WIP Figma Variable Collections**:
  - Do NOT import raw variables from Figma's WIP `Color` / `Size` / `Z Index?` collections (they contain placeholder values). Always bind to `--omada-*` and `omadaSemanticTokens`.

---

## 4. Official Figma Asset Components

Reuse bundled Figma assets exported via `@/omada` instead of drawing ad-hoc SVGs or guessing URLs:

- `<SIcon name="..." size={16} />` — 586 Figma SVG icons (`Monochrome` inherits `currentColor`)
- `<SIllustration name="..." width={180} />` — 199 Light/Dark auto-switching illustrations (including `<SEmpty />` default `'no-data'`)
- `<SClientIcon name="..." size={24} />` — 99 Light/Dark client/OS/vendor icons
- `<SProductImage name="..." size={36} />` — 105 Light/Dark hardware product thumbnails
- `<SBrandAsset name="..." />` — 9 Omada brand/logo/OAuth assets

Use `lucide-react` only if an icon concept does not exist in `OMADA_ICONS`.

---

## 5. Conflict-Free Swarm File Ownership

Every Phase 1 worker operates in its own `share` workspace and **ONLY creates or edits its assigned group files**:

| Owned Artifact | Path Pattern | Notes |
|---|---|---|
| Components | `src/omada/components/S<Name>.tsx` | Only the component(s) explicitly assigned to your worker |
| Module Barrel | `src/omada/modules/<group>.ts` | Export all public components & TypeScript prop/option types for `<group>` |
| Group CSS (optional) | `src/styles/modules/<group>.css` | Only if AntD overrides are needed beyond inline/Tailwind styles; wrap in `@layer components` |
| Group Showcase | `src/showcase/sections/<Group>Section.tsx` | Standalone interactive showcase section demonstrating all states & variants |
| Group Tests | `src/tests/<group>.test.tsx` | Vitest + Testing Library suite covering your components |

### Forbidden Shared Files (Coordinator-Only)
Workers MUST **NOT** modify these shared files:
- `src/omada/index.ts`
- `src/showcase/ShowcaseApp.tsx`
- `src/styles/tokens.css`
- `src/styles/omada-antd-overrides.css`
- `src/omada/theme/antdTheme.ts`
- `src/omada/theme/tokens.ts`
- `src/omada/theme/OmadaProvider.tsx`
- `package.json` / `pnpm-lock.yaml` / `vite.config.ts` / `tsconfig*.json`

Inside your module barrel (`src/omada/modules/<group>.ts`), group showcase, and group tests, import existing Omada primitives (`OmadaProvider`, `SCard`, `SButton`, `SIcon`, etc.) directly from relative paths or `@/omada`. The Coordinator merges every worker branch and wires `src/omada/modules/<group>.ts`, `src/styles/modules/<group>.css`, and `src/showcase/sections/<Group>Section.tsx` into `src/omada/index.ts`, `src/main.tsx`/`tokens.css`, and `ShowcaseApp.tsx`.

---

## 6. Definition of Done (DoD)

Before reporting completion on the swarm board, every worker MUST complete all of the following:

1. **Figma Spec Verification**: Inspect your assigned Figma pages in `fileKey: "SyfBt3OSEZAPm2U38yLGBR"` using `get_screenshot` / `get_design_context` to match Omada spacing, radii, heights, variants, and states.
2. **Typed & Documented API**: Export clean TypeScript prop interfaces (`S<Name>Props`) with JSDoc docstrings matching existing `src/omada/components/S*.tsx` style.
3. **Unit Tests**: Write meaningful behavioral tests in `src/tests/<group>.test.tsx` (wrap themed components in `<OmadaProvider>`).
4. **Full Verification Gate**: Run and verify exit code `0`:
   ```bash
   pnpm typecheck && pnpm test && pnpm build
   ```
5. **Visual Light + Dark Check**: Capture rendered screenshots of your `<Group>Section` in **both Light and Dark modes** compared against Figma screenshots, fix any contrast or layout defects, and include your verification line (`Screenshot: <abs path> | <summary>` when applicable).
