import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OmadaProvider } from '@/omada';
import {
  SDevicePortGraphic,
  type DrawerPortItem,
} from '../omada/components/SDevicePortGraphic';
import {
  DevicePropertiesDrawer,
  type DrawerDeviceRecord,
} from '../demos/emulator/drawer/DevicePropertiesDrawer';
import '../styles/modules/emulator-drawer.css';

const SALES_SWITCH_PORTS: DrawerPortItem[] = [
  {
    port: 1,
    name: 'Port1',
    linkStatus: '1000m',
    isUplink: true,
    lacp: '--',
    connectionName: 'MainOffice_Gateway_2',
    connectionProductSlug: 'gateway-er7206',
    connectionType: 'gateway',
    label: '--',
    type: 'Trunk',
    poeCapability: 'PoE+(30W)',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '14.82 GB',
    rxSum: '52.14 GB',
  },
  {
    port: 2,
    name: 'Port2',
    linkStatus: '1000m',
    isPoe: true,
    lacp: '--',
    connectionName: 'COOOffice_Eap_1',
    connectionProductSlug: 'eap650',
    connectionType: 'ap',
    label: '--',
    type: 'Trunk',
    poeCapability: 'PoE+(30W)',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '4.36 GB',
    rxSum: '11.20 GB',
  },
  {
    port: 3,
    name: 'Port3',
    linkStatus: '1000m',
    isPoe: true,
    lacp: '--',
    connectionName: 'BreakRoom_Eap_2',
    connectionProductSlug: 'eap668-outdoor-hd-un-1-2',
    connectionType: 'ap',
    label: '--',
    type: 'Trunk',
    poeCapability: 'PoE+(30W)',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '3.18 GB',
    rxSum: '9.45 GB',
  },
  {
    port: 4,
    name: 'Port4',
    linkStatus: '1000m',
    isPoe: true,
    lacp: '--',
    connectionName: 'StorageRoom_Eap_3',
    connectionProductSlug: 'eap650',
    connectionType: 'ap',
    label: '--',
    type: 'Trunk',
    poeCapability: 'PoE+(30W)',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '2.74 GB',
    rxSum: '6.81 GB',
  },
  ...[5, 6, 7, 8].map(
    (num): DrawerPortItem => ({
      port: num,
      name: `Port${num}`,
      linkStatus: 'disconnected',
      lacp: '--',
      label: '--',
      type: 'Trunk',
      poeCapability: 'PoE+(30W)',
      profile: 'All',
      nativeNetwork: 'Default(1)',
      txSum: '0 B',
      rxSum: '0 B',
    }),
  ),
  ...[9, 10].map(
    (num): DrawerPortItem => ({
      port: num,
      name: `Port${num}`,
      linkStatus: 'disconnected',
      isSfp: true,
      lacp: '--',
      label: '--',
      type: 'Trunk',
      poeCapability: '--',
      profile: 'All',
      nativeNetwork: 'Default(1)',
      txSum: '0 B',
      rxSum: '0 B',
    }),
  ),
];

const SALES_SWITCH_DEVICE: DrawerDeviceRecord = {
  key: 'sales-department-switch-3',
  name: 'SalesDepartment_Switch_3',
  model: 'SG2210MP v5.0',
  productSlug: 'sg2428p-un-5-40',
  category: 'switch',
  status: 'Connected',
  mac: '0C-EF-15-4E-90-95',
  ipv4: '192.168.0.102',
  controllerIp: '192.168.0.10',
  serialNumber: '2248192001045',
  customer: 'Headquarters Building',
  firmwareVersion: '5.0.8 Build 20250610 Rel.48210',
  firmwareFull: 'SG2210MP v5.0 (5.0.8 Build 20250610 Rel.48210)',
  uptime: '23h 42m 17s',
  cpu: 3,
  memory: 50,
  poeUsedW: 32.8,
  poeTotalW: 150,
  usedPorts: 4,
  totalPorts: 10,
  uplink: { name: 'MainOffice_Gateway_2', port: 1 },
  downlinks: [
    { name: 'COOOffice_Eap_1', port: 2 },
    { name: 'BreakRoom_Eap_2', port: 3 },
    { name: 'StorageRoom_Eap_3', port: 4 },
  ],
  ports: SALES_SWITCH_PORTS,
};

