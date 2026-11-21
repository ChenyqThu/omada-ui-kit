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
import { SClientOverviewStrip } from '../omada/components/SClientOverviewStrip';
import { ClientListPage } from '../demos/emulator/clients/ClientListPage';
import { ClientPropertiesDrawer } from '../demos/emulator/clients/ClientPropertiesDrawer';
import { EMULATOR_CLIENTS } from '../demos/emulator/clients/clientsData';
import '../styles/modules/emulator-clients.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-clients module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('EMULATOR_CLIENTS data & assets', () => {
    it('exports all 4 exact clients with valid product/client assets and Test_PC drawer telemetry', () => {
      expect(EMULATOR_CLIENTS).toHaveLength(4);

      for (const client of EMULATOR_CLIENTS) {
        expect(hasOmadaProductImage(client.uplinkProductSlug)).toBe(true);
        expect(client.healthTicks).toHaveLength(96);
      }

      const testPc = EMULATOR_CLIENTS.find((c) => c.name === 'Test_PC');
      expect(testPc).toBeDefined();
      expect(testPc).toMatchObject({
        ipAddress: '192.168.0.200',
        authType: 'Administrator - admin',
        status: 'authorized',
        experienceLabel: 'Poor - 3',
        incidents: 0,
        ssid: '--',
        network: 'Default',
        vlan: 1,
        apOrPort: 'MainOffice_Gateway_2',
        downloadTraffic: '278.75 MB',
        uptime: '5h 13m 49s',
        drawerUptime: '5h 8m 48s',
        mac: '1C-1B-0D-F7-E0-96',
        downloadThroughput: '19.16 Kbps',
        upPackets: 168415,
        upBytes: '59.03 MB',
        downPackets: 310267,
        downBytes: '278.37 MB',
      });
    });
  });

  describe('SClientOverviewStrip', () => {
    it('renders Online Clients, Mobile, Others, and Office KPI blocks and handles clicks', () => {
      const onItemClick = vi.fn();
      const { container } = renderThemed(
        <SClientOverviewStrip onItemClick={onItemClick} />,
      );

      expect(screen.getByText('Online Clients')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Others')).toBeInTheDocument();
      expect(screen.getByText('Office')).toBeInTheDocument();

      // Others should force light variant so dark SVG export artifacts are avoided
      const othersImg = container.querySelector('[data-omada-asset="other"]');
      expect(othersImg).toHaveAttribute('data-asset-theme', 'light');

      fireEvent.click(screen.getByRole('button', { name: /Mobile/i }));
      expect(onItemClick).toHaveBeenCalledWith('mobile');
    });
  });

  describe('ClientListPage', () => {
    it('renders tabs, overview strip, 2-row filter toolbar, 13 table columns, 4 rows, and pagination without console errors/warnings', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<ClientListPage />);

      // Top underline tabs + Export
      expect(screen.getByRole('tab', { name: 'Online' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Offline' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Blocked' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();

      // Toolbar Row 1 & Row 2 filters
      expect(
        screen.getByPlaceholderText('Search Name, IP or MAC'),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('tab', { name: 'All (4)' })).toHaveLength(2);
      expect(screen.getByRole('tab', { name: 'Wireless (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Wired (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'IPCs/NVRs' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Batch Config' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Good (1)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Fair (1)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Poor (1)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'No Data (1)' })).toBeInTheDocument();

      // Column headers
      const headers = screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent?.trim() ?? '');
      expect(headers).toEqual([
        '',
        'Name',
        'IP Address',
        'Authentication Type',
        'Status',
        'Experience',
        'Incidents',
        'SSID',
        'Network',
        'AP/Port',
        'Download Traffic',
        'Uptime',
        'Action',
      ]);

      // 4 exact client rows
      expect(screen.getByText('Test_PC')).toBeInTheDocument();
      expect(screen.getByText('CC-28-AA-75-E6-02')).toBeInTheDocument();
      expect(screen.getByText('StarLight')).toBeInTheDocument();
      expect(screen.getByText('Neffos_X20_Pro')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.200')).toBeInTheDocument();
      expect(screen.getByText('Simple Password')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Poor - 3')).toBeInTheDocument();
      expect(screen.getByText('Fair - 7')).toBeInTheDocument();
      expect(screen.getByText('Good - 10')).toBeInTheDocument();
      expect(screen.getByText('278.75 MB')).toBeInTheDocument();
      expect(screen.getByText('233.31 MB')).toBeInTheDocument();
      expect(screen.getByText('205.27 KB')).toBeInTheDocument();
      expect(screen.getByText('5h 13m 49s')).toBeInTheDocument();

      // Row-specific action buttons
      expect(screen.getByRole('button', { name: 'Unauthorize Test_PC' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Block Test_PC' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reconnect Test_PC' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Authorize CC-28-AA-75-E6-02' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Block CC-28-AA-75-E6-02' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reconnect StarLight' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reconnect Neffos_X20_Pro' })).toBeInTheDocument();

      // Managed badge on Test_PC
      expect(container.querySelector('.omada-client-managed-badge')).toBeInTheDocument();

      // Pagination summary
      expect(screen.getByText('Showing 1-4 of 4 records')).toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<ClientListPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('Test_PC')).toBeInTheDocument();
      expect(screen.getByText('Neffos_X20_Pro')).toBeInTheDocument();
    });

    it('filters live by search query, connection type, experience, and top view tabs', () => {
      renderThemed(<ClientListPage />);

      // Filter by Wireless (2)
      fireEvent.click(screen.getByRole('tab', { name: 'Wireless (2)' }));
      expect(screen.getByText('StarLight')).toBeInTheDocument();
      expect(screen.getByText('Neffos_X20_Pro')).toBeInTheDocument();
      expect(screen.queryByText('Test_PC')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1-2 of 2 records')).toBeInTheDocument();

      // Reset connection type -> Filter by Poor (1)
      const connTablist = screen.getByRole('tablist', {
        name: 'Client connection filter',
      });
      fireEvent.click(within(connTablist).getByRole('tab', { name: 'All (4)' }));
      fireEvent.click(screen.getByRole('tab', { name: 'Poor (1)' }));
      expect(screen.getByText('Test_PC')).toBeInTheDocument();
      expect(screen.queryByText('StarLight')).not.toBeInTheDocument();

      // Reset experience -> Search by IP
      const expTablist = screen.getByRole('tablist', {
        name: 'Client experience filter',
      });
      fireEvent.click(within(expTablist).getByRole('tab', { name: 'All (4)' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Search clients' }), {
        target: { value: '192.168.0.107' },
      });
      expect(screen.getByText('Neffos_X20_Pro')).toBeInTheDocument();
      expect(screen.queryByText('Test_PC')).not.toBeInTheDocument();

      // Clear search and switch to Offline tab
      fireEvent.change(screen.getByRole('textbox', { name: 'Search clients' }), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByRole('tab', { name: 'Offline' }));
      expect(screen.getByText('No offline clients')).toBeInTheDocument();
    });

    it('invokes onSelectClient and onOpenDeviceByName while stopping propagation on action buttons', async () => {
      const onSelectClient = vi.fn();
      const onOpenDeviceByName = vi.fn();
      renderThemed(
        <ClientListPage
          onSelectClient={onSelectClient}
          onOpenDeviceByName={onOpenDeviceByName}
        />,
      );

      // Clicking AP/Port link opens device without selecting client row
      fireEvent.click(screen.getAllByRole('button', { name: 'MainOffice_Gateway_2' })[0]);
      expect(onOpenDeviceByName).toHaveBeenCalledWith('MainOffice_Gateway_2');
      expect(onSelectClient).not.toHaveBeenCalled();

      // Clicking row action buttons stops propagation and updates state
      fireEvent.click(screen.getByRole('button', { name: 'Authorize CC-28-AA-75-E6-02' }));
      expect(onSelectClient).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Unauthorize CC-28-AA-75-E6-02' })).toBeInTheDocument();

      // Blocking StarLight moves it to Blocked tab
      fireEvent.click(screen.getByRole('button', { name: 'Block StarLight' }));
      expect(screen.queryByText('StarLight')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('tab', { name: 'Blocked' }));
      expect(screen.getByText('StarLight')).toBeInTheDocument();

      // Switch back to All and click Test_PC row
      fireEvent.click(screen.getByRole('tab', { name: 'All' }));
      fireEvent.click(screen.getByText('Test_PC'));
      expect(onSelectClient).toHaveBeenCalledTimes(1);
      expect(onSelectClient.mock.calls[0][0].name).toBe('Test_PC');
    });

    it('toggles hidden columns via the Action column-selector popover', async () => {
      renderThemed(<ClientListPage />);

      expect(screen.queryByText('1C-1B-0D-F7-E0-96')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Column settings' }));

      await waitFor(() => {
        expect(screen.getByText('Customize Columns')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('MAC Address'));
      await waitFor(() => {
        expect(screen.getByText('1C-1B-0D-F7-E0-96')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
      await waitFor(() => {
        expect(screen.queryByText('1C-1B-0D-F7-E0-96')).not.toBeInTheDocument();
      });
    });
  });

  describe('ClientPropertiesDrawer', () => {
    it('renders the 420px Quick Drawer for Test_PC with 24h health, Uplink Gateway, and Info cards', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onClose = vi.fn();
      const onOpenDeviceByName = vi.fn();
      const onRenameClient = vi.fn();

      const testPc = EMULATOR_CLIENTS[0];
      renderThemed(
        <ClientPropertiesDrawer
          open
          client={testPc}
          onClose={onClose}
          onOpenDeviceByName={onOpenDeviceByName}
          onRenameClient={onRenameClient}
        />,
      );

      expect(
        screen.getByRole('dialog', { name: 'Test_PC properties' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Authorized')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Manage Client' })).toBeInTheDocument();

      // 24h health card powered by SHealthTrendBar
      expect(screen.getByText('Client 24h health')).toBeInTheDocument();
      expect(
        screen.getByRole('img', { name: /health trend across 96 intervals/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByText('03:25 pm')).toHaveLength(2);

      // Uplink Gateway card
      expect(screen.getByText('Uplink Gateway')).toBeInTheDocument();
      expect(screen.getByText('19.16 Kbps')).toBeInTheDocument();
      expect(screen.getByText('168415 / 59.03 MB')).toBeInTheDocument();
      expect(screen.getByText('310267 / 278.37 MB')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'MainOffice_Gateway_2' }));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('MainOffice_Gateway_2');

      // Info card
      expect(screen.getByText('1C-1B-0D-F7-E0-96')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.200')).toBeInTheDocument();
      expect(screen.getByText('Computer')).toBeInTheDocument();
      expect(screen.getByText('5h 8m 48s')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();

      // Inline rename
      fireEvent.click(screen.getByRole('button', { name: 'Rename client' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'New client name' }), {
        target: { value: 'Engineering_PC' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(onRenameClient).toHaveBeenCalledWith(testPc, 'Engineering_PC');
      expect(screen.getByText('Engineering_PC')).toBeInTheDocument();

      // Close drawer
      fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
      expect(onClose).toHaveBeenCalledTimes(1);

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(
        <ClientPropertiesDrawer
          open
          client={EMULATOR_CLIENTS[0]}
          onClose={() => {}}
        />,
        'dark',
      );
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('Uplink Gateway')).toBeInTheDocument();
    });
  });
});
