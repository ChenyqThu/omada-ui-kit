# Omada Controller v6.3 Domain Widgets (`@chenyqthu/omada-ui-kit/emulator`)

Topology canvas, ACL source-policy-destination rule builder, multi-tab settings page shell (`clearQuickDrawer`), interactive dark CLI terminal, AP distribution ruler, port graphics, and device/client status widgets.

### `LagGlyph` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Link Aggregation (LAG) stacked-port badge glyph.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `size` | `number` | No |  |

### `PortBadgeTile` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Single physical port square tile used in port graphics, connection rows, and port tables.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `interactive` | `boolean` | No |  |
| `onClick` | `() => void` | No |  |
| `port` | `Pick< DrawerPortItem, \| 'port' \| 'name' \| 'linkStatus' \| 'isSfp' \| 'isUplink' \| 'isPoe' \| 'isMirroring' \| 'isBlocking' \| 'isLag' >` | Yes |  |
| `selected` | `boolean` | No |  |
| `size` | `number` | No |  |

### `PortStatusLegend` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
10-item horizontal port speed & attribute legend matching Omada Controller v6.3.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `ports` | `DrawerPortItem[]` | No |  |

### `resolveConnectedProductSlug` (`helper` · `@chenyqthu/omada-ui-kit/emulator`)
Resolves a valid `SProductImage` slug for a connected neighbor device.

### `SAclRuleBuilder` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Omada Controller v6.3 visual `Source → Policy Arrow → Destination` dual-card selector used in Gateway ACL, Switch ACL, and EAP ACL rule configuration.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `destination` | `SAclEndpointValue` | Yes | Current Destination card type + checked item values. |
| `destinationError` | `boolean` | No | Marks Destination type selector with validation error border when true. |
| `destinationTooltip` | `string` | No | Optional tooltip shown next to the Destination card heading. |
| `destinationTypeOptions` | `SAclEndpointTypeOption[]` | Yes | Selectable endpoint types for the Destination card. |
| `getItemsForType` | `(type: string, side: 'source' \| 'destination') => SAclObjectOption[]` | Yes | Returns checklist items belonging to the chosen endpoint type. |
| `onCreateGroup` | `(type: string, side: 'source' \| 'destination') => void` | No | Invoked when `+ Create` in a card footer is clicked (for creatable Group types). |
| `onDestinationChange` | `(next: SAclEndpointValue) => void` | Yes | Callback invoked when Destination type or checked item values change. |
| `onInspectItem` | `(type: string, item: SAclObjectOption, side: 'source' \| 'destination') => void` | No | Invoked when the per-row detail icon button is clicked inside either card. |
| `onSourceChange` | `(next: SAclEndpointValue) => void` | Yes | Callback invoked when Source type or checked items change. |
| `policy` | `SAclPolicy` | Yes | Traffic rule policy governing the visual center arrow (`Deny` vs `Permit`). |
| `source` | `SAclEndpointValue` | Yes | Current Source card type + checked item values. |
| `sourceError` | `boolean` | No | Marks Source type selector with validation error border when true. |
| `sourceTooltip` | `string` | No | Optional tooltip shown next to the Source card heading (e.g., EAP ACL). |
| `sourceTypeOptions` | `SAclEndpointTypeOption[]` | Yes | Selectable endpoint types for the Source card. |

### `SApDistributionRuler` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
RSSI AP Distribution ruler (`-90dBm` to `-30`) with rainbow signal-quality gradient bar, 5 dBm tick marks, and circular AP device cluster markers with green count badges.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `clusters` | `SApDistributionCluster[]` | Yes | AP signal distribution clusters plotted along the `-90dBm .. -30dBm` ruler. |
| `maxDbm` | `number` | No | Maximum scale value in dBm (defaults to `-30`). |
| `minDbm` | `number` | No | Minimum scale value in dBm (defaults to `-90`). |
| `step` | `number` | No | Step between ruler tick marks (defaults to `5`). |
| `style` | `React.CSSProperties` | No |  |

