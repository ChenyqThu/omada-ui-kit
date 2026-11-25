# Theme, Layout, Navigation & Headless Focus (`@chenyqthu/omada-ui-kit/core`)

Application theme provider (global or scoped micro-frontend mode), classic app shell, page headers, steps/breadcrumbs/pagination, and WAI-ARIA roving focus.

### `SAnchor` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Anchor (`35368:149692`): - Right-rail vertical TOC (and horizontal strip) with optional section `title` - Supports L1 + L2 indented links plus Normal, Hover, Active, Disabled, and Error states.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activeHref` | `string` | No | Optional controlled/highlighted active href when not relying solely on scroll spy. |
| `direction` | `SAnchorDirection` | No | Layout orientation (`vertical` right-rail TOC or `horizontal` strip). |
| `items` | `SAnchorItem[]` | Yes | Anchor TOC items supporting L1 + L2 nesting (in vertical direction). |
| `title` | `React.ReactNode` | No | Optional TOC rail heading rendered above the anchor list. |
- **Inherited AntD props**: `affix`, `bounds`, `className`, `classNames`, `getContainer`, `getCurrentAnchor`, `offsetTop`, `onChange`, `onClick`, `replace`, `rootClassName`, `showInkInFixed`, `style`, `styles`, `targetOffset`

### `SAppShell` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Controller v6.3 layout shell: - `56px` gradient Top Bar supporting `standard` / `pro` (`<SBrandAsset name="omada-pro" />`) / `msp` editions and `controller` / `central` / `portal` / `account` shell variants - `216px` / `52px` collapsible left Sidebar with nested collapsible `children` submenus - Light / Dark / System theme switcher & scrollable content viewport

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `accountTitle` | `React.ReactNode` | No | Context title shown next to the logo when `shellVariant="account"`. |
| `activeKey` | `string` | Yes |  |
| `activeServiceKey` | `string` | No |  |
| `activeSite` | `string` | No |  |
| `activeTopNavKey` | `string` | No |  |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `collapsed` | `boolean` | No | Controlled sidebar collapsed state. |
| `defaultCollapsed` | `boolean` | No |  |
| `edition` | `SAppShellEdition` | No | Top Bar branding & tier presentation (`standard`, `pro` using `<SBrandAsset name="omada-pro" />`, or `msp`). |
| `embedded` | `boolean` | No | Bounded container mode (`h-[520px]`) for embedded previews and showcase demos. |
| `navGroups` | `SNavGroup[]` | Yes |  |
| `notificationCount` | `number` | No |  |
| `onCollapsedChange` | `(collapsed: boolean) => void` | No |  |
| `onNotificationClick` | `() => void` | No |  |
| `onSearchClick` | `() => void` | No |  |
| `onSelect` | `(key: string) => void` | Yes |  |
| `onServiceChange` | `(key: string) => void` | No |  |
| `onSignOut` | `() => void` | No |  |
| `onSiteChange` | `(siteKey: string) => void` | No |  |
| `onTopNavSelect` | `(key: string) => void` | No |  |
| `orgTags` | `string[]` | No | Optional organization tags displayed in the Top Bar (e.g. `['Cluster', 'MSP']`). |
| `serviceTabs` | `SAppShellServiceItem[]` | No | Service switcher tabs used when `shellVariant="central"`. |
| `shellVariant` | `SAppShellVariant` | No | Shell presentation variant (`controller`, `central`, `portal`, or `account`). |
| `showSidebar` | `boolean` | No | Whether to display the left sidebar (defaults to `true`). |
| `sites` | `SSiteOption[]` | No |  |
| `topBarExtra` | `React.ReactNode` | No |  |
| `topNavItems` | `SAppShellTopNavItem[]` | No | Horizontal top-bar navigation tabs used when `shellVariant="portal"`. |
| `userEmail` | `string` | No |  |
| `userName` | `string` | No |  |

