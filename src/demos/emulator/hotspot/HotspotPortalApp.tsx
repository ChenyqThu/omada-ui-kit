import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Dropdown, Popover, Table, Tooltip, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { EChartsOption } from 'echarts';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import {
  OmadaLogo,
  SButton,
  SChart,
  SEmpty,
  SIcon,
  SInput,
  SModal,
  SNumberInput,
  SPagination,
  SPasswordInput,
  SSelect,
  SSwitch,
  omadaLayout,
  useOmadaConfirm,
  useOmadaNotification,
  useOmadaTheme,
  type OmadaIconName,
  type ThemeMode,
} from '@/omada';
import {
  CURRENCY_OPTIONS,
  HOTSPOT_DASHBOARD_PRESETS,
  HOTSPOT_SITES,
  INITIAL_AUTHORIZED_CLIENTS,
  INITIAL_FORM_AUTH_RECORDS,
  INITIAL_HOTSPOT_OPERATORS,
  INITIAL_LOCAL_USERS,
  INITIAL_VOUCHER_GROUPS,
  PRINTING_LANGUAGE_OPTIONS,
  VOUCHER_STATISTICS_DATA,
  generateVoucherCodesForNewGroup,
  type HotspotAuthorizedClient,
  type HotspotFormAuthRecord,
  type HotspotLocalUser,
  type HotspotOperatorRecord,
  type HotspotRouteKey,
  type VoucherGroupRecord,
} from './hotspotData';

export interface HotspotPortalAppProps {
  /** Optional initial route override (`'dashboard'`, `'voucher-groups'`, `'statistics'`, etc.). */
  initialRoute?: string;
  /** Callback triggered when clicking `Headquarters Building Hotspot Management` in the topbar. */
  onBackToController?: () => void;
  className?: string;
}

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const THEME_MENU_ICONS: Record<ThemeMode, OmadaIconName> = {
  light: 'topbar-property-1-light',
  dark: 'topbar-property-1-dark',
  system: 'topbar-property-1-follow-system',
};

const DATE_RANGE_FILTER_OPTIONS = [
  { key: 'all', label: 'Start date  -  End date' },
  { key: '2021-2022', label: 'Oct 01, 2021  -  Dec 31, 2022' },
  { key: '2023', label: 'Jan 01, 2023  -  Dec 31, 2023' },
  { key: '2026', label: 'Nov 01, 2026  -  Nov 30, 2026' },
];

const VOUCHER_COLUMN_TOGGLE_ITEMS = [
  { key: 'name', label: 'Group Name', locked: true },
  { key: 'createdTime', label: 'Created Time' },
  { key: 'creator', label: 'Creator' },
  { key: 'usedTotal', label: 'Used/Total Amount', locked: true },
  { key: 'unitPrice', label: 'Unit Price' },
  { key: 'totalPrice', label: 'Total Price' },
  { key: 'duration', label: 'Duration' },
];

/** Monochrome clear-expired icon matching Figma `table/clear-red.svg` geometry. */
const ClearExpiredGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12.1782 5.05719H18.0991V9.41559H16.9155V18.1002H3.08447V9.41559H1.8999V5.05719H7.8208V1.89996H12.1782V5.05719ZM4.28369 16.9H6.24268V13.7086H7.44189V16.9H9.3999V13.7017H10.5991V16.9H12.5581V13.7086H13.7573V16.9H15.7153V9.41559H4.28369V16.9ZM9.021 6.25739H3.09912V8.21539H16.8999V6.25739H10.978V3.09918H9.021V6.25739Z"
      fill="currentColor"
    />
  </svg>
);

/** Monochrome printer icon matching Figma `table/print.svg` geometry. */
const PrintGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M15.8496 6.90039H18.0996V15.8496H15.4746V18.0996H4.52539V15.8496H1.90039V6.90039H4.15039V1.90039H15.8496V6.90039ZM5.72461 16.9004H14.2754V13.5996H5.72461V16.9004ZM3.09961 14.6504H4.51758V12.4004H15.4814V14.6504H16.9004V8.09961H3.09961V14.6504ZM5.34961 6.90039H14.6504V3.09961H5.34961V6.90039Z"
      fill="currentColor"
    />
  </svg>
);

/** Monochrome delete icon matching Figma `table/delete.svg` geometry. */
const DeleteGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12.9619 2.37988L13.3232 4.15039H17.9326V5.34961H16.0576V18.0996H3.6084V5.34961H1.7334V4.15039H6.34766L6.72949 2.37402L6.83203 1.90039H12.8643L12.9619 2.37988ZM4.80762 16.9004H14.8584V5.34961H4.80762V16.9004ZM8.93262 13.9746H7.7334V7.90039H8.93262V13.9746ZM11.9326 13.9746H10.7334V7.90039H11.9326V13.9746ZM7.57617 4.15039H12.0986L11.8838 3.09961H7.80176L7.57617 4.15039Z"
      fill="currentColor"
    />
  </svg>
);

export function parseHotspotRoute(routeOrHash?: string): HotspotRouteKey {
  if (!routeOrHash) return 'dashboard';
  let cleaned = routeOrHash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (cleaned.startsWith('hotspot/')) {
    cleaned = cleaned.slice('hotspot/'.length);
  } else if (cleaned === 'hotspot') {
    cleaned = 'dashboard';
  }
  if (cleaned === 'vouchers' || cleaned === 'vouchers/voucher-groups' || cleaned === 'voucher-groups') {
    return 'voucher-groups';
  }
  if (cleaned === 'vouchers/statistics' || cleaned === 'statistics') {
    return 'statistics';
  }
  if (cleaned === 'authorized-clients' || cleaned === 'clients') {
    return 'authorized-clients';
  }
  if (cleaned === 'local-users') return 'local-users';
  if (cleaned === 'form-auth' || cleaned === 'form-auth-data') return 'form-auth';
  if (cleaned === 'operators') return 'operators';
  return 'dashboard';
}

/**
 * Dedicated Omada Hotspot Management Portal (`#/hotspot*`).
 * Features the standalone `56px` Hotspot Management topbar, `216px` site-aware sidebar,
 * Dashboard analytics (`Portal Authorizations Histories`, `Authentication Type`, `Hotspot Type`),
 * `Vouchers -> Voucher Groups` & `Statistics`, `Authorized Clients`, `Local Users`,
 * `Form Auth Data`, and `Operators`.
 */
