import React, { useState } from 'react';
import { Badge, Dropdown, Tooltip, type MenuProps } from 'antd';
import {
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import type { OmadaIconName } from '../assets/iconsManifest';
import { OmadaLogo } from '../icons/OmadaLogo';
import { useOmadaTheme } from '../theme/OmadaProvider';
import { omadaLayout, type ThemeMode } from '../theme/tokens';

export interface SNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
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
}

export interface SAppShellProps {
  navGroups: SNavGroup[];
  activeKey: string;
  onSelect: (key: string) => void;
  sites?: SSiteOption[];
  activeSite?: string;
  onSiteChange?: (siteKey: string) => void;
  userName?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  topBarExtra?: React.ReactNode;
  children: React.ReactNode;
}

const DEFAULT_SITES: SSiteOption[] = [
  { key: 'hq', label: 'Headquarters Building', subtitle: '48 Devices · 412 Clients' },
  { key: 'west', label: 'Branch Office - West', subtitle: '19 Devices · 128 Clients' },
  { key: 'global', label: 'Global View', subtitle: 'All Sites (2)' },
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

/**
 * Omada Controller v6.3 layout shell:
 * - 56px gradient Top Bar with Omada SVG wordmark, Site switcher, and Light/Dark/System toggle
 * - 216px / 52px collapsible left Sidebar
 * - Scrollable content viewport
 */
export const SAppShell: React.FC<SAppShellProps> = ({
  navGroups,
  activeKey,
  onSelect,
  sites = DEFAULT_SITES,
  activeSite = DEFAULT_SITES[0].key,
  onSiteChange,
  userName = 'Phoenix',
  notificationCount = 3,
  onNotificationClick,
  onSearchClick,
  topBarExtra,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { themeMode, resolvedTheme, setThemeMode } = useOmadaTheme();

  const currentSite = sites.find((s) => s.key === activeSite) ?? sites[0];

  const siteMenuItems: MenuProps['items'] = sites.map((site) => ({
    key: site.key,
    label: (
      <div className="flex flex-col py-0.5">
        <span className="font-medium text-[var(--omada-text-primary)]">{site.label}</span>
        {site.subtitle && (
          <span className="text-xs text-[var(--omada-text-secondary)]">{site.subtitle}</span>
        )}
      </div>
    ),
    onClick: () => onSiteChange?.(site.key),
  }));

  const themeMenuItems: MenuProps['items'] = (['light', 'dark', 'system'] as ThemeMode[]).map(
    (mode) => ({
      key: mode,
      icon: <SIcon name={THEME_MENU_ICONS[mode]} size={16} />,
      label: (
        <span className={themeMode === mode ? 'font-semibold text-[var(--omada-brand-text)]' : ''}>
          {THEME_LABELS[mode]}
        </span>
      ),
      onClick: () => setThemeMode(mode),
    }),
  );

  const sidebarWidth = collapsed
    ? omadaLayout.sidebarCollapsedWidth
    : omadaLayout.sidebarWidth;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--omada-bg-page)]">
      {/* 56px Omada Top Bar */}
      <header
        className="flex shrink-0 items-center justify-between px-4 text-[var(--omada-topbar-text)]"
        style={{
          height: omadaLayout.topBarHeight,
          background: 'var(--omada-topbar-bg)',
          zIndex: 100,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center text-white">
            <OmadaLogo height={30} />
          </div>
          <span className="h-5 w-px bg-white/25" />
          <Dropdown
            menu={{ items: siteMenuItems, selectedKeys: [currentSite.key] }}
            trigger={['click']}
          >
            <button
              type="button"
              className="flex h-9 cursor-pointer items-center gap-2 rounded bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <span className="max-w-[200px] truncate">{currentSite.label}</span>
              <ChevronDown size={14} className="opacity-80" />
            </button>
          </Dropdown>
        </div>

        <div className="flex items-center gap-2">
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
        <aside
          data-testid="omada-sidebar"
          className="flex shrink-0 flex-col border-r border-[var(--omada-border-divider)] bg-[var(--omada-bg-sidebar)] transition-[width] duration-200"
          style={{ width: sidebarWidth }}
        >
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {navGroups.map((group, idx) => (
              <div key={group.key} className={idx > 0 ? 'mt-4' : ''}>
                {group.label && !collapsed && (
                  <div className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--omada-text-tertiary)]">
                    {group.label}
                  </div>
                )}
                {group.label && collapsed && idx > 0 && (
                  <div className="mx-2 my-2 h-px bg-[var(--omada-border-divider)]" />
                )}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = item.key === activeKey;
                    const button = (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onSelect(item.key)}
                        className={`flex h-9 w-full cursor-pointer items-center gap-2.5 rounded px-2.5 text-left text-[13px] transition-colors ${
                          isActive
                            ? 'bg-[var(--omada-bg-sidebar-active)] font-semibold text-[var(--omada-brand-text)] shadow-2xs'
                            : 'font-medium text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]'
                        } ${collapsed ? 'justify-center px-0' : ''}`}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span className="rounded bg-[var(--omada-brand-bg-subtle)] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[var(--omada-brand-text)]">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );

                    return collapsed ? (
                      <Tooltip key={item.key} title={item.label} placement="right">
                        {button}
                      </Tooltip>
                    ) : (
                      button
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse / Expand Footer */}
          <div className="border-t border-[var(--omada-border-divider)] p-2">
            <button
              type="button"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              data-testid="sidebar-collapse-btn"
              onClick={() => setCollapsed((prev) => !prev)}
              className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded text-xs font-medium text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field-hover)] hover:text-[var(--omada-text-primary)]"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </main>
      </div>
    </div>
  );
};
