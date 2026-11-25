import React, { useMemo, useState } from 'react';
import '@chenyqthu/omada-ui-kit/style.css';
import {
  OmadaAgentProvider,
  OmadaProvider,
  SButton,
  SDescriptions,
  SDetailInspectorDrawer,
  SDeviceStatus,
  SEmulatorShell,
  SFilterTableBlock,
  SIcon,
  SProductImage,
  SSelect,
  STag,
  useOmadaAgentAction,
  type ColumnsType,
  type DeviceStatusType,
  type OmadaProductName,
} from '@chenyqthu/omada-ui-kit';

interface DeviceRow {
  key: string;
  name: string;
  model: string;
  slug: OmadaProductName;
  status: DeviceStatusType;
  ip: string;
  mac: string;
  clients: number;
  firmware: string;
}

const INITIAL_DEVICES: DeviceRow[] = [
  { key: '1', name: 'EAP650-Lobby', model: 'EAP650', slug: 'eap650', status: 'connected', ip: '192.168.10.21', mac: 'A8-42-A1-10-22-01', clients: 38, firmware: '1.4.2 Build 202611' },
  { key: '2', name: 'EAP650-Meeting', model: 'EAP650', slug: 'eap650', status: 'connected', ip: '192.168.10.22', mac: 'A8-42-A1-10-22-02', clients: 24, firmware: '1.4.2 Build 202611' },
  { key: '3', name: 'EAP610-Courtyard', model: 'EAP610-Outdoor', slug: 'eap610-outdoor-un-1-30', status: 'heartbeat-missed', ip: '192.168.10.35', mac: 'B0-95-75-42-11-09', clients: 4, firmware: '1.3.0 Build 202609' },
];

const UPGRADED_FIRMWARE = '1.5.0 Build 202611';

const InventoryContent: React.FC = () => {
  const [activeKey, setActiveKey] = useState('devices');
  const [devices, setDevices] = useState<DeviceRow[]>(INITIAL_DEVICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selected = useMemo(
    () => devices.find((d) => d.key === selectedKey) ?? null,
    [devices, selectedKey],
  );

  const handleBatchUpgrade = () => {
    let upgradedCount = 0;
    setDevices((prev) =>
      prev.map((d) => {
        if (d.status === 'connected') {
          upgradedCount += 1;
          return { ...d, firmware: UPGRADED_FIRMWARE };
        }
        return d;
      }),
    );
    return { upgradedCount, firmware: UPGRADED_FIRMWARE };
  };

  useOmadaAgentAction({
    id: 'devices.inspectByName',
    label: 'Inspect Device in Drawer',
    description: 'Opens the 2-stage SDetailInspectorDrawer for a device matched by name, IP, or key.',
    handler: (query) => {
      const q = String(query ?? '').trim().toLowerCase();
      const target = devices.find(
        (d) =>
          d.key === q ||
          d.name.toLowerCase() === q ||
          d.ip === q ||
          d.name.toLowerCase().includes(q),
      );
      if (!target) {
        throw new Error(`Device "${String(query)}" not found.`);
      }
      setSelectedKey(target.key);
      return { key: target.key, name: target.name, status: target.status };
    },
  });

  useOmadaAgentAction({
    id: 'devices.resetFilters',
    label: 'Reset Device Filters',
    description: 'Clears search input and resets status filter to "all".',
    handler: () => {
      setSearch('');
      setStatusFilter('all');
      return { totalDevices: devices.length };
    },
  });

  useOmadaAgentAction({
    id: 'devices.batchUpgradeConnected',
    label: 'Batch Upgrade Connected APs',
    description: 'Upgrades all connected devices to firmware 1.5.0 Build 202611.',
    handler: () => handleBatchUpgrade(),
  });

  const filtered = useMemo(
    () =>
      devices.filter((d) => {
        const matchSearch =
          !search.trim() ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.ip.includes(search);
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [devices, search, statusFilter],
  );

  const columns: ColumnsType<DeviceRow> = [
    {
      title: 'Device Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SProductImage name={row.slug} size={30} />
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--omada-text-tertiary)' }}>{row.model}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: DeviceStatusType) => <SDeviceStatus status={v} />,
    },
    { title: 'IP Address', dataIndex: 'ip', key: 'ip' },
    {
      title: 'Clients',
      dataIndex: 'clients',
      key: 'clients',
      render: (n: number) => <STag color="blue">{n}</STag>,
    },
    { title: 'Firmware', dataIndex: 'firmware', key: 'firmware' },
  ];

  return (
    <SEmulatorShell
      activeKey={activeKey}
      onSelect={setActiveKey}
      controllerName="Headquarters Building"
    >
      <div style={{ padding: '16px 24px' }}>
        <SFilterTableBlock<DeviceRow>
          agentId="devices.table"
          title="Managed Devices"
          subtitle={`${filtered.length} online or pending`}
          searchPlaceholder="Search device name or IP"
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <SSelect
              agentId="devices.statusFilter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(String(val))}
              style={{ width: 170 }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'connected', label: 'Connected' },
                { value: 'heartbeat-missed', label: 'Heartbeat Missed' },
              ]}
            />
          }
          primaryAction={
            <SButton
              variant="primary"
              icon={<SIcon name="refresh" size={14} />}
              onClick={handleBatchUpgrade}
            >
              Batch Upgrade
            </SButton>
          }
          tableProps={{
            rowKey: 'key',
            dataSource: filtered,
            pagination: false,
            columns,
            onRow: (row) => ({
              onClick: () => setSelectedKey(row.key),
              style: { cursor: 'pointer' },
            }),
          }}
        />
      </div>

      <SDetailInspectorDrawer
        agentId="devices.inspector"
        open={Boolean(selected)}
        onClose={() => setSelectedKey(null)}
        title={selected?.name ?? ''}
        subtitle={selected?.model}
        icon={selected ? <SProductImage name={selected.slug} size={28} /> : undefined}
        status={selected?.status}
        tabs={
          selected
            ? [
                {
                  key: 'overview',
                  label: 'Overview',
                  content: (
                    <SDescriptions
                      column={1}
                      items={[
                        { key: 'ip', label: 'IP Address', children: selected.ip },
                        { key: 'mac', label: 'MAC Address', children: selected.mac },
                        { key: 'fw', label: 'Firmware', children: selected.firmware },
                        { key: 'clients', label: 'Connected Clients', children: selected.clients },
                      ]}
                    />
                  ),
                },
                {
                  key: 'radios',
                  label: 'Radios',
                  content: (
                    <div style={{ color: 'var(--omada-text-secondary)' }}>
                      2.4 GHz (Ch 6 / 20 MHz) · 5 GHz (Ch 36 / 80 MHz)
                    </div>
                  ),
                },
              ]
            : undefined
        }
      />
    </SEmulatorShell>
  );
};

export const InventoryTemplate: React.FC = () => (
  <OmadaProvider defaultThemeMode="light">
    <OmadaAgentProvider exposeWindowBridge>
      <InventoryContent />
    </OmadaAgentProvider>
  </OmadaProvider>
);
