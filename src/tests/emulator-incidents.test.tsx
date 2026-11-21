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
  DEFAULT_INCIDENT_CATEGORY_ITEMS,
  SCategoryKpiCarousel,
} from '../omada/components/SCategoryKpiCarousel';
import { EMULATOR_INCIDENTS } from '../demos/emulator/incidents/incidentsData';
import { IncidentsPage } from '../demos/emulator/incidents/IncidentsPage';
import { IncidentDetailDrawer } from '../demos/emulator/incidents/IncidentDetailDrawer';
import '../styles/modules/emulator-incidents.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-incidents module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('EMULATOR_INCIDENTS data', () => {
    it('exports the 2 exact wireless interference and noise floor incident records', () => {
      expect(EMULATOR_INCIDENTS).toHaveLength(2);

      expect(EMULATOR_INCIDENTS[0]).toMatchObject({
        title: '00-FF-00-38-95-10 wireless interference rate high',
        severity: 'warning',
        severityLabel: 'Warning',
        status: 'Ongoing',
        lastOccurred: 'Jul 09, 2026 04:46:37 pm',
        firstOccurred: 'Jul 09, 2026 04:46:37 pm',
        affectedDeviceMac: '00-FF-00-38-95-10',
        affectedDeviceName: 'BreakRoom_Eap_2',
        affectedClients: 0,
        occurrencesCount: 1,
      });

      expect(EMULATOR_INCIDENTS[1]).toMatchObject({
        title: 'Noise floor high on device 00-FF-00-38-95-10',
        severity: 'info',
        severityLabel: 'Info',
        status: 'Ongoing',
        lastOccurred: 'Jul 09, 2026 04:13:17 pm',
        firstOccurred: 'Jul 09, 2026 04:13:17 pm',
        affectedDeviceMac: '00-FF-00-38-95-10',
        affectedDeviceName: 'BreakRoom_Eap_2',
        affectedClients: 0,
        occurrencesCount: 2,
      });
    });
  });

  describe('SCategoryKpiCarousel', () => {
    it('renders all 10 categories, supports selection and horizontal scroll arrows', () => {
      const onSelect = vi.fn();
      const { container } = renderThemed(
        <SCategoryKpiCarousel
          items={DEFAULT_INCIDENT_CATEGORY_ITEMS}
          onSelect={onSelect}
        />,
      );

      for (const item of DEFAULT_INCIDENT_CATEGORY_ITEMS) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }

      const overviewTab = screen.getByRole('tab', { name: /Overview/ });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');

      const wirelessTab = screen.getByRole('tab', { name: /Wireless Network/ });
      fireEvent.click(wirelessTab);
      expect(onSelect).toHaveBeenCalledWith('wireless-network');
      expect(wirelessTab).toHaveAttribute('aria-selected', 'true');

      const track = container.querySelector('.omada-kpi-carousel-track') as HTMLElement;
      const scrollBySpy = vi.fn();
      track.scrollBy = scrollBySpy;

      fireEvent.click(screen.getByRole('button', { name: 'Scroll categories right' }));
      fireEvent.click(screen.getByRole('button', { name: 'Scroll categories left' }));
      expect(scrollBySpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('IncidentsPage', () => {
    it('renders tabs, status/time bars, 10 category cards, severity filters, and exact table rows without console warnings/errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderThemed(<IncidentsPage />);

      // Top sub-tabs
      expect(screen.getByRole('tab', { name: 'Incident Analysis' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Notification' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();

      // Status segmented bar
      const statusTablist = screen.getByRole('tablist', {
        name: 'Incident status filter',
      });
      expect(within(statusTablist).getByRole('tab', { name: 'All (2)' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(within(statusTablist).getByRole('tab', { name: 'Ongoing (0)' })).toBeInTheDocument();
      expect(within(statusTablist).getByRole('tab', { name: 'Unresolved (0)' })).toBeInTheDocument();
      expect(within(statusTablist).getByRole('tab', { name: 'Resolved (2)' })).toBeInTheDocument();
      expect(within(statusTablist).getByRole('tab', { name: 'Ignored (0)' })).toBeInTheDocument();

      // Time bar
      expect(screen.getByRole('button', { name: '1D' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: '1W' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: '1M' })).toHaveAttribute('aria-pressed', 'true');

      // Severity filter bar
      const severityTablist = screen.getByRole('tablist', {
        name: 'Incident severity filter',
      });
      expect(within(severityTablist).getByRole('tab', { name: 'All (2)' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(within(severityTablist).getByRole('tab', { name: 'Critical (0)' })).toBeInTheDocument();
      expect(within(severityTablist).getByRole('tab', { name: 'Error (0)' })).toBeInTheDocument();
      expect(within(severityTablist).getByRole('tab', { name: 'Warning (1)' })).toBeInTheDocument();
      expect(within(severityTablist).getByRole('tab', { name: 'Info (1)' })).toBeInTheDocument();

      // Exact column headers
      const headers = screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent?.trim() ?? '');
      expect(headers).toEqual([
        'Incidents',
        'Level',
        'Status',
        'Last Occurred',
        'First Occurred',
        'Root Cause Analysis',
        'Improvement Suggestions',
        'Affected Devices',
        'Affected Clients',
        'Occurrences',
        'Action',
      ]);

      // Exact row contents
      expect(
        screen.getByText('00-FF-00-38-95-10 wireless interference rate high'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Noise floor high on device 00-FF-00-38-95-10'),
      ).toBeInTheDocument();
      expect(screen.getByText('1. Too many devices nearby')).toBeInTheDocument();
      expect(screen.getByText('2. Network interference')).toBeInTheDocument();
      expect(screen.getByText('Network interference')).toBeInTheDocument();
      expect(screen.getAllByText('Jul 09, 2026 04:46:37 pm')).toHaveLength(2);
      expect(screen.getAllByText('Jul 09, 2026 04:13:17 pm')).toHaveLength(2);

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('filters live by category carousel, severity pills, status pills, and search query', () => {
      renderThemed(<IncidentsPage />);

      // Category click: Access (0) -> empty state
      fireEvent.click(screen.getByRole('tab', { name: /Access/ }));
      expect(screen.getByText('No matching incidents')).toBeInTheDocument();

      // Back to Wireless Network (2)
      fireEvent.click(screen.getByRole('tab', { name: /Wireless Network/ }));
      expect(
        screen.getByText('00-FF-00-38-95-10 wireless interference rate high'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Noise floor high on device 00-FF-00-38-95-10'),
      ).toBeInTheDocument();

      // Severity filter: Warning (1)
      fireEvent.click(screen.getByRole('tab', { name: 'Warning (1)' }));
      expect(
        screen.getByText('00-FF-00-38-95-10 wireless interference rate high'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Noise floor high on device 00-FF-00-38-95-10'),
      ).not.toBeInTheDocument();

      // Reset severity -> Search by "Noise floor"
      const severityTablist = screen.getByRole('tablist', {
        name: 'Incident severity filter',
      });
      fireEvent.click(within(severityTablist).getByRole('tab', { name: 'All (2)' }));
      fireEvent.change(screen.getByRole('textbox', { name: 'Search incidents' }), {
        target: { value: 'Noise floor' },
      });
      expect(
        screen.getByText('Noise floor high on device 00-FF-00-38-95-10'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('00-FF-00-38-95-10 wireless interference rate high'),
      ).not.toBeInTheDocument();

      // Clear search and check Resolved (2) tab
      fireEvent.change(screen.getByRole('textbox', { name: 'Search incidents' }), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByRole('tab', { name: 'Resolved (2)' }));
      expect(
        screen.getByText('A8-29-48-D0-7B-10 co-channel interference detected'),
      ).toBeInTheDocument();
    });

    it('opens IncidentDetailDrawer on row click while stopping propagation on row actions', () => {
      const onOpenDeviceByName = vi.fn();
      renderThemed(<IncidentsPage onOpenDeviceByName={onOpenDeviceByName} />);

      // Clicking Solve should NOT open drawer, and updates status to Resolved
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Solve 00-FF-00-38-95-10 wireless interference rate high',
        }),
      );
      expect(screen.queryByTestId('incident-detail-drawer')).not.toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Resolved (3)' })).toBeInTheDocument();

      // Clicking Ignore updates status to Ignored
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Ignore Noise floor high on device 00-FF-00-38-95-10',
        }),
      );
      expect(screen.getByText('Ignored')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Ignored (1)' })).toBeInTheDocument();

      // Clicking row opens the 800px IncidentDetailDrawer
      fireEvent.click(
        screen.getByText('00-FF-00-38-95-10 wireless interference rate high'),
      );
      const drawer = screen.getByTestId('incident-detail-drawer');
      expect(drawer).toBeInTheDocument();

      // Clicking BreakRoom_Eap_2 inside drawer invokes onOpenDeviceByName
      fireEvent.click(within(drawer).getByRole('button', { name: 'BreakRoom_Eap_2' }));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('BreakRoom_Eap_2');

      // Delete removes the row and closes drawer
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Delete 00-FF-00-38-95-10 wireless interference rate high',
        }),
      );
      expect(
        screen.queryByText('00-FF-00-38-95-10 wireless interference rate high'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('incident-detail-drawer')).not.toBeInTheDocument();
    });

    it('renders Notification and Settings tabs cleanly and toggles columns', async () => {
      renderThemed(<IncidentsPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');

      // Toggle column visibility
      fireEvent.click(screen.getByRole('button', { name: 'Column settings' }));
      await waitFor(() => {
        expect(screen.getByText('Customize Columns')).toBeInTheDocument();
      });
      const popover = screen.getByText('Customize Columns').closest('.ant-popover-container, .ant-popover-inner') as HTMLElement;
      fireEvent.click(within(popover).getByText('Affected Clients'));
      await waitFor(() => {
        expect(
          screen.queryByRole('columnheader', { name: 'Affected Clients' }),
        ).not.toBeInTheDocument();
      });
      fireEvent.click(within(popover).getByRole('button', { name: 'Reset' }));
      await waitFor(() => {
        expect(
          screen.getByRole('columnheader', { name: 'Affected Clients' }),
        ).toBeInTheDocument();
      });

      // Switch to Notification tab
      fireEvent.click(screen.getByRole('tab', { name: 'Notification' }));
      expect(screen.getByText('Incident Notification Channels')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Test Notification' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      // Switch to Settings tab
      fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
      expect(screen.getByText('Incident Analysis Engine Settings')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });
  });

  describe('IncidentDetailDrawer', () => {
    it('renders telemetry chart, Possible Cause cards, Affected Devices tab, and selection actions', () => {
      const onClose = vi.fn();
      const onSolve = vi.fn();
      const onOpenDeviceByName = vi.fn();

      const { container } = renderThemed(
        <IncidentDetailDrawer
          open
          incident={EMULATOR_INCIDENTS[0]}
          onClose={onClose}
          onSolve={onSolve}
          onOpenDeviceByName={onOpenDeviceByName}
        />,
      );

      expect(screen.getByText('Wireless Network')).toBeInTheDocument();
      expect(
        screen.getByText('Aug 20, 2025 05:10 pm - Sep 19, 2025 05:10 pm'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('00-FF-00-38-95-10 wireless interference rate high'),
      ).toBeInTheDocument();
      expect(screen.getByText('Ongoing')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Within 15 min, on the 2.4G band, the percentage of the interference rate samples exceeding 50% is ≥ %.',
        ),
      ).toBeInTheDocument();

      expect(screen.getByText('Occurrence: 1')).toBeInTheDocument();
      expect(screen.getByText('Jul 09, 2026 04:46 pm')).toBeInTheDocument();
      expect(
        screen.getByText('Wireless Interference Rate (2.4 GHz)'),
      ).toBeInTheDocument();
      expect(screen.getByText('Possible Cause')).toBeInTheDocument();
      expect(screen.getByText('1. Too many devices nearby')).toBeInTheDocument();
      expect(screen.getByText('Improvement Suggestions')).toBeInTheDocument();

      // ECharts rendered an SVG in jsdom
      expect(container.querySelector('svg')).toBeInTheDocument();

      // Solve button disabled until an occurrence is selected
      const solveBtn = screen.getByRole('button', { name: 'Solve' });
      expect(solveBtn).toBeDisabled();

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select all occurrences' }));
      expect(solveBtn).not.toBeDisabled();
      fireEvent.click(solveBtn);
      expect(onSolve).toHaveBeenCalledWith(EMULATOR_INCIDENTS[0]);

      // Switch to Affected Devices tab
      fireEvent.click(screen.getByRole('tab', { name: 'Affected Devices' }));
      expect(screen.getByText('Affected Devices (1)')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'BreakRoom_Eap_2' }));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('BreakRoom_Eap_2');

      // Close drawer
      fireEvent.click(screen.getByRole('button', { name: 'Close incident detail' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
