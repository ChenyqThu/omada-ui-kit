import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Copy,
  Download,
  Edit3,
  Folder,
  Home,
  LayoutGrid,
  Moon,
  MoreHorizontal,
  Plus,
  Router,
  Settings,
  Shield,
  Sun,
  Trash2,
  Wifi,
} from 'lucide-react';
import {
  SButton,
  SCard,
  SIcon,
  SPageHeader,
  STabs,
  STag,
  useOmadaFeedback,
  useOmadaTheme,
} from '@/omada';
import {
  SAppShell,
  type SAppShellEdition,
  type SAppShellVariant,
  type SNavGroup,
  type SSiteOption,
} from '@/omada/layout/SAppShell';
import {
  SAnchor,
  SBreadcrumb,
  SDivider,
  SDropdown,
  SPagination,
  SSteps,
  type SAnchorItem,
  type SDropdownItem,
  type SStepItem,
} from '@/omada/modules/nav-shell';
import '../../styles/modules/nav-shell.css';

const DEMO_SHELL_GROUPS: SNavGroup[] = [
  {
    key: 'monitor',
    label: 'Manage',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <SIcon name="sidebar-icon-icon-dashboard-off" size={16} />,
      },
      {
        key: 'devices',
        label: 'Devices',
        icon: <SIcon name="sidebar-icon-icon-device-off" size={16} />,
        badge: 48,
      },
      {
        key: 'logs',
        label: 'Alerts & Logs',
        icon: <SIcon name="sidebar-icon-icon-alert-off" size={16} />,
        badge: 12,
      },
    ],
  },
  {
    key: 'config',
    label: 'Configuration',
    items: [
      {
        key: 'network-config',
        label: 'Network Config',
        icon: <SIcon name="sidebar-icon-icon-network-config-off" size={16} />,
        children: [
          { key: 'lan', label: 'LAN & VLANs' },
          { key: 'wlan', label: 'Wireless Networks' },
          { key: 'vpn', label: 'Site-to-Site VPN', badge: 'BETA' },
        ],
      },
      {
        key: 'device-config',
        label: 'Device Config',
        icon: <SIcon name="sidebar-icon-icon-device-config-off" size={16} />,
        children: [
          { key: 'switch-ports', label: 'Switch Port Profiles' },
          { key: 'rf-plan', label: 'AI WLAN Optimization' },
        ],
      },
      {
        key: 'security',
        label: 'Security',
        icon: <SIcon name="sidebar-icon-icon-security-off" size={16} />,
      },
    ],
  },
];

const DEMO_SITES: SSiteOption[] = [
  {
    key: 'hq',
    label: 'Headquarters Building',
    subtitle: '48 Devices · 412 Clients',
    tag: 'Cluster',
  },
  {
    key: 'msp-global',
    label: 'Acme Managed Network',
    subtitle: '14 Customer Sites · MSP Tier',
    tag: 'MSP',
  },
  {
    key: 'west',
    label: 'Branch Office - West',
    subtitle: '19 Devices · 128 Clients',
  },
];

const COMPACT_MENU_ITEMS: SDropdownItem[] = [
  { key: 'edit', icon: <Edit3 size={14} />, label: 'Edit Configuration' },
  { key: 'clone', icon: <Copy size={14} />, label: 'Clone Profile' },
  { key: 'export', icon: <Download size={14} />, label: 'Export JSON' },
  { type: 'divider' },
  { key: 'delete', icon: <Trash2 size={14} />, label: 'Delete Device', danger: true },
];

const GROUPED_CHECKABLE_ITEMS: SDropdownItem[] = [
  {
    type: 'group',
    key: 'bands',
    label: 'Radio Bands',
    children: [
      { key: '2.4g', label: '2.4 GHz (802.11ax)' },
      { key: '5g', label: '5 GHz (160 MHz)' },
      { key: '6g', label: '6 GHz (Wi-Fi 7)' },
    ],
  },
  { type: 'divider' },
  {
    type: 'group',
    key: 'channels',
    label: 'Channel Width',
    children: [
      { key: 'auto', label: 'Auto Optimization' },
      { key: 'manual', label: 'Manual Channel Pinning' },
    ],
  },
];

