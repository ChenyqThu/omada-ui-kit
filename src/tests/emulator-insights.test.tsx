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
import { OmadaProvider, hasOmadaIcon } from '@/omada';
import '../styles/modules/emulator-insights.css';
import { SDonutSummaryCard } from '../omada/components/SDonutSummaryCard';
import { ApplicationAnalyticsPage } from '../demos/emulator/insights/ApplicationAnalyticsPage';
import { ReportsPage } from '../demos/emulator/insights/ReportsPage';
import {
  ANALYTICS_APPS,
  ANALYTICS_CATEGORIES,
  ANALYTICS_USERS,
} from '../demos/emulator/insights/insightsData';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-insights module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('insightsData & icon manifest alignment', () => {
    it('defines 20 categories with valid app-category-* icon slugs, 10 apps, and 4 users', () => {
      expect(ANALYTICS_CATEGORIES).toHaveLength(20);
      for (const cat of ANALYTICS_CATEGORIES) {
        expect(hasOmadaIcon(cat.icon)).toBe(true);
      }
      expect(ANALYTICS_APPS).toHaveLength(10);
      expect(ANALYTICS_USERS).toHaveLength(4);
    });
  });

  describe('SDonutSummaryCard', () => {
    it('supports vertical closable breakdown cards and horizontal legend cards in light and dark modes', () => {
      const onClose = vi.fn();
      const onItemClick = vi.fn();

      const { container } = renderThemed(
        <SDonutSummaryCard
          title="App-Stores and OS Updates"
          centerValue="58.33 MB"
          centerLabel="Traffic"
          closable
          onClose={onClose}
          onItemClick={onItemClick}
          data={[
            {
              key: 'windows-store',
              label: 'Windows Store',
              value: 58.3,
              displayValue: '58.30 MB',
              clickable: true,
            },
          ]}
        />,
        'light',
      );

      expect(screen.getByText('App-Stores and OS Updates')).toBeInTheDocument();
      expect(screen.getByText('58.33 MB')).toBeInTheDocument();
      expect(screen.getByText('Traffic')).toBeInTheDocument();
      expect(container.querySelector('div[_echarts_instance_]')).not.toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /58\.30 MB/i }));
      expect(onItemClick).toHaveBeenCalledTimes(1);

      fireEvent.click(
        screen.getByRole('button', { name: 'Remove App-Stores and OS Updates' }),
      );
      expect(onClose).toHaveBeenCalledTimes(1);

      cleanup();
      renderThemed(
        <SDonutSummaryCard
          title="Clients Overview"
          centerValue={4}
          centerLabel="Total"
          layout="horizontal"
          data={[
            { key: '5g', label: '5 GHz Clients', value: 2, displayValue: '2 (50%)' },
            { key: 'wired', label: 'Wired Clients', value: 2, displayValue: '2 (50%)' },
          ]}
        />,
        'dark',
      );

      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('Clients Overview')).toBeInTheDocument();
      expect(screen.getByText('5 GHz Clients')).toBeInTheDocument();
      expect(screen.getAllByText('2 (50%)')).toHaveLength(2);
    });
  });

  describe('ApplicationAnalyticsPage', () => {
    it('renders hero donut 176.14 MB, all 20 category rows, and closable category cards without console errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<ApplicationAnalyticsPage />, 'light');

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Sep 18, 2025 - Sep 19, 2025')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-hero-total')).toHaveTextContent('176.14 MB');

      // All 20 category selectors rendered
      const catGroup = screen.getByRole('group', { name: 'Application categories' });
      expect(within(catGroup).getAllByRole('button')).toHaveLength(20);
      expect(
        within(catGroup).getByText('App-Stores and OS Updates'),
      ).toBeInTheDocument();
      expect(
        within(catGroup).getByText('Development Tools and Services'),
      ).toBeInTheDocument();
      expect(within(catGroup).getByText('Device Security')).toBeInTheDocument();
      expect(within(catGroup).getByText('Web')).toBeInTheDocument();

      // Default Categories sub-tab selected with closable cards
      expect(screen.getByRole('tab', { name: 'Categories' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByTestId('category-card-app-stores')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-dev-tools')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-social')).toBeInTheDocument();

      // ECharts initialized
      const chartEl = container.querySelector('div[_echarts_instance_]');
      expect(chartEl).not.toBeNull();
      expect(echarts.getInstanceByDom(chartEl as HTMLElement)).toBeDefined();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('dynamically updates total & cards when toggling categories, closing cards, and clearing categories', () => {
      renderThemed(<ApplicationAnalyticsPage />);

      // Close App-Stores card (58.33 MB) -> total updates from 176.14 MB to 117.80 MB
      fireEvent.click(
        screen.getByRole('button', { name: 'Remove App-Stores and OS Updates' }),
      );
      expect(screen.queryByTestId('category-card-app-stores')).not.toBeInTheDocument();
      expect(screen.getByTestId('analytics-hero-total')).toHaveTextContent('117.80 MB');

      // Toggle Voice over IP on via selector row
      const catGroup = screen.getByRole('group', { name: 'Application categories' });
      fireEvent.click(
        within(catGroup).getByRole('button', { name: /Voice over IP/i }),
      );
      expect(screen.getByTestId('category-card-voip')).toBeInTheDocument();

      // Clear Categories resets total to 0 KB and shows restore action
      fireEvent.click(screen.getByRole('button', { name: /Clear Categories/i }));
      expect(screen.getByTestId('analytics-hero-total')).toHaveTextContent('0 KB');
      expect(screen.getByText('No categories selected')).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: 'Restore Default Categories' }),
      );
      expect(screen.getByTestId('analytics-hero-total')).toHaveTextContent('176.14 MB');
    });

    it('switches to Apps and Users tabs, renders all 10 apps & 4 users, and supports app block/allow + dark mode', async () => {
      const onOpenClientByName = vi.fn();
      renderThemed(
        <ApplicationAnalyticsPage onOpenClientByName={onOpenClientByName} />,
        'light',
      );

      // Apps tab
      fireEvent.click(screen.getByRole('tab', { name: 'Apps' }));
      expect(screen.getByRole('tab', { name: 'Allow Apps (10)' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'Block Apps (0)' })).toBeInTheDocument();
      for (const app of ANALYTICS_APPS) {
        expect(screen.getByText(app.name)).toBeInTheDocument();
      }

      // Open detail modal & move Windows Store to Block Apps
      fireEvent.click(screen.getByRole('button', { name: 'Inspect Windows Store' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Block App' })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Block App' }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Allow Apps (9)' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Block Apps (1)' })).toBeInTheDocument();
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.click(within(dialog).getByText('Close').closest('button')!);

      // Users tab
      fireEvent.click(screen.getByRole('tab', { name: 'Users' }));
      const usersPanel = screen.getByTestId('analytics-users-panel');
      for (const user of ANALYTICS_USERS) {
        expect(within(usersPanel).getByRole('button', { name: user.name })).toBeInTheDocument();
      }
      fireEvent.click(within(usersPanel).getByRole('button', { name: 'Test_PC' }));
      expect(onOpenClientByName).toHaveBeenCalledWith('Test_PC');

      // Dark mode sanity
      cleanup();
      renderThemed(<ApplicationAnalyticsPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByTestId('application-analytics-page')).toBeInTheDocument();
    });
  });

  describe('ReportsPage', () => {
    it('renders Client & Application by default with KPI card, donut cards, onboarding charts, and 0 console errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = renderThemed(<ReportsPage />, 'light');

      expect(
        screen.getByRole('tab', { name: 'Client & Application' }),
      ).toHaveAttribute('aria-selected', 'true');

      // Row 1 KPIs
      const kpiCard = screen.getByTestId('reports-kpi-card');
      expect(within(kpiCard).getByText('Total Unique Client')).toBeInTheDocument();
      expect(within(kpiCard).getByText('Average of Clients Per Day')).toBeInTheDocument();
      expect(within(kpiCard).getByText('Average of Usage Per Client')).toBeInTheDocument();
      expect(within(kpiCard).getByText('875.77 MB')).toBeInTheDocument();

      // Row 1 Donut Cards
      const overviewCard = screen.getByTestId('reports-clients-overview-card');
      expect(within(overviewCard).getByText('Clients Overview')).toBeInTheDocument();
      expect(within(overviewCard).getByText('2.4 GHz Clients')).toBeInTheDocument();
      expect(within(overviewCard).getByText('5 GHz Clients')).toBeInTheDocument();
      expect(within(overviewCard).getByText('6 GHz Clients')).toBeInTheDocument();
      expect(within(overviewCard).getByText('Wired Clients')).toBeInTheDocument();

      const ssidCard = screen.getByTestId('reports-ssid-distribution-card');
      expect(within(ssidCard).getByText('Clients SSID Distribution')).toBeInTheDocument();
      expect(within(ssidCard).getByText('Employee_Network_4')).toBeInTheDocument();
      expect(within(ssidCard).getByText('5 (63%)')).toBeInTheDocument();
      expect(within(ssidCard).getByText('Employee_Network_5')).toBeInTheDocument();
      expect(within(ssidCard).getByText('3 (37%)')).toBeInTheDocument();
      expect(within(ssidCard).getByText('Guest_Network_2')).toBeInTheDocument();
      expect(within(ssidCard).getByText('Guest_Network_3')).toBeInTheDocument();
      expect(within(ssidCard).getByText('Employee_Network_3')).toBeInTheDocument();
      expect(within(ssidCard).getByText('Others')).toBeInTheDocument();

      // Row 2 & Row 3
      expect(
        screen.getByText('Wireless Clients Onboarding Activities'),
      ).toBeInTheDocument();
      expect(screen.getByText('Clients with Onboarding Time')).toBeInTheDocument();
      expect(screen.getByText('100.00%')).toBeInTheDocument();
      expect(screen.getByText('Time < 10s')).toBeInTheDocument();

      // 5 charts rendered (2 donuts + onboarding activity + ring + onboarding buckets)
      expect(container.querySelectorAll('div[_echarts_instance_]')).toHaveLength(5);

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('updates metrics across 1D/1W/1M, switches Summary/Wired/Wireless tabs, exports, and renders in dark mode', async () => {
      renderThemed(<ReportsPage />, 'light');

      fireEvent.click(screen.getByRole('button', { name: '1W' }));
      expect(screen.getByText('1.42 GB')).toBeInTheDocument();
      expect(screen.getByText('98.40%')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '1M' }));
      expect(screen.getByText('4.86 GB')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      await waitFor(() => {
        expect(screen.getByText('Report Exported')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('tab', { name: 'Summary' }));
      expect(screen.getByTestId('reports-summary-panel')).toBeInTheDocument();
      expect(screen.getByText('Total Site Traffic')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Wired' }));
      expect(screen.getByTestId('reports-wired-panel')).toBeInTheDocument();
      expect(screen.getByText('Active Port Speed Distribution')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Wireless' }));
      expect(screen.getByTestId('reports-wireless-panel')).toBeInTheDocument();
      expect(screen.getByText('Wireless Radio Band Breakdown')).toBeInTheDocument();

      cleanup();
      renderThemed(<ReportsPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
    });
  });
});
