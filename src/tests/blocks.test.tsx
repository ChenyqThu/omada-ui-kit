import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OmadaProvider,
  SDetailInspectorDrawer,
  SEmulatorShell,
  SFilterTableBlock,
  SInlineFormRow,
  SInlineRuleEditorLayout,
  SMasterDetailSplitBlock,
  SSwitchPortPicker,
  SWizardModal,
  type SPortItem,
} from '@/omada';
import { ShowcaseApp } from '../showcase/ShowcaseApp';
import '../styles/modules/blocks.css';
import '../styles/modules/emulator-config-wlan-acl.css';

function renderThemed(ui: React.ReactElement, theme: 'light' | 'dark' = 'light') {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

const SAMPLE_PORTS: SPortItem[] = [
  { id: 1, type: 'rj45', status: '2.5g', badges: ['poe'] },
  { id: 2, type: 'rj45', status: '1g' },
  { id: 3, type: 'sfp', status: '10g', badges: ['uplink'] },
];

describe('Omada Reusable Blocks & Showcase Gallery', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/showcase/blocks';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('supports SEmulatorShell scope="global" and extraNavItems injection', () => {
    const selectSpy = vi.fn();
    renderThemed(
      <SEmulatorShell
        scope="global"
        activeKey="site-list"
        onSelect={selectSpy}
        extraNavItems={[
          {
            groupKey: 'operations',
            item: {
              key: 'ap-sla',
              label: 'AP SLA Monitor',
              iconName: 'sidebar-icon-icon-ai-monitor-off',
            },
          },
        ]}
      >
        <div>Global Content</div>
      </SEmulatorShell>,
    );

    expect(screen.getByText('Global View')).toBeInTheDocument();
    expect(screen.getByText('Site List')).toBeInTheDocument();
    expect(screen.getByText('Global Settings')).toBeInTheDocument();

    const extraBtn = screen.getByRole('button', { name: 'AP SLA Monitor' });
    fireEvent.click(extraBtn);
    expect(selectSpy).toHaveBeenCalledWith('ap-sla');
  });

  it('renders SFilterTableBlock with tabs, search, quick-drawer clearance, and batch strip', () => {
    const tabSpy = vi.fn();
    const searchSpy = vi.fn();
    renderThemed(
      <SFilterTableBlock<{ key: string; name: string }>
        tabs={[
          { key: 'a', label: 'Tab Alpha' },
          { key: 'b', label: 'Tab Beta' },
        ]}
        activeTab="a"
        onTabChange={tabSpy}
        title="Device List"
        searchPlaceholder="Find device"
        searchValue=""
        onSearchChange={searchSpy}
        selectedCount={2}
        batchActions={<button type="button">Batch Upgrade</button>}
        tableProps={{
          rowKey: 'key',
          dataSource: [{ key: '1', name: 'EAP650-01' }],
          pagination: false,
          columns: [{ title: 'Name', dataIndex: 'name', key: 'name' }],
        }}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Tab Beta' }));
    expect(tabSpy).toHaveBeenCalledWith('b');

    fireEvent.change(screen.getByPlaceholderText('Find device'), {
      target: { value: 'EAP650' },
    });
    expect(searchSpy).toHaveBeenCalledWith('EAP650');
    expect(screen.getByText('Batch Upgrade')).toBeInTheDocument();
    expect(screen.getByText('EAP650-01')).toBeInTheDocument();
  });

  it('renders SInlineRuleEditorLayout with SInlineFormRow and triggers callbacks', () => {
    const backSpy = vi.fn();
    const helpSpy = vi.fn();
    const submitSpy = vi.fn();
    renderThemed(
      <SInlineRuleEditorLayout
        title="Create New Rule"
        onBack={backSpy}
        onHelpClick={helpSpy}
        onSubmit={submitSpy}
      >
        <SInlineFormRow label="Rule Name" tooltip="Unique name">
          <input aria-label="Rule Name Input" defaultValue="TestRule" />
        </SInlineFormRow>
      </SInlineRuleEditorLayout>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create New Rule' }));
    expect(backSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(helpSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('toggles SDetailInspectorDrawer width expansion and tabs', async () => {
    renderThemed(
      <SDetailInspectorDrawer
        open
        onClose={() => {}}
        title="EAP650-Lobby"
        subtitle="EAP650 v1.0"
        status="connected"
        tabs={[
          { key: 'overview', label: 'Overview', content: <div>Overview Tab Body</div> },
          { key: 'radios', label: 'Radios', content: <div>Radios Tab Body</div> },
        ]}
      />,
    );

    expect(await screen.findByText('Overview Tab Body')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();

    const expandBtn = screen.getByRole('button', { name: 'Expand drawer width' });
    fireEvent.click(expandBtn);
    expect(screen.getByRole('button', { name: 'Collapse drawer width' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Radios' }));
    expect(await screen.findByText('Radios Tab Body')).toBeInTheDocument();
  });

  it('filters and selects items in SMasterDetailSplitBlock', () => {
    const selectSpy = vi.fn();
    renderThemed(
      <SMasterDetailSplitBlock
        masterTitle="VLAN Profiles"
        searchable
        items={[
          { key: 'default', title: 'Default', subtitle: 'VLAN 1' },
          { key: 'staff', title: 'Corporate Staff', subtitle: 'VLAN 100' },
        ]}
        activeKey="default"
        onSelect={selectSpy}
        detailTitle="Subnet Settings"
      >
        <div>Subnet Body</div>
      </SMasterDetailSplitBlock>,
    );

    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Staff' } });
    expect(screen.queryByRole('option', { name: /Default/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: /Corporate Staff/ }));
    expect(selectSpy).toHaveBeenCalledWith('staff');
    expect(screen.getByText('Subnet Body')).toBeInTheDocument();
  });

  it('progresses through SWizardModal steps and invokes onFinish', () => {
    const finishSpy = vi.fn();
    renderThemed(
      <SWizardModal
        open
        title="Provisioning Wizard"
        onCancel={() => {}}
        onFinish={finishSpy}
        steps={[
          { key: 's1', title: 'Step One', content: <div>First Step Content</div> },
          { key: 's2', title: 'Step Two', content: <div>Second Step Content</div> },
        ]}
      />,
    );

    expect(screen.getByText('First Step Content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Second Step Content')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(finishSpy).toHaveBeenCalledTimes(1);
  });

  it('selects and clears ports across switches in SSwitchPortPicker', () => {
    const changeSpy = vi.fn();
    renderThemed(
      <SSwitchPortPicker
        switches={[
          { id: 'sw1', name: 'Switch_A', ports: SAMPLE_PORTS },
          { id: 'sw2', name: 'Switch_B', ports: SAMPLE_PORTS.slice(0, 2) },
        ]}
        onChange={changeSpy}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select All' }));
    expect(changeSpy).toHaveBeenCalledWith({ sw1: [1, 2, 3] });
    expect(screen.getByText('Switch_A: Port 1, 2, 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(changeSpy).toHaveBeenLastCalledWith({ sw1: [] });
  });

  it('renders ShowcaseApp Blocks & Page Templates sections with View Code modal', async () => {
    renderThemed(<ShowcaseApp />);

    expect(screen.getByText('Reusable Omada Blocks')).toBeInTheDocument();
    expect(screen.getByText('SEmulatorShell (Site / Global Scope + Incremental Nav Injection)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Page Templates/i }));
    expect(
      await screen.findByText('Full-Page Starter Templates', undefined, { timeout: 10000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Site Overview Dashboard')).toBeInTheDocument();
    expect(screen.getByText('ACL Policy List + Inline Rule Builder')).toBeInTheDocument();

    const viewButtons = screen.getAllByRole('button', { name: /View Code/i });
    fireEvent.click(viewButtons[0]);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByText(/Template Source: Site Overview Dashboard/i)).toBeInTheDocument();
    });
  });

  it('renders ShowcaseApp Agent Skill & Issue Feedback section with agent tabs, copy action, and GitHub issue links', async () => {
    renderThemed(<ShowcaseApp />);

    const topbarIssueLink = screen.getByTestId('showcase-report-issue-link');
    expect(topbarIssueLink).toHaveAttribute(
      'href',
      'https://github.com/ChenyqThu/omada-ui-kit/issues/new/choose',
    );
    const footer = screen.getByTestId('showcase-feedback-footer');
    expect(
      within(footer).getByRole('link', { name: 'Request Missing Component' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=missing-component.yml',
    );
    expect(within(footer).getByRole('link', { name: 'Report UI Issue' })).toHaveAttribute(
      'href',
      'https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=component-bug.yml',
    );

    fireEvent.click(screen.getByRole('button', { name: /Agent Skill & Issues/i }));
    expect(
      await screen.findByText('Agent Skill & Issue Feedback', undefined, { timeout: 10000 }),
    ).toBeInTheDocument();

    expect(screen.getAllByText('npx skills add ChenyqThu/omada-ui-kit').length).toBeGreaterThanOrEqual(1);
    expect(within(screen.getByRole('tabpanel')).getByText('.claude/skills/omada-ui-kit/')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Cursor' }));
    await waitFor(() => {
      expect(within(screen.getByRole('tabpanel')).getByText('.cursor/skills/omada-ui-kit/')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'OpenAI Codex' }));
    await waitFor(() => {
      expect(within(screen.getByRole('tabpanel')).getByText('.agents/skills/omada-ui-kit/')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Antigravity' }));
    await waitFor(() => {
      expect(within(screen.getByRole('tabpanel')).getByText('~/.gemini/config/skills/omada-ui-kit/')).toBeInTheDocument();
    });

    expect(screen.getByTestId('request-component-issue-link')).toHaveAttribute(
      'href',
      'https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=missing-component.yml',
    );
    expect(screen.getByTestId('report-bug-issue-link')).toHaveAttribute(
      'href',
      'https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=component-bug.yml',
    );

    const agentOutput = screen.getByTestId('agent-bridge-live-output');
    expect(agentOutput.textContent).toContain('demo.wlan.psk');
    expect(agentOutput.textContent).toContain('[REDACTED]');

    fireEvent.click(screen.getByRole('button', { name: "act('demo.wlan.enabled', 'toggle')" }));
    await waitFor(() => {
      expect(screen.getByTestId('agent-bridge-live-output').textContent).toContain('"ok": true');
    });

    fireEvent.click(screen.getByRole('button', { name: "act('demo.system.reboot', 'toggle')" }));
    await waitFor(() => {
      expect(screen.getByTestId('agent-bridge-live-output').textContent).toContain('"ok": false');
    });

    const writeText = vi.fn().mockResolvedValue(undefined);
    const prevDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Copy Project-Level Install' }));
      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith('npx skills add ChenyqThu/omada-ui-kit');
      });
    } finally {
      if (prevDescriptor) {
        Object.defineProperty(navigator, 'clipboard', prevDescriptor);
      } else {
        delete (navigator as unknown as Record<string, unknown>).clipboard;
      }
    }
  });
});
