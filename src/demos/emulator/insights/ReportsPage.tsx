import React, { useMemo, useState } from 'react';
import { App, Dropdown, type MenuProps } from 'antd';
import type { EChartsOption } from 'echarts';
import { Plus } from 'lucide-react';
import {
  SButton,
  SChart,
  SIcon,
  SInput,
  SModal,
  SSwitch,
  STabs,
  STooltip,
  omadaChartPalette,
  useOmadaTheme,
} from '@/omada';
import {
  SDonutSummaryCard,
  type SDonutSummaryItem,
} from '../../../omada/components/SDonutSummaryCard';
import {
  REPORTS_CLIENT_APP_DATA,
  REPORTS_SUMMARY_DATA,
  REPORTS_WIRED_DATA,
  REPORTS_WIRELESS_DATA,
  type ReportTimeRangeKey,
} from './insightsData';

export interface ReportsPageProps {
  className?: string;
}

type ReportsTabKey = 'summary' | 'wired' | 'wireless' | 'client-app';

const TIME_RANGES: ReportTimeRangeKey[] = ['1D', '1W', '1M'];

/**
 * Omada Controller v6.3.0.34 Insights -> Reports page (`#/report`).
 * Replicates the `Summary | Wired | Wireless | Client & Application` underline header,
 * `1D | 1W | 1M` segmented picker + Export button, 3-column Client Overview & SSID row
 * (with zero legend overflow), Wireless Clients Onboarding Activities spike chart,
 * and Clients with Onboarding Time ring + bar breakdown.
 */