### `SCategoryKpiCarousel` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Horizontal scrollable KPI category strip with `<` / `>` scroll arrows, roving keyboard focus, active `#00A870` border + subtle tint highlight, and Light/Dark theme support.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeKey` | `string` | No | Controlled active category key. |
| `className` | `string` | No |  |
| `defaultActiveKey` | `string` | No | Uncontrolled initial active category key (defaults to `'overview'`). |
| `items` | `CategoryKpiItem[]` | No | Category KPI cards rendered horizontally inside the carousel. |
| `onSelect` | `(key: string) => void` | No | Fired when a category card is selected. |

### `SClientOverviewStrip` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
4-column client overview KPI strip displayed above the Emulator Clients toolbar. Shows client category artwork (`SClientIcon`) paired with count and category label.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeKey` | `string \| null` | No | Optional currently active category filter key. |
| `className` | `string` | No |  |
| `items` | `ClientOverviewItem[]` | No | 4 horizontal client overview KPI blocks (`Online Clients`, `Mobile`, `Others`, `Office`). |
| `onItemClick` | `(key: string) => void` | No | Optional click handler invoked when a KPI block is clicked. |

### `SDeviceHealthSummary` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
4-column device health summary strip displayed above the Emulator Devices toolbar. Shows category icon, health score or `Good / Fair / Poor / No Data` counts, and a 200x4px segmented bar.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `items` | `DeviceHealthSummaryItem[]` | No | Health summary items across device categories (defaults to Gateway / Switches / APs / OLTs). |
| `onCategoryClick` | `(key: string) => void` | No | Optional click handler when a category block is clicked. |

### `SDevicePortGraphic` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Interactive physical port strip for Omada Quick Properties (`mode="compact"`) and Expanded Manage Device Ports view (`mode="full"` with floating connected device thumbnails).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `mode` | `'compact' \| 'full'` | No | `compact` renders 32px tiles + Used Port header; `full` renders 40px tiles + optional connected devices + legend. |
| `onSelectPort` | `(port: DrawerPortItem) => void` | No | Callback fired when a port tile is clicked. |
| `ports` | `DrawerPortItem[]` | Yes | Ordered list of physical ports on the device. |
| `selectedPort` | `number \| null` | No | Currently selected port number for table/graphic synchronization. |
| `showConnectedDevices` | `boolean` | No | Displays floating connected device thumbnails with vertical stem lines above connected ports in `full` mode. |
| `showHeader` | `boolean` | No | Controls the `Used Port: X/Y` + info icon header row (defaults to `true` in `compact` mode). |
| `showLegend` | `boolean` | No | Controls the 10-item horizontal port legend below the graphic (defaults to `true` in `full` mode). |
| `totalPorts` | `number` | No | Override count of total ports shown in compact header. |
| `usedPorts` | `number` | No | Override count of used ports shown in compact header. |

### `SDeviceStatus` (`component` · `@chenyqthu/omada-ui-kit/core`)
Semantic network device connectivity/provisioning indicator with colored status dot.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `label` | `string` | No |  |
| `status` | `DeviceStatusType` | Yes |  |

### `SExpandableSection` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Omada Controller v6.3 square `[+]` / `[-]` expandable settings section (used for `Advanced Settings`, `ACL Binding`, and progressive disclosure blocks).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `defaultExpanded` | `boolean` | No | Initial uncontrolled expanded state (default `false`). |
| `expanded` | `boolean` | No | Controlled expanded state. |
| `extra` | `React.ReactNode` | No | Optional trailing content rendered on the same row as the toggle header. |
| `onExpandedChange` | `(expanded: boolean) => void` | No | Invoked when the section toggle is clicked. |
| `title` | `React.ReactNode` | Yes | Section heading displayed next to the `[+]` / `[-]` toggle square. |

### `SfpGlyph` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Crisp white/monochrome SFP fiber transceiver module icon matching Omada Controller v6.3.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `size` | `number` | No |  |

### `SPortPanel` (`component` · `@chenyqthu/omada-ui-kit/core`)
Interactive Switch / Gateway physical port matrix matching Omada Figma port speed colors (11 states). Supports single-row or double-row (odd top / even bottom) layout, port badges, tooltips, and selection.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `layout` | `'double-row' \| 'single-row'` | No |  |
| `onSelectChange` | `(ids: number[]) => void` | No |  |
| `ports` | `SPortItem[]` | Yes |  |
| `selectable` | `boolean` | No |  |
| `selectedIds` | `number[]` | No |  |
| `showLegend` | `boolean` | No |  |
| `size` | `'sm' \| 'lg'` | No |  |

### `SSettingsInfoBanner` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Soft blue `#F0F5FA` (Light) / `#1D2939` (Dark) informational banner for Omada settings pages.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes | Numbered or rich informational items displayed inside the soft blue banner. |
| `className` | `string` | No |  |

