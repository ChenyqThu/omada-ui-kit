import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  App as AntdApp,
  Checkbox,
  Dropdown,
  Input,
  Modal,
  Popover,
  Switch,
  Table,
  Tooltip,
  type MenuProps,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ChevronDown,
  ChevronRight,
  Gauge,
  Plus,
  Search,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  SButton,
  SClientIcon,
  SIcon,
  SIllustration,
  SProductImage,
  SSelect,
  hasOmadaProductImage,
  type OmadaClientIconName,
  type OmadaIllustrationName,
  type OmadaProductName,
} from '@/omada';
import {
  PortBadgeTile,
  SDevicePortGraphic,
  resolveConnectedProductSlug,
  type DrawerPortItem,
} from '../../../omada/components/SDevicePortGraphic';

export type { DrawerPortItem };

export type DrawerMode = 'quick' | 'expanded';

export type ExpandedDrawerTab =
  | 'overview'
  | 'network-view'
  | 'ports'
  | 'logs'
  | 'tools'
  | 'config';

/**
 * Structural device contract consumed by `DevicePropertiesDrawer`.
 * Compatible device objects pass cleanly without coupling imports to page data modules.
 */
export interface DrawerDeviceRecord {
  key: string;
  name: string;
  model: string;
  productSlug?: string;
  category: string;
  status: string;
  mac: string;
  ipv4: string;
  controllerIp?: string;
  serialNumber: string;
  customer: string;
  firmwareVersion: string;
  firmwareFull: string;
  uptime: string;
  cpu: number;
  memory: number;
  poeUsedW?: number;
  poeTotalW?: number;
  usedPorts?: number;
  totalPorts?: number;
  uplink?: { name: string; port: number };
  downlinks?: Array<{ name: string; port: number }>;
  ports?: DrawerPortItem[];
}

export interface DevicePropertiesDrawerProps {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Primary device record displayed in the drawer. */
  device: DrawerDeviceRecord | null;
  /** Controlled display mode (`quick` 420px vs `expanded` 1224px). */
  mode?: DrawerMode;
  /** Uncontrolled initial display mode. */
  defaultMode?: DrawerMode;
  /** Fired when the user switches between `quick` and `expanded` modes. */
  onModeChange?: (mode: DrawerMode) => void;
  /** Controlled active tab when in `expanded` mode. */
  activeTab?: ExpandedDrawerTab;
  /** Uncontrolled initial active tab when entering `expanded` mode. */
  defaultActiveTab?: ExpandedDrawerTab;
  /** Fired when an expanded navigation tab is selected. */
  onTabChange?: (tab: ExpandedDrawerTab) => void;
  /** Optional controlled list of open device tabs in `expanded` mode. */
  openDevices?: DrawerDeviceRecord[];
  /** Optional catalog of site devices for multi-tab switching and uplink/downlink navigation. */
  availableDevices?: DrawerDeviceRecord[];
  /** Fired when switching to another device tab or clicking an uplink/downlink device link. */
  onSelectDevice?: (device: DrawerDeviceRecord) => void;
  /** Fired when the user saves an inline rename. */
  onRenameDevice?: (device: DrawerDeviceRecord, nextName: string) => void;
  /** Fired when the user clicks the drawer close button. */
  onClose: () => void;
  /** Width in px of the left navigation sidebar used to size `expanded` mode (`216` default). */
  sidebarWidth?: number;
}

const DEFAULT_SECONDARY_SWITCH: DrawerDeviceRecord = {
  key: 'server-room-switch-2',
  name: 'ServerRoom_Switch_2',
  model: 'SG3428X v1.0',
  productSlug: 'sg2428p-un-5-40',
  category: 'switch',
  status: 'Connected',
  mac: '00-FF-00-1B-57-93',
  ipv4: '192.168.0.105',
  controllerIp: '192.168.0.10',
  serialNumber: '2248192001089',
  customer: 'Headquarters Building',
  firmwareVersion: '1.20.4 Build 20250520 Rel.31820',
  firmwareFull: 'SG3428X v1.0 (1.20.4 Build 20250520 Rel.31820)',
  uptime: '14d 06h 18m 44s',
  cpu: 8,
  memory: 42,
  poeUsedW: 64.2,
  poeTotalW: 384.0,
  usedPorts: 6,
  totalPorts: 10,
  uplink: { name: 'MainOffice_Gateway_2', port: 1 },
  downlinks: [
    { name: 'SalesDepartment_Switch_3', port: 2 },
    { name: 'DataCenter_Olt_1', port: 9 },
  ],
};

const EXPANDED_NAV_TABS: Array<{ key: ExpandedDrawerTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'network-view', label: 'Network View' },
  { key: 'ports', label: 'Ports' },
  { key: 'logs', label: 'Logs' },
  { key: 'tools', label: 'Tools' },
  { key: 'config', label: 'Config' },
];

type HealthTier = 'good' | 'warn' | 'minor' | 'poor';

function buildHealthTicks(seedKey: string): HealthTier[] {
  let hash = 7;
  for (let i = 0; i < seedKey.length; i += 1) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) % 10007;
  }
  const ticks: HealthTier[] = [];
  for (let i = 0; i < 96; i += 1) {
    const roll = (hash + i * 37 + (i % 7) * 13) % 100;
    if (i === 14 || i === 56 || i === 82) {
      ticks.push('poor');
    } else if (roll < 72) {
      ticks.push('good');
    } else if (roll < 86) {
      ticks.push('warn');
    } else if (roll < 96) {
      ticks.push('minor');
    } else {
      ticks.push('poor');
    }
  }
  return ticks;
}

function resolveDeviceProductSlug(device: DrawerDeviceRecord): OmadaProductName {
  if (device.productSlug && hasOmadaProductImage(device.productSlug)) {
    return device.productSlug as OmadaProductName;
  }
  return resolveConnectedProductSlug(
    undefined,
    device.category.toLowerCase() as DrawerPortItem['connectionType'],
    device.name,
  );
}

function buildDefaultPortsForDevice(device: DrawerDeviceRecord): DrawerPortItem[] {
  if (device.ports && device.ports.length > 0) {
    return device.ports;
  }

  const total = device.totalPorts ?? (device.category === 'gateway' ? 6 : 10);
  const items: DrawerPortItem[] = [];
  const downlinksByPort = new Map<number, string>();
  for (const dl of device.downlinks ?? []) {
    downlinksByPort.set(dl.port, dl.name);
  }

  const txDefaults = ['14.82 GB', '4.36 GB', '3.18 GB', '2.74 GB'];
  const rxDefaults = ['52.14 GB', '11.20 GB', '9.45 GB', '6.81 GB'];

  for (let p = 1; p <= total; p += 1) {
    const isSfp = total >= 10 && p >= total - 1;
    const isUplink = device.uplink ? p === device.uplink.port : p === 1;
    const downlinkName = downlinksByPort.get(p);
    const usedLimit = device.usedPorts ?? (device.category === 'gateway' ? 2 : 4);
    const isConnected = isUplink || Boolean(downlinkName) || p <= usedLimit;

    let connectionName: string | undefined;
    let connectionType: DrawerPortItem['connectionType'];
    if (isUplink && device.uplink) {
      connectionName = device.uplink.name;
      connectionType = 'gateway';
    } else if (downlinkName) {
      connectionName = downlinkName;
      connectionType = downlinkName.toLowerCase().includes('switch')
        ? 'switch'
        : downlinkName.toLowerCase().includes('olt')
          ? 'olt'
          : 'ap';
    }

    const isPoeActive = !isSfp && !isUplink && isConnected && (device.poeTotalW ?? 0) > 0;

    items.push({
      port: p,
      name: `Port${p}`,
      linkStatus: isConnected ? '1000m' : 'disconnected',
      isSfp,
      isUplink: isUplink && isConnected,
      isPoe: isPoeActive,
      lacp: '--',
      connectionName,
      connectionProductSlug: connectionName
        ? resolveConnectedProductSlug(undefined, connectionType, connectionName)
        : undefined,
      connectionType,
      label: '--',
      type: 'Trunk',
      poeCapability: isSfp || (device.poeTotalW ?? 0) === 0 ? '--' : 'PoE+(30W)',
      profile: 'All',
      nativeNetwork: 'Default(1)',
      txSum: isConnected ? (txDefaults[p - 1] ?? '1.25 GB') : '0 B',
      rxSum: isConnected ? (rxDefaults[p - 1] ?? '3.40 GB') : '0 B',
    });
  }

  return items;
}

