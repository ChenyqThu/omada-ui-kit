import React, { useMemo, useState } from 'react';
import { Checkbox, Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SButton,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SPagination,
  SSelect,
  SSwitch,
  STabs,
  useOmadaNotification,
} from '@/omada';
import {
  EMULATOR_ALERTS,
  EMULATOR_AUDIT_LOGS,
  EMULATOR_LOG_EVENTS,
  type AlertStatusTabKey,
  type AuditResultFilterKey,
  type EmulatorAlertRecord,
  type EmulatorAuditLogRecord,
  type EmulatorLogEventRecord,
  type EventModuleKey,
  type LogContentSegment,
  type LogSubTabKey,
} from './logsData';

export { EMULATOR_LOG_EVENTS };

export interface LogsPageProps {
  /** Invoked when an inline client name (e.g. `Neffos_X20_Pro`) is clicked. */
  onOpenClientByName?: (clientName: string) => void;
  /** Invoked when an inline device name (e.g. `StorageRoom_Eap_3`) is clicked. */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Optional initial top sub-tab override (defaults to `'events'`). */
  initialTab?: LogSubTabKey;
}

interface ColumnToggleConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  locked?: boolean;
}

const EVENT_COLUMN_TOGGLE_ITEMS: ColumnToggleConfig[] = [
  { key: 'type', label: 'Type', defaultVisible: true, locked: true },
  { key: 'content', label: 'Content', defaultVisible: true, locked: true },
  { key: 'module', label: 'Module', defaultVisible: false },
  { key: 'time', label: 'Time', defaultVisible: true },
];

