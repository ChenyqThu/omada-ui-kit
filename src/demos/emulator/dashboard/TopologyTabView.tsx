import React, { useMemo, useState } from 'react';
import { Checkbox, Popover } from 'antd';
import type { EChartsOption } from 'echarts';
import {
  SChart,
  SIcon,
  SInput,
  SSelect,
  STooltip,
  useOmadaNotification,
  useOmadaTheme,
} from '@/omada';
import {
  DEFAULT_TOPOLOGY_DISPLAY_OPTIONS,
  STopologyCanvas,
  type TopologyDisplayOptions,
  type TopologyHealthFilter,
  type TopologyNodeData,
} from '../../../omada/components/STopologyCanvas';
import {
  TOPOLOGY_HEALTH_SUMMARY,
  TOPOLOGY_QUICK_CONFIG_TILES,
  TOPOLOGY_TREE_DATA,
  type QuickConfigTileItem,
} from '../map/mapData';

export interface TopologyToolbarControlsProps {
  /** Current search query string. */
  searchQuery: string;
  /** Called when search input changes. */
  onSearchChange: (value: string) => void;
  /** Current topology display options. */
  displayOptions: TopologyDisplayOptions;
  /** Called when a display option changes. */
  onDisplayOptionsChange: (next: TopologyDisplayOptions) => void;
  /** Called when Replay/Play button is clicked. */
  onReplay?: () => void;
  /** Called when Export button is clicked. */
  onExport?: () => void;
  className?: string;
}

/**
 * Right-aligned Topology top toolbar controls (`Search Name, IP, Model or MAC` +
 * `[Replay | Display Settings | Export]` pill) matching Omada Dashboard -> Topology.
 */
export const TopologyToolbarControls: React.FC<TopologyToolbarControlsProps> = ({
  searchQuery,
  onSearchChange,
  displayOptions,
  onDisplayOptionsChange,
  onReplay,
  onExport,
  className = '',
}) => {
  const [displayOpen, setDisplayOpen] = useState(false);

  const displayPopoverContent = (
    <div className="w-[210px] space-y-2 text-[13px]" data-testid="topology-display-popover">
      <div className="font-medium text-[var(--omada-text-primary)]">Display Options</div>
      <div className="flex flex-col gap-2">
        <Checkbox
          checked={displayOptions.showLinkLabels}
          onChange={(e) =>
            onDisplayOptionsChange({ ...displayOptions, showLinkLabels: e.target.checked })
          }
        >
          Link Speed &amp; Port
        </Checkbox>
        <Checkbox
          checked={displayOptions.showClients}
          onChange={(e) =>
            onDisplayOptionsChange({ ...displayOptions, showClients: e.target.checked })
          }
        >
          Connected Clients
        </Checkbox>
        <Checkbox
          checked={displayOptions.showController}
          onChange={(e) =>
            onDisplayOptionsChange({ ...displayOptions, showController: e.target.checked })
          }
        >
          Omada Controller
        </Checkbox>
        <Checkbox
          checked={displayOptions.showHealthStatus}
          onChange={(e) =>
            onDisplayOptionsChange({ ...displayOptions, showHealthStatus: e.target.checked })
          }
        >
          Health Status Dots
        </Checkbox>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      <SInput
        variant="filled"
        allowClear
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search Name, IP, Model or MAC"
        aria-label="Search Name, IP, Model or MAC"
        suffix={<SIcon name="input-search" size={14} className="text-[var(--omada-text-tertiary)]" />}
        className="omada-topo-search"
      />

      <div className="flex h-[32px] items-center overflow-hidden rounded-[4px] border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)]">
        <STooltip title="Topology Playback">
          <button
            type="button"
            aria-label="Topology playback"
            data-testid="topo-toolbar-replay-btn"
            onClick={onReplay}
            className="flex h-full w-[32px] cursor-pointer items-center justify-center border-0 bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-video" size={16} />
          </button>
        </STooltip>

        <Popover
          open={displayOpen}
          onOpenChange={setDisplayOpen}
          trigger="click"
          placement="bottomRight"
          content={displayPopoverContent}
        >
          <button
            type="button"
            aria-label="Display settings"
            data-testid="topo-toolbar-display-btn"
            className="flex h-full w-[32px] cursor-pointer items-center justify-center border-0 border-l border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-6" size={16} />
          </button>
        </Popover>

        <STooltip title="Export Topology">
          <button
            type="button"
            aria-label="Export topology"
            data-testid="topo-toolbar-export-btn"
            onClick={onExport}
            className="flex h-full w-[32px] cursor-pointer items-center justify-center border-0 border-l border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-export" size={16} />
          </button>
        </STooltip>
      </div>
    </div>
  );
};

