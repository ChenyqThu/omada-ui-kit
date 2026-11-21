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
import { OmadaProvider, hasOmadaProductImage } from '@/omada';
import { DnsConfigPage } from '../demos/emulator/config/DnsConfigPage';
import { SwitchPortsConfigPage } from '../demos/emulator/config/SwitchPortsConfigPage';
import {
  INITIAL_DDNS_ENTRIES,
  INITIAL_DNS_PROXY_CUSTOM_SERVERS,
  INITIAL_SWITCH_PORTS,
} from '../demos/emulator/config/deviceConfigData';
import '../styles/modules/emulator-dev-config.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-dev-config module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('deviceConfigData fixtures', () => {
    it('exports all 30 switch port rows across 3 switches with valid product images and exact topologies', () => {
      expect(INITIAL_SWITCH_PORTS).toHaveLength(30);
      for (const row of INITIAL_SWITCH_PORTS) {
        expect(hasOmadaProductImage(row.switchProductSlug)).toBe(true);
        if (row.connectionProductSlug) {
          expect(hasOmadaProductImage(row.connectionProductSlug)).toBe(true);
        }
      }

      const cto = INITIAL_SWITCH_PORTS.filter(
        (p) => p.switchName === 'CTOOffice_Switch_1',
      );
      const sales = INITIAL_SWITCH_PORTS.filter(
        (p) => p.switchName === 'SalesDepartment_Switch_3',
      );
      const server = INITIAL_SWITCH_PORTS.filter(
        (p) => p.switchName === 'ServerRoom_Switch_2',
      );
      expect(cto).toHaveLength(10);
      expect(sales).toHaveLength(10);
      expect(server).toHaveLength(10);

      expect(cto[0]).toMatchObject({
        model: 'SG3210 v3.20',
        isUplink: true,
        connectionName: 'MainOffice_Gateway_2',
      });
      expect(cto[8].isSfp).toBe(true);
      expect(cto[9].isSfp).toBe(true);

      expect(sales[0]).toMatchObject({
        model: 'SG2210MP v5.0',
        isUplink: true,
        connectionName: 'MainOffice_Gateway_2',
      });
      expect(sales[1]).toMatchObject({
        isPoe: true,
        connectionName: 'COOOffice_Eap_1',
      });
      expect(sales[2]).toMatchObject({
        isPoe: true,
        connectionName: 'BreakRoom_Eap_2',
      });
      expect(sales[3]).toMatchObject({
        isPoe: true,
        connectionName: 'StorageRoom_Eap_3',
      });
      expect(sales[8].isSfp).toBe(true);
      expect(sales[9].isSfp).toBe(true);

      expect(server[0].model).toBe('TL-SG2210MP v2.0');
      expect(INITIAL_DDNS_ENTRIES).toHaveLength(1);
      expect(INITIAL_DDNS_ENTRIES[0]).toMatchObject({
        provider: 'DynDNS',
        interfaceName: '3_832db9e5f1ef49dfa771961a9f8885c4',
        statusLabel: 'Incorrect Credential',
        username: 'admin',
        domainName: 'test.com',
        ip: '192.168.220.168',
        updateInterval: 'never',
      });
      expect(INITIAL_DNS_PROXY_CUSTOM_SERVERS).toHaveLength(2);
    });
  });

  describe('SwitchPortsConfigPage', () => {
    it('renders Port Settings with all 30 ports, 15 columns, segmented controls, and pr-9 clearance without console warnings', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<SwitchPortsConfigPage />);

      // Top underline tabs
      expect(
        screen.getByRole('tab', { name: 'Port Settings' }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(
        screen.getByRole('tab', { name: 'Port Profile' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Switch Ports help' }),
      ).toBeInTheDocument();

      // Toolbar controls & pr-9 clearance from <|| handle
      const searchInput = screen.getByPlaceholderText(
        'Search Switch, Name, Label, Profile',
      );
      expect(searchInput).toBeInTheDocument();
      const filterBtn = screen.getByRole('button', { name: 'Filter' });
      expect(filterBtn.closest('.pr-9')).not.toBeNull();

      // View mode & Link status segmented controls
      expect(
        screen.getByRole('tab', { name: 'Overview' }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'PoE' })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Counters' }),
      ).toBeInTheDocument();

      expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(
        screen.getByRole('tab', { name: 'Connected' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Disconnected' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Disabled' }),
      ).toBeInTheDocument();

      // Column headers
      const headers = screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent?.trim() ?? '');
      expect(headers).toContain('Port');
      expect(headers).toContain('Switch');
      expect(headers).toContain('Model');
      expect(headers).toContain('Name');
      expect(headers).toContain('Connection');
      expect(headers).toContain('Label');
      expect(headers).toContain('Type');
      expect(headers).toContain('PoE');
      expect(headers).toContain('Operation');
      expect(headers).toContain('Profile');
      expect(headers).toContain('Native Network');
      expect(headers).toContain('TX Sum');
      expect(headers).toContain('RX Sum');
      expect(headers).toContain('Action');

      // All 30 port rows & pagination
      expect(screen.getAllByText('CTOOffice_Switch_1')).toHaveLength(10);
      expect(screen.getAllByText('SalesDepartment_Switch_3')).toHaveLength(10);
      expect(screen.getAllByText('ServerRoom_Switch_2')).toHaveLength(10);
      expect(screen.getByText('COOOffice_Eap_1')).toBeInTheDocument();
      expect(screen.getByText('BreakRoom_Eap_2')).toBeInTheDocument();
      expect(screen.getByText('StorageRoom_Eap_3')).toBeInTheDocument();
      expect(screen.getByText('Showing 1-30 of 30 records')).toBeInTheDocument();

      // PoE Power Cycle button appears only on active PoE ports
      expect(
        screen.getByRole('button', {
          name: 'Power cycle SalesDepartment_Switch_3 Port2',
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: 'Power cycle CTOOffice_Switch_1 Port1',
        }),
      ).not.toBeInTheDocument();

      expect(container.querySelector('.omada-devcfg-table')).toBeInTheDocument();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('filters by link status, search query, view mode, edits port config, and creates a Port Profile', async () => {
      renderThemed(<SwitchPortsConfigPage />);

      // Filter Disabled -> 1 port (ServerRoom_Switch_2 Port8)
      fireEvent.click(screen.getByRole('tab', { name: 'Disabled' }));
      expect(screen.getByText('Showing 1-1 of 1 records')).toBeInTheDocument();
      expect(screen.getByText('Port8')).toBeInTheDocument();

      // Reset to All -> Search COOOffice_Eap_1
      fireEvent.click(screen.getByRole('tab', { name: 'All' }));
      fireEvent.change(
        screen.getByPlaceholderText('Search Switch, Name, Label, Profile'),
        { target: { value: 'COOOffice_Eap_1' } },
      );
      expect(screen.getByText('Showing 1-1 of 1 records')).toBeInTheDocument();

      // Clear search and switch view modes
      fireEvent.change(
        screen.getByPlaceholderText('Search Switch, Name, Label, Profile'),
        { target: { value: '' } },
      );
      fireEvent.click(screen.getByRole('tab', { name: 'PoE' }));
      expect(
        screen.getByRole('columnheader', { name: 'Power Draw' }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Counters' }));
      expect(
        screen.getByRole('columnheader', { name: 'TX Packets' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'CRC Errors' }),
      ).toBeInTheDocument();

      // Edit a port
      fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
      fireEvent.click(
        screen.getByRole('button', { name: 'Edit CTOOffice_Switch_1 Port1' }),
      );
      const dialog = await screen.findByRole('dialog');
      const labelInput = within(dialog).getByLabelText('Label');
      fireEvent.change(labelInput, { target: { value: 'Core-GW' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
      await waitFor(() => {
        expect(screen.getByText('Core-GW')).toBeInTheDocument();
      });

      // Switch to Port Profile tab & create a new profile
      fireEvent.click(screen.getByRole('tab', { name: 'Port Profile' }));
      expect(screen.getByText('AP_Trunk')).toBeInTheDocument();

      const createProfileBtn = screen.getByRole('button', {
        name: /Create New Port Profile/i,
      });
      expect(createProfileBtn.closest('.pr-9')).not.toBeNull();
      fireEvent.click(createProfileBtn);

      const profileModal = await screen.findByRole('dialog');
      fireEvent.change(within(profileModal).getByLabelText('Profile Name'), {
        target: { value: 'Camera_PoE' },
      });
      fireEvent.click(within(profileModal).getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(screen.getByText('Camera_PoE')).toBeInTheDocument();
      });
    });

    it('renders SwitchPortsConfigPage cleanly in dark mode', () => {
      renderThemed(<SwitchPortsConfigPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByTestId('switch-ports-config-page')).toBeInTheDocument();
    });
  });

  describe('DnsConfigPage', () => {
    it('renders Dynamic DNS tab with exact row and pr-9 CTA clearance without console warnings', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderThemed(<DnsConfigPage />);

      expect(screen.getByRole('tab', { name: 'Dynamic DNS' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'DNS Proxy' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'DNS Cache' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'DNS help' }),
      ).toBeInTheDocument();

      const createBtn = screen.getByRole('button', {
        name: /Create New Dynamic DNS Entry/i,
      });
      expect(createBtn.closest('.pr-9')).not.toBeNull();

      expect(screen.getByText('DynDNS')).toBeInTheDocument();
      expect(
        screen.getByText('3_832db9e5f1ef49dfa771961a9f8885c4'),
      ).toBeInTheDocument();
      expect(screen.getByText('Incorrect Credential')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('test.com')).toBeInTheDocument();
      expect(screen.getByText('192.168.220.168')).toBeInTheDocument();
      expect(screen.getByText('never')).toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('supports creating DDNS entries, configuring DNS Proxy custom servers, and DNS Cache controls', async () => {
      renderThemed(<DnsConfigPage />);

      // Create new DDNS entry
      fireEvent.click(
        screen.getByRole('button', { name: /Create New Dynamic DNS Entry/i }),
      );
      const modal = await screen.findByRole('dialog');
      fireEvent.change(within(modal).getByLabelText('Username'), {
        target: { value: 'ops-admin' },
      });
      fireEvent.change(within(modal).getByLabelText('Domain Name'), {
        target: { value: 'hq.example.net' },
      });
      fireEvent.click(within(modal).getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(screen.getByText('hq.example.net')).toBeInTheDocument();
      });

      // Switch to DNS Proxy tab
      fireEvent.click(screen.getByRole('tab', { name: 'DNS Proxy' }));
      expect(screen.getByTestId('dns-proxy-panel')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'DNS Proxy' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(screen.getByRole('radio', { name: 'DoH' })).toBeChecked();

      for (const preset of [
        'Google',
        'Cloudflare',
        'Quad9_1',
        'Quad9_2',
        'CleanBrowsing',
      ]) {
        expect(screen.getByRole('checkbox', { name: preset })).not.toBeChecked();
      }

      expect(
        screen.getByDisplayValue('Test_Dns_Proxy_1'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://www.tp-link-test-1.com'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: 'Select Test_Dns_Proxy_1' }),
      ).not.toBeChecked();

      expect(
        screen.getByDisplayValue('Test_Dns_Proxy_2'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://www.tp-link-test-2.com'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: 'Select Test_Dns_Proxy_2' }),
      ).toBeChecked();

      // Add custom server & remove first custom server
      fireEvent.click(
        screen.getByRole('button', { name: /Add Custom Servers/i }),
      );
      expect(
        screen.getByDisplayValue('Test_Dns_Proxy_3'),
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: 'Remove Test_Dns_Proxy_1' }),
      );
      expect(
        screen.queryByDisplayValue('Test_Dns_Proxy_1'),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

      // Switch to DNS Cache tab
      fireEvent.click(screen.getByRole('tab', { name: 'DNS Cache' }));
      expect(screen.getByTestId('dns-cache-panel')).toBeInTheDocument();
      const cacheSwitch = screen.getByRole('switch', { name: 'DNS Cache' });
      expect(cacheSwitch).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByLabelText('DNS Cache Size')).toHaveValue('5000');
      expect(screen.getByLabelText('Cache TTL')).toHaveValue('1200');
      expect(screen.getByText('(1-5000)')).toBeInTheDocument();
      expect(screen.getByText('Seconds (1-86400)')).toBeInTheDocument();

      fireEvent.click(cacheSwitch);
      expect(cacheSwitch).toHaveAttribute('aria-checked', 'true');
      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });

    it('renders DnsConfigPage cleanly in dark mode', () => {
      renderThemed(<DnsConfigPage initialTab="dns-proxy" />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByTestId('dns-proxy-panel')).toBeInTheDocument();
    });
  });
});
