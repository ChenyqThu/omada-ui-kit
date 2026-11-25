# Data Display, Tables, Tabs & Tiles (`@chenyqthu/omada-ui-kit/core`)

Cards, KPI cards, dense/editable tables, 4-variant `STabs` (`line` / `capsule` / `page` / `filter`), semantic tags, descriptions, collapses, and selectable radio/checkbox tiles.

### `SAvatar` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Avatar component supporting `20px` (`xs`), `24px` (`sm`), `32px` (`md`), and `48px` (`lg`) sizes, image with graceful fallback, initials, guest/authenticated states, and optional status indicator.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `guest` | `boolean` | No | Render neutral guest avatar state instead of authenticated brand tint. |
| `name` | `string` | No | User display name; renders initials when no `src` or `icon` is given. |
| `size` | `SAvatarSize` | No | Named Omada presets (`xs`: 20px, `sm`: 24px, `md`: 32px, `lg`: 48px) or numeric px. |
| `status` | `SAvatarStatus` | No | Optional presence dot rendered at the bottom-right corner. |
- **Inherited AntD props**: `alt`, `children`, `className`, `crossOrigin`, `draggable`, `gap`, `icon`, `onClick`, `onError`, `rootClassName`, `shape`, `src`, `srcSet`, `style`

### `SAvatarGroup` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Avatar stack wrapper using AntD 6 `max` overflow popover config.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `maxCount` | `number` | No | Maximum avatars shown before collapsing into a `+N` overflow badge (AntD 6 `max.count`). |
| `size` | `SAvatarSize` | No |  |
- **Inherited AntD props**: `children`, `className`, `max`, `rootClassName`, `shape`, `style`

### `SBadge` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Badge supporting `20px`-tall capsule counts (`99+` overflow), standalone dots, and semantic status indicators (`success`, `warning`, `error`, `processing`, `default`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `size` | `'small' \| 'medium'` | No | AntD 6 size (`'small' \| 'medium'`; never deprecated `'default'`). |
| `status` | `SBadgeStatus` | No | Semantic status dot mode (`success`, `warning`, `error`, `processing`, `default`). |
| `tone` | `SBadgeTone` | No | Count/dot semantic color tone when `color` is not manually provided. |
- **Inherited AntD props**: `children`, `className`, `classNames`, `color`, `count`, `dot`, `offset`, `overflowCount`, `rootClassName`, `scrollNumberPrefixCls`, `showZero`, `style`, `styles`, `text`, `title`
- **Common React/DOM props**: `autoFocus`, `defaultChecked`, `defaultValue`, `id`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `rel`, `role`, `tabIndex`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SCard` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada surface card (`#FFFFFF` light / `#1A1A1A` dark, 8px radius, 1px hairline border).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `extra` | `React.ReactNode` | No |  |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `subtitle` | `React.ReactNode` | No |  |
| `title` | `React.ReactNode` | No |  |

### `SCollapse` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Collapse / Accordion panel supporting `default`, `card`, and `ghost` variants, header status/extra slots, smooth chevron rotation, and Light/Dark parity.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `items` | `SCollapseItem[]` | Yes |  |
| `size` | `'small' \| 'medium' \| 'large'` | No | AntD 6 size (`'small' \| 'medium' \| 'large'`). |
| `variant` | `SCollapseVariant` | No |  |
- **Inherited AntD props**: `accordion`, `activeKey`, `className`, `classNames`, `collapsible`, `defaultActiveKey`, `destroyOnHidden`, `expandIcon`, `expandIconPlacement`, `onChange`, `rootClassName`, `style`, `styles`

### `SCustomTag` (`component` · `@chenyqthu/omada-ui-kit/core`)
24px neutral tag for multi-select values and editable tag lists.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `closable` | `boolean` | No |  |
| `onClick` | `() => void` | No |  |
| `onClose` | `() => void` | No |  |

