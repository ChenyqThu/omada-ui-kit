import React, { useMemo, useState } from 'react';
import { Select, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Moon, Pencil, RefreshCw, Shield, Sun, Wifi, X } from 'lucide-react';
import {
  SButton,
  SCard,
  SDeviceStatus,
  SIcon,
  SPageHeader,
  SProductImage,
  STable,
  STabs,
  STag,
  useOmadaTheme,
  type DeviceStatusType,
} from '@/omada';
import {
  SAvatar,
  SAvatarGroup,
  SBadge,
  SBarChart,
  SCollapse,
  SDescriptions,
  SDonutChart,
  SEditableCell,
  SLineChart,
  SRate,
  SSparkChart,
  STile,
  STileGroup,
  type SDescriptionsVariant,
} from '../../omada/modules/data-charts';
import '../../styles/modules/data-charts.css';

interface SiteDeviceRow {
  key: string;
  name: string;
  alias: string;
  model: string;
  vlan: string;
  status: DeviceStatusType;
  clients: number;
  throughputMbps: number;
  firmware: string;
  uptime: string;
}

const INITIAL_ROWS: SiteDeviceRow[] = [
  {
    key: 'row-1',
    name: 'Core-Gateway-HQ',
    alias: 'HQ Primary WAN',
    model: 'ER8411 v1.0',
    vlan: 'VLAN 1 (Corp)',
    status: 'connected',
    clients: 412,
    throughputMbps: 890,
    firmware: 'v1.2.4',
    uptime: '42d 11h',
  },
  {
    key: 'row-2',
    name: 'Core-SW-Floor1',
    alias: 'Floor 1 PoE Rack',
    model: 'SG3428XMP v1.0',
    vlan: 'VLAN 10 (Infra)',
    status: 'connected',
    clients: 138,
    throughputMbps: 640,
    firmware: 'v1.0.8',
    uptime: '28d 16h',
  },
  {
    key: 'row-3',
    name: 'Lobby-Main-AP',
    alias: 'Main Atrium Wi-Fi 7',
    model: 'EAP783 v1.0',
    vlan: 'VLAN 20 (Guest)',
    status: 'connected',
    clients: 58,
    throughputMbps: 410,
    firmware: 'v1.1.0',
    uptime: '21d 08h',
  },
  {
    key: 'row-4',
    name: 'Lab-Edge-Switch',
    alias: 'QA Test Bench',
    model: 'SG2210MP v1.0',
    vlan: 'VLAN 30 (Lab)',
    status: 'heartbeat-missed',
    clients: 14,
    throughputMbps: 95,
    firmware: 'v1.0.4',
    uptime: '3d 02h',
  },
  {
    key: 'row-5',
    name: 'Warehouse-B2',
    alias: 'Loading Dock AP',
    model: 'EAP650 v1.0',
    vlan: 'VLAN 1 (Corp)',
    status: 'disconnected',
    clients: 0,
    throughputMbps: 0,
    firmware: 'v1.1.8',
    uptime: '—',
  },
];

const VLAN_OPTIONS = [
  { label: 'VLAN 1 (Corp)', value: 'VLAN 1 (Corp)' },
  { label: 'VLAN 10 (Infra)', value: 'VLAN 10 (Infra)' },
  { label: 'VLAN 20 (Guest)', value: 'VLAN 20 (Guest)' },
  { label: 'VLAN 30 (Lab)', value: 'VLAN 30 (Lab)' },
];

