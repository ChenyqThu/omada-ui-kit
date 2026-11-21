import React, { useMemo, useState } from 'react';
import { Descriptions, Select, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { EChartsOption } from 'echarts';
import {
  Activity,
  Download,
  LocateFixed,
  Network,
  Plus,
  RefreshCw,
  RotateCcw,
  Router,
  Trash2,
  UploadCloud,
  Users,
  Wifi,
} from 'lucide-react';
import {
  SAlert,
  SButton,
  SCard,
  SChart,
  SDeviceIcon,
  SDeviceStatus,
  SDrawer,
  SForm,
  SFormItem,
  SInput,
  SIpInput,
  SKpiCard,
  SMacInput,
  SPageHeader,
  SPortPanel,
  SProductImage,
  STable,
  STabs,
  STag,
  STextArea,
  useOmadaConfirm,
  useOmadaFeedback,
  validateIpv4,
  type DeviceStatusType,
  type OmadaDeviceType,
  type OmadaProductName,
  type SPortItem,
} from '@/omada';

interface DemoDevice {
  key: string;
  name: string;
  model: string;
  productSlug?: OmadaProductName;
  category: 'gateway' | 'switch' | 'ap';
  iconType: OmadaDeviceType;
  status: DeviceStatusType;
  ip: string;
  mac: string;
  version: string;
  clients: number;
  uptime: string;
  cpu: number;
  memory: number;
  poeUsed?: string;
  ports?: SPortItem[];
}

function buildSwitchPorts(count: number, hasSfp: boolean): SPortItem[] {
  const ports: SPortItem[] = [];
  for (let i = 1; i <= count; i++) {
    const isSfp = hasSfp && i > count - 4;
    if (isSfp) {
      ports.push({
        id: i,
        label: `SFP${i - (count - 4)}`,
        type: 'sfp',
        status: i === count ? 'disconnected' : '10g',
        badges: i === count - 3 ? ['uplink'] : undefined,
        vlan: 'Trunk (All)',
        clientName: i === count - 3 ? 'Core-ER8411' : i < count ? 'Aggregation Stack' : undefined,
      });
    } else {
      const statusPool: SPortItem['status'][] = [
        '1g',
        '2.5g',
        '1g',
        '100m',
        'disconnected',
        '1g',
        '2.5g',
        'disabled',
      ];
      const status = statusPool[(i - 1) % statusPool.length];
      const isPoe = status !== 'disconnected' && status !== 'disabled' && i % 2 === 1;
      ports.push({
        id: i,
        type: 'rj45',
        status,
        badges: isPoe ? ['poe'] : i === 2 ? ['mirror'] : undefined,
        vlan: i % 3 === 0 ? 'VLAN 20 (Guest)' : 'VLAN 1 (Corp)',
        poeWatts: isPoe ? Number((4.2 + (i % 5) * 3.1).toFixed(1)) : undefined,
        clientName:
          status === 'disconnected' || status === 'disabled'
            ? undefined
            : i % 2 === 1
              ? `EAP670-Floor${(i % 4) + 1}`
              : `Workstation-${100 + i}`,
      });
    }
  }
  return ports;
}

function buildGatewayPorts(): SPortItem[] {
  return [
    { id: 1, label: 'WAN1', type: 'wan', status: '10g', badges: ['uplink'], vlan: 'ISP Primary', clientName: 'Fiber 10G' },
    { id: 2, label: 'WAN2', type: 'wan', status: '2.5g', vlan: 'ISP Backup', clientName: 'Failover Link' },
    { id: 3, label: 'LAN1', type: 'lan', status: '10g', vlan: 'All VLANs', clientName: 'Core-SW-Floor1' },
    { id: 4, label: 'LAN2', type: 'lan', status: '1g', vlan: 'VLAN 10', clientName: 'DMZ Server' },
    { id: 5, label: 'LAN3', type: 'lan', status: 'disconnected', vlan: 'VLAN 1' },
    { id: 6, label: 'LAN4', type: 'lan', status: 'disabled' },
  ];
}

const INITIAL_DEVICES: DemoDevice[] = [
  {
    key: 'dev-1',
    name: 'Core-Gateway-HQ',
    model: 'ER8411 v1.0',
    productSlug: 'er8411',
    category: 'gateway',
    iconType: 'gateway',
    status: 'connected',
    ip: '192.168.0.1',
    mac: '00-FF-00-05-3E-01',
    version: '1.2.4',
    clients: 412,
    uptime: '42d 11h 18m',
    cpu: 18,
    memory: 44,
    ports: buildGatewayPorts(),
  },
  {
    key: 'dev-2',
    name: 'Branch-VPN-GW',
    model: 'ER7206 v2.0',
    productSlug: 'gateway-er7206',
    category: 'gateway',
    iconType: 'gateway',
    status: 'connected',
    ip: '192.168.10.1',
    mac: '00-FF-00-05-3E-02',
    version: '2.1.2',
    clients: 64,
    uptime: '19d 04h 52m',
    cpu: 14,
    memory: 39,
    ports: buildGatewayPorts(),
  },
  {
    key: 'dev-3',
    name: 'Core-SW-Floor1',
    model: 'SG3428XMP v1.0',
    productSlug: 'sg3452p-un-3-40',
    category: 'switch',
    iconType: 'switch',
    status: 'connected',
    ip: '192.168.0.10',
    mac: '00-FF-00-05-3E-10',
    version: '1.0.8',
    clients: 138,
    uptime: '28d 16h 57m',
    cpu: 12,
    memory: 57,
    poeUsed: '186.4W / 384W',
    ports: buildSwitchPorts(24, true),
  },
  {
    key: 'dev-4',
    name: 'Dist-SW-Floor2-PoE',
    model: 'SG3210XHP-M2 v2.0',
    productSlug: 'sg2428p-un-5-40',
    category: 'switch',
    iconType: 'switch',
    status: 'connected',
    ip: '192.168.0.11',
    mac: '00-FF-00-05-3E-11',
    version: '2.0.5',
    clients: 76,
    uptime: '16d 09h 44m',
    cpu: 9,
    memory: 48,
    poeUsed: '112.0W / 240W',
    ports: buildSwitchPorts(12, true),
  },
  {
    key: 'dev-5',
    name: 'Lab-Edge-Switch',
    model: 'SG2210MP v1.0',
    productSlug: 'sg2008p-un-3-30',
    category: 'switch',
    iconType: 'switch',
    status: 'heartbeat-missed',
    ip: '192.168.0.12',
    mac: '00-FF-00-05-3E-12',
    version: '1.0.4',
    clients: 14,
    uptime: '3d 02h 11m',
    cpu: 31,
    memory: 63,
    poeUsed: '42.8W / 150W',
    ports: buildSwitchPorts(10, false),
  },
  {
    key: 'dev-6',
    name: 'Lobby-Main-AP',
    model: 'EAP783 v1.0',
    productSlug: 'eap727-eu-1-0',
    category: 'ap',
    iconType: 'ap',
    status: 'connected',
    ip: '192.168.0.101',
    mac: '50-91-E3-4A-12-01',
    version: '1.1.0',
    clients: 58,
    uptime: '21d 08h 30m',
    cpu: 22,
    memory: 51,
  },
  {
    key: 'dev-7',
    name: 'Conf-Room-North',
    model: 'EAP670 v2.0',
    productSlug: 'eap650',
    category: 'ap',
    iconType: 'ap',
    status: 'connected',
    ip: '192.168.0.102',
    mac: '50-91-E3-4A-12-02',
    version: '1.0.12',
    clients: 41,
    uptime: '21d 08h 29m',
    cpu: 15,
    memory: 43,
  },
  {
    key: 'dev-8',
    name: 'R&D-Zone-East',
    model: 'EAP670 v2.0',
    productSlug: 'eap650',
    category: 'ap',
    iconType: 'ap',
    status: 'provisioning',
    ip: '192.168.0.103',
    mac: '50-91-E3-4A-12-03',
    version: '1.0.12',
    clients: 0,
    uptime: '0d 00h 04m',
    cpu: 47,
    memory: 61,
  },
  {
    key: 'dev-9',
    name: 'Courtyard-Outdoor',
    model: 'EAP650-Outdoor v1.0',
    productSlug: 'eap650-outdoor-1-0',
    category: 'ap',
    iconType: 'ap',
    status: 'connected',
    ip: '192.168.0.104',
    mac: '50-91-E3-4A-12-04',
    version: '1.2.1',
    clients: 29,
    uptime: '14d 20h 12m',
    cpu: 11,
    memory: 38,
  },
  {
    key: 'dev-10',
    name: 'Warehouse-B2',
    model: 'EAP650 v1.0',
    productSlug: 'eap650',
    category: 'ap',
    iconType: 'ap',
    status: 'disconnected',
    ip: '192.168.0.105',
    mac: '50-91-E3-4A-12-05',
    version: '1.1.8',
    clients: 0,
    uptime: '—',
    cpu: 0,
    memory: 0,
  },
  {
    key: 'dev-11',
    name: 'Cafeteria-West',
    model: 'EAP653 v1.0',
    productSlug: 'eap650',
    category: 'ap',
    iconType: 'ap',
    status: 'connected',
    ip: '192.168.0.106',
    mac: '50-91-E3-4A-12-06',
    version: '1.1.9',
    clients: 33,
    uptime: '18d 07h 05m',
    cpu: 17,
    memory: 46,
  },
  {
    key: 'dev-12',
    name: 'Guest-Lounge-AP',
    model: 'EAP615-Wall v1.0',
    productSlug: 'eap615gp-wall-eu-1-20',
    category: 'ap',
    iconType: 'ap',
    status: 'adopt-failed',
    ip: '192.168.0.107',
    mac: '50-91-E3-4A-12-07',
    version: '1.3.0',
    clients: 0,
    uptime: '—',
    cpu: 0,
    memory: 0,
  },
];

interface DeviceConfigFormProps {
  device: DemoDevice;
  onSave: (updated: { name: string; ip: string; mac: string }) => void;
  onClose: () => void;
}

const DeviceConfigForm: React.FC<DeviceConfigFormProps> = ({
  device,
  onSave,
  onClose,
}) => {
  const [form] = SForm.useForm();

  return (
    <SForm
      form={form}
      layout="vertical"
      initialValues={{
        name: device.name,
        ip: device.ip,
        mac: device.mac,
        mgmtVlan: 'vlan1',
        ledEnabled: true,
        notes: `${device.model} deployed at Headquarters Building`,
      }}
      onFinish={(vals) => {
        onSave({
          name: String(vals.name ?? device.name),
          ip: String(vals.ip ?? device.ip),
          mac: String(vals.mac ?? device.mac),
        });
      }}
    >
      <SFormItem
        label="Device Name"
        name="name"
        rules={[{ required: true, message: 'Device name is required' }]}
        fieldWidth="full"
      >
        <SInput placeholder="Enter device alias" />
      </SFormItem>
      <SFormItem
        label="Management IP"
        name="ip"
        tooltip="Static management IPv4 used for controller communication."
        rules={[
          {
            validator: (_, val: string) =>
              validateIpv4(val ?? '')
                ? Promise.resolve()
                : Promise.reject(new Error('Enter a valid IPv4 address')),
          },
        ]}
        fieldWidth="full"
      >
        <SIpInput mode="ip" />
      </SFormItem>
      <SFormItem label="MAC Address" name="mac" fieldWidth="full">
        <SMacInput disabled />
      </SFormItem>
      <SFormItem label="Management VLAN" name="mgmtVlan" fieldWidth="full">
        <Select
          variant="filled"
          options={[
            { label: 'VLAN 1 (Default)', value: 'vlan1' },
            { label: 'VLAN 10 (Infrastructure)', value: 'vlan10' },
            { label: 'VLAN 99 (Out-of-Band Mgmt)', value: 'vlan99' },
          ]}
        />
      </SFormItem>
      <SFormItem label="Status LED" name="ledEnabled" valuePropName="checked">
        <Switch />
      </SFormItem>
      <SFormItem label="Site Notes" name="notes" optional fieldWidth="full">
        <STextArea rows={2} />
      </SFormItem>
      <div className="flex justify-end gap-2 pt-1">
        <SButton variant="secondary" onClick={onClose}>
          Close
        </SButton>
        <SButton variant="primary" htmlType="submit">
          Apply Changes
        </SButton>
      </div>
    </SForm>
  );
};

export const DeviceListDemo: React.FC = () => {
  const { toast } = useOmadaFeedback();
  const { confirmDanger } = useOmadaConfirm();

  const [devices, setDevices] = useState<DemoDevice[]>(INITIAL_DEVICES);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [activeDeviceKey, setActiveDeviceKey] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<string>('overview');
  const [selectedPortIds, setSelectedPortIds] = useState<number[]>([1, 3]);

  const activeDevice = useMemo(
    () => devices.find((d) => d.key === activeDeviceKey) ?? null,
    [devices, activeDeviceKey],
  );

  const counts = useMemo(
    () => ({
      all: devices.length,
      gateway: devices.filter((d) => d.category === 'gateway').length,
      switch: devices.filter((d) => d.category === 'switch').length,
      ap: devices.filter((d) => d.category === 'ap').length,
      clients: devices.reduce((acc, d) => acc + d.clients, 0),
    }),
    [devices],
  );

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter((d) => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q)
      );
    });
  }, [devices, categoryFilter, search]);

  const openDeviceDrawer = (record: DemoDevice, initialTab = 'overview') => {
    setActiveDeviceKey(record.key);
    setDrawerTab(record.ports ? initialTab : initialTab === 'ports' ? 'overview' : initialTab);
  };

  const handleForgetSelected = () => {
    confirmDanger({
      title: `Forget ${selectedKeys.length} selected device(s)?`,
      content: 'Forgotten devices will lose controller management until re-adopted.',
      okText: 'Forget',
      onOk: () => {
        setDevices((prev) => prev.filter((d) => !selectedKeys.includes(d.key)));
        toast.success(`Removed ${selectedKeys.length} device(s) from site inventory`);
        setSelectedKeys([]);
      },
    });
  };

  const telemetryOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'axis' },
      legend: { data: ['CPU %', 'Memory %'], top: 0, right: 0 },
      grid: { left: 38, right: 16, top: 34, bottom: 26 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' },
      },
      series: [
        {
          name: 'CPU %',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.14 },
          data: [14, 19, 16, 22, 18, activeDevice?.cpu ?? 12],
        },
        {
          name: 'Memory %',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.1 },
          data: [48, 51, 52, 55, 56, activeDevice?.memory ?? 57],
        },
      ],
    }),
    [activeDevice],
  );

  const columns: ColumnsType<DemoDevice> = [
    {
      title: 'DEVICE NAME',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
        <button
          type="button"
          onClick={() => openDeviceDrawer(record)}
          className="flex cursor-pointer items-center gap-2.5 text-left group"
        >
          {record.productSlug ? (
            <SProductImage
              name={record.productSlug}
              size={32}
              alt={record.model}
              className="shrink-0 object-contain"
              fallback={<SDeviceIcon type={record.iconType} size={30} />}
            />
          ) : (
            <SDeviceIcon type={record.iconType} size={30} />
          )}
          <div>
            <div className="font-semibold text-[var(--omada-text-primary)] group-hover:text-[var(--omada-brand-text)]">
              {record.name}
            </div>
            <div className="text-xs text-[var(--omada-text-tertiary)]">
              {record.model}
            </div>
          </div>
        </button>
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
      title: 'IP ADDRESS',
      dataIndex: 'ip',
      key: 'ip',
      width: 145,
      render: (ip: string) => (
        <span className="font-mono text-xs text-[var(--omada-text-primary)]">{ip}</span>
      ),
    },
    {
      title: 'MAC ADDRESS',
      dataIndex: 'mac',
      key: 'mac',
      width: 165,
      render: (mac: string) => (
        <span className="font-mono text-xs text-[var(--omada-text-secondary)]">{mac}</span>
      ),
    },
    {
      title: 'VERSION',
      dataIndex: 'version',
      key: 'version',
      width: 105,
      render: (v: string) => <STag color="grey">v{v}</STag>,
    },
    {
      title: 'CLIENTS',
      dataIndex: 'clients',
      key: 'clients',
      width: 90,
      sorter: (a, b) => a.clients - b.clients,
      render: (c: number) => (
        <span className="tabular-nums font-medium text-[var(--omada-text-primary)]">
          {c}
        </span>
      ),
    },
    {
      title: 'UPTIME',
      dataIndex: 'uptime',
      key: 'uptime',
      width: 130,
      render: (u: string) => (
        <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">{u}</span>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      width: 145,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <SButton
            variant="link"
            size="small"
            onClick={() => openDeviceDrawer(record)}
          >
            Details
          </SButton>
          <SButton
            variant="text"
            size="small"
            icon={<LocateFixed size={14} />}
            aria-label={`Locate ${record.name}`}
            onClick={() => toast.info(`Locating LED blinking on ${record.name}`)}
          />
          <SButton
            variant="text"
            size="small"
            icon={<RotateCcw size={14} />}
            aria-label={`Reboot ${record.name}`}
            onClick={() => toast.loading(`Reboot command queued for ${record.name}`)}
          />
        </div>
      ),
    },
  ];

  const drawerTabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: activeDevice && (
        <div className="space-y-4">
          <Descriptions
            bordered
            size="small"
            column={2}
            items={[
              { key: 'model', label: 'Model', children: activeDevice.model },
              { key: 'ip', label: 'IP Address', children: <span className="font-mono">{activeDevice.ip}</span> },
              { key: 'mac', label: 'MAC Address', children: <span className="font-mono">{activeDevice.mac}</span> },
              { key: 'fw', label: 'Firmware', children: `v${activeDevice.version}` },
              { key: 'uptime', label: 'Uptime', children: activeDevice.uptime },
              { key: 'clients', label: 'Clients', children: activeDevice.clients },
              ...(activeDevice.poeUsed
                ? [{ key: 'poe', label: 'PoE Power', children: activeDevice.poeUsed, span: 2 }]
                : []),
            ]}
          />

          <SCard title="CPU & Memory Utilization (Last 6h)" padding="sm">
            <SChart option={telemetryOption} height={220} />
          </SCard>
        </div>
      ),
    },
    ...(activeDevice?.ports
      ? [
          {
            key: 'ports',
            label: `Ports (${activeDevice.ports.length})`,
            children: (
              <div className="space-y-4">
                <SAlert
                  type="info"
                  title="Interactive Port Matrix"
                  description="Hover any port to inspect speed, VLAN, PoE draw, and linked device. Click active ports to select for batch PoE/profile actions."
                />
                <SPortPanel
                  ports={activeDevice.ports}
                  layout={activeDevice.ports.length > 8 ? 'double-row' : 'single-row'}
                  size={activeDevice.ports.length > 8 ? 'sm' : 'lg'}
                  selectable
                  selectedIds={selectedPortIds}
                  onSelectChange={setSelectedPortIds}
                />
                <div className="flex items-center justify-between rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-3.5 py-2.5 text-xs">
                  <span className="text-[var(--omada-text-secondary)]">
                    Selected ports:{' '}
                    <strong className="text-[var(--omada-text-primary)]">
                      {selectedPortIds.length > 0 ? selectedPortIds.join(', ') : 'None'}
                    </strong>
                  </span>
                  <SButton
                    variant="outline"
                    size="small"
                    disabled={selectedPortIds.length === 0}
                    onClick={() =>
                      toast.success(
                        `PoE power cycled on port(s) ${selectedPortIds.join(', ')}`,
                      )
                    }
                  >
                    Power Cycle PoE
                  </SButton>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'config',
      label: 'Config',
      children: activeDevice && (
        <DeviceConfigForm
          key={activeDevice.key}
          device={activeDevice}
          onClose={() => setActiveDeviceKey(null)}
          onSave={({ name, ip, mac }) => {
            setDevices((prev) =>
              prev.map((d) =>
                d.key === activeDevice.key ? { ...d, name, ip, mac } : d,
              ),
            );
            toast.success(`Saved configuration for ${name}`);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SPageHeader
        title="Devices"
        description="Live Omada Controller reference workspace — click any device row (especially Core-SW-Floor1) to inspect ports, telemetry, and configuration."
        extra={
          <>
            <SButton
              variant="secondary"
              icon={<Download size={15} />}
              onClick={() => toast.success('Exported device inventory CSV')}
            >
              Export
            </SButton>
            <SButton
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => toast.info('Scanning subnet 192.168.0.0/24 for pending devices...')}
            >
              Adopt Device
            </SButton>
          </>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SKpiCard
          title="Total Devices"
          value={counts.all}
          icon={<Activity size={16} className="text-[var(--omada-brand-text)]" />}
          meta="10 online · 2 attention"
          active={categoryFilter === 'all'}
          onClick={() => setCategoryFilter('all')}
        />
        <SKpiCard
          title="Gateways"
          value={counts.gateway}
          icon={<Router size={16} className="text-[var(--omada-brand-text)]" />}
          meta="Dual-WAN active"
          active={categoryFilter === 'gateway'}
          onClick={() => setCategoryFilter('gateway')}
        />
        <SKpiCard
          title="Switches"
          value={counts.switch}
          icon={<Network size={16} className="text-[var(--omada-color-info)]" />}
          meta="341.2W PoE draw"
          active={categoryFilter === 'switch'}
          onClick={() => setCategoryFilter('switch')}
        />
        <SKpiCard
          title="Access Points"
          value={counts.ap}
          icon={<Wifi size={16} className="text-[var(--omada-brand-text)]" />}
          meta="Wi-Fi 7 / Wi-Fi 6"
          active={categoryFilter === 'ap'}
          onClick={() => setCategoryFilter('ap')}
        />
        <SKpiCard
          title="Active Clients"
          value={counts.clients}
          icon={<Users size={16} className="text-[var(--omada-color-purple)]" />}
          meta="2.4G / 5G / 6G & Wired"
        />
      </div>

      {/* Main Devices Table */}
      <STable<DemoDevice>
        dataSource={filteredDevices}
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
        }}
        pagination={{ defaultPageSize: 10 }}
        toolbar={{
          tabs: (
            <STabs
              variant="capsule"
              activeKey={categoryFilter}
              onChange={setCategoryFilter}
              items={[
                { key: 'all', label: `All (${counts.all})` },
                { key: 'gateway', label: `Gateway (${counts.gateway})` },
                { key: 'switch', label: `Switches (${counts.switch})` },
                { key: 'ap', label: `APs (${counts.ap})` },
              ]}
            />
          ),
          searchValue: search,
          onSearchChange: setSearch,
          searchPlaceholder: 'Search name, model, IP, MAC...',
          actions: (
            <SButton
              variant="secondary"
              icon={<RefreshCw size={14} />}
              onClick={() => toast.success('Device telemetry refreshed')}
            >
              Refresh
            </SButton>
          ),
          selectedCount: selectedKeys.length,
          onClearSelection: () => setSelectedKeys([]),
          batchActions: (
            <>
              <SButton
                variant="outline"
                size="small"
                icon={<UploadCloud size={14} />}
                onClick={() => toast.loading(`Pushing firmware to ${selectedKeys.length} device(s)`)}
              >
                Upgrade
              </SButton>
              <SButton
                variant="secondary"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={() => toast.info(`Reboot queued for ${selectedKeys.length} device(s)`)}
              >
                Reboot
              </SButton>
              <SButton
                variant="danger-outline"
                size="small"
                icon={<Trash2 size={14} />}
                onClick={handleForgetSelected}
              >
                Forget
              </SButton>
            </>
          ),
        }}
      />

      {/* Device Detail Drawer */}
      <SDrawer
        open={Boolean(activeDevice)}
        onClose={() => setActiveDeviceKey(null)}
        size="md"
        title={
          activeDevice ? (
            <span className="inline-flex items-center gap-2.5">
              {activeDevice.productSlug ? (
                <SProductImage
                  name={activeDevice.productSlug}
                  size={28}
                  alt={activeDevice.model}
                  className="shrink-0 object-contain"
                  fallback={<SDeviceIcon type={activeDevice.iconType} size={26} />}
                />
              ) : (
                <SDeviceIcon type={activeDevice.iconType} size={26} />
              )}
              <span className="truncate">{activeDevice.name}</span>
            </span>
          ) : undefined
        }
        subtitle={
          activeDevice ? `${activeDevice.model} · ${activeDevice.mac}` : undefined
        }
        statusSlot={
          activeDevice ? <SDeviceStatus status={activeDevice.status} /> : undefined
        }
        headerTabs={
          <STabs
            variant="segment"
            activeKey={drawerTab}
            onChange={setDrawerTab}
            items={drawerTabItems.map(({ key, label }) => ({ key, label }))}
          />
        }
      >
        {drawerTabItems.find((item) => item.key === drawerTab)?.children}
      </SDrawer>
    </div>
  );
};