### `SDescriptions` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Descriptions component supporting `bordered`, `filled`, and `borderless` variants, `horizontal` (`200px` fixed label column) and `vertical` layouts, and Light/Dark tokens.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `items` | `SDescriptionItem[]` | Yes |  |
| `labelWidth` | `number \| string` | No | Fixed label column width in horizontal mode (defaults to `200` per Omada Figma spec). |
| `size` | `'small' \| 'medium' \| 'large'` | No | AntD 6 size (`'small' \| 'medium' \| 'large'`; never deprecated `'default'`). |
| `variant` | `SDescriptionsVariant` | No |  |
- **Inherited AntD props**: `classNames`, `colon`, `column`, `extra`, `layout`, `rootClassName`, `styles`, `title`
- **Common React/DOM props**: `autoFocus`, `className`, `defaultChecked`, `defaultValue`, `id`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `rel`, `role`, `style`, `tabIndex`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SEditableCell` (`component` · `@chenyqthu/omada-ui-kit/core`)
Compact `28px`-high inline editable table cell supporting both single-cell click-to-edit (Enter/Save/Cancel) and controlled `editing` mode for batch row editing.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `ariaLabel` | `string` | No |  |
| `className` | `string` | No |  |
| `defaultEditing` | `boolean` | No | Initial uncontrolled editing state. |
| `disabled` | `boolean` | No |  |
| `editing` | `boolean` | No | Controlled editing state (set `true` on all cells in a row for batch editing). |
| `inputWidth` | `number \| string` | No | Optional width constraint for the inline editor (e.g. `254`). |
| `onChange` | `(nextValue: V) => void` | No | Immediate change callback for controlled / batch row editing. |
| `onEditingChange` | `(editing: boolean) => void` | No | Notifies when single-cell editing starts or exits. |
| `onSave` | `(nextValue: V) => void \| Promise<void>` | No | Invoked when the user commits an edit in single-cell mode (Enter, Save button, or blur). |
| `options` | `SEditableCellOption[]` | No | Select options when `type="select"`. |
| `placeholder` | `string` | No |  |
| `renderDisplay` | `(value: V) => React.ReactNode` | No | Custom display renderer when not editing. |
| `saveOnBlur` | `boolean` | No | Commit on blur instead of requiring explicit Enter / Save click. |
| `showActions` | `boolean` | No | Render explicit Save / Cancel icon buttons next to the input (defaults to `true` when `editing` is uncontrolled). |
| `type` | `'text' \| 'number' \| 'select'` | No | Input control variant rendered during edit mode. |
| `validate` | `(value: V) => string \| null \| undefined` | No | Optional synchronous validator returning an error message string. |
| `value` | `V` | Yes | Current committed cell value (or live value in controlled batch mode). |

### `SKpiCard` (`component` · `@chenyqthu/omada-ui-kit/core`)
Compact Omada KPI metric tile with tabular numerals, optional icon, and breakdown meta line.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `accentColor` | `string` | No |  |
| `active` | `boolean` | No |  |
| `className` | `string` | No |  |
| `icon` | `React.ReactNode` | No |  |
| `meta` | `React.ReactNode` | No |  |
| `onClick` | `() => void` | No |  |
| `title` | `string` | Yes |  |
| `value` | `React.ReactNode` | Yes |  |

### `SProgress` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-styled Progress component supporting linear (`6px` pill bar), circular (`112px` ring), all 5 Figma visual states (`normal`, `active`, `success`, `warning`, `exception`), `indeterminate` animation, and a `variant="budget"` PoE power budget preset.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `dangerThreshold` | `number` | No | Percentage threshold switching `budget` status to `exception` (defaults to `95`) |
| `indeterminate` | `boolean` | No | Animated indeterminate linear progress bar (ignores `percent`) |
| `label` | `React.ReactNode` | No | Optional header label rendered above linear progress or budget bar |
| `status` | `SProgressStatus` | No | All 5 Figma visual states: `normal`, `active`, `success`, `warning`, `exception` |
| `strokeHeight` | `number` | No | Linear stroke thickness in px (defaults to `6` matching Figma spec) |
| `total` | `number` | No | Total capacity value for `variant="budget"` (e.g., `384`) |
| `unit` | `string` | No | Unit suffix for `variant="budget"` readout (defaults to `'W'`) |
| `used` | `number` | No | Used resource value for `variant="budget"` (e.g., `186.4`) |
| `variant` | `SProgressVariant` | No | Standard progress bar/ring (`default`) or resource/PoE power budget readout (`budget`) |
| `warningThreshold` | `number` | No | Percentage threshold switching `budget` status to `warning` (defaults to `80`) |
- **Inherited AntD props**: `children`, `className`, `classNames`, `format`, `gapDegree`, `gapPlacement`, `percent`, `percentPosition`, `railColor`, `rootClassName`, `rounding`, `showInfo`, `size`, `steps`, `strokeColor`, `strokeLinecap`, `strokeWidth`, `style`, `styles`, `success`, `type`

### `STable` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Data Table wrapping AntD `Table` with an integrated toolbar (tabs, search, filters, column settings popover, density toggle, slide-in batch action bar), expandable row styling, and Omada's `Showing X-Y of Z records` footer.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `agentLabel` | `string` | No | Optional accessible label exposed in Agent Bridge `snapshot()` / `query()`. |
| `columnSettings` | `boolean` | No | Show a column visibility checklist popover button in the toolbar. |
| `defaultDensity` | `STableDensity` | No | Initial uncontrolled density when `densityToggle` is enabled. |
| `density` | `STableDensity` | No | Controlled table density (`'default' \| 'compact'`). |
| `densityToggle` | `boolean` | No | Show a `'default' \| 'compact'` row density switcher in the toolbar. |
| `onDensityChange` | `(density: STableDensity) => void` | No | Callback invoked when density changes via `densityToggle`. |
| `pagination` | `false \| TablePaginationConfig` | No |  |
| `toolbar` | `STableToolbarProps` | No |  |
- **Inherited AntD props**: `bordered`, `caption`, `children`, `className`, `classNames`, `column`, `columns`, `components`, `dataSource`, `direction`, `dropdownPrefixCls`, `expandable`, `footer`, `getContainerWidth`, `getPopupContainer`, `id`, `loading`, `locale`, `measureRowRender`, `onChange`, `onHeaderRow`, `onRow`, `onScroll`, `rootClassName`, `rowClassName`, `rowHoverable`, `rowKey`, `rowSelection`, `scroll`, `showHeader`, `showSorterTooltip`, `size`, `sortDirections`, `sticky`, `style`, `styles`, `summary`, `tableLayout`, `tailor`, `title`, `virtual`

### `STabs` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Tabs supporting: - `line`: AntD primary underline tabs (`34px` height, `#00A870` indicator) - `page`: Omada Controller v6.3 `18px` (`lg`) or `15px` (`md`) underline page/settings sub-tabs - `filter`: Omada Controller v6.3 `32px` neutral track + active green-text surface pill switcher (`dotColor`, `count`, `block`) - `capsule`: Omada green active capsule tabs (or `pill` rounded-full) - `segment`: neutral surface segmented switcher with optional legend dot

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeKey` | `string` | No |  |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `block` | `boolean` | No | Expands `filter` / `segment` / `capsule` track to full width with equal-width tab buttons. |
| `bordered` | `boolean` | No | Renders the full-width bottom divider line when `variant="page"` (default `true`). |
| `className` | `string` | No |  |
| `defaultActiveKey` | `string` | No |  |
| `extra` | `React.ReactNode` | No |  |
| `items` | `STabItem[]` | Yes |  |
| `onChange` | `(key: string) => void` | No |  |
| `pill` | `boolean` | No |  |
| `size` | `STabsPageSize` | No | Font/spacing scale for `variant="page"` (`'lg'`: 18px header tabs, `'md'`: 15px sub-section/drawer tabs). |
| `variant` | `STabsVariant` | No |  |

### `STag` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada status/category tag (`20px` height, `3px` radius, `subtle` or `solid` fill).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `color` | `STagColor` | No |  |
| `variant` | `'subtle' \| 'solid'` | No |  |

### `STile` (`component` · `@chenyqthu/omada-ui-kit/core`)
Selectable Omada option tile (`Normal`, `Hover`, `Selected` green border + corner checkmark, `Disabled`) usable standalone or inside `<STileGroup>`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `badge` | `React.ReactNode` | No |  |
| `checked` | `boolean` | No | Controlled selection state when used standalone. |
| `className` | `string` | No |  |
| `defaultChecked` | `boolean` | No | Default uncontrolled selection state when used standalone. |
| `description` | `React.ReactNode` | No |  |
| `disabled` | `boolean` | No |  |
| `icon` | `React.ReactNode` | No |  |
| `indicator` | `'corner-check' \| 'check' \| 'none'` | No |  |
| `layout` | `STileLayout` | No |  |
| `onChange` | `(checked: boolean) => void` | No | Change callback when used standalone. |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | No |  |
| `onKeyDown` | `React.KeyboardEventHandler<HTMLButtonElement>` | No |  |
| `selectionMode` | `STileSelectionMode` | No |  |
| `size` | `'sm' \| 'md'` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `title` | `React.ReactNode` | Yes |  |
| `value` | `string` | No | Option identifier when used inside `<STileGroup>`. |

### `STileGroup` (`component` · `@chenyqthu/omada-ui-kit/core`)
Single- or multi-select Omada option tile group supporting declarative `options` or composable `<STile>` children, with roving `radiogroup` arrow-key focus in `single` mode.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | No |  |
| `className` | `string` | No |  |
| `columns` | `1 \| 2 \| 3 \| 4 \| 'auto'` | No |  |
| `defaultValue` | `string[] \| string` | No |  |
| `disabled` | `boolean` | No |  |
| `indicator` | `'corner-check' \| 'check' \| 'none'` | No |  |
| `layout` | `STileLayout` | No |  |
| `mode` | `'multiple' \| 'single'` | No |  |
| `onChange` | `(value: string[]) => void \| (value: string) => void` | No |  |
| `options` | `STileOption[]` | No |  |
| `size` | `'sm' \| 'md'` | No |  |
| `value` | `string[] \| string` | No |  |
