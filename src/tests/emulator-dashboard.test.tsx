import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';
import { OmadaProvider } from '@/omada';
import '../styles/modules/emulator-dashboard.css';
import { SHealthGauge, SHealthRadar } from '../omada/components/SHealthGauge';
import { SHealthTrendBar } from '../omada/components/SHealthTrendBar';
import { SApDistributionRuler } from '../omada/components/SApDistributionRuler';
import { SChannelUtilization } from '../omada/components/SChannelUtilization';
import { SiteDashboardPage } from '../demos/emulator/dashboard/SiteDashboardPage';
import {
  AP_DISTRIBUTION_CLUSTERS,
  CHANNEL_UTILIZATION_BANDS,
  HEALTH_TREND_BY_RANGE,
} from '../demos/emulator/dashboard/dashboardData';

function renderThemed(ui: React.ReactElement, theme: 'light' | 'dark' = 'light') {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-dashboard module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('SHealthGauge & SHealthRadar', () => {
    it('renders score 90, 0..100 ticks, and 4 radar dimensions in light and dark mode', () => {
      const { rerender } = renderThemed(
        <div>
          <SHealthGauge score={90} />
          <SHealthRadar wifi={86} client={85} wan={0} device={80} />
        </div>,
        'light',
      );

      expect(screen.getByTestId('health-gauge-score')).toHaveTextContent('90');
      expect(screen.getByText('Health Score')).toBeInTheDocument();
      for (const tick of ['0', '25', '50', '75', '100']) {
        expect(screen.getByText(tick)).toBeInTheDocument();
      }
      expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('WAN')).toBeInTheDocument();
      expect(screen.getByText('Device')).toBeInTheDocument();

      rerender(
        <OmadaProvider defaultThemeMode="dark">
          <div>
            <SHealthGauge score={72} />
            <SHealthRadar wifi={70} client={74} wan={60} device={82} />
          </div>
        </OmadaProvider>,
      );

      expect(screen.getByTestId('health-gauge-score')).toHaveTextContent('72');
    });
  });

  describe('SHealthTrendBar', () => {
    it('renders Device, Client, Wi-Fi, and WAN rows with 96 ticks each', () => {
      const { container } = renderThemed(<SHealthTrendBar rows={HEALTH_TREND_BY_RANGE['1D']} />);

      expect(screen.getByText('Device')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('WAN')).toBeInTheDocument();

      const ticks = container.querySelectorAll('span[data-status]');
      expect(ticks).toHaveLength(96 * 4);
      expect(container.querySelectorAll('span[data-status="fair"]').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('span[data-status="poor"]').length).toBeGreaterThan(0);
    });
  });

  describe('SApDistributionRuler & SChannelUtilization', () => {
    it('renders RSSI ticks from -90dBm to -30 and AP cluster count badges', () => {
      renderThemed(<SApDistributionRuler clusters={AP_DISTRIBUTION_CLUSTERS} />);

      expect(screen.getByText('-90dBm')).toBeInTheDocument();
      expect(screen.getByText('-70')).toBeInTheDocument();
      expect(screen.getByText('-30')).toBeInTheDocument();
      expect(screen.getByTestId('ap-cluster-rssi-72')).toHaveTextContent('1');
      expect(screen.getByTestId('ap-cluster-rssi-47')).toHaveTextContent('2');
    });

    it('renders 2.4 GHz, 5 GHz, and 6 GHz bands with expected utilization bars', () => {
      const { container } = renderThemed(
        <SChannelUtilization bands={CHANNEL_UTILIZATION_BANDS} />,
      );

      expect(screen.getByText('2.4 GHz')).toBeInTheDocument();
      expect(screen.getByText('5 GHz')).toBeInTheDocument();
      expect(screen.getByText('6 GHz')).toBeInTheDocument();

      expect(container.querySelector('[data-channel="2g-11"]')).toHaveAttribute(
        'data-utilization',
        '66',
      );
      expect(container.querySelector('[data-channel="5g-149"]')).toHaveAttribute(
        'data-utilization',
        '46',
      );
      expect(container.querySelector('[data-channel="6g-77"]')).toHaveAttribute(
        'data-utilization',
        '0',
      );
    });
  });

  describe('SiteDashboardPage', () => {
    it('renders the full Overview dashboard in light and dark modes with ECharts Activity canvas', () => {
      const { container, rerender } = renderThemed(<SiteDashboardPage />, 'light');

      expect(screen.getByText('Emergency Free Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('MainOffice_Gateway_2')).toBeInTheDocument();
      expect(screen.getByText('192.168.254.100')).toBeInTheDocument();
      expect(screen.getByText('No Pending Alerts.')).toBeInTheDocument();
      expect(screen.getByText('24h Network Health Trend')).toBeInTheDocument();
      expect(screen.getByText('Network Overview')).toBeInTheDocument();
      expect(screen.getByText('Top 5 Clients by Traffic')).toBeInTheDocument();
      expect(screen.getByText('Top 5 Apps by Traffic')).toBeInTheDocument();
      expect(screen.getByText('Test_PC')).toBeInTheDocument();
      expect(screen.getByText('Microsoft 365')).toBeInTheDocument();
      expect(screen.getByText('Internet Activity (2.12 GB)')).toBeInTheDocument();

      const chartEl = container.querySelector('div[_echarts_instance_]');
      expect(chartEl).not.toBeNull();
      const chartInstance = echarts.getInstanceByDom(chartEl as HTMLElement);
      expect(chartInstance).toBeDefined();

      rerender(
        <OmadaProvider defaultThemeMode="dark">
          <SiteDashboardPage />
        </OmadaProvider>,
      );
      expect(screen.getByTestId('site-dashboard-page')).toBeInTheDocument();
      expect(screen.getByText('Channel Utilization')).toBeInTheDocument();
    });

    it('handles gateway device click, WAN port switching, Emergency Wi-Fi switch, and Speed Test', async () => {
      const onOpenDeviceByName = vi.fn();
      const onNavigate = vi.fn();

      renderThemed(
        <SiteDashboardPage onOpenDeviceByName={onOpenDeviceByName} onNavigate={onNavigate} />,
      );

      // Gateway click opens device drawer callback
      fireEvent.click(screen.getByRole('button', { name: 'MainOffice_Gateway_2' }));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('MainOffice_Gateway_2');

      // Switch WAN tab
      fireEvent.click(screen.getByRole('tab', { name: /WAN\/LAN3/ }));
      expect(screen.getByText('192.168.100.2')).toBeInTheDocument();

      // Emergency Free Wi-Fi switch
      const wifiSwitch = screen.getByRole('switch', { name: 'Emergency Free Wi-Fi' });
      expect(wifiSwitch).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(wifiSwitch);
      expect(wifiSwitch).toHaveAttribute('aria-checked', 'true');

      // Speed Test feedback
      fireEvent.click(screen.getByRole('button', { name: /Speed Test$/ }));
      await waitFor(() => {
        expect(screen.getByText('WAN Speed Test Started')).toBeInTheDocument();
      });

      // Network Overview More link
      const moreButtons = screen.getAllByRole('button', { name: /More/ });
      fireEvent.click(moreButtons[0]);
      expect(onNavigate).toHaveBeenCalledWith('devices');
    });

    it('updates trend & activity data across 1D/1W/1M and Activity sub-tabs, and switches top capsule tabs', () => {
      renderThemed(<SiteDashboardPage />);

      // Time range switching
      fireEvent.click(screen.getByRole('button', { name: '1W' }));
      expect(screen.getByText('7d Network Health Trend')).toBeInTheDocument();
      expect(screen.getByText('Internet Activity (14.86 GB)')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '1M' }));
      expect(screen.getByText('30d Network Health Trend')).toBeInTheDocument();
      expect(screen.getByText('Internet Activity (58.42 GB)')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '1D' }));
      expect(screen.getByText('24h Network Health Trend')).toBeInTheDocument();

      // Activity sub-tab switching
      const activityTablist = screen.getByRole('tablist', { name: 'Activity view' });
      fireEvent.click(within(activityTablist).getByRole('tab', { name: 'Wi-Fi' }));
      expect(screen.getByText('Wi-Fi Activity (1.46 GB)')).toBeInTheDocument();

      fireEvent.click(within(activityTablist).getByRole('tab', { name: 'ISP Load' }));
      expect(screen.getByText('ISP Load (18.4% Peak)')).toBeInTheDocument();

      // Top capsule tab switching
      const mainTablist = screen.getByRole('tablist', { name: 'Dashboard sections' });
      fireEvent.click(within(mainTablist).getByRole('tab', { name: 'Topology' }));
      expect(screen.getByTestId('dashboard-tab-panel-topology')).toBeInTheDocument();

      fireEvent.click(within(mainTablist).getByRole('tab', { name: 'Wi-Fi' }));
      expect(screen.getByTestId('dashboard-tab-panel-wifi')).toBeInTheDocument();

      fireEvent.click(within(mainTablist).getByRole('tab', { name: 'Clients' }));
      expect(screen.getByTestId('dashboard-tab-panel-clients')).toBeInTheDocument();

      fireEvent.click(within(mainTablist).getByRole('tab', { name: 'Traffic' }));
      expect(screen.getByTestId('dashboard-tab-panel-traffic')).toBeInTheDocument();

      fireEvent.click(within(mainTablist).getByRole('tab', { name: 'Overview' }));
      expect(screen.getByText('24h Network Health Trend')).toBeInTheDocument();
    });
  });
});
