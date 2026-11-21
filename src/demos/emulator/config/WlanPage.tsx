import React, { useMemo, useState } from 'react';
import { Checkbox, Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Filter as FilterFunnel, Info, Plus } from 'lucide-react';
import {
  SButton,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SPasswordInput,
  SSelect,
  SSwitch,
  useOmadaNotification,
} from '@/omada';
import {
  INITIAL_WLAN_OPTIMIZATION_HISTORY,
  INITIAL_WLAN_SSIDS,
  WLAN_CLIENT_SAMPLES,
  WLAN_OPTIMIZATION_RADIOS,
  type WlanBandKey,
  type WlanOptimizationHistoryRecord,
  type WlanOptimizationRadioRecord,
  type WlanSecurityType,
  type WlanSsidRecord,
} from './wlanAclData';

export interface WlanPageProps {
  /** Optional initial sub-tab override (`'ssid' | 'optimization' | 'history'`). */
  initialTab?: WlanSubTabKey;
}

type WlanSubTabKey = 'ssid' | 'optimization' | 'history';

const BAND_PILL_CLASS: Record<WlanBandKey, string> = {
  '2.4 GHz': 'is-24g',
  '5 GHz': 'is-5g',
  '6 GHz': 'is-6g',
};

interface SsidColumnToggle {
  key: string;
  label: string;
  defaultVisible: boolean;
  locked?: boolean;
}

const SSID_COLUMN_TOGGLES: SsidColumnToggle[] = [
  { key: 'ssidName', label: 'SSID Name', defaultVisible: true, locked: true },
  { key: 'enabled', label: 'Enabled', defaultVisible: true },
  { key: 'security', label: 'Security', defaultVisible: true },
  { key: 'band', label: 'Band', defaultVisible: true },
  { key: 'devices', label: 'Devices', defaultVisible: true },
  { key: 'clients', label: 'Clients', defaultVisible: true },
  { key: 'traffic', label: 'Traffic', defaultVisible: true },
  { key: 'vlan', label: 'VLAN', defaultVisible: true },
];

const DEFAULT_VISIBLE_SSID_COLS = SSID_COLUMN_TOGGLES.filter((c) => c.defaultVisible).map(
  (c) => c.key,
);

interface FilterOption {
  key: string;
  label: string;
}

