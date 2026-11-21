/**
 * Omada Design System Tokens
 *
 * Reconciled from:
 * - Figma TP Web Component Library (`原内容`, `Color Palette UI色板`, `🌟Shadow 投影`, `Local Text Styles`, `✍️✅设备端口`)
 * - Live Omada Controller v6.3.0.34 Emulator CSS variables (`--s-color-*`)
 */

export type ResolvedTheme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

export const omadaFontFamily = {
  sans: "'Manrope', Arial, Geneva, Verdana, sans-serif",
  mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
} as const;

export const omadaTypography = {
  title1: { size: 22, lineHeight: 32, weight: 600 },
  title2: { size: 20, lineHeight: 28, weight: 600 },
  title3: { size: 18, lineHeight: 28, weight: 600 },
  body1: { size: 16, lineHeight: 24, weight: 400 },
  body2: { size: 14, lineHeight: 20, weight: 400 },
  caption: { size: 12, lineHeight: 16, weight: 400 },
} as const;

export const omadaSpacing = [0, 4, 8, 12, 16, 20, 24, 32, 40] as const;

export const omadaRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  pill: 9999,
} as const;

export const omadaLayout = {
  topBarHeight: 56,
  sidebarWidth: 216,
  sidebarCollapsedWidth: 52,
  controlSm: 24,
  controlMd: 32,
  controlLg: 40,
  formLabelWidth: 200,
  formFieldWidth: 350,
  searchWidth: 260,
} as const;

export const omadaZIndex = {
  base: 0,
  sticky: 100,
  dropdown: 1050,
  modal: 1100,
  drawer: 1100,
  popover: 1150,
  toast: 1200,
  tooltip: 1300,
} as const;

export interface SemanticTokenSet {
  // Brand
  brand: string;
  brandHover: string;
  brandActive: string;
  brandText: string;
  brandBgSubtle: string;
  brandBgSubtlest: string;
  // Top Bar
  topBarBg: string;
  topBarText: string;
  // Links
  link: string;
  linkHover: string;
  // Status
  success: string;
  successBg: string;
  error: string;
  errorHover: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  warningMinor: string;
  warningMinorBg: string;
  info: string;
  infoBg: string;
  magenta: string;
  magentaBg: string;
  purple: string;
  purpleBg: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  // Surfaces & Fills
  bgPage: string;
  bgSurface: string;
  bgSidebar: string;
  bgSidebarActive: string;
  bgField: string;
  bgFieldHover: string;
  bgSecondaryBtn: string;
  bgSecondaryBtnHover: string;
  bgTableHeader: string;
  bgTableRowHover: string;
  bgOverlay: string;
  bgPopover: string;
  bgTooltip: string;
  bgSwitchOff: string;
  bgSwitchOffHover: string;
  bgMask: string;
  // Borders
  borderDivider: string;
  borderStrong: string;
  borderOutlineBtn: string;
  borderField: string;
  borderFocus: string;
  // Shadows
  shadowTooltip: string;
  shadowDropdown: string;
  shadowPopover: string;
  shadowDrawer: string;
}

