import React, { useMemo, useRef, useState } from 'react';
import { Popover } from 'antd';
import { SClientIcon } from '../assets/SClientIcon';
import { SIcon } from '../assets/SIcon';
import { SProductImage } from '../assets/SProductImage';
import type { OmadaClientIconName, OmadaProductName } from '../assets/assetsManifest';

export type TopologyLayoutMode = 'horizontal' | 'vertical';
export type TopologyHealthFilter = 'good' | 'fair' | 'poor' | 'no-data' | null;

export interface TopologyNodeData {
  id: string;
  name: string;
  kind: 'internet' | 'device' | 'client' | 'controller';
  category?: 'gateway' | 'switch' | 'ap' | 'olt';
  productSlug?: OmadaProductName;
  clientIcon?: OmadaClientIconName;
  status: 'connected' | 'disconnected' | 'pending';
  healthBucket?: 'good' | 'fair' | 'poor' | 'no-data';
  statusDotTone?: 'good' | 'poor' | 'no-data';
  ip?: string;
  mac?: string;
  model?: string;
  network?: string;
  ssid?: string;
  portLabel?: string;
  speedLabel?: string;
  linkDashed?: boolean;
  showLinkAlertBadge?: boolean;
  collapsible?: boolean;
  children?: TopologyNodeData[];
}

export interface TopologyDisplayOptions {
  showLinkLabels: boolean;
  showClients: boolean;
  showController: boolean;
  showHealthStatus: boolean;
}

export const DEFAULT_TOPOLOGY_DISPLAY_OPTIONS: TopologyDisplayOptions = {
  showLinkLabels: true,
  showClients: true,
  showController: true,
  showHealthStatus: true,
};

