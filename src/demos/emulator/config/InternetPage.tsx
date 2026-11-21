import React, { useMemo, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SCheckbox,
  SIcon,
  SInput,
  SModal,
  SSelect,
  SSwitch,
  useOmadaNotification,
} from '@/omada';
import {
  SSettingsInfoBanner,
  SSettingsPageShell,
  SSettingsRow,
  SSettingsSection,
} from '../../../omada/components/SSettingsPageShell';
import {
  DETECTION_INTERVAL_OPTIONS,
  GATEWAY_MODEL_OPTIONS,
  INITIAL_INTERNET_PORTS,
  INITIAL_LINK_BACKUP_RULES,
  type InternetPortRecord,
  type LinkBackupRule,
} from './networkCoreData';

export interface InternetPageProps {
  className?: string;
}

interface InternetConfigState {
  wanOverridesEnabled: boolean;
  gatewayModel: string;
  onlineDetectionInterval: string;
  customTime: number;
  ports: InternetPortRecord[];
  loadBalancingEnabled: boolean;
  appOptimizedRouting: boolean;
  bandwidthBasedBalance: boolean;
  portWeights: Record<string, number>;
  linkBackupRules: LinkBackupRule[];
}

const DEFAULT_INTERNET_STATE: InternetConfigState = {
  wanOverridesEnabled: true,
  gatewayModel: 'ER7412-M2 v1.0',
  onlineDetectionInterval: 'Custom',
  customTime: 10,
  ports: INITIAL_INTERNET_PORTS,
  loadBalancingEnabled: true,
  appOptimizedRouting: true,
  bandwidthBasedBalance: false,
  portWeights: {
    '2.5G WAN/LAN1': 1,
    'WAN/LAN3': 1,
  },
  linkBackupRules: INITIAL_LINK_BACKUP_RULES,
};

/**
 * Omada Controller v6.3 `Network Config -> Network Settings -> Internet` (`#/internet`).
 * Replicates `Mode Config` (WAN Settings Overrides + soft blue 2-point info banner + ER7412-M2
 * model + detection interval), 13-row interactive `Port Config` table, `Load Balancing`,
 * and `Link Backup` (`+ Create New Link Backup Rule`).
 */
