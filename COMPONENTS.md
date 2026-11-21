# Omada UI Kit — Component Catalog & PRD Demo Guide

All components, hooks, theme utilities, design tokens, and standard Ant Design 5 primitives are exported from **`@/omada`**.

```tsx
import {
  OmadaProvider,
  useOmadaTheme,
  SAppShell,
  SPageHeader,
  SButton,
  STable,
  SDrawer,
  SForm,
  SFormItem,
  SIpInput,
  SMacInput,
  SPortPanel,
  SChart,
  useOmadaFeedback,
  useOmadaConfirm,
  Select,
  Switch,
} from '@/omada';
```

---

## 1. Theme & CSS Variable Cheatsheet

- **Provider**: Wrap root with `<OmadaProvider defaultThemeMode="light">` (already wired in `src/App.tsx`).
- **Runtime hook**: `const { themeMode, resolvedTheme, tokens, setThemeMode } = useOmadaTheme();`
  - `themeMode`: `'light' | 'dark' | 'system'` (persists to `localStorage['omada-theme-mode']`)
  - `resolvedTheme`: `'light' | 'dark'`
  - Syncs `data-theme="light|dark"` and `.dark` class on `<html>`.
- **Key CSS Variables (`src/styles/tokens.css`)**:
  - Brand: `--omada-brand` (`#00A870` light / `#008055` dark), `--omada-brand-hover`, `--omada-brand-text`, `--omada-brand-bg-subtle`
  - Top Bar: `--omada-topbar-bg` (`linear-gradient(90deg, #038069 0%, #026E64 100%)`), `--omada-topbar-text`
  - Surfaces: `--omada-bg-page`, `--omada-bg-surface`, `--omada-bg-sidebar`, `--omada-bg-field`, `--omada-bg-overlay`, `--omada-bg-table-header`
  - Text: `--omada-text-primary`, `--omada-text-secondary`, `--omada-text-tertiary`
  - Borders: `--omada-border-divider`, `--omada-border-strong`, `--omada-border-focus`
  - Status: `--omada-color-success`, `--omada-color-error`, `--omada-color-warning`, `--omada-color-info`, `--omada-color-magenta`, `--omada-color-purple`

---

## 2. Component Reference

