import React, { useState } from 'react';
import '@chenyqthu/omada-ui-kit/style.css';
import {
  OmadaAgentProvider,
  OmadaProvider,
  SAclRuleBuilder,
  SButton,
  SCheckbox,
  SEmulatorShell,
  SExpandableSection,
  SFilterTableBlock,
  SInlineFormRow,
  SInlineRuleEditorLayout,
  SInput,
  SRadio,
  SSelect,
  SSwitch,
  useOmadaAgentAction,
  type ColumnsType,
  type SAclEndpointValue,
  type SAclObjectOption,
  type SAclPolicy,
} from '@chenyqthu/omada-ui-kit';

interface AclRow {
  key: string;
  enabled: boolean;
  description: string;
  policy: SAclPolicy;
  protocols: string;
  source: string;
  destination: string;
}

const OBJECTS: Record<string, SAclObjectOption[]> = {
  Network: [
    { value: 'Default', label: 'Default' },
    { value: 'interface-vlan100', label: 'interface-vlan100' },
    { value: 'interface-vlan4090', label: 'interface-vlan4090' },
    { value: 'Guest_VLAN_200', label: 'Guest_VLAN_200' },
  ],
  'IP Group': [
    { value: 'IPGroup_Any', label: 'IPGroup_Any' },
    { value: 'ip-1', label: 'ip-1' },
  ],
};

const INITIAL_RULES: AclRow[] = [
  { key: '1', enabled: true, description: 'Gateway_ACL_1', policy: 'Permit', protocols: 'All', source: 'Network:interface-vlan100', destination: 'IP Group:ip-1' },
  { key: '2', enabled: false, description: 'Gateway_ACL_2', policy: 'Deny', protocols: 'TCP', source: 'Network:Guest_VLAN_200', destination: 'IP Group:IPGroup_Any' },
];

const AclRulesContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('gateway');
  const [rules, setRules] = useState<AclRow[]>(INITIAL_RULES);
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState('Gateway_ACL_New');
  const [enabled, setEnabled] = useState(true);
  const [policy, setPolicy] = useState<SAclPolicy>('Permit');
  const [source, setSource] = useState<SAclEndpointValue>({
    type: 'Network',
    items: ['interface-vlan100'],
  });
  const [dest, setDest] = useState<SAclEndpointValue>({
    type: 'IP Group',
    items: ['ip-1'],
  });

  useOmadaAgentAction({
    id: 'acl.openRuleEditor',
    label: 'Open ACL Rule Creator',
    description: 'Opens the inline ACL rule builder pane.',
    handler: () => {
      setEditing(true);
      return true;
    },
  });

  useOmadaAgentAction({
    id: 'acl.createRule',
    label: 'Create ACL Rule',
    description: 'Appends a new ACL rule ({ description, policy, enabled, source, destination }) to the rule table.',
    handler: (payload) => {
      const input = (payload && typeof payload === 'object' ? payload : {}) as Partial<AclRow>;
      const nextRule: AclRow = {
        key: String(rules.length + 1),
        enabled: input.enabled ?? true,
        description: String(input.description || 'Gateway_ACL_Rule'),
        policy: input.policy === 'Deny' ? 'Deny' : 'Permit',
        protocols: input.protocols ? String(input.protocols) : 'All',
        source: input.source ? String(input.source) : 'Network:Guest_VLAN_200',
        destination: input.destination ? String(input.destination) : 'IP Group:IPGroup_Any',
      };
      setRules((prev) => [...prev, nextRule]);
      setEditing(false);
      return nextRule;
    },
  });

  useOmadaAgentAction({
    id: 'acl.toggleRule',
    label: 'Toggle ACL Rule Enabled State',
    description: 'Enables or disables an ACL rule by key or description.',
    handler: (payload) => {
      const p = (payload && typeof payload === 'object' ? payload : { key: String(payload ?? '') }) as {
        key?: string;
        enabled?: boolean;
      };
      const targetKey = String(p.key ?? '');
      const target = rules.find((r) => r.key === targetKey || r.description === targetKey);
      if (!target) {
        throw new Error(`ACL rule "${targetKey}" not found.`);
      }
      const nextEnabled = p.enabled !== undefined ? Boolean(p.enabled) : !target.enabled;
      setRules((prev) =>
        prev.map((r) => (r.key === target.key ? { ...r, enabled: nextEnabled } : r)),
      );
      return { key: target.key, enabled: nextEnabled };
    },
  });

  const handleSave = () => {
    setRules((prev) => [
      ...prev,
      {
        key: String(prev.length + 1),
        enabled,
        description: desc || 'ACL_Rule',
        policy,
        protocols: 'All',
        source: `${source.type ?? 'Network'}:${source.items.join(', ')}`,
        destination: `${dest.type ?? 'IP Group'}:${dest.items.join(', ')}`,
      },
    ]);
    setEditing(false);
  };

  const columns: ColumnsType<AclRow> = [
    { title: 'Index', key: 'idx', render: (_v, _r, idx) => idx + 1 },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (checked: boolean, row) => (
        <SSwitch
          aria-label={`Enable ACL rule ${row.description}`}
          checked={checked}
          onChange={(next) =>
            setRules((prev) =>
              prev.map((r) => (r.key === row.key ? { ...r, enabled: next } : r)),
            )
          }
        />
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Policy', dataIndex: 'policy', key: 'policy' },
    { title: 'Protocols', dataIndex: 'protocols', key: 'protocols' },
    { title: 'Source', dataIndex: 'source', key: 'source' },
    { title: 'Destination', dataIndex: 'destination', key: 'destination' },
  ];

  return (
    <SEmulatorShell activeKey="acl" onSelect={() => {}} controllerName="Headquarters Building">
      <div style={{ padding: '16px 24px' }}>
        {editing ? (
          <SInlineRuleEditorLayout
            title="Create New Rule"
            onBack={() => setEditing(false)}
            onSubmit={handleSave}
          >
            <SInlineFormRow label="Description" htmlFor="acl-desc">
              <SInput
                id="acl-desc"
                agentId="acl.form.description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ width: 350 }}
              />
            </SInlineFormRow>
            <SInlineFormRow label="Status">
              <SCheckbox
                agentId="acl.form.enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              >
                Enable
              </SCheckbox>
            </SInlineFormRow>
            <SInlineFormRow label="Policy">
              <SRadio.Group
                agentId="acl.form.policy"
                aria-label="ACL policy"
                value={policy}
                onChange={(e) => setPolicy(e.target.value as SAclPolicy)}
                options={[
                  { label: 'Deny', value: 'Deny' },
                  { label: 'Permit', value: 'Permit' },
                ]}
              />
            </SInlineFormRow>
            <SInlineFormRow label="Rule">
              <SAclRuleBuilder
                policy={policy}
                source={source}
                onSourceChange={setSource}
                destination={dest}
                onDestinationChange={setDest}
                sourceTypeOptions={[
                  { value: 'Network', label: 'Network' },
                  { value: 'IP Group', label: 'IP Group', creatable: true },
                ]}
                destinationTypeOptions={[
                  { value: 'IP Group', label: 'IP Group', creatable: true },
                ]}
                getItemsForType={(type) => OBJECTS[type] ?? []}
              />
            </SInlineFormRow>
            <SExpandableSection title="Advanced Settings">
              <SInlineFormRow label="States Type">
                <SSelect
                  aria-label="States Type"
                  defaultValue="auto"
                  style={{ width: 350 }}
                  options={[{ value: 'auto', label: 'Auto (New / Established / Related)' }]}
                />
              </SInlineFormRow>
            </SExpandableSection>
          </SInlineRuleEditorLayout>
        ) : (
          <SFilterTableBlock<AclRow>
            agentId="acl.table"
            tabs={[
              { key: 'gateway', label: 'Gateway ACL' },
              { key: 'switch', label: 'Switch ACL' },
              { key: 'eap', label: 'EAP ACL' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            title="ACL Rules"
            primaryAction={
              <SButton variant="primary" onClick={() => setEditing(true)}>
                + Create New Rule
              </SButton>
            }
            tableProps={{
              rowKey: 'key',
              dataSource: rules,
              pagination: false,
              columns,
            }}
          />
        )}
      </div>
    </SEmulatorShell>
  );
};

export const AclRulesTemplate: React.FC = () => (
  <OmadaProvider defaultThemeMode="light">
    <OmadaAgentProvider exposeWindowBridge>
      <AclRulesContent />
    </OmadaAgentProvider>
  </OmadaProvider>
);
