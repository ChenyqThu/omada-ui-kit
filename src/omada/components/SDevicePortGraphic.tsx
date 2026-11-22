import React from 'react';
import { Tooltip } from 'antd';
import { ArrowUp, Ban, Eye, Zap } from 'lucide-react';
import { hasOmadaProductImage } from '../assets/SProductImage';
import { SProductImage } from '../assets/SProductImage';
import { SIcon } from '../assets/SIcon';
import type { OmadaProductName } from '../assets/assetsManifest';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaPortColors, type PortSpeedKey } from '../theme/tokens';

/**
 * Physical switch / gateway port item used by `SDevicePortGraphic` and `DevicePropertiesDrawer`.
 */
export interface DrawerPortItem {
  port: number;
  name: string;
  linkStatus: '10g' | '2.5g' | '1000m' | '100m' | 'disabled' | 'disconnected';
  isSfp?: boolean;
  isUplink?: boolean;
  isPoe?: boolean;
  isMirroring?: boolean;
  isBlocking?: boolean;
  isLag?: boolean;
  lacp?: string;
  connectionName?: string;
  connectionProductSlug?: string;
  connectionType?: 'gateway' | 'switch' | 'ap' | 'olt' | 'client';
  label?: string;
  type?: string;
  poeCapability?: string;
  profile?: string;
  nativeNetwork?: string;
  txSum?: string;
  rxSum?: string;
}

export interface SDevicePortGraphicProps {
  /** Ordered list of physical ports on the device. */
  ports: DrawerPortItem[];
  /** `compact` renders 32px tiles + Used Port header; `full` renders 40px tiles + optional connected devices + legend. */
  mode?: 'compact' | 'full';
  /** Displays floating connected device thumbnails with vertical stem lines above connected ports in `full` mode. */
  showConnectedDevices?: boolean;
  /** Controls the `Used Port: X/Y` + info icon header row (defaults to `true` in `compact` mode). */
  showHeader?: boolean;
  /** Controls the 10-item horizontal port legend below the graphic (defaults to `true` in `full` mode). */
  showLegend?: boolean;
  /** Override count of used ports shown in compact header. */
  usedPorts?: number;
  /** Override count of total ports shown in compact header. */
  totalPorts?: number;
  /** Currently selected port number for table/graphic synchronization. */
  selectedPort?: number | null;
  /** Callback fired when a port tile is clicked. */
  onSelectPort?: (port: DrawerPortItem) => void;
  className?: string;
}

