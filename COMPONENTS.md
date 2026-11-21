# Omada UI Kit — Complete Component & Asset Catalog (Ant Design 6 + React 19)

All components, hooks, asset helpers, theme utilities, design tokens, and standard Ant Design 6 primitives are barrel-exported from **`@/omada`**.

- **Stack**: React `19.3.1` · TypeScript `5.9` · Ant Design `6.7.1` · `@ant-design/cssinjs` (`2.2.0`) · Tailwind CSS v4 · ECharts `5.6` · `@fontsource/manrope` (`5.3.0`)
- **Theming**: Full **Light / Dark / System** theme switching via `<OmadaProvider>` + `--omada-*` CSS variables

```tsx
import {
  OmadaProvider,
  useOmadaTheme,
  SAppShell,
  SPageHeader,
  SIcon,
  SIllustration,
  SProductImage,
  SButton,
  STable,
  SLineChart,
  STileGroup,
  SSelect,
  SSchedule,
  SModal,
  SStepModal,
  SDrawer,
  useOmadaFeedback,
  useOmadaNotification,
  useOmadaConfirm,
} from '@/omada';
```

---

## 1. Theme & Design Token Cheatsheet

- **Provider**: Wrap root with `<OmadaProvider defaultThemeMode="light">` (already wired in `src/App.tsx`).
- **Runtime hook**: `const { themeMode, resolvedTheme, tokens, setThemeMode } = useOmadaTheme();`
  - `themeMode`: `'light' | 'dark' | 'system'` (persists to `localStorage['omada-theme-mode']`)
  - `resolvedTheme`: `'light' | 'dark'` (syncs `data-theme="light|dark"` and `.dark` class on `<html>`)
- **Key CSS Variables (`src/styles/tokens.css`)**:
  - Brand: `--omada-brand` (`#00A870` light / `#008055` dark), `--omada-brand-hover`, `--omada-brand-active`, `--omada-brand-text`, `--omada-brand-bg-subtle`, `--omada-brand-bg-subtlest`
  - Top Bar: `--omada-topbar-bg` (`linear-gradient(90deg, #038069 0%, #026E64 100%)`), `--omada-topbar-text`
  - Surfaces: `--omada-bg-page`, `--omada-bg-surface`, `--omada-bg-sidebar`, `--omada-bg-field`, `--omada-bg-field-hover`, `--omada-bg-overlay`, `--omada-bg-popover`, `--omada-bg-table-header`
  - Text: `--omada-text-primary`, `--omada-text-secondary`, `--omada-text-tertiary`, `--omada-text-disabled`, `--omada-text-inverse`
  - Borders & Shadows: `--omada-border-divider`, `--omada-border-strong`, `--omada-border-focus`, `--omada-shadow-dropdown`, `--omada-shadow-popover`, `--omada-shadow-drawer`
  - Status: `--omada-color-success`, `--omada-color-error`, `--omada-color-warning`, `--omada-color-warning-minor`, `--omada-color-info`, `--omada-color-magenta`, `--omada-color-purple` (plus `*-bg`)

---

## 2. Official Figma Asset Library (`998` Files)

All official Figma icons, illustrations, client badges, product thumbnails, and brand marks are bundled in `src/assets/` and exposed via typed components:

| Component / Manifest | Count | Purpose & Theme Behavior | Key Props / API |
|---|---|---|---|
| `SIcon` / `OMADA_ICONS` | `586` SVGs (`16` categories) | Inline SVG icons; monochrome & duotone outlines adapt via `currentColor` while preserving `#00A870` green accents | `name: OmadaIconName`, `size`, `color`, `title` |
| `SIllustration` / `OMADA_ILLUSTRATIONS` | `199` (`101` Light + `98` Dark) | Auto-switches Light/Dark illustrations (`no-data`, `no-devices`, `no-clients`, etc.) | `name: OmadaIllustrationName`, `width`, `height`, `theme?: 'light' \| 'dark' \| 'auto'` |
| `SClientIcon` / `OMADA_CLIENTS` | `99` (`42` Light + `57` Dark) | Client OS, device & vendor badges (`apple`, `android-phone`, `macbook`, etc.) | `name: OmadaClientIconName`, `size`, `theme`, `fallback` |
| `SProductImage` / `OMADA_PRODUCTS` | `105` (`80` Light + `25` Dark) | Hardware gateway, switch, EAP, NVR & camera product thumbnails (`er8411`, `eap650`, `sg3452p-un-3-40`, etc.) | `name: OmadaProductName`, `size`, `theme`, `alt`, `fallback` |
| `SBrandAsset` / `OMADA_BRAND_ASSETS` | `9` assets | Official Omada / Pro logos & WeChat OAuth pills | `name: OmadaBrandAssetName`, `width`, `height`, `theme` |
| `OmadaLogo` / `SDeviceIcon` | `2` core helpers | Top Bar wordmark SVG + semantic device icon badge fallback | `height` / `type: 'gateway' \| 'switch' \| 'ap' \| 'olt' \| 'ipc' \| 'nvr' \| 'client'`, `size` |