export const ReportsPage: React.FC<ReportsPageProps> = ({ className = '' }) => {
  const { notification } = App.useApp();
  const { resolvedTheme, tokens } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];

  const [activeTab, setActiveTab] = useState<ReportsTabKey>('client-app');
  const [timeRange, setTimeRange] = useState<ReportTimeRangeKey>('1D');
  const [customRangeLabel, setCustomRangeLabel] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('Client & Application');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('Client & Application');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [autoEmailDigest, setAutoEmailDigest] = useState(true);
  const [includeTopApps, setIncludeTopApps] = useState(true);

  const clientAppData = REPORTS_CLIENT_APP_DATA[timeRange];

  const clientsOverviewItems = useMemo<SDonutSummaryItem[]>(
    () =>
      clientAppData.clientsOverviewBreakdown.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.count,
        displayValue: `${item.count} (${item.percent}%)`,
        color:
          item.overrideThemeColor === 'warning'
            ? tokens.warning
            : palette[item.paletteIndex % palette.length],
      })),
    [clientAppData.clientsOverviewBreakdown, palette, tokens.warning],
  );

  const ssidDistributionItems = useMemo<SDonutSummaryItem[]>(
    () =>
      clientAppData.ssidDistribution.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.count,
        displayValue: `${item.count} (${item.percent}%)`,
        color: palette[item.paletteIndex % palette.length],
      })),
    [clientAppData.ssidDistribution, palette],
  );

  const onboardingActivitiesOption = useMemo<EChartsOption>(() => {
    const maxSpike = Math.max(
      ...clientAppData.onboardingSeries.s0to1,
      ...clientAppData.onboardingSeries.s1to3,
      ...clientAppData.onboardingSeries.s3to12,
      ...clientAppData.onboardingSeries.sGt12,
      1,
    );
    const yMax = timeRange === '1D' ? 10 : Math.ceil(maxSpike / 2) * 2 + 4;
    const yInterval = Math.max(1, Math.round(yMax / 5));

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: 10,
        right: 14,
        top: 12,
        bottom: 4,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: clientAppData.onboardingTimestamps,
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
          interval: (index: number) => clientAppData.onboardingTickLabels.has(index),
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: yInterval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
        },
      },
      series: [
        {
          name: '0-1s',
          type: 'bar',
          stack: 'onboarding',
          barWidth: 3,
          itemStyle: { color: tokens.brandHover },
          data: clientAppData.onboardingSeries.s0to1,
        },
        {
          name: '1-3s',
          type: 'bar',
          stack: 'onboarding',
          barWidth: 3,
          itemStyle: { color: tokens.warningMinor },
          data: clientAppData.onboardingSeries.s1to3,
        },
        {
          name: '3-12s',
          type: 'bar',
          stack: 'onboarding',
          barWidth: 3,
          itemStyle: { color: tokens.warning },
          data: clientAppData.onboardingSeries.s3to12,
        },
        {
          name: '>12s',
          type: 'bar',
          stack: 'onboarding',
          barWidth: 3,
          itemStyle: { color: tokens.error },
          data: clientAppData.onboardingSeries.sGt12,
        },
      ],
    };
  }, [clientAppData, timeRange, tokens]);

  const onboardingRingOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['76%', '92%'],
          center: ['50%', '50%'],
          silent: true,
          label: { show: false },
          labelLine: { show: false },
          data: [
            {
              name: 'Time < 10s',
              value: 100,
              itemStyle: { color: tokens.brandHover },
            },
          ],
        },
      ],
    }),
    [tokens.brandHover],
  );

  const onboardingBarOption = useMemo<EChartsOption>(() => {
    const maxVal = Math.max(...clientAppData.onboardingBuckets.map((b) => b.value), 1);
    const isOneDay = timeRange === '1D';
    const yMax = isOneDay ? 18 : Math.ceil(maxVal / 30) * 30;
    const yInterval = isOneDay ? 3 : Math.max(10, Math.round(yMax / 6));

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: 10,
        right: 16,
        top: 16,
        bottom: 6,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: clientAppData.onboardingBuckets.map((b) => b.label),
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: yInterval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
        },
      },
      series: [
        {
          name: 'Clients',
          type: 'bar',
          barWidth: 14,
          data: clientAppData.onboardingBuckets.map((bucket) => ({
            value: bucket.value,
            itemStyle: {
              color: bucket.isFailure ? tokens.error : tokens.brandHover,
              borderRadius: [2, 2, 0, 0],
            },
          })),
        },
      ],
    };
  }, [clientAppData.onboardingBuckets, timeRange, tokens]);

  const summaryTrendOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: tokens.textSecondary, fontSize: 12 },
      },
      grid: { left: 10, right: 16, top: 34, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: REPORTS_SUMMARY_DATA.trafficTrendLabels,
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} MB' },
      },
      series: [
        {
          name: 'Download',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: tokens.magenta },
          itemStyle: { color: tokens.magenta },
          data: REPORTS_SUMMARY_DATA.trafficDownloadMb,
        },
        {
          name: 'Upload',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: tokens.link },
          itemStyle: { color: tokens.link },
          data: REPORTS_SUMMARY_DATA.trafficUploadMb,
        },
      ],
    }),
    [tokens],
  );

  const wiredBarOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 0, right: 0, textStyle: { color: tokens.textSecondary, fontSize: 12 } },
      grid: { left: 10, right: 16, top: 34, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: REPORTS_WIRED_DATA.switchTraffic.map((s) => s.name),
        splitLine: { show: false },
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} MB' } },
      series: [
        {
          name: 'RX Traffic',
          type: 'bar',
          barWidth: 18,
          itemStyle: { color: palette[0], borderRadius: [3, 3, 0, 0] },
          data: REPORTS_WIRED_DATA.switchTraffic.map((s) => s.rxMb),
        },
        {
          name: 'TX Traffic',
          type: 'bar',
          barWidth: 18,
          itemStyle: { color: palette[1], borderRadius: [3, 3, 0, 0] },
          data: REPORTS_WIRED_DATA.switchTraffic.map((s) => s.txMb),
        },
      ],
    }),
    [palette, tokens.textSecondary],
  );

  const wirelessBarOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: 0, right: 0, textStyle: { color: tokens.textSecondary, fontSize: 12 } },
      grid: { left: 10, right: 16, top: 34, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: REPORTS_WIRELESS_DATA.apThroughput.map((a) => a.name),
        splitLine: { show: false },
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} MB' } },
      series: [
        {
          name: 'Downlink',
          type: 'bar',
          barWidth: 20,
          itemStyle: { color: tokens.brandHover, borderRadius: [3, 3, 0, 0] },
          data: REPORTS_WIRELESS_DATA.apThroughput.map((a) => a.downMb),
        },
        {
          name: 'Uplink',
          type: 'bar',
          barWidth: 20,
          itemStyle: { color: tokens.link, borderRadius: [3, 3, 0, 0] },
          data: REPORTS_WIRELESS_DATA.apThroughput.map((a) => a.upMb),
        },
      ],
    }),
    [tokens],
  );

  const calendarMenuItems: MenuProps['items'] = [
    { key: '1D', label: 'Sep 18, 2025 - Sep 19, 2025 (1D)' },
    { key: '1W', label: 'Sep 13, 2025 - Sep 19, 2025 (1W)' },
    { key: '1M', label: 'Aug 20, 2025 - Sep 19, 2025 (1M)' },
  ];

  const handleExport = () => {
    notification.success({
      title: 'Report Exported',
      description: `Generated "${reportTitle}" (${customRangeLabel ?? timeRange}) PDF & CSV bundle.`,
    });
  };

  return (
    <div
      data-testid="reports-page"
      className={`omada-emulator-insights min-h-full px-6 pt-4 pb-6 ${className}`.trim()}
    >
      {/* Top Bar: Underline Report Tabs + Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--omada-border-divider)]">
        <div className="flex flex-wrap items-center gap-3">
          <STabs
            variant="page"
            size="lg"
            bordered={false}
            aria-label="Report sections"
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as ReportsTabKey)}
            items={[
              { key: 'summary', label: 'Summary' },
              { key: 'wired', label: 'Wired' },
              { key: 'wireless', label: 'Wireless' },
              { key: 'client-app', label: reportTitle },
            ]}
          />

          <div className="mb-2 flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Edit report template"
              onClick={() => {
                setDraftTitle(reportTitle);
                setEditModalOpen(true);
              }}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 hover:bg-[var(--omada-brand-bg-subtlest)]"
            >
              <SIcon name="edit" size={16} />
            </button>
            <STooltip title="Add custom report">
              <button
                type="button"
                aria-label="Add report tab"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <Plus size={17} />
              </button>
            </STooltip>
            <STooltip title="Report settings">
              <button
                type="button"
                aria-label="Report settings"
                onClick={() => setSettingsModalOpen(true)}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-secondary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
              >
                <SIcon name="icon-icon-tabler-icon-settings-2" size={17} />
              </button>
            </STooltip>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {customRangeLabel && (
            <span className="tabular-nums text-[13px] text-[var(--omada-text-tertiary)]">
              {customRangeLabel}
            </span>
          )}
          <div
            role="group"
            aria-label="Report time range"
            className="omada-insights-seg-track"
          >
            {TIME_RANGES.map((rangeKey) => {
              const isActive = timeRange === rangeKey;
              return (
                <button
                  key={rangeKey}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setTimeRange(rangeKey);
                    setCustomRangeLabel(null);
                  }}
                  className={`omada-insights-seg-pill px-2.5 text-[12px] ${
                    isActive ? 'is-active' : ''
                  }`}
                >
                  {rangeKey}
                </button>
              );
            })}
            <span
              className="mx-1 h-3.5 w-px bg-[var(--omada-border-divider)]"
              aria-hidden="true"
            />
            <Dropdown
              trigger={['click']}
              menu={{
                items: calendarMenuItems,
                selectedKeys: [timeRange],
                onClick: ({ key }) => {
                  const next = key as ReportTimeRangeKey;
                  setTimeRange(next);
                  setCustomRangeLabel(
                    next === '1D'
                      ? 'Sep 18 - Sep 19, 2025'
                      : next === '1W'
                        ? 'Sep 13 - Sep 19, 2025'
                        : 'Aug 20 - Sep 19, 2025',
                  );
                },
              }}
            >
              <button
                type="button"
                aria-label="Custom report date range"
                className="inline-flex h-[26px] w-[28px] cursor-pointer items-center justify-center rounded-[2px] border-0 bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]"
              >
                <SIcon name="icon-46146-123043" size={15} />
              </button>
            </Dropdown>
          </div>

          <SButton
            variant="primary"
            icon={<SIcon name="export" size={15} />}
            onClick={handleExport}
            className="omada-insights-primary-btn"
          >
            Export
          </SButton>
        </div>
      </div>

      {/* Tab 4 (Default): Client & Application */}
      {activeTab === 'client-app' && (
        <div data-testid="reports-client-app-panel" className="space-y-4">
          {/* Row 1: 3 Equal-Height Cards with Zero Overflow */}
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
            {/* Card 1: 3 Stacked KPI Rows */}
            <section
              data-testid="reports-kpi-card"
              className="omada-insights-card flex h-full flex-col justify-between px-5 py-1.5"
            >
              <div className="border-b border-[var(--omada-border-divider)] py-3">
                <div className="text-[13px] leading-[18px] text-[var(--omada-text-secondary)]">
                  Total Unique Client
                </div>
                <div className="tabular-nums mt-1 text-[20px] font-medium leading-[26px] text-[var(--omada-text-primary)]">
                  {clientAppData.uniqueClients}
                </div>
              </div>
              <div className="border-b border-[var(--omada-border-divider)] py-3">
                <div className="text-[13px] leading-[18px] text-[var(--omada-text-secondary)]">
                  Average of Clients Per Day
                </div>
                <div className="tabular-nums mt-1 text-[20px] font-medium leading-[26px] text-[var(--omada-text-primary)]">
                  {clientAppData.avgClientsPerDay}
                </div>
              </div>
              <div className="py-3">
                <div className="text-[13px] leading-[18px] text-[var(--omada-text-secondary)]">
                  Average of Usage Per Client
                </div>
                <div className="tabular-nums mt-1 text-[20px] font-medium leading-[26px] text-[var(--omada-text-primary)]">
                  {clientAppData.avgUsagePerClient}
                </div>
              </div>
            </section>

            {/* Card 2: Clients Overview */}
            <SDonutSummaryCard
              data-testid="reports-clients-overview-card"
              title="Clients Overview"
              centerValue={clientAppData.clientsOverviewTotal}
              centerLabel="Total"
              data={clientsOverviewItems}
              layout="horizontal"
              donutSize={124}
            />

            {/* Card 3: Clients SSID Distribution (Compact Single-Line Legend, Zero Overflow) */}
            <SDonutSummaryCard
              data-testid="reports-ssid-distribution-card"
              title="Clients SSID Distribution"
              centerValue={clientAppData.ssidTotal}
              centerLabel="Total"
              data={ssidDistributionItems}
              layout="horizontal"
              donutSize={114}
            />
          </div>

          {/* Row 2: Wireless Clients Onboarding Activities */}
          <section
            data-testid="reports-onboarding-activities-card"
            className="omada-insights-card px-5 py-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <h2 className="m-0 text-[16px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                  Wireless Clients Onboarding Activities
                </h2>
                <STooltip title="Distribution of wireless client association, authentication, and DHCP onboarding latency over time.">
                  <button
                    type="button"
                    aria-label="Wireless onboarding activities info"
                    className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                  >
                    <SIcon name="info" size={16} />
                  </button>
                </STooltip>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--omada-text-secondary)]">
                {[
                  { label: '0-1s', color: tokens.brandHover },
                  { label: '1-3s', color: tokens.warningMinor },
                  { label: '3-12s', color: tokens.warning },
                  { label: '>12s', color: tokens.error },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-[8px] w-[8px] rounded-[1px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <SChart option={onboardingActivitiesOption} height={180} />
          </section>

          {/* Row 3: Clients with Onboarding Time */}
          <section
            data-testid="reports-onboarding-time-card"
            className="omada-insights-card px-5 py-4"
          >
            <h2 className="m-0 mb-3 text-[16px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
              Clients with Onboarding Time
            </h2>

            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="flex w-[220px] shrink-0 items-center justify-center">
                <div className="relative h-[160px] w-[160px]">
                  <SChart option={onboardingRingOption} height={160} />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                    <span className="tabular-nums text-[18px] font-semibold leading-[24px] text-[var(--omada-text-primary)]">
                      {clientAppData.onboardingSuccessRate}
                    </span>
                    <span className="mt-0.5 text-[12px] leading-[16px] text-[var(--omada-text-secondary)]">
                      Time &lt; 10s
                    </span>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 w-full">
                <SChart option={onboardingBarOption} height={185} />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <div data-testid="reports-summary-panel" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REPORTS_SUMMARY_DATA.kpis.map((kpi) => (
              <section key={kpi.key} className="omada-insights-card px-5 py-4">
                <div className="text-[13px] text-[var(--omada-text-secondary)]">
                  {kpi.label}
                </div>
                <div className="tabular-nums mt-1.5 text-[22px] font-semibold text-[var(--omada-text-primary)]">
                  {kpi.value}
                </div>
                <div className="tabular-nums mt-1 text-[12px] text-[var(--omada-text-tertiary)]">
                  {kpi.meta}
                </div>
              </section>
            ))}
          </div>
          <section className="omada-insights-card px-5 py-4">
            <h2 className="m-0 mb-2 text-[16px] font-medium text-[var(--omada-text-primary)]">
              Site WAN Throughput Trend ({timeRange})
            </h2>
            <SChart option={summaryTrendOption} height={240} />
          </section>
        </div>
      )}

      {/* Tab 2: Wired */}
      {activeTab === 'wired' && (
        <div data-testid="reports-wired-panel" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="omada-insights-card flex flex-col justify-between px-5 py-2">
              {REPORTS_WIRED_DATA.kpis.map((kpi, idx) => (
                <div
                  key={kpi.key}
                  className={`py-3 ${
                    idx < REPORTS_WIRED_DATA.kpis.length - 1
                      ? 'border-b border-[var(--omada-border-divider)]'
                      : ''
                  }`}
                >
                  <div className="text-[13px] text-[var(--omada-text-secondary)]">
                    {kpi.label}
                  </div>
                  <div className="tabular-nums mt-1 text-[20px] font-medium text-[var(--omada-text-primary)]">
                    {kpi.value}
                  </div>
                </div>
              ))}
            </section>
            <SDonutSummaryCard
              title="Active Port Speed Distribution"
              centerValue={14}
              centerLabel="Active Ports"
              layout="horizontal"
              donutSize={128}
              data={REPORTS_WIRED_DATA.portSpeeds.map((item) => ({
                key: item.key,
                label: item.label,
                value: item.count,
                displayValue: item.display,
                color: palette[item.paletteIndex % palette.length],
              }))}
            />
          </div>
          <section className="omada-insights-card px-5 py-4">
            <h2 className="m-0 mb-2 text-[16px] font-medium text-[var(--omada-text-primary)]">
              Switch Uplink & Port Traffic
            </h2>
            <SChart option={wiredBarOption} height={230} />
          </section>
        </div>
      )}

      {/* Tab 3: Wireless */}
      {activeTab === 'wireless' && (
        <div data-testid="reports-wireless-panel" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="omada-insights-card flex flex-col justify-between px-5 py-2">
              {REPORTS_WIRELESS_DATA.kpis.map((kpi, idx) => (
                <div
                  key={kpi.key}
                  className={`py-3 ${
                    idx < REPORTS_WIRELESS_DATA.kpis.length - 1
                      ? 'border-b border-[var(--omada-border-divider)]'
                      : ''
                  }`}
                >
                  <div className="text-[13px] text-[var(--omada-text-secondary)]">
                    {kpi.label}
                  </div>
                  <div className="tabular-nums mt-1 text-[20px] font-medium text-[var(--omada-text-primary)]">
                    {kpi.value}
                  </div>
                </div>
              ))}
            </section>
            <SDonutSummaryCard
              title="Wireless Radio Band Breakdown"
              centerValue={2}
              centerLabel="Wireless"
              layout="horizontal"
              donutSize={128}
              data={REPORTS_WIRELESS_DATA.bandDistribution.map((item) => ({
                key: item.key,
                label: item.label,
                value: item.count,
                displayValue: item.display,
                color: palette[item.paletteIndex % palette.length],
              }))}
            />
          </div>
          <section className="omada-insights-card px-5 py-4">
            <h2 className="m-0 mb-2 text-[16px] font-medium text-[var(--omada-text-primary)]">
              Access Point Traffic Volume
            </h2>
            <SChart option={wirelessBarOption} height={230} />
          </section>
        </div>
      )}

      {/* Rename Report Modal */}
      <SModal
        open={editModalOpen}
        title="Edit Report View"
        size="sm"
        okText="Save"
        cancelText="Cancel"
        destroyOnHidden
        onOk={() => {
          const trimmed = draftTitle.trim();
          if (trimmed) setReportTitle(trimmed);
          setEditModalOpen(false);
        }}
        onCancel={() => setEditModalOpen(false)}
      >
        <div className="py-2">
          <label
            htmlFor="omada-report-title-input"
            className="mb-1.5 block text-xs font-medium text-[var(--omada-text-secondary)]"
          >
            Report Template Name
          </label>
          <SInput
            id="omada-report-title-input"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Client & Application"
          />
        </div>
      </SModal>

      {/* Add Report Modal */}
      <SModal
        open={createModalOpen}
        title="Create Custom Report"
        size="sm"
        okText="Create"
        cancelText="Cancel"
        destroyOnHidden
        onOk={() => {
          const name = newReportName.trim() || 'Executive Weekly Digest';
          setCreateModalOpen(false);
          setNewReportName('');
          notification.success({
            title: 'Report Created',
            description: `Custom report "${name}" saved to Headquarters Building.`,
          });
        }}
        onCancel={() => setCreateModalOpen(false)}
      >
        <div className="py-2">
          <label
            htmlFor="omada-new-report-name"
            className="mb-1.5 block text-xs font-medium text-[var(--omada-text-secondary)]"
          >
            Report Name
          </label>
          <SInput
            id="omada-new-report-name"
            value={newReportName}
            onChange={(e) => setNewReportName(e.target.value)}
            placeholder="e.g. Executive Weekly Digest"
          />
        </div>
      </SModal>

      {/* Report Settings Modal */}
      <SModal
        open={settingsModalOpen}
        title="Report Preferences"
        size="sm"
        okText="Apply"
        cancelText="Cancel"
        destroyOnHidden
        onOk={() => {
          setSettingsModalOpen(false);
          notification.success({
            title: 'Preferences Saved',
            description: 'Scheduled report delivery settings updated.',
          });
        }}
        onCancel={() => setSettingsModalOpen(false)}
      >
        <div className="space-y-4 py-2 text-[13px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-[var(--omada-text-primary)]">
                Weekly Email Digest
              </div>
              <div className="text-[12px] text-[var(--omada-text-secondary)]">
                Send PDF report every Monday at 08:00 AM
              </div>
            </div>
            <SSwitch
              checked={autoEmailDigest}
              onChange={setAutoEmailDigest}
              aria-label="Weekly Email Digest"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-[var(--omada-text-primary)]">
                Include DPI Top Applications
              </div>
              <div className="text-[12px] text-[var(--omada-text-secondary)]">
                Attach application breakdown tables in exports
              </div>
            </div>
            <SSwitch
              checked={includeTopApps}
              onChange={setIncludeTopApps}
              aria-label="Include DPI Top Applications"
            />
          </div>
        </div>
      </SModal>
    </div>
  );
};
