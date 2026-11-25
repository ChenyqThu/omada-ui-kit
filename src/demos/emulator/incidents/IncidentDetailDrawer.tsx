import React, { useEffect, useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { Checkbox } from 'antd';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  SChart,
  SIcon,
  SProductImage,
  STabs,
  useOmadaNotification,
  useOmadaTheme,
} from '@/omada';
import type {
  EmulatorIncidentRecord,
  IncidentOccurrenceRecord,
  IncidentSeverity,
  IncidentSuggestionPart,
} from './incidentsData';

export interface IncidentDetailDrawerProps {
  /** Whether the 800px drawer is visible. */
  open: boolean;
  /** Incident record currently inspected inside the drawer. */
  incident: EmulatorIncidentRecord | null;
  /** Invoked when the user clicks the drawer close button. */
  onClose: () => void;
  /** Invoked when the user clicks Solve inside the drawer. */
  onSolve?: (incident: EmulatorIncidentRecord) => void;
  /** Invoked when the user clicks Ignore inside the drawer. */
  onIgnore?: (incident: EmulatorIncidentRecord) => void;
  /** Invoked when the user clicks Delete inside the drawer. */
  onDelete?: (incident: EmulatorIncidentRecord) => void;
  /** Invoked when clicking an affected device link (e.g. `BreakRoom_Eap_2`). */
  onOpenDeviceByName?: (deviceName: string) => void;
  className?: string;
}

type DrawerSubTabKey = 'details' | 'affected-devices';

const SEVERITY_BADGE_COLOR: Record<IncidentSeverity, string> = {
  critical: 'var(--omada-color-error)',
  error: 'var(--omada-color-warning)',
  warning: 'var(--omada-color-warning-minor)',
  info: 'var(--omada-brand-hover)',
};

/**
 * Omada Controller v6.3.0.34 `800px` right-docked Incident Detail Drawer.
 * Displays category & date pill header, severity/status badges, `Incident Details`
 * & `Affected Devices` sub-tabs, occurrence timeline with ECharts line telemetry,
 * and collapsible `Possible Cause` / `Improvement Suggestions` cards.
 */