### `SBreadcrumb` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Breadcrumb (`35368:151120`) supporting text, icon-only, icon + text, automatic middle `...` collapse dropdown for deep paths, and truncated ellipsis tooltips.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `items` | `SBreadcrumbItem[]` | Yes | Breadcrumb hierarchy items (AntD 6 `items` API). |
| `maxItems` | `number` | No | Maximum visible items before middle ancestors collapse into a `...` dropdown menu. |
| `maxItemWidth` | `number` | No | Optional pixel width cap on item text triggering ellipsis truncation + hover Tooltip. |
| `separatorVariant` | `'chevron' \| 'slash'` | No | Built-in separator glyph when `separator` prop is omitted. |
- **Inherited AntD props**: `className`, `classNames`, `dropdownIcon`, `itemRender`, `params`, `rootClassName`, `separator`, `style`, `styles`

### `SDivider` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Divider (`3:64432`): - `1px` `--omada-border-divider` hairline horizontal & vertical dividers - Titled dividers (`Manrope 12px` `--omada-text-tertiary`) and `inset` form margins (`24px`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `dashed` | `boolean` | No | Convenience dashed toggle mapped cleanly to `variant="dashed"`. |
| `inset` | `boolean` | No | Adds Figma's 24px (`px-6`) horizontal inset margin for settings form panels. |
| `orientation` | `SDividerOrientation` | No | Divider orientation (AntD 6 `orientation`; replaces deprecated `type`). |
| `size` | `SDividerSize` | No | Vertical spacing density (`small` or `medium`). |
| `titlePlacement` | `SDividerTitlePlacement` | No | Title position when children are provided. |
| `variant` | `SDividerVariant` | No | Stroke style (`solid`, `dashed`, or `dotted`). |
- **Inherited AntD props**: `children`, `className`, `classNames`, `plain`, `rootClassName`, `style`, `styles`, `vertical`

### `SDropdown` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Dropdown Menu (`3:64442`): - AntD 6 `popupRender` + `destroyOnHidden` + semantic `classNames`/`styles` - Width presets (`178px`, `216px`, `275px`), grouped sections, checkable items, nested submenus, and optional built-in search & footer slots.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `footer` | `React.ReactNode` | No | Optional footer element rendered below the menu list. |
| `header` | `React.ReactNode` | No | Optional header element rendered above the menu list. |
| `items` | `SDropdownItem[]` | No | Convenience menu items array when not passing a full `menu` object. |
| `menuWidth` | `number \| string` | No | Explicit popup menu width override. |
| `onSelect` | `(key: string) => void` | No | Convenience click handler invoked with the clicked menu item key. |
| `placement` | `SDropdownPlacement` | No | Popup placement (uses AntD 6 non-deprecated placement tokens). |
| `searchable` | `boolean` | No | Displays a search input at the top of the dropdown panel. |
| `searchPlaceholder` | `string` | No | Placeholder for the dropdown search input. |
| `selectable` | `boolean` | No | Enables check indicator rendering on selected items. |
| `selectedKeys` | `string[]` | No | Selected item keys highlighted with brand tint and check indicator. |
| `widthPreset` | `SDropdownWidthPreset` | No | Width preset matching Figma `3:64442` (`compact`: 178px, `default`: 216px, `wide`: 275px). |
- **Inherited AntD props**: `align`, `arrow`, `autoAdjustOverflow`, `autoFocus`, `children`, `className`, `classNames`, `destroyOnHidden`, `disabled`, `forceRender`, `getPopupContainer`, `menu`, `mouseEnterDelay`, `mouseLeaveDelay`, `onOpenChange`, `open`, `openClassName`, `popupRender`, `rootClassName`, `styles`, `transitionName`, `trigger`

### `SPageHeader` (`component` · `@chenyqthu/omada-ui-kit/core`)
Standard Omada page header supporting optional back navigation, description (`subtitle` alias), tabs, and right-aligned actions.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `description` | `React.ReactNode` | No |  |
| `extra` | `React.ReactNode` | No |  |
| `onBack` | `() => void` | No |  |
| `subtitle` | `React.ReactNode` | No | Alias for `description` kept for backward compatibility with single-file templates. |
| `tabs` | `React.ReactNode` | No |  |
| `title` | `React.ReactNode` | Yes |  |