| Component / Hook | Purpose | Key Props / API |
|---|---|---|
| `SAppShell` | Omada v6.3 shell (`56px` Top Bar + `216px`/`52px` Sidebar) | `navGroups`, `activeKey`, `onSelect`, `sites`, `activeSite`, `onSiteChange`, `userName`, `notificationCount`, `topBarExtra` |
| `SPageHeader` | Standard page header with optional Back, Tabs, and Actions | `title`, `description`, `onBack`, `tabs`, `extra` |
| `OmadaLogo` | Official Omada SVG wordmark (`currentColor`) | `height` (default `28`) |
| `SDeviceIcon` | Semantic device type icon badge | `type`: `'gateway' \| 'switch' \| 'ap' \| 'olt' \| 'ipc' \| 'nvr' \| 'client'`, `size` |
| `SButton` | Omada button variants | `variant`: `'primary' \| 'secondary' \| 'outline' \| 'dashed' \| 'text' \| 'link' \| 'danger' \| 'danger-outline'`, `size`: `'small' \| 'middle' \| 'large'` |
| `SInput` | Filled text input (`#F4F4F4` / `#272727`) | AntD `InputProps` (`variant` defaults to `'filled'`) |
| `SSearchInput` | Search box (`260px` default width, leading icon, clearable) | `width`, AntD `InputProps` |
| `SPasswordInput` | Filled password input with strength bar | `showStrength`, AntD `PasswordProps` |
| `SNumberInput` / `STextArea` | Filled numeric & multiline inputs | AntD `InputNumberProps` / `TextAreaProps` |
| `SIpInput` | 4-octet IPv4 / CIDR / IP:Port segmented input with paste & clamping | `mode`: `'ip' \| 'cidr' \| 'port'`, `value`, `onChange`, `status`, `size`: `'middle' \| 'large'`, `disabled` |
| `SMacInput` | 6-pair hex MAC input (auto-uppercase, paste, `-` or `:`) | `separator`: `'-' \| ':'`, `value`, `onChange`, `status`, `size`, `disabled` |
| `SForm` | Horizontal Omada form (`200px` label, `colon={false}`) | AntD `FormProps`; exposes `.useForm`, `.useWatch`, `.List` |
| `SFormItem` | Form row item with `350px` default field cap | `label`, `name`, `rules`, `tooltip`, `optional`, `fieldWidth` (`number \| 'full'`), `hint` |
| `SFormSection` | Collapsible form section header + divider | `title`, `description`, `collapsible`, `defaultOpen`, `extra` |
| `SFormFooter` | `56px` sticky bottom Apply/Cancel bar | `onApply`, `onCancel`, `applyText`, `cancelText`, `loading`, `align`, `sticky` |
| `SCard` | Surface card with hairline border & `8px` radius | `title`, `subtitle`, `extra`, `padding`: `'none' \| 'sm' \| 'md' \| 'lg'` |
| `SKpiCard` | KPI metric card with tabular numbers & optional click filter | `title`, `value`, `icon`, `meta`, `accentColor`, `active`, `onClick` |
| `STabs` | Omada Tabs (`line`, `capsule`, `segment`) | `variant`: `'line' \| 'capsule' \| 'segment'`, `pill`, `items` (`{ key, label, icon, dotColor, disabled, children }`), `activeKey`, `onChange` |
| `STag` / `SCustomTag` | Semantic status tag (`20px`) & closable multi-select tag (`24px`) | `color`: `'green' \| 'orange' \| 'blue' \| 'red' \| 'magenta' \| 'purple' \| 'grey'`, `variant`: `'subtle' \| 'solid'` |
| `SDeviceStatus` | Device connectivity indicator with status dot | `status`: `'connected' \| 'disconnected' \| 'heartbeat-missed' \| 'adopt-failed' \| 'pending' \| 'provisioning' \| 'isolated'`, `label` |
| `STable<T>` | Data table + integrated toolbar + Omada pagination bar | `toolbar` (`tabs`, `searchValue`, `onSearchChange`, `filters`, `actions`, `selectedCount`, `batchActions`), `pagination`, `rowSelection`, `columns`, `dataSource` |
| `SModal` | Omada modal (`confirm`: 540px, `default`: 640px, `form`: 880px) | `size`, `danger`, standard AntD `ModalProps` |
| `useOmadaConfirm` | Theme-aware confirmation presets | `{ confirm, confirmDanger, confirmLeave }` |
| `SDrawer` | Slide-over drawer (`sm`: 480px, `md`: 640px, `lg`: 880px) | `size`, `title`, `subtitle`, `statusSlot`, `headerTabs`, AntD `DrawerProps` |
| `SAlert` | Borderless 12%-tinted banner alert | `type`: `'success' \| 'error' \| 'warning' \| 'info'`, `title`, `description`, `closable`, `action`, `align` |
| `useOmadaFeedback` | Theme-aware `toast` & `notify` hooks | `{ toast: { success, error, warning, info, loading }, notify: { success, error, warning, info } }` |
| `SPortPanel` | Physical Switch/Gateway port matrix (11 speed colors) | `ports`, `size`: `'sm' \| 'lg'`, `layout`: `'double-row' \| 'single-row'`, `selectable`, `selectedIds`, `onSelectChange`, `showLegend` |
| `SChart` | ECharts 5 wrapper synced with Omada palette & theme | `option` (`EChartsOption`), `height` (default `260`) |
| `SEmpty` | Dashed empty-state block | `title`, `description`, `icon`, `action` |

### Pure Validators & Helpers
- `parseIpValue(raw, mode)`, `validateIpv4(ip)`, `validateCidr(cidr)`
- `normalizeMac(raw, separator)`, `validateMac(mac)`

---

## 3. Adding a New PRD Demo

1. Create a folder under `src/demos/<prd-slug>/`, e.g.:
   - `src/demos/vlan-wizard/VlanWizardDemo.tsx`
2. Import all UI blocks and hooks from `@/omada`:
   ```tsx
   import { SPageHeader, STable, SButton, SDrawer, SForm, SFormItem, SIpInput, useOmadaFeedback } from '@/omada';
   ```
3. Register the route inside `NAV_GROUPS` in `src/showcase/ShowcaseApp.tsx` (under the `Demo Workspace` group) and render `<VlanWizardDemo />` when `activeKey === 'vlan-wizard'`.
4. Run `pnpm typecheck && pnpm test && pnpm build` to verify before sharing.