export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  open,
  incident,
  onClose,
  onSolve,
  onIgnore,
  onDelete,
  onOpenDeviceByName,
  className = '',
}) => {
  const notification = useOmadaNotification();
  const { resolvedTheme, tokens } = useOmadaTheme();

  const [subTab, setSubTab] = useState<DrawerSubTabKey>('details');
  const [selectedOccurrenceIds, setSelectedOccurrenceIds] = useState<string[]>([]);
  const [collapsedOccurrences, setCollapsedOccurrences] = useState<Record<string, boolean>>({});
  const [expandedCauses, setExpandedCauses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!incident) return;
    setSubTab('details');
    setSelectedOccurrenceIds([]);
    setCollapsedOccurrences({});
    const initialCauseMap: Record<string, boolean> = {};
    incident.occurrences.forEach((occ) => {
      if (occ.possibleCauses[0]) {
        initialCauseMap[occ.possibleCauses[0].key] = true;
      }
    });
    setExpandedCauses(initialCauseMap);
  }, [incident?.key]);

  const occurrenceIds = useMemo(
    () => incident?.occurrences.map((occ) => occ.id) ?? [],
    [incident],
  );

  const selectedSet = useMemo(
    () => new Set(selectedOccurrenceIds),
    [selectedOccurrenceIds],
  );

  const allSelected =
    occurrenceIds.length > 0 && selectedOccurrenceIds.length === occurrenceIds.length;
  const partiallySelected =
    selectedOccurrenceIds.length > 0 && selectedOccurrenceIds.length < occurrenceIds.length;
  const hasSelection = selectedOccurrenceIds.length > 0;

  if (!open || !incident) {
    return null;
  }

  const toggleSelectAll = () => {
    setSelectedOccurrenceIds(allSelected ? [] : occurrenceIds);
  };

  const toggleOccurrence = (id: string) => {
    setSelectedOccurrenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleOccCollapse = (id: string) => {
    setCollapsedOccurrences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCause = (key: string) => {
    setExpandedCauses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildChartOption = (occ: IncidentOccurrenceRecord): EChartsOption => {
    const isDark = resolvedTheme === 'dark';
    const curveColor = isDark ? '#45A08E' : '#2F6B60';

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        valueFormatter: (val) => `${String(val)}${occ.yUnit}`,
      },
      grid: {
        left: 8,
        right: 16,
        top: 14,
        bottom: 6,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: occ.xLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
          interval: (index: number) => index % 3 === 0 && index <= 12,
        },
      },
      yAxis: {
        type: 'value',
        min: occ.yMin,
        max: occ.yMax,
        interval: occ.yInterval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
          formatter: (val: number) => `${val}${occ.yUnit}`,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: occ.chartTitle,
          type: 'line',
          smooth: false,
          showSymbol: false,
          lineStyle: {
            width: 1.5,
            color: curveColor,
          },
          itemStyle: {
            color: curveColor,
          },
          data: occ.values,
        },
      ],
    };
  };

  const handleSuggestionLinkClick = (part: IncidentSuggestionPart) => {
    if (part.deviceName) {
      onOpenDeviceByName?.(part.deviceName);
      return;
    }
    notification.info({
      title: 'Wireless Interference FAQ',
      description:
        'Check nearby 2.4 GHz co-channel interference, enable WLAN Optimization, or migrate dual-band clients to 5 GHz / 6 GHz.',
    });
  };

  const handleSolveAction = () => {
    if (!hasSelection) return;
    onSolve?.(incident);
  };

  const handleIgnoreAction = () => {
    if (!hasSelection) return;
    onIgnore?.(incident);
  };

  const handleDeleteAction = () => {
    if (!hasSelection) return;
    onDelete?.(incident);
  };

  const statusToneClass =
    incident.status === 'Resolved'
      ? 'omada-incident-status-pill--resolved'
      : incident.status === 'Ignored'
        ? 'omada-incident-status-pill--ignored'
        : 'omada-incident-status-pill--ongoing';

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={incident.title}
      data-testid="incident-detail-drawer"
      className={`omada-incident-drawer ${className}`.trim()}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="m-0 text-[16px] font-semibold leading-[24px] text-[var(--omada-text-primary)]">
              {incident.categoryLabel}
            </h2>
            <span className="omada-incident-date-pill tabular-nums">
              {incident.dateWindow}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close incident detail"
            onClick={onClose}
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-secondary)] transition-colors hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-[10px] w-[10px] shrink-0 rounded-[2px]"
              style={{ backgroundColor: SEVERITY_BADGE_COLOR[incident.severity] }}
            />
            <span className="truncate text-[16px] font-semibold leading-[22px] text-[var(--omada-text-primary)]">
              {incident.title}
            </span>
          </div>
          <span className={`omada-incident-status-pill shrink-0 ${statusToneClass}`}>
            {incident.status}
          </span>
        </div>

        <p className="m-0 mt-2 text-[13px] leading-[19px] text-[var(--omada-text-secondary)]">
          {incident.subtitle}
        </p>
      </div>

      {/* Sub-Tabs */}
      <STabs
        variant="page"
        size="md"
        bordered
        aria-label="Incident detail sections"
        activeKey={subTab}
        onChange={(k) => setSubTab(k as typeof subTab)}
        className="mt-4 shrink-0 px-6"
        items={[
          { key: 'details', label: 'Incident Details' },
          { key: 'affected-devices', label: 'Affected Devices' },
        ]}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {subTab === 'details' ? (
          <div>
            {/* Action Header Row */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={allSelected}
                  indeterminate={partiallySelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all occurrences"
                />
                <span className="text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                  Incident Analysis
                </span>
                <span className="tabular-nums inline-flex h-[22px] items-center rounded-[3px] bg-[var(--omada-bg-field)] px-2 text-[12px] text-[var(--omada-text-secondary)]">
                  Occurrence: {incident.occurrencesCount}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={handleSolveAction}
                  className="omada-incident-drawer-action-btn"
                >
                  <SIcon name="right" size={16} />
                  <span>Solve</span>
                </button>
                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={handleIgnoreAction}
                  className="omada-incident-drawer-action-btn"
                >
                  <SIcon name="ignore" size={16} />
                  <span>Ignore</span>
                </button>
                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={handleDeleteAction}
                  className="omada-incident-drawer-action-btn"
                >
                  <SIcon name="delete" size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Occurrence Timeline */}
            <div className="space-y-4">
              {incident.occurrences.map((occ) => {
                const isExpanded = !collapsedOccurrences[occ.id];
                const isChecked = selectedSet.has(occ.id);

                return (
                  <div key={occ.id} className="relative pl-5">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-[7px] h-[6px] w-[6px] rounded-full bg-[var(--omada-border-strong)]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[2.5px] top-[17px] w-px bg-[var(--omada-border-divider)]"
                    />

                    <div className="mb-3 flex items-center gap-2">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => toggleOccurrence(occ.id)}
                        aria-label={`Select occurrence ${occ.timestamp}`}
                      />
                      <span className="tabular-nums text-[13px] font-medium text-[var(--omada-text-primary)]">
                        {occ.timestamp}
                      </span>
                      <button
                        type="button"
                        aria-label={`Toggle occurrence ${occ.timestamp}`}
                        aria-expanded={isExpanded}
                        onClick={() => toggleOccCollapse(occ.id)}
                        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="omada-incident-timeline-card p-5">
                        <div className="mb-2 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                          {occ.chartTitle}
                        </div>

                        <SChart
                          height={225}
                          option={buildChartOption(occ)}
                          className="w-full"
                        />

                        <div className="mt-4">
                          <div className="mb-3 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                            Possible Cause
                          </div>

                          <div className="space-y-3">
                            {occ.possibleCauses.map((cause) => {
                              const causeOpen = Boolean(expandedCauses[cause.key]);
                              return (
                                <div key={cause.key} className="omada-incident-cause-card">
                                  <button
                                    type="button"
                                    aria-expanded={causeOpen}
                                    onClick={() => toggleCause(cause.key)}
                                    className="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-4 py-3 text-left"
                                  >
                                    <span className="text-[14px] font-medium leading-[20px] text-[var(--omada-text-primary)]">
                                      {cause.title}
                                    </span>
                                    {causeOpen ? (
                                      <ChevronUp
                                        size={15}
                                        className="shrink-0 text-[var(--omada-text-secondary)]"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={15}
                                        className="shrink-0 text-[var(--omada-text-secondary)]"
                                      />
                                    )}
                                  </button>

                                  {causeOpen && (
                                    <div className="px-4 pb-4 pt-1">
                                      <div className="mb-2 text-[14px] font-medium leading-[20px] text-[var(--omada-text-primary)]">
                                        Improvement Suggestions
                                      </div>
                                      <div className="space-y-1.5 text-[13px] leading-[20px] text-[var(--omada-text-primary)]">
                                        {cause.suggestions.map((part) => (
                                          <div key={part.id}>
                                            <span>{part.prefix}</span>
                                            {part.linkLabel && (
                                              <button
                                                type="button"
                                                onClick={() => handleSuggestionLinkClick(part)}
                                                className="cursor-pointer border-0 bg-transparent p-0 font-normal text-[var(--omada-link)] hover:underline"
                                              >
                                                {part.linkLabel}
                                              </button>
                                            )}
                                            <span>{part.suffix}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="omada-incident-timeline-card overflow-hidden">
            <div className="border-b border-[var(--omada-border-divider)] bg-[var(--omada-bg-table-header)] px-4 py-2.5 text-[13px] font-semibold text-[var(--omada-text-primary)]">
              Affected Devices (1)
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-3">
                <SProductImage
                  name={incident.affectedDeviceSlug}
                  size={36}
                  alt={incident.affectedDeviceModel}
                  className="shrink-0 object-contain"
                />
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenDeviceByName?.(incident.affectedDeviceName)}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[14px] font-medium text-[var(--omada-link)] hover:underline"
                  >
                    {incident.affectedDeviceName}
                  </button>
                  <div className="mt-0.5 text-[12px] text-[var(--omada-text-secondary)]">
                    {incident.affectedDeviceModel} · {incident.affectedBand}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-[13px]">
                <div>
                  <div className="text-[11px] text-[var(--omada-text-tertiary)]">
                    MAC Address
                  </div>
                  <div className="tabular-nums text-[var(--omada-text-primary)]">
                    {incident.affectedDeviceMac}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--omada-text-tertiary)]">
                    IP Address
                  </div>
                  <div className="tabular-nums text-[var(--omada-text-primary)]">
                    {incident.affectedDeviceIp}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--omada-text-tertiary)]">
                    Status
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[var(--omada-text-primary)]">
                    <span
                      aria-hidden="true"
                      className="h-[7px] w-[7px] rounded-full bg-[var(--omada-brand-hover)]"
                    />
                    <span>Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