const SERVER_SWITCH_DEVICE: DrawerDeviceRecord = {
  key: 'server-room-switch-2',
  name: 'ServerRoom_Switch_2',
  model: 'SG3428X v1.0',
  productSlug: 'sg2428p-un-5-40',
  category: 'switch',
  status: 'Connected',
  mac: '00-FF-00-1B-57-93',
  ipv4: '192.168.0.105',
  controllerIp: '192.168.0.10',
  serialNumber: '2248192001089',
  customer: 'Headquarters Building',
  firmwareVersion: '1.20.4 Build 20250520 Rel.31820',
  firmwareFull: 'SG3428X v1.0 (1.20.4 Build 20250520 Rel.31820)',
  uptime: '14d 06h 18m 44s',
  cpu: 8,
  memory: 42,
  poeUsedW: 64.2,
  poeTotalW: 384,
  usedPorts: 6,
  totalPorts: 10,
  uplink: { name: 'MainOffice_Gateway_2', port: 1 },
  downlinks: [{ name: 'SalesDepartment_Switch_3', port: 2 }],
};

function renderWithOmada(
  ui: React.ReactElement,
  themeMode: 'light' | 'dark' = 'light',
) {
  return render(
    <OmadaProvider defaultThemeMode={themeMode}>{ui}</OmadaProvider>,
  );
}

describe('SDevicePortGraphic', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders compact mode with Used Port 4/10 and 10 single-row tiles', () => {
    renderWithOmada(<SDevicePortGraphic mode="compact" ports={SALES_SWITCH_PORTS} />);

    expect(screen.getByText('Used Port:')).toBeInTheDocument();
    expect(screen.getByText('4/10')).toBeInTheDocument();
    expect(screen.getByLabelText('Port status legend')).toBeInTheDocument();

    for (let i = 1; i <= 10; i += 1) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }

    const port1Tile = screen.getByLabelText('Port 1 1000 Mbps');
    expect(port1Tile).toHaveAttribute('data-port-status', '1000m');
    expect(port1Tile).toHaveStyle({ width: '32px', height: '32px' });

    const port9Tile = screen.getByLabelText('Port 9 Disconnected');
    expect(port9Tile).toHaveAttribute('data-port-status', 'disconnected');
  });

  it('renders full mode with floating connected devices, 40px tiles, and 10-item legend', () => {
    const onSelectPort = vi.fn();
    renderWithOmada(
      <SDevicePortGraphic
        mode="full"
        showConnectedDevices
        ports={SALES_SWITCH_PORTS}
        onSelectPort={onSelectPort}
      />,
    );

    expect(screen.getByLabelText('MainOffice_Gateway_2')).toBeInTheDocument();
    expect(screen.getByLabelText('COOOffice_Eap_1')).toBeInTheDocument();
    expect(screen.getByLabelText('BreakRoom_Eap_2')).toBeInTheDocument();
    expect(screen.getByLabelText('StorageRoom_Eap_3')).toBeInTheDocument();

    for (const legendLabel of [
      '10/100 Mbps',
      '1000 Mbps',
      'Disabled',
      'Disconnected',
      'LAG',
      'PoE',
      'Mirroring',
      'Blocking',
      'SFP',
      'Uplink',
    ]) {
      expect(screen.getByText(legendLabel)).toBeInTheDocument();
    }

    const port2Btn = screen.getByRole('button', { name: 'Port 2 1000 Mbps' });
    expect(port2Btn).toHaveStyle({ width: '40px', height: '40px' });
    fireEvent.click(port2Btn);
    expect(onSelectPort).toHaveBeenCalledWith(
      expect.objectContaining({ port: 2, name: 'Port2' }),
    );
  });
});