const HeaderFilterPopover: React.FC<{
  title: string;
  value: string;
  options: FilterOption[];
  onSelect: (val: string) => void;
}> = ({ title, value, options, onSelect }) => (
  <div className="w-[180px] space-y-1" onClick={(e) => e.stopPropagation()}>
    <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
      {title}
    </div>
    {options.map((opt) => (
      <button
        key={opt.key}
        type="button"
        onClick={() => onSelect(opt.key)}
        className={`flex w-full cursor-pointer items-center justify-between rounded border-0 bg-transparent px-2 py-1 text-left text-xs transition-colors ${
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
 * Omada Controller v6.3.0.34 WLAN Workspace (`#/wlan`).
 * Replicates top `SSID | WLAN Optimization | Optimization History` tabs, `(?)` help,
 * `SSID Name` search + `+ Add SSID` toolbar, and the 9-column SSID table with colored
 * band pills (`2.4 GHz`, `5 GHz`, `6 GHz`), device/client links, and CRUD modals.
 */
export const WlanPage: React.FC<WlanPageProps> = ({ initialTab = 'ssid' }) => {
  const notification = useOmadaNotification();

  const [subTab, setSubTab] = useState<WlanSubTabKey>(initialTab);
  const [ssids, setSsids] = useState<WlanSsidRecord[]>(INITIAL_WLAN_SSIDS);
  const [search, setSearch] = useState<string>('');
  const [securityFilter, setSecurityFilter] = useState<string>('all');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [devicesFilter, setDevicesFilter] = useState<string>('all');
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_VISIBLE_SSID_COLS);

  const [securityPopoverOpen, setSecurityPopoverOpen] = useState(false);
  const [bandPopoverOpen, setBandPopoverOpen] = useState(false);
  const [devicesPopoverOpen, setDevicesPopoverOpen] = useState(false);

  // Add / Edit SSID Modal state
  const [ssidModalOpen, setSsidModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formSecurity, setFormSecurity] = useState<WlanSecurityType>('WPA-Personal');
  const [formPassphrase, setFormPassphrase] = useState('');
  const [formBands, setFormBands] = useState<WlanBandKey[]>(['2.4 GHz', '5 GHz']);
  const [formDevices, setFormDevices] = useState('All Devices');
  const [formVlan, setFormVlan] = useState('');
  const [formGuest, setFormGuest] = useState(false);
  const [formBroadcast, setFormBroadcast] = useState(true);

  // Preview modals
  const [devicesPreviewSsid, setDevicesPreviewSsid] = useState<WlanSsidRecord | null>(null);
  const [clientsPreviewSsid, setClientsPreviewSsid] = useState<WlanSsidRecord | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Optimization tab state
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [optSchedule, setOptSchedule] = useState('daily-0300');
  const [width5G, setWidth5G] = useState('80mhz');
  const [aiAvoidance, setAiAvoidance] = useState(true);
  const [historyList, setHistoryList] = useState<WlanOptimizationHistoryRecord[]>(
    INITIAL_WLAN_OPTIMIZATION_HISTORY,
  );
  const [historySearch, setHistorySearch] = useState('');

  const visibleColSet = useMemo(() => new Set(visibleCols), [visibleCols]);

  const filteredSsids = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ssids.filter((row) => {
      if (q && !row.ssidName.toLowerCase().includes(q)) return false;
      if (securityFilter !== 'all' && row.security !== securityFilter) return false;
      if (bandFilter !== 'all' && !row.bands.includes(bandFilter as WlanBandKey)) return false;
      if (devicesFilter !== 'all' && row.devicesLabel !== devicesFilter) return false;
      return true;
    });
  }, [ssids, search, securityFilter, bandFilter, devicesFilter]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return historyList;
    return historyList.filter(
      (item) =>
        item.trigger.toLowerCase().includes(q) ||
        item.changes24.toLowerCase().includes(q) ||
        item.changes5.toLowerCase().includes(q) ||
        item.changes6.toLowerCase().includes(q),
    );
  }, [historyList, historySearch]);

  const openCreateModal = () => {
    setEditingKey(null);
    setFormName('');
    setFormEnabled(true);
    setFormSecurity('WPA-Personal');
    setFormPassphrase('');
    setFormBands(['2.4 GHz', '5 GHz']);
    setFormDevices('All Devices');
    setFormVlan('');
    setFormGuest(false);
    setFormBroadcast(true);
    setSsidModalOpen(true);
  };

  const openEditModal = (record: WlanSsidRecord) => {
    setEditingKey(record.key);
    setFormName(record.ssidName);
    setFormEnabled(record.enabled);
    setFormSecurity(record.security);
    setFormPassphrase(record.passphrase ?? '');
    setFormBands(record.bands);
    setFormDevices(record.devicesLabel);
    setFormVlan(record.vlan === '-' ? '' : record.vlan);
    setFormGuest(Boolean(record.guestNetwork));
    setFormBroadcast(record.broadcastSsid ?? true);
    setSsidModalOpen(true);
  };

  const handleSaveSsid = () => {
    const cleanName = formName.trim();
    if (!cleanName) {
      notification.warning({
        title: 'SSID Name Required',
        description: 'Please enter a valid wireless network SSID name.',
      });
      return;
    }
    const chosenBands: WlanBandKey[] =
      formBands.length > 0 ? formBands : ['2.4 GHz', '5 GHz'];
    const cleanVlan = formVlan.trim() || '-';

    if (editingKey) {
      setSsids((prev) =>
        prev.map((item) =>
          item.key === editingKey
            ? {
                ...item,
                ssidName: cleanName,
                enabled: formEnabled,
                security: formSecurity,
                passphrase: formSecurity === 'None' ? undefined : formPassphrase || '••••••••',
                bands: chosenBands,
                devicesLabel: formDevices,
                apGroups:
                  formDevices === 'All Devices'
                    ? ['Default AP Group (3 APs)']
                    : ['Main Office Group (2 APs)', 'Break & Storage Group (1 AP)'],
                vlan: cleanVlan,
                guestNetwork: formGuest,
                broadcastSsid: formBroadcast,
              }
            : item,
        ),
      );
      notification.success({
        title: 'SSID Updated',
        description: `Wireless network "${cleanName}" settings saved.`,
      });
    } else {
      const next: WlanSsidRecord = {
        key: `ssid-${Date.now()}`,
        ssidName: cleanName,
        enabled: formEnabled,
        security: formSecurity,
        passphrase: formSecurity === 'None' ? undefined : formPassphrase || '••••••••',
        bands: chosenBands,
        devicesLabel: formDevices,
        apGroups:
          formDevices === 'All Devices'
            ? ['Default AP Group (3 APs)']
            : ['Main Office Group (2 APs)', 'Break & Storage Group (1 AP)'],
        clients: 0,
        traffic: '-',
        vlan: cleanVlan,
        guestNetwork: formGuest,
        broadcastSsid: formBroadcast,
      };
      setSsids((prev) => [...prev, next]);
      notification.success({
        title: 'SSID Created',
        description: `Wireless network "${cleanName}" broadcast queued on ${formDevices}.`,
      });
    }
    setSsidModalOpen(false);
  };

  const handleToggleEnabled = (record: WlanSsidRecord, checked: boolean) => {
    setSsids((prev) =>
      prev.map((item) => (item.key === record.key ? { ...item, enabled: checked } : item)),
    );
    notification.info({
      title: checked ? 'SSID Enabled' : 'SSID Disabled',
      description: `${record.ssidName} is now ${checked ? 'broadcasting' : 'disabled'}.`,
    });
  };

  const handleDeleteSsid = (record: WlanSsidRecord) => {
    setSsids((prev) => prev.filter((item) => item.key !== record.key));
    notification.success({
      title: 'SSID Removed',
      description: `Deleted wireless network "${record.ssidName}".`,
    });
  };

  const handleRunOptimization = () => {
    const newEntry: WlanOptimizationHistoryRecord = {
      key: `opt-${Date.now()}`,
      time: '2026-11-21 11:45:00',
      trigger: 'Manual',
      apCount: 3,
      changes24: 'Auto-balanced Ch 1 / 6 / 11',
      changes5: `Set ${width5G === '160mhz' ? '160 MHz' : width5G === '40mhz' ? '40 MHz' : '80 MHz'} width`,
      changes6: 'Verified 6 GHz PSC Channel 37',
      status: 'Succeeded',
    };
    setHistoryList((prev) => [newEntry, ...prev]);
    notification.success({
      title: 'WLAN Optimization Completed',
      description: 'Analyzed RF spectrum across 3 APs and recorded results in Optimization History.',
    });
  };

  const columnSelectorContent = (
    <div className="w-[190px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-1.5">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Display Columns
        </span>
        <button
          type="button"
          onClick={() => setVisibleCols(DEFAULT_VISIBLE_SSID_COLS)}
          className="cursor-pointer border-0 bg-transparent p-0 text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>
      <div className="space-y-1">
        {SSID_COLUMN_TOGGLES.map((col) => {
          const checked = visibleColSet.has(col.key);
          return (
            <label
              key={col.key}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs ${
                col.locked ? 'cursor-not-allowed opacity-65' : 'cursor-pointer hover:bg-[var(--omada-bg-field)]'
              }`}
            >
              <Checkbox
                checked={checked}
                disabled={col.locked}
                onChange={() =>
                  !col.locked &&
                  setVisibleCols((prev) =>
                    prev.includes(col.key) ? prev.filter((k) => k !== col.key) : [...prev, col.key],
                  )
                }
              />
              <span className="text-[var(--omada-text-primary)]">{col.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const columns: ColumnsType<WlanSsidRecord> = useMemo(() => {
    const cols: ColumnsType<WlanSsidRecord> = [];

    if (visibleColSet.has('ssidName')) {
      cols.push({
        title: 'SSID Name',
        dataIndex: 'ssidName',
        key: 'ssidName',
        width: 165,
        render: (name: string) => (
          <span className="font-normal text-[var(--omada-text-primary)]">{name}</span>
        ),
      });
    }

    if (visibleColSet.has('enabled')) {
      cols.push({
        title: 'Enabled',
        dataIndex: 'enabled',
        key: 'enabled',
        width: 112,
        render: (enabled: boolean, record) => (
          <SSwitch
            checked={enabled}
            aria-label={`Toggle ${record.ssidName}`}
            onChange={(checked) => handleToggleEnabled(record, checked)}
          />
        ),
      });
    }

    if (visibleColSet.has('security')) {
      cols.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Security</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={securityPopoverOpen}
              onOpenChange={setSecurityPopoverOpen}
              styles={{ container: { padding: 12 } }}
              content={
                <HeaderFilterPopover
                  title="Filter by Security"
                  value={securityFilter}
                  options={[
                    { key: 'all', label: 'All Security Types' },
                    { key: 'None', label: 'None' },
                    { key: 'WPA-Personal', label: 'WPA-Personal' },
                    { key: 'WPA-Enterprise', label: 'WPA-Enterprise' },
                    { key: 'WPA3-Personal', label: 'WPA3-Personal' },
                  ]}
                  onSelect={(val) => {
                    setSecurityFilter(val);
                    setSecurityPopoverOpen(false);
                  }}
                />
              }
            >
              <button
                type="button"
                aria-label="Filter Security column"
                className={`omada-cfg-col-filter-btn ${
                  securityFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'security',
        key: 'security',
        width: 138,
      });
    }

    if (visibleColSet.has('band')) {
      cols.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Band</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={bandPopoverOpen}
              onOpenChange={setBandPopoverOpen}
              styles={{ container: { padding: 12 } }}
              content={
                <HeaderFilterPopover
                  title="Filter by Band"
                  value={bandFilter}
                  options={[
                    { key: 'all', label: 'All Bands' },
                    { key: '2.4 GHz', label: '2.4 GHz' },
                    { key: '5 GHz', label: '5 GHz' },
                    { key: '6 GHz', label: '6 GHz' },
                  ]}
                  onSelect={(val) => {
                    setBandFilter(val);
                    setBandPopoverOpen(false);
                  }}
                />
              }
            >
              <button
                type="button"
                aria-label="Filter Band column"
                className={`omada-cfg-col-filter-btn ${
                  bandFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'bands',
        key: 'band',
        width: 215,
        render: (bands: WlanBandKey[]) => (
          <div className="flex flex-wrap items-center gap-1.5">
            {bands.map((band) => (
              <span
                key={band}
                className={`omada-wlan-band-pill ${BAND_PILL_CLASS[band]}`}
              >
                {band}
              </span>
            ))}
          </div>
        ),
      });
    }

    if (visibleColSet.has('devices')) {
      cols.push({
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Devices</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={devicesPopoverOpen}
              onOpenChange={setDevicesPopoverOpen}
              styles={{ container: { padding: 12 } }}
              content={
                <HeaderFilterPopover
                  title="Filter by Devices"
                  value={devicesFilter}
                  options={[
                    { key: 'all', label: 'All Assignments' },
                    { key: 'All Devices', label: 'All Devices' },
                    { key: '2 Groups (3 APs)', label: '2 Groups (3 APs)' },
                  ]}
                  onSelect={(val) => {
                    setDevicesFilter(val);
                    setDevicesPopoverOpen(false);
                  }}
                />
              }
            >
              <button
                type="button"
                aria-label="Filter Devices column"
                className={`omada-cfg-col-filter-btn ${
                  devicesFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FilterFunnel size={12} fill="currentColor" strokeWidth={1.5} />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'devicesLabel',
        key: 'devices',
        width: 170,
        render: (label: string, record) => (
          <button
            type="button"
            className="omada-cfg-link-btn"
            onClick={() => setDevicesPreviewSsid(record)}
          >
            {label}
          </button>
        ),
      });
    }

    if (visibleColSet.has('clients')) {
      cols.push({
        title: 'Clients',
        dataIndex: 'clients',
        key: 'clients',
        width: 100,
        render: (clients: number, record) => (
          <button
            type="button"
            className="omada-cfg-link-btn tabular-nums"
            aria-label={`View ${clients} clients on ${record.ssidName}`}
            onClick={() => setClientsPreviewSsid(record)}
          >
            <SIcon name="icon-icon-tabler-icon-users" size={15} />
            <span>{clients}</span>
          </button>
        ),
      });
    }

    if (visibleColSet.has('traffic')) {
      cols.push({
        title: 'Traffic',
        dataIndex: 'traffic',
        key: 'traffic',
        width: 86,
        render: (val: string) => (
          <span className="tabular-nums text-[var(--omada-text-secondary)]">{val}</span>
        ),
      });
    }

    if (visibleColSet.has('vlan')) {
      cols.push({
        title: 'VLAN',
        dataIndex: 'vlan',
        key: 'vlan',
        width: 78,
        render: (val: string) => (
          <span className="tabular-nums text-[var(--omada-text-secondary)]">{val}</span>
        ),
      });
    }

    cols.push({
      title: (
        <div className="flex items-center justify-between gap-2">
          <span>Action</span>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={columnSelectorContent}
            styles={{ container: { padding: 12 } }}
          >
            <button
              type="button"
              aria-label="Customize SSID table columns"
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="more-4" size={16} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 104,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Tooltip title="Edit SSID">
            <button
              type="button"
              aria-label={`Edit ${record.ssidName}`}
              onClick={() => openEditModal(record)}
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="edit" size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete SSID">
            <button
              type="button"
              aria-label={`Delete ${record.ssidName}`}
              onClick={() => handleDeleteSsid(record)}
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="delete" size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    });

    return cols;
  }, [
    visibleColSet,
    securityPopoverOpen,
    securityFilter,
    bandPopoverOpen,
    bandFilter,
    devicesPopoverOpen,
    devicesFilter,
  ]);

  const radioColumns: ColumnsType<WlanOptimizationRadioRecord> = [
    {
      title: 'AP Name',
      dataIndex: 'apName',
      key: 'apName',
      render: (val: string) => (
        <span className="font-medium text-[var(--omada-text-primary)]">{val}</span>
      ),
    },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: '2.4 GHz Channel', dataIndex: 'band24Channel', key: 'band24Channel' },
    { title: '2.4 GHz Power', dataIndex: 'band24Power', key: 'band24Power' },
    { title: '5 GHz Channel', dataIndex: 'band5Channel', key: 'band5Channel' },
    { title: '5 GHz Power', dataIndex: 'band5Power', key: 'band5Power' },
    { title: '6 GHz Channel', dataIndex: 'band6Channel', key: 'band6Channel' },
    { title: 'Interference', dataIndex: 'interference', key: 'interference' },
  ];

  const historyColumns: ColumnsType<WlanOptimizationHistoryRecord> = [
    {
      title: 'Optimization Time',
      dataIndex: 'time',
      key: 'time',
      render: (t: string) => <span className="tabular-nums">{t}</span>,
    },
    { title: 'Trigger', dataIndex: 'trigger', key: 'trigger' },
    { title: 'APs Tuned', dataIndex: 'apCount', key: 'apCount' },
    { title: '2.4 GHz Changes', dataIndex: 'changes24', key: 'changes24' },
    { title: '5 GHz Changes', dataIndex: 'changes5', key: 'changes5' },
    { title: '6 GHz Changes', dataIndex: 'changes6', key: 'changes6' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
  ];

  return (
    <div className="omada-wlan-page px-6 pt-4 pb-6">
      {/* Top Underline Tabs + Help Icon */}
      <div className="flex items-center justify-between border-b border-[var(--omada-border-divider)]">
        <div role="tablist" aria-label="WLAN configuration tabs" className="flex items-center gap-8">
          {(
            [
              { key: 'ssid', label: 'SSID' },
              { key: 'optimization', label: 'WLAN Optimization' },
              { key: 'history', label: 'Optimization History' },
            ] as const
          ).map((tab) => {
            const isActive = subTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSubTab(tab.key)}
                className={`omada-cfg-subtab-btn cursor-pointer pb-2.5 text-[18px] leading-[26px] ${
                  isActive ? 'is-active font-medium' : 'font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="omada-cfg-subtab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
                )}
              </button>
            );
          })}
        </div>

        <Tooltip title="WLAN Help">
          <button
            type="button"
            aria-label="WLAN help"
            onClick={() => setHelpOpen(true)}
            className="omada-cfg-help-btn mb-1.5"
          >
            <SIcon name="question" size={20} />
          </button>
        </Tooltip>
      </div>

      {/* Tab 1: SSID */}
      {subTab === 'ssid' && (
        <>
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <SInput
              variant="filled"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SSID Name"
              aria-label="Search SSID Name"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
              className="omada-cfg-search"
              style={{ width: 260 }}
            />

            <SButton
              variant="primary"
              className="omada-cfg-primary-btn"
              icon={<Plus size={14} />}
              onClick={openCreateModal}
            >
              Add SSID
            </SButton>
          </div>

          <div className="omada-cfg-table-shell">
            <Table<WlanSsidRecord>
              className="omada-cfg-table"
              rowKey="key"
              dataSource={filteredSsids}
              columns={columns}
              pagination={false}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No SSIDs Found"
                    description="Adjust search or column filters, or click + Add SSID to create a wireless network."
                  />
                ),
              }}
            />
          </div>
        </>
      )}

      {/* Tab 2: WLAN Optimization */}
      {subTab === 'optimization' && (
        <div className="mt-4 space-y-5">
          <div className="omada-cfg-info-banner">
            <Info size={16} className="mt-0.5 shrink-0 text-[var(--omada-color-info)]" />
            <span>
              AI WLAN Optimization evaluates co-channel interference, radar DFS events, and client
              density across all site APs to tune 2.4 GHz, 5 GHz, and 6 GHz channels and transmit
              power automatically.
            </span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 pr-9">
            <div className="space-y-4">
              <div className="omada-cfg-form-row">
                <span className="omada-cfg-form-label">Scheduled Optimization</span>
                <div className="omada-cfg-form-control flex items-center gap-3">
                  <SSwitch
                    checked={autoOptimize}
                    aria-label="Scheduled Optimization"
                    onChange={setAutoOptimize}
                  />
                  <span className="text-[13px] text-[var(--omada-text-secondary)]">
                    {autoOptimize ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="omada-cfg-form-row">
                <span className="omada-cfg-form-label">Optimization Schedule</span>
                <div className="omada-cfg-form-control">
                  <SSelect
                    value={optSchedule}
                    onChange={setOptSchedule}
                    disabled={!autoOptimize}
                    className="w-full"
                    options={[
                      { label: 'Daily at 03:00 AM', value: 'daily-0300' },
                      { label: 'Weekly on Sunday 02:00 AM', value: 'weekly-sun' },
                      { label: 'Off-Peak Only (00:00 - 05:00)', value: 'offpeak' },
                    ]}
                  />
                </div>
              </div>

              <div className="omada-cfg-form-row">
                <span className="omada-cfg-form-label">5 GHz Channel Width</span>
                <div className="omada-cfg-form-control">
                  <SSelect
                    value={width5G}
                    onChange={setWidth5G}
                    className="w-full"
                    options={[
                      { label: '40 MHz (High Density)', value: '40mhz' },
                      { label: '80 MHz (Balanced)', value: '80mhz' },
                      { label: '160 MHz (Max Throughput)', value: '160mhz' },
                    ]}
                  />
                </div>
              </div>

              <div className="omada-cfg-form-row">
                <span className="omada-cfg-form-label">Interference Avoidance</span>
                <div className="omada-cfg-form-control flex items-center gap-3">
                  <SSwitch
                    checked={aiAvoidance}
                    aria-label="Interference Avoidance"
                    onChange={setAiAvoidance}
                  />
                  <span className="text-[13px] text-[var(--omada-text-secondary)]">
                    Avoid adjacent co-channel neighbor APs
                  </span>
                </div>
              </div>
            </div>

            <SButton
              variant="primary"
              className="omada-cfg-primary-btn"
              onClick={handleRunOptimization}
            >
              Optimize Now
            </SButton>
          </div>

          <div className="omada-cfg-section-divider pt-4">
            <h3 className="m-0 mb-3 text-[15px] font-semibold text-[var(--omada-text-primary)]">
              Current AP Radio Calibration
            </h3>
            <div className="omada-cfg-table-shell">
              <Table<WlanOptimizationRadioRecord>
                className="omada-cfg-table"
                rowKey="key"
                dataSource={WLAN_OPTIMIZATION_RADIOS}
                columns={radioColumns}
                pagination={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Optimization History */}
      {subTab === 'history' && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 pr-9">
            <SInput
              variant="filled"
              allowClear
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search optimization changes"
              aria-label="Search optimization history"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
              className="omada-cfg-search"
              style={{ width: 260 }}
            />
            <span className="text-[13px] text-[var(--omada-text-secondary)]">
              {filteredHistory.length} recorded run(s)
            </span>
          </div>

          <div className="omada-cfg-table-shell">
            <Table<WlanOptimizationHistoryRecord>
              className="omada-cfg-table"
              rowKey="key"
              dataSource={filteredHistory}
              columns={historyColumns}
              pagination={false}
            />
          </div>
        </div>
      )}

      {/* Add / Edit SSID Modal */}
      <SModal
        size="default"
        title={editingKey ? 'Edit SSID' : 'Add SSID'}
        open={ssidModalOpen}
        onCancel={() => setSsidModalOpen(false)}
        onOk={handleSaveSsid}
        okText={editingKey ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <div className="space-y-3.5 py-1">
          <div className="omada-cfg-modal-field-row">
            <label htmlFor="wlan-ssid-name-input" className="omada-cfg-modal-label">
              SSID Name
            </label>
            <SInput
              id="wlan-ssid-name-input"
              variant="filled"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Guest_WiFi_6E"
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Enabled</span>
            <SSwitch checked={formEnabled} onChange={setFormEnabled} aria-label="SSID Enabled" />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Band</span>
            <Checkbox.Group
              value={formBands}
              onChange={(vals) => setFormBands(vals as WlanBandKey[])}
              options={[
                { label: '2.4 GHz', value: '2.4 GHz' },
                { label: '5 GHz', value: '5 GHz' },
                { label: '6 GHz', value: '6 GHz' },
              ]}
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Security</span>
            <SSelect
              value={formSecurity}
              onChange={(val) => setFormSecurity(val as WlanSecurityType)}
              className="w-full"
              options={[
                { label: 'None', value: 'None' },
                { label: 'WPA-Personal', value: 'WPA-Personal' },
                { label: 'WPA-Enterprise', value: 'WPA-Enterprise' },
                { label: 'WPA3-Personal', value: 'WPA3-Personal' },
              ]}
            />
          </div>

          {formSecurity !== 'None' && (
            <div className="omada-cfg-modal-field-row">
              <span className="omada-cfg-modal-label">Security Key</span>
              <SPasswordInput
                value={formPassphrase}
                onChange={(e) => setFormPassphrase(e.target.value)}
                placeholder="8-63 characters"
              />
            </div>
          )}

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">AP Assignment</span>
            <SSelect
              value={formDevices}
              onChange={setFormDevices}
              className="w-full"
              options={[
                { label: 'All Devices', value: 'All Devices' },
                { label: '2 Groups (3 APs)', value: '2 Groups (3 APs)' },
              ]}
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">VLAN ID</span>
            <SInput
              variant="filled"
              value={formVlan}
              onChange={(e) => setFormVlan(e.target.value)}
              placeholder="Optional (e.g. 100)"
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Options</span>
            <div className="flex items-center gap-5">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[var(--omada-text-primary)]">
                <Checkbox checked={formGuest} onChange={(e) => setFormGuest(e.target.checked)} />
                <span>Guest Network</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[var(--omada-text-primary)]">
                <Checkbox
                  checked={formBroadcast}
                  onChange={(e) => setFormBroadcast(e.target.checked)}
                />
                <span>Broadcast SSID</span>
              </label>
            </div>
          </div>
        </div>
      </SModal>

      {/* AP Groups Preview Modal */}
      <SModal
        size="sm"
        title={`Device Assignment · ${devicesPreviewSsid?.ssidName ?? ''}`}
        open={Boolean(devicesPreviewSsid)}
        onCancel={() => setDevicesPreviewSsid(null)}
        onOk={() => setDevicesPreviewSsid(null)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Close"
        destroyOnHidden
      >
        <div className="space-y-3 text-[13px] text-[var(--omada-text-secondary)]">
          <div>
            <strong className="text-[var(--omada-text-primary)]">Assignment Scope:</strong>{' '}
            {devicesPreviewSsid?.devicesLabel}
          </div>
          <div className="space-y-1.5">
            {devicesPreviewSsid?.apGroups.map((grp) => (
              <div
                key={grp}
                className="rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-3 py-2 text-[var(--omada-text-primary)]"
              >
                {grp}
              </div>
            ))}
          </div>
          <div className="text-xs text-[var(--omada-text-tertiary)]">
            Active APs: COOOffice_Eap_1, BreakRoom_Eap_2, StorageRoom_Eap_3
          </div>
        </div>
      </SModal>

      {/* Connected Clients Preview Modal */}
      <SModal
        size="default"
        title={`Connected Wireless Clients · ${clientsPreviewSsid?.ssidName ?? ''}`}
        open={Boolean(clientsPreviewSsid)}
        onCancel={() => setClientsPreviewSsid(null)}
        onOk={() => setClientsPreviewSsid(null)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Close"
        destroyOnHidden
      >
        {clientsPreviewSsid && (WLAN_CLIENT_SAMPLES[clientsPreviewSsid.key]?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {WLAN_CLIENT_SAMPLES[clientsPreviewSsid.key].map((client) => (
              <div
                key={client.key}
                className="flex items-center justify-between rounded-[6px] border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-3 py-2 text-[13px]"
              >
                <div>
                  <div className="font-medium text-[var(--omada-text-primary)]">{client.name}</div>
                  <div className="text-xs text-[var(--omada-text-tertiary)]">
                    {client.mac} · {client.ip} · {client.ap}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`omada-wlan-band-pill ${BAND_PILL_CLASS[client.band]}`}>
                    {client.band}
                  </span>
                  <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
                    {client.signal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SEmpty
            title="No Connected Clients"
            description="No active wireless stations are currently associated with this SSID."
          />
        )}
      </SModal>

      {/* WLAN Help Modal */}
      <SModal
        size="sm"
        title="WLAN Configuration Help"
        open={helpOpen}
        onCancel={() => setHelpOpen(false)}
        onOk={() => setHelpOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Got It"
        destroyOnHidden
      >
        <div className="space-y-2 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
          <p className="m-0">
            Configure wireless networks (SSIDs) across 2.4 GHz, 5 GHz, and 6 GHz radios, assign
            AP device groups, and run AI WLAN Optimization to reduce RF interference.
          </p>
        </div>
      </SModal>
    </div>
  );
};