export interface PortBadgeTileProps {
  port: Pick<
    DrawerPortItem,
    | 'port'
    | 'name'
    | 'linkStatus'
    | 'isSfp'
    | 'isUplink'
    | 'isPoe'
    | 'isMirroring'
    | 'isBlocking'
    | 'isLag'
  >;
  size?: number;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const SPEED_TOKEN_MAP: Record<DrawerPortItem['linkStatus'], PortSpeedKey> = {
  '10g': '10g',
  '2.5g': '2.5g',
  '1000m': '1g',
  '100m': '100m',
  disabled: 'disabled',
  disconnected: 'disconnected',
};

const SPEED_DISPLAY_LABEL: Record<DrawerPortItem['linkStatus'], string> = {
  '10g': '10 Gbps',
  '2.5g': '2.5 Gbps',
  '1000m': '1000 Mbps',
  '100m': '10/100 Mbps',
  disabled: 'Disabled',
  disconnected: 'Disconnected',
};

/**
 * Resolves a valid `SProductImage` slug for a connected neighbor device.
 */
export function resolveConnectedProductSlug(
  slug?: string,
  connectionType?: DrawerPortItem['connectionType'],
  connectionName?: string,
): OmadaProductName {
  if (slug && hasOmadaProductImage(slug)) {
    return slug as OmadaProductName;
  }
  const lowerName = (connectionName ?? '').toLowerCase();
  if (lowerName.includes('breakroom') && hasOmadaProductImage('eap668-outdoor-hd-un-1-2')) {
    return 'eap668-outdoor-hd-un-1-2';
  }
  if (connectionType === 'gateway' || lowerName.includes('gateway')) {
    return 'gateway-er7206';
  }
  if (connectionType === 'ap' || lowerName.includes('eap') || lowerName.includes('ap')) {
    return 'eap650';
  }
  if (connectionType === 'olt' || lowerName.includes('olt')) {
    return 'sg3452p-un-3-40';
  }
  if (connectionType === 'switch' || lowerName.includes('switch')) {
    return 'sg2428p-un-5-40';
  }
  return 'computer';
}

/**
 * Crisp white/monochrome SFP fiber transceiver module icon matching Omada Controller v6.3.
 */
export const SfpGlyph: React.FC<{ size?: number; className?: string }> = ({
  size = 15,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect
      x="3.2"
      y="4.2"
      width="9.6"
      height="8.6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M5.6 4.2V2.6H10.4V4.2"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M6.4 7.2V10.1M9.6 7.2V10.1"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Link Aggregation (LAG) stacked-port badge glyph.
 */
export const LagGlyph: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect x="2" y="2" width="12" height="12" rx="2.5" fill="currentColor" fillOpacity="0.22" />
    <path
      d="M5.2 6.5H10.8M5.2 9.5H10.8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

function renderPortIcon(port: PortBadgeTileProps['port'], iconSize: number): React.ReactNode {
  if (port.isUplink) {
    return <ArrowUp size={iconSize} strokeWidth={2.2} aria-hidden="true" />;
  }
  if (port.isBlocking) {
    return <Ban size={iconSize} strokeWidth={2} aria-hidden="true" />;
  }
  if (port.isMirroring) {
    return <Eye size={iconSize} strokeWidth={2} aria-hidden="true" />;
  }
  if (port.isLag) {
    return <LagGlyph size={iconSize} />;
  }
  if (port.isPoe && port.linkStatus !== 'disconnected' && port.linkStatus !== 'disabled') {
    return <Zap size={iconSize} fill="currentColor" strokeWidth={1.6} aria-hidden="true" />;
  }
  if (port.isSfp) {
    return <SfpGlyph size={iconSize} />;
  }
  return null;
}

/**
 * Single physical port square tile used in port graphics, connection rows, and port tables.
 */
export const PortBadgeTile: React.FC<PortBadgeTileProps> = ({
  port,
  size = 32,
  interactive = false,
  selected = false,
  onClick,
  className = '',
}) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaPortColors[resolvedTheme];
  const colorKey = SPEED_TOKEN_MAP[port.linkStatus] ?? 'disconnected';
  const bgColor = palette[colorKey];
  const iconSize = Math.max(12, Math.round(size * 0.46));
  const glyph = renderPortIcon(port, iconSize);

  const classes = [
    'omada-port-tile',
    interactive ? 'omada-port-tile--interactive' : '',
    selected ? 'omada-port-tile--selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: bgColor,
  };

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Port ${port.port} ${SPEED_DISPLAY_LABEL[port.linkStatus]}`}
        aria-pressed={selected}
        data-port-status={port.linkStatus}
        style={style}
        className={classes}
      >
        {glyph}
      </button>
    );
  }

  return (
    <span
      aria-label={`Port ${port.port} ${SPEED_DISPLAY_LABEL[port.linkStatus]}`}
      data-port-status={port.linkStatus}
      style={style}
      className={classes}
    >
      {glyph}
    </span>
  );
};

/**
 * 10-item horizontal port speed & attribute legend matching Omada Controller v6.3.
 */
export const PortStatusLegend: React.FC<{
  ports?: DrawerPortItem[];
  className?: string;
}> = ({ ports = [], className = '' }) => {
  const { resolvedTheme } = useOmadaTheme();
  const palette = omadaPortColors[resolvedTheme];
  const has10g = ports.some((p) => p.linkStatus === '10g');
  const has25g = ports.some((p) => p.linkStatus === '2.5g');

  const speedItems: Array<{ label: string; color: string }> = [
    { label: '10/100 Mbps', color: palette['100m'] },
    { label: '1000 Mbps', color: palette['1g'] },
    ...(has25g ? [{ label: '2.5 Gbps', color: palette['2.5g'] }] : []),
    ...(has10g ? [{ label: '10 Gbps', color: palette['10g'] }] : []),
    { label: 'Disabled', color: palette.disabled },
    { label: 'Disconnected', color: palette.disconnected },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-[var(--omada-text-secondary)] ${className}`.trim()}
    >
      {speedItems.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span
            className="inline-block h-[10px] w-[10px] shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </span>
      ))}

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="inline-flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-[2px]"
          style={{ backgroundColor: palette.disconnected, color: 'var(--omada-text-inverse)' }}
        >
          <LagGlyph size={11} />
        </span>
        <span>LAG</span>
      </span>

      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Zap size={13} strokeWidth={1.8} aria-hidden="true" />
        <span>PoE</span>
      </span>

      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Eye size={13} strokeWidth={1.8} aria-hidden="true" />
        <span>Mirroring</span>
      </span>

      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Ban size={13} strokeWidth={1.8} aria-hidden="true" />
        <span>Blocking</span>
      </span>

      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <SfpGlyph size={13} />
        <span>SFP</span>
      </span>

      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <ArrowUp size={13} strokeWidth={1.9} aria-hidden="true" />
        <span>Uplink</span>
      </span>
    </div>
  );
};

/**
 * Interactive physical port strip for Omada Quick Properties (`mode="compact"`)
 * and Expanded Manage Device Ports view (`mode="full"` with floating connected device thumbnails).
 */
