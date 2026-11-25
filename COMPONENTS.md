# Omada UI Kit — Complete Component & Asset Catalog (Ant Design 6 + React 19)

All components, blocks, hooks, Agent Bridge primitives, asset helpers, theme utilities, design tokens, and standard Ant Design 6 primitives are exported from **`@chenyqthu/omada-ui-kit`** (or `@/omada` inside this repository) as well as tree-shakeable ESM subpaths (`/core`, `/blocks`, `/charts`, `/emulator`, `/assets`, `/agent`).

- **Stack**: React `19.3.1` · TypeScript `5.8` · Ant Design `6.7.1` · `@ant-design/cssinjs` · Tailwind CSS v4 · ECharts `5.6` · `@fontsource/manrope`
- **Theming**: Full **Light / Dark / System** theme switching via `<OmadaProvider>` + `--omada-*` CSS variables, plus micro-frontend scoped mode (`syncDocumentTheme={false}` + `@chenyqthu/omada-ui-kit/style.scoped.css`)

```tsx
import {
  OmadaProvider,
  useOmadaTheme,
  OmadaAgentProvider,
  useOmadaAgent,
  SEmulatorShell,
  SFilterTableBlock,
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
  useRovingFocus,
} from '@chenyqthu/omada-ui-kit';
```

---

## 1. Theme, Scoped CSS & Agent Bridge Foundation

| Symbol | Kind | Purpose | Key Props / API |
|---|---|---|---|
| `OmadaProvider` | Component | Root theme, Ant Design 6 token & CSS layer provider | `defaultThemeMode`, `syncDocumentTheme`, `children` |
| `useOmadaTheme` | Hook | Reads/updates active theme mode and semantic tokens | Returns `{ themeMode, resolvedTheme, tokens, setThemeMode }` |
| `buildOmadaAntdTheme` | Helper | Builds Ant Design 6 `ThemeConfig` for Light or Dark mode | `(resolvedTheme: 'light' \| 'dark') => ThemeConfig` |
| `useRovingFocus` | Hook | Headless WAI-ARIA roving `tabIndex` keyboard primitive (`horizontal` / `vertical` / `both`, `Home` / `End`, loop, fallback `tabIndex={0}`) | `items`, `activeKey`, `onActivate`, `orientation`, `activationMode`, `loop` |
| `OmadaAgentProvider` | Component | Deterministic UI-SDK-style Agent Bridge context (`snapshot()` / `query()` / `act()` / `allow` + `[REDACTED]` secret masking) | `allow`, `exposeWindowBridge`, `children` |
| `useOmadaAgent` / `useOmadaAgentControl` / `useOmadaAgentAction` | Hooks | Accesses Agent Bridge runtime or registers custom controls/actions | `OMADA_SECRET_MASK` (`'[REDACTED]'`) |

---

## 2. Official Figma Asset Library (`1,238` Files across `1,059` Slugs)

All official Figma icons, illustrations, client badges, product thumbnails, and brand marks are bundled in `src/assets/` and exposed via typed components (`@chenyqthu/omada-ui-kit/assets`):

| Component / Manifest | Unique Slugs (Files) | Purpose & Theme Behavior | Key Props / API |
|---|---|---|---|
| `SIcon` / `OMADA_ICONS` | `590` slugs (`590` SVGs, `16` categories) | Inline SVG icons; monochrome & duotone outlines adapt via `currentColor` while preserving `#00A870` green accents | `name`, `size`, `color`, `title`, `className`, `style` |
| `SIllustration` / `OMADA_ILLUSTRATIONS` | `122` slugs (`214` Light/Dark files) | Auto-switches Light/Dark illustrations (`no-data`, `no-devices`, `no-clients`, etc.) | `name`, `width`, `height`, `theme`, `alt`, `loading`, `fallback` |
| `SClientIcon` / `OMADA_CLIENTS` | `217` slugs (`245` Light/Dark files) | Client OS, device & vendor badges (`apple`, `android-phone`, `macbook`, etc.) | `name`, `size`, `theme`, `alt`, `loading`, `fallback` |
| `SProductImage` / `OMADA_PRODUCTS` | `83` slugs (`108` Light/Dark files) | Hardware gateway, switch, EAP, NVR & camera product thumbnails (`er8411`, `eap650`, `sg3452p-un-3-40`, etc.) | `name`, `size`, `theme`, `alt`, `loading`, `fallback` |
| `SBrandAsset` / `OMADA_BRAND_ASSETS` | `47` slugs (`81` Light/Dark files) | Official Omada / Pro logos & OAuth brand pills | `name`, `width`, `height`, `theme`, `alt`, `loading`, `fallback` |
| `OmadaLogo` / `SDeviceIcon` | `2` core components | Top Bar wordmark SVG + semantic device icon badge fallback | `height`, `className` / `type`, `size` |

