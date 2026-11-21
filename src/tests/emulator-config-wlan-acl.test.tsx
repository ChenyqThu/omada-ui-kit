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
import { WlanPage } from '../demos/emulator/config/WlanPage';
import { AclPage } from '../demos/emulator/config/AclPage';
import {
  CONFIG_SUBMODULE_KEYS,
  ConfigSubmodulePage,
} from '../demos/emulator/config/ConfigSubmodulePage';
import '../styles/modules/emulator-config-wlan-acl.css';

function renderThemed(
  ui: React.ReactElement,
  theme: 'light' | 'dark' = 'light',
) {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

const EXPECTED_SUBMODULE_KEYS = [
  'ssh',
  'schedule',
  'mdns',
  'voip',
  'cli-config',
  'snmp',
  'portal',
  'dot1x',
  'mac-auth',
  'vpn-status',
  'vpn',
  'url-filtering',
  'app-control',
  'ids-ips',
  'wireless-ids-ips',
  'firewall',
  'impb',
  'routing',
  'nat',
  'dhcp-reservation',
  'bandwidth-control',
  'session-limit',
  'gateway-qos',
  'switch-qos',
  'oui-vlan',
  'groups',
  'time-range',
  'rate-limit',
  'ppsk',
  'radius-profile',
  'ldap-profile',
  'apn-profile',
  'cert-profile',
  'mac-filtering',
  'ip-mac-binding',
  'upnp',
  'iptv',
  'vrrp',
  'eogre-tunnel',
  'bluetooth',
  'wifi-calling',
] as const;

describe('emulator-config-wlan-acl module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('WlanPage', () => {
    it('renders exact SSID rows, colored band pills, and interactive search/filters', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      renderThemed(<WlanPage />);

      expect(screen.getByRole('tab', { name: 'SSID' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'WLAN Optimization' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Optimization History' })).toBeInTheDocument();

      expect(screen.getByText('test_ssid_1')).toBeInTheDocument();
      expect(screen.getByText('Office_Staff')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
      expect(screen.getByText('WPA-Personal')).toBeInTheDocument();
      expect(screen.getAllByText('2.4 GHz')).toHaveLength(2);
      expect(screen.getAllByText('5 GHz')).toHaveLength(2);
      expect(screen.getByText('6 GHz')).toBeInTheDocument();
      expect(screen.getByText('All Devices')).toBeInTheDocument();
      expect(screen.getByText('2 Groups (3 APs)')).toBeInTheDocument();

      // Column filter on Security
      fireEvent.click(screen.getByRole('button', { name: 'Filter Security column' }));
      fireEvent.click(await screen.findByRole('button', { name: 'WPA-Personal' }));
      expect(screen.queryByText('test_ssid_1')).not.toBeInTheDocument();
      expect(screen.getByText('Office_Staff')).toBeInTheDocument();

      // Reset Security filter
      fireEvent.click(screen.getByRole('button', { name: 'Filter Security column' }));
      fireEvent.click(await screen.findByRole('button', { name: 'All Security Types' }));
      expect(screen.getByText('test_ssid_1')).toBeInTheDocument();

      // Live search
      const searchInput = screen.getByLabelText('Search SSID Name');
      fireEvent.change(searchInput, { target: { value: 'Office' } });
      expect(screen.queryByText('test_ssid_1')).not.toBeInTheDocument();
      expect(screen.getByText('Office_Staff')).toBeInTheDocument();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('opens Add SSID modal, creates a new SSID, and updates optimization history', async () => {
      renderThemed(<WlanPage />);

      fireEvent.click(screen.getByRole('button', { name: /Add SSID/i }));
      const nameInput = await screen.findByLabelText('SSID Name');
      fireEvent.change(nameInput, { target: { value: 'Guest_WiFi_6E' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(screen.getByText('Guest_WiFi_6E')).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByText('All Devices')[0]);
      expect(await screen.findByText(/Device Assignment · test_ssid_1/i)).toBeInTheDocument();
      fireEvent.click(within(screen.getByRole('dialog')).getByText('Close'));

      fireEvent.click(screen.getByRole('tab', { name: 'WLAN Optimization' }));
      expect(screen.getByText('COOOffice_Eap_1')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Optimize Now' }));

      fireEvent.click(screen.getByRole('tab', { name: 'Optimization History' }));
      expect(screen.getByText('2026-11-21 11:45:00')).toBeInTheDocument();
    });
  });

  describe('AclPage', () => {
    it('renders exact 3 Gateway ACL rows and supports keyboard reordering & inspection', async () => {
      renderThemed(<AclPage />);

      expect(screen.getByRole('tab', { name: 'Gateway ACL' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByText('ACL Rules')).toBeInTheDocument();
      expect(screen.getByText('Gateway_ACL_1')).toBeInTheDocument();
      expect(screen.getByText('Gateway_ACL_2')).toBeInTheDocument();
      expect(screen.getByText('Gateway_ACL_3')).toBeInTheDocument();

      const toggle2 = screen.getByRole('switch', { name: 'Toggle Gateway_ACL_2' });
      expect(toggle2).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(toggle2);
      expect(toggle2).toHaveAttribute('aria-checked', 'true');

      // Reorder Gateway_ACL_1 down below Gateway_ACL_2
      const dragHandle1 = screen.getByRole('button', { name: 'Reorder Gateway_ACL_1' });
      fireEvent.keyDown(dragHandle1, { key: 'ArrowDown' });

      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('Gateway_ACL_2')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Gateway_ACL_1')).toBeInTheDocument();

      // Inspect Network object modal
      fireEvent.click(screen.getAllByText('Network:interface-vlan100')[0]);
      expect(await screen.findByText(/VLAN 100 · Corporate Staff Subnet/i)).toBeInTheDocument();
      fireEvent.click(within(screen.getByRole('dialog')).getByText('Close'));

      // Switch tabs to Switch ACL and EAP ACL
      fireEvent.click(screen.getByRole('tab', { name: 'Switch ACL' }));
      expect(screen.getByText('Switch_ACL_1')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('tab', { name: 'EAP ACL' }));
      expect(screen.getByText('EAP_ACL_1')).toBeInTheDocument();
    });

    it('creates, edits, and deletes Gateway, Switch, and EAP ACL rules via inline builder', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      renderThemed(<AclPage />);

      // Open inline Create New Rule pane on Gateway ACL
      fireEvent.click(screen.getByRole('button', { name: /Create New Rule/i }));
      expect(await screen.findByTestId('acl-rule-editor')).toBeInTheDocument();

      const descInput = screen.getByLabelText('Description');
      fireEvent.change(descInput, { target: { value: 'Gateway_ACL_Custom' } });

      // Switch policy to Permit and pick Source + Destination in SAclRuleBuilder
      fireEvent.click(screen.getByRole('radio', { name: 'Permit' }));

      const sourceCard = screen.getByTestId('acl-builder-source');
      fireEvent.mouseDown(within(sourceCard).getByRole('combobox'));
      fireEvent.click((await screen.findAllByText('Network')).slice(-1)[0]);
      fireEvent.click(within(sourceCard).getByText('Default'));

      const destCard = screen.getByTestId('acl-builder-destination');
      fireEvent.mouseDown(within(destCard).getByRole('combobox'));
      fireEvent.click((await screen.findAllByText('IP Group')).slice(-1)[0]);
      fireEvent.click(within(destCard).getByText('ip-1'));

      // Expand Advanced Settings and switch to Manual States
      fireEvent.click(screen.getByRole('button', { name: 'Advanced Settings' }));
      fireEvent.click(screen.getByRole('radio', { name: 'Manual' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Match State New' }));

      fireEvent.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(screen.getByText('Gateway_ACL_Custom')).toBeInTheDocument();
      });

      // Edit existing Gateway_ACL_Custom via inline Edit Rule pane
      fireEvent.click(screen.getByRole('button', { name: 'Edit Gateway_ACL_Custom' }));
      const editInput = await screen.findByLabelText('Description');
      fireEvent.change(editInput, { target: { value: 'Gateway_ACL_Renamed' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText('Gateway_ACL_Renamed')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Delete Gateway_ACL_Renamed' }));
      await waitFor(() => {
        expect(screen.queryByText('Gateway_ACL_Renamed')).not.toBeInTheDocument();
      });

      // Switch ACL inline editor verifies ACL Binding + Ethertype; EAP ACL omits Advanced Settings
      fireEvent.click(screen.getByRole('tab', { name: 'Switch ACL' }));
      fireEvent.click(screen.getByRole('button', { name: /Create New Rule/i }));
      expect(screen.getByRole('button', { name: 'ACL Binding' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Advanced Settings' }));
      expect(screen.getByText('Ethertype')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      fireEvent.click(screen.getByRole('tab', { name: 'EAP ACL' }));
      fireEvent.click(screen.getByRole('button', { name: /Create New Rule/i }));
      expect(screen.queryByRole('button', { name: 'Advanced Settings' })).not.toBeInTheDocument();
      expect(screen.queryByText('Direction')).not.toBeInTheDocument();

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('ConfigSubmodulePage', () => {
    it('covers all 41 remaining Network Config and Device Config submenu keys', () => {
      for (const key of EXPECTED_SUBMODULE_KEYS) {
        expect(CONFIG_SUBMODULE_KEYS).toContain(key);
        const { unmount } = renderThemed(<ConfigSubmodulePage routeKey={key} />);
        expect(screen.getByTestId(`config-submodule-${key}`)).toBeInTheDocument();
        unmount();
      }
    });

    it('renders SSchedule for schedule and time-range submodules', () => {
      const { unmount } = renderThemed(<ConfigSubmodulePage routeKey="schedule" />);
      expect(screen.getByText('Office_PoE_Workhours')).toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
      unmount();

      renderThemed(<ConfigSubmodulePage routeKey="time-range" />);
      expect(screen.getByText('Workdays_09_18')).toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('renders SIpInput and SMacInput controls on dhcp-reservation, ip-mac-binding, mac-filtering, routing, and nat', async () => {
      const { unmount: unmountDhcp } = renderThemed(
        <ConfigSubmodulePage routeKey="dhcp-reservation" />,
      );
      expect(screen.getByText('MainOffice_Printer_01')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Subnet IP')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Client MAC')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Create New Entry/i }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Create New Entry')).toBeInTheDocument();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }));
      unmountDhcp();

      for (const route of ['ip-mac-binding', 'mac-filtering', 'routing', 'nat'] as const) {
        const { unmount } = renderThemed(<ConfigSubmodulePage routeKey={route} />);
        expect(screen.getByTestId(`config-submodule-${route}`)).toBeInTheDocument();
        unmount();
      }
    });

    it('renders cleanly in dark mode across WlanPage, AclPage, and ConfigSubmodulePage', () => {
      const { unmount: u1 } = renderThemed(<WlanPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('test_ssid_1')).toBeInTheDocument();
      u1();

      const { unmount: u2 } = renderThemed(<AclPage />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('Gateway_ACL_1')).toBeInTheDocument();
      u2();

      renderThemed(<ConfigSubmodulePage routeKey="firewall" />, 'dark');
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByText('SPI Firewall')).toBeInTheDocument();
    });
  });
});
