import React, { useMemo, useState } from 'react';
import { Checkbox, Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import {
  PortBadgeTile,
  SButton,
  SCheckbox,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SPagination,
  SProductImage,
  SSelect,
  SSwitch,
  resolveConnectedProductSlug,
  useOmadaConfirm,
  useOmadaNotification,
} from '@/omada';
import {
  INITIAL_PORT_PROFILES,
  INITIAL_SWITCH_PORTS,
  type SwitchPortProfileRecord,
  type SwitchPortRow,
} from './deviceConfigData';

export interface SwitchPortsConfigPageProps {
  /** Optional initial sub-tab (`'port-settings'` | `'port-profile'`). */
  initialTab?: 'port-settings' | 'port-profile';
  /** Optional callback when user clicks a connected Omada device name. */
  onOpenDeviceByName?: (deviceName: string) => void;
}

type SubTabKey = 'port-settings' | 'port-profile';
type ViewModeKey = 'overview' | 'poe' | 'counters';
type LinkStatusFilterKey = 'all' | 'connected' | 'disconnected' | 'disabled';
type PortTypeFilterKey = 'all' | 'Trunk' | 'Access';
type PoeFilterKey = 'all' | 'poe-capable' | 'non-poe';

interface ColumnToggleConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  locked?: boolean;
}

const OVERVIEW_COLUMN_TOGGLES: ColumnToggleConfig[] = [
  { key: 'port', label: 'Port', defaultVisible: true, locked: true },
  { key: 'switch', label: 'Switch', defaultVisible: true, locked: true },
  { key: 'model', label: 'Model', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'connection', label: 'Connection', defaultVisible: true },
  { key: 'label', label: 'Label', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'poe', label: 'PoE', defaultVisible: true },
  { key: 'operation', label: 'Operation', defaultVisible: true },
  { key: 'profile', label: 'Profile', defaultVisible: true },
  { key: 'nativeNetwork', label: 'Native Network', defaultVisible: true },
  { key: 'txSum', label: 'TX Sum', defaultVisible: true },
  { key: 'rxSum', label: 'RX Sum', defaultVisible: true },
];

const DEFAULT_VISIBLE_KEYS = OVERVIEW_COLUMN_TOGGLES.filter(
  (c) => c.defaultVisible,
).map((c) => c.key);

const FunnelGlyph: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1.5 2.25H10.5L7.125 6.375V9.375L4.875 10.35V6.375L1.5 2.25Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Omada Controller v6.3.0.34 `Device Config -> Switch -> Switch Ports` page (`#/switch-ports`).
 * Replicates the `Port Settings` (30 ports across 3 site switches, view & link status toggles,
 * column filter popovers, sticky right Action column) and `Port Profile` tabs.
 */
