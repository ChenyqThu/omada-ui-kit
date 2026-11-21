import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OmadaProvider } from '@/omada';
import {
  SSettingsInfoBanner,
  SSettingsPageShell,
  SSettingsRow,
  SSettingsSection,
} from '../omada/components/SSettingsPageShell';
import { SiteSettingsPage } from '../demos/emulator/config/SiteSettingsPage';
import { InternetPage } from '../demos/emulator/config/InternetPage';
import { LanPage } from '../demos/emulator/config/LanPage';
import {
  INITIAL_INTERNET_PORTS,
  INITIAL_VLANS,
} from '../demos/emulator/config/networkCoreData';
import '../styles/modules/emulator-config-core.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-config-core module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('SSettingsPageShell', () => {
    it('renders title, help popover, underline tabs, info banner, and dirty-state sticky footer', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onTabChange = vi.fn();
      const onApply = vi.fn();
      const onCancel = vi.fn();

      renderThemed(
        <SSettingsPageShell
          title="Sample Settings"
          helpTitle="Guide"
          helpDescription="Help text for settings."
          tabs={[
            { key: 'tab-a', label: 'Tab A' },
            { key: 'tab-b', label: 'Tab B' },
          ]}
          activeTab="tab-a"
          onTabChange={onTabChange}
          dirty
          onApply={onApply}
          onCancel={onCancel}
        >
          <SSettingsSection title="Core Block">
            <SSettingsInfoBanner>Informational banner copy.</SSettingsInfoBanner>
            <SSettingsRow label="Field Label" tooltip="Tooltip text">
              <span>Control Value</span>
            </SSettingsRow>
          </SSettingsSection>
        </SSettingsPageShell>,
      );

      expect(screen.getByText('Sample Settings')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');
      fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
      expect(onTabChange).toHaveBeenCalledWith('tab-b');

      expect(screen.getByRole('note')).toHaveTextContent('Informational banner copy.');
      expect(screen.getByTestId('settings-dirty-footer')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
      expect(onApply).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('settings-help-btn'));
      await waitFor(() => {
        expect(screen.getByText('Help text for settings.')).toBeInTheDocument();
      });

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });
  });

  describe('SiteSettingsPage', () => {
    it('renders all 5 sections, exact fields, and supports collapsible toggles and dirty Apply/Cancel', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderThemed(<SiteSettingsPage />);

      // Header & 5 sections
      expect(screen.getByRole('heading', { name: 'Site Settings' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Site Configuration' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'General Config' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Wireless Features' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Device Account' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Auto Send Data to Email' })).toBeInTheDocument();

      // Exact field defaults
      const siteNameInput = screen.getByRole('textbox', { name: 'Site Name' });
      expect(siteNameInput).toHaveValue('Main Office Floor');
      expect(screen.getByText('Campus')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByTestId('site-inform-url')).toHaveTextContent(
        'omada://aps1-omada-device-beta.tplinkcloud.com/site/68cb5f3c0d0b69602995c57e',
      );
      expect(screen.getByRole('textbox', { name: 'Switch Jumbo' })).toHaveValue('1518');
      expect(screen.getByText('(1518-9216)')).toBeInTheDocument();
      expect(screen.getByText('SRC IP+DST IP')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Portal Logout Domain' })).toHaveValue(
        'portal.tplink.net',
      );
      expect(screen.getByText('Follow Global Configuration')).toBeInTheDocument();
      expect(screen.getByText('Wireless Multi-Link Operation (MLO)')).toBeInTheDocument();
      expect(screen.getByText('2.4 GHz Connection Optimization')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Device Username' })).toHaveValue('admin');
      expect(screen.getByText('Logs')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('00:00')).toBeInTheDocument();

      // Collapsible + Time Settings & + Location (Optional)
      expect(screen.queryByText('Time Zone')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Time Settings/i }));
      expect(screen.getByText('Time Zone')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'NTP Server' })).toHaveValue('pool.ntp.org');

      expect(screen.queryByText('Site Address')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Location \(Optional\)/i }));
      expect(screen.getByText('Site Address')).toBeInTheDocument();

      // Copy URL
      fireEvent.click(screen.getByRole('button', { name: /Copy URL/i }));

      // Dirty state -> Cancel reverts -> Apply saves
      expect(screen.queryByTestId('settings-dirty-footer')).not.toBeInTheDocument();
      fireEvent.change(siteNameInput, { target: { value: 'Main Office Annex' } });
      expect(screen.getByTestId('settings-dirty-footer')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(siteNameInput).toHaveValue('Main Office Floor');
      expect(screen.queryByTestId('settings-dirty-footer')).not.toBeInTheDocument();

      fireEvent.change(siteNameInput, { target: { value: 'Main Office Updated' } });
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
      expect(siteNameInput).toHaveValue('Main Office Updated');
      expect(screen.queryByTestId('settings-dirty-footer')).not.toBeInTheDocument();

      // Add Email Address interaction
      fireEvent.click(screen.getByRole('button', { name: /Add Email Address/i }));
      fireEvent.change(screen.getByRole('textbox', { name: 'New recipient email' }), {
        target: { value: 'admin@hq.local' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByText('admin@hq.local')).toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<SiteSettingsPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByRole('heading', { name: 'Site Settings' })).toBeInTheDocument();
    });
  });

  describe('InternetPage', () => {
    it('renders Mode Config, soft blue info banner, 13 interactive Port Config rows, Load Balancing, and Link Backup', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderThemed(<InternetPage />);

      expect(screen.getByRole('heading', { name: 'Internet' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Mode Config' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Port Config' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Load Balancing' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Link Backup' })).toBeInTheDocument();

      // Soft blue info banner & Mode Config values
      expect(screen.getByRole('note')).toHaveTextContent(
        /If the number of preconfigured WAN ports does not match/i,
      );
      expect(screen.getByText('ER7412-M2 v1.0')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Custom Time' })).toHaveValue('10');
      expect(screen.getByText('(1-3600)')).toBeInTheDocument();

      // 13 Port Config rows
      expect(INITIAL_INTERNET_PORTS).toHaveLength(13);
      const portTable = screen.getByTestId('internet-port-config-table');
      expect(within(portTable).getByText('USB Modem')).toBeInTheDocument();
      expect(within(portTable).getByText('2.5G WAN/LAN1')).toBeInTheDocument();
      expect(within(portTable).getByText('2.5G WAN/LAN2')).toBeInTheDocument();
      expect(within(portTable).getByText('WAN/LAN3')).toBeInTheDocument();
      expect(within(portTable).getByText('WAN/LAN10')).toBeInTheDocument();
      expect(within(portTable).getByText('SFP WAN/LAN11')).toBeInTheDocument();
      expect(within(portTable).getByText('SFP WAN/LAN12')).toBeInTheDocument();

      // Initial Edit action buttons only on 2.5G WAN/LAN1 and WAN/LAN3
      expect(screen.getByRole('button', { name: 'Edit 2.5G WAN/LAN1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit WAN/LAN3' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Edit USB Modem' })).not.toBeInTheDocument();

      // Toggle USB Modem to WAN Port -> Edit button appears & sticky footer activates
      fireEvent.click(screen.getByRole('switch', { name: 'Set USB Modem to WAN Port' }));
      expect(screen.getByRole('button', { name: 'Edit USB Modem' })).toBeInTheDocument();
      expect(screen.getByTestId('settings-dirty-footer')).toBeInTheDocument();

      // Edit 2.5G WAN/LAN1 modal
      fireEvent.click(screen.getByRole('button', { name: 'Edit 2.5G WAN/LAN1' }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Port Description' }), {
        target: { value: 'Primary Fiber' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(within(portTable).getByText('Primary Fiber')).toBeInTheDocument();
      });

      // Create New Link Backup Rule modal
      fireEvent.click(screen.getByRole('button', { name: /Create New Link Backup Rule/i }));
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Link Backup Rule Name' })).toBeInTheDocument();
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Link Backup Rule Name' }), {
        target: { value: 'LTE Standby Failover' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(screen.getByText('LTE Standby Failover')).toBeInTheDocument();
      });

      // Apply saves state
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
      expect(screen.queryByTestId('settings-dirty-footer')).not.toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<InternetPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByRole('heading', { name: 'Internet' })).toBeInTheDocument();
    });
  });

  describe('LanPage', () => {
    it('renders 4 tabs, 7 VLAN cards, 7-column KPI strip, interactive VLAN Topology SVG, and secondary tabs', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onOpenDeviceByName = vi.fn();

      renderThemed(<LanPage onOpenDeviceByName={onOpenDeviceByName} />);

      // Top underline tabs
      expect(screen.getByRole('tab', { name: 'VLAN' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Multicast Snooping' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Isolation Settings' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'LAN DNS' })).toBeInTheDocument();

      // 7 stacked VLAN cards
      expect(INITIAL_VLANS).toHaveLength(7);
      expect(screen.getByTestId('vlan-card-vlan-1')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('interface-vlan4090')).toBeInTheDocument();
      expect(screen.getByText('interface-vlan100')).toBeInTheDocument();
      expect(screen.getByText('vlan20')).toBeInTheDocument();
      expect(screen.getByText('inteface-vlan71')).toBeInTheDocument();
      expect(screen.getByText('interface-vlan110')).toBeInTheDocument();
      expect(screen.getByText('vlan 200')).toBeInTheDocument();

      // Right pane KPI strip for Default VLAN
      expect(screen.getByTestId('lan-selected-vlan-title')).toHaveTextContent('Default');
      const kpiStrip = screen.getByTestId('lan-vlan-kpi-strip');
      expect(within(kpiStrip).getByText('192.168.0.1-192.168.0.254')).toBeInTheDocument();
      expect(within(kpiStrip).getByText('/ 65535')).toBeInTheDocument();

      // Topology SVG active members & DHCP Server badge
      const canvas = screen.getByTestId('vlan-topology-canvas');
      expect(canvas).toHaveAttribute('data-layout', 'horizontal');
      expect(screen.getByTestId('vlan-dhcp-server-badge')).toHaveTextContent('DHCP Server');
      expect(screen.getByTestId('vlan-topo-node-mainoffice-gateway-2')).toHaveAttribute(
        'data-vlan-member',
        'true',
      );
      expect(screen.getByTestId('vlan-topo-node-omada-controller')).toHaveAttribute(
        'data-vlan-member',
        'false',
      );

      // Clicking a member device invokes onOpenDeviceByName
      fireEvent.click(screen.getByTestId('vlan-topo-node-ctooffice-switch-1'));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('CTOOffice_Switch_1');

      // Layout toggle & Zoom controls
      fireEvent.click(screen.getByTestId('vlan-topo-layout-btn'));
      expect(canvas).toHaveAttribute('data-layout', 'vertical');
      fireEvent.click(screen.getByTestId('vlan-topo-zoom-in-btn'));
      expect(canvas).toHaveAttribute('data-zoom', '1.15');
      fireEvent.click(screen.getByTestId('vlan-topo-recenter-btn'));
      expect(canvas).toHaveAttribute('data-zoom', '1');

      // Switch selected VLAN to vlan20 -> KPI and topology membership update
      fireEvent.click(screen.getByTestId('vlan-card-vlan-20'));
      expect(screen.getByTestId('lan-selected-vlan-title')).toHaveTextContent('vlan20');
      expect(within(kpiStrip).getByText('192.168.20.1 / 24')).toBeInTheDocument();
      expect(within(kpiStrip).getByText('Guest-Isolate')).toBeInTheDocument();
      expect(screen.getByTestId('vlan-topo-node-ctooffice-switch-1')).toHaveAttribute(
        'data-vlan-member',
        'false',
      );

      // Search Name filter in left rail
      fireEvent.change(screen.getByRole('textbox', { name: 'Search Name' }), {
        target: { value: '4090' },
      });
      expect(screen.getByTestId('vlan-card-vlan-4090')).toBeInTheDocument();
      expect(screen.queryByTestId('vlan-card-vlan-1')).not.toBeInTheDocument();
      fireEvent.change(screen.getByRole('textbox', { name: 'Search Name' }), {
        target: { value: '' },
      });

      // Switch to Ports segmented view
      fireEvent.click(screen.getByRole('tab', { name: 'Ports' }));
      expect(screen.getByTestId('lan-ports-table')).toBeInTheDocument();

      // Switch through secondary tabs
      fireEvent.click(screen.getByRole('tab', { name: 'Multicast Snooping' }));
      expect(screen.getByTestId('lan-snooping-tab')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Isolation Settings' }));
      expect(screen.getByTestId('lan-isolation-tab')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'LAN DNS' }));
      expect(screen.getByTestId('lan-dns-tab')).toBeInTheDocument();
      expect(screen.getByText('Omada Local Controller')).toBeInTheDocument();
      expect(screen.getByText('nas.hq.local')).toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<LanPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByTestId('vlan-topology-canvas')).toBeInTheDocument();
    });
  });
});
