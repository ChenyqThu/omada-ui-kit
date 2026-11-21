import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Dropdown, Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { Filter as FilterFunnel } from 'lucide-react';
import {
  SClientIcon,
  SEmpty,
  SIcon,
  SInput,
  SPagination,
  useOmadaNotification,
} from '@/omada';
import {
  SClientOverviewStrip,
  type ClientOverviewItem,
} from '../../../omada/components/SClientOverviewStrip';
import {
  EMULATOR_CLIENTS,
  type EmulatorClientAuthStatus,
  type EmulatorClientConnectionType,
  type EmulatorClientExperienceBucket,
  type EmulatorClientRecord,
} from './clientsData';

export interface ClientListPageProps {
  /** Callback invoked when a user clicks a client table row. */
  onSelectClient?: (client: EmulatorClientRecord) => void;
  /** Callback invoked when clicking an uplink device link in the `AP/Port` column. */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Optional key of the currently inspected client for subtle row highlight. */
  selectedClientKey?: string | null;
  /** Optional client inventory override (defaults to the 4 Main Office Floor clients). */
  clients?: EmulatorClientRecord[];
}

type ClientViewTabKey = 'online' | 'offline' | 'blocked' | 'all';
type ConnectionFilterKey = 'all' | EmulatorClientConnectionType;
type ExperienceFilterKey = 'all' | EmulatorClientExperienceBucket;
type StatusFilterKey = 'all' | EmulatorClientAuthStatus;

interface ColumnToggleConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  locked?: boolean;
}

const COLUMN_TOGGLE_ITEMS: ColumnToggleConfig[] = [
  { key: 'name', label: 'Name', defaultVisible: true, locked: true },
  { key: 'ipAddress', label: 'IP Address', defaultVisible: true },
  { key: 'authType', label: 'Authentication Type', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'experience', label: 'Experience', defaultVisible: true },
  { key: 'incidents', label: 'Incidents', defaultVisible: true },
  { key: 'ssid', label: 'SSID', defaultVisible: true },
  { key: 'network', label: 'Network', defaultVisible: true },
  { key: 'apOrPort', label: 'AP/Port', defaultVisible: true },
  { key: 'downloadTraffic', label: 'Download Traffic', defaultVisible: true },
  { key: 'uptime', label: 'Uptime', defaultVisible: true },
  { key: 'mac', label: 'MAC Address', defaultVisible: false },
  { key: 'vlan', label: 'VLAN', defaultVisible: false },
];

const DEFAULT_VISIBLE_KEYS = COLUMN_TOGGLE_ITEMS.filter((c) => c.defaultVisible).map(
  (c) => c.key,
);

const EXPERIENCE_DOT_COLOR: Record<EmulatorClientExperienceBucket, string> = {
  good: 'var(--omada-brand-hover)',
  fair: 'var(--omada-color-warning)',
  poor: 'var(--omada-color-error)',
  'no-data': 'var(--omada-border-strong)',
};

const STATUS_META: Record<
  EmulatorClientAuthStatus,
  { label: string; color: string }
> = {
  authorized: { label: 'Authorized', color: 'var(--omada-brand-hover)' },
  pending: { label: 'Pending', color: 'var(--omada-link)' },
  blocked: { label: 'Blocked', color: 'var(--omada-color-error)' },
};

const VIEW_TABS: Array<{ key: ClientViewTabKey; label: string }> = [
  { key: 'online', label: 'Online' },
  { key: 'offline', label: 'Offline' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'all', label: 'All' },
];

interface ColumnFilterOption {
  key: string;
  label: string;
}

interface FilterPopoverBodyProps {
  title: string;
  value: string;
  options: ColumnFilterOption[];
  onSelect: (nextValue: string) => void;
}

