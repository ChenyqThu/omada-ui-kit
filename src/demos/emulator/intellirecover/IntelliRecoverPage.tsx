import React, { useMemo, useState } from 'react';
import { Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import {
  SButton,
  SEmpty,
  SIcon,
  SIllustration,
  SInput,
  SModal,
  SNumberInput,
  SProductImage,
  SSelect,
  SSwitch,
  useOmadaNotification,
} from '@/omada';
import {
  DEFAULT_INTELLIRECOVER_POLICY,
  EMULATOR_INTELLIRECOVER_CANDIDATES,
  EMULATOR_INTELLIRECOVER_DEVICES,
  type EmulatorIntelliRecoverDeviceRecord,
  type EmulatorIntelliRecoverHistoryEntry,
  type IntelliRecoverPolicyConfig,
  type IntelliRecoverStatus,
  type IntelliRecoverTargetTab,
} from './intelliRecoverData';

export { EMULATOR_INTELLIRECOVER_DEVICES };

export interface IntelliRecoverPageProps {
  /** Invoked when clicking a monitored device row or Uplink link. */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Optional initial monitored device list override. */
  initialDevices?: EmulatorIntelliRecoverDeviceRecord[];
}

type DeviceConnStatusFilter = 'all' | 'Connected' | 'Disconnected';
type RecoveryStatusFilter = 'all' | IntelliRecoverStatus;

const FunnelGlyph: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1.5 2.25H10.5L7.125 6.375V9.375L4.875 10.35V6.375L1.5 2.25Z"
      fill="currentColor"
    />
  </svg>
);

const RECOVERY_STATUS_META: Record<
  IntelliRecoverStatus,
  { label: string; color: string }
> = {
  monitoring: { label: 'Monitoring', color: 'var(--omada-brand-hover)' },
  recovering: { label: 'Recovering', color: 'var(--omada-color-warning)' },
  paused: { label: 'Paused', color: 'var(--omada-text-tertiary)' },
};

/**
 * Omada Controller v6.3.0.34 IntelliRecover Workspace (`#/intelli-recover`).
 * Replicates the hero feature banner with official Figma illustration, toggle switch,
 * editable PoE auto-reboot policy modal, Devices | Clients filter, search bar, `+ Add` action,
 * and horizontally scrollable table with sticky right Actions & clickable Uplink links.
 */
