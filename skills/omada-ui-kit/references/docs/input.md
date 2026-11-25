# Inputs, Selections, Schedules & Forms (`@chenyqthu/omada-ui-kit/core`)

Omada filled-surface text/IP/MAC/password/search inputs (`forwardRef` enabled), selects, cascaders, tree-selects, switches, sliders, grouped tree transfers, 7x24 schedules, and forms.

### `createEmptySchedule` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Creates an empty 7×24 Omada weekly schedule matrix.

### `createPickerDate` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Creates a Dayjs-compatible wrapper backed by a native `Date` so AntD's `@rc-component/picker` dayjs adapter seamlessly promotes it to a real `Dayjs` instance.

### `createSchedulePreset` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Builds a canonical schedule matrix for Omada quick presets (`workdays`, `weekends`, `all`, `clear`).

### `formatFileSize` (`helper` · `@chenyqthu/omada-ui-kit/core`)

### `formatOmadaDateRange` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Formats a date range according to Omada Figma DatePicker (`43:34733`) rules: - Same day: `May 5, 2024` - Same month: `May 5 - 10, 2024` - Cross month (same year): `May 5 - Jun 10, 2024` - Cross year: `May 5, 2024 - May 4, 2025`

### `formatScheduleSummary` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Produces a concise summary string describing active weekly hours (e.g. `Mon–Fri 09:00–18:00 (45 hrs/wk)`).

### `formatSlotRange` (`helper` · `@chenyqthu/omada-ui-kit/core`)

### `normalizeMac` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Normalizes any MAC address string (`aa:bb:cc:dd:ee:ff` or `aabbccddeeff`) into uppercase separated form.

### `normalizeScheduleValue` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Normalizes a partial schedule matrix into a canonical 7-day record with sorted unique hours (`0..23`).

### `parseIpValue` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Parses an IPv4, IPv4/CIDR, or IPv4:Port string into 4 octet strings + optional extra suffix.

### `SButton` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-styled button supporting primary green, neutral filled secondary, green outline, dashed, text, link, danger solid, and danger outline variants.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `variant` | `SButtonVariant` | No |  |
- **Inherited AntD props**: `autoInsertSpace`, `block`, `children`, `className`, `classNames`, `color`, `disabled`, `ghost`, `href`, `htmlType`, `icon`, `iconPlacement`, `loading`, `rootClassName`, `shape`, `size`, `styles`
- **Common React/DOM props**: `autoFocus`, `defaultChecked`, `defaultValue`, `id`, `name`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `rel`, `role`, `style`, `tabIndex`, `target`, `title`, `value`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SCascader` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Cascader control defaulting to `variant="filled"`, supporting single and multi-select hierarchical paths with customizable `displayRender` and removable Omada tags.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `displaySeparator` | `React.ReactNode` | No | Separator rendered between path segments in the default `displayRender` (defaults to `' / '`). |
- **Inherited AntD props**: `allowClear`, `animation`, `autoComplete`, `autoFocus`, `builtinPlacements`, `changeOnSelect`, `checkStrictly`, `children`, `choiceTransitionName`, `className`, `classNames`, `components`, `defaultOpen`, `defaultValue`, `direction`, `disabled`, `displayRender`, `expandIcon`, `expandTrigger`, `fieldNames`, `getInputElement`, `getPopupContainer`, `getRawInputElement`, `id`, `loadData`, `loading`, `loadingIcon`, `maxCount`, `maxLength`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `multiple`, `notFoundContent`, `onBlur`, `onChange`, `onClear`, `onClick`, `onFocus`, `onInputKeyDown`, `onKeyDown`, `onKeyUp`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onOpenChange`, `onPopupScroll`, `open`, `optionRender`, `options`, `placeholder`, `placement`, `popupAlign`, `popupMatchSelectWidth`, `popupPrefixCls`, `popupRender`, `popupStyle`, `prefix`, `removeIcon`, `rootClassName`, `showAction`, `showCheckedStrategy`, `showScrollBar`, `showSearch`, `size`, `status`, `style`, `styles`, `suffix`, `tabIndex`, `tagRender`, `title`, `transitionName`, `value`, `variant`
- **Common React/DOM props**: `role`

### `SCheckbox` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Checkbox with optional secondary `description` line aligned cleanly under the label.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `description` | `React.ReactNode` | No | Optional explanatory copy rendered 4px beneath the checkbox label. |
- **Inherited AntD props**: `autoFocus`, `checked`, `children`, `className`, `classNames`, `defaultChecked`, `disabled`, `id`, `indeterminate`, `name`, `onBlur`, `onChange`, `onClick`, `onFocus`, `onKeyDown`, `onKeyPress`, `onMouseEnter`, `onMouseLeave`, `required`, `rootClassName`, `skipGroup`, `style`, `styles`, `tabIndex`, `title`, `type`, `value`

