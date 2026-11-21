import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Dropdown, Popover, Tooltip, type MenuProps } from 'antd';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Globe,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { SBrandAsset } from '../assets/SBrandAsset';
import { SIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';
import { OmadaLogo } from '../icons/OmadaLogo';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaLayout, type ThemeMode } from '../theme/tokens';

export type SAppShellEdition = 'standard' | 'pro' | 'msp';
export type SAppShellVariant = 'controller' | 'central' | 'portal' | 'account';

export interface SNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  /** Optional nested submenu items rendered as an indented collapsible Level-2 list. */
  children?: SNavItem[];
  disabled?: boolean;
}

export interface SNavGroup {
  key: string;
  label?: string;
  items: SNavItem[];
}

export interface SSiteOption {
  key: string;
  label: string;
  subtitle?: string;
  /** Optional status/tier tag displayed alongside the site or organization label (e.g. `Cluster`, `MSP`). */
  tag?: string;
}

export interface SAppShellTopNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SAppShellServiceItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SAppShellProps {
  navGroups: SNavGroup[];
  activeKey: string;
  onSelect: (key: string) => void;
  sites?: SSiteOption[];
  activeSite?: string;
  onSiteChange?: (siteKey: string) => void;
  userName?: string;
  userEmail?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  onSignOut?: () => void;
  topBarExtra?: React.ReactNode;
  /** Top Bar branding & tier presentation (`standard`, `pro` using `<SBrandAsset name="omada-pro" />`, or `msp`). */
  edition?: SAppShellEdition;
  /** Shell presentation variant (`controller`, `central`, `portal`, or `account`). */
  shellVariant?: SAppShellVariant;
  /** Context title shown next to the logo when `shellVariant="account"`. */
  accountTitle?: React.ReactNode;
  /** Horizontal top-bar navigation tabs used when `shellVariant="portal"`. */
  topNavItems?: SAppShellTopNavItem[];
  activeTopNavKey?: string;
  onTopNavSelect?: (key: string) => void;
  /** Service switcher tabs used when `shellVariant="central"`. */
  serviceTabs?: SAppShellServiceItem[];
  activeServiceKey?: string;
  onServiceChange?: (key: string) => void;
  /** Optional organization tags displayed in the Top Bar (e.g. `['Cluster', 'MSP']`). */
  orgTags?: string[];
  /** Controlled sidebar collapsed state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Whether to display the left sidebar (defaults to `true`). */
  showSidebar?: boolean;
  /** Bounded container mode (`h-[520px]`) for embedded previews and showcase demos. */
  embedded?: boolean;
  className?: string;
  children: React.ReactNode;
}

const DEFAULT_SITES: SSiteOption[] = [
  { key: 'hq', label: 'Headquarters Building', subtitle: '48 Devices · 412 Clients' },
  { key: 'west', label: 'Branch Office - West', subtitle: '19 Devices · 128 Clients' },
  { key: 'global', label: 'Global View', subtitle: 'All Sites (2)' },
];

const DEFAULT_PORTAL_NAV: SAppShellTopNavItem[] = [
  { key: 'cloud', label: 'Cloud-Based System' },
  { key: 'on-prem', label: 'On-premises Systems' },
  { key: 'account', label: 'Account Manager' },
  { key: 'sd-wan', label: 'SD WAN' },
];