export interface TopologyTabViewProps {
  /** Invoked when a device node is clicked (opens DevicePropertiesDrawer). */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Invoked when a Quick Config tile navigates to another route. */
  onNavigate?: (routeKey: string) => void;
  /** Hides the embedded top-right toolbar when rendered by parent header bar. */
  hideTopControls?: boolean;
  /** Controlled search query when toolbar is hoisted to parent header. */
  searchQuery?: string;
  /** Controlled search query setter. */
  onSearchChange?: (value: string) => void;
  /** Controlled display options when toolbar is hoisted to parent header. */
  displayOptions?: TopologyDisplayOptions;
  /** Controlled display options setter. */
  onDisplayOptionsChange?: (next: TopologyDisplayOptions) => void;
  className?: string;
}

/**
 * Omada Controller v6.3.0.34 `Dashboard -> Topology` workspace.
 * Combines the `260px` collapsible Left Panel (`Device Health` ECharts donut `9 Total`,
 * `Network Filter`, `2×4` `Quick Config` tiles) with `<STopologyCanvas>`.
 */
export const TopologyTabView: React.FC<TopologyTabViewProps> = ({
  onOpenDeviceByName,
  onNavigate,
  hideTopControls = false,
  searchQuery: controlledSearch,
  onSearchChange,
  displayOptions: controlledDisplay,
  onDisplayOptionsChange,
  className = '',
}) => {
  const notification = useOmadaNotification();
  const { resolvedTheme, tokens } = useOmadaTheme();

  const [innerSearch, setInnerSearch] = useState('');
  const searchQuery = controlledSearch ?? innerSearch;
  const setSearchQuery = (val: string) => {
    if (controlledSearch === undefined) setInnerSearch(val);
    onSearchChange?.(val);
  };

  const [innerDisplay, setInnerDisplay] = useState<TopologyDisplayOptions>(
    DEFAULT_TOPOLOGY_DISPLAY_OPTIONS,
  );
  const displayOptions = controlledDisplay ?? innerDisplay;
  const setDisplayOptions = (next: TopologyDisplayOptions) => {
    if (controlledDisplay === undefined) setInnerDisplay(next);
    onDisplayOptionsChange?.(next);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [healthFilter, setHealthFilter] = useState<TopologyHealthFilter>(null);
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [ssidFilter, setSsidFilter] = useState<string>('all');

  const healthColors = useMemo(
    () => ({
      good: tokens.brandHover,
      fair: tokens.warning,
      poor: tokens.error,
      'no-data': tokens.borderStrong,
    }),
    [tokens],
  );

  const donutBorderColor = resolvedTheme === 'dark' ? tokens.bgOverlay : tokens.bgSurface;

  const donutOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      series: [
        {
          name: 'Device Health',
          type: 'pie',
          radius: ['66%', '88%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          data: TOPOLOGY_HEALTH_SUMMARY.rows.map((row) => ({
            name: row.label,
            value: row.count,
            itemStyle: {
              color: healthColors[row.key],
              borderWidth: 1,
              borderColor: donutBorderColor,
            },
          })),
        },
      ],
    }),
    [healthColors, donutBorderColor],
  );

  const handleResetFilters = () => {
    setHealthFilter(null);
    setNetworkFilter('all');
    setSsidFilter('all');
    setSearchQuery('');
  };

  const handleQuickConfigClick = (tile: QuickConfigTileItem) => {
    if (tile.routeKey && onNavigate) {
      onNavigate(tile.routeKey);
      return;
    }
    notification.info({
      title: tile.label,
      description: tile.description,
    });
  };

  const handleReplay = () => {
    notification.info({
      title: 'Topology Playback',
      description: 'Showing live 24h topology snapshot (9 devices, 3 clients online).',
    });
  };

  const handleExport = () => {
    notification.success({
      title: 'Topology Exported',
      description: 'Exported Headquarters Building topology diagram as topology-map.svg.',
    });
  };

  const handleSelectNode = (node: TopologyNodeData) => {
    if (node.kind !== 'device') {
      notification.info({
        title: node.name,
        description:
          node.kind === 'internet'
            ? 'External WAN link (ISP Primary Fiber).'
            : `${node.kind === 'controller' ? 'Omada Software Controller' : 'Client'} · ${node.ip ?? node.mac ?? ''}`,
      });
    }
  };

  return (
    <div
      className={`omada-topology-view flex flex-col gap-3 ${className}`.trim()}
      data-testid="dashboard-tab-panel-topology"
    >
      {!hideTopControls && (
        <div className="flex justify-end">
          <TopologyToolbarControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            displayOptions={displayOptions}
            onDisplayOptionsChange={setDisplayOptions}
            onReplay={handleReplay}
            onExport={handleExport}
          />
        </div>
      )}

      <div className="relative flex items-stretch gap-4">
        {/* Left Collapsible Panel (260px) */}
        <div
          className={`relative shrink-0 transition-[width] duration-200 ${
            sidebarCollapsed ? 'w-0' : 'w-[260px]'
          }`}
        >
          {!sidebarCollapsed && (
            <aside
              data-testid="topology-left-panel"
              aria-label="Topology controls and health summary"
              className="omada-topo-sidebar-card flex h-full w-[260px] flex-col p-4"
            >
              {/* Section 1: Device Health Donut + 4-row Legend */}
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="m-0 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                    Device Health
                  </h2>
                  <STooltip title="Aggregated health status across 9 adopted site devices.">
                    <span className="inline-flex cursor-help items-center">
                      <SIcon name="info" size={16} />
                    </span>
                  </STooltip>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="relative h-[100px] w-[100px] shrink-0">
                    <SChart option={donutOption} height={100} />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span
                        data-testid="topo-health-total"
                        className="tabular-nums text-[19px] font-medium leading-none text-[var(--omada-text-primary)]"
                      >
                        {TOPOLOGY_HEALTH_SUMMARY.total}
                      </span>
                      <span className="mt-1 text-[11px] leading-none text-[var(--omada-text-tertiary)]">
                        Total
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {TOPOLOGY_HEALTH_SUMMARY.rows.map((row) => {
                      const active = healthFilter === row.key;
                      return (
                        <button
                          key={row.key}
                          type="button"
                          onClick={() =>
                            setHealthFilter(active ? null : (row.key as TopologyHealthFilter))
                          }
                          className={`flex w-full cursor-pointer items-center justify-between rounded-[3px] border-0 px-1 py-0.5 text-[12px] transition-colors ${
                            active
                              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
                              : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="inline-block h-[5px] w-[5px] rounded-[1px]"
                              style={{ backgroundColor: healthColors[row.key] }}
                              aria-hidden="true"
                            />
                            <span>{row.label}</span>
                          </span>
                          <span className="tabular-nums text-[var(--omada-text-primary)]">
                            {row.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-[var(--omada-border-divider)]" />

              {/* Section 2: Network Filter */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="m-0 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                    Network Filter
                  </h2>
                  <button
                    type="button"
                    data-testid="topo-filter-reset-btn"
                    onClick={handleResetFilters}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[var(--omada-link)] hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-2.5">
                  <SSelect
                    aria-label="Filter by Network"
                    className="omada-map-filled-select w-full"
                    value={networkFilter}
                    onChange={(v) => setNetworkFilter(String(v))}
                    options={[
                      { value: 'all', label: 'All Network' },
                      { value: 'Default', label: 'Default (VLAN 1)' },
                      { value: 'Corp-LAN', label: 'Corp-LAN (VLAN 10)' },
                      { value: 'IoT-VLAN20', label: 'IoT-VLAN20' },
                    ]}
                  />
                  <SSelect
                    aria-label="Filter by SSID"
                    className="omada-map-filled-select w-full"
                    value={ssidFilter}
                    onChange={(v) => setSsidFilter(String(v))}
                    options={[
                      { value: 'all', label: 'All SSID' },
                      { value: 'Corp-WiFi', label: 'Corp-WiFi' },
                      { value: 'Guest-WiFi', label: 'Guest-WiFi' },
                    ]}
                  />
                </div>
              </div>

              <div className="my-4 border-t border-[var(--omada-border-divider)]" />

              {/* Section 3: Quick Config 2x4 Tiles */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="m-0 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                    Quick Config
                  </h2>
                  <STooltip title="Customize Quick Config shortcuts">
                    <button
                      type="button"
                      aria-label="Edit Quick Config shortcuts"
                      onClick={() =>
                        notification.info({
                          title: 'Quick Config Editor',
                          description: 'All 8 Quick Config tiles are pinned for Main Office Floor.',
                        })
                      }
                      className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0.5 hover:opacity-80"
                    >
                      <SIcon name="edit" size={16} />
                    </button>
                  </STooltip>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-x-2 gap-y-3.5">
                  {TOPOLOGY_QUICK_CONFIG_TILES.map((tile) => (
                    <button
                      key={tile.key}
                      type="button"
                      data-testid={`topo-quick-tile-${tile.key}`}
                      onClick={() => handleQuickConfigClick(tile)}
                      className="omada-topo-quick-tile flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent p-1 text-center"
                    >
                      <span className="omada-topo-quick-tile-icon">
                        <SIcon name={tile.icon} size={18} />
                      </span>
                      <span className="text-[11px] leading-[14px] text-[var(--omada-text-secondary)]">
                        {tile.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Right-Border Collapse / Expand Toggle Button (< / >) */}
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand topology panel' : 'Collapse topology panel'}
            data-testid="topo-panel-collapse-btn"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="omada-map-floating-card absolute top-6 -right-3 z-20 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon
              name={sidebarCollapsed ? 'arrow-right' : 'arrow-left'}
              size={11}
            />
          </button>
        </div>

        {/* Interactive Topology Canvas */}
        <div className="min-w-0 flex-1">
          <STopologyCanvas
            root={TOPOLOGY_TREE_DATA}
            searchQuery={searchQuery}
            healthFilter={healthFilter}
            networkFilter={networkFilter}
            ssidFilter={ssidFilter}
            displayOptions={displayOptions}
            onOpenDeviceByName={onOpenDeviceByName}
            onSelectNode={handleSelectNode}
            height={584}
          />
        </div>
      </div>
    </div>
  );
};