Lookup guards: `hasOmadaIcon(name)`, `hasOmadaIllustration(name)`, `hasOmadaProductImage(name)`, and category filter constant `OMADA_ICON_CATEGORIES`.

---

## 3. Component Reference (`81` Visual Components + `4` Hooks)

### Layout & Navigation (`nav-shell`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SAppShell` | `56px` Top Bar + `216px`/`52px` collapsible Sidebar with nested Level-2 submenus | `navGroups`, `activeKey`, `onSelect`, `edition?: 'standard' \| 'pro' \| 'msp'`, `shellVariant?: 'controller' \| 'central' \| 'portal' \| 'account'`, `sites`, `activeSite`, `topNavItems`, `services` |
| `SPageHeader` | Standard page header with optional Back, Tabs & Actions | `title`, `description`, `onBack`, `tabs`, `extra` |
| `SDropdown` | Action, searchable, grouped, checkable & multi-level dropdown menu | `items: SDropdownItem[]`, `widthPreset?: 'compact' \| 'medium' \| 'wide'`, `searchable`, `selectable`, `selectedKeys`, `header`, `footer` |
| `SPagination` | Omada pagination bar (`default`, `simple`, `minimal` without `size="default"`) | `variant?: 'default' \| 'simple' \| 'minimal'`, `total`, `current`, `pageSize`, `showTotalRecord`, `onChange` |
| `SSteps` | Horizontal/vertical wizard steps (`130px` H / `96px` V connector) | `items: SStepItem[]`, `current`, `orientation`, `type`, `loading`, `status` |
| `SBreadcrumb` | Text, icon-only, `...` dropdown collapse (`maxItems`) & overflow tooltip | `items: SBreadcrumbItem[]`, `separatorVariant`, `maxItems`, `maxItemWidth` |
| `SAnchor` | Right-rail TOC anchor (single, titled, multi-level, vertical/horizontal) | `items: SAnchorItem[]`, `direction`, `title` |
| `SDivider` | `1px` hairline divider (`solid`/`dashed`/`dotted`, titled, inset `24px`, vertical) | `variant`, `orientation`, `titlePlacement`, `inset`, `children` |

### Inputs & Forms (`inputs`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SButton` | 8 button variants (`32px` default, `40px` large) with ref forwarding | `variant`: `'primary' \| 'secondary' \| 'outline' \| 'dashed' \| 'text' \| 'link' \| 'danger' \| 'danger-outline'`, `size` |
| `SInput` / `SNumberInput` / `STextArea` | Filled inputs (`#F4F4F4` Light / `#272727` Dark) | Standard AntD 6 props (`variant` defaults to `'filled'`) |
| `SSearchInput` | Search box (`260px` default, clearable) | `width`, AntD `InputProps` |
| `SPasswordInput` | Filled password input with 4-bar strength meter + live rule checklist | `showStrength`, `showRules`, `rules?: PasswordRuleConfig[]` (`DEFAULT_PASSWORD_RULES`) |
| `SIpInput` | Segmented IPv4 / CIDR / IP:Port input with paste & octet clamping | `mode`: `'ip' \| 'cidr' \| 'port'`, `value`, `onChange`, `status`, `size` |
| `SMacInput` | 6-pair hex MAC input (auto-uppercase, paste, `-` or `:`) | `separator`: `'-' \| ':'`, `value`, `onChange`, `status`, `size` |
| `SForm` | Horizontal Omada form (`200px` label, `labelAlign="start"`, `colon={false}`) | AntD 6 `FormProps`; exposes `.useForm`, `.useWatch`, `.List` |
| `SFormItem` | Form row item with `350px` default field cap, tooltip & `(Optional)` badge | `label`, `name`, `rules`, `tooltip`, `optional`, `fieldWidth`, `hint` |
| `SFormSection` / `SFormFooter` | Collapsible form section divider & `56px` sticky Apply/Cancel action bar | `title`, `collapsible`, `onApply`, `onCancel`, `sticky`, `align` |

