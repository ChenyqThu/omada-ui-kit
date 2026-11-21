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
import {
  OmadaProvider,
  hasOmadaIllustration,
  hasOmadaProductImage,
} from '@/omada';
import { LogsPage } from '../demos/emulator/logs/LogsPage';
import { EMULATOR_LOG_EVENTS } from '../demos/emulator/logs/logsData';
import { IntelliRecoverPage } from '../demos/emulator/intellirecover/IntelliRecoverPage';
import { EMULATOR_INTELLIRECOVER_DEVICES } from '../demos/emulator/intellirecover/intelliRecoverData';
import '../styles/modules/emulator-logs-recover.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-logs-recover module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('data sets & official Figma assets', () => {
    it('exports all 10 exact log events and 3 exact IntelliRecover PoE devices with valid assets', () => {
      expect(EMULATOR_LOG_EVENTS).toHaveLength(10);
      expect(EMULATOR_LOG_EVENTS[0]?.time).toBe('Sep 18, 2025 03:16:43 pm');
      expect(EMULATOR_LOG_EVENTS[9]?.time).toBe('Sep 18, 2025 12:27:01 pm');

      expect(EMULATOR_INTELLIRECOVER_DEVICES).toHaveLength(3);
      for (const dev of EMULATOR_INTELLIRECOVER_DEVICES) {
        expect(hasOmadaProductImage(dev.productSlug)).toBe(true);
      }

      expect(hasOmadaIllustration('intellirecover-3')).toBe(true);
      expect(hasOmadaIllustration('intellirecover-2')).toBe(true);
    });
  });

  describe('LogsPage', () => {
    it('renders Events active by default with 10 exact rows, module filters, pagination, and zero console errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<LogsPage />);

      // Top underline sub-tabs: Alerts | Events (default active) | Audit Logs
      expect(screen.getByRole('tab', { name: 'Alerts' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Events' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Audit Logs' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Setting' })).toBeInTheDocument();

      // Segmented module filters
      expect(screen.getByRole('tab', { name: 'All (10)' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'System (0)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Device (0)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Client (10)' })).toBeInTheDocument();

      // Toolbar actions
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();

      // Column headers
      const headers = screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent?.trim() ?? '');
      expect(headers).toEqual(['', 'Type', 'Content', 'Time', 'Action']);

      // Verify exact timestamps & entity links across all 10 rows
      for (const evt of EMULATOR_LOG_EVENTS) {
        expect(screen.getByText(evt.time)).toBeInTheDocument();
      }
      expect(screen.getAllByRole('button', { name: 'Neffos_X20_Pro' })).toHaveLength(10);
      expect(screen.getAllByRole('button', { name: 'StorageRoom_Eap_3' })).toHaveLength(8);
      expect(screen.getAllByRole('button', { name: 'COOOffice_Eap_1' })).toHaveLength(2);

      // Pagination summary
      expect(screen.getByText('Showing 1-10 of 10 records')).toBeInTheDocument();

      expect(container.querySelector('.omada-logs-table')).toBeInTheDocument();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('invokes onOpenClientByName and onOpenDeviceByName for inline content links', () => {
      const onOpenClientByName = vi.fn();
      const onOpenDeviceByName = vi.fn();

      renderThemed(
        <LogsPage
          onOpenClientByName={onOpenClientByName}
          onOpenDeviceByName={onOpenDeviceByName}
        />,
      );

      fireEvent.click(screen.getAllByRole('button', { name: 'Neffos_X20_Pro' })[0]);
      expect(onOpenClientByName).toHaveBeenCalledWith('Neffos_X20_Pro');

      fireEvent.click(screen.getAllByRole('button', { name: 'StorageRoom_Eap_3' })[0]);
      expect(onOpenDeviceByName).toHaveBeenCalledWith('StorageRoom_Eap_3');

      fireEvent.click(screen.getAllByRole('button', { name: 'COOOffice_Eap_1' })[0]);
      expect(onOpenDeviceByName).toHaveBeenCalledWith('COOOffice_Eap_1');
    });

    it('filters by module and type, deletes events, switches to Alerts & Audit Logs, and opens Log Settings', async () => {
      renderThemed(<LogsPage />);

      // Filter by System (0) -> empty state, then back to Client (10)
      fireEvent.click(screen.getByRole('tab', { name: 'System (0)' }));
      expect(screen.getByText('No matching event logs')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('tab', { name: 'Client (10)' }));
      expect(screen.getByText('Showing 1-10 of 10 records')).toBeInTheDocument();

      // Delete first event
      fireEvent.click(screen.getByRole('button', { name: 'Delete event evt-1' }));
      expect(screen.getByRole('tab', { name: 'All (9)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Client (9)' })).toBeInTheDocument();
      expect(screen.getByText('Showing 1-9 of 9 records')).toBeInTheDocument();

      // Switch to Alerts tab (Unresolved (0) / Resolved (6))
      fireEvent.click(screen.getByRole('tab', { name: 'Alerts' }));
      expect(screen.getByRole('tab', { name: 'Unresolved (0)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Resolved (6)' })).toBeInTheDocument();
      expect(screen.getByText('PoE Power Budget Alert')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Unresolved (0)' }));
      expect(screen.getByText('No unresolved alerts')).toBeInTheDocument();

      // Switch to Audit Logs tab
      fireEvent.click(screen.getByRole('tab', { name: 'Audit Logs' }));
      expect(screen.getByText('Edit IntelliRecover Policy')).toBeInTheDocument();

      // Open Setting modal
      fireEvent.click(screen.getByRole('button', { name: 'Setting' }));
      await waitFor(() => {
        expect(screen.getByText('Log Settings')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(screen.queryByText('Log Settings')).not.toBeInTheDocument();
      });
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<LogsPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('Sep 18, 2025 03:16:43 pm')).toBeInTheDocument();
    });
  });

  describe('IntelliRecoverPage', () => {
    it('renders hero banner, switch OFF by default, 3 exact PoE AP rows, and zero console errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<IntelliRecoverPage />);

      expect(screen.getByRole('heading', { name: 'IntelliRecover' })).toBeInTheDocument();
      const toggle = screen.getByRole('switch', { name: 'Toggle IntelliRecover' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      expect(
        screen.getByText(
          'Monitors the status of PoE devices, automatically repairing abnormal devices.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Auto reboots devices through PoE power cycling after they go offline for 8 minutes, retrying up to 10 times at 15 minutes intervals\./,
        ),
      ).toBeInTheDocument();

      // Segmented tabs + search + Add
      expect(screen.getByRole('tab', { name: 'Devices' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Clients' })).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Search Device Name, IP or MAC'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

      // All 3 exact rows
      expect(screen.getByText('StorageRoom_Eap_3')).toBeInTheDocument();
      expect(screen.getByText('EAP620 HD(US) v3.0')).toBeInTheDocument();
      expect(screen.getByText('00-FF-00-2B-0E-BC')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.103')).toBeInTheDocument();
      expect(screen.getByText('SalesDepartment_Switch_3 - Port 4')).toBeInTheDocument();

      expect(screen.getByText('BreakRoom_Eap_2')).toBeInTheDocument();
      expect(screen.getByText('EAP668-Outdoor HD(EU) v1.0')).toBeInTheDocument();
      expect(screen.getByText('00-FF-00-38-95-10')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.104')).toBeInTheDocument();
      expect(screen.getByText('Recovering')).toBeInTheDocument();
      expect(screen.getByText('SalesDepartment_Switch_3 - Port 3')).toBeInTheDocument();

      expect(screen.getByText('COOOffice_Eap_1')).toBeInTheDocument();
      expect(screen.getByText('EAP773(EU) v1.0')).toBeInTheDocument();
      expect(screen.getByText('A8-29-48-D0-7B-10')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.105')).toBeInTheDocument();
      expect(screen.getAllByText('Monitoring')).toHaveLength(2);
      expect(screen.getByText('SalesDepartment_Switch_3 - Port 2')).toBeInTheDocument();

      expect(container.querySelector('.omada-recover-table')).toBeInTheDocument();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('toggles switch, edits PoE recovery policy modal, and supports search & + Add', async () => {
      renderThemed(<IntelliRecoverPage />);

      // Toggle switch ON
      const toggle = screen.getByRole('switch', { name: 'Toggle IntelliRecover' });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Open Policy Edit modal
      fireEvent.click(
        screen.getByRole('button', { name: 'Edit IntelliRecover policy' }),
      );
      await waitFor(() => {
        expect(screen.getByText('Edit IntelliRecover Policy')).toBeInTheDocument();
      });

      const offlineInput = screen.getByLabelText('Offline Duration (min)');
      fireEvent.change(offlineInput, { target: { value: '12' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(
          screen.getByText(
            /after they go offline for 12 minutes, retrying up to 10 times at 15 minutes intervals\./,
          ),
        ).toBeInTheDocument();
      });

      // Live search
      const searchInput = screen.getByRole('textbox', {
        name: 'Search IntelliRecover targets',
      });
      fireEvent.change(searchInput, { target: { value: 'BreakRoom' } });
      expect(screen.getByText('BreakRoom_Eap_2')).toBeInTheDocument();
      expect(screen.queryByText('StorageRoom_Eap_3')).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('StorageRoom_Eap_3')).toBeInTheDocument();

      // Add modal
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
      await waitFor(() => {
        expect(screen.getByText('Add PoE Device')).toBeInTheDocument();
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Add' }));
      await waitFor(() => {
        expect(screen.getByText('Lobby_Eap_4')).toBeInTheDocument();
      });
    });

    it('invokes onOpenDeviceByName for row/uplink clicks while stopping propagation on action buttons', async () => {
      const onOpenDeviceByName = vi.fn();
      renderThemed(
        <IntelliRecoverPage onOpenDeviceByName={onOpenDeviceByName} />,
      );

      // Action buttons stop propagation
      fireEvent.click(
        screen.getByRole('button', {
          name: 'View recovery logs for StorageRoom_Eap_3',
        }),
      );
      expect(onOpenDeviceByName).not.toHaveBeenCalled();

      const logsDialog = await waitFor(() => screen.getByRole('dialog'));
      expect(
        within(logsDialog).getByText('Recovery Logs · StorageRoom_Eap_3'),
      ).toBeInTheDocument();
      const closeButtons = within(logsDialog).getAllByRole('button', {
        name: 'Close',
      });
      fireEvent.click(closeButtons[closeButtons.length - 1]);

      // Manual power cycle stops propagation and increments recovery count
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Manual power cycle COOOffice_Eap_1',
        }),
      );
      expect(onOpenDeviceByName).not.toHaveBeenCalled();

      // Clicking Uplink calls onOpenDeviceByName with switch name
      fireEvent.click(
        screen.getByRole('button', { name: 'SalesDepartment_Switch_3 - Port 4' }),
      );
      expect(onOpenDeviceByName).toHaveBeenCalledWith('SalesDepartment_Switch_3');

      // Clicking row calls onOpenDeviceByName with AP name
      fireEvent.click(screen.getByText('BreakRoom_Eap_2'));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('BreakRoom_Eap_2');

      // Removing a device stops propagation
      onOpenDeviceByName.mockClear();
      fireEvent.click(
        screen.getByRole('button', { name: 'Remove COOOffice_Eap_1' }),
      );
      expect(onOpenDeviceByName).not.toHaveBeenCalled();
      expect(screen.queryByText('COOOffice_Eap_1')).not.toBeInTheDocument();
    });

    it('renders cleanly in dark mode', () => {
      renderThemed(<IntelliRecoverPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('StorageRoom_Eap_3')).toBeInTheDocument();
    });
  });
});