export const DataChartsSection: React.FC = () => {
  const { resolvedTheme, setThemeMode } = useOmadaTheme();

  // STable state
  const [rows, setRows] = useState<SiteDeviceRow[]>(INITIAL_ROWS);
  const [tabStatus, setTabStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [vlanFilter, setVlanFilter] = useState<string>('all');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [batchEditMode, setBatchEditMode] = useState(false);

  // Charts state
  const [chartLoading, setChartLoading] = useState(false);
  const [chartEmpty, setChartEmpty] = useState(false);
  const [linePercentageMode, setLinePercentageMode] = useState(false);
  const [barMode, setBarMode] = useState<'vertical' | 'stacked' | 'horizontal'>('vertical');
  const [donutLegendPos, setDonutLegendPos] = useState<'bottom' | 'right'>('bottom');

  // Tiles, Descriptions, Rate state
  const [deployMode, setDeployMode] = useState('cloud');
  const [enabledPolicies, setEnabledPolicies] = useState<string[]>(['ids', 'dpi']);
  const [selectedProduct, setSelectedProduct] = useState('er8411');
  const [descVariant, setDescVariant] = useState<SDescriptionsVariant>('bordered');
  const [descLayout, setDescLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [rating, setRating] = useState<number>(4.5);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (tabStatus === 'online' && row.status !== 'connected') return false;
      if (tabStatus === 'attention' && row.status === 'connected') return false;
      if (vlanFilter !== 'all' && row.vlan !== vlanFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.alias.toLowerCase().includes(q) ||
        row.model.toLowerCase().includes(q)
      );
    });
  }, [rows, tabStatus, vlanFilter, search]);

  const updateRowField = <K extends keyof SiteDeviceRow>(
    key: string,
    field: K,
    value: SiteDeviceRow[K],
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const columns: ColumnsType<SiteDeviceRow> = [
    {
      title: 'DEVICE',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="py-0.5">
          <div className="font-semibold text-[var(--omada-text-primary)]">{record.name}</div>
          <div className="text-xs text-[var(--omada-text-tertiary)]">{record.model}</div>
        </div>
      ),
    },
    {
      title: 'SITE ALIAS (INLINE EDIT)',
      dataIndex: 'alias',
      key: 'alias',
      width: 240,
      render: (alias: string, record) => (
        <SEditableCell
          value={alias}
          editing={batchEditMode ? true : undefined}
          inputWidth={210}
          ariaLabel={`Edit alias for ${record.name}`}
          validate={(val) => (val.trim().length < 2 ? 'Min 2 characters' : null)}
          onChange={(next) => updateRowField(record.key, 'alias', next)}
          onSave={(next) => updateRowField(record.key, 'alias', next)}
        />
      ),
    },
    {
      title: 'VLAN',
      dataIndex: 'vlan',
      key: 'vlan',
      width: 190,
      render: (vlan: string, record) => (
        <SEditableCell
          type="select"
          value={vlan}
          options={VLAN_OPTIONS}
          editing={batchEditMode ? true : undefined}
          ariaLabel={`Edit VLAN for ${record.name}`}
          onChange={(next) => updateRowField(record.key, 'vlan', next)}
          onSave={(next) => updateRowField(record.key, 'vlan', next)}
        />
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (status: DeviceStatusType) => <SDeviceStatus status={status} />,
    },
    {
      title: 'CLIENTS',
      dataIndex: 'clients',
      key: 'clients',
      width: 90,
      render: (clients: number) => (
        <span className="tabular-nums font-medium text-[var(--omada-text-primary)]">
          {clients}
        </span>
      ),
    },
    {
      title: 'THROUGHPUT',
      dataIndex: 'throughputMbps',
      key: 'throughputMbps',
      width: 120,
      render: (val: number) => (
        <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
          {val} Mbps
        </span>
      ),
    },
  ];

  const activeFiltersCount = (vlanFilter !== 'all' ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Data Display & Charts"
        description="Enhanced STable (filters, column settings, density, expandable rows, SEditableCell), SChart presets, STileGroup, SDescriptions, SCollapse, SAvatar, SBadge, and SRate."
        extra={
          <SButton
            variant="secondary"
            icon={resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </SButton>
        }
      />

      {/* Enhanced STable */}
      <SCard
        title="Enhanced STable & Inline SEditableCell"
        subtitle="Includes column visibility checklist, density toggle, filter slot, expandable row details, batch selection bar, and inline single/batch cell editing."
        padding="sm"
      >
        <STable<SiteDeviceRow>
          dataSource={filteredRows}
          columns={columns}
          columnSettings
          densityToggle
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-[var(--omada-text-tertiary)]">Firmware Version: </span>
                  <strong className="text-[var(--omada-text-primary)]">{record.firmware}</strong>
                </div>
                <div>
                  <span className="text-[var(--omada-text-tertiary)]">Uptime: </span>
                  <strong className="tabular-nums text-[var(--omada-text-primary)]">{record.uptime}</strong>
                </div>
                <div>
                  <span className="text-[var(--omada-text-tertiary)]">Assigned VLAN: </span>
                  <strong className="text-[var(--omada-text-primary)]">{record.vlan}</strong>
                </div>
              </div>
            ),
          }}
          pagination={{ defaultPageSize: 5 }}
          toolbar={{
            tabs: (
              <STabs
                variant="capsule"
                activeKey={tabStatus}
                onChange={setTabStatus}
                items={[
                  { key: 'all', label: `All (${rows.length})` },
                  { key: 'online', label: 'Online' },
                  { key: 'attention', label: 'Attention' },
                ]}
              />
            ),
            searchValue: search,
            onSearchChange: setSearch,
            searchPlaceholder: 'Search device or alias...',
            filters: (
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  variant="filled"
                  value={vlanFilter}
                  onChange={setVlanFilter}
                  style={{ width: 168 }}
                  options={[
                    { label: 'All VLANs', value: 'all' },
                    ...VLAN_OPTIONS,
                  ]}
                />
                {activeFiltersCount > 0 && (
                  <span className="inline-flex h-8 items-center gap-2 rounded bg-[var(--omada-brand-bg-subtlest)] px-3 text-xs font-medium text-[var(--omada-brand-text)]">
                    <span>
                      {vlanFilter !== 'all' ? vlanFilter : `Query: "${search}"`}
                    </span>
                    <button
                      type="button"
                      aria-label="Clear active filters"
                      onClick={() => {
                        setVlanFilter('all');
                        setSearch('');
                      }}
                      className="cursor-pointer hover:opacity-75"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
              </div>
            ),
            actions: (
              <div className="flex items-center gap-2">
                <SButton
                  variant={batchEditMode ? 'primary' : 'outline'}
                  size="small"
                  icon={<Pencil size={13} />}
                  onClick={() => setBatchEditMode((v) => !v)}
                >
                  {batchEditMode ? 'Done Batch Edit' : 'Batch Edit'}
                </SButton>
                <SButton
                  variant="secondary"
                  size="small"
                  icon={<RefreshCw size={13} />}
                  onClick={() => setRows(INITIAL_ROWS)}
                >
                  Reset
                </SButton>
              </div>
            ),
            selectedCount: selectedKeys.length,
            onClearSelection: () => setSelectedKeys([]),
            batchActions: (
              <>
                <SButton
                  variant="outline"
                  size="small"
                  onClick={() => {
                    setRows((prev) =>
                      prev.map((r) =>
                        selectedKeys.includes(r.key) ? { ...r, status: 'connected' } : r,
                      ),
                    );
                    setSelectedKeys([]);
                  }}
                >
                  Mark Online
                </SButton>
                <SButton
                  variant="secondary"
                  size="small"
                  onClick={() => setSelectedKeys([])}
                >
                  Dismiss
                </SButton>
              </>
            ),
          }}
        />
      </SCard>

      {/* Chart Presets */}
      <SCard
        title="SChart High-Level Presets (Line, Bar, Donut, 2-Tick Spark)"
        extra={
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--omada-text-secondary)]">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <Switch size="small" checked={chartLoading} onChange={setChartLoading} />
              <span>Loading Skeleton</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <Switch size="small" checked={chartEmpty} onChange={setChartEmpty} />
              <span>Empty State</span>
            </label>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-[var(--omada-border-divider)] p-4 lg:col-span-2">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--omada-text-primary)]">
                  SLineChart ({linePercentageMode ? '6-Tick Percentage' : '5-Tick Throughput'})
                </span>
                <STabs
                  variant="segment"
                  activeKey={linePercentageMode ? 'pct' : 'mbps'}
                  onChange={(k) => setLinePercentageMode(k === 'pct')}
                  items={[
                    { key: 'mbps', label: 'Traffic (Mbps)' },
                    { key: 'pct', label: 'Utilization (%)' },
                  ]}
                />
              </div>
              <SLineChart
                xData={['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']}
                percentage={linePercentageMode}
                yUnit={linePercentageMode ? undefined : ' Mbps'}
                loading={chartLoading}
                empty={chartEmpty}
                height={240}
                series={
                  linePercentageMode
                    ? [
                        { name: 'CPU Load', data: [24, 38, 52, 48, 66, 58, 34] },
                        { name: 'Memory', data: [58, 60, 63, 65, 68, 64, 61] },
                      ]
                    : [
                        { name: 'Download', data: [310, 480, 720, 690, 880, 740, 520] },
                        { name: 'Upload', data: [92, 145, 220, 210, 295, 238, 164] },
                      ]
                }
              />
            </div>

            <div className="rounded-lg border border-[var(--omada-border-divider)] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--omada-text-primary)]">
                  SDonutChart
                </span>
                <STabs
                  variant="segment"
                  activeKey={donutLegendPos}
                  onChange={(k) => setDonutLegendPos(k as 'bottom' | 'right')}
                  items={[
                    { key: 'bottom', label: 'Bottom' },
                    { key: 'right', label: 'Right' },
                  ]}
                />
              </div>
              <SDonutChart
                centerValue="412"
                centerLabel="Active Clients"
                legendPosition={donutLegendPos}
                loading={chartLoading}
                empty={chartEmpty}
                height={240}
                data={[
                  { name: '5 GHz', value: 182 },
                  { name: '6 GHz', value: 96 },
                  { name: '2.4 GHz', value: 88 },
                  { name: 'Wired', value: 46 },
                ]}
              />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--omada-border-divider)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--omada-text-primary)]">
                SBarChart (Vertical / Stacked / Horizontal)
              </span>
              <STabs
                variant="segment"
                activeKey={barMode}
                onChange={(k) => setBarMode(k as 'vertical' | 'stacked' | 'horizontal')}
                items={[
                  { key: 'vertical', label: 'Vertical' },
                  { key: 'stacked', label: 'Stacked' },
                  { key: 'horizontal', label: 'Horizontal' },
                ]}
              />
            </div>
            <SBarChart
              layout={barMode === 'horizontal' ? 'horizontal' : 'vertical'}
              stacked={barMode === 'stacked'}
              unit=" GB"
              loading={chartLoading}
              empty={chartEmpty}
              height={230}
              categories={['Corp-5G', 'Corp-6G', 'Guest-WiFi', 'IoT-VLAN', 'VoIP']}
              series={[
                { name: 'Downstream', data: [420, 318, 164, 92, 58] },
                { name: 'Upstream', data: [140, 112, 48, 36, 44] },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--omada-border-divider)] p-3.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
                  SSparkChart (Area · 2 Ticks)
                </span>
                <span className="tabular-nums text-sm font-semibold text-[var(--omada-brand-text)]">
                  842 Mbps
                </span>
              </div>
              <SSparkChart
                variant="area"
                unit="M"
                loading={chartLoading}
                empty={chartEmpty}
                data={[180, 320, 290, 510, 460, 740, 842]}
              />
            </div>
            <div className="rounded-lg border border-[var(--omada-border-divider)] p-3.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
                  SSparkChart (Line · 2 Ticks)
                </span>
                <span className="tabular-nums text-sm font-semibold text-[var(--omada-color-info)]">
                  14 ms
                </span>
              </div>
              <SSparkChart
                variant="line"
                unit="ms"
                loading={chartLoading}
                empty={chartEmpty}
                data={[18, 15, 22, 16, 12, 15, 14]}
              />
            </div>
            <div className="rounded-lg border border-[var(--omada-border-divider)] p-3.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
                  SSparkChart (Bar · 2 Ticks)
                </span>
                <span className="tabular-nums text-sm font-semibold text-[var(--omada-text-primary)]">
                  341 W
                </span>
              </div>
              <SSparkChart
                variant="bar"
                unit="W"
                loading={chartLoading}
                empty={chartEmpty}
                data={[210, 245, 280, 260, 315, 330, 341]}
              />
            </div>
          </div>
        </div>
      </SCard>

      {/* STile & STileGroup */}
      <SCard
        title="STile & STileGroup (Single, Multi, Vertical & Compact Device Selector)"
        subtitle="Option cards with Normal, Hover, Selected (green border + corner checkmark) and Disabled states."
      >
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Single-Select Controller Mode (Selected: {deployMode})
            </div>
            <STileGroup
              mode="single"
              columns={3}
              value={deployMode}
              onChange={setDeployMode}
              options={[
                {
                  value: 'cloud',
                  title: 'Omada Cloud Central',
                  description: 'Zero-touch multi-site orchestration with cloud telemetry.',
                  icon: <SIcon name="cloud" size={20} />,
                  badge: <STag color="green">Recommended</STag>,
                },
                {
                  value: 'hardware',
                  title: 'Hardware Controller',
                  description: 'Local OC300 / OC400 appliance management inside LAN.',
                  icon: <SIcon name="gateway" size={20} />,
                },
                {
                  value: 'legacy',
                  title: 'Standalone Mode',
                  description: 'Deprecated per-device web GUI without central roaming.',
                  icon: <SIcon name="ap" size={20} />,
                  disabled: true,
                },
              ]}
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Multi-Select Security Tiles (Vertical · Selected: {enabledPolicies.join(', ') || 'none'})
            </div>
            <STileGroup
              mode="multiple"
              layout="vertical"
              columns={3}
              value={enabledPolicies}
              onChange={setEnabledPolicies}
            >
              <STile
                value="ids"
                title="IDS / IPS Protection"
                description="Inspect East-West and North-South gateway signatures."
                icon={<Shield size={18} />}
              />
              <STile
                value="dpi"
                title="Deep Packet Inspection"
                description="Classify 260+ application protocols per SSID and VLAN."
                icon={<SIcon name="application" size={18} />}
              />
              <STile
                value="roam"
                title="802.11k/v/r Fast Roaming"
                description="Sub-30ms BSS transition across Wi-Fi 7 access points."
                icon={<Wifi size={18} />}
              />
            </STileGroup>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Compact Device Selector Tiles (`size="sm"` · Selected: {selectedProduct})
            </div>
            <STileGroup
              mode="single"
              size="sm"
              columns="auto"
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={[
                {
                  value: 'er8411',
                  title: 'ER8411',
                  icon: <SProductImage name="er8411" size={22} alt="ER8411" />,
                },
                {
                  value: 'sg3452p-un-3-40',
                  title: 'SG3452P',
                  icon: <SProductImage name="sg3452p-un-3-40" size={22} alt="SG3452P" />,
                },
                {
                  value: 'eap727-eu-1-0',
                  title: 'EAP727',
                  icon: <SProductImage name="eap727-eu-1-0" size={22} alt="EAP727" />,
                },
              ]}
            />
          </div>
        </div>
      </SCard>

      {/* SDescriptions & SCollapse */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard
          title="SDescriptions"
          extra={
            <div className="flex flex-wrap items-center gap-2">
              <STabs
                variant="segment"
                activeKey={descVariant}
                onChange={(k) => setDescVariant(k as SDescriptionsVariant)}
                items={[
                  { key: 'bordered', label: 'Bordered' },
                  { key: 'filled', label: 'Filled' },
                  { key: 'borderless', label: 'Borderless' },
                ]}
              />
              <STabs
                variant="segment"
                activeKey={descLayout}
                onChange={(k) => setDescLayout(k as 'horizontal' | 'vertical')}
                items={[
                  { key: 'horizontal', label: 'Horizontal' },
                  { key: 'vertical', label: 'Vertical' },
                ]}
              />
            </div>
          }
        >
          <SDescriptions
            variant={descVariant}
            layout={descLayout}
            column={descLayout === 'horizontal' && descVariant !== 'bordered' ? 1 : 2}
            items={[
              { key: 'model', label: 'Hardware Model', children: 'ER8411 v1.0' },
              { key: 'fw', label: 'Firmware Version', children: 'v1.2.4 Build 20261015' },
              { key: 'ip', label: 'WAN1 IPv4', children: '203.0.113.42', mono: true },
              { key: 'mac', label: 'MAC Address', children: '00-FF-00-05-3E-01', mono: true },
              {
                key: 'status',
                label: 'Cloud Link',
                children: <SBadge status="success" text="Connected" />,
              },
              { key: 'uptime', label: 'Uptime', children: '42 days, 11 hours' },
            ]}
          />
        </SCard>

        <SCard title="SCollapse (Card & Default Accordions)">
          <SCollapse
            variant="card"
            accordion
            defaultActiveKey={['license']}
            items={[
              {
                key: 'license',
                label: 'Pro License Entitlements',
                subtitle: 'Multi-site zero-touch provisioning & AI RF tuning',
                status: <STag color="green">Active</STag>,
                children: (
                  <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
                    48 / 100 device seats allocated across Headquarters Building and Branch Office West.
                  </p>
                ),
              },
              {
                key: 'schedule',
                label: 'WLAN Radio Schedule',
                subtitle: 'Guest SSID automatic off-hours power saving',
                status: <STag color="blue">08:00–22:00</STag>,
                children: (
                  <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
                    Guest SSID radios suspend automatically outside business hours on weekdays.
                  </p>
                ),
              },
              {
                key: 'snmp',
                label: 'Legacy SNMP v1/v2c Agent',
                subtitle: 'Disabled under Zero-Trust baseline policy',
                status: <STag color="grey">Locked</STag>,
                disabled: true,
                children: null,
              },
            ]}
          />
        </SCard>
      </div>

      {/* SAvatar, SBadge, SRate */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SCard title="SAvatar & SAvatarGroup">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SAvatar size="xs" name="Phoenix" />
              <SAvatar size="sm" name="Alice Lin" status="online" />
              <SAvatar size="md" name="Network Admin" status="away" />
              <SAvatar size="lg" name="Super Admin" status="online" />
              <SAvatar size="md" guest status="offline" />
            </div>
            <div className="border-t border-[var(--omada-border-divider)] pt-3">
              <div className="mb-2 text-xs text-[var(--omada-text-secondary)]">
                Operator Team (`maxCount=3`)
              </div>
              <SAvatarGroup size="md" maxCount={3}>
                <SAvatar name="Phoenix" />
                <SAvatar name="Alice Lin" />
                <SAvatar name="Ben Wu" />
                <SAvatar name="Carol Chen" />
                <SAvatar guest />
              </SAvatarGroup>
            </div>
          </div>
        </SCard>

        <SCard title="SBadge (Capsules, Dots & Status)">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <SBadge count={5} />
              <SBadge count={24} tone="brand" />
              <SBadge count={148} overflowCount={99} />
              <SBadge dot tone="error">
                <SButton variant="secondary" size="small">
                  Alerts
                </SButton>
              </SBadge>
              <SBadge count={12} tone="info">
                <SButton variant="secondary" size="small">
                  Pending
                </SButton>
              </SBadge>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--omada-border-divider)] pt-3">
              <SBadge status="success" text="Online" />
              <SBadge status="processing" text="Provisioning" />
              <SBadge status="warning" text="Warning" />
              <SBadge status="error" text="Error" />
              <SBadge status="default" text="Idle" />
            </div>
          </div>
        </SCard>

        <SCard title="SRate (Star Rating & Sizes)">
          <div className="space-y-3.5">
            <div>
              <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">
                Interactive Half-Star (`md` 20px + live caption)
              </div>
              <SRate
                size="md"
                allowHalf
                value={rating}
                onChange={setRating}
                showCaption
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--omada-border-divider)] pt-3">
              <div>
                <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">Small (`12px`)</div>
                <SRate size="sm" readonly defaultValue={4} />
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--omada-text-secondary)]">Large (`32px`)</div>
                <SRate size="lg" readonly defaultValue={5} />
              </div>
            </div>
          </div>
        </SCard>
      </div>
    </div>
  );
};