### Selectors, Toggles & Sliders (`select-inputs`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SSelect` | Filled Select (8 visible items, single/multiple/`tags`, `SCustomTag`, sticky `Add New` footer) | `options: SSelectOption[]`, `showSearch`, `addNewLabel`, `onAddNew` |
| `SCascader` | Filled multi-level hierarchical Cascader (single & multiple) | `options: SCascaderOption[]`, `multiple`, `displaySeparator` |
| `STreeSelect` | Filled 2–3 level tree selector (`treeCheckable` + popup filter bar) | `treeData: STreeSelectNode[]`, `treeCheckable`, `popupSearch` |
| `SCheckbox` / `SCheckboxGroup` | Checkboxes with `description`, `showSelectAll` (`indeterminate`), `itemWidth`, & `variant="button"` | `variant?: 'default' \| 'button'`, `showSelectAll`, `itemWidth`, `options` |
| `SRadio` / `SRadioGroup` | Radio controls (`default`, linear `button`, segmented `capsule` + `pill`) | `variant?: 'default' \| 'button' \| 'capsule'`, `pill`, `direction`, `options` |
| `SSwitch` | Exact `36×22` medium / `28×16` small pill switch with optional inline/stacked label | `label`, `description`, `labelLayout`, `size` |
| `SSlider` | `3px` track + `18px` thumb, blur-clamped numeric `showInput`, `range`, stepped marks & gradients | `range`, `showInput`, `unit`, `stepPreset`, `segmented`, `handleVariant`, `preset?: 'default' \| 'color-temp' \| 'hue' \| 'brightness' \| 'saturation'` |
| `SColorPicker` | `32px` filled color trigger (`171px` min width) + curated Omada brand/chart palette presets | `presets`, `showText`, `status`, AntD `ColorPickerProps` |

### Time, Transfer, Upload & Schedule (`time-schedule`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SDatePicker` / `SRangePicker` | Filled DatePicker & RangePicker, plus dashboard `capsule` mode (`1D · 1W · 1M` + Custom) | `mode`: `'default' \| 'capsule'`, `capsulePresets`, `quickPresets`, `value`, `onChange` |
| `STimePicker` / `STimeRangePicker` | Filled 24h / 12h time selector (`350×32` / `165×32` range, `240×280` popup) | `use12Hours`, `format`, `status`, AntD `TimePickerProps` |
| `STransfer` | Dual `240×368px` Transfer with search, pagination, icons, `<SEmpty>` & `grouped` 2-level tree mode | `dataSource`, `targetKeys`, `searchable`, `paginated`, `grouped` |
| `SUpload` | Button (`Download Template`) & drag-drop `dragger` with `firmware`/`config`/`image` validation | `variant?: 'button' \| 'dragger'`, `preset?: 'firmware' \| 'config' \| 'image'`, `maxSizeMB`, `templateHref` |
| `SSchedule` | Custom 7×24h (`Mon`–`Sun` × `00`–`23`) weekly schedule matrix with click/pointer-drag paint & erase | `value: SScheduleMatrix`, `onChange`, `presets`, `readOnly`, `disabled`, `showPresets`, `showSummary` |

