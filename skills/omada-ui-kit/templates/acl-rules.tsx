import React, { useState } from 'react';
import { Checkbox, Radio } from 'antd';
import '@chenyqthu/omada-ui-kit/style.css';
import {
  OmadaProvider,
  SAclRuleBuilder,
  SButton,
  SEmulatorShell,
  SExpandableSection,
  SFilterTableBlock,
  SInlineFormRow,
  SInlineRuleEditorLayout,
  SInput,
  SSelect,
  SSwitch,
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

  const handleSave = () => {
    setRules((prev) => [
      ...prev,
      {
        key: String(Date.now()),
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
      render: (checked: boolean) => <SSwitch aria-label="Enable ACL rule" checked={checked} />,
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
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ width: 350 }}
              />
            </SInlineFormRow>
            <SInlineFormRow label="Status">
              <Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)}>
                Enable
              </Checkbox>
            </SInlineFormRow>
            <SInlineFormRow label="Policy">
              <Radio.Group value={policy} onChange={(e) => setPolicy(e.target.value as SAclPolicy)}>
                <Radio value="Deny">Deny</Radio>
                <Radio value="Permit">Permit</Radio>
              </Radio.Group>
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
                  defaultValue="auto"
                  style={{ width: 350 }}
                  options={[{ value: 'auto', label: 'Auto (New / Established / Related)' }]}
                />
              </SInlineFormRow>
            </SExpandableSection>
          </SInlineRuleEditorLayout>
        ) : (
          <SFilterTableBlock<AclRow>
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
    <AclRulesContent />
  </OmadaProvider>
);
