import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OmadaProvider } from '@/omada';
import {
  SAppShell,
  type SNavGroup,
} from '@/omada/layout/SAppShell';
import {
  SAnchor,
  SBreadcrumb,
  SDivider,
  SDropdown,
  SPagination,
  SSteps,
} from '@/omada/modules/nav-shell';
import { NavShellSection } from '@/showcase/sections/NavShellSection';

function renderWithTheme(
  ui: React.ReactElement,
  defaultThemeMode: 'light' | 'dark' = 'light',
) {
  return render(
    <OmadaProvider defaultThemeMode={defaultThemeMode}>{ui}</OmadaProvider>,
  );
}

describe('SAppShell enhancements', () => {
  const nestedNavGroups: SNavGroup[] = [
    {
      key: 'main',
      label: 'Manage',
      items: [
        { key: 'dashboard', label: 'Dashboard' },
        {
          key: 'network',
          label: 'Network Config',
          children: [
            { key: 'lan', label: 'LAN & VLANs' },
            { key: 'wlan', label: 'Wireless Networks', badge: 'BETA' },
          ],
        },
      ],
    },
  ];

  it('supports edition="pro" with omada-pro brand asset and edition="msp" pill', () => {
    const onSelect = vi.fn();
    const { rerender } = renderWithTheme(
      <SAppShell
        edition="pro"
        navGroups={nestedNavGroups}
        activeKey="dashboard"
        onSelect={onSelect}
      >
        <div>Body</div>
      </SAppShell>,
    );

    expect(document.querySelector('[data-omada-asset="omada-pro"]')).toBeInTheDocument();

    rerender(
      <OmadaProvider defaultThemeMode="light">
        <SAppShell
          edition="msp"
          navGroups={nestedNavGroups}
          activeKey="dashboard"
          onSelect={onSelect}
        >
          <div>Body</div>
        </SAppShell>
      </OmadaProvider>,
    );

    expect(screen.getByText('MSP')).toBeInTheDocument();
  });

  it('supports central, portal, and account shell variants', () => {
    const onSignOut = vi.fn();
    const onTopNavSelect = vi.fn();
    const { rerender } = renderWithTheme(
      <SAppShell
        shellVariant="portal"
        navGroups={nestedNavGroups}
        activeKey="dashboard"
        onSelect={vi.fn()}
        onTopNavSelect={onTopNavSelect}
      >
        <div>Portal Content</div>
      </SAppShell>,
    );

    const sdWanBtn = screen.getByRole('button', { name: 'SD WAN' });
    fireEvent.click(sdWanBtn);
    expect(onTopNavSelect).toHaveBeenCalledWith('sd-wan');

    rerender(
      <OmadaProvider defaultThemeMode="light">
        <SAppShell
          shellVariant="central"
          navGroups={nestedNavGroups}
          activeKey="dashboard"
          onSelect={vi.fn()}
        >
          <div>Central Content</div>
        </SAppShell>
      </OmadaProvider>,
    );

    expect(screen.getByRole('button', { name: 'Central' })).toBeInTheDocument();

    rerender(
      <OmadaProvider defaultThemeMode="light">
        <SAppShell
          shellVariant="account"
          userName="Zoe Wang"
          userEmail="zoe@tp-link.com"
          onSignOut={onSignOut}
          navGroups={nestedNavGroups}
          activeKey="dashboard"
          onSelect={vi.fn()}
        >
          <div>Account Content</div>
        </SAppShell>
      </OmadaProvider>,
    );

    expect(screen.getByText('zoe@tp-link.com')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('expands, collapses, and selects nested submenu children and toggles sidebar width', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <SAppShell
        navGroups={nestedNavGroups}
        activeKey="wlan"
        onSelect={onSelect}
      >
        <div>Content</div>
      </SAppShell>,
    );

    // Active child auto-expands parent group
    expect(screen.getByText('Wireless Networks')).toBeInTheDocument();
    const parentBtn = screen.getByRole('button', { name: /Network Config/i });
    expect(parentBtn).toHaveAttribute('aria-expanded', 'true');

    // Clicking Level-2 child triggers onSelect
    fireEvent.click(screen.getByRole('button', { name: /LAN & VLANs/i }));
    expect(onSelect).toHaveBeenCalledWith('lan');

    // Clicking Level-1 parent collapses its children
    fireEvent.click(parentBtn);
    expect(parentBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('LAN & VLANs')).not.toBeInTheDocument();

    // Collapse sidebar to 52px
    fireEvent.click(screen.getByTestId('sidebar-collapse-btn'));
    expect(screen.getByTestId('omada-sidebar')).toHaveStyle({ width: '52px' });
  });
});

describe('SDropdown', () => {
  it('opens menu, filters items via search, shows selection check, and triggers onSelect', async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <SDropdown
        searchable
        searchPlaceholder="Filter actions"
        selectable
        selectedKeys={['5g']}
        onSelect={onSelect}
        trigger={['click']}
        items={[
          { key: '2.4g', label: '2.4 GHz Band' },
          { key: '5g', label: '5 GHz Band' },
          { key: '6g', label: '6 GHz Wi-Fi 7' },
        ]}
      >
        <button type="button">Open Menu</button>
      </SDropdown>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Menu' }));

    const searchInput = await screen.findByPlaceholderText('Filter actions');
    expect(screen.getByText('2.4 GHz Band')).toBeInTheDocument();
    expect(screen.getByText('6 GHz Wi-Fi 7')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Wi-Fi 7' } });
    await waitFor(() => {
      expect(screen.queryByText('2.4 GHz Band')).not.toBeInTheDocument();
    });
    expect(screen.getByText('6 GHz Wi-Fi 7')).toBeInTheDocument();

    fireEvent.click(screen.getByText('6 GHz Wi-Fi 7'));
    expect(onSelect).toHaveBeenCalledWith('6g');
  });
});

describe('SPagination', () => {
  it('renders default variant summary and updates uncontrolled state on page change', () => {
    const onChange = vi.fn();
    renderWithTheme(<SPagination total={200} onChange={onChange} />);

    expect(screen.getByText('Showing 1–10 of 200 records')).toBeInTheDocument();
    fireEvent.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2, 10);
    expect(screen.getByText('Showing 11–20 of 200 records')).toBeInTheDocument();
  });

  it('supports simple and minimal variants without summary or size-changer bloat', () => {
    const { container, rerender } = renderWithTheme(
      <SPagination variant="simple" total={50} />,
    );
    expect(container.querySelector('.ant-pagination-simple')).toBeInTheDocument();
    expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();

    rerender(
      <OmadaProvider>
        <SPagination variant="minimal" total={50} />
      </OmadaProvider>,
    );
    expect(container.querySelector('.omada-pagination-minimal')).toBeInTheDocument();
    expect(container.querySelector('.ant-pagination-options')).not.toBeInTheDocument();
  });
});