Lookup guards: `hasOmadaIcon(name)`, `hasOmadaIllustration(name)`, `hasOmadaProductImage(name)`, and category filter constant `OMADA_ICON_CATEGORIES`.

---

## 3. Component Reference (`114` Components + `8` Blocks + `8` Hooks)

### Reusable Page Blocks (`@chenyqthu/omada-ui-kit/blocks`)
| Component / Constant | Purpose | Key Props / API |
|---|---|---|
| `SEmulatorShell` / `EMULATOR_NAV_GROUPS` / `EMULATOR_GLOBAL_NAV_GROUPS` | Omada Controller v6.3.0.34 shell (`56px` Top Bar, `216px`/`52px` Sidebar, grouped mega-popovers, `scope="site" \| "global"`, `<||` quick-drawer handle) | `activeKey`, `onSelect`, `scope`, `extraNavItems`, `activeSite`, `onSiteChange`, `onRefresh`, `onOpenShowcase`, `onToggleQuickDrawer`, `showQuickDrawerHandle`, `collapsed`, `onCollapsedChange` |
| `SFilterTableBlock` | Controller list + underline tabs + search/filter toolbar + `<||` clearance + batch action strip + `<STable>` | `title`, `subtitle`, `tabs`, `activeTab`, `onTabChange`, `searchPlaceholder`, `searchValue`, `onSearchChange`, `filters`, `primaryAction`, `extraActions`, `selectedCount`, `batchActions`, `onClearSelection`, `tableProps`, `clearQuickDrawer`, `agentId` |
| `SInlineRuleEditorLayout` / `SInlineFormRow` | Full-pane Back + Title inline rule/profile editor with `210px` aligned rows & sticky Submit/Cancel footer | `title`, `onBack`, `onSubmit`, `onCancel`, `primaryText`, `cancelText`, `submitting`, `onHelpClick`, `footerExtra` / `label`, `tooltip`, `htmlFor` |
| `SDetailInspectorDrawer` | 2-stage expandable inspector drawer (`420px` quick view ↔ `1040px` full detail view) with status badge & tabs | `open`, `onClose`, `title`, `subtitle`, `icon`, `status`, `statusLabel`, `expandable`, `defaultWidth`, `expandedWidth`, `tabs`, `activeTab`, `onTabChange`, `headerExtra`, `footer` |
| `SMasterDetailSplitBlock` | Split `260px` vertical `listbox` master rail (with `useRovingFocus`) + detail pane | `masterTitle`, `masterExtra`, `items`, `activeKey`, `onSelect`, `searchable`, `searchPlaceholder`, `masterWidth`, `detailTitle`, `detailExtra`, `emptyDetail` |
| `SWizardModal` | Stepped modal wizard with `SSteps` header, step guard & Back/Next/Finish footer | `open`, `onCancel`, `title`, `steps`, `onBeforeNext`, `onFinish`, `finishText`, `loading`, `size` |
| `SSwitchPortPicker` | Interactive multi-switch physical port selector built on `<SPortPanel selectable />` | `switches`, `value`, `defaultValue`, `onChange`, `showLegend` |

### Layout & Navigation (`@chenyqthu/omada-ui-kit/core`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SAppShell` | `56px` Top Bar + `216px`/`52px` collapsible Sidebar with nested Level-2 submenus | `navGroups`, `activeKey`, `onSelect`, `edition`, `shellVariant`, `sites`, `activeSite`, `topNavItems`, `serviceTabs` |
| `SPageHeader` | Standard page header with optional Back, Tabs & Actions | `title`, `description`, `subtitle`, `onBack`, `tabs`, `extra` |
| `SDropdown` | Action, searchable, grouped, checkable & multi-level dropdown menu | `items`, `widthPreset`, `searchable`, `selectable`, `selectedKeys`, `header`, `footer` |
| `SPagination` | Omada pagination bar (`default`, `simple`, `minimal`) | `variant`, `total`, `current`, `pageSize`, `showSummary`, `summaryRender`, `onChange` |
| `SSteps` | Horizontal/vertical wizard steps (`130px` H / `96px` V connector) | `items`, `current`, `orientation`, `type`, `loading`, `status` |
| `SBreadcrumb` | Text, icon-only, `...` dropdown collapse (`maxItems`) & overflow tooltip | `items`, `separatorVariant`, `maxItems`, `maxItemWidth` |
| `SAnchor` | Right-rail TOC anchor (single, titled, multi-level, vertical/horizontal) | `items`, `direction`, `title` |
| `SDivider` | `1px` hairline divider (`solid`/`dashed`/`dotted`, titled, inset `24px`, vertical) | `variant`, `orientation`, `titlePlacement`, `inset`, `children` |

