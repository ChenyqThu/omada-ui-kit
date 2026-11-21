// Theme & Providers
export { OmadaProvider, useOmadaTheme, type OmadaProviderProps } from './theme/OmadaProvider';
export { buildOmadaAntdTheme } from './theme/antdTheme';
export {
  omadaChartPalette,
  omadaFontFamily,
  omadaLayout,
  omadaPortColors,
  omadaPortLabels,
  omadaRadius,
  omadaSemanticTokens,
  omadaSpacing,
  omadaTypography,
  omadaZIndex,
  type PortSpeedKey,
  type ResolvedTheme,
  type SemanticTokenSet,
  type ThemeMode,
} from './theme/tokens';

// Icons, Official Figma Asset Library & Brand
export {
  OmadaLogo,
  SDeviceIcon,
  type OmadaDeviceType,
  type OmadaLogoProps,
  type SDeviceIconProps,
} from './icons/OmadaLogo';
export { SIcon, hasOmadaIcon, type SIconProps } from './assets/SIcon';
export {
  SIllustration,
  hasOmadaIllustration,
  type SIllustrationProps,
} from './assets/SIllustration';
export { SClientIcon, type SClientIconProps } from './assets/SClientIcon';
export {
  SProductImage,
  hasOmadaProductImage,
  type SProductImageProps,
} from './assets/SProductImage';
export { SBrandAsset, type SBrandAssetProps } from './assets/SBrandAsset';
export {
  OMADA_ICON_CATEGORIES,
  OMADA_ICONS,
  type OmadaIconMeta,
  type OmadaIconName,
} from './assets/iconsManifest';
export {
  OMADA_BRAND_ASSETS,
  OMADA_CLIENTS,
  OMADA_ILLUSTRATIONS,
  OMADA_PRODUCTS,
  type OmadaAssetMeta,
  type OmadaBrandAssetName,
  type OmadaClientIconName,
  type OmadaIllustrationName,
  type OmadaProductName,
} from './assets/assetsManifest';

// Layout Shell
export {
  SAppShell,
  type SAppShellProps,
  type SNavGroup,
  type SNavItem,
  type SSiteOption,
} from './layout/SAppShell';
export { SPageHeader, type SPageHeaderProps } from './layout/SPageHeader';

// Omada Components
export { SButton, type SButtonProps, type SButtonVariant } from './components/SButton';
export {
  SInput,
  SNumberInput,
  SPasswordInput,
  SSearchInput,
  STextArea,
  type SInputProps,
  type SNumberInputProps,
  type SPasswordInputProps,
  type SSearchInputProps,
  type STextAreaProps,
} from './components/SInput';
export {
  SIpInput,
  parseIpValue,
  validateCidr,
  validateIpv4,
  type ParsedIpValue,
  type SIpInputMode,
  type SIpInputProps,
} from './components/SIpInput';
export {
  SMacInput,
  normalizeMac,
  validateMac,
  type MacSeparator,
  type SMacInputProps,
} from './components/SMacInput';
export {
  SForm,
  SFormFooter,
  SFormItem,
  SFormSection,
  type SFormFooterProps,
  type SFormItemProps,
  type SFormProps,
  type SFormSectionProps,
} from './components/SForm';
export {
  SCard,
  SKpiCard,
  type SCardProps,
  type SKpiCardProps,
} from './components/SCard';
export {
  STabs,
  type STabItem,
  type STabsProps,
  type STabsVariant,
} from './components/STabs';
export {
  SCustomTag,
  STag,
  type SCustomTagProps,
  type STagColor,
  type STagProps,
} from './components/STag';
export {
  SDeviceStatus,
  type DeviceStatusType,
  type SDeviceStatusProps,
} from './components/SDeviceStatus';
export {
  STable,
  type STableProps,
  type STableToolbarProps,
} from './components/STable';
export {
  SModal,
  useOmadaConfirm,
  type OmadaConfirmOptions,
  type SModalProps,
  type SModalSize,
} from './components/SModal';
export {
  SDrawer,
  type SDrawerProps,
  type SDrawerSize,
} from './components/SDrawer';
export {
  SAlert,
  useOmadaFeedback,
  type SAlertProps,
  type SAlertType,
} from './components/SAlert';
export {
  SPortPanel,
  type PortBadgeType,
  type SPortItem,
  type SPortPanelProps,
} from './components/SPortPanel';
export { SChart, type SChartProps } from './components/SChart';
export { SEmpty, type SEmptyProps } from './components/SEmpty';

// Re-export standard AntD 6 primitives so PRD demos import everything from `@/omada`
export {
  Avatar,
  Badge,
  Breadcrumb,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Descriptions,
  Divider,
  Dropdown,
  Pagination,
  Popover,
  Progress,
  Radio,
  Row,
  Select,
  Slider,
  Space,
  Spin,
  Steps,
  Switch,
  TimePicker,
  Tooltip,
  Transfer,
  TreeSelect,
  Upload,
} from 'antd';
export type { ColumnsType, TableProps } from 'antd/es/table';
export type { MenuProps } from 'antd';
