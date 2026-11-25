# Charts & Network Health Visualizations (`@chenyqthu/omada-ui-kit/charts`)

Modular ECharts wrappers (`SChart`, `SLineChart`, `SBarChart`, `SDonutChart`, `SSparkChart`) and Omada v6.3 telemetry cards (`SDonutSummaryCard`, `SHealthGauge`, `SHealthRadar`, `SHealthTrendBar`, `SChannelUtilization`).

### `SBarChart` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Omada Bar chart preset supporting vertical, stacked, and horizontal layouts with 5-tick (or 6-tick percentage) axis scaling, loading skeleton, and empty state.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `barWidth` | `number` | No |  |
| `categories` | `string[]` | Yes |  |
| `className` | `string` | No |  |
| `empty` | `boolean` | No |  |
| `emptyDescription` | `React.ReactNode` | No |  |
| `emptyTitle` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `layout` | `'vertical' \| 'horizontal'` | No |  |
| `legendPosition` | `'top' \| 'bottom'` | No |  |
| `loading` | `boolean` | No |  |
| `optionOverride` | `EChartsOption` | No |  |
| `percentage` | `boolean` | No |  |
| `series` | `SBarChartSeries[]` | Yes |  |
| `showLegend` | `boolean` | No |  |
| `stacked` | `boolean` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `unit` | `string` | No |  |

### `SChannelUtilization` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Multi-band wireless Channel Utilization mini-bar chart across `2.4 GHz`, `5 GHz`, and `6 GHz` with color-coded Low / Medium / High utilization levels and band underline labels.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `bands` | `SChannelBand[]` | Yes | Radio band groups (`2.4 GHz`, `5 GHz`, `6 GHz`) rendered side by side. |
| `className` | `string` | No |  |
| `style` | `React.CSSProperties` | No |  |

### `SChart` (`component` · `@chenyqthu/omada-ui-kit/charts`)
ECharts 5 chart wrapper pre-configured with Omada's 20-color categorical palette, `Manrope` typography, dashed gridlines, Light/Dark live theme sync, `ResizeObserver`, loading skeleton, and `<SEmpty>` empty state.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `empty` | `boolean` | No |  |
| `emptyDescription` | `React.ReactNode` | No |  |
| `emptyTitle` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `loading` | `boolean` | No |  |
| `option` | `EChartsOption` | Yes |  |
| `renderer` | `'canvas' \| 'svg'` | No |  |
| `style` | `React.CSSProperties` | No |  |

### `SDonutChart` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Omada Donut ring chart preset with optional center KPI metric overlay, interactive legend, loading skeleton, and empty state.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `centerLabel` | `React.ReactNode` | No |  |
| `centerValue` | `React.ReactNode` | No |  |
| `className` | `string` | No |  |
| `data` | `SDonutChartDatum[]` | Yes |  |
| `empty` | `boolean` | No |  |
| `emptyDescription` | `React.ReactNode` | No |  |
| `emptyTitle` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `legendPosition` | `'bottom' \| 'right'` | No |  |
| `loading` | `boolean` | No |  |
| `optionOverride` | `EChartsOption` | No |  |
| `radius` | `[string, string]` | No |  |
| `showLegend` | `boolean` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `unit` | `string` | No |  |

### `SDonutSummaryCard` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Omada Donut Summary Card pairing a ring chart with centered metric overlay and either vertical interactive breakdown rows (`Application Analytics`) or a compact side-by-side legend (`Reports`).

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `centerLabel` | `React.ReactNode` | No | Secondary subtitle centered below `centerValue` (e.g. `"Traffic"` or `"Total"`). |
| `centerValue` | `React.ReactNode` | Yes | Primary metric centered inside the donut ring (e.g. `"58.33 MB"` or `"4"`). |
| `className` | `string` | No |  |
| `closable` | `boolean` | No | Show a close (`×`) button in the card header. |
| `closeAriaLabel` | `string` | No | Accessibility label for the close button. |
| `data` | `SDonutSummaryItem[]` | Yes | Breakdown items powering both the donut slices and the item/legend list. |
| `donutSize` | `number` | No | Donut canvas diameter in pixels. |
| `extra` | `React.ReactNode` | No | Optional extra header element rendered when `closable` is false. |
| `layout` | `'vertical' \| 'horizontal'` | No | `'vertical'` stacks the donut above clickable breakdown rows (Application Analytics). `'horizontal'` aligns the donut on the left and a compact legend on the right (Reports). |
| `legendColumns` | `1 \| 2` | No | Number of columns for horizontal legend layout (`1` or `2`). |
| `onClose` | `() => void` | No | Callback invoked when the close (`×`) button is clicked. |
| `onItemClick` | `(item: SDonutSummaryItem) => void` | No | Callback invoked when a clickable breakdown row is activated. |
| `radius` | `[string, string]` | No | ECharts pie inner/outer radius percentages. |
| `style` | `React.CSSProperties` | No |  |
| `title` | `React.ReactNode` | Yes | Card header title. |
| `titleIcon` | `React.ReactNode` | No | Optional icon rendered before `title`. |

