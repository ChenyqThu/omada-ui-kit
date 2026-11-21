import React from 'react';
import {
  SCard,
  SPageHeader,
  omadaChartPalette,
  omadaPortColors,
  omadaPortLabels,
  omadaRadius,
  omadaSpacing,
  omadaTypography,
  useOmadaTheme,
  type PortSpeedKey,
} from '@/omada';

interface SwatchItemProps {
  name: string;
  value: string;
}

const SwatchItem: React.FC<SwatchItemProps> = ({ name, value }) => (
  <div className="flex items-center gap-3 rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-2.5">
    <div
      className="h-9 w-9 shrink-0 rounded border border-black/10 dark:border-white/15"
      style={{ background: value }}
    />
    <div className="min-w-0">
      <div className="truncate text-xs font-semibold text-[var(--omada-text-primary)]">
        {name}
      </div>
      <div className="truncate font-mono text-[11px] text-[var(--omada-text-tertiary)]">
        {value}
      </div>
    </div>
  </div>
);

export const TokensSection: React.FC = () => {
  const { resolvedTheme, tokens } = useOmadaTheme();
  const portPalette = omadaPortColors[resolvedTheme];
  const chartColors = omadaChartPalette[resolvedTheme];

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Design Tokens"
        description={`Active mode: ${resolvedTheme.toUpperCase()} — Toggle the theme switcher in the Top Bar to inspect live Light / Dark token bindings.`}
      />

      <SCard title="Brand, Top Bar & Status Tokens">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SwatchItem name="Brand Primary" value={tokens.brand} />
          <SwatchItem name="Brand Hover" value={tokens.brandHover} />
          <SwatchItem name="Top Bar Gradient" value={tokens.topBarBg} />
          <SwatchItem name="Link" value={tokens.link} />
          <SwatchItem name="Success" value={tokens.success} />
          <SwatchItem name="Error" value={tokens.error} />
          <SwatchItem name="Warning Major" value={tokens.warning} />
          <SwatchItem name="Warning Minor" value={tokens.warningMinor} />
          <SwatchItem name="Info" value={tokens.info} />
          <SwatchItem name="Discovery Magenta" value={tokens.magenta} />
          <SwatchItem name="Accent Purple" value={tokens.purple} />
          <SwatchItem name="Focus Border" value={tokens.borderFocus} />
        </div>
      </SCard>

      <SCard title="Surfaces, Borders & Text Neutrals">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SwatchItem name="Page Background" value={tokens.bgPage} />
          <SwatchItem name="Surface Card" value={tokens.bgSurface} />
          <SwatchItem name="Sidebar Background" value={tokens.bgSidebar} />
          <SwatchItem name="Field Fill" value={tokens.bgField} />
          <SwatchItem name="Table Header" value={tokens.bgTableHeader} />
          <SwatchItem name="Overlay / Drawer" value={tokens.bgOverlay} />
          <SwatchItem name="Divider Border" value={tokens.borderDivider} />
          <SwatchItem name="Text Primary" value={tokens.textPrimary} />
          <SwatchItem name="Text Secondary" value={tokens.textSecondary} />
          <SwatchItem name="Text Tertiary" value={tokens.textTertiary} />
        </div>
      </SCard>

      <SCard title="Port Speed Colors (11 States from Figma)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(Object.keys(portPalette) as PortSpeedKey[]).map((key) => (
            <SwatchItem
              key={key}
              name={omadaPortLabels[key]}
              value={portPalette[key]}
            />
          ))}
        </div>
      </SCard>

      <SCard title="Chart Categorical Palette (20 Series)">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
          {chartColors.map((hex, i) => (
            <SwatchItem key={hex + i} name={`Series ${i + 1}`} value={hex} />
          ))}
        </div>
      </SCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Typography Scale (Manrope)">
          <div className="space-y-3">
            {Object.entries(omadaTypography).map(([name, spec]) => (
              <div
                key={name}
                className="flex items-baseline justify-between border-b border-[var(--omada-border-divider)] pb-2 last:border-b-0 last:pb-0"
              >
                <span
                  style={{
                    fontSize: spec.size,
                    lineHeight: `${spec.lineHeight}px`,
                    fontWeight: spec.weight,
                  }}
                >
                  Omada Network — {name}
                </span>
                <span className="font-mono text-xs text-[var(--omada-text-tertiary)]">
                  {spec.size}px / {spec.lineHeight}px · {spec.weight}
                </span>
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-mono text-sm">192.168.0.1 · 00-FF-00-05-3E-FC</span>
              <span className="font-mono text-xs text-[var(--omada-text-tertiary)]">
                monospace
              </span>
            </div>
          </div>
        </SCard>

        <SCard title="Spacing, Radius & Elevation Shadows">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-semibold text-[var(--omada-text-secondary)]">
                Spacing Scale (px)
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {omadaSpacing
                  .filter((v) => v > 0)
                  .map((v) => (
                    <div key={v} className="flex flex-col items-center gap-1">
                      <div
                        className="rounded-xs bg-[var(--omada-brand)]"
                        style={{ width: v, height: 14 }}
                      />
                      <span className="font-mono text-[11px] text-[var(--omada-text-tertiary)]">
                        {v}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-[var(--omada-text-secondary)]">
                Border Radius
              </div>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(omadaRadius).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex h-10 w-16 flex-col items-center justify-center border border-[var(--omada-border-strong)] bg-[var(--omada-bg-field)] text-[11px]"
                    style={{ borderRadius: v === 9999 ? 9999 : v }}
                  >
                    <span className="font-semibold">{k}</span>
                    <span className="font-mono text-[10px] text-[var(--omada-text-tertiary)]">
                      {v === 9999 ? 'pill' : `${v}px`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-[var(--omada-text-secondary)]">
                Elevation Shadows
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Tooltip', tokens.shadowTooltip],
                  ['Dropdown / Modal', tokens.shadowDropdown],
                  ['Popover / Toast', tokens.shadowPopover],
                  ['Drawer', tokens.shadowDrawer],
                ].map(([label, shadow]) => (
                  <div
                    key={label}
                    className="rounded-md bg-[var(--omada-bg-overlay)] px-3 py-2.5 text-xs font-medium"
                    style={{ boxShadow: shadow }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SCard>
      </div>
    </div>
  );
};
