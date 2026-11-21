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
import * as echarts from 'echarts';
import { OmadaProvider } from '@/omada';
import '../styles/modules/emulator-shell.css';
import '../styles/modules/emulator-hotspot.css';
import {
  HotspotPortalApp,
  parseHotspotRoute,
} from '../demos/emulator/hotspot/HotspotPortalApp';
import { INITIAL_VOUCHER_GROUPS } from '../demos/emulator/hotspot/hotspotData';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-hotspot module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('parseHotspotRoute', () => {
    it('maps hotspot routes and hashes cleanly', () => {
      expect(parseHotspotRoute(undefined)).toBe('dashboard');
      expect(parseHotspotRoute('#/hotspot')).toBe('dashboard');
      expect(parseHotspotRoute('#/hotspot/dashboard')).toBe('dashboard');
      expect(parseHotspotRoute('#/hotspot/vouchers')).toBe('voucher-groups');
      expect(parseHotspotRoute('#/hotspot/voucher-groups')).toBe('voucher-groups');
      expect(parseHotspotRoute('#/hotspot/statistics')).toBe('statistics');
      expect(parseHotspotRoute('#/hotspot/authorized-clients')).toBe('authorized-clients');
      expect(parseHotspotRoute('#/hotspot/local-users')).toBe('local-users');
      expect(parseHotspotRoute('#/hotspot/form-auth')).toBe('form-auth');
      expect(parseHotspotRoute('#/hotspot/operators')).toBe('operators');
    });
  });

  describe('HotspotPortalApp chrome & Dashboard', () => {
    it('renders dedicated topbar, 6-item sidebar, and Dashboard charts in light & dark mode with 0 warnings', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onBackToController = vi.fn();

      const { container } = renderThemed(
        <HotspotPortalApp onBackToController={onBackToController} />,
        'light',
      );

      // Topbar chrome
      const backBtn = screen.getByTestId('hotspot-back-to-controller');
      expect(backBtn).toHaveTextContent('Headquarters Building Hotspot Management');
      expect(screen.getByLabelText('Omada by TP-Link')).toBeInTheDocument();
      expect(screen.getByTestId('hotspot-refresh-btn')).toBeInTheDocument();
      expect(screen.getByTestId('hotspot-theme-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('hotspot-avatar-btn')).toBeInTheDocument();

      fireEvent.click(backBtn);
      expect(onBackToController).toHaveBeenCalledTimes(1);

      // Sidebar chrome
      const sidebar = screen.getByTestId('hotspot-sidebar');
      expect(within(sidebar).getByText('Main Office Floor')).toBeInTheDocument();
      expect(within(sidebar).getByText('Dashboard')).toBeInTheDocument();
      expect(within(sidebar).getByText('Authorized Clients')).toBeInTheDocument();
      expect(within(sidebar).getByText('Vouchers')).toBeInTheDocument();
      expect(within(sidebar).getByText('Local Users')).toBeInTheDocument();
      expect(within(sidebar).getByText('Form Auth Data')).toBeInTheDocument();
      expect(within(sidebar).getByText('Operators')).toBeInTheDocument();

      // Dashboard View 1
      expect(screen.getByTestId('hotspot-dashboard-date-pill')).toHaveTextContent(
        /Nov 15, 2026\s+-\s+Nov 22, 2026/,
      );
      expect(screen.getByText('Portal Authorizations Histories')).toBeInTheDocument();
      expect(screen.getByText('Authentication Type')).toBeInTheDocument();
      expect(screen.getByText('Hotspot Type')).toBeInTheDocument();
      expect(screen.getByTestId('hotspot-total-count')).toHaveTextContent('40');
      const hotspotTypeCard = screen.getByTestId('hotspot-type-card');
      expect(within(hotspotTypeCard).getByText('Total Hotspot')).toBeInTheDocument();
      expect(within(hotspotTypeCard).getByText('Voucher')).toBeInTheDocument();
      expect(within(hotspotTypeCard).getByText('40 (100%)')).toBeInTheDocument();

      // 3 ECharts initialized
      const charts = container.querySelectorAll('div[_echarts_instance_]');
      expect(charts).toHaveLength(3);
      for (const el of Array.from(charts)) {
        expect(echarts.getInstanceByDom(el as HTMLElement)).toBeDefined();
      }

      // Dark mode sanity
      cleanup();
      renderThemed(<HotspotPortalApp />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByTestId('hotspot-portal-app')).toHaveAttribute(
        'data-theme',
        'dark',
      );
      expect(screen.getByText('Portal Authorizations Histories')).toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });
  });

  describe('Vouchers -> Voucher Groups & Statistics', () => {
    it('renders all 4 Voucher Groups, toggles selection batch actions, searches, inspects, and creates a group', async () => {
      renderThemed(<HotspotPortalApp initialRoute="voucher-groups" />, 'light');

      expect(screen.getByTestId('hotspot-view-voucher-groups')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search Name or Voucher Code')).toBeInTheDocument();
      expect(screen.getByText('Printing Language')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Currency')).toBeInTheDocument();
      expect(screen.getByText('AUD')).toBeInTheDocument();

      // All 4 exact rows
      expect(screen.getByText('VoucherGroup_1')).toBeInTheDocument();
      expect(screen.getByText('Oct 18, 2021 07:54:28 pm')).toBeInTheDocument();
      expect(screen.getByText('VoucherGroup_2')).toBeInTheDocument();
      expect(screen.getByText('Jan 13, 2022 03:02:25 pm')).toBeInTheDocument();
      expect(screen.getByText('VoucherGroup_3')).toBeInTheDocument();
      expect(screen.getByText('Aug 16, 2023 07:09:27 pm')).toBeInTheDocument();
      expect(screen.getByText('VoucherGroup_4')).toBeInTheDocument();
      expect(screen.getByText('Aug 16, 2023 07:09:32 pm')).toBeInTheDocument();

      expect(screen.getAllByText('Client - 8h - By Time')).toHaveLength(2);
      expect(screen.getAllByText('Voucher - 8h - By Time')).toHaveLength(2);

      // Batch buttons disabled initially
      const printBatchBtn = screen.getByRole('button', {
        name: /Print Selected Unused Vouchers/i,
      });
      const clearBatchBtn = screen.getByRole('button', {
        name: /Clear Selected Expired Vouchers/i,
      });
      const deleteBatchBtn = screen.getByRole('button', { name: /^Delete$/i });

      expect(printBatchBtn).toBeDisabled();
      expect(clearBatchBtn).toBeDisabled();
      expect(deleteBatchBtn).toBeDisabled();
      expect(screen.getByTestId('voucher-selection-summary')).toHaveTextContent(
        'Select 0 of 4 items',
      );
      expect(screen.getByText('Showing 1-4 of 4 records')).toBeInTheDocument();

      // Select All enables batch actions
      fireEvent.click(screen.getByRole('button', { name: 'Select All' }));
      expect(screen.getByTestId('voucher-selection-summary')).toHaveTextContent(
        'Select 4 of 4 items',
      );
      expect(printBatchBtn).toBeEnabled();
      expect(clearBatchBtn).toBeEnabled();
      expect(deleteBatchBtn).toBeEnabled();

      // Deselect All restores disabled state
      fireEvent.click(screen.getByRole('button', { name: 'Deselect All' }));
      expect(printBatchBtn).toBeDisabled();

      // Open Details modal for VoucherGroup_2
      fireEvent.click(screen.getByRole('button', { name: 'Details VoucherGroup_2' }));
      await waitFor(() => {
        expect(screen.getByText('VoucherGroup_2 — Voucher Codes')).toBeInTheDocument();
      });
      const codeFromGroup2 = INITIAL_VOUCHER_GROUPS[1].vouchers[0].code;
      expect(screen.getByText(codeFromGroup2)).toBeInTheDocument();
      const detailsDialog = screen.getByRole('dialog');
      fireEvent.click(within(detailsDialog).getByText('Close').closest('button')!);

      // Clear expired vouchers on VoucherGroup_2 (1 expired -> updates to 0 / 9)
      fireEvent.click(screen.getByRole('button', { name: 'Clear expired VoucherGroup_2' }));
      await waitFor(() => {
        expect(screen.getByText('Expired Vouchers Cleared')).toBeInTheDocument();
      });

      // Print preview modal for VoucherGroup_1
      fireEvent.click(screen.getByRole('button', { name: 'Print VoucherGroup_1' }));
      await waitFor(() => {
        expect(screen.getByText('Print Unused Vouchers — VoucherGroup_1')).toBeInTheDocument();
      });
      const printDialog = screen.getByRole('dialog');
      fireEvent.click(within(printDialog).getByRole('button', { name: 'Cancel' }));

      // Create Vouchers Group modal
      fireEvent.click(
        screen.getByRole('button', { name: /Create Vouchers Group/i }),
      );
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(screen.getByText('VoucherGroup_5')).toBeInTheDocument();
      });
      expect(screen.getByText('Showing 1-5 of 5 records')).toBeInTheDocument();

      // Search by unused voucher code filters down to VoucherGroup_2
      const unusedCodeFromGroup2 = INITIAL_VOUCHER_GROUPS[1].vouchers[1].code;
      const searchInput = screen.getByPlaceholderText('Search Name or Voucher Code');
      fireEvent.change(searchInput, { target: { value: unusedCodeFromGroup2 } });
      expect(screen.getByText('VoucherGroup_2')).toBeInTheDocument();
      expect(screen.queryByText('VoucherGroup_1')).not.toBeInTheDocument();
    });

    it('renders Vouchers -> Statistics with USD 95 / USD 39 / USD 16 and interactive views', () => {
      renderThemed(<HotspotPortalApp initialRoute="dashboard" />, 'light');

      // Expand Vouchers and navigate to Statistics
      fireEvent.click(screen.getByTestId('hotspot-nav-vouchers'));
      fireEvent.click(screen.getByTestId('hotspot-nav-statistics'));

      expect(screen.getByTestId('hotspot-view-statistics')).toBeInTheDocument();
      expect(screen.getByText('USD 95')).toBeInTheDocument();
      expect(screen.getByText('USD 39')).toBeInTheDocument();
      expect(screen.getByText('USD 16')).toBeInTheDocument();
    });
  });

  describe('Authorized Clients, Local Users, Form Auth Data, and Operators', () => {
    it('navigates cleanly across all remaining Hotspot views with authentic rows', async () => {
      renderThemed(<HotspotPortalApp initialRoute="dashboard" />, 'light');

      // Authorized Clients
      fireEvent.click(screen.getByTestId('hotspot-nav-authorized-clients'));
      expect(screen.getByTestId('hotspot-view-authorized-clients')).toBeInTheDocument();
      expect(screen.getByText('Visitor-iPhone-15')).toBeInTheDocument();
      expect(screen.getByText('Contractor-MacBook')).toBeInTheDocument();

      // Local Users
      fireEvent.click(screen.getByTestId('hotspot-nav-local-users'));
      expect(screen.getByTestId('hotspot-view-local-users')).toBeInTheDocument();
      expect(screen.getByText('guest_vip')).toBeInTheDocument();
      expect(screen.getByText('contractor_01')).toBeInTheDocument();

      // Form Auth Data
      fireEvent.click(screen.getByTestId('hotspot-nav-form-auth'));
      expect(screen.getByTestId('hotspot-view-form-auth')).toBeInTheDocument();
      expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
      expect(screen.getByText('Northwind Partners')).toBeInTheDocument();

      // Operators
      fireEvent.click(screen.getByTestId('hotspot-nav-operators'));
      expect(screen.getByTestId('hotspot-view-operators')).toBeInTheDocument();
      expect(screen.getByText('hotspot_admin')).toBeInTheDocument();
      expect(screen.getByText('frontdesk_op')).toBeInTheDocument();
    });
  });
});
