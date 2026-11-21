import React, { useMemo, useState } from 'react';
import { Dropdown, Tooltip, type MenuProps } from 'antd';
import { ChevronRight } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';
import { OmadaLogo } from '../icons/OmadaLogo';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaLayout, type ThemeMode } from '../theme/tokens';
import type { SNavGroup, SNavItem, SSiteOption } from './SAppShell';

export interface SEmulatorNavItem extends SNavItem {
  /** Default sidebar icon slug from `iconsManifest.ts`. */
  iconName?: OmadaIconName;
  /** Active sidebar icon slug from `iconsManifest.ts`. */
  activeIconName?: OmadaIconName;
  /** Whether the item renders a trailing `>` submenu indicator. */
  hasSubmenu?: boolean;
}

export interface SEmulatorNavGroup extends Omit<SNavGroup, 'items'> {
  items: SEmulatorNavItem[];
}

/**
 * Exact Omada Controller v6.3.0.34 sidebar hierarchy:
 * 5 Title-Case sections and 13 navigation items.
 */
export const EMULATOR_NAV_GROUPS: SEmulatorNavGroup[] = [
  {
    key: 'management',
    label: 'Management',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        iconName: 'sidebar-icon-icon-dashboard-off',
        activeIconName: 'sidebar-icon-icon-dashboard-on',
      },
      {
        key: 'devices',
        label: 'Devices',
        iconName: 'sidebar-icon-icon-device-off',
        activeIconName: 'sidebar-icon-icon-device-on',
      },
      {
        key: 'clients',
        label: 'Clients',
        iconName: 'sidebar-icon-icon-client-off',
        activeIconName: 'sidebar-icon-icon-client-on',
      },
    ],
  },
  {
    key: 'monitoring',
    label: 'Monitoring',
    items: [
      {
        key: 'map',
        label: 'Map',
        iconName: 'sidebar-icon-icon-map-off',
        activeIconName: 'sidebar-icon-icon-map-on',
      },
      {
        key: 'insights',
        label: 'Insights',
        iconName: 'sidebar-icon-icon-insight-off',
        activeIconName: 'sidebar-icon-icon-insight-on',
        hasSubmenu: true,
      },
      {
        key: 'logs',
        label: 'Logs',
        iconName: 'sidebar-icon-icon-log-off',
        activeIconName: 'sidebar-icon-icon-log-on',
      },
    ],
  },
  {
    key: 'intelligent-om',
    label: 'Intelligent O&M',
    items: [
      {
        key: 'incidents',
        label: 'Incidents',
        iconName: 'sidebar-icon-icon-alert-off',
        activeIconName: 'sidebar-icon-icon-alert-on',
        badge: 'BETA',
      },
      {
        key: 'intelli-recover',
        label: 'IntelliRecover',
        iconName: 'sidebar-icon-icon-iintelli-recover-off',
        activeIconName: 'sidebar-icon-icon-iintelli-recover-on',
        badge: 'BETA',
      },
    ],
  },
  {
    key: 'configuration',
    label: 'Configuration',
    items: [
      {
        key: 'network-config',
        label: 'Network Config',
        iconName: 'sidebar-icon-icon-network-config-off',
        activeIconName: 'sidebar-icon-icon-network-config-on',
        hasSubmenu: true,
      },
      {
        key: 'device-config',
        label: 'Device Config',
        iconName: 'sidebar-icon-icon-device-config-off',
        activeIconName: 'sidebar-icon-icon-device-config-on',
        hasSubmenu: true,
      },
      {
        key: 'hotspot',
        label: 'Hotspot',
        iconName: 'sidebar-icon-icon-hotspot-off',
        activeIconName: 'sidebar-icon-icon-hotspot-on',
      },
    ],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    items: [
      {
        key: 'network-tools',
        label: 'Network Tools',
        iconName: 'sidebar-icon-icon-tools-off',
        activeIconName: 'sidebar-icon-icon-tools-on',
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        iconName: 'sidebar-icon-icon-maintenance-off',
        activeIconName: 'sidebar-icon-icon-maintenance-on',
      },
    ],
  },
];

