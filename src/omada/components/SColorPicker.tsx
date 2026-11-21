import React from 'react';
import { ColorPicker, type ColorPickerProps } from 'antd';
import type { PresetsItem } from 'antd/es/color-picker/interface';
import { omadaChartPalette, omadaSemanticTokens } from '../theme/tokens';

export type SColorPickerPreset = PresetsItem;

export interface SColorPickerProps extends ColorPickerProps {
  /** Validation border state (`'error'` or `'warning'`). */
  status?: 'error' | 'warning';
  /** Toggle default Omada curated preset swatches (defaults to `true`). */
  showPresets?: boolean;
  /** Optional custom list of hex/css colors prepended as a quick palette group. */
  presetColors?: string[];
}

const DEFAULT_OMADA_PRESETS: PresetsItem[] = [
  {
    label: 'Omada Brand & Status',
    defaultOpen: true,
    colors: [
      omadaSemanticTokens.light.brand,
      omadaSemanticTokens.light.brandHover,
      omadaSemanticTokens.light.brandActive,
      omadaSemanticTokens.light.info,
      omadaSemanticTokens.light.linkHover,
      omadaSemanticTokens.light.warning,
      omadaSemanticTokens.light.warningMinor,
      omadaSemanticTokens.light.error,
      omadaSemanticTokens.light.magenta,
      omadaSemanticTokens.light.purple,
    ],
  },
  {
    label: 'Neutrals & Topology',
    defaultOpen: true,
    colors: [
      omadaSemanticTokens.light.textInverse,
      omadaSemanticTokens.light.borderStrong,
      omadaSemanticTokens.light.textTertiary,
      omadaSemanticTokens.light.textSecondary,
      omadaSemanticTokens.light.textPrimary,
      omadaChartPalette.light[0],
      omadaChartPalette.light[1],
      omadaChartPalette.light[9],
      omadaChartPalette.light[10],
      omadaChartPalette.light[13],
    ],
  },
];

/**
 * Omada ColorPicker with a `32px` filled trigger (`min-width: 171px` with HEX readout),
 * curated Omada palette presets, and full Light/Dark theme legibility.
 */
export const SColorPicker: React.FC<SColorPickerProps> = ({
  showText = true,
  showPresets = true,
  presetColors,
  presets,
  status,
  defaultValue,
  value,
  className = '',
  classNames,
  styles,
  ...rest
}) => {
  const hasText = showText !== false;
  const resolvedShowText: ColorPickerProps['showText'] =
    showText === true
      ? (color) => color.toHexString().toUpperCase()
      : showText;

  const resolvedPresets: ColorPickerProps['presets'] =
    presets ??
    (showPresets
      ? presetColors && presetColors.length > 0
        ? [
            { label: 'Custom Palette', defaultOpen: true, colors: presetColors },
            ...DEFAULT_OMADA_PRESETS,
          ]
        : DEFAULT_OMADA_PRESETS
      : undefined);

  const statusClass =
    status === 'error'
      ? 'ant-color-picker-status-error'
      : status === 'warning'
        ? 'ant-color-picker-status-warning'
        : '';

  const resolvedClassNames: ColorPickerProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const user = classNames(info);
          return {
            ...user,
            popup: {
              ...user?.popup,
              root: `omada-color-picker-popup ${user?.popup?.root ?? ''}`.trim(),
            },
          };
        }
      : {
          ...classNames,
          popup: {
            ...classNames?.popup,
            root: `omada-color-picker-popup ${classNames?.popup?.root ?? ''}`.trim(),
          },
        };

  return (
    <ColorPicker
      value={value}
      defaultValue={
        value === undefined && defaultValue === undefined
          ? omadaSemanticTokens.light.brand
          : defaultValue
      }
      showText={resolvedShowText}
      presets={resolvedPresets}
      className={`omada-color-picker ${
        hasText ? 'omada-color-picker-with-text' : ''
      } ${statusClass} ${className}`.trim()}
      classNames={resolvedClassNames}
      styles={styles}
      {...rest}
    />
  );
};