### Data Display, Tables & Charts (`data-charts`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SCard` / `SKpiCard` | Hairline `8px` card + tabular KPI card with optional click filter | `title`, `subtitle`, `extra`, `padding` / `value`, `meta`, `accentColor`, `active` |
| `STabs` | Omada Tabs (`line` underline, `capsule` / `pill`, `segment`) | `variant`: `'line' \| 'capsule' \| 'segment'`, `pill`, `items`, `activeKey`, `onChange` |
| `STag` / `SCustomTag` | Semantic status pill (`20px`) & closable multi-select chip (`24px`) | `color`, `variant?: 'subtle' \| 'solid'`, `closable` |
| `SDeviceStatus` | 7-state controller device connectivity indicator | `status`, `label` |
| `SPortPanel` | Switch/Gateway RJ45/SFP/WAN/LAN port matrix (`11` speed colors, PoE/Uplink badges) | `ports`, `size?: 'sm' \| 'lg'`, `layout?: 'double-row' \| 'single-row'`, `selectable` |
| `STable<T>` / `SEditableCell` | Data table with toolbar, `filters`, `columnSettings`, `densityToggle`, expandable rows & inline `28px` editor | `toolbar`, `columnSettings`, `densityToggle`, `expandable`, `rowSelection` |
| `SChart` | ECharts 5 theme-synced canvas wrapper with loading skeleton & `<SEmpty>` | `option`, `height`, `loading`, `empty` |
| `SLineChart` / `SBarChart` | 5-tick default & 6-tick `%` area/line & vertical/stacked/horizontal bar presets (`containLabel: true`) | `xData` / `categories`, `series`, `percentage`, `yUnit` / `unit`, `stacked`, `layout` |
| `SDonutChart` / `SSparkChart` | Ring donut with center KPI overlay & compact 2-tick (`min`/`max`) sparkline widget | `data`, `centerValue`, `centerLabel` / `variant?: 'area' \| 'line' \| 'bar'`, `showAxisTicks` |
| `SDescriptions` | Read-only key/value tables (`bordered`/`filled`/`borderless`, `200px` label, `mono` support) | `items: SDescriptionItem[]`, `variant`, `layout`, `column`, `labelWidth` |
| `SCollapse` | Accordion panels (`default`/`card`/`ghost`) with right status/subtitle slot | `items: SCollapseItem[]`, `variant`, `accordion` |
| `STile` / `STileGroup` | Single & multi-select option cards (`Normal`/`Hover`/`Selected` checkmark/`Disabled`) | `mode?: 'single' \| 'multiple'`, `layout`, `columns`, `options`, `value`, `onChange` |
| `SAvatar` / `SAvatarGroup` | `20`/`32`/`48px` user avatar (image/initial/guest + status dot) & overflow stack | `size`, `name`, `guest`, `status`, `maxCount` |
| `SBadge` / `SRate` | Capsule counts (`20px`, `99+`), status dots & 5-star rating (`12`/`20`/`32px`, half-star) | `count`, `dot`, `status`, `tone` / `size`, `allowHalf`, `showCaption`, `readonly` |

### Feedback, Overlays & Loading (`feedback-overlays`)
| Component / Hook | Purpose | Key Props / API |
|---|---|---|
| `SModal` / `useOmadaConfirm` | Dialog presets (`sm`: 480, `confirm`: 540, `default`: 640, `centered`: 764, `form`: 880, `xl`: 1040) | `size`, `danger`, `subtitle`, `icon`, `destroyOnHidden` |
| `SInfoDialog` / `SStepModal` | Status/illustration result dialog & multi-step wizard modal (`Back`/`Next`/`Finish`) | `status`, `illustration`, `steps`, `currentStep`, `onBeforeNext`, `onFinish` |
| `SDrawer` / `SDrawerFooter` | Slide-over drawer (`sm`: 480, `md`: 640, `lg`: 880, AntD 6 `size`) with loading skeleton | `size`, `loading`, `subtitle`, `statusSlot`, `headerTabs` |
| `SAlert` / `useOmadaFeedback` | Borderless 12%-tinted banner alert & theme-aware `toast` / `notify` API | `type`, `title`, `description`, `closable`, `action` |
| `SNotification` / `useOmadaNotification` | Static preview notification banner & imperative AntD 6 `{ title, description }` notifications | `type`, `title`, `description`, `actions` |
| `SPopover` / `SPopconfirm` | Hover/click Popover & 4-combo Confirm Popover (`16px` offset) | `title`, `subtitle`, `icon`, `footer` / `description`, `okText`, `cancelText` |
| `STooltip` / `STruncatedText` | `400ms` auxiliary Tooltip & `200ms` overflow-only ellipsis text with clickable dark links | `mouseEnterDelay`, `linkText`, `linkHref` / `text`, `lines`, `maxWidth` |
| `SProgress` | `6px` linear bars & `112px` rings (`normal`, `active`, `success`, `warning`, `exception`, `indeterminate`, `budget`) | `type`, `status`, `variant?: 'default' \| 'budget' \| 'indeterminate'`, `usedLabel`, `totalLabel` |
| `SLoading` / `SSkeleton` / `SMask` | `16`/`20`/`32px` Figma conic spinners, gradient skeletons & `rgba(0,0,0,0.40)` Light/Dark mask | `size`, `description`, `fullscreen` / `preset` / `visible`, `blur`, `scope` |
| `SEmpty` | Dashed empty state defaulting to official Figma `no-data` Light/Dark illustration | `illustration?: OmadaIllustrationName \| false`, `title`, `description`, `icon`, `action` |

