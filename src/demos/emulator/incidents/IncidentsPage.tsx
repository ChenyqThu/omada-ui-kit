import React, { useMemo, useState } from 'react';
import { Checkbox, Dropdown, Popover, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SButton,
  SEmpty,
  SIcon,
  SInput,
  SSelect,
  SSwitch,
  useOmadaNotification,
} from '@/omada';
import {
  SCategoryKpiCarousel,
  type CategoryKpiItem,
} from '../../../omada/components/SCategoryKpiCarousel';
import { IncidentDetailDrawer } from './IncidentDetailDrawer';
import {
  EMULATOR_INCIDENTS,
  EMULATOR_RESOLVED_INCIDENTS,
  INCIDENT_CATEGORY_DEFINITIONS,
  type EmulatorIncidentRecord,
  type IncidentCategoryKey,
  type IncidentSeverity,
} from './incidentsData';

export interface IncidentsPageProps {
  /** Optional incidents dataset override (defaults to `EMULATOR_INCIDENTS`). */
  incidents?: EmulatorIncidentRecord[];
  /** Callback invoked when a user clicks an incident row. */
  onSelectIncident?: (incident: EmulatorIncidentRecord) => void;
  /** Controlled active incident key; when omitted, `IncidentsPage` manages `IncidentDetailDrawer` internally. */
  selectedIncidentKey?: string | null;
  /** Invoked when clicking a device link (e.g. `BreakRoom_Eap_2`) inside incident details. */
  onOpenDeviceByName?: (deviceName: string) => void;
  className?: string;
}

type IncidentsMainTabKey = 'analysis' | 'notification' | 'settings';
type IncidentStatusFilterKey =
  | 'all'
  | 'ongoing'
  | 'unresolved'
  | 'resolved'
  | 'ignored';
type IncidentTimeRangeKey = '1D' | '1W' | '1M';
type IncidentSeverityFilterKey = 'all' | IncidentSeverity;

interface ColumnToggleConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  locked?: boolean;
}

const COLUMN_TOGGLE_ITEMS: ColumnToggleConfig[] = [
  { key: 'title', label: 'Incidents', defaultVisible: true, locked: true },
  { key: 'level', label: 'Level', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'lastOccurred', label: 'Last Occurred', defaultVisible: true },
  { key: 'firstOccurred', label: 'First Occurred', defaultVisible: true },
  { key: 'rootCauseAnalysis', label: 'Root Cause Analysis', defaultVisible: true },
  { key: 'improvementSuggestions', label: 'Improvement Suggestions', defaultVisible: true },
  { key: 'affectedDevices', label: 'Affected Devices', defaultVisible: true },
  { key: 'affectedClients', label: 'Affected Clients', defaultVisible: true },
  { key: 'occurrences', label: 'Occurrences', defaultVisible: true },
];

const DEFAULT_VISIBLE_KEYS = COLUMN_TOGGLE_ITEMS.filter((c) => c.defaultVisible).map(
  (c) => c.key,
);

const SEVERITY_DOT_COLOR: Record<IncidentSeverity, string> = {
  critical: 'var(--omada-color-error)',
  error: 'var(--omada-color-warning)',
  warning: 'var(--omada-color-warning-minor)',
  info: 'var(--omada-brand-hover)',
};

const TIME_RANGE_OPTIONS: IncidentTimeRangeKey[] = ['1D', '1W', '1M'];

/**
 * Omada Controller v6.3.0.34 Intelligent O&M -> Incidents workspace (`#/incidents`).
 * Replicates the top navigation tabs, status & time range segmented controls,
 * 10-card `<SCategoryKpiCarousel>`, search & severity filter toolbar, horizontally
 * scrollable table with sticky right Actions, `IncidentDetailDrawer`, and
 * interactive `Notification` & `Settings` configuration tabs.
 */
