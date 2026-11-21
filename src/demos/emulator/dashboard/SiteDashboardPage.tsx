import React, { useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import {
  Dropdown,
  SChart,
  SClientIcon,
  SIcon,
  SIllustration,
  SSwitch,
  STooltip,
  useOmadaNotification,
  useOmadaTheme,
  type OmadaIconName,
} from '@/omada';
import { SHealthGauge, SHealthRadar } from '../../../omada/components/SHealthGauge';
import { SHealthTrendBar } from '../../../omada/components/SHealthTrendBar';
import { SApDistributionRuler } from '../../../omada/components/SApDistributionRuler';
import { SChannelUtilization } from '../../../omada/components/SChannelUtilization';
import {
  AP_DISTRIBUTION_CLUSTERS,
  CHANNEL_UTILIZATION_BANDS,
  DASHBOARD_GATEWAY,
  DASHBOARD_HEALTH_SCORES,
  DASHBOARD_TIMESTAMP,
  HEALTH_TREND_BY_RANGE,
  NETWORK_OVERVIEW_ITEMS,
  TOP_APPS_BY_TRAFFIC,
  TOP_CLIENTS_BY_TRAFFIC,
  getActivityDataset,
  type ActivityModeKey,
  type DashboardMainTabKey,
  type DashboardTimeRangeKey,
  type TopAppTrafficItem,
} from './dashboardData';

export interface SiteDashboardPageProps {
  /** Invoked when clicking `MainOffice_Gateway_2` or another device link. */
  onOpenDeviceByName?: (deviceName: string) => void;
  /** Invoked when clicking `More >` or overview entity links. */
  onNavigate?: (routeKey: string) => void;
  className?: string;
}

const MAIN_TABS: Array<{ key: DashboardMainTabKey; label: string; icon: OmadaIconName }> = [
  { key: 'overview', label: 'Overview', icon: 'dashboard-tab-overview' },
  { key: 'topology', label: 'Topology', icon: 'dashboard-tab-topo' },
  { key: 'wifi', label: 'Wi-Fi', icon: 'dashboard-tab-wi-fi' },
  { key: 'clients', label: 'Clients', icon: 'dashboard-tab-application' },
  { key: 'traffic', label: 'Traffic', icon: 'dashboard-tab-traffic' },
];

const TIME_RANGES: DashboardTimeRangeKey[] = ['1D', '1W', '1M'];

const ACTIVITY_SUB_TABS: Array<{ key: ActivityModeKey; label: string }> = [
  { key: 'internet', label: 'Internet' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'isp', label: 'ISP Load' },
];

const AppBadgeIcon: React.FC<{ badgeKey: TopAppTrafficItem['badgeKey'] }> = ({ badgeKey }) => {
  switch (badgeKey) {
    case 'm365':
      return (
        <span
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px]"
          style={{ backgroundColor: '#0078D4' }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="1.5" width="4.8" height="4.8" rx="0.6" fill="#FFFFFF" />
            <rect x="7.7" y="1.5" width="4.8" height="4.8" rx="0.6" fill="#FFFFFF" />
            <rect x="1.5" y="7.7" width="4.8" height="4.8" rx="0.6" fill="#FFFFFF" />
            <rect x="7.7" y="7.7" width="4.8" height="4.8" rx="0.6" fill="#FFFFFF" />
          </svg>
        </span>
      );
    case 'zoom':
      return (
        <span
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px]"
          style={{ backgroundColor: '#2D8CFF' }}
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4.5" width="8.5" height="7" rx="1.6" fill="#FFFFFF" />
            <path d="M11.2 6.8L14 5.1V10.9L11.2 9.2V6.8Z" fill="#FFFFFF" />
          </svg>
        </span>
      );
    case 'slack':
      return (
        <span
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px]"
          style={{ backgroundColor: '#4A154B' }}
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="6.3" y="2.2" width="1.6" height="4.5" rx="0.8" fill="#36C5F0" />
            <rect x="9.3" y="6.3" width="4.5" height="1.6" rx="0.8" fill="#2EB67D" />
            <rect x="8.1" y="9.3" width="1.6" height="4.5" rx="0.8" fill="#ECB22E" />
            <rect x="2.2" y="8.1" width="4.5" height="1.6" rx="0.8" fill="#E01E5A" />
            <circle cx="4.8" cy="6.8" r="0.9" fill="#36C5F0" />
            <circle cx="9.2" cy="4.8" r="0.9" fill="#2EB67D" />
            <circle cx="11.2" cy="9.2" r="0.9" fill="#ECB22E" />
            <circle cx="6.8" cy="11.2" r="0.9" fill="#E01E5A" />
          </svg>
        </span>
      );
    case 'aws':
      return (
        <span
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px]"
          style={{ backgroundColor: '#FF9900' }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.6 10.8H11.6C12.8 10.8 13.7 9.9 13.7 8.8C13.7 7.8 12.9 6.9 11.9 6.8C11.6 5.1 10.1 3.9 8.4 3.9C6.8 3.9 5.5 4.9 5 6.4C3.7 6.5 2.7 7.5 2.7 8.7C2.7 9.9 3.6 10.8 4.6 10.8Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );
    case 'salesforce':
      return (
        <span
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px]"
          style={{ backgroundColor: '#00A1E0' }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.8 11H11.4C12.6 11 13.6 10 13.6 8.8C13.6 7.7 12.7 6.7 11.6 6.6C11.2 5 9.8 3.9 8.1 3.9C6.6 3.9 5.3 4.8 4.8 6.2C3.5 6.3 2.5 7.4 2.5 8.7C2.5 10 3.5 11 4.8 11Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );
  }
};