### Inputs & Forms (`@chenyqthu/omada-ui-kit/core`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SButton` | 8 button variants (`32px` default, `40px` large) with ref forwarding | `variant`, `size`, `icon`, `loading`, `disabled` |
| `SInput` / `SNumberInput` / `STextArea` | Filled inputs (`#F4F4F4` Light / `#272727` Dark) with `forwardRef` | `variant`, `value`, `defaultValue`, `onChange`, `placeholder`, `disabled` (`SInput` adds `agentId`, `secret`) |
| `SSearchInput` | Search box (`260px` default, clearable) with `forwardRef` | `width`, `value`, `onChange`, `allowClear`, `placeholder` |
| `SPasswordInput` | Filled password input with 4-bar strength meter, live checklist & default `secret: true` masking | `showStrength`, `showRules`, `rules`, `agentId`, `secret` |
| `SIpInput` | Segmented IPv4 / CIDR / IP:Port input with paste & octet clamping | `mode`, `value`, `onChange`, `status`, `size` |
| `SMacInput` | 6-pair hex MAC input (auto-uppercase, paste, `-` or `:`) | `separator`, `value`, `onChange`, `status`, `size` |
| `SForm` | Horizontal Omada form (`200px` label, `labelAlign="start"`, `colon={false}`) | AntD 6 `FormProps`; exposes `.useForm`, `.useWatch`, `.List` |
| `SFormItem` | Form row item with `350px` default field cap, tooltip & `(Optional)` badge | `label`, `name`, `rules`, `tooltip`, `optional`, `fieldWidth`, `hint` |
| `SFormSection` / `SFormFooter` | Collapsible form section divider & `56px` sticky Apply/Cancel action bar | `title`, `collapsible`, `onApply`, `onCancel`, `sticky`, `align` |

### Selectors, Toggles & Sliders (`@chenyqthu/omada-ui-kit/core`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SSelect` | Filled Select (8 visible items, single/multiple/`tags`, `SCustomTag`, sticky `Add New` footer, `forwardRef`) | `options`, `showSearch`, `addNewLabel`, `onAddNew`, `agentId` |
| `SCascader` | Filled multi-level hierarchical Cascader (`forwardRef`) | `options`, `multiple`, `displaySeparator` |
| `STreeSelect` | Filled 2–3 level tree selector (`treeCheckable` + popup filter bar, `forwardRef`) | `treeData`, `treeCheckable`, `popupSearch` |
| `SCheckbox` / `SCheckboxGroup` | Checkboxes with `description`, `showSelectAll` (`indeterminate`), `itemWidth`, & `variant="button"` | `variant`, `description`, `showSelectAll`, `itemWidth`, `options` |
| `SRadio` / `SRadioGroup` | Radio controls (`default`, linear `button`, segmented `capsule` + `pill`) | `variant`, `pill`, `direction`, `options` |
| `SSwitch` | Exact `36×22` medium / `28×16` small pill switch with `aria-describedby` & `forwardRef` | `label`, `description`, `layout`, `labelPlacement`, `gap`, `size`, `agentId` |
| `SSlider` | `3px` track + `18px` thumb, blur-clamped numeric `showInput`, `range`, stepped marks & gradients (`forwardRef`) | `range`, `showInput`, `unit`, `stepPreset`, `segmented`, `handleVariant`, `preset` |
| `SColorPicker` | `32px` filled color trigger (`171px` min width) + curated Omada brand/chart palette presets | `presets`, `showText`, `status`, `value`, `onChange` |