export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents: initialIncidents = EMULATOR_INCIDENTS,
  onSelectIncident,
  selectedIncidentKey,
  onOpenDeviceByName,
  className = '',
}) => {
  const notification = useOmadaNotification();

  const [incidentsList, setIncidentsList] =
    useState<EmulatorIncidentRecord[]>(initialIncidents);
  const [resolvedArchive, setResolvedArchive] = useState<EmulatorIncidentRecord[]>(
    EMULATOR_RESOLVED_INCIDENTS,
  );

  const [mainTab, setMainTab] = useState<IncidentsMainTabKey>('analysis');
  const [statusFilter, setStatusFilter] = useState<IncidentStatusFilterKey>('all');
  const [timeRange, setTimeRange] = useState<IncidentTimeRangeKey>('1M');
  const [activeCategory, setActiveCategory] = useState<IncidentCategoryKey>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverityFilterKey>('all');
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(DEFAULT_VISIBLE_KEYS);

  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [internalIncidentKey, setInternalIncidentKey] = useState<string | null>(null);

  // Notification & Settings Tab State
  const [emailNotify, setEmailNotify] = useState(true);
  const [bannerNotify, setBannerNotify] = useState(true);
  const [webhookNotify, setWebhookNotify] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('ops-admin@headquarters.local');
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyError, setNotifyError] = useState(true);
  const [notifyWarning, setNotifyWarning] = useState(true);
  const [notifyInfo, setNotifyInfo] = useState(false);

  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState('30');
  const [interferenceThreshold, setInterferenceThreshold] = useState('50');
  const [noiseFloorThreshold, setNoiseFloorThreshold] = useState('-80');

  const isDrawerControlled = selectedIncidentKey !== undefined;
  const highlightedKey = isDrawerControlled
    ? selectedIncidentKey
    : internalDrawerOpen
      ? internalIncidentKey
      : null;

  const activeDataset = useMemo(() => {
    switch (statusFilter) {
      case 'all':
        return incidentsList;
      case 'ongoing':
        return [];
      case 'unresolved':
        return incidentsList.filter((item) => item.status === 'Unresolved');
      case 'resolved':
        return [
          ...incidentsList.filter((item) => item.status === 'Resolved'),
          ...resolvedArchive,
        ];
      case 'ignored':
        return incidentsList.filter((item) => item.status === 'Ignored');
    }
  }, [incidentsList, resolvedArchive, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: incidentsList.length,
      ongoing: 0,
      unresolved: incidentsList.filter((item) => item.status === 'Unresolved').length,
      resolved:
        incidentsList.filter((item) => item.status === 'Resolved').length +
        resolvedArchive.length,
      ignored: incidentsList.filter((item) => item.status === 'Ignored').length,
    }),
    [incidentsList, resolvedArchive],
  );

  const categoryItems: CategoryKpiItem[] = useMemo(() => {
    return INCIDENT_CATEGORY_DEFINITIONS.map((cat) => {
      const count =
        cat.key === 'overview'
          ? activeDataset.length
          : activeDataset.filter((item) => item.categoryKey === cat.key).length;
      return {
        key: cat.key,
        label: cat.label,
        count,
      };
    });
  }, [activeDataset]);

  const categoryFiltered = useMemo(() => {
    if (activeCategory === 'overview') return activeDataset;
    return activeDataset.filter((item) => item.categoryKey === activeCategory);
  }, [activeDataset, activeCategory]);

  const severityCounts = useMemo(
    () => ({
      all: categoryFiltered.length,
      critical: categoryFiltered.filter((i) => i.severity === 'critical').length,
      error: categoryFiltered.filter((i) => i.severity === 'error').length,
      warning: categoryFiltered.filter((i) => i.severity === 'warning').length,
      info: categoryFiltered.filter((i) => i.severity === 'info').length,
    }),
    [categoryFiltered],
  );

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categoryFiltered.filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.affectedDeviceMac.toLowerCase().includes(q) ||
        item.affectedDeviceName.toLowerCase().includes(q) ||
        item.rootCauseAnalysis.toLowerCase().includes(q) ||
        item.improvementSuggestions.toLowerCase().includes(q)
      );
    });
  }, [categoryFiltered, severityFilter, searchQuery]);

  const visibleKeySet = useMemo(() => new Set(visibleColumnKeys), [visibleColumnKeys]);

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const resetColumns = () => {
    setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS);
  };

  const handleSolveIncident = (
    target: EmulatorIncidentRecord,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    setIncidentsList((prev) =>
      prev.map((item) =>
        item.key === target.key ? { ...item, status: 'Resolved' } : item,
      ),
    );
    setResolvedArchive((prev) =>
      prev.map((item) =>
        item.key === target.key ? { ...item, status: 'Resolved' } : item,
      ),
    );
    notification.success({
      title: 'Incident Marked as Resolved',
      description: `${target.title} moved to Resolved status.`,
    });
  };

  const handleIgnoreIncident = (
    target: EmulatorIncidentRecord,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    setIncidentsList((prev) =>
      prev.map((item) =>
        item.key === target.key ? { ...item, status: 'Ignored' } : item,
      ),
    );
    notification.info({
      title: 'Incident Ignored',
      description: `${target.title} marked as Ignored.`,
    });
  };

  const handleDeleteIncident = (
    target: EmulatorIncidentRecord,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    setIncidentsList((prev) => prev.filter((item) => item.key !== target.key));
    setResolvedArchive((prev) => prev.filter((item) => item.key !== target.key));
    setInternalIncidentKey((curr) => {
      if (curr === target.key) {
        setInternalDrawerOpen(false);
        return null;
      }
      return curr;
    });
    notification.success({
      title: 'Incident Deleted',
      description: `Removed "${target.title}" from incident history.`,
    });
  };

  const handleRowOpen = (record: EmulatorIncidentRecord) => {
    onSelectIncident?.(record);
    if (!isDrawerControlled) {
      setInternalIncidentKey(record.key);
      setInternalDrawerOpen(true);
    }
  };

  const activeDrawerIncident = useMemo(() => {
    if (!internalIncidentKey) return null;
    return (
      incidentsList.find((item) => item.key === internalIncidentKey) ??
      resolvedArchive.find((item) => item.key === internalIncidentKey) ??
      null
    );
  }, [incidentsList, resolvedArchive, internalIncidentKey]);

  const columnSelectorPopover = (
    <div className="w-[220px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-2">
        <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
          Customize Columns
        </span>
        <button
          type="button"
          onClick={resetColumns}
          className="cursor-pointer border-0 bg-transparent p-0 text-xs text-[var(--omada-link)] hover:underline"
        >
          Reset
        </button>
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {COLUMN_TOGGLE_ITEMS.map((col) => {
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
                onChange={() => !col.locked && toggleColumnVisibility(col.key)}
              />
              <span className="truncate text-[var(--omada-text-primary)]">{col.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const columns: ColumnsType<EmulatorIncidentRecord> = useMemo(() => {
    const list: ColumnsType<EmulatorIncidentRecord> = [
      {
        title: 'Incidents',
        dataIndex: 'title',
        key: 'title',
        width: 286,
        render: (title: string) => (
          <span className="block text-[14px] leading-[20px] text-[var(--omada-text-primary)]">
            {title}
          </span>
        ),
      },
    ];

    if (visibleKeySet.has('level')) {
      list.push({
        title: 'Level',
        dataIndex: 'severityLabel',
        key: 'level',
        width: 96,
        render: (_, record) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span
              aria-hidden="true"
              className="h-[6px] w-[6px] shrink-0 rounded-full"
              style={{ backgroundColor: SEVERITY_DOT_COLOR[record.severity] }}
            />
            <span className="text-[14px] text-[var(--omada-text-primary)]">
              {record.severityLabel}
            </span>
          </span>
        ),
      });
    }

    if (visibleKeySet.has('status')) {
      list.push({
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 92,
        render: (status: string) => (
          <span className="whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {status}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('lastOccurred')) {
      list.push({
        title: 'Last Occurred',
        dataIndex: 'lastOccurred',
        key: 'lastOccurred',
        width: 186,
        render: (val: string) => (
          <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {val}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('firstOccurred')) {
      list.push({
        title: 'First Occurred',
        dataIndex: 'firstOccurred',
        key: 'firstOccurred',
        width: 186,
        render: (val: string) => (
          <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {val}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('rootCauseAnalysis')) {
      list.push({
        title: 'Root Cause Analysis',
        dataIndex: 'rootCauseAnalysis',
        key: 'rootCauseAnalysis',
        width: 214,
        render: (_, record) => (
          <div className="space-y-0.5 text-[14px] leading-[20px] text-[var(--omada-text-primary)]">
            {record.rootCauseLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ),
      });
    }

    if (visibleKeySet.has('improvementSuggestions')) {
      list.push({
        title: 'Improvement Suggestions',
        dataIndex: 'improvementSuggestions',
        key: 'improvementSuggestions',
        width: 310,
        render: (val: string) => (
          <span className="block text-[14px] leading-[20px] text-[var(--omada-text-primary)]">
            {val}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('affectedDevices')) {
      list.push({
        title: 'Affected Devices',
        dataIndex: 'affectedDeviceMac',
        key: 'affectedDevices',
        width: 165,
        render: (mac: string) => (
          <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {mac}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('affectedClients')) {
      list.push({
        title: 'Affected Clients',
        dataIndex: 'affectedClients',
        key: 'affectedClients',
        width: 135,
        render: (count: number) => (
          <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {count}
          </span>
        ),
      });
    }

    if (visibleKeySet.has('occurrences')) {
      list.push({
        title: 'Occurrences',
        dataIndex: 'occurrencesCount',
        key: 'occurrences',
        width: 116,
        render: (count: number) => (
          <span className="tabular-nums whitespace-nowrap text-[14px] text-[var(--omada-text-primary)]">
            {count}
          </span>
        ),
      });
    }

    list.push({
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
              aria-label="Column settings"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <SIcon name="more-3" size={16} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 128,
      fixed: 'end',
      render: (_, record) => (
        <div
          className="flex items-center gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Solve">
            <button
              type="button"
              aria-label={`Solve ${record.title}`}
              onClick={(e) => handleSolveIncident(record, e)}
              className="omada-incidents-row-action-btn"
            >
              <SIcon name="right" size={18} />
            </button>
          </Tooltip>
          <Tooltip title="Ignore">
            <button
              type="button"
              aria-label={`Ignore ${record.title}`}
              onClick={(e) => handleIgnoreIncident(record, e)}
              className="omada-incidents-row-action-btn"
            >
              <SIcon name="ignore" size={18} />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              type="button"
              aria-label={`Delete ${record.title}`}
              onClick={(e) => handleDeleteIncident(record, e)}
              className="omada-incidents-row-action-btn"
            >
              <SIcon name="delete" size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    });

    return list;
  }, [visibleKeySet]);

  const totalScrollWidth = useMemo(
    () =>
      columns.reduce(
        (sum, col) => sum + (typeof col.width === 'number' ? col.width : 160),
        0,
      ),
    [columns],
  );

  return (
    <div
      data-testid="incidents-page"
      className={`omada-incidents-page min-h-full px-6 pb-6 pt-4 ${className}`.trim()}
    >
      {/* Top Header Row: Left Sub-Tabs + Right Status & Time Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Incidents sections"
          className="flex items-center gap-7"
        >
          {(
            [
              { key: 'analysis', label: 'Incident Analysis' },
              { key: 'notification', label: 'Notification' },
              { key: 'settings', label: 'Settings' },
            ] as const
          ).map((tab) => {
            const isActive = mainTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMainTab(tab.key)}
                className={`omada-incidents-subtab-btn cursor-pointer border-0 bg-transparent pb-2 text-[18px] leading-[26px] ${
                  isActive ? 'is-active font-medium' : 'font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="omada-incidents-subtab-indicator absolute inset-x-0 bottom-0 h-[2px]" />
                )}
              </button>
            );
          })}
        </div>

        {mainTab === 'analysis' && (
          <div className="flex flex-wrap items-center gap-2.5 pb-1">
            {/* Status Segmented Bar */}
            <div
              role="tablist"
              aria-label="Incident status filter"
              className="omada-incidents-seg-track"
            >
              {(
                [
                  { key: 'all', label: `All (${statusCounts.all})` },
                  { key: 'ongoing', label: `Ongoing (${statusCounts.ongoing})` },
                  { key: 'unresolved', label: `Unresolved (${statusCounts.unresolved})` },
                  { key: 'resolved', label: `Resolved (${statusCounts.resolved})` },
                  { key: 'ignored', label: `Ignored (${statusCounts.ignored})` },
                ] as const
              ).map((item) => {
                const isActive = statusFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStatusFilter(item.key)}
                    className={`omada-incidents-seg-pill ${isActive ? 'is-active' : ''}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Time Range Segmented Bar + Calendar */}
            <div
              role="group"
              aria-label="Incident time window"
              className="omada-incidents-seg-track"
            >
              {TIME_RANGE_OPTIONS.map((rangeKey) => {
                const isActive = timeRange === rangeKey;
                return (
                  <button
                    key={rangeKey}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTimeRange(rangeKey)}
                    className={`omada-incidents-seg-pill ${isActive ? 'is-active' : ''}`}
                  >
                    {rangeKey}
                  </button>
                );
              })}
              <span
                aria-hidden="true"
                className="mx-0.5 h-3.5 w-px bg-[var(--omada-border-divider)]"
              />
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    { key: '1D', label: 'Last 24 Hours (1D)' },
                    { key: '1W', label: 'Last 7 Days (1W)' },
                    { key: '1M', label: 'Aug 20, 2025 - Sep 19, 2025 (1M)' },
                  ],
                  onClick: ({ key }) => {
                    setTimeRange(key as IncidentTimeRangeKey);
                    notification.info({
                      title: 'Incident Window Updated',
                      description: `Filtered incident telemetry to ${key} window.`,
                    });
                  },
                }}
              >
                <button
                  type="button"
                  aria-label="Custom date range"
                  className="omada-incidents-calendar-btn"
                >
                  <SIcon name="icon-46146-123043" size={15} />
                </button>
              </Dropdown>
            </div>
          </div>
        )}
      </div>

      {mainTab === 'analysis' && (
        <>
          {/* Category KPI Carousel (cleared of right-edge <<|| quick-drawer handle) */}
          <div className="mt-4 pr-8">
            <SCategoryKpiCarousel
              items={categoryItems}
              activeKey={activeCategory}
              onSelect={(key) => setActiveCategory(key as IncidentCategoryKey)}
            />
          </div>

          {/* Search & Severity Filter Toolbar */}
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <SInput
              variant="filled"
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Content, Device Name or MAC"
              aria-label="Search incidents"
              suffix={
                <SIcon
                  name="input-search"
                  size={14}
                  className="text-[var(--omada-text-tertiary)]"
                />
              }
              className="omada-incidents-search"
              style={{ width: 260 }}
            />

            <div
              role="tablist"
              aria-label="Incident severity filter"
              className="omada-incidents-seg-track"
            >
              {(
                [
                  { key: 'all', label: `All (${severityCounts.all})` },
                  {
                    key: 'critical',
                    label: `Critical (${severityCounts.critical})`,
                    dotColor: SEVERITY_DOT_COLOR.critical,
                  },
                  {
                    key: 'error',
                    label: `Error (${severityCounts.error})`,
                    dotColor: SEVERITY_DOT_COLOR.error,
                  },
                  {
                    key: 'warning',
                    label: `Warning (${severityCounts.warning})`,
                    dotColor: SEVERITY_DOT_COLOR.warning,
                  },
                  {
                    key: 'info',
                    label: `Info (${severityCounts.info})`,
                    dotColor: SEVERITY_DOT_COLOR.info,
                  },
                ] as const
              ).map((item) => {
                const isActive = severityFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSeverityFilter(item.key)}
                    className={`omada-incidents-seg-pill ${isActive ? 'is-active' : ''}`}
                  >
                    {'dotColor' in item && item.dotColor && (
                      <span
                        aria-hidden="true"
                        className="h-[6px] w-[6px] shrink-0 rounded-full"
                        style={{ backgroundColor: item.dotColor }}
                      />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontally Scrollable Table */}
          <div className="omada-incidents-table-shell mt-3">
            <Table<EmulatorIncidentRecord>
              rowKey="key"
              columns={columns}
              dataSource={filteredIncidents}
              pagination={false}
              scroll={{ x: totalScrollWidth }}
              locale={{
                emptyText: (
                  <SEmpty
                    title="No matching incidents"
                    description="No network or device incidents match the current category, status, or severity filters."
                  />
                ),
              }}
              onRow={(record) => ({
                onClick: () => handleRowOpen(record),
                className:
                  record.key === highlightedKey
                    ? 'omada-incidents-row-selected'
                    : undefined,
              })}
              className="omada-incidents-table"
            />
          </div>
        </>
      )}

      {mainTab === 'notification' && (
        <div className="mt-5 grid max-w-[900px] gap-4">
          <div className="omada-incidents-panel-card p-5">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-3">
              <div>
                <h2 className="m-0 text-[16px] font-semibold text-[var(--omada-text-primary)]">
                  Incident Notification Channels
                </h2>
                <p className="m-0 mt-0.5 text-[13px] text-[var(--omada-text-secondary)]">
                  Configure how Headquarters Building operators are notified when new wireless or link incidents trigger.
                </p>
              </div>
              <SButton
                variant="outline"
                onClick={() =>
                  notification.success({
                    title: 'Test Notification Dispatched',
                    description: `Sent sample alert payload to ${notifyEmail}.`,
                  })
                }
              >
                Test Notification
              </SButton>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <SSwitch
                  checked={emailNotify}
                  onChange={setEmailNotify}
                  label="Email Notifications"
                  description="Send digest or immediate incident alerts to site administrators."
                />
                <SInput
                  variant="filled"
                  value={notifyEmail}
                  disabled={!emailNotify}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  aria-label="Notification email recipient"
                  style={{ width: 280 }}
                />
              </div>

              <div className="border-t border-[var(--omada-border-divider)] pt-4">
                <SSwitch
                  checked={bannerNotify}
                  onChange={setBannerNotify}
                  label="Controller Banner & Push Alerts"
                  description="Highlight ongoing Critical, Error, and Warning incidents inside the Omada web console."
                />
              </div>

              <div className="border-t border-[var(--omada-border-divider)] pt-4">
                <SSwitch
                  checked={webhookNotify}
                  onChange={setWebhookNotify}
                  label="Webhook / Syslog Forwarding"
                  description="Forward structured JSON incident events to external SIEM or NMS collectors."
                />
              </div>
            </div>
          </div>

          <div className="omada-incidents-panel-card p-5">
            <h3 className="m-0 mb-3 text-[15px] font-semibold text-[var(--omada-text-primary)]">
              Subscribed Severity Levels
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(
                [
                  {
                    key: 'critical',
                    label: 'Critical',
                    checked: notifyCritical,
                    onChange: setNotifyCritical,
                    dot: SEVERITY_DOT_COLOR.critical,
                  },
                  {
                    key: 'error',
                    label: 'Error',
                    checked: notifyError,
                    onChange: setNotifyError,
                    dot: SEVERITY_DOT_COLOR.error,
                  },
                  {
                    key: 'warning',
                    label: 'Warning',
                    checked: notifyWarning,
                    onChange: setNotifyWarning,
                    dot: SEVERITY_DOT_COLOR.warning,
                  },
                  {
                    key: 'info',
                    label: 'Info',
                    checked: notifyInfo,
                    onChange: setNotifyInfo,
                    dot: SEVERITY_DOT_COLOR.info,
                  },
                ] as const
              ).map((sev) => (
                <div
                  key={sev.key}
                  className="flex items-center justify-between rounded-[6px] border border-[var(--omada-border-divider)] px-3 py-2.5"
                >
                  <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--omada-text-primary)]">
                    <span
                      aria-hidden="true"
                      className="h-[7px] w-[7px] rounded-full"
                      style={{ backgroundColor: sev.dot }}
                    />
                    {sev.label}
                  </span>
                  <SSwitch
                    size="small"
                    checked={sev.checked}
                    onChange={sev.onChange}
                    aria-label={`Notify on ${sev.label}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <SButton
                variant="primary"
                onClick={() =>
                  notification.success({
                    title: 'Notification Policy Saved',
                    description: 'Updated incident notification preferences for Main Office Floor.',
                  })
                }
              >
                Save
              </SButton>
            </div>
          </div>
        </div>
      )}

      {mainTab === 'settings' && (
        <div className="mt-5 max-w-[900px]">
          <div className="omada-incidents-panel-card p-5">
            <h2 className="m-0 mb-1 text-[16px] font-semibold text-[var(--omada-text-primary)]">
              Incident Analysis Engine Settings
            </h2>
            <p className="m-0 mb-5 text-[13px] text-[var(--omada-text-secondary)]">
              Tune RF interference detection thresholds, occurrence correlation windows, and incident retention.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--omada-border-divider)] pb-4">
                <SSwitch
                  checked={autoAnalysisEnabled}
                  onChange={setAutoAnalysisEnabled}
                  label="Intelligent Incident Analysis"
                  description="Continuously evaluate AP interference rate, noise floor, and roaming health across all site devices."
                />
              </div>

              <div className="grid grid-cols-1 items-center gap-2 border-b border-[var(--omada-border-divider)] pb-4 sm:grid-cols-[240px_1fr]">
                <label
                  htmlFor="omada-incident-retention"
                  className="text-[14px] font-medium text-[var(--omada-text-primary)]"
                >
                  Resolved Incident Retention
                </label>
                <SSelect
                  id="omada-incident-retention"
                  value={retentionDays}
                  onChange={(val) => setRetentionDays(String(val))}
                  style={{ width: 220 }}
                  options={[
                    { value: '7', label: '7 Days' },
                    { value: '30', label: '30 Days' },
                    { value: '90', label: '90 Days' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 items-center gap-2 border-b border-[var(--omada-border-divider)] pb-4 sm:grid-cols-[240px_1fr]">
                <label
                  htmlFor="omada-interference-threshold"
                  className="text-[14px] font-medium text-[var(--omada-text-primary)]"
                >
                  2.4 GHz Interference Threshold (%)
                </label>
                <SInput
                  id="omada-interference-threshold"
                  variant="filled"
                  value={interferenceThreshold}
                  onChange={(e) => setInterferenceThreshold(e.target.value)}
                  style={{ width: 220 }}
                />
              </div>

              <div className="grid grid-cols-1 items-center gap-2 pb-2 sm:grid-cols-[240px_1fr]">
                <label
                  htmlFor="omada-noise-threshold"
                  className="text-[14px] font-medium text-[var(--omada-text-primary)]"
                >
                  Noise Floor Alert Threshold (dBm)
                </label>
                <SInput
                  id="omada-noise-threshold"
                  variant="filled"
                  value={noiseFloorThreshold}
                  onChange={(e) => setNoiseFloorThreshold(e.target.value)}
                  style={{ width: 220 }}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5 border-t border-[var(--omada-border-divider)] pt-4">
              <SButton
                variant="secondary"
                onClick={() => {
                  setAutoAnalysisEnabled(true);
                  setRetentionDays('30');
                  setInterferenceThreshold('50');
                  setNoiseFloorThreshold('-80');
                  notification.info({
                    title: 'Settings Reset',
                    description: 'Restored default incident analysis thresholds.',
                  });
                }}
              >
                Reset Defaults
              </SButton>
              <SButton
                variant="primary"
                onClick={() =>
                  notification.success({
                    title: 'Incident Settings Applied',
                    description: `Retention set to ${retentionDays} days; interference threshold ${interferenceThreshold}%.`,
                  })
                }
              >
                Apply
              </SButton>
            </div>
          </div>
        </div>
      )}

      {/* Built-in Incident Detail Drawer when not externally controlled */}
      {!isDrawerControlled && (
        <IncidentDetailDrawer
          open={internalDrawerOpen}
          incident={activeDrawerIncident}
          onClose={() => setInternalDrawerOpen(false)}
          onSolve={(inc) => handleSolveIncident(inc)}
          onIgnore={(inc) => handleIgnoreIncident(inc)}
          onDelete={(inc) => handleDeleteIncident(inc)}
          onOpenDeviceByName={onOpenDeviceByName}
        />
      )}
    </div>
  );
};
