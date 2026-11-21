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
import { SDeviceHealthSummary } from '../omada/components/SDeviceHealthSummary';
import { DeviceListPage } from '../demos/emulator/devices/DeviceListPage';
import { EMULATOR_DEVICES } from '../demos/emulator/devices/devicesData';
import '../styles/modules/emulator-devices.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-devices module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('EMULATOR_DEVICES data & assets', () => {
    it('exports all 9 exact devices with valid product slugs and full drawer telemetry', () => {
      expect(EMULATOR_DEVICES).toHaveLength(9);

      for (const device of EMULATOR_DEVICES) {
        expect(hasOmadaProductImage(device.productSlug)).toBe(true);
        expect(device.customer).toBe('Headquarters Building');
      }

      const salesSwitch = EMULATOR_DEVICES.find(
        (d) => d.name === 'SalesDepartment_Switch_3',
      );
      expect(salesSwitch).toBeDefined();
      expect(salesSwitch?.uptime).toBe('23h 42m 17s');
      expect(salesSwitch?.cpu).toBe(3);
      expect(salesSwitch?.memory).toBe(50);
      expect(salesSwitch?.poeUsedW).toBe(32.8);
      expect(salesSwitch?.poeTotalW).toBe(150);
      expect(salesSwitch?.usedPorts).toBe(4);
      expect(salesSwitch?.totalPorts).toBe(10);
      expect(salesSwitch?.uplink).toEqual({ name: 'MainOffice_Gateway_2', port: 1 });
      expect(salesSwitch?.downlinks).toHaveLength(3);
      expect(salesSwitch?.ports).toHaveLength(10);
      expect(salesSwitch?.ports?.[0]).toMatchObject({
        port: 1,
        name: 'Port1',
        linkStatus: '1000m',
        isUplink: true,
        connectionName: 'MainOffice_Gateway_2',
      });
      expect(salesSwitch?.ports?.[8]).toMatchObject({
        port: 9,
        isSfp: true,
        poeCapability: '--',
      });
    });
  });

  describe('SDeviceHealthSummary', () => {
    it('renders Gateway, Switches, APs, OLTs with expected counts and segmented bars', () => {
      const { container } = renderThemed(<SDeviceHealthSummary />);

      expect(screen.getByText('Gateway')).toBeInTheDocument();
      expect(screen.getByText('Good - 10')).toBeInTheDocument();
      expect(screen.getByText('Switches')).toBeInTheDocument();
      expect(screen.getByText('APs')).toBeInTheDocument();
      expect(screen.getByText('OLTs')).toBeInTheDocument();

      const bars = container.querySelectorAll('.w-\\[200px\\]');
      expect(bars).toHaveLength(2);
      // Switches has 3 active segments (1/1/1/0), APs has 3 active segments (1/1/0/1)
      expect(bars[0].querySelectorAll('span')).toHaveLength(3);
      expect(bars[1].querySelectorAll('span')).toHaveLength(3);
    });
  });

  describe('DeviceListPage', () => {
    it('renders all 9 devices, sub-tabs, toolbar filters, columns, and pagination without console errors/warnings', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<DeviceListPage />);

      // Top sub-tabs
      expect(screen.getByRole('tab', { name: 'Device List' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Device Group' })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Configuration Result' }),
      ).toBeInTheDocument();

      // Toolbar filter tabs
      expect(screen.getAllByRole('tab', { name: 'All (9)' })).toHaveLength(2);
      expect(
        screen.getByRole('tab', { name: 'Gateway/Switches (5)' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'OLTs (1)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'APs (3)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Good (4)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Fair (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Poor (1)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'No Data (2)' })).toBeInTheDocument();

      // Default column headers (Title Case) in exact order
      const headers = screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent?.trim() ?? '');
      expect(headers).toEqual([
        '',
        'Device Name',
        'MAC Address',
        'IPv6 Address',
        'VoIP VLAN IP',
        'Status',
        'Health',
        'Model',
        'Version',
        'Action',
      ]);

      // Exact 9 device names, tags, and health statuses
      for (const device of EMULATOR_DEVICES) {
        expect(screen.getByText(device.name)).toBeInTheDocument();
      }
      expect(screen.getByText('IP Passthrough')).toBeInTheDocument();
      expect(screen.getByText('Stack')).toBeInTheDocument();
      expect(screen.getByText('MLAG')).toBeInTheDocument();
      expect(screen.getByText('fe80::226:11ff:fe16:b63e')).toBeInTheDocument();
      expect(screen.getByText('Fair - 7')).toBeInTheDocument();
      expect(screen.getByText('Good - 9')).toBeInTheDocument();
      expect(screen.getByText('Fair - 5')).toBeInTheDocument();
      expect(screen.getByText('Poor - 2')).toBeInTheDocument();
      expect(screen.getByText('No Data')).toBeInTheDocument();
      expect(container.querySelector('[data-omada-icon="16-2"]')).toBeInTheDocument();

      // Pagination summary
      expect(screen.getByText('Showing 1-9 of 9 records')).toBeInTheDocument();

      // Action icons per category
      expect(screen.getByRole('button', { name: 'Locate BreakRoom_Eap_2' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Terminal BreakRoom_Eap_2' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Locate BreakRoom_Gateway_1' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Terminal SalesDepartment_Switch_3' })).toBeInTheDocument();

      // Dark mode sanity check
      expect(container.querySelector('.omada-devices-table')).toBeInTheDocument();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<DeviceListPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('SalesDepartment_Switch_3')).toBeInTheDocument();
    });

    it('filters live by search query, type segmented tabs, and health pills', () => {
      renderThemed(<DeviceListPage />);

      // Filter by Type: APs (3)
      fireEvent.click(screen.getByRole('tab', { name: 'APs (3)' }));
      expect(screen.getByText('BreakRoom_Eap_2')).toBeInTheDocument();
      expect(screen.getByText('COOOffice_Eap_1')).toBeInTheDocument();
      expect(screen.getByText('StorageRoom_Eap_3')).toBeInTheDocument();
      expect(screen.queryByText('SalesDepartment_Switch_3')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1-3 of 3 records')).toBeInTheDocument();

      // Reset Type to All (9) -> Filter by Health: Poor (1)
      const typeTablist = screen.getByRole('tablist', {
        name: 'Device category filter',
      });
      fireEvent.click(within(typeTablist).getByRole('tab', { name: 'All (9)' }));
      fireEvent.click(screen.getByRole('tab', { name: 'Poor (1)' }));
      expect(screen.getByText('ServerRoom_Switch_2')).toBeInTheDocument();
      expect(screen.queryByText('MainOffice_Gateway_2')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1-1 of 1 records')).toBeInTheDocument();

      // Reset Health -> Search by tag "Stack"
      const healthTablist = screen.getByRole('tablist', {
        name: 'Device health filter',
      });
      fireEvent.click(within(healthTablist).getByRole('tab', { name: 'All (9)' }));
      const searchInput = screen.getByRole('textbox', { name: 'Search devices' });
      fireEvent.change(searchInput, { target: { value: 'Stack' } });
      expect(screen.getByText('CTOOffice_Switch_1')).toBeInTheDocument();
      expect(screen.queryByText('ServerRoom_Switch_2')).not.toBeInTheDocument();
    });

    it('invokes onSelectDevice on row click while stopping propagation on row action icons', async () => {
      const onSelectDevice = vi.fn();
      renderThemed(<DeviceListPage onSelectDevice={onSelectDevice} />);

      // Clicking action icon must NOT trigger onSelectDevice
      fireEvent.click(
        screen.getByRole('button', { name: 'Locate SalesDepartment_Switch_3' }),
      );
      expect(onSelectDevice).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getByRole('button', { name: 'Terminal SalesDepartment_Switch_3' }),
      );
      expect(onSelectDevice).not.toHaveBeenCalled();

      // Clicking row triggers onSelectDevice
      fireEvent.click(screen.getByText('SalesDepartment_Switch_3'));
      expect(onSelectDevice).toHaveBeenCalledTimes(1);
      expect(onSelectDevice.mock.calls[0][0].name).toBe('SalesDepartment_Switch_3');
    });

    it('toggles hidden columns via the Action header column-selector popover', async () => {
      renderThemed(<DeviceListPage />);

      expect(screen.queryByText('IPv4 Address')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Column settings' }));

      await waitFor(() => {
        expect(screen.getByText('Customize Columns')).toBeInTheDocument();
      });

      const ipv4Label = screen.getByText('IPv4 Address');
      fireEvent.click(ipv4Label);

      await waitFor(() => {
        expect(screen.getByText('192.168.0.102')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
      await waitFor(() => {
        expect(screen.queryByText('192.168.0.102')).not.toBeInTheDocument();
      });
    });

    it('switches sub-tabs and supports Batch Action, Export, and Add Devices modal', async () => {
      renderThemed(<DeviceListPage />);

      // Export & Batch Action
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      fireEvent.click(screen.getByRole('button', { name: 'Batch Action' }));
      await waitFor(() => {
        expect(screen.getByText('Reboot Selected')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Reboot Selected'));

      // Add Devices Modal
      fireEvent.click(screen.getByRole('button', { name: /Add Devices/i }));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('e.g. Lobby_Eap_4')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. Lobby_Eap_4'), {
        target: { value: 'Lobby_Eap_4' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Adopt Device' }));
      await waitFor(() => {
        expect(screen.getByText('Lobby_Eap_4')).toBeInTheDocument();
      });

      // Switch to Device Group & Configuration Result
      fireEvent.click(screen.getByRole('tab', { name: 'Device Group' }));
      expect(screen.getByText('Main Floor Wireless APs')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Configuration Result' }));
      expect(
        screen.getByText('Port Profile & PoE Schedule Sync'),
      ).toBeInTheDocument();
    });
  });
});
