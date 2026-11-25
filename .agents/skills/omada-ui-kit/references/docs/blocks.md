# Omada Reusable Page Blocks (`@chenyqthu/omada-ui-kit/blocks`)

High-level Controller v6.3 shells, filterable tables, inline rule editors, 2-stage inspector drawers, master-detail splits, wizards, and switch port pickers.

### `SDetailInspectorDrawer` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Omada Controller 2-stage slide-out inspector drawer (`420px` <-> `1040px`) combining device/client title header, status dot, expand toggle, and underline tabs.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeTab` | `string` | No |  |
| `children` | `React.ReactNode` | No |  |
| `defaultWidth` | `number` | No |  |
| `expandable` | `boolean` | No | Enables Omada's 2-stage `420px <-> 1040px` expand/collapse button (default `true`). |
| `expandedWidth` | `number` | No |  |
| `footer` | `React.ReactNode` | No |  |
| `headerExtra` | `React.ReactNode` | No |  |
| `icon` | `React.ReactNode` | No | Optional leading icon/product thumbnail rendered before the title. |
| `onClose` | `() => void` | Yes |  |
| `onTabChange` | `(key: string) => void` | No |  |
| `open` | `boolean` | Yes |  |
| `status` | `DeviceStatusType` | No | Semantic status dot + label displayed beside the title. |
| `statusLabel` | `string` | No | Custom status label overriding `status` default text. |
| `subtitle` | `React.ReactNode` | No |  |
| `tabs` | `SDetailInspectorTab[]` | No | Optional tabs rendered cleanly inside the inspector drawer. |
| `title` | `React.ReactNode` | Yes |  |

### `SEmulatorShell` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Omada Controller v6.3.0.34 authentic emulator layout shell: - Scoped `.omada-emulator-root` Light/Dark surface & color palette - `56px` Top Bar with left controller context, centered Omada wordmark, and right utility controls - `216px` / `52px` borderless collapsible sidebar with site pill selector and 5 Title-Case sections - Right-edge floating `<||` quick-drawer handle

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeKey` | `string` | Yes | Active navigation item key (e.g. `'dashboard'`, `'devices'`). |
| `activeSite` | `string` | No | Controlled active site key or label. |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `collapsed` | `boolean` | No | Controlled sidebar collapsed state. |
| `controllerName` | `string` | No | Controller / organization name displayed on the left of the Top Bar. |
| `defaultCollapsed` | `boolean` | No | Initial uncontrolled sidebar collapsed state. |
| `embedded` | `boolean` | No | Bounded container mode for embedded showcase previews. |
| `extraNavItems` | `SEmulatorExtraNavItem[]` | No | Inject additional nav items into existing or new sidebar groups without duplicating the full nav array. |
| `navGroups` | `SEmulatorNavGroup[]` | No | Optional navigation groups override; defaults to `EMULATOR_NAV_GROUPS` or `EMULATOR_GLOBAL_NAV_GROUPS` by `scope`. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | No | Invoked when the sidebar collapse button toggles state. |
| `onMoreSelect` | `(key: string) => void` | No | Invoked when an item in the `More` dropdown menu is clicked. |
| `onOpenShowcase` | `() => void` | No | Invoked when `Component Library` is chosen from the `More` menu. |
| `onRefresh` | `() => void` | No | Invoked when the top-right Refresh icon button is clicked. |
| `onSearchClick` | `() => void` | No | Invoked when the top-right Search icon button is clicked. |
| `onSelect` | `(key: string) => void` | Yes | Invoked when a sidebar navigation item is selected. |
| `onSiteChange` | `(siteKey: string) => void` | No | Invoked when a site is picked from the site pill dropdown. |
| `onToggleQuickDrawer` | `() => void` | No | Invoked when the right-edge `<\|\|` floating quick-drawer handle is clicked. |
| `scope` | `'site' \| 'global'` | No | Shell context preset (`'site'` uses `EMULATOR_NAV_GROUPS`; `'global'` uses `EMULATOR_GLOBAL_NAV_GROUPS`). |
| `showQuickDrawerHandle` | `boolean` | No | Whether to show the right-edge floating quick-drawer handle (default `true`). |
| `sites` | `SSiteOption[]` | No | Available site options shown in the sidebar site pill dropdown. |
| `userName` | `string` | No | Accessible user display name for the top-right avatar badge. |

### `SFilterTableBlock` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Reusable Omada Controller list + toolbar block combining optional underline tabs, search/filter toolbar, `<||` quick-drawer clearance, batch selection strip, and `<STable>`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeTab` | `string` | No | Controlled active tab key when `tabs` is provided. |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `batchActions` | `React.ReactNode` | No | Batch actions displayed inside the selection strip when `selectedCount > 0`. |
| `className` | `string` | No |  |
| `clearQuickDrawer` | `boolean` | No | Adds right padding (`pr-9`) on top header/toolbar rows to clear `<SEmulatorShell>`'s `<\|\|` handle. Default `true`. |
| `extraActions` | `React.ReactNode` | No | Secondary right-side actions before `primaryAction`. |
| `filters` | `React.ReactNode` | No | Filter controls placed alongside the search input. |
| `onClearSelection` | `() => void` | No | Callback to clear row selection. |
| `onSearchChange` | `(value: string) => void` | No | Callback invoked on search input change. |
| `onTabChange` | `(key: string) => void` | No | Invoked when a top underline tab is clicked. |
| `primaryAction` | `React.ReactNode` | No | Primary right-side action button (e.g. `+ Create New Rule`). |
| `searchPlaceholder` | `string` | No | Placeholder text for the integrated search input. |
| `searchValue` | `string` | No | Controlled search string. |
| `selectedCount` | `number` | No | Number of selected rows to trigger the batch selection strip. |
| `subtitle` | `React.ReactNode` | No | Optional helper/subtitle text placed beside `title`. |
| `tableProps` | `STableProps<T>` | Yes | Props forwarded to the underlying `<STable>`. |
| `tabs` | `SFilterTableTab[]` | No | Optional top underline tabs rendered above the toolbar. |
| `title` | `React.ReactNode` | No | Optional section heading rendered to the left of the toolbar. |