### `SHealthGauge` (`component` · `@chenyqthu/omada-ui-kit/charts`)
180-degree Omada Network Health semi-circle gauge featuring outer `0..100` ticks, rounded emerald progress arc, centered large numeric readout, and info tooltip.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `label` | `React.ReactNode` | No | Subtitle beneath the large numeric score. |
| `maxScore` | `number` | No | Maximum gauge score (defaults to `100`). |
| `score` | `number` | No | Current site/device health score from `0` to `maxScore`. |
| `style` | `React.CSSProperties` | No |  |
| `tooltip` | `React.ReactNode` | No | Optional tooltip text displayed on the info icon next to `label`. |
| `width` | `number` | No | Width of the gauge SVG in pixels (defaults to `248`). |

### `SHealthRadar` (`component` · `@chenyqthu/omada-ui-kit/charts`)
4-axis concentric circular radar visualization (`Wi-Fi`, `Client`, `WAN`, `Device`) with translucent emerald polygon fill and vertex markers.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `client` | `number` | No | Client dimension health score (`0..maxValue`). |
| `device` | `number` | No | Device dimension health score (`0..maxValue`). |
| `maxValue` | `number` | No | Maximum dimension scale (defaults to `100`). |
| `style` | `React.CSSProperties` | No |  |
| `wan` | `number` | No | WAN dimension health score (`0..maxValue`). |
| `wanTooltip` | `React.ReactNode` | No | Optional tooltip shown on the WAN `(i)` icon. |
| `width` | `number` | No | SVG width/height square box in pixels (defaults to `252` wide × `180` tall). |
| `wifi` | `number` | No | Wi-Fi dimension health score (`0..maxValue`). |

### `SHealthTrendBar` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Multi-row 24h Network Health Trend timeline rendering ~96 thin vertical ticks per row across `Device`, `Client`, `Wi-Fi`, and `WAN` dimensions.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `rows` | `SHealthTrendRow[]` | Yes | Dimension rows (`Device`, `Client`, `Wi-Fi`, `WAN`). |
| `style` | `React.CSSProperties` | No |  |
| `tickLabels` | `string[]` | No | Optional labels per tick index for hover inspection. |

### `SLineChart` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Omada multi-series Line / Area chart preset with 5-tick default or 6-tick percentage Y-axis, gradient area fill, interactive legend toggling, loading skeleton, and empty state.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `area` | `boolean` | No |  |
| `className` | `string` | No |  |
| `empty` | `boolean` | No |  |
| `emptyDescription` | `React.ReactNode` | No |  |
| `emptyTitle` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `legendPosition` | `'top' \| 'bottom'` | No |  |
| `loading` | `boolean` | No |  |
| `optionOverride` | `EChartsOption` | No |  |
| `percentage` | `boolean` | No | Fixes Y-axis to 0%–100% with 6 ticks (`0, 20, 40, 60, 80, 100`). |
| `series` | `SLineChartSeries[]` | Yes |  |
| `showLegend` | `boolean` | No |  |
| `smooth` | `boolean` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `xData` | `string[]` | Yes |  |
| `yMax` | `number` | No |  |
| `yMin` | `number` | No |  |
| `yUnit` | `string` | No |  |

### `SSparkChart` (`component` · `@chenyqthu/omada-ui-kit/charts`)
Compact dashboard widget spark chart featuring strictly 2 Y-axis ticks (`min` and `max`), supporting `area`, `line`, and `bar` modes.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `color` | `string` | No |  |
| `data` | `number[]` | Yes |  |
| `empty` | `boolean` | No |  |
| `emptyDescription` | `React.ReactNode` | No |  |
| `emptyTitle` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `labels` | `string[]` | No |  |
| `loading` | `boolean` | No |  |
| `optionOverride` | `EChartsOption` | No |  |
| `seriesName` | `string` | No |  |
| `showAxisTicks` | `boolean` | No | Shows strictly 2 Y-axis ticks (`min` and `max`) per Omada widget spec. |
| `style` | `React.CSSProperties` | No |  |
| `unit` | `string` | No |  |
| `variant` | `'line' \| 'area' \| 'bar'` | No |  |
