import React, { useState } from 'react';
import { Checkbox, Radio } from 'antd';
import { Check, Copy, Plus, Wand2 } from 'lucide-react';
import {
  EMULATOR_GLOBAL_NAV_GROUPS,
  EMULATOR_NAV_GROUPS,
  SAclRuleBuilder,
  SButton,
  SCard,
  SDescriptions,
  SDetailInspectorDrawer,
  SDeviceStatus,
  SEmulatorShell,
  SFilterTableBlock,
  SInlineFormRow,
  SInlineRuleEditorLayout,
  SInput,
  SMasterDetailSplitBlock,
  SPageHeader,
  SPortPanel,
  SSwitchPortPicker,
  STag,
  SWizardModal,
  useOmadaFeedback,
  type DeviceStatusType,
  type SAclEndpointValue,
  type SAclPolicy,
  type SPortItem,
  type SSwitchPortDevice,
} from '@/omada';

interface BlockSnippetProps {
  title: string;
  code: string;
}

const CopyCodeButton: React.FC<BlockSnippetProps> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useOmadaFeedback();

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      toast.success(`Copied ${title} JSX snippet`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.info(`Selected ${title} snippet`);
    }
  };

  return (
    <SButton
      size="small"
      variant="secondary"
      icon={copied ? <Check size={13} /> : <Copy size={13} />}
      onClick={handleCopy}
    >
      {copied ? 'Copied' : 'Copy TSX'}
    </SButton>
  );
};

interface SampleApRow {
  key: string;
  name: string;
  model: string;
  status: DeviceStatusType;
  ip: string;
  clients: number;
}

const SAMPLE_APS: SampleApRow[] = [
  { key: 'ap-1', name: 'EAP650-Lobby-01', model: 'EAP650', status: 'connected', ip: '192.168.10.21', clients: 38 },
  { key: 'ap-2', name: 'EAP650-Conf-02', model: 'EAP650', status: 'connected', ip: '192.168.10.22', clients: 24 },
  { key: 'ap-3', name: 'EAP610-Yard-03', model: 'EAP610-Outdoor', status: 'heartbeat-missed', ip: '192.168.10.35', clients: 4 },
];

const SAMPLE_PORTS_1: SPortItem[] = Array.from({ length: 10 }, (_, idx) => ({
  id: idx + 1,
  type: idx >= 8 ? 'sfp' : 'rj45',
  status: idx >= 8 ? '10g' : idx < 5 ? '2.5g' : 'disconnected',
  badges: idx < 3 ? ['poe'] : idx === 8 ? ['uplink'] : undefined,
}));

const SAMPLE_PORTS_2: SPortItem[] = Array.from({ length: 8 }, (_, idx) => ({
  id: idx + 1,
  type: 'rj45',
  status: idx < 4 ? '1g' : 'disconnected',
}));

const SAMPLE_SWITCHES: SSwitchPortDevice[] = [
  { id: 'sw-1', name: 'CTOOffice_Switch_1', model: 'SG3210XHP-M2', ports: SAMPLE_PORTS_1 },
  { id: 'sw-2', name: 'SalesDept_Switch_3', model: 'SG2008P', ports: SAMPLE_PORTS_2 },
];

const MASTER_ITEMS = [
  { key: 'vlan-1', title: 'Default (VLAN 1)', subtitle: '192.168.0.1/24', badge: <STag color="green">Active</STag> },
  { key: 'vlan-100', title: 'interface-vlan100', subtitle: '192.168.100.1/24', badge: <STag color="blue">Staff</STag> },
  { key: 'vlan-200', title: 'Guest_VLAN_200', subtitle: '192.168.200.1/24', badge: <STag color="orange">Isolated</STag> },
];

