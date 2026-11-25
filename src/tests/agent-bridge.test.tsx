import React, { useState } from 'react';
import { act as reactAct, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OMADA_AGENT_TOOLS,
  OMADA_SECRET_MASK,
  OmadaAgentProvider,
  OmadaProvider,
  SCheckbox,
  SDatePicker,
  SDetailInspectorDrawer,
  SDrawer,
  SFilterTableBlock,
  SInput,
  SModal,
  SNumberInput,
  SPasswordInput,
  SRadio,
  SRangePicker,
  SSelect,
  SSettingsPageShell,
  SStepModal,
  SSwitch,
  STable,
  STabs,
  registerWebMcpTools,
  useOmadaAgent,
  useOmadaAgentAction,
  type OmadaAgentBatchResult,
  type OmadaAgentRuntime,
  type OmadaWebMcpToolDefinition,
} from '@/omada';
import { EmulatorApp } from '@/demos/emulator/EmulatorApp';

afterEach(() => {
  cleanup();
});

function RuntimeProbe({ onRuntime }: { onRuntime: (rt: OmadaAgentRuntime) => void }) {
  const rt = useOmadaAgent();
  onRuntime(rt);
  return null;
}

describe('Omada Agent Bridge (snapshot / query / act / allow / secret masking)', () => {
  it('safely renders agentId controls outside OmadaAgentProvider and throws if useOmadaAgent is called without provider', () => {
    render(
      <OmadaProvider>
        <SSwitch agentId="orphan.switch" label="Orphan Switch" />
      </OmadaProvider>,
    );
    expect(screen.getByText('Orphan Switch')).toBeInTheDocument();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<RuntimeProbe onRuntime={() => {}} />)).toThrow(
      /useOmadaAgent must be used inside <OmadaAgentProvider>/,
    );
    consoleSpy.mockRestore();
  });

  it('registers controls & actions deterministically, masks secrets, and executes imperative act() mutations', () => {
    let runtime!: OmadaAgentRuntime;
    const onApplySettings = vi.fn();
    const onClearSelection = vi.fn();
    const onReboot = vi.fn(() => 'reboot-queued');

    function AgentDemoApp() {
      const [wlanEnabled, setWlanEnabled] = useState(false);
      const [securityMode, setSecurityMode] = useState('wpa2');
      const [ssid, setSsid] = useState('Omada-Corp');
      const [psk, setPsk] = useState('SuperSecret123!');
      const [viewTab, setViewTab] = useState('2g');
      const [tableTab, setTableTab] = useState('all');
      const [search, setSearch] = useState('');
      const [settingsTab, setSettingsTab] = useState('general');

      useOmadaAgentAction({
        id: 'device.reboot',
        label: 'Reboot Gateway',
        handler: onReboot,
      });

      return (
        <>
          <RuntimeProbe onRuntime={(rt) => (runtime = rt)} />
          <SSwitch
            agentId="wlan.enabled"
            label="Enable WLAN"
            checked={wlanEnabled}
            onChange={setWlanEnabled}
          />
          <SSelect
            agentId="wlan.security"
            aria-label="Security Mode"
            value={securityMode}
            onChange={(val) => setSecurityMode(String(val))}
            options={[
              { value: 'wpa2', label: 'WPA2-Personal' },
              { value: 'wpa3', label: 'WPA3-Personal' },
            ]}
          />
          <SInput
            agentId="wlan.ssid"
            aria-label="SSID Name"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
          />
          <SInput
            agentId="wlan.radiusSecret"
            aria-label="RADIUS Secret"
            secret
            defaultValue="radius-shared-key"
          />
          <SPasswordInput
            agentId="wlan.psk"
            aria-label="Passphrase"
            value={psk}
            onChange={(e) => setPsk(e.target.value)}
          />
          <STabs
            agentId="wlan.bandTabs"
            aria-label="Radio Band"
            activeKey={viewTab}
            onChange={setViewTab}
            items={[
              { key: '2g', label: '2.4 GHz' },
              { key: '5g', label: '5 GHz' },
            ]}
          />
          <SFilterTableBlock<{ id: string; name: string }>
            agentId="clients.table"
            tabs={[
              { key: 'all', label: 'All' },
              { key: 'wireless', label: 'Wireless' },
            ]}
            activeTab={tableTab}
            onTabChange={setTableTab}
            searchValue={search}
            onSearchChange={setSearch}
            selectedCount={1}
            onClearSelection={onClearSelection}
            tableProps={{
              rowKey: 'id',
              columns: [{ title: 'Name', dataIndex: 'name', key: 'name' }],
              dataSource: [
                { id: 'c1', name: 'MacBook-Pro' },
                { id: 'c2', name: 'iPhone-16' },
              ],
            }}
          />
          <SSettingsPageShell
            agentId="site.settings"
            title="Site Configuration"
            tabs={[
              { key: 'general', label: 'General' },
              { key: 'services', label: 'Services' },
            ]}
            activeTab={settingsTab}
            onTabChange={setSettingsTab}
            dirty
            onApply={onApplySettings}
          >
            <div>Settings form</div>
          </SSettingsPageShell>
        </>
      );
    }

    render(
      <OmadaProvider>
        <OmadaAgentProvider>
          <AgentDemoApp />
        </OmadaAgentProvider>
      </OmadaProvider>,
    );

    const snap1 = runtime.snapshot();
    // Deterministic lexicographical ID sort
    expect(snap1.controls.map((c) => c.id)).toEqual([
      'clients.table',
      'site.settings',
      'wlan.bandTabs',
      'wlan.enabled',
      'wlan.psk',
      'wlan.radiusSecret',
      'wlan.security',
      'wlan.ssid',
    ]);
    expect(snap1.actions.map((a) => a.id)).toEqual(['device.reboot']);

    // Secret controls never leak plaintext in snapshot() or query()
    const pskSnap = runtime.query({ id: 'wlan.psk' })[0];
    expect(pskSnap.secret).toBe(true);
    expect(pskSnap.hasValue).toBe(true);
    expect(pskSnap.value).toBe(OMADA_SECRET_MASK);

    const radiusSnap = runtime.query({ id: 'wlan.radiusSecret' })[0];
    expect(radiusSnap.secret).toBe(true);
    expect(radiusSnap.value).toBe(OMADA_SECRET_MASK);

    // Mutate controls via act() and verify synchronous post-mutation return values
    reactAct(() => {
      const toggleRes = runtime.act('wlan.enabled', 'toggle');
      expect(toggleRes.ok).toBe(true);
      expect(toggleRes.value).toBe(true);
      expect(runtime.act('wlan.security', 'select', 'wpa3').ok).toBe(true);
      expect(runtime.act('wlan.ssid', 'setValue', 'Omada-WiFi7').ok).toBe(true);
      const pskRes = runtime.act('wlan.psk', 'setValue', 'UpdatedSecret999!');
      expect(pskRes.ok).toBe(true);
      expect(pskRes.value).toBe(OMADA_SECRET_MASK);
      expect(runtime.act('wlan.bandTabs', 'selectTab', '5g').ok).toBe(true);
      expect(runtime.act('wlan.bandTabs', 'selectTab', 'nonexistent').ok).toBe(false);
      expect(runtime.act('clients.table', 'selectTab', 'wireless').ok).toBe(true);
      expect(runtime.act('clients.table', 'selectTab', 'nonexistent').ok).toBe(false);
      expect(runtime.act('clients.table', 'search', 'MacBook').ok).toBe(true);
      expect(runtime.act('clients.table', 'clearSelection').ok).toBe(true);
      expect(runtime.act('site.settings', 'selectTab', 'services').ok).toBe(true);
      expect(runtime.act('site.settings', 'apply').ok).toBe(true);
    });

    expect(runtime.query({ id: 'wlan.enabled' })[0].value).toBe(true);
    expect(runtime.query({ id: 'wlan.security' })[0].value).toBe('wpa3');
    expect(runtime.query({ id: 'wlan.ssid' })[0].value).toBe('Omada-WiFi7');
    expect(runtime.query({ id: 'wlan.psk' })[0].value).toBe(OMADA_SECRET_MASK);
    expect(runtime.query({ id: 'wlan.bandTabs' })[0].value).toBe('5g');
    expect(runtime.query({ id: 'clients.table' })[0].value).toEqual({
      activeTab: 'wireless',
      searchValue: 'MacBook',
      rowCount: 2,
      selectedCount: 1,
    });
    expect(onClearSelection).toHaveBeenCalledTimes(1);
    expect(runtime.query({ id: 'site.settings' })[0].value).toMatchObject({
      activeTab: 'services',
      dirty: true,
    });
    expect(onApplySettings).toHaveBeenCalledTimes(1);

    // Standalone action execution
    const actionRes = runtime.act('device.reboot');
    expect(actionRes.ok).toBe(true);
    expect(actionRes.result).toBe('reboot-queued');

    // Clear action returns deterministic empty string synchronously
    let clearRes!: ReturnType<OmadaAgentRuntime['act']>;
    reactAct(() => {
      clearRes = runtime.act('wlan.ssid', 'clear');
    });
    expect(clearRes.ok).toBe(true);
    expect(clearRes.value).toBe('');
    expect(runtime.query({ id: 'wlan.ssid' })[0].value).toBe('');
  });

  it('enforces allow permission policies (wildcards, denylists, read=false, and disabled controls)', () => {
    let runtime!: OmadaAgentRuntime;

    const { rerender } = render(
      <OmadaProvider>
        <OmadaAgentProvider
          allow={{
            read: true,
            act: ['dns.*'],
            deniedIds: ['dns.locked'],
          }}
        >
          <RuntimeProbe onRuntime={(rt) => (runtime = rt)} />
          <SSwitch agentId="dns.proxy" label="DNS Proxy" defaultChecked={false} />
          <SSwitch agentId="dns.locked" label="Locked DNS" defaultChecked={false} />
          <SSwitch agentId="dns.disabledCtrl" label="Disabled DNS" disabled defaultChecked={false} />
          <SSwitch agentId="wan.nat" label="WAN NAT" defaultChecked={false} />
        </OmadaAgentProvider>
      </OmadaProvider>,
    );

    // Allowed wildcard control succeeds
    let allowedRes!: ReturnType<OmadaAgentRuntime['act']>;
    reactAct(() => {
      allowedRes = runtime.act('dns.proxy', 'setValue', true);
    });
    expect(allowedRes.ok).toBe(true);

    // Denylisted ID blocked
    expect(runtime.canAct('dns.locked')).toBe(false);
    expect(runtime.act('dns.locked', 'toggle').ok).toBe(false);

    // Outside allowlist blocked
    expect(runtime.canAct('wan.nat')).toBe(false);
    expect(runtime.act('wan.nat', 'toggle').ok).toBe(false);

    // Disabled control rejected even when permitted by wildcard
    const disabledRes = runtime.act('dns.disabledCtrl', 'toggle');
    expect(disabledRes.ok).toBe(false);
    expect(disabledRes.error).toContain('disabled');

    // Read=false hides snapshots and queries
    rerender(
      <OmadaProvider>
        <OmadaAgentProvider allow={{ read: false, act: false }}>
          <RuntimeProbe onRuntime={(rt) => (runtime = rt)} />
          <SSwitch agentId="dns.proxy" label="DNS Proxy" defaultChecked={false} />
        </OmadaAgentProvider>
      </OmadaProvider>,
    );

    expect(runtime.snapshot()).toEqual({ controls: [], actions: [] });
    expect(runtime.query('dns')).toEqual([]);
  });

  it('supports expanded agentId components (STable, SDrawer, SDetailInspectorDrawer, SModal, SStepModal, SCheckbox, SRadio, SNumberInput, SDatePicker, SRangePicker)', () => {
    let runtime!: OmadaAgentRuntime;
    const onRowClicked = vi.fn();
    const onModalConfirm = vi.fn();
    const onWizardFinish = vi.fn();

    function ExpandedControlsHarness() {
      const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
      const [drawerOpen, setDrawerOpen] = useState(true);
      const [inspectorOpen, setInspectorOpen] = useState(true);
      const [modalOpen, setModalOpen] = useState(true);
      const [stepOpen, setStepOpen] = useState(true);
      const [singleCheck, setSingleCheck] = useState(false);
      const [groupChecks, setGroupChecks] = useState<string[]>(['2g']);
      const [radioVal, setRadioVal] = useState<string>('DoH');
      const [numVal, setNumVal] = useState<number | null>(1200);

      return (
        <>
          <RuntimeProbe onRuntime={(rt) => (runtime = rt)} />
          <STable<{ key: string; name: string; badgeNode: React.ReactNode }>
            agentId="devices.table"
            agentLabel="Devices Table"
            rowKey="key"
            densityToggle
            dataSource={[
              { key: 'ap-1', name: 'EAP650-Lobby', badgeNode: <span>JSX</span> },
              { key: 'ap-2', name: 'EAP650-Lab', badgeNode: <span>JSX2</span> },
            ]}
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Badge', dataIndex: 'badgeNode', key: 'badgeNode' },
            ]}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys),
            }}
            onRow={(record) => ({
              onClick: () => onRowClicked(record.key),
            })}
          />
          <SDrawer
            agentId="quick.drawer"
            title="Quick Drawer"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            Body
          </SDrawer>
          <SDetailInspectorDrawer
            agentId="device.inspector"
            open={inspectorOpen}
            onClose={() => setInspectorOpen(false)}
            title="EAP650-Lobby"
            tabs={[
              { key: 'overview', label: 'Overview', content: <div>Overview</div> },
              { key: 'radios', label: 'Radios', content: <div>Radios</div> },
            ]}
          />
          <SModal
            agentId="confirm.modal"
            title="Confirm Action"
            open={modalOpen}
            onOk={() => {
              onModalConfirm();
              setModalOpen(false);
            }}
            onCancel={() => setModalOpen(false)}
          >
            Modal Body
          </SModal>
          <SStepModal
            agentId="wizard.modal"
            title="Setup Wizard"
            open={stepOpen}
            onCancel={() => setStepOpen(false)}
            onFinish={() => {
              onWizardFinish();
              setStepOpen(false);
            }}
            steps={[
              { key: 's1', title: 'WAN', content: <div>Step 1</div> },
              { key: 's2', title: 'WLAN', content: <div>Step 2</div> },
            ]}
          />
          <SCheckbox
            agentId="feature.led"
            checked={singleCheck}
            onChange={(e) => setSingleCheck(e.target.checked)}
          >
            Site LED
          </SCheckbox>
          <SCheckbox.Group
            agentId="wlan.bands"
            aria-label="WLAN Bands"
            value={groupChecks}
            onChange={(vals) => setGroupChecks(vals as string[])}
            options={[
              { label: '2.4 GHz', value: '2g' },
              { label: '5 GHz', value: '5g' },
              { label: '6 GHz', value: '6g' },
            ]}
          />
          <SRadio agentId="standalone.radio">Standalone Radio</SRadio>
          <SRadio.Group
            agentId="dns.proxyType"
            aria-label="DNS Proxy Type"
            variant="capsule"
            value={radioVal}
            onChange={(e) => setRadioVal(String(e.target.value))}
            options={[
              { label: 'DoH', value: 'DoH' },
              { label: 'DoT', value: 'DoT' },
            ]}
          />
          <SNumberInput
            agentId="dns.ttl"
            aria-label="Cache TTL"
            min={60}
            max={86400}
            value={numVal}
            onChange={(v) => setNumVal(typeof v === 'number' ? v : null)}
          />
          <SDatePicker agentId="schedule.date" aria-label="Maintenance Date" />
          <SRangePicker
            agentId="telemetry.range"
            capsule
            defaultPreset="1d"
          />
        </>
      );
    }

    render(
      <OmadaProvider>
        <OmadaAgentProvider>
          <ExpandedControlsHarness />
        </OmadaAgentProvider>
      </OmadaProvider>,
    );

    // Ensure snapshot is 100% JSON-serializable (no JSX elements leaked from STable rows)
    const serialized = JSON.stringify(runtime.snapshot());
    expect(serialized).toContain('EAP650-Lobby');
    expect(serialized).not.toContain('badgeNode');

    reactAct(() => {
      expect(runtime.act('devices.table', 'setDensity', 'compact').ok).toBe(true);
      expect(runtime.act('devices.table', 'selectRows', ['ap-2']).ok).toBe(true);
      expect(runtime.act('devices.table', 'clickRow', 'ap-1').ok).toBe(true);
      expect(runtime.act('device.inspector', 'selectTab', 'radios').ok).toBe(true);
      expect(runtime.act('device.inspector', 'toggleExpand').ok).toBe(true);
      expect(runtime.act('quick.drawer', 'close').ok).toBe(true);
      expect(runtime.act('confirm.modal', 'confirm').ok).toBe(true);
      expect(runtime.act('wizard.modal', 'nextStep').ok).toBe(true);
      expect(runtime.act('wizard.modal', 'finish').ok).toBe(true);
      expect(runtime.act('feature.led', 'toggle').ok).toBe(true);
      expect(runtime.act('wlan.bands', 'toggleOption', '5g').ok).toBe(true);
      expect(runtime.act('standalone.radio', 'select').ok).toBe(true);
      expect(runtime.act('dns.proxyType', 'setValue', 'DoT').ok).toBe(true);
      expect(runtime.act('dns.ttl', 'setValue', 3600).ok).toBe(true);
      expect(runtime.act('dns.ttl', 'setValue', 10).ok).toBe(false); // below min=60
      expect(runtime.act('schedule.date', 'setValue', '2026-11-25').ok).toBe(true);
      expect(runtime.act('telemetry.range', 'selectPreset', '1w').ok).toBe(true);
    });

    expect(onRowClicked).toHaveBeenCalledWith('ap-1');
    expect(onModalConfirm).toHaveBeenCalledTimes(1);
    expect(onWizardFinish).toHaveBeenCalledTimes(1);
    expect(runtime.query({ id: 'devices.table' })[0].value).toMatchObject({
      density: 'compact',
      selectedRowKeys: ['ap-2'],
    });
    expect(runtime.query({ id: 'device.inspector' })[0].value).toEqual({
      open: true,
      expanded: true,
      activeTab: 'radios',
    });
    expect(runtime.query({ id: 'quick.drawer' })[0].value).toBe(false);
    expect(runtime.query({ id: 'feature.led' })[0].value).toBe(true);
    expect(runtime.query({ id: 'wlan.bands' })[0].value).toEqual(['2g', '5g']);
    expect(runtime.query({ id: 'dns.proxyType' })[0].value).toBe('DoT');
    expect(runtime.query({ id: 'dns.ttl' })[0].value).toBe(3600);
    expect(runtime.query({ id: 'schedule.date' })[0].value).toBe('2026-11-25');
    expect(runtime.query({ id: 'telemetry.range' })[0].value).toMatchObject({
      preset: '1w',
    });
  });

  it('registers WebMCP tools (snapshot, query, act), supports batch steps with stop-on-failure, and cleans up on unmount', async () => {
    const registeredTools = new Map<string, OmadaWebMcpToolDefinition>();
    const unregisterSpy = vi.fn((name: string) => {
      registeredTools.delete(name);
    });
    let capturedSignal: AbortSignal | undefined;

    const mockModelContext = {
      registerTool: vi.fn(
        (tool: OmadaWebMcpToolDefinition, opts?: { signal?: AbortSignal }) => {
          registeredTools.set(tool.name, tool);
          capturedSignal = opts?.signal;
          opts?.signal?.addEventListener('abort', () => {
            registeredTools.delete(tool.name);
          });
        },
      ),
      unregisterTool: unregisterSpy,
    };

    Object.defineProperty(document, 'modelContext', {
      value: mockModelContext,
      configurable: true,
      writable: true,
    });

    const { unmount } = render(
      <OmadaProvider>
        <OmadaAgentProvider
          exposeWindowBridge
          registerWebMcp={{ allow: ['dns.*'] }}
        >
          <SSwitch agentId="dns.enabled" label="DNS Proxy" defaultChecked={false} />
          <SInput agentId="dns.server" aria-label="Primary DNS" defaultValue="1.1.1.1" />
          <SPasswordInput agentId="dns.token" aria-label="DoH Token" defaultValue="tok-secret" />
          <SSwitch agentId="system.reboot" label="Reboot" defaultChecked={false} />
        </OmadaAgentProvider>
      </OmadaProvider>,
    );

    const win = window as unknown as { __OMADA_AGENT__?: OmadaAgentRuntime };
    expect(win.__OMADA_AGENT__).toBeDefined();
    expect(OMADA_AGENT_TOOLS.map((t) => t.name)).toEqual(['snapshot', 'query', 'act']);
    expect(Array.from(registeredTools.keys())).toEqual(['snapshot', 'query', 'act']);

    const snapTool = registeredTools.get('snapshot')!;
    expect(snapTool.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
    const actTool = registeredTools.get('act')!;
    expect(actTool.annotations).toEqual({
      readOnlyHint: false,
      consequentialHint: true,
      untrustedContentHint: true,
    });

    const snapRes = await snapTool.execute({});
    expect(snapRes.isError).toBeUndefined();
    expect(JSON.stringify(snapRes.structuredContent)).toContain(OMADA_SECRET_MASK);
    expect(JSON.stringify(snapRes.structuredContent)).not.toContain('tok-secret');

    const queryRes = await registeredTools.get('query')!.execute({ kind: 'password' });
    expect(queryRes.structuredContent).toMatchObject([
      { id: 'dns.token', value: OMADA_SECRET_MASK, secret: true },
    ]);

    // Multi-step batch act that stops on step 2 (denied by secondary WebMCP allow=['dns.*'])
    let batchRes!: Awaited<ReturnType<typeof actTool.execute>>;
    await reactAct(async () => {
      batchRes = await actTool.execute({
        steps: [
          { id: 'dns.enabled', action: 'setValue', value: true },
          { id: 'system.reboot', action: 'toggle' },
          { id: 'dns.server', action: 'setValue', value: '9.9.9.9' },
        ],
      });
    });

    expect(batchRes.isError).toBe(true);
    expect(batchRes.structuredContent).toMatchObject({
      ok: false,
      failedStep: 1,
    });
    // Step 0 remained applied; Step 2 did NOT execute
    expect(win.__OMADA_AGENT__!.query({ id: 'dns.enabled' })[0].value).toBe(true);
    expect(win.__OMADA_AGENT__!.query({ id: 'dns.server' })[0].value).toBe('1.1.1.1');

    // Manual standalone registerWebMcpTools with custom prefix also works
    const manualCleanup = registerWebMcpTools(win.__OMADA_AGENT__!, {
      toolPrefix: 'omada_',
      modelContext: mockModelContext,
    });
    expect(registeredTools.has('omada_snapshot')).toBe(true);
    manualCleanup();
    expect(registeredTools.has('omada_snapshot')).toBe(false);

    unmount();
    expect(capturedSignal?.aborted).toBe(true);
    expect(registeredTools.size).toBe(0);
    expect(win.__OMADA_AGENT__).toBeUndefined();
    delete (document as unknown as { modelContext?: unknown }).modelContext;
  });

  it('drives EmulatorApp across routes (Dashboard -> WLAN -> DNS) in a single actAsync batch', async () => {
    render(
      <OmadaProvider>
        <EmulatorApp initialRoute="dashboard" />
      </OmadaProvider>,
    );

    const win = window as unknown as { __OMADA_AGENT__?: OmadaAgentRuntime };
    expect(win.__OMADA_AGENT__).toBeDefined();

    let batchResult!: OmadaAgentBatchResult;
    const actEnvTarget = globalThis as Record<string, unknown>;
    const prevActEnv = actEnvTarget.IS_REACT_ACT_ENVIRONMENT;
    actEnvTarget.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      batchResult = await win.__OMADA_AGENT__!.actAsync({
        steps: [
          { id: 'emulator.navigate', value: 'wlan' },
          {
            id: 'wlan.createSsid',
            value: {
              ssidName: 'Corp-WiFi7-Agent',
              security: 'WPA-Personal',
              passphrase: 'UltraSecretPassphrase!',
              vlan: '20',
            },
          },
          { id: 'emulator.navigate', value: 'dns' },
          { id: 'dns.subTabs', action: 'selectTab', value: 'dns-proxy' },
          { id: 'dns.proxyType', action: 'setValue', value: 'DoT' },
          { id: 'dns.applyProxySettings' },
        ],
      });
    } finally {
      actEnvTarget.IS_REACT_ACT_ENVIRONMENT = prevActEnv;
    }

    expect(batchResult.ok).toBe(true);
    const serialized = JSON.stringify(batchResult);
    expect(serialized).not.toContain('UltraSecretPassphrase!');
    expect(win.__OMADA_AGENT__!.query({ id: 'dns.proxyType' })[0].value).toBe('DoT');
  });
});
