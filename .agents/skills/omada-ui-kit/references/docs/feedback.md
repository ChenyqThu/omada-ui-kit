# Feedback, Overlays & Empty States (`@chenyqthu/omada-ui-kit/core`)

Contextual banners, modals (`useOmadaConfirm`), slide-out drawers, toast/notification hooks (`useOmadaFeedback`), tooltips, popovers, loading states, and themed empty states.

### `SAlert` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada borderless 12%-tinted banner alert (`6px` radius, `12px 16px` padding).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `action` | `React.ReactNode` | No |  |
| `align` | `'left' \| 'center'` | No |  |
| `className` | `string` | No |  |
| `closable` | `boolean` | No |  |
| `description` | `React.ReactNode` | No |  |
| `onClose` | `() => void` | No |  |
| `title` | `React.ReactNode` | No |  |
| `type` | `SAlertType` | No |  |

### `SDrawer` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada slide-over Drawer (`sm`: 480px, `md`: 640px, `lg`: 880px) supporting a rich header slot with subtitle, status badge, tabs, and loading skeleton.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `headerTabs` | `React.ReactNode` | No |  |
| `loading` | `boolean` | No | Displays a skeleton placeholder inside the drawer body while data loads |
| `size` | `SDrawerSize` | No |  |
| `statusSlot` | `React.ReactNode` | No |  |
| `subtitle` | `React.ReactNode` | No |  |
| `width` | `number \| string` | No |  |
- **Inherited AntD props**: `afterOpenChange`, `autoFocus`, `children`, `className`, `classNames`, `closable`, `closeIcon`, `defaultSize`, `destroyOnHidden`, `drawerRender`, `extra`, `focusable`, `footer`, `forceRender`, `getContainer`, `id`, `keyboard`, `mask`, `maskClassName`, `maskMotion`, `maxSize`, `motion`, `onClick`, `onClose`, `onFocus`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onMouseOver`, `open`, `panelRef`, `placement`, `push`, `resizable`, `rootClassName`, `rootStyle`, `style`, `styles`, `title`, `zIndex`

### `SDrawerFooter` (`component` · `@chenyqthu/omada-ui-kit/core`)
Standardized Omada drawer footer bar for `SDrawer`'s `footer` prop or sticky bottom body placement.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `align` | `'left' \| 'right' \| 'between'` | No |  |
| `cancelText` | `React.ReactNode \| null` | No |  |
| `children` | `React.ReactNode` | No |  |
| `className` | `string` | No |  |
| `danger` | `boolean` | No |  |
| `extra` | `React.ReactNode` | No |  |
| `loading` | `boolean` | No |  |
| `okDisabled` | `boolean` | No |  |
| `okText` | `React.ReactNode \| null` | No |  |
| `onCancel` | `() => void` | No |  |
| `onOk` | `() => void` | No |  |
| `sticky` | `boolean` | No | Make footer sticky inside scrollable drawer body (adds top border & surface fill) |

### `SEmpty` (`component` · `@chenyqthu/omada-ui-kit/core`)
Clean Omada empty state placeholder for tables, drawers, and sub-panels. Defaults to the official theme-aware Figma `no-data` illustration unless overridden via `icon` or `illustration={false}`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `action` | `React.ReactNode` | No |  |
| `className` | `string` | No |  |
| `description` | `React.ReactNode` | No |  |
| `icon` | `React.ReactNode` | No |  |
| `illustration` | `OmadaIllustrationName \| false` | No |  |
| `illustrationWidth` | `number` | No |  |
| `title` | `React.ReactNode` | No |  |

### `SInfoDialog` (`component` · `@chenyqthu/omada-ui-kit/core`)
Status/result information dialog using official Figma status icons or illustrations, supporting centered result layouts, progress content, and Stop/OK actions.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `actions` | `React.ReactNode` | No | Custom action nodes replacing the default footer buttons |
| `cancelButtonProps` | `SButtonProps` | No |  |
| `cancelText` | `React.ReactNode \| null` | No | Optional secondary/stop action label (e.g., `'Stop'` or `'Cancel'`) |
| `children` | `React.ReactNode` | No | Optional extra body content (e.g., progress bar, status metadata) |
| `danger` | `boolean` | No |  |
| `description` | `React.ReactNode` | No |  |
| `footer` | `SModalProps['footer']` | No |  |
| `footerAlign` | `'left' \| 'right'` | No | Alignment of the default modal footer actions |
| `icon` | `React.ReactNode` | No | Custom icon overriding the default status icon |
| `illustration` | `OmadaIllustrationName` | No | Optional Figma illustration slug (`<SIllustration />`) displayed above the title |
| `layout` | `'centered' \| 'header'` | No | Centered hero dialog (`centered`) or compact top-aligned header (`header`) |
| `okButtonProps` | `SButtonProps` | No |  |
| `okText` | `React.ReactNode \| null` | No | Primary action label; pass `null` to omit |
| `okVariant` | `SButtonProps['variant']` | No | Variant override for the primary action button |
| `size` | `SModalSize` | No |  |
| `status` | `SInfoDialogStatus` | No | Semantic status icon state matching Figma Dialog specs |
| `subtitle` | `React.ReactNode` | No | Optional subtitle rendered beneath the modal title |
| `title` | `React.ReactNode` | Yes |  |
| `width` | `number \| string` | No |  |
- **Inherited AntD props**: `afterClose`, `afterOpenChange`, `bodyProps`, `centered`, `className`, `classNames`, `closable`, `closeIcon`, `confirmLoading`, `destroyOnHidden`, `focusable`, `forceRender`, `getContainer`, `height`, `keyboard`, `loading`, `mask`, `maskProps`, `maskTransitionName`, `modalRender`, `mousePosition`, `okType`, `onCancel`, `onOk`, `open`, `panelRef`, `rootClassName`, `rootStyle`, `scrollLock`, `style`, `styles`, `transitionName`, `visible`, `wrapClassName`, `wrapProps`, `wrapStyle`, `zIndex`

### `SLoading` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada loading spinner & container overlay backed by official Figma conic-ring SVG icons (`16px` inline, `20px` default, `32px` container/fullscreen) and Ant Design 6 `<Spin>`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `description` | `React.ReactNode` | No | Optional loading label rendered with 8px gap next to or below the spinner |
| `layout` | `'horizontal' \| 'vertical'` | No | Inline arrangement (`horizontal` matches Figma `Loading..` bar; `vertical` stacks centered) |
| `size` | `SLoadingSize` | No | Spinner diameter preset (`sm`: 16px, `md`: 20px, `lg`: 32px) or custom px |
| `tone` | `SLoadingTone` | No | Visual spinner color tone (`brand`: Omada Green, `neutral`: grey/adaptive, `inverse`: white) |
- **Inherited AntD props**: `children`, `className`, `classNames`, `delay`, `fullscreen`, `indicator`, `percent`, `rootClassName`, `spinning`, `style`, `styles`

### `SMask` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada backdrop overlay (`rgba(0, 0, 0, 0.40)` matching Figma `43:34769` Mask) for page-level or container/card-level blocking with optional frosted blur and centered content.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `blur` | `boolean` | No | Applies a 4px frosted glass backdrop blur |
| `children` | `React.ReactNode` | No |  |
| `className` | `string` | No |  |
| `loading` | `boolean` | No | Renders a centered inverse loading spinner inside the mask |
| `loadingText` | `React.ReactNode` | No | Optional text beneath the mask loading spinner |
| `onClick` | `React.MouseEventHandler<HTMLDivElement>` | No | Optional backdrop click handler |
| `open` | `boolean` | No | Controls visibility of the backdrop mask |
| `scope` | `'container' \| 'page'` | No | Covers either its positioned parent (`container`) or the full viewport (`page`) |
| `style` | `React.CSSProperties` | No |  |
| `zIndex` | `number` | No | Custom z-index (`10` for container, `1100` for page by default) |

### `SModal` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-styled Modal supporting preset sizes (`sm`: 480px, `confirm`: 540px, `default`: 640px, `centered`: 764px, `form`: 880px, `xl`: 1040px), optional header icon/subtitle slots, and Omada Secondary/Primary/Danger footer buttons.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `cancelButtonProps` | `SButtonProps` | No |  |
| `danger` | `boolean` | No |  |
| `footerAlign` | `'left' \| 'right'` | No | Alignment of the default modal footer actions |
| `icon` | `React.ReactNode` | No | Optional leading icon rendered in the modal header |
| `okButtonProps` | `SButtonProps` | No |  |
| `size` | `SModalSize` | No |  |
| `subtitle` | `React.ReactNode` | No | Optional subtitle rendered beneath the modal title |
| `width` | `number \| string` | No |  |
- **Inherited AntD props**: `afterClose`, `afterOpenChange`, `bodyProps`, `cancelText`, `centered`, `children`, `className`, `classNames`, `closable`, `closeIcon`, `confirmLoading`, `destroyOnHidden`, `focusable`, `footer`, `forceRender`, `getContainer`, `height`, `keyboard`, `loading`, `mask`, `maskProps`, `maskTransitionName`, `modalRender`, `mousePosition`, `okText`, `okType`, `onCancel`, `onOk`, `open`, `panelRef`, `rootClassName`, `rootStyle`, `scrollLock`, `style`, `styles`, `title`, `transitionName`, `visible`, `wrapClassName`, `wrapProps`, `wrapStyle`, `zIndex`

### `SNotification` (`component` · `@chenyqthu/omada-ui-kit/core`)
Static/inline Omada notification card matching Figma `43:34759` specs (`--omada-bg-popover`, `--omada-shadow-popover`, semantic Figma status icons, and action slots).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `actions` | `React.ReactNode` | No | Action buttons rendered at the bottom-right of the notification card |
| `className` | `string` | No |  |
| `closable` | `boolean` | No | Whether the close button is displayed (defaults to `true`) |
| `description` | `React.ReactNode` | No | Optional multi-line body description |
| `icon` | `React.ReactNode` | No | Custom icon overriding the semantic status icon |
| `onClose` | `() => void` | No | Fired when the user clicks the close button |
| `style` | `React.CSSProperties` | No |  |
| `title` | `React.ReactNode` | Yes | Primary notification heading |
| `type` | `SNotificationType` | No | Semantic notification level (`info` \| `success` \| `warning` \| `error`) |

### `SPopconfirm` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-styled Ant Design 6 Popconfirm supporting all 4 Figma icon/description combinations with Omada Primary/Danger and Neutral Secondary action buttons.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `danger` | `boolean` | No | Styles the confirm button as a destructive Omada danger action |
| `icon` | `React.ReactNode \| false \| null` | No | Custom icon node, or pass `null`/`false` to hide the icon (supporting all 4 Figma variants) |
- **Inherited AntD props**: `afterOpenChange`, `align`, `arrow`, `autoAdjustOverflow`, `builtinPlacements`, `cancelButtonProps`, `cancelText`, `children`, `className`, `classNames`, `color`, `defaultOpen`, `description`, `destroyOnHidden`, `disabled`, `forceRender`, `fresh`, `getPopupContainer`, `getTooltipContainer`, `id`, `motion`, `mouseEnterDelay`, `mouseLeaveDelay`, `okButtonProps`, `okText`, `okType`, `onCancel`, `onConfirm`, `onOpenChange`, `onPopupAlign`, `onPopupClick`, `open`, `openClassName`, `placement`, `rootClassName`, `showCancel`, `style`, `styles`, `title`, `trigger`, `unique`, `zIndex`

### `SPopover` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-styled Ant Design 6 Popover with Light/Dark elevation (`--omada-bg-popover`, `--omada-shadow-popover`) and optional header icon/subtitle and footer slots.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `footer` | `React.ReactNode` | No | Optional footer bar rendered below the popover body content |
| `icon` | `React.ReactNode` | No | Optional leading icon rendered alongside the popover title |
| `subtitle` | `React.ReactNode` | No | Optional subtitle rendered beneath the popover title |
- **Inherited AntD props**: `afterOpenChange`, `align`, `arrow`, `autoAdjustOverflow`, `builtinPlacements`, `children`, `className`, `classNames`, `color`, `content`, `defaultOpen`, `destroyOnHidden`, `disabled`, `forceRender`, `fresh`, `getPopupContainer`, `getTooltipContainer`, `id`, `motion`, `mouseEnterDelay`, `mouseLeaveDelay`, `onOpenChange`, `onPopupAlign`, `open`, `openClassName`, `placement`, `rootClassName`, `style`, `styles`, `title`, `trigger`, `unique`, `zIndex`

### `SSkeleton` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada skeleton loading placeholder (`default`, `list`, `table`, `card` presets) using Light/Dark token gradient shimmer (`--omada-bg-field` -> `--omada-bg-field-hover`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `active` | `boolean` | No | Enables animated Light/Dark gradient shimmer (defaults to `true`) |
| `avatar` | `boolean` | No | Shows circular avatar placeholder in `default` / `list` / `card` presets |
| `children` | `React.ReactNode` | No |  |
| `className` | `string` | No |  |
| `columns` | `number` | No | Column count for `table` preset (defaults to `4`) |
| `loading` | `boolean` | No | When `false`, renders `children` instead of the skeleton placeholder |
| `preset` | `SSkeletonPreset` | No | Layout preset (`default` text lines, `list` items, `table` grid, `card` surface) |
| `rows` | `number` | No | Number of placeholder lines/rows (preset-dependent defaults) |
| `style` | `React.CSSProperties` | No |  |

### `SStepModal` (`component` · `@chenyqthu/omada-ui-kit/core`)
Multi-step wizard modal embedding an Ant Design 6 `<Steps>` bar and Back / Next / Finish navigation footer.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `allowStepClick` | `boolean` | No | Enable clicking step headers to navigate directly |
| `backText` | `React.ReactNode` | No |  |
| `cancelButtonProps` | `SButtonProps` | No |  |
| `cancelText` | `React.ReactNode` | No | Text of the Cancel button |
| `current` | `number` | No | Controlled 0-based active step index |
| `danger` | `boolean` | No |  |
| `defaultCurrent` | `number` | No | Initial 0-based step index when uncontrolled |
| `finishText` | `React.ReactNode` | No |  |
| `footerAlign` | `'left' \| 'right'` | No | Alignment of the default modal footer actions |
| `footerExtra` | `React.ReactNode` | No | Optional left-side footer content (defaults to step counter) |
| `icon` | `React.ReactNode` | No | Optional leading icon rendered in the modal header |
| `nextText` | `React.ReactNode` | No |  |
| `okButtonProps` | `SButtonProps` | No |  |
| `onBeforeNext` | `(currentStep: number) => boolean \| void \| Promise<boolean \| void>` | No | Optional guard run before advancing with Next; return `false` or reject to stay on current step |
| `onFinish` | `() => void \| Promise<void>` | No | Fired when clicking Finish on the final step |
| `onStepChange` | `(nextStep: number, prevStep: number) => void` | No | Fired whenever the active step changes |
| `size` | `SModalSize` | No |  |
| `steps` | `SStepModalStep[]` | Yes |  |
| `subtitle` | `React.ReactNode` | No | Optional subtitle rendered beneath the modal title |
| `width` | `number \| string` | No |  |
- **Inherited AntD props**: `afterClose`, `afterOpenChange`, `bodyProps`, `centered`, `className`, `classNames`, `closable`, `closeIcon`, `confirmLoading`, `destroyOnHidden`, `focusable`, `forceRender`, `getContainer`, `height`, `keyboard`, `loading`, `mask`, `maskProps`, `maskTransitionName`, `modalRender`, `mousePosition`, `okText`, `okType`, `onCancel`, `open`, `panelRef`, `rootClassName`, `rootStyle`, `scrollLock`, `style`, `styles`, `title`, `transitionName`, `visible`, `wrapClassName`, `wrapProps`, `wrapStyle`, `zIndex`

### `STooltip` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-styled Ant Design 6 Tooltip defaulting to Figma's 400ms (`0.4s`) hover delay, `#2B2B2B 96%` / `#333333` surface, `4px` radius, and `[6, 8]` compact padding.
- **Inherited AntD props**: `afterOpenChange`, `align`, `arrow`, `autoAdjustOverflow`, `builtinPlacements`, `children`, `className`, `classNames`, `color`, `defaultOpen`, `destroyOnHidden`, `disabled`, `forceRender`, `fresh`, `getPopupContainer`, `getTooltipContainer`, `id`, `motion`, `mouseEnterDelay`, `mouseLeaveDelay`, `onOpenChange`, `onPopupAlign`, `open`, `openClassName`, `overlay`, `placement`, `rootClassName`, `style`, `styles`, `title`, `trigger`, `unique`, `zIndex`