export const BlocksSection: React.FC = () => {
  const { toast } = useOmadaFeedback();

  // 1. SEmulatorShell Global / Site + extraNavItems demo
  const [shellScope, setShellScope] = useState<'site' | 'global'>('site');
  const [shellNavKey, setShellNavKey] = useState('dashboard');
  const [injectCustomNav, setInjectCustomNav] = useState(true);

  // 2. SFilterTableBlock + SDetailInspectorDrawer
  const [tableSearch, setTableSearch] = useState('');
  const [selectedAp, setSelectedAp] = useState<SampleApRow | null>(null);

  // 3. SInlineRuleEditorLayout + SAclRuleBuilder
  const [ruleDesc, setRuleDesc] = useState('Block_Guest_To_Core');
  const [rulePolicy, setRulePolicy] = useState<SAclPolicy>('Deny');
  const [ruleSource, setRuleSource] = useState<SAclEndpointValue>({ type: 'Network', items: ['Guest_VLAN_200'] });
  const [ruleDest, setRuleDest] = useState<SAclEndpointValue>({ type: 'IP Group', items: ['ip-1'] });

  // 4. SMasterDetailSplitBlock
  const [masterKey, setMasterKey] = useState('vlan-100');

  // 5. SWizardModal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardName, setWizardName] = useState('Branch_Guest_SSID');

  // 6. SSwitchPortPicker
  const [portMap, setPortMap] = useState<Record<string, number[]>>({ 'sw-1': [1, 2, 9] });

  const filteredAps = SAMPLE_APS.filter(
    (d) =>
      !tableSearch.trim() ||
      d.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      d.ip.includes(tableSearch),
  );

  return (
    <div className="space-y-6">
      <SPageHeader
        title="Reusable Omada Blocks"
        subtitle="High-reuse multi-component compositions for rapid PRD prototypes (bundled directly in @chenyqthu/omada-ui-kit)"
      />

      {/* Block 1: SEmulatorShell scope="site" | "global" & extraNavItems */}
      <SCard
        title="SEmulatorShell (Site / Global Scope + Incremental Nav Injection)"
        subtitle="Switch between Official Site View and Global Organization View, or inject custom PRD routes with extraNavItems."
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Radio.Group
              size="small"
              value={shellScope}
              onChange={(e) => {
                setShellScope(e.target.value);
                setShellNavKey('dashboard');
              }}
            >
              <Radio.Button value="site">Site View ({EMULATOR_NAV_GROUPS.length} sections)</Radio.Button>
              <Radio.Button value="global">Global View ({EMULATOR_GLOBAL_NAV_GROUPS.length} sections)</Radio.Button>
            </Radio.Group>
            <Checkbox
              checked={injectCustomNav}
              onChange={(e) => setInjectCustomNav(e.target.checked)}
            >
              Inject PRD Item
            </Checkbox>
            <CopyCodeButton
              title="SEmulatorShell"
              code={`<SEmulatorShell\n  scope="${shellScope}"\n  activeKey={activeKey}\n  onSelect={setActiveKey}\n  extraNavItems={[{\n    groupKey: 'monitoring',\n    item: { key: 'ap-sla', label: 'AP SLA Monitor', iconName: 'sidebar-icon-icon-ai-monitor-off', activeIconName: 'sidebar-icon-icon-ai-monitor-on' }\n  }]}\n>\n  {children}\n</SEmulatorShell>`}
            />
          </div>
        }
      >
        <div className="overflow-hidden rounded-lg border border-[var(--omada-border-divider)]">
          <SEmulatorShell
            embedded
            scope={shellScope}
            activeKey={shellNavKey}
            onSelect={setShellNavKey}
            extraNavItems={
              injectCustomNav
                ? [
                    {
                      groupKey: shellScope === 'global' ? 'operations' : 'monitoring',
                      item: {
                        key: 'ap-sla',
                        label: 'AP SLA Monitor',
                        iconName: 'sidebar-icon-icon-ai-monitor-off',
                        activeIconName: 'sidebar-icon-icon-ai-monitor-on',
                        badge: 'NEW',
                      },
                    },
                  ]
                : undefined
            }
          >
            <div className="p-5 pr-9">
              <SPageHeader
                title={`Preview Context: ${shellScope === 'global' ? 'Global View' : 'Site View'} / ${shellNavKey}`}
                subtitle="Rendered inside embedded SEmulatorShell with full Light/Dark theme parity."
              />
            </div>
          </SEmulatorShell>
        </div>
      </SCard>

      {/* Block 2 & 3: SFilterTableBlock + SDetailInspectorDrawer */}
      <SCard
        title="SFilterTableBlock + SDetailInspectorDrawer"
        subtitle="Toolbar + search + <|| quick-drawer clearance + STable paired with a 2-stage (420px <-> 1040px) detail inspector drawer."
        extra={
          <CopyCodeButton
            title="SFilterTableBlock"
            code={`<SFilterTableBlock\n  title="Managed Access Points"\n  searchPlaceholder="Search AP or IP"\n  searchValue={search}\n  onSearchChange={setSearch}\n  primaryAction={<SButton variant="primary">Add AP</SButton>}\n  tableProps={{ rowKey: 'key', dataSource: rows, columns }}\n/>`}
          />
        }
      >
        <SFilterTableBlock<SampleApRow>
          title="Managed Access Points"
          subtitle="Click any row to open SDetailInspectorDrawer"
          searchPlaceholder="Search AP name or IP"
          searchValue={tableSearch}
          onSearchChange={setTableSearch}
          primaryAction={
            <SButton
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setSelectedAp(SAMPLE_APS[0])}
            >
              Inspect First AP
            </SButton>
          }
          tableProps={{
            rowKey: 'key',
            dataSource: filteredAps,
            pagination: false,
            onRow: (row) => ({
              onClick: () => setSelectedAp(row),
              style: { cursor: 'pointer' },
            }),
            columns: [
              { title: 'Device Name', dataIndex: 'name', key: 'name' },
              { title: 'Model', dataIndex: 'model', key: 'model' },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: DeviceStatusType) => <SDeviceStatus status={status} />,
              },
              { title: 'IP Address', dataIndex: 'ip', key: 'ip' },
              { title: 'Clients', dataIndex: 'clients', key: 'clients' },
            ],
          }}
        />

        <SDetailInspectorDrawer
          open={Boolean(selectedAp)}
          onClose={() => setSelectedAp(null)}
          title={selectedAp?.name ?? ''}
          subtitle={selectedAp?.model}
          status={selectedAp?.status}
          tabs={
            selectedAp
              ? [
                  {
                    key: 'overview',
                    label: 'Overview',
                    content: (
                      <SDescriptions
                        column={1}
                        items={[
                          { key: 'ip', label: 'IP Address', children: selectedAp.ip },
                          { key: 'clients', label: 'Clients', children: selectedAp.clients },
                        ]}
                      />
                    ),
                  },
                  {
                    key: 'ports',
                    label: 'Ports',
                    content: <SPortPanel ports={SAMPLE_PORTS_2} />,
                  },
                ]
              : undefined
          }
        />
      </SCard>

      {/* Block 4: SInlineRuleEditorLayout + SInlineFormRow + SAclRuleBuilder */}
      <SCard
        title="SInlineRuleEditorLayout + SAclRuleBuilder"
        subtitle="Full-pane rule editor header, 210px label form rows, visual Source -> Destination dual-card builder, and footer actions."
        extra={
          <CopyCodeButton
            title="SInlineRuleEditorLayout"
            code={`<SInlineRuleEditorLayout title="Create New Rule" onBack={onBack} onSubmit={onSubmit}>\n  <SInlineFormRow label="Description"><SInput value={desc} onChange={...} /></SInlineFormRow>\n  <SInlineFormRow label="Rule"><SAclRuleBuilder policy={policy} source={source} destination={dest} ... /></SInlineFormRow>\n</SInlineRuleEditorLayout>`}
          />
        }
      >
        <SInlineRuleEditorLayout
          title="Create New Security Policy"
          onBack={() => toast.info('Back clicked')}
          onHelpClick={() => toast.info('ACL policy evaluation help')}
          onSubmit={() => toast.success(`Saved policy "${ruleDesc}" (${rulePolicy})`)}
        >
          <SInlineFormRow label="Description" htmlFor="block-rule-desc">
            <SInput
              id="block-rule-desc"
              value={ruleDesc}
              onChange={(e) => setRuleDesc(e.target.value)}
              style={{ width: 350 }}
            />
          </SInlineFormRow>
          <SInlineFormRow label="Policy">
            <Radio.Group
              value={rulePolicy}
              onChange={(e) => setRulePolicy(e.target.value as SAclPolicy)}
            >
              <Radio value="Deny">Deny</Radio>
              <Radio value="Permit">Permit</Radio>
            </Radio.Group>
          </SInlineFormRow>
          <SInlineFormRow label="Rule" tooltip="Source -> Policy -> Destination traffic rule">
            <SAclRuleBuilder
              policy={rulePolicy}
              source={ruleSource}
              onSourceChange={setRuleSource}
              destination={ruleDest}
              onDestinationChange={setRuleDest}
              sourceTypeOptions={[{ value: 'Network', label: 'Network' }]}
              destinationTypeOptions={[{ value: 'IP Group', label: 'IP Group', creatable: true }]}
              getItemsForType={(t) =>
                t === 'Network'
                  ? [
                      { value: 'Default', label: 'Default' },
                      { value: 'Guest_VLAN_200', label: 'Guest_VLAN_200' },
                    ]
                  : [
                      { value: 'IPGroup_Any', label: 'IPGroup_Any' },
                      { value: 'ip-1', label: 'ip-1' },
                    ]
              }
            />
          </SInlineFormRow>
        </SInlineRuleEditorLayout>
      </SCard>

      {/* Block 5: SMasterDetailSplitBlock */}
      <SCard
        title="SMasterDetailSplitBlock"
        subtitle="Searchable left master list paired with a flexible right detail panel (VLANs, Switch Profiles, Diagnostic Nodes)."
        extra={
          <CopyCodeButton
            title="SMasterDetailSplitBlock"
            code={`<SMasterDetailSplitBlock\n  masterTitle="LAN Networks"\n  searchable\n  items={items}\n  activeKey={activeKey}\n  onSelect={setActiveKey}\n  detailTitle="Network Configuration"\n>\n  {detailContent}\n</SMasterDetailSplitBlock>`}
          />
        }
      >
        <SMasterDetailSplitBlock
          masterTitle="LAN Networks"
          searchable
          items={MASTER_ITEMS}
          activeKey={masterKey}
          onSelect={setMasterKey}
          detailTitle={MASTER_ITEMS.find((i) => i.key === masterKey)?.title}
        >
          <SDescriptions
            column={1}
            items={[
              { key: 'subnet', label: 'Gateway / Subnet', children: MASTER_ITEMS.find((i) => i.key === masterKey)?.subtitle },
              { key: 'dhcp', label: 'DHCP Server', children: 'Enabled · Lease 120 mins' },
            ]}
          />
        </SMasterDetailSplitBlock>
      </SCard>

      {/* Block 6: SWizardModal + SSwitchPortPicker */}
      <SCard
        title="SWizardModal & SSwitchPortPicker"
        subtitle="Multi-step setup wizard modal and interactive multi-switch physical port selector."
        extra={
          <div className="flex items-center gap-2">
            <SButton
              variant="primary"
              icon={<Wand2 size={14} />}
              onClick={() => setWizardOpen(true)}
            >
              Launch Setup Wizard
            </SButton>
            <CopyCodeButton
              title="SSwitchPortPicker"
              code={`<SSwitchPortPicker switches={switches} value={portMap} onChange={setPortMap} />`}
            />
          </div>
        }
      >
        <SSwitchPortPicker
          switches={SAMPLE_SWITCHES}
          value={portMap}
          onChange={setPortMap}
        />

        <SWizardModal
          open={wizardOpen}
          title="Quick Wireless Provisioning"
          onCancel={() => setWizardOpen(false)}
          onFinish={() => {
            toast.success(`Provisioned SSID "${wizardName}"`);
            setWizardOpen(false);
          }}
          steps={[
            {
              key: 'ssid',
              title: 'SSID Basics',
              content: (
                <div className="space-y-3">
                  <div className="text-sm text-[var(--omada-text-secondary)]">
                    Enter the wireless network name for this floor:
                  </div>
                  <SInput
                    aria-label="Wizard SSID Name"
                    value={wizardName}
                    onChange={(e) => setWizardName(e.target.value)}
                  />
                </div>
              ),
              canProceed: wizardName.trim().length > 0,
            },
            {
              key: 'review',
              title: 'Review & Deploy',
              content: (
                <SDescriptions
                  column={1}
                  items={[
                    { key: 'name', label: 'SSID Name', children: wizardName },
                    { key: 'band', label: 'Bands', children: '2.4 GHz · 5 GHz · 6 GHz' },
                  ]}
                />
              ),
            },
          ]}
        />
      </SCard>
    </div>
  );
};
