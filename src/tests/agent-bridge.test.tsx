import { useState } from 'react';
import { act as reactAct, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OMADA_SECRET_MASK,
  OmadaAgentProvider,
  OmadaProvider,
  SFilterTableBlock,
  SInput,
  SPasswordInput,
  SSelect,
  SSettingsPageShell,
  SSwitch,
  STabs,
  useOmadaAgent,
  useOmadaAgentAction,
  type OmadaAgentRuntime,
} from '@/omada';

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
});