export const DEFAULT_TOPOLOGY_TREE: TopologyNodeData = {
  id: 'internet',
  name: 'Internet',
  kind: 'internet',
  productSlug: 'internet',
  status: 'disconnected',
  healthBucket: 'no-data',
  statusDotTone: 'no-data',
  network: 'All',
  showLinkAlertBadge: true,
  children: [
    {
      id: 'breakroom-gateway-1',
      name: 'BreakRoom_Gateway_1',
      kind: 'device',
      category: 'gateway',
      productSlug: 'eap221-lr-kit',
      status: 'connected',
      healthBucket: 'good',
      statusDotTone: 'good',
      ip: '192.168.254.100',
      mac: '00-14-78-00-00-00',
      model: 'ER701-5G-Outdoor v1.0',
      network: 'Default',
      linkDashed: true,
      children: [
        {
          id: 'mainoffice-gateway-2',
          name: 'MainOffice_Gateway_2',
          kind: 'device',
          category: 'gateway',
          productSlug: 'er8411',
          status: 'connected',
          healthBucket: 'good',
          statusDotTone: 'good',
          ip: '192.168.0.1',
          mac: '00-1D-0F-03-27-B7',
          model: 'ER7412-M2 v1.0',
          network: 'Default',
          collapsible: true,
          children: [
            {
              id: 'ctooffice-switch-1',
              name: 'CTOOffice_Switch_1',
              kind: 'device',
              category: 'switch',
              productSlug: 'sg2428p-un-5-40',
              status: 'connected',
              healthBucket: 'good',
              statusDotTone: 'good',
              ip: '192.168.0.101',
              mac: '0C-EF-15-EF-B9-10',
              model: 'SG3210 v3.20',
              network: 'Default',
              portLabel: '→ #1',
              speedLabel: '1000FDX',
            },
            {
              id: 'serverroom-switch-2',
              name: 'ServerRoom_Switch_2',
              kind: 'device',
              category: 'switch',
              productSlug: 'sg3452p-un-3-40',
              status: 'connected',
              healthBucket: 'poor',
              statusDotTone: 'poor',
              ip: '192.168.0.103',
              mac: '00-FF-00-1B-57-93',
              model: 'TL-SG2210MP v2.0',
              network: 'Default',
              portLabel: '→ #1',
              speedLabel: '1000FDX',
            },
            {
              id: 'salesdepartment-switch-3',
              name: 'SalesDepartment_Switch_3',
              kind: 'device',
              category: 'switch',
              productSlug: 'tl-sg3452x-un-1-0',
              status: 'connected',
              healthBucket: 'fair',
              statusDotTone: 'good',
              ip: '192.168.0.102',
              mac: '0C-EF-15-4E-90-95',
              model: 'SG2210MP v5.0',
              network: 'Default',
              portLabel: '→ #1',
              speedLabel: '1000FDX',
              collapsible: true,
              children: [
                {
                  id: 'coooffice-eap-1',
                  name: 'COOOffice_Eap_1',
                  kind: 'device',
                  category: 'ap',
                  productSlug: 'eap727-eu-1-0',
                  status: 'connected',
                  healthBucket: 'fair',
                  statusDotTone: 'good',
                  ip: '192.168.0.121',
                  mac: 'A8-29-48-D0-7B-10',
                  model: 'EAP773(EU) v1.0',
                  network: 'Default',
                  ssid: 'Corp-WiFi',
                  portLabel: '#2 ←',
                  speedLabel: '1000FDX',
                },
                {
                  id: 'breakroom-eap-2',
                  name: 'BreakRoom_Eap_2',
                  kind: 'device',
                  category: 'ap',
                  productSlug: 'eap668-outdoor-hd-un-1-2',
                  status: 'connected',
                  healthBucket: 'good',
                  statusDotTone: 'good',
                  ip: '192.168.0.122',
                  mac: '00-FF-00-38-95-10',
                  model: 'EAP668-Outdoor HD(EU) v1.0',
                  network: 'Default',
                  ssid: 'Guest-WiFi',
                  portLabel: '#3 ←',
                  speedLabel: '1000FDX',
                },
                {
                  id: 'storageroom-eap-3',
                  name: 'StorageRoom_Eap_3',
                  kind: 'device',
                  category: 'ap',
                  productSlug: 'eap650',
                  status: 'connected',
                  healthBucket: 'no-data',
                  statusDotTone: 'no-data',
                  ip: '192.168.0.123',
                  mac: '1C-61-B4-71-04-38',
                  model: 'EAP620 HD(US) v3.0[Custom]',
                  network: 'Default',
                  ssid: 'Corp-WiFi',
                  portLabel: '#4 ←',
                  speedLabel: '1000FDX',
                  collapsible: true,
                  children: [
                    {
                      id: 'client-starlight',
                      name: 'StarLight',
                      kind: 'client',
                      clientIcon: 'android-phone',
                      status: 'connected',
                      healthBucket: 'good',
                      statusDotTone: 'good',
                      ip: '192.168.0.151',
                      mac: '8C-9F-2A-11-4B-09',
                      network: 'Default',
                      ssid: 'Corp-WiFi',
                    },
                    {
                      id: 'client-neffos',
                      name: 'Neffos_X20_Pro',
                      kind: 'client',
                      clientIcon: 'android-phone',
                      status: 'connected',
                      healthBucket: 'fair',
                      statusDotTone: 'good',
                      ip: '192.168.0.152',
                      mac: 'F4-8B-32-77-9C-10',
                      network: 'Default',
                      ssid: 'Corp-WiFi',
                    },
                  ],
                },
              ],
            },
            {
              id: 'datacenter-olt-1',
              name: 'DataCenter_Olt_1',
              kind: 'device',
              category: 'olt',
              productSlug: 'nvr-3',
              status: 'connected',
              healthBucket: 'no-data',
              statusDotTone: 'no-data',
              ip: '192.168.0.200',
              mac: '00-FF-00-16-B6-3E',
              model: 'DS-P7001-08 1.0',
              network: 'Default',
            },
            {
              id: 'omada-controller',
              name: 'Omada Controller',
              kind: 'controller',
              productSlug: 'controller',
              status: 'connected',
              healthBucket: 'good',
              statusDotTone: 'good',
              ip: '192.168.0.10',
              mac: '50-91-E3-AA-10-01',
              model: 'Software Controller v6.3',
              network: 'Default',
            },
            {
              id: 'client-cc-28',
              name: 'CC-28-AA-75-E6-02',
              kind: 'client',
              clientIcon: 'other',
              status: 'pending',
              healthBucket: 'no-data',
              statusDotTone: 'no-data',
              ip: '192.168.0.190',
              mac: 'CC-28-AA-75-E6-02',
              network: 'Default',
            },
          ],
        },
      ],
    },
  ],
};