const CASCADING_ITEMS: SDropdownItem[] = [
  { key: 'ap-670', label: 'EAP670 — Conference North', icon: <Wifi size={14} /> },
  { key: 'ap-783', label: 'EAP783 — Executive Lobby', icon: <Wifi size={14} /> },
  {
    key: 'switches',
    label: 'Core & Edge Switches',
    icon: <Router size={14} />,
    children: [
      { key: 'sw-1', label: 'Core-SW-Floor1 (SG3428XMP)' },
      { key: 'sw-2', label: 'Dist-SW-Floor2 (SG3210XHP)' },
    ],
  },
  {
    key: 'security',
    label: 'Gateway ACL Policies',
    icon: <Shield size={14} />,
    children: [
      { key: 'acl-guest', label: 'Guest Isolation Policy' },
      { key: 'acl-iot', label: 'IoT Subnet Restrictions' },
    ],
  },
];

export const NavShellSection: React.FC = () => {
  const { resolvedTheme, setThemeMode } = useOmadaTheme();
  const { toast } = useOmadaFeedback();

  // Shell preview state
  const [edition, setEdition] = useState<SAppShellEdition>('standard');
  const [shellVariant, setShellVariant] = useState<SAppShellVariant>('controller');
  const [shellActiveKey, setShellActiveKey] = useState<string>('wlan');
  const [shellSite, setShellSite] = useState<string>('hq');

  // Dropdown state
  const [selectedBandKeys, setSelectedBandKeys] = useState<string[]>(['5g', '6g']);

  // Pagination state
  const [pageDefault, setPageDefault] = useState(1);
  const [pageSizeDefault, setPageSizeDefault] = useState(10);
  const [pageSimple, setPageSimple] = useState(2);
  const [pageMinimal, setPageMinimal] = useState(3);

  // Steps state
  const [stepCurrent, setStepCurrent] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState(false);
  const [navStep, setNavStep] = useState(1);

  // Anchor state
  const anchorContainerRef = useRef<HTMLDivElement>(null);
  const [activeAnchor, setActiveAnchor] = useState('#nav-sec-general');

  const wizardSteps: SStepItem[] = [
    { title: 'Discover Devices', content: 'Scan subnet 192.168.0.0/24' },
    {
      title: 'Adopt & Provision',
      content: stepError ? 'SSH handshake failed' : 'Push site templates & WLAN',
      loading: stepLoading && stepCurrent === 1,
    },
    { title: 'Verify Topology', content: 'Confirm uplink & PoE draw' },
    { title: 'Go Live', content: 'Enable AI monitoring' },
  ];

  const anchorItems: SAnchorItem[] = [
    {
      key: 'general',
      href: '#nav-sec-general',
      title: 'General Settings',
      children: [
        { key: 'identity', href: '#nav-sec-identity', title: 'Site Identity' },
        { key: 'timezone', href: '#nav-sec-timezone', title: 'Region & Timezone' },
      ],
    },
    { key: 'wireless', href: '#nav-sec-wireless', title: 'Wireless & Radios' },
    {
      key: 'security',
      href: '#nav-sec-security',
      title: 'Firewall Alert',
      status: 'error',
    },
    {
      key: 'legacy',
      href: '#nav-sec-legacy',
      title: 'Legacy SNMP (Disabled)',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Navigation & Shell"
        description="Omada Top Bar & Sidebar variants, nested submenus, Dropdown menus, Pagination, Steps, Breadcrumb, Anchor TOC, and Dividers."
        extra={
          <SButton
            variant="secondary"
            icon={resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </SButton>
        }
      />

      {/* 1. SAppShell Variants, Editions & Nested Submenus */}
      <SCard
        title="SAppShell (Top Bar Variants, Editions & Collapsible Nested Submenus)"
        subtitle="Switch between Controller, Omada Central, Portal, and Account headers, or toggle Standard / Pro / MSP editions."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
                Shell Variant:
              </span>
              <STabs
                variant="capsule"
                activeKey={shellVariant}
                onChange={(k) => setShellVariant(k as SAppShellVariant)}
                items={[
                  { key: 'controller', label: 'Controller' },
                  { key: 'central', label: 'Central' },
                  { key: 'portal', label: 'Portal' },
                  { key: 'account', label: 'Account' },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
                Edition:
              </span>
              <STabs
                variant="segment"
                activeKey={edition}
                onChange={(k) => setEdition(k as SAppShellEdition)}
                items={[
                  { key: 'standard', label: 'Standard' },
                  { key: 'pro', label: 'Omada Pro' },
                  { key: 'msp', label: 'MSP' },
                ]}
              />
            </div>
          </div>

          <SAppShell
            embedded
            edition={edition}
            shellVariant={shellVariant}
            navGroups={DEMO_SHELL_GROUPS}
            activeKey={shellActiveKey}
            onSelect={setShellActiveKey}
            sites={DEMO_SITES}
            activeSite={shellSite}
            onSiteChange={(s) => {
              setShellSite(s);
              toast.info(`Switched preview site to ${s}`);
            }}
            userName="Zoe Wang"
            userEmail="zoe.wang@tp-link.com"
            orgTags={edition === 'msp' ? ['Cluster'] : undefined}
            onSearchClick={() => toast.info('Quick Search opened')}
            onNotificationClick={() => toast.info('12 unread site alerts')}
            onSignOut={() => toast.info('Sign out clicked')}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="m-0 text-base font-semibold text-[var(--omada-text-primary)]">
                    Active Route: <span className="text-[var(--omada-brand-text)]">{shellActiveKey}</span>
                  </h4>
                  <p className="mt-0.5 text-xs text-[var(--omada-text-secondary)]">
                    Edition: <strong>{edition}</strong> · Shell: <strong>{shellVariant}</strong> · Collapse the sidebar to test floating submenu popovers.
                  </p>
                </div>
                <STag color="green">{shellVariant.toUpperCase()}</STag>
              </div>
              <SDivider />
              <p className="text-xs text-[var(--omada-text-secondary)]">
                Level-1 items with <code>children</code> expand inline (<code>padding-left: 36px</code> on Level-2) and convert into floating popovers when collapsed to 52px.
              </p>
            </div>
          </SAppShell>
        </div>
      </SCard>

      {/* 2. Breadcrumb & Divider */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="SBreadcrumb (Text, Icons, Collapse & Ellipsis)">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Icon + Text (Chevron Separator)
              </div>
              <SBreadcrumb
                items={[
                  { key: 'home', icon: <Home size={14} />, title: 'Home', onClick: () => toast.info('Home') },
                  { key: 'sites', icon: <LayoutGrid size={14} />, title: 'Sites', onClick: () => toast.info('Sites') },
                  { key: 'hq', title: 'Headquarters' },
                  { key: 'wlan', title: 'Wireless Networks' },
                ]}
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Icon-Only Root + Slash Separator + Long Title Truncation
              </div>
              <SBreadcrumb
                separatorVariant="slash"
                maxItemWidth={120}
                items={[
                  { key: 'root', icon: <Home size={14} />, iconOnly: true, title: 'Global Root', onClick: () => toast.info('Global Root') },
                  { key: 'org', title: 'Enterprise Campus Building B' },
                  { key: 'floor', title: 'Third Floor East Wing Switches' },
                  { key: 'port', title: 'Port 24 PoE++' },
                ]}
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Collapsed <code>...</code> Dropdown (5+ Levels, <code>maxItems=4</code>)
              </div>
              <SBreadcrumb
                maxItems={4}
                items={[
                  { key: '1', icon: <Folder size={14} />, title: 'Global', onClick: () => toast.info('Global') },
                  { key: '2', title: 'North America', onClick: () => toast.info('North America') },
                  { key: '3', title: 'California HQ', onClick: () => toast.info('California HQ') },
                  { key: '4', title: 'Building 4', onClick: () => toast.info('Building 4') },
                  { key: '5', title: 'Core Switches', onClick: () => toast.info('Core Switches') },
                  { key: '6', title: 'SG3428XMP' },
                ]}
              />
            </div>
          </div>
        </SCard>

        <SCard title="SDivider (Plain, Titled, Variants, Inset & Vertical)">
          <div className="space-y-3">
            <div className="text-xs text-[var(--omada-text-secondary)]">
              Solid &amp; Dashed Hairline Dividers (1px <code>--omada-border-divider</code>)
            </div>
            <SDivider />
            <SDivider variant="dashed" titlePlacement="start">
              Uplinks
            </SDivider>
            <SDivider variant="dotted" titlePlacement="center">
              Wireless Settings
            </SDivider>
            <div className="rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] py-3">
              <div className="px-6 text-xs text-[var(--omada-text-secondary)]">
                Settings panel inset divider (24px horizontal margin)
              </div>
              <SDivider inset titlePlacement="end">
                Advanced
              </SDivider>
            </div>
            <div className="flex items-center text-xs text-[var(--omada-text-primary)]">
              <button
                type="button"
                onClick={() => toast.info('Edit')}
                className="cursor-pointer hover:text-[var(--omada-brand-text)]"
              >
                Edit
              </button>
              <SDivider orientation="vertical" />
              <button
                type="button"
                onClick={() => toast.info('Clone')}
                className="cursor-pointer hover:text-[var(--omada-brand-text)]"
              >
                Clone
              </button>
              <SDivider orientation="vertical" />
              <button
                type="button"
                onClick={() => toast.error('Delete')}
                className="cursor-pointer text-[var(--omada-color-error)]"
              >
                Delete
              </button>
            </div>
          </div>
        </SCard>
      </div>

      {/* 3. Dropdown Menu & Pagination */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="SDropdown (Compact, Grouped/Checkable, Searchable & Cascading)">
          <div className="flex flex-wrap items-center gap-3">
            <SDropdown
              widthPreset="compact"
              items={COMPACT_MENU_ITEMS}
              trigger={['click']}
              onSelect={(k) => toast.info(`Action: ${k}`)}
            >
              <SButton variant="secondary" icon={<MoreHorizontal size={15} />}>
                Compact Actions (178px)
              </SButton>
            </SDropdown>

            <SDropdown
              widthPreset="default"
              selectable
              selectedKeys={selectedBandKeys}
              items={GROUPED_CHECKABLE_ITEMS}
              trigger={['click']}
              onSelect={(k) => {
                setSelectedBandKeys((prev) =>
                  prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
                );
              }}
            >
              <SButton variant="outline">
                Selectable Bands ({selectedBandKeys.length})
              </SButton>
            </SDropdown>

            <SDropdown
              widthPreset="wide"
              searchable
              searchPlaceholder="Filter devices or ACLs..."
              header="Target Hardware & Policies"
              footer={
                <SButton
                  variant="link"
                  size="small"
                  icon={<Plus size={13} />}
                  onClick={() => toast.success('Create policy triggered')}
                >
                  Create New Policy
                </SButton>
              }
              items={CASCADING_ITEMS}
              trigger={['click']}
              onSelect={(k) => toast.success(`Selected ${k}`)}
            >
              <SButton variant="primary">
                Searchable & Cascading (275px)
              </SButton>
            </SDropdown>
          </div>
        </SCard>

        <SCard title="SPagination (Default, Simple & Minimal Variants)">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                Default (Summary + Page Pills + Size Changer)
              </div>
              <SPagination
                variant="default"
                total={200}
                current={pageDefault}
                pageSize={pageSizeDefault}
                showQuickJumper
                onChange={(p, s) => {
                  setPageDefault(p);
                  setPageSizeDefault(s);
                }}
              />
            </div>

            <SDivider />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Simple Variant
                </div>
                <SPagination
                  variant="simple"
                  total={80}
                  current={pageSimple}
                  onChange={(p) => setPageSimple(p)}
                />
              </div>

              <div>
                <div className="mb-1.5 text-xs font-medium text-[var(--omada-text-secondary)]">
                  Minimal Variant
                </div>
                <SPagination
                  variant="minimal"
                  total={60}
                  current={pageMinimal}
                  onChange={(p) => setPageMinimal(p)}
                />
              </div>
            </div>
          </div>
        </SCard>
      </div>

      {/* 4. Steps */}
      <SCard
        title="SSteps (Horizontal, Loading, Error, Navigation, Dot & Vertical)"
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <SButton
              variant="secondary"
              size="small"
              onClick={() => setStepLoading((v) => !v)}
            >
              {stepLoading ? 'Stop Loading' : 'Simulate Loading'}
            </SButton>
            <SButton
              variant={stepError ? 'danger-outline' : 'secondary'}
              size="small"
              icon={<AlertCircle size={13} />}
              onClick={() => setStepError((v) => !v)}
            >
              {stepError ? 'Clear Error' : 'Simulate Error'}
            </SButton>
            <SButton
              variant="secondary"
              size="small"
              disabled={stepCurrent === 0}
              onClick={() => setStepCurrent((c) => Math.max(0, c - 1))}
            >
              Prev
            </SButton>
            <SButton
              variant="primary"
              size="small"
              disabled={stepCurrent >= wizardSteps.length - 1}
              onClick={() => setStepCurrent((c) => Math.min(wizardSteps.length - 1, c + 1))}
            >
              Next
            </SButton>
          </div>
        }
      >
        <div className="space-y-6">
          <SSteps
            current={stepCurrent}
            status={stepError ? 'error' : 'process'}
            items={wizardSteps}
            onChange={(next) => setStepCurrent(next)}
          />

          <SDivider />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="text-xs font-medium text-[var(--omada-text-secondary)]">
                Navigation Steps (Clickable Tabs)
              </div>
              <SSteps
                type="navigation"
                size="small"
                current={navStep}
                onChange={setNavStep}
                items={[
                  { title: 'Basic Info', icon: <Settings size={14} /> },
                  { title: 'VLANs', icon: <Router size={14} /> },
                  { title: 'Security', icon: <Shield size={14} /> },
                ]}
              />

              <div className="text-xs font-medium text-[var(--omada-text-secondary)]">
                Dot Steps
              </div>
              <SSteps
                type="dot"
                current={1}
                items={[
                  { title: 'Queued', content: '09:00' },
                  { title: 'Downloading', content: '72%' },
                  { title: 'Rebooting', content: 'Pending' },
                ]}
              />
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Vertical Steps
              </div>
              <SSteps
                orientation="vertical"
                size="small"
                current={1}
                items={[
                  { title: 'Create Organization', content: 'Configured MSP workspace & billing.' },
                  { title: 'Add Gateway & Switches', content: 'Adopted ER8411 + 2 core switches.' },
                  { title: 'Deploy Wireless SSIDs', content: 'Ready to broadcast Corp-5G & Guest.' },
                ]}
              />
            </div>
          </div>
        </div>
      </SCard>

      {/* 5. Anchor TOC */}
      <SCard title="SAnchor (Vertical Right-Rail TOC & Horizontal Strip)">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Horizontal Anchor Strip
            </div>
            <SAnchor
              direction="horizontal"
              activeHref={activeAnchor}
              onClick={(e, link) => {
                e.preventDefault();
                setActiveAnchor(link.href);
              }}
              items={[
                { key: 'h-gen', href: '#nav-sec-general', title: 'General Settings' },
                { key: 'h-wl', href: '#nav-sec-wireless', title: 'Wireless & Radios' },
                { key: 'h-sec', href: '#nav-sec-security', title: 'Firewall Alert', status: 'error' },
                { key: 'h-leg', href: '#nav-sec-legacy', title: 'Legacy SNMP', disabled: true },
              ]}
            />
          </div>

          <SDivider />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
            <div
              ref={anchorContainerRef}
              className="h-56 space-y-4 overflow-y-auto rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4"
            >
              <section id="nav-sec-general" className="space-y-1">
                <h4 className="m-0 text-sm font-semibold text-[var(--omada-text-primary)]">
                  General Settings
                </h4>
                <p id="nav-sec-identity" className="text-xs text-[var(--omada-text-secondary)]">
                  Site Identity: Headquarters Building (Omada Pro Cluster).
                </p>
                <p id="nav-sec-timezone" className="text-xs text-[var(--omada-text-secondary)]">
                  Region & Timezone: America/Los_Angeles (UTC-08:00).
                </p>
              </section>

              <SDivider />

              <section id="nav-sec-wireless">
                <h4 className="m-0 text-sm font-semibold text-[var(--omada-text-primary)]">
                  Wireless & Radios
                </h4>
                <p className="mt-1 text-xs text-[var(--omada-text-secondary)]">
                  Band steering, OFDMA, and 6 GHz MLO enabled across all Wi-Fi 7 EAPs.
                </p>
              </section>

              <SDivider />

              <section id="nav-sec-security">
                <h4 className="m-0 text-sm font-semibold text-[var(--omada-color-error)]">
                  Firewall Alert (Needs Attention)
                </h4>
                <p className="mt-1 text-xs text-[var(--omada-text-secondary)]">
                  IPS signature database update pending verification on WAN1.
                </p>
              </section>
            </div>

            <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] py-3">
              <SAnchor
                title="On This Page"
                items={anchorItems}
                activeHref={activeAnchor}
                getContainer={() => anchorContainerRef.current ?? window}
                onClick={(e, link) => {
                  e.preventDefault();
                  setActiveAnchor(link.href);
                }}
              />
            </div>
          </div>
        </div>
      </SCard>
    </div>
  );
};