const DEFAULT_EMULATOR_SITES: SSiteOption[] = [
  { key: 'main-office-floor', label: 'Main Office Floor', subtitle: '9 Devices · 4 Clients' },
  { key: 'branch-west', label: 'Branch Office - West', subtitle: '6 Devices · 28 Clients' },
  { key: 'datacenter-core', label: 'Data Center Core', subtitle: '4 Devices · 12 Clients' },
];

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const THEME_MENU_ICONS: Record<ThemeMode, OmadaIconName> = {
  light: 'topbar-property-1-light',
  dark: 'topbar-property-1-dark',
  system: 'topbar-property-1-follow-system',
};

export interface SEmulatorShellProps {
  /** Active navigation item key (e.g. `'dashboard'`, `'devices'`). */
  activeKey: string;
  /** Invoked when a sidebar navigation item is selected. */
  onSelect: (key: string) => void;
  /** Optional navigation groups override; defaults to `EMULATOR_NAV_GROUPS`. */
  navGroups?: SEmulatorNavGroup[];
  /** Controller / organization name displayed on the left of the Top Bar. */
  controllerName?: string;
  /** Available site options shown in the sidebar site pill dropdown. */
  sites?: SSiteOption[];
  /** Controlled active site key or label. */
  activeSite?: string;
  /** Invoked when a site is picked from the site pill dropdown. */
  onSiteChange?: (siteKey: string) => void;
  /** Accessible user display name for the top-right avatar badge. */
  userName?: string;
  /** Invoked when the top-right Search icon button is clicked. */
  onSearchClick?: () => void;
  /** Invoked when the top-right Refresh icon button is clicked. */
  onRefresh?: () => void;
  /** Invoked when `Component Library` is chosen from the `More` menu. */
  onOpenShowcase?: () => void;
  /** Invoked when an item in the `More` dropdown menu is clicked. */
  onMoreSelect?: (key: string) => void;
  /** Invoked when the right-edge `<||` floating quick-drawer handle is clicked. */
  onToggleQuickDrawer?: () => void;
  /** Whether to show the right-edge floating quick-drawer handle (default `true`). */
  showQuickDrawerHandle?: boolean;
  /** Controlled sidebar collapsed state. */
  collapsed?: boolean;
  /** Initial uncontrolled sidebar collapsed state. */
  defaultCollapsed?: boolean;
  /** Invoked when the sidebar collapse button toggles state. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Bounded container mode for embedded showcase previews. */
  embedded?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Omada Controller v6.3.0.34 authentic emulator layout shell:
 * - Scoped `.omada-emulator-root` Light/Dark surface & color palette
 * - `56px` Top Bar with left controller context, centered Omada wordmark, and right utility controls
 * - `216px` / `52px` borderless collapsible sidebar with site pill selector and 5 Title-Case sections
 * - Right-edge floating `<||` quick-drawer handle
 */
export const SEmulatorShell: React.FC<SEmulatorShellProps> = ({
  activeKey,
  onSelect,
  navGroups = EMULATOR_NAV_GROUPS,
  controllerName = 'Headquarters Building',
  sites = DEFAULT_EMULATOR_SITES,
  activeSite,
  onSiteChange,
  userName = 'Phoenix',
  onSearchClick,
  onRefresh,
  onOpenShowcase,
  onMoreSelect,
  onToggleQuickDrawer,
  showQuickDrawerHandle = true,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  embedded = false,
  className = '',
  children,
}) => {
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? innerCollapsed;

  const [innerSiteKey, setInnerSiteKey] = useState(sites[0]?.key ?? 'main-office-floor');
  const resolvedSiteKey = activeSite ?? innerSiteKey;
  const currentSite =
    sites.find((s) => s.key === resolvedSiteKey || s.label === resolvedSiteKey) ?? sites[0];

  const { themeMode, resolvedTheme, setThemeMode } = useOmadaTheme();

  const handleToggleCollapse = () => {
    const next = !collapsed;
    if (controlledCollapsed === undefined) {
      setInnerCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const siteMenuItems: MenuProps['items'] = useMemo(
    () =>
      sites.map((site) => ({
        key: site.key,
        label: (
          <div className="flex flex-col py-0.5">
            <span className="font-medium text-[var(--omada-text-primary)]">{site.label}</span>
            {site.subtitle && (
              <span className="text-xs text-[var(--omada-text-secondary)]">{site.subtitle}</span>
            )}
          </div>
        ),
        onClick: () => {
          if (activeSite === undefined) {
            setInnerSiteKey(site.key);
          }
          onSiteChange?.(site.key);
        },
      })),
    [sites, activeSite, onSiteChange],
  );

  const themeMenuItems: MenuProps['items'] = useMemo(
    () =>
      (['light', 'dark', 'system'] as ThemeMode[]).map((mode) => ({
        key: mode,
        icon: <SIcon name={THEME_MENU_ICONS[mode]} size={16} />,
        label: (
          <span className={themeMode === mode ? 'font-semibold text-[var(--omada-brand-text)]' : ''}>
            {THEME_LABELS[mode]}
          </span>
        ),
        onClick: () => setThemeMode(mode),
      })),
    [themeMode, setThemeMode],
  );

  const moreMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'feedback',
        icon: <SIcon name="more-icon-icon-feedback" size={16} />,
        label: 'Feedback',
        onClick: () => onMoreSelect?.('feedback'),
      },
      {
        key: 'about',
        icon: <SIcon name="more-icon-icon-about" size={16} />,
        label: 'About',
        onClick: () => onMoreSelect?.('about'),
      },
      {
        key: 'tutorial',
        icon: <SIcon name="more-icon-icon-tutorial" size={16} />,
        label: 'Tutorial',
        onClick: () => onMoreSelect?.('tutorial'),
      },
      { type: 'divider' },
      {
        key: 'component-library',
        icon: <SIcon name="icon-icon-tabler-icon-layout-collage" size={16} />,
        label: 'Component Library',
        onClick: () => {
          onMoreSelect?.('component-library');
          onOpenShowcase?.();
        },
      },
    ],
    [onMoreSelect, onOpenShowcase],
  );

