import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import {
  OmadaProvider,
  SCategoryKpiCarousel,
  SClientOverviewStrip,
  SDonutSummaryCard,
  STopologyCanvas,
} from '@/omada';
import { EmulatorApp } from '../demos/emulator/EmulatorApp';

describe('EmulatorApp & App hash routing integration', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('exports Batch 2 emulator-v6 components from @/omada', () => {
    expect(SClientOverviewStrip).toBeDefined();
    expect(STopologyCanvas).toBeDefined();
    expect(SDonutSummaryCard).toBeDefined();
    expect(SCategoryKpiCarousel).toBeDefined();
  });

  it('renders EmulatorApp on #/dashboard by default and switches to #/showcase and back', async () => {
    render(<App />);

    expect(screen.getByTestId('site-dashboard-page')).toBeInTheDocument();
    expect(screen.getByText('Headquarters Building')).toBeInTheDocument();

    window.location.hash = '#/showcase';
    fireEvent(window, new HashChangeEvent('hashchange'));

    expect(await screen.findByTestId('back-to-emulator-link')).toBeInTheDocument();
    expect(screen.getByText('Component Library')).toBeInTheDocument();

    window.location.hash = '#/dashboard';
    fireEvent(window, new HashChangeEvent('hashchange'));

    expect(await screen.findByTestId('site-dashboard-page')).toBeInTheDocument();
  });

  it('opens 420px Quick Drawer when clicking MainOffice_Gateway_2 on Dashboard and reopens via <|| handle', async () => {
    render(
      <OmadaProvider defaultThemeMode="light">
        <EmulatorApp initialRoute="dashboard" />
      </OmadaProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /MainOffice_Gateway_2/i }));
    const dialog = await screen.findByRole('dialog', {
      name: /MainOffice_Gateway_2 properties/i,
    });
    expect(dialog).toHaveAttribute('data-drawer-mode', 'quick');

    fireEvent.click(within(dialog).getByRole('button', { name: /Close drawer/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('quick-drawer-handle'));
    const reopened = await screen.findByRole('dialog', {
      name: /MainOffice_Gateway_2 properties/i,
    });
    expect(reopened).toHaveAttribute('data-drawer-mode', 'quick');
  });

  it('wires TopologyTabView inside Dashboard Topology tab and opens DevicePropertiesDrawer on node click', async () => {
    render(
      <OmadaProvider defaultThemeMode="light">
        <EmulatorApp initialRoute="dashboard" />
      </OmadaProvider>,
    );

    const mainTabs = screen.getByRole('tablist', { name: 'Dashboard sections' });
    fireEvent.click(within(mainTabs).getByRole('tab', { name: 'Topology' }));
    expect(await screen.findByTestId('dashboard-tab-panel-topology')).toBeInTheDocument();
    expect(screen.getByText('Device Health')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /BreakRoom_Eap_2/i }));
    const dialog = await screen.findByRole('dialog', {
      name: /BreakRoom_Eap_2 properties/i,
    });
    expect(dialog).toHaveAttribute('data-drawer-mode', 'quick');
  });

  it('opens 420px Quick Drawer from Devices row and expands to 1224px Ports tab on Manage Device', async () => {
    window.location.hash = '#/devices';
    render(<App />);

    const rowCell = await screen.findByText('SalesDepartment_Switch_3');
    fireEvent.click(rowCell);

    const dialog = await screen.findByRole('dialog', {
      name: /SalesDepartment_Switch_3 properties/i,
    });
    expect(dialog).toHaveAttribute('data-drawer-mode', 'quick');

    fireEvent.click(within(dialog).getByRole('button', { name: /Manage Device/i }));
    expect(dialog).toHaveAttribute('data-drawer-mode', 'expanded');
    const portsTab = within(dialog).getByRole('tab', { name: 'Ports' });
    expect(portsTab).toHaveAttribute('aria-selected', 'true');
    expect(portsTab).toHaveClass('omada-device-drawer-nav-btn--active');
  });

  it('routes #/clients -> ClientListPage + ClientPropertiesDrawer and opens DevicePropertiesDrawer from AP/Port', async () => {
    window.location.hash = '#/clients';
    render(<App />);

    expect(await screen.findByText('Online Clients')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Test_PC'));

    const clientDrawer = await screen.findByRole('dialog', {
      name: /Test_PC properties/i,
    });
    expect(clientDrawer).toBeInTheDocument();

    fireEvent.click(within(clientDrawer).getByRole('button', { name: 'MainOffice_Gateway_2' }));
    expect(
      await screen.findByRole('dialog', { name: /MainOffice_Gateway_2 properties/i }),
    ).toBeInTheDocument();
  });

  it('routes #/map, #/insights, #/statistics, #/report, #/logs, #/log, #/incidents, #/abnormal, #/intelli-recover, #/intellirecover', async () => {
    window.location.hash = '#/map';
    render(<App />);
    expect(await screen.findByRole('tab', { name: 'Heat Map' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Device Map' })).toBeInTheDocument();

    window.location.hash = '#/insights';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByTestId('analytics-categories-grid')).toBeInTheDocument();

    window.location.hash = '#/statistics';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByText('Clear Categories')).toBeInTheDocument();

    window.location.hash = '#/report';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByText('Clients Overview')).toBeInTheDocument();

    window.location.hash = '#/log';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByRole('tab', { name: 'Audit Logs' })).toBeInTheDocument();

    window.location.hash = '#/logs';
    fireEvent(window, new HashChangeEvent('hashchange'));
    const logDeviceLinks = await screen.findAllByRole('button', {
      name: 'StorageRoom_Eap_3',
    });
    fireEvent.click(logDeviceLinks[0]);
    expect(
      await screen.findByRole('dialog', { name: /StorageRoom_Eap_3 properties/i }),
    ).toBeInTheDocument();

    window.location.hash = '#/abnormal';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByTestId('incidents-page')).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: /StorageRoom_Eap_3 properties/i }),
    ).not.toBeInTheDocument();

    window.location.hash = '#/incidents';
    fireEvent(window, new HashChangeEvent('hashchange'));
    fireEvent.click(
      await screen.findByText('00-FF-00-38-95-10 wireless interference rate high'),
    );
    const incidentDrawer = await screen.findByTestId('incident-detail-drawer');
    expect(within(incidentDrawer).getByText('1. Too many devices nearby')).toBeInTheDocument();
    fireEvent.click(within(incidentDrawer).getByRole('button', { name: 'BreakRoom_Eap_2' }));
    expect(
      await screen.findByRole('dialog', { name: /BreakRoom_Eap_2 properties/i }),
    ).toBeInTheDocument();

    window.location.hash = '#/intellirecover';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByTestId('intellirecover-page')).toBeInTheDocument();

    window.location.hash = '#/intelli-recover';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByText('SalesDepartment_Switch_3 - Port 4')).toBeInTheDocument();
  });
});