export const IntelliRecoverPage: React.FC<IntelliRecoverPageProps> = ({
  onOpenDeviceByName,
  initialDevices = EMULATOR_INTELLIRECOVER_DEVICES,
}) => {
  const notification = useOmadaNotification();

  const [policy, setPolicy] = useState<IntelliRecoverPolicyConfig>(
    DEFAULT_INTELLIRECOVER_POLICY,
  );
  const [devices, setDevices] =
    useState<EmulatorIntelliRecoverDeviceRecord[]>(initialDevices);
  const [clients, setClients] = useState<EmulatorIntelliRecoverDeviceRecord[]>([]);

  const [targetTab, setTargetTab] = useState<IntelliRecoverTargetTab>('devices');
  const [search, setSearch] = useState<string>('');
  const [deviceStatusFilter, setDeviceStatusFilter] =
    useState<DeviceConnStatusFilter>('all');
  const [recoveryStatusFilter, setRecoveryStatusFilter] =
    useState<RecoveryStatusFilter>('all');
  const [deviceStatusPopoverOpen, setDeviceStatusPopoverOpen] = useState(false);
  const [recoveryStatusPopoverOpen, setRecoveryStatusPopoverOpen] = useState(false);

  // Policy Edit Modal state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [draftPolicy, setDraftPolicy] = useState<IntelliRecoverPolicyConfig>(
    DEFAULT_INTELLIRECOVER_POLICY,
  );

  // Recovery History Modal state
  const [historyDeviceKey, setHistoryDeviceKey] = useState<string | null>(null);

  // Add Device Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCandidateKey, setSelectedCandidateKey] = useState<string>(
    EMULATOR_INTELLIRECOVER_CANDIDATES[0]?.key ?? 'custom',
  );
  const [customName, setCustomName] = useState('');
  const [customMac, setCustomMac] = useState('');
  const [customIp, setCustomIp] = useState('');

  const activeSourceList = targetTab === 'devices' ? devices : clients;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeSourceList.filter((item) => {
      if (
        deviceStatusFilter !== 'all' &&
        item.deviceStatus !== deviceStatusFilter
      ) {
        return false;
      }
      if (recoveryStatusFilter !== 'all' && item.status !== recoveryStatusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.ip.toLowerCase().includes(q) ||
        item.mac.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q)
      );
    });
  }, [activeSourceList, search, deviceStatusFilter, recoveryStatusFilter]);

  const historyDevice = useMemo(
    () =>
      devices.find((d) => d.key === historyDeviceKey) ??
      clients.find((c) => c.key === historyDeviceKey) ??
      null,
    [devices, clients, historyDeviceKey],
  );

  const handleToggleEnabled = (checked: boolean) => {
    setPolicy((prev) => ({ ...prev, enabled: checked }));
    notification.info({
      title: checked ? 'IntelliRecover Enabled' : 'IntelliRecover Disabled',
      description: checked
        ? `PoE watchdog active (${policy.offlineMinutes} min offline trigger, ${policy.maxRetries} retries).`
        : 'Automatic PoE power cycling paused for monitored devices.',
    });
  };

  const openPolicyModal = () => {
    setDraftPolicy(policy);
    setPolicyModalOpen(true);
  };

  const handleSavePolicy = () => {
    setPolicy({
      enabled: draftPolicy.enabled,
      offlineMinutes: Math.max(1, draftPolicy.offlineMinutes || 8),
      maxRetries: Math.max(1, draftPolicy.maxRetries || 10),
      retryIntervalMinutes: Math.max(1, draftPolicy.retryIntervalMinutes || 15),
    });
    setPolicyModalOpen(false);
    notification.success({
      title: 'Recovery Policy Updated',
      description: `Offline trigger: ${draftPolicy.offlineMinutes} min · Retries: ${draftPolicy.maxRetries} · Interval: ${draftPolicy.retryIntervalMinutes} min.`,
    });
  };

  const handlePowerCycle = (
    e: React.MouseEvent,
    record: EmulatorIntelliRecoverDeviceRecord,
  ) => {
    e.stopPropagation();
    const nextEntry: EmulatorIntelliRecoverHistoryEntry = {
      key: `hist-manual-${Date.now()}`,
      time: 'Sep 18, 2025 03:20:00 pm',
      reason: 'Manual PoE power cycle triggered by admin',
      action: `PoE Power Cycle (Port ${record.uplinkPort})`,
      result: 'Success',
    };
    const updateList = (list: EmulatorIntelliRecoverDeviceRecord[]) =>
      list.map((item) =>
        item.key === record.key
          ? {
              ...item,
              recoveryTimes: item.recoveryTimes + 1,
              status: 'recovering' as const,
              history: [nextEntry, ...item.history],
            }
          : item,
      );
    if (targetTab === 'devices') {
      setDevices(updateList);
    } else {
      setClients(updateList);
    }
    notification.warning({
      title: 'PoE Power Cycle Sent',
      description: `Cycling PoE power on ${record.uplinkLabel} for ${record.name}.`,
    });
  };

  const handleRemoveDevice = (
    e: React.MouseEvent,
    record: EmulatorIntelliRecoverDeviceRecord,
  ) => {
    e.stopPropagation();
    if (targetTab === 'devices') {
      setDevices((prev) => prev.filter((item) => item.key !== record.key));
    } else {
      setClients((prev) => prev.filter((item) => item.key !== record.key));
    }
    notification.success({
      title: 'Device Removed',
      description: `${record.name} removed from IntelliRecover monitoring.`,
    });
  };

  const handleAddSubmit = () => {
    const candidate = EMULATOR_INTELLIRECOVER_CANDIDATES.find(
      (c) => c.key === selectedCandidateKey,
    );
    const name =
      customName.trim() ||
      candidate?.name ||
      (targetTab === 'devices'
        ? `Lobby_Eap_${devices.length + 4}`
        : `PoE_Phone_${clients.length + 1}`);
    const mac =
      customMac.trim().toUpperCase() || candidate?.mac || '00-FF-00-6A-91-22';
    const ip =
      customIp.trim() ||
      candidate?.ip ||
      `192.168.0.${110 + devices.length + clients.length}`;
    const uplinkPort = candidate?.uplinkPort ?? 5;
    const uplinkDeviceName =
      candidate?.uplinkDeviceName ?? 'SalesDepartment_Switch_3';

    const nextRecord: EmulatorIntelliRecoverDeviceRecord = {
      key: `ir-custom-${Date.now()}`,
      name,
      type: targetTab === 'clients' ? 'Client' : candidate?.type ?? 'AP',
      model: candidate?.model ?? 'EAP650 v1.0',
      productSlug: candidate?.productSlug ?? 'eap650',
      deviceStatus: 'Connected',
      mac,
      ip,
      status: 'monitoring',
      recoveryTimes: 0,
      uplinkDeviceName,
      uplinkPort,
      uplinkLabel: `${uplinkDeviceName} - Port ${uplinkPort}`,
      history: [],
    };

    if (targetTab === 'devices') {
      setDevices((prev) => [...prev, nextRecord]);
    } else {
      setClients((prev) => [...prev, nextRecord]);
    }

    setAddModalOpen(false);
    setCustomName('');
    setCustomMac('');
    setCustomIp('');
    notification.success({
      title: 'Added to IntelliRecover',
      description: `${name} (${mac}) is now monitored via ${nextRecord.uplinkLabel}.`,
    });
  };

  const deviceStatusPopover = (
    <div className="w-[168px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Device Status
      </div>
      {(
        [
          { key: 'all', label: 'All' },
          { key: 'Connected', label: 'Connected' },
          { key: 'Disconnected', label: 'Disconnected' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setDeviceStatusFilter(opt.key);
            setDeviceStatusPopoverOpen(false);
          }}
          className={`flex w-full cursor-pointer items-center rounded border-none bg-transparent px-2 py-1 text-left text-xs transition-colors ${
            deviceStatusFilter === opt.key
              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const recoveryStatusPopover = (
    <div className="w-[168px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Recovery Status
      </div>
      {(
        [
          { key: 'all', label: 'All' },
          { key: 'monitoring', label: 'Monitoring' },
          { key: 'recovering', label: 'Recovering' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setRecoveryStatusFilter(opt.key);
            setRecoveryStatusPopoverOpen(false);
          }}
          className={`flex w-full cursor-pointer items-center rounded border-none bg-transparent px-2 py-1 text-left text-xs transition-colors ${
            recoveryStatusFilter === opt.key
              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const columns: ColumnsType<EmulatorIntelliRecoverDeviceRecord> = useMemo(
    () => [
      {
        title: '',
        key: 'thumbnail',
        width: 60,
        align: 'center',
        render: (_, record) => (
          <div className="flex items-center justify-center">
            <SProductImage
              name={record.productSlug}
              size={32}
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
        width: 162,
        render: (name: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">
            {name}
          </span>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 70,
        render: (type: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">
            {type}
          </span>
        ),
      },
      {
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
        width: 212,
        render: (model: string) => (
          <span className="text-[14px] text-[var(--omada-text-primary)]">
            {model}
          </span>
        ),
      },
      {
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Device Status</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={deviceStatusPopoverOpen}
              onOpenChange={setDeviceStatusPopoverOpen}
              content={deviceStatusPopover}
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter device status"
                onClick={(e) => e.stopPropagation()}
                className={`omada-logs-col-filter-btn ${
                  deviceStatusFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FunnelGlyph />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'deviceStatus',
        key: 'deviceStatus',
        width: 142,
        render: (status: EmulatorIntelliRecoverDeviceRecord['deviceStatus']) => (
          <span className="inline-flex items-center gap-2">
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{
                backgroundColor:
                  status === 'Connected'
                    ? 'var(--omada-brand-hover)'
                    : 'var(--omada-border-strong)',
              }}
            />
            <span className="text-[14px] text-[var(--omada-text-primary)]">
              {status}
            </span>
          </span>
        ),
      },
      {
        title: 'MAC Address',
        dataIndex: 'mac',
        key: 'mac',
        width: 164,
        render: (mac: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {mac}
          </span>
        ),
      },
      {
        title: 'IP Address',
        dataIndex: 'ip',
        key: 'ip',
        width: 122,
        render: (ip: string) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {ip}
          </span>
        ),
      },
      {
        title: (
          <span className="inline-flex items-center gap-1.5">
            <span>Status</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={recoveryStatusPopoverOpen}
              onOpenChange={setRecoveryStatusPopoverOpen}
              content={recoveryStatusPopover}
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter recovery status"
                onClick={(e) => e.stopPropagation()}
                className={`omada-logs-col-filter-btn ${
                  recoveryStatusFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FunnelGlyph />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'status',
        key: 'status',
        width: 112,
        render: (status: IntelliRecoverStatus) => {
          const meta = RECOVERY_STATUS_META[status];
          return (
            <span className="text-[14px]" style={{ color: meta.color }}>
              {meta.label}
            </span>
          );
        },
      },
      {
        title: 'Recovery Times',
        dataIndex: 'recoveryTimes',
        key: 'recoveryTimes',
        width: 135,
        render: (count: number) => (
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {count}
          </span>
        ),
      },
      {
        title: 'Uplink',
        dataIndex: 'uplinkLabel',
        key: 'uplinkLabel',
        width: 230,
        render: (_, record) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDeviceByName?.(record.uplinkDeviceName);
            }}
            className="omada-logs-entity-link text-[14px]"
          >
            {record.uplinkLabel}
          </button>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 132,
        fixed: 'end',
        render: (_, record) => (
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Recovery Log">
              <button
                type="button"
                aria-label={`View recovery logs for ${record.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setHistoryDeviceKey(record.key);
                }}
                className="omada-logs-row-action-btn"
              >
                <SIcon name="detail" size={16} />
              </button>
            </Tooltip>

            <Tooltip title="Manual Power Cycle">
              <button
                type="button"
                aria-label={`Manual power cycle ${record.name}`}
                onClick={(e) => handlePowerCycle(e, record)}
                className="omada-logs-row-action-btn"
              >
                <SIcon name="reboot" size={16} />
              </button>
            </Tooltip>

            <Tooltip title="Remove">
              <button
                type="button"
                aria-label={`Remove ${record.name}`}
                onClick={(e) => handleRemoveDevice(e, record)}
                className="omada-logs-row-action-btn"
              >
                <SIcon name="delete" size={16} />
              </button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [
      deviceStatusPopoverOpen,
      deviceStatusFilter,
      recoveryStatusPopoverOpen,
      recoveryStatusFilter,
      targetTab,
      onOpenDeviceByName,
    ],
  );

  const totalScrollWidth = useMemo(
    () =>
      columns.reduce(
        (sum, col) => sum + (typeof col.width === 'number' ? col.width : 140),
        0,
      ),
    [columns],
  );

  return (
    <div
      className="omada-recover-page px-6 pt-5 pb-6"
      data-testid="intellirecover-page"
    >
      {/* Hero Feature Banner */}
      <div className="mx-auto flex max-w-[900px] flex-col items-start gap-6 pt-2 pb-8 sm:flex-row sm:items-center sm:gap-14">
        <div className="shrink-0 pl-2">
          <SIllustration
            name="intellirecover-3"
            width={176}
            alt="IntelliRecover automated PoE healing"
          />
        </div>

        <div className="min-w-0 max-w-[645px] flex-1">
          <div className="flex items-center gap-3">
            <h1 className="m-0 text-[18px] font-semibold leading-[26px] text-[var(--omada-text-primary)]">
              IntelliRecover
            </h1>
            <SSwitch
              checked={policy.enabled}
              onChange={handleToggleEnabled}
              aria-label="Toggle IntelliRecover"
            />
          </div>

          <p className="m-0 mt-1.5 text-[13px] leading-[20px] text-[var(--omada-text-tertiary)]">
            Monitors the status of PoE devices, automatically repairing abnormal devices.
          </p>

          <p className="m-0 mt-2 text-[14px] leading-[22px] text-[var(--omada-text-primary)]">
            <span>
              Auto reboots devices through PoE power cycling after they go offline for{' '}
              {policy.offlineMinutes} minutes, retrying up to {policy.maxRetries} times at{' '}
              {policy.retryIntervalMinutes} minutes intervals.
            </span>
            <Tooltip title="Edit Recovery Policy">
              <button
                type="button"
                aria-label="Edit IntelliRecover policy"
                onClick={openPolicyModal}
                className="omada-recover-inline-edit-btn ml-1.5 align-middle"
              >
                <SIcon name="edit" size={16} />
              </button>
            </Tooltip>
          </p>
        </div>
      </div>

      {/* Toolbar: Devices | Clients + Search + Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label="IntelliRecover target filter"
            className="omada-logs-seg-track"
          >
            {(
              [
                { key: 'devices', label: 'Devices' },
                { key: 'clients', label: 'Clients' },
              ] as const
            ).map((item) => {
              const isActive = targetTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTargetTab(item.key)}
                  className={`omada-logs-seg-pill ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <SInput
            variant="filled"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              targetTab === 'devices'
                ? 'Search Device Name, IP or MAC'
                : 'Search Client Name, IP or MAC'
            }
            aria-label="Search IntelliRecover targets"
            suffix={
              <SIcon
                name="input-search"
                size={14}
                className="text-[var(--omada-text-tertiary)]"
              />
            }
            className="omada-recover-search"
            style={{ width: 260 }}
          />
        </div>

        <SButton
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setAddModalOpen(true)}
          className="omada-recover-primary-btn"
        >
          Add
        </SButton>
      </div>

      {/* Horizontally Scrollable Table */}
      <div className="omada-recover-table-shell mt-3">
        <Table<EmulatorIntelliRecoverDeviceRecord>
          rowKey="key"
          columns={columns}
          dataSource={filteredRows}
          pagination={false}
          scroll={{ x: totalScrollWidth }}
          locale={{
            emptyText: (
              <SEmpty
                title={
                  targetTab === 'devices'
                    ? 'No monitored PoE devices'
                    : 'No monitored PoE clients'
                }
                description={
                  targetTab === 'devices'
                    ? 'Adjust your search or click + Add to enroll PoE devices for automated recovery.'
                    : 'Click + Add to monitor PoE-powered endpoints such as IP cameras or VoIP phones.'
                }
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => onOpenDeviceByName?.(record.name),
          })}
          className="omada-recover-table"
        />
      </div>

      {/* Policy Edit Modal */}
      <SModal
        open={policyModalOpen}
        title="Edit IntelliRecover Policy"
        subtitle="Configure automated PoE power-cycling thresholds when monitored devices stop responding."
        size="default"
        okText="Save"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleSavePolicy}
        onCancel={() => setPolicyModalOpen(false)}
      >
        <div className="space-y-4 py-2">
          <div className="overflow-hidden rounded-[8px] border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-3">
            <SIllustration
              name="intellirecover-2"
              width={560}
              alt="IntelliRecover PoE recovery workflow"
              className="mx-auto block max-w-full"
            />
          </div>

          <div className="flex items-center justify-between rounded-[6px] border border-[var(--omada-border-divider)] px-3 py-2.5">
            <div>
              <div className="text-sm font-medium text-[var(--omada-text-primary)]">
                Enable IntelliRecover
              </div>
              <div className="text-xs text-[var(--omada-text-secondary)]">
                Automatically cycle PoE port power when abnormal offline state is detected.
              </div>
            </div>
            <SSwitch
              checked={draftPolicy.enabled}
              onChange={(checked) =>
                setDraftPolicy((prev) => ({ ...prev, enabled: checked }))
              }
              aria-label="Enable IntelliRecover in policy modal"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="omada-recover-offline-min"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Offline Duration (min)
              </label>
              <SNumberInput
                id="omada-recover-offline-min"
                min={1}
                max={120}
                value={draftPolicy.offlineMinutes}
                onChange={(val) =>
                  setDraftPolicy((prev) => ({
                    ...prev,
                    offlineMinutes: typeof val === 'number' ? val : 8,
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="omada-recover-max-retries"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Max Retries
              </label>
              <SNumberInput
                id="omada-recover-max-retries"
                min={1}
                max={30}
                value={draftPolicy.maxRetries}
                onChange={(val) =>
                  setDraftPolicy((prev) => ({
                    ...prev,
                    maxRetries: typeof val === 'number' ? val : 10,
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="omada-recover-interval-min"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Retry Interval (min)
              </label>
              <SNumberInput
                id="omada-recover-interval-min"
                min={1}
                max={180}
                value={draftPolicy.retryIntervalMinutes}
                onChange={(val) =>
                  setDraftPolicy((prev) => ({
                    ...prev,
                    retryIntervalMinutes: typeof val === 'number' ? val : 15,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </SModal>

      {/* Recovery Logs Modal */}
      <SModal
        open={historyDevice !== null}
        title={
          historyDevice
            ? `Recovery Logs · ${historyDevice.name}`
            : 'Recovery Logs'
        }
        subtitle={
          historyDevice
            ? `${historyDevice.model} · ${historyDevice.uplinkLabel}`
            : undefined
        }
        size="default"
        footer={
          <div className="flex justify-end pt-2">
            <SButton variant="primary" onClick={() => setHistoryDeviceKey(null)}>
              Close
            </SButton>
          </div>
        }
        onCancel={() => setHistoryDeviceKey(null)}
        destroyOnHidden
      >
        {historyDevice && historyDevice.history.length > 0 ? (
          <div className="omada-recover-table-shell">
            <Table<EmulatorIntelliRecoverHistoryEntry>
              rowKey="key"
              pagination={false}
              dataSource={historyDevice.history}
              columns={[
                { title: 'Time', dataIndex: 'time', key: 'time', width: 195 },
                { title: 'Reason', dataIndex: 'reason', key: 'reason' },
                { title: 'Action', dataIndex: 'action', key: 'action', width: 185 },
                {
                  title: 'Result',
                  dataIndex: 'result',
                  key: 'result',
                  width: 110,
                  render: (result: string) => (
                    <span
                      style={{
                        color:
                          result === 'Success'
                            ? 'var(--omada-brand-hover)'
                            : 'var(--omada-color-warning)',
                      }}
                    >
                      {result}
                    </span>
                  ),
                },
              ]}
              className="omada-recover-table"
            />
          </div>
        ) : (
          <SEmpty
            title="No recovery events recorded"
            description="No automated or manual PoE power cycles have been triggered for this device."
          />
        )}
      </SModal>

      {/* Add Monitored PoE Target Modal */}
      <SModal
        open={addModalOpen}
        title={`Add ${targetTab === 'devices' ? 'PoE Device' : 'PoE Client'}`}
        subtitle="Enroll a PoE-powered device or endpoint into IntelliRecover monitoring."
        size="sm"
        okText="Add"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleAddSubmit}
        onCancel={() => setAddModalOpen(false)}
      >
        <div className="space-y-3 py-2">
          <div>
            <label
              htmlFor="omada-recover-preset"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Discovered PoE Candidate
            </label>
            <SSelect
              id="omada-recover-preset"
              value={selectedCandidateKey}
              onChange={(val) => setSelectedCandidateKey(String(val))}
              options={[
                ...EMULATOR_INTELLIRECOVER_CANDIDATES.map((c) => ({
                  label: `${c.name} (${c.model} · ${c.ip})`,
                  value: c.key,
                })),
                { label: 'Custom Entry', value: 'custom' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="omada-recover-add-name"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Name (Optional Override)
            </label>
            <SInput
              id="omada-recover-add-name"
              placeholder="e.g. Lobby_Eap_4"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="omada-recover-add-mac"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                MAC Address
              </label>
              <SInput
                id="omada-recover-add-mac"
                placeholder="00-FF-00-4C-88-12"
                value={customMac}
                onChange={(e) => setCustomMac(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="omada-recover-add-ip"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                IP Address
              </label>
              <SInput
                id="omada-recover-add-ip"
                placeholder="192.168.0.106"
                value={customIp}
                onChange={(e) => setCustomIp(e.target.value)}
              />
            </div>
          </div>
        </div>
      </SModal>
    </div>
  );
};