  const sidebarWidth = collapsed
    ? omadaLayout.sidebarCollapsedWidth
    : omadaLayout.sidebarWidth;

  return (
    <div
      data-theme={resolvedTheme}
      className={`omada-emulator-root relative flex ${
        embedded
          ? 'h-[640px] rounded-lg border border-[var(--omada-emu-card-border)]'
          : 'h-screen'
      } w-full flex-col overflow-hidden ${className}`.trim()}
    >
      {/* 56px Omada Controller Top Bar */}
      <header
        className="omada-emu-topbar relative flex shrink-0 items-center justify-between"
        style={{ height: omadaLayout.topBarHeight, zIndex: 100 }}
      >
        <div className="flex min-w-0 items-center gap-2 pl-5 text-[14px] text-white">
          <SIcon name="icon-icon-tabler-icon-world" size={16} className="shrink-0 opacity-85" />
          <span className="truncate">{controllerName}</span>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <OmadaLogo height={28} className="h-[28px] w-[76px] text-white/75" />
        </div>

        <div className="flex shrink-0 items-center gap-2 pr-[18px]">
          <button
            type="button"
            aria-label="Search"
            data-testid="emu-search-btn"
            onClick={onSearchClick}
            className="omada-emu-topbar-icon-btn"
          >
            <SIcon name="search" size={32} />
          </button>

          <button
            type="button"
            aria-label="Refresh"
            data-testid="emu-refresh-btn"
            onClick={onRefresh}
            className="omada-emu-topbar-icon-btn"
          >
            <SIcon name="refresh-2" size={32} />
          </button>

          <Dropdown
            menu={{ items: themeMenuItems, selectedKeys: [themeMode] }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: 'omada-emu-dropdown' }}
          >
            <button
              type="button"
              aria-label="Theme mode"
              data-testid="theme-switcher"
              className="omada-emu-topbar-icon-btn"
            >
              <SIcon name={resolvedTheme === 'dark' ? 'dark' : 'light'} size={32} />
            </button>
          </Dropdown>

          <button
            type="button"
            aria-label={userName}
            data-testid="emu-avatar-btn"
            className="omada-emu-avatar-btn"
          >
            <SIcon name="account" size={34} />
          </button>

          <Dropdown
            menu={{ items: moreMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: 'omada-emu-dropdown' }}
          >
            <button
              type="button"
              aria-label="More options"
              data-testid="emu-more-btn"
              className="omada-emu-topbar-icon-btn"
            >
              <SIcon name="more" size={32} />
            </button>
          </Dropdown>
        </div>
      </header>