### Time, Transfer, Upload & Schedule (`@chenyqthu/omada-ui-kit/core`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SDatePicker` / `SRangePicker` | Filled DatePicker & RangePicker, plus dashboard `capsule` mode (`1D · 1W · 1M` + Custom) | `capsule`, `capsulePresets`, `presets`, `activePreset`, `onPresetChange`, `value`, `onChange` |
| `STimePicker` / `STimeRangePicker` | Filled 24h / 12h time selector (`350×32` / `165×32` range, `240×280` popup) | `use12Hours`, `format`, `status`, `value`, `onChange` |
| `STransfer` | Dual `240×368px` Transfer with search, pagination, icons, `<SEmpty>` & accessible `grouped` 2-level tree mode | `dataSource`, `targetKeys`, `showSearch`, `pagination`, `grouped`, `showIcon` |
| `SUpload` | Button (`Download Template`) & drag-drop `dragger` with `firmware`/`config`/`image` validation | `variant`, `preset`, `maxSizeMB`, `templateText`, `onDownloadTemplate` |
| `SSchedule` | Custom 7×24h (`Mon`–`Sun` × `00`–`23`) weekly schedule matrix with click/pointer-drag paint & erase | `value`, `onChange`, `presets`, `readOnly`, `disabled`, `showPresets`, `showSummary` |

### Data Display, Tables & Charts (`@chenyqthu/omada-ui-kit/core` & `/charts`)
| Component | Purpose | Key Props / API |
|---|---|---|
| `SCard` / `SKpiCard` | Hairline `8px` card + tabular KPI card with optional click filter | `title`, `subtitle`, `extra`, `padding` / `value`, `meta`, `accentColor`, `active` |
| `STabs` | 4-variant Omada Tabs (`line`, `capsule`, `page`, `filter`) with `useRovingFocus` & `tabpanel` ARIA | `variant`, `size`, `bordered`, `block`, `pill`, `items`, `activeKey`, `onChange`, `agentId` |
| `STag` / `SCustomTag` | Semantic status pill (`20px`) & closable multi-select chip (`24px`) | `color`, `variant`, `closable` |
| `STable` | Data table with toolbar, `filters`, `columnSettings`, `densityToggle`, expandable rows & selection | `toolbar`, `columnSettings`, `densityToggle`, `expandable`, `rowSelection`, `columns`, `dataSource` |
| `SEditableCell` | Inline `28px` table cell editor (`text`, `number`, `select`) | `value`, `type`, `options`, `onSave`, `placeholder`, `disabled` |
| `SChart` | Modular `echarts/core` theme-synced canvas wrapper with loading skeleton & `<SEmpty>` | `option`, `height`, `loading`, `empty` |
| `SLineChart` / `SBarChart` | 5-tick default & 6-tick `%` area/line & vertical/stacked/horizontal bar presets (`containLabel: true`) | `xData` / `categories`, `series`, `percentage`, `yUnit` / `unit`, `stacked`, `layout` |
| `SDonutChart` / `SSparkChart` | Ring donut with center KPI overlay & compact 2-tick (`min`/`max`) sparkline widget | `data`, `centerValue`, `centerLabel` / `variant`, `showAxisTicks` |
| `SDescriptions` | Read-only key/value tables (`bordered`/`filled`/`borderless`, `200px` label, `mono` support) | `items`, `variant`, `layout`, `column`, `labelWidth` |
| `SCollapse` | Accordion panels (`default`/`card`/`ghost`) with right status/subtitle slot | `items`, `variant`, `accordion` |
| `STile` / `STileGroup` | Single (`radiogroup` roving focus) & multi-select option cards | `mode`, `layout`, `columns`, `options`, `value`, `onChange`, `checked`, `title` |
| `SAvatar` / `SAvatarGroup` | `20`/`32`/`48px` user avatar (image/initial/guest + status dot) & overflow stack | `size`, `name`, `guest`, `status`, `maxCount` |
| `SBadge` / `SRate` | Capsule counts (`20px`, `99+`), status dots & 5-star rating (`12`/`20`/`32px`, half-star) | `count`, `dot`, `status`, `tone` / `size`, `allowHalf`, `showCaption`, `readonly` |