const EmergencyWifiBadge: React.FC = () => (
  <span
    className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
    style={{
      backgroundColor: '#FF8C27',
      boxShadow: '0 0 0 3px rgba(255, 140, 39, 0.2)',
    }}
    aria-hidden="true"
  >
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.2 6.2C5.5 3.1 10.5 3.1 13.8 6.2"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.4 8.6C6.4 6.7 9.6 6.7 11.6 8.6"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.6" r="1.2" fill="#FFFFFF" />
    </svg>
  </span>
);

/**
 * Omada Controller v6.3.0.34 Site Dashboard page (`Overview`, `Topology`, `Wi-Fi`,
 * `Clients`, `Traffic`) matching Light (`#FFFFFF`) and Dark (`#1C1C1C`) reference views.
 */
export const SiteDashboardPage: React.FC<SiteDashboardPageProps> = ({
  onOpenDeviceByName,
  onNavigate,
  className = '',
}) => {
  const notification = useOmadaNotification();
  const { resolvedTheme, tokens } = useOmadaTheme();

  const [mainTab, setMainTab] = useState<DashboardMainTabKey>('overview');
  const [timeRange, setTimeRange] = useState<DashboardTimeRangeKey>('1D');
  const [emergencyWifi, setEmergencyWifi] = useState(false);
  const [activeWanKey, setActiveWanKey] = useState<string>(DASHBOARD_GATEWAY.wanPorts[0].key);
  const [activityMode, setActivityMode] = useState<ActivityModeKey>('internet');
  const [activityMetricFilter, setActivityMetricFilter] = useState<'all' | 'upload' | 'download'>('all');
  const [runningSpeedTest, setRunningSpeedTest] = useState(false);
  const [customWindowLabel, setCustomWindowLabel] = useState<string | null>(null);

  const activeWan =
    DASHBOARD_GATEWAY.wanPorts.find((p) => p.key === activeWanKey) ?? DASHBOARD_GATEWAY.wanPorts[0];

  const healthTrendRows = HEALTH_TREND_BY_RANGE[timeRange];
  const activityDataset = useMemo(
    () => getActivityDataset(timeRange, activityMode),
    [timeRange, activityMode],
  );

  const activityOption = useMemo<EChartsOption>(() => {
    const isDark = resolvedTheme === 'dark';
    const tickStep = activityDataset.yMaxMbps / 5;
    const uploadColor = isDark ? '#33A0E9' : '#0069CB';
    const downloadColor = '#F476FF';
    const wiredBarColor = isDark ? 'rgba(51, 160, 233, 0.24)' : 'rgba(0, 105, 203, 0.24)';
    const wirelessBarColor = isDark ? 'rgba(0, 168, 112, 0.24)' : 'rgba(0, 168, 112, 0.24)';

    const series: EChartsOption['series'] = [
      {
        name: 'Wireless',
        type: 'bar',
        yAxisIndex: 1,
        stack: 'clients',
        barWidth: '100%',
        barCategoryGap: '0%',
        itemStyle: { color: wirelessBarColor },
        emphasis: { disabled: true },
        data: activityDataset.wirelessClients,
      },
      {
        name: 'Wired',
        type: 'bar',
        yAxisIndex: 1,
        stack: 'clients',
        barWidth: '100%',
        barCategoryGap: '0%',
        itemStyle: { color: wiredBarColor },
        emphasis: { disabled: true },
        data: activityDataset.wiredClients,
      },
    ];

    if (activityMetricFilter === 'all' || activityMetricFilter === 'upload') {
      series.push({
        name: 'Upload',
        type: 'line',
        yAxisIndex: 0,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1.2, color: uploadColor },
        itemStyle: { color: uploadColor },
        data: activityDataset.uploadMbps,
      });
    }

    if (activityMetricFilter === 'all' || activityMetricFilter === 'download') {
      series.push({
        name: 'Download',
        type: 'line',
        yAxisIndex: 0,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1.2, color: downloadColor },
        itemStyle: { color: downloadColor },
        data: activityDataset.downloadMbps,
      });
    }

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: 8,
        right: 8,
        top: 12,
        bottom: 4,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: activityDataset.timestamps,
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
          interval: (index: number) => index % 10 === 0,
          showMaxLabel: true,
        },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: activityDataset.yMaxMbps,
          interval: tickStep,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: tokens.textTertiary,
            fontSize: 11,
            formatter: (value: number) => {
              const idx = Math.round(value / Math.max(tickStep, 0.0001));
              return activityDataset.yTickLabels[idx] ?? `${value.toFixed(2)} Mbps`;
            },
          },
        },
        {
          type: 'value',
          min: 0,
          max: 10,
          interval: 2,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            color: tokens.textTertiary,
            fontSize: 11,
          },
        },
      ],
      series,
    };
  }, [activityDataset, activityMetricFilter, resolvedTheme, tokens]);

  const handleSpeedTest = () => {
    if (runningSpeedTest) return;
    setRunningSpeedTest(true);
    notification.info({
      title: 'WAN Speed Test Started',
      description: `Testing throughput on ${DASHBOARD_GATEWAY.name} (${activeWan.label})...`,
    });
    window.setTimeout(() => {
      setRunningSpeedTest(false);
    }, 800);
  };

  const handleEmergencyToggle = (checked: boolean) => {
    setEmergencyWifi(checked);
    notification[checked ? 'warning' : 'info']({
      title: checked ? 'Emergency Free Wi-Fi Enabled' : 'Emergency Free Wi-Fi Disabled',
      description: checked
        ? 'Guest fallback SSID broadcast is now active across adopted APs.'
        : 'Emergency guest SSID broadcast has been turned off.',
    });
  };

  const trendTitle =
    timeRange === '1D'
      ? '24h Network Health Trend'
      : timeRange === '1W'
        ? '7d Network Health Trend'
        : '30d Network Health Trend';

  return (
    <div
      className={`omada-emulator-dashboard min-h-full p-6 ${className}`.trim()}
      data-testid="site-dashboard-page"
    >
      {/* Top Control Row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Capsule Main Tabs */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="inline-flex h-[34px] items-center gap-0.5 rounded-[4px] bg-[var(--omada-dash-track)] p-[3px]"
        >
          {MAIN_TABS.map((tab) => {
            const isActive = mainTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMainTab(tab.key)}
                className={`inline-flex h-[28px] cursor-pointer items-center gap-1.5 rounded-[2px] border-0 px-3 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-[var(--omada-dash-capsule-active)] font-medium text-white'
                    : 'bg-transparent font-normal text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                }`}
              >
                <SIcon name={tab.icon} size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timestamp & Time Range Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="tabular-nums text-[14px] text-[var(--omada-text-tertiary)]">
            {customWindowLabel ?? DASHBOARD_TIMESTAMP}
          </span>
          <div
            role="group"
            aria-label="Time range selector"
            className="inline-flex h-[32px] items-center rounded-[4px] bg-[var(--omada-dash-track)] p-[3px]"
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
                    setCustomWindowLabel(null);
                  }}
                  className={`inline-flex h-[26px] cursor-pointer items-center justify-center rounded-[2px] border-0 px-2.5 text-[12px] transition-colors ${
                    isActive
                      ? 'bg-[var(--omada-dash-pill-active)] font-medium text-[var(--omada-dash-pill-text-active)] shadow-2xs'
                      : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                  }`}
                >
                  {rangeKey}
                </button>
              );
            })}
            <span
              className="mx-1 h-3.5 w-px bg-[var(--omada-dash-card-border)]"
              aria-hidden="true"
            />
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  { key: 'Sep 19, 2025 (Last 24h)', label: 'Sep 19, 2025 (Last 24h)' },
                  { key: 'Sep 13 - Sep 19, 2025', label: 'Sep 13 - Sep 19, 2025' },
                  { key: 'Aug 21 - Sep 19, 2025', label: 'Aug 21 - Sep 19, 2025' },
                ],
                onClick: ({ key }) => {
                  if (key.includes('24h')) {
                    setTimeRange('1D');
                    setCustomWindowLabel(null);
                  } else if (key.includes('13')) {
                    setTimeRange('1W');
                    setCustomWindowLabel(key);
                  } else {
                    setTimeRange('1M');
                    setCustomWindowLabel(key);
                  }
                },
              }}
            >
              <button
                type="button"
                aria-label="Custom date range"
                className="inline-flex h-[26px] w-[28px] cursor-pointer items-center justify-center rounded-[2px] border-0 bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]"
              >
                <SIcon name="icon-46146-123043" size={15} />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {mainTab === 'overview' ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {/* Left Column (318px fixed on desktop) */}
          <div className="omada-dash-card flex w-full shrink-0 flex-col px-3 py-4 lg:w-[318px]">
            {/* Section A: Emergency Free Wi-Fi + Health Gauge + Health Radar */}
            <div>
              <div className="mb-3 flex h-[40px] items-center justify-between rounded-[6px] bg-[var(--omada-dash-surface-subtle)] px-3">
                <div className="flex items-center gap-2.5">
                  <EmergencyWifiBadge />
                  <span className="text-[14px] font-medium text-[var(--omada-text-primary)]">
                    Emergency Free Wi-Fi
                  </span>
                </div>
                <SSwitch
                  size="medium"
                  checked={emergencyWifi}
                  onChange={handleEmergencyToggle}
                  aria-label="Emergency Free Wi-Fi"
                />
              </div>

              <SHealthGauge score={DASHBOARD_HEALTH_SCORES.overall} />

              <SHealthRadar
                wifi={DASHBOARD_HEALTH_SCORES.wifi}
                client={DASHBOARD_HEALTH_SCORES.client}
                wan={DASHBOARD_HEALTH_SCORES.wan}
                device={DASHBOARD_HEALTH_SCORES.device}
                className="mt-1"
              />
            </div>

            <div className="my-3.5 border-t border-[var(--omada-dash-card-border)]" />

            {/* Section B: Gateway Details */}
            <div>
              <div className="mb-2.5 flex items-center gap-1.5 text-[13px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--omada-brand-hover)]"
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap text-[var(--omada-text-primary)]">
                  Gateway Name:
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDeviceByName?.(DASHBOARD_GATEWAY.name)}
                  className="min-w-0 cursor-pointer truncate border-0 bg-transparent p-0 text-left text-[13px] text-[var(--omada-dash-link)] hover:underline"
                >
                  {DASHBOARD_GATEWAY.name}
                </button>
              </div>

              {/* WAN Port Selector */}
              <div
                role="tablist"
                aria-label="Gateway WAN ports"
                className="mb-2.5 grid grid-cols-2 rounded-[4px] bg-[var(--omada-dash-track)] p-[3px]"
              >
                {DASHBOARD_GATEWAY.wanPorts.map((port) => {
                  const isActive = port.key === activeWan.key;
                  return (
                    <button
                      key={port.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      title={port.label}
                      onClick={() => setActiveWanKey(port.key)}
                      className={`inline-flex h-[28px] min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border-0 px-2 text-[12px] transition-colors ${
                        isActive
                          ? 'bg-[var(--omada-dash-pill-active)] font-medium text-[var(--omada-dash-pill-text-active)] shadow-2xs'
                          : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--omada-brand-hover)]"
                        aria-hidden="true"
                      />
                      <span className="truncate">{port.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Throughput & WAN IP Box */}
              <div className="mb-3 flex flex-col gap-2 rounded-[6px] bg-[var(--omada-dash-surface-subtle)] px-3 py-2.5 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setMainTab('traffic')}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[var(--omada-dash-link)] hover:underline"
                  >
                    Throughput
                  </button>
                  <div className="tabular-nums flex items-center gap-2.5 text-[var(--omada-text-primary)]">
                    <span className="inline-flex items-center gap-0.5">
                      <span style={{ color: 'var(--omada-color-magenta)' }}>↓</span>
                      <span>{activeWan.downRate}</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <span style={{ color: 'var(--omada-dash-link)' }}>↑</span>
                      <span>{activeWan.upRate}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--omada-text-secondary)]">WAN IP:</span>
                  <span className="tabular-nums text-[var(--omada-text-primary)]">
                    {activeWan.wanIp}
                  </span>
                </div>
              </div>

              {/* Speed Test Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeedTest}
                  disabled={runningSpeedTest}
                  className="inline-flex h-[32px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-[var(--omada-dash-card-border)] bg-transparent text-[13px] transition-colors hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)] disabled:cursor-wait"
                  style={{ color: 'var(--omada-dash-speed-btn-text)' }}
                >
                  <SIcon name="real-time-data" size={15} />
                  <span>{runningSpeedTest ? 'Testing...' : 'Speed Test'}</span>
                </button>
                <STooltip title="Speed Test History">
                  <button
                    type="button"
                    aria-label="Speed Test History"
                    onClick={() =>
                      notification.info({
                        title: 'Speed Test History',
                        description: 'No scheduled WAN speed tests recorded in the last 24 hours.',
                      })
                    }
                    className="inline-flex h-[32px] w-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent text-[var(--omada-brand-text)] hover:bg-[var(--omada-brand-bg-subtlest)]"
                  >
                    <SIcon name="history" size={16} />
                  </button>
                </STooltip>
              </div>
            </div>

            <div className="my-3.5 border-t border-[var(--omada-dash-card-border)]" />

            {/* Section C: Pending Alerts */}
            <div className="flex flex-1 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="omada-dash-title">Pending Alerts</span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('logs')}
                  className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[var(--omada-text-primary)] hover:text-[var(--omada-brand-text)]"
                >
                  <span className="tabular-nums text-[22px] font-normal leading-none">0</span>
                  <SIcon name="arrow-right" size={14} className="text-[var(--omada-text-tertiary)]" />
                </button>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
                <SIllustration name="no-data" width={142} alt="No Pending Alerts" />
                <span className="mt-1 text-[13px] text-[var(--omada-text-tertiary)]">
                  No Pending Alerts.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 stacked cards) */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* 1. 24h Network Health Trend */}
            <section className="omada-dash-card px-4 py-3.5">
              <div className="mb-3 flex items-center gap-1.5">
                <h2 className="omada-dash-title m-0">{trendTitle}</h2>
                <STooltip title="Aggregated 15-minute health snapshots across Device, Client, Wi-Fi, and WAN.">
                  <button
                    type="button"
                    aria-label="Network health trend info"
                    className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                  >
                    <SIcon name="info" size={16} />
                  </button>
                </STooltip>
              </div>
              <SHealthTrendBar rows={healthTrendRows} tickLabels={activityDataset.timestamps} />
            </section>

            {/* 2. 3-Column Overview Strip */}
            <section className="omada-dash-card px-4 py-4">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,0.96fr)_minmax(0,1.06fr)]">
                {/* Network Overview */}
                <div className="min-w-0">
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <h2 className="omada-dash-title m-0 truncate">Network Overview</h2>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('devices')}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] text-[var(--omada-text-tertiary)] hover:text-[var(--omada-brand-text)]"
                    >
                      <span>More</span>
                      <SIcon name="arrow-right" size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-center">
                    {NETWORK_OVERVIEW_ITEMS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onNavigate?.(item.routeKey)}
                        className="flex min-w-0 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0.5 transition-opacity hover:opacity-80"
                      >
                        <SIcon name={item.icon} size={28} />
                        <span
                          className="w-full truncate text-[11px] leading-4 text-[var(--omada-text-secondary)]"
                          title={item.label}
                        >
                          {item.label}
                        </span>
                        <span className="tabular-nums text-[13px] font-medium leading-4 text-[var(--omada-text-primary)]">
                          {item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top 5 Clients by Traffic */}
                <div className="min-w-0">
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <h2 className="omada-dash-title m-0 truncate">Top 5 Clients by Traffic</h2>
                    <button
                      type="button"
                      onClick={() => setMainTab('clients')}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] text-[var(--omada-text-tertiary)] hover:text-[var(--omada-brand-text)]"
                    >
                      <span>More</span>
                      <SIcon name="arrow-right" size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {TOP_CLIENTS_BY_TRAFFIC.map((client) => (
                      <div
                        key={client.key}
                        title={`${client.name} (${client.traffic})`}
                        className="flex min-w-0 flex-col items-center gap-1 p-0.5"
                      >
                        <SClientIcon
                          name={client.clientIcon}
                          size={26}
                          theme={client.forceLightIcon ? 'light' : 'auto'}
                          alt={client.name}
                        />
                        <span className="w-full truncate text-[11px] leading-4 text-[var(--omada-text-primary)]">
                          {client.name}
                        </span>
                        <span className="tabular-nums whitespace-nowrap text-[11px] leading-4 text-[var(--omada-text-tertiary)]">
                          {client.traffic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Apps by Traffic */}
                <div className="min-w-0">
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <h2 className="omada-dash-title m-0 truncate">Top 5 Apps by Traffic</h2>
                    <button
                      type="button"
                      onClick={() => setMainTab('traffic')}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-[12px] text-[var(--omada-text-tertiary)] hover:text-[var(--omada-brand-text)]"
                    >
                      <span>More</span>
                      <SIcon name="arrow-right" size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {TOP_APPS_BY_TRAFFIC.map((app) => (
                      <div
                        key={app.key}
                        title={`${app.name} (${app.traffic})`}
                        className="flex min-w-0 flex-col items-center gap-1 p-0.5"
                      >
                        <AppBadgeIcon badgeKey={app.badgeKey} />
                        <span className="w-full truncate text-[11px] leading-4 text-[var(--omada-text-primary)]">
                          {app.name}
                        </span>
                        <span className="tabular-nums w-full truncate text-[11px] leading-4 text-[var(--omada-text-tertiary)]">
                          {app.traffic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Activity Dual-Axis Combo Chart */}
            <section className="omada-dash-card px-4 py-3.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="omada-dash-title m-0">Activity</h2>
                  <div
                    role="tablist"
                    aria-label="Activity view"
                    className="inline-flex h-[28px] items-center rounded-[4px] bg-[var(--omada-dash-track)] p-[2px]"
                  >
                    {ACTIVITY_SUB_TABS.map((sub) => {
                      const isActive = activityMode === sub.key;
                      return (
                        <button
                          key={sub.key}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActivityMode(sub.key)}
                          className={`inline-flex h-[24px] cursor-pointer items-center rounded-[2px] border-0 px-2.5 text-[12px] transition-colors ${
                            isActive
                              ? 'bg-[var(--omada-dash-pill-active)] font-medium text-[var(--omada-dash-pill-text-active)] shadow-2xs'
                              : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Legends */}
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--omada-text-secondary)]">
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        { key: 'all', label: 'All Activity (Upload & Download)' },
                        { key: 'download', label: 'Download Only' },
                        { key: 'upload', label: 'Upload Only' },
                      ],
                      selectedKeys: [activityMetricFilter],
                      onClick: ({ key }) =>
                        setActivityMetricFilter(key as 'all' | 'upload' | 'download'),
                    }}
                  >
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[12px] text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]"
                    >
                      <span
                        className="inline-flex h-[8px] w-[8px] flex-col overflow-hidden rounded-[1px]"
                        aria-hidden="true"
                      >
                        <span
                          className="h-1/2 w-full"
                          style={{ backgroundColor: 'var(--omada-dash-link)' }}
                        />
                        <span className="h-1/2 w-full" style={{ backgroundColor: '#F476FF' }} />
                      </span>
                      <span className="tabular-nums">{activityDataset.totalLabel}</span>
                      <SIcon name="icon-icon-tabler-icon-chevron-down" size={12} />
                    </button>
                  </Dropdown>

                  <span
                    className="h-3 w-px bg-[var(--omada-dash-card-border)]"
                    aria-hidden="true"
                  />

                  <span className="inline-flex items-center gap-1.5">
                    <span>Clients (</span>
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="inline-block h-[8px] w-[8px] rounded-[1px]"
                        style={{ backgroundColor: 'rgba(0, 105, 203, 0.35)' }}
                        aria-hidden="true"
                      />
                      <span>Wired</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="inline-block h-[8px] w-[8px] rounded-[1px]"
                        style={{ backgroundColor: 'rgba(0, 168, 112, 0.35)' }}
                        aria-hidden="true"
                      />
                      <span>Wireless</span>
                    </span>
                    <span>)</span>
                  </span>
                </div>
              </div>

              <SChart option={activityOption} height={180} />
            </section>

            {/* 4. AP Distribution */}
            <section className="omada-dash-card px-4 py-3.5">
              <div className="mb-2 flex items-center gap-1.5">
                <h2 className="omada-dash-title m-0">AP Distribution</h2>
                <STooltip title="Distribution of adopted APs by average wireless signal strength (dBm).">
                  <button
                    type="button"
                    aria-label="AP Distribution info"
                    className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                  >
                    <SIcon name="info" size={16} />
                  </button>
                </STooltip>
              </div>
              <SApDistributionRuler clusters={AP_DISTRIBUTION_CLUSTERS} />
            </section>

            {/* 5. Channel Utilization */}
            <section className="omada-dash-card px-4 py-3.5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="omada-dash-title m-0">Channel Utilization</h2>
                <div className="flex items-center gap-3 text-[12px] text-[var(--omada-text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-[var(--omada-brand-hover)]" />
                    <span>Low</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-[var(--omada-color-warning)]" />
                    <span>Medium</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-[2px] bg-[var(--omada-color-error)]" />
                    <span>High</span>
                  </span>
                </div>
              </div>
              <SChannelUtilization bands={CHANNEL_UTILIZATION_BANDS} />
            </section>
          </div>
        </div>
      ) : (
        <DashboardSecondaryTabView
          tab={mainTab}
          onBackToOverview={() => setMainTab('overview')}
          onOpenDeviceByName={onOpenDeviceByName}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

interface DashboardSecondaryTabViewProps {
  tab: Exclude<DashboardMainTabKey, 'overview'>;
  onBackToOverview: () => void;
  onOpenDeviceByName?: (name: string) => void;
  onNavigate?: (routeKey: string) => void;
}

const DashboardSecondaryTabView: React.FC<DashboardSecondaryTabViewProps> = ({
  tab,
  onBackToOverview,
  onOpenDeviceByName,
  onNavigate,
}) => {
  if (tab === 'topology') {
    const nodes = [
      { name: 'MainOffice_Gateway_2', role: 'Gateway · ER707-M2 v1.0', status: 'Connected' },
      { name: 'SalesDepartment_Switch_3', role: 'Switch · SG2210MP v5.0', status: 'Connected' },
      { name: 'COOOffice_Eap_1', role: 'AP · EAP650 v1.0', status: 'Connected' },
      { name: 'BreakRoom_Eap_2', role: 'AP · EAP230-Wall v1.0', status: 'Connected' },
      { name: 'StorageRoom_Eap_3', role: 'AP · EAP650 v1.0', status: 'Connected' },
    ];
    return (
      <div className="omada-dash-card p-5" data-testid="dashboard-tab-panel-topology">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="omada-dash-title m-0">Site Topology Summary</h2>
            <p className="mt-1 mb-0 text-[13px] text-[var(--omada-text-secondary)]">
              Hierarchical uplink path from Main Office Floor gateway to switches and wireless APs.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToOverview}
            className="cursor-pointer rounded-[4px] border border-[var(--omada-dash-card-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--omada-text-secondary)] hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)]"
          >
            Back to Overview
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {nodes.map((node) => (
            <button
              key={node.name}
              type="button"
              onClick={() => onOpenDeviceByName?.(node.name)}
              className="omada-dash-card flex cursor-pointer items-center justify-between p-3.5 text-left transition-colors hover:border-[var(--omada-brand)]"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[var(--omada-dash-link)]">
                  {node.name}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-[var(--omada-text-secondary)]">
                  {node.role}
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-[var(--omada-brand-text)]">
                <span className="h-2 w-2 rounded-full bg-[var(--omada-brand-hover)]" />
                {node.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'wifi') {
    return (
      <div className="flex flex-col gap-4" data-testid="dashboard-tab-panel-wifi">
        <div className="omada-dash-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="omada-dash-title m-0">AP Signal Distribution & Channels</h2>
            <button
              type="button"
              onClick={onBackToOverview}
              className="cursor-pointer rounded-[4px] border border-[var(--omada-dash-card-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--omada-text-secondary)] hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)]"
            >
              Back to Overview
            </button>
          </div>
          <SApDistributionRuler clusters={AP_DISTRIBUTION_CLUSTERS} />
        </div>
        <div className="omada-dash-card p-5">
          <h3 className="omada-dash-title m-0 mb-3">Channel Utilization</h3>
          <SChannelUtilization bands={CHANNEL_UTILIZATION_BANDS} />
        </div>
      </div>
    );
  }

  if (tab === 'clients') {
    return (
      <div className="omada-dash-card p-5" data-testid="dashboard-tab-panel-clients">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="omada-dash-title m-0">Active Clients (4)</h2>
            <p className="mt-1 mb-0 text-[13px] text-[var(--omada-text-secondary)]">
              Top clients sorted by cumulative traffic over the selected time window.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('clients')}
            className="cursor-pointer rounded-[4px] border border-[var(--omada-dash-card-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--omada-brand-text)] hover:border-[var(--omada-brand)]"
          >
            Open Clients Page
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {TOP_CLIENTS_BY_TRAFFIC.map((client) => (
            <div
              key={client.key}
              className="omada-dash-card flex items-center justify-between p-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <SClientIcon
                  name={client.clientIcon}
                  size={30}
                  theme={client.forceLightIcon ? 'light' : 'auto'}
                  alt={client.name}
                />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-[var(--omada-text-primary)]">
                    {client.name}
                  </div>
                  <div className="truncate text-[12px] text-[var(--omada-text-tertiary)]">
                    {client.mac} · {client.ssidOrVlan}
                  </div>
                </div>
              </div>
              <span className="tabular-nums shrink-0 text-[13px] font-medium text-[var(--omada-text-primary)]">
                {client.traffic}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="omada-dash-card p-5" data-testid="dashboard-tab-panel-traffic">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="omada-dash-title m-0">Top Applications by Traffic</h2>
          <p className="mt-1 mb-0 text-[13px] text-[var(--omada-text-secondary)]">
            Deep Packet Inspection (DPI) traffic breakdown across site WAN interfaces.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToOverview}
          className="cursor-pointer rounded-[4px] border border-[var(--omada-dash-card-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--omada-text-secondary)] hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)]"
        >
          Back to Overview
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TOP_APPS_BY_TRAFFIC.map((app) => (
          <div key={app.key} className="omada-dash-card flex items-center justify-between p-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <AppBadgeIcon badgeKey={app.badgeKey} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[var(--omada-text-primary)]">
                  {app.name}
                </div>
                <div className="text-[12px] text-[var(--omada-text-tertiary)]">{app.category}</div>
              </div>
            </div>
            <span className="tabular-nums shrink-0 text-[13px] font-medium text-[var(--omada-text-primary)]">
              {app.traffic}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
