import React, { useMemo, useState } from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import {
  SButton,
  SCheckbox,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SNumberInput,
  SPasswordInput,
  SRadio,
  SSelect,
  SSwitch,
  STabs,
  useOmadaAgentAction,
  useOmadaConfirm,
  useOmadaNotification,
} from '@/omada';
import {
  DDNS_INTERFACE_OPTIONS,
  DDNS_INTERVAL_OPTIONS,
  DDNS_PROVIDER_OPTIONS,
  DNS_PROXY_PRESETS,
  INITIAL_DDNS_ENTRIES,
  INITIAL_DNS_CACHE_CONFIG,
  INITIAL_DNS_PROXY_CUSTOM_SERVERS,
  type DnsCacheConfig,
  type DnsProxyCustomServer,
  type DnsProxyType,
  type DynamicDnsEntryRecord,
} from './deviceConfigData';

export interface DnsConfigPageProps {
  /** Optional initial sub-tab (`'dynamic-dns'` | `'dns-proxy'` | `'dns-cache'`). */
  initialTab?: 'dynamic-dns' | 'dns-proxy' | 'dns-cache';
}

type DnsSubTabKey = 'dynamic-dns' | 'dns-proxy' | 'dns-cache';

const STATUS_DOT_COLOR: Record<DynamicDnsEntryRecord['status'], string> = {
  'incorrect-credential': 'var(--omada-color-error)',
  connected: 'var(--omada-brand-hover)',
  updating: 'var(--omada-color-warning)',
  disabled: 'var(--omada-border-strong)',
};

/**
 * Omada Controller v6.3.0.34 `Device Config -> Gateway -> DNS` page (`#/dns`).
 * Replicates the `Dynamic DNS`, `DNS Proxy` (DNSSEC / DoH / DoT + custom DoH servers),
 * and `DNS Cache` sub-tabs.
 */
