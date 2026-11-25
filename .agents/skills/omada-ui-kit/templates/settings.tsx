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
} from '@chenyqthu/omada-ui-kit';

const SettingsContent: React.FC = () => {
  const [tab, setTab] = useState('dns-proxy');
  const [enabled, setEnabled] = useState(true);
  const [primaryDns, setPrimaryDns] = useState('1.1.1.1');
  const [siteName, setSiteName] = useState('Main Office Floor');
  const [dirty, setDirty] = useState(false);

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

        <SExpandableSection title="Advanced Options">
          <SSettingsRow label="Resolver Mode">
            <SSelect
              agentId="dns.resolverMode"
              aria-label="Resolver Mode"
              defaultValue="doh"
              onChange={() => setDirty(true)}
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
    <OmadaAgentProvider>
      <SettingsContent />
    </OmadaAgentProvider>
  </OmadaProvider>
);