### `SSettingsPageShell` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Reusable Omada Controller v6.3 configuration page container providing: - `20px` title header + optional top-right circular green `(?)` Help trigger - Optional `18px` underline sub-tab bar (`<STabs variant="page" />`) - Automatic `>=44px` right clearance (`clearQuickDrawer`) for `<SEmulatorShell>`'s `<||` handle - Clean borderless content workspace + optional dirty-state sticky `Apply` / `Cancel` footer bar

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeTab` | `string` | No | Controlled active tab key. |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `applyDisabled` | `boolean` | No | Disables the sticky `Apply` button while keeping `Cancel` active. |
| `applying` | `boolean` | No | Loading state for the sticky `Apply` button. |
| `applyText` | `string` | No | Custom primary action label (defaults to `'Apply'`). |
| `cancelText` | `string` | No | Custom secondary action label (defaults to `'Cancel'`). |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `clearQuickDrawer` | `boolean` | No | Adds `>=44px` right clearance on top header/tab rows so `(?)` Help clears `<SEmulatorShell>`'s `<\|\|` quick-drawer handle. Default `true`. |
| `defaultActiveTab` | `string` | No | Initial uncontrolled active tab key. |
| `dirty` | `boolean` | No | Shows the sticky bottom `Apply` / `Cancel` bar when `true`. |
| `footerExtra` | `React.ReactNode` | No | Optional auxiliary content shown on the right of the sticky footer bar. |
| `headerExtra` | `React.ReactNode` | No | Extra controls placed left of the `(?)` Help button in the header bar. |
| `helpDescription` | `React.ReactNode` | No | Body description inside the Help popover when `(?)` is clicked. |
| `helpTitle` | `React.ReactNode` | No | Heading inside the Help popover when `(?)` is clicked. |
| `onApply` | `() => void` | No | Callback invoked when the sticky `Apply` button is clicked. |
| `onCancel` | `() => void` | No | Callback invoked when the sticky `Cancel` button is clicked. |
| `onHelpClick` | `() => void` | No | Optional click callback overriding default Help popover behavior. |
| `onTabChange` | `(key: string) => void` | No | Invoked when an underline sub-tab is clicked. |
| `showHelp` | `boolean` | No | Optional top-right circular green `(?)` Help icon (defaults to `true`). |
| `tabAriaLabel` | `string` | No | Accessible `aria-label` for the underline sub-tabs tablist. |
| `tabs` | `SSettingsTabItem[]` | No | Optional underline sub-tabs (`18px` Omada tab bar). |
| `title` | `React.ReactNode` | No | Optional 20px page heading (omitted on tab-first pages like LAN). |

### `SSettingsRow` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Horizontal Omada settings field row (`210px` left label / `350px` right filled control).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `after` | `React.ReactNode` | No | Optional trailing text or element rendered immediately right of the control box. |
| `align` | `'center' \| 'start'` | No | Vertical alignment of label relative to control (`'center'` or `'start'`). |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `controlWidth` | `number \| 'auto' \| 'full'` | No | Width constraint for the control column (`350` default, or `'auto' \| 'full'`). |
| `hint` | `React.ReactNode` | No | Optional muted helper description rendered directly below the control. |
| `label` | `React.ReactNode` | Yes | Left column label (`210px` default width). |
| `labelWidth` | `number` | No | Width of left label column in px (defaults to `210`). |
| `tooltip` | `React.ReactNode` | No | Optional tooltip shown via inline `(i)` icon next to the label. |

### `SSettingsSection` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Borderless Omada settings section block with optional hairline top divider and `16px` title.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `description` | `React.ReactNode` | No | Optional muted subtitle rendered below the section title. |
| `dividerTop` | `boolean` | No | Renders a hairline horizontal divider above this section. |
| `extra` | `React.ReactNode` | No | Optional right-aligned header action slot. |
| `title` | `React.ReactNode` | Yes | Section title (`16px` medium weight). |

### `STerminalConsole` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Reusable Omada v6.3 split diagnostic terminal console featuring: - Header bar with title, right-aligned filled search input, and Clear / Download / `A+` controls - Left `Device List` rail (`200px` wide) displaying active session/output device pills - Right dark monospace terminal surface (`#242424`) with centered empty prompt and optional interactive CLI input

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeKey` | `string \| null` | No | Controlled active session key. |
| `className` | `string` | No |  |
| `defaultActiveKey` | `string \| null` | No | Initial active session key for uncontrolled usage. |
| `emptyText` | `React.ReactNode` | No | Centered muted message displayed inside the dark terminal box when empty. |
| `interactive` | `boolean` | No | Enables an interactive CLI command input prompt inside the terminal body. |
| `minHeight` | `number` | No | Minimum height in pixels for the split `Device List` + dark terminal body. |
| `onClear` | `() => void` | No | Callback fired when the Clear (broom) icon button is clicked. |
| `onCloseSession` | `(key: string) => void` | No | Optional callback fired when the close icon on a device pill is clicked. |
| `onDownload` | `(activeSession: STerminalSessionItem \| null) => void` | No | Callback fired when the Download icon button is clicked. |
| `onSearchChange` | `(query: string) => void` | No | Callback fired when the search input changes. |
| `onSelectSession` | `(key: string) => void` | No | Callback fired when a device in `Device List` is clicked. |
| `onSubmitCommand` | `(sessionKey: string, command: string) => void` | No | Callback fired when the user submits a CLI command in interactive mode. |
| `searchPlaceholder` | `string` | No | Placeholder for the right-aligned filled search field. |
| `searchQuery` | `string` | No | Controlled search query string. |
| `sessions` | `STerminalSessionItem[]` | No | Diagnostic device outputs or interactive CLI sessions. |
| `title` | `React.ReactNode` | No | Section title on the left of the header bar (e.g. `'Device Output'` or `'Sessions'`). |

### `STopologyCanvas` (`component` · `@chenyqthu/omada-ui-kit/emulator`)
Interactive Omada v6.3 Network Topology Canvas (`Dashboard -> Topology`). Renders hierarchical Gateway -> Switch -> AP -> Client connections with curved Bezier edges, port/speed badges, green collapsible subtree hubs, search/health dimming, horizontal/vertical layout toggle, zoom/pan, and node click-to-inspect callbacks.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `displayOptions` | `Partial<TopologyDisplayOptions>` | No | Display toggles controlled from top-bar Display popover. |
| `healthFilter` | `TopologyHealthFilter` | No | Optional health bucket highlight filter. |
| `height` | `number \| string` | No | Height of canvas container (defaults to `580`). |
| `layout` | `TopologyLayoutMode` | No | Layout orientation (`'horizontal'` left-to-right or `'vertical'` top-to-bottom). |
| `networkFilter` | `string` | No | Optional network filter value (`'all'` shows all). |
| `onLayoutChange` | `(layout: TopologyLayoutMode) => void` | No | Invoked when user toggles layout mode via bottom-left control. |
| `onOpenDeviceByName` | `(deviceName: string) => void` | No | Invoked when a device node is clicked (opens DevicePropertiesDrawer). |
| `onSelectNode` | `(node: TopologyNodeData) => void` | No | Invoked when any node (device, client, controller, internet) is clicked. |
| `root` | `TopologyNodeData` | No | Root topology tree node (defaults to Headquarters Building hierarchy). |
| `searchQuery` | `string` | No | Filter query matched against node name, IP, model, or MAC. |
| `ssidFilter` | `string` | No | Optional SSID filter value (`'all'` shows all). |