### `SInlineFormRow` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Standard Omada Controller `210px`-label / flexible-control row for inline rule & policy editors.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `htmlFor` | `string` | No | Optional `<label htmlFor>` target ID. |
| `label` | `React.ReactNode` | Yes | Left-column label (`210px` fixed on desktop). |
| `tooltip` | `string` | No | Optional green info icon tooltip placed next to the label. |

### `SInlineRuleEditorLayout` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Full-pane inline rule / profile editor layout with `<- Back` header, top-right `(?)` Help icon (`pr-9` clearance), structured `SInlineFormRow` stack, and `Create` / `Cancel` footer buttons.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `cancelText` | `string` | No | Cancel button label (default `'Cancel'`). |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `footerExtra` | `React.ReactNode` | No | Optional extra actions rendered on the bottom action bar. |
| `onBack` | `() => void` | Yes | Callback invoked when clicking the `<-` back title button. |
| `onCancel` | `() => void` | No | Cancel handler (defaults to `onBack`). |
| `onHelpClick` | `() => void` | No | Optional callback for the top-right circular green `(?)` Help button. |
| `onSubmit` | `() => void` | No | Submit handler for the primary button. |
| `primaryText` | `string` | No | Primary action button label (default `'Create'`). |
| `submitting` | `boolean` | No | Loading state for the primary action button. |
| `title` | `React.ReactNode` | Yes | Heading rendered beside the `<-` back arrow (`Create New Rule`, `Edit Profile`, etc.). |

### `SMasterDetailSplitBlock` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Split master-detail workspace combining a searchable left selection list (`listbox` + vertical roving focus) and a bordered right detail/canvas surface (`LAN VLANs`, `Terminal`, `Switch Ports`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeKey` | `string` | Yes |  |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `detailExtra` | `React.ReactNode` | No | Right detail pane header extra controls. |
| `detailTitle` | `React.ReactNode` | No | Right detail pane header title. |
| `emptyDetail` | `React.ReactNode` | No | Empty placeholder rendered when `items` is empty and no detail applies. |
| `items` | `SMasterDetailItem[]` | Yes |  |
| `masterExtra` | `React.ReactNode` | No | Optional control placed to the right of `masterTitle`. |
| `masterTitle` | `React.ReactNode` | No | Left rail heading. |
| `masterWidth` | `number` | No | Width of the left master rail in pixels (default `260`). |
| `onSelect` | `(key: string) => void` | Yes |  |
| `searchable` | `boolean` | No | Adds a compact filled search filter at the top of the left rail. |
| `searchPlaceholder` | `string` | No |  |

### `SSwitchPortPicker` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Interactive multi-switch port selector composing a switch picker, `<SPortPanel selectable />`, batch `Select All` / `Clear` actions, and summary tags.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `defaultValue` | `Record<string, number[]>` | No | Uncontrolled initial selection map. |
| `onChange` | `(next: Record<string, number[]>) => void` | No | Invoked whenever port selection changes across any switch. |
| `showLegend` | `boolean` | No | Shows the Omada port link speed legend beneath the panel (default `true`). |
| `switches` | `SSwitchPortDevice[]` | Yes | Switch devices whose ports can be interactively picked. |
| `value` | `Record<string, number[]>` | No | Controlled selection map `{ [switchId]: number[] }`. |

### `SWizardModal` (`component` · `@chenyqthu/omada-ui-kit/blocks`)
Multi-step Omada setup & adoption wizard modal combining `<SModal>`, `<SSteps>`, and Back / Next / Finish progression.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `finishText` | `string` | No |  |
| `loading` | `boolean` | No |  |
| `onBeforeNext` | `(stepIndex: number) => boolean` | No | Optional guard returning `false` to prevent advancing from `stepIndex`. |
| `onCancel` | `() => void` | Yes |  |
| `onFinish` | `() => void` | Yes |  |
| `open` | `boolean` | Yes |  |
| `size` | `SModalSize` | No |  |
| `steps` | `SWizardStepItem[]` | Yes |  |
| `title` | `React.ReactNode` | Yes |  |

## Quick-Drawer Handle Clearance
`SEmulatorShell` mounts a fixed `36px` `<||` quick-drawer handle at top-right. `SFilterTableBlock` defaults to `clearQuickDrawer={true}` (`pr-9`). Custom top wrappers inside `SEmulatorShell` should use `style={{ padding: '20px 44px 24px 24px' }}`.
