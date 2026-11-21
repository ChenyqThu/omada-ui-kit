import React, { useMemo, useState } from 'react';
import { App, Dropdown, Table, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { EChartsOption } from 'echarts';
import { Broom } from 'lucide-react';
import {
  SButton,
  SChart,
  SClientIcon,
  SEmpty,
  SIcon,
  SModal,
  STag,
  useOmadaTheme,
  omadaChartPalette,
} from '@/omada';
import {
  SDonutSummaryCard,
  type SDonutSummaryItem,
} from '../../../omada/components/SDonutSummaryCard';
import {
  ANALYTICS_APPS,
  ANALYTICS_CATEGORIES,
  ANALYTICS_DATE_PRESETS,
  ANALYTICS_USERS,
  APP_BADGE_VISUALS,
  formatTrafficBytes,
  formatTrafficPercent,
  type AnalyticsAppBadgeKey,
  type AnalyticsAppItem,
  type AnalyticsUserItem,
} from './insightsData';

export interface ApplicationAnalyticsPageProps {
  /** Optional callback when clicking a client/user row to open its drawer. */
  onOpenClientByName?: (clientName: string) => void;
  className?: string;
}

type AnalyticsSubTabKey = 'categories' | 'apps' | 'users';
type AppsFilterKey = 'allowed' | 'blocked';

const AppBrandBadge: React.FC<{ badgeKey: AnalyticsAppBadgeKey; size?: number }> = ({
  badgeKey,
  size = 22,
}) => {
  const visual = APP_BADGE_VISUALS[badgeKey];
  const radiusClass = size <= 18 ? 'rounded-[4px]' : 'rounded-[6px]';

  const renderGlyph = () => {
    switch (badgeKey) {
      case 'windows-store':
        return (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="1.5" width="4.8" height="4.8" rx="0.6" fill={visual.fgColor} />
            <rect x="7.7" y="1.5" width="4.8" height="4.8" rx="0.6" fill={visual.fgColor} />
            <rect x="1.5" y="7.7" width="4.8" height="4.8" rx="0.6" fill={visual.fgColor} />
            <rect x="7.7" y="7.7" width="4.8" height="4.8" rx="0.6" fill={visual.fgColor} />
          </svg>
        );
      case 'heytap':
        return (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 12L6.5 4.5L9.5 9.8L11.2 7L13.8 12H2.5Z" fill={visual.fgColor} />
          </svg>
        );
      case 'xiaohongshu':
        return (
          <span
            className="text-[7px] font-bold tracking-tighter"
            style={{ color: visual.fgColor }}
          >
            RED
          </span>
        );
      case 'netease':
        return (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5" stroke={visual.fgColor} strokeWidth="2" />
            <circle cx="8" cy="8" r="1.6" fill={visual.fgColor} />
          </svg>
        );
      case 'qq':
        return (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="7.5" r="4.5" fill={visual.fgColor} />
            <rect x="4" y="9" width="8" height="2" rx="1" fill={visual.accentColor ?? visual.fgColor} />
          </svg>
        );
      case 'teams':
        return (
          <span className="text-[11px] font-bold" style={{ color: visual.fgColor }}>
            T
          </span>
        );
      case 'apple-push':
        return (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3.2C5.4 3.2 3.4 5.2 3.4 7.8C3.4 10.7 5.3 12.8 8 12.8C10.7 12.8 12.6 10.7 12.6 7.8C12.6 5.2 10.6 3.2 8 3.2Z"
              stroke={visual.fgColor}
              strokeWidth="1.6"
            />
            <circle cx="8" cy="7.8" r="1.5" fill={visual.fgColor} />
          </svg>
        );
      case 'slack':
        return (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="5.2" width="10" height="1.6" rx="0.8" fill={visual.fgColor} />
            <rect x="3" y="9.2" width="10" height="1.6" rx="0.8" fill={visual.fgColor} />
            <rect x="5.2" y="3" width="1.6" height="10" rx="0.8" fill={visual.fgColor} />
            <rect x="9.2" y="3" width="1.6" height="10" rx="0.8" fill={visual.fgColor} />
          </svg>
        );
      case 'zoom':
        return (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="2.2" y="4.5" width="8" height="7" rx="1.6" fill={visual.fgColor} />
            <path d="M10.8 6.8L13.8 5V11L10.8 9.2V6.8Z" fill={visual.fgColor} />
          </svg>
        );
      case 'google-services':
        return (
          <span className="text-[11px] font-bold" style={{ color: visual.fgColor }}>
            G
          </span>
        );
    }
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${radiusClass}`}
      style={{
        width: size,
        height: size,
        backgroundColor: visual.bgColor,
      }}
    >
      {renderGlyph()}
    </span>
  );
};

/**
 * Omada Controller v6.3.0.34 Insights -> Application Analytics page (`#/statistics`).
 * Replicates the Overview hero donut + 20-category interactive selector grid,
 * `Categories` closable donut summary cards, `Apps` Allow/Block table, and `Users` traffic summary.
 */
export const ApplicationAnalyticsPage: React.FC<ApplicationAnalyticsPageProps> = ({
  onOpenClientByName,
  className = '',
}) => {
  const { notification } = App.useApp();
  const { resolvedTheme, tokens } = useOmadaTheme();
  const palette = omadaChartPalette[resolvedTheme];

  const [datePresetKey, setDatePresetKey] = useState<string>(ANALYTICS_DATE_PRESETS[0].key);
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState<string[]>(() =>
    ANALYTICS_CATEGORIES.filter((c) => c.defaultSelected).map((c) => c.key),
  );
  const [subTab, setSubTab] = useState<AnalyticsSubTabKey>('categories');
  const [appsFilter, setAppsFilter] = useState<AppsFilterKey>('allowed');
  const [appsState, setAppsState] = useState<AnalyticsAppItem[]>(ANALYTICS_APPS);
  const [inspectedAppKey, setInspectedAppKey] = useState<string | null>(null);

  const activePreset =
    ANALYTICS_DATE_PRESETS.find((p) => p.key === datePresetKey) ?? ANALYTICS_DATE_PRESETS[0];

  const selectedKeySet = useMemo(
    () => new Set(selectedCategoryKeys),
    [selectedCategoryKeys],
  );

  const scaledCategories = useMemo(
    () =>
      ANALYTICS_CATEGORIES.map((cat) => ({
        ...cat,
        scaledBytes: Math.round(cat.bytes * activePreset.scaleFactor),
        color: palette[cat.paletteIndex % palette.length],
      })),
    [activePreset.scaleFactor, palette],
  );

  const selectedCategories = useMemo(
    () => scaledCategories.filter((cat) => selectedKeySet.has(cat.key)),
    [scaledCategories, selectedKeySet],
  );

  const selectedTotalBytes = useMemo(
    () => selectedCategories.reduce((sum, cat) => sum + cat.scaledBytes, 0),
    [selectedCategories],
  );

  const toggleCategory = (key: string) => {
    setSelectedCategoryKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleClearCategories = () => {
    setSelectedCategoryKeys([]);
  };

  const handleRestoreDefaults = () => {
    setSelectedCategoryKeys(
      ANALYTICS_CATEGORIES.filter((c) => c.defaultSelected).map((c) => c.key),
    );
  };

  const surfaceBg = resolvedTheme === 'dark' ? tokens.bgOverlay : tokens.bgSurface;

  const heroDonutOption = useMemo<EChartsOption>(() => {
    const positive = selectedCategories.filter((c) => c.scaledBytes > 0);
    const hasData = positive.length > 0;
    return {
      animation: false,
      tooltip: hasData
        ? {
            trigger: 'item',
            confine: true,
            formatter: (params: unknown) => {
              const p = params as { name?: string; percent?: number };
              return `${p.name ?? ''}: ${p.percent ?? 0}%`;
            },
          }
        : { show: false },
      series: [
        {
          type: 'pie',
          radius: ['72%', '90%'],
          center: ['50%', '50%'],
          silent: !hasData,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: hasData, scaleSize: 3 },
          itemStyle: {
            borderColor: surfaceBg,
            borderWidth: positive.length > 1 ? 1.5 : 0,
          },
          data: hasData
            ? positive.map((cat) => ({
                name: cat.name,
                value: cat.scaledBytes,
                itemStyle: { color: cat.color },
              }))
            : [
                {
                  name: 'No Categories Selected',
                  value: 1,
                  itemStyle: { color: tokens.borderDivider, borderWidth: 0 },
                },
              ],
        },
      ],
    };
  }, [selectedCategories, surfaceBg, tokens.borderDivider]);

  const dateMenuItems: MenuProps['items'] = ANALYTICS_DATE_PRESETS.map((preset) => ({
    key: preset.key,
    label: preset.label,
    onClick: () => setDatePresetKey(preset.key),
  }));

  const allowedApps = useMemo(
    () => appsState.filter((app) => app.status === 'allowed'),
    [appsState],
  );
  const blockedApps = useMemo(
    () => appsState.filter((app) => app.status === 'blocked'),
    [appsState],
  );

  const visibleApps = appsFilter === 'allowed' ? allowedApps : blockedApps;
  const inspectedApp = useMemo(
    () => appsState.find((a) => a.key === inspectedAppKey) ?? null,
    [appsState, inspectedAppKey],
  );

  const handleToggleAppBlock = (app: AnalyticsAppItem) => {
    const nextStatus: AnalyticsAppItem['status'] =
      app.status === 'allowed' ? 'blocked' : 'allowed';
    setAppsState((prev) =>
      prev.map((item) =>
        item.key === app.key ? { ...item, status: nextStatus } : item,
      ),
    );
    notification[nextStatus === 'blocked' ? 'warning' : 'success']({
      title: nextStatus === 'blocked' ? 'Application Blocked' : 'Application Allowed',
      description: `${app.name} moved to ${
        nextStatus === 'blocked' ? 'Block Apps' : 'Allow Apps'
      }.`,
    });
  };

  const appColumns: ColumnsType<AnalyticsAppItem> = [
    {
      title: '',
      key: 'badge',
      width: 56,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <AppBrandBadge badgeKey={record.badgeKey} size={22} />
        </div>
      ),
    },
    {
      title: 'App Name',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name: string, record) => (
        <button
          type="button"
          onClick={() => setInspectedAppKey(record.key)}
          className="cursor-pointer border-0 bg-transparent p-0 text-left text-[14px] text-[var(--omada-text-primary)] underline underline-offset-2 hover:text-[var(--omada-brand-text)]"
        >
          {name}
        </button>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 290,
      render: (categoryName: string, record) => (
        <span className="inline-flex items-center gap-2 text-[14px] text-[var(--omada-text-primary)]">
          <SIcon
            name={record.categoryIcon}
            size={15}
            className="text-[var(--omada-text-secondary)]"
          />
          <span>{categoryName}</span>
        </span>
      ),
    },
    {
      title: 'Up',
      dataIndex: 'upBytes',
      key: 'upBytes',
      width: 150,
      render: (upBytes: number) => (
        <span className="tabular-nums inline-flex items-center gap-1 text-[14px] text-[var(--omada-text-primary)]">
          <span style={{ color: 'var(--omada-link)' }}>↑</span>
          <span>{formatTrafficBytes(Math.round(upBytes * activePreset.scaleFactor))}</span>
        </span>
      ),
    },
    {
      title: 'Down',
      dataIndex: 'downBytes',
      key: 'downBytes',
      width: 150,
      render: (downBytes: number) => (
        <span className="tabular-nums inline-flex items-center gap-1 text-[14px] text-[var(--omada-text-primary)]">
          <span style={{ color: 'var(--omada-color-magenta)' }}>↓</span>
          <span>{formatTrafficBytes(Math.round(downBytes * activePreset.scaleFactor))}</span>
        </span>
      ),
    },
    {
      title: 'Active Users',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
      width: 140,
      render: (count: number) => (
        <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
          {count}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <button
          type="button"
          aria-label={`Inspect ${record.name}`}
          onClick={() => setInspectedAppKey(record.key)}
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent transition-colors hover:bg-[var(--omada-brand-bg-subtlest)]"
        >
          <SIcon name="detail" size={16} />
        </button>
      ),
    },
  ];

  const userColumns: ColumnsType<AnalyticsUserItem> = [
    {
      title: 'Client Name',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name: string, record) => (
        <div className="flex items-center gap-2.5">
          <SClientIcon
            name={record.clientIcon}
            size={22}
            theme={record.forceLightIcon ? 'light' : 'auto'}
            alt={name}
          />
          {onOpenClientByName ? (
            <button
              type="button"
              onClick={() => onOpenClientByName(name)}
              className="cursor-pointer border-0 bg-transparent p-0 text-[14px] font-medium text-[var(--omada-link)] hover:underline"
            >
              {name}
            </button>
          ) : (
            <span className="text-[14px] font-medium text-[var(--omada-text-primary)]">
              {name}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
      render: (ip: string) => (
        <span className="tabular-nums text-[14px] text-[var(--omada-text-primary)]">
          {ip}
        </span>
      ),
    },
    {
      title: 'MAC Address',
      dataIndex: 'mac',
      key: 'mac',
      width: 185,
      render: (mac: string) => (
        <span className="tabular-nums text-[14px] text-[var(--omada-text-secondary)]">
          {mac}
        </span>
      ),
    },
    {
      title: 'Network / SSID',
      dataIndex: 'network',
      key: 'network',
      width: 180,
    },
    {
      title: 'Up',
      dataIndex: 'upBytes',
      key: 'upBytes',
      width: 130,
      render: (upBytes: number) => (
        <span className="tabular-nums inline-flex items-center gap-1">
          <span style={{ color: 'var(--omada-link)' }}>↑</span>
          <span>{formatTrafficBytes(Math.round(upBytes * activePreset.scaleFactor))}</span>
        </span>
      ),
    },
    {
      title: 'Down',
      dataIndex: 'downBytes',
      key: 'downBytes',
      width: 130,
      render: (downBytes: number) => (
        <span className="tabular-nums inline-flex items-center gap-1">
          <span style={{ color: 'var(--omada-color-magenta)' }}>↓</span>
          <span>{formatTrafficBytes(Math.round(downBytes * activePreset.scaleFactor))}</span>
        </span>
      ),
    },
    {
      title: 'Total Traffic',
      key: 'total',
      width: 140,
      render: (_, record) => (
        <span className="tabular-nums font-medium text-[var(--omada-text-primary)]">
          {formatTrafficBytes(
            Math.round((record.upBytes + record.downBytes) * activePreset.scaleFactor),
          )}
        </span>
      ),
    },
    {
      title: 'Top Application',
      dataIndex: 'topApp',
      key: 'topApp',
      width: 160,
    },
  ];

  return (
    <div
      data-testid="application-analytics-page"
      className={`omada-emulator-insights min-h-full px-6 pt-4 pb-6 ${className}`.trim()}
    >
      {/* Top Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="m-0 text-[18px] font-medium leading-[26px] text-[var(--omada-text-primary)]">
            Overview
          </h1>
          <Dropdown
            menu={{ items: dateMenuItems, selectedKeys: [datePresetKey] }}
            trigger={['click']}
          >
            <button
              type="button"
              aria-label="Select analytics date range"
              className="omada-insights-date-pill min-w-[295px] cursor-pointer"
            >
              <span className="tabular-nums">{activePreset.label}</span>
              <SIcon
                name="icon-46146-123043"
                size={15}
                className="shrink-0 text-[var(--omada-text-secondary)]"
              />
            </button>
          </Dropdown>
        </div>

        <button
          type="button"
          onClick={handleClearCategories}
          className="omada-insights-ghost-action"
        >
          <Broom size={15} />
          <span>Clear Categories</span>
        </button>
      </div>

      {/* Hero Summary Row: 230x230 Donut + 2-Column 20-Category Selector Grid */}
      <div className="mb-6 flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10 lg:pr-8">
        <div className="relative h-[230px] w-[230px] shrink-0 lg:ml-6">
          <SChart option={heroDonutOption} height={230} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span
              data-testid="analytics-hero-total"
              className="tabular-nums text-[22px] font-semibold leading-[28px] text-[var(--omada-text-primary)]"
            >
              {formatTrafficBytes(selectedTotalBytes)}
            </span>
            <span className="mt-0.5 text-[12px] leading-[16px] text-[var(--omada-text-tertiary)]">
              Traffic
            </span>
          </div>
        </div>

        <div
          role="group"
          aria-label="Application categories"
          className="grid w-full min-w-0 flex-1 grid-cols-1 gap-x-10 gap-y-1.5 sm:grid-cols-2"
        >
          {scaledCategories.map((cat) => {
            const isSelected = selectedKeySet.has(cat.key);
            const pct = formatTrafficPercent(cat.scaledBytes, selectedTotalBytes);
            const showPercent = isSelected && (selectedTotalBytes > 0 || cat.showZeroPercent);
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={isSelected}
                data-category-key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className="omada-insights-cat-row flex h-[28px] min-w-0 cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-1.5 text-left"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border-[1.5px]"
                    style={{
                      borderColor: isSelected ? cat.color : 'var(--omada-border-strong)',
                    }}
                  >
                    {isSelected && (
                      <span
                        className="h-[6px] w-[6px] rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </span>
                  <SIcon
                    name={cat.icon}
                    size={15}
                    className="shrink-0 text-[var(--omada-text-secondary)]"
                  />
                  <span
                    title={cat.name}
                    className="truncate text-[13px] leading-[20px] text-[var(--omada-text-primary)]"
                  >
                    {cat.name}
                  </span>
                </div>

                <span className="tabular-nums shrink-0 whitespace-nowrap text-[13px] leading-[20px]">
                  <span className="text-[var(--omada-text-primary)]">
                    {formatTrafficBytes(cat.scaledBytes)}
                  </span>
                  {showPercent && (
                    <span className="text-[var(--omada-text-tertiary)]"> ({pct}%)</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Underline Sub-Tabs: Categories | Apps | Users */}
      <div
        role="tablist"
        aria-label="Application analytics views"
        className="mb-4 flex items-center gap-7 border-b border-[var(--omada-border-divider)]"
      >
        {(
          [
            { key: 'categories', label: 'Categories' },
            { key: 'apps', label: 'Apps' },
            { key: 'users', label: 'Users' },
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
              className={`omada-insights-tab-btn cursor-pointer border-0 bg-transparent px-0 pb-2.5 text-[16px] leading-[24px] ${
                isActive ? 'is-active font-medium' : 'font-normal'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="omada-insights-tab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Categories Closable Cards */}
      {subTab === 'categories' && (
        selectedCategories.length > 0 ? (
          <div
            data-testid="analytics-categories-grid"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {selectedCategories.map((cat) => {
              const items: SDonutSummaryItem[] = cat.topApps.map((app, idx) => {
                const scaledAppBytes = Math.round(app.bytes * activePreset.scaleFactor);
                const sliceColor =
                  idx === 0
                    ? cat.color
                    : palette[(cat.paletteIndex + idx + 1) % palette.length];
                return {
                  key: app.key,
                  label: app.name,
                  value: scaledAppBytes,
                  displayValue: formatTrafficBytes(scaledAppBytes),
                  color: sliceColor,
                  icon: app.iconKey ? (
                    <AppBrandBadge badgeKey={app.iconKey} size={18} />
                  ) : undefined,
                  clickable: Boolean(app.iconKey),
                };
              });

              return (
                <SDonutSummaryCard
                  key={cat.key}
                  data-testid={`category-card-${cat.key}`}
                  title={cat.name}
                  titleIcon={<SIcon name={cat.icon} size={16} />}
                  centerValue={formatTrafficBytes(cat.scaledBytes)}
                  centerLabel="Traffic"
                  data={items}
                  layout="vertical"
                  donutSize={156}
                  closable
                  closeAriaLabel={`Remove ${cat.name}`}
                  onClose={() => toggleCategory(cat.key)}
                  onItemClick={(item) => {
                    const matchedApp = appsState.find((a) => a.key === item.key);
                    if (matchedApp) {
                      setInspectedAppKey(matchedApp.key);
                    }
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="omada-insights-card flex flex-col items-center justify-center py-10">
            <SEmpty
              title="No categories selected"
              description="Click any category row above or restore defaults to inspect per-application traffic."
            />
            <SButton variant="outline" className="mt-2" onClick={handleRestoreDefaults}>
              Restore Default Categories
            </SButton>
          </div>
        )
      )}

      {/* Sub-Tab 2: Apps Allow/Block Table */}
      {subTab === 'apps' && (
        <div data-testid="analytics-apps-panel" className="space-y-3">
          <div
            role="tablist"
            aria-label="App policy filter"
            className="omada-insights-seg-track"
          >
            <button
              type="button"
              role="tab"
              aria-selected={appsFilter === 'allowed'}
              onClick={() => setAppsFilter('allowed')}
              className={`omada-insights-seg-pill ${
                appsFilter === 'allowed' ? 'is-active' : ''
              }`}
            >
              Allow Apps ({allowedApps.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appsFilter === 'blocked'}
              onClick={() => setAppsFilter('blocked')}
              className={`omada-insights-seg-pill ${
                appsFilter === 'blocked' ? 'is-active' : ''
              }`}
            >
              Block Apps ({blockedApps.length})
            </button>
          </div>

          <div className="omada-insights-table-shell">
            <Table<AnalyticsAppItem>
              rowKey="key"
              columns={appColumns}
              dataSource={visibleApps}
              pagination={false}
              scroll={{ x: 960 }}
              locale={{
                emptyText: (
                  <SEmpty
                    title={
                      appsFilter === 'blocked'
                        ? 'No blocked applications'
                        : 'No allowed applications'
                    }
                    description="Applications filtered under this DPI policy rule will appear here."
                  />
                ),
              }}
              className="omada-insights-table"
            />
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Users 4-Client Summary Table */}
      {subTab === 'users' && (
        <div data-testid="analytics-users-panel" className="omada-insights-table-shell">
          <Table<AnalyticsUserItem>
            rowKey="key"
            columns={userColumns}
            dataSource={ANALYTICS_USERS}
            pagination={false}
            scroll={{ x: 1080 }}
            className="omada-insights-table"
          />
        </div>
      )}

      {/* Application Detail Modal */}
      <SModal
        open={Boolean(inspectedApp)}
        title={
          inspectedApp ? (
            <span className="inline-flex items-center gap-2.5">
              <AppBrandBadge badgeKey={inspectedApp.badgeKey} size={22} />
              <span>{inspectedApp.name}</span>
            </span>
          ) : (
            'Application Details'
          )
        }
        subtitle={inspectedApp?.categoryName}
        size="sm"
        destroyOnHidden
        onCancel={() => setInspectedAppKey(null)}
        footer={
          inspectedApp ? (
            <div className="flex items-center justify-end gap-2">
              <SButton
                variant={inspectedApp.status === 'allowed' ? 'danger-outline' : 'outline'}
                onClick={() => handleToggleAppBlock(inspectedApp)}
              >
                {inspectedApp.status === 'allowed' ? 'Block App' : 'Allow App'}
              </SButton>
              <SButton variant="primary" onClick={() => setInspectedAppKey(null)}>
                Close
              </SButton>
            </div>
          ) : null
        }
      >
        {inspectedApp && (
          <div className="space-y-3 text-[13px]">
            <p className="m-0 text-[var(--omada-text-secondary)]">
              {inspectedApp.description}
            </p>
            <div className="grid grid-cols-3 gap-2 rounded-[6px] border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-3">
              <div>
                <div className="text-[11px] text-[var(--omada-text-tertiary)]">Upload</div>
                <div className="tabular-nums mt-0.5 font-medium text-[var(--omada-link)]">
                  ↑ {formatTrafficBytes(Math.round(inspectedApp.upBytes * activePreset.scaleFactor))}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--omada-text-tertiary)]">Download</div>
                <div className="tabular-nums mt-0.5 font-medium text-[var(--omada-color-magenta)]">
                  ↓ {formatTrafficBytes(Math.round(inspectedApp.downBytes * activePreset.scaleFactor))}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--omada-text-tertiary)]">Policy</div>
                <div className="mt-0.5">
                  <STag color={inspectedApp.status === 'allowed' ? 'green' : 'red'}>
                    {inspectedApp.status === 'allowed' ? 'Allowed' : 'Blocked'}
                  </STag>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[12px] font-medium text-[var(--omada-text-secondary)]">
                Active Clients ({inspectedApp.activeUsers})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inspectedApp.usersUsing.map((userName) => (
                  <STag key={userName}>{userName}</STag>
                ))}
              </div>
            </div>
          </div>
        )}
      </SModal>
    </div>
  );
};