export interface STopologyCanvasProps {
  /** Root topology tree node (defaults to Headquarters Building hierarchy). */
  root?: TopologyNodeData;
  /** Layout orientation (`'horizontal'` left-to-right or `'vertical'` top-to-bottom). */
  layout?: TopologyLayoutMode;
  /** Invoked when user toggles layout mode via bottom-left control. */
  onLayoutChange?: (layout: TopologyLayoutMode) => void;
  /** Filter query matched against node name, IP, model, or MAC. */
  searchQuery?: string;
  /** Optional health bucket highlight filter. */
  healthFilter?: TopologyHealthFilter;
  /** Optional network filter value (`'all'` shows all). */
  networkFilter?: string;
  /** Optional SSID filter value (`'all'` shows all). */
  ssidFilter?: string;
  /** Display toggles controlled from top-bar Display popover. */
  displayOptions?: Partial<TopologyDisplayOptions>;
  /** Invoked when a device node is clicked (opens DevicePropertiesDrawer). */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Invoked when any node (device, client, controller, internet) is clicked. */
  onSelectNode?: (node: TopologyNodeData) => void;
  /** Height of canvas container (defaults to `580`). */
  height?: number | string;
  className?: string;
}

interface PositionedNode {
  node: TopologyNodeData;
  x: number;
  y: number;
  depth: number;
  hasVisibleChildren: boolean;
  isCollapsed: boolean;
  hiddenChildCount: number;
  hubX?: number;
  hubY?: number;
}

interface PositionedEdge {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  dashed: boolean;
  portLabel?: string;
  speedLabel?: string;
  childX: number;
  childY: number;
}

function filterTreeByVisibility(
  node: TopologyNodeData,
  opts: TopologyDisplayOptions,
): TopologyNodeData | null {
  if (!opts.showClients && node.kind === 'client') return null;
  if (!opts.showController && node.kind === 'controller') return null;

  const filteredChildren = (node.children ?? [])
    .map((child) => filterTreeByVisibility(child, opts))
    .filter((child): child is TopologyNodeData => child !== null);

  return {
    ...node,
    children: filteredChildren,
  };
}

function countDescendants(node: TopologyNodeData): number {
  const children = node.children ?? [];
  return children.length + children.reduce((sum, c) => sum + countDescendants(c), 0);
}

