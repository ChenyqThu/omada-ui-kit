import React, { useMemo, useState } from 'react';
import { App, Checkbox, Dropdown, Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { ChevronDown, Plus } from 'lucide-react';
import {
  SButton,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SPagination,
  SProductImage,
  STabs,
  STag,
  useOmadaAgentAction,
} from '@/omada';
import {
  DEFAULT_DEVICE_HEALTH_SUMMARY_ITEMS,
  SDeviceHealthSummary,
} from '../../../omada/components/SDeviceHealthSummary';
import {
  EMULATOR_CONFIG_RESULTS,
  EMULATOR_DEVICE_GROUPS,
  EMULATOR_DEVICES,
  type EmulatorConfigResultRecord,
  type EmulatorDeviceGroupRecord,
  type EmulatorDeviceRecord,
} from './devicesData';

export interface DeviceListPageProps {
  /** Callback invoked when a user clicks a device table row. */
  onSelectDevice?: (device: EmulatorDeviceRecord) => void;
  /** Optional key of the currently inspected device for subtle row highlight. */
  selectedDeviceKey?: string | null;
  /** Optional device inventory override (defaults to the 9 Headquarters Building devices). */
  devices?: EmulatorDeviceRecord[];
}

type PageSubTabKey = 'device-list' | 'device-group' | 'config-result';
type TypeFilterKey = 'all' | 'gateway-switch' | 'olt' | 'ap';
type HealthFilterKey = 'all' | 'good' | 'fair' | 'poor' | 'no-data';
type StatusFilterKey = 'all' | EmulatorDeviceRecord['status'];

interface ColumnToggleConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  locked?: boolean;
}

const COLUMN_TOGGLE_ITEMS: ColumnToggleConfig[] = [
  { key: 'name', label: 'Device Name', defaultVisible: true, locked: true },
  { key: 'mac', label: 'MAC Address', defaultVisible: true },
  { key: 'ipv6', label: 'IPv6 Address', defaultVisible: true },
  { key: 'voipVlanIp', label: 'VoIP VLAN IP', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'health', label: 'Health', defaultVisible: true },
  { key: 'model', label: 'Model', defaultVisible: true },
  { key: 'version', label: 'Version', defaultVisible: true },
  { key: 'ipv4', label: 'IPv4 Address', defaultVisible: false },
  { key: 'uptime', label: 'Uptime', defaultVisible: false },
  { key: 'cpu', label: 'CPU', defaultVisible: false },
  { key: 'memory', label: 'Memory', defaultVisible: false },
];

const DEFAULT_VISIBLE_KEYS = COLUMN_TOGGLE_ITEMS.filter((c) => c.defaultVisible).map(
  (c) => c.key,
);

const HEALTH_DOT_COLOR: Record<EmulatorDeviceRecord['healthBucket'], string> = {
  good: 'var(--omada-brand-hover)',
  fair: 'var(--omada-color-warning)',
  poor: 'var(--omada-color-error)',
  'no-data': 'var(--omada-border-strong)',
};

const STATUS_LABEL_MAP: Record<EmulatorDeviceRecord['status'], string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  'heartbeat-missed': 'Heartbeat Missed',
  'adopt-failed': 'Adopt Failed',
  pending: 'Pending',
  provisioning: 'Provisioning',
  isolated: 'Isolated',
};

/**
 * Omada Controller v6.3.0.34 Devices Workspace (`#/devices`).
 * Replicates the Device List sub-tabs, 4-column health summary, live 2-row filter/action
 * toolbar, 2217px horizontally scrollable table with sticky right Actions & column selector,
 * and right-aligned pagination bar.
 */
