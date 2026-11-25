import React, { useMemo, useRef, useState } from 'react';
import { Dropdown, Popover, Table, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Check, FileText } from 'lucide-react';
import {
  SButton,
  SCheckbox,
  SIcon,
  SInput,
  SModal,
  SProductImage,
  SSelect,
  SSwitch,
  STabs,
  STooltip,
  useOmadaNotification,
} from '@/omada';
import { SSettingsPageShell } from '../../../omada/components/SSettingsPageShell';
import {
  INITIAL_ISOLATION_RULES,
  INITIAL_LAN_DNS_RULES,
  INITIAL_VLANS,
  INITIAL_VLAN_PORTS,
  VLAN_TOPOLOGY_TREE,
  type LanDnsRecord,
  type LanIsolationRule,
  type LanVlanRecord,
  type VlanPortAssignment,
  type VlanTopoNode,
} from './networkCoreData';

export interface LanPageProps {
  /** Optional callback when clicking a device node in the VLAN Topology canvas. */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Optional navigation callback (e.g. clicking Full Topology). */
  onNavigate?: (routeKey: string) => void;
  /** Optional initial top tab key (`'vlan'` default). */
  initialTab?: LanTabKey;
  className?: string;
}

export type LanTabKey = 'vlan' | 'multicast-snooping' | 'isolation-settings' | 'lan-dns';
type VlanSubViewKey = 'topology' | 'ports';
type TopoLayoutMode = 'horizontal' | 'vertical';

interface PositionedVlanNode {
  node: VlanTopoNode;
  x: number;
  y: number;
  isMember: boolean;
  isDhcpServer: boolean;
  hubX?: number;
  hubY?: number;
  isCollapsed: boolean;
  hiddenCount: number;
}

interface PositionedVlanEdge {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  active: boolean;
  dashed: boolean;
  portLabel?: string;
  speedLabel?: string;
  labelX: number;
  labelY: number;
}

const HEALTH_DOT_VAR: Record<VlanTopoNode['healthDot'], string | null> = {
  good: 'var(--omada-brand-hover)',
  fair: 'var(--omada-color-warning)',
  poor: 'var(--omada-color-error)',
  none: null,
};

const NODE_COORDS_HORIZONTAL: Record<string, { x: number; y: number }> = {
  'breakroom-gateway-1': { x: 84, y: 292 },
  'mainoffice-gateway-2': { x: 274, y: 292 },
  'ctooffice-switch-1': { x: 504, y: 84 },
  'serverroom-switch-2': { x: 504, y: 176 },
  'salesdepartment-switch-3': { x: 504, y: 268 },
  'datacenter-olt-1': { x: 504, y: 360 },
  'omada-controller': { x: 504, y: 446 },
  'coooffice-eap-1': { x: 744, y: 176 },
  'breakroom-eap-2': { x: 744, y: 268 },
  'storageroom-eap-3': { x: 744, y: 360 },
};

const NODE_COORDS_VERTICAL: Record<string, { x: number; y: number }> = {
  'breakroom-gateway-1': { x: 430, y: 54 },
  'mainoffice-gateway-2': { x: 430, y: 158 },
  'ctooffice-switch-1': { x: 102, y: 290 },
  'serverroom-switch-2': { x: 268, y: 290 },
  'salesdepartment-switch-3': { x: 434, y: 290 },
  'datacenter-olt-1': { x: 600, y: 290 },
  'omada-controller': { x: 762, y: 290 },
  'coooffice-eap-1': { x: 268, y: 424 },
  'breakroom-eap-2': { x: 434, y: 424 },
  'storageroom-eap-3': { x: 600, y: 424 },
};

function countDescendants(node: VlanTopoNode): number {
  const children = node.children ?? [];
  return children.length + children.reduce((acc, c) => acc + countDescendants(c), 0);
}

interface VlanTopologyStageProps {
  vlan: LanVlanRecord;
  searchQuery: string;
  layout: TopoLayoutMode;
  onToggleLayout: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  pan: { x: number; y: number };
  onPanChange: (next: { x: number; y: number }) => void;
  collapsedIds: Set<string>;
  onToggleCollapse: (nodeId: string) => void;
  onOpenDeviceByName?: (deviceName: string) => void;
  height?: number;
}

