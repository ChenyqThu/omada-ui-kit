import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OmadaProvider } from '@/omada';
import {
  EMULATOR_NAV_GROUPS,
  SEmulatorShell,
} from '@/omada/layout/SEmulatorShell';
import '@/styles/modules/emulator-shell.css';

function renderWithTheme(
  ui: React.ReactElement,
  defaultThemeMode: 'light' | 'dark' = 'light',
) {
  window.localStorage.removeItem('omada-theme-mode');
  return render(
    <OmadaProvider defaultThemeMode={defaultThemeMode}>{ui}</OmadaProvider>,
  );
}

describe('SEmulatorShell', () => {
  it('renders Omada Controller v6.3 topbar, 5 Title-Case sections, 13 nav items, and BETA tags', () => {
    const onSelect = vi.fn();
    const { container } = renderWithTheme(
      <SEmulatorShell activeKey="dashboard" onSelect={onSelect}>
        <div>Dashboard Viewport</div>
      </SEmulatorShell>,
    );

    expect(container.querySelector('.omada-emulator-root')).toBeInTheDocument();
    expect(screen.getByText('Headquarters Building')).toBeInTheDocument();
    expect(screen.getByLabelText('Omada by TP-Link')).toBeInTheDocument();
    expect(screen.getByText('Main Office Floor')).toBeInTheDocument();

    // 5 Title-Case sections
    const sectionLabels = Array.from(
      container.querySelectorAll('.omada-emu-section-label'),
    ).map((el) => el.textContent);
    expect(sectionLabels).toEqual([
      'Management',
      'Monitoring',
      'Intelligent O&M',
      'Configuration',
      'Maintenance',
    ]);

    // All 13 items
    const allItems = EMULATOR_NAV_GROUPS.flatMap((g) => g.items);
    expect(allItems).toHaveLength(13);
    for (const item of allItems) {
      expect(screen.getByRole('button', { name: new RegExp(item.label) })).toBeInTheDocument();
    }

    // Two BETA tags on Incidents and IntelliRecover
    expect(screen.getAllByText('BETA')).toHaveLength(2);

    // Active item uses -on icon, inactive uses -off icon
    const dashboardBtn = screen.getByRole('button', { name: 'Dashboard' });
    expect(dashboardBtn).toHaveClass('is-active');
    expect(dashboardBtn).toHaveAttribute('aria-current', 'page');
    expect(
      dashboardBtn.querySelector('[data-omada-icon="sidebar-icon-icon-dashboard-on"]'),
    ).toBeInTheDocument();

    const devicesBtn = screen.getByRole('button', { name: 'Devices' });
    expect(devicesBtn).not.toHaveClass('is-active');
    expect(
      devicesBtn.querySelector('[data-omada-icon="sidebar-icon-icon-device-off"]'),
    ).toBeInTheDocument();

    fireEvent.click(devicesBtn);
    expect(onSelect).toHaveBeenCalledWith('devices');
  });

  it('wires search, refresh, theme switcher (Light/Dark/System), avatar, and More menu', async () => {
    const onSearchClick = vi.fn();
    const onRefresh = vi.fn();
    const onOpenShowcase = vi.fn();
    const onMoreSelect = vi.fn();

    const { container } = renderWithTheme(
      <SEmulatorShell
        activeKey="dashboard"
        onSelect={vi.fn()}
        onSearchClick={onSearchClick}
        onRefresh={onRefresh}
        onOpenShowcase={onOpenShowcase}
        onMoreSelect={onMoreSelect}
      >
        <div>Body</div>
      </SEmulatorShell>,
      'light',
    );

    fireEvent.click(screen.getByTestId('emu-search-btn'));
    expect(onSearchClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('emu-refresh-btn'));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // User avatar badge renders bundled green/white account asset
    expect(
      screen.getByTestId('emu-avatar-btn').querySelector('[data-omada-icon="account"]'),
    ).toBeInTheDocument();

    // Theme switcher shows sun icon in Light and switches to moon icon in Dark
    const themeBtn = screen.getByTestId('theme-switcher');
    expect(themeBtn.querySelector('[data-omada-icon="light"]')).toBeInTheDocument();

    fireEvent.click(themeBtn);
    const darkOption = await screen.findByText('Dark');
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    fireEvent.click(darkOption);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
    expect(container.querySelector('.omada-emulator-root')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    expect(themeBtn.querySelector('[data-omada-icon="dark"]')).toBeInTheDocument();

    // More (3-dots) menu opens Feedback, About, Tutorial, divider, Component Library
    fireEvent.click(screen.getByTestId('emu-more-btn'));
    expect(await screen.findByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Tutorial')).toBeInTheDocument();
    const libraryItem = screen.getByText('Component Library');
    fireEvent.click(libraryItem);

    expect(onMoreSelect).toHaveBeenCalledWith('component-library');
    expect(onOpenShowcase).toHaveBeenCalledTimes(1);
  });

  it('switches site via site pill dropdown, collapses sidebar to 52px, and fires quick-drawer handle', async () => {
    const onSiteChange = vi.fn();
    const onCollapsedChange = vi.fn();
    const onToggleQuickDrawer = vi.fn();

    renderWithTheme(
      <SEmulatorShell
        activeKey="devices"
        onSelect={vi.fn()}
        onSiteChange={onSiteChange}
        onCollapsedChange={onCollapsedChange}
        onToggleQuickDrawer={onToggleQuickDrawer}
      >
        <div>Devices View</div>
      </SEmulatorShell>,
    );

    // Site selector dropdown
    fireEvent.click(screen.getByTestId('emu-site-selector'));
    const branchSite = await screen.findByText('Branch Office - West');
    fireEvent.click(branchSite);

    expect(onSiteChange).toHaveBeenCalledWith('branch-west');
    expect(screen.getByTestId('emu-site-selector')).toHaveTextContent(
      'Branch Office - West',
    );

    // Collapse sidebar 216px -> 52px
    const sidebar = screen.getByTestId('omada-emulator-sidebar');
    expect(sidebar).toHaveStyle({ width: '216px' });

    fireEvent.click(screen.getByTestId('sidebar-collapse-btn'));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(sidebar).toHaveStyle({ width: '52px' });

    // Right-edge floating quick-drawer handle
    const handle = screen.getByTestId('quick-drawer-handle');
    expect(handle).toHaveClass('w-[36px]', 'h-[40px]');
    fireEvent.click(handle);
    expect(onToggleQuickDrawer).toHaveBeenCalledTimes(1);
  });

  it('renders Dark theme overrides and submenu chevrons cleanly', () => {
    const { container } = renderWithTheme(
      <SEmulatorShell activeKey="devices" onSelect={vi.fn()}>
        <div>Dark Viewport</div>
      </SEmulatorShell>,
      'dark',
    );

    const root = container.querySelector('.omada-emulator-root');
    expect(root).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(
      screen.getByTestId('theme-switcher').querySelector('[data-omada-icon="dark"]'),
    ).toBeInTheDocument();

    const devicesBtn = screen.getByRole('button', { name: 'Devices' });
    expect(devicesBtn).toHaveClass('is-active');
    expect(
      devicesBtn.querySelector('[data-omada-icon="sidebar-icon-icon-device-on"]'),
    ).toBeInTheDocument();

    // Submenu items Insights, Network Config, Device Config render trailing chevron SVGs
    for (const key of ['insights', 'network-config', 'device-config']) {
      const btn = container.querySelector(`[data-nav-key="${key}"]`);
      expect(btn).toBeInTheDocument();
      expect(btn?.querySelector('svg.lucide-chevron-right')).toBeInTheDocument();
    }
  });

  it('opens right-aligned grouped popovers for Insights, Network Config, and Device Config and highlights parent Insights for statistics/report', async () => {
    const onSelect = vi.fn();
    const { container, rerender } = renderWithTheme(
      <SEmulatorShell activeKey="statistics" onSelect={onSelect}>
        <div>Statistics View</div>
      </SEmulatorShell>,
    );

    const insightsBtn = container.querySelector('[data-nav-key="insights"]');
    expect(insightsBtn).toHaveClass('is-active');
    expect(
      insightsBtn?.querySelector('[data-omada-icon="sidebar-icon-icon-insight-on"]'),
    ).toBeInTheDocument();

    // Clicking Insights opens its popover with Application Analytics & Reports
    fireEvent.click(insightsBtn!);
    const analyticsItem = await screen.findByText('Application Analytics');
    expect(screen.getByText('Reports')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reports'));
    expect(onSelect).toHaveBeenCalledWith('report');

    rerender(
      <OmadaProvider defaultThemeMode="light">
        <SEmulatorShell activeKey="report" onSelect={onSelect}>
          <div>Reports View</div>
        </SEmulatorShell>
      </OmadaProvider>,
    );
    expect(container.querySelector('[data-nav-key="insights"]')).toHaveClass('is-active');
    expect(analyticsItem).toBeDefined();

    // Clicking Network Config opens its 7-group popover
    const netCfgBtn = container.querySelector('[data-nav-key="network-config"]');
    fireEvent.click(netCfgBtn!);
    expect(await screen.findByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Network Settings')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getAllByText('VPN').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Transmission')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Clicking Device Config opens its 3-group popover
    const devCfgBtn = container.querySelector('[data-nav-key="device-config"]');
    fireEvent.click(devCfgBtn!);
    expect(await screen.findByText('Gateway')).toBeInTheDocument();
    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(screen.getByText('EoGRE Tunnel')).toBeInTheDocument();
  });
});