export const DeviceListPage: React.FC<DeviceListPageProps> = ({
  onSelectDevice,
  selectedDeviceKey = null,
  devices: initialDevices = EMULATOR_DEVICES,
}) => {
  const { notification } = App.useApp();

  const [deviceList, setDeviceList] = useState<EmulatorDeviceRecord[]>(initialDevices);
  const [subTab, setSubTab] = useState<PageSubTabKey>('device-list');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilterKey>('all');
  const [healthFilter, setHealthFilter] = useState<HealthFilterKey>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(DEFAULT_VISIBLE_KEYS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDeviceMac, setNewDeviceMac] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');

  const typeCounts = useMemo(
    () => ({
      all: deviceList.length,
      gatewaySwitch: deviceList.filter(
        (d) => d.category === 'gateway' || d.category === 'switch',
      ).length,
      olt: deviceList.filter((d) => d.category === 'olt').length,
      ap: deviceList.filter((d) => d.category === 'ap').length,
    }),
    [deviceList],
  );

  const healthCounts = useMemo(
    () => ({
      all: deviceList.length,
      good: deviceList.filter((d) => d.healthBucket === 'good').length,
      fair: deviceList.filter((d) => d.healthBucket === 'fair').length,
      poor: deviceList.filter((d) => d.healthBucket === 'poor').length,
      noData: deviceList.filter((d) => d.healthBucket === 'no-data').length,
    }),
    [deviceList],
  );

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deviceList.filter((device) => {
      if (
        typeFilter === 'gateway-switch' &&
        device.category !== 'gateway' &&
        device.category !== 'switch'
      ) {
        return false;
      }
      if (typeFilter === 'olt' && device.category !== 'olt') {
        return false;
      }
      if (typeFilter === 'ap' && device.category !== 'ap') {
        return false;
      }
      if (healthFilter !== 'all' && device.healthBucket !== healthFilter) {
        return false;
      }
      if (statusFilter !== 'all' && device.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        device.name.toLowerCase().includes(q) ||
        device.serialNumber.toLowerCase().includes(q) ||
        device.mac.toLowerCase().includes(q) ||
        device.ipv4.toLowerCase().includes(q) ||
        device.model.toLowerCase().includes(q) ||
        (device.tag?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [deviceList, search, typeFilter, healthFilter, statusFilter]);

  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDevices.slice(start, start + pageSize);
  }, [filteredDevices, currentPage, pageSize]);

  const visibleKeySet = useMemo(() => new Set(visibleColumnKeys), [visibleColumnKeys]);

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const resetColumns = () => {
    setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS);
  };

  const handleExport = () => {
    notification.success({
      title: 'Device Inventory Exported',
      description: `Exported ${filteredDevices.length} device record(s) to devices-list.csv.`,
    });
  };

  const batchMenuItems: MenuProps['items'] = [
    { key: 'reboot', label: 'Reboot Selected' },
    { key: 'upgrade', label: 'Upgrade Firmware' },
    { key: 'site-config', label: 'Site Config' },
  ];

  const handleBatchAction: MenuProps['onClick'] = ({ key }) => {
    const labels: Record<string, string> = {
      reboot: 'Reboot command queued for visible site devices.',
      upgrade: 'Checking firmware upgrade eligibility across 9 devices...',
      'site-config': 'Site configuration profile applied to managed devices.',
    };
    notification.info({
      title: 'Batch Action',
      description: labels[key] ?? 'Batch operation started.',
    });
  };

  const handleLocate = (e: React.MouseEvent, device: EmulatorDeviceRecord) => {
    e.stopPropagation();
    notification.info({
      title: 'Locating Device',
      description: `LED locator blinking on ${device.name} (${device.mac}).`,
    });
  };

  const handleReboot = (e: React.MouseEvent, device: EmulatorDeviceRecord) => {
    e.stopPropagation();
    notification.warning({
      title: 'Reboot Scheduled',
      description: `Reboot command sent to ${device.name}.`,
    });
  };

  const handleTerminal = (e: React.MouseEvent, device: EmulatorDeviceRecord) => {
    e.stopPropagation();
    notification.info({
      title: 'CLI Terminal',
      description: `Opening SSH terminal session to ${device.name} (${device.ipv4})...`,
    });
  };

  const handleAddDeviceSubmit = () => {
    const trimmedName = newDeviceName.trim() || `Office_AP_${deviceList.length + 1}`;
    const trimmedMac = newDeviceMac.trim().toUpperCase() || '00-FF-00-4C-88-12';
    const nextDevice: EmulatorDeviceRecord = {
      key: `custom-${Date.now()}`,
      name: trimmedName,
      model: 'EAP650 v1.0',
      productSlug: 'eap650',
      category: 'ap',
      status: 'connected',
      healthBucket: 'good',
      healthScore: 10,
      healthLabel: 'Good - 10',
      mac: trimmedMac,
      ipv4: `192.168.0.${130 + deviceList.length}`,
      ipv6: '-',
      voipVlanIp: '-',
      controllerIp: '192.168.0.10',
      serialNumber: `225109900${100 + deviceList.length}`,
      customer: 'Headquarters Building',
      firmwareVersion: '1.0.8',
      firmwareFull: '1.0.8 Build 20250705 Rel.41022',
      uptime: '0h 02m 14s',
      cpu: 9,
      memory: 34,
      usedPorts: 1,
      totalPorts: 1,
    };
    setDeviceList((prev) => [...prev, nextDevice]);
    setAddModalOpen(false);
    setNewDeviceName('');
    setNewDeviceMac('');
    notification.success({
      title: 'Device Adopted',
      description: `${trimmedName} (${trimmedMac}) added to Headquarters Building.`,
    });
  };

  useOmadaAgentAction({
    id: 'devices.openAddModal',
    label: 'Open Add Devices Modal',
    description: 'Opens the hardware discovery & adoption modal.',
    handler: () => {
      setAddModalOpen(true);
      return true;
    },
  });

  const statusFilterPopover = (
    <div className="w-[180px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Filter by Status
      </div>
      {(
        [
          { key: 'all', label: 'All Statuses' },
          { key: 'connected', label: 'Connected' },
          { key: 'disconnected', label: 'Disconnected' },
          { key: 'heartbeat-missed', label: 'Heartbeat Missed' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setStatusFilter(opt.key);
            setStatusPopoverOpen(false);
            setCurrentPage(1);
          }}
          className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
            statusFilter === opt.key
              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
          }`}
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );

  const columnSelectorPopover = (
    <div
      className="w-[210px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Customize Columns
        </span>
        <button
          type="button"
          onClick={resetColumns}
          className="cursor-pointer text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {COLUMN_TOGGLE_ITEMS.map((col) => {
          const checked = visibleKeySet.has(col.key);
          return (
            <label
              key={col.key}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors hover:bg-[var(--omada-bg-field)] ${
                col.locked ? 'cursor-not-allowed opacity-65' : 'cursor-pointer'
              }`}
            >
              <Checkbox
                checked={checked}
                disabled={col.locked}
                onChange={() => !col.locked && toggleColumnVisibility(col.key)}
              />
              <span className="truncate text-[var(--omada-text-primary)]">{col.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const columns: ColumnsType<EmulatorDeviceRecord> = useMemo(() => {
    const list: ColumnsType<EmulatorDeviceRecord> = [
      {
        title: '',
        key: 'thumbnail',
        width: 72,
        align: 'center',
        render: (_, record) => (
          <div className="flex items-center justify-center">
            <SProductImage
              name={record.productSlug}
              size={30}
              alt={record.model}
              className="shrink-0 object-contain"
            />
          </div>
        ),
      },
      {
        title: 'Device Name',
        dataIndex: 'name',
        key: 'name',
        width: 294,
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a.name.localeCompare(b.name),
        showSorterTooltip: false,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] text-[var(--omada-text-primary)]">
              {record.name}
            </span>
            {record.tag && (
              <span className="omada-devices-inline-tag">{record.tag}</span>
            )}
          </div>
        ),
      },
    ];

    if (visibleKeySet.has('mac')) {
      list.push({
        title: 'MAC Address',
        dataIndex: 'mac',
        key: 'mac',
        width: 200,
        sorter: (a, b) => a.mac.localeCompare(b.mac),
        showSorterTooltip: false,
        render: (mac: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {mac}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('ipv6')) {
      list.push({
        title: 'IPv6 Address',
        dataIndex: 'ipv6',
        key: 'ipv6',
        width: 286,
        render: (ipv6: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">{ipv6}</span>
        ),
      });
    }

    if (visibleKeySet.has('voipVlanIp')) {
      list.push({
        title: 'VoIP VLAN IP',
        dataIndex: 'voipVlanIp',
        key: 'voipVlanIp',
        width: 250,
        render: (ip: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">{ip}</span>
        ),
      });
    }

    if (visibleKeySet.has('status')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-2">
            <span>Status</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={statusPopoverOpen}
              onOpenChange={setStatusPopoverOpen}
              content={statusFilterPopover}
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter status"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="inline-flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-[var(--omada-bg-field)]"
              >
                <SIcon name="filter" size={14} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'status',
        key: 'status',
        width: 245,
        sorter: (a, b) => a.status.localeCompare(b.status),
        showSorterTooltip: false,
        render: (_, record) => (
          <span className="inline-flex items-center gap-2">
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{
                backgroundColor:
                  record.status === 'connected'
                    ? 'var(--omada-brand-hover)'
                    : record.status === 'heartbeat-missed'
                      ? 'var(--omada-color-warning)'
                      : 'var(--omada-border-strong)',
              }}
            />
            <span className="text-[14px] text-[var(--omada-text-primary)]">
              {STATUS_LABEL_MAP[record.status]}
            </span>
            {record.poeWarning && (
              <Tooltip title="Insufficient PoE power budget">
                <span className="inline-flex items-center">
                  <SIcon name="16-2" size={15} />
                </span>
              </Tooltip>
            )}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('health')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Health</span>
            <Tooltip title="Device health score evaluates CPU, memory, latency, and link quality (0-10)">
              <span
                className="inline-flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <SIcon name="info" size={15} />
              </span>
            </Tooltip>
          </span>
        ),
        dataIndex: 'healthLabel',
        key: 'health',
        width: 235,
        sorter: (a, b) => (a.healthScore ?? -1) - (b.healthScore ?? -1),
        showSorterTooltip: false,
        render: (_, record) => {
          if (record.healthLabel === '-') {
            return (
              <span className="text-[14px] text-[var(--omada-text-primary)]">-</span>
            );
          }
          return (
            <span className="inline-flex items-center gap-2">
              <span
                className="h-[7px] w-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: HEALTH_DOT_COLOR[record.healthBucket] }}
              />
              <span className="text-[14px] text-[var(--omada-text-primary)]">
                {record.healthLabel}
              </span>
            </span>
          );
        },
      });
    }

    if (visibleKeySet.has('model')) {
      list.push({
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
        width: 235,
        sorter: (a, b) => a.model.localeCompare(b.model),
        showSorterTooltip: false,
        render: (model: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">{model}</span>
        ),
      });
    }

    if (visibleKeySet.has('version')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-8">
            <span>Version</span>
            <Tooltip title="Check for Firmware Upgrades">
              <button
                type="button"
                aria-label="Check firmware upgrades"
                onClick={(e) => {
                  e.stopPropagation();
                  notification.info({
                    title: 'Firmware Check',
                    description: 'All 9 devices are running verified firmware releases.',
                  });
                }}
                className="inline-flex cursor-pointer items-center justify-center rounded-full"
              >
                <SIcon name="upgrade" size={16} />
              </button>
            </Tooltip>
          </span>
        ),
        dataIndex: 'firmwareVersion',
        key: 'version',
        width: 200,
        sorter: (a, b) => a.firmwareVersion.localeCompare(b.firmwareVersion),
        showSorterTooltip: false,
        render: (version: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {version}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('ipv4')) {
      list.push({
        title: 'IPv4 Address',
        dataIndex: 'ipv4',
        key: 'ipv4',
        width: 150,
        render: (ipv4: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {ipv4}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('uptime')) {
      list.push({
        title: 'Uptime',
        dataIndex: 'uptime',
        key: 'uptime',
        width: 150,
        render: (uptime: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {uptime}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('cpu')) {
      list.push({
        title: 'CPU',
        dataIndex: 'cpu',
        key: 'cpu',
        width: 100,
        render: (cpu: number) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {cpu}%
          </span>
        ),
      });
    }

    if (visibleKeySet.has('memory')) {
      list.push({
        title: 'Memory',
        dataIndex: 'memory',
        key: 'memory',
        width: 100,
        render: (memory: number) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {memory}%
          </span>
        ),
      });
    }

    list.push({
      title: (
        <div className="flex w-full items-center justify-between">
          <span>Action</span>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={columnSelectorPopover}
            styles={{ container: { padding: 12 } }}
          >
            <button
              type="button"
              aria-label="Column settings"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <SIcon name="more-3" size={16} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 200,
      fixed: 'end',
      render: (_, record) => {
        const showLocate = record.category === 'ap' || record.category === 'switch';
        const showTerminal = record.category === 'switch';
        return (
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {showLocate && (
              <Tooltip title="Locate">
                <button
                  type="button"
                  aria-label={`Locate ${record.name}`}
                  onClick={(e) => handleLocate(e, record)}
                  className="omada-devices-row-action-btn"
                >
                  <SIcon name="aim" size={16} />
                </button>
              </Tooltip>
            )}
            <Tooltip title="Reboot">
              <button
                type="button"
                aria-label={`Reboot ${record.name}`}
                onClick={(e) => handleReboot(e, record)}
                className="omada-devices-row-action-btn"
              >
                <SIcon name="reboot" size={16} />
              </button>
            </Tooltip>
            {showTerminal && (
              <Tooltip title="Terminal">
                <button
                  type="button"
                  aria-label={`Terminal ${record.name}`}
                  onClick={(e) => handleTerminal(e, record)}
                  className="omada-devices-row-action-btn"
                >
                  <SIcon name="running-config" size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    });

    return list;
  }, [visibleKeySet, statusPopoverOpen, statusFilter]);

  const totalScrollWidth = useMemo(
    () =>
      columns.reduce(
        (sum, col) => sum + (typeof col.width === 'number' ? col.width : 160),
        0,
      ),
    [columns],
  );

  const groupColumns: ColumnsType<EmulatorDeviceGroupRecord> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (name: string) => (
        <span className="font-medium text-[var(--omada-text-primary)]">{name}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 170,
      render: (type: string) => <STag color="green">{type}</STag>,
    },
    {
      title: 'Devices (Online / Total)',
      key: 'count',
      width: 180,
      render: (_, row) => (
        <span className="tabular-nums text-[var(--omada-text-primary)]">
          {row.onlineCount} / {row.deviceCount}
        </span>
      ),
    },
    { title: 'Site', dataIndex: 'site', key: 'site', width: 170 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const configResultColumns: ColumnsType<EmulatorConfigResultRecord> = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 210,
      render: (t: string) => (
        <span className="tabular-nums text-[var(--omada-text-secondary)]">{t}</span>
      ),
    },
    {
      title: 'Device Name',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 230,
      render: (name: string) => (
        <span className="font-medium text-[var(--omada-text-primary)]">{name}</span>
      ),
    },
    { title: 'MAC Address', dataIndex: 'mac', key: 'mac', width: 180 },
    { title: 'Configuration Item', dataIndex: 'configItem', key: 'configItem' },
    {
      title: 'Result',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ backgroundColor: 'var(--omada-brand-hover)' }}
          />
          <span>{status}</span>
        </span>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
  ];

  return (
    <div className="omada-devices-page px-6 pt-4 pb-6">
      {/* Top Sub-Tabs */}
      <STabs
        agentId="devices.subTabs"
        variant="page"
        size="lg"
        bordered
        aria-label="Devices views"
        activeKey={subTab}
        onChange={(k) => setSubTab(k as typeof subTab)}
        items={[
          { key: 'device-list', label: 'Device List' },
          { key: 'device-group', label: 'Device Group' },
          { key: 'config-result', label: 'Configuration Result' },
        ]}
      />

      {subTab === 'device-list' && (
        <>
          {/* 4-Column Health Summary Strip */}
          <div className="mt-4 mb-3">
            <SDeviceHealthSummary items={DEFAULT_DEVICE_HEALTH_SUMMARY_ITEMS} />
          </div>

          {/* 2-Row Filter & Action Toolbar */}
          <div className="space-y-3">
            {/* Row 1: Search + Type Segmented Tabs + Health Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <SInput
                agentId="devices.search"
                variant="filled"
                allowClear
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Name, SN, MAC, IPv4, Model or Label"
                aria-label="Search devices"
                suffix={
                  <SIcon
                    name="input-search"
                    size={14}
                    className="text-[var(--omada-text-tertiary)]"
                  />
                }
                className="omada-devices-search"
                style={{ width: 260 }}
              />

              <STabs
                agentId="devices.typeFilter"
                variant="filter"
                aria-label="Device category filter"
                activeKey={typeFilter}
                onChange={(k) => {
                  setTypeFilter(k as typeof typeFilter);
                  setCurrentPage(1);
                }}
                items={[
                  { key: 'all', label: 'All', count: typeCounts.all },
                  {
                    key: 'gateway-switch',
                    label: 'Gateway/Switches',
                    count: typeCounts.gatewaySwitch,
                  },
                  { key: 'olt', label: 'OLTs', count: typeCounts.olt },
                  { key: 'ap', label: 'APs', count: typeCounts.ap },
                ]}
              />

              <STabs
                agentId="devices.healthFilter"
                variant="filter"
                aria-label="Device health filter"
                activeKey={healthFilter}
                onChange={(k) => {
                  setHealthFilter(k as typeof healthFilter);
                  setCurrentPage(1);
                }}
                items={[
                  { key: 'all', label: 'All', count: healthCounts.all },
                  {
                    key: 'good',
                    label: 'Good',
                    count: healthCounts.good,
                    dotColor: HEALTH_DOT_COLOR.good,
                  },
                  {
                    key: 'fair',
                    label: 'Fair',
                    count: healthCounts.fair,
                    dotColor: HEALTH_DOT_COLOR.fair,
                  },
                  {
                    key: 'poor',
                    label: 'Poor',
                    count: healthCounts.poor,
                    dotColor: HEALTH_DOT_COLOR.poor,
                  },
                  {
                    key: 'no-data',
                    label: 'No Data',
                    count: healthCounts.noData,
                    dotColor: HEALTH_DOT_COLOR['no-data'],
                  },
                ]}
              />
            </div>

            {/* Row 2: Export + Batch Action + Add Devices */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleExport}
                className="omada-devices-ghost-action"
              >
                <SIcon name="export" size={15} />
                <span>Export</span>
              </button>

              <Dropdown
                menu={{ items: batchMenuItems, onClick: handleBatchAction }}
                trigger={['click']}
              >
                <button type="button" className="omada-devices-ghost-action">
                  <span>Batch Action</span>
                  <ChevronDown size={14} />
                </button>
              </Dropdown>

              <SButton
                variant="primary"
                icon={<Plus size={15} />}
                onClick={() => setAddModalOpen(true)}
                className="omada-devices-primary-btn"
              >
                Add Devices
              </SButton>
            </div>
          </div>

          {/* Horizontally Scrollable Table */}
          <div className="omada-devices-table-shell mt-3">
            <Table<EmulatorDeviceRecord>
              rowKey="key"
              columns={columns}
              dataSource={paginatedDevices}
              pagination={false}
              scroll={{ x: totalScrollWidth }}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No matching devices"
                    description="Adjust your search query or filters to inspect site devices."
                  />
                ),
              }}
              onRow={(record) => ({
                onClick: () => onSelectDevice?.(record),
                className:
                  record.key === selectedDeviceKey
                    ? 'omada-devices-row-selected'
                    : undefined,
              })}
              className="omada-devices-table"
            />
          </div>

          {/* Right-Aligned Pagination Bar */}
          {filteredDevices.length > 0 && (
            <div className="omada-devices-pagination mt-4">
              <SPagination
                align="right"
                current={currentPage}
                pageSize={pageSize}
                total={filteredDevices.length}
                showSizeChanger={{ variant: 'filled' }}
                pageSizeOptions={[10, 20, 50, 100]}
                locale={{ items_per_page: '/page' }}
                summaryRender={([start, end], total) =>
                  `Showing ${start}-${end} of ${total} records`
                }
                onChange={(nextPage, nextSize) => {
                  setCurrentPage(nextPage);
                  setPageSize(nextSize);
                }}
              />
            </div>
          )}
        </>
      )}

      {subTab === 'device-group' && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--omada-text-secondary)]">
              Organize site gateways, switches, and access points into management groups.
            </div>
            <SButton
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() =>
                notification.info({
                  title: 'Create Device Group',
                  description: 'New device group template is ready to configure.',
                })
              }
              className="omada-devices-primary-btn"
            >
              Create Group
            </SButton>
          </div>
          <div className="omada-devices-table-shell">
            <Table<EmulatorDeviceGroupRecord>
              rowKey="key"
              columns={groupColumns}
              dataSource={EMULATOR_DEVICE_GROUPS}
              pagination={false}
              className="omada-devices-table"
            />
          </div>
        </div>
      )}

      {subTab === 'config-result' && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-[var(--omada-text-secondary)]">
            Recent configuration push and provisioning audit log for Headquarters Building.
          </div>
          <div className="omada-devices-table-shell">
            <Table<EmulatorConfigResultRecord>
              rowKey="key"
              columns={configResultColumns}
              dataSource={EMULATOR_CONFIG_RESULTS}
              pagination={false}
              className="omada-devices-table"
            />
          </div>
        </div>
      )}

      {/* Add Devices Modal */}
      <SModal
        agentId="devices.addModal"
        open={addModalOpen}
        title="Add Devices"
        subtitle="Discover and adopt Omada hardware on Headquarters Building (192.168.0.0/24)."
        size="sm"
        okText="Adopt Device"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleAddDeviceSubmit}
        onCancel={() => setAddModalOpen(false)}
      >
        <div className="space-y-3 py-2">
          <div>
            <label
              htmlFor="omada-add-device-name"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Device Name
            </label>
            <SInput
              id="omada-add-device-name"
              agentId="devices.addForm.name"
              placeholder="e.g. Lobby_Eap_4"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="omada-add-device-mac"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              MAC Address
            </label>
            <SInput
              id="omada-add-device-mac"
              agentId="devices.addForm.mac"
              placeholder="e.g. 00-FF-00-4C-88-12"
              value={newDeviceMac}
              onChange={(e) => setNewDeviceMac(e.target.value)}
            />
          </div>
        </div>
      </SModal>
    </div>
  );
};
