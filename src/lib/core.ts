// Theme & Providers
export { OmadaProvider, useOmadaTheme, type OmadaProviderProps } from '../omada/theme/OmadaProvider';
export { buildOmadaAntdTheme } from '../omada/theme/antdTheme';
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
} from '../omada/theme/tokens';

// Brand & Lightweight Layout Icons
export {
  OmadaLogo,
  SDeviceIcon,
  type OmadaDeviceType,
  type OmadaLogoProps,
  type SDeviceIconProps,
} from '../omada/icons/OmadaLogo';

// Core Layout Shell
export {
  SAppShell,
  type SAppShellEdition,
  type SAppShellProps,
  type SAppShellServiceItem,
  type SAppShellTopNavItem,
  type SAppShellVariant,
  type SNavGroup,
  type SNavItem,
  type SSiteOption,
} from '../omada/layout/SAppShell';
export { SPageHeader, type SPageHeaderProps } from '../omada/layout/SPageHeader';

// Core Omada Components (No ECharts / No Large Product, Client, or Illustration Catalogs)
export { SButton, type SButtonProps, type SButtonVariant } from '../omada/components/SButton';
export {
  DEFAULT_PASSWORD_RULES,
  SInput,
  SNumberInput,
  SPasswordInput,
  SSearchInput,
  STextArea,
  type PasswordRuleConfig,
  type SInputProps,
  type SNumberInputProps,
  type SPasswordInputProps,
  type SSearchInputProps,
  type STextAreaProps,
} from '../omada/components/SInput';
export {
  SIpInput,
  parseIpValue,
  validateCidr,
  validateIpv4,
  type ParsedIpValue,
  type SIpInputMode,
  type SIpInputProps,
} from '../omada/components/SIpInput';
export {
  SMacInput,
  normalizeMac,
  validateMac,
  type MacSeparator,
  type SMacInputProps,
} from '../omada/components/SMacInput';
export {
  SForm,
  SFormFooter,
  SFormItem,
  SFormSection,
  type SFormFooterProps,
  type SFormItemProps,
  type SFormProps,
  type SFormSectionProps,
} from '../omada/components/SForm';
export {
  SCard,
  SKpiCard,
  type SCardProps,
  type SKpiCardProps,
} from '../omada/components/SCard';
export {
  STabs,
  type STabItem,
  type STabsProps,
  type STabsVariant,
} from '../omada/components/STabs';
export {
  SCustomTag,
  STag,
  type SCustomTagProps,
  type STagColor,
  type STagProps,
} from '../omada/components/STag';
export {
  SDeviceStatus,
  type DeviceStatusType,
  type SDeviceStatusProps,
} from '../omada/components/SDeviceStatus';
export {
  SEditableCell,
  STable,
  type SEditableCellOption,
  type SEditableCellProps,
  type STableColumnSettingItem,
  type STableDensity,
  type STableProps,
  type STableToolbarProps,
} from '../omada/components/STable';
export {
  SModal,
  useOmadaConfirm,
  type OmadaConfirmOptions,
  type SModalProps,
  type SModalSize,
} from '../omada/components/SModal';
export {
  SDrawer,
  type SDrawerProps,
  type SDrawerSize,
} from '../omada/components/SDrawer';
export {
  SAlert,
  useOmadaFeedback,
  type SAlertProps,
  type SAlertType,
} from '../omada/components/SAlert';
export {
  SPortPanel,
  type PortBadgeType,
  type SPortItem,
  type SPortPanelProps,
} from '../omada/components/SPortPanel';
export { SEmpty, type SEmptyProps } from '../omada/components/SEmpty';

// Non-Chart Component Modules
export * from '../omada/modules/nav-shell';
export * from '../omada/modules/select-inputs';
export * from '../omada/modules/time-schedule';
export * from '../omada/modules/feedback-overlays';
export {
  SDescriptions,
  type SDescriptionItem,
  type SDescriptionsProps,
  type SDescriptionsVariant,
} from '../omada/components/SDescriptions';
export {
  SCollapse,
  type SCollapseItem,
  type SCollapseProps,
  type SCollapseVariant,
} from '../omada/components/SCollapse';
export {
  STile,
  STileGroup,
  type STileGroupBaseProps,
  type STileGroupMultiProps,
  type STileGroupProps,
  type STileGroupSingleProps,
  type STileLayout,
  type STileOption,
  type STileProps,
  type STileSelectionMode,
} from '../omada/components/STile';
export {
  SAvatar,
  SAvatarGroup,
  type SAvatarGroupProps,
  type SAvatarProps,
  type SAvatarSize,
  type SAvatarStatus,
} from '../omada/components/SAvatar';
export {
  SBadge,
  type SBadgeProps,
  type SBadgeStatus,
  type SBadgeTone,
} from '../omada/components/SBadge';
export {
  SRate,
  type SRateProps,
  type SRateSize,
} from '../omada/components/SRate';

// Re-export standard AntD 6 primitives
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
