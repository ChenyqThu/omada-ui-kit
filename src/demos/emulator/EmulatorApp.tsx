import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EMULATOR_NAV_GROUPS,
  SButton,
  SEmpty,
  SEmulatorShell,
  SIcon,
  SInput,
  SModal,
  SProductImage,
  omadaLayout,
  useOmadaNotification,
} from '@/omada';
import { SiteDashboardPage } from './dashboard/SiteDashboardPage';
import { DeviceListPage } from './devices/DeviceListPage';
import { EMULATOR_DEVICES, type EmulatorDeviceRecord } from './devices/devicesData';
import {
  DevicePropertiesDrawer,
  type DrawerDeviceRecord,
  type DrawerMode,
  type ExpandedDrawerTab,
} from './drawer/DevicePropertiesDrawer';
import { ClientListPage } from './clients/ClientListPage';
import { ClientPropertiesDrawer } from './clients/ClientPropertiesDrawer';
import { EMULATOR_CLIENTS, type EmulatorClientRecord } from './clients/clientsData';
import { MapPage } from './map/MapPage';
import { ApplicationAnalyticsPage } from './insights/ApplicationAnalyticsPage';
import { ReportsPage } from './insights/ReportsPage';
import { LogsPage } from './logs/LogsPage';
import { IncidentsPage } from './incidents/IncidentsPage';
import { IntelliRecoverPage } from './intellirecover/IntelliRecoverPage';

const NAV_ITEM_META = new Map<string, { label: string; groupLabel: string }>();
for (const group of EMULATOR_NAV_GROUPS) {
  for (const item of group.items) {
    NAV_ITEM_META.set(item.key, {
      label: item.label,
      groupLabel: group.label ?? 'Emulator',
    });
    if (item.submenuGroups) {
      for (const subGroup of item.submenuGroups) {
        for (const subItem of subGroup.items) {
          NAV_ITEM_META.set(subItem.key, {
            label: subItem.label,
            groupLabel: subGroup.title ? `${item.label} · ${subGroup.title}` : item.label,
          });
        }
      }
    }
  }
}

const ROUTE_ALIASES: Record<string, string> = {
  insights: 'statistics',
  reports: 'report',
  log: 'logs',
  abnormal: 'incidents',
  intellirecover: 'intelli-recover',
};

const IMPLEMENTED_ROUTES = new Set([
  'dashboard',
  'devices',
  'clients',
  'map',
  'statistics',
  'report',
  'logs',
  'incidents',
  'intelli-recover',
]);

function parseEmulatorRoute(hashOrRoute: string): string {
  const cleaned = hashOrRoute.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (!cleaned || cleaned === 'dashboard') {
    return 'dashboard';
  }
  const aliased = ROUTE_ALIASES[cleaned] ?? cleaned;
  return NAV_ITEM_META.has(aliased) ? aliased : 'dashboard';
}

export interface EmulatorAppProps {
  /** Optional initial route override for isolated testing. */
  initialRoute?: string;
}

/**
 * Integrated Omada Controller v6.3.0.34 Emulator application (`#/dashboard`, `#/devices`,
 * `#/clients`, `#/map`, `#/statistics`, `#/report`, `#/logs`, `#/incidents`,
 * `#/intelli-recover`, two-stage `420px`/`1224px` `DevicePropertiesDrawer`,
 * `420px` `ClientPropertiesDrawer`, `800px` `IncidentDetailDrawer`, and `#/showcase` switcher).
 */