describe('SSteps', () => {
  it('renders horizontal steps, loading indicator, vertical mode, and clickable navigation', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <SSteps
        current={1}
        loading
        onChange={onChange}
        items={[
          { title: 'Discover', content: 'Scan subnet' },
          { title: 'Provision', description: 'Push templates' },
          { title: 'Online', content: 'Ready' },
        ]}
      />,
    );

    expect(screen.getByText('Scan subnet')).toBeInTheDocument();
    expect(screen.getByText('Push templates')).toBeInTheDocument();
    expect(screen.getByLabelText('In progress')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Online'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

describe('SBreadcrumb', () => {
  it('collapses middle items into ellipsis dropdown when exceeding maxItems', async () => {
    const onSecondClick = vi.fn();
    renderWithTheme(
      <SBreadcrumb
        maxItems={4}
        items={[
          { key: '1', title: 'Global' },
          { key: '2', title: 'Region West', onClick: onSecondClick },
          { key: '3', title: 'Campus A' },
          { key: '4', title: 'Floor 2' },
          { key: '5', title: 'Core Switch' },
        ]}
      />,
    );

    expect(screen.getByText('Global')).toBeInTheDocument();
    expect(screen.getByText('Floor 2')).toBeInTheDocument();
    expect(screen.getByText('Core Switch')).toBeInTheDocument();
    expect(screen.queryByText('Region West')).not.toBeInTheDocument();

    const ellipsisTrigger = screen.getByLabelText('Show 2 hidden levels');
    fireEvent.mouseEnter(ellipsisTrigger);
    await waitFor(() => {
      expect(screen.getByText('Region West')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Region West'));
    expect(onSecondClick).toHaveBeenCalledTimes(1);
  });
});

describe('SAnchor', () => {
  it('renders title, nested items, error state, and prevents clicks on disabled links', () => {
    const onClick = vi.fn();
    renderWithTheme(
      <SAnchor
        title="On This Page"
        activeHref="#sec-general"
        onClick={onClick}
        items={[
          {
            key: 'general',
            href: '#sec-general',
            title: 'General',
            children: [{ key: 'site', href: '#sec-site', title: 'Site Identity' }],
          },
          { key: 'err', href: '#sec-err', title: 'Security Alert', status: 'error' },
          { key: 'dis', href: '#sec-dis', title: 'Disabled Item', disabled: true },
        ]}
      />,
    );

    expect(screen.getByText('On This Page')).toBeInTheDocument();
    expect(screen.getByText('Site Identity')).toBeInTheDocument();
    expect(screen.getByLabelText('Section has errors')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Disabled Item'));
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Security Alert'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('SDivider', () => {
  it('renders horizontal titled inset divider and vertical divider', () => {
    const { container } = renderWithTheme(
      <div>
        <SDivider inset variant="dashed" titlePlacement="start">
          Uplinks
        </SDivider>
        <div>
          <span>Left</span>
          <SDivider orientation="vertical" />
          <span>Right</span>
        </div>
      </div>,
    );

    expect(screen.getByText('Uplinks')).toBeInTheDocument();
    expect(container.querySelector('.omada-divider-inset')).toBeInTheDocument();
    expect(container.querySelector('.ant-divider-vertical')).toBeInTheDocument();
  });
});

describe('NavShellSection showcase (Light & Dark)', () => {
  it('renders complete NavShellSection cleanly in both light and dark modes', () => {
    const { unmount } = renderWithTheme(<NavShellSection />, 'light');
    expect(screen.getByText('Navigation & Shell')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount();

    renderWithTheme(<NavShellSection />, 'dark');
    expect(screen.getByText('Navigation & Shell')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