      {/* Main Body: Borderless Left Sidebar + Main Viewport */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          data-testid="omada-emulator-sidebar"
          className="omada-emu-sidebar flex shrink-0 flex-col transition-[width] duration-200"
          style={{ width: sidebarWidth }}
        >
          {/* Top Collapse Row */}
          <div
            className={`flex h-[52px] shrink-0 items-center ${
              collapsed ? 'justify-center pl-0' : 'pl-4'
            }`}
          >
            <button
              type="button"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              data-testid="sidebar-collapse-btn"
              onClick={handleToggleCollapse}
              className="omada-emu-collapse-btn"
            >
              <SIcon name="icon-1198-4460" size={20} />
            </button>
          </div>

          {/* Site Selector Pill */}
          <div className={collapsed ? 'flex justify-center px-2 pb-2' : 'px-2 pb-2'}>
            <Dropdown
              menu={{
                items: siteMenuItems,
                selectedKeys: currentSite ? [currentSite.key] : [],
              }}
              trigger={['click']}
              placement="bottomLeft"
              classNames={{ root: 'omada-emu-dropdown' }}
            >
              <button
                type="button"
                aria-label={currentSite ? `Site: ${currentSite.label}` : 'Select site'}
                data-testid="emu-site-selector"
                className={`omada-emu-site-pill flex h-[40px] cursor-pointer items-center ${
                  collapsed ? 'w-[36px] justify-center px-0' : 'w-full gap-2 px-3'
                }`}
              >
                <SIcon
                  name="sidebar-icon-icon-site-off"
                  size={18}
                  className="shrink-0 opacity-75"
                />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-left text-[14px]">
                      {currentSite?.label ?? 'Main Office Floor'}
                    </span>
                    <SIcon
                      name="icon-icon-tabler-icon-chevron-down"
                      size={14}
                      className="shrink-0 opacity-65"
                    />
                  </>
                )}
              </button>
            </Dropdown>
          </div>

          {/* 5 Title-Case Sections + 13 Flush Nav Items */}
          <nav
            aria-label="Emulator navigation"
            className="flex-1 overflow-y-auto overflow-x-hidden pb-3"
          >
            {navGroups.map((group, idx) => (
              <div key={group.key}>
                {group.label && !collapsed && (
                  <div
                    className={`omada-emu-section-label px-4 pb-2 ${
                      idx === 0 ? 'pt-5' : 'pt-4'
                    }`}
                  >
                    {group.label}
                  </div>
                )}
                {group.label && collapsed && idx > 0 && (
                  <div className="mx-3 my-1.5 h-px bg-[var(--omada-border-divider)]" />
                )}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = item.key === activeKey;
                    const iconNode =
                      item.icon ??
                      (item.iconName ? (
                        <SIcon
                          name={
                            isActive && item.activeIconName
                              ? item.activeIconName
                              : item.iconName
                          }
                          size={20}
                        />
                      ) : null);

                    const btn = (
                      <button
                        key={item.key}
                        type="button"
                        disabled={item.disabled}
                        aria-current={isActive ? 'page' : undefined}
                        data-nav-key={item.key}
                        onClick={() => !item.disabled && onSelect(item.key)}
                        className={`omada-emu-nav-item flex h-[36px] w-full cursor-pointer items-center text-[14px] disabled:cursor-not-allowed disabled:opacity-45 ${
                          collapsed ? 'justify-center px-0' : 'gap-2.5 px-4 text-left'
                        } ${isActive ? 'is-active' : ''}`.trim()}
                      >
                        {iconNode && <span className="shrink-0">{iconNode}</span>}
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span className="omada-emu-beta-tag shrink-0">
                                {item.badge}
                              </span>
                            )}
                            {(item.hasSubmenu || Boolean(item.children?.length)) && (
                              <ChevronRight
                                size={14}
                                className="ml-auto shrink-0 opacity-55"
                              />
                            )}
                          </>
                        )}
                      </button>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.key} title={item.label} placement="right">
                          {btn}
                        </Tooltip>
                      );
                    }
                    return btn;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="omada-emu-main min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Right-Edge Floating Quick-Drawer Handle */}
      {showQuickDrawerHandle && (
        <button
          type="button"
          aria-label="Toggle quick drawer"
          data-testid="quick-drawer-handle"
          onClick={onToggleQuickDrawer}
          className={`omada-emu-quick-handle ${
            embedded ? 'absolute' : 'fixed'
          } right-0 top-[134px] z-30 flex h-[40px] w-[36px] cursor-pointer items-center justify-center`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M7.5 3.5L3 8L7.5 12.5M10.5 3.5V12.5M13.5 3.5V12.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
