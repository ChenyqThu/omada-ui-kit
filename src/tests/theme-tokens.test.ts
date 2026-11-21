import { describe, expect, it } from 'vitest';
import {
  buildOmadaAntdTheme,
  omadaChartPalette,
  omadaPortColors,
  omadaSemanticTokens,
} from '@/omada';

describe('Omada Design Tokens', () => {
  it('has identical token keys between light and dark semantic sets', () => {
    const lightKeys = Object.keys(omadaSemanticTokens.light).sort();
    const darkKeys = Object.keys(omadaSemanticTokens.dark).sort();
    expect(darkKeys).toEqual(lightKeys);
  });

  it('uses Omada Emerald Green #00A870 and contains no Figma placeholder strings', () => {
    expect(omadaSemanticTokens.light.brand).toBe('#00A870');
    expect(omadaSemanticTokens.dark.brandText).toBe('#00A870');

    for (const mode of ['light', 'dark'] as const) {
      for (const value of Object.values(omadaSemanticTokens[mode])) {
        expect(value).not.toBe('');
        expect(value.toLowerCase()).not.toContain('string value');
      }
    }
  });

  it('defines all 11 physical port speed colors and 20 categorical chart colors in both modes', () => {
    expect(Object.keys(omadaPortColors.light)).toHaveLength(11);
    expect(Object.keys(omadaPortColors.dark)).toHaveLength(11);
    expect(omadaChartPalette.light).toHaveLength(20);
    expect(omadaChartPalette.dark).toHaveLength(20);
  });

  it('builds valid Ant Design 5 theme configurations for light and dark modes', () => {
    const lightTheme = buildOmadaAntdTheme('light');
    const darkTheme = buildOmadaAntdTheme('dark');

    expect(lightTheme.token?.colorPrimary).toBe('#00A870');
    expect(lightTheme.token?.controlHeight).toBe(32);
    expect(lightTheme.token?.borderRadius).toBe(4);
    expect(darkTheme.token?.colorPrimary).toBe('#008055');
    expect(darkTheme.token?.colorBgBase).toBe('#1A1A1A');
  });
});
