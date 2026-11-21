import React, { useMemo, useState } from 'react';
import { Checkbox, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import {
  SButton,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SSelect,
  SSwitch,
  useOmadaNotification,
} from '@/omada';
import {
  ACL_OBJECT_DETAILS,
  INITIAL_EAP_ACL_RULES,
  INITIAL_GATEWAY_ACL_RULES,
  INITIAL_SWITCH_ACL_RULES,
  type AclPolicyType,
  type AclRuleRecord,
  type AclTabKey,
} from './wlanAclData';

export interface AclPageProps {
  /** Optional initial ACL sub-tab (`'gateway' | 'switch' | 'eap'`). */
  initialTab?: AclTabKey;
}

const TAB_TITLE_MAP: Record<AclTabKey, string> = {
  gateway: 'Gateway ACL',
  switch: 'Switch ACL',
  eap: 'EAP ACL',
};

const SOURCE_OPTIONS_BY_TAB: Record<AclTabKey, Array<{ label: string; value: string }>> = {
  gateway: [
    { label: 'Network:interface-vlan100', value: 'Network:interface-vlan100' },
    { label: 'Network:Default', value: 'Network:Default' },
    { label: 'IP-Port Group:port-1', value: 'IP-Port Group:port-1' },
    { label: 'IP Group:ip-1', value: 'IP Group:ip-1' },
  ],
  switch: [
    { label: 'Network:interface-vlan100', value: 'Network:interface-vlan100' },
    { label: 'IP Group:guest-subnet', value: 'IP Group:guest-subnet' },
    { label: 'IP-Port Group:port-1', value: 'IP-Port Group:port-1' },
  ],
  eap: [
    { label: 'SSID:test_ssid_1', value: 'SSID:test_ssid_1' },
    { label: 'SSID:Office_Staff', value: 'SSID:Office_Staff' },
    { label: 'Network:interface-vlan100', value: 'Network:interface-vlan100' },
  ],
};

const DEST_OPTIONS = [
  { label: 'IP Group:ip-1', value: 'IP Group:ip-1' },
  { label: 'Network:Default', value: 'Network:Default' },
  { label: 'Network:interface-vlan100', value: 'Network:interface-vlan100' },
  { label: 'Network:interface-vlan4090', value: 'Network:interface-vlan4090' },
];

/**
 * Omada Controller v6.3.0.34 ACL Workspace (`#/acl`).
 * Replicates top `Gateway ACL | Switch ACL | EAP ACL` tabs, `(?)` help, `ACL Rules`
 * drag tip + `+ Create New Rule` toolbar, and the 10-column sortable/draggable rule
 * table with interactive row reordering, status switches, object inspectors, and modals.
 */
export const AclPage: React.FC<AclPageProps> = ({ initialTab = 'gateway' }) => {
  const notification = useOmadaNotification();

  const [activeTab, setActiveTab] = useState<AclTabKey>(initialTab);
  const [rulesByTab, setRulesByTab] = useState<Record<AclTabKey, AclRuleRecord[]>>({
    gateway: INITIAL_GATEWAY_ACL_RULES,
    switch: INITIAL_SWITCH_ACL_RULES,
    eap: INITIAL_EAP_ACL_RULES,
  });

  // Drag-and-drop state
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // Create / Edit Rule Modal state
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formDirection, setFormDirection] = useState('LAN→WAN');
  const [formPolicy, setFormPolicy] = useState<AclPolicyType>('Permit');
  const [formProtocols, setFormProtocols] = useState('All');
  const [formSource, setFormSource] = useState('Network:interface-vlan100');
  const [formDestination, setFormDestination] = useState('IP Group:ip-1');
  const [formBinding, setFormBinding] = useState('All Switches');
  const [formBiDirectional, setFormBiDirectional] = useState(false);

  // Inspection & Help Modals
  const [inspectedObject, setInspectedObject] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const currentRules = rulesByTab[activeTab];

  const moveRule = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentRules.length ||
      toIndex >= currentRules.length
    ) {
      return;
    }
    const movedRule = currentRules[fromIndex];
    setRulesByTab((prev) => {
      const nextList = [...prev[activeTab]];
      const [removed] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, removed);
      return { ...prev, [activeTab]: nextList };
    });
    notification.info({
      title: 'ACL Rule Order Updated',
      description: `Moved "${movedRule.description}" from Index ${fromIndex + 1} to Index ${toIndex + 1}.`,
    });
  };

  const handleToggleRule = (record: AclRuleRecord, checked: boolean) => {
    setRulesByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((r) =>
        r.key === record.key ? { ...r, enabled: checked } : r,
      ),
    }));
    notification.info({
      title: checked ? 'ACL Rule Enabled' : 'ACL Rule Disabled',
      description: `${record.description} is now ${checked ? 'active' : 'disabled'}.`,
    });
  };

  const handleDeleteRule = (record: AclRuleRecord) => {
    setRulesByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((r) => r.key !== record.key),
    }));
    notification.success({
      title: 'ACL Rule Deleted',
      description: `Removed "${record.description}" from ${TAB_TITLE_MAP[activeTab]}.`,
    });
  };

  const openCreateModal = () => {
    setEditingKey(null);
    const defaultPrefix =
      activeTab === 'gateway' ? 'Gateway_ACL' : activeTab === 'switch' ? 'Switch_ACL' : 'EAP_ACL';
    setFormDescription(`${defaultPrefix}_${currentRules.length + 1}`);
    setFormEnabled(true);
    setFormDirection(
      activeTab === 'gateway' ? 'LAN→WAN' : activeTab === 'switch' ? 'Ingress' : 'Wireless→LAN',
    );
    setFormPolicy('Permit');
    setFormProtocols('All');
    setFormSource(SOURCE_OPTIONS_BY_TAB[activeTab][0]?.value ?? 'Network:interface-vlan100');
    setFormDestination('IP Group:ip-1');
    setFormBinding(activeTab === 'eap' ? 'test_ssid_1' : 'All Switches');
    setFormBiDirectional(false);
    setRuleModalOpen(true);
  };

  const openEditModal = (record: AclRuleRecord) => {
    setEditingKey(record.key);
    setFormDescription(record.description);
    setFormEnabled(record.enabled);
    setFormDirection(record.direction);
    setFormPolicy(record.policy);
    setFormProtocols(record.protocols);
    setFormSource(record.source);
    setFormDestination(record.destination);
    setFormBinding(record.binding ?? 'All Switches');
    setFormBiDirectional(Boolean(record.biDirectional));
    setRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    const cleanDesc = formDescription.trim();
    if (!cleanDesc) {
      notification.warning({
        title: 'Description Required',
        description: 'Please enter a valid ACL rule description.',
      });
      return;
    }

    if (editingKey) {
      setRulesByTab((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((r) =>
          r.key === editingKey
            ? {
                ...r,
                description: cleanDesc,
                enabled: formEnabled,
                direction: formDirection,
                policy: formPolicy,
                protocols: formProtocols,
                source: formSource,
                destination: formDestination,
                binding: activeTab === 'gateway' ? undefined : formBinding,
                biDirectional: formBiDirectional,
              }
            : r,
        ),
      }));
      notification.success({
        title: 'ACL Rule Updated',
        description: `Updated "${cleanDesc}" in ${TAB_TITLE_MAP[activeTab]}.`,
      });
    } else {
      const next: AclRuleRecord = {
        key: `${activeTab}-acl-${Date.now()}`,
        description: cleanDesc,
        enabled: formEnabled,
        direction: formDirection,
        policy: formPolicy,
        protocols: formProtocols,
        source: formSource,
        destination: formDestination,
        binding: activeTab === 'gateway' ? undefined : formBinding,
        biDirectional: formBiDirectional,
        timeRange: 'Any',
      };
      setRulesByTab((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], next],
      }));
      notification.success({
        title: 'ACL Rule Created',
        description: `Added "${cleanDesc}" at Index ${currentRules.length + 1}.`,
      });
    }
    setRuleModalOpen(false);
  };

  const columns: ColumnsType<AclRuleRecord> = useMemo(() => {
    const list: ColumnsType<AclRuleRecord> = [
      {
        title: '',
        key: 'drag',
        width: 42,
        align: 'center',
        render: (_, record, index) => (
          <Tooltip title="Drag or use Arrow Up/Down to reorder">
            <button
              type="button"
              aria-label={`Reorder ${record.description}`}
              className="omada-acl-drag-handle"
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  moveRule(index, index - 1);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveRule(index, index + 1);
                }
              }}
            >
              <SIcon name="icon-icon-tabler-icon-grip-vertical" size={16} />
            </button>
          </Tooltip>
        ),
      },
      {
        title: 'Index',
        key: 'index',
        width: 68,
        render: (_, __, index) => (
          <span className="tabular-nums text-[var(--omada-text-primary)]">{index + 1}</span>
        ),
      },
      {
        title: 'Enabled',
        dataIndex: 'enabled',
        key: 'enabled',
        width: 96,
        render: (enabled: boolean, record) => (
          <SSwitch
            checked={enabled}
            aria-label={`Toggle ${record.description}`}
            onChange={(checked) => handleToggleRule(record, checked)}
          />
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 165,
        render: (desc: string) => (
          <span className="text-[var(--omada-text-primary)]">{desc}</span>
        ),
      },
      {
        title: 'Direction',
        dataIndex: 'direction',
        key: 'direction',
        width: 110,
      },
      {
        title: 'Policy',
        dataIndex: 'policy',
        key: 'policy',
        width: 90,
      },
      {
        title: 'Protocols',
        dataIndex: 'protocols',
        key: 'protocols',
        width: 102,
      },
      {
        title: 'Source',
        dataIndex: 'source',
        key: 'source',
        width: 205,
        render: (source: string) => (
          <button
            type="button"
            className="omada-cfg-link-btn"
            onClick={() => setInspectedObject(source)}
          >
            {source}
          </button>
        ),
      },
      {
        title: 'Destination',
        dataIndex: 'destination',
        key: 'destination',
        width: 158,
        render: (dest: string) => (
          <button
            type="button"
            className="omada-cfg-link-btn"
            onClick={() => setInspectedObject(dest)}
          >
            {dest}
          </button>
        ),
      },
    ];

    if (activeTab !== 'gateway') {
      list.splice(8, 0, {
        title: activeTab === 'switch' ? 'Binding' : 'SSID Binding',
        dataIndex: 'binding',
        key: 'binding',
        width: 145,
        render: (val?: string) => (
          <span className="text-[var(--omada-text-secondary)]">{val ?? 'All'}</span>
        ),
      });
    }

    list.push({
      title: 'Action',
      key: 'action',
      width: 96,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Tooltip title="Edit Rule">
            <button
              type="button"
              aria-label={`Edit ${record.description}`}
              onClick={() => openEditModal(record)}
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="edit" size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete Rule">
            <button
              type="button"
              aria-label={`Delete ${record.description}`}
              onClick={() => handleDeleteRule(record)}
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="delete" size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    });

    return list;
  }, [activeTab, currentRules]);

  const directionOptions =
    activeTab === 'gateway'
      ? [
          { label: 'LAN→WAN', value: 'LAN→WAN' },
          { label: 'LAN→LAN', value: 'LAN→LAN' },
          { label: 'WAN→LAN', value: 'WAN→LAN' },
        ]
      : activeTab === 'switch'
        ? [
            { label: 'Ingress', value: 'Ingress' },
            { label: 'Egress', value: 'Egress' },
          ]
        : [
            { label: 'Wireless→LAN', value: 'Wireless→LAN' },
            { label: 'Wireless→Wireless', value: 'Wireless→Wireless' },
          ];

  const inspectedMeta = inspectedObject
    ? ACL_OBJECT_DETAILS[inspectedObject] ?? {
        type: 'Network Object',
        summary: inspectedObject,
        entries: ['Configured inside Site Profiles'],
      }
    : null;

  return (
    <div className="omada-acl-page px-6 pt-4 pb-6">
      {/* Top Underline Tabs + Help Icon */}
      <div className="flex items-center justify-between border-b border-[var(--omada-border-divider)]">
        <div role="tablist" aria-label="ACL scopes" className="flex items-center gap-8">
          {(
            [
              { key: 'gateway', label: 'Gateway ACL' },
              { key: 'switch', label: 'Switch ACL' },
              { key: 'eap', label: 'EAP ACL' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`omada-cfg-subtab-btn cursor-pointer pb-2.5 text-[18px] leading-[26px] ${
                  isActive ? 'is-active font-medium' : 'font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="omada-cfg-subtab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
                )}
              </button>
            );
          })}
        </div>

        <Tooltip title="ACL Help">
          <button
            type="button"
            aria-label="ACL help"
            onClick={() => setHelpOpen(true)}
            className="omada-cfg-help-btn mb-1.5"
          >
            <SIcon name="question" size={20} />
          </button>
        </Tooltip>
      </div>

      {/* Toolbar (`pr-9` clearance from right-edge `<||` handle!) */}
      <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
            ACL Rules
          </h2>
          <span className="inline-flex items-center gap-1 text-[13px] text-[var(--omada-text-tertiary)]">
            <span>Tip: Drag</span>
            <SIcon
              name="icon-icon-tabler-icon-grip-vertical"
              size={14}
              className="text-[var(--omada-text-tertiary)]"
            />
            <span>to re-order rows.</span>
          </span>
        </div>

        <SButton
          variant="primary"
          className="omada-cfg-primary-btn"
          icon={<Plus size={14} />}
          onClick={openCreateModal}
        >
          Create New Rule
        </SButton>
      </div>

      {/* Draggable ACL Rules Table */}
      <div className="omada-cfg-table-shell">
        <Table<AclRuleRecord>
          className="omada-cfg-table"
          rowKey="key"
          dataSource={currentRules}
          columns={columns}
          pagination={false}
          rowClassName={(record) => {
            const classes: string[] = [];
            if (draggingKey === record.key) classes.push('omada-acl-row-dragging');
            if (dragOverKey === record.key && draggingKey !== record.key) {
              classes.push('omada-acl-row-drag-over');
            }
            return classes.join(' ');
          }}
          onRow={(record, index) => ({
            draggable: true,
            onDragStart: (e) => {
              setDraggingKey(record.key);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(index ?? 0));
            },
            onDragOver: (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverKey !== record.key) {
                setDragOverKey(record.key);
              }
            },
            onDrop: (e) => {
              e.preventDefault();
              const fromIdx = currentRules.findIndex((r) => r.key === draggingKey);
              const toIdx = typeof index === 'number' ? index : -1;
              if (fromIdx !== -1 && toIdx !== -1) {
                moveRule(fromIdx, toIdx);
              }
              setDraggingKey(null);
              setDragOverKey(null);
            },
            onDragEnd: () => {
              setDraggingKey(null);
              setDragOverKey(null);
            },
          })}
          locale={{
            emptyText: (
              <SEmpty
                title={`No ${TAB_TITLE_MAP[activeTab]} Rules`}
                description="Click + Create New Rule to define traffic permit or deny rules."
              />
            ),
          }}
        />
      </div>

      {/* Create / Edit ACL Rule Modal */}
      <SModal
        size="default"
        title={
          editingKey
            ? `Edit ${TAB_TITLE_MAP[activeTab]} Rule`
            : `Create New ${TAB_TITLE_MAP[activeTab]} Rule`
        }
        open={ruleModalOpen}
        onCancel={() => setRuleModalOpen(false)}
        onOk={handleSaveRule}
        okText={editingKey ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <div className="space-y-3.5 py-1">
          <div className="omada-cfg-modal-field-row">
            <label htmlFor="acl-desc-input" className="omada-cfg-modal-label">
              Description
            </label>
            <SInput
              id="acl-desc-input"
              variant="filled"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Gateway_ACL_4"
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Status</span>
            <SSwitch checked={formEnabled} onChange={setFormEnabled} aria-label="Rule Status" />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Direction</span>
            <SSelect
              value={formDirection}
              onChange={setFormDirection}
              className="w-full"
              options={directionOptions}
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Policy</span>
            <SSelect
              value={formPolicy}
              onChange={(val) => setFormPolicy(val as AclPolicyType)}
              className="w-full"
              options={[
                { label: 'Permit', value: 'Permit' },
                { label: 'Deny', value: 'Deny' },
              ]}
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Protocols</span>
            <SSelect
              value={formProtocols}
              onChange={setFormProtocols}
              className="w-full"
              options={[
                { label: 'All', value: 'All' },
                { label: 'TCP', value: 'TCP' },
                { label: 'UDP', value: 'UDP' },
                { label: 'TCP, UDP', value: 'TCP, UDP' },
                { label: 'ICMP', value: 'ICMP' },
              ]}
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Source</span>
            <SSelect
              value={formSource}
              onChange={setFormSource}
              className="w-full"
              options={SOURCE_OPTIONS_BY_TAB[activeTab]}
            />
          </div>

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Destination</span>
            <SSelect
              value={formDestination}
              onChange={setFormDestination}
              className="w-full"
              options={DEST_OPTIONS}
            />
          </div>

          {activeTab !== 'gateway' && (
            <div className="omada-cfg-modal-field-row">
              <span className="omada-cfg-modal-label">
                {activeTab === 'switch' ? 'Switch Binding' : 'SSID Binding'}
              </span>
              <SInput
                variant="filled"
                value={formBinding}
                onChange={(e) => setFormBinding(e.target.value)}
              />
            </div>
          )}

          <div className="omada-cfg-modal-field-row">
            <span className="omada-cfg-modal-label">Bi-Directional</span>
            <Checkbox
              checked={formBiDirectional}
              onChange={(e) => setFormBiDirectional(e.target.checked)}
            >
              Automatically mirror reverse return rule
            </Checkbox>
          </div>
        </div>
      </SModal>

      {/* Network / IP Group Inspector Modal */}
      <SModal
        size="sm"
        title={inspectedObject ?? 'Object Details'}
        open={Boolean(inspectedObject)}
        onCancel={() => setInspectedObject(null)}
        onOk={() => setInspectedObject(null)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Close"
        destroyOnHidden
      >
        {inspectedMeta && (
          <div className="space-y-2.5 text-[13px] text-[var(--omada-text-secondary)]">
            <div>
              <strong className="text-[var(--omada-text-primary)]">Object Type:</strong>{' '}
              {inspectedMeta.type}
            </div>
            <div>
              <strong className="text-[var(--omada-text-primary)]">Description:</strong>{' '}
              {inspectedMeta.summary}
            </div>
            <div className="space-y-1.5 pt-1">
              {inspectedMeta.entries.map((entry) => (
                <div
                  key={entry}
                  className="rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-3 py-1.5 font-mono text-xs text-[var(--omada-text-primary)]"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </SModal>

      {/* ACL Help Modal */}
      <SModal
        size="sm"
        title="ACL Rule Evaluation Help"
        open={helpOpen}
        onCancel={() => setHelpOpen(false)}
        onOk={() => setHelpOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Got It"
        destroyOnHidden
      >
        <div className="space-y-2 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
          <p className="m-0">
            Access Control Lists (ACL) are evaluated top-down by <strong>Index</strong>. Drag rows
            with the 6-dot handle (or press Arrow Up / Arrow Down on the handle) to reorder
            evaluation priority across Gateway, Switch, and EAP policies.
          </p>
        </div>
      </SModal>
    </div>
  );
};
