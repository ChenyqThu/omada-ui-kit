import React, { useMemo, useState } from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Info, Plus } from 'lucide-react';
import {
  SButton,
  SEmpty,
  SIcon,
  SInput,
  SIpInput,
  SMacInput,
  SModal,
  SNumberInput,
  SPasswordInput,
  SSchedule,
  SSelect,
  SSwitch,
  STabs,
  STag,
  STextArea,
  useOmadaNotification,
  type SScheduleMatrix,
} from '@/omada';
import {
  CONFIG_SUBMODULE_KEYS,
  CONFIG_SUBMODULE_SCHEMAS,
  type ConfigFieldSchema,
  type ConfigSubmoduleRow,
  type ConfigSubmoduleSchema,
} from './wlanAclData';

export { CONFIG_SUBMODULE_KEYS, CONFIG_SUBMODULE_SCHEMAS };

export interface ConfigSubmodulePageProps {
  /** Route key from `EMULATOR_NAV_GROUPS` (e.g. `'ssh'`, `'schedule'`, `'dhcp-reservation'`). */
  routeKey: string;
  /** Optional fallback display label if an unmapped route key is passed. */
  routeLabel?: string;
  /** Optional navigation handler. */
  onNavigate?: (routeKey: string) => void;
}

type FieldValuesMap = Record<string, string | number | boolean>;

function buildInitialFieldValues(fields: ConfigFieldSchema[]): FieldValuesMap {
  const initial: FieldValuesMap = {};
  for (const field of fields) {
    initial[field.key] = field.defaultValue;
  }
  return initial;
}

