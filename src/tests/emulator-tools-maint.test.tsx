import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OmadaProvider } from '@/omada';
import { STerminalConsole } from '../omada/components/STerminalConsole';
import { NetworkToolsPage } from '../demos/emulator/maintenance/NetworkToolsPage';
import { MaintenancePage } from '../demos/emulator/maintenance/MaintenancePage';
import {
  SAMPLE_RESTORE_FILENAME,
  TOOL_SOURCE_DEVICES,
} from '../demos/emulator/maintenance/toolsMaintData';
import '../styles/modules/emulator-tools-maint.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-tools-maint module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('STerminalConsole', () => {
    it('renders empty state, switches active device pills, filters search, cycles font size, and submits CLI commands', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = renderThemed(
        <STerminalConsole
          title="Sessions"
          searchPlaceholder="Search Sessions"
          emptyText="Please run a terminal first"
          sessions={[]}
        />,
      );

      expect(screen.getByText('Sessions')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search Sessions')).toBeInTheDocument();
      expect(screen.getByText('Device List')).toBeInTheDocument();
      expect(screen.getByText('Please run a terminal first')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear output' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Download output' })).toBeDisabled();

      const onSubmitCommand = vi.fn();
      const onClear = vi.fn();
      const onCloseSession = vi.fn();

      rerender(
        <OmadaProvider>
          <STerminalConsole
            title="Sessions"
            searchPlaceholder="Search Sessions"
            emptyText="Please run a terminal first"
            interactive
            onSubmitCommand={onSubmitCommand}
            onClear={onClear}
            onCloseSession={onCloseSession}
            sessions={[
              {
                key: 'ap-1',
                deviceName: 'COOOffice_Eap_1',
                subtitle: '192.168.0.121',
                status: 'active',
                lines: ['Connected to COOOffice_Eap_1', '64 bytes from 8.8.8.8'],
              },
              {
                key: 'sw-1',
                deviceName: 'SalesDepartment_Switch_3',
                subtitle: '192.168.0.102',
                status: 'completed',
                lines: ['Switch port summary ready'],
              },
            ]}
          />
        </OmadaProvider>,
      );

      expect(screen.getByText('Connected to COOOffice_Eap_1')).toBeInTheDocument();

      // Switch to second device in Device List
      fireEvent.click(screen.getByRole('button', { name: 'SalesDepartment_Switch_3' }));
      expect(screen.getByText('Switch port summary ready')).toBeInTheDocument();

      // Submit interactive CLI command
      const cliInput = screen.getByLabelText('Terminal command input');
      fireEvent.change(cliInput, { target: { value: 'show version' } });
      fireEvent.submit(cliInput.closest('form')!);
      expect(onSubmitCommand).toHaveBeenCalledWith('sw-1', 'show version');

      // Font size toggle cycles 13 -> 15 -> 17
      const outputArea = screen
        .getByText('Switch port summary ready')
        .closest('.omada-terminal-output') as HTMLElement;
      expect(outputArea.style.fontSize).toBe('13px');
      fireEvent.click(screen.getByRole('button', { name: 'Toggle terminal font size' }));
      expect(outputArea.style.fontSize).toBe('15px');

      // Search filters Device List
      fireEvent.change(screen.getByPlaceholderText('Search Sessions'), {
        target: { value: 'COOOffice' },
      });
      expect(screen.getByRole('button', { name: 'COOOffice_Eap_1' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'SalesDepartment_Switch_3' }),
      ).not.toBeInTheDocument();

      // Clear & Close handlers
      fireEvent.click(screen.getByRole('button', { name: 'Close session COOOffice_Eap_1' }));
      expect(onCloseSession).toHaveBeenCalledWith('ap-1');
      fireEvent.click(screen.getByRole('button', { name: 'Clear output' }));
      expect(onClear).toHaveBeenCalledTimes(1);

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });
  });

  describe('NetworkToolsPage', () => {
    it('renders all 6 tabs, Network Check defaults, info banner, and appends Ping output on Run', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderThemed(<NetworkToolsPage />);

      // Top underline tabs
      expect(screen.getByRole('tab', { name: 'Network Check' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Packet Capture' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Terminal' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Cable Test' })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Interference Detection' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Remote Access/i })).toBeInTheDocument();
      expect(screen.getByText('BETA')).toBeInTheDocument();

      // Default form controls
      expect(screen.getByLabelText('Packet Size')).toHaveValue('32');
      expect(screen.getByLabelText('Count')).toHaveValue('4');
      expect(
        screen.getByText(
          'Devices which are already running commands shall not execute newly added commands. Output history of device with buffer space issues shall be automatically cleared.',
        ),
      ).toBeInTheDocument();

      // Enter destination IP & click Run -> Ping output appears in Device Output console
      fireEvent.change(screen.getByLabelText('Domain/IP Address'), {
        target: { value: '1.1.1.1' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Run' }));

      expect(
        screen.getByRole('button', { name: TOOL_SOURCE_DEVICES[0]!.name }),
      ).toBeInTheDocument();
      expect(screen.getByText(/ping -s 32 -c 4 1\.1\.1\.1/i)).toBeInTheDocument();
      expect(
        screen.getByText(/4 packets transmitted, 4 packets received, 0\.0% packet loss/),
      ).toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('opens interactive CLI terminal session on Terminal tab and switches secondary tool tabs', () => {
      renderThemed(<NetworkToolsPage />);

      fireEvent.click(screen.getByRole('tab', { name: 'Terminal' }));
      expect(screen.getByText('Remote Control Terminal Session')).toBeInTheDocument();
      expect(screen.getByText('Please run a terminal first')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Open Terminal' }));
      expect(
        screen.queryByText('Please run a terminal first'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/Establishing secure Omada remote control session/),
      ).toBeInTheDocument();

      const cliInput = screen.getByLabelText('Terminal command input');
      fireEvent.change(cliInput, { target: { value: 'show version' } });
      fireEvent.submit(cliInput.closest('form')!);
      expect(screen.getByText(/Omada v6\.3\.0\.34/)).toBeInTheDocument();

      fireEvent.change(cliInput, { target: { value: 'help' } });
      fireEvent.submit(cliInput.closest('form')!);
      expect(screen.getByText(/Supported commands:/)).toBeInTheDocument();

      // Check remaining 4 functional tabs render cleanly
      fireEvent.click(screen.getByRole('tab', { name: 'Packet Capture' }));
      expect(screen.getByRole('button', { name: /Start Capture/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Cable Test' }));
      expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Interference Detection' }));
      expect(screen.getByRole('button', { name: 'Start Scan' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: /Remote Access/i }));
      expect(
        screen.getByRole('button', { name: 'Generate Tunnel URL' }),
      ).toBeInTheDocument();
    });

    it('renders NetworkToolsPage cleanly in dark mode', () => {
      renderThemed(<NetworkToolsPage initialTab="terminal" />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('Please run a terminal first')).toBeInTheDocument();
    });
  });

  describe('MaintenancePage', () => {
    it('renders Site Restore & Site Backup controls, keeps Restore disabled until Browse picks sample cfg, and opens Help modal', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderThemed(<MaintenancePage />);

      expect(screen.getByRole('heading', { name: 'Maintenance' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Site Restore' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Site Backup' })).toBeInTheDocument();

      // Radios & checkboxes defaults
      expect(screen.getByLabelText('Import from Local File')).toBeChecked();
      expect(screen.getByLabelText('Enable')).toBeChecked();
      expect(screen.getByLabelText('Settings')).toBeChecked();
      expect(screen.getByLabelText('Authenticated Clients')).toBeChecked();
      expect(screen.getByLabelText('Firmware Update Logs')).toBeChecked();
      expect(screen.getByLabelText('Export to Local File')).toBeChecked();

      // Restore initially disabled with placeholder
      const fileInput = screen.getByPlaceholderText('Please select a file.');
      expect(fileInput).toHaveAttribute('readonly');
      const restoreBtn = screen.getByRole('button', { name: 'Restore' });
      expect(restoreBtn).toBeDisabled();

      // Clicking Browse picks headquarters_main_office_v6.3.cfg and enables Restore
      fireEvent.click(screen.getByRole('button', { name: 'Browse' }));
      expect(fileInput).toHaveValue(SAMPLE_RESTORE_FILENAME);
      expect(restoreBtn).toBeEnabled();

      // Trigger Restore & Export actions
      fireEvent.click(restoreBtn);
      await waitFor(() => {
        expect(screen.getByText('Site Restore Initiated')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() => {
        expect(screen.getByText('Site Backup Exported')).toBeInTheDocument();
      });

      // Switch to Import from File Server
      fireEvent.click(screen.getByLabelText('Import from File Server'));
      expect(screen.getByLabelText('File Server URL')).toBeInTheDocument();

      // Open & close Help modal
      fireEvent.click(screen.getByRole('button', { name: 'Maintenance help' }));
      await waitFor(() => {
        expect(screen.getByText('Site Maintenance Guide')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Got It' }));
      await waitFor(() => {
        expect(screen.queryByText('Site Maintenance Guide')).not.toBeInTheDocument();
      });

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('renders MaintenancePage cleanly in dark mode', () => {
      renderThemed(<MaintenancePage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
    });
  });
});