export const SwitchPortsConfigPage: React.FC<SwitchPortsConfigPageProps> = ({
  initialTab = 'port-settings',
  onOpenDeviceByName,
}) => {
  const notification = useOmadaNotification();
  const { confirmDanger } = useOmadaConfirm();

  const [subTab, setSubTab] = useState<SubTabKey>(initialTab);
  const [ports, setPorts] = useState<SwitchPortRow[]>(INITIAL_SWITCH_PORTS);
  const [profiles, setProfiles] = useState<SwitchPortProfileRecord[]>(
    INITIAL_PORT_PROFILES,
  );

  // Port Settings toolbar & filter state
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewModeKey>('overview');
  const [linkFilter, setLinkFilter] = useState<LinkStatusFilterKey>('all');
  const [switchFilter, setSwitchFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<PortTypeFilterKey>('all');
  const [poeFilter, setPoeFilter] = useState<PoeFilterKey>('all');

  const [switchPopoverOpen, setSwitchPopoverOpen] = useState(false);
  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] =
    useState<string[]>(DEFAULT_VISIBLE_KEYS);

  const [selectedPortKeys, setSelectedPortKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Edit / Mirror / Help modals
  const [helpOpen, setHelpOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<SwitchPortRow | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    label: string;
    profile: string;
    type: 'Trunk' | 'Access';
    operation: 'Switching' | 'Mirroring' | 'Disabled';
    poeEnabled: boolean;
  }>({
    name: '',
    label: '-',
    profile: 'All',
    type: 'Trunk',
    operation: 'Switching',
    poeEnabled: false,
  });

  const [copySourcePort, setCopySourcePort] = useState<SwitchPortRow | null>(
    null,
  );
  const [copyTargetKeys, setCopyTargetKeys] = useState<string[]>([]);

  // Port Profile tab state
  const [profileSearch, setProfileSearch] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] =
    useState<SwitchPortProfileRecord | null>(null);
  const [profileDraft, setProfileDraft] = useState<{
    name: string;
    poe: SwitchPortProfileRecord['poe'];
    nativeNetwork: string;
    taggedNetworks: string;
    bandwidthLimit: string;
    lldpMed: 'Enable' | 'Disable';
    isolation: boolean;
    stormControl: boolean;
  }>({
    name: '',
    poe: 'On',
    nativeNetwork: 'Default(1)',
    taggedNetworks: '--',
    bandwidthLimit: 'Off',
    lldpMed: 'Enable',
    isolation: false,
    stormControl: false,
  });

  const switchOptions = useMemo(
    () => Array.from(new Set(ports.map((p) => p.switchName))),
    [ports],
  );

  const labelOptions = useMemo(
    () => Array.from(new Set(ports.map((p) => p.label))),
    [ports],
  );

  const filteredPorts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ports.filter((item) => {
      if (linkFilter === 'connected') {
        if (
          item.linkStatus === 'disconnected' ||
          item.linkStatus === 'disabled'
        ) {
          return false;
        }
      } else if (linkFilter === 'disconnected') {
        if (item.linkStatus !== 'disconnected') return false;
      } else if (linkFilter === 'disabled') {
        if (item.linkStatus !== 'disabled') return false;
      }

      if (switchFilter !== 'all' && item.switchName !== switchFilter) {
        return false;
      }
      if (labelFilter !== 'all' && item.label !== labelFilter) {
        return false;
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }
      if (poeFilter === 'poe-capable' && !item.poeCapable) {
        return false;
      }
      if (poeFilter === 'non-poe' && item.poeCapable) {
        return false;
      }

      if (!q) return true;
      return (
        item.switchName.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.profile.toLowerCase().includes(q) ||
        (item.connectionName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [
    ports,
    search,
    linkFilter,
    switchFilter,
    labelFilter,
    typeFilter,
    poeFilter,
  ]);

  const paginatedPorts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPorts.slice(start, start + pageSize);
  }, [filteredPorts, currentPage, pageSize]);

  const activeToolbarFilterCount =
    (switchFilter !== 'all' ? 1 : 0) +
    (labelFilter !== 'all' ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0) +
    (poeFilter !== 'all' ? 1 : 0);

  const visibleKeySet = useMemo(
    () => new Set(visibleColumnKeys),
    [visibleColumnKeys],
  );

  const openEditModal = (record: SwitchPortRow) => {
    setEditingPort(record);
    setEditDraft({
      name: record.name,
      label: record.label,
      profile: record.profile,
      type: record.type,
      operation: record.operation,
      poeEnabled: Boolean(record.isPoe),
    });
  };

  const handleSavePortEdit = () => {
    if (!editingPort) return;
    const trimmedName = editDraft.name.trim() || editingPort.name;
    const trimmedLabel = editDraft.label.trim() || '-';
    const isDisabling = editDraft.operation === 'Disabled';

    setPorts((prev) =>
      prev.map((row) => {
        if (row.key !== editingPort.key) return row;
        const nextLinkStatus = isDisabling
          ? 'disabled'
          : row.linkStatus === 'disabled'
            ? 'disconnected'
            : row.linkStatus;
        const nextPoe = !row.poeCapable
          ? '--'
          : editDraft.poeEnabled
            ? row.poePowerW
              ? `On (${row.poePowerW}W)`
              : 'PoE+(30W)'
            : 'Off';
        return {
          ...row,
          name: trimmedName,
          label: trimmedLabel,
          profile: editDraft.profile,
          type: editDraft.type,
          operation: editDraft.operation,
          isPoe: row.poeCapable ? editDraft.poeEnabled : false,
          isMirroring: editDraft.operation === 'Mirroring',
          linkStatus: nextLinkStatus,
          poe: nextPoe,
        };
      }),
    );

    notification.success({
      title: 'Port Configuration Saved',
      description: `Updated ${editingPort.switchName} ${trimmedName} (${editDraft.profile} · ${editDraft.type}).`,
    });
    setEditingPort(null);
  };

  const openCopyModal = (record: SwitchPortRow) => {
    setCopySourcePort(record);
    setCopyTargetKeys([]);
  };

  const handleApplyCopy = () => {
    if (!copySourcePort || copyTargetKeys.length === 0) {
      setCopySourcePort(null);
      return;
    }
    const targetSet = new Set(copyTargetKeys);
    setPorts((prev) =>
      prev.map((row) => {
        if (!targetSet.has(row.key)) return row;
        return {
          ...row,
          profile: copySourcePort.profile,
          type: copySourcePort.type,
          operation: copySourcePort.operation,
          nativeNetwork: copySourcePort.nativeNetwork,
        };
      }),
    );
    notification.success({
      title: 'Port Configuration Copied',
      description: `Applied ${copySourcePort.switchName} ${copySourcePort.name} settings to ${copyTargetKeys.length} target port(s).`,
    });
    setCopySourcePort(null);
  };

  const handlePoePowerCycle = (record: SwitchPortRow) => {
    notification.info({
      title: 'PoE Power Cycle Triggered',
      description: `Cycling PoE power on ${record.switchName} ${record.name}${
        record.connectionName ? ` (${record.connectionName})` : ''
      }.`,
    });
  };

  const switchFilterPopover = (
    <div className="w-[210px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Filter by Switch
      </div>
      {[
        { key: 'all', label: 'All Switches' },
        ...switchOptions.map((s) => ({ key: s, label: s })),
      ].map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setSwitchFilter(opt.key);
            setSwitchPopoverOpen(false);
            setCurrentPage(1);
          }}
          className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
            switchFilter === opt.key
              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
          }`}
        >
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );

  const labelFilterPopover = (
    <div className="w-[170px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Filter by Label
      </div>
      {[
        { key: 'all', label: 'All Labels' },
        ...labelOptions.map((l) => ({
          key: l,
          label: l === '-' ? 'Unlabeled (-)' : l,
        })),
      ].map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setLabelFilter(opt.key);
            setLabelPopoverOpen(false);
            setCurrentPage(1);
          }}
          className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
            labelFilter === opt.key
              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
          }`}
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );

  const typeFilterPopover = (
    <div className="w-[150px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Filter by Type
      </div>
      {(
        [
          { key: 'all', label: 'All Types' },
          { key: 'Trunk', label: 'Trunk' },
          { key: 'Access', label: 'Access' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setTypeFilter(opt.key);
            setTypePopoverOpen(false);
            setCurrentPage(1);
          }}
          className={`flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
            typeFilter === opt.key
              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
          }`}
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );

  const toolbarFilterPopover = (
    <div className="w-[260px] space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Filter Switch Ports
        </span>
        <button
          type="button"
          onClick={() => {
            setSwitchFilter('all');
            setLabelFilter('all');
            setTypeFilter('all');
            setPoeFilter('all');
            setLinkFilter('all');
            setSearch('');
            setCurrentPage(1);
          }}
          className="cursor-pointer border-none bg-transparent p-0 text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>

      <div>
        <label
          htmlFor="omada-port-filter-switch"
          className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
        >
          Switch
        </label>
        <SSelect
          id="omada-port-filter-switch"
          value={switchFilter}
          onChange={(val) => {
            setSwitchFilter(String(val));
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Switches', value: 'all' },
            ...switchOptions.map((s) => ({ label: s, value: s })),
          ]}
          className="w-full"
        />
      </div>

      <div>
        <label
          htmlFor="omada-port-filter-type"
          className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
        >
          Port Type
        </label>
        <SSelect
          id="omada-port-filter-type"
          value={typeFilter}
          onChange={(val) => {
            setTypeFilter(val as PortTypeFilterKey);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Trunk', value: 'Trunk' },
            { label: 'Access', value: 'Access' },
          ]}
          className="w-full"
        />
      </div>

      <div>
        <label
          htmlFor="omada-port-filter-poe"
          className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
        >
          PoE Capability
        </label>
        <SSelect
          id="omada-port-filter-poe"
          value={poeFilter}
          onChange={(val) => {
            setPoeFilter(val as PoeFilterKey);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Ports', value: 'all' },
            { label: 'PoE Capable', value: 'poe-capable' },
            { label: 'Non-PoE', value: 'non-poe' },
          ]}
          className="w-full"
        />
      </div>

      <div className="flex justify-end">
        <SButton
          variant="primary"
          size="small"
          onClick={() => setFilterPopoverOpen(false)}
        >
          Apply
        </SButton>
      </div>
    </div>
  );

  const columnSelectorPopover = (
    <div className="w-[210px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Customize Columns
        </span>
        <button
          type="button"
          onClick={() => setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS)}
          className="cursor-pointer border-none bg-transparent p-0 text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {OVERVIEW_COLUMN_TOGGLES.map((col) => {
          const checked = visibleKeySet.has(col.key);
          return (
            <label
              key={col.key}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors hover:bg-[var(--omada-bg-field)] ${
                col.locked ? 'cursor-not-allowed opacity-65' : 'cursor-pointer'
              }`}
            >
              <Checkbox
                checked={checked}
                disabled={col.locked}
                onChange={() => {
                  if (col.locked) return;
                  setVisibleColumnKeys((prev) =>
                    prev.includes(col.key)
                      ? prev.filter((item) => item !== col.key)
                      : [...prev, col.key],
                  );
                }}
              />
              <span className="truncate text-[var(--omada-text-primary)]">
                {col.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const columns: ColumnsType<SwitchPortRow> = useMemo(() => {
    const basePortCol: ColumnsType<SwitchPortRow>[number] = {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      width: 74,
      render: (portNum: number, record) => (
        <div className="flex items-center gap-2">
          <PortBadgeTile port={record} size={24} />
          <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
            {portNum}
          </span>
        </div>
      ),
    };

    const baseSwitchCol: ColumnsType<SwitchPortRow>[number] = {
      title: (
        <span className="inline-flex items-center justify-between gap-2 w-full">
          <span>Switch</span>
          <Popover
            trigger="click"
            placement="bottomLeft"
            open={switchPopoverOpen}
            onOpenChange={setSwitchPopoverOpen}
            content={switchFilterPopover}
            styles={{ container: { padding: 10 } }}
          >
            <button
              type="button"
              aria-label="Filter switch"
              onClick={(e) => e.stopPropagation()}
              className={`omada-devcfg-col-filter-btn ${
                switchFilter !== 'all' ? 'is-filtered' : ''
              }`}
            >
              <FunnelGlyph />
            </button>
          </Popover>
        </span>
      ),
      dataIndex: 'switchName',
      key: 'switch',
      width: 269,
      render: (switchName: string, record) => (
        <div className="flex items-center gap-2.5">
          <SProductImage
            name={record.switchProductSlug}
            size={24}
            alt={record.model}
            className="h-[24px] w-[28px] shrink-0 object-contain"
          />
          <span className="truncate text-[14px] text-[var(--omada-text-primary)]">
            {switchName}
          </span>
        </div>
      ),
    };

    const baseModelCol: ColumnsType<SwitchPortRow>[number] = {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 144,
      render: (model: string) => (
        <span className="text-[14px] text-[var(--omada-text-primary)]">
          {model}
        </span>
      ),
    };

    const baseNameCol: ColumnsType<SwitchPortRow>[number] = {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 78,
      render: (name: string) => (
        <span className="text-[14px] text-[var(--omada-text-primary)]">
          {name}
        </span>
      ),
    };

    const baseConnectionCol: ColumnsType<SwitchPortRow>[number] = {
      title: 'Connection',
      dataIndex: 'connectionName',
      key: 'connection',
      width: 232,
      render: (val: string | undefined, record) => {
        if (!val) {
          return (
            <span className="text-[14px] text-[var(--omada-text-primary)]">
              -
            </span>
          );
        }
        const slug = resolveConnectedProductSlug(
          record.connectionProductSlug,
          record.connectionType,
          val,
        );
        const isDevice =
          record.connectionType && record.connectionType !== 'client';
        return (
          <div className="flex items-center gap-2.5">
            <SProductImage
              name={slug}
              size={24}
              alt={val}
              className="h-[24px] w-[24px] shrink-0 object-contain"
            />
            {isDevice && onOpenDeviceByName ? (
              <button
                type="button"
                onClick={() => onOpenDeviceByName(val)}
                className="cursor-pointer truncate border-none bg-transparent p-0 text-left text-[14px] text-[var(--omada-text-primary)] hover:text-[var(--omada-brand-text)] hover:underline"
              >
                {val}
              </button>
            ) : (
              <span className="truncate text-[14px] text-[var(--omada-text-primary)]">
                {val}
              </span>
            )}
          </div>
        );
      },
    };

    const actionCol: ColumnsType<SwitchPortRow>[number] = {
      title: (
        <div className="flex w-full items-center justify-between gap-2">
          <span>Action</span>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={columnSelectorPopover}
            styles={{ container: { padding: 12 } }}
          >
            <button
              type="button"
              aria-label="Port table columns"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <SIcon name="more-3" size={16} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 144,
      fixed: 'end',
      render: (_val, record) => {
        const showPowerCycle =
          Boolean(record.poeCapable) &&
          Boolean(record.isPoe) &&
          record.linkStatus !== 'disconnected' &&
          record.linkStatus !== 'disabled';
        return (
          <div className="flex items-center gap-3">
            <Tooltip title={`Edit ${record.switchName} ${record.name}`}>
              <button
                type="button"
                aria-label={`Edit ${record.switchName} ${record.name}`}
                onClick={() => openEditModal(record)}
                className="omada-devcfg-row-action-btn"
              >
                <SIcon name="edit" size={16} />
              </button>
            </Tooltip>
            <Tooltip title={`Copy config from ${record.name}`}>
              <button
                type="button"
                aria-label={`Copy config ${record.switchName} ${record.name}`}
                onClick={() => openCopyModal(record)}
                className="omada-devcfg-row-action-btn"
              >
                <SIcon name="copy-paste" size={16} />
              </button>
            </Tooltip>
            {showPowerCycle && (
              <Tooltip title={`PoE Power Cycle ${record.name}`}>
                <button
                  type="button"
                  aria-label={`Power cycle ${record.switchName} ${record.name}`}
                  onClick={() => handlePoePowerCycle(record)}
                  className="omada-devcfg-row-action-btn"
                >
                  <SIcon name="reboot" size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    };

    if (viewMode === 'poe') {
      return [
        basePortCol,
        baseSwitchCol,
        baseModelCol,
        baseNameCol,
        baseConnectionCol,
        {
          title: 'PoE Mode',
          dataIndex: 'poe',
          key: 'poe',
          width: 130,
        },
        {
          title: 'Power Draw',
          key: 'poePowerW',
          width: 120,
          render: (_v, r) => (
            <span className="tabular-nums">
              {r.poePowerW !== undefined ? `${r.poePowerW.toFixed(1)} W` : '--'}
            </span>
          ),
        },
        {
          title: 'Budget Class',
          key: 'poeBudget',
          width: 135,
          render: (_v, r) => (r.poeCapable ? '802.3at (30W)' : 'Non-PoE'),
        },
        {
          title: 'Operation',
          dataIndex: 'operation',
          key: 'operation',
          width: 128,
        },
        actionCol,
      ];
    }

    if (viewMode === 'counters') {
      return [
        basePortCol,
        baseSwitchCol,
        baseModelCol,
        baseNameCol,
        baseConnectionCol,
        {
          title: 'Link Speed',
          dataIndex: 'linkSpeedLabel',
          key: 'linkSpeed',
          width: 120,
        },
        {
          title: 'TX Packets',
          dataIndex: 'txPackets',
          key: 'txPackets',
          width: 130,
          render: (val: string) => <span className="tabular-nums">{val}</span>,
        },
        {
          title: 'RX Packets',
          dataIndex: 'rxPackets',
          key: 'rxPackets',
          width: 130,
          render: (val: string) => <span className="tabular-nums">{val}</span>,
        },
        {
          title: 'TX Sum',
          dataIndex: 'txSum',
          key: 'txSum',
          width: 113,
          render: (val: string) => <span className="tabular-nums">{val}</span>,
        },
        {
          title: 'RX Sum',
          dataIndex: 'rxSum',
          key: 'rxSum',
          width: 111,
          render: (val: string) => <span className="tabular-nums">{val}</span>,
        },
        {
          title: 'CRC Errors',
          dataIndex: 'crcErrors',
          key: 'crcErrors',
          width: 105,
          render: (val: number) => <span className="tabular-nums">{val}</span>,
        },
        actionCol,
      ];
    }

    // Overview mode (exact 15 columns including Checkbox + Action)
    const list: ColumnsType<SwitchPortRow> = [basePortCol, baseSwitchCol];
    if (visibleKeySet.has('model')) list.push(baseModelCol);
    if (visibleKeySet.has('name')) list.push(baseNameCol);
    if (visibleKeySet.has('connection')) list.push(baseConnectionCol);

    if (visibleKeySet.has('label')) {
      list.push({
        title: (
          <span className="inline-flex items-center justify-between gap-2 w-full">
            <span>Label</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={labelPopoverOpen}
              onOpenChange={setLabelPopoverOpen}
              content={labelFilterPopover}
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter label"
                onClick={(e) => e.stopPropagation()}
                className={`omada-devcfg-col-filter-btn ${
                  labelFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FunnelGlyph />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'label',
        key: 'label',
        width: 97,
      });
    }

    if (visibleKeySet.has('type')) {
      list.push({
        title: (
          <span className="inline-flex items-center justify-between gap-2 w-full">
            <span>Type</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              open={typePopoverOpen}
              onOpenChange={setTypePopoverOpen}
              content={typeFilterPopover}
              styles={{ container: { padding: 10 } }}
            >
              <button
                type="button"
                aria-label="Filter type"
                onClick={(e) => e.stopPropagation()}
                className={`omada-devcfg-col-filter-btn ${
                  typeFilter !== 'all' ? 'is-filtered' : ''
                }`}
              >
                <FunnelGlyph />
              </button>
            </Popover>
          </span>
        ),
        dataIndex: 'type',
        key: 'type',
        width: 93,
      });
    }

    if (visibleKeySet.has('poe')) {
      list.push({
        title: 'PoE',
        dataIndex: 'poe',
        key: 'poe',
        width: 122,
      });
    }

    if (visibleKeySet.has('operation')) {
      list.push({
        title: 'Operation',
        dataIndex: 'operation',
        key: 'operation',
        width: 128,
      });
    }

    if (visibleKeySet.has('profile')) {
      list.push({
        title: 'Profile',
        dataIndex: 'profile',
        key: 'profile',
        width: 105,
      });
    }

    if (visibleKeySet.has('nativeNetwork')) {
      list.push({
        title: 'Native Network',
        dataIndex: 'nativeNetwork',
        key: 'nativeNetwork',
        width: 163,
      });
    }

    if (visibleKeySet.has('txSum')) {
      list.push({
        title: 'TX Sum',
        dataIndex: 'txSum',
        key: 'txSum',
        width: 113,
        render: (val: string) => <span className="tabular-nums">{val}</span>,
      });
    }

    if (visibleKeySet.has('rxSum')) {
      list.push({
        title: 'RX Sum',
        dataIndex: 'rxSum',
        key: 'rxSum',
        width: 111,
        render: (val: string) => <span className="tabular-nums">{val}</span>,
      });
    }

    list.push(actionCol);
    return list;
  }, [
    viewMode,
    visibleKeySet,
    switchPopoverOpen,
    labelPopoverOpen,
    typePopoverOpen,
    switchFilter,
    labelFilter,
    typeFilter,
    onOpenDeviceByName,
  ]);

  const totalScrollWidth = useMemo(
    () =>
      44 +
      columns.reduce(
        (sum, col) => sum + (typeof col.width === 'number' ? col.width : 120),
        0,
      ),
    [columns],
  );

  // Port Profiles tab filtering & modal handlers
  const filteredProfiles = useMemo(() => {
    const q = profileSearch.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nativeNetwork.toLowerCase().includes(q) ||
        p.taggedNetworks.toLowerCase().includes(q),
    );
  }, [profiles, profileSearch]);

  const openNewProfileModal = () => {
    setEditingProfile(null);
    setProfileDraft({
      name: '',
      poe: 'On',
      nativeNetwork: 'Default(1)',
      taggedNetworks: '--',
      bandwidthLimit: 'Off',
      lldpMed: 'Enable',
      isolation: false,
      stormControl: false,
    });
    setProfileModalOpen(true);
  };

  const openEditProfileModal = (profile: SwitchPortProfileRecord) => {
    setEditingProfile(profile);
    setProfileDraft({
      name: profile.name,
      poe: profile.poe,
      nativeNetwork: profile.nativeNetwork,
      taggedNetworks: profile.taggedNetworks,
      bandwidthLimit: profile.bandwidthLimit,
      lldpMed: profile.lldpMed,
      isolation: profile.isolation,
      stormControl: profile.stormControl,
    });
    setProfileModalOpen(true);
  };

  const handleSaveProfile = () => {
    const trimmedName = profileDraft.name.trim();
    if (!trimmedName) {
      notification.warning({
        title: 'Profile Name Required',
        description: 'Enter a valid switch port profile name before saving.',
      });
      return;
    }

    if (editingProfile) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.key === editingProfile.key
            ? {
                ...p,
                name: p.builtIn ? p.name : trimmedName,
                poe: profileDraft.poe,
                nativeNetwork: profileDraft.nativeNetwork,
                taggedNetworks: profileDraft.taggedNetworks || '--',
                bandwidthLimit: profileDraft.bandwidthLimit,
                lldpMed: profileDraft.lldpMed,
                isolation: profileDraft.isolation,
                stormControl: profileDraft.stormControl,
              }
            : p,
        ),
      );
      notification.success({
        title: 'Port Profile Updated',
        description: `Saved configuration changes for "${editingProfile.name}".`,
      });
    } else {
      const next: SwitchPortProfileRecord = {
        key: `profile-${Date.now()}`,
        name: trimmedName,
        poe: profileDraft.poe,
        nativeNetwork: profileDraft.nativeNetwork,
        taggedNetworks: profileDraft.taggedNetworks || '--',
        untaggedNetworks: profileDraft.nativeNetwork,
        bandwidthLimit: profileDraft.bandwidthLimit,
        lldpMed: profileDraft.lldpMed,
        isolation: profileDraft.isolation,
        stormControl: profileDraft.stormControl,
      };
      setProfiles((prev) => [...prev, next]);
      notification.success({
        title: 'Port Profile Created',
        description: `Created switch port profile "${trimmedName}".`,
      });
    }
    setProfileModalOpen(false);
  };

  const handleDeleteProfile = (profile: SwitchPortProfileRecord) => {
    confirmDanger({
      title: `Delete Port Profile "${profile.name}"?`,
      content:
        'Ports currently assigned to this profile will revert to the default "All" profile.',
      onOk: () => {
        setProfiles((prev) => prev.filter((item) => item.key !== profile.key));
        notification.success({
          title: 'Port Profile Deleted',
          description: `Removed "${profile.name}".`,
        });
      },
    });
  };

  const profileColumns: ColumnsType<SwitchPortProfileRecord> = [
    {
      title: 'Profile Name',
      dataIndex: 'name',
      key: 'name',
      width: 190,
      render: (name: string, record) => (
        <span className="font-medium text-[var(--omada-text-primary)]">
          {name}
          {record.builtIn && (
            <span className="ml-2 text-xs font-normal text-[var(--omada-text-tertiary)]">
              (Built-in)
            </span>
          )}
        </span>
      ),
    },
    { title: 'PoE', dataIndex: 'poe', key: 'poe', width: 170 },
    {
      title: 'Native Network',
      dataIndex: 'nativeNetwork',
      key: 'nativeNetwork',
      width: 145,
    },
    {
      title: 'Tagged Networks',
      dataIndex: 'taggedNetworks',
      key: 'taggedNetworks',
      width: 220,
    },
    {
      title: 'Untagged Networks',
      dataIndex: 'untaggedNetworks',
      key: 'untaggedNetworks',
      width: 155,
    },
    {
      title: 'Bandwidth Limit',
      dataIndex: 'bandwidthLimit',
      key: 'bandwidthLimit',
      width: 140,
    },
    { title: 'LLDP-MED', dataIndex: 'lldpMed', key: 'lldpMed', width: 110 },
    {
      title: 'Action',
      key: 'action',
      width: 110,
      fixed: 'end',
      render: (_val, record) => (
        <div className="flex items-center gap-3">
          <Tooltip title={`Edit ${record.name}`}>
            <button
              type="button"
              aria-label={`Edit profile ${record.name}`}
              onClick={() => openEditProfileModal(record)}
              className="omada-devcfg-row-action-btn"
            >
              <SIcon name="edit" size={16} />
            </button>
          </Tooltip>
          {!record.builtIn && (
            <Tooltip title={`Delete ${record.name}`}>
              <button
                type="button"
                aria-label={`Delete profile ${record.name}`}
                onClick={() => handleDeleteProfile(record)}
                className="omada-devcfg-row-action-btn"
              >
                <SIcon name="delete" size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const copyCandidates = useMemo(
    () =>
      copySourcePort
        ? ports.filter(
            (p) =>
              p.switchKey === copySourcePort.switchKey &&
              p.key !== copySourcePort.key,
          )
        : [],
    [ports, copySourcePort],
  );

  return (
    <div
      className="omada-devcfg-page px-6 pt-4 pb-6"
      data-testid="switch-ports-config-page"
    >
      {/* Top Underline Sub-Tabs + Top-Right (?) Help Icon */}
      <div className="flex items-end justify-between border-b border-[var(--omada-border-divider)]">
        <div
          role="tablist"
          aria-label="Switch Ports sections"
          className="flex items-center gap-8"
        >
          {(
            [
              { key: 'port-settings', label: 'Port Settings' },
              { key: 'port-profile', label: 'Port Profile' },
            ] as const
          ).map((tab) => {
            const isActive = subTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSubTab(tab.key)}
                className={`omada-devcfg-subtab-btn cursor-pointer text-[18px] leading-[26px] ${
                  isActive ? 'is-active font-medium' : 'font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="omada-devcfg-subtab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
                )}
              </button>
            );
          })}
        </div>

        <Tooltip title="Switch Ports Help">
          <button
            type="button"
            aria-label="Switch Ports help"
            onClick={() => setHelpOpen(true)}
            className="omada-devcfg-help-btn mb-2"
          >
            <SIcon name="question" size={20} />
          </button>
        </Tooltip>
      </div>

      {subTab === 'port-settings' && (
        <>
          {/* Toolbar with pr-9 right clearance from <|| handle */}
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <div className="flex flex-wrap items-center gap-3">
              <SInput
                variant="filled"
                allowClear
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Switch, Name, Label, Profile"
                aria-label="Search switch ports"
                suffix={
                  <SIcon
                    name="input-search"
                    size={14}
                    className="text-[var(--omada-text-tertiary)]"
                  />
                }
                className="omada-devcfg-search"
                style={{ width: 250 }}
              />

              {/* View Mode Segmented Track */}
              <div
                role="tablist"
                aria-label="Port table view mode"
                className="omada-devcfg-seg-track"
              >
                {(
                  [
                    { key: 'overview', label: 'Overview' },
                    { key: 'poe', label: 'PoE' },
                    { key: 'counters', label: 'Counters' },
                  ] as const
                ).map((item) => {
                  const isActive = viewMode === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setViewMode(item.key)}
                      className={`omada-devcfg-seg-pill ${
                        isActive ? 'is-active' : ''
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Link Status Segmented Track */}
              <div
                role="tablist"
                aria-label="Port link status filter"
                className="omada-devcfg-seg-track"
              >
                {(
                  [
                    { key: 'all', label: 'All' },
                    { key: 'connected', label: 'Connected' },
                    { key: 'disconnected', label: 'Disconnected' },
                    { key: 'disabled', label: 'Disabled' },
                  ] as const
                ).map((item) => {
                  const isActive = linkFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setLinkFilter(item.key);
                        setCurrentPage(1);
                      }}
                      className={`omada-devcfg-seg-pill ${
                        isActive ? 'is-active' : ''
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {selectedPortKeys.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const first = ports.find(
                      (p) => p.key === selectedPortKeys[0],
                    );
                    if (first) openEditModal(first);
                  }}
                  className="omada-devcfg-ghost-action"
                >
                  <SIcon name="edit" size={15} />
                  <span>Edit Selected ({selectedPortKeys.length})</span>
                </button>
              )}

              <Popover
                trigger="click"
                placement="bottomRight"
                open={filterPopoverOpen}
                onOpenChange={setFilterPopoverOpen}
                content={toolbarFilterPopover}
                styles={{ container: { padding: 12 } }}
              >
                <button type="button" className="omada-devcfg-ghost-action">
                  <SIcon name="filter" size={15} />
                  <span>
                    Filter
                    {activeToolbarFilterCount > 0
                      ? ` (${activeToolbarFilterCount})`
                      : ''}
                  </span>
                </button>
              </Popover>
            </div>
          </div>

          {/* Horizontally Scrollable Switch Ports Table */}
          <div className="omada-devcfg-table-shell">
            <Table<SwitchPortRow>
              rowKey="key"
              columns={columns}
              dataSource={paginatedPorts}
              pagination={false}
              scroll={{ x: totalScrollWidth }}
              rowSelection={{
                selectedRowKeys: selectedPortKeys,
                onChange: (keys) => setSelectedPortKeys(keys),
                columnWidth: 44,
              }}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No matching switch ports"
                    description="Adjust your search query or link status filter to inspect switch ports."
                  />
                ),
              }}
              className="omada-devcfg-table"
            />
          </div>

          {/* Right-Aligned Pagination Bar */}
          {filteredPorts.length > 0 && (
            <div className="omada-devcfg-pagination mt-4">
              <SPagination
                align="right"
                current={currentPage}
                pageSize={pageSize}
                total={filteredPorts.length}
                showSizeChanger={{ variant: 'filled' }}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                locale={{ items_per_page: '/page' }}
                summaryRender={([start, end], total) =>
                  `Showing ${start}-${end} of ${total} records`
                }
                onChange={(nextPage, nextSize) => {
                  setCurrentPage(nextPage);
                  setPageSize(nextSize);
                }}
              />
            </div>
          )}
        </>
      )}

      {subTab === 'port-profile' && (
        <>
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <SInput
              variant="filled"
              allowClear
              value={profileSearch}
              onChange={(e) => setProfileSearch(e.target.value)}
              placeholder="Search Profile Name or Network"
              aria-label="Search port profiles"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
              className="omada-devcfg-search"
              style={{ width: 250 }}
            />

            <SButton
              variant="primary"
              icon={<Plus size={15} />}
              onClick={openNewProfileModal}
              className="omada-devcfg-primary-btn"
            >
              Create New Port Profile
            </SButton>
          </div>

          <div className="omada-devcfg-table-shell">
            <Table<SwitchPortProfileRecord>
              rowKey="key"
              columns={profileColumns}
              dataSource={filteredProfiles}
              pagination={false}
              scroll={{ x: 1120 }}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No matching port profiles"
                    description="Create a new port profile or clear the search query."
                  />
                ),
              }}
              className="omada-devcfg-table"
            />
          </div>
        </>
      )}

      {/* Edit Switch Port Modal */}
      <SModal
        size="sm"
        open={Boolean(editingPort)}
        title={
          editingPort
            ? `Edit ${editingPort.switchName} · ${editingPort.name}`
            : 'Edit Switch Port'
        }
        okText="Apply"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleSavePortEdit}
        onCancel={() => setEditingPort(null)}
      >
        <div className="space-y-3.5 py-2">
          <div>
            <label
              htmlFor="omada-edit-port-name"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Port Name
            </label>
            <SInput
              id="omada-edit-port-name"
              value={editDraft.name}
              onChange={(e) =>
                setEditDraft((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="omada-edit-port-label"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Label
            </label>
            <SInput
              id="omada-edit-port-label"
              placeholder="-"
              value={editDraft.label}
              onChange={(e) =>
                setEditDraft((prev) => ({ ...prev, label: e.target.value }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="omada-edit-port-profile"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Port Profile
            </label>
            <SSelect
              id="omada-edit-port-profile"
              value={editDraft.profile}
              onChange={(val) =>
                setEditDraft((prev) => ({ ...prev, profile: String(val) }))
              }
              options={profiles.map((p) => ({ label: p.name, value: p.name }))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="omada-edit-port-type"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Port Type
              </label>
              <SSelect
                id="omada-edit-port-type"
                value={editDraft.type}
                onChange={(val) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    type: val as 'Trunk' | 'Access',
                  }))
                }
                options={[
                  { label: 'Trunk', value: 'Trunk' },
                  { label: 'Access', value: 'Access' },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="omada-edit-port-operation"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                Operation
              </label>
              <SSelect
                id="omada-edit-port-operation"
                value={editDraft.operation}
                onChange={(val) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    operation: val as SwitchPortRow['operation'],
                  }))
                }
                options={[
                  { label: 'Switching', value: 'Switching' },
                  { label: 'Mirroring', value: 'Mirroring' },
                  { label: 'Disabled', value: 'Disabled' },
                ]}
                className="w-full"
              />
            </div>
          </div>

          {editingPort?.poeCapable && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-[var(--omada-text-primary)]">
                PoE Power Supply (802.3at)
              </span>
              <SSwitch
                checked={editDraft.poeEnabled}
                onChange={(checked) =>
                  setEditDraft((prev) => ({ ...prev, poeEnabled: checked }))
                }
              />
            </div>
          )}
        </div>
      </SModal>

      {/* Copy / Mirror Port Configuration Modal */}
      <SModal
        size="sm"
        open={Boolean(copySourcePort)}
        title={
          copySourcePort
            ? `Copy Port Settings (${copySourcePort.switchName} · ${copySourcePort.name})`
            : 'Copy Port Settings'
        }
        okText="Apply to Selected Ports"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleApplyCopy}
        onCancel={() => setCopySourcePort(null)}
      >
        <div className="space-y-3 py-2">
          <div className="text-xs text-[var(--omada-text-secondary)]">
            Select target ports on{' '}
            <strong className="text-[var(--omada-text-primary)]">
              {copySourcePort?.switchName}
            </strong>{' '}
            to inherit Profile (<strong>{copySourcePort?.profile}</strong>),
            Type (<strong>{copySourcePort?.type}</strong>), and Operation (
            <strong>{copySourcePort?.operation}</strong>):
          </div>
          <div className="grid max-h-[220px] grid-cols-2 gap-2 overflow-y-auto rounded border border-[var(--omada-border-divider)] p-3">
            {copyCandidates.map((candidate) => (
              <SCheckbox
                key={candidate.key}
                checked={copyTargetKeys.includes(candidate.key)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setCopyTargetKeys((prev) =>
                    checked
                      ? [...prev, candidate.key]
                      : prev.filter((k) => k !== candidate.key),
                  );
                }}
              >
                {candidate.name}
              </SCheckbox>
            ))}
          </div>
        </div>
      </SModal>

      {/* Create / Edit Port Profile Modal */}
      <SModal
        size="sm"
        open={profileModalOpen}
        title={
          editingProfile
            ? `Edit Port Profile: ${editingProfile.name}`
            : 'Create New Port Profile'
        }
        okText="Save"
        cancelText="Cancel"
        destroyOnHidden
        onOk={handleSaveProfile}
        onCancel={() => setProfileModalOpen(false)}
      >
        <div className="space-y-3.5 py-2">
          <div>
            <label
              htmlFor="omada-profile-name"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Profile Name
            </label>
            <SInput
              id="omada-profile-name"
              disabled={Boolean(editingProfile?.builtIn)}
              placeholder="e.g. Guest_AP_Trunk"
              value={profileDraft.name}
              onChange={(e) =>
                setProfileDraft((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="omada-profile-poe"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                PoE
              </label>
              <SSelect
                id="omada-profile-poe"
                value={profileDraft.poe}
                onChange={(val) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    poe: val as SwitchPortProfileRecord['poe'],
                  }))
                }
                options={[
                  { label: 'Keep Device Settings', value: 'Keep Device Settings' },
                  { label: 'On', value: 'On' },
                  { label: 'Off', value: 'Off' },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="omada-profile-lldp"
                className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
              >
                LLDP-MED
              </label>
              <SSelect
                id="omada-profile-lldp"
                value={profileDraft.lldpMed}
                onChange={(val) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    lldpMed: val as 'Enable' | 'Disable',
                  }))
                }
                options={[
                  { label: 'Enable', value: 'Enable' },
                  { label: 'Disable', value: 'Disable' },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="omada-profile-native"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Native Network
            </label>
            <SSelect
              id="omada-profile-native"
              value={profileDraft.nativeNetwork}
              onChange={(val) =>
                setProfileDraft((prev) => ({
                  ...prev,
                  nativeNetwork: String(val),
                }))
              }
              options={[
                { label: 'Default(1)', value: 'Default(1)' },
                { label: 'vlan20(20)', value: 'vlan20(20)' },
                { label: 'interface-vlan100(100)', value: 'interface-vlan100(100)' },
                { label: 'interface-vlan110(110)', value: 'interface-vlan110(110)' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="omada-profile-tagged"
              className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Tagged Networks
            </label>
            <SInput
              id="omada-profile-tagged"
              placeholder="e.g. vlan20(20), interface-vlan100(100)"
              value={profileDraft.taggedNetworks}
              onChange={(e) =>
                setProfileDraft((prev) => ({
                  ...prev,
                  taggedNetworks: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <SCheckbox
              checked={profileDraft.isolation}
              onChange={(e) =>
                setProfileDraft((prev) => ({
                  ...prev,
                  isolation: e.target.checked,
                }))
              }
            >
              Port Isolation
            </SCheckbox>
            <SCheckbox
              checked={profileDraft.stormControl}
              onChange={(e) =>
                setProfileDraft((prev) => ({
                  ...prev,
                  stormControl: e.target.checked,
                }))
              }
            >
              Storm Control
            </SCheckbox>
          </div>
        </div>
      </SModal>

      {/* Help Modal */}
      <SModal
        size="sm"
        open={helpOpen}
        title="Switch Ports Configuration Help"
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        destroyOnHidden
        onOk={() => setHelpOpen(false)}
        onCancel={() => setHelpOpen(false)}
      >
        <div className="space-y-2 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
          <p className="m-0">
            <strong className="text-[var(--omada-text-primary)]">
              Port Settings:
            </strong>{' '}
            Inspect physical link speed, PoE delivery, native/tagged VLAN
            profiles, and traffic counters across all managed site switches.
          </p>
          <p className="m-0">
            <strong className="text-[var(--omada-text-primary)]">
              Port Profile:
            </strong>{' '}
            Define reusable VLAN, PoE, bandwidth limit, and LLDP-MED templates
            to apply consistently across switch ports.
          </p>
        </div>
      </SModal>
    </div>
  );
};