const FieldControl: React.FC<{
  field: ConfigFieldSchema;
  value: string | number | boolean | undefined;
  onChange: (nextVal: string | number | boolean) => void;
  idPrefix: string;
}> = ({ field, value, onChange, idPrefix }) => {
  const controlId = `${idPrefix}-${field.key}`;

  switch (field.type) {
    case 'switch':
      return (
        <div className="flex items-center gap-3">
          <SSwitch
            id={controlId}
            checked={Boolean(value)}
            aria-label={field.label}
            onChange={(checked) => onChange(checked)}
          />
          <span className="text-[13px] text-[var(--omada-text-secondary)]">
            {Boolean(value) ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );

    case 'select':
      return (
        <SSelect
          aria-label={field.label}
          value={String(value ?? field.defaultValue)}
          onChange={(val) => onChange(String(val))}
          className="w-full"
          options={field.options ?? []}
        />
      );

    case 'ip':
      return (
        <SIpInput
          mode="ip"
          aria-label={field.label}
          value={String(value ?? '')}
          onChange={(val) => onChange(val)}
          className="w-full"
        />
      );

    case 'cidr':
      return (
        <SIpInput
          mode="cidr"
          aria-label={field.label}
          value={String(value ?? '')}
          onChange={(val) => onChange(val)}
          className="w-full"
        />
      );

    case 'mac':
      return (
        <SMacInput
          aria-label={field.label}
          value={String(value ?? '')}
          onChange={(val) => onChange(val)}
          className="w-full"
        />
      );

    case 'number':
      return (
        <div className="flex items-center gap-2.5">
          <SNumberInput
            id={controlId}
            variant="filled"
            aria-label={field.label}
            value={typeof value === 'number' ? value : Number(value ?? 0)}
            onChange={(num) => onChange(typeof num === 'number' ? num : 0)}
            className="w-[180px]"
          />
          {field.suffixText && (
            <span className="text-[13px] text-[var(--omada-text-tertiary)]">
              {field.suffixText}
            </span>
          )}
        </div>
      );

    case 'password':
      return (
        <SPasswordInput
          id={controlId}
          aria-label={field.label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );

    case 'textarea':
      return (
        <STextArea
          id={controlId}
          variant="filled"
          rows={3}
          aria-label={field.label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="font-mono text-xs"
        />
      );

    case 'input':
    default:
      return (
        <SInput
          id={controlId}
          variant="filled"
          aria-label={field.label}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
};

const ConfigSubmoduleBody: React.FC<{
  schema: ConfigSubmoduleSchema;
}> = ({ schema }) => {
  const notification = useOmadaNotification();

  const [activeTab, setActiveTab] = useState<string>(schema.tabs?.[0]?.key ?? 'default');
  const [formValues, setFormValues] = useState<FieldValuesMap>(() =>
    buildInitialFieldValues(schema.fields),
  );
  const [scheduleValue, setScheduleValue] = useState<SScheduleMatrix | undefined>(
    () => schema.scheduleEditor?.initialSchedule,
  );
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [rows, setRows] = useState<ConfigSubmoduleRow[]>(
    () => schema.table?.initialRows ?? [],
  );
  const [tableSearch, setTableSearch] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [modalValues, setModalValues] = useState<FieldValuesMap>({});
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const filteredRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some(
        (val) => typeof val !== 'boolean' && String(val).toLowerCase().includes(q),
      ),
    );
  }, [rows, tableSearch]);

  const handleFieldChange = (key: string, nextVal: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [key]: nextVal }));
    setIsDirty(true);
  };

  const handleApply = () => {
    setIsDirty(false);
    notification.success({
      title: `${schema.title} Applied`,
      description: `Configuration saved and queued for synchronization on Main Office Floor.`,
    });
  };

  const handleReset = () => {
    setFormValues(buildInitialFieldValues(schema.fields));
    setScheduleValue(schema.scheduleEditor?.initialSchedule);
    setIsDirty(false);
    notification.info({
      title: 'Changes Discarded',
      description: `Reverted unsaved edits in ${schema.title}.`,
    });
  };

  const openCreateModal = () => {
    if (!schema.table) return;
    setEditingRowKey(null);
    setModalValues(buildInitialFieldValues(schema.table.modalFields));
    setModalOpen(true);
  };

  const openEditModal = (row: ConfigSubmoduleRow) => {
    if (!schema.table) return;
    setEditingRowKey(String(row.key));
    const initial: FieldValuesMap = {};
    for (const field of schema.table.modalFields) {
      initial[field.key] = row[field.key] ?? field.defaultValue;
    }
    setModalValues(initial);
    setModalOpen(true);
  };

  const handleSaveRow = () => {
    if (!schema.table) return;
    if (schema.key === 'vpn-status' && !editingRowKey) {
      notification.info({
        title: 'VPN Tunnel Telemetry Refreshed',
        description: 'All active IPsec and WireGuard tunnels synchronized.',
      });
      setModalOpen(false);
      return;
    }

    if (editingRowKey) {
      setRows((prev) =>
        prev.map((row) =>
          String(row.key) === editingRowKey ? { ...row, ...modalValues } : row,
        ),
      );
      notification.success({
        title: `${schema.title} Entry Updated`,
        description: 'Updated table rule configuration.',
      });
    } else {
      const nextRow: ConfigSubmoduleRow = {
        key: `${schema.key}-${Date.now()}`,
        ...modalValues,
      };
      setRows((prev) => [...prev, nextRow]);
      notification.success({
        title: `${schema.title} Entry Created`,
        description: `Added new entry to ${schema.table.title}.`,
      });
    }
    setModalOpen(false);
  };

  const handleDeleteRow = (rowKey: string) => {
    setRows((prev) => prev.filter((row) => String(row.key) !== rowKey));
    notification.success({
      title: 'Entry Deleted',
      description: `Removed item from ${schema.title}.`,
    });
  };

  const tableColumns: ColumnsType<ConfigSubmoduleRow> = useMemo(() => {
    if (!schema.table) return [];
    const cols: ColumnsType<ConfigSubmoduleRow> = schema.table.columns.map((col) => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      width: col.width,
      render: (val: unknown, record) => {
        if (col.kind === 'status-switch') {
          return (
            <SSwitch
              checked={Boolean(val)}
              aria-label={`Toggle ${String(record[schema.table!.columns[0].key] ?? record.key)}`}
              onChange={(checked) => {
                setRows((prev) =>
                  prev.map((r) => (r.key === record.key ? { ...r, [col.key]: checked } : r)),
                );
                notification.info({
                  title: `${schema.title} Updated`,
                  description: `Entry status set to ${checked ? 'Enabled' : 'Disabled'}.`,
                });
              }}
            />
          );
        }
        if (col.kind === 'badge') {
          const text = String(val ?? '-');
          const color =
            text === 'Deny' || text === 'Block'
              ? 'red'
              : text === 'Permit' || text === 'Allow' || text === 'Master'
                ? 'green'
                : 'blue';
          return <STag color={color}>{text}</STag>;
        }
        return (
          <span className="text-[var(--omada-text-primary)]">{String(val ?? '-')}</span>
        );
      },
    }));

    cols.push({
      title: 'Action',
      key: 'action',
      width: 96,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Tooltip title="Edit">
            <button
              type="button"
              aria-label={`Edit ${String(record.key)}`}
              onClick={() => openEditModal(record)}
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="edit" size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              type="button"
              aria-label={`Delete ${String(record.key)}`}
              onClick={() => handleDeleteRow(String(record.key))}
              className="omada-cfg-row-action-btn"
            >
              <SIcon name="delete" size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    });

    return cols;
  }, [schema, rows]);

  return (
    <div
      className="omada-submodule-page px-6 pt-4 pb-8"
      data-testid={`config-submodule-${schema.key}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--omada-border-divider)] pb-3 pr-9">
        <div>
          <div className="text-[12px] font-medium text-[var(--omada-text-tertiary)]">
            {schema.breadcrumbGroup}
          </div>
          <h1 className="m-0 mt-0.5 text-[20px] font-semibold leading-7 text-[var(--omada-text-primary)]">
            {schema.title}
          </h1>
        </div>

        <Tooltip title={`${schema.title} Help`}>
          <button
            type="button"
            aria-label={`${schema.title} help`}
            onClick={() => setHelpOpen(true)}
            className="omada-cfg-help-btn"
          >
            <SIcon name="question" size={20} />
          </button>
        </Tooltip>
      </div>

      {/* Optional Sub-Tabs */}
      {schema.tabs && schema.tabs.length > 0 && (
        <STabs
          variant="page"
          size="md"
          bordered
          aria-label={`${schema.title} sections`}
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mt-3 pr-9"
          items={schema.tabs.map((tab) => ({ key: tab.key, label: tab.label }))}
        />
      )}

      {/* Optional Info Banner */}
      {schema.infoBanner && (
        <div className="omada-cfg-info-banner mt-4">
          <Info size={16} className="mt-0.5 shrink-0 text-[var(--omada-color-info)]" />
          <span>{schema.infoBanner}</span>
        </div>
      )}

      {/* Form Settings Section */}
      {schema.fields.length > 0 && (
        <div className="mt-5 space-y-4">
          {schema.sectionTitle && (
            <h2 className="m-0 text-[15px] font-semibold text-[var(--omada-text-primary)]">
              {schema.sectionTitle}
            </h2>
          )}
          <div className="space-y-3.5">
            {schema.fields.map((field) => (
              <div key={field.key} className="omada-cfg-form-row">
                <label
                  htmlFor={`cfg-${schema.key}-${field.key}`}
                  className="omada-cfg-form-label"
                >
                  {field.label}
                </label>
                <div className="omada-cfg-form-control">
                  <FieldControl
                    field={field}
                    value={formValues[field.key]}
                    onChange={(nextVal) => handleFieldChange(field.key, nextVal)}
                    idPrefix={`cfg-${schema.key}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule 7x24 Matrix Section (`schedule` & `time-range`) */}
      {schema.scheduleEditor && scheduleValue && (
        <div className="omada-cfg-section-divider mt-5 pt-5">
          <div className="mb-3 flex items-center justify-between pr-9">
            <h2 className="m-0 text-[15px] font-semibold text-[var(--omada-text-primary)]">
              {schema.scheduleEditor.label}
            </h2>
            <span className="text-[12px] text-[var(--omada-text-tertiary)]">
              Profile: {schema.scheduleEditor.profileName}
            </span>
          </div>
          <SSchedule
            value={scheduleValue}
            onChange={(nextMatrix) => {
              setScheduleValue(nextMatrix);
              setIsDirty(true);
            }}
            showPresets
            showSummary
            aria-label={schema.scheduleEditor.label}
          />
        </div>
      )}

      {/* Apply / Cancel Action Row when settings or schedule exist */}
      {(schema.fields.length > 0 || Boolean(schema.scheduleEditor)) && (
        <div className="mt-5 flex items-center gap-3">
          <SButton
            variant="primary"
            className="omada-cfg-primary-btn"
            onClick={handleApply}
          >
            Apply
          </SButton>
          <SButton variant="secondary" disabled={!isDirty} onClick={handleReset}>
            Cancel
          </SButton>
        </div>
      )}

      {/* Rules / Entries Table Section */}
      {schema.table && (
        <div className={schema.fields.length > 0 || schema.scheduleEditor ? 'omada-cfg-section-divider mt-6 pt-5' : 'mt-5'}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="m-0 text-[16px] font-medium text-[var(--omada-text-primary)]">
                {schema.table.title}
              </h2>
              <SInput
                variant="filled"
                allowClear
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder={`Search ${schema.title}`}
                aria-label={`Search ${schema.title}`}
                suffix={
                  <SIcon
                    name="input-search"
                    size={14}
                    className="text-[var(--omada-text-tertiary)]"
                  />
                }
                className="omada-cfg-search"
                style={{ width: 240 }}
              />
            </div>

            <SButton
              variant="primary"
              className="omada-cfg-primary-btn"
              icon={<Plus size={14} />}
              onClick={openCreateModal}
            >
              {schema.table.addButtonLabel}
            </SButton>
          </div>

          <div className="omada-cfg-table-shell">
            <Table<ConfigSubmoduleRow>
              className="omada-cfg-table"
              rowKey="key"
              dataSource={filteredRows}
              columns={tableColumns}
              pagination={false}
              locale={{
                emptyText: (
                  <SEmpty
                    title={`No ${schema.table.title}`}
                    description={`Click + ${schema.table.addButtonLabel} to add a record.`}
                  />
                ),
              }}
            />
          </div>
        </div>
      )}

      {/* Create / Edit Entry Modal */}
      {schema.table && (
        <SModal
          size="default"
          title={
            editingRowKey
              ? `Edit ${schema.title} Entry`
              : schema.table.addButtonLabel
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSaveRow}
          okText={editingRowKey ? 'Save' : 'Create'}
          destroyOnHidden
        >
          <div className="space-y-3.5 py-1">
            {schema.table.modalFields.map((field) => (
              <div key={field.key} className="omada-cfg-modal-field-row">
                <label
                  htmlFor={`modal-${schema.key}-${field.key}`}
                  className="omada-cfg-modal-label"
                >
                  {field.label}
                </label>
                <div className="min-w-0 flex-1">
                  <FieldControl
                    field={field}
                    value={modalValues[field.key]}
                    onChange={(nextVal) =>
                      setModalValues((prev) => ({ ...prev, [field.key]: nextVal }))
                    }
                    idPrefix={`modal-${schema.key}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SModal>
      )}

      {/* Submodule Help Modal */}
      <SModal
        size="sm"
        title={`${schema.title} Help`}
        open={helpOpen}
        onCancel={() => setHelpOpen(false)}
        onOk={() => setHelpOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText="Got It"
        destroyOnHidden
      >
        <div className="space-y-2 text-[13px] leading-5 text-[var(--omada-text-secondary)]">
          <p className="m-0">
            <strong>{schema.breadcrumbGroup} · {schema.title}</strong>
          </p>
          <p className="m-0">
            {schema.infoBanner ??
              `Configure site-wide ${schema.title} parameters and policies for Headquarters Building · Main Office Floor.`}
          </p>
        </div>
      </SModal>
    </div>
  );
};

function buildFallbackSchema(routeKey: string, routeLabel?: string): ConfigSubmoduleSchema {
  const title =
    routeLabel ??
    routeKey
      .split('-')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
      .join(' ');
  return {
    key: routeKey,
    title: title || 'Site Configuration',
    breadcrumbGroup: 'Network Config',
    infoBanner: `Interactive controller policy configuration for ${title || routeKey}.`,
    fields: [
      { key: 'enabled', label: 'Enable Feature', type: 'switch', defaultValue: true },
      { key: 'profileName', label: 'Profile Name', type: 'input', defaultValue: `${routeKey}_default` },
    ],
  };
}

/**
 * Schema-driven Omada Controller v6.3 configuration workspace covering all 41 remaining
 * `Network Config` & `Device Config` submenu routes (`ssh`, `schedule`, `time-range`,
 * `dhcp-reservation`, `ip-mac-binding`, `mac-filtering`, `routing`, `nat`, etc.).
 */
export const ConfigSubmodulePage: React.FC<ConfigSubmodulePageProps> = ({
  routeKey,
  routeLabel,
}) => {
  const normalizedKey = routeKey.trim().toLowerCase();
  const schema =
    CONFIG_SUBMODULE_SCHEMAS[normalizedKey] ??
    buildFallbackSchema(normalizedKey, routeLabel);

  return <ConfigSubmoduleBody key={schema.key} schema={schema} />;
};