const FilterPopoverBody: React.FC<FilterPopoverBodyProps> = ({
  title,
  value,
  options,
  onSelect,
}) => (
  <div className="w-[180px] space-y-1">
    <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
      {title}
    </div>
    {options.map((opt) => (
      <button
        key={opt.key}
        type="button"
        onClick={() => onSelect(opt.key)}
        className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
          value === opt.key
            ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
            : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
        }`}
      >
        <span className="truncate">{opt.label}</span>
      </button>
    ))}
  </div>
);

/**
 * Omada Controller v6.3.0.34 Clients Workspace (`#/clients`).
 * Replicates top `Online | Offline | Blocked | All` underline tabs, right-aligned `Export`,
 * 4-column `<SClientOverviewStrip />`, 2-row live filter toolbar, 1792px horizontally
 * scrollable table with pinned left icon/Name and pinned right Actions + column selector,
 * and right-aligned pagination bar.
 */
export const ClientListPage: React.FC<ClientListPageProps> = ({
  onSelectClient,
  onOpenDeviceByName,
  selectedClientKey = null,
  clients: initialClients = EMULATOR_CLIENTS,
}) => {
  const notification = useOmadaNotification();

  const [clientList, setClientList] = useState<EmulatorClientRecord[]>(initialClients);
  useEffect(() => {
    setClientList(initialClients);
  }, [initialClients]);
  const [viewTab, setViewTab] = useState<ClientViewTabKey>('online');
  const [search, setSearch] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilterKey>('all');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilterKey>('all');
  const [overviewCategoryFilter, setOverviewCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [ssidFilter, setSsidFilter] = useState<string>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [apFilter, setApFilter] = useState<string>('all');

  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [ssidPopoverOpen, setSsidPopoverOpen] = useState(false);
  const [networkPopoverOpen, setNetworkPopoverOpen] = useState(false);
  const [apPopoverOpen, setApPopoverOpen] = useState(false);
  const [toolbarFilterOpen, setToolbarFilterOpen] = useState(false);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(DEFAULT_VISIBLE_KEYS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const viewScopedClients = useMemo(() => {
    if (viewTab === 'all') return clientList;
    return clientList.filter((c) => c.onlineState === viewTab);
  }, [clientList, viewTab]);

  const overviewItems: ClientOverviewItem[] = useMemo(() => {
    const onlinePool = clientList.filter((c) => c.onlineState === 'online');
    return [
      {
        key: 'online-clients',
        count: onlinePool.length,
        label: 'Online Clients',
        icon: 'group',
      },
      {
        key: 'mobile',
        count: onlinePool.filter((c) => c.clientCategory === 'mobile').length,
        label: 'Mobile',
        icon: 'iphone',
      },
      {
        key: 'others',
        count: onlinePool.filter((c) => c.clientCategory === 'others').length,
        label: 'Others',
        icon: 'other',
        forceLightIcon: true,
      },
      {
        key: 'office',
        count: onlinePool.filter((c) => c.clientCategory === 'office').length,
        label: 'Office',
        icon: 'office-pc',
      },
    ];
  }, [clientList]);

  const connectionCounts = useMemo(
    () => ({
      all: viewScopedClients.length,
      wireless: viewScopedClients.filter((c) => c.connectionType === 'wireless').length,
      wired: viewScopedClients.filter((c) => c.connectionType === 'wired').length,
      ipcNvr: viewScopedClients.filter((c) => c.connectionType === 'ipc-nvr').length,
    }),
    [viewScopedClients],
  );

  const experienceCounts = useMemo(
    () => ({
      all: viewScopedClients.length,
      good: viewScopedClients.filter((c) => c.experienceBucket === 'good').length,
      fair: viewScopedClients.filter((c) => c.experienceBucket === 'fair').length,
      poor: viewScopedClients.filter((c) => c.experienceBucket === 'poor').length,
      noData: viewScopedClients.filter((c) => c.experienceBucket === 'no-data').length,
    }),
    [viewScopedClients],
  );

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return viewScopedClients.filter((client) => {
      if (connectionFilter !== 'all' && client.connectionType !== connectionFilter) {
        return false;
      }
      if (experienceFilter !== 'all' && client.experienceBucket !== experienceFilter) {
        return false;
      }
      if (
        overviewCategoryFilter &&
        overviewCategoryFilter !== 'online-clients' &&
        client.clientCategory !== overviewCategoryFilter
      ) {
        return false;
      }
      if (statusFilter !== 'all' && client.status !== statusFilter) {
        return false;
      }
      if (ssidFilter !== 'all' && client.ssid !== ssidFilter) {
        return false;
      }
      if (networkFilter !== 'all' && client.network !== networkFilter) {
        return false;
      }
      if (apFilter !== 'all' && client.apOrPort !== apFilter) {
        return false;
      }
      if (!q) return true;
      return (
        client.name.toLowerCase().includes(q) ||
        client.ipAddress.toLowerCase().includes(q) ||
        client.mac.toLowerCase().includes(q) ||
        client.apOrPort.toLowerCase().includes(q) ||
        client.ssid.toLowerCase().includes(q)
      );
    });
  }, [
    viewScopedClients,
    search,
    connectionFilter,
    experienceFilter,
    overviewCategoryFilter,
    statusFilter,
    ssidFilter,
    networkFilter,
    apFilter,
  ]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  const visibleKeySet = useMemo(() => new Set(visibleColumnKeys), [visibleColumnKeys]);

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const resetColumns = () => {
    setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS);
  };

  const resetAllFilters = () => {
    setSearch('');
    setConnectionFilter('all');
    setExperienceFilter('all');
    setOverviewCategoryFilter(null);
    setStatusFilter('all');
    setSsidFilter('all');
    setNetworkFilter('all');
    setApFilter('all');
    setCurrentPage(1);
  };

  const handleOverviewItemClick = (key: string) => {
    if (key === 'online-clients') {
      setOverviewCategoryFilter(null);
    } else {
      setOverviewCategoryFilter((prev) => (prev === key ? null : key));
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    notification.success({
      title: 'Client List Exported',
      description: `Exported ${filteredClients.length} client record(s) to clients-list.csv.`,
    });
  };

  const batchMenuItems: MenuProps['items'] = [
    { key: 'authorize', label: 'Authorize Selected' },
    { key: 'reconnect', label: 'Reconnect Wireless Clients' },
    { key: 'rate-limit', label: 'Apply Rate Limit Profile' },
  ];

  const handleBatchAction: MenuProps['onClick'] = ({ key }) => {
    const messages: Record<string, string> = {
      authorize: 'Authorized pending clients across Main Office Floor.',
      reconnect: 'Sent 802.11v BSS transition reconnect to wireless clients.',
      'rate-limit': 'Default bandwidth policy verified for visible clients.',
    };
    if (key === 'authorize') {
      setClientList((prev) =>
        prev.map((item) =>
          item.status === 'pending'
            ? { ...item, status: 'authorized', authType: 'Administrator - admin' }
            : item,
        ),
      );
    }
    notification.info({
      title: 'Batch Config',
      description: messages[key] ?? 'Batch operation queued.',
    });
  };

  const handleToggleAuth = (
    e: React.MouseEvent,
    record: EmulatorClientRecord,
  ) => {
    e.stopPropagation();
    const nextStatus: EmulatorClientAuthStatus =
      record.status === 'authorized' ? 'pending' : 'authorized';
    setClientList((prev) =>
      prev.map((item) =>
        item.key === record.key ? { ...item, status: nextStatus } : item,
      ),
    );
    notification.success({
      title: nextStatus === 'authorized' ? 'Client Authorized' : 'Client Unauthorized',
      description: `${record.name} (${record.ipAddress}) is now ${nextStatus === 'authorized' ? 'Authorized' : 'Pending'}.`,
    });
  };

  const handleReconnect = (
    e: React.MouseEvent,
    record: EmulatorClientRecord,
  ) => {
    e.stopPropagation();
    notification.info({
      title: 'Reconnecting Client',
      description: `Sent wireless reconnect request to ${record.name} on ${record.apOrPort}.`,
    });
  };

  const handleBlockToggle = (
    e: React.MouseEvent,
    record: EmulatorClientRecord,
  ) => {
    e.stopPropagation();
    const isBlocked = record.onlineState === 'blocked';
    setClientList((prev) =>
      prev.map((item) =>
        item.key === record.key
          ? {
              ...item,
              onlineState: isBlocked ? 'online' : 'blocked',
              status: isBlocked ? 'authorized' : 'blocked',
            }
          : item,
      ),
    );
    notification.warning({
      title: isBlocked ? 'Client Unblocked' : 'Client Blocked',
      description: isBlocked
        ? `${record.name} restored to Online Clients.`
        : `${record.name} moved to Blocked Clients.`,
    });
  };

  const handleForget = (
    e: React.MouseEvent,
    record: EmulatorClientRecord,
  ) => {
    e.stopPropagation();
    setClientList((prev) => prev.filter((item) => item.key !== record.key));
    notification.warning({
      title: 'Client Forgotten',
      description: `Removed ${record.name} (${record.mac}) from known client history.`,
    });
  };

  const ssidOptions = useMemo(() => {
    const unique = Array.from(new Set(clientList.map((c) => c.ssid)));
    return [
      { key: 'all', label: 'All SSIDs' },
      ...unique.map((val) => ({ key: val, label: val })),
    ];
  }, [clientList]);

  const networkOptions = useMemo(() => {
    const unique = Array.from(new Set(clientList.map((c) => c.network)));
    return [
      { key: 'all', label: 'All Networks' },
      ...unique.map((val) => ({ key: val, label: val })),
    ];
  }, [clientList]);

  const apOptions = useMemo(() => {
    const unique = Array.from(new Set(clientList.map((c) => c.apOrPort)));
    return [
      { key: 'all', label: 'All APs / Gateways' },
      ...unique.map((val) => ({ key: val, label: val })),
    ];
  }, [clientList]);

  const toolbarFilterPopover = (
    <div className="w-[220px] space-y-2.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-1.5">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Quick Filters
        </span>
        <button
          type="button"
          onClick={() => {
            resetAllFilters();
            setToolbarFilterOpen(false);
          }}
          className="cursor-pointer text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset All
        </button>
      </div>
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-[var(--omada-text-tertiary)]">
          Authorization Status
        </div>
        {(
          [
            { key: 'all', label: 'All Statuses' },
            { key: 'authorized', label: 'Authorized' },
            { key: 'pending', label: 'Pending' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              setStatusFilter(opt.key);
              setCurrentPage(1);
            }}
            className={`flex w-full cursor-pointer items-center rounded px-2 py-1 text-left text-xs transition-colors ${
              statusFilter === opt.key
                ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
                : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const columnSelectorPopover = (
    <div className="w-[210px]" onClick={(e) => e.stopPropagation()}>
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
              <span className="truncate text-[var(--omada-text-primary)]">
                {col.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const columns: ColumnsType<EmulatorClientRecord> = useMemo(() => {
    const list: ColumnsType<EmulatorClientRecord> = [
      {
        title: '',
        key: 'icon',
        width: 60,
        fixed: 'left',
        align: 'center',
        render: (_, record) => (
          <div className="flex items-center justify-center">
            <div className="relative inline-flex h-[30px] w-[30px] items-center justify-center">
              <SClientIcon
                name={record.clientIcon}
                theme={record.forceLightIcon ? 'light' : 'auto'}
                size={28}
                alt={record.name}
                className="shrink-0 object-contain"
              />
              {record.hasManagedBadge && (
                <span
                  className="omada-client-managed-badge"
                  aria-hidden="true"
                  title="Managed client"
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M5 1.8V7.6M5 7.6L2.4 5M5 7.6L7.6 5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 156,
        fixed: 'left',
        sorter: (a, b) => a.name.localeCompare(b.name),
        showSorterTooltip: false,
        render: (name: string) => (
          <span className="block truncate text-[14px] text-[var(--omada-text-primary)]">
            {name}
          </span>
        ),
      },
    ];

    if (visibleKeySet.has('ipAddress')) {
      list.push({
        title: 'IP Address',
        dataIndex: 'ipAddress',
        key: 'ipAddress',
        width: 114,
        render: (ip: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {ip}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('authType')) {
      list.push({
        title: 'Authentication Type',
        dataIndex: 'authType',
        key: 'authType',
        width: 180,
        sorter: (a, b) => a.authType.localeCompare(b.authType),
        showSorterTooltip: false,
        render: (val: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">
            {val}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('status')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Status</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={statusPopoverOpen}
              onOpenChange={setStatusPopoverOpen}
              content={
                <FilterPopoverBody
                  title="Filter by Status"
                  value={statusFilter}
                  options={[
                    { key: 'all', label: 'All Statuses' },
                    { key: 'authorized', label: 'Authorized' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'blocked', label: 'Blocked' },
                  ]}
                  onSelect={(next) => {
                    setStatusFilter(next as StatusFilterKey);
                    setStatusPopoverOpen(false);
                    setCurrentPage(1);
                  }}
                />
              }
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter status"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-[var(--omada-bg-field)] ${
                  statusFilter !== 'all'
                    ? 'text-[var(--omada-brand-text)]'
                    : 'text-[var(--omada-text-disabled)]'
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'status',
        key: 'status',
        width: 110,
        sorter: (a, b) => a.status.localeCompare(b.status),
        showSorterTooltip: false,
        render: (status: EmulatorClientAuthStatus) => {
          const meta = STATUS_META[status];
          return (
            <span
              className="text-[14px] font-normal"
              style={{ color: meta.color }}
            >
              {meta.label}
            </span>
          );
        },
      });
    }

    if (visibleKeySet.has('experience')) {
      list.push({
        title: 'Experience',
        dataIndex: 'experienceLabel',
        key: 'experience',
        width: 118,
        sorter: (a, b) => (a.experienceScore ?? -1) - (b.experienceScore ?? -1),
        showSorterTooltip: false,
        render: (_, record) => (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{
                backgroundColor: EXPERIENCE_DOT_COLOR[record.experienceBucket],
              }}
            />
            <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
              {record.experienceLabel}
            </span>
          </span>
        ),
      });
    }

    if (visibleKeySet.has('incidents')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Incidents</span>
            <Tooltip title="Client connectivity and roaming incident count over the last 24 hours">
              <span
                className="inline-flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <SIcon name="info" size={15} />
              </span>
            </Tooltip>
          </span>
        ),
        dataIndex: 'incidents',
        key: 'incidents',
        width: 130,
        render: (count: number) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {count}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('ssid')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>SSID</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={ssidPopoverOpen}
              onOpenChange={setSsidPopoverOpen}
              content={
                <FilterPopoverBody
                  title="Filter by SSID"
                  value={ssidFilter}
                  options={ssidOptions}
                  onSelect={(next) => {
                    setSsidFilter(next);
                    setSsidPopoverOpen(false);
                    setCurrentPage(1);
                  }}
                />
              }
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter SSID"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-[var(--omada-bg-field)] ${
                  ssidFilter !== 'all'
                    ? 'text-[var(--omada-brand-text)]'
                    : 'text-[var(--omada-text-disabled)]'
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'ssid',
        key: 'ssid',
        width: 168,
        sorter: (a, b) => a.ssid.localeCompare(b.ssid),
        showSorterTooltip: false,
        render: (ssid: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">
            {ssid}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('network')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Network</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={networkPopoverOpen}
              onOpenChange={setNetworkPopoverOpen}
              content={
                <FilterPopoverBody
                  title="Filter by Network"
                  value={networkFilter}
                  options={networkOptions}
                  onSelect={(next) => {
                    setNetworkFilter(next);
                    setNetworkPopoverOpen(false);
                    setCurrentPage(1);
                  }}
                />
              }
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter network"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-[var(--omada-bg-field)] ${
                  networkFilter !== 'all'
                    ? 'text-[var(--omada-brand-text)]'
                    : 'text-[var(--omada-text-disabled)]'
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'network',
        key: 'network',
        width: 121,
        sorter: (a, b) => a.network.localeCompare(b.network),
        showSorterTooltip: false,
        render: (network: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">
            {network}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('apOrPort')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>AP/Port</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={apPopoverOpen}
              onOpenChange={setApPopoverOpen}
              content={
                <FilterPopoverBody
                  title="Filter by AP/Port"
                  value={apFilter}
                  options={apOptions}
                  onSelect={(next) => {
                    setApFilter(next);
                    setApPopoverOpen(false);
                    setCurrentPage(1);
                  }}
                />
              }
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter AP or Port"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-[var(--omada-bg-field)] ${
                  apFilter !== 'all'
                    ? 'text-[var(--omada-brand-text)]'
                    : 'text-[var(--omada-text-disabled)]'
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'apOrPort',
        key: 'apOrPort',
        width: 178,
        sorter: (a, b) => a.apOrPort.localeCompare(b.apOrPort),
        showSorterTooltip: false,
        render: (deviceName: string) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenDeviceByName) {
                onOpenDeviceByName(deviceName);
              } else {
                notification.info({
                  title: 'Uplink Device',
                  description: `Selected uplink device ${deviceName}.`,
                });
              }
            }}
            className="cursor-pointer border-0 bg-transparent p-0 text-left text-[14px] text-[var(--omada-link)] underline hover:text-[var(--omada-link-hover)]"
          >
            {deviceName}
          </button>
        ),
      });
    }

    if (visibleKeySet.has('downloadTraffic')) {
      list.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Download Traffic</span>
            <Tooltip title="Cumulative downstream traffic consumed during the current session">
              <span
                className="inline-flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <SIcon name="info" size={15} />
              </span>
            </Tooltip>
          </span>
        ),
        dataIndex: 'downloadBytes',
        key: 'downloadTraffic',
        width: 182,
        sorter: (a, b) => a.downloadBytes - b.downloadBytes,
        showSorterTooltip: false,
        render: (_, record) => (
          <span className="inline-flex items-center gap-1.5 tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            <SIcon
              name="icon-25947-12331"
              size={14}
              className="text-[var(--omada-color-magenta)]"
            />
            <span>{record.downloadTraffic}</span>
          </span>
        ),
      });
    }

    if (visibleKeySet.has('uptime')) {
      list.push({
        title: 'Uptime',
        dataIndex: 'uptime',
        key: 'uptime',
        width: 95,
        sorter: (a, b) => a.uptime.localeCompare(b.uptime),
        showSorterTooltip: false,
        render: (uptime: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {uptime}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('mac')) {
      list.push({
        title: 'MAC Address',
        dataIndex: 'mac',
        key: 'mac',
        width: 170,
        render: (mac: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {mac}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('vlan')) {
      list.push({
        title: 'VLAN',
        dataIndex: 'vlan',
        key: 'vlan',
        width: 80,
        render: (vlan: number) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {vlan}
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
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        if (record.onlineState === 'blocked') {
          return (
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="Unblock">
                <button
                  type="button"
                  aria-label={`Unblock ${record.name}`}
                  onClick={(e) => handleBlockToggle(e, record)}
                  className="omada-clients-row-action-btn"
                >
                  <SIcon name="unblock" size={17} />
                </button>
              </Tooltip>
              <Tooltip title="Forget">
                <button
                  type="button"
                  aria-label={`Forget ${record.name}`}
                  onClick={(e) => handleForget(e, record)}
                  className="omada-clients-row-action-btn"
                >
                  <SIcon name="forget-and-reset" size={17} />
                </button>
              </Tooltip>
            </div>
          );
        }

        const isAuthorized = record.status === 'authorized';
        const isWireless = record.connectionType === 'wireless';
        const showBlock = !record.hasManagedBadge;

        return (
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={isAuthorized ? 'Unauthorize' : 'Authorize'}>
              <button
                type="button"
                aria-label={`${isAuthorized ? 'Unauthorize' : 'Authorize'} ${record.name}`}
                onClick={(e) => handleToggleAuth(e, record)}
                className="omada-clients-row-action-btn"
              >
                <SIcon
                  name={isAuthorized ? 'unauthorize' : 'authorize'}
                  size={17}
                />
              </button>
            </Tooltip>

            {isWireless && (
              <Tooltip title="Reconnect">
                <button
                  type="button"
                  aria-label={`Reconnect ${record.name}`}
                  onClick={(e) => handleReconnect(e, record)}
                  className="omada-clients-row-action-btn"
                >
                  <SIcon name="link" size={17} />
                </button>
              </Tooltip>
            )}

            {showBlock && (
              <Tooltip title="Block">
                <button
                  type="button"
                  aria-label={`Block ${record.name}`}
                  onClick={(e) => handleBlockToggle(e, record)}
                  className="omada-clients-row-action-btn"
                >
                  <SIcon name="ban" size={17} />
                </button>
              </Tooltip>
            )}

            <Tooltip title="Forget">
              <button
                type="button"
                aria-label={`Forget ${record.name}`}
                onClick={(e) => handleForget(e, record)}
                className="omada-clients-row-action-btn"
              >
                <SIcon name="forget-and-reset" size={17} />
              </button>
            </Tooltip>
          </div>
        );
      },
    });

    return list;
  }, [
    visibleKeySet,
    statusPopoverOpen,
    statusFilter,
    ssidPopoverOpen,
    ssidFilter,
    ssidOptions,
    networkPopoverOpen,
    networkFilter,
    networkOptions,
    apPopoverOpen,
    apFilter,
    apOptions,
    onOpenDeviceByName,
  ]);

  const totalScrollWidth = useMemo(
    () =>
      columns.reduce(
        (sum, col) => sum + (typeof col.width === 'number' ? col.width : 140),
        0,
      ),
    [columns],
  );

  const emptyTitle =
    viewTab === 'offline'
      ? 'No offline clients'
      : viewTab === 'blocked'
        ? 'No blocked clients'
        : 'No matching clients';

  const emptyDescription =
    viewTab === 'offline'
      ? 'All connected clients on Main Office Floor are currently online.'
      : viewTab === 'blocked'
        ? 'No clients are currently blocked on Main Office Floor.'
        : 'Adjust your search query or filters to inspect connected clients.';

  return (
    <div className="omada-clients-page px-6 pt-4 pb-6">
      {/* Top Underline Sub-Tabs + Right Export Action */}
      <div className="flex items-center justify-between border-b border-[var(--omada-border-divider)]">
        <div
          role="tablist"
          aria-label="Client views"
          className="flex items-center gap-8"
        >
          {VIEW_TABS.map((tab) => {
            const isActive = viewTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setViewTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`omada-clients-subtab-btn cursor-pointer pb-2.5 text-[18px] leading-[26px] ${
                  isActive ? 'is-active font-medium' : 'font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="omada-clients-subtab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="omada-clients-ghost-action mb-1.5"
        >
          <SIcon name="export" size={15} />
          <span>Export</span>
        </button>
      </div>

      {/* 4-Column Client Overview KPI Strip */}
      <div className="mt-3 mb-2">
        <SClientOverviewStrip
          items={overviewItems}
          activeKey={overviewCategoryFilter}
          onItemClick={handleOverviewItemClick}
        />
      </div>

      {/* 2-Row Filter & Action Toolbar */}
      <div className="space-y-2.5">
        {/* Row 1: Search + Connection Type Segmented Tabs + Batch Config / Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SInput
              variant="filled"
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Name, IP or MAC"
              aria-label="Search clients"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
              className="omada-clients-search"
              style={{ width: 260 }}
            />

            <div
              role="tablist"
              aria-label="Client connection filter"
              className="omada-clients-seg-track"
            >
              {(
                [
                  { key: 'all', label: `All (${connectionCounts.all})` },
                  {
                    key: 'wireless',
                    label: `Wireless (${connectionCounts.wireless})`,
                  },
                  { key: 'wired', label: `Wired (${connectionCounts.wired})` },
                  {
                    key: 'ipc-nvr',
                    label:
                      connectionCounts.ipcNvr > 0
                        ? `IPCs/NVRs (${connectionCounts.ipcNvr})`
                        : 'IPCs/NVRs',
                  },
                ] as const
              ).map((item) => {
                const isActive = connectionFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setConnectionFilter(item.key);
                      setCurrentPage(1);
                    }}
                    className={`omada-clients-seg-pill ${isActive ? 'is-active' : ''}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dropdown
              menu={{ items: batchMenuItems, onClick: handleBatchAction }}
              trigger={['click']}
              destroyOnHidden
            >
              <button type="button" className="omada-clients-ghost-action">
                <SIcon name="edit" size={15} />
                <span>Batch Config</span>
              </button>
            </Dropdown>

            <Popover
              trigger="click"
              placement="bottomRight"
              open={toolbarFilterOpen}
              onOpenChange={setToolbarFilterOpen}
              content={toolbarFilterPopover}
              styles={{ container: { padding: 12 } }}
            >
              <button type="button" className="omada-clients-ghost-action">
                <SIcon name="icon-clients-icon-filter" size={15} />
                <span>Filter</span>
              </button>
            </Popover>
          </div>
        </div>

        {/* Row 2: Experience Segmented Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="Client experience filter"
            className="omada-clients-seg-track"
          >
            {(
              [
                { key: 'all', label: `All (${experienceCounts.all})` },
                {
                  key: 'good',
                  label: `Good (${experienceCounts.good})`,
                  dotColor: EXPERIENCE_DOT_COLOR.good,
                },
                {
                  key: 'fair',
                  label: `Fair (${experienceCounts.fair})`,
                  dotColor: EXPERIENCE_DOT_COLOR.fair,
                },
                {
                  key: 'poor',
                  label: `Poor (${experienceCounts.poor})`,
                  dotColor: EXPERIENCE_DOT_COLOR.poor,
                },
                {
                  key: 'no-data',
                  label: `No Data (${experienceCounts.noData})`,
                  dotColor: EXPERIENCE_DOT_COLOR['no-data'],
                },
              ] as const
            ).map((item) => {
              const isActive = experienceFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setExperienceFilter(item.key);
                    setCurrentPage(1);
                  }}
                  className={`omada-clients-seg-pill ${isActive ? 'is-active' : ''}`}
                >
                  {'dotColor' in item && item.dotColor && (
                    <span
                      aria-hidden="true"
                      className="h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ backgroundColor: item.dotColor }}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Client Table */}
      <div className="omada-clients-table-shell mt-3">
        <Table<EmulatorClientRecord>
          rowKey="key"
          columns={columns}
          dataSource={paginatedClients}
          pagination={false}
          scroll={{ x: totalScrollWidth }}
          locale={{
            emptyText: (
              <SEmpty
                illustration="no-clients"
                title={emptyTitle}
                description={emptyDescription}
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => onSelectClient?.(record),
            className:
              record.key === selectedClientKey
                ? 'omada-clients-row-selected'
                : undefined,
          })}
          className="omada-clients-table"
        />
      </div>

      {/* Right-Aligned Pagination Bar */}
      {filteredClients.length > 0 && (
        <div className="omada-clients-pagination mt-4">
          <SPagination
            align="right"
            current={currentPage}
            pageSize={pageSize}
            total={filteredClients.length}
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
    </div>
  );
};