const DEFAULT_CENTRAL_SERVICES: SAppShellServiceItem[] = [
  { key: 'omada', label: 'Omada', icon: <SIcon name="sidebar-icon-icon-site-off" size={16} /> },
  { key: 'central', label: 'Central', icon: <SIcon name="sidebar-icon-icon-cloud-off" size={16} /> },
  { key: 'guard', label: 'Guard', icon: <SIcon name="sidebar-icon-icon-camera-off" size={16} /> },
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

function hasActiveDescendant(item: SNavItem, activeKey: string): boolean {
  if (!item.children?.length) return false;
  return item.children.some(
    (child) => child.key === activeKey || hasActiveDescendant(child, activeKey),
  );
}

function collectAncestorKeys(groups: SNavGroup[], activeKey: string): string[] {
  const keys: string[] = [];
  const visit = (item: SNavItem) => {
    if (item.children?.length && hasActiveDescendant(item, activeKey)) {
      keys.push(item.key);
      item.children.forEach(visit);
    }
  };
  groups.forEach((group) => group.items.forEach(visit));
  return keys;
}

function renderNavBadge(badge: string | number) {
  const isBeta = typeof badge === 'string' && badge.toUpperCase() === 'BETA';
  if (isBeta) {
    return (
      <span className="rounded-[3px] bg-[var(--omada-color-warning-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-[var(--omada-color-warning)]">
        {badge}
      </span>
    );
  }
  return (
    <span className="rounded bg-[var(--omada-brand-bg-subtle)] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[var(--omada-brand-text)]">
      {badge}
    </span>
  );
}

function renderBrandLogo(edition: SAppShellEdition) {
  if (edition === 'pro') {
    return (
      <span className="inline-flex items-center" data-edition="pro">
        <SBrandAsset
          name="omada-pro"
          height={34}
          alt="Omada Pro"
          className="brightness-0 invert"
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-white" data-edition={edition}>
      <OmadaLogo height={30} />
      {edition === 'msp' && (
        <span className="inline-flex h-4 items-center rounded-[3px] border border-white/30 bg-white/15 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          MSP
        </span>
      )}
    </span>
  );
}

interface SidebarNavItemProps {
  item: SNavItem;
  depth?: number;
  collapsed: boolean;
  activeKey: string;
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
  onSelect: (key: string) => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  depth = 0,
  collapsed,
  activeKey,
  expandedKeys,
  onToggleExpand,
  onSelect,
}) => {
  const hasChildren = Boolean(item.children?.length);
  const isExpanded = expandedKeys.has(item.key);
  const isSelfActive = item.key === activeKey;
  const isAncestorActive = hasActiveDescendant(item, activeKey);

  // Figma Sidebar (`3:64439`): Level-1 pad=[8,12,8,16], Level-2 pad=[8,12,8,36], h=36px, gap=8px
  const paddingClass = collapsed
    ? 'justify-center px-0'
    : depth === 0
      ? 'pl-4 pr-3'
      : depth === 1
        ? 'pl-9 pr-3'
        : 'pl-12 pr-3';

  const stateClass = isSelfActive
    ? 'bg-[var(--omada-bg-sidebar-active)] font-semibold text-[var(--omada-brand-text)] shadow-2xs'
    : isAncestorActive
      ? 'font-semibold text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field-hover)]'
      : 'font-medium text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]';

  const handleClick = () => {
    if (item.disabled) return;
    if (hasChildren) {
      onToggleExpand(item.key);
      return;
    }
    onSelect(item.key);
  };

  const button = (
    <button
      type="button"
      disabled={item.disabled}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-current={isSelfActive ? 'page' : undefined}
      onClick={handleClick}
      className={`flex min-h-[36px] w-full cursor-pointer items-center gap-2 rounded py-2 text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${paddingClass} ${stateClass}`}
    >
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && renderNavBadge(item.badge)}
          {hasChildren && (
            <span className="shrink-0 text-[var(--omada-text-tertiary)]">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    if (hasChildren && item.children) {
      return (
        <Popover
          placement="rightTop"
          trigger={['hover', 'click']}
          classNames={{ root: 'omada-sidebar-popover' }}
          styles={{ container: { padding: 12, borderRadius: 10, width: 224 } }}
          content={
            <div className="flex flex-col gap-1">
              <div className="px-2 pb-1 text-xs font-semibold text-[var(--omada-text-tertiary)]">
                {item.label}
              </div>
              {item.children.map((child) => {
                const childActive = child.key === activeKey;
                return (
                  <button
                    key={child.key}
                    type="button"
                    disabled={child.disabled}
                    onClick={() => !child.disabled && onSelect(child.key)}
                    className={`flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 text-left text-[13px] transition-colors ${
                      childActive
                        ? 'bg-[var(--omada-brand-bg-subtlest)] font-semibold text-[var(--omada-brand-text)]'
                        : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field-hover)]'
                    }`}
                  >
                    <span className="truncate">{child.label}</span>
                    {child.badge !== undefined && renderNavBadge(child.badge)}
                  </button>
                );
              })}
            </div>
          }
        >
          {button}
        </Popover>
      );
    }

    return (
      <Tooltip title={item.label} placement="right">
        {button}
      </Tooltip>
    );
  }

  return (
    <div>
      {button}
      {hasChildren && isExpanded && item.children && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {item.children.map((child) => (
            <SidebarNavItem
              key={child.key}
              item={child}
              depth={depth + 1}
              collapsed={collapsed}
              activeKey={activeKey}
              expandedKeys={expandedKeys}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Omada Controller v6.3 layout shell:
 * - `56px` gradient Top Bar supporting `standard` / `pro` (`<SBrandAsset name="omada-pro" />`) / `msp` editions
 *   and `controller` / `central` / `portal` / `account` shell variants
 * - `216px` / `52px` collapsible left Sidebar with nested collapsible `children` submenus
 * - Light / Dark / System theme switcher & scrollable content viewport
 */
export const SAppShell: React.FC<SAppShellProps> = ({
  navGroups,
  activeKey,
  onSelect,
  sites = DEFAULT_SITES,
  activeSite = DEFAULT_SITES[0].key,
  onSiteChange,
  userName = 'Phoenix',
  userEmail,
  notificationCount = 3,
  onNotificationClick,
  onSearchClick,
  onSignOut,
  topBarExtra,
  edition = 'standard',
  shellVariant = 'controller',
  accountTitle = 'Account',
  topNavItems = DEFAULT_PORTAL_NAV,
  activeTopNavKey,
  onTopNavSelect,
  serviceTabs = DEFAULT_CENTRAL_SERVICES,
  activeServiceKey,
  onServiceChange,
  orgTags,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  showSidebar = true,
  embedded = false,
  className = '',
  children,
}) => {
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? innerCollapsed;

  const [innerTopNavKey, setInnerTopNavKey] = useState(topNavItems[0]?.key ?? '');
  const currentTopNavKey = activeTopNavKey ?? innerTopNavKey;

  const [innerServiceKey, setInnerServiceKey] = useState(serviceTabs[0]?.key ?? '');
  const currentServiceKey = activeServiceKey ?? innerServiceKey;

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(collectAncestorKeys(navGroups, activeKey)),
  );

  useEffect(() => {
    const ancestors = collectAncestorKeys(navGroups, activeKey);
    if (ancestors.length === 0) return;
    setExpandedKeys((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const k of ancestors) {
        if (!next.has(k)) {
          next.add(k);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [activeKey, navGroups]);

  const { themeMode, resolvedTheme, setThemeMode } = useOmadaTheme();

  const currentSite = sites.find((s) => s.key === activeSite) ?? sites[0];

  const siteMenuItems: MenuProps['items'] = useMemo(
    () =>
      sites.map((site) => ({
        key: site.key,
        label: (
          <div className="flex flex-col py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[var(--omada-text-primary)]">{site.label}</span>
              {site.tag && (
                <span className="rounded-[3px] bg-[var(--omada-brand-bg-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--omada-brand-text)]">
                  {site.tag}
                </span>
              )}
            </div>
            {site.subtitle && (
              <span className="text-xs text-[var(--omada-text-secondary)]">{site.subtitle}</span>
            )}
          </div>
        ),
        onClick: () => onSiteChange?.(site.key),
      })),
    [sites, onSiteChange],
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

  const handleToggleCollapse = () => {
    const next = !collapsed;
    if (controlledCollapsed === undefined) {
      setInnerCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const handleToggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const sidebarWidth = collapsed
    ? omadaLayout.sidebarCollapsedWidth
    : omadaLayout.sidebarWidth;

  const siteSwitcher = currentSite ? (
    <Dropdown
      menu={{ items: siteMenuItems, selectedKeys: [currentSite.key] }}
      trigger={['click']}
    >
      <button
        type="button"
        className={`flex cursor-pointer items-center gap-2 rounded bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/20 ${
          shellVariant === 'central' ? 'h-8 min-w-[180px] max-w-[280px]' : 'h-9'
        }`}
      >
        {shellVariant === 'central' && <Globe size={15} className="shrink-0 opacity-85" />}
        <span className="max-w-[200px] flex-1 truncate text-left">{currentSite.label}</span>
        {currentSite.tag && (
          <span className="rounded-[3px] bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-white">
            {currentSite.tag}
          </span>
        )}
        <ChevronDown size={14} className="shrink-0 opacity-80" />
      </button>
    </Dropdown>
  ) : null;

  return (
    <div
      data-shell-variant={shellVariant}
      data-edition={edition}
      className={`flex ${
        embedded
          ? 'h-[540px] rounded-lg border border-[var(--omada-border-divider)]'
          : 'h-screen'
      } w-full flex-col overflow-hidden bg-[var(--omada-bg-page)] ${className}`.trim()}
    >
      {/* 56px Omada Top Bar */}
      <header
        className="flex shrink-0 items-center justify-between gap-3 pl-5 pr-4 text-[var(--omada-topbar-text)]"
        style={{
          height: omadaLayout.topBarHeight,
          background: 'var(--omada-topbar-bg)',
          zIndex: 100,
        }}
      >
        {shellVariant === 'controller' && (
          <div className="flex min-w-0 items-center gap-3">
            {renderBrandLogo(edition)}
            <span className="h-5 w-px bg-white/25" />
            {siteSwitcher}
          </div>
        )}

        {shellVariant === 'central' && (
          <>
            <div className="flex min-w-0 items-center gap-3 self-stretch">
              <div className="flex items-center gap-2">{siteSwitcher}</div>
              <div className="flex items-end gap-1 self-stretch">
                {serviceTabs.map((svc) => {
                  const active = svc.key === currentServiceKey;
                  return (
                    <button
                      key={svc.key}
                      type="button"
                      onClick={() => {
                        if (activeServiceKey === undefined) setInnerServiceKey(svc.key);
                        onServiceChange?.(svc.key);
                      }}
                      className={`flex cursor-pointer items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                        active
                          ? 'omada-topbar-tab-active h-[44px] font-semibold'
                          : 'mb-2 h-9 rounded-[6px] text-white/85 hover:bg-white/12 hover:text-white'
                      }`}
                    >
                      {svc.icon}
                      <span>{svc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="hidden items-center md:flex">{renderBrandLogo(edition)}</div>
          </>
        )}

        {shellVariant === 'portal' && (
          <div className="flex min-w-0 items-center gap-5 self-stretch">
            <div className="flex items-center">{renderBrandLogo(edition)}</div>
            <nav aria-label="Top navigation" className="flex items-end gap-1.5 self-stretch">
              {topNavItems.map((tab) => {
                const active = tab.key === currentTopNavKey;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    disabled={tab.disabled}
                    onClick={() => {
                      if (tab.disabled) return;
                      if (activeTopNavKey === undefined) setInnerTopNavKey(tab.key);
                      onTopNavSelect?.(tab.key);
                    }}
                    className={`flex cursor-pointer items-center gap-1.5 px-3.5 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                      active
                        ? 'omada-topbar-tab-active h-[44px] font-semibold'
                        : 'mb-2 h-9 rounded-[6px] font-medium text-white/90 hover:bg-white/12 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {shellVariant === 'account' && (
          <div className="flex min-w-0 items-center gap-3">
            {renderBrandLogo(edition)}
            <span className="h-5 w-px bg-white/25" />
            <span className="text-sm font-medium text-white/95">{accountTitle}</span>
          </div>
        )}

        {/* Right Utility Controls */}
        <div className="flex shrink-0 items-center gap-2">
          {orgTags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-4 items-center rounded-[3px] border border-white/25 bg-white/15 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-white"
            >
              {tag}
            </span>
          ))}
          {topBarExtra}
          {onSearchClick && (
            <Tooltip title="Quick Search">
              <button
                type="button"
                aria-label="Search"
                onClick={onSearchClick}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-white/90 transition-colors hover:bg-white/15"
              >
                <SIcon name="search" size={20} />
              </button>
            </Tooltip>
          )}
          {shellVariant !== 'account' && (
            <Tooltip title="Notifications">
              <button
                type="button"
                aria-label="Notifications"
                onClick={onNotificationClick}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-white/90 transition-colors hover:bg-white/15"
              >
                <Badge count={notificationCount} size="small" offset={[2, -2]}>
                  <Bell size={17} className="text-white" />
                </Badge>
              </button>
            </Tooltip>
          )}

          {/* Light / Dark / System Switcher */}
          <Dropdown
            menu={{ items: themeMenuItems, selectedKeys: [themeMode] }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              aria-label="Theme mode"
              data-testid="theme-switcher"
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded bg-white/10 px-2.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              <SIcon
                name={
                  themeMode === 'system'
                    ? 'follow-system'
                    : resolvedTheme === 'dark'
                      ? 'dark'
                      : 'light'
                }
                size={18}
              />
              <span>{THEME_LABELS[themeMode]}</span>
              <ChevronDown size={12} className="opacity-75" />
            </button>
          </Dropdown>

          <div className="ml-1 flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs font-semibold text-white">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs font-medium text-white">{userName}</span>
          </div>
        </div>
      </header>

      {/* Main Body: Collapsible Left Sidebar + Content Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {showSidebar && (
          <aside
            data-testid="omada-sidebar"
            className="flex shrink-0 flex-col border-r border-[var(--omada-border-divider)] bg-[var(--omada-bg-sidebar)] transition-[width] duration-200"
            style={{ width: sidebarWidth }}
          >
            {shellVariant === 'account' && !collapsed && (
              <div className="border-b border-[var(--omada-border-divider)] px-4 py-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--omada-brand-bg-subtle)] text-base font-semibold text-[var(--omada-brand-text)]">
                  {userName.slice(0, 1).toUpperCase()}
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-[var(--omada-text-primary)]">
                  {userName}
                </div>
                {userEmail && (
                  <div className="mt-0.5 truncate text-xs text-[var(--omada-text-tertiary)]">
                    {userEmail}
                  </div>
                )}
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {navGroups.map((group, idx) => (
                <div key={group.key} className={idx > 0 ? 'mt-5' : ''}>
                  {group.label && !collapsed && (
                    <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--omada-text-tertiary)]">
                      {group.label}
                    </div>
                  )}
                  {group.label && collapsed && idx > 0 && (
                    <div className="mx-2 my-2 h-px bg-[var(--omada-border-divider)]" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <SidebarNavItem
                        key={item.key}
                        item={item}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        expandedKeys={expandedKeys}
                        onToggleExpand={handleToggleExpand}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Sign Out (Account Variant) + Collapse / Expand Footer */}
            <div className="flex flex-col gap-1 border-t border-[var(--omada-border-divider)] p-2">
              {shellVariant === 'account' && onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded bg-[var(--omada-bg-field)] text-xs font-medium text-[var(--omada-text-primary)] transition-colors hover:bg-[var(--omada-bg-field-hover)]"
                >
                  <LogOut size={14} />
                  {!collapsed && <span>Sign Out</span>}
                </button>
              )}
              <button
                type="button"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                data-testid="sidebar-collapse-btn"
                onClick={handleToggleCollapse}
                className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded text-xs font-medium text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]"
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                {!collapsed && <span>Collapse</span>}
              </button>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </main>
      </div>
    </div>
  );
};