describe('DevicePropertiesDrawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Stage 1 quick drawer matching SalesDepartment_Switch_3 spec and toggles Connection Device/Client', () => {
    const onClose = vi.fn();
    renderWithOmada(
      <DevicePropertiesDrawer
        open
        device={SALES_SWITCH_DEVICE}
        availableDevices={[SALES_SWITCH_DEVICE, SERVER_SWITCH_DEVICE]}
        onClose={onClose}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: 'SalesDepartment_Switch_3 properties',
    });
    expect(dialog).toHaveAttribute('data-drawer-mode', 'quick');
    expect(screen.getByText('SalesDepartment_Switch_3')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('23h 42m 17s', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('4/10')).toBeInTheDocument();

    expect(screen.getByText('Device 24h health')).toBeInTheDocument();
    const healthTimeline = screen.getByRole('img', {
      name: 'Device 24h health timeline',
    });
    expect(healthTimeline.children).toHaveLength(96);

    expect(screen.getByText('32.80W / 150.00W')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();

    expect(screen.getByText('MainOffice_Gateway_2')).toBeInTheDocument();
    expect(screen.getByText('COOOffice_Eap_1')).toBeInTheDocument();
    expect(screen.getByText('BreakRoom_Eap_2')).toBeInTheDocument();
    expect(screen.getByText('StorageRoom_Eap_3')).toBeInTheDocument();

    expect(screen.getByText('SG2210MP v5.0')).toBeInTheDocument();
    expect(screen.getByText('0C-EF-15-4E-90-95')).toBeInTheDocument();
    expect(screen.getByText('192.168.0.102')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Client' }));
    expect(screen.getByText('Test_PC')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches from quick to expanded Ports tab on Manage Device, switches multi-device tabs, and collapses back', () => {
    renderWithOmada(
      <DevicePropertiesDrawer
        open
        device={SALES_SWITCH_DEVICE}
        availableDevices={[SALES_SWITCH_DEVICE, SERVER_SWITCH_DEVICE]}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Manage Device' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-drawer-mode', 'expanded');

    // Multi-device tab strip
    const tablist = screen.getByRole('tablist', { name: 'Open device tabs' });
    expect(within(tablist).getByRole('tab', { name: /SalesDepartment_Switch_3/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const secondaryTab = within(tablist).getByRole('tab', { name: /ServerRoom_Switch_2/ });
    expect(secondaryTab).toHaveAttribute('aria-selected', 'false');

    // Default active navigation tab is Ports
    expect(screen.getByRole('tab', { name: 'Ports' })).toHaveAttribute('aria-selected', 'true');

    // 10-row Port table + PoE+(30W) cells
    for (let i = 1; i <= 10; i += 1) {
      expect(screen.getByText(`Port${i}`)).toBeInTheDocument();
    }
    expect(screen.getAllByText('PoE+(30W)')).toHaveLength(8);
    expect(screen.getByText('Port Manager')).toBeInTheDocument();

    // Switch sub-tab to Statistics and DDM
    const portModeTablist = screen.getByRole('tablist', { name: 'Port data mode' });
    fireEvent.click(within(portModeTablist).getByRole('tab', { name: 'Statistics' }));
    expect(screen.getByRole('columnheader', { name: 'TX Packets' })).toBeInTheDocument();
    fireEvent.click(within(portModeTablist).getByRole('tab', { name: 'DDM' }));
    expect(screen.getByRole('columnheader', { name: 'Transceiver' })).toBeInTheDocument();
    fireEvent.click(within(portModeTablist).getByRole('tab', { name: 'Config' }));

    // Switch top nav to Overview & Config
    const sectionNav = screen.getByRole('navigation', { name: 'Device management sections' });
    fireEvent.click(within(sectionNav).getByRole('tab', { name: 'Overview' }));
    expect(screen.getByText('Hardware & Runtime Metrics')).toBeInTheDocument();
    fireEvent.click(within(sectionNav).getByRole('tab', { name: 'Config' }));
    expect(screen.getByText('General Configuration')).toBeInTheDocument();

    // Switch multi-device tab to ServerRoom_Switch_2
    fireEvent.click(secondaryTab);
    expect(screen.getByRole('dialog', { name: 'ServerRoom_Switch_2 properties' })).toBeInTheDocument();
    expect(screen.getByText('SG3428X v1.0')).toBeInTheDocument();

    // Collapse back to quick mode
    fireEvent.click(screen.getByRole('button', { name: 'Collapse to quick drawer' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-drawer-mode', 'quick');
  });

  it('supports inline device rename, port editing, and renders cleanly in dark mode without console errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onRenameDevice = vi.fn();

    renderWithOmada(
      <DevicePropertiesDrawer
        open
        defaultMode="expanded"
        device={SALES_SWITCH_DEVICE}
        availableDevices={[SALES_SWITCH_DEVICE, SERVER_SWITCH_DEVICE]}
        onRenameDevice={onRenameDevice}
        onClose={vi.fn()}
      />,
      'dark',
    );

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Inline rename
    fireEvent.click(screen.getByRole('button', { name: 'Rename device' }));
    const renameInput = screen.getByLabelText('New device name');
    fireEvent.change(renameInput, { target: { value: 'SalesSwitch_Core' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onRenameDevice).toHaveBeenCalledWith(SALES_SWITCH_DEVICE, 'SalesSwitch_Core');
    expect(screen.getByRole('heading', { name: 'SalesSwitch_Core' })).toBeInTheDocument();

    // Edit Port1
    fireEvent.click(screen.getByRole('button', { name: 'Edit Port1' }));
    const modal = document.querySelector('.ant-modal') as HTMLElement;
    expect(modal).not.toBeNull();
    expect(within(modal).getByText('Edit Port1')).toBeInTheDocument();
    const nameInput = within(modal).getByDisplayValue('Port1');
    fireEvent.change(nameInput, { target: { value: 'Uplink_Core' } });
    fireEvent.click(within(modal).getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Uplink_Core')).toBeInTheDocument();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('normalizes lowercase status values (e.g. "connected") to Title Case Connected', () => {
    const lowercaseStatusDevice: DrawerDeviceRecord = {
      ...SALES_SWITCH_DEVICE,
      status: 'connected',
    };
    renderWithOmada(
      <DevicePropertiesDrawer
        open
        device={lowercaseStatusDevice}
        availableDevices={[lowercaseStatusDevice, SERVER_SWITCH_DEVICE]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});