### Feedback, Overlays & Loading (`@chenyqthu/omada-ui-kit/core`)
| Component / Hook | Purpose | Key Props / API |
|---|---|---|
| `SModal` / `useOmadaConfirm` | Dialog presets (`sm`: 480, `confirm`: 540, `default`: 640, `centered`: 764, `form`: 880, `xl`: 1040) | `size`, `danger`, `subtitle`, `icon`, `destroyOnHidden`, `open` |
| `SInfoDialog` / `SStepModal` | Status/illustration result dialog & multi-step wizard modal (`Back`/`Next`/`Finish`) | `status`, `illustration` / `steps`, `current`, `defaultCurrent`, `onBeforeNext`, `onFinish` |
| `SDrawer` / `SDrawerFooter` | Slide-over drawer (`sm`: 480, `md`: 640, `lg`: 880, AntD 6 `size`) with loading skeleton | `size`, `loading`, `subtitle`, `statusSlot`, `headerTabs` / `onOk`, `onCancel` |
| `SAlert` / `useOmadaFeedback` | Borderless 12%-tinted banner alert & theme-aware `toast` / `notify` API | `type`, `title`, `description`, `closable`, `action` |
| `SNotification` / `useOmadaNotification` | Static preview notification banner & imperative AntD 6 `{ title, description }` notifications | `type`, `title`, `description`, `actions` |
| `SPopover` / `SPopconfirm` | Hover/click Popover & 4-combo Confirm Popover (`16px` offset) | `title`, `subtitle`, `icon`, `footer` / `description`, `okText`, `cancelText` |
| `STooltip` / `STruncatedText` | `400ms` auxiliary Tooltip & `200ms` overflow-only ellipsis text | `mouseEnterDelay`, `title`, `placement` / `text`, `lines`, `maxWidth`, `tooltip`, `forceTooltip` |
| `SProgress` | `6px` linear bars & `112px` rings (`normal`, `active`, `success`, `warning`, `exception`, `indeterminate`, `budget`) | `type`, `status`, `variant`, `used`, `total`, `unit`, `label` |
| `SLoading` / `SSkeleton` / `SMask` | `16`/`20`/`32px` Figma conic spinners, gradient skeletons & Light/Dark mask | `size`, `description`, `layout`, `tone` / `preset`, `rows`, `loading` / `open`, `blur`, `scope` |
| `SEmpty` | Dashed empty state defaulting to official Figma `no-data` Light/Dark illustration | `illustration`, `title`, `description`, `icon`, `action` |

