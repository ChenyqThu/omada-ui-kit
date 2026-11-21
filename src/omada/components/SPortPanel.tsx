import React from 'react';
import { Tooltip } from 'antd';
import {
  ArrowUp,
  Ban,
  Copy,
  Layers,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useOmadaTheme } from '../theme/OmadaProvider';
import {
  omadaPortColors,
  omadaPortLabels,
  type PortSpeedKey,
} from '../theme/tokens';

export type PortBadgeType = 'poe' | 'uplink' | 'mirror' | 'blocking' | 'stack';

export interface SPortItem {
  id: number;
  label?: string;
  status: PortSpeedKey;
  type?: 'rj45' | 'sfp' | 'wan' | 'lan';
  badges?: PortBadgeType[];
  vlan?: string;
  poeWatts?: number;
  clientName?: string;
}

export interface SPortPanelProps {
  ports: SPortItem[];
  size?: 'sm' | 'lg';
  layout?: 'double-row' | 'single-row';
  selectable?: boolean;
  selectedIds?: number[];
  onSelectChange?: (ids: number[]) => void;
  showLegend?: boolean;
  className?: string;
}

const BADGE_ICONS: Record<PortBadgeType, LucideIcon> = {
  poe: Zap,
  uplink: ArrowUp,
  mirror: Copy,
  blocking: Ban,
  stack: Layers,
};

function isLightPortText(status: PortSpeedKey): boolean {
  return status !== 'disconnected' && status !== '100m' && status !== '1g';
}

/**
 * Interactive Switch / Gateway physical port matrix matching Omada Figma port speed colors (11 states).
 * Supports single-row or double-row (odd top / even bottom) layout, port badges, tooltips, and selection.
 */
export const SPortPanel: React.FC<SPortPanelProps> = ({
  ports,
  size = 'sm',
  layout = 'double-row',
  selectable = false,
  selectedIds = [],
  onSelectChange,
  showLegend = true,
  className = '',
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaPortColors[resolvedTheme];
  const boxSize = size === 'lg' ? 40 : 26;
  const iconSize = size === 'lg' ? 14 : 11;

  const togglePort = (port: SPortItem) => {
    if (!selectable || !onSelectChange || port.status === 'disabled') return;
    const exists = selectedIds.includes(port.id);
    const next = exists
      ? selectedIds.filter((id) => id !== port.id)
      : [...selectedIds, port.id];
    onSelectChange(next);
  };

  const renderPortTile = (port: SPortItem, labelPos: 'top' | 'bottom') => {
    const color = palette[port.status];
    const isSelected = selectedIds.includes(port.id);
    const isSfp = port.type === 'sfp';
    const primaryBadge = port.badges?.[0];
    const BadgeIcon = primaryBadge ? BADGE_ICONS[primaryBadge] : null;
    const lightText = isLightPortText(port.status);
    const labelText = port.label ?? String(port.id);

    const tooltipContent = (
      <div className="space-y-0.5 text-xs">
        <div className="font-semibold">
          Port {labelText} ({(port.type ?? 'rj45').toUpperCase()})
        </div>
        <div>Speed: {omadaPortLabels[port.status]}</div>
        {port.vlan && <div>VLAN: {port.vlan}</div>}
        {port.poeWatts !== undefined && <div>PoE: {port.poeWatts.toFixed(1)} W</div>}
        {port.clientName && <div>Link: {port.clientName}</div>}
        {port.badges && port.badges.length > 0 && (
          <div>Flags: {port.badges.join(', ').toUpperCase()}</div>
        )}
      </div>
    );

    const labelEl = (
      <span className="tabular-nums text-[10px] font-medium leading-3 text-[var(--omada-text-secondary)]">
        {labelText}
      </span>
    );

    return (
      <Tooltip key={port.id} title={tooltipContent} mouseEnterDelay={0.12}>
        <div className="flex flex-col items-center gap-1">
          {labelPos === 'top' && labelEl}
          <button
            type="button"
            disabled={!selectable || port.status === 'disabled'}
            onClick={() => togglePort(port)}
            aria-label={`Port ${labelText} ${omadaPortLabels[port.status]}`}
            aria-pressed={selectable ? isSelected : undefined}
            style={{
              width: boxSize,
              height: boxSize,
              backgroundColor: color,
              color: lightText ? '#FFFFFF' : '#2B2B2B',
            }}
            className={`relative flex items-center justify-center rounded-[3px] transition-transform ${
              isSfp ? 'border-2 border-black/25 dark:border-white/30' : ''
            } ${
              selectable && port.status !== 'disabled'
                ? 'cursor-pointer hover:scale-105'
                : 'cursor-default'
            } ${
              isSelected
                ? 'ring-2 ring-[var(--omada-brand)] ring-offset-2 ring-offset-[var(--omada-bg-surface)]'
                : ''
            }`}
          >
            {BadgeIcon ? (
              <BadgeIcon size={iconSize} />
            ) : (
              <span
                className="rounded-[1px] opacity-60"
                style={{
                  width: Math.round(boxSize * 0.42),
                  height: Math.round(boxSize * 0.3),
                  border: '1.5px solid currentColor',
                }}
              />
            )}
          </button>
          {labelPos === 'bottom' && labelEl}
        </div>
      </Tooltip>
    );
  };

  const rj45OrTop: SPortItem[] = [];
  const bottomRow: SPortItem[] = [];

  if (layout === 'double-row') {
    ports.forEach((p, idx) => {
      if (idx % 2 === 0) rj45OrTop.push(p);
      else bottomRow.push(p);
    });
  }

  const usedStatuses = Array.from(new Set(ports.map((p) => p.status)));

  return (
    <div className={className}>
      <div className="inline-block max-w-full overflow-x-auto rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-4 py-3">
        {layout === 'single-row' ? (
          <div className="flex items-center gap-2">
            {ports.map((p) => renderPortTile(p, 'bottom'))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {rj45OrTop.map((p) => renderPortTile(p, 'top'))}
            </div>
            {bottomRow.length > 0 && (
              <div className="flex items-center gap-2">
                {bottomRow.map((p) => renderPortTile(p, 'bottom'))}
              </div>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--omada-text-secondary)]">
          {usedStatuses.map((statusKey) => (
            <span key={statusKey} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: palette[statusKey] }}
              />
              <span>{omadaPortLabels[statusKey]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