export const EmulatorApp: React.FC<EmulatorAppProps> = ({ initialRoute }) => {
  const notification = useOmadaNotification();

  const [activeRoute, setActiveRoute] = useState<string>(() => {
    if (initialRoute) return parseEmulatorRoute(initialRoute);
    if (typeof window !== 'undefined') {
      return parseEmulatorRoute(window.location.hash);
    }
    return 'dashboard';
  });

  const [activeSite, setActiveSite] = useState<string>('main-office-floor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [devices, setDevices] = useState<EmulatorDeviceRecord[]>(EMULATOR_DEVICES);
  const [clients, setClients] = useState<EmulatorClientRecord[]>(EMULATOR_CLIENTS);

  const [activeDeviceKey, setActiveDeviceKey] = useState<string>('salesdepartment-switch-3');
  const [hasExplicitDeviceSelection, setHasExplicitDeviceSelection] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('quick');
  const [drawerTab, setDrawerTab] = useState<ExpandedDrawerTab>('ports');

  const [activeClientKey, setActiveClientKey] = useState<string>('test-pc');
  const [clientDrawerOpen, setClientDrawerOpen] = useState<boolean>(false);

  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initialRoute) return;
    const handleHashChange = () => {
      const next = parseEmulatorRoute(window.location.hash);
      setActiveRoute(next);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [initialRoute]);

  const navigateTo = useCallback((routeKey: string) => {
    if (routeKey === 'showcase') {
      setDrawerOpen(false);
      setClientDrawerOpen(false);
      if (typeof window !== 'undefined') {
        window.location.hash = '#/showcase';
      }
      return;
    }
    const normalized = parseEmulatorRoute(routeKey);
    setActiveRoute(normalized);
    setDrawerOpen(false);
    setClientDrawerOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${normalized}`;
    }
  }, []);

  const openQuickDrawerForDevice = useCallback((device: EmulatorDeviceRecord) => {
    setClientDrawerOpen(false);
    setActiveDeviceKey(device.key);
    setHasExplicitDeviceSelection(true);
    setDrawerMode('quick');
    setDrawerTab('ports');
    setDrawerOpen(true);
  }, []);

  const openDeviceByName = useCallback(
    (deviceName: string) => {
      const lower = deviceName.trim().toLowerCase();
      const matched =
        devices.find((d) => d.name.toLowerCase() === lower) ??
        devices.find((d) => d.name === 'MainOffice_Gateway_2') ??
        devices[0];
      if (matched) {
        openQuickDrawerForDevice(matched);
      }
    },
    [devices, openQuickDrawerForDevice],
  );

  const openQuickDrawerForClient = useCallback((client: EmulatorClientRecord) => {
    setDrawerOpen(false);
    setActiveClientKey(client.key);
    setClientDrawerOpen(true);
  }, []);

  const openClientByName = useCallback(
    (clientName: string) => {
      const lower = clientName.trim().toLowerCase();
      const matched =
        clients.find((c) => c.name.toLowerCase() === lower) ??
        clients.find((c) => c.mac.toLowerCase() === lower) ??
        clients[0];
      if (matched) {
        openQuickDrawerForClient(matched);
      }
    },
    [clients, openQuickDrawerForClient],
  );

  const activeDevice = useMemo(() => {
    const preferredKey = hasExplicitDeviceSelection
      ? activeDeviceKey
      : activeRoute === 'dashboard'
        ? 'mainoffice-gateway-2'
        : 'salesdepartment-switch-3';
    return devices.find((d) => d.key === preferredKey) ?? devices[0] ?? null;
  }, [devices, hasExplicitDeviceSelection, activeDeviceKey, activeRoute]);

  const activeClient = useMemo(
    () => clients.find((c) => c.key === activeClientKey) ?? clients[0] ?? null,
    [clients, activeClientKey],
  );

  const handleToggleQuickDrawer = useCallback(() => {
    if (drawerOpen) {
      setDrawerOpen(false);
      return;
    }
    setClientDrawerOpen(false);
    setDrawerMode('quick');
    setDrawerOpen(true);
  }, [drawerOpen]);

  const handleRenameDevice = useCallback((target: DrawerDeviceRecord, nextName: string) => {
    setDevices((prev) =>
      prev.map((item) => (item.key === target.key ? { ...item, name: nextName } : item)),
    );
  }, []);

  const handleRenameClient = useCallback((target: EmulatorClientRecord, nextName: string) => {
    setClients((prev) =>
      prev.map((item) => (item.key === target.key ? { ...item, name: nextName } : item)),
    );
  }, []);

  const handleClientAction = useCallback((target: EmulatorClientRecord, action: string) => {
    if (action === 'authorize') {
      setClients((prev) =>
        prev.map((item) =>
          item.key === target.key
            ? { ...item, status: item.status === 'authorized' ? 'pending' : 'authorized' }
            : item,
        ),
      );
    } else if (action === 'block') {
      setClients((prev) =>
        prev.map((item) =>
          item.key === target.key
            ? { ...item, status: 'blocked', onlineState: 'blocked' }
            : item,
        ),
      );
    } else if (action === 'forget') {
      setClients((prev) => prev.filter((item) => item.key !== target.key));
      setClientDrawerOpen(false);
    }
  }, []);

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q) ||
        d.ipv4.toLowerCase().includes(q),
    );
  }, [devices, searchQuery]);

  const sidebarWidth = sidebarCollapsed
    ? omadaLayout.sidebarCollapsedWidth
    : omadaLayout.sidebarWidth;

  const routeMeta = NAV_ITEM_META.get(activeRoute);

  return (
    <SEmulatorShell
      activeKey={activeRoute}
      onSelect={navigateTo}
      activeSite={activeSite}
      onSiteChange={(siteKey) => {
        setActiveSite(siteKey);
        notification.info({
          title: 'Site Switched',
          description: `Active site context updated to "${siteKey}".`,
        });
      }}
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      onSearchClick={() => {
        setSearchQuery('');
        setSearchModalOpen(true);
      }}
      onRefresh={() =>
        notification.success({
          title: 'Telemetry Refreshed',
          description: 'Headquarters Building · Main Office Floor status synchronized.',
        })
      }
      onOpenShowcase={() => navigateTo('showcase')}
      onMoreSelect={(key) => {
        if (key === 'about') {
          setAboutModalOpen(true);
        } else if (key === 'feedback') {
          notification.info({
            title: 'Feedback',
            description: 'Omada Controller v6.3.0.34 feedback portal ready.',
          });
        } else if (key === 'tutorial') {
          notification.info({
            title: 'Controller Tutorial',
            description: 'Click any device row or MainOffice_Gateway_2 to inspect ports.',
          });
        }
      }}
      onToggleQuickDrawer={handleToggleQuickDrawer}
      showQuickDrawerHandle
    >
      {activeRoute === 'dashboard' && (
        <SiteDashboardPage
          onOpenDeviceByName={openDeviceByName}
          onNavigate={navigateTo}
        />
      )}

      {activeRoute === 'devices' && (
        <DeviceListPage
          devices={devices}
          selectedDeviceKey={drawerOpen ? activeDevice?.key ?? null : null}
          onSelectDevice={openQuickDrawerForDevice}
        />
      )}

      {activeRoute === 'clients' && (
        <ClientListPage
          clients={clients}
          selectedClientKey={clientDrawerOpen ? activeClient?.key ?? null : null}
          onSelectClient={openQuickDrawerForClient}
          onOpenDeviceByName={openDeviceByName}
        />
      )}

      {activeRoute === 'map' && <MapPage onOpenDeviceByName={openDeviceByName} />}

      {activeRoute === 'statistics' && (
        <ApplicationAnalyticsPage onOpenClientByName={openClientByName} />
      )}

      {activeRoute === 'report' && <ReportsPage />}

      {activeRoute === 'logs' && (
        <LogsPage
          onOpenClientByName={openClientByName}
          onOpenDeviceByName={openDeviceByName}
        />
      )}

      {activeRoute === 'incidents' && (
        <IncidentsPage onOpenDeviceByName={openDeviceByName} />
      )}

      {activeRoute === 'intelli-recover' && (
        <IntelliRecoverPage onOpenDeviceByName={openDeviceByName} />
      )}

      {!IMPLEMENTED_ROUTES.has(activeRoute) && (
        <div className="p-6" data-testid={`emulator-route-${activeRoute}`}>
          <div className="omada-dash-card p-6">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-[var(--omada-border-divider)] pb-4">
              <div>
                <div className="text-[12px] font-medium text-[var(--omada-text-tertiary)]">
                  {routeMeta?.groupLabel ?? 'Omada Controller'}
                </div>
                <h1 className="m-0 mt-0.5 text-[20px] font-semibold text-[var(--omada-text-primary)]">
                  {routeMeta?.label ?? activeRoute}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <SButton variant="outline" onClick={() => navigateTo('dashboard')}>
                  Back to Dashboard
                </SButton>
                <SButton variant="primary" onClick={() => navigateTo('devices')}>
                  View Devices
                </SButton>
              </div>
            </div>
            <SEmpty
              title={`${routeMeta?.label ?? activeRoute} Workspace`}
              description="Simulated module view inside Omada Controller v6.3.0.34. Switch to Dashboard, Devices, Clients, Map, Insights, Logs, Incidents, or IntelliRecover to inspect live telemetry."
            />
          </div>
        </div>
      )}

      <ClientPropertiesDrawer
        open={clientDrawerOpen}
        client={activeClient}
        onClose={() => setClientDrawerOpen(false)}
        onOpenDeviceByName={openDeviceByName}
        onRenameClient={handleRenameClient}
        onClientAction={handleClientAction}
      />

      <DevicePropertiesDrawer
        open={drawerOpen}
        device={activeDevice}
        mode={drawerMode}
        onModeChange={setDrawerMode}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        availableDevices={devices}
        onSelectDevice={(target) => {
          setActiveDeviceKey(target.key);
          setHasExplicitDeviceSelection(true);
        }}
        onRenameDevice={handleRenameDevice}
        onClose={() => setDrawerOpen(false)}
        sidebarWidth={sidebarWidth}
      />

      <SModal
        size="sm"
        title="Quick Search Devices"
        open={searchModalOpen}
        onCancel={() => setSearchModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <div className="space-y-3">
          <SInput
            variant="filled"
            allowClear
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device name, model, MAC, or IPv4..."
            prefix={<SIcon name="input-search" size={14} />}
          />
          <div className="max-h-[300px] space-y-1 overflow-y-auto">
            {searchMatches.map((dev) => (
              <button
                key={dev.key}
                type="button"
                onClick={() => {
                  setSearchModalOpen(false);
                  openQuickDrawerForDevice(dev);
                }}
                className="flex w-full cursor-pointer items-center justify-between rounded-[6px] border border-transparent bg-transparent px-2.5 py-2 text-left transition-colors hover:border-[var(--omada-border-divider)] hover:bg-[var(--omada-bg-field)]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <SProductImage name={dev.productSlug} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-[var(--omada-text-primary)]">
                      {dev.name}
                    </div>
                    <div className="truncate text-[12px] text-[var(--omada-text-tertiary)]">
                      {dev.model} · {dev.ipv4}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-[12px] font-medium text-[var(--omada-brand-text)]">
                  Inspect
                </span>
              </button>
            ))}
            {searchMatches.length === 0 && (
              <div className="py-6 text-center text-[13px] text-[var(--omada-text-tertiary)]">
                No matching devices found.
              </div>
            )}
          </div>
        </div>
      </SModal>

      <SModal
        size="sm"
        title="About Omada Controller"
        open={aboutModalOpen}
        onCancel={() => setAboutModalOpen(false)}
        onOk={() => setAboutModalOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Close"
        destroyOnHidden
      >
        <div className="space-y-2 text-[13px] text-[var(--omada-text-secondary)]">
          <div>
            <strong className="text-[var(--omada-text-primary)]">Controller:</strong>{' '}
            Headquarters Building (Omada Controller v6.3.0.34)
          </div>
          <div>
            <strong className="text-[var(--omada-text-primary)]">Active Site:</strong>{' '}
            Main Office Floor (9 Devices · 4 Clients)
          </div>
          <div>
            <strong className="text-[var(--omada-text-primary)]">UI Kit:</strong>{' '}
            Ant Design 6 + React 19 + ECharts 5 + Tailwind v4
          </div>
        </div>
      </SModal>
    </SEmulatorShell>
  );
};
