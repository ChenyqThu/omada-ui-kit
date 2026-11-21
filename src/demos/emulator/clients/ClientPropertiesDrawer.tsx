import React, { useEffect, useState } from 'react';
import { Dropdown, Input, Tooltip, type MenuProps } from 'antd';
import {
  SButton,
  SClientIcon,
  SHealthTrendBar,
  SIcon,
  SProductImage,
  useOmadaNotification,
} from '@/omada';
import type { EmulatorClientRecord } from './clientsData';

export interface ClientPropertiesDrawerProps {
  /** Whether the 420px quick properties drawer is visible. */
  open: boolean;
  /** Selected client record displayed in the drawer. */
  client: EmulatorClientRecord | null;
  /** Callback invoked when closing the drawer. */
  onClose: () => void;
  /** Callback invoked when clicking the uplink gateway/AP link. */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Optional callback invoked when saving an inline client rename. */
  onRenameClient?: (client: EmulatorClientRecord, nextName: string) => void;
  /** Optional callback invoked when triggering client actions from `Manage Client`, `Tools`, or `⋮`. */
  onClientAction?: (client: EmulatorClientRecord, action: string) => void;
}

function getClientStatusMeta(status: EmulatorClientRecord['status']): {
  label: string;
  color: string;
} {
  if (status === 'authorized') {
    return { label: 'Authorized', color: 'var(--omada-brand-hover)' };
  }
  if (status === 'blocked') {
    return { label: 'Blocked', color: 'var(--omada-color-error)' };
  }
  return { label: 'Pending', color: 'var(--omada-link)' };
}

/**
 * Omada Controller v6.3.0.34 Quick Client Properties Drawer (`420px`, anchored right below
 * the `56px` top bar). Displays client hero identity, `Manage Client` / Tools / More actions,
 * `Client 24h health` (`<SHealthTrendBar />`), `Uplink Gateway` / `Uplink AP` metrics, and `Info`.
 */