export const SDevicePortGraphic: React.FC<SDevicePortGraphicProps> = ({
  ports,
  mode = 'compact',
  showConnectedDevices = false,
  showHeader,
  showLegend,
  usedPorts,
  totalPorts,
  selectedPort = null,
  onSelectPort,
  className = '',
}) => {
  const resolvedShowHeader = showHeader ?? mode === 'compact';
  const resolvedShowLegend = showLegend ?? mode === 'full';
  const tileSize = mode === 'full' ? 40 : 32;

  const computedTotal = totalPorts ?? ports.length;
  const computedUsed =
    usedPorts ??
    ports.filter((p) => p.linkStatus !== 'disconnected' && p.linkStatus !== 'disabled').length;

  const hasAnyConnectedNode =
    mode === 'full' &&
    showConnectedDevices &&
    ports.some((p) => Boolean(p.connectionName || p.connectionProductSlug));

  const renderPortTooltip = (port: DrawerPortItem) => {
    const flags = [
      port.isUplink && 'Uplink',
      port.isPoe && 'PoE',
      port.isSfp && 'SFP',
      port.isLag && 'LAG',
      port.isMirroring && 'Mirroring',
      port.isBlocking && 'Blocking',
    ].filter(Boolean);

    return (
      <div className="space-y-0.5 text-xs">
        <div className="font-semibold">{port.name || `Port${port.port}`}</div>
        <div>Speed: {SPEED_DISPLAY_LABEL[port.linkStatus]}</div>
        {port.connectionName && <div>Connected: {port.connectionName}</div>}
        {flags.length > 0 && <div>Attributes: {flags.join(', ')}</div>}
      </div>
    );
  };

  const infoTooltip = (
    <div className="space-y-1 text-xs">
      <div className="font-semibold">Port Status Legend</div>
      <div>Green: 1000 Mbps / 2.5G | Amber: 10/100 Mbps | Gray: Disconnected</div>
      <div>↑ Uplink · ⚡ PoE · SFP Transceiver</div>
    </div>
  );

  return (
    <div className={`omada-port-graphic w-full ${className}`.trim()}>
      {resolvedShowHeader && (
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[13px] leading-5">
            <span className="text-[var(--omada-text-secondary)]">Used Port: </span>
            <span className="font-medium tabular-nums text-[var(--omada-text-primary)]">
              {computedUsed}/{computedTotal}
            </span>
          </div>
          <Tooltip title={infoTooltip} placement="left">
            <button
              type="button"
              aria-label="Port status legend"
              className="inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 hover:opacity-80"
            >
              <SIcon name="info" size={16} />
            </button>
          </Tooltip>
        </div>
      )}

      {mode === 'compact' ? (
        <div
          className={
            ports.length <= 12
              ? 'flex w-full items-end justify-between gap-1'
              : 'flex w-full flex-wrap items-end gap-1.5'
          }
        >
          {ports.map((port) => {
            const isSelected = selectedPort === port.port;
            return (
              <div key={port.port} className="flex flex-col items-center">
                <span className="mb-1 text-[11px] leading-4 tabular-nums text-[var(--omada-text-secondary)]">
                  {port.port}
                </span>
                <Tooltip title={renderPortTooltip(port)} mouseEnterDelay={0.12}>
                  <div className="flex items-center justify-center leading-none">
                    <PortBadgeTile
                      port={port}
                      size={tileSize}
                      interactive={Boolean(onSelectPort)}
                      selected={isSelected}
                      onClick={() => onSelectPort?.(port)}
                    />
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex w-full justify-center overflow-x-auto pb-1">
          <div className="inline-flex items-end gap-[10px]">
            {ports.map((port) => {
              const isSelected = selectedPort === port.port;
              const hasConnection = Boolean(port.connectionName || port.connectionProductSlug);
              const connectedSlug = hasConnection
                ? resolveConnectedProductSlug(
                    port.connectionProductSlug,
                    port.connectionType,
                    port.connectionName,
                  )
                : null;

              return (
                <div key={port.port} className="flex w-[40px] shrink-0 flex-col items-center">
                  {hasAnyConnectedNode && (
                    <div className="mb-1 flex h-[54px] shrink-0 flex-col items-center justify-end">
                      {connectedSlug && (
                        <>
                          <Tooltip
                            title={
                              <div className="text-xs">
                                <div className="font-semibold">
                                  {port.connectionName ?? `Connected Device (Port ${port.port})`}
                                </div>
                                <div>
                                  Port {port.port} · {SPEED_DISPLAY_LABEL[port.linkStatus]}
                                </div>
                              </div>
                            }
                          >
                            <div
                              aria-label={port.connectionName ?? `Port ${port.port} peer`}
                              className="flex h-[38px] w-[38px] items-center justify-center"
                            >
                              <SProductImage
                                name={connectedSlug}
                                size={36}
                                className="max-h-[36px] max-w-[36px] object-contain"
                              />
                            </div>
                          </Tooltip>
                          <span className="omada-port-stem mt-1" aria-hidden="true" />
                        </>
                      )}
                    </div>
                  )}

                  <span className="mb-1.5 text-[12px] leading-4 tabular-nums text-[var(--omada-text-secondary)]">
                    {port.port}
                  </span>

                  <Tooltip title={renderPortTooltip(port)} mouseEnterDelay={0.12}>
                    <div className="flex items-center justify-center leading-none">
                      <PortBadgeTile
                        port={port}
                        size={tileSize}
                        interactive={Boolean(onSelectPort)}
                        selected={isSelected}
                        onClick={() => onSelectPort?.(port)}
                      />
                    </div>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resolvedShowLegend && (
        <div className="mt-5">
          <PortStatusLegend ports={ports} />
        </div>
      )}
    </div>
  );
};