### Omada Controller v6.3 Domain Widgets (`@chenyqthu/omada-ui-kit/emulator`)
| Component / Constant | Purpose | Key Props / API |
|---|---|---|
| `SDeviceStatus` | 7-state controller device connectivity indicator | `status`, `label` |
| `SPortPanel` | Switch/Gateway RJ45/SFP/WAN/LAN port matrix (`11` speed colors, PoE/Uplink badges) | `ports`, `size`, `layout`, `selectable`, `selectedIds`, `onSelectChange`, `showLegend` |
| `SDevicePortGraphic` / `PortBadgeTile` / `PortStatusLegend` / `LagGlyph` / `SfpGlyph` | Compact (`32px`) & full (`40px`) physical switch/gateway port matrix with floating connected-device thumbnails, SFP/PoE/Uplink/LAG glyphs & 10-item legend | `ports`, `mode`, `showConnectedDevices`, `showLegend`, `selectedPort`, `onSelectPort` |
| `SHealthGauge` / `SHealthRadar` | 180° semi-circular Network Health gauge (`0..100` ticks) & 4-axis concentric radar (`Wi-Fi`, `Client`, `WAN`, `Device`) | `score`, `maxScore`, `label`, `tooltip` / `wifi`, `client`, `wan`, `device`, `wanTooltip` |
| `SHealthTrendBar` | Multi-row 24h Network Health Trend timeline (`~96` vertical status ticks per row) | `rows`, `tickLabels` |
| `SApDistributionRuler` | `-90dBm..-30dBm` rainbow RSSI distribution ruler with clustered AP bubbles & count badges | `clusters`, `minDbm`, `maxDbm`, `step` |
| `SChannelUtilization` | `2.4 GHz`, `5 GHz`, and `6 GHz` wireless channel utilization mini-bar chart | `bands` |
| `SDeviceHealthSummary` | 4-column Gateway / Switches / APs / OLTs health summary strip with `Good/Fair/Poor/No Data` breakdown & `200×4px` segmented bar | `items`, `onCategoryClick` |
| `SClientOverviewStrip` | 4-column client overview KPI strip (`Online Clients`, `Mobile`, `Others`, `Office`) with `SClientIcon` artwork | `items`, `activeKey`, `onItemClick` |
| `STopologyCanvas` | Interactive horizontal/vertical hierarchical network topology tree (`Internet` → Gateways → Switches → APs → Clients) | `root`, `layout`, `onLayoutChange`, `searchQuery`, `healthFilter`, `networkFilter`, `ssidFilter`, `displayOptions`, `onOpenDeviceByName`, `onSelectNode` |
| `SDonutSummaryCard` | ECharts ring donut summary card with centered KPI overlay & vertical or side-by-side legend | `title`, `centerValue`, `centerLabel`, `data`, `layout`, `legendColumns`, `closable`, `onClose`, `onItemClick` |
| `SCategoryKpiCarousel` | Horizontal scrollable 10-card incident category KPI strip (`Overview`..`Security`) with `useRovingFocus` | `items`, `activeKey`, `defaultActiveKey`, `onSelect` |
| `SAclRuleBuilder` | Source → Policy Arrow (`Permit` / `Deny`) → Destination dual-card ACL rule builder with searchable object pickers | `policy`, `source`, `onSourceChange`, `destination`, `onDestinationChange`, `sourceTypeOptions`, `destinationTypeOptions`, `getItemsForType`, `onCreateGroup`, `onInspectItem` |
| `SExpandableSection` | Collapsible "Advanced Settings" disclosure section with animated chevron | `title`, `defaultExpanded`, `expanded`, `onExpandedChange`, `children` |
| `SSettingsPageShell` / `SSettingsSection` / `SSettingsRow` / `SSettingsInfoBanner` | Reusable Omada v6.3 configuration page container (`20px` title + `(?)` Help popover, `<STabs variant="page">`, `clearQuickDrawer`, sticky `Apply` / `Cancel` footer) | `title`, `tabs`, `activeTab`, `onTabChange`, `dirty`, `onApply`, `onCancel`, `helpTitle`, `helpDescription`, `clearQuickDrawer`, `agentId` |
| `STerminalConsole` | Split diagnostic output & interactive CLI console (`200px` `Device List` rail, monospace terminal, search highlight, command history) | `title`, `sessions`, `activeKey`, `interactive`, `onSubmitCommand`, `onClear`, `onDownload`, `emptyText` |

### Pure Validators & Helpers
- **IP / MAC**: `parseIpValue`, `validateIpv4`, `validateCidr`, `normalizeMac`, `validateMac`
- **Date / Upload / Schedule**: `createPickerDate`, `toNativeDate`, `formatOmadaDateRange`, `validateUploadFile`, `formatFileSize`, `createEmptySchedule`, `createSchedulePreset`, `normalizeScheduleValue`, `formatSlotRange`, `formatScheduleSummary`
- **Port & Asset Guards**: `resolveConnectedProductSlug`, `hasOmadaIcon`, `hasOmadaIllustration`, `hasOmadaProductImage`

---

## 4. Application Routes (`src/App.tsx` + `src/demos/emulator/EmulatorApp.tsx`)