function computeTreeLayout(
  root: TopologyNodeData,
  collapsedIds: Set<string>,
  layout: TopologyLayoutMode,
): {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  stageWidth: number;
  stageHeight: number;
} {
  // Depth-first leaf slot calculation for balanced horizontal/vertical spacing
  const leafSpanMap = new Map<string, number>();

  const measureLeafSpan = (node: TopologyNodeData): number => {
    const children = node.children ?? [];
    const isCollapsed = Boolean(node.collapsible && collapsedIds.has(node.id));
    if (children.length === 0 || isCollapsed) {
      leafSpanMap.set(node.id, 1);
      return 1;
    }
    const total = children.reduce((acc, child) => acc + measureLeafSpan(child), 0);
    leafSpanMap.set(node.id, Math.max(1, total));
    return Math.max(1, total);
  };

  const totalLeaves = measureLeafSpan(root);
  const nodes: PositionedNode[] = [];
  const edges: PositionedEdge[] = [];

  if (layout === 'horizontal') {
    const X_BY_DEPTH = [46, 174, 330, 502, 682, 836];
    const HUB_OFFSET = 64;
    const rowStep = 82;
    const topPad = 68;

    // Group nodes by depth with parent center alignment when siblings fit cleanly,
    // and ensure minimum vertical separation per column.
    const nodesByDepth = new Map<number, Array<{ node: TopologyNodeData; y: number }>>();

    const assignY = (node: TopologyNodeData, depth: number, centerY: number): number => {
      const children = node.children ?? [];
      const isCollapsed = Boolean(node.collapsible && collapsedIds.has(node.id));
      const list = nodesByDepth.get(depth) ?? [];
      nodesByDepth.set(depth, list);

      if (children.length === 0 || isCollapsed) {
        list.push({ node, y: centerY });
        return centerY;
      }

      if (children.length === 1) {
        const childY = assignY(children[0], depth + 1, centerY);
        list.push({ node, y: childY });
        return childY;
      }

      const spanHeight = (children.length - 1) * rowStep;
      const startY = centerY - spanHeight / 2;
      const childYs: number[] = [];
      children.forEach((child, idx) => {
        const cy = assignY(child, depth + 1, startY + idx * rowStep);
        childYs.push(cy);
      });
      const avgY = (childYs[0] + childYs[childYs.length - 1]) / 2;
      list.push({ node, y: avgY });
      return avgY;
    };

    assignY(root, 0, 286);

    // Resolve any vertical collisions per depth and shift to positive viewport
    let minY = Infinity;
    let maxY = -Infinity;
    const finalPos = new Map<string, { x: number; y: number }>();

    for (const [depth, items] of nodesByDepth.entries()) {
      items.sort((a, b) => a.y - b.y);
      for (let i = 1; i < items.length; i++) {
        if (items[i].y - items[i - 1].y < 76) {
          items[i].y = items[i - 1].y + 76;
        }
      }
      const x = X_BY_DEPTH[depth] ?? 46 + depth * 156;
      for (const item of items) {
        finalPos.set(item.node.id, { x, y: item.y });
        minY = Math.min(minY, item.y);
        maxY = Math.max(maxY, item.y);
      }
    }

    const shiftY = Number.isFinite(minY) ? topPad - minY : 0;
    for (const pos of finalPos.values()) {
      pos.y += shiftY;
    }

    const buildHorizontalGraph = (node: TopologyNodeData, depth: number) => {
      const pos = finalPos.get(node.id) ?? { x: 46, y: 280 };
      const children = node.children ?? [];
      const isCollapsed = Boolean(node.collapsible && collapsedIds.has(node.id));

      if (children.length === 0 || isCollapsed) {
        const hubX = node.collapsible ? pos.x + HUB_OFFSET : undefined;
        nodes.push({
          node,
          x: pos.x,
          y: pos.y,
          depth,
          hasVisibleChildren: false,
          isCollapsed,
          hiddenChildCount: isCollapsed ? countDescendants(node) : 0,
          hubX,
          hubY: node.collapsible ? pos.y : undefined,
        });
        return;
      }

      const hasHub = Boolean(node.collapsible && children.length > 0);
      const hubX = hasHub ? pos.x + HUB_OFFSET : pos.x + 30;
      const hubY = pos.y;

      nodes.push({
        node,
        x: pos.x,
        y: pos.y,
        depth,
        hasVisibleChildren: true,
        isCollapsed: false,
        hiddenChildCount: 0,
        hubX: hasHub ? hubX : undefined,
        hubY: hasHub ? hubY : undefined,
      });

      if (hasHub) {
        edges.push({
          id: `${node.id}-to-hub`,
          fromX: pos.x + 28,
          fromY: pos.y,
          toX: hubX - 9,
          toY: hubY,
          dashed: false,
          childX: hubX,
          childY: hubY,
        });
      }

      for (const child of children) {
        const cPos = finalPos.get(child.id) ?? { x: pos.x + 150, y: pos.y };
        edges.push({
          id: `${node.id}->${child.id}`,
          fromX: hasHub ? hubX + 9 : pos.x + 26,
          fromY: hubY,
          toX: cPos.x - 26,
          toY: cPos.y,
          dashed: Boolean(child.linkDashed),
          portLabel: child.portLabel,
          speedLabel: child.speedLabel,
          childX: cPos.x,
          childY: cPos.y,
        });
        buildHorizontalGraph(child, depth + 1);
      }
    };

    buildHorizontalGraph(root, 0);
    const totalHeight = Number.isFinite(maxY) ? maxY + shiftY + 64 : 560;
    return {
      nodes,
      edges,
      stageWidth: 896,
      stageHeight: Math.max(540, totalHeight),
    };
  }

  // Vertical layout (top-to-bottom)
  const Y_BY_DEPTH = [48, 146, 250, 366, 486, 594];
  const colStep = 114;
  const leftPad = 68;

  const placeVertical = (
    node: TopologyNodeData,
    depth: number,
    slotStart: number,
  ): { x: number; y: number } => {
    const span = leafSpanMap.get(node.id) ?? 1;
    const children = node.children ?? [];
    const isCollapsed = Boolean(node.collapsible && collapsedIds.has(node.id));
    const y = Y_BY_DEPTH[depth] ?? 48 + depth * 110;

    if (children.length === 0 || isCollapsed) {
      const x = leftPad + (slotStart + (span - 1) / 2) * colStep;
      const hubY = node.collapsible ? y + 46 : undefined;
      nodes.push({
        node,
        x,
        y,
        depth,
        hasVisibleChildren: false,
        isCollapsed,
        hiddenChildCount: isCollapsed ? countDescendants(node) : 0,
        hubX: node.collapsible ? x : undefined,
        hubY,
      });
      return { x, y };
    }

    let cursor = slotStart;
    const childCoords: Array<{ child: TopologyNodeData; x: number; y: number }> = [];
    for (const child of children) {
      const childSpan = leafSpanMap.get(child.id) ?? 1;
      const pos = placeVertical(child, depth + 1, cursor);
      childCoords.push({ child, x: pos.x, y: pos.y });
      cursor += childSpan;
    }

    const x = (childCoords[0].x + childCoords[childCoords.length - 1].x) / 2;
    const hasHub = Boolean(node.collapsible && childCoords.length > 0);
    const hubX = x;
    const hubY = hasHub ? y + 46 : y + 28;

    nodes.push({
      node,
      x,
      y,
      depth,
      hasVisibleChildren: true,
      isCollapsed: false,
      hiddenChildCount: 0,
      hubX: hasHub ? hubX : undefined,
      hubY: hasHub ? hubY : undefined,
    });

    if (hasHub) {
      edges.push({
        id: `${node.id}-to-hub`,
        fromX: x,
        fromY: y + 26,
        toX: hubX,
        toY: hubY - 9,
        dashed: false,
        childX: hubX,
        childY: hubY,
      });
    }

    for (const item of childCoords) {
      edges.push({
        id: `${node.id}->${item.child.id}`,
        fromX: hubX,
        fromY: hasHub ? hubY + 9 : y + 26,
        toX: item.x,
        toY: item.y - 26,
        dashed: Boolean(item.child.linkDashed),
        portLabel: item.child.portLabel,
        speedLabel: item.child.speedLabel,
        childX: item.x,
        childY: item.y,
      });
    }

    return { x, y };
  };

  placeVertical(root, 0, 0);
  return {
    nodes,
    edges,
    stageWidth: Math.max(880, leftPad * 2 + totalLeaves * colStep),
    stageHeight: 650,
  };
}

