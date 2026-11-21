import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';
import { OmadaProvider } from '@/omada';
import '../styles/modules/emulator-map.css';
import { STopologyCanvas } from '../omada/components/STopologyCanvas';
import { MapPage } from '../demos/emulator/map/MapPage';
import { TopologyTabView } from '../demos/emulator/dashboard/TopologyTabView';

function renderThemed(ui: React.ReactElement, theme: 'light' | 'dark' = 'light') {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('emulator-map & topology module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('MapPage - Heat Map', () => {
    it('renders Heat Map CAD floorplan, 2-row toolbar, band switcher, and Virtual Device in light & dark mode', () => {
      const { rerender } = renderThemed(<MapPage />, 'light');

      expect(screen.getByTestId('map-page')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Heat Map' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Device Map' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByText('Map_1')).toBeInTheDocument();
      expect(screen.getByTestId('heatmap-opacity-value')).toHaveTextContent('100%');
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByTestId('heatmap-scale-ruler')).toHaveTextContent('39.13m');
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Simulate/i })).toBeInTheDocument();
      expect(screen.getByText('Virtual Device')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Map_1 architectural floorplan/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '2.4 GHz' })).toHaveAttribute('aria-selected', 'true');

      rerender(
        <OmadaProvider defaultThemeMode="dark">
          <MapPage />
        </OmadaProvider>,
      );

      expect(screen.getByTestId('heat-map-panel')).toBeInTheDocument();
      expect(screen.getByText('Virtual Device')).toBeInTheDocument();
    });

    it('toggles Wi-Fi simulation heatmap overlay, switches bands, cycles floorplans, and zooms scale ruler', () => {
      renderThemed(<MapPage />);

      const stage = screen.getByTestId('heatmap-floorplan-stage');
      expect(stage).toHaveAttribute('data-simulated', 'false');
      expect(screen.queryByTestId('heatmap-coverage-overlay')).not.toBeInTheDocument();

      // Toggle Simulate ON
      fireEvent.click(screen.getByTestId('heatmap-simulate-btn'));
      expect(stage).toHaveAttribute('data-simulated', 'true');
      expect(screen.getByTestId('heatmap-coverage-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('heatmap-signal-legend')).toHaveTextContent('2.4 GHz Signal:');

      // Switch frequency band to 5 GHz & 6 GHz
      fireEvent.click(screen.getByRole('tab', { name: '5 GHz' }));
      expect(screen.getByTestId('heatmap-signal-legend')).toHaveTextContent('5 GHz Signal:');
      fireEvent.click(screen.getByRole('tab', { name: '6 GHz' }));
      expect(screen.getByTestId('heatmap-signal-legend')).toHaveTextContent('6 GHz Signal:');

      // Toggle Simulate OFF
      fireEvent.click(screen.getByTestId('heatmap-simulate-btn'));
      expect(screen.queryByTestId('heatmap-coverage-overlay')).not.toBeInTheDocument();

      // Zoom in updates scale ruler readout, Fit resets to 39.13m
      fireEvent.click(screen.getByTestId('heatmap-zoom-in-btn'));
      expect(screen.getByTestId('heatmap-scale-ruler')).toHaveTextContent('34.03m');
      fireEvent.click(screen.getByTestId('heatmap-fit-btn'));
      expect(screen.getByTestId('heatmap-scale-ruler')).toHaveTextContent('39.13m');

      // Carousel next switches to Floor_2
      fireEvent.click(screen.getByRole('button', { name: 'Next floorplan' }));
      expect(screen.getByRole('img', { name: /Floor_2 architectural floorplan/i })).toBeInTheDocument();
      expect(screen.getByTestId('heatmap-scale-ruler')).toHaveTextContent('32.50m');
    });

    it('supports Export notification, Add Floorplan modal, and Ruler measure tool', async () => {
      renderThemed(<MapPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Measure distance' }));
      expect(screen.getByText(/Span: 48\.2m × 24\.6m/)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('heatmap-export-btn'));
      await waitFor(() => {
        expect(screen.getByText('Heat Map Exported')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Add floorplan' }));
      const modal = await screen.findByRole('dialog');
      const input = within(modal).getByPlaceholderText('e.g. Map_2');
      fireEvent.change(input, { target: { value: 'Lab_Floor_4' } });
      fireEvent.click(within(modal).getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(screen.getByRole('img', { name: /Lab_Floor_4 architectural floorplan/i })).toBeInTheDocument();
      });
    });
  });

  describe('MapPage - Device Map', () => {
    it('switches to Device Map, renders West Africa labels, 7 pins + cluster badge 2, and handles clicks', () => {
      const onOpenDeviceByName = vi.fn();
      const { rerender } = renderThemed(
        <MapPage initialTab="device-map" onOpenDeviceByName={onOpenDeviceByName} />,
        'light',
      );

      expect(screen.getByTestId('device-map-panel')).toBeInTheDocument();
      expect(screen.getByText('Mali')).toBeInTheDocument();
      expect(screen.getByText('Burkina Faso')).toBeInTheDocument();
      expect(screen.getByText('Niamey')).toBeInTheDocument();
      expect(screen.getByText('Gao')).toBeInTheDocument();
      expect(screen.getByText('Dori')).toBeInTheDocument();
      expect(screen.getByText('Kaya')).toBeInTheDocument();
      expect(screen.getByText('Dosso')).toBeInTheDocument();
      expect(screen.getByText('Timbuktu')).toBeInTheDocument();

      const expectedPins = [
        'SalesDepartment_Switch_3',
        'MainOffice_Gateway_2',
        'COOOffice_Eap_1',
        'BreakRoom_Eap_2',
        'CTOOffice_Switch_1',
        'DataCenter_Olt_1',
        'StorageRoom_Eap_3',
      ];
      for (const name of expectedPins) {
        expect(screen.getByText(name)).toBeInTheDocument();
      }

      const clusterBtn = screen.getByTestId('device-map-cluster-badge');
      expect(clusterBtn).toHaveTextContent('2');

      fireEvent.click(screen.getByTestId('device-map-pin-mainoffice-gateway-2'));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('MainOffice_Gateway_2');

      fireEvent.click(screen.getByTestId('device-map-pin-salesdepartment-switch-3'));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('SalesDepartment_Switch_3');

      rerender(
        <OmadaProvider defaultThemeMode="dark">
          <MapPage initialTab="device-map" onOpenDeviceByName={onOpenDeviceByName} />
        </OmadaProvider>,
      );
      expect(screen.getByTestId('device-map-panel')).toBeInTheDocument();
    });

    it('filters pins by search, opens cluster & list popovers, opens context menu, and dismisses tip card', async () => {
      const onOpenDeviceByName = vi.fn();
      renderThemed(<MapPage initialTab="device-map" onOpenDeviceByName={onOpenDeviceByName} />);

      const searchInput = screen.getByPlaceholderText('Search Device Name');
      fireEvent.change(searchInput, { target: { value: 'COOOffice' } });

      expect(screen.getByTestId('device-map-pin-coooffice-eap-1')).toHaveAttribute(
        'data-highlighted',
        'true',
      );
      expect(screen.getByTestId('device-map-pin-datacenter-olt-1')).toHaveClass('opacity-25');

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      // Cluster popover
      fireEvent.click(screen.getByTestId('device-map-cluster-badge'));
      const clusterPopover = await screen.findByTestId('device-map-cluster-popover');
      expect(within(clusterPopover).getByText('BreakRoom_Gateway_1')).toBeInTheDocument();
      expect(within(clusterPopover).getByText('ServerRoom_Switch_2')).toBeInTheDocument();

      // List popover
      fireEvent.click(screen.getByTestId('device-map-list-btn'));
      const listPopover = await screen.findByTestId('device-map-list-popover');
      expect(within(listPopover).getByText('Mapped Devices (9)')).toBeInTheDocument();

      // Right-click context menu on a pin
      fireEvent.contextMenu(screen.getByTestId('device-map-pin-breakroom-eap-2'));
      const menu = await screen.findByTestId('device-map-context-menu');
      expect(within(menu).getByText('Edit Location')).toBeInTheDocument();
      expect(within(menu).getByText('Remove from Map')).toBeInTheDocument();

      // Dismiss bottom-right tip card
      expect(screen.getByTestId('device-map-tip-card')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('device-map-tip-close'));
      expect(screen.queryByTestId('device-map-tip-card')).not.toBeInTheDocument();
    });
  });

  describe('STopologyCanvas & TopologyTabView', () => {
    it('renders complete hierarchy, port/speed labels, collapsible hubs, and triggers onOpenDeviceByName', () => {
      const onOpenDeviceByName = vi.fn();
      renderThemed(<STopologyCanvas onOpenDeviceByName={onOpenDeviceByName} />);

      const nodeNames = [
        'Internet',
        'BreakRoom_Gateway_1',
        'MainOffice_Gateway_2',
        'CTOOffice_Switch_1',
        'ServerRoom_Switch_2',
        'SalesDepartment_Switch_3',
        'COOOffice_Eap_1',
        'BreakRoom_Eap_2',
        'StorageRoom_Eap_3',
        'StarLight',
        'Neffos_X20_Pro',
        'DataCenter_Olt_1',
        'Omada Controller',
        'CC-28-AA-75-E6-02',
      ];
      for (const name of nodeNames) {
        expect(screen.getByText(name)).toBeInTheDocument();
      }
      expect(screen.getAllByText('1000FDX').length).toBeGreaterThanOrEqual(6);

      // Clicking a device triggers callback
      fireEvent.click(screen.getByTestId('topo-node-salesdepartment-switch-3'));
      expect(onOpenDeviceByName).toHaveBeenCalledWith('SalesDepartment_Switch_3');

      // Clicking Internet does NOT trigger device drawer callback
      onOpenDeviceByName.mockClear();
      fireEvent.click(screen.getByTestId('topo-node-internet'));
      expect(onOpenDeviceByName).not.toHaveBeenCalled();

      // Collapse StorageRoom_Eap_3 subtree hides StarLight & Neffos_X20_Pro
      const apHub = screen.getByTestId('topo-hub-storageroom-eap-3');
      fireEvent.click(apHub);
      expect(screen.queryByText('StarLight')).not.toBeInTheDocument();
      expect(screen.queryByText('Neffos_X20_Pro')).not.toBeInTheDocument();
      expect(apHub).toHaveTextContent('+2');

      // Re-expand
      fireEvent.click(apHub);
      expect(screen.getByText('StarLight')).toBeInTheDocument();

      // Layout toggle & zoom
      const canvas = screen.getByTestId('topology-canvas');
      expect(canvas).toHaveAttribute('data-layout', 'horizontal');
      fireEvent.click(screen.getByTestId('topo-layout-toggle-btn'));
      expect(canvas).toHaveAttribute('data-layout', 'vertical');

      fireEvent.click(screen.getByTestId('topo-zoom-in-btn'));
      expect(canvas).toHaveAttribute('data-zoom', '1.15');
      fireEvent.click(screen.getByTestId('topo-recenter-btn'));
      expect(canvas).toHaveAttribute('data-zoom', '1');
    });

    it('renders TopologyTabView with ECharts 9 Total donut, Network Filter, 8 Quick Config tiles, and collapse toggle', async () => {
      const onOpenDeviceByName = vi.fn();
      const onNavigate = vi.fn();
      const { container, rerender } = renderThemed(
        <TopologyTabView
          onOpenDeviceByName={onOpenDeviceByName}
          onNavigate={onNavigate}
        />,
        'light',
      );

      expect(screen.getByTestId('dashboard-tab-panel-topology')).toBeInTheDocument();
      expect(screen.getByText('Device Health')).toBeInTheDocument();
      expect(screen.getByTestId('topo-health-total')).toHaveTextContent('9');
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Fair')).toBeInTheDocument();
      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('No Data')).toBeInTheDocument();

      const chartEl = container.querySelector('div[_echarts_instance_]');
      expect(chartEl).not.toBeNull();
      expect(echarts.getInstanceByDom(chartEl as HTMLElement)).toBeDefined();

      expect(screen.getByText('Network Filter')).toBeInTheDocument();
      expect(screen.getByText('All Network')).toBeInTheDocument();
      expect(screen.getByText('All SSID')).toBeInTheDocument();

      const tiles = [
        'Network Wizard',
        'WLAN Optimization',
        'WLAN',
        'Extend Mode',
        'Port Reboot',
        'Port Isolation',
        'IntelliRecover',
        'Add Devices',
      ];
      for (const title of tiles) {
        expect(screen.getByText(title)).toBeInTheDocument();
      }

      // Quick Config navigation
      fireEvent.click(screen.getByTestId('topo-quick-tile-intelli-recover'));
      expect(onNavigate).toHaveBeenCalledWith('intelli-recover');

      // Search filters topology nodes live
      const searchInput = screen.getByPlaceholderText('Search Name, IP, Model or MAC');
      fireEvent.change(searchInput, { target: { value: 'CTOOffice' } });
      expect(screen.getByTestId('topo-node-ctooffice-switch-1')).toHaveClass('is-highlighted');
      expect(screen.getByTestId('topo-node-datacenter-olt-1')).toHaveClass('is-dimmed');

      // Reset clears search & filters
      fireEvent.click(screen.getByTestId('topo-filter-reset-btn'));
      expect(screen.getByTestId('topo-node-datacenter-olt-1')).not.toHaveClass('is-dimmed');

      // Display popover toggles Clients visibility
      fireEvent.click(screen.getByTestId('topo-toolbar-display-btn'));
      const displayPopover = await screen.findByTestId('topology-display-popover');
      fireEvent.click(within(displayPopover).getByLabelText('Connected Clients'));
      expect(screen.queryByText('StarLight')).not.toBeInTheDocument();

      // Collapse and expand left panel
      fireEvent.click(screen.getByTestId('topo-panel-collapse-btn'));
      expect(screen.queryByTestId('topology-left-panel')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('topo-panel-collapse-btn'));
      expect(screen.getByTestId('topology-left-panel')).toBeInTheDocument();

      rerender(
        <OmadaProvider defaultThemeMode="dark">
          <TopologyTabView
            onOpenDeviceByName={onOpenDeviceByName}
            onNavigate={onNavigate}
          />
        </OmadaProvider>,
      );
      expect(screen.getByTestId('dashboard-tab-panel-topology')).toBeInTheDocument();
    });
  });
});
