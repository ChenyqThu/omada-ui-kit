# Bundled Figma Icons, Hardware Photos & Illustrations (`@chenyqthu/omada-ui-kit/assets`)

Verified asset components backed by 590 icons, 83 hardware models, 122 Light/Dark illustrations, 217 client icons, and 47 brand SVGs. Never guess slugs — search with `query-catalog.mjs`.

### `hasOmadaIcon` (`helper` · `@chenyqthu/omada-ui-kit/assets`)
Checks whether an icon slug exists in the bundled Figma icon library.

### `hasOmadaIllustration` (`helper` · `@chenyqthu/omada-ui-kit/assets`)
Checks whether an illustration slug exists in the bundled Figma illustration library.

### `hasOmadaProductImage` (`helper` · `@chenyqthu/omada-ui-kit/assets`)
Checks whether a hardware product slug exists in the bundled Figma product library.

### `OmadaLogo` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Official Omada wordmark SVG exported from Figma node `25947:13603`. Uses `currentColor` so it adapts to Top Bar (`#FFFFFF`) and light/dark surfaces.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `height` | `number` | No |  |

### `SBrandAsset` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Official Omada wordmark, app icon, and OAuth brand asset backed by `src/assets/brand/`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `alt` | `string` | No |  |
| `className` | `string` | No |  |
| `fallback` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `loading` | `'lazy' \| 'eager'` | No |  |
| `name` | `OmadaBrandAssetName` | Yes |  |
| `style` | `React.CSSProperties` | No |  |
| `theme` | `'light' \| 'dark' \| 'auto'` | No |  |
| `width` | `number \| string` | No |  |

### `SClientIcon` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Theme-aware Omada client device / OS / vendor icon backed by `src/assets/clients/{light,dark}/`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `alt` | `string` | No |  |
| `className` | `string` | No |  |
| `fallback` | `React.ReactNode` | No |  |
| `loading` | `'lazy' \| 'eager'` | No |  |
| `name` | `OmadaClientIconName` | Yes |  |
| `size` | `number \| string` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `theme` | `'light' \| 'dark' \| 'auto'` | No |  |

### `SDeviceIcon` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Semantic device type badge icon for Omada gateways, switches, APs, OLTs, cameras, NVRs, and clients.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `size` | `number` | No |  |
| `type` | `OmadaDeviceType` | Yes |  |

### `SIcon` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Official Omada SVG icon component backed by the 586 Figma icons in `src/assets/icons/`. Monochrome icons inherit `currentColor`; multi-color icons preserve Figma fills.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `className` | `string` | No |  |
| `color` | `string` | No |  |
| `name` | `OmadaIconName` | Yes |  |
| `size` | `number \| string` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `title` | `string` | No |  |

### `SIllustration` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Theme-aware Omada illustration backed by `src/assets/illustrations/{light,dark}/`. Automatically selects the dark variant in Dark Mode when available.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `alt` | `string` | No |  |
| `className` | `string` | No |  |
| `fallback` | `React.ReactNode` | No |  |
| `height` | `number \| string` | No |  |
| `loading` | `'lazy' \| 'eager'` | No |  |
| `name` | `OmadaIllustrationName` | Yes |  |
| `style` | `React.CSSProperties` | No |  |
| `theme` | `'light' \| 'dark' \| 'auto'` | No |  |
| `width` | `number \| string` | No |  |

### `SProductImage` (`component` · `@chenyqthu/omada-ui-kit/assets`)
Theme-aware Omada hardware product thumbnail backed by `src/assets/products/{light,dark}/`.

| Prop | Type | Req | Notes |
| :--- | :--- | :---: | :--- |
| `alt` | `string` | No |  |
| `className` | `string` | No |  |
| `fallback` | `React.ReactNode` | No |  |
| `loading` | `'lazy' \| 'eager'` | No |  |
| `name` | `OmadaProductName` | Yes |  |
| `size` | `number \| string` | No |  |
| `style` | `React.CSSProperties` | No |  |
| `theme` | `'light' \| 'dark' \| 'auto'` | No |  |