function getStatusDotColor(tone?: TopologyNodeData['statusDotTone']): string {
  switch (tone) {
    case 'good':
      return 'var(--omada-brand-hover)';
    case 'poor':
      return 'var(--omada-color-error)';
    default:
      return 'var(--omada-border-strong)';
  }
}

/**
 * Interactive Omada v6.3 Network Topology Canvas (`Dashboard -> Topology`).
 * Renders hierarchical Gateway -> Switch -> AP -> Client connections with curved Bezier
 * edges, port/speed badges, green collapsible subtree hubs, search/health dimming,
 * horizontal/vertical layout toggle, zoom/pan, and node click-to-inspect callbacks.
 */
export const STopologyCanvas: React.FC<STopologyCanvasProps> = ({
  root = DEFAULT_TOPOLOGY_TREE,
  layout: controlledLayout,
  onLayoutChange,
  searchQuery = '',
  healthFilter = null,
  networkFilter = 'all',
  ssidFilter = 'all',
  displayOptions: displayOverrides,
  onOpenDeviceByName,
  onSelectNode,
  height = 576,
  className = '',
}) => {
  const [innerLayout, setInnerLayout] = useState<TopologyLayoutMode>('horizontal');
  const layout = controlledLayout ?? innerLayout;

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [legendOpen, setLegendOpen] = useState<boolean>(false);

  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const resolvedDisplay = useMemo<TopologyDisplayOptions>(
    () => ({
      ...DEFAULT_TOPOLOGY_DISPLAY_OPTIONS,
      ...displayOverrides,
    }),
    [displayOverrides],
  );

  const visibleRoot = useMemo(
    () => filterTreeByVisibility(root, resolvedDisplay) ?? root,
    [root, resolvedDisplay],
  );

  const { nodes, edges, stageWidth, stageHeight } = useMemo(
    () => computeTreeLayout(visibleRoot, collapsedIds, layout),
    [visibleRoot, collapsedIds, layout],
  );

  const hasActiveFilter = Boolean(
    searchQuery.trim() ||
      healthFilter !== null ||
      (networkFilter && networkFilter !== 'all') ||
      (ssidFilter && ssidFilter !== 'all'),
  );

  const doesNodeMatch = (node: TopologyNodeData): boolean => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const hay = `${node.name} ${node.ip ?? ''} ${node.mac ?? ''} ${node.model ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (healthFilter !== null) {
      if (node.kind !== 'device' && node.kind !== 'controller') return false;
      if (node.healthBucket !== healthFilter) return false;
    }
    if (networkFilter && networkFilter !== 'all') {
      if (node.network && node.network !== 'All' && node.network.toLowerCase() !== networkFilter.toLowerCase()) {
        return false;
      }
    }
    if (ssidFilter && ssidFilter !== 'all') {
      if (node.ssid && node.ssid.toLowerCase() !== ssidFilter.toLowerCase()) {
        return false;
      }
      if (!node.ssid && node.category === 'ap') return false;
      if (!node.ssid && node.kind === 'client') return false;
    }
    return true;
  };

  const toggleCollapseNode = (nodeId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleToggleLayout = () => {
    const next: TopologyLayoutMode = layout === 'horizontal' ? 'vertical' : 'horizontal';
    if (controlledLayout === undefined) {
      setInnerLayout(next);
    }
    onLayoutChange?.(next);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))));
  const handleRecenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    setPan({
      x: dragStateRef.current.originX + (e.clientX - dragStateRef.current.startX),
      y: dragStateRef.current.originY + (e.clientY - dragStateRef.current.startY),
    });
  };

  const handlePointerUp = () => {
    dragStateRef.current.active = false;
  };

  const legendContent = (
    <div className="w-[228px] space-y-2.5 text-[12px] text-[var(--omada-text-secondary)]">
      <div className="font-semibold text-[var(--omada-text-primary)]">Topology Legend</div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--omada-brand-hover)' }}
          />
          <span>Connected / Good Health</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--omada-color-error)' }}
          />
          <span>Poor Health / Alert</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--omada-border-strong)' }}
          />
          <span>No Health Data / Pending</span>
        </div>
      </div>
      <div className="border-t border-[var(--omada-border-divider)] pt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-[2px] w-5 bg-[var(--omada-border-strong)]" />
          <span>1000FDX Wired Uplink</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-0 w-5 border-t border-dashed border-[var(--omada-border-strong)]" />
          <span>WAN / External Link</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--omada-brand)] text-[10px] font-bold text-white">
            -
          </span>
          <span>Expand / Collapse Subtree</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      data-testid="topology-canvas"
      data-layout={layout}
      data-zoom={String(zoom)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full select-none overflow-hidden rounded-[8px] bg-[var(--omada-map-canvas-bg)] ${className}`.trim()}
      style={{ height, cursor: dragStateRef.current.active ? 'grabbing' : 'grab' }}
    >
      {/* Centered Zoomable & Pannable Tree Stage */}
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
          {/* Layer 1: Cubic Bezier Links & Port/Speed Edge Labels */}
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

              const labelX = layout === 'horizontal' ? edge.childX - 28 : edge.childX - 24;
              const labelY = layout === 'horizontal' ? edge.childY - 8 : edge.childY - 38;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      edge.dashed
                        ? 'var(--omada-topo-link-dashed)'
                        : 'var(--omada-topo-link)'
                    }
                    strokeWidth={1.2}
                    strokeDasharray={edge.dashed ? '4 4' : undefined}
                  />
                  {resolvedDisplay.showLinkLabels && (edge.portLabel || edge.speedLabel) && (
                    <g transform={`translate(${labelX}, ${labelY})`}>
                      {edge.portLabel && (
                        <text
                          x={0}
                          y={0}
                          textAnchor="end"
                          fontSize={10}
                          fill="var(--omada-text-tertiary)"
                          style={{ fontFamily: 'var(--omada-font-sans)' }}
                        >
                          {edge.portLabel}
                        </text>
                      )}
                      {edge.speedLabel && (
                        <text
                          x={0}
                          y={12}
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

          {/* Layer 2: Interactive Nodes & Green Expand/Collapse Hubs */}
          {nodes.map((item) => {
            const { node, x, y, isCollapsed, hiddenChildCount, hubX, hubY } = item;
            const matched = doesNodeMatch(node);
            const isDimmed = hasActiveFilter && !matched;
            const isHighlighted = hasActiveFilter && matched;

            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  data-testid={`topo-node-${node.id}`}
                  data-node-name={node.name}
                  title={`${node.name}${node.model ? ` · ${node.model}` : ''}${node.ip ? ` (${node.ip})` : ''}`}
                  onClick={() => {
                    onSelectNode?.(node);
                    if (node.kind === 'device') {
                      onOpenDeviceByName?.(node.name);
                    }
                  }}
                  className={`omada-topo-node-btn absolute -translate-x-1/2 -translate-y-1/2 ${
                    isHighlighted ? 'is-highlighted' : ''
                  } ${isDimmed ? 'is-dimmed' : ''}`.trim()}
                  style={{ left: x, top: y }}
                >
                  <div className="relative flex h-[38px] w-[42px] items-center justify-center">
                    {node.kind === 'client' && node.clientIcon ? (
                      <SClientIcon name={node.clientIcon} size={32} alt={node.name} />
                    ) : (
                      <SProductImage
                        name={node.productSlug ?? 'er8411'}
                        size={node.kind === 'internet' ? 38 : 36}
                        alt={node.name}
                      />
                    )}
                    {node.showLinkAlertBadge && (
                      <span
                        className="absolute -right-4 bottom-0 inline-flex h-[16px] w-[16px] items-center justify-center"
                        aria-hidden="true"
                      >
                        <SIcon name="topo-icon-2" size={16} />
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex max-w-[146px] items-center gap-1">
                    {resolvedDisplay.showHealthStatus && (
                      <span
                        className="h-[5px] w-[5px] shrink-0 rounded-full"
                        style={{ backgroundColor: getStatusDotColor(node.statusDotTone) }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate text-[11px] font-normal leading-[14px] text-[var(--omada-text-primary)]">
                      {node.name}
                    </span>
                  </div>
                </button>

                {/* Green Collapsible Subtree Hub (-) / (+N) */}
                {node.collapsible && hubX !== undefined && hubY !== undefined && (
                  <button
                    type="button"
                    data-testid={`topo-hub-${node.id}`}
                    aria-label={
                      isCollapsed
                        ? `Expand ${node.name} (${hiddenChildCount} hidden)`
                        : `Collapse ${node.name} subtree`
                    }
                    aria-expanded={!isCollapsed}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapseNode(node.id);
                    }}
                    className="absolute z-10 flex h-[16px] min-w-[16px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--omada-brand)] px-1 text-[10px] font-semibold leading-none text-white shadow-2xs transition-transform hover:scale-110 hover:bg-[var(--omada-brand-hover)]"
                    style={{ left: hubX, top: hubY }}
                  >
                    {isCollapsed ? `+${hiddenChildCount}` : '−'}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom-Left Floating Controls: (i) Legend, Layout Toggle, Recenter / + / - */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-2.5">
        <Popover
          open={legendOpen}
          onOpenChange={setLegendOpen}
          trigger="click"
          placement="rightBottom"
          content={legendContent}
        >
          <button
            type="button"
            aria-label="Topology legend"
            data-testid="topo-legend-btn"
            className="omada-map-floating-card flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-9" size={16} />
          </button>
        </Popover>

        <button
          type="button"
          aria-label={
            layout === 'horizontal'
              ? 'Switch to vertical topology layout'
              : 'Switch to horizontal topology layout'
          }
          data-testid="topo-layout-toggle-btn"
          onClick={handleToggleLayout}
          className="omada-map-floating-card flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
        >
          <SIcon
            name={
              layout === 'horizontal'
                ? 'topo-icon-property-1'
                : 'topo-icon-property-1-2'
            }
            size={16}
          />
        </button>

        <div className="omada-map-floating-card flex w-[32px] flex-col overflow-hidden rounded-[4px]">
          <button
            type="button"
            aria-label="Recenter topology"
            data-testid="topo-recenter-btn"
            onClick={handleRecenter}
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center border-0 border-b border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-3" size={15} />
          </button>
          <button
            type="button"
            aria-label="Zoom in topology"
            data-testid="topo-zoom-in-btn"
            onClick={handleZoomIn}
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center border-0 border-b border-[var(--omada-border-divider)] bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-4" size={15} />
          </button>
          <button
            type="button"
            aria-label="Zoom out topology"
            data-testid="topo-zoom-out-btn"
            onClick={handleZoomOut}
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center border-0 bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:text-[var(--omada-brand-text)]"
          >
            <SIcon name="topo-icon-property-1-5" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