function getStatusAccentClass(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes('connect') && !lower.includes('dis')) {
    return 'text-[var(--omada-brand-hover)]';
  }
  if (lower.includes('miss') || lower.includes('warn') || lower.includes('isolat')) {
    return 'text-[var(--omada-color-warning)]';
  }
  if (lower.includes('fail') || lower.includes('error')) {
    return 'text-[var(--omada-color-error)]';
  }
  return 'text-[var(--omada-text-secondary)]';
}

function formatDeviceStatusLabel(status: string): string {
  const map: Record<string, string> = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    'heartbeat-missed': 'Heartbeat Missed',
    'adopt-failed': 'Adopt Failed',
    pending: 'Pending',
    provisioning: 'Provisioning',
    isolated: 'Isolated',
  };
  return map[status.toLowerCase()] ?? status;
}

interface PortTableFilterHeaderProps {
  label: string;
}

const FilterHeaderLabel: React.FC<PortTableFilterHeaderProps> = ({ label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span>{label}</span>
    <span className="text-[var(--omada-text-tertiary)] opacity-75">
      <SIcon name="filter" size={12} />
    </span>
  </span>
);

/**
 * Two-stage Omada Controller v6.3 right-anchored Device Properties & Management Drawer:
 * - Stage 1 (`mode="quick"`, 420px): Identity, compact port strip, 24h health ticks, metrics, connections, info.
 * - Stage 2 (`mode="expanded"`, calc(100vw - 216px)): Multi-device tab strip, identity header, Ports graphic + table, Overview, Config, etc.
 */
export const DevicePropertiesDrawer: React.FC<DevicePropertiesDrawerProps> = ({
  open,
  device,
  mode: controlledMode,
  defaultMode = 'quick',
  onModeChange,
  activeTab: controlledTab,
  defaultActiveTab = 'ports',
  onTabChange,
  openDevices,
  availableDevices = [],
  onSelectDevice,
  onRenameDevice,
  onClose,
  sidebarWidth = 216,
}) => {
  const { message } = AntdApp.useApp();

  const [innerMode, setInnerMode] = useState<DrawerMode>(defaultMode);
  const [innerTab, setInnerTab] = useState<ExpandedDrawerTab>(defaultActiveTab);
  const [connectionView, setConnectionView] = useState<'device' | 'client'>('device');
  const [portFilter, setPortFilter] = useState<string>('all');
  const [portSubTab, setPortSubTab] = useState<'config' | 'statistics' | 'ddm'>('config');
  const [showInlineFilter, setShowInlineFilter] = useState(false);
  const [portSearchQuery, setPortSearchQuery] = useState('');
  const [selectedPortNumber, setSelectedPortNumber] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [hiddenPortColumns, setHiddenPortColumns] = useState<string[]>([]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [renamedNames, setRenamedNames] = useState<Record<string, string>>({});

  const [portOverrides, setPortOverrides] = useState<Record<string, Record<number, DrawerPortItem>>>({});
  const [editingPort, setEditingPort] = useState<DrawerPortItem | null>(null);
  const [portEditDraft, setPortEditDraft] = useState<{
    name: string;
    label: string;
    type: string;
    profile: string;
    nativeNetwork: string;
    poeEnabled: boolean;
  } | null>(null);

  const [configState, setConfigState] = useState({
    ledEnabled: true,
    lldpEnabled: true,
    stpEnabled: true,
    flowControlEnabled: false,
    managementVlan: 'Default(1)',
  });

  const [internalTabs, setInternalTabs] = useState<DrawerDeviceRecord[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);
  const prevPropKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!device) return;
    if (prevPropKeyRef.current !== device.key) {
      prevPropKeyRef.current = device.key;
      setActiveTabKey(device.key);
      setIsRenaming(false);
      setSelectedPortNumber(null);
      setSelectedRowKeys([]);
      setInternalTabs((prev) => {
        if (prev.length === 0) {
          const secondary =
            availableDevices.find(
              (d) => d.key !== device.key && d.name === 'ServerRoom_Switch_2',
            ) ??
            availableDevices.find((d) => d.key !== device.key) ??
            (device.name !== DEFAULT_SECONDARY_SWITCH.name ? DEFAULT_SECONDARY_SWITCH : null);
          return secondary ? [device, secondary] : [device];
        }
        const exists = prev.some((item) => item.key === device.key);
        return exists ? prev.map((item) => (item.key === device.key ? device : item)) : [...prev, device];
      });
    }
  }, [device, availableDevices]);

  const currentMode = controlledMode ?? innerMode;
  const currentTab = controlledTab ?? innerTab;

  const setMode = (next: DrawerMode) => {
    if (controlledMode === undefined) {
      setInnerMode(next);
    }
    onModeChange?.(next);
  };

  const setTab = (next: ExpandedDrawerTab) => {
    if (controlledTab === undefined) {
      setInnerTab(next);
    }
    onTabChange?.(next);
  };

  const resolvedTabs = useMemo(() => {
    if (openDevices && openDevices.length > 0) {
      return openDevices;
    }
    if (internalTabs.length > 0) {
      return internalTabs;
    }
    return device ? [device] : [];
  }, [openDevices, internalTabs, device]);

  const activeDevice = useMemo(() => {
    if (!device) return null;
    if (openDevices && openDevices.length > 0) {
      return openDevices.find((d) => d.key === device.key) ?? device;
    }
    return resolvedTabs.find((d) => d.key === activeTabKey) ?? device;
  }, [device, openDevices, resolvedTabs, activeTabKey]);

  const activeDeviceDisplayName = activeDevice
    ? (renamedNames[activeDevice.key] ?? activeDevice.name)
    : '';

  const basePorts = useMemo(
    () => (activeDevice ? buildDefaultPortsForDevice(activeDevice) : []),
    [activeDevice],
  );

  const mergedPorts = useMemo(() => {
    if (!activeDevice) return [];
    const overrides = portOverrides[activeDevice.key];
    if (!overrides) return basePorts;
    return basePorts.map((item) => overrides[item.port] ?? item);
  }, [activeDevice, basePorts, portOverrides]);

  const filteredPorts = useMemo(() => {
    let list = mergedPorts;
    if (portFilter === 'connected') {
      list = list.filter((p) => p.linkStatus !== 'disconnected' && p.linkStatus !== 'disabled');
    } else if (portFilter === 'poe') {
      list = list.filter((p) => p.poeCapability && p.poeCapability !== '--');
    } else if (portFilter === 'sfp') {
      list = list.filter((p) => Boolean(p.isSfp));
    } else if (portFilter === 'uplink') {
      list = list.filter((p) => Boolean(p.isUplink));
    } else if (portFilter === 'disconnected') {
      list = list.filter((p) => p.linkStatus === 'disconnected');
    }

    if (portSubTab === 'ddm') {
      list = list.filter((p) => Boolean(p.isSfp));
    }

    if (selectedPortNumber !== null) {
      list = list.filter((p) => p.port === selectedPortNumber);
    }

    const q = portSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.port) === q ||
          (p.connectionName ?? '').toLowerCase().includes(q),
      );
    }

    return list;
  }, [mergedPorts, portFilter, portSubTab, selectedPortNumber, portSearchQuery]);

  const healthTicks = useMemo(
    () => buildHealthTicks(activeDevice?.key ?? 'default'),
    [activeDevice?.key],
  );

  if (!open || !activeDevice) {
    return null;
  }

  const productSlug = resolveDeviceProductSlug(activeDevice);
  const usedCount =
    activeDevice.usedPorts ??
    mergedPorts.filter((p) => p.linkStatus !== 'disconnected' && p.linkStatus !== 'disabled')
      .length;
  const totalCount = activeDevice.totalPorts ?? mergedPorts.length;

  const startRename = () => {
    setRenameDraft(activeDeviceDisplayName);
    setIsRenaming(true);
  };

  const commitRename = () => {
    const trimmed = renameDraft.trim();
    if (trimmed && trimmed !== activeDeviceDisplayName) {
      setRenamedNames((prev) => ({ ...prev, [activeDevice.key]: trimmed }));
      onRenameDevice?.(activeDevice, trimmed);
      message.success(`Renamed device to ${trimmed}`);
    }
    setIsRenaming(false);
  };

  const handleDeviceAction = (actionKey: string) => {
    const labels: Record<string, string> = {
      locate: `Locating ${activeDeviceDisplayName} (LED blinking)`,
      reboot: `Reboot command sent to ${activeDeviceDisplayName}`,
      upgrade: `Checking firmware updates for ${activeDevice.model}`,
      reconnect: `Reconnecting ${activeDeviceDisplayName} to controller`,
      terminal: `Opening remote CLI session for ${activeDeviceDisplayName}`,
      forget: `${activeDeviceDisplayName} queued for forget`,
    };
    message.info(labels[actionKey] ?? `Action ${actionKey} triggered`);
  };

  const actionMenuItems: MenuProps['items'] = [
    { key: 'locate', label: 'Locate' },
    { key: 'reboot', label: 'Reboot' },
    { key: 'upgrade', label: 'Upgrade Firmware' },
    { key: 'reconnect', label: 'Reconnect' },
    { key: 'terminal', label: 'Open Terminal' },
    { type: 'divider' },
    { key: 'forget', label: 'Forget Device', danger: true },
  ];

  const handleSwitchDeviceTab = (target: DrawerDeviceRecord) => {
    setActiveTabKey(target.key);
    setIsRenaming(false);
    setSelectedPortNumber(null);
    setSelectedRowKeys([]);
    onSelectDevice?.(target);
  };

  const handleOpenLinkedDevice = (name: string) => {
    const match =
      availableDevices.find((d) => d.name === name) ??
      resolvedTabs.find((d) => d.name === name) ??
      (name === DEFAULT_SECONDARY_SWITCH.name ? DEFAULT_SECONDARY_SWITCH : undefined);

    if (match) {
      setInternalTabs((prev) =>
        prev.some((item) => item.key === match.key) ? prev : [...prev, match],
      );
      handleSwitchDeviceTab(match);
      return;
    }
    message.info(`Viewing link peer ${name}`);
  };

  const addableDevices = (availableDevices.length > 0
    ? availableDevices
    : [DEFAULT_SECONDARY_SWITCH]
  ).filter((d) => !resolvedTabs.some((t) => t.key === d.key));

  const addTabMenuItems: MenuProps['items'] =
    addableDevices.length > 0
      ? addableDevices.map((d) => ({
          key: d.key,
          label: (
            <div className="flex items-center gap-2">
              <SProductImage name={resolveDeviceProductSlug(d)} size={20} />
              <span>{d.name}</span>
            </div>
          ),
          onClick: () => {
            setInternalTabs((prev) =>
              prev.some((item) => item.key === d.key) ? prev : [...prev, d],
            );
            handleSwitchDeviceTab(d);
          },
        }))
      : [
          {
            key: '__no_more__',
            disabled: true,
            label: 'All site devices open',
          },
        ];

  const openPortEditModal = (portItem: DrawerPortItem) => {
    setEditingPort(portItem);
    setPortEditDraft({
      name: portItem.name,
      label: portItem.label === '--' ? '' : (portItem.label ?? ''),
      type: portItem.type ?? 'Trunk',
      profile: portItem.profile ?? 'All',
      nativeNetwork: portItem.nativeNetwork ?? 'Default(1)',
      poeEnabled: Boolean(portItem.isPoe),
    });
  };

  const savePortEdit = () => {
    if (!editingPort || !portEditDraft) return;
    const updated: DrawerPortItem = {
      ...editingPort,
      name: portEditDraft.name.trim() || editingPort.name,
      label: portEditDraft.label.trim() || '--',
      type: portEditDraft.type,
      profile: portEditDraft.profile,
      nativeNetwork: portEditDraft.nativeNetwork,
      isPoe:
        editingPort.poeCapability && editingPort.poeCapability !== '--'
          ? portEditDraft.poeEnabled
          : editingPort.isPoe,
    };
    setPortOverrides((prev) => ({
      ...prev,
      [activeDevice.key]: {
        ...(prev[activeDevice.key] ?? {}),
        [editingPort.port]: updated,
      },
    }));
    message.success(`Updated ${updated.name} configuration`);
    setEditingPort(null);
    setPortEditDraft(null);
  };

  const togglePortColumnVisibility = (colKey: string) => {
    setHiddenPortColumns((prev) =>
      prev.includes(colKey) ? prev.filter((k) => k !== colKey) : [...prev, colKey],
    );
  };

  const columnPopoverContent = (
    <div className="w-[190px] space-y-1.5">
      <div className="border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Visible Columns
      </div>
      {[
        { key: 'lacp', label: 'LACP Aggregation' },
        { key: 'label', label: 'Label' },
        { key: 'txSum', label: 'TX Sum' },
        { key: 'rxSum', label: 'RX Sum' },
      ].map((col) => (
        <label
          key={col.key}
          className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-[var(--omada-bg-field)]"
        >
          <Checkbox
            checked={!hiddenPortColumns.includes(col.key)}
            onChange={() => togglePortColumnVisibility(col.key)}
          />
          <span className="text-[var(--omada-text-primary)]">{col.label}</span>
        </label>
      ))}
    </div>
  );

  const configColumns: ColumnsType<DrawerPortItem> = [
    {
      title: '',
      key: 'tile',
      width: 56,
      align: 'center',
      render: (_value, record) => (
        <div className="flex items-center justify-center">
          <PortBadgeTile port={record} size={32} />
        </div>
      ),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      width: 64,
      render: (val: number) => <span className="tabular-nums">{val}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 96,
    },
    ...(!hiddenPortColumns.includes('lacp')
      ? [
          {
            title: 'LACP Aggregation',
            dataIndex: 'lacp',
            key: 'lacp',
            width: 145,
            render: (val?: string) => val ?? '--',
          },
        ]
      : []),
    {
      title: <FilterHeaderLabel label="Connection" />,
      dataIndex: 'connectionName',
      key: 'connection',
      width: 220,
      render: (val: string | undefined, record) => {
        if (!val) return <span className="text-[var(--omada-text-tertiary)]">--</span>;
        const slug = resolveConnectedProductSlug(
          record.connectionProductSlug,
          record.connectionType,
          val,
        );
        return (
          <div className="flex items-center gap-2.5">
            <SProductImage
              name={slug}
              size={24}
              className="h-[24px] w-[24px] shrink-0 object-contain"
            />
            <span className="truncate text-[var(--omada-text-primary)]">{val}</span>
          </div>
        );
      },
    },
    ...(!hiddenPortColumns.includes('label')
      ? [
          {
            title: <FilterHeaderLabel label="Label" />,
            dataIndex: 'label',
            key: 'label',
            width: 96,
            render: (val?: string) => val ?? '--',
          },
        ]
      : []),
    {
      title: <FilterHeaderLabel label="Type" />,
      dataIndex: 'type',
      key: 'type',
      width: 96,
      render: (val?: string) => val ?? 'Trunk',
    },
    {
      title: <FilterHeaderLabel label="PoE" />,
      dataIndex: 'poeCapability',
      key: 'poe',
      width: 125,
      render: (val: string | undefined, record) => {
        if (!val || val === '--') {
          return <span className="text-[var(--omada-text-tertiary)]">--</span>;
        }
        const isActivePoe = Boolean(record.isPoe) && record.linkStatus !== 'disconnected';
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Zap
              size={13}
              className={
                isActivePoe
                  ? 'text-[var(--omada-brand-text)]'
                  : 'text-[var(--omada-text-tertiary)]'
              }
              fill={isActivePoe ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
            <span>{val}</span>
          </span>
        );
      },
    },
    {
      title: <FilterHeaderLabel label="Profile" />,
      dataIndex: 'profile',
      key: 'profile',
      width: 96,
      render: (val?: string) => val ?? 'All',
    },
    {
      title: 'Native Network',
      dataIndex: 'nativeNetwork',
      key: 'nativeNetwork',
      width: 130,
      render: (val?: string) => val ?? 'Default(1)',
    },
    ...(!hiddenPortColumns.includes('txSum')
      ? [
          {
            title: 'TX Sum',
            dataIndex: 'txSum',
            key: 'txSum',
            width: 105,
            render: (val?: string) => (
              <span className="tabular-nums">{val ?? '0 B'}</span>
            ),
          },
        ]
      : []),
    ...(!hiddenPortColumns.includes('rxSum')
      ? [
          {
            title: 'RX Sum',
            dataIndex: 'rxSum',
            key: 'rxSum',
            width: 105,
            render: (val?: string) => (
              <span className="tabular-nums">{val ?? '0 B'}</span>
            ),
          },
        ]
      : []),
    {
      title: (
        <div className="flex items-center justify-between gap-2">
          <span>Action</span>
          <Popover
            content={columnPopoverContent}
            trigger="click"
            placement="bottomRight"
          >
            <button
              type="button"
              aria-label="Port table columns"
              className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field-hover)]"
            >
              <SIcon name="more-3" size={14} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 96,
      fixed: 'end',
      render: (_value, record) => {
        const showPowerCycle = Boolean(record.isPoe) && record.linkStatus !== 'disconnected';
        return (
          <div className="flex items-center gap-3">
            <Tooltip title={`Edit ${record.name}`}>
              <button
                type="button"
                aria-label={`Edit ${record.name}`}
                onClick={() => openPortEditModal(record)}
                className="inline-flex cursor-pointer items-center justify-center rounded p-1 hover:bg-[var(--omada-brand-bg-subtlest)]"
              >
                <SIcon name="edit" size={16} />
              </button>
            </Tooltip>
            {showPowerCycle && (
              <Tooltip title={`PoE Power Cycle ${record.name}`}>
                <button
                  type="button"
                  aria-label={`Power cycle ${record.name}`}
                  onClick={() =>
                    message.info(
                      `PoE power cycled on ${record.name}${
                        record.connectionName ? ` (${record.connectionName})` : ''
                      }`,
                    )
                  }
                  className="inline-flex cursor-pointer items-center justify-center rounded p-1 hover:bg-[var(--omada-brand-bg-subtlest)]"
                >
                  <SIcon name="reboot" size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  const statisticsColumns: ColumnsType<DrawerPortItem> = [
    configColumns[0],
    configColumns[1],
    configColumns[2],
    {
      title: 'Link Speed',
      dataIndex: 'linkStatus',
      key: 'linkStatus',
      width: 130,
      render: (status: DrawerPortItem['linkStatus']) =>
        status === 'disconnected'
          ? 'Down'
          : status === 'disabled'
            ? 'Disabled'
            : status === '1000m'
              ? '1000M Full'
              : status.toUpperCase(),
    },
    {
      title: 'TX Packets',
      key: 'txPackets',
      width: 120,
      render: (_v, r) =>
        r.linkStatus === 'disconnected' ? '0' : `${(r.port * 412890).toLocaleString()}`,
    },
    {
      title: 'RX Packets',
      key: 'rxPackets',
      width: 120,
      render: (_v, r) =>
        r.linkStatus === 'disconnected' ? '0' : `${(r.port * 984120).toLocaleString()}`,
    },
    {
      title: 'TX Rate',
      key: 'txRate',
      width: 110,
      render: (_v, r) =>
        r.linkStatus === 'disconnected' ? '0 bps' : `${(12.4 + r.port * 3.1).toFixed(1)} Mbps`,
    },
    {
      title: 'RX Rate',
      key: 'rxRate',
      width: 110,
      render: (_v, r) =>
        r.linkStatus === 'disconnected' ? '0 bps' : `${(28.7 + r.port * 6.4).toFixed(1)} Mbps`,
    },
    {
      title: 'CRC Errors',
      key: 'errors',
      width: 100,
      render: () => '0',
    },
    configColumns[configColumns.length - 1],
  ];

  const ddmColumns: ColumnsType<DrawerPortItem> = [
    configColumns[0],
    configColumns[1],
    configColumns[2],
    {
      title: 'Transceiver',
      key: 'sfpPresence',
      width: 140,
      render: (_v, r) => (r.linkStatus === 'disconnected' ? 'Not Present' : '1000BASE-LX'),
    },
    {
      title: 'Temperature',
      key: 'temp',
      width: 120,
      render: (_v, r) => (r.linkStatus === 'disconnected' ? '--' : '38.4 °C'),
    },
    {
      title: 'Voltage',
      key: 'voltage',
      width: 100,
      render: (_v, r) => (r.linkStatus === 'disconnected' ? '--' : '3.31 V'),
    },
    {
      title: 'TX Power',
      key: 'txPower',
      width: 110,
      render: (_v, r) => (r.linkStatus === 'disconnected' ? '--' : '-4.2 dBm'),
    },
    {
      title: 'RX Power',
      key: 'rxPower',
      width: 110,
      render: (_v, r) => (r.linkStatus === 'disconnected' ? '--' : '-5.8 dBm'),
    },
    configColumns[configColumns.length - 1],
  ];

  const activePortColumns =
    portSubTab === 'statistics'
      ? statisticsColumns
      : portSubTab === 'ddm'
        ? ddmColumns
        : configColumns;

  const downlinkItems = activeDevice.downlinks ?? [];
  const hasPoeBudget = activeDevice.poeTotalW !== undefined && activeDevice.poeTotalW > 0;
  const formattedStatus = formatDeviceStatusLabel(activeDevice.status);

  const resolvePeerProductSlug = (
    peerName: string,
    fallbackType: DrawerPortItem['connectionType'],
  ): OmadaProductName => {
    const matched =
      availableDevices.find((d) => d.name === peerName) ??
      resolvedTabs.find((d) => d.name === peerName);
    if (matched) {
      return resolveDeviceProductSlug(matched);
    }
    return resolveConnectedProductSlug(undefined, fallbackType, peerName);
  };

  return (
    <aside
      role="dialog"
      aria-label={`${activeDeviceDisplayName} properties`}
      data-drawer-mode={currentMode}
      style={{ '--omada-drawer-sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}
      className={`omada-device-drawer ${
        currentMode === 'expanded'
          ? 'omada-device-drawer--expanded'
          : 'omada-device-drawer--quick'
      }`}
    >
      {currentMode === 'quick' ? (
        <div className="relative flex-1 overflow-y-auto px-6 pt-4 pb-6">
          {/* Top-right Close */}
          <button
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            className="absolute top-4 right-5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
          >
            <SIcon name="close" size={16} />
          </button>

          {/* Centered Hardware Hero */}
          <div className="mt-1 flex flex-col items-center text-center">
            <div className="flex h-[48px] items-center justify-center">
              <SProductImage
                name={productSlug}
                size={72}
                className="max-h-[46px] max-w-[80px] object-contain"
              />
            </div>

            <div className="mt-2.5 flex max-w-full items-center justify-center gap-1.5">
              {isRenaming ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    size="small"
                    aria-label="New device name"
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onPressEnter={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    className="w-[210px]"
                    autoFocus
                  />
                  <SButton size="small" variant="primary" onClick={commitRename}>
                    Save
                  </SButton>
                </div>
              ) : (
                <>
                  <h2 className="m-0 truncate text-[18px] leading-6 font-semibold text-[var(--omada-text-primary)]">
                    {activeDeviceDisplayName}
                  </h2>
                  <button
                    type="button"
                    aria-label="Rename device"
                    onClick={startRename}
                    className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-[var(--omada-brand-bg-subtlest)]"
                  >
                    <SIcon name="edit" size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="mt-1 flex items-center justify-center gap-2 text-[13px] leading-5">
              <span className={`font-medium ${getStatusAccentClass(activeDevice.status)}`}>
                {formattedStatus}
              </span>
              <span
                className="h-3 w-px bg-[var(--omada-border-strong)] opacity-60"
                aria-hidden="true"
              />
              <span className="tabular-nums text-[var(--omada-text-secondary)]">
                {activeDevice.uptime}
              </span>
            </div>
          </div>

          {/* Mini Port Strip */}
          <div className="mt-5">
            <SDevicePortGraphic
              mode="compact"
              ports={mergedPorts}
              usedPorts={usedCount}
              totalPorts={totalCount}
              onSelectPort={(p) => {
                setSelectedPortNumber(p.port);
                setTab('ports');
                setMode('expanded');
              }}
            />
          </div>

          {/* Primary Action Row */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab('ports');
                setMode('expanded');
              }}
              className="omada-device-drawer-outline-btn h-[36px] flex-1 cursor-pointer text-[14px] font-medium"
            >
              Manage Device
            </button>

            <Tooltip title="Device Tools">
              <button
                type="button"
                aria-label="Device tools"
                onClick={() => {
                  setTab('tools');
                  setMode('expanded');
                }}
                className="omada-device-drawer-icon-btn inline-flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center"
              >
                <SIcon name="sidebar-icon-icon-tools-off" size={17} />
              </button>
            </Tooltip>

            <Dropdown
              menu={{
                items: actionMenuItems,
                onClick: ({ key }) => handleDeviceAction(String(key)),
              }}
              trigger={['click']}
              placement="bottomRight"
              destroyOnHidden
            >
              <button
                type="button"
                aria-label="More device actions"
                className="omada-device-drawer-icon-btn inline-flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center"
              >
                <SIcon name="more-3" size={16} />
              </button>
            </Dropdown>
          </div>

          {/* Stacked Cards */}
          <div className="mt-4 flex flex-col gap-3">
            {/* 1. Device 24h health */}
            <section className="omada-device-drawer-card p-4">
              <h3 className="m-0 mb-3 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                Device 24h health
              </h3>
              <div
                className="flex h-[8px] items-center gap-[1.5px]"
                role="img"
                aria-label="Device 24h health timeline"
              >
                {healthTicks.map((tier, idx) => (
                  <span
                    key={idx}
                    title={`Interval ${idx + 1}: ${
                      tier === 'good'
                        ? 'Good'
                        : tier === 'warn'
                          ? 'Fair'
                          : tier === 'minor'
                            ? 'Warning'
                            : 'Poor'
                    }`}
                    className={`omada-health-tick omada-health-tick--${tier}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] tabular-nums text-[var(--omada-text-tertiary)]">
                <span>03:25 pm</span>
                <span>03:25 pm</span>
              </div>
            </section>

            {/* 2. Metrics strip */}
            <section className="omada-device-drawer-card p-4">
              <div className="grid grid-cols-[1.55fr_0.72fr_0.78fr] gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[12px] whitespace-nowrap text-[var(--omada-text-secondary)]">
                    <Zap
                      size={13}
                      className="shrink-0 text-[var(--omada-brand-text)]"
                      aria-hidden="true"
                    />
                    <span className="truncate">PoE Power Used</span>
                  </div>
                  <div className="mt-1.5 text-[14px] font-medium whitespace-nowrap tabular-nums text-[var(--omada-text-primary)]">
                    {hasPoeBudget
                      ? `${(activeDevice.poeUsedW ?? 0).toFixed(2)}W / ${(activeDevice.poeTotalW ?? 0).toFixed(2)}W`
                      : '--'}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[12px] whitespace-nowrap text-[var(--omada-text-secondary)]">
                    <SIcon name="device-page-icon-property-1-cpu" size={14} />
                    <span>CPU</span>
                  </div>
                  <div className="mt-1.5 text-[14px] font-medium tabular-nums text-[var(--omada-text-primary)]">
                    {activeDevice.cpu}%
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[12px] whitespace-nowrap text-[var(--omada-text-secondary)]">
                    <SIcon name="device-page-icon-property-1-memory" size={14} />
                    <span>Memory</span>
                  </div>
                  <div className="mt-1.5 text-[14px] font-medium tabular-nums text-[var(--omada-text-primary)]">
                    {activeDevice.memory}%
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Connection */}
            <section className="omada-device-drawer-card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="m-0 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                  Connection
                </h3>
                <div
                  role="tablist"
                  aria-label="Connection view"
                  className="inline-flex rounded-[4px] bg-[var(--omada-bg-field)] p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={connectionView === 'device'}
                    onClick={() => setConnectionView('device')}
                    className={`h-[24px] cursor-pointer rounded-[3px] px-2.5 text-[12px] transition-colors ${
                      connectionView === 'device'
                        ? 'bg-[var(--omada-bg-surface)] font-medium text-[var(--omada-brand-text)] shadow-2xs'
                        : 'text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                    }`}
                  >
                    Device
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={connectionView === 'client'}
                    onClick={() => setConnectionView('client')}
                    className={`h-[24px] cursor-pointer rounded-[3px] px-2.5 text-[12px] transition-colors ${
                      connectionView === 'client'
                        ? 'bg-[var(--omada-bg-surface)] font-medium text-[var(--omada-brand-text)] shadow-2xs'
                        : 'text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                    }`}
                  >
                    Client
                  </button>
                </div>
              </div>

              {connectionView === 'device' ? (
                <div className="space-y-1">
                  <div className="omada-device-drawer-card-subtle flex items-center justify-between rounded-[4px] px-3 py-1.5 text-[12px] font-medium text-[var(--omada-text-primary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <SIcon
                        name="icon-25947-12337"
                        size={14}
                        className="text-[var(--omada-link)]"
                      />
                      <span>Uplink Device</span>
                    </span>
                    <span>Port</span>
                  </div>

                  {activeDevice.uplink ? (
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <SProductImage
                          name={resolvePeerProductSlug(activeDevice.uplink.name, 'gateway')}
                          size={24}
                          className="h-[22px] w-[28px] shrink-0 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleOpenLinkedDevice(activeDevice.uplink!.name)}
                          className="cursor-pointer truncate text-left text-[13px] text-[var(--omada-link)] hover:underline"
                        >
                          {activeDevice.uplink.name}
                        </button>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <PortBadgeTile
                          port={{
                            port: activeDevice.uplink.port,
                            name: `Port${activeDevice.uplink.port}`,
                            linkStatus: '1000m',
                            isUplink: true,
                          }}
                          size={20}
                        />
                        <span className="w-4 text-right text-[13px] tabular-nums text-[var(--omada-text-primary)]">
                          {activeDevice.uplink.port}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-[12px] text-[var(--omada-text-tertiary)]">
                      No uplink device
                    </div>
                  )}

                  <div className="omada-device-drawer-card-subtle mt-1 flex items-center justify-between rounded-[4px] px-3 py-1.5 text-[12px] font-medium text-[var(--omada-text-primary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <SIcon
                        name="icon-25947-12331"
                        size={14}
                        className="text-[var(--omada-color-magenta)]"
                      />
                      <span>Downlink Device</span>
                    </span>
                    <span>Port</span>
                  </div>

                  {downlinkItems.length > 0 ? (
                    <div className="divide-y divide-[var(--omada-border-divider)]">
                      {downlinkItems.map((dl) => {
                        const slug = resolvePeerProductSlug(
                          dl.name,
                          dl.name.toLowerCase().includes('switch') ? 'switch' : 'ap',
                        );
                        return (
                          <div
                            key={`${dl.name}-${dl.port}`}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <SProductImage
                                name={slug}
                                size={24}
                                className="h-[22px] w-[28px] shrink-0 object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenLinkedDevice(dl.name)}
                                className="cursor-pointer truncate text-left text-[13px] text-[var(--omada-link)] hover:underline"
                              >
                                {dl.name}
                              </button>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <PortBadgeTile
                                port={{
                                  port: dl.port,
                                  name: `Port${dl.port}`,
                                  linkStatus: '1000m',
                                  isPoe: hasPoeBudget,
                                }}
                                size={20}
                              />
                              <span className="w-4 text-right text-[13px] tabular-nums text-[var(--omada-text-primary)]">
                                {dl.port}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-[12px] text-[var(--omada-text-tertiary)]">
                      No downlink devices
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="omada-device-drawer-card-subtle flex items-center justify-between rounded-[4px] px-3 py-1.5 text-[12px] font-medium text-[var(--omada-text-primary)]">
                    <span>Connected Client</span>
                    <span>Port / SSID</span>
                  </div>
                  {(
                    [
                      { name: 'Test_PC', icon: 'computer', detail: 'Port 1' },
                      { name: 'StarLight', icon: 'macbook', detail: 'Corp-5G' },
                    ] as Array<{ name: string; icon: OmadaClientIconName; detail: string }>
                  ).map((client) => (
                    <div
                      key={client.name}
                      className="flex items-center justify-between px-3 py-1.5 text-[13px]"
                    >
                      <span className="inline-flex items-center gap-2 text-[var(--omada-text-primary)]">
                        <SClientIcon name={client.icon} size={20} />
                        <span>{client.name}</span>
                      </span>
                      <span className="text-[12px] text-[var(--omada-text-secondary)]">
                        {client.detail}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Info */}
            <section className="omada-device-drawer-card p-4">
              <h3 className="m-0 mb-2 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                Info
              </h3>
              <dl className="m-0 divide-y divide-[var(--omada-border-divider)]">
                {[
                  { label: 'Model', value: activeDevice.model },
                  { label: 'Serial Number', value: activeDevice.serialNumber },
                  { label: 'MAC Address', value: activeDevice.mac },
                  { label: 'IP Address', value: activeDevice.ipv4 },
                  {
                    label: 'Controller Connection IP',
                    value: activeDevice.controllerIp ?? '192.168.0.10',
                  },
                  { label: 'Customer', value: activeDevice.customer },
                  { label: 'Firmware Version', value: activeDevice.firmwareVersion },
                  { label: 'Uptime', value: activeDevice.uptime },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 py-2 text-[13px] leading-5"
                  >
                    <dt className="shrink-0 text-[var(--omada-text-secondary)]">{row.label}</dt>
                    <dd className="m-0 text-right font-medium break-all tabular-nums text-[var(--omada-text-primary)]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      ) : (
        /* Stage 2: Expanded Manage Device Drawer */
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Top Multi-Device Tab Strip */}
          <div className="flex h-[52px] shrink-0 items-center gap-2 overflow-x-auto border-b border-[var(--omada-border-divider)] px-5">
            <Tooltip title="Collapse to Quick Drawer">
              <button
                type="button"
                aria-label="Collapse to quick drawer"
                onClick={() => setMode('quick')}
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <SIcon
                  name="icon-icon-tabler-icon-layout-sidebar-right-expand"
                  size={18}
                />
              </button>
            </Tooltip>

            <Tooltip title="Close">
              <button
                type="button"
                aria-label="Close drawer"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <SIcon name="close" size={16} />
              </button>
            </Tooltip>

            <div className="flex items-center gap-2" role="tablist" aria-label="Open device tabs">
              {resolvedTabs.map((tabDev) => {
                const isActive = tabDev.key === activeDevice.key;
                const tabName = renamedNames[tabDev.key] ?? tabDev.name;
                return (
                  <button
                    key={tabDev.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSwitchDeviceTab(tabDev)}
                    className={`omada-device-drawer-tab ${
                      isActive
                        ? 'omada-device-drawer-tab--active'
                        : 'omada-device-drawer-tab--inactive'
                    }`}
                  >
                    <SProductImage
                      name={resolveDeviceProductSlug(tabDev)}
                      size={22}
                      className="h-[20px] w-[26px] shrink-0 object-contain"
                    />
                    <span>{tabName}</span>
                  </button>
                );
              })}

              <Dropdown
                menu={{ items: addTabMenuItems }}
                trigger={['click']}
                placement="bottomLeft"
                destroyOnHidden
              >
                <button
                  type="button"
                  aria-label="Open another device tab"
                  className="inline-flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] bg-[var(--omada-bg-field)] text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </Dropdown>
            </div>
          </div>

          {/* Scrollable Expanded Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Identity Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-4 pb-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <SProductImage
                  name={productSlug}
                  size={52}
                  className="h-[36px] w-[54px] shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isRenaming ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          size="small"
                          aria-label="New device name"
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onPressEnter={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsRenaming(false);
                          }}
                          className="w-[220px]"
                          autoFocus
                        />
                        <SButton size="small" variant="primary" onClick={commitRename}>
                          Save
                        </SButton>
                      </div>
                    ) : (
                      <>
                        <h2 className="m-0 truncate text-[18px] leading-6 font-semibold text-[var(--omada-text-primary)]">
                          {activeDeviceDisplayName}
                        </h2>
                        <button
                          type="button"
                          aria-label="Rename device"
                          onClick={startRename}
                          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[var(--omada-brand-bg-subtlest)]"
                        >
                          <SIcon name="edit" size={16} />
                        </button>
                      </>
                    )}
                    <span className="inline-flex h-[22px] items-center rounded-[3px] bg-[var(--omada-color-success-bg)] px-2 text-[12px] font-medium text-[var(--omada-brand-hover)]">
                      {formattedStatus}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--omada-text-secondary)]">
                    <span>{activeDevice.model}</span>
                    <span className="opacity-45" aria-hidden="true">
                      |
                    </span>
                    <span className="tabular-nums">{activeDevice.mac}</span>
                    <span className="opacity-45" aria-hidden="true">
                      |
                    </span>
                    <span className="tabular-nums">{activeDevice.ipv4}</span>
                    <button
                      type="button"
                      onClick={() => setTab('overview')}
                      className="cursor-pointer font-medium text-[var(--omada-link)] hover:underline"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>

              <Dropdown
                menu={{
                  items: actionMenuItems,
                  onClick: ({ key }) => handleDeviceAction(String(key)),
                }}
                trigger={['click']}
                placement="bottomRight"
                destroyOnHidden
              >
                <button
                  type="button"
                  className="inline-flex h-[32px] cursor-pointer items-center gap-2 rounded-[4px] bg-[var(--omada-bg-field)] px-3.5 text-[13px] font-medium text-[var(--omada-text-primary)] transition-colors hover:bg-[var(--omada-bg-field-hover)]"
                >
                  <span>Action</span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              </Dropdown>
            </div>

            {/* Underline Navigation Tabs */}
            <nav
              aria-label="Device management sections"
              className="flex items-center gap-8 overflow-x-auto border-b border-[var(--omada-border-divider)] px-6"
            >
              {EXPANDED_NAV_TABS.map((nav) => {
                const isActive = currentTab === nav.key;
                return (
                  <button
                    key={nav.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(nav.key)}
                    className={`omada-device-drawer-nav-btn ${
                      isActive ? 'omada-device-drawer-nav-btn--active' : ''
                    }`}
                  >
                    {nav.label}
                  </button>
                );
              })}
            </nav>

            {/* Tab Views */}
            <div className="px-6 py-4">
              {currentTab === 'ports' && (
                <div>
                  {/* Top-left filter dropdown */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <SSelect
                      id="omada-port-filter-select"
                      aria-label="Port filter"
                      value={portFilter}
                      onChange={(val) => setPortFilter(String(val))}
                      variant="filled"
                      className="omada-drawer-filter-select w-[176px]"
                      options={[
                        { label: 'All ports', value: 'all' },
                        { label: 'Connected ports', value: 'connected' },
                        { label: 'PoE ports', value: 'poe' },
                        { label: 'SFP ports', value: 'sfp' },
                        { label: 'Uplink ports', value: 'uplink' },
                        { label: 'Disconnected ports', value: 'disconnected' },
                      ]}
                    />

                    {selectedPortNumber !== null && (
                      <button
                        type="button"
                        onClick={() => setSelectedPortNumber(null)}
                        className="cursor-pointer text-[12px] text-[var(--omada-link)] hover:underline"
                      >
                        Showing Port {selectedPortNumber} only · Clear selection
                      </button>
                    )}
                  </div>

                  {/* Full Port Graphic + Connected Device Thumbnails + 10-item Legend */}
                  <div className="py-2">
                    <SDevicePortGraphic
                      mode="full"
                      showConnectedDevices
                      showLegend
                      ports={mergedPorts}
                      selectedPort={selectedPortNumber}
                      onSelectPort={(p) =>
                        setSelectedPortNumber((prev) => (prev === p.port ? null : p.port))
                      }
                    />
                  </div>

                  {/* Sub-toolbar */}
                  <div className="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div
                      role="tablist"
                      aria-label="Port data mode"
                      className="inline-flex items-center rounded-[4px] bg-[var(--omada-bg-field)] p-1"
                    >
                      {(
                        [
                          { key: 'config', label: 'Config' },
                          { key: 'statistics', label: 'Statistics' },
                          { key: 'ddm', label: 'DDM' },
                        ] as const
                      ).map((sub) => {
                        const isActive = portSubTab === sub.key;
                        return (
                          <button
                            key={sub.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setPortSubTab(sub.key)}
                            className={`h-[26px] cursor-pointer rounded-[3px] px-3.5 text-[13px] transition-colors ${
                              isActive
                                ? 'bg-[var(--omada-bg-surface)] font-medium text-[var(--omada-brand-text)] shadow-2xs'
                                : 'text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowInlineFilter((prev) => !prev)}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[var(--omada-brand-text)] hover:opacity-80"
                      >
                        <SIcon name="filter" size={16} />
                        <span>Filter</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          message.info(
                            selectedRowKeys.length > 0
                              ? `Port Manager: editing ${selectedRowKeys.length} selected port(s)`
                              : 'Port Manager: select ports to configure batch profiles or PoE',
                          )
                        }
                        className="inline-flex cursor-pointer items-center gap-0.5 text-[13px] font-medium text-[var(--omada-link)] hover:underline"
                      >
                        <span>Port Manager</span>
                        <ChevronRight size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {showInlineFilter && (
                    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[6px] bg-[var(--omada-bg-field)] px-3 py-2">
                      <Input
                        size="small"
                        allowClear
                        prefix={<Search size={13} className="text-[var(--omada-text-tertiary)]" />}
                        placeholder="Search port name or connected device..."
                        value={portSearchQuery}
                        onChange={(e) => setPortSearchQuery(e.target.value)}
                        className="w-[260px]"
                      />
                      {(portFilter !== 'all' ||
                        selectedPortNumber !== null ||
                        portSearchQuery !== '') && (
                        <button
                          type="button"
                          onClick={() => {
                            setPortFilter('all');
                            setSelectedPortNumber(null);
                            setPortSearchQuery('');
                          }}
                          className="cursor-pointer text-xs text-[var(--omada-link)] hover:underline"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  )}

                  {/* 10-Row Port Table */}
                  <div className="omada-drawer-table-wrap">
                    <Table<DrawerPortItem>
                      className="omada-drawer-table"
                      rowKey="port"
                      size="middle"
                      pagination={false}
                      dataSource={filteredPorts}
                      columns={activePortColumns}
                      scroll={{ x: 1360 }}
                      rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                      }}
                      rowClassName={(record) =>
                        selectedPortNumber === record.port ? 'omada-port-row-selected' : ''
                      }
                    />
                  </div>
                </div>
              )}

              {currentTab === 'overview' && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <section className="omada-device-drawer-card p-5">
                    <h3 className="m-0 mb-3 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                      Hardware &amp; Runtime Metrics
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-[var(--omada-text-secondary)]">
                          PoE Power Used
                        </div>
                        <div className="mt-1 text-base font-semibold tabular-nums text-[var(--omada-text-primary)]">
                          {hasPoeBudget
                            ? `${(activeDevice.poeUsedW ?? 0).toFixed(2)}W / ${(activeDevice.poeTotalW ?? 0).toFixed(2)}W`
                            : '--'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--omada-text-secondary)]">CPU Usage</div>
                        <div className="mt-1 text-base font-semibold tabular-nums text-[var(--omada-text-primary)]">
                          {activeDevice.cpu}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--omada-text-secondary)]">
                          Memory Usage
                        </div>
                        <div className="mt-1 text-base font-semibold tabular-nums text-[var(--omada-text-primary)]">
                          {activeDevice.memory}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                        24h Device Health
                      </div>
                      <div className="flex h-[8px] items-center gap-[1.5px]">
                        {healthTicks.map((tier, idx) => (
                          <span
                            key={idx}
                            className={`omada-health-tick omada-health-tick--${tier}`}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="omada-device-drawer-card p-5">
                    <h3 className="m-0 mb-3 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                      Device Details
                    </h3>
                    <dl className="m-0 divide-y divide-[var(--omada-border-divider)]">
                      {[
                        { label: 'Model', value: activeDevice.model },
                        { label: 'Serial Number', value: activeDevice.serialNumber },
                        { label: 'MAC Address', value: activeDevice.mac },
                        { label: 'IP Address', value: activeDevice.ipv4 },
                        {
                          label: 'Controller IP',
                          value: activeDevice.controllerIp ?? '192.168.0.10',
                        },
                        { label: 'Firmware Version', value: activeDevice.firmwareFull },
                        { label: 'Customer', value: activeDevice.customer },
                        { label: 'Uptime', value: activeDevice.uptime },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-4 py-2 text-[13px]"
                        >
                          <dt className="text-[var(--omada-text-secondary)]">{row.label}</dt>
                          <dd className="m-0 font-medium tabular-nums text-[var(--omada-text-primary)]">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                </div>
              )}

              {currentTab === 'config' && (
                <div className="max-w-[760px] space-y-4">
                  <section className="omada-device-drawer-card p-5">
                    <h3 className="m-0 mb-4 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                      General Configuration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[13px] text-[var(--omada-text-secondary)]">
                          Device Name
                        </span>
                        <Input
                          value={activeDeviceDisplayName}
                          onChange={(e) =>
                            setRenamedNames((prev) => ({
                              ...prev,
                              [activeDevice.key]: e.target.value,
                            }))
                          }
                          variant="filled"
                          className="w-[320px]"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[13px] text-[var(--omada-text-secondary)]">
                          Management VLAN
                        </span>
                        <SSelect
                          value={configState.managementVlan}
                          onChange={(val) =>
                            setConfigState((prev) => ({
                              ...prev,
                              managementVlan: String(val),
                            }))
                          }
                          className="w-[320px]"
                          options={[
                            { label: 'Default(1)', value: 'Default(1)' },
                            { label: 'Management(10)', value: 'Management(10)' },
                            { label: 'Staff(20)', value: 'Staff(20)' },
                          ]}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[13px] font-medium text-[var(--omada-text-primary)]">
                            LED Control
                          </div>
                          <div className="text-xs text-[var(--omada-text-tertiary)]">
                            Enable front-panel port and status LEDs
                          </div>
                        </div>
                        <Switch
                          checked={configState.ledEnabled}
                          onChange={(checked) =>
                            setConfigState((prev) => ({ ...prev, ledEnabled: checked }))
                          }
                        />
                      </div>
                    </div>
                  </section>

                  <section className="omada-device-drawer-card p-5">
                    <h3 className="m-0 mb-4 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                      Switching Services
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'lldpEnabled' as const,
                          title: 'LLDP',
                          desc: 'Advertise link layer topology neighbors to Omada Controller',
                        },
                        {
                          key: 'stpEnabled' as const,
                          title: 'Spanning Tree (RSTP)',
                          desc: 'Prevent switching loops across redundant uplinks',
                        },
                        {
                          key: 'flowControlEnabled' as const,
                          title: '802.3x Flow Control',
                          desc: 'Pause frames during transient port buffer congestion',
                        },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-[13px] font-medium text-[var(--omada-text-primary)]">
                              {item.title}
                            </div>
                            <div className="text-xs text-[var(--omada-text-tertiary)]">
                              {item.desc}
                            </div>
                          </div>
                          <Switch
                            checked={configState[item.key]}
                            onChange={(checked) =>
                              setConfigState((prev) => ({ ...prev, [item.key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex justify-end gap-2.5 border-t border-[var(--omada-border-divider)] pt-4">
                      <SButton
                        variant="secondary"
                        onClick={() =>
                          setConfigState({
                            ledEnabled: true,
                            lldpEnabled: true,
                            stpEnabled: true,
                            flowControlEnabled: false,
                            managementVlan: 'Default(1)',
                          })
                        }
                      >
                        Reset
                      </SButton>
                      <SButton
                        variant="primary"
                        onClick={() =>
                          message.success(`Saved configuration for ${activeDeviceDisplayName}`)
                        }
                      >
                        Apply
                      </SButton>
                    </div>
                  </section>
                </div>
              )}

              {currentTab === 'network-view' && (
                <section className="omada-device-drawer-card p-5">
                  <h3 className="m-0 mb-4 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                    Local Link Topology
                  </h3>
                  <div className="flex flex-col items-center gap-4 py-4">
                    {activeDevice.uplink && (
                      <>
                        <div className="flex items-center gap-3 rounded-lg border border-[var(--omada-border-divider)] px-4 py-2.5">
                          <SProductImage
                            name={resolvePeerProductSlug(activeDevice.uplink.name, 'gateway')}
                            size={32}
                          />
                          <div>
                            <div className="text-xs text-[var(--omada-text-secondary)]">
                              Uplink (Port {activeDevice.uplink.port})
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenLinkedDevice(activeDevice.uplink!.name)}
                              className="cursor-pointer text-sm font-medium text-[var(--omada-link)] hover:underline"
                            >
                              {activeDevice.uplink.name}
                            </button>
                          </div>
                        </div>
                        <div className="h-6 w-px bg-[var(--omada-border-strong)]" />
                      </>
                    )}

                    <div className="flex items-center gap-3 rounded-lg border border-[var(--omada-brand)] bg-[var(--omada-brand-bg-subtlest)] px-5 py-3">
                      <SProductImage name={productSlug} size={36} />
                      <div>
                        <div className="text-sm font-semibold text-[var(--omada-text-primary)]">
                          {activeDeviceDisplayName}
                        </div>
                        <div className="text-xs text-[var(--omada-text-secondary)]">
                          {activeDevice.model} · {activeDevice.ipv4}
                        </div>
                      </div>
                    </div>

                    {downlinkItems.length > 0 && (
                      <>
                        <div className="h-6 w-px bg-[var(--omada-border-strong)]" />
                        <div className="flex flex-wrap justify-center gap-3">
                          {downlinkItems.map((dl) => (
                            <div
                              key={`${dl.name}-${dl.port}`}
                              className="flex items-center gap-2.5 rounded-lg border border-[var(--omada-border-divider)] px-3.5 py-2"
                            >
                              <SProductImage
                                name={resolvePeerProductSlug(
                                  dl.name,
                                  dl.name.toLowerCase().includes('switch') ? 'switch' : 'ap',
                                )}
                                size={28}
                              />
                              <div>
                                <div className="text-xs text-[var(--omada-text-secondary)]">
                                  Port {dl.port}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenLinkedDevice(dl.name)}
                                  className="cursor-pointer text-xs font-medium text-[var(--omada-link)] hover:underline"
                                >
                                  {dl.name}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {currentTab === 'logs' && (
                <div className="omada-drawer-table-wrap">
                  <Table
                    className="omada-drawer-table"
                    size="middle"
                    pagination={false}
                    rowKey="id"
                    dataSource={[
                      {
                        id: '1',
                        time: 'Sep 19, 2025 05:04:12 pm',
                        level: 'Info',
                        content: `${activeDeviceDisplayName} Port2 (COOOffice_Eap_1) PoE power negotiated at 11.4W`,
                      },
                      {
                        id: '2',
                        time: 'Sep 19, 2025 04:41:08 pm',
                        level: 'Info',
                        content: `LLDP neighbor MainOffice_Gateway_2 discovered on Port1`,
                      },
                      {
                        id: '3',
                        time: 'Sep 18, 2025 05:28:00 pm',
                        level: 'Info',
                        content: `Device adopted and synchronized configuration with controller`,
                      },
                    ]}
                    columns={[
                      { title: 'Time', dataIndex: 'time', key: 'time', width: 220 },
                      { title: 'Level', dataIndex: 'level', key: 'level', width: 90 },
                      { title: 'Content', dataIndex: 'content', key: 'content' },
                    ]}
                  />
                </div>
              )}

              {currentTab === 'tools' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    [
                      {
                        key: 'terminal',
                        title: 'Device Terminal',
                        illustration: 'terminal',
                        desc: 'Launch an interactive SSH/CLI session directly on this device.',
                        btn: 'Open Terminal',
                        icon: <Terminal size={17} className="text-[var(--omada-brand-text)]" />,
                      },
                      {
                        key: 'cable',
                        title: 'Cable Test',
                        illustration: 'cable-test',
                        desc: 'Run TDR pair diagnostics on Ethernet ports to detect opens, shorts, or cable length.',
                        btn: 'Run Cable Test',
                        icon: (
                          <SIcon
                            name="cable-test-cable-test"
                            size={17}
                            className="text-[var(--omada-brand-text)]"
                          />
                        ),
                      },
                      {
                        key: 'network-check',
                        title: 'Network Check',
                        illustration: 'network-check',
                        desc: 'Execute Ping, Traceroute, or DNS lookup diagnostics from this device.',
                        btn: 'Run Network Check',
                        icon: (
                          <SIcon
                            name="network-check"
                            size={17}
                            className="text-[var(--omada-brand-text)]"
                          />
                        ),
                      },
                      {
                        key: 'packet-capture',
                        title: 'Packet Capture',
                        illustration: 'packet-capture',
                        desc: 'Capture live interface packets and download PCAP traces for analysis.',
                        btn: 'Start Capture',
                        icon: (
                          <SIcon
                            name="packet-capture"
                            size={17}
                            className="text-[var(--omada-brand-text)]"
                          />
                        ),
                      },
                      {
                        key: 'speed-test',
                        title: 'Speed Test',
                        illustration: 'speed-test',
                        desc: 'Measure real-time WAN and uplink throughput, jitter, and latency.',
                        btn: 'Run Speed Test',
                        icon: <Gauge size={17} className="text-[var(--omada-brand-text)]" />,
                      },
                      {
                        key: 'intellirecover',
                        title: 'IntelliRecover',
                        illustration: 'intellirecover',
                        desc: 'Configure automated device health monitoring and PoE self-healing rules.',
                        btn: 'Configure IntelliRecover',
                        icon: (
                          <SIcon
                            name="inteli-recover"
                            size={17}
                            className="text-[var(--omada-brand-text)]"
                          />
                        ),
                      },
                    ] satisfies Array<{
                      key: string;
                      title: string;
                      illustration: OmadaIllustrationName;
                      desc: string;
                      btn: string;
                      icon: React.ReactNode;
                    }>
                  ).map((tool) => (
                    <div
                      key={tool.key}
                      data-testid={`drawer-tool-card-${tool.key}`}
                      className="omada-device-drawer-card flex flex-col overflow-hidden"
                    >
                      <div className="flex h-[156px] items-center justify-center border-b border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)]/55 px-4 py-3">
                        <SIllustration
                          name={tool.illustration}
                          width={196}
                          alt={tool.title}
                          className="max-h-[132px] w-auto object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="inline-flex shrink-0 items-center justify-center leading-none">
                            {tool.icon}
                          </span>
                          <h4 className="m-0 text-sm font-semibold leading-5 text-[var(--omada-text-primary)]">
                            {tool.title}
                          </h4>
                        </div>
                        <p className="m-0 mb-4 flex-1 text-xs leading-5 text-[var(--omada-text-secondary)]">
                          {tool.desc}
                        </p>
                        <SButton
                          variant="outline"
                          onClick={() => message.info(`${tool.title} started on ${activeDeviceDisplayName}`)}
                        >
                          {tool.btn}
                        </SButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Port Configuration Modal */}
      <Modal
        open={Boolean(editingPort && portEditDraft)}
        title={editingPort ? `Edit ${editingPort.name}` : 'Edit Port'}
        onCancel={() => {
          setEditingPort(null);
          setPortEditDraft(null);
        }}
        onOk={savePortEdit}
        okText="Apply"
        destroyOnHidden
        width={440}
      >
        {portEditDraft && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]">
                Port Name
              </label>
              <Input
                value={portEditDraft.name}
                onChange={(e) =>
                  setPortEditDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                }
                variant="filled"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]">
                Profile
              </label>
              <SSelect
                value={portEditDraft.profile}
                onChange={(val) =>
                  setPortEditDraft((prev) =>
                    prev ? { ...prev, profile: String(val) } : prev,
                  )
                }
                className="w-full"
                options={[
                  { label: 'All', value: 'All' },
                  { label: 'Staff VLAN 20', value: 'Staff VLAN 20' },
                  { label: 'AP Trunk', value: 'AP Trunk' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]">
                  Type
                </label>
                <SSelect
                  value={portEditDraft.type}
                  onChange={(val) =>
                    setPortEditDraft((prev) =>
                      prev ? { ...prev, type: String(val) } : prev,
                    )
                  }
                  className="w-full"
                  options={[
                    { label: 'Trunk', value: 'Trunk' },
                    { label: 'Access', value: 'Access' },
                  ]}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]">
                  Native Network
                </label>
                <SSelect
                  value={portEditDraft.nativeNetwork}
                  onChange={(val) =>
                    setPortEditDraft((prev) =>
                      prev ? { ...prev, nativeNetwork: String(val) } : prev,
                    )
                  }
                  className="w-full"
                  options={[
                    { label: 'Default(1)', value: 'Default(1)' },
                    { label: 'Management(10)', value: 'Management(10)' },
                  ]}
                />
              </div>
            </div>

            {editingPort?.poeCapability && editingPort.poeCapability !== '--' && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
                  PoE Supply ({editingPort.poeCapability})
                </span>
                <Switch
                  checked={portEditDraft.poeEnabled}
                  onChange={(checked) =>
                    setPortEditDraft((prev) =>
                      prev ? { ...prev, poeEnabled: checked } : prev,
                    )
                  }
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </aside>
  );
};