### Omada Controller v6.3 Emulator (`emulator-v6`)
| Component / Constant | Purpose | Key Props / API |
|---|---|---|
| `SEmulatorShell` / `EMULATOR_NAV_GROUPS` | Omada Controller v6.3.0.34 shell (`56px` Top Bar, `216px`/`52px` borderless Sidebar with 5 sections / 13 flush items, `<||` right-edge quick-drawer handle, `.omada-emulator-root` Light/Dark tokens) | `activeKey`, `onSelect`, `activeSite`, `onSiteChange`, `onRefresh`, `onOpenShowcase`, `onToggleQuickDrawer`, `collapsed`, `onCollapsedChange` |
| `SHealthGauge` / `SHealthRadar` | 180° semi-circular Network Health gauge (`0..100` ticks) & 4-axis concentric radar (`Wi-Fi`, `Client`, `WAN`, `Device`) | `score`, `maxScore`, `label`, `tooltip` / `wifi`, `client`, `wan`, `device`, `wanTooltip` |
| `SHealthTrendBar` | Multi-row 24h Network Health Trend timeline (`~96` vertical status ticks per row) | `rows: SHealthTrendRow[]`, `tickLabels` |
| `SApDistributionRuler` | `-90dBm..-30dBm` rainbow RSSI distribution ruler with clustered AP bubbles & count badges | `clusters: SApDistributionCluster[]`, `minDbm`, `maxDbm`, `step` |
| `SChannelUtilization` | `2.4 GHz`, `5 GHz`, and `6 GHz` wireless channel utilization mini-bar chart | `bands: SChannelBand[]` |
| `SDeviceHealthSummary` | 4-column Gateway / Switches / APs / OLTs health summary strip with `Good/Fair/Poor/No Data` breakdown & `200×4px` segmented bar | `items: DeviceHealthSummaryItem[]`, `onCategoryClick` |
| `SDevicePortGraphic` / `PortBadgeTile` / `PortStatusLegend` | Compact (`32px`) & full (`40px`) physical switch/gateway port matrix with floating connected-device thumbnails, SFP/PoE/Uplink/LAG badges & 10-item legend | `ports: DrawerPortItem[]`, `mode?: 'compact' \| 'full'`, `showConnectedDevices`, `showLegend`, `selectedPort`, `onSelectPort` |

### Pure Validators & Helpers
- **IP / MAC**: `parseIpValue`, `validateIpv4`, `validateCidr`, `normalizeMac`, `validateMac`
- **Date / Upload / Schedule**: `createPickerDate`, `toNativeDate`, `formatOmadaDateRange`, `validateUploadFile`, `formatFileSize`, `createEmptySchedule`, `createSchedulePreset`, `normalizeScheduleValue`, `formatSlotRange`, `formatScheduleSummary`
- **Port Slug Helper**: `resolveConnectedProductSlug`

---

## 4. Application Routes (`src/App.tsx` + `src/demos/emulator/EmulatorApp.tsx`)

| Hash Route | View | Key Interactions |
|---|---|---|
| `#/dashboard` *(default)* | `EmulatorApp` → `SiteDashboardPage` | `Overview` / `Topology` / `Wi-Fi` / `Clients` / `Traffic` tabs, `1D` / `1W` / `1M` range switcher, clickable `MainOffice_Gateway_2` opens `420px` Quick Drawer |
| `#/devices` | `EmulatorApp` → `DeviceListPage` | `Device List` / `Device Group` / `Configuration Result` sub-tabs, live filters, `2217px` horizontally scrollable table, clicking any row (e.g. `SalesDepartment_Switch_3`) opens `420px` Quick Drawer; `Manage Device` expands to `1224px` (`Ports` tab); `<||` handle reopens active drawer |
| `#/showcase` | `ShowcaseApp` | Full Component & Asset Library (`⋮` More → `Component Library` from Emulator; `← Omada Emulator` in Top Bar returns to `#/dashboard`) |

---

## 5. Generating New PRD Demos (AntD 6 + Dark Mode Rules)

1. Follow `COMPONENT_CONTRACT.md` (use AntD v6 semantic `classNames`/`styles`, `variant="filled"`, `Drawer` `size`, `Modal` `destroyOnHidden`, `Form` `labelAlign="start"`, `notification` `{ title, description }`; avoid hardcoded hex colors).
2. Create a demo module under `src/demos/<prd-slug>/`, importing all building blocks from `@/omada`:
   ```tsx
   import { SPageHeader, STable, SButton, SDrawer, SForm, SFormItem, SIpInput, SLineChart, SIcon, useOmadaFeedback } from '@/omada';
   ```
3. Register the route inside `NAV_GROUPS` in `src/showcase/ShowcaseApp.tsx` under `Demo Workspace` and render it on route match.
4. Run `pnpm typecheck && pnpm test && pnpm build` to verify before sharing.