### `SPagination` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Pagination (`43:34717`) supporting `default` (summary + pages + size changer), `simple` (compact prev/input/next), and `minimal` (borderless numeric hover hotspots).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `align` | `'between' \| 'left' \| 'right' \| 'center'` | No | Horizontal alignment of the pagination bar. |
| `showSummary` | `boolean` | No | Displays the `Showing X–Y of Z records` summary label (defaults to `true` for `default` variant). |
| `simpleReadOnly` | `boolean` | No | Read-only toggle when `variant="simple"`. |
| `size` | `SPaginationSize` | No | Component density (`small` or `medium`; never passes deprecated `size="default"` to AntD 6). |
| `summaryRender` | `(range: [number, number], total: number) => React.ReactNode` | No | Custom formatter for the summary text when `showSummary` is enabled. |
| `variant` | `SPaginationVariant` | No | Visual variant matching Figma `43:34717`: full (`default`), compact input (`simple`), or borderless hotspots (`minimal`). |
- **Inherited AntD props**: `className`, `classNames`, `components`, `current`, `defaultCurrent`, `defaultPageSize`, `disabled`, `hideOnSinglePage`, `itemRender`, `jumpNextIcon`, `jumpPrevIcon`, `locale`, `nextIcon`, `onChange`, `onShowSizeChange`, `pageSize`, `pageSizeOptions`, `prevIcon`, `responsive`, `role`, `rootClassName`, `selectPrefixCls`, `showLessItems`, `showPrevNextJumpers`, `showQuickJumper`, `showSizeChanger`, `showTitle`, `showTotal`, `style`, `styles`, `total`, `totalBoundaryShowSizeChanger`

### `SSteps` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Steps (`3:64441`) supporting horizontal, vertical, navigation, dot, and loading states using AntD 6 `orientation`, `titlePlacement`, and `content` APIs.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `items` | `SStepItem[]` | Yes | Step definitions rendered in sequence. |
| `loading` | `boolean` | No | Displays a spinning loader on the active (`current`) step item. |
| `orientation` | `SStepsOrientation` | No | Layout orientation (AntD 6 `orientation`; defaults to `'horizontal'`). |
| `size` | `SStepsSize` | No | Step size (`small` or `medium`; never passes deprecated `size="default"`). |
| `titlePlacement` | `'horizontal' \| 'vertical'` | No | Title/content placement relative to icon (`horizontal` or `vertical`). |
| `type` | `SStepsType` | No | Visual style (`default`, `navigation`, `inline`, or `dot`). |
- **Inherited AntD props**: `className`, `classNames`, `current`, `ellipsis`, `iconRender`, `initial`, `maxCount`, `offset`, `onChange`, `percent`, `responsive`, `rootClassName`, `status`, `style`, `styles`, `variant`

### `useRovingFocus` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Headless WAI-ARIA roving `tabIndex` hook supporting horizontal, vertical, and 2D grid navigation, `Home` / `End` jumps, optional circular looping, and automatic or manual activation.

### `buildOmadaAntdTheme` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Builds the Ant Design 5 ThemeConfig mapped from Omada semantic tokens.

### `OmadaProvider` (`component` · `@chenyqthu/omada-ui-kit/core`)
Root theme & styling provider for Omada UI Kit. Syncs Light / Dark / System mode to `<html data-theme>` + `.dark` (or local `.omada-scope` when `syncDocumentTheme={false}`) and wraps AntD 6 `<StyleProvider layer>`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `defaultThemeMode` | `ThemeMode` | No |  |
| `syncDocumentTheme` | `boolean` | No | When `true` (default), syncs `<html data-theme>` and `.dark` on `document.documentElement`. When `false`, isolates theme variables to a local `<div className="omada-scope" data-theme={resolvedTheme}>` container and mounts Ant Design popups inside that container so host apps are never mutated. |

### `useOmadaTheme` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Access current Omada theme mode (`light` | `dark` | `system`), resolved theme, and semantic tokens.

## Scoped Micro-Frontend Mode
Import `@chenyqthu/omada-ui-kit/style.scoped.css` and render `<OmadaProvider syncDocumentTheme={false}>` to scope CSS custom properties and AntD popup portals inside `.omada-scope` without mutating `document.documentElement`.