export const DnsConfigPage: React.FC<DnsConfigPageProps> = ({
  initialTab = 'dynamic-dns',
}) => {
  const notification = useOmadaNotification();
  const { confirmDanger } = useOmadaConfirm();

  const [subTab, setSubTab] = useState<DnsSubTabKey>(initialTab);
  const [helpOpen, setHelpOpen] = useState(false);

  // Dynamic DNS state
  const [ddnsEntries, setDdnsEntries] = useState<DynamicDnsEntryRecord[]>(
    INITIAL_DDNS_ENTRIES,
  );
  const [ddnsModalOpen, setDdnsModalOpen] = useState(false);
  const [editingDdns, setEditingDdns] =
    useState<DynamicDnsEntryRecord | null>(null);
  const [ddnsDraft, setDdnsDraft] = useState<{
    provider: string;
    interfaceName: string;
    username: string;
    password: string;
    domainName: string;
    updateInterval: string;
  }>({
    provider: 'DynDNS',
    interfaceName: '3_832db9e5f1ef49dfa771961a9f8885c4',
    username: '',
    password: '',
    domainName: '',
    updateInterval: 'never',
  });

  // DNS Proxy state
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(true);
  const [proxyType, setProxyType] = useState<DnsProxyType>('DoH');
  const [selectedPresetKeys, setSelectedPresetKeys] = useState<string[]>([]);
  const [customServers, setCustomServers] = useState<DnsProxyCustomServer[]>(
    INITIAL_DNS_PROXY_CUSTOM_SERVERS,
  );
  const [proxyDirty, setProxyDirty] = useState<boolean>(false);

  // DNS Cache state
  const [cacheConfig, setCacheConfig] = useState<DnsCacheConfig>(
    INITIAL_DNS_CACHE_CONFIG,
  );

  // Dynamic DNS handlers
  const openCreateDdnsModal = () => {
    setEditingDdns(null);
    setDdnsDraft({
      provider: 'DynDNS',
      interfaceName: '3_832db9e5f1ef49dfa771961a9f8885c4',
      username: '',
      password: '',
      domainName: '',
      updateInterval: 'never',
    });
    setDdnsModalOpen(true);
  };

  const openEditDdnsModal = (record: DynamicDnsEntryRecord) => {
    setEditingDdns(record);
    setDdnsDraft({
      provider: record.provider,
      interfaceName: record.interfaceName,
      username: record.username,
      password: record.password,
      domainName: record.domainName,
      updateInterval: record.updateInterval,
    });
    setDdnsModalOpen(true);
  };

  const handleSaveDdns = () => {
    const trimmedDomain = ddnsDraft.domainName.trim();
    const trimmedUsername = ddnsDraft.username.trim();
    if (!trimmedDomain || !trimmedUsername) {
      notification.warning({
        title: 'Required Fields Missing',
        description: 'Enter both a Username and Domain Name for the DDNS entry.',
      });
      return;
    }

    if (editingDdns) {
      setDdnsEntries((prev) =>
        prev.map((item) =>
          item.key === editingDdns.key
            ? {
                ...item,
                provider: ddnsDraft.provider,
                interfaceName: ddnsDraft.interfaceName,
                username: trimmedUsername,
                password: ddnsDraft.password || item.password,
                domainName: trimmedDomain,
                updateInterval: ddnsDraft.updateInterval,
                status: 'connected',
                statusLabel: 'Connected',
              }
            : item,
        ),
      );
      notification.success({
        title: 'Dynamic DNS Updated',
        description: `Updated DDNS entry for ${trimmedDomain}.`,
      });
    } else {
      const next: DynamicDnsEntryRecord = {
        key: `ddns-${Date.now()}`,
        provider: ddnsDraft.provider,
        interfaceName: ddnsDraft.interfaceName,
        status: 'connected',
        statusLabel: 'Connected',
        username: trimmedUsername,
        password: ddnsDraft.password || '••••••••',
        domainName: trimmedDomain,
        ip: '192.168.220.168',
        updateInterval: ddnsDraft.updateInterval,
      };
      setDdnsEntries((prev) => [...prev, next]);
      notification.success({
        title: 'Dynamic DNS Created',
        description: `Added ${ddnsDraft.provider} entry for ${trimmedDomain}.`,
      });
    }
    setDdnsModalOpen(false);
  };

  const handleDeleteDdns = (record: DynamicDnsEntryRecord) => {
    confirmDanger({
      title: `Delete Dynamic DNS Entry "${record.domainName}"?`,
      content: `This removes the ${record.provider} configuration bound to ${record.interfaceName}.`,
      onOk: () => {
        setDdnsEntries((prev) => prev.filter((item) => item.key !== record.key));
        notification.success({
          title: 'Dynamic DNS Deleted',
          description: `Removed ${record.domainName}.`,
        });
      },
    });
  };

  const ddnsColumns: ColumnsType<DynamicDnsEntryRecord> = useMemo(
    () => [
      {
        title: 'Service Provider',
        dataIndex: 'provider',
        key: 'provider',
        width: 130,
      },
      {
        title: 'Interface',
        dataIndex: 'interfaceName',
        key: 'interfaceName',
        width: 275,
        render: (val: string) => (
          <span className="tabular-nums text-[var(--omada-text-primary)]">
            {val}
          </span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'statusLabel',
        key: 'status',
        width: 175,
        render: (label: string, record) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_DOT_COLOR[record.status] }}
            />
            <span className="text-[14px] text-[var(--omada-text-primary)]">
              {label}
            </span>
          </span>
        ),
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        width: 100,
      },
      {
        title: 'Domain Name',
        dataIndex: 'domainName',
        key: 'domainName',
        width: 115,
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        width: 145,
        render: (ip: string) => (
          <span className="tabular-nums text-[var(--omada-text-primary)]">
            {ip}
          </span>
        ),
      },
      {
        title: 'Update Interval',
        dataIndex: 'updateInterval',
        key: 'updateInterval',
        width: 130,
      },
      {
        title: 'Action',
        key: 'action',
        width: 96,
        fixed: 'end',
        render: (_val, record) => (
          <div className="flex items-center gap-3">
            <Tooltip title={`Edit ${record.domainName}`}>
              <button
                type="button"
                aria-label={`Edit ${record.domainName}`}
                onClick={() => openEditDdnsModal(record)}
                className="omada-devcfg-row-action-btn"
              >
                <SIcon name="edit" size={16} />
              </button>
            </Tooltip>
            <Tooltip title={`Delete ${record.domainName}`}>
              <button
                type="button"
                aria-label={`Delete ${record.domainName}`}
                onClick={() => handleDeleteDdns(record)}
                className="omada-devcfg-row-action-btn"
              >
                <SIcon name="delete" size={16} />
              </button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [],
  );

  // DNS Proxy handlers
  const togglePreset = (key: string, checked: boolean) => {
    setSelectedPresetKeys((prev) =>
      checked ? [...prev, key] : prev.filter((item) => item !== key),
    );
    setProxyDirty(true);
  };

  const handleCustomServerChange = (
    key: string,
    patch: Partial<DnsProxyCustomServer>,
  ) => {
    setCustomServers((prev) =>
      prev.map((srv) => (srv.key === key ? { ...srv, ...patch } : srv)),
    );
    setProxyDirty(true);
  };

  const handleDeleteCustomServer = (key: string) => {
    setCustomServers((prev) => prev.filter((srv) => srv.key !== key));
    setProxyDirty(true);
  };

  const handleAddCustomServer = () => {
    const nextIdx = customServers.length + 1;
    setCustomServers((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        checked: true,
        name: `Test_Dns_Proxy_${nextIdx}`,
        url: `https://www.tp-link-test-${nextIdx}.com`,
      },
    ]);
    setProxyDirty(true);
  };

  const handleApplyProxy = () => {
    setProxyDirty(false);
    notification.success({
      title: 'DNS Proxy Applied',
      description: proxyEnabled
        ? `${proxyType} DNS Proxy saved (${selectedPresetKeys.length + customServers.filter((s) => s.checked).length} upstream resolver(s) active).`
        : 'DNS Proxy disabled for Main Office Floor.',
    });
  };

  const handleResetProxy = () => {
    setProxyEnabled(true);
    setProxyType('DoH');
    setSelectedPresetKeys([]);
    setCustomServers(INITIAL_DNS_PROXY_CUSTOM_SERVERS);
    setProxyDirty(false);
  };

  // DNS Cache handlers
  const handleClearCache = () => {
    setCacheConfig((prev) => ({ ...prev, cachedEntries: 0 }));
    notification.success({
      title: 'DNS Cache Cleared',
      description: 'Flushed all cached DNS entries on MainOffice_Gateway_2.',
    });
  };

  const handleApplyCache = () => {
    notification.success({
      title: 'DNS Cache Settings Saved',
      description: cacheConfig.enabled
        ? `DNS Cache enabled (${cacheConfig.cacheSize} max entries, ${cacheConfig.cacheTtl}s TTL).`
        : 'DNS Cache disabled.',
    });
  };

  useOmadaAgentAction({
    id: 'dns.applyProxySettings',
    label: 'Apply DNS Proxy Settings',
    description: 'Applies DNS Proxy settings ({ enabled, proxyType }) and clears dirty state.',
    handler: (payload) => {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        enabled?: boolean;
        proxyType?: DnsProxyType;
      };
      const nextEnabled = p.enabled !== undefined ? Boolean(p.enabled) : proxyEnabled;
      const nextType = p.proxyType ?? proxyType;
      setProxyEnabled(nextEnabled);
      setProxyType(nextType);
      setProxyDirty(false);
      notification.success({
        title: 'DNS Proxy Applied',
        description: nextEnabled
          ? `${nextType} DNS Proxy saved.`
          : 'DNS Proxy disabled for Main Office Floor.',
      });
      return { enabled: nextEnabled, proxyType: nextType };
    },
  });

  return (
    <div
      className="omada-devcfg-page px-6 pt-4 pb-6"
      data-testid="dns-config-page"
    >
      {/* Top Underline Sub-Tabs + Top-Right (?) Help Icon */}
      <STabs
        agentId="dns.subTabs"
        variant="page"
        size="lg"
        bordered
        aria-label="DNS configuration sections"
        activeKey={subTab}
        onChange={(k) => setSubTab(k as typeof subTab)}
        className="pr-9"
        items={[
          { key: 'dynamic-dns', label: 'Dynamic DNS' },
          { key: 'dns-proxy', label: 'DNS Proxy' },
          { key: 'dns-cache', label: 'DNS Cache' },
        ]}
        extra={
          <Tooltip title="DNS Configuration Help">
            <button
              type="button"
              aria-label="DNS help"
              onClick={() => setHelpOpen(true)}
              className="omada-devcfg-help-btn"
            >
              <SIcon name="question" size={20} />
            </button>
          </Tooltip>
        }
      />

      {/* Dynamic DNS Tab */}
      {subTab === 'dynamic-dns' && (
        <>
          <div className="mt-4 mb-3 flex items-center justify-end pr-9">
            <SButton
              variant="primary"
              icon={<Plus size={15} />}
              onClick={openCreateDdnsModal}
              className="omada-devcfg-primary-btn"
            >
              Create New Dynamic DNS Entry
            </SButton>
          </div>

          <div className="omada-devcfg-table-shell">
            <Table<DynamicDnsEntryRecord>
              rowKey="key"
              columns={ddnsColumns}
              dataSource={ddnsEntries}
              pagination={false}
              scroll={{ x: 1166 }}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No Dynamic DNS entries"
                    description="Create a Dynamic DNS entry to bind a domain name to your WAN interface."
                  />
                ),
              }}
              className="omada-devcfg-table"
            />
          </div>
        </>
      )}

      {/* DNS Proxy Tab */}
      {subTab === 'dns-proxy' && (
        <div className="pt-6" data-testid="dns-proxy-panel">
          <div className="space-y-6">
            {/* Row 1: DNS Proxy Switch */}
            <div className="flex items-center">
              <div className="w-[170px] shrink-0 text-[14px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                DNS Proxy
              </div>
              <SSwitch
                agentId="dns.proxyEnabled"
                checked={proxyEnabled}
                aria-label="DNS Proxy"
                onChange={(checked) => {
                  setProxyEnabled(checked);
                  setProxyDirty(true);
                }}
              />
            </div>

            {/* Row 2: Proxy Type Radios */}
            <div className="flex items-center">
              <div className="w-[170px] shrink-0 text-[14px] leading-[22px] text-[var(--omada-text-primary)]">
                Proxy Type
              </div>
              <SRadio.Group
                agentId="dns.proxyType"
                aria-label="Proxy Type"
                value={proxyType}
                disabled={!proxyEnabled}
                onChange={(e) => {
                  setProxyType(e.target.value as DnsProxyType);
                  setProxyDirty(true);
                }}
                className="!gap-x-8"
                options={[
                  { label: 'DNSSEC', value: 'DNSSEC' },
                  { label: 'DoH', value: 'DoH' },
                  { label: 'DoT', value: 'DoT' },
                ]}
              />
            </div>

            {/* Row 3: Select Proxy Checkboxes & Custom Servers */}
            <div className="flex items-start">
              <div className="w-[170px] shrink-0 pt-0.5 text-[14px] leading-[22px] text-[var(--omada-text-primary)]">
                Select Proxy
              </div>
              <div className="min-w-0 flex-1 space-y-3.5">
                {DNS_PROXY_PRESETS.map((preset) => (
                  <div key={preset.key}>
                    <SCheckbox
                      disabled={!proxyEnabled || proxyType === 'DNSSEC'}
                      checked={selectedPresetKeys.includes(preset.key)}
                      onChange={(e) =>
                        togglePreset(preset.key, e.target.checked)
                      }
                    >
                      {preset.label}
                    </SCheckbox>
                  </div>
                ))}

                {/* Custom Proxy Server Rows */}
                {customServers.map((srv) => (
                  <div
                    key={srv.key}
                    className="flex flex-wrap items-center gap-3 pt-0.5"
                  >
                    <SCheckbox
                      disabled={!proxyEnabled || proxyType === 'DNSSEC'}
                      checked={srv.checked}
                      aria-label={`Select ${srv.name || 'custom DNS proxy'}`}
                      onChange={(e) =>
                        handleCustomServerChange(srv.key, {
                          checked: e.target.checked,
                        })
                      }
                    />
                    <SInput
                      variant="filled"
                      disabled={!proxyEnabled || proxyType === 'DNSSEC'}
                      value={srv.name}
                      onChange={(e) =>
                        handleCustomServerChange(srv.key, {
                          name: e.target.value,
                        })
                      }
                      placeholder="Server Name"
                      aria-label="Custom DNS server name"
                      className="omada-devcfg-form-input !w-[160px]"
                    />
                    <SInput
                      variant="filled"
                      disabled={!proxyEnabled || proxyType === 'DNSSEC'}
                      value={srv.url}
                      onChange={(e) =>
                        handleCustomServerChange(srv.key, {
                          url: e.target.value,
                        })
                      }
                      placeholder={
                        proxyType === 'DoT'
                          ? 'dns.example.com'
                          : 'https://www.example.com'
                      }
                      aria-label="Custom DNS server URL"
                      className="omada-devcfg-form-input !w-[330px]"
                    />
                    <Tooltip title="Remove Custom Server">
                      <button
                        type="button"
                        disabled={!proxyEnabled || proxyType === 'DNSSEC'}
                        aria-label={`Remove ${srv.name || 'custom server'}`}
                        onClick={() => handleDeleteCustomServer(srv.key)}
                        className="omada-devcfg-row-danger-btn"
                      >
                        <SIcon name="clear-red" size={16} />
                      </button>
                    </Tooltip>
                  </div>
                ))}

                <div className="pt-0.5">
                  <button
                    type="button"
                    disabled={!proxyEnabled || proxyType === 'DNSSEC'}
                    onClick={handleAddCustomServer}
                    className="omada-devcfg-ghost-action disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Plus size={15} />
                    <span>Add Custom Servers</span>
                  </button>
                </div>
              </div>
            </div>

            {proxyDirty && (
              <div className="flex items-center gap-3 border-t border-[var(--omada-border-divider)] pt-4 pl-[170px]">
                <SButton
                  variant="primary"
                  onClick={handleApplyProxy}
                  className="omada-devcfg-primary-btn"
                >
                  Apply
                </SButton>
                <SButton variant="secondary" onClick={handleResetProxy}>
                  Cancel
                </SButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DNS Cache Tab */}
      {subTab === 'dns-cache' && (
        <div className="pt-6" data-testid="dns-cache-panel">
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-[170px] shrink-0 text-[14px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                DNS Cache
              </div>
              <SSwitch
                agentId="dns.cacheEnabled"
                checked={cacheConfig.enabled}
                aria-label="DNS Cache"
                onChange={(checked) =>
                  setCacheConfig((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            <div className="flex items-center">
              <label
                htmlFor="omada-dns-cache-size"
                className="w-[170px] shrink-0 text-[14px] leading-[22px] text-[var(--omada-text-primary)]"
              >
                DNS Cache Size
              </label>
              <div className="flex items-center gap-3">
                <SNumberInput
                  id="omada-dns-cache-size"
                  agentId="dns.cacheSize"
                  min={1}
                  max={5000}
                  value={cacheConfig.cacheSize}
                  onChange={(val) =>
                    setCacheConfig((prev) => ({
                      ...prev,
                      cacheSize:
                        typeof val === 'number' && !Number.isNaN(val)
                          ? val
                          : 5000,
                    }))
                  }
                  className="omada-devcfg-form-input !w-[240px]"
                />
                <span className="text-[13px] text-[var(--omada-text-secondary)]">
                  (1-5000)
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <label
                htmlFor="omada-dns-cache-ttl"
                className="w-[170px] shrink-0 text-[14px] leading-[22px] text-[var(--omada-text-primary)]"
              >
                Cache TTL
              </label>
              <div className="flex items-center gap-3">
                <SNumberInput
                  id="omada-dns-cache-ttl"
                  agentId="dns.cacheTtl"
                  min={1}
                  max={86400}
                  value={cacheConfig.cacheTtl}
                  onChange={(val) =>
                    setCacheConfig((prev) => ({
                      ...prev,
                      cacheTtl:
                        typeof val === 'number' && !Number.isNaN(val)
                          ? val
                          : 1200,
                    }))
                  }
                  className="omada-devcfg-form-input !w-[240px]"
                />
                <span className="text-[13px] text-[var(--omada-text-secondary)]">
                  Seconds (1-86400)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-[170px]">
              <SButton variant="outline" onClick={handleClearCache}>
                Clear
              </SButton>
              <SButton
                variant="primary"
                onClick={handleApplyCache}
                className="omada-devcfg-primary-btn"
              >
                Apply
              </SButton>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Dynamic DNS Modal */}
      <SModal
        agentId="dns.ddnsModal"
        size="sm"
        open={ddnsModalOpen}
        title={
          editingDdns
            ? `Edit Dynamic DNS Entry: ${editingDdns.domainName}`
            : 'Create New Dynamic DNS Entry'
        }
        okText="Save"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleSaveDdns}
        onCancel={() => setDdnsModalOpen(false)}
      >
        <div className="space-y-3.5 py-2">
          <div>
            <label
              htmlFor="omada-ddns-provider"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Service Provider
            </label>
            <SSelect
              id="omada-ddns-provider"
              value={ddnsDraft.provider}
              onChange={(val) =>
                setDdnsDraft((prev) => ({ ...prev, provider: String(val) }))
              }
              options={DDNS_PROVIDER_OPTIONS}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="omada-ddns-interface"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Interface
            </label>
            <SSelect
              id="omada-ddns-interface"
              value={ddnsDraft.interfaceName}
              onChange={(val) =>
                setDdnsDraft((prev) => ({
                  ...prev,
                  interfaceName: String(val),
                }))
              }
              options={DDNS_INTERFACE_OPTIONS}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="omada-ddns-username"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Username
              </label>
              <SInput
                id="omada-ddns-username"
                placeholder="e.g. admin"
                value={ddnsDraft.username}
                onChange={(e) =>
                  setDdnsDraft((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="omada-ddns-password"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Password
              </label>
              <SPasswordInput
                id="omada-ddns-password"
                placeholder="Enter password"
                value={ddnsDraft.password}
                onChange={(e) =>
                  setDdnsDraft((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="omada-ddns-domain"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Domain Name
              </label>
              <SInput
                id="omada-ddns-domain"
                placeholder="e.g. office.dyndns.org"
                value={ddnsDraft.domainName}
                onChange={(e) =>
                  setDdnsDraft((prev) => ({
                    ...prev,
                    domainName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="omada-ddns-interval"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Update Interval
              </label>
              <SSelect
                id="omada-ddns-interval"
                value={ddnsDraft.updateInterval}
                onChange={(val) =>
                  setDdnsDraft((prev) => ({
                    ...prev,
                    updateInterval: String(val),
                  }))
                }
                options={DDNS_INTERVAL_OPTIONS}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </SModal>

      {/* Help Modal */}
      <SModal
        size="sm"
        open={helpOpen}
        title="DNS Configuration Help"
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        destroyOnHidden
        onOk={() => setHelpOpen(false)}
        onCancel={() => setHelpOpen(false)}
      >
        <div className="space-y-2 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
          <p className="m-0">
            <strong className="text-[var(--omada-text-primary)]">
              Dynamic DNS:
            </strong>{' '}
            Map your site gateway&apos;s dynamic WAN IP address to a fixed
            hostname via DynDNS, No-IP, or Cloudflare.
          </p>
          <p className="m-0">
            <strong className="text-[var(--omada-text-primary)]">
              DNS Proxy:
            </strong>{' '}
            Encrypt and validate upstream DNS queries using DNSSEC, DNS-over-HTTPS
            (DoH), or DNS-over-TLS (DoT).
          </p>
          <p className="m-0">
            <strong className="text-[var(--omada-text-primary)]">
              DNS Cache:
            </strong>{' '}
            Cache resolved DNS records locally on the gateway to reduce lookup
            latency across LAN clients.
          </p>
        </div>
      </SModal>
    </div>
  );
};