### `STruncatedText` (`component` · `@chenyqthu/omada-ui-kit/core`)
Ellipsis-truncated text that automatically reveals a `200ms` `<STooltip>` ONLY when its rendered content overflows (`scrollWidth > clientWidth` or `scrollHeight > clientHeight`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `as` | `'span' \| 'div' \| 'p'` | No | Wrapper element tag (`'span' \| 'div' \| 'p'`, defaults to `'span'`) |
| `className` | `string` | No |  |
| `forceTooltip` | `boolean` | No | Force showing tooltip regardless of measured overflow |
| `lines` | `number` | No | Number of visible lines before truncation (defaults to `1`) |
| `maxWidth` | `number \| string` | No | Maximum width CSS value (e.g., `180`, `'12rem'`, `'100%'`) |
| `mouseEnterDelay` | `number` | No | Hover delay in seconds (defaults to `0.2` — 200ms per Figma spec) |
| `placement` | `TooltipPlacement` | No | Tooltip placement (defaults to `'top'`) |
| `style` | `React.CSSProperties` | No |  |
| `text` | `string` | Yes | Text string to display with ellipsis truncation |
| `tooltip` | `React.ReactNode` | No | Optional custom tooltip content (defaults to `text`) |

### `useOmadaConfirm` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Theme-aware confirmation dialog presets (`confirm`, `confirmDanger`, `confirmLeave`) backed by `App.useApp().modal`.

### `useOmadaFeedback` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Theme-aware Toast (`message`) and Notification (`notification`) hooks backed by `App.useApp()`.

### `useOmadaNotification` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Theme-aware Omada notification hook backed by Ant Design 6 `App.useApp().notification`. Uses AntD 6 `{ title, description, actions }` APIs and official Figma semantic status icons.