export const ClientPropertiesDrawer: React.FC<ClientPropertiesDrawerProps> = ({
  open,
  client,
  onClose,
  onOpenDeviceByName,
  onRenameClient,
  onClientAction,
}) => {
  const notification = useOmadaNotification();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [renamedNames, setRenamedNames] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsRenaming(false);
  }, [client?.key, open]);

  if (!open || !client) {
    return null;
  }

  const displayName = renamedNames[client.key] ?? client.name;
  const statusMeta = getClientStatusMeta(client.status);
  const uplinkHeading =
    client.uplinkKind === 'ap'
      ? 'Uplink AP'
      : client.uplinkKind === 'switch'
        ? 'Uplink Switch'
        : 'Uplink Gateway';

  const startRename = () => {
    setRenameDraft(displayName);
    setIsRenaming(true);
  };

  const commitRename = () => {
    const trimmed = renameDraft.trim();
    if (trimmed && trimmed !== displayName) {
      setRenamedNames((prev) => ({ ...prev, [client.key]: trimmed }));
      onRenameClient?.(client, trimmed);
      notification.success({
        title: 'Client Renamed',
        description: `Updated client alias to ${trimmed}.`,
      });
    }
    setIsRenaming(false);
  };

  const triggerClientAction = (actionKey: string) => {
    onClientAction?.(client, actionKey);
    const messages: Record<string, string> = {
      manage: `Opened client management profile for ${displayName}.`,
      tools: `Launched latency & packet diagnostic tools for ${displayName} (${client.ipAddress}).`,
      authorize: `${displayName} authorization status updated.`,
      reconnect: `Sent wireless reconnect request to ${displayName}.`,
      block: `${displayName} scheduled for access block.`,
      forget: `${displayName} removed from historical client cache.`,
    };
    notification.info({
      title: 'Client Action',
      description: messages[actionKey] ?? `Triggered ${actionKey} for ${displayName}.`,
    });
  };

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'authorize',
      label: client.status === 'authorized' ? 'Unauthorize Client' : 'Authorize Client',
    },
    ...(client.connectionType === 'wireless'
      ? [{ key: 'reconnect', label: 'Reconnect' }]
      : []),
    { key: 'block', label: 'Block Client' },
    { type: 'divider' },
    { key: 'forget', label: 'Forget Client', danger: true },
  ];

  const infoRows = [
    { label: 'MAC Address', value: client.mac },
    { label: 'IP Address', value: client.ipAddress },
    { label: 'Type', value: client.clientTypeLabel },
    { label: 'Uptime', value: client.drawerUptime ?? client.uptime },
    { label: 'Network', value: client.network !== '--' ? client.network : client.ssid },
    { label: 'VLAN', value: String(client.vlan) },
  ];

  return (
    <aside
      role="dialog"
      aria-label={`${displayName} properties`}
      className="omada-client-drawer"
    >
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

        {/* Centered Client Hero */}
        <div className="mt-1 flex flex-col items-center text-center">
          <div className="flex h-[52px] items-center justify-center">
            <SClientIcon
              name={client.clientIcon}
              theme={client.forceLightIcon ? 'light' : 'auto'}
              size={46}
              alt={displayName}
              className="object-contain"
            />
          </div>

          <div className="mt-2.5 flex max-w-full items-center justify-center gap-1.5">
            {isRenaming ? (
              <div className="flex items-center gap-1.5">
                <Input
                  size="small"
                  aria-label="New client name"
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
                  {displayName}
                </h2>
                <button
                  type="button"
                  aria-label="Rename client"
                  onClick={startRename}
                  className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-[var(--omada-brand-bg-subtlest)]"
                >
                  <SIcon name="edit" size={16} />
                </button>
              </>
            )}
          </div>

          <div
            className="mt-1 text-[13px] font-medium leading-5"
            style={{ color: statusMeta.color }}
          >
            {statusMeta.label}
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerClientAction('manage')}
            className="omada-client-drawer-outline-btn h-[36px] flex-1 cursor-pointer text-[14px] font-medium"
          >
            Manage Client
          </button>

          <Tooltip title="Client Tools">
            <button
              type="button"
              aria-label="Client tools"
              onClick={() => triggerClientAction('tools')}
              className="omada-client-drawer-icon-btn inline-flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center"
            >
              <SIcon name="sidebar-icon-icon-tools-off" size={17} />
            </button>
          </Tooltip>

          <Dropdown
            menu={{
              items: moreMenuItems,
              onClick: ({ key }) => triggerClientAction(String(key)),
            }}
            trigger={['click']}
            placement="bottomRight"
            destroyOnHidden
          >
            <button
              type="button"
              aria-label="More client actions"
              className="omada-client-drawer-icon-btn inline-flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center"
            >
              <SIcon name="more-3" size={16} />
            </button>
          </Dropdown>
        </div>

        {/* Stacked Detail Cards */}
        <div className="mt-4 flex flex-col gap-3">
          {/* 1. Client 24h health */}
          <section className="omada-client-drawer-card p-4">
            <h3 className="m-0 mb-3 text-[15px] font-semibold text-[var(--omada-text-primary)]">
              Client 24h health
            </h3>
            <SHealthTrendBar
              rows={[{ key: 'client', label: '', ticks: client.healthTicks }]}
              className="omada-client-drawer-health-bar"
            />
            <div className="mt-2 flex items-center justify-between text-[12px] tabular-nums text-[var(--omada-text-tertiary)]">
              <span>03:25 pm</span>
              <span>03:25 pm</span>
            </div>
          </section>

          {/* 2. Uplink Gateway / AP */}
          <section className="omada-client-drawer-card p-4">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--omada-border-divider)] pb-3">
              <h3 className="m-0 shrink-0 text-[15px] font-semibold text-[var(--omada-text-primary)]">
                {uplinkHeading}
              </h3>
              <div className="flex min-w-0 items-center gap-2">
                <SProductImage
                  name={client.uplinkProductSlug}
                  size={28}
                  className="h-[20px] w-[30px] shrink-0 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDeviceByName) {
                      onOpenDeviceByName(client.apOrPort);
                    } else {
                      notification.info({
                        title: uplinkHeading,
                        description: `Inspecting ${client.apOrPort}.`,
                      });
                    }
                  }}
                  className="cursor-pointer truncate border-0 bg-transparent p-0 text-right text-[13px] text-[var(--omada-link)] hover:underline"
                >
                  {client.apOrPort}
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2.5 text-[13px] leading-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--omada-text-secondary)]">
                  Download Throughput
                </span>
                <span className="font-medium tabular-nums text-[var(--omada-text-primary)]">
                  {client.downloadThroughput}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-[var(--omada-text-secondary)]">
                  Pkts/Bytes
                </span>
                <div className="space-y-1 text-right font-medium tabular-nums text-[var(--omada-text-primary)]">
                  <div className="flex items-center justify-end gap-1.5">
                    <SIcon
                      name="icon-25947-12337"
                      size={14}
                      className="text-[var(--omada-link)]"
                    />
                    <span>
                      {client.upPackets} / {client.upBytes}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <SIcon
                      name="icon-25947-12331"
                      size={14}
                      className="text-[var(--omada-color-magenta)]"
                    />
                    <span>
                      {client.downPackets} / {client.downBytes}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Info */}
          <section className="omada-client-drawer-card p-4">
            <h3 className="m-0 mb-2 text-[15px] font-semibold text-[var(--omada-text-primary)]">
              Info
            </h3>
            <dl className="m-0 space-y-1">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-3 py-1.5 text-[13px] leading-5"
                >
                  <dt className="shrink-0 text-[var(--omada-text-secondary)]">
                    {row.label}
                  </dt>
                  <dd className="m-0 text-right font-medium break-all tabular-nums text-[var(--omada-text-primary)]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </aside>
  );
};