const DEFAULT_EVENT_VISIBLE_KEYS = EVENT_COLUMN_TOGGLE_ITEMS.filter(
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

const ALERT_SEVERITY_COLOR: Record<EmulatorAlertRecord['severity'], string> = {
  Error: 'var(--omada-color-error)',
  Warning: 'var(--omada-color-warning)',
  Info: 'var(--omada-brand-hover)',
};

/**
 * Omada Controller v6.3.0.34 Logs Workspace (`#/logs`).
 * Replicates the Alerts | Events (default active) | Audit Logs sub-tabs, segmented module
 * filters, Export/Filter/Setting ghost actions, crisp AntD table with inline clickable client
 * and device links, row checkboxes, delete actions, and right-aligned pagination.
 */
export const LogsPage: React.FC<LogsPageProps> = ({
  onOpenClientByName,
  onOpenDeviceByName,
  initialTab = 'events',
}) => {
  const notification = useOmadaNotification();

  const [subTab, setSubTab] = useState<LogSubTabKey>(initialTab);

  // Events state
  const [events, setEvents] = useState<EmulatorLogEventRecord[]>(EMULATOR_LOG_EVENTS);
  const [moduleFilter, setModuleFilter] = useState<EventModuleKey>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [eventSearch, setEventSearch] = useState<string>('');
  const [typePopoverOpen, setTypePopoverOpen] = useState<boolean>(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<boolean>(false);
  const [selectedEventKeys, setSelectedEventKeys] = useState<React.Key[]>([]);
  const [visibleEventCols, setVisibleEventCols] = useState<string[]>(
    DEFAULT_EVENT_VISIBLE_KEYS,
  );
  const [eventsPage, setEventsPage] = useState<number>(1);
  const [eventsPageSize, setEventsPageSize] = useState<number>(10);

  // Alerts state
  const [alerts, setAlerts] = useState<EmulatorAlertRecord[]>(EMULATOR_ALERTS);
  const [alertStatusTab, setAlertStatusTab] = useState<AlertStatusTabKey>('resolved');
  const [alertsSearch, setAlertsSearch] = useState<string>('');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<EmulatorAuditLogRecord[]>(EMULATOR_AUDIT_LOGS);
  const [auditResultFilter, setAuditResultFilter] = useState<AuditResultFilterKey>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Log Settings modal state
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [retentionDays, setRetentionDays] = useState<string>('90');
  const [autoCleanup, setAutoCleanup] = useState<boolean>(true);
  const [syslogEnabled, setSyslogEnabled] = useState<boolean>(false);

  const moduleCounts = useMemo(
    () => ({
      all: events.length,
      system: events.filter((e) => e.module === 'system').length,
      device: events.filter((e) => e.module === 'device').length,
      client: events.filter((e) => e.module === 'client').length,
    }),
    [events],
  );

  const uniqueEventTypes = useMemo(
    () => Array.from(new Set(events.map((e) => e.type))),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    return events.filter((item) => {
      if (moduleFilter !== 'all' && item.module !== moduleFilter) {
        return false;
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.type.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.time.toLowerCase().includes(q)
      );
    });
  }, [events, moduleFilter, typeFilter, eventSearch]);

  const paginatedEvents = useMemo(() => {
    const start = (eventsPage - 1) * eventsPageSize;
    return filteredEvents.slice(start, start + eventsPageSize);
  }, [filteredEvents, eventsPage, eventsPageSize]);

  const alertCounts = useMemo(
    () => ({
      unresolved: alerts.filter((a) => a.status === 'unresolved').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
    }),
    [alerts],
  );

  const filteredAlerts = useMemo(() => {
    const q = alertsSearch.trim().toLowerCase();
    return alerts.filter((item) => {
      if (item.status !== alertStatusTab) return false;
      if (!q) return true;
      return (
        item.type.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.severity.toLowerCase().includes(q)
      );
    });
  }, [alerts, alertStatusTab, alertsSearch]);

  const auditCounts = useMemo(
    () => ({
      all: auditLogs.length,
      success: auditLogs.filter((a) => a.result === 'Success').length,
      failed: auditLogs.filter((a) => a.result === 'Failed').length,
    }),
    [auditLogs],
  );

  const filteredAuditLogs = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    return auditLogs.filter((item) => {
      if (auditResultFilter === 'success' && item.result !== 'Success') return false;
      if (auditResultFilter === 'failed' && item.result !== 'Failed') return false;
      if (!q) return true;
      return (
        item.operator.toLowerCase().includes(q) ||
        item.operation.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.ipAddress.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, auditResultFilter, auditSearch]);

  const visibleEventKeySet = useMemo(
    () => new Set(visibleEventCols),
    [visibleEventCols],
  );

  const renderSegments = (segments: LogContentSegment[]) => (
    <span className="leading-[20px] text-[var(--omada-text-primary)]">
      {segments.map((seg, idx) => {
        if (seg.kind === 'client') {
          return (
            <button
              key={`${seg.text}-${idx}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenClientByName?.(seg.targetName ?? seg.text);
              }}
              className="omada-logs-entity-link"
            >
              {seg.text}
            </button>
          );
        }
        if (seg.kind === 'device') {
          return (
            <button
              key={`${seg.text}-${idx}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeviceByName?.(seg.targetName ?? seg.text);
              }}
              className="omada-logs-entity-link"
            >
              {seg.text}
            </button>
          );
        }
        return <React.Fragment key={`${idx}-${seg.text.slice(0, 8)}`}>{seg.text}</React.Fragment>;
      })}
    </span>
  );

  const handleDeleteEvent = (record: EmulatorLogEventRecord) => {
    setEvents((prev) => prev.filter((item) => item.key !== record.key));
    setSelectedEventKeys((prev) => prev.filter((k) => k !== record.key));
    notification.success({
      title: 'Event Deleted',
      description: `Removed "${record.type}" log entry (${record.time}).`,
    });
  };

  const handleDeleteSelectedEvents = () => {
    const selectedSet = new Set(selectedEventKeys);
    const count = selectedSet.size;
    if (count === 0) return;
    setEvents((prev) => prev.filter((item) => !selectedSet.has(item.key)));
    setSelectedEventKeys([]);
    notification.success({
      title: 'Selected Events Deleted',
      description: `Removed ${count} selected event log(s).`,
    });
  };

  const handleExportLogs = () => {
    const labelMap: Record<LogSubTabKey, { count: number; file: string }> = {
      events: { count: filteredEvents.length, file: 'events-log.csv' },
      alerts: { count: filteredAlerts.length, file: 'alerts-log.csv' },
      'audit-logs': { count: filteredAuditLogs.length, file: 'audit-logs.csv' },
    };
    const meta = labelMap[subTab];
    notification.success({
      title: 'Logs Exported',
      description: `Exported ${meta.count} record(s) to ${meta.file}.`,
    });
  };

  const typeFilterPopover = (
    <div className="w-[210px] space-y-1">
      <div className="mb-1.5 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
        Filter by Type
      </div>
      {[
        { key: 'all', label: 'All Types' },
        ...uniqueEventTypes.map((t) => ({ key: t, label: t })),
      ].map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setTypeFilter(opt.key);
            setTypePopoverOpen(false);
            setEventsPage(1);
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
          Filter Events
        </span>
        <button
          type="button"
          onClick={() => {
            setEventSearch('');
            setTypeFilter('all');
            setModuleFilter('all');
            setEventsPage(1);
          }}
          className="cursor-pointer border-none bg-transparent p-0 text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>
      <div>
        <label
          htmlFor="omada-logs-filter-search"
          className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
        >
          Keyword
        </label>
        <SInput
          id="omada-logs-filter-search"
          variant="filled"
          allowClear
          value={eventSearch}
          onChange={(e) => {
            setEventSearch(e.target.value);
            setEventsPage(1);
          }}
          placeholder="Search client, AP, SSID or IP..."
        />
      </div>
      <div>
        <label
          htmlFor="omada-logs-filter-type"
          className="mb-1 block text-xs font-medium text-[var(--omada-text-secondary)]"
        >
          Event Type
        </label>
        <SSelect
          id="omada-logs-filter-type"
          value={typeFilter}
          onChange={(val) => {
            setTypeFilter(String(val));
            setEventsPage(1);
          }}
          options={[
            { label: 'All Types', value: 'all' },
            ...uniqueEventTypes.map((t) => ({ label: t, value: t })),
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
    <div className="w-[200px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Customize Columns
        </span>
        <button
          type="button"
          onClick={() => setVisibleEventCols(DEFAULT_EVENT_VISIBLE_KEYS)}
          className="cursor-pointer border-none bg-transparent p-0 text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>
      <div className="space-y-1">
        {EVENT_COLUMN_TOGGLE_ITEMS.map((col) => {
          const checked = visibleEventKeySet.has(col.key);
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
                  setVisibleEventCols((prev) =>
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

  const eventColumns: ColumnsType<EmulatorLogEventRecord> = useMemo(() => {
    const cols: ColumnsType<EmulatorLogEventRecord> = [
      {
        title: (
          <span className="inline-flex items-center gap-1.5">
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
                aria-label="Filter event type"
                onClick={(e) => e.stopPropagation()}
                className={`omada-logs-col-filter-btn ${
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
        width: 206,
        render: (type: string) => (
          <span className="whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {type}
          </span>
        ),
      },
      {
        title: 'Content',
        dataIndex: 'content',
        key: 'content',
        width: 555,
        render: (_, record) => (
          <div className="min-w-[360px] whitespace-normal break-words text-[14px]">
            {renderSegments(record.segments)}
          </div>
        ),
      },
    ];

    if (visibleEventKeySet.has('module')) {
      cols.push({
        title: 'Module',
        dataIndex: 'module',
        key: 'module',
        width: 110,
        render: (mod: string) => (
          <span className="capitalize text-[var(--omada-text-secondary)]">
            {mod}
          </span>
        ),
      });
    }

    if (visibleEventKeySet.has('time')) {
      cols.push({
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        width: 222,
        sorter: (a, b) => a.timestampMs - b.timestampMs,
        showSorterTooltip: false,
        render: (time: string) => (
          <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {time}
          </span>
        ),
      });
    }

    cols.push({
      title: (
        <div className="flex w-full items-center justify-between">
          <span>Action</span>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={columnSelectorPopover}
            styles={{ container: { padding: 12 } }}
          >
            <button
              type="button"
              aria-label="Column settings"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <SIcon name="more-3" size={16} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 138,
      render: (_, record) => (
        <div className="flex items-center">
          <Tooltip title="Delete">
            <button
              type="button"
              aria-label={`Delete event ${record.key}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(record);
              }}
              className="omada-logs-row-action-btn"
            >
              <SIcon name="delete" size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    });

    return cols;
  }, [typePopoverOpen, typeFilter, visibleEventKeySet, onOpenClientByName, onOpenDeviceByName]);

  const alertColumns: ColumnsType<EmulatorAlertRecord> = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 130,
      render: (severity: EmulatorAlertRecord['severity']) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ backgroundColor: ALERT_SEVERITY_COLOR[severity] }}
          />
          <span>{severity}</span>
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 210,
      render: (type: string) => <span className="whitespace-nowrap">{type}</span>,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (_, record) => (
        <div className="whitespace-normal break-words">
          {renderSegments(record.segments)}
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 220,
      sorter: (a, b) => a.timestampMs - b.timestampMs,
      showSorterTooltip: false,
      render: (time: string) => (
        <span className="tabular-nums whitespace-nowrap">{time}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextStatus =
                record.status === 'resolved' ? 'unresolved' : 'resolved';
              setAlerts((prev) =>
                prev.map((a) =>
                  a.key === record.key ? { ...a, status: nextStatus } : a,
                ),
              );
              notification.info({
                title:
                  nextStatus === 'resolved'
                    ? 'Alert Resolved'
                    : 'Alert Reopened',
                description: `${record.type} marked as ${nextStatus}.`,
              });
            }}
            className="omada-logs-entity-link text-xs"
          >
            {record.status === 'resolved' ? 'Reopen' : 'Resolve'}
          </button>
          <Tooltip title="Delete">
            <button
              type="button"
              aria-label={`Delete alert ${record.key}`}
              onClick={() => {
                setAlerts((prev) => prev.filter((a) => a.key !== record.key));
                notification.success({
                  title: 'Alert Deleted',
                  description: `Removed "${record.type}" alert.`,
                });
              }}
              className="omada-logs-row-action-btn"
            >
              <SIcon name="delete" size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const auditColumns: ColumnsType<EmulatorAuditLogRecord> = [
    {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: 110,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      width: 200,
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      width: 110,
      render: (result: EmulatorAuditLogRecord['result']) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{
              backgroundColor:
                result === 'Success'
                  ? 'var(--omada-brand-hover)'
                  : 'var(--omada-color-error)',
            }}
          />
          <span>{result}</span>
        </span>
      ),
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (_, record) => (
        <div className="whitespace-normal break-words">
          {renderSegments(record.segments)}
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 145,
      render: (ip: string) => (
        <span className="tabular-nums whitespace-nowrap">{ip}</span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 210,
      sorter: (a, b) => a.timestampMs - b.timestampMs,
      showSorterTooltip: false,
      render: (time: string) => (
        <span className="tabular-nums whitespace-nowrap">{time}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Tooltip title="Delete">
          <button
            type="button"
            aria-label={`Delete audit log ${record.key}`}
            onClick={() => {
              setAuditLogs((prev) => prev.filter((a) => a.key !== record.key));
              notification.success({
                title: 'Audit Log Deleted',
                description: `Removed "${record.operation}" audit record.`,
              });
            }}
            className="omada-logs-row-action-btn"
          >
            <SIcon name="delete" size={16} />
          </button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="omada-logs-page px-6 pt-4 pb-6" data-testid="logs-page">
      {/* Top Underline Sub-Tabs + Setting Button */}
      <STabs
        agentId="logs.subTabs"
        variant="page"
        size="lg"
        bordered
        aria-label="Logs views"
        activeKey={subTab}
        onChange={(k) => setSubTab(k as LogSubTabKey)}
        className="pr-9"
        items={[
          { key: 'alerts', label: 'Alerts' },
          { key: 'events', label: 'Events' },
          { key: 'audit-logs', label: 'Audit Logs' },
        ]}
        extra={
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="omada-logs-ghost-action"
          >
            <SIcon name="settings" size={16} />
            <span>Setting</span>
          </button>
        }
      />

      {/* Events Tab */}
      {subTab === 'events' && (
        <>
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <STabs
              agentId="logs.moduleFilter"
              variant="filter"
              aria-label="Event module filter"
              activeKey={moduleFilter}
              onChange={(k) => {
                setModuleFilter(k as EventModuleKey);
                setEventsPage(1);
              }}
              items={[
                { key: 'all', label: 'All', count: moduleCounts.all },
                { key: 'system', label: 'System', count: moduleCounts.system },
                { key: 'device', label: 'Device', count: moduleCounts.device },
                { key: 'client', label: 'Client', count: moduleCounts.client },
              ]}
            />

            <div className="flex items-center gap-5">
              {selectedEventKeys.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelectedEvents}
                  className="omada-logs-ghost-action"
                >
                  <SIcon name="delete" size={15} />
                  <span>Delete ({selectedEventKeys.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportLogs}
                className="omada-logs-ghost-action"
              >
                <SIcon name="export" size={15} />
                <span>Export</span>
              </button>

              <Popover
                trigger="click"
                placement="bottomRight"
                open={filterPopoverOpen}
                onOpenChange={setFilterPopoverOpen}
                content={toolbarFilterPopover}
                styles={{ container: { padding: 12 } }}
              >
                <button type="button" className="omada-logs-ghost-action">
                  <SIcon name="filter" size={15} />
                  <span>Filter</span>
                </button>
              </Popover>
            </div>
          </div>

          <div className="omada-logs-table-shell">
            <Table<EmulatorLogEventRecord>
              rowKey="key"
              columns={eventColumns}
              dataSource={paginatedEvents}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedEventKeys,
                onChange: (keys) => setSelectedEventKeys(keys),
                columnWidth: 53,
              }}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No matching event logs"
                    description="Adjust the module filter or search criteria to inspect site events."
                  />
                ),
              }}
              className="omada-logs-table"
            />
          </div>

          {filteredEvents.length > 0 && (
            <div className="omada-logs-pagination mt-4">
              <SPagination
                align="right"
                current={eventsPage}
                pageSize={eventsPageSize}
                total={filteredEvents.length}
                showSizeChanger={{ variant: 'filled' }}
                pageSizeOptions={[10, 20, 50, 100]}
                locale={{ items_per_page: '/page' }}
                summaryRender={([start, end], total) =>
                  `Showing ${start}-${end} of ${total} records`
                }
                onChange={(nextPage, nextSize) => {
                  setEventsPage(nextPage);
                  setEventsPageSize(nextSize);
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Alerts Tab */}
      {subTab === 'alerts' && (
        <>
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <div className="flex flex-wrap items-center gap-3">
              <STabs
                variant="filter"
                aria-label="Alert status filter"
                activeKey={alertStatusTab}
                onChange={(k) => setAlertStatusTab(k as AlertStatusTabKey)}
                items={[
                  { key: 'unresolved', label: 'Unresolved', count: alertCounts.unresolved },
                  { key: 'resolved', label: 'Resolved', count: alertCounts.resolved },
                ]}
              />

              <SInput
                variant="filled"
                allowClear
                value={alertsSearch}
                onChange={(e) => setAlertsSearch(e.target.value)}
                placeholder="Search alert type or device..."
                aria-label="Search alerts"
                suffix={
                  <SIcon
                    name="input-search"
                    size={14}
                    className="text-[var(--omada-text-tertiary)]"
                  />
                }
                className="omada-recover-search"
                style={{ width: 260 }}
              />
            </div>

            <button
              type="button"
              onClick={handleExportLogs}
              className="omada-logs-ghost-action"
            >
              <SIcon name="export" size={15} />
              <span>Export</span>
            </button>
          </div>

          <div className="omada-logs-table-shell">
            <Table<EmulatorAlertRecord>
              rowKey="key"
              columns={alertColumns}
              dataSource={filteredAlerts}
              pagination={false}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No unresolved alerts"
                    description="All site alerts are currently resolved. Switch to Resolved to review historical alerts."
                  />
                ),
              }}
              className="omada-logs-table"
            />
          </div>

          {filteredAlerts.length > 0 && (
            <div className="omada-logs-pagination mt-4">
              <SPagination
                align="right"
                current={1}
                pageSize={10}
                total={filteredAlerts.length}
                showSizeChanger={{ variant: 'filled' }}
                pageSizeOptions={[10, 20, 50]}
                locale={{ items_per_page: '/page' }}
                summaryRender={([start, end], total) =>
                  `Showing ${start}-${end} of ${total} records`
                }
              />
            </div>
          )}
        </>
      )}

      {/* Audit Logs Tab */}
      {subTab === 'audit-logs' && (
        <>
          <div className="mt-4 mb-3 flex flex-wrap items-center justify-between gap-3 pr-9">
            <div className="flex flex-wrap items-center gap-3">
              <SInput
                variant="filled"
                allowClear
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search operator, operation or IP..."
                aria-label="Search audit logs"
                suffix={
                  <SIcon
                    name="input-search"
                    size={14}
                    className="text-[var(--omada-text-tertiary)]"
                  />
                }
                className="omada-recover-search"
                style={{ width: 260 }}
              />

              <STabs
                variant="filter"
                aria-label="Audit result filter"
                activeKey={auditResultFilter}
                onChange={(k) => setAuditResultFilter(k as AuditResultFilterKey)}
                items={[
                  { key: 'all', label: 'All', count: auditCounts.all },
                  { key: 'success', label: 'Success', count: auditCounts.success },
                  { key: 'failed', label: 'Failed', count: auditCounts.failed },
                ]}
              />
            </div>

            <button
              type="button"
              onClick={handleExportLogs}
              className="omada-logs-ghost-action"
            >
              <SIcon name="export" size={15} />
              <span>Export</span>
            </button>
          </div>

          <div className="omada-logs-table-shell">
            <Table<EmulatorAuditLogRecord>
              rowKey="key"
              columns={auditColumns}
              dataSource={filteredAuditLogs}
              pagination={false}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No audit logs found"
                    description="No administrator audit entries match your current filter."
                  />
                ),
              }}
              className="omada-logs-table"
            />
          </div>

          {filteredAuditLogs.length > 0 && (
            <div className="omada-logs-pagination mt-4">
              <SPagination
                align="right"
                current={1}
                pageSize={10}
                total={filteredAuditLogs.length}
                showSizeChanger={{ variant: 'filled' }}
                pageSizeOptions={[10, 20, 50]}
                locale={{ items_per_page: '/page' }}
                summaryRender={([start, end], total) =>
                  `Showing ${start}-${end} of ${total} records`
                }
              />
            </div>
          )}
        </>
      )}

      {/* Log Settings Modal */}
      <SModal
        agentId="logs.settingsModal"
        open={settingsOpen}
        title="Log Settings"
        subtitle="Configure event retention and syslog forwarding for Headquarters Building."
        size="sm"
        okText="Save"
        cancelText="Cancel"
        destroyOnHidden
        onOk={() => {
          setSettingsOpen(false);
          notification.success({
            title: 'Log Settings Saved',
            description: `Retention set to ${retentionDays} days · Syslog ${syslogEnabled ? 'enabled' : 'disabled'}.`,
          });
        }}
        onCancel={() => setSettingsOpen(false)}
      >
        <div className="space-y-4 py-2">
          <div>
            <label
              htmlFor="omada-log-retention-select"
              className="mb-1.5 block text-xs font-medium text-[var(--omada-text-secondary)]"
            >
              Log Retention Period
            </label>
            <SSelect
              id="omada-log-retention-select"
              value={retentionDays}
              onChange={(val) => setRetentionDays(String(val))}
              options={[
                { label: '30 Days', value: '30' },
                { label: '90 Days', value: '90' },
                { label: '180 Days', value: '180' },
                { label: '365 Days', value: '365' },
              ]}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between rounded-[6px] border border-[var(--omada-border-divider)] px-3 py-2.5">
            <div>
              <div className="text-sm font-medium text-[var(--omada-text-primary)]">
                Auto-Archive Resolved Alerts
              </div>
              <div className="text-xs text-[var(--omada-text-secondary)]">
                Automatically compress resolved alert logs after 30 days.
              </div>
            </div>
            <SSwitch
              checked={autoCleanup}
              onChange={setAutoCleanup}
              aria-label="Auto-Archive Resolved Alerts"
            />
          </div>

          <div className="flex items-center justify-between rounded-[6px] border border-[var(--omada-border-divider)] px-3 py-2.5">
            <div>
              <div className="text-sm font-medium text-[var(--omada-text-primary)]">
                Remote Syslog Forwarding
              </div>
              <div className="text-xs text-[var(--omada-text-secondary)]">
                Stream real-time device and client events to syslog collector.
              </div>
            </div>
            <SSwitch
              checked={syslogEnabled}
              onChange={setSyslogEnabled}
              aria-label="Remote Syslog Forwarding"
            />
          </div>
        </div>
      </SModal>
    </div>
  );
};