const VlanTopologyStage: React.FC<VlanTopologyStageProps> = ({
  vlan,
  searchQuery,
  layout,
  onToggleLayout,
  zoom,
  onZoomIn,
  onZoomOut,
  onRecenter,
  pan,
  onPanChange,
  collapsedIds,
  onToggleCollapse,
  onOpenDeviceByName,
  height = 505,
}) => {
  const notification = useOmadaNotification();
  const [legendOpen, setLegendOpen] = useState(false);

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const memberSet = useMemo(() => new Set(vlan.memberNodeIds), [vlan.memberNodeIds]);
  const coordsMap = layout === 'horizontal' ? NODE_COORDS_HORIZONTAL : NODE_COORDS_VERTICAL;
  const stageWidth = 860;
  const stageHeight = 500;

  const { nodes, edges } = useMemo(() => {
    const outNodes: PositionedVlanNode[] = [];
    const outEdges: PositionedVlanEdge[] = [];

    const visit = (node: VlanTopoNode) => {
      const pos = coordsMap[node.id] ?? { x: 400, y: 240 };
      const isMember = memberSet.has(node.id);
      const isDhcpServer = Boolean(vlan.dhcpEnabled && vlan.dhcpServerNodeId === node.id);
      const children = node.children ?? [];
      const isCollapsed = Boolean(node.collapsible && collapsedIds.has(node.id));
      const hasHub = Boolean(node.collapsible && children.length > 0);

      const hubX = hasHub
        ? layout === 'horizontal'
          ? pos.x + 96
          : pos.x
        : undefined;
      const hubY = hasHub
        ? layout === 'horizontal'
          ? pos.y
          : pos.y + 52
        : undefined;

      outNodes.push({
        node,
        x: pos.x,
        y: pos.y,
        isMember,
        isDhcpServer,
        hubX,
        hubY,
        isCollapsed,
        hiddenCount: isCollapsed ? countDescendants(node) : 0,
      });

      if (hasHub && hubX !== undefined && hubY !== undefined) {
        outEdges.push({
          id: `${node.id}-hub`,
          fromX: layout === 'horizontal' ? pos.x + (isMember ? 79 : 26) : pos.x,
          fromY: layout === 'horizontal' ? pos.y : pos.y + (isMember ? 35 : 26),
          toX: layout === 'horizontal' ? hubX - 9 : hubX,
          toY: layout === 'horizontal' ? hubY : hubY - 9,
          active: isMember,
          dashed: false,
          labelX: 0,
          labelY: 0,
        });
      }

      if (!isCollapsed) {
        for (const child of children) {
          const cPos = coordsMap[child.id] ?? { x: pos.x + 180, y: pos.y };
          const childIsMember = memberSet.has(child.id);
          const edgeActive = childIsMember && (isMember || node.id === 'breakroom-gateway-1');

          const fromX = hasHub && hubX !== undefined
            ? layout === 'horizontal'
              ? hubX + 9
              : hubX
            : layout === 'horizontal'
              ? pos.x + (isMember ? 79 : 26)
              : pos.x;
          const fromY = hasHub && hubY !== undefined
            ? layout === 'horizontal'
              ? hubY
              : hubY + 9
            : layout === 'horizontal'
              ? pos.y
              : pos.y + (isMember ? 35 : 26);

          const toX = layout === 'horizontal'
            ? cPos.x - (childIsMember ? 79 : 28)
            : cPos.x;
          const toY = layout === 'horizontal'
            ? cPos.y
            : cPos.y - (childIsMember ? 35 : 28);

          outEdges.push({
            id: `${node.id}->${child.id}`,
            fromX,
            fromY,
            toX,
            toY,
            active: edgeActive,
            dashed: Boolean(child.linkDashed),
            portLabel: child.portLabel,
            speedLabel: child.speedLabel,
            labelX: layout === 'horizontal' ? toX - 12 : toX - 10,
            labelY: layout === 'horizontal' ? toY - 6 : toY - 20,
          });

          visit(child);
        }
      }
    };

    // Leading dashed WAN stub into BreakRoom_Gateway_1
    const rootPos = coordsMap[VLAN_TOPOLOGY_TREE.id] ?? { x: 84, y: 292 };
    if (layout === 'horizontal') {
      outEdges.push({
        id: 'wan-stub',
        fromX: 0,
        fromY: rootPos.y,
        toX: rootPos.x - 28,
        toY: rootPos.y,
        active: false,
        dashed: true,
        labelX: 0,
        labelY: 0,
      });
    }

    visit(VLAN_TOPOLOGY_TREE);
    return { nodes: outNodes, edges: outEdges };
  }, [coordsMap, memberSet, vlan.dhcpEnabled, vlan.dhcpServerNodeId, collapsedIds, layout]);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchesSearch = (node: VlanTopoNode) => {
    if (!trimmedQuery) return true;
    return `${node.name} ${node.ip} ${node.mac} ${node.model}`
      .toLowerCase()
      .includes(trimmedQuery);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    onPanChange({
      x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const legendContent = (
    <div className="w-[216px] space-y-2 text-[12px] text-[var(--omada-text-secondary)]">
      <div className="font-semibold text-[var(--omada-text-primary)]">VLAN Topology Legend</div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3.5 w-5 rounded-[3px]"
          style={{
            backgroundColor: 'var(--omada-vlan-card-bg)',
            border: '1px solid var(--omada-vlan-card-border)',
          }}
        />
        <span>VLAN {vlan.vlanId} Member Device</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-[2px] w-5"
          style={{ backgroundColor: 'var(--omada-vlan-link-active)' }}
        />
        <span>Active VLAN Link</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-[2px] w-5"
          style={{ backgroundColor: 'var(--omada-vlan-link-muted)' }}
        />
        <span>Management / Non-Member Link</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-4 items-center rounded-full bg-[var(--omada-brand)] px-1.5 text-[9px] font-semibold text-white">
          DHCP Server
        </span>
        <span>Active DHCP Gateway</span>
      </div>
    </div>
  );

  return (
    <div
      data-testid="vlan-topology-canvas"
      data-layout={layout}
      data-zoom={String(zoom)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="omada-vlan-topo-canvas relative w-full select-none overflow-hidden rounded-[6px]"
      style={{ height, cursor: dragRef.current.active ? 'grabbing' : 'grab' }}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <div
          className="relative shrink-0 transition-transform duration-150 ease-out"
          style={{
            width: stageWidth,
            height: stageHeight,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Layer 1: Rose Active VLAN Curves & Muted Non-Member Links */}
          <svg
            width={stageWidth}
            height={stageHeight}
            viewBox={`0 0 ${stageWidth} ${stageHeight}`}
            className="pointer-events-none absolute inset-0 overflow-visible"
            aria-hidden="true"
          >
            {edges.map((edge) => {
              let pathD: string;
              if (layout === 'horizontal') {
                const midX = (edge.fromX + edge.toX) / 2;
                pathD = `M ${edge.fromX} ${edge.fromY} C ${midX} ${edge.fromY}, ${midX} ${edge.toY}, ${edge.toX} ${edge.toY}`;
              } else {
                const midY = (edge.fromY + edge.toY) / 2;
                pathD = `M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY}`;
              }

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      edge.active
                        ? 'var(--omada-vlan-link-active)'
                        : 'var(--omada-vlan-link-muted)'
                    }
                    strokeWidth={1.25}
                    strokeDasharray={edge.dashed ? '4 4' : undefined}
                  />
                  {(edge.portLabel || edge.speedLabel) && (
                    <g transform={`translate(${edge.labelX}, ${edge.labelY})`}>
                      {edge.portLabel && (
                        <text
                          x={0}
                          y={0}
                          textAnchor="end"
                          fontSize={10}
                          fill="var(--omada-text-secondary)"
                          style={{ fontFamily: 'var(--omada-font-sans)' }}
                        >
                          {edge.portLabel}
                        </text>
                      )}
                      {edge.speedLabel && (
                        <text
                          x={0}
                          y={13}
                          textAnchor="end"
                          fontSize={10}
                          fill="var(--omada-text-tertiary)"
                          style={{ fontFamily: 'var(--omada-font-sans)' }}
                        >
                          {edge.speedLabel}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Layer 2: Member Device Cards & Collapse Hubs */}
          {nodes.map(({ node, x, y, isMember, isDhcpServer, hubX, hubY, isCollapsed, hiddenCount }) => {
            const matched = matchesSearch(node);
            const isDimmed = Boolean(trimmedQuery && !matched);
            const dotColor = HEALTH_DOT_VAR[node.healthDot];

            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  data-testid={`vlan-topo-node-${node.id}`}
                  data-vlan-member={String(isMember)}
                  title={`${node.name} · ${node.model} (${node.ip})`}
                  onClick={() => {
                    if (node.kind === 'device' && onOpenDeviceByName) {
                      onOpenDeviceByName(node.name);
                    } else {
                      notification.info({
                        title: node.name,
                        description: `${node.model} · ${node.ip} (${isMember ? `Member of VLAN ${vlan.vlanId}` : 'Not in VLAN'})`,
                      });
                    }
                  }}
                  className={`absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center ${
                    isMember
                      ? 'omada-vlan-topo-member-card h-[70px] w-[158px] px-2.5 py-2'
                      : 'omada-vlan-topo-neutral-node px-2 py-1'
                  } ${isDimmed ? 'opacity-25' : ''}`}
                  style={{ left: x, top: y }}
                >
                  {isDhcpServer && isMember && (
                    <span
                      data-testid="vlan-dhcp-server-badge"
                      className="absolute -top-2.5 right-2 rounded-full bg-[var(--omada-brand)] px-2 py-0.5 text-[10px] font-medium leading-none text-white shadow-2xs"
                    >
                      DHCP Server
                    </span>
                  )}

                  <div className="flex h-[34px] w-[42px] items-center justify-center">
                    <SProductImage name={node.productSlug} size={32} alt={node.name} />
                  </div>

                  <div className="mt-1 flex max-w-[142px] items-center gap-1.5">
                    {dotColor && (
                      <span
                        className="inline-block h-[5px] w-[5px] shrink-0 rounded-full"
                        style={{ backgroundColor: dotColor }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate text-[11px] font-normal leading-[14px] text-[var(--omada-text-primary)]">
                      {node.name}
                    </span>
                  </div>
                </button>

                {node.collapsible && hubX !== undefined && hubY !== undefined && (
                  <button
                    type="button"
                    aria-label={
                      isCollapsed
                        ? `Expand ${node.name} (${hiddenCount} hidden)`
                        : `Collapse ${node.name} subtree`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCollapse(node.id);
                    }}
                    className="absolute z-10 flex h-[16px] min-w-[16px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--omada-brand)] px-1 text-[10px] font-semibold leading-none text-white transition-transform hover:scale-110"
                    style={{ left: hubX, top: hubY }}
                  >
                    {isCollapsed ? `+${hiddenCount}` : '−'}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom-Left Floating Controls: (i), Layout, Recenter, +, - */}
      <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-2">
        <Popover
          open={legendOpen}
          onOpenChange={setLegendOpen}
          trigger="click"
          placement="rightBottom"
          content={legendContent}
        >
          <button
            type="button"
            aria-label="VLAN topology legend"
            data-testid="vlan-topo-legend-btn"
            className="omada-cfg-topo-floating flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-9" size={15} />
          </button>
        </Popover>

        <button
          type="button"
          aria-label={
            layout === 'horizontal'
              ? 'Switch to vertical topology layout'
              : 'Switch to horizontal topology layout'
          }
          data-testid="vlan-topo-layout-btn"
          onClick={onToggleLayout}
          className="omada-cfg-topo-floating flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
        >
          <SIcon
            name={
              layout === 'horizontal'
                ? 'topo-icon-property-1'
                : 'topo-icon-property-1-2'
            }
            size={15}
          />
        </button>

        <div className="omada-cfg-topo-floating flex w-[30px] flex-col overflow-hidden rounded-[4px]">
          <button
            type="button"
            aria-label="Recenter topology"
            data-testid="vlan-topo-recenter-btn"
            onClick={onRecenter}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-0 border-b border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-3" size={14} />
          </button>
          <button
            type="button"
            aria-label="Zoom in topology"
            data-testid="vlan-topo-zoom-in-btn"
            onClick={onZoomIn}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-0 border-b border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-4" size={14} />
          </button>
          <button
            type="button"
            aria-label="Zoom out topology"
            data-testid="vlan-topo-zoom-out-btn"
            onClick={onZoomOut}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-0 bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-5" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Omada Controller v6.3 `Network Config -> Network Settings -> LAN` (`#/lan`).
 * Replicates top underline tabs (`VLAN` | `Multicast Snooping` | `Isolation Settings` | `LAN DNS`),
 * master-detail VLAN split with 7 stacked VLAN cards, 7-column KPI strip, `Topology | Ports`
 * segmented switcher, interactive VLAN Topology SVG with member green-tinted boxes, `DHCP Server`
 * pill badge, rose `#E06278` active VLAN link curves, and populated secondary tabs.
 */
export const LanPage: React.FC<LanPageProps> = ({
  onOpenDeviceByName,
  onNavigate,
  initialTab = 'vlan',
  className = '',
}) => {
  const notification = useOmadaNotification();

  const [activeTab, setActiveTab] = useState<LanTabKey>(initialTab);
  const [vlans, setVlans] = useState<LanVlanRecord[]>(INITIAL_VLANS);
  const [selectedVlanKey, setSelectedVlanKey] = useState<string>(INITIAL_VLANS[0].key);
  const [vlanSearch, setVlanSearch] = useState('');

  // Right pane VLAN sub-view state
  const [subView, setSubView] = useState<VlanSubViewKey>('topology');
  const [detailSearch, setDetailSearch] = useState('');
  const [topoLayout, setTopoLayout] = useState<TopoLayoutMode>('horizontal');
  const [topoZoom, setTopoZoom] = useState(1);
  const [topoPan, setTopoPan] = useState({ x: 0, y: 0 });
  const [collapsedTopoIds, setCollapsedTopoIds] = useState<Set<string>>(() => new Set());
  const [fullTopoOpen, setFullTopoOpen] = useState(false);
  const [ipUsageOpen, setIpUsageOpen] = useState(false);

  // VLAN Add/Edit Modal State
  const [vlanModalOpen, setVlanModalOpen] = useState(false);
  const [vlanModalMode, setVlanModalMode] = useState<'create' | 'edit'>('create');
  const [vlanDraft, setVlanDraft] = useState<{
    key: string;
    name: string;
    vlanId: number;
    subnet: string;
    dhcpPool: string;
    portalEnabled: boolean;
    dhcpEnabled: boolean;
  }>({
    key: '',
    name: '',
    vlanId: 30,
    subnet: '192.168.30.1 / 24',
    dhcpPool: '192.168.30.10-192.168.30.254',
    portalEnabled: false,
    dhcpEnabled: true,
  });

  // Ports Assignment State
  const [portAssignments, setPortAssignments] =
    useState<VlanPortAssignment[]>(INITIAL_VLAN_PORTS);

  // Multicast Snooping State
  const [globalIgmpSnooping, setGlobalIgmpSnooping] = useState(true);
  const [unknownMulticastAction, setUnknownMulticastAction] = useState<'Drop' | 'Flood'>('Drop');

  // Isolation Rules State
  const [isolationRules, setIsolationRules] =
    useState<LanIsolationRule[]>(INITIAL_ISOLATION_RULES);
  const [isoModalOpen, setIsoModalOpen] = useState(false);
  const [isoDraft, setIsoDraft] = useState<LanIsolationRule>({
    key: '',
    name: '',
    sourceVlan: 'vlan20 (VLAN 20)',
    isolatedTarget: 'Default (VLAN 1)',
    direction: 'Bidirectional',
    enabled: true,
  });

  // LAN DNS Rules State
  const [dnsRules, setDnsRules] = useState<LanDnsRecord[]>(INITIAL_LAN_DNS_RULES);
  const [dnsSearch, setDnsSearch] = useState('');
  const [dnsModalOpen, setDnsModalOpen] = useState(false);
  const [dnsDraft, setDnsDraft] = useState<LanDnsRecord>({
    key: '',
    name: '',
    domain: '',
    type: 'Host',
    ipOrTarget: '',
    ttl: 3600,
    enabled: true,
  });

  const filteredVlans = useMemo(() => {
    const q = vlanSearch.trim().toLowerCase();
    if (!q) return vlans;
    return vlans.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        String(v.vlanId).includes(q) ||
        v.subnet.toLowerCase().includes(q),
    );
  }, [vlans, vlanSearch]);

  const selectedVlan = useMemo(
    () => vlans.find((v) => v.key === selectedVlanKey) ?? vlans[0],
    [vlans, selectedVlanKey],
  );

  const handleToggleCollapseTopo = (nodeId: string) => {
    setCollapsedTopoIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleOpenCreateVlan = () => {
    setVlanModalMode('create');
    setVlanDraft({
      key: '',
      name: `vlan-${vlans.length * 10 + 10}`,
      vlanId: 30,
      subnet: '192.168.30.1 / 24',
      dhcpPool: '192.168.30.10-192.168.30.254',
      portalEnabled: false,
      dhcpEnabled: true,
    });
    setVlanModalOpen(true);
  };

  const handleOpenEditVlan = () => {
    setVlanModalMode('edit');
    setVlanDraft({
      key: selectedVlan.key,
      name: selectedVlan.name,
      vlanId: selectedVlan.vlanId,
      subnet: selectedVlan.subnet,
      dhcpPool: selectedVlan.dhcpPool,
      portalEnabled: selectedVlan.portalEnabled,
      dhcpEnabled: selectedVlan.dhcpEnabled,
    });
    setVlanModalOpen(true);
  };

  const handleSaveVlan = () => {
    const cleanName = vlanDraft.name.trim() || `vlan-${vlanDraft.vlanId}`;
    if (vlanModalMode === 'create') {
      const createdKey = `vlan-${Date.now()}`;
      const created: LanVlanRecord = {
        key: createdKey,
        name: cleanName,
        vlanId: vlanDraft.vlanId,
        subnet: vlanDraft.subnet,
        dhcpPool: vlanDraft.dhcpPool,
        availableIps: 245,
        totalIps: 245,
        portalEnabled: vlanDraft.portalEnabled,
        accessControlRule: '-',
        rateLimit: '-',
        purpose: 'Interface',
        dhcpEnabled: vlanDraft.dhcpEnabled,
        dhcpServerNodeId: 'mainoffice-gateway-2',
        memberNodeIds: [
          'mainoffice-gateway-2',
          'ctooffice-switch-1',
          'salesdepartment-switch-3',
        ],
        igmpSnooping: false,
        fastLeave: false,
      };
      setVlans((prev) => [...prev, created]);
      setSelectedVlanKey(createdKey);
      notification.success({
        title: 'LAN Created',
        description: `Created "${cleanName}" (VLAN ${created.vlanId}).`,
      });
    } else {
      setVlans((prev) =>
        prev.map((item) =>
          item.key === vlanDraft.key
            ? {
                ...item,
                name: cleanName,
                vlanId: vlanDraft.vlanId,
                subnet: vlanDraft.subnet,
                dhcpPool: vlanDraft.dhcpPool,
                portalEnabled: vlanDraft.portalEnabled,
                dhcpEnabled: vlanDraft.dhcpEnabled,
              }
            : item,
        ),
      );
      notification.success({
        title: 'LAN Updated',
        description: `Saved configuration for "${cleanName}".`,
      });
    }
    setVlanModalOpen(false);
  };

  const handleDeleteSelectedVlan = () => {
    if (selectedVlan.vlanId === 1) return;
    const remaining = vlans.filter((v) => v.key !== selectedVlan.key);
    setVlans(remaining);
    if (remaining.length > 0) {
      setSelectedVlanKey(remaining[0].key);
    }
    notification.success({
      title: 'LAN Deleted',
      description: `Removed "${selectedVlan.name}" (VLAN ${selectedVlan.vlanId}).`,
    });
  };

  const leftMoreMenu: MenuProps['items'] = [
    {
      key: 'vlan-wizard',
      label: 'Batch Create VLANs',
      onClick: () =>
        notification.info({
          title: 'VLAN Batch Wizard',
          description: '7 site VLAN interfaces synchronized across site switches and EAPs.',
        }),
    },
    {
      key: 'export-vlans',
      label: 'Export VLAN Table',
      onClick: () =>
        notification.success({
          title: 'Export Complete',
          description: `Exported ${vlans.length} VLAN network profiles to lan-vlans.csv.`,
        }),
    },
  ];

  const filteredPortRows = useMemo(() => {
    const q = detailSearch.trim().toLowerCase();
    return portAssignments
      .map((row) => ({
        ...row,
        pvid: selectedVlan.vlanId,
      }))
      .filter(
        (row) =>
          !q ||
          row.deviceName.toLowerCase().includes(q) ||
          row.model.toLowerCase().includes(q) ||
          row.port.toLowerCase().includes(q),
      );
  }, [portAssignments, selectedVlan.vlanId, detailSearch]);

  const portColumns: ColumnsType<VlanPortAssignment> = [
    {
      title: 'Device',
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (name: string, row) => (
        <div className="flex items-center gap-2.5">
          <SProductImage name={row.productSlug} size={24} alt={name} />
          <button
            type="button"
            onClick={() => onOpenDeviceByName?.(name)}
            className="cursor-pointer border-0 bg-transparent p-0 text-[14px] text-[var(--omada-link)] hover:underline"
          >
            {name}
          </button>
        </div>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: 'PVID',
      dataIndex: 'pvid',
      key: 'pvid',
      width: 90,
      render: (pvid: number) => <span className="tabular-nums">{pvid}</span>,
    },
    {
      title: 'VLAN Tagging',
      dataIndex: 'tagging',
      key: 'tagging',
      width: 150,
      render: (tagging: VlanPortAssignment['tagging'], row) => (
        <SSelect
          size="small"
          aria-label={`${row.deviceName} ${row.port} tagging`}
          className="w-[125px]"
          value={tagging}
          onChange={(val) =>
            setPortAssignments((prev) =>
              prev.map((item) =>
                item.key === row.key
                  ? { ...item, tagging: val as VlanPortAssignment['tagging'] }
                  : item,
              ),
            )
          }
          options={[
            { label: 'Untagged', value: 'Untagged' },
            { label: 'Tagged', value: 'Tagged' },
            { label: 'Excluded', value: 'Excluded' },
          ]}
        />
      ),
    },
    {
      title: 'Link Status',
      dataIndex: 'linkStatus',
      key: 'linkStatus',
      width: 130,
      render: (status: VlanPortAssignment['linkStatus']) => (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-[6px] w-[6px] rounded-full"
            style={{
              backgroundColor:
                status === 'Disconnected'
                  ? 'var(--omada-border-strong)'
                  : 'var(--omada-brand-hover)',
            }}
          />
          <span>{status}</span>
        </span>
      ),
    },
  ];

  const snoopingColumns: ColumnsType<LanVlanRecord> = [
    {
      title: 'Network Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'VLAN ID',
      dataIndex: 'vlanId',
      key: 'vlanId',
      width: 110,
      render: (id: number) => <span className="tabular-nums">{id}</span>,
    },
    {
      title: 'Subnet',
      dataIndex: 'subnet',
      key: 'subnet',
    },
    {
      title: 'IGMP Snooping',
      dataIndex: 'igmpSnooping',
      key: 'igmpSnooping',
      width: 150,
      render: (checked: boolean, row) => (
        <SSwitch
          size="small"
          checked={checked}
          aria-label={`IGMP Snooping for ${row.name}`}
          onChange={(next) =>
            setVlans((prev) =>
              prev.map((v) => (v.key === row.key ? { ...v, igmpSnooping: next } : v)),
            )
          }
        />
      ),
    },
    {
      title: 'Fast Leave',
      dataIndex: 'fastLeave',
      key: 'fastLeave',
      width: 130,
      render: (checked: boolean, row) => (
        <SSwitch
          size="small"
          checked={checked}
          disabled={!row.igmpSnooping}
          aria-label={`Fast Leave for ${row.name}`}
          onChange={(next) =>
            setVlans((prev) =>
              prev.map((v) => (v.key === row.key ? { ...v, fastLeave: next } : v)),
            )
          }
        />
      ),
    },
  ];

  const isolationColumns: ColumnsType<LanIsolationRule> = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Source Network',
      dataIndex: 'sourceVlan',
      key: 'sourceVlan',
    },
    {
      title: 'Isolated Target',
      dataIndex: 'isolatedTarget',
      key: 'isolatedTarget',
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 110,
      render: (enabled: boolean, row) => (
        <SSwitch
          size="small"
          checked={enabled}
          aria-label={`Toggle ${row.name}`}
          onChange={(next) =>
            setIsolationRules((prev) =>
              prev.map((r) => (r.key === row.key ? { ...r, enabled: next } : r)),
            )
          }
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      render: (_, row) => (
        <button
          type="button"
          aria-label={`Delete ${row.name}`}
          onClick={() =>
            setIsolationRules((prev) => prev.filter((r) => r.key !== row.key))
          }
          className="omada-cfg-icon-btn"
        >
          <SIcon name="delete" size={15} />
        </button>
      ),
    },
  ];

  const filteredDnsRules = useMemo(() => {
    const q = dnsSearch.trim().toLowerCase();
    if (!q) return dnsRules;
    return dnsRules.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q) ||
        r.ipOrTarget.toLowerCase().includes(q),
    );
  }, [dnsRules, dnsSearch]);

  const dnsColumns: ColumnsType<LanDnsRecord> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Domain Name',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 90,
    },
    {
      title: 'IP Address / Target',
      dataIndex: 'ipOrTarget',
      key: 'ipOrTarget',
    },
    {
      title: 'TTL (s)',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 90,
      render: (ttl: number) => <span className="tabular-nums">{ttl}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, row) => (
        <SSwitch
          size="small"
          checked={enabled}
          aria-label={`Toggle ${row.name}`}
          onChange={(next) =>
            setDnsRules((prev) =>
              prev.map((d) => (d.key === row.key ? { ...d, enabled: next } : d)),
            )
          }
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            onClick={() => {
              setDnsDraft({ ...row });
              setDnsModalOpen(true);
            }}
            className="omada-cfg-icon-btn"
          >
            <SIcon name="edit" size={15} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() =>
              setDnsRules((prev) => prev.filter((d) => d.key !== row.key))
            }
            className="omada-cfg-icon-btn"
          >
            <SIcon name="delete" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <SSettingsPageShell
      tabs={[
        { key: 'vlan', label: 'VLAN' },
        { key: 'multicast-snooping', label: 'Multicast Snooping' },
        { key: 'isolation-settings', label: 'Isolation Settings' },
        { key: 'lan-dns', label: 'LAN DNS' },
      ]}
      activeTab={activeTab}
      onTabChange={(k) => setActiveTab(k as LanTabKey)}
      tabAriaLabel="LAN configuration views"
      helpTitle="LAN & VLAN Settings"
      helpDescription="Manage site VLAN interfaces, DHCP pools, topology membership, IGMP multicast snooping, inter-VLAN isolation, and local LAN DNS records."
      data-testid="lan-page"
      className={className}
    >
      {/* Tab 1: VLAN Master-Detail Split */}
      {activeTab === 'vlan' && (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* Left Rail (w-[270px]) */}
          <aside
            data-testid="lan-vlan-rail"
            className="flex w-full shrink-0 flex-col gap-3 lg:w-[270px]"
          >
            <div className="flex items-center justify-between gap-2">
              <SButton
                variant="primary"
                onClick={handleOpenCreateVlan}
                className="!h-[32px] !rounded-[4px] !px-4"
              >
                <span className="inline-flex items-center gap-1.5">
                  <SIcon name="add-2" size={14} />
                  <span>Add</span>
                </span>
              </SButton>

              <div className="flex items-center gap-1.5">
                <STooltip title="VLAN Setup Guide">
                  <button
                    type="button"
                    aria-label="VLAN Wizard"
                    onClick={() =>
                      notification.info({
                        title: 'VLAN Configuration Wizard',
                        description:
                          'Select any VLAN card to inspect active gateway, switch, and EAP port membership.',
                      })
                    }
                    className="omada-cfg-icon-btn"
                  >
                    <SIcon name="quick-action-vlan-wizard" size={16} />
                  </button>
                </STooltip>

                <Dropdown
                  menu={{ items: leftMoreMenu }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <button
                    type="button"
                    aria-label="More VLAN actions"
                    className="omada-cfg-icon-btn text-[var(--omada-text-secondary)]"
                  >
                    <SIcon name="icon-icon-tabler-icon-dots-vertical" size={16} />
                  </button>
                </Dropdown>
              </div>
            </div>

            <SInput
              variant="filled"
              allowClear
              value={vlanSearch}
              onChange={(e) => setVlanSearch(e.target.value)}
              placeholder="Search Name"
              aria-label="Search Name"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
            />

            <div className="flex flex-col gap-2.5" role="listbox" aria-label="VLAN networks">
              {filteredVlans.map((vlan) => {
                const isSelected = vlan.key === selectedVlan.key;
                return (
                  <button
                    key={vlan.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`vlan-card-${vlan.key}`}
                    onClick={() => setSelectedVlanKey(vlan.key)}
                    className={`omada-cfg-vlan-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="truncate text-[14px] font-medium leading-[20px] text-[var(--omada-text-primary)]">
                      {vlan.name}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] leading-[18px] text-[var(--omada-text-secondary)]">
                      <span>VLAN {vlan.vlanId}</span>
                      <span
                        className="text-[var(--omada-border-strong)]"
                        aria-hidden="true"
                      >
                        |
                      </span>
                      <span className="tabular-nums">{vlan.subnet}</span>
                    </div>
                  </button>
                );
              })}
              {filteredVlans.length === 0 && (
                <div className="py-6 text-center text-[13px] text-[var(--omada-text-tertiary)]">
                  No matching VLANs
                </div>
              )}
            </div>
          </aside>

          {/* Right Detail Pane */}
          <div className="min-w-0 flex-1">
            {/* Header Row (`pr-9` clearance from <|| handle at x:1404..1440, y:134..174!) */}
            <div className="flex items-center justify-between gap-4 pr-9">
              <h2
                data-testid="lan-selected-vlan-title"
                className="m-0 truncate text-[18px] font-medium leading-[26px] text-[var(--omada-text-primary)]"
              >
                {selectedVlan.name}
              </h2>

              <div className="flex shrink-0 items-center gap-2">
                <STooltip title="Edit VLAN">
                  <button
                    type="button"
                    aria-label={`Edit ${selectedVlan.name}`}
                    data-testid="lan-edit-vlan-btn"
                    onClick={handleOpenEditVlan}
                    className="omada-cfg-icon-btn"
                  >
                    <SIcon name="edit" size={18} />
                  </button>
                </STooltip>
                <STooltip
                  title={
                    selectedVlan.vlanId === 1
                      ? 'Default VLAN cannot be deleted'
                      : 'Delete VLAN'
                  }
                >
                  <button
                    type="button"
                    aria-label={`Delete ${selectedVlan.name}`}
                    data-testid="lan-delete-vlan-btn"
                    disabled={selectedVlan.vlanId === 1}
                    onClick={handleDeleteSelectedVlan}
                    className="omada-cfg-icon-btn"
                  >
                    <SIcon name="delete" size={18} />
                  </button>
                </STooltip>
              </div>
            </div>

            {/* 7-Column KPI Strip */}
            <div
              data-testid="lan-vlan-kpi-strip"
              className="mt-4 flex flex-wrap items-start justify-between gap-x-5 gap-y-3 border-b border-[var(--omada-border-divider)] pb-4 pr-9"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">VLAN</span>
                <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
                  {selectedVlan.vlanId}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">Subnet</span>
                <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
                  {selectedVlan.subnet}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">
                  DHCP Pool
                </span>
                <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
                  {selectedVlan.dhcpPool}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">
                  Available / Total IPs
                </span>
                <div className="inline-flex items-center gap-1.5 whitespace-nowrap text-[14px]">
                  <span className="tabular-nums font-medium text-[var(--omada-brand-text)]">
                    {selectedVlan.availableIps}
                  </span>
                  <span className="text-[var(--omada-text-secondary)]">
                    / {selectedVlan.totalIps}
                  </span>
                  <STooltip title="View DHCP IP allocation summary">
                    <button
                      type="button"
                      aria-label="Inspect IP Pool"
                      onClick={() => setIpUsageOpen(true)}
                      className="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-[var(--omada-link)] hover:opacity-80"
                    >
                      <FileText size={14} />
                    </button>
                  </STooltip>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">Portal</span>
                <span className="inline-flex h-[21px] items-center text-[14px] text-[var(--omada-text-primary)]">
                  {selectedVlan.portalEnabled ? <Check size={15} strokeWidth={2} /> : '-'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">
                  Access Control Rule
                </span>
                <span className="text-[14px] text-[var(--omada-text-primary)]">
                  {selectedVlan.accessControlRule}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[var(--omada-text-tertiary)]">
                  Rate Limit
                </span>
                <span className="text-[14px] text-[var(--omada-text-primary)]">
                  {selectedVlan.rateLimit}
                </span>
              </div>
            </div>

            {/* Sub-Toolbar: Topology | Ports + Search + Full Topology */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pr-9">
              <div className="flex flex-wrap items-center gap-3">
                <STabs
                  variant="filter"
                  aria-label="VLAN sub-views"
                  activeKey={subView}
                  onChange={(k) => setSubView(k as 'topology' | 'ports')}
                  items={[
                    { key: 'topology', label: 'Topology' },
                    { key: 'ports', label: 'Ports' },
                  ]}
                />

                <SInput
                  variant="filled"
                  allowClear
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  placeholder="Search Name, IP or MAC"
                  aria-label="Search Name, IP or MAC"
                  className="!w-[250px]"
                  suffix={
                    <SIcon
                      name="input-search"
                      size={14}
                      className="text-[var(--omada-text-tertiary)]"
                    />
                  }
                />
              </div>

              <button
                type="button"
                data-testid="lan-full-topology-btn"
                onClick={() => setFullTopoOpen(true)}
                className="cursor-pointer border-0 bg-transparent p-0 text-[14px] text-[var(--omada-link)] hover:underline"
              >
                Full Topology
              </button>
            </div>

            {/* Sub-View 1: Interactive VLAN Topology SVG */}
            {subView === 'topology' && (
              <div className="mt-3">
                <VlanTopologyStage
                  vlan={selectedVlan}
                  searchQuery={detailSearch}
                  layout={topoLayout}
                  onToggleLayout={() => {
                    setTopoLayout((prev) =>
                      prev === 'horizontal' ? 'vertical' : 'horizontal',
                    );
                    setTopoPan({ x: 0, y: 0 });
                  }}
                  zoom={topoZoom}
                  onZoomIn={() =>
                    setTopoZoom((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))
                  }
                  onZoomOut={() =>
                    setTopoZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))
                  }
                  onRecenter={() => {
                    setTopoZoom(1);
                    setTopoPan({ x: 0, y: 0 });
                  }}
                  pan={topoPan}
                  onPanChange={setTopoPan}
                  collapsedIds={collapsedTopoIds}
                  onToggleCollapse={handleToggleCollapseTopo}
                  onOpenDeviceByName={onOpenDeviceByName}
                />
              </div>
            )}

            {/* Sub-View 2: VLAN Ports Assignment Table */}
            {subView === 'ports' && (
              <div className="omada-cfg-table-shell is-bordered mt-4">
                <Table<VlanPortAssignment>
                  rowKey="key"
                  columns={portColumns}
                  dataSource={filteredPortRows}
                  pagination={false}
                  className="omada-cfg-table"
                  data-testid="lan-ports-table"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Multicast Snooping */}
      {activeTab === 'multicast-snooping' && (
        <div className="space-y-6" data-testid="lan-snooping-tab">
          <div className="flex flex-wrap items-center gap-8 border-b border-[var(--omada-border-divider)] pb-5">
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[var(--omada-text-primary)]">
                Global IGMP Snooping
              </span>
              <SSwitch
                checked={globalIgmpSnooping}
                aria-label="Global IGMP Snooping"
                onChange={setGlobalIgmpSnooping}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[var(--omada-text-primary)]">
                Unknown Multicast Action
              </span>
              <SSelect
                aria-label="Unknown Multicast Action"
                className="w-[150px]"
                value={unknownMulticastAction}
                onChange={(val) => setUnknownMulticastAction(val as 'Drop' | 'Flood')}
                options={[
                  { label: 'Drop', value: 'Drop' },
                  { label: 'Flood', value: 'Flood' },
                ]}
              />
            </div>
          </div>

          <div className="omada-cfg-table-shell is-bordered">
            <Table<LanVlanRecord>
              rowKey="key"
              columns={snoopingColumns}
              dataSource={vlans}
              pagination={false}
              className="omada-cfg-table"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Isolation Settings */}
      {activeTab === 'isolation-settings' && (
        <div className="space-y-4" data-testid="lan-isolation-tab">
          <div className="flex items-center justify-between gap-4 pr-9">
            <div className="text-[13px] text-[var(--omada-text-secondary)]">
              Block Layer 3 or Layer 2 cross-VLAN communication between isolated corporate,
              guest, and IoT subnets.
            </div>
            <SButton
              variant="primary"
              onClick={() => {
                setIsoDraft({
                  key: '',
                  name: `Isolation Rule ${isolationRules.length + 1}`,
                  sourceVlan: `${selectedVlan.name} (VLAN ${selectedVlan.vlanId})`,
                  isolatedTarget: 'Default (VLAN 1)',
                  direction: 'Bidirectional',
                  enabled: true,
                });
                setIsoModalOpen(true);
              }}
            >
              + Add Isolation Rule
            </SButton>
          </div>

          <div className="omada-cfg-table-shell is-bordered">
            <Table<LanIsolationRule>
              rowKey="key"
              columns={isolationColumns}
              dataSource={isolationRules}
              pagination={false}
              className="omada-cfg-table"
            />
          </div>
        </div>
      )}

      {/* Tab 4: LAN DNS */}
      {activeTab === 'lan-dns' && (
        <div className="space-y-4" data-testid="lan-dns-tab">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-9">
            <SInput
              variant="filled"
              allowClear
              value={dnsSearch}
              onChange={(e) => setDnsSearch(e.target.value)}
              placeholder="Search Name, Domain or IP"
              aria-label="Search LAN DNS"
              className="!w-[260px]"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
            />
            <SButton
              variant="primary"
              onClick={() => {
                setDnsDraft({
                  key: '',
                  name: '',
                  domain: '',
                  type: 'Host',
                  ipOrTarget: '',
                  ttl: 3600,
                  enabled: true,
                });
                setDnsModalOpen(true);
              }}
            >
              + Create New LAN DNS Rule
            </SButton>
          </div>

          <div className="omada-cfg-table-shell is-bordered">
            <Table<LanDnsRecord>
              rowKey="key"
              columns={dnsColumns}
              dataSource={filteredDnsRules}
              pagination={false}
              className="omada-cfg-table"
            />
          </div>
        </div>
      )}

      {/* Create / Edit VLAN Modal */}
      <SModal
        size="sm"
        title={vlanModalMode === 'create' ? 'Create New LAN' : `Edit ${vlanDraft.name}`}
        open={vlanModalOpen}
        onCancel={() => setVlanModalOpen(false)}
        onOk={handleSaveVlan}
        okText="Save"
        destroyOnHidden
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
              Name
            </label>
            <SInput
              aria-label="VLAN Name"
              value={vlanDraft.name}
              onChange={(e) =>
                setVlanDraft((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                VLAN ID
              </label>
              <SInput
                aria-label="VLAN ID"
                inputMode="numeric"
                disabled={vlanModalMode === 'edit' && vlanDraft.vlanId === 1}
                value={String(vlanDraft.vlanId)}
                onChange={(e) =>
                  setVlanDraft((prev) => ({
                    ...prev,
                    vlanId: Number(e.target.value.replace(/\D/g, '') || 1),
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                Gateway / Subnet
              </label>
              <SInput
                aria-label="VLAN Subnet"
                value={vlanDraft.subnet}
                onChange={(e) =>
                  setVlanDraft((prev) => ({ ...prev, subnet: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
              DHCP Range
            </label>
            <SInput
              aria-label="VLAN DHCP Pool"
              value={vlanDraft.dhcpPool}
              onChange={(e) =>
                setVlanDraft((prev) => ({ ...prev, dhcpPool: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center gap-6">
            <SCheckbox
              checked={vlanDraft.dhcpEnabled}
              onChange={(e) =>
                setVlanDraft((prev) => ({ ...prev, dhcpEnabled: e.target.checked }))
              }
            >
              DHCP Server
            </SCheckbox>
            <SCheckbox
              checked={vlanDraft.portalEnabled}
              onChange={(e) =>
                setVlanDraft((prev) => ({ ...prev, portalEnabled: e.target.checked }))
              }
            >
              Portal Authentication
            </SCheckbox>
          </div>
        </div>
      </SModal>

      {/* Full Topology Modal */}
      <SModal
        size="xl"
        title={`Full Topology — ${selectedVlan.name} (VLAN ${selectedVlan.vlanId})`}
        open={fullTopoOpen}
        onCancel={() => setFullTopoOpen(false)}
        footer={
          onNavigate
            ? [
                <SButton
                  key="dash"
                  variant="outline"
                  onClick={() => {
                    setFullTopoOpen(false);
                    onNavigate('dashboard');
                  }}
                >
                  Open Site Dashboard
                </SButton>,
                <SButton key="close" variant="primary" onClick={() => setFullTopoOpen(false)}>
                  Close
                </SButton>,
              ]
            : null
        }
        destroyOnHidden
      >
        <VlanTopologyStage
          vlan={selectedVlan}
          searchQuery={detailSearch}
          layout={topoLayout}
          onToggleLayout={() =>
            setTopoLayout((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
          }
          zoom={topoZoom}
          onZoomIn={() =>
            setTopoZoom((z) => Math.min(1.5, Number((z + 0.15).toFixed(2))))
          }
          onZoomOut={() =>
            setTopoZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))
          }
          onRecenter={() => {
            setTopoZoom(1);
            setTopoPan({ x: 0, y: 0 });
          }}
          pan={topoPan}
          onPanChange={setTopoPan}
          collapsedIds={collapsedTopoIds}
          onToggleCollapse={handleToggleCollapseTopo}
          onOpenDeviceByName={onOpenDeviceByName}
          height={540}
        />
      </SModal>

      {/* IP Lease Pool Summary Modal */}
      <SModal
        size="sm"
        title={`IP Pool Summary — ${selectedVlan.name}`}
        open={ipUsageOpen}
        onCancel={() => setIpUsageOpen(false)}
        onOk={() => setIpUsageOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Close"
        destroyOnHidden
      >
        <div className="space-y-2 pt-2 text-[13px] text-[var(--omada-text-secondary)]">
          <div className="flex justify-between">
            <span>Subnet:</span>
            <strong className="text-[var(--omada-text-primary)]">{selectedVlan.subnet}</strong>
          </div>
          <div className="flex justify-between">
            <span>DHCP Range:</span>
            <strong className="text-[var(--omada-text-primary)]">{selectedVlan.dhcpPool}</strong>
          </div>
          <div className="flex justify-between">
            <span>Available / Total IPs:</span>
            <strong className="text-[var(--omada-brand-text)]">
              {selectedVlan.availableIps} / {selectedVlan.totalIps}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Gateway DHCP Server:</span>
            <strong className="text-[var(--omada-text-primary)]">MainOffice_Gateway_2</strong>
          </div>
        </div>
      </SModal>

      {/* Add Isolation Rule Modal */}
      <SModal
        size="sm"
        title="Add Isolation Rule"
        open={isoModalOpen}
        onCancel={() => setIsoModalOpen(false)}
        onOk={() => {
          setIsolationRules((prev) => [
            ...prev,
            {
              ...isoDraft,
              key: `iso-${Date.now()}`,
              name: isoDraft.name.trim() || 'VLAN Isolation Rule',
            },
          ]);
          setIsoModalOpen(false);
        }}
        okText="Add"
        destroyOnHidden
      >
        <div className="space-y-3 pt-2">
          <div>
            <label className="mb-1 block text-[13px] font-medium">Rule Name</label>
            <SInput
              value={isoDraft.name}
              onChange={(e) => setIsoDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium">Source Network</label>
            <SSelect
              className="w-full"
              value={isoDraft.sourceVlan}
              onChange={(val) =>
                setIsoDraft((p) => ({ ...p, sourceVlan: String(val) }))
              }
              options={vlans.map((v) => ({
                label: `${v.name} (VLAN ${v.vlanId})`,
                value: `${v.name} (VLAN ${v.vlanId})`,
              }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium">Isolated Target</label>
            <SSelect
              className="w-full"
              value={isoDraft.isolatedTarget}
              onChange={(val) =>
                setIsoDraft((p) => ({ ...p, isolatedTarget: String(val) }))
              }
              options={vlans.map((v) => ({
                label: `${v.name} (VLAN ${v.vlanId})`,
                value: `${v.name} (VLAN ${v.vlanId})`,
              }))}
            />
          </div>
        </div>
      </SModal>

      {/* Create / Edit LAN DNS Rule Modal */}
      <SModal
        size="sm"
        title={dnsDraft.key ? 'Edit LAN DNS Rule' : 'Create New LAN DNS Rule'}
        open={dnsModalOpen}
        onCancel={() => setDnsModalOpen(false)}
        onOk={() => {
          const entry: LanDnsRecord = {
            ...dnsDraft,
            key: dnsDraft.key || `dns-${Date.now()}`,
            name: dnsDraft.name.trim() || 'LAN Host Entry',
            domain: dnsDraft.domain.trim() || 'host.hq.local',
            ipOrTarget: dnsDraft.ipOrTarget.trim() || '192.168.0.50',
          };
          setDnsRules((prev) =>
            dnsDraft.key
              ? prev.map((r) => (r.key === dnsDraft.key ? entry : r))
              : [...prev, entry],
          );
          setDnsModalOpen(false);
        }}
        okText="Save"
        destroyOnHidden
      >
        <div className="space-y-3 pt-2">
          <div>
            <label className="mb-1 block text-[13px] font-medium">Name</label>
            <SInput
              aria-label="DNS Rule Name"
              value={dnsDraft.name}
              onChange={(e) => setDnsDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium">Domain Name</label>
            <SInput
              aria-label="DNS Domain Name"
              placeholder="server.hq.local"
              value={dnsDraft.domain}
              onChange={(e) => setDnsDraft((p) => ({ ...p, domain: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-medium">Type</label>
              <SSelect
                aria-label="DNS Type"
                className="w-full"
                value={dnsDraft.type}
                onChange={(val) =>
                  setDnsDraft((p) => ({ ...p, type: val as LanDnsRecord['type'] }))
                }
                options={[
                  { label: 'Host', value: 'Host' },
                  { label: 'CNAME', value: 'CNAME' },
                  { label: 'SRV', value: 'SRV' },
                ]}
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium">TTL</label>
              <SInput
                aria-label="DNS TTL"
                inputMode="numeric"
                value={String(dnsDraft.ttl)}
                onChange={(e) =>
                  setDnsDraft((p) => ({
                    ...p,
                    ttl: Number(e.target.value.replace(/\D/g, '') || 3600),
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium">
              IP Address / Target
            </label>
            <SInput
              aria-label="DNS IP or Target"
              placeholder="192.168.0.50"
              value={dnsDraft.ipOrTarget}
              onChange={(e) =>
                setDnsDraft((p) => ({ ...p, ipOrTarget: e.target.value }))
              }
            />
          </div>
        </div>
      </SModal>
    </SSettingsPageShell>
  );
};