### `SCheckboxGroup` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Checkbox Group supporting `default` and linear `button` variants, option descriptions, fixed-width grid alignment, and an integrated `showSelectAll` toggle.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `direction` | `'horizontal' \| 'vertical'` | No | Arrangement axis of group items (`horizontal` wraps cleanly; `vertical` stacks). |
| `itemWidth` | `number \| string` | No | Optional fixed width per item (e.g. `160` for Figma's 160px grid alignment). |
| `options` | `Array<SCheckboxOption<T> \| string \| number>` | No | Array of checkbox options or primitive values. |
| `selectAllLabel` | `React.ReactNode` | No | Label for the Select All header checkbox (defaults to `'Select All'`). |
| `showSelectAll` | `boolean` | No | Renders a Select All header checkbox with automatic indeterminate state. |
| `variant` | `SCheckboxGroupVariant` | No | Visual variant: standard checkboxes (`default`) or linear selectable button pills (`button`). |
- **Inherited AntD props**: `children`, `className`, `classNames`, `defaultValue`, `disabled`, `name`, `onChange`, `rootClassName`, `style`, `styles`, `value`
- **Common React/DOM props**: `role`

### `SColorPicker` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada ColorPicker with a `32px` filled trigger (`min-width: 171px` with HEX readout), curated Omada palette presets, and full Light/Dark theme legibility.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `presetColors` | `string[]` | No | Optional custom list of hex/css colors prepended as a quick palette group. |
| `showPresets` | `boolean` | No | Toggle default Omada curated preset swatches (defaults to `true`). |
| `status` | `'error' \| 'warning'` | No | Validation border state (`'error'` or `'warning'`). |
- **Inherited AntD props**: `allowClear`, `arrow`, `autoAdjustOverflow`, `children`, `className`, `classNames`, `defaultFormat`, `defaultValue`, `destroyOnHidden`, `disabled`, `disabledAlpha`, `disabledFormat`, `format`, `getPopupContainer`, `mode`, `onChange`, `onChangeComplete`, `onClear`, `onFormatChange`, `onOpenChange`, `open`, `panelRender`, `placement`, `presets`, `rootClassName`, `showText`, `size`, `style`, `styles`, `trigger`, `value`

### `SDatePicker` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada single DatePicker defaulting to filled styling (`#F4F4F4` light / `#272727` dark), official Figma calendar icon, and optional capsule pill appearance.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `capsule` | `boolean` | No | Renders the picker input with an Omada capsule pill silhouette (`rounded-full`). |
- **Inherited AntD props**: `allowClear`, `builtinPlacements`, `cellRender`, `changeOnScroll`, `className`, `classNames`, `components`, `defaultOpen`, `defaultOpenValue`, `defaultPickerValue`, `defaultValue`, `direction`, `disabled`, `disabledDate`, `disabledTime`, `format`, `getPopupContainer`, `hideDisabledOptions`, `hourStep`, `id`, `inputReadOnly`, `locale`, `maxDate`, `maxTagCount`, `millisecondStep`, `minDate`, `minuteStep`, `mode`, `multiple`, `needConfirm`, `nextIcon`, `onBlur`, `onCalendarChange`, `onChange`, `onClear`, `onFocus`, `onKeyDown`, `onOk`, `onOpenChange`, `onPanelChange`, `onPickerValueChange`, `open`, `order`, `panelRender`, `picker`, `pickerValue`, `placeholder`, `placement`, `popupAlign`, `prefix`, `preserveInvalidOnBlur`, `presets`, `prevIcon`, `previewValue`, `removeIcon`, `renderExtraFooter`, `rootClassName`, `secondStep`, `showHour`, `showMillisecond`, `showMinute`, `showNow`, `showSecond`, `showTime`, `showWeek`, `size`, `status`, `style`, `styles`, `suffix`, `superNextIcon`, `superPrevIcon`, `tagRender`, `transitionName`, `use12Hours`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `defaultChecked`, `maxLength`, `minLength`, `name`, `onClick`, `onDoubleClick`, `onInput`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `readOnly`, `rel`, `required`, `role`, `step`, `tabIndex`, `title`, `type`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SForm` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada-configured AntD Form. Defaults to horizontal layout with 200px left-aligned labels and no trailing colon.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | No |  |
- **Inherited AntD props**: `classNames`, `clearOnDestroy`, `colon`, `component`, `disabled`, `feedbackIcons`, `fields`, `form`, `initialValues`, `labelAlign`, `labelCol`, `labelWrap`, `layout`, `name`, `onFieldsChange`, `onFinish`, `onFinishFailed`, `onValuesChange`, `preserve`, `requiredMark`, `rootClassName`, `scrollToFirstError`, `size`, `styles`, `tooltip`, `validateMessages`, `validateTrigger`, `variant`, `wrapperCol`
- **Common React/DOM props**: `autoFocus`, `className`, `defaultChecked`, `defaultValue`, `id`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `rel`, `role`, `style`, `tabIndex`, `target`, `title`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SFormFooter` (`component` · `@chenyqthu/omada-ui-kit/core`)
56px Omada form action bar with top divider and Apply/Cancel buttons.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `align` | `'left' \| 'right'` | No |  |
| `applyText` | `string` | No |  |
| `cancelText` | `string` | No |  |
| `className` | `string` | No |  |
| `disabled` | `boolean` | No |  |
| `extra` | `React.ReactNode` | No |  |
| `loading` | `boolean` | No |  |
| `onApply` | `() => void` | No |  |
| `onCancel` | `() => void` | No |  |
| `sticky` | `boolean` | No |  |

### `SFormItem` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada form row item supporting label info tooltips, 350px default field cap, inline `(Optional)` label, and helper hints.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `fieldWidth` | `number \| 'full'` | No |  |
| `hint` | `React.ReactNode` | No |  |
| `label` | `React.ReactNode` | No |  |
| `optional` | `boolean` | No |  |
| `tooltip` | `React.ReactNode` | No |  |
- **Inherited AntD props**: `children`, `className`, `dependencies`, `initialValue`, `name`, `required`, `rules`, `style`, `validateTrigger`, `valuePropName`

### `SFormSection` (`component` · `@chenyqthu/omada-ui-kit/core`)
Collapsible form section header + divider matching Omada configuration panels.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `children` | `React.ReactNode` | Yes |  |
| `className` | `string` | No |  |
| `collapsible` | `boolean` | No |  |
| `defaultOpen` | `boolean` | No |  |
| `description` | `React.ReactNode` | No |  |
| `extra` | `React.ReactNode` | No |  |
| `title` | `React.ReactNode` | Yes |  |

### `SInput` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada text input defaulting to filled grey background (`#F4F4F4` / `#272727`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `secret` | `boolean` | No | Masks value in Agent Bridge `snapshot()` / `query()` / `act()` when `true`. |
- **Inherited AntD props**: `allowClear`, `autoComplete`, `classNames`, `count`, `disabled`, `htmlSize`, `onClear`, `onPressEnter`, `prefix`, `rootClassName`, `showCount`, `size`, `status`, `styles`, `suffix`, `type`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `className`, `defaultChecked`, `defaultValue`, `id`, `max`, `maxLength`, `min`, `minLength`, `name`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `placeholder`, `readOnly`, `rel`, `required`, `role`, `step`, `style`, `tabIndex`, `title`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SIpInput` (`component` · `@chenyqthu/omada-ui-kit/core`)
Segmented IPv4 / CIDR / IP:Port input matching Omada's filled control specification. Supports dot-key advance, auto-advance, Backspace navigation, and smart clipboard paste.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `defaultValue` | `string` | No |  |
| `disabled` | `boolean` | No |  |
| `extraPlaceholder` | `string` | No |  |
| `mode` | `SIpInputMode` | No |  |
| `onChange` | `(value: string) => void` | No |  |
| `placeholder` | `[string, string, string, string]` | No |  |
| `size` | `'middle' \| 'large'` | No |  |
| `status` | `'error' \| 'warning'` | No |  |
| `value` | `string` | No |  |

### `SMacInput` (`component` · `@chenyqthu/omada-ui-kit/core`)
6-segment hexadecimal MAC address input matching Omada's filled control specification. Auto-uppercases, filters non-hex input, auto-advances across pairs, and formats pasted MACs.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `defaultValue` | `string` | No |  |
| `disabled` | `boolean` | No |  |
| `onChange` | `(value: string) => void` | No |  |
| `separator` | `MacSeparator` | No |  |
| `size` | `'middle' \| 'large'` | No |  |
| `status` | `'error' \| 'warning'` | No |  |
| `value` | `string` | No |  |

### `SNumberInput` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada numeric input defaulting to filled grey background.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
- **Inherited AntD props**: `allowClear`, `changeOnBlur`, `changeOnWheel`, `className`, `classNames`, `controls`, `decimalSeparator`, `defaultValue`, `disabled`, `downHandler`, `formatter`, `keyboard`, `max`, `min`, `mode`, `onChange`, `onClear`, `onInput`, `onPressEnter`, `onStep`, `parser`, `precision`, `prefix`, `readOnly`, `rootClassName`, `size`, `status`, `step`, `stringMode`, `style`, `styles`, `suffix`, `tabIndex`, `upHandler`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `defaultChecked`, `id`, `maxLength`, `minLength`, `name`, `onBlur`, `onClick`, `onDoubleClick`, `onFocus`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `placeholder`, `rel`, `required`, `role`, `title`, `type`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SPasswordInput` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada password input with optional 4-segment strength meter (`Weak` -> `Very Strong`) and live password rule validation checklist (`showRules`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID (masked with `secret: true` by default). |
| `rules` | `PasswordRuleConfig[]` | No | Custom validation rules for `showRules` (defaults to Omada's 4 complexity rules). |
| `secret` | `boolean` | No | Masks value in Agent Bridge `snapshot()` / `query()` / `act()` (defaults to `true`). |
| `showRules` | `boolean` | No | Show live validation checklist rules below the password field. |
| `showStrength` | `boolean` | No | Show the 4-segment password strength indicator bar. |
- **Inherited AntD props**: `action`, `allowClear`, `autoComplete`, `classNames`, `count`, `disabled`, `htmlSize`, `iconRender`, `inputPrefixCls`, `onClear`, `onPressEnter`, `prefix`, `rootClassName`, `showCount`, `size`, `status`, `styles`, `suffix`, `type`, `value`, `variant`, `visibilityToggle`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `className`, `defaultChecked`, `defaultValue`, `id`, `max`, `maxLength`, `min`, `minLength`, `name`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `placeholder`, `readOnly`, `rel`, `required`, `role`, `step`, `style`, `tabIndex`, `title`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SRadio` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Radio control with optional secondary `description` line.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `description` | `React.ReactNode` | No | Optional explanatory copy rendered 4px beneath the radio label. |
- **Inherited AntD props**: `autoFocus`, `checked`, `children`, `className`, `classNames`, `defaultChecked`, `disabled`, `id`, `name`, `onBlur`, `onChange`, `onClick`, `onFocus`, `onKeyDown`, `onKeyPress`, `onMouseEnter`, `onMouseLeave`, `required`, `rootClassName`, `skipGroup`, `style`, `styles`, `tabIndex`, `title`, `type`, `value`

### `SRadioGroup` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Radio Group supporting `default` circle radios (with optional descriptions), linear `button` groups, and segmented `capsule` switchers matching `STabs`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `direction` | `'horizontal' \| 'vertical'` | No | Layout axis for `default` radio items. |
| `options` | `Array<SRadioOption<T> \| string \| number>` | No | Array of radio options or primitive values. |
| `pill` | `boolean` | No | Rounded-full pill shape when `variant="capsule"`. |
| `variant` | `SRadioGroupVariant` | No | Visual presentation: standard radios (`default`), linear buttons (`button`), or segmented pill (`capsule`). |
- **Inherited AntD props**: `block`, `buttonStyle`, `children`, `className`, `classNames`, `defaultValue`, `disabled`, `id`, `name`, `onBlur`, `onChange`, `onFocus`, `onMouseEnter`, `onMouseLeave`, `orientation`, `rootClassName`, `size`, `style`, `styles`, `value`, `vertical`
- **Common React/DOM props**: `role`

### `SRangePicker` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Date RangePicker supporting: - Standard filled RangePicker with quick range presets (`Last 24 Hours`, `Last 7 Days`, `Last 30 Days`) - Capsule filter bar (`capsule`) with `1D · 1W · 1M` segmented pills + Custom calendar range trigger.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `activePreset` | `string` | No | Controlled active preset key in `capsule` mode (`'1d' \| '1w' \| '1m' \| 'custom'`). |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `capsule` | `boolean` | No | Renders Omada's Figma capsule preset switcher (`1D · 1W · 1M` + Custom calendar trigger). |
| `capsulePresets` | `SCapsulePreset[]` | No | Custom preset pills for `capsule` mode (defaults to `1D`, `1W`, `1M`). |
| `defaultPreset` | `string` | No | Initial active preset key in uncontrolled `capsule` mode. |
| `onPresetChange` | `(presetKey: string, range: [Date, Date]) => void` | No | Callback invoked when a capsule preset pill or custom range is selected. |
| `presets` | `RangePickerProps['presets'] \| false` | No | Quick preset list for standard RangePicker (pass `false` to hide default presets). |
- **Inherited AntD props**: `allowClear`, `allowEmpty`, `builtinPlacements`, `cellRender`, `changeOnScroll`, `className`, `classNames`, `components`, `defaultOpen`, `defaultOpenValue`, `defaultPickerValue`, `defaultValue`, `direction`, `disabled`, `disabledDate`, `disabledTime`, `format`, `getPopupContainer`, `hideDisabledOptions`, `hourStep`, `id`, `inputReadOnly`, `locale`, `maxDate`, `millisecondStep`, `minDate`, `minuteStep`, `mode`, `needConfirm`, `nextIcon`, `onBlur`, `onCalendarChange`, `onChange`, `onClear`, `onFocus`, `onKeyDown`, `onOk`, `onOpenChange`, `onPanelChange`, `onPickerValueChange`, `open`, `order`, `panelRender`, `picker`, `pickerValue`, `placeholder`, `placement`, `popupAlign`, `prefix`, `preserveInvalidOnBlur`, `prevIcon`, `previewValue`, `renderExtraFooter`, `rootClassName`, `secondStep`, `separator`, `showHour`, `showMillisecond`, `showMinute`, `showNow`, `showSecond`, `showTime`, `showWeek`, `size`, `status`, `style`, `styles`, `suffix`, `superNextIcon`, `superPrevIcon`, `transitionName`, `use12Hours`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `defaultChecked`, `maxLength`, `minLength`, `name`, `onClick`, `onDoubleClick`, `onInput`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `readOnly`, `rel`, `required`, `role`, `step`, `tabIndex`, `title`, `type`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SRate` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada 5-star Rate component backed by the official Figma star SVG, supporting `sm` (12px), `md` (20px), `lg` (32px), half-stars, `readonly` mode, and rating captions.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `captionRenderer` | `(value: number) => React.ReactNode` | No | Custom caption formatter receiving the active/hovered numeric value. |
| `captions` | `React.ReactNode[]` | No | Optional custom captions indexed `0..(count - 1)`. |
| `readonly` | `boolean` | No | Read-only alias for `disabled`. |
| `showCaption` | `boolean` | No | Show rating summary caption (`1–2`: Fair/Poor, `3–4`: Good/Very Good, `5`: Excellent). |
| `size` | `SRateSize \| number` | No | Named Omada sizes (`sm`: 12px, `md`: 20px, `lg`: 32px) or custom numeric px. |
- **Inherited AntD props**: `allowClear`, `allowHalf`, `autoFocus`, `character`, `characterRender`, `className`, `count`, `defaultValue`, `disabled`, `id`, `keyboard`, `onBlur`, `onChange`, `onFocus`, `onHoverChange`, `onKeyDown`, `onMouseEnter`, `onMouseLeave`, `rootClassName`, `style`, `tabIndex`, `tooltips`, `value`

### `SSchedule` (`component` · `@chenyqthu/omada-ui-kit/core`)
Custom Omada 7-day × 24-hour weekly schedule matrix (`Mon`–`Sun` × `00`–`23`). Supports click toggle, pointer-drag rectangle paint/erase, day/hour header toggles, quick presets (`Workdays 9–18`, `Weekends`, `All Day`, `Clear`), hover tooltips, full keyboard grid navigation, `readOnly`/`disabled` states, and Light/Dark `--omada-*` tokens.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `defaultValue` | `Partial<SScheduleMatrix>` | No | Initial uncontrolled 7×24 schedule matrix (defaults to empty). |
| `disabled` | `boolean` | No | Disable all pointer & keyboard interaction with muted appearance. |
| `onChange` | `(value: SScheduleMatrix) => void` | No | Fired whenever cells are toggled, dragged, or a preset is applied. |
| `presets` | `SSchedulePreset[]` | No | Custom preset button definitions. |
| `readOnly` | `boolean` | No | Prevent edits while retaining full visual contrast and hover tooltips. |
| `showPresets` | `boolean` | No | Render quick preset buttons (`Workdays 9–18`, `Weekends`, `All Day`, `Clear`). |
| `showSummary` | `boolean` | No | Show legend and active weekly hour summary footer. |
| `value` | `Partial<SScheduleMatrix>` | No | Controlled 7×24 schedule matrix. |

### `SSearchInput` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada search input (260px default width, leading search icon, clearable).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `width` | `number \| string` | No |  |
- **Inherited AntD props**: `allowClear`, `autoComplete`, `classNames`, `count`, `disabled`, `htmlSize`, `onClear`, `onPressEnter`, `prefix`, `rootClassName`, `showCount`, `size`, `status`, `styles`, `suffix`, `type`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `className`, `defaultChecked`, `defaultValue`, `id`, `max`, `maxLength`, `min`, `minLength`, `name`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `placeholder`, `readOnly`, `rel`, `required`, `role`, `step`, `style`, `tabIndex`, `title`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `SSelect` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Select control defaulting to `variant="filled"` (`#F4F4F4` Light / `#272727` Dark), supporting single/multiple/tags modes, removable Omada tags, rich icon/description rows, 8-item scroll height (`256px`), and an optional sticky popup footer Add action.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `addNewLabel` | `React.ReactNode` | No | Optional label for the sticky popup footer Add action button. |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `onAddNew` | `() => void` | No | Callback fired when the sticky popup footer Add action is clicked. |
- **Inherited AntD props**: `allowClear`, `animation`, `autoComplete`, `autoFocus`, `builtinPlacements`, `children`, `choiceTransitionName`, `className`, `classNames`, `components`, `defaultActiveFirstOption`, `defaultOpen`, `defaultValue`, `direction`, `disabled`, `fieldNames`, `getPopupContainer`, `id`, `labelInValue`, `labelRender`, `listHeight`, `listItemHeight`, `loading`, `loadingIcon`, `maxCount`, `maxLength`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `menuItemSelectedIcon`, `mode`, `notFoundContent`, `onActive`, `onBlur`, `onChange`, `onClear`, `onClick`, `onDeselect`, `onFocus`, `onInputKeyDown`, `onKeyDown`, `onKeyUp`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onOpenChange`, `onPopupScroll`, `onSelect`, `open`, `optionLabelProp`, `optionRender`, `options`, `placeholder`, `placement`, `popupAlign`, `popupMatchSelectWidth`, `popupRender`, `popupStyle`, `prefix`, `removeIcon`, `rootClassName`, `showAction`, `showScrollBar`, `showSearch`, `size`, `status`, `style`, `styles`, `suffix`, `tabIndex`, `tagRender`, `title`, `tokenSeparators`, `transitionName`, `value`, `variant`, `virtual`
- **Common React/DOM props**: `role`

### `SSlider` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Slider supporting single, range, stepped `marks`/`stepPreset`, paired `showInput` numeric fields with blur clamping, and `color-temp` / `hue` / `brightness` presets.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `endIcon` | `React.ReactNode` | No | Optional trailing icon rendered to the right of the slider track. |
| `handleVariant` | `SSliderHandleVariant` | No | Handle visual variant (`'ring'` bordered thumb vs `'solid'` filled thumb). |
| `preset` | `SSliderPreset` | No | Track color/gradient preset (`'default'` brand green, `'color-temp'`, `'hue'`, `'brightness'`). |
| `segmented` | `boolean` | No | Renders vertical segmented tick bars on stepped sliders. |
| `showInput` | `boolean` | No | Renders paired filled `SNumberInput` field(s) synced with the slider and clamped on blur. |
| `startIcon` | `React.ReactNode` | No | Optional leading icon rendered to the left of the slider track. |
| `stepPreset` | `SSliderStepPreset` | No | Built-in Figma stepped mark presets (`'levels'`, `'1-3'`, `'1-5'`, `'1-10'`, `'0-5'`, `'0-10'`). |
| `unit` | `string` | No | Optional unit label appended in tooltips and paired inputs (e.g. `'K'`, `'%'`, `'dBm'`). |
- **Inherited AntD props**: `ariaDescribedByForHandle`, `ariaLabelForHandle`, `ariaLabelledByForHandle`, `ariaRequired`, `ariaValueTextFormatterForHandle`, `autoFocus`, `className`, `classNames`, `defaultValue`, `disabled`, `dots`, `id`, `included`, `keyboard`, `marks`, `max`, `min`, `onBlur`, `onChange`, `onChangeComplete`, `onFocus`, `orientation`, `range`, `reverse`, `rootClassName`, `step`, `style`, `styles`, `tabIndex`, `tooltip`, `value`, `vertical`

### `SSwitch` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada Switch matching the exact `36×22px` (`medium`) and `28×16px` (`small`) pill geometry, with optional companion `label` and `description` in horizontal or vertical layouts.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `agentId` | `string` | No | Optional deterministic Agent Bridge control ID. |
| `description` | `React.ReactNode` | No | Optional explanatory copy rendered beneath `label`. |
| `gap` | `'sm' \| 'md' \| 'lg'` | No | Spacing between the switch and companion label (`sm`: 4px, `md`: 8px, `lg`: 12px). |
| `label` | `React.ReactNode` | No | Optional primary label rendered alongside the switch. |
| `labelPlacement` | `'end' \| 'start'` | No | Placement of the companion text relative to the switch in horizontal mode. |
| `layout` | `'horizontal' \| 'vertical'` | No | Companion text alignment relative to the switch (`horizontal` or `vertical`). |
| `size` | `'small' \| 'medium'` | No | Switch track geometry (`medium`: 36×22px default, `small`: 28×16px). |
- **Inherited AntD props**: `autoFocus`, `checked`, `checkedChildren`, `className`, `classNames`, `defaultChecked`, `defaultValue`, `disabled`, `id`, `loading`, `onChange`, `onClick`, `rootClassName`, `style`, `styles`, `tabIndex`, `title`, `unCheckedChildren`, `value`

### `STextArea` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada multiline text input defaulting to filled grey background.
- **Inherited AntD props**: `allowClear`, `autoSize`, `className`, `classNames`, `count`, `onClear`, `onPressEnter`, `onResize`, `rootClassName`, `showCount`, `size`, `status`, `style`, `styles`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `children`, `cols`, `defaultChecked`, `defaultValue`, `disabled`, `id`, `maxLength`, `minLength`, `name`, `onBlur`, `onChange`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `placeholder`, `readOnly`, `rel`, `required`, `role`, `rows`, `tabIndex`, `title`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `STimePicker` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada single TimePicker defaulting to filled styling (`#F4F4F4` light / `#272727` dark), Figma clock icon, and 24-hour (`HH:mm:ss`) or 12-hour (`hh:mm A`) wheel popup.
- **Inherited AntD props**: `addon`, `allowClear`, `builtinPlacements`, `cellRender`, `changeOnScroll`, `className`, `classNames`, `components`, `defaultOpen`, `defaultOpenValue`, `defaultPickerValue`, `defaultValue`, `direction`, `disabled`, `disabledDate`, `disabledTime`, `format`, `getPopupContainer`, `hideDisabledOptions`, `hourStep`, `id`, `inputReadOnly`, `locale`, `maxDate`, `maxTagCount`, `millisecondStep`, `minDate`, `minuteStep`, `mode`, `multiple`, `needConfirm`, `nextIcon`, `onBlur`, `onCalendarChange`, `onChange`, `onClear`, `onFocus`, `onKeyDown`, `onOk`, `onOpenChange`, `onPanelChange`, `onPickerValueChange`, `open`, `order`, `panelRender`, `pickerValue`, `placeholder`, `placement`, `popupAlign`, `prefix`, `preserveInvalidOnBlur`, `presets`, `prevIcon`, `previewValue`, `removeIcon`, `renderExtraFooter`, `rootClassName`, `secondStep`, `showHour`, `showMillisecond`, `showMinute`, `showNow`, `showSecond`, `showWeek`, `size`, `status`, `style`, `styles`, `suffix`, `superNextIcon`, `superPrevIcon`, `tagRender`, `transitionName`, `use12Hours`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `defaultChecked`, `maxLength`, `minLength`, `name`, `onClick`, `onDoubleClick`, `onInput`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `readOnly`, `rel`, `required`, `role`, `step`, `tabIndex`, `title`, `type`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `STimeRangePicker` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada TimeRangePicker defaulting to filled styling (`Start Time` - `End Time`), Figma clock icon, and Light/Dark popup parity.
- **Inherited AntD props**: `allowClear`, `allowEmpty`, `builtinPlacements`, `cellRender`, `changeOnScroll`, `className`, `classNames`, `components`, `defaultOpen`, `defaultOpenValue`, `defaultPickerValue`, `defaultValue`, `direction`, `disabled`, `disabledDate`, `disabledTime`, `format`, `getPopupContainer`, `hideDisabledOptions`, `hourStep`, `id`, `inputReadOnly`, `locale`, `maxDate`, `millisecondStep`, `minDate`, `minuteStep`, `mode`, `needConfirm`, `nextIcon`, `onBlur`, `onCalendarChange`, `onChange`, `onClear`, `onFocus`, `onKeyDown`, `onOk`, `onOpenChange`, `onPanelChange`, `onPickerValueChange`, `open`, `order`, `panelRender`, `pickerValue`, `placeholder`, `placement`, `popupAlign`, `prefix`, `preserveInvalidOnBlur`, `presets`, `prevIcon`, `previewValue`, `renderExtraFooter`, `rootClassName`, `secondStep`, `separator`, `showHour`, `showMillisecond`, `showMinute`, `showNow`, `showSecond`, `showWeek`, `size`, `status`, `style`, `styles`, `suffix`, `superNextIcon`, `superPrevIcon`, `transitionName`, `use12Hours`, `value`, `variant`
- **Common React/DOM props**: `autoFocus`, `checked`, `children`, `defaultChecked`, `maxLength`, `minLength`, `name`, `onClick`, `onDoubleClick`, `onInput`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `readOnly`, `rel`, `required`, `role`, `step`, `tabIndex`, `title`, `type`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `STransfer` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada dual-list Transfer supporting search, pagination, item counts (`selected/total`), row icons, empty states, and 2-level collapsible grouped tree selection (`grouped`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `dataSource` | `STransferItem[]` | Yes |  |
| `grouped` | `boolean` | No | Enable 2-level collapsible category/group tree mode. |
| `listHeight` | `number \| string` | No | Column height (Figma baseline: `368`). |
| `listWidth` | `number \| string` | No | Column width (Figma baseline: `240`). |
| `pagination` | `boolean \| TransferProps<STransferItem>['pagination']` | No | Enable pagination in standard 2-column mode (`true` defaults to `{ pageSize: 8 }`). Ignored when `grouped` is true. |
| `showIcon` | `boolean` | No | Render leading item icons when provided on `STransferItem.icon`. |
- **Inherited AntD props**: `actions`, `children`, `className`, `classNames`, `disabled`, `filterOption`, `footer`, `locale`, `onChange`, `oneWay`, `onScroll`, `onSearch`, `onSelectChange`, `render`, `rootClassName`, `rowKey`, `selectAllLabels`, `selectedKeys`, `selectionsIcon`, `showSearch`, `showSelectAll`, `status`, `style`, `styles`, `targetKeys`, `titles`
- **Common React/DOM props**: `autoFocus`, `defaultChecked`, `defaultValue`, `id`, `onBlur`, `onClick`, `onDoubleClick`, `onFocus`, `onInput`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onSubmit`, `rel`, `role`, `tabIndex`, `title`
- **DOM passthrough**: Accepts standard HTML/`aria-*`/`data-*` attributes.

### `STreeSelect` (`component` · `@chenyqthu/omada-ui-kit/core`)
Omada TreeSelect control defaulting to `variant="filled"`, supporting single selection, checkable / multi-select trees with removable Omada tags, and inline or popup search filtering.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `popupSearch` | `boolean` | No | Renders a dedicated filled search bar inside the dropdown popup header. |
| `searchPlaceholder` | `string` | No | Placeholder text for the popup search input when `popupSearch` is enabled. |
- **Inherited AntD props**: `allowClear`, `animation`, `autoComplete`, `autoFocus`, `builtinPlacements`, `children`, `choiceTransitionName`, `className`, `classNames`, `components`, `defaultOpen`, `defaultValue`, `direction`, `disabled`, `fieldNames`, `getPopupContainer`, `getRawInputElement`, `id`, `labelInValue`, `listHeight`, `listItemHeight`, `listItemScrollOffset`, `loadData`, `loading`, `maxCount`, `maxLength`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `multiple`, `notFoundContent`, `onBlur`, `onChange`, `onClear`, `onClick`, `onDeselect`, `onFocus`, `onInputKeyDown`, `onKeyDown`, `onKeyUp`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onOpenChange`, `onPopupScroll`, `onPopupVisibleChange`, `onSelect`, `onTreeExpand`, `onTreeLoad`, `open`, `placeholder`, `placement`, `popupAlign`, `popupMatchSelectWidth`, `popupRender`, `popupStyle`, `prefix`, `removeIcon`, `rootClassName`, `showAction`, `showCheckedStrategy`, `showScrollBar`, `showSearch`, `size`, `status`, `style`, `styles`, `suffix`, `switcherIcon`, `tabIndex`, `tagRender`, `title`, `tokenSeparators`, `transitionName`, `treeCheckable`, `treeCheckStrictly`, `treeData`, `treeDataSimpleMode`, `treeDefaultExpandAll`, `treeDefaultExpandedKeys`, `treeExpandAction`, `treeExpandedKeys`, `treeIcon`, `treeLine`, `treeLoadedKeys`, `treeNodeLabelProp`, `treeTitleRender`, `value`, `variant`, `virtual`
- **Common React/DOM props**: `role`

### `SUpload` (`component` · `@chenyqthu/omada-ui-kit/core`)

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `buttonText` | `React.ReactNode` | No | Button label when `variant="button"`. |
| `buttonVariant` | `SButtonVariant` | No | Omada button variant when `variant="button"`. |
| `description` | `React.ReactNode` | No | Secondary dropzone hint when `variant="dragger"`. |
| `maxSize` | `number` | No | Maximum file size in bytes (overrides `maxSizeMB` and preset default). |
| `maxSizeMB` | `number` | No | Maximum file size in megabytes (overrides preset default). |
| `onDownloadTemplate` | `() => void` | No | Click callback for `"Download Template"` helper link. |
| `onValidationError` | `(message: string, file: File) => void` | No | Callback fired when accept or max size validation blocks a file. |
| `preset` | `SUploadPreset` | No | Preconfigured Omada validation & copy preset (`firmware` \| `config` \| `image`). |
| `showIllustration` | `boolean` | No | Show Omada theme-aware upgrade illustration inside the dragger dropzone instead of icon badge. |
| `showValidationAlert` | `boolean` | No | Display inline error alert when a file fails accept/size validation (default `true`). |
| `templateText` | `React.ReactNode` | No | Optional helper link text next to button upload (e.g. `"Download Template"`). |
| `title` | `React.ReactNode` | No | Primary dropzone heading when `variant="dragger"`. |
| `variant` | `SUploadVariant` | No | Render as inline trigger button (`button`) or dashed dropzone (`dragger`). |
- **Inherited AntD props**: `accept`, `action`, `beforeUpload`, `children`, `className`, `classNames`, `customRequest`, `data`, `defaultFileList`, `directory`, `disabled`, `fileList`, `hasControlInside`, `headers`, `iconRender`, `id`, `isImageUrl`, `itemRender`, `listType`, `locale`, `maxCount`, `method`, `multiple`, `name`, `onChange`, `onDownload`, `onDrop`, `onFocus`, `onPreview`, `onRemove`, `openFileDialogOnClick`, `pastable`, `previewFile`, `progress`, `rootClassName`, `showUploadList`, `style`, `styles`, `supportServerRender`, `withCredentials`

### `toNativeDate` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Extracts a native `Date` from an AntD/Dayjs date value or Date.

### `validateCidr` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Validates whether a string is a valid IPv4/CIDR address (`a.b.c.d/0..32`).

### `validateIpv4` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Validates whether a string is a complete, in-range IPv4 address (`0.0.0.0` - `255.255.255.255`).

### `validateMac` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Validates whether a string is a complete 6-byte MAC address with `-` or `:` separators.

### `validateUploadFile` (`helper` · `@chenyqthu/omada-ui-kit/core`)
Validates a candidate file against `accept` extensions/MIME patterns and `maxSizeBytes`.