export const HotspotPortalApp: React.FC<HotspotPortalAppProps> = ({
  initialRoute,
  onBackToController,
  className = '',
}) => {
  const notification = useOmadaNotification();
  const { confirmDanger } = useOmadaConfirm();
  const { themeMode, resolvedTheme, tokens, setThemeMode } = useOmadaTheme();

  const initialResolvedRoute = useMemo(() => {
    if (initialRoute) return parseHotspotRoute(initialRoute);
    if (typeof window !== 'undefined') {
      return parseHotspotRoute(window.location.hash);
    }
    return 'dashboard';
  }, [initialRoute]);

  const [activeRoute, setActiveRoute] = useState<HotspotRouteKey>(initialResolvedRoute);
  const [vouchersExpanded, setVouchersExpanded] = useState<boolean>(
    initialResolvedRoute === 'statistics' || initialResolvedRoute === 'voucher-groups',
  );
  const [activeSiteKey, setActiveSiteKey] = useState<string>(HOTSPOT_SITES[0].key);

  // Dashboard state
  const [dashboardDateKey, setDashboardDateKey] = useState<string>(
    HOTSPOT_DASHBOARD_PRESETS[0].key,
  );
  const [dashboardDateOpen, setDashboardDateOpen] = useState(false);

  // Voucher Groups state
  const [voucherGroups, setVoucherGroups] =
    useState<VoucherGroupRecord[]>(INITIAL_VOUCHER_GROUPS);
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherDateFilter, setVoucherDateFilter] = useState('all');
  const [voucherDatePopoverOpen, setVoucherDatePopoverOpen] = useState(false);
  const [printingLanguage, setPrintingLanguage] = useState('English');
  const [currency, setCurrency] = useState('AUD');
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleVoucherCols, setVisibleVoucherCols] = useState<string[]>(
    VOUCHER_COLUMN_TOGGLE_ITEMS.map((c) => c.key),
  );

  // Create / Inspect / Print Voucher Modals
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('VoucherGroup_5');
  const [newGroupAmount, setNewGroupAmount] = useState<number>(10);
  const [newGroupDurationHours, setNewGroupDurationHours] = useState<number>(8);
  const [newGroupMode, setNewGroupMode] = useState<'Client' | 'Voucher'>('Voucher');
  const [newGroupUnitPrice, setNewGroupUnitPrice] = useState<number | null>(null);
  const [detailsGroup, setDetailsGroup] = useState<VoucherGroupRecord | null>(null);
  const [printPreviewGroup, setPrintPreviewGroup] = useState<VoucherGroupRecord | null>(null);

  // Vouchers -> Statistics state
  const [statsCurrency, setStatsCurrency] = useState<'USD' | 'AUD' | 'EUR'>('USD');

  // Authorized Clients state
  const [authorizedClients, setAuthorizedClients] = useState<HotspotAuthorizedClient[]>(
    INITIAL_AUTHORIZED_CLIENTS,
  );
  const [authClientSearch, setAuthClientSearch] = useState('');
  const [authTypeFilter, setAuthTypeFilter] = useState<string>('all');

  // Local Users state
  const [localUsers, setLocalUsers] = useState<HotspotLocalUser[]>(INITIAL_LOCAL_USERS);
  const [localUserSearch, setLocalUserSearch] = useState('');
  const [selectedLocalUserKeys, setSelectedLocalUserKeys] = useState<string[]>([]);
  const [createLocalUserOpen, setCreateLocalUserOpen] = useState(false);
  const [newLocalUsername, setNewLocalUsername] = useState('');
  const [newLocalPassword, setNewLocalPassword] = useState('');
  const [newLocalMaxUsers, setNewLocalMaxUsers] = useState<number>(5);

  // Form Auth Data state
  const [formAuthRecords, setFormAuthRecords] = useState<HotspotFormAuthRecord[]>(
    INITIAL_FORM_AUTH_RECORDS,
  );
  const [formAuthSearch, setFormAuthSearch] = useState('');
  const [selectedFormAuthKeys, setSelectedFormAuthKeys] = useState<string[]>([]);
  const [inspectedFormRecord, setInspectedFormRecord] =
    useState<HotspotFormAuthRecord | null>(null);

  // Operators state
  const [operators, setOperators] = useState<HotspotOperatorRecord[]>(
    INITIAL_HOTSPOT_OPERATORS,
  );
  const [operatorSearch, setOperatorSearch] = useState('');
  const [createOperatorOpen, setCreateOperatorOpen] = useState(false);
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newOperatorPrivilege, setNewOperatorPrivilege] = useState<'Admin' | 'Operator'>(
    'Operator',
  );
  const [newOperatorNote, setNewOperatorNote] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || initialRoute) return;
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.toLowerCase().includes('hotspot')) return;
      const next = parseHotspotRoute(hash);
      setActiveRoute(next);
      if (next === 'statistics' || next === 'voucher-groups') {
        setVouchersExpanded(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [initialRoute]);

  const navigateHotspot = (nextRoute: HotspotRouteKey) => {
    setActiveRoute(nextRoute);
    if (nextRoute === 'statistics' || nextRoute === 'voucher-groups') {
      setVouchersExpanded(true);
    }
    if (typeof window !== 'undefined' && !initialRoute) {
      window.location.hash = `#/hotspot/${nextRoute}`;
    }
  };

  const handleBackToController = () => {
    if (onBackToController) {
      onBackToController();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '#/dashboard';
    }
  };

  const currentSite =
    HOTSPOT_SITES.find((s) => s.key === activeSiteKey) ?? HOTSPOT_SITES[0];

  const siteMenuItems: MenuProps['items'] = useMemo(
    () =>
      HOTSPOT_SITES.map((site) => ({
        key: site.key,
        label: (
          <div className="flex flex-col py-0.5">
            <span className="font-medium text-[var(--omada-text-primary)]">{site.label}</span>
            <span className="text-xs text-[var(--omada-text-secondary)]">{site.subtitle}</span>
          </div>
        ),
        onClick: () => {
          setActiveSiteKey(site.key);
          notification.info({
            title: 'Hotspot Site Switched',
            description: `Viewing Hotspot Management for ${site.label}.`,
          });
        },
      })),
    [notification],
  );

  const themeMenuItems: MenuProps['items'] = useMemo(
    () =>
      (['light', 'dark', 'system'] as ThemeMode[]).map((mode) => ({
        key: mode,
        icon: <SIcon name={THEME_MENU_ICONS[mode]} size={16} />,
        label: (
          <span className={themeMode === mode ? 'font-semibold text-[var(--omada-brand-text)]' : ''}>
            {THEME_LABELS[mode]}
          </span>
        ),
        onClick: () => setThemeMode(mode),
      })),
    [themeMode, setThemeMode],
  );

  // Dashboard options
  const activeDashboardPreset = useMemo(
    () =>
      HOTSPOT_DASHBOARD_PRESETS.find((p) => p.key === dashboardDateKey) ??
      HOTSPOT_DASHBOARD_PRESETS[0],
    [dashboardDateKey],
  );

  const authHistoriesOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const arr = Array.isArray(params) ? params : [params];
          const first = arr[0] as { name?: string; value?: number | null } | undefined;
          if (!first || first.value === null || first.value === undefined) {
            return '';
          }
          const timeLabel = first.name || '2025-09-18 03:10 pm';
          return `${timeLabel}<br/>Authorizations: <b>${first.value}</b>`;
        },
      },
      grid: {
        left: 24,
        right: 20,
        top: 18,
        bottom: 26,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: activeDashboardPreset.historyLabels,
        axisTick: { show: false },
        splitLine: { show: false },
        axisLine: { show: true, lineStyle: { color: tokens.borderStrong } },
        axisLabel: {
          interval: 0,
          color: tokens.textSecondary,
          fontSize: 12,
          margin: 12,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: activeDashboardPreset.yMax,
        interval: activeDashboardPreset.yInterval,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: tokens.borderDivider, type: 'solid' },
        },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 12,
          margin: 14,
        },
      },
      series: [
        {
          name: 'Portal Authorizations',
          type: 'bar',
          barWidth: 14,
          data: activeDashboardPreset.historyValues,
          itemStyle: {
            color: tokens.brandHover,
          },
        },
      ],
    }),
    [activeDashboardPreset, tokens],
  );

  const authTypeOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: 10,
        right: 34,
        top: 12,
        bottom: 20,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 50,
        interval: 10,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: tokens.borderDivider, type: 'dashed' },
        },
        axisLabel: {
          color: tokens.textTertiary,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: activeDashboardPreset.authTypes.map((a) => a.label),
        axisTick: { show: false },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: tokens.borderDivider } },
        axisLabel: {
          color: tokens.textSecondary,
          fontSize: 12,
        },
      },
      series: [
        {
          name: 'Clients',
          type: 'bar',
          barWidth: 16,
          showBackground: true,
          backgroundStyle: {
            color:
              resolvedTheme === 'dark'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.03)',
            borderRadius: [0, 3, 3, 0],
          },
          itemStyle: {
            color: tokens.brandHover,
            borderRadius: [0, 3, 3, 0],
          },
          label: {
            show: true,
            position: 'right',
            color: tokens.textSecondary,
            fontSize: 12,
          },
          data: activeDashboardPreset.authTypes.map((a) => a.value),
        },
      ],
    }),
    [activeDashboardPreset, resolvedTheme, tokens],
  );

  const hotspotPalette = useMemo(
    () => [tokens.brandHover, tokens.link, tokens.warning],
    [tokens],
  );

  const hotspotTypeOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          name: 'Hotspot Type',
          type: 'pie',
          radius: ['72%', '90%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderColor: resolvedTheme === 'dark' ? tokens.bgSurface : tokens.bgSurface,
            borderWidth: activeDashboardPreset.hotspotTypes.length > 1 ? 2 : 0,
          },
          data: activeDashboardPreset.hotspotTypes.map((item, idx) => ({
            name: item.label,
            value: item.value,
            itemStyle: {
              color: hotspotPalette[idx % hotspotPalette.length],
            },
          })),
        },
      ],
    }),
    [activeDashboardPreset, hotspotPalette, resolvedTheme, tokens.bgSurface],
  );

  // Voucher Statistics ECharts option
  const statsChartOption = useMemo<EChartsOption>(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        right: 0,
        data: ['Vouchers Used', `Revenue (${statsCurrency})`],
      },
      grid: { left: 12, right: 16, top: 36, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: VOUCHER_STATISTICS_DATA.trendLabels,
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        splitNumber: 4,
      },
      series: [
        {
          name: 'Vouchers Used',
          type: 'bar',
          barWidth: 16,
          itemStyle: { color: tokens.brandHover, borderRadius: [3, 3, 0, 0] },
          data: VOUCHER_STATISTICS_DATA.usedSeries,
        },
        {
          name: `Revenue (${statsCurrency})`,
          type: 'line',
          smooth: true,
          itemStyle: { color: tokens.link },
          lineStyle: { width: 2, color: tokens.link },
          data: VOUCHER_STATISTICS_DATA.revenueSeries,
        },
      ],
    }),
    [statsCurrency, tokens.brandHover, tokens.link],
  );

  // Filtered Voucher Groups
  const filteredGroups = useMemo(() => {
    const q = voucherSearch.trim().toLowerCase();
    return voucherGroups.filter((group) => {
      if (voucherDateFilter === '2021-2022' && !group.createdTime.includes('2021') && !group.createdTime.includes('2022')) {
        return false;
      }
      if (voucherDateFilter === '2023' && !group.createdTime.includes('2023')) {
        return false;
      }
      if (voucherDateFilter === '2026' && !group.createdTime.includes('2026')) {
        return false;
      }
      if (!q) return true;
      return (
        group.name.toLowerCase().includes(q) ||
        group.duration.toLowerCase().includes(q) ||
        group.vouchers.some((v) => v.code.toLowerCase().includes(q))
      );
    });
  }, [voucherGroups, voucherSearch, voucherDateFilter]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, currentPage, pageSize]);

  const allFilteredSelected =
    filteredGroups.length > 0 &&
    filteredGroups.every((g) => selectedGroupKeys.includes(g.key));

  const handleToggleSelectAllGroups = () => {
    if (allFilteredSelected) {
      setSelectedGroupKeys([]);
    } else {
      setSelectedGroupKeys(filteredGroups.map((g) => g.key));
    }
  };

  const handleBatchPrintSelected = () => {
    if (selectedGroupKeys.length === 0) return;
    const firstSelected = voucherGroups.find((g) => g.key === selectedGroupKeys[0]);
    if (firstSelected) {
      setPrintPreviewGroup(firstSelected);
    }
    notification.success({
      title: 'Unused Vouchers Ready to Print',
      description: `Prepared unused vouchers from ${selectedGroupKeys.length} group(s) in ${printingLanguage}.`,
    });
  };

  const handleBatchClearExpired = () => {
    if (selectedGroupKeys.length === 0) return;
    let clearedTotal = 0;
    setVoucherGroups((prev) =>
      prev.map((group) => {
        if (!selectedGroupKeys.includes(group.key)) return group;
        const expired = group.vouchers.filter((v) => v.status === 'Expired').length;
        clearedTotal += expired;
        if (expired === 0) return group;
        const remaining = group.vouchers.filter((v) => v.status !== 'Expired');
        return {
          ...group,
          expiredCount: 0,
          usedAmount: remaining.filter((v) => v.status === 'In Use').length,
          totalAmount: remaining.length,
          vouchers: remaining,
        };
      }),
    );
    notification.success({
      title: 'Expired Vouchers Cleared',
      description:
        clearedTotal > 0
          ? `Cleared ${clearedTotal} expired voucher(s) across selected groups.`
          : 'No expired vouchers found in the selected voucher groups.',
    });
  };

  const handleBatchDeleteGroups = () => {
    if (selectedGroupKeys.length === 0) return;
    const count = selectedGroupKeys.length;
    confirmDanger({
      title: `Delete ${count} Voucher Group${count > 1 ? 's' : ''}?`,
      content: 'Deleted voucher groups and their unused codes cannot be recovered.',
      okText: 'Delete',
      onOk: () => {
        setVoucherGroups((prev) =>
          prev.filter((g) => !selectedGroupKeys.includes(g.key)),
        );
        setSelectedGroupKeys([]);
        notification.success({
          title: 'Voucher Groups Deleted',
          description: `Removed ${count} voucher group(s).`,
        });
      },
    });
  };

  const handleClearGroupExpired = (group: VoucherGroupRecord) => {
    const expired = group.vouchers.filter((v) => v.status === 'Expired').length;
    if (expired === 0) {
      notification.info({
        title: 'No Expired Vouchers',
        description: `${group.name} has 0 expired vouchers.`,
      });
      return;
    }
    setVoucherGroups((prev) =>
      prev.map((item) => {
        if (item.key !== group.key) return item;
        const remaining = item.vouchers.filter((v) => v.status !== 'Expired');
        return {
          ...item,
          expiredCount: 0,
          usedAmount: remaining.filter((v) => v.status === 'In Use').length,
          totalAmount: remaining.length,
          vouchers: remaining,
        };
      }),
    );
    notification.success({
      title: 'Expired Vouchers Cleared',
      description: `Cleared ${expired} expired voucher(s) from ${group.name}.`,
    });
  };

  const handleDeleteSingleGroup = (group: VoucherGroupRecord) => {
    confirmDanger({
      title: `Delete ${group.name}?`,
      content: 'This will permanently delete this voucher group and its remaining codes.',
      okText: 'Delete',
      onOk: () => {
        setVoucherGroups((prev) => prev.filter((item) => item.key !== group.key));
        setSelectedGroupKeys((prev) => prev.filter((k) => k !== group.key));
        notification.success({
          title: 'Voucher Group Deleted',
          description: `Deleted ${group.name}.`,
        });
      },
    });
  };

  const handleCreateVoucherGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      notification.error({
        title: 'Group Name Required',
        description: 'Please enter a valid voucher group name.',
      });
      return;
    }
    const key = `vg-${Date.now()}`;
    const duration = `${newGroupMode} - ${newGroupDurationHours}h - By Time`;
    const unit = newGroupUnitPrice !== null && newGroupUnitPrice > 0 ? newGroupUnitPrice : null;
    const total = unit !== null ? unit * newGroupAmount : null;
    const created: VoucherGroupRecord = {
      key,
      name: trimmed,
      createdTime: 'Nov 22, 2026 12:00:00 pm',
      createdTimestamp: Date.now(),
      creator: 'admin',
      usedAmount: 0,
      totalAmount: newGroupAmount,
      unitPrice: unit,
      totalPrice: total,
      currency,
      duration,
      expiredCount: 0,
      vouchers: generateVoucherCodesForNewGroup(key, newGroupAmount, `${newGroupDurationHours}h after activation`),
    };
    setVoucherGroups((prev) => [...prev, created]);
    setCreateGroupOpen(false);
    setNewGroupName(`VoucherGroup_${voucherGroups.length + 2}`);
    notification.success({
      title: 'Voucher Group Created',
      description: `Created ${trimmed} with ${newGroupAmount} vouchers.`,
    });
  };

  const visibleColSet = useMemo(() => new Set(visibleVoucherCols), [visibleVoucherCols]);

  const toggleVoucherCol = (colKey: string) => {
    setVisibleVoucherCols((prev) =>
      prev.includes(colKey) ? prev.filter((k) => k !== colKey) : [...prev, colKey],
    );
  };

  const voucherColumnPopover = useMemo(
    () => (
      <div className="w-[196px]">
        <div className="mb-2 border-b border-[var(--omada-border-divider)] pb-1.5 text-xs font-semibold text-[var(--omada-text-primary)]">
          Visible Columns
        </div>
        <div className="space-y-1.5">
          {VOUCHER_COLUMN_TOGGLE_ITEMS.map((col) => (
            <label
              key={col.key}
              className={`flex items-center gap-2 text-xs text-[var(--omada-text-primary)] ${
                col.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              <Checkbox
                checked={visibleColSet.has(col.key)}
                disabled={col.locked}
                onChange={() => toggleVoucherCol(col.key)}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      </div>
    ),
    [visibleColSet],
  );

  const voucherColumns: ColumnsType<VoucherGroupRecord> = useMemo(() => {
    const cols: ColumnsType<VoucherGroupRecord> = [
      {
        title: 'Group Name',
        dataIndex: 'name',
        key: 'name',
        width: 140,
        render: (name: string) => (
          <span className="text-[13.5px] text-[var(--omada-text-primary)]">{name}</span>
        ),
      },
    ];

    if (visibleColSet.has('createdTime')) {
      cols.push({
        title: 'Created Time',
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: 186,
        render: (val: string) => (
          <span className="tabular-nums text-[13.5px] text-[var(--omada-text-primary)]">
            {val}
          </span>
        ),
      });
    }

    if (visibleColSet.has('creator')) {
      cols.push({
        title: 'Creator',
        dataIndex: 'creator',
        key: 'creator',
        width: 80,
        render: (val: string) => (
          <span className="text-[13.5px] text-[var(--omada-text-primary)]">{val}</span>
        ),
      });
    }

    cols.push({
      title: 'Used/Total Amount',
      key: 'usedTotal',
      width: 204,
      render: (_, record) => {
        const pct =
          record.totalAmount > 0
            ? Math.min(100, Math.round((record.usedAmount / record.totalAmount) * 100))
            : 0;
        return (
          <div className="flex items-center gap-3">
            <div
              className="omada-hotspot-progress-track"
              aria-label={`${record.usedAmount} of ${record.totalAmount} used`}
            >
              <div
                className="omada-hotspot-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => setDetailsGroup(record)}
              className="tabular-nums cursor-pointer border-0 bg-transparent p-0 text-[13.5px] hover:underline"
            >
              <span className="font-medium text-[var(--omada-link)]">
                {record.usedAmount}
              </span>
              <span className="text-[var(--omada-text-primary)]">
                {' '}
                / {record.totalAmount}
              </span>
            </button>
          </div>
        );
      },
    });

    if (visibleColSet.has('unitPrice')) {
      cols.push({
        title: 'Unit Price',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 90,
        render: (val: number | null, record) => (
          <span className="tabular-nums text-[13.5px] text-[var(--omada-text-primary)]">
            {val === null ? '-' : `${currency || record.currency} ${val.toFixed(2)}`}
          </span>
        ),
      });
    }

    if (visibleColSet.has('totalPrice')) {
      cols.push({
        title: 'Total Price',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: 90,
        render: (val: number | null, record) => (
          <span className="tabular-nums text-[13.5px] text-[var(--omada-text-primary)]">
            {val === null ? '-' : `${currency || record.currency} ${val.toFixed(2)}`}
          </span>
        ),
      });
    }

    if (visibleColSet.has('duration')) {
      cols.push({
        title: 'Duration',
        dataIndex: 'duration',
        key: 'duration',
        width: 174,
        render: (val: string) => (
          <span className="text-[13.5px] text-[var(--omada-text-primary)]">{val}</span>
        ),
      });
    }

    cols.push({
      title: (
        <div className="flex w-full items-center justify-between gap-2">
          <span>Action</span>
          <Popover
            trigger="click"
            placement="bottomRight"
            content={voucherColumnPopover}
            styles={{ container: { padding: 12 } }}
          >
            <button
              type="button"
              aria-label="Voucher table column settings"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-[var(--omada-text-tertiary)] hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]"
            >
              <SIcon name="more-3" size={16} />
            </button>
          </Popover>
        </div>
      ),
      key: 'action',
      width: 136,
      render: (_, record) => (
        <div className="flex items-center gap-2.5">
          <Tooltip title="Details">
            <button
              type="button"
              aria-label={`Details ${record.name}`}
              onClick={() => setDetailsGroup(record)}
              className="omada-hotspot-row-action-btn"
            >
              <SIcon name="detail" size={17} />
            </button>
          </Tooltip>
          <Tooltip title="Clear Expired Vouchers">
            <button
              type="button"
              aria-label={`Clear expired ${record.name}`}
              onClick={() => handleClearGroupExpired(record)}
              className="omada-hotspot-row-action-btn"
            >
              <ClearExpiredGlyph size={17} />
            </button>
          </Tooltip>
          <Tooltip title="Print Unused Vouchers">
            <button
              type="button"
              aria-label={`Print ${record.name}`}
              onClick={() => setPrintPreviewGroup(record)}
              className="omada-hotspot-row-action-btn"
            >
              <SIcon name="print" size={17} />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              type="button"
              aria-label={`Delete ${record.name}`}
              onClick={() => handleDeleteSingleGroup(record)}
              className="omada-hotspot-row-action-btn"
            >
              <SIcon name="delete" size={17} />
            </button>
          </Tooltip>
        </div>
      ),
    });

    return cols;
  }, [visibleColSet, currency, voucherColumnPopover]);

  // Authorized Clients filtered list
  const filteredAuthorizedClients = useMemo(() => {
    const q = authClientSearch.trim().toLowerCase();
    return authorizedClients.filter((c) => {
      if (authTypeFilter !== 'all' && c.authType !== authTypeFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.mac.toLowerCase().includes(q) ||
        c.ip.toLowerCase().includes(q) ||
        c.credential.toLowerCase().includes(q)
      );
    });
  }, [authorizedClients, authClientSearch, authTypeFilter]);

  // Local Users filtered list
  const filteredLocalUsers = useMemo(() => {
    const q = localUserSearch.trim().toLowerCase();
    return localUsers.filter(
      (u) => !q || u.username.toLowerCase().includes(q),
    );
  }, [localUsers, localUserSearch]);

  // Form Auth Data filtered list
  const filteredFormAuth = useMemo(() => {
    const q = formAuthSearch.trim().toLowerCase();
    return formAuthRecords.filter(
      (r) =>
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.clientMac.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q),
    );
  }, [formAuthRecords, formAuthSearch]);

  // Operators filtered list
  const filteredOperators = useMemo(() => {
    const q = operatorSearch.trim().toLowerCase();
    return operators.filter(
      (op) =>
        !q ||
        op.name.toLowerCase().includes(q) ||
        op.note.toLowerCase().includes(q),
    );
  }, [operators, operatorSearch]);

  const isVouchersRoute =
    activeRoute === 'statistics' || activeRoute === 'voucher-groups';

  const selectedDateFilterLabel =
    DATE_RANGE_FILTER_OPTIONS.find((opt) => opt.key === voucherDateFilter)?.label ??
    'Start date  -  End date';

  const statsMultiplier = statsCurrency === 'USD' ? 1 : statsCurrency === 'AUD' ? 1.52 : 0.92;
  const statsFormat = (usdVal: number) =>
    `${statsCurrency} ${Math.round(usdVal * statsMultiplier)}`;

  return (
    <div
      data-theme={resolvedTheme}
      data-testid="hotspot-portal-app"
      className={`omada-emulator-root omada-hotspot-root relative flex h-screen w-full flex-col overflow-hidden ${className}`.trim()}
    >
      {/* 56px Omada Hotspot Management Top Bar */}
      <header
        className="omada-hotspot-topbar relative flex shrink-0 items-center justify-between"
        style={{ height: omadaLayout.topBarHeight, zIndex: 100 }}
      >
        <div className="flex min-w-0 items-center pl-5">
          <button
            type="button"
            data-testid="hotspot-back-to-controller"
            onClick={handleBackToController}
            className="omada-hotspot-brand-btn"
          >
            <span className="truncate">Headquarters Building Hotspot Management</span>
          </button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <OmadaLogo height={28} className="h-[28px] w-[76px] text-white/80" />
        </div>

        <div className="flex shrink-0 items-center gap-2 pr-[18px]">
          <button
            type="button"
            aria-label="Refresh"
            data-testid="hotspot-refresh-btn"
            onClick={() =>
              notification.success({
                title: 'Hotspot Data Refreshed',
                description: `Synchronized vouchers and authorized clients for ${currentSite.label}.`,
              })
            }
            className="omada-emu-topbar-icon-btn"
          >
            <SIcon name="refresh-2" size={32} />
          </button>

          <Dropdown
            menu={{ items: themeMenuItems, selectedKeys: [themeMode] }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: 'omada-emu-dropdown' }}
          >
            <button
              type="button"
              aria-label="Theme mode"
              data-testid="hotspot-theme-switcher"
              className="omada-emu-topbar-icon-btn"
            >
              <SIcon name={resolvedTheme === 'dark' ? 'dark' : 'light'} size={32} />
            </button>
          </Dropdown>

          <button
            type="button"
            aria-label="Phoenix"
            data-testid="hotspot-avatar-btn"
            onClick={() =>
              notification.info({
                title: 'Hotspot Operator',
                description: 'Signed in as Phoenix (Headquarters Building Admin).',
              })
            }
            className="omada-emu-avatar-btn"
          >
            <SIcon name="account" size={34} />
          </button>
        </div>
      </header>

      {/* Main Body: 216px Left Sidebar + Content Viewport */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          data-testid="hotspot-sidebar"
          className="omada-hotspot-sidebar flex shrink-0 flex-col pt-4"
          style={{ width: omadaLayout.sidebarWidth }}
        >
          {/* Rounded Site Pill */}
          <div className="px-2.5 pb-3">
            <Dropdown
              menu={{
                items: siteMenuItems,
                selectedKeys: [currentSite.key],
              }}
              trigger={['click']}
              placement="bottomLeft"
              classNames={{ root: 'omada-emu-dropdown' }}
            >
              <button
                type="button"
                aria-label={`Site: ${currentSite.label}`}
                data-testid="hotspot-site-selector"
                className="omada-emu-site-pill flex h-[40px] w-full cursor-pointer items-center gap-2 px-3"
              >
                <SIcon
                  name="sidebar-icon-icon-site-off"
                  size={18}
                  className="shrink-0 opacity-75"
                />
                <span className="min-w-0 flex-1 truncate text-left text-[14px]">
                  {currentSite.label}
                </span>
                <SIcon
                  name="icon-icon-tabler-icon-chevron-down"
                  size={14}
                  className="shrink-0 opacity-65"
                />
              </button>
            </Dropdown>
          </div>

          {/* Exact 6 Hotspot Sidebar Navigation Items */}
          <nav
            aria-label="Hotspot navigation"
            className="flex-1 overflow-y-auto overflow-x-hidden pb-4"
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                data-testid="hotspot-nav-dashboard"
                aria-current={activeRoute === 'dashboard' ? 'page' : undefined}
                onClick={() => navigateHotspot('dashboard')}
                className={`omada-hotspot-nav-item ${
                  activeRoute === 'dashboard' ? 'is-active' : ''
                }`}
              >
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                data-testid="hotspot-nav-authorized-clients"
                aria-current={activeRoute === 'authorized-clients' ? 'page' : undefined}
                onClick={() => navigateHotspot('authorized-clients')}
                className={`omada-hotspot-nav-item ${
                  activeRoute === 'authorized-clients' ? 'is-active' : ''
                }`}
              >
                <span>Authorized Clients</span>
              </button>

              <div>
                <button
                  type="button"
                  data-testid="hotspot-nav-vouchers"
                  aria-expanded={vouchersExpanded}
                  onClick={() => setVouchersExpanded((prev) => !prev)}
                  className={`omada-hotspot-nav-item ${
                    isVouchersRoute ? 'is-parent-active' : ''
                  }`}
                >
                  <span>Vouchers</span>
                  {vouchersExpanded ? (
                    <ChevronUp size={15} className="shrink-0 opacity-80" />
                  ) : (
                    <ChevronDown size={15} className="shrink-0 opacity-65" />
                  )}
                </button>

                {vouchersExpanded && (
                  <div className="flex flex-col">
                    <button
                      type="button"
                      data-testid="hotspot-nav-statistics"
                      aria-current={activeRoute === 'statistics' ? 'page' : undefined}
                      onClick={() => navigateHotspot('statistics')}
                      className={`omada-hotspot-subnav-item ${
                        activeRoute === 'statistics' ? 'is-active' : ''
                      }`}
                    >
                      <span>Statistics</span>
                    </button>
                    <button
                      type="button"
                      data-testid="hotspot-nav-voucher-groups"
                      aria-current={activeRoute === 'voucher-groups' ? 'page' : undefined}
                      onClick={() => navigateHotspot('voucher-groups')}
                      className={`omada-hotspot-subnav-item ${
                        activeRoute === 'voucher-groups' ? 'is-active' : ''
                      }`}
                    >
                      <span>Voucher Groups</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                data-testid="hotspot-nav-local-users"
                aria-current={activeRoute === 'local-users' ? 'page' : undefined}
                onClick={() => navigateHotspot('local-users')}
                className={`omada-hotspot-nav-item ${
                  activeRoute === 'local-users' ? 'is-active' : ''
                }`}
              >
                <span>Local Users</span>
              </button>

              <button
                type="button"
                data-testid="hotspot-nav-form-auth"
                aria-current={activeRoute === 'form-auth' ? 'page' : undefined}
                onClick={() => navigateHotspot('form-auth')}
                className={`omada-hotspot-nav-item ${
                  activeRoute === 'form-auth' ? 'is-active' : ''
                }`}
              >
                <span>Form Auth Data</span>
              </button>

              <button
                type="button"
                data-testid="hotspot-nav-operators"
                aria-current={activeRoute === 'operators' ? 'page' : undefined}
                onClick={() => navigateHotspot('operators')}
                className={`omada-hotspot-nav-item ${
                  activeRoute === 'operators' ? 'is-active' : ''
                }`}
              >
                <span>Operators</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Viewport */}
        <main className="omada-hotspot-main min-w-0 flex-1 overflow-y-auto px-6 py-4">
          {/* VIEW 1: DASHBOARD */}
          {activeRoute === 'dashboard' && (
            <div data-testid="hotspot-view-dashboard" className="space-y-4">
              {/* Date Range Pill */}
              <div>
                <Popover
                  trigger="click"
                  placement="bottomLeft"
                  open={dashboardDateOpen}
                  onOpenChange={setDashboardDateOpen}
                  styles={{ container: { padding: 8 } }}
                  content={
                    <div className="w-[240px] space-y-1">
                      {HOTSPOT_DASHBOARD_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => {
                            setDashboardDateKey(preset.key);
                            setDashboardDateOpen(false);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                            dashboardDateKey === preset.key
                              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
                              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
                          }`}
                        >
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  }
                >
                  <button
                    type="button"
                    data-testid="hotspot-dashboard-date-pill"
                    className="omada-hotspot-date-pill"
                  >
                    <span className="tabular-nums">{activeDashboardPreset.label}</span>
                    <Calendar
                      size={15}
                      className="shrink-0 text-[var(--omada-text-secondary)]"
                    />
                  </button>
                </Popover>
              </div>

              {/* Card 1: Portal Authorizations Histories */}
              <section
                data-testid="hotspot-auth-histories-card"
                className="omada-hotspot-card px-5 py-4"
              >
                <h2 className="m-0 mb-2 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                  Portal Authorizations Histories
                </h2>
                <SChart height={280} option={authHistoriesOption} />
              </section>

              {/* Row 2: Two Equal Cards Side-by-Side */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <section
                  data-testid="hotspot-auth-type-card"
                  className="omada-hotspot-card px-5 py-4"
                >
                  <h2 className="m-0 mb-2 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                    Authentication Type
                  </h2>
                  <SChart height={224} option={authTypeOption} />
                </section>

                <section
                  data-testid="hotspot-type-card"
                  className="omada-hotspot-card px-5 py-4"
                >
                  <h2 className="m-0 mb-2 text-[15px] font-medium leading-[22px] text-[var(--omada-text-primary)]">
                    Hotspot Type
                  </h2>
                  <div className="flex h-[224px] items-center justify-center gap-8">
                    <div className="relative h-[184px] w-[184px] shrink-0">
                      <SChart height={184} option={hotspotTypeOption} />
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span
                          data-testid="hotspot-total-count"
                          className="tabular-nums text-[26px] font-semibold leading-[32px] text-[var(--omada-text-primary)]"
                        >
                          {activeDashboardPreset.totalHotspot}
                        </span>
                        <span className="mt-0.5 text-[12px] leading-[16px] text-[var(--omada-text-secondary)]">
                          Total Hotspot
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-[160px] flex-col gap-2.5">
                      {activeDashboardPreset.hotspotTypes.map((item, idx) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-4 text-[13px] leading-[20px]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="h-[8px] w-[8px] shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor:
                                  hotspotPalette[idx % hotspotPalette.length],
                              }}
                            />
                            <span className="text-[var(--omada-text-primary)]">
                              {item.label}
                            </span>
                          </div>
                          <span className="tabular-nums text-[var(--omada-text-secondary)]">
                            {item.value} ({item.percent}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* VIEW 2: VOUCHERS -> VOUCHER GROUPS */}
          {activeRoute === 'voucher-groups' && (
            <div data-testid="hotspot-view-voucher-groups" className="space-y-3">
              {/* Toolbar Row 1 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SInput
                  variant="filled"
                  allowClear
                  value={voucherSearch}
                  onChange={(e) => {
                    setVoucherSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Name or Voucher Code"
                  aria-label="Search Name or Voucher Code"
                  suffix={
                    <SIcon
                      name="input-search"
                      size={14}
                      className="text-[var(--omada-text-tertiary)]"
                    />
                  }
                  className="omada-hotspot-search"
                  style={{ width: 336 }}
                />

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    disabled={selectedGroupKeys.length === 0}
                    onClick={handleBatchPrintSelected}
                    className="omada-hotspot-batch-btn"
                  >
                    <PrintGlyph size={15} />
                    <span>Print Selected Unused Vouchers</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedGroupKeys.length === 0}
                    onClick={handleBatchClearExpired}
                    className="omada-hotspot-batch-btn"
                  >
                    <ClearExpiredGlyph size={15} />
                    <span>Clear Selected Expired Vouchers</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedGroupKeys.length === 0}
                    onClick={handleBatchDeleteGroups}
                    className="omada-hotspot-batch-btn is-danger"
                  >
                    <DeleteGlyph size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Toolbar Row 2 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Popover
                  trigger="click"
                  placement="bottomLeft"
                  open={voucherDatePopoverOpen}
                  onOpenChange={setVoucherDatePopoverOpen}
                  styles={{ container: { padding: 8 } }}
                  content={
                    <div className="w-[240px] space-y-1">
                      {DATE_RANGE_FILTER_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setVoucherDateFilter(opt.key);
                            setVoucherDatePopoverOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                            voucherDateFilter === opt.key
                              ? 'bg-[var(--omada-brand-bg-subtlest)] font-medium text-[var(--omada-brand-text)]'
                              : 'text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field)]'
                          }`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  }
                >
                  <button
                    type="button"
                    data-testid="voucher-date-range-pill"
                    className="omada-hotspot-date-pill"
                  >
                    <span
                      className={
                        voucherDateFilter === 'all'
                          ? 'text-[var(--omada-text-tertiary)]'
                          : 'tabular-nums text-[var(--omada-text-primary)]'
                      }
                    >
                      {selectedDateFilterLabel}
                    </span>
                    <Calendar
                      size={15}
                      className="shrink-0 text-[var(--omada-text-secondary)]"
                    />
                  </button>
                </Popover>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      notification.success({
                        title: 'Voucher Groups Exported',
                        description: `Exported ${filteredGroups.length} voucher group(s) (${currency}) as CSV.`,
                      })
                    }
                    className="omada-hotspot-export-btn"
                  >
                    <SIcon name="export" size={15} />
                    <span>Export</span>
                  </button>

                  <SButton
                    variant="primary"
                    icon={<Plus size={15} />}
                    onClick={() => setCreateGroupOpen(true)}
                  >
                    Create Vouchers Group
                  </SButton>
                </div>
              </div>

              {/* Toolbar Row 3 */}
              <div className="flex flex-wrap items-center gap-6 pt-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13.5px] text-[var(--omada-text-primary)]">
                    Printing Language
                  </span>
                  <SSelect
                    aria-label="Printing Language"
                    value={printingLanguage}
                    onChange={(val) => setPrintingLanguage(String(val))}
                    options={PRINTING_LANGUAGE_OPTIONS}
                    style={{ width: 152 }}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[13.5px] text-[var(--omada-text-primary)]">
                    Currency
                  </span>
                  <SSelect
                    aria-label="Currency"
                    value={currency}
                    onChange={(val) => setCurrency(String(val))}
                    options={CURRENCY_OPTIONS}
                    style={{ width: 140 }}
                  />
                </div>
              </div>

              {/* Voucher Groups AntD Table */}
              <div className="omada-hotspot-table-shell">
                <Table<VoucherGroupRecord>
                  rowKey="key"
                  columns={voucherColumns}
                  dataSource={paginatedGroups}
                  pagination={false}
                  scroll={{ x: 1080 }}
                  rowSelection={{
                    columnWidth: 44,
                    selectedRowKeys: selectedGroupKeys,
                    onChange: (keys) => setSelectedGroupKeys(keys.map(String)),
                  }}
                  locale={{
                    emptyText: (
                      <SEmpty
                        title="No voucher groups"
                        description="Adjust your search query or create a new voucher group."
                      />
                    ),
                  }}
                  className="omada-hotspot-table"
                />
              </div>

              {/* Footer Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-[13px]">
                  <span
                    data-testid="voucher-selection-summary"
                    className="tabular-nums text-[var(--omada-text-secondary)]"
                  >
                    Select {selectedGroupKeys.length} of {filteredGroups.length} items
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSelectAllGroups}
                    disabled={filteredGroups.length === 0}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-[var(--omada-link)] hover:underline disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {filteredGroups.length > 0 && (
                  <SPagination
                    align="right"
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredGroups.length}
                    showSizeChanger={{ variant: 'filled' }}
                    pageSizeOptions={[10, 20, 50, 100]}
                    locale={{ items_per_page: '/page' }}
                    summaryRender={([start, end], total) =>
                      `Showing ${start}-${end} of ${total} records`
                    }
                    onChange={(nextPage, nextSize) => {
                      setCurrentPage(nextPage);
                      setPageSize(nextSize);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: VOUCHERS -> STATISTICS */}
          {activeRoute === 'statistics' && (
            <div data-testid="hotspot-view-statistics" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="omada-hotspot-date-pill">
                  <span className="tabular-nums">{activeDashboardPreset.label}</span>
                  <Calendar
                    size={15}
                    className="shrink-0 text-[var(--omada-text-secondary)]"
                  />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[13.5px] text-[var(--omada-text-secondary)]">
                    Currency
                  </span>
                  <SSelect
                    aria-label="Statistics currency"
                    value={statsCurrency}
                    onChange={(v) => setStatsCurrency(v as 'USD' | 'AUD' | 'EUR')}
                    options={[
                      { label: 'USD', value: 'USD' },
                      { label: 'AUD', value: 'AUD' },
                      { label: 'EUR', value: 'EUR' },
                    ]}
                    style={{ width: 112 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="omada-hotspot-stat-card">
                  <div className="text-[13px] text-[var(--omada-text-secondary)]">
                    Total Voucher Sales
                  </div>
                  <div className="tabular-nums mt-1.5 text-[24px] font-semibold text-[var(--omada-text-primary)]">
                    {statsFormat(95)}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--omada-text-tertiary)]">
                    {VOUCHER_STATISTICS_DATA.totalVouchersCount} Total Vouchers Across 4 Groups
                  </div>
                </div>

                <div className="omada-hotspot-stat-card">
                  <div className="text-[13px] text-[var(--omada-text-secondary)]">
                    Used Vouchers Amount
                  </div>
                  <div className="tabular-nums mt-1.5 text-[24px] font-semibold text-[var(--omada-brand-text)]">
                    {statsFormat(39)}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--omada-text-tertiary)]">
                    {VOUCHER_STATISTICS_DATA.usedVouchersCount} Activated Sessions
                  </div>
                </div>

                <div className="omada-hotspot-stat-card">
                  <div className="text-[13px] text-[var(--omada-text-secondary)]">
                    Remaining Unused Value
                  </div>
                  <div className="tabular-nums mt-1.5 text-[24px] font-semibold text-[var(--omada-link)]">
                    {statsFormat(16)}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--omada-text-tertiary)]">
                    {VOUCHER_STATISTICS_DATA.unusedVouchersCount} Available Voucher Codes
                  </div>
                </div>
              </div>

              <section className="omada-hotspot-card px-5 py-4">
                <h2 className="m-0 mb-2 text-[15px] font-medium text-[var(--omada-text-primary)]">
                  Voucher Usage &amp; Revenue Trend
                </h2>
                <SChart height={280} option={statsChartOption} />
              </section>
            </div>
          )}

          {/* VIEW 4: AUTHORIZED CLIENTS */}
          {activeRoute === 'authorized-clients' && (
            <div data-testid="hotspot-view-authorized-clients" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <SInput
                    variant="filled"
                    allowClear
                    value={authClientSearch}
                    onChange={(e) => setAuthClientSearch(e.target.value)}
                    placeholder="Search Name, MAC, IP or Credential"
                    suffix={
                      <SIcon
                        name="input-search"
                        size={14}
                        className="text-[var(--omada-text-tertiary)]"
                      />
                    }
                    className="omada-hotspot-search"
                    style={{ width: 280 }}
                  />
                  <SSelect
                    aria-label="Filter auth type"
                    value={authTypeFilter}
                    onChange={(v) => setAuthTypeFilter(String(v))}
                    options={[
                      { label: 'All Auth Types', value: 'all' },
                      { label: 'Voucher', value: 'Voucher' },
                      { label: 'Local User', value: 'Local User' },
                      { label: 'Form Auth', value: 'Form Auth' },
                    ]}
                    style={{ width: 160 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    notification.success({
                      title: 'Authorized Clients Exported',
                      description: `Exported ${filteredAuthorizedClients.length} active hotspot client(s).`,
                    })
                  }
                  className="omada-hotspot-export-btn"
                >
                  <SIcon name="export" size={15} />
                  <span>Export</span>
                </button>
              </div>

              <div className="omada-hotspot-table-shell">
                <Table<HotspotAuthorizedClient>
                  rowKey="key"
                  pagination={false}
                  scroll={{ x: 1040 }}
                  dataSource={filteredAuthorizedClients}
                  className="omada-hotspot-table"
                  columns={[
                    { title: 'Client Name', dataIndex: 'name', key: 'name', width: 160 },
                    {
                      title: 'MAC Address',
                      dataIndex: 'mac',
                      key: 'mac',
                      width: 155,
                      render: (v: string) => <span className="tabular-nums">{v}</span>,
                    },
                    {
                      title: 'IP Address',
                      dataIndex: 'ip',
                      key: 'ip',
                      width: 128,
                      render: (v: string) => <span className="tabular-nums">{v}</span>,
                    },
                    { title: 'Auth Type', dataIndex: 'authType', key: 'authType', width: 112 },
                    {
                      title: 'Voucher / Account',
                      dataIndex: 'credential',
                      key: 'credential',
                      width: 160,
                    },
                    { title: 'SSID', dataIndex: 'ssid', key: 'ssid', width: 120 },
                    {
                      title: 'Remaining',
                      dataIndex: 'remainingTime',
                      key: 'remainingTime',
                      width: 100,
                      render: (v: string) => (
                        <span className="tabular-nums text-[var(--omada-brand-text)]">
                          {v}
                        </span>
                      ),
                    },
                    {
                      title: 'Traffic (Down / Up)',
                      key: 'traffic',
                      width: 160,
                      render: (_, rec) => (
                        <span className="tabular-nums">
                          {rec.downloadTraffic} / {rec.uploadTraffic}
                        </span>
                      ),
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      width: 100,
                      render: (_, rec) => (
                        <div className="flex items-center gap-2">
                          <Tooltip title="Extend 2 Hours">
                            <button
                              type="button"
                              aria-label={`Extend ${rec.name}`}
                              onClick={() => {
                                setAuthorizedClients((prev) =>
                                  prev.map((c) =>
                                    c.key === rec.key
                                      ? { ...c, remainingTime: '8h 44m' }
                                      : c,
                                  ),
                                );
                                notification.success({
                                  title: 'Session Extended',
                                  description: `Extended authorization for ${rec.name} by 2 hours.`,
                                });
                              }}
                              className="omada-hotspot-row-action-btn"
                            >
                              <SIcon name="extend-time" size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Unauthorize">
                            <button
                              type="button"
                              aria-label={`Unauthorize ${rec.name}`}
                              onClick={() => {
                                setAuthorizedClients((prev) =>
                                  prev.filter((c) => c.key !== rec.key),
                                );
                                notification.info({
                                  title: 'Client Unauthorized',
                                  description: `Revoked portal session for ${rec.name}.`,
                                });
                              }}
                              className="omada-hotspot-row-action-btn"
                            >
                              <SIcon name="unauthorize" size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* VIEW 5: LOCAL USERS */}
          {activeRoute === 'local-users' && (
            <div data-testid="hotspot-view-local-users" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SInput
                  variant="filled"
                  allowClear
                  value={localUserSearch}
                  onChange={(e) => setLocalUserSearch(e.target.value)}
                  placeholder="Search Username"
                  suffix={
                    <SIcon
                      name="input-search"
                      size={14}
                      className="text-[var(--omada-text-tertiary)]"
                    />
                  }
                  className="omada-hotspot-search"
                  style={{ width: 260 }}
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={selectedLocalUserKeys.length === 0}
                    onClick={() => {
                      setLocalUsers((prev) =>
                        prev.filter((u) => !selectedLocalUserKeys.includes(u.key)),
                      );
                      setSelectedLocalUserKeys([]);
                      notification.success({
                        title: 'Local Users Deleted',
                        description: 'Removed selected local hotspot users.',
                      });
                    }}
                    className="omada-hotspot-batch-btn is-danger"
                  >
                    <DeleteGlyph size={15} />
                    <span>Delete</span>
                  </button>

                  <SButton
                    variant="primary"
                    icon={<Plus size={15} />}
                    onClick={() => setCreateLocalUserOpen(true)}
                  >
                    Create Local User
                  </SButton>
                </div>
              </div>

              <div className="omada-hotspot-table-shell">
                <Table<HotspotLocalUser>
                  rowKey="key"
                  pagination={false}
                  scroll={{ x: 940 }}
                  dataSource={filteredLocalUsers}
                  rowSelection={{
                    columnWidth: 44,
                    selectedRowKeys: selectedLocalUserKeys,
                    onChange: (keys) => setSelectedLocalUserKeys(keys.map(String)),
                  }}
                  className="omada-hotspot-table"
                  columns={[
                    { title: 'Username', dataIndex: 'username', key: 'username', width: 150 },
                    {
                      title: 'Status',
                      dataIndex: 'enabled',
                      key: 'enabled',
                      width: 100,
                      render: (enabled: boolean, rec) => (
                        <SSwitch
                          size="small"
                          checked={enabled}
                          onChange={(checked) =>
                            setLocalUsers((prev) =>
                              prev.map((u) =>
                                u.key === rec.key ? { ...u, enabled: checked } : u,
                              ),
                            )
                          }
                        />
                      ),
                    },
                    { title: 'Expiration', dataIndex: 'expiration', key: 'expiration', width: 130 },
                    { title: 'Binding Type', dataIndex: 'bindingType', key: 'bindingType', width: 130 },
                    { title: 'Max Users', dataIndex: 'maxUsers', key: 'maxUsers', width: 100 },
                    { title: 'Rate Limit', dataIndex: 'rateLimit', key: 'rateLimit', width: 160 },
                    { title: 'Traffic Quota', dataIndex: 'trafficQuota', key: 'trafficQuota', width: 120 },
                    {
                      title: 'Action',
                      key: 'action',
                      width: 80,
                      render: (_, rec) => (
                        <button
                          type="button"
                          aria-label={`Delete ${rec.username}`}
                          onClick={() => {
                            setLocalUsers((prev) => prev.filter((u) => u.key !== rec.key));
                            notification.info({
                              title: 'Local User Deleted',
                              description: `Removed local user ${rec.username}.`,
                            });
                          }}
                          className="omada-hotspot-row-action-btn"
                        >
                          <SIcon name="delete" size={16} />
                        </button>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* VIEW 6: FORM AUTH DATA */}
          {activeRoute === 'form-auth' && (
            <div data-testid="hotspot-view-form-auth" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SInput
                  variant="filled"
                  allowClear
                  value={formAuthSearch}
                  onChange={(e) => setFormAuthSearch(e.target.value)}
                  placeholder="Search Name, Email, Company or MAC"
                  suffix={
                    <SIcon
                      name="input-search"
                      size={14}
                      className="text-[var(--omada-text-tertiary)]"
                    />
                  }
                  className="omada-hotspot-search"
                  style={{ width: 290 }}
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={selectedFormAuthKeys.length === 0}
                    onClick={() => {
                      setFormAuthRecords((prev) =>
                        prev.filter((r) => !selectedFormAuthKeys.includes(r.key)),
                      );
                      setSelectedFormAuthKeys([]);
                      notification.success({
                        title: 'Form Auth Records Deleted',
                        description: 'Removed selected survey submissions.',
                      });
                    }}
                    className="omada-hotspot-batch-btn is-danger"
                  >
                    <DeleteGlyph size={15} />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      notification.success({
                        title: 'Form Auth Data Exported',
                        description: `Exported ${filteredFormAuth.length} visitor submission(s).`,
                      })
                    }
                    className="omada-hotspot-export-btn"
                  >
                    <SIcon name="export" size={15} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="omada-hotspot-table-shell">
                <Table<HotspotFormAuthRecord>
                  rowKey="key"
                  pagination={false}
                  scroll={{ x: 1020 }}
                  dataSource={filteredFormAuth}
                  rowSelection={{
                    columnWidth: 44,
                    selectedRowKeys: selectedFormAuthKeys,
                    onChange: (keys) => setSelectedFormAuthKeys(keys.map(String)),
                  }}
                  className="omada-hotspot-table"
                  columns={[
                    { title: 'Portal Name', dataIndex: 'portalName', key: 'portalName', width: 170 },
                    { title: 'Name', dataIndex: 'fullName', key: 'fullName', width: 130 },
                    { title: 'Email', dataIndex: 'email', key: 'email', width: 190 },
                    { title: 'Company', dataIndex: 'company', key: 'company', width: 150 },
                    {
                      title: 'Client MAC',
                      dataIndex: 'clientMac',
                      key: 'clientMac',
                      width: 150,
                      render: (v: string) => <span className="tabular-nums">{v}</span>,
                    },
                    {
                      title: 'Submitted Time',
                      dataIndex: 'submittedAt',
                      key: 'submittedAt',
                      width: 185,
                      render: (v: string) => <span className="tabular-nums">{v}</span>,
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      width: 90,
                      render: (_, rec) => (
                        <div className="flex items-center gap-2">
                          <Tooltip title="Details">
                            <button
                              type="button"
                              aria-label={`Details ${rec.fullName}`}
                              onClick={() => setInspectedFormRecord(rec)}
                              className="omada-hotspot-row-action-btn"
                            >
                              <SIcon name="detail" size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <button
                              type="button"
                              aria-label={`Delete ${rec.fullName}`}
                              onClick={() =>
                                setFormAuthRecords((prev) =>
                                  prev.filter((r) => r.key !== rec.key),
                                )
                              }
                              className="omada-hotspot-row-action-btn"
                            >
                              <SIcon name="delete" size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* VIEW 7: OPERATORS */}
          {activeRoute === 'operators' && (
            <div data-testid="hotspot-view-operators" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SInput
                  variant="filled"
                  allowClear
                  value={operatorSearch}
                  onChange={(e) => setOperatorSearch(e.target.value)}
                  placeholder="Search Operator Name or Note"
                  suffix={
                    <SIcon
                      name="input-search"
                      size={14}
                      className="text-[var(--omada-text-tertiary)]"
                    />
                  }
                  className="omada-hotspot-search"
                  style={{ width: 260 }}
                />

                <SButton
                  variant="primary"
                  icon={<Plus size={15} />}
                  onClick={() => setCreateOperatorOpen(true)}
                >
                  Create Operator
                </SButton>
              </div>

              <div className="omada-hotspot-table-shell">
                <Table<HotspotOperatorRecord>
                  rowKey="key"
                  pagination={false}
                  scroll={{ x: 920 }}
                  dataSource={filteredOperators}
                  className="omada-hotspot-table"
                  columns={[
                    { title: 'Operator Name', dataIndex: 'name', key: 'name', width: 150 },
                    { title: 'Privilege', dataIndex: 'privilege', key: 'privilege', width: 110 },
                    { title: 'Valid Sites', dataIndex: 'validSites', key: 'validSites', width: 170 },
                    {
                      title: 'Last Login',
                      dataIndex: 'lastLogin',
                      key: 'lastLogin',
                      width: 190,
                      render: (v: string) => <span className="tabular-nums">{v}</span>,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (status: 'Active' | 'Disabled') => (
                        <span
                          className={
                            status === 'Active'
                              ? 'text-[var(--omada-brand-text)]'
                              : 'text-[var(--omada-text-tertiary)]'
                          }
                        >
                          ● {status}
                        </span>
                      ),
                    },
                    { title: 'Note', dataIndex: 'note', key: 'note', width: 220 },
                    {
                      title: 'Action',
                      key: 'action',
                      width: 90,
                      render: (_, rec) => (
                        <div className="flex items-center gap-2">
                          <Tooltip title="Delete">
                            <button
                              type="button"
                              aria-label={`Delete ${rec.name}`}
                              disabled={rec.name === 'hotspot_admin'}
                              onClick={() => {
                                setOperators((prev) =>
                                  prev.filter((o) => o.key !== rec.key),
                                );
                                notification.info({
                                  title: 'Operator Removed',
                                  description: `Removed operator ${rec.name}.`,
                                });
                              }}
                              className="omada-hotspot-row-action-btn disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <SIcon name="delete" size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Vouchers Group Modal */}
      <SModal
        size="default"
        title="Create Vouchers Group"
        open={createGroupOpen}
        onCancel={() => setCreateGroupOpen(false)}
        onOk={handleCreateVoucherGroup}
        okText="Save"
        destroyOnHidden
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-[160px_1fr] items-center gap-3">
            <label className="text-[13px] text-[var(--omada-text-secondary)]">
              Group Name
            </label>
            <SInput
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="VoucherGroup_5"
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-3">
            <label className="text-[13px] text-[var(--omada-text-secondary)]">
              Type
            </label>
            <SSelect
              value={newGroupMode}
              onChange={(v) => setNewGroupMode(v as 'Client' | 'Voucher')}
              options={[
                { label: 'Voucher (Single Code per Device)', value: 'Voucher' },
                { label: 'Client (Multi-Device Code)', value: 'Client' },
              ]}
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-3">
            <label className="text-[13px] text-[var(--omada-text-secondary)]">
              Amount (1 - 500)
            </label>
            <SNumberInput
              min={1}
              max={500}
              value={newGroupAmount}
              onChange={(v) => setNewGroupAmount(Number(v) || 10)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-3">
            <label className="text-[13px] text-[var(--omada-text-secondary)]">
              Duration (Hours)
            </label>
            <SNumberInput
              min={1}
              max={720}
              value={newGroupDurationHours}
              onChange={(v) => setNewGroupDurationHours(Number(v) || 8)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-3">
            <label className="text-[13px] text-[var(--omada-text-secondary)]">
              Unit Price ({currency})
            </label>
            <SNumberInput
              min={0}
              placeholder="Optional"
              value={newGroupUnitPrice}
              onChange={(v) => setNewGroupUnitPrice(v === null ? null : Number(v))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </SModal>

      {/* Voucher Group Details Modal */}
      <SModal
        size="default"
        title={detailsGroup ? `${detailsGroup.name} — Voucher Codes` : 'Voucher Details'}
        subtitle={detailsGroup ? `${detailsGroup.duration} · ${detailsGroup.usedAmount} / ${detailsGroup.totalAmount} Used` : undefined}
        open={Boolean(detailsGroup)}
        onCancel={() => setDetailsGroup(null)}
        footer={null}
        destroyOnHidden
      >
        {detailsGroup && (
          <div className="space-y-3">
            <div className="max-h-[340px] overflow-y-auto rounded border border-[var(--omada-border-divider)]">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead className="bg-[var(--omada-bg-table-header)] text-[var(--omada-text-secondary)]">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Voucher Code</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Clients</th>
                    <th className="px-3 py-2 font-semibold">Expiration</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsGroup.vouchers.map((v) => (
                    <tr
                      key={v.key}
                      className="border-t border-[var(--omada-border-divider)]"
                    >
                      <td className="tabular-nums px-3 py-2 font-mono font-medium text-[var(--omada-text-primary)]">
                        {v.code}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            v.status === 'Unused'
                              ? 'text-[var(--omada-brand-text)]'
                              : v.status === 'In Use'
                                ? 'text-[var(--omada-link)]'
                                : 'text-[var(--omada-color-error)]'
                          }
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="tabular-nums px-3 py-2 text-[var(--omada-text-secondary)]">
                        {v.usedClients}
                      </td>
                      <td className="px-3 py-2 text-[var(--omada-text-secondary)]">
                        {v.expiresAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <SButton variant="secondary" onClick={() => setDetailsGroup(null)}>
                Close
              </SButton>
              <SButton
                variant="primary"
                onClick={() => {
                  setPrintPreviewGroup(detailsGroup);
                  setDetailsGroup(null);
                }}
              >
                Print Unused
              </SButton>
            </div>
          </div>
        )}
      </SModal>

      {/* Print Vouchers Preview Modal */}
      <SModal
        size="default"
        title={
          printPreviewGroup
            ? `Print Unused Vouchers — ${printPreviewGroup.name}`
            : 'Print Vouchers'
        }
        subtitle={`Language: ${printingLanguage} · Currency: ${currency}`}
        open={Boolean(printPreviewGroup)}
        onCancel={() => setPrintPreviewGroup(null)}
        onOk={() => {
          notification.success({
            title: 'Print Job Sent',
            description: `Sent ${printPreviewGroup?.name} voucher sheet (${printingLanguage}) to printer.`,
          });
          setPrintPreviewGroup(null);
        }}
        okText="Print"
        destroyOnHidden
      >
        {printPreviewGroup && (
          <div className="grid max-h-[340px] grid-cols-2 gap-3 overflow-y-auto py-1">
            {printPreviewGroup.vouchers
              .filter((v) => v.status === 'Unused')
              .map((v) => (
                <div
                  key={v.key}
                  className="rounded-[6px] border border-dashed border-[var(--omada-border-strong)] bg-[var(--omada-bg-field)] p-3"
                >
                  <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--omada-text-tertiary)]">
                    {currentSite.label} · Wi-Fi Voucher
                  </div>
                  <div className="tabular-nums mt-1 font-mono text-[16px] font-semibold text-[var(--omada-brand-text)]">
                    {v.code}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--omada-text-secondary)]">
                    {printPreviewGroup.duration}
                  </div>
                </div>
              ))}
          </div>
        )}
      </SModal>

      {/* Create Local User Modal */}
      <SModal
        size="sm"
        title="Create Local User"
        open={createLocalUserOpen}
        onCancel={() => setCreateLocalUserOpen(false)}
        onOk={() => {
          if (!newLocalUsername.trim()) return;
          setLocalUsers((prev) => [
            ...prev,
            {
              key: `lu-${Date.now()}`,
              username: newLocalUsername.trim(),
              enabled: true,
              expiration: 'Dec 31, 2026',
              bindingType: 'No Binding',
              maxUsers: newLocalMaxUsers,
              rateLimit: '50 Mbps / 20 Mbps',
              trafficQuota: 'Unlimited',
            },
          ]);
          setNewLocalUsername('');
          setNewLocalPassword('');
          setCreateLocalUserOpen(false);
          notification.success({
            title: 'Local User Created',
            description: 'Added new Hotspot local user account.',
          });
        }}
        okText="Create"
        destroyOnHidden
      >
        <div className="space-y-3 pt-2">
          <div>
            <label className="mb-1 block text-[13px] text-[var(--omada-text-secondary)]">
              Username
            </label>
            <SInput
              value={newLocalUsername}
              onChange={(e) => setNewLocalUsername(e.target.value)}
              placeholder="guest_user_02"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-[var(--omada-text-secondary)]">
              Password
            </label>
            <SPasswordInput
              value={newLocalPassword}
              onChange={(e) => setNewLocalPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-[var(--omada-text-secondary)]">
              Max Concurrent Users
            </label>
            <SNumberInput
              min={1}
              max={100}
              value={newLocalMaxUsers}
              onChange={(v) => setNewLocalMaxUsers(Number(v) || 1)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </SModal>

      {/* Inspected Form Auth Record Modal */}
      <SModal
        size="sm"
        title="Form Auth Submission"
        open={Boolean(inspectedFormRecord)}
        onCancel={() => setInspectedFormRecord(null)}
        footer={null}
        destroyOnHidden
      >
        {inspectedFormRecord && (
          <div className="space-y-2 text-[13px]">
            <div>
              <span className="text-[var(--omada-text-tertiary)]">Portal: </span>
              <span className="font-medium text-[var(--omada-text-primary)]">
                {inspectedFormRecord.portalName}
              </span>
            </div>
            <div>
              <span className="text-[var(--omada-text-tertiary)]">Name: </span>
              <span>{inspectedFormRecord.fullName}</span>
            </div>
            <div>
              <span className="text-[var(--omada-text-tertiary)]">Email: </span>
              <span>{inspectedFormRecord.email}</span>
            </div>
            <div>
              <span className="text-[var(--omada-text-tertiary)]">Phone: </span>
              <span>{inspectedFormRecord.phone}</span>
            </div>
            <div>
              <span className="text-[var(--omada-text-tertiary)]">Company: </span>
              <span>{inspectedFormRecord.company}</span>
            </div>
            <div>
              <span className="text-[var(--omada-text-tertiary)]">MAC Address: </span>
              <span className="tabular-nums">{inspectedFormRecord.clientMac}</span>
            </div>
            <div>
              <span className="text-[var(--omada-text-tertiary)]">Submitted: </span>
              <span className="tabular-nums">{inspectedFormRecord.submittedAt}</span>
            </div>
          </div>
        )}
      </SModal>

      {/* Create Operator Modal */}
      <SModal
        size="sm"
        title="Create Operator"
        open={createOperatorOpen}
        onCancel={() => setCreateOperatorOpen(false)}
        onOk={() => {
          if (!newOperatorName.trim()) return;
          setOperators((prev) => [
            ...prev,
            {
              key: `op-${Date.now()}`,
              name: newOperatorName.trim(),
              privilege: newOperatorPrivilege,
              validSites: currentSite.label,
              lastLogin: 'Never',
              status: 'Active',
              note: newOperatorNote.trim() || 'Hotspot operator',
            },
          ]);
          setNewOperatorName('');
          setNewOperatorNote('');
          setCreateOperatorOpen(false);
          notification.success({
            title: 'Operator Created',
            description: 'Added new Hotspot Portal operator.',
          });
        }}
        okText="Create"
        destroyOnHidden
      >
        <div className="space-y-3 pt-2">
          <div>
            <label className="mb-1 block text-[13px] text-[var(--omada-text-secondary)]">
              Operator Name
            </label>
            <SInput
              value={newOperatorName}
              onChange={(e) => setNewOperatorName(e.target.value)}
              placeholder="lobby_operator"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-[var(--omada-text-secondary)]">
              Privilege
            </label>
            <SSelect
              value={newOperatorPrivilege}
              onChange={(v) => setNewOperatorPrivilege(v as 'Admin' | 'Operator')}
              options={[
                { label: 'Operator', value: 'Operator' },
                { label: 'Admin', value: 'Admin' },
              ]}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-[var(--omada-text-secondary)]">
              Note
            </label>
            <SInput
              value={newOperatorNote}
              onChange={(e) => setNewOperatorNote(e.target.value)}
              placeholder="Front desk voucher issuance"
            />
          </div>
        </div>
      </SModal>
    </div>
  );
};
