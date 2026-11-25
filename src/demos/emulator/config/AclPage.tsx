import React, { useCallback, useMemo, useState } from 'react';
import { Checkbox, Radio, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeft, Info, Plus } from 'lucide-react';
import {
  SAclRuleBuilder,
  SButton,
  SEmpty,
  SExpandableSection,
  SIcon,
  SInput,
  SModal,
  SSelect,
  SSwitch,
  STabs,
  useOmadaAgentAction,
  useOmadaNotification,
  type SAclEndpointTypeOption,
  type SAclEndpointValue,
  type SAclObjectOption,
} from '@/omada';
import {
  ACL_DIRECTION_OPTIONS,
  ACL_INITIAL_OBJECTS_BY_TYPE,
  ACL_MANUAL_STATE_OPTIONS,
  ACL_OBJECT_DETAILS,
  ACL_PROTOCOL_OPTIONS,
  ACL_SWITCH_PORT_OPTIONS,
  ACL_TIME_RANGE_OPTIONS,
  ACL_VLAN_OPTIONS,
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

const CREATABLE_TYPES = new Set([
  'IP Group',
  'IP-Port Group',
  'MAC Group',
  'IPv6 Group',
  'IPv6-Port Group',
  'Location Group',
]);

function makeTypeOptions(types: readonly string[]): SAclEndpointTypeOption[] {
  return types.map((value) => ({
    value,
    label: value,
    creatable: CREATABLE_TYPES.has(value),
  }));
}

function getEndpointTypes(
  tab: AclTabKey,
  directions: string[],
  side: 'source' | 'destination',
): SAclEndpointTypeOption[] {
  if (tab === 'switch') {
    return makeTypeOptions([
      'Network',
      'IP Group',
      'IP-Port Group',
      'MAC Group',
      'IPv6 Group',
      'IPv6-Port Group',
    ]);
  }
  if (tab === 'eap') {
    if (side === 'source') {
      return makeTypeOptions([
        'Network',
        'IP Group',
        'IP-Port Group',
        'SSID',
        'IPv6 Group',
        'IPv6-Port Group',
      ]);
    }
    return makeTypeOptions([
      'Network',
      'IP Group',
      'IP-Port Group',
      'IPv6 Group',
      'IPv6-Port Group',
    ]);
  }

  // Gateway ACL dynamic type options based on selected Direction(s)
  const isPureLanToWan = directions.length === 1 && directions[0] === 'LAN→WAN';
  if (isPureLanToWan) {
    return side === 'source'
      ? makeTypeOptions(['Network', 'IP Group', 'IP-Port Group'])
      : makeTypeOptions(['IP Group', 'IP-Port Group', 'Location', 'Location Group']);
  }

  if (side === 'source') {
    return makeTypeOptions([
      'Network',
      'IP Group',
      'IP-Port Group',
      'IPv6 Group',
      'IPv6-Port Group',
      'Location',
      'Location Group',
    ]);
  }
  return makeTypeOptions([
    'Network',
    'IP Group',
    'IP-Port Group',
    'IPv6 Group',
    'IPv6-Port Group',
    'Location',
    'Location Group',
    'Gateway Management',
  ]);
}

function formatProtocolsDisplay(list: string[]): string {
  if (list.length === 0 || list.includes('All')) return 'All';
  if (list.length === 2 && list.includes('TCP') && list.includes('UDP')) {
    return 'TCP & UDP';
  }
  return list.join(', ');
}

function formatEndpointSummary(endpoint: SAclEndpointValue): string {
  const type = endpoint.type ?? 'Network';
  return `${type}:${endpoint.items.join(', ')}`;
}

/**
 * Omada Controller v6.3.0.34 ACL Settings Module (`#/acl`).
 * Replicates `Gateway ACL | Switch ACL | EAP ACL` rule lists and the full-pane
 * inline `<- Create New Rule` / `<- Edit Rule` rule builder (`SAclRuleBuilder`,
 * dynamic Direction/Protocols, Switch `ACL Binding`, Gateway/Switch `Advanced Settings`).
 */
export const AclPage: React.FC<AclPageProps> = ({ initialTab = 'gateway' }) => {
  const notification = useOmadaNotification();

  const [activeTab, setActiveTab] = useState<AclTabKey>(initialTab);
  const [rulesByTab, setRulesByTab] = useState<Record<AclTabKey, AclRuleRecord[]>>({
    gateway: INITIAL_GATEWAY_ACL_RULES,
    switch: INITIAL_SWITCH_ACL_RULES,
    eap: INITIAL_EAP_ACL_RULES,
  });

  // Dynamic network objects (supports on-the-fly `+ Create` from SAclRuleBuilder)
  const [objectsByType, setObjectsByType] = useState<Record<string, SAclObjectOption[]>>(
    ACL_INITIAL_OBJECTS_BY_TYPE,
  );
  const [objectDetailsMap, setObjectDetailsMap] = useState(ACL_OBJECT_DETAILS);

  // Drag-and-drop state
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // Inline Editor View state (`null` = list view, `'create' | 'edit'` = full-pane editor)
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formDirections, setFormDirections] = useState<string[]>(['LAN→WAN']);
  const [formPolicy, setFormPolicy] = useState<AclPolicyType>('Deny');
  const [formProtocols, setFormProtocols] = useState<string[]>(['All']);
  const [formSource, setFormSource] = useState<SAclEndpointValue>({ items: [] });
  const [formDestination, setFormDestination] = useState<SAclEndpointValue>({ items: [] });
  const [sourceError, setSourceError] = useState(false);
  const [destinationError, setDestinationError] = useState(false);

  // Switch ACL Binding state
  const [bindingExpanded, setBindingExpanded] = useState(true);
  const [formBindingType, setFormBindingType] = useState<'ports' | 'vlan'>('ports');
  const [formPortScope, setFormPortScope] = useState<'all' | 'custom'>('all');
  const [formCustomPorts, setFormCustomPorts] = useState<string[]>([
    'CTOOffice_Switch_1 · Port 1-8',
  ]);
  const [formBindingVlans, setFormBindingVlans] = useState<string[]>(['interface-vlan100']);

  // Advanced Settings state
  const [advExpanded, setAdvExpanded] = useState(false);
  const [formTimeScheduleEnabled, setFormTimeScheduleEnabled] = useState(false);
  const [formTimeRange, setFormTimeRange] = useState('Workdays_09_18');
  const [formBiDirectional, setFormBiDirectional] = useState(false);
  const [formStatesType, setFormStatesType] = useState<'auto' | 'manual'>('auto');
  const [formManualStates, setFormManualStates] = useState<string[]>([
    'New',
    'Established',
    'Related',
  ]);
  const [formEthertypeEnabled, setFormEthertypeEnabled] = useState(false);
  const [formEthertypeHex, setFormEthertypeHex] = useState('0800');

  // Inspection, Quick Create Group, & Help Modals
  const [inspectedObject, setInspectedObject] = useState<string | null>(null);
  const [quickCreateTarget, setQuickCreateTarget] = useState<{
    type: string;
    side: 'source' | 'destination';
  } | null>(null);
  const [quickCreateName, setQuickCreateName] = useState('');
  const [quickCreateValue, setQuickCreateValue] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const currentRules = rulesByTab[activeTab];

  const getItemsForType = useCallback(
    (type: string) => objectsByType[type] ?? [],
    [objectsByType],
  );

  const sourceTypeOptions = useMemo(
    () => getEndpointTypes(activeTab, formDirections, 'source'),
    [activeTab, formDirections],
  );
  const destinationTypeOptions = useMemo(
    () => getEndpointTypes(activeTab, formDirections, 'destination'),
    [activeTab, formDirections],
  );

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

  const openCreateEditor = () => {
    setEditorMode('create');
    setEditingKey(null);
    setFormDescription('');
    setFormEnabled(true);
    setFormDirections([]);
    setFormPolicy('Deny');
    setFormProtocols(['All']);
    setFormSource({ items: [] });
    setFormDestination({ items: [] });
    setSourceError(false);
    setDestinationError(false);
    setBindingExpanded(true);
    setFormBindingType('ports');
    setFormPortScope('all');
    setFormCustomPorts(['CTOOffice_Switch_1 · Port 1-8']);
    setFormBindingVlans(['interface-vlan100']);
    setAdvExpanded(false);
    setFormTimeScheduleEnabled(false);
    setFormTimeRange('Workdays_09_18');
    setFormBiDirectional(false);
    setFormStatesType('auto');
    setFormManualStates([]);
    setFormEthertypeEnabled(false);
    setFormEthertypeHex('');
  };

  const openEditEditor = (record: AclRuleRecord) => {
    setEditorMode('edit');
    setEditingKey(record.key);
    setFormDescription(record.description);
    setFormEnabled(record.enabled);
    setFormDirections(
      record.directions && record.directions.length > 0
        ? record.directions
        : [record.direction],
    );
    setFormPolicy(record.policy);
    setFormProtocols(
      record.protocolList && record.protocolList.length > 0
        ? record.protocolList
        : record.protocols === 'All'
          ? ['All']
          : record.protocols.split(/[&,]/).map((s) => s.trim()).filter(Boolean),
    );
    setFormSource({
      type: record.sourceType,
      items: record.sourceItems ?? [],
    });
    setFormDestination({
      type: record.destinationType,
      items: record.destinationItems ?? [],
    });
    setSourceError(false);
    setDestinationError(false);
    setBindingExpanded(true);
    setFormBindingType(record.bindingType ?? 'ports');
    setFormPortScope(record.portScope ?? 'all');
    setFormCustomPorts(record.customPorts ?? ['CTOOffice_Switch_1 · Port 1-8']);
    setFormBindingVlans(record.bindingVlans ?? ['interface-vlan100']);
    setAdvExpanded(
      Boolean(
        record.timeScheduleEnabled ||
          record.biDirectional ||
          record.ethertypeEnabled ||
          record.statesType === 'manual',
      ),
    );
    setFormTimeScheduleEnabled(Boolean(record.timeScheduleEnabled));
    setFormTimeRange(record.timeRange ?? 'Workdays_09_18');
    setFormBiDirectional(Boolean(record.biDirectional));
    setFormStatesType(record.statesType ?? 'auto');
    setFormManualStates(record.manualStates ?? ['New', 'Established', 'Related']);
    setFormEthertypeEnabled(Boolean(record.ethertypeEnabled));
    setFormEthertypeHex(record.ethertypeHex ?? '0800');
  };

  const handleProtocolsChange = (nextValues: string[]) => {
    if (nextValues.length === 0) {
      setFormProtocols(['All']);
      return;
    }
    const newlyPickedAll = !formProtocols.includes('All') && nextValues.includes('All');
    if (newlyPickedAll) {
      setFormProtocols(['All']);
      return;
    }
    setFormProtocols(nextValues.filter((v) => v !== 'All'));
  };

  const handleDirectionsChange = (nextDirs: string[]) => {
    setFormDirections(nextDirs);
    const validSrc = new Set(getEndpointTypes(activeTab, nextDirs, 'source').map((t) => t.value));
    const validDst = new Set(
      getEndpointTypes(activeTab, nextDirs, 'destination').map((t) => t.value),
    );
    if (formSource.type && !validSrc.has(formSource.type)) {
      setFormSource({ items: [] });
    }
    if (formDestination.type && !validDst.has(formDestination.type)) {
      setFormDestination({ items: [] });
    }
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

    const missingSrc = !formSource.type || formSource.items.length === 0;
    const missingDst = !formDestination.type || formDestination.items.length === 0;
    setSourceError(missingSrc);
    setDestinationError(missingDst);
    if (missingSrc || missingDst) {
      notification.warning({
        title: 'Rule Endpoints Required',
        description: 'Please select a Type and at least one item for both Source and Destination.',
      });
      return;
    }

    if (
      activeTab === 'switch' &&
      formEthertypeEnabled &&
      !/^[0-9a-fA-F]{4}$/.test(formEthertypeHex.trim())
    ) {
      notification.warning({
        title: 'Invalid Ethertype',
        description: 'Ethertype must be a 4-hex number (0-9, A-F), e.g. 0800 or 86DD.',
      });
      return;
    }

    const directionLabel =
      activeTab === 'gateway'
        ? (formDirections.length > 0 ? formDirections.join(', ') : 'LAN→WAN')
        : activeTab === 'switch'
          ? 'Ingress'
          : 'Wireless→LAN';

    const rulePayload: Omit<AclRuleRecord, 'key'> = {
      description: cleanDesc,
      enabled: formEnabled,
      direction: directionLabel,
      directions: activeTab === 'gateway' ? formDirections : undefined,
      policy: formPolicy,
      protocols: formatProtocolsDisplay(formProtocols),
      protocolList: formProtocols,
      source: formatEndpointSummary(formSource),
      sourceType: formSource.type,
      sourceItems: formSource.items,
      destination: formatEndpointSummary(formDestination),
      destinationType: formDestination.type,
      destinationItems: formDestination.items,
      bindingType: activeTab === 'switch' ? formBindingType : undefined,
      portScope: activeTab === 'switch' ? formPortScope : undefined,
      customPorts: activeTab === 'switch' ? formCustomPorts : undefined,
      bindingVlans: activeTab === 'switch' ? formBindingVlans : undefined,
      timeScheduleEnabled: activeTab !== 'eap' ? formTimeScheduleEnabled : undefined,
      timeRange: activeTab !== 'eap' && formTimeScheduleEnabled ? formTimeRange : undefined,
      biDirectional: activeTab !== 'eap' ? formBiDirectional : undefined,
      statesType: activeTab === 'gateway' ? formStatesType : undefined,
      manualStates: activeTab === 'gateway' ? formManualStates : undefined,
      ethertypeEnabled: activeTab === 'switch' ? formEthertypeEnabled : undefined,
      ethertypeHex: activeTab === 'switch' ? formEthertypeHex.trim().toUpperCase() : undefined,
    };

    if (editingKey) {
      setRulesByTab((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((r) =>
          r.key === editingKey ? { key: r.key, ...rulePayload } : r,
        ),
      }));
      notification.success({
        title: 'ACL Rule Updated',
        description: `Updated "${cleanDesc}" in ${TAB_TITLE_MAP[activeTab]}.`,
      });
    } else {
      const next: AclRuleRecord = {
        key: `${activeTab}-acl-${Date.now()}`,
        ...rulePayload,
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
    setEditorMode(null);
  };

  const handleOpenQuickCreate = (type: string, side: 'source' | 'destination') => {
    setQuickCreateTarget({ type, side });
    setQuickCreateName('');
    setQuickCreateValue(
      type === 'MAC Group'
        ? 'AA-BB-CC-DD-EE-10'
        : type.includes('IPv6')
          ? '2001:db8:200::/48'
          : '10.30.0.0/24',
    );
  };

  const handleConfirmQuickCreate = () => {
    if (!quickCreateTarget) return;
    const cleanName = quickCreateName.trim();
    if (!cleanName) {
      notification.warning({
        title: 'Profile Name Required',
        description: `Please enter a name for the new ${quickCreateTarget.type}.`,
      });
      return;
    }

    const { type, side } = quickCreateTarget;
    setObjectsByType((prev) => {
      const existing = prev[type] ?? [];
      if (existing.some((item) => item.value === cleanName)) return prev;
      return {
        ...prev,
        [type]: [...existing, { value: cleanName, label: cleanName }],
      };
    });
    setObjectDetailsMap((prev) => ({
      ...prev,
      [`${type}:${cleanName}`]: {
        type,
        summary: `Custom ${type}`,
        entries: [quickCreateValue.trim() || 'Any'],
      },
    }));

    if (side === 'source') {
      setFormSource((prev) => ({
        type,
        items: prev.items.includes(cleanName) ? prev.items : [...prev.items, cleanName],
      }));
      setSourceError(false);
    } else {
      setFormDestination((prev) => ({
        type,
        items: prev.items.includes(cleanName) ? prev.items : [...prev.items, cleanName],
      }));
      setDestinationError(false);
    }

    notification.success({
      title: `${type} Created`,
      description: `Added and selected "${cleanName}".`,
    });
    setQuickCreateTarget(null);
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
      ...(activeTab === 'gateway'
        ? [
            {
              title: 'Direction',
              dataIndex: 'direction',
              key: 'direction',
              width: 118,
            },
          ]
        : []),
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
        width: 116,
      },
      {
        title: 'Source',
        dataIndex: 'source',
        key: 'source',
        width: 220,
        render: (source: string) => (
          <button
            type="button"
            className="omada-cfg-link-btn text-left"
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
        width: 210,
        render: (dest: string) => (
          <button
            type="button"
            className="omada-cfg-link-btn text-left"
            onClick={() => setInspectedObject(dest)}
          >
            {dest}
          </button>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 96,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Tooltip title="Edit Rule">
              <button
                type="button"
                aria-label={`Edit ${record.description}`}
                onClick={() => openEditEditor(record)}
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
      },
    ];

    return list;
  }, [activeTab, currentRules]);

  const inspectedMeta = inspectedObject
    ? objectDetailsMap[inspectedObject] ?? {
        type: 'Network Object',
        summary: inspectedObject,
        entries: ['Configured inside Site Profiles'],
      }
    : null;

  const showBiDirectionalOnGateway =
    activeTab === 'gateway' && formDirections.includes('LAN→LAN');

  useOmadaAgentAction({
    id: 'acl.openRuleEditor',
    label: 'Open ACL Rule Editor',
    description: 'Opens the inline Create New Rule editor on the active ACL tab.',
    handler: () => {
      openCreateEditor();
      return true;
    },
  });

  useOmadaAgentAction({
    id: 'acl.createGatewayRule',
    label: 'Create Gateway ACL Rule',
    description: 'Creates a Gateway ACL rule ({ description, policy, enabled, source, destination }).',
    handler: (payload) => {
      const p = (payload && typeof payload === 'object' ? payload : {}) as {
        description?: string;
        policy?: AclPolicyType;
        enabled?: boolean;
        source?: string;
        destination?: string;
      };
      const cleanDesc = (p.description ?? 'Gateway_ACL_Agent').trim();
      const next: AclRuleRecord = {
        key: `gateway-acl-${Date.now()}`,
        description: cleanDesc,
        enabled: p.enabled !== undefined ? Boolean(p.enabled) : true,
        direction: 'LAN→WAN',
        directions: ['LAN→WAN'],
        policy: p.policy === 'Permit' ? 'Permit' : 'Deny',
        protocols: 'All',
        protocolList: ['All'],
        source: p.source ?? 'Network:Default',
        sourceType: 'Network',
        sourceItems: ['Default'],
        destination: p.destination ?? 'IP Group:IPGroup_Any',
        destinationType: 'IP Group',
        destinationItems: ['IPGroup_Any'],
      };
      setRulesByTab((prev) => ({
        ...prev,
        gateway: [...prev.gateway, next],
      }));
      setEditorMode(null);
      return { key: next.key, description: next.description, policy: next.policy };
    },
  });

  return (
    <div className="omada-acl-page px-6 pt-4 pb-8">
      {editorMode ? (
        <div data-testid="acl-rule-editor">
          {/* Inline Editor Header (`pr-9` clearance from `<||` quick-drawer handle) */}
          <div className="omada-acl-editor-header pr-9">
            <button
              type="button"
              onClick={() => setEditorMode(null)}
              className="omada-acl-back-btn"
            >
              <ArrowLeft size={18} />
              <span>{editorMode === 'edit' ? 'Edit Rule' : 'Create New Rule'}</span>
            </button>

            <Tooltip title="ACL Help">
              <button
                type="button"
                aria-label="ACL help"
                onClick={() => setHelpOpen(true)}
                className="omada-cfg-help-btn"
              >
                <SIcon name="question" size={20} />
              </button>
            </Tooltip>
          </div>

          <div className="omada-acl-editor-form">
            <div className="omada-acl-editor-row">
              <label htmlFor="acl-desc-input" className="omada-acl-editor-label">
                Description
              </label>
              <div className="omada-acl-editor-control">
                <SInput
                  id="acl-desc-input"
                  agentId="acl.form.description"
                  variant="filled"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="omada-acl-field-box"
                />
              </div>
            </div>

            <div className="omada-acl-editor-row">
              <span className="omada-acl-editor-label">Status</span>
              <div className="omada-acl-editor-control">
                <Checkbox
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                >
                  Enable
                </Checkbox>
              </div>
            </div>

            {activeTab === 'gateway' && (
              <div className="omada-acl-editor-row">
                <span className="omada-acl-editor-label">Direction</span>
                <div className="omada-acl-editor-control">
                  <SSelect
                    mode="multiple"
                    aria-label="Direction"
                    value={formDirections}
                    placeholder="Please Select..."
                    onChange={(vals) => handleDirectionsChange(vals as string[])}
                    options={ACL_DIRECTION_OPTIONS}
                    className="omada-acl-field-box"
                  />
                </div>
              </div>
            )}

            <div className="omada-acl-editor-row">
              <span className="omada-acl-editor-label">Policy</span>
              <div className="omada-acl-editor-control">
                <Radio.Group
                  value={formPolicy}
                  onChange={(e) => setFormPolicy(e.target.value as AclPolicyType)}
                >
                  <Radio value="Deny">Deny</Radio>
                  <Radio value="Permit">Permit</Radio>
                </Radio.Group>
              </div>
            </div>

            <div className="omada-acl-editor-row">
              <span className="omada-acl-editor-label">Protocols</span>
              <div className="omada-acl-editor-control">
                <SSelect
                  mode="multiple"
                  aria-label="Protocols"
                  value={formProtocols}
                  onChange={(vals) => handleProtocolsChange(vals as string[])}
                  options={ACL_PROTOCOL_OPTIONS}
                  className="omada-acl-field-box"
                />
              </div>
            </div>

            {/* Dual-Card Visual Rule Builder */}
            <div className="omada-acl-editor-row pt-1">
              <span className="omada-acl-editor-label inline-flex items-center gap-1.5">
                <span>Rule</span>
                <Tooltip title="Traffic matching Source is evaluated against Destination according to Policy.">
                  <span className="omada-acl-info-icon">
                    <Info size={14} />
                  </span>
                </Tooltip>
              </span>
              <div className="omada-acl-editor-control">
                <SAclRuleBuilder
                  policy={formPolicy}
                  source={formSource}
                  onSourceChange={(next) => {
                    setFormSource(next);
                    setSourceError(false);
                  }}
                  destination={formDestination}
                  onDestinationChange={(next) => {
                    setFormDestination(next);
                    setDestinationError(false);
                  }}
                  sourceTypeOptions={sourceTypeOptions}
                  destinationTypeOptions={destinationTypeOptions}
                  getItemsForType={getItemsForType}
                  sourceTooltip={
                    activeTab === 'eap'
                      ? 'Select wireless SSID or network traffic origin for this EAP policy.'
                      : undefined
                  }
                  sourceError={sourceError}
                  destinationError={destinationError}
                  onInspectItem={(type, item) => setInspectedObject(`${type}:${item.label}`)}
                  onCreateGroup={handleOpenQuickCreate}
                />
              </div>
            </div>

            {/* Switch ACL: Collapsible ACL Binding Section */}
            {activeTab === 'switch' && (
              <div className="pt-2">
                <SExpandableSection
                  title="ACL Binding"
                  expanded={bindingExpanded}
                  onExpandedChange={setBindingExpanded}
                >
                  <div className="omada-acl-editor-row">
                    <span className="omada-acl-editor-label">Binding Type</span>
                    <div className="omada-acl-editor-control">
                      <Radio.Group
                        value={formBindingType}
                        onChange={(e) => setFormBindingType(e.target.value as 'ports' | 'vlan')}
                      >
                        <Radio value="ports">Ports</Radio>
                        <Radio value="vlan">VLAN</Radio>
                      </Radio.Group>
                    </div>
                  </div>

                  {formBindingType === 'ports' ? (
                    <>
                      <div className="omada-acl-editor-row">
                        <span className="omada-acl-editor-label">Ports</span>
                        <div className="omada-acl-editor-control">
                          <Radio.Group
                            value={formPortScope}
                            onChange={(e) => setFormPortScope(e.target.value as 'all' | 'custom')}
                          >
                            <Radio value="all">All ports</Radio>
                            <Radio value="custom">Custom ports</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      {formPortScope === 'custom' && (
                        <div className="omada-acl-editor-row">
                          <span className="omada-acl-editor-label">Select Ports</span>
                          <div className="omada-acl-editor-control">
                            <SSelect
                              mode="multiple"
                              aria-label="Custom Ports"
                              value={formCustomPorts}
                              onChange={(vals) => setFormCustomPorts(vals as string[])}
                              options={ACL_SWITCH_PORT_OPTIONS}
                              className="omada-acl-field-box"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="omada-acl-editor-row">
                      <span className="omada-acl-editor-label">VLAN</span>
                      <div className="omada-acl-editor-control">
                        <SSelect
                          mode="multiple"
                          aria-label="VLAN Binding"
                          value={formBindingVlans}
                          onChange={(vals) => setFormBindingVlans(vals as string[])}
                          options={ACL_VLAN_OPTIONS}
                          className="omada-acl-field-box"
                        />
                      </div>
                    </div>
                  )}
                </SExpandableSection>
              </div>
            )}

            {/* Gateway ACL & Switch ACL: Collapsible Advanced Settings */}
            {activeTab !== 'eap' && (
              <div className="pt-2">
                <SExpandableSection
                  title="Advanced Settings"
                  expanded={advExpanded}
                  onExpandedChange={setAdvExpanded}
                >
                  <div className="omada-acl-editor-row">
                    <span className="omada-acl-editor-label">Time Schedule</span>
                    <div className="omada-acl-editor-control gap-2">
                      <Checkbox
                        checked={formTimeScheduleEnabled}
                        onChange={(e) => setFormTimeScheduleEnabled(e.target.checked)}
                      >
                        Enable
                      </Checkbox>
                      {activeTab === 'switch' && (
                        <Tooltip title="Restrict rule evaluation to an active weekly Time Range.">
                          <span className="omada-acl-info-icon">
                            <Info size={14} />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {formTimeScheduleEnabled && (
                    <div className="omada-acl-editor-row">
                      <span className="omada-acl-editor-label">Time Range</span>
                      <div className="omada-acl-editor-control">
                        <SSelect
                          aria-label="Time Range"
                          value={formTimeRange}
                          onChange={(val) => setFormTimeRange(String(val))}
                          options={ACL_TIME_RANGE_OPTIONS}
                          className="omada-acl-field-box"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'switch' && (
                    <div className="omada-acl-editor-row">
                      <span className="omada-acl-editor-label">Ethertype</span>
                      <div className="omada-acl-editor-control flex-wrap gap-3">
                        <Checkbox
                          checked={formEthertypeEnabled}
                          onChange={(e) => setFormEthertypeEnabled(e.target.checked)}
                        >
                          Enable
                        </Checkbox>
                        {formEthertypeEnabled && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--omada-text-secondary)]">0x</span>
                            <SInput
                              aria-label="Ethertype Hex"
                              variant="filled"
                              maxLength={4}
                              value={formEthertypeHex}
                              onChange={(e) => setFormEthertypeHex(e.target.value)}
                              style={{ width: 96 }}
                            />
                            <span className="text-xs text-[var(--omada-text-tertiary)]">
                              (4-hex number; 0-9, A-F)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(showBiDirectionalOnGateway || activeTab === 'switch') && (
                    <div className="omada-acl-editor-row">
                      <span className="omada-acl-editor-label">Bi-Directional</span>
                      <div className="omada-acl-editor-control gap-2">
                        <Checkbox
                          checked={formBiDirectional}
                          onChange={(e) => setFormBiDirectional(e.target.checked)}
                        >
                          Enable
                        </Checkbox>
                        <Tooltip title="Automatically mirror the rule in the reverse traffic direction.">
                          <span className="omada-acl-info-icon">
                            <Info size={14} />
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  )}

                  {activeTab === 'gateway' && (
                    <>
                      <div className="omada-acl-editor-row">
                        <span className="omada-acl-editor-label">States Type</span>
                        <div className="omada-acl-editor-control">
                          <Radio.Group
                            value={formStatesType}
                            onChange={(e) =>
                              setFormStatesType(e.target.value as 'auto' | 'manual')
                            }
                          >
                            <Radio value="auto">
                              Auto (Match State New / Established / Related)
                            </Radio>
                            <Radio value="manual">Manual</Radio>
                          </Radio.Group>
                        </div>
                      </div>

                      {formStatesType === 'manual' && (
                        <div className="omada-acl-editor-row">
                          <span className="omada-acl-editor-label">Choose States</span>
                          <div className="omada-acl-editor-control">
                            <Checkbox.Group
                              value={formManualStates}
                              options={ACL_MANUAL_STATE_OPTIONS}
                              onChange={(vals) => setFormManualStates(vals as string[])}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </SExpandableSection>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              <SButton variant="primary" onClick={handleSaveRule}>
                {editorMode === 'edit' ? 'Save' : 'Create'}
              </SButton>
              <SButton variant="secondary" onClick={() => setEditorMode(null)}>
                Cancel
              </SButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Underline Tabs + Help Icon */}
          <STabs
            agentId="acl.subTabs"
            variant="page"
            size="lg"
            bordered
            aria-label="ACL scopes"
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as AclTabKey)}
            className="pr-9"
            items={[
              { key: 'gateway', label: 'Gateway ACL' },
              { key: 'switch', label: 'Switch ACL' },
              { key: 'eap', label: 'EAP ACL' },
            ]}
            extra={
              <Tooltip title="ACL Help">
                <button
                  type="button"
                  aria-label="ACL help"
                  onClick={() => setHelpOpen(true)}
                  className="omada-cfg-help-btn"
                >
                  <SIcon name="question" size={20} />
                </button>
              </Tooltip>
            }
          />

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
              onClick={openCreateEditor}
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
        </>
      )}

      {/* Quick Create Group Profile Modal (`+ Create` in SAclRuleBuilder footer) */}
      <SModal
        size="sm"
        title={quickCreateTarget ? `Create ${quickCreateTarget.type}` : 'Create Group'}
        open={Boolean(quickCreateTarget)}
        onCancel={() => setQuickCreateTarget(null)}
        onOk={handleConfirmQuickCreate}
        okText="Create"
        destroyOnHidden
      >
        <div className="space-y-3.5 py-1">
          <div className="omada-cfg-modal-field-row">
            <label htmlFor="acl-quick-group-name" className="omada-cfg-modal-label">
              Profile Name
            </label>
            <SInput
              id="acl-quick-group-name"
              variant="filled"
              value={quickCreateName}
              onChange={(e) => setQuickCreateName(e.target.value)}
              placeholder="e.g. Corp_Servers"
            />
          </div>
          <div className="omada-cfg-modal-field-row">
            <label htmlFor="acl-quick-group-entry" className="omada-cfg-modal-label">
              Entry / Range
            </label>
            <SInput
              id="acl-quick-group-entry"
              variant="filled"
              value={quickCreateValue}
              onChange={(e) => setQuickCreateValue(e.target.value)}
            />
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