export const InternetPage: React.FC<InternetPageProps> = ({ className = '' }) => {
  const notification = useOmadaNotification();

  const [saved, setSaved] = useState<InternetConfigState>(DEFAULT_INTERNET_STATE);
  const [draft, setDraft] = useState<InternetConfigState>(DEFAULT_INTERNET_STATE);

  // Port Edit Modal State
  const [editingPort, setEditingPort] = useState<InternetPortRecord | null>(null);

  // Link Backup Modal State
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupDraft, setBackupDraft] = useState<LinkBackupRule>({
    key: '',
    name: '',
    primaryWan: '2.5G WAN/LAN1',
    backupWan: 'WAN/LAN3',
    mode: 'Failover',
    enabled: true,
  });

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const activeWanPorts = useMemo(
    () => draft.ports.filter((p) => p.setToWan),
    [draft.ports],
  );

  const handleTogglePortWan = (portKey: string, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      ports: prev.ports.map((p) => (p.key === portKey ? { ...p, setToWan: checked } : p)),
    }));
  };

  const handleSavePortEdit = () => {
    if (!editingPort) return;
    setDraft((prev) => ({
      ...prev,
      ports: prev.ports.map((p) => (p.key === editingPort.key ? editingPort : p)),
    }));
    notification.success({
      title: 'WAN Port Updated',
      description: `Updated settings for ${editingPort.portName} (${editingPort.connectionType}).`,
    });
    setEditingPort(null);
  };

  const handleOpenCreateBackup = () => {
    const firstWan = activeWanPorts[0]?.portName ?? '2.5G WAN/LAN1';
    const secondWan = activeWanPorts[1]?.portName ?? activeWanPorts[0]?.portName ?? 'WAN/LAN3';
    setBackupDraft({
      key: '',
      name: `Backup Rule ${draft.linkBackupRules.length + 1}`,
      primaryWan: firstWan,
      backupWan: secondWan,
      mode: 'Failover',
      enabled: true,
    });
    setBackupModalOpen(true);
  };

  const handleSaveBackupRule = () => {
    const trimmed = backupDraft.name.trim() || 'Link Backup Rule';
    if (backupDraft.key) {
      setDraft((prev) => ({
        ...prev,
        linkBackupRules: prev.linkBackupRules.map((r) =>
          r.key === backupDraft.key ? { ...backupDraft, name: trimmed } : r,
        ),
      }));
    } else {
      setDraft((prev) => ({
        ...prev,
        linkBackupRules: [
          ...prev.linkBackupRules,
          { ...backupDraft, key: `lb-${Date.now()}`, name: trimmed },
        ],
      }));
    }
    setBackupModalOpen(false);
  };

  const handleDeleteBackupRule = (ruleKey: string) => {
    setDraft((prev) => ({
      ...prev,
      linkBackupRules: prev.linkBackupRules.filter((r) => r.key !== ruleKey),
    }));
  };

  const handleApply = () => {
    setSaved(draft);
    notification.success({
      title: 'Internet Configuration Saved',
      description: `${activeWanPorts.length} WAN port(s) applied for ${draft.gatewayModel}.`,
    });
  };

  const handleCancel = () => {
    setDraft(saved);
  };

  const portColumns: ColumnsType<InternetPortRecord> = [
    {
      title: 'Port Name',
      dataIndex: 'portName',
      key: 'portName',
      width: '28%',
      render: (name: string) => (
        <span className="text-[14px] text-[var(--omada-text-primary)]">{name}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '20%',
      render: (status: InternetPortRecord['status']) => (
        <span className="inline-flex items-center gap-2 text-[14px] text-[var(--omada-text-primary)]">
          <span
            className="inline-block h-[6px] w-[6px] rounded-full"
            style={{
              backgroundColor:
                status === 'Enable'
                  ? 'var(--omada-brand-hover)'
                  : 'var(--omada-border-strong)',
            }}
            aria-hidden="true"
          />
          <span>{status}</span>
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      render: (desc: string) => (
        <span className="text-[14px] text-[var(--omada-text-secondary)]">
          {desc || '-'}
        </span>
      ),
    },
    {
      title: 'Set to WAN Port',
      dataIndex: 'setToWan',
      key: 'setToWan',
      width: '20%',
      render: (checked: boolean, record) => (
        <SSwitch
          checked={checked}
          disabled={!draft.wanOverridesEnabled}
          aria-label={`Set ${record.portName} to WAN Port`}
          onChange={(next) => handleTogglePortWan(record.key, next)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '12%',
      render: (_, record) =>
        record.setToWan ? (
          <button
            type="button"
            aria-label={`Edit ${record.portName}`}
            onClick={() => setEditingPort({ ...record })}
            className="omada-cfg-icon-btn"
          >
            <SIcon name="edit" size={16} />
          </button>
        ) : (
          <span className="text-[14px] text-[var(--omada-text-tertiary)]">-</span>
        ),
    },
  ];

  const backupColumns: ColumnsType<LinkBackupRule> = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium text-[var(--omada-text-primary)]">{name}</span>
      ),
    },
    {
      title: 'Primary WAN',
      dataIndex: 'primaryWan',
      key: 'primaryWan',
    },
    {
      title: 'Backup WAN',
      dataIndex: 'backupWan',
      key: 'backupWan',
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, row) => (
        <SSwitch
          size="small"
          checked={enabled}
          aria-label={`Toggle ${row.name}`}
          onChange={(next) =>
            setDraft((prev) => ({
              ...prev,
              linkBackupRules: prev.linkBackupRules.map((item) =>
                item.key === row.key ? { ...item, enabled: next } : item,
              ),
            }))
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
              setBackupDraft({ ...row });
              setBackupModalOpen(true);
            }}
            className="omada-cfg-icon-btn"
          >
            <SIcon name="edit" size={15} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() => handleDeleteBackupRule(row.key)}
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
      title="Internet"
      helpTitle="Internet & Multi-WAN"
      helpDescription="Preconfigure gateway WAN ports, online detection intervals, multi-WAN load balancing weights, and automatic failover link backup rules."
      dirty={isDirty}
      onApply={handleApply}
      onCancel={handleCancel}
      data-testid="internet-page"
      className={className}
    >
      {/* Section 1: Mode Config */}
      <SSettingsSection title="Mode Config">
        <SSettingsRow
          label="WAN Settings Overrides"
          tooltip="Predefine WAN port roles before gateway adoption. Mismatched port counts trigger an automatic reboot after adoption."
        >
          <SSwitch
            aria-label="WAN Settings Overrides"
            checked={draft.wanOverridesEnabled}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, wanOverridesEnabled: checked }))
            }
          />
        </SSettingsRow>

        <SSettingsInfoBanner>
          <ol className="m-0 list-decimal space-y-0.5 pl-4">
            <li>
              If the number of preconfigured WAN ports does not match the number of WAN ports
              enabled in the adopted Omada gateway, the Omada gateway will automatically reboot
              after adoption.
            </li>
            <li>
              If the adopted device does not support some pre-configurations, the relevant
              configurations will be deleted after adoption.
            </li>
          </ol>
        </SSettingsInfoBanner>

        <SSettingsRow label="Gateway Model">
          <SSelect
            aria-label="Gateway Model"
            className="w-full"
            value={draft.gatewayModel}
            onChange={(val) =>
              setDraft((prev) => ({ ...prev, gatewayModel: String(val) }))
            }
            options={GATEWAY_MODEL_OPTIONS}
          />
        </SSettingsRow>

        <SSettingsRow
          label="Online Detection Interval"
          align="start"
          hint="The smaller the detection interval, the faster the load balancing/link backup, and more detection packets will be sent."
        >
          <SSelect
            aria-label="Online Detection Interval"
            className="w-full"
            value={draft.onlineDetectionInterval}
            onChange={(val) =>
              setDraft((prev) => ({ ...prev, onlineDetectionInterval: String(val) }))
            }
            options={DETECTION_INTERVAL_OPTIONS}
          />
        </SSettingsRow>

        {draft.onlineDetectionInterval === 'Custom' && (
          <SSettingsRow label="Custom Time" after="(1-3600)">
            <SInput
              aria-label="Custom Time"
              inputMode="numeric"
              value={String(draft.customTime)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setDraft((prev) => ({
                  ...prev,
                  customTime: digits ? Number(digits) : 0,
                }));
              }}
              suffix={
                <span className="text-[13px] text-[var(--omada-text-primary)]">
                  Seconds
                </span>
              }
            />
          </SSettingsRow>
        )}
      </SSettingsSection>

      {/* Section 2: Port Config (13 interactive rows) */}
      <SSettingsSection title="Port Config" className="mt-7">
        <div className="omada-cfg-table-shell">
          <Table<InternetPortRecord>
            rowKey="key"
            columns={portColumns}
            dataSource={draft.ports}
            pagination={false}
            className="omada-cfg-table"
            data-testid="internet-port-config-table"
          />
        </div>
      </SSettingsSection>

      {/* Section 3: Load Balancing */}
      <SSettingsSection title="Load Balancing" dividerTop>
        <SSettingsRow
          label="Load Balancing"
          tooltip="Distribute outbound sessions across multiple active WAN connections."
        >
          <SSwitch
            aria-label="Load Balancing"
            checked={draft.loadBalancingEnabled}
            onChange={(checked) =>
              setDraft((prev) => ({ ...prev, loadBalancingEnabled: checked }))
            }
          />
        </SSettingsRow>

        <SSettingsRow label="Application Optimized Routing">
          <SCheckbox
            checked={draft.appOptimizedRouting}
            disabled={!draft.loadBalancingEnabled}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                appOptimizedRouting: e.target.checked,
              }))
            }
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        <SSettingsRow label="Bandwidth Based Balance Routing">
          <SCheckbox
            checked={draft.bandwidthBasedBalance}
            disabled={!draft.loadBalancingEnabled}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                bandwidthBasedBalance: e.target.checked,
              }))
            }
          >
            Enable
          </SCheckbox>
        </SSettingsRow>

        {draft.loadBalancingEnabled && activeWanPorts.length > 0 && (
          <SSettingsRow label="WAN Weight Ratios" align="start" controlWidth={420}>
            <div className="flex flex-col gap-2">
              {activeWanPorts.map((wan) => (
                <div key={wan.key} className="flex items-center gap-3">
                  <span className="w-[140px] text-[13px] text-[var(--omada-text-secondary)]">
                    {wan.portName}
                  </span>
                  <SInput
                    aria-label={`${wan.portName} weight`}
                    inputMode="numeric"
                    className="w-[120px]"
                    value={String(draft.portWeights[wan.portName] ?? 1)}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setDraft((prev) => ({
                        ...prev,
                        portWeights: {
                          ...prev.portWeights,
                          [wan.portName]: digits ? Number(digits) : 1,
                        },
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          </SSettingsRow>
        )}
      </SSettingsSection>

      {/* Section 4: Link Backup */}
      <SSettingsSection
        title="Link Backup"
        dividerTop
        extra={
          <button
            type="button"
            onClick={handleOpenCreateBackup}
            className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] font-medium text-[var(--omada-brand-text)] transition-opacity hover:opacity-80"
          >
            <SIcon name="add-2" size={14} />
            <span>Create New Link Backup Rule</span>
          </button>
        }
      >
        <div className="omada-cfg-table-shell is-bordered">
          <Table<LinkBackupRule>
            rowKey="key"
            columns={backupColumns}
            dataSource={draft.linkBackupRules}
            pagination={false}
            className="omada-cfg-table"
            locale={{ emptyText: 'No Link Backup rules configured' }}
          />
        </div>
      </SSettingsSection>

      {/* WAN Port Config Modal */}
      <SModal
        size="sm"
        title={editingPort ? `Edit ${editingPort.portName}` : 'Edit WAN Port'}
        open={Boolean(editingPort)}
        onCancel={() => setEditingPort(null)}
        onOk={handleSavePortEdit}
        okText="Save"
        destroyOnHidden
      >
        {editingPort && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                Description
              </label>
              <SInput
                aria-label="Port Description"
                value={editingPort.description === '-' ? '' : editingPort.description}
                placeholder="Primary ISP Fiber"
                onChange={(e) =>
                  setEditingPort({
                    ...editingPort,
                    description: e.target.value || '-',
                  })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                Connection Type
              </label>
              <SSelect
                aria-label="Connection Type"
                className="w-full"
                value={editingPort.connectionType}
                onChange={(val) =>
                  setEditingPort({
                    ...editingPort,
                    connectionType: val as InternetPortRecord['connectionType'],
                  })
                }
                options={[
                  { label: 'Dynamic IP', value: 'Dynamic IP' },
                  { label: 'Static IP', value: 'Static IP' },
                  { label: 'PPPoE', value: 'PPPoE' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                  VLAN ID
                </label>
                <SInput
                  aria-label="WAN VLAN ID"
                  inputMode="numeric"
                  value={String(editingPort.vlanId)}
                  onChange={(e) =>
                    setEditingPort({
                      ...editingPort,
                      vlanId: Number(e.target.value.replace(/\D/g, '') || 1),
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                  MTU
                </label>
                <SInput
                  aria-label="WAN MTU"
                  inputMode="numeric"
                  value={String(editingPort.mtu)}
                  onChange={(e) =>
                    setEditingPort({
                      ...editingPort,
                      mtu: Number(e.target.value.replace(/\D/g, '') || 1500),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                  Primary DNS
                </label>
                <SInput
                  aria-label="Primary DNS"
                  value={editingPort.primaryDns}
                  onChange={(e) =>
                    setEditingPort({ ...editingPort, primaryDns: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                  Secondary DNS
                </label>
                <SInput
                  aria-label="Secondary DNS"
                  value={editingPort.secondaryDns}
                  onChange={(e) =>
                    setEditingPort({ ...editingPort, secondaryDns: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </SModal>

      {/* Create / Edit Link Backup Rule Modal */}
      <SModal
        size="sm"
        title={backupDraft.key ? 'Edit Link Backup Rule' : 'Create New Link Backup Rule'}
        open={backupModalOpen}
        onCancel={() => setBackupModalOpen(false)}
        onOk={handleSaveBackupRule}
        okText="Save"
        destroyOnHidden
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
              Rule Name
            </label>
            <SInput
              aria-label="Link Backup Rule Name"
              value={backupDraft.name}
              onChange={(e) =>
                setBackupDraft((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                Primary WAN
              </label>
              <SSelect
                aria-label="Primary WAN"
                className="w-full"
                value={backupDraft.primaryWan}
                onChange={(val) =>
                  setBackupDraft((prev) => ({ ...prev, primaryWan: String(val) }))
                }
                options={draft.ports.map((p) => ({
                  label: p.portName,
                  value: p.portName,
                }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
                Backup WAN
              </label>
              <SSelect
                aria-label="Backup WAN"
                className="w-full"
                value={backupDraft.backupWan}
                onChange={(val) =>
                  setBackupDraft((prev) => ({ ...prev, backupWan: String(val) }))
                }
                options={draft.ports.map((p) => ({
                  label: p.portName,
                  value: p.portName,
                }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--omada-text-primary)]">
              Mode
            </label>
            <SSelect
              aria-label="Backup Mode"
              className="w-full"
              value={backupDraft.mode}
              onChange={(val) =>
                setBackupDraft((prev) => ({
                  ...prev,
                  mode: val as LinkBackupRule['mode'],
                }))
              }
              options={[
                { label: 'Failover', value: 'Failover' },
                { label: 'Backup (Time-based)', value: 'Backup (Time-based)' },
              ]}
            />
          </div>
        </div>
      </SModal>
    </SSettingsPageShell>
  );
};