| Hash Route | View | Key Interactions |
|---|---|---|
| `#/dashboard` *(default)* | `EmulatorApp` → `SiteDashboardPage` | `Overview` / `Topology` (`TopologyTabView` + `<STopologyCanvas>`) / `Wi-Fi` / `Clients` / `Traffic` tabs, `1D` / `1W` / `1M` range switcher, clickable `MainOffice_Gateway_2` & topology device nodes open `420px` `DevicePropertiesDrawer` |
| `#/devices` | `EmulatorApp` → `DeviceListPage` | `Device List` / `Device Group` / `Configuration Result` sub-tabs, live filters, `2217px` horizontally scrollable table, clicking any row opens `420px` Quick Drawer; `Manage Device` expands to `1224px` (`Ports` tab); `<||` handle reopens active drawer |
| `#/clients` | `EmulatorApp` → `ClientListPage` + `ClientPropertiesDrawer` | `Online` / `Offline` / `Blocked` / `All` tabs, `<SClientOverviewStrip>`, search + type + experience filters, row click opens `420px` `ClientPropertiesDrawer` |
| `#/map` | `EmulatorApp` → `MapPage` | `Heat Map` (CAD office floorplan SVG, `2.4/5/6 GHz`, opacity slider, `Edit`/`Simulate`) & `Device Map` (`48px` sticky header + `.omada-map-floating-card` overlay) |
| `#/insights` or `#/statistics` | `EmulatorApp` → `ApplicationAnalyticsPage` | `230×230` ECharts traffic donut, 20 interactive categories, `Categories` (`<SDonutSummaryCard>` grid) / `Apps` / `Users` tabs |
| `#/report` | `EmulatorApp` → `ReportsPage` | `Summary` / `Wired` / `Wireless` / `Client & Application` tabs, `1D` / `1W` / `1M` picker, 3-col Client & SSID donuts |
| `#/logs` or `#/log` | `EmulatorApp` → `LogsPage` | `Alerts` / `Events` / `Audit Logs` tabs, module filter, clickable inline client & device links opening drawers |
| `#/incidents` or `#/abnormal` | `EmulatorApp` → `IncidentsPage` + `IncidentDetailDrawer` | `Incident Analysis` / `Notification` / `Settings` tabs, `<SCategoryKpiCarousel>`, row click opens `800px` `IncidentDetailDrawer` |
| `#/intelli-recover` or `#/intellirecover` | `EmulatorApp` → `IntelliRecoverPage` | `intellirecover-2` hero banner + policy editor modal, `Devices` / `Clients` filter, monitored PoE table |
| `#/site-settings`, `#/setting/site`, `#/network-config` | `EmulatorApp` → `SiteSettingsPage` | 5 horizontal configuration sections, Inform URL copy, collapsible Time/Location blocks, dirty-state Apply/Cancel |
| `#/internet` or `#/setting/internet` | `EmulatorApp` → `InternetPage` | `Mode Config` (`ER7412-M2 v1.0`), 13-row `Port Config` table, `Load Balancing`, `Link Backup` |
| `#/lan` or `#/setting/network-settings/lan` | `EmulatorApp` → `LanPage` | `VLAN` (7 VLAN master list, interactive VLAN Topology SVG, `Ports` view), `Multicast Snooping`, `Isolation Settings`, `LAN DNS` |
| `#/wlan` or `#/setting/wireless` | `EmulatorApp` → `WlanPage` | `SSID`, `WLAN Optimization`, `Optimization History` |
| `#/acl` or `#/setting/acl` | `EmulatorApp` → `AclPage` | `Gateway ACL` / `Switch ACL` / `EAP ACL` tabs, `<SAclRuleBuilder>`, drag-and-drop & keyboard row reordering |
| `#/switch-ports`, `#/setting/deviceConfigSwitchPort`, `#/device-config` | `EmulatorApp` → `SwitchPortsConfigPage` | `Port Settings` (`Overview`/`PoE`/`Counters` & link-status segmented filters) & `Port Profile` |
| `#/dns` or `#/setting/dns` | `EmulatorApp` → `DnsConfigPage` | `Dynamic DNS`, `DNS Proxy`, `DNS Cache` |
| `#/ssh`, `#/schedule`, `#/routing`, `#/nat`, … *(41 submodules)* | `EmulatorApp` → `ConfigSubmodulePage` | Schema-driven `Network Config` & `Device Config` workspaces |
| `#/hotspot*` | `HotspotPortalApp` | Standalone `56px` Hotspot Management Portal |
| `#/network-tools` or `#/networkAnalyze` | `EmulatorApp` → `NetworkToolsPage` | `Network Check` (`Ping`/`Traceroute`/`DNS Lookup` + `<STerminalConsole>`), `Packet Capture`, `Terminal`, `Cable Test`, `Interference Detection`, `Remote Access (BETA)` |
| `#/maintenance` or `#/setting/maintenance` | `EmulatorApp` → `MaintenancePage` | `Site Restore` & `Site Backup` |
| `#/showcase` | `ShowcaseApp` | Full Component, Block, Template, Agent Skill & Asset Library |

---

## 5. Generating New PRD Demos (AntD 6 + Dark Mode + Verification Rules)

1. Follow `COMPONENT_CONTRACT.md` and `skills/omada-ui-kit/SKILL.md` (use AntD v6 `classNames`/`styles`, `variant="filled"`, `<SButton variant="primary">`, `var(--omada-*)` tokens, and `padding: '20px 44px 24px 24px'` inside `<SEmulatorShell>`).
2. Run `node skills/omada-ui-kit/scripts/verify-demo.mjs <demo>` plus `pnpm typecheck && pnpm test && pnpm build` to verify zero drift or regressions.
