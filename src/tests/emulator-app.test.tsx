import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { OmadaProvider } from '@/omada';
import { EmulatorApp } from '../demos/emulator/EmulatorApp';

describe('EmulatorApp & App hash routing integration', () => {
  beforeEach(() => {
    window.location.hash = '';
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
});