## Asset Counts & Sample Verified Slugs
- **Icons (590)** — Categories: `app-category`, `button`, `custom`, `dashboard`, `event`, `general`, `map`, `member`, `other`, `quick-action`, `scene`, `sidebar`, `status`, `system`, `table`, `topbar`, `topo`
  - Sample slugs: `app-category-advertisement-and-analytic-services`, `app-category-ai`, `app-category-app-stores-and-os-updates`, `app-category-audio-entertainment`, `app-category-books-and-magazines`, `app-category-books-and-magazines-2`, `app-category-certificate-authority`, `app-category-cloud-and-cdn-services`, `app-category-conference`, `app-category-cryptocurrency`, `app-category-database`, `app-category-development-tools-and-services`, `app-category-device-security`, `app-category-e-commerce`, `app-category-education`, `app-category-encrypted`, `app-category-enterprise-services`, `app-category-file-transfer`, `app-category-finance`, `app-category-food`
  - Search: `node scripts/query-catalog.mjs search-icons <keyword> 25`
- **Products (83)** — Sample slugs: `all-in-one`, `android-phone`, `ap`, `ap-2`, `ap-group`, `ap8635-e-eu-1-20`, `beam-bridge-7`, `camera-1`, `camera-2`, `camera-3`, `camera-4`, `camera-group`, `child-ipc`, `client-group`, `computer`, `controller`, `dr3220v-4g-eu-1`, `dr3650v-eu-1-0`, `eap110-4-20-eap115-4-30`, `eap110-outdoor-un-3-2`
  - Search: `node scripts/query-catalog.mjs search-assets products <keyword> 25`
- **Illustrations (122)** — Sample slugs: `300-160`, `account`, `account-level`, `account-manage`, `adaptive-wlan-optimization`, `add-controller`, `add-controller-2`, `add-controller-failed`, `add-controller-success`, `add-device`, `add-hardware-failed`, `add-linkage`, `add-linkage-2`, `add-new-organization`, `api-key`
  - Search: `node scripts/query-catalog.mjs search-assets illustrations <keyword> 25`
- **Client Icons (217)** — Sample slugs: `1-port`, `2-port`, `4-port`, `8-port`, `ac`, `access-control-system`, `air-conditioner`, `air-conditioner-companion`, `air-cooler`, `air-purifier`, `alarm`, `android-phone`, `android-phone-2`, `ap`, `ap-2`
  - Search: `node scripts/query-catalog.mjs search-assets clients <keyword> 25`
- **Brand Assets (47)** — Slugs: `left-aligned-en-mode-dark`, `left-aligned-en-mode-light`, `login-card-sidebar-about`, `oauth-alipay`, `oauth-amazon`, `oauth-baidu`, `oauth-china-mobile`, `oauth-china-telecom`, `oauth-china-unicom`, `oauth-dingtalk`, `oauth-discord`, `oauth-dribbble`, `oauth-facebook`, `oauth-feishu`, `oauth-figma`, `oauth-figma-2`, `oauth-gitee`, `oauth-github`, `oauth-gitlab`, `oauth-google`, `oauth-huawei`, `oauth-hugging-face`, `oauth-instagram`, `oauth-line`, `oauth-linkedin`, `oauth-medium`, `oauth-microsoft`, `oauth-microsoft-2`, `oauth-notion`, `oauth-qq`, `oauth-slack`, `oauth-spotify`, `oauth-tiktok`, `oauth-twitch`, `oauth-wechat`, `oauth-wecom`, `oauth-weibo`, `oauth-x`, `oauth-yahoo`, `omada-logo`, `omada-logo-2`, `omada-logo-3`, `omada-logo-pro`, `omada-logo-pro-2`, `omada-pro`, `omada-qr-code`, `vigi-qr-code`
