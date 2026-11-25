import React, { useState } from 'react';
import '@chenyqthu/omada-ui-kit/style.css';
import {
  OmadaAgentProvider,
  OmadaProvider,
  SEmulatorShell,
  SExpandableSection,
  SInput,
  SIpInput,
  SSelect,
  SSettingsInfoBanner,
  SSettingsPageShell,
  SSettingsRow,
  SSettingsSection,
  SSwitch,
  useOmadaAgentAction,
  validateIpv4,
} from '@chenyqthu/omada-ui-kit';

const PRESET_SERVERS: Record<string, string> = {
  cloudflare: '1.1.1.1',
  quad9: '9.9.9.9',
  google: '8.8.8.8',
};

const SettingsContent: React.FC = () => {
  const [tab, setTab] = useState('dns-proxy');
  const [enabled, setEnabled] = useState(true);
  const [primaryDns, setPrimaryDns] = useState('1.1.1.1');
  const [siteName, setSiteName] = useState('Main Office Floor');
  const [resolverMode, setResolverMode] = useState('doh');
  const [dirty, setDirty] = useState(false);

  useOmadaAgentAction({
    id: 'dns.setUpstreamServer',
    label: 'Set Upstream DNS IPv4',
    description: 'Validates and sets the upstream DNS server IPv4 address (marking settings dirty).',
    handler: (ip) => {
      const candidate = String(ip ?? '').trim();
      if (!validateIpv4(candidate)) {
        throw new Error(`Invalid IPv4 address "${candidate}".`);
      }
      setPrimaryDns(candidate);
      setDirty(true);
      return candidate;
    },
  });

  useOmadaAgentAction({
    id: 'dns.applySecurityPreset',
    label: 'Apply Encrypted DNS Preset',
    description: 'Applies "cloudflare" (1.1.1.1), "quad9" (9.9.9.9), or "google" (8.8.8.8) DoH preset.',
    handler: (presetName) => {
      const key = String(presetName ?? '').trim().toLowerCase();
      const ip = PRESET_SERVERS[key];
      if (!ip) {
        throw new Error(`Unknown preset "${key}". Expected cloudflare, quad9, or google.`);
      }
      setEnabled(true);
      setResolverMode('doh');
      setPrimaryDns(ip);
      setDirty(true);
      return { preset: key, primaryDns: ip, resolverMode: 'doh' };
    },
  });

  useOmadaAgentAction({
    id: 'dns.saveConfiguration',
    label: 'Save DNS Configuration',
    description: 'Commits pending DNS changes and clears the dirty footer bar.',
    handler: () => {
      setDirty(false);
      return { saved: true, enabled, siteName, primaryDns, resolverMode };
    },
  });

  return (
    <SEmulatorShell activeKey="dns" onSelect={() => {}} controllerName="Headquarters Building">
      <SSettingsPageShell
        agentId="dns.settings"
        title="DNS & Network Services"
        tabs={[
          { key: 'dns-proxy', label: 'DNS Proxy' },
          { key: 'dns-cache', label: 'DNS Cache' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        helpTitle="DNS Configuration"
        helpDescription="Configure local DNS caching and upstream DoH resolvers for managed gateways."
        dirty={dirty}
        onApply={() => setDirty(false)}
        onCancel={() => setDirty(false)}
      >
        <SSettingsInfoBanner>
          DNS Proxy forwards client DNS lookups over encrypted DoH servers configured on the site gateway.
        </SSettingsInfoBanner>

        <SSettingsSection title={tab === 'dns-proxy' ? 'DNS Proxy Policy' : 'Cache Retention'}>
          <SSettingsRow label="Service Status">
            <SSwitch
              agentId="dns.enabled"
              aria-label="Service Status"
              checked={enabled}
              onChange={(checked) => {
                setEnabled(checked);
                setDirty(true);
              }}
            />
          </SSettingsRow>
          <SSettingsRow label="Site Identifier">
            <SInput
              agentId="dns.siteName"
              aria-label="Site Identifier"
              value={siteName}
              onChange={(e) => {
                setSiteName(e.target.value);
                setDirty(true);
              }}
            />
          </SSettingsRow>
          <SSettingsRow label="Upstream DNS Server">
            <SIpInput
              value={primaryDns}
              onChange={(val) => {
                setPrimaryDns(val);
                setDirty(true);
              }}
            />
          </SSettingsRow>
        </SSettingsSection>

        <SExpandableSection agentId="dns.advanced" title="Advanced Options">
          <SSettingsRow label="Resolver Mode">
            <SSelect
              agentId="dns.resolverMode"
              aria-label="Resolver Mode"
              value={resolverMode}
              onChange={(val) => {
                setResolverMode(String(val));
                setDirty(true);
              }}
              options={[
                { value: 'doh', label: 'DNS over HTTPS (DoH)' },
                { value: 'dot', label: 'DNS over TLS (DoT)' },
              ]}
            />
          </SSettingsRow>
        </SExpandableSection>
      </SSettingsPageShell>
    </SEmulatorShell>
  );
};

export const SettingsTemplate: React.FC = () => (
  <OmadaProvider defaultThemeMode="light">
    <OmadaAgentProvider exposeWindowBridge>
      <SettingsContent />
    </OmadaAgentProvider>
  </OmadaProvider>
);
