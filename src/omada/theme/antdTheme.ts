import { theme as antdTheme, type ThemeConfig } from 'antd';
import {
  omadaFontFamily,
  omadaRadius,
  omadaSemanticTokens,
  type ResolvedTheme,
} from './tokens';

/**
 * Builds the Ant Design 5 ThemeConfig mapped from Omada semantic tokens.
 */
export function buildOmadaAntdTheme(mode: ResolvedTheme): ThemeConfig {
  const t = omadaSemanticTokens[mode];
  const isDark = mode === 'dark';

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: t.brand,
      colorPrimaryHover: t.brandHover,
      colorPrimaryActive: t.brandActive,
      colorSuccess: t.success,
      colorError: t.error,
      colorErrorHover: t.errorHover,
      colorWarning: t.warning,
      colorInfo: t.info,
      colorLink: t.link,
      colorLinkHover: t.linkHover,
      colorText: t.textPrimary,
      colorTextSecondary: t.textSecondary,
      colorTextTertiary: t.textTertiary,
      colorTextDisabled: t.textDisabled,
      colorBgBase: t.bgSurface,
      colorBgContainer: t.bgSurface,
      colorBgElevated: t.bgOverlay,
      colorBgLayout: t.bgPage,
      colorFillSecondary: t.bgField,
      colorFillTertiary: t.bgFieldHover,
      colorBorder: t.borderStrong,
      colorBorderSecondary: t.borderDivider,
      fontFamily: omadaFontFamily.sans,
      fontFamilyCode: omadaFontFamily.mono,
      fontSize: 14,
      borderRadius: omadaRadius.sm,
      borderRadiusLG: omadaRadius.lg,
      borderRadiusSM: omadaRadius.xs,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
      boxShadow: t.shadowPopover,
      boxShadowSecondary: t.shadowDropdown,
    },
    components: {
      Button: {
        borderRadius: omadaRadius.sm,
        borderRadiusLG: omadaRadius.sm,
        controlHeight: 32,
        controlHeightLG: 40,
        paddingInline: 16,
        paddingInlineLG: 20,
        primaryShadow: 'none',
        defaultShadow: 'none',
        dangerShadow: 'none',
      },
      Input: {
        activeBg: t.bgField,
        hoverBg: t.bgField,
        activeBorderColor: t.borderFocus,
        hoverBorderColor: t.borderFocus,
        activeShadow: 'none',
      },
      InputNumber: {
        activeBg: t.bgField,
        hoverBg: t.bgField,
        activeBorderColor: t.borderFocus,
        hoverBorderColor: t.borderFocus,
        activeShadow: 'none',
      },
      Select: {
        optionSelectedBg: t.brandBgSubtlest,
        optionSelectedColor: t.brandText,
        optionSelectedFontWeight: 600,
      },
      DatePicker: {
        activeBg: t.bgField,
        hoverBg: t.bgField,
        activeBorderColor: t.borderFocus,
        hoverBorderColor: t.borderFocus,
        activeShadow: 'none',
      },
      Table: {
        headerBg: t.bgTableHeader,
        headerColor: t.textSecondary,
        headerSplitColor: 'transparent',
        rowHoverBg: t.bgTableRowHover,
        borderColor: t.borderDivider,
        cellPaddingBlock: 10,
        cellPaddingInline: 14,
      },
      Tabs: {
        inkBarColor: t.brandText,
        itemActiveColor: t.brandText,
        itemSelectedColor: t.brandText,
        itemHoverColor: t.brandHover,
        horizontalItemGutter: 32,
      },
      Switch: {
        colorPrimary: t.brand,
        colorPrimaryHover: t.brandHover,
      },
      Modal: {
        contentBg: t.bgOverlay,
        headerBg: t.bgOverlay,
        footerBg: t.bgOverlay,
        borderRadiusLG: omadaRadius.lg,
      },
      Drawer: {
        colorBgElevated: t.bgOverlay,
      },
      Card: {
        colorBgContainer: t.bgSurface,
        colorBorderSecondary: t.borderDivider,
        borderRadiusLG: omadaRadius.lg,
      },
      Tag: {
        borderRadiusSM: 3,
      },
      Pagination: {
        itemActiveBg: t.brandBgSubtle,
        itemSize: 32,
      },
      Steps: {
        colorPrimary: t.brandText,
      },
      Radio: {
        colorPrimary: t.brandText,
        buttonCheckedBg: t.bgSurface,
      },
      Tooltip: {
        colorBgSpotlight: t.bgTooltip,
        colorTextLightSolid: '#FFFFFF',
      },
      Popover: {
        colorBgElevated: t.bgPopover,
      },
    },
  };
}