export const omadaSemanticTokens: Record<ResolvedTheme, SemanticTokenSet> = {
  light: {
    brand: '#00A870',
    brandHover: '#05C178',
    brandActive: '#008F5F',
    brandText: '#00A870',
    brandBgSubtle: 'rgba(0, 168, 112, 0.12)',
    brandBgSubtlest: 'rgba(0, 168, 112, 0.08)',
    topBarBg: 'linear-gradient(90deg, #038069 0%, #026E64 100%)',
    topBarText: '#FFFFFF',
    link: '#0069CB',
    linkHover: '#0D89FD',
    success: '#00A870',
    successBg: 'rgba(0, 168, 112, 0.12)',
    error: '#EE385C',
    errorHover: '#FF476B',
    errorBg: 'rgba(238, 56, 92, 0.12)',
    warning: '#FF8C27',
    warningBg: 'rgba(255, 140, 39, 0.12)',
    warningMinor: '#FFCB00',
    warningMinorBg: 'rgba(255, 203, 0, 0.14)',
    info: '#0069CB',
    infoBg: 'rgba(0, 105, 203, 0.12)',
    magenta: '#C52AD4',
    magentaBg: 'rgba(244, 118, 255, 0.12)',
    purple: '#2F2FFF',
    purpleBg: 'rgba(47, 47, 255, 0.10)',
    textPrimary: '#2B2B2B',
    textSecondary: '#636363',
    textTertiary: '#999999',
    textDisabled: '#CCCCCC',
    textInverse: '#FFFFFF',
    bgPage: '#F7F7F7',
    bgSurface: '#FFFFFF',
    bgSidebar: '#F7F7F7',
    bgSidebarActive: '#FFFFFF',
    bgField: '#F4F4F4',
    bgFieldHover: '#ECECEC',
    bgSecondaryBtn: '#F4F4F4',
    bgSecondaryBtnHover: '#ECECEC',
    bgTableHeader: '#F7F7F7',
    bgTableRowHover: '#FBFBFB',
    bgOverlay: '#FFFFFF',
    bgPopover: '#FFFFFF',
    bgTooltip: 'rgba(43, 43, 43, 0.96)',
    bgSwitchOff: '#CCCCCC',
    bgSwitchOffHover: '#BEBEBE',
    bgMask: 'rgba(43, 43, 43, 0.45)',
    borderDivider: '#ECECEC',
    borderStrong: '#CCCCCC',
    borderOutlineBtn: '#E8E8E8',
    borderField: '#F4F4F4',
    borderFocus: '#05C178',
    shadowTooltip: '0 2px 4px rgba(0, 0, 0, 0.10)',
    shadowDropdown: '0 4px 10px rgba(43, 43, 43, 0.25)',
    shadowPopover: '0 2px 16px rgba(43, 43, 43, 0.14)',
    shadowDrawer: '-4px 2px 24px rgba(43, 43, 43, 0.10)',
  },
  dark: {
    brand: '#008055',
    brandHover: '#00A163',
    brandActive: '#006B47',
    brandText: '#00A870',
    brandBgSubtle: 'rgba(0, 168, 112, 0.20)',
    brandBgSubtlest: 'rgba(0, 168, 112, 0.12)',
    topBarBg: 'linear-gradient(90deg, #0D2F29 0%, #09231F 100%)',
    topBarText: '#FFFFFF',
    link: '#33A0E9',
    linkHover: '#297BCC',
    success: '#00A870',
    successBg: 'rgba(0, 168, 112, 0.20)',
    error: '#FF4D62',
    errorHover: '#EE385C',
    errorBg: 'rgba(238, 56, 92, 0.20)',
    warning: '#F19151',
    warningBg: 'rgba(241, 145, 81, 0.20)',
    warningMinor: '#CCA200',
    warningMinorBg: 'rgba(204, 162, 0, 0.20)',
    info: '#33A0E9',
    infoBg: 'rgba(51, 160, 233, 0.20)',
    magenta: '#F476FF',
    magentaBg: 'rgba(244, 118, 255, 0.20)',
    purple: '#9886FF',
    purpleBg: 'rgba(152, 134, 255, 0.20)',
    textPrimary: 'rgba(255, 255, 255, 0.90)',
    textSecondary: 'rgba(255, 255, 255, 0.64)',
    textTertiary: 'rgba(255, 255, 255, 0.50)',
    textDisabled: 'rgba(255, 255, 255, 0.24)',
    textInverse: '#FFFFFF',
    bgPage: '#141414',
    bgSurface: '#1A1A1A',
    bgSidebar: '#242424',
    bgSidebarActive: '#303030',
    bgField: '#272727',
    bgFieldHover: '#363636',
    bgSecondaryBtn: '#272727',
    bgSecondaryBtnHover: '#363636',
    bgTableHeader: '#212121',
    bgTableRowHover: 'rgba(255, 255, 255, 0.04)',
    bgOverlay: '#1C1C1C',
    bgPopover: '#272727',
    bgTooltip: '#333333',
    bgSwitchOff: 'rgba(255, 255, 255, 0.24)',
    bgSwitchOffHover: 'rgba(255, 255, 255, 0.40)',
    bgMask: 'rgba(0, 0, 0, 0.65)',
    borderDivider: 'rgba(255, 255, 255, 0.10)',
    borderStrong: '#636363',
    borderOutlineBtn: 'rgba(255, 255, 255, 0.24)',
    borderField: '#272727',
    borderFocus: '#00A870',
    shadowTooltip: '0 2px 4px rgba(0, 0, 0, 0.24)',
    shadowDropdown: '0 3px 10px rgba(0, 0, 0, 0.20)',
    shadowPopover: '0 2px 16px rgba(0, 0, 0, 0.20)',
    shadowDrawer: '-4px 2px 24px rgba(0, 0, 0, 0.24)',
  },
};

export type PortSpeedKey =
  | 'disconnected'
  | 'disabled'
  | 'connected'
  | '100m'
  | '1g'
  | '2.5g'
  | '5g'
  | '10g'
  | '25g'
  | '40g'
  | '100g';

export const omadaPortLabels: Record<PortSpeedKey, string> = {
  disconnected: 'Disconnected',
  disabled: 'Disabled',
  connected: 'Connected',
  '100m': '10/100 Mbps',
  '1g': '1 Gbps',
  '2.5g': '2.5 Gbps',
  '5g': '5 Gbps',
  '10g': '10 Gbps',
  '25g': '25 Gbps',
  '40g': '40 Gbps',
  '100g': '100 Gbps',
};

export const omadaPortColors: Record<ResolvedTheme, Record<PortSpeedKey, string>> = {
  light: {
    disconnected: '#CCCCCC',
    disabled: '#777777',
    connected: '#00A870',
    '100m': '#F9B200',
    '1g': '#95CC00',
    '2.5g': '#00D076',
    '5g': '#00A870',
    '10g': '#00C9D4',
    '25g': '#009CFE',
    '40g': '#4C73FF',
    '100g': '#D562FF',
  },
  dark: {
    disconnected: '#636363',
    disabled: '#303030',
    connected: '#009765',
    '100m': '#E0A000',
    '1g': '#86B800',
    '2.5g': '#00BB6A',
    '5g': '#009765',
    '10g': '#00B5BF',
    '25g': '#008CE5',
    '40g': '#4468E5',
    '100g': '#C058E5',
  },
};

export const omadaChartPalette: Record<ResolvedTheme, readonly string[]> = {
  light: [
    '#006F71',
    '#00E194',
    '#B7EE00',
    '#0069CB',
    '#F476FF',
    '#87C969',
    '#FFCB00',
    '#FF8C27',
    '#E3C893',
    '#69C7EF',
    '#00C9C9',
    '#FC8DCD',
    '#A2AAF7',
    '#7A54FF',
    '#00B2FF',
    '#5576FF',
    '#A6DD56',
    '#4CB033',
    '#CDAB5D',
    '#44B0D7',
  ],
  dark: [
    '#00595A',
    '#00B476',
    '#85BF00',
    '#33A0E9',
    '#E077E9',
    '#6EA356',
    '#CCA200',
    '#F19151',
    '#B6A076',
    '#549FBF',
    '#00B3B3',
    '#E07CB6',
    '#8B93E0',
    '#9886FF',
    '#29A3E5',
    '#6885FF',
    '#8EC246',
    '#459E2F',
    '#B5964F',
    '#3D9CC0',
  ],
};
