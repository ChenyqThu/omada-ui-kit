import type { OmadaClientIconName, OmadaIconName } from '@/omada';

export interface AnalyticsCategoryBreakdownApp {
  key: string;
  name: string;
  bytes: number;
  iconKey?: AnalyticsAppBadgeKey;
}

export interface AnalyticsCategoryItem {
  key: string;
  name: string;
  icon: OmadaIconName;
  bytes: number;
  paletteIndex: number;
  defaultSelected: boolean;
  showZeroPercent?: boolean;
  topApps: AnalyticsCategoryBreakdownApp[];
}

export type AnalyticsAppBadgeKey =
  | 'windows-store'
  | 'heytap'
  | 'xiaohongshu'
  | 'netease'
  | 'qq'
  | 'teams'
  | 'apple-push'
  | 'slack'
  | 'zoom'
  | 'google-services';

export interface AppBadgeVisualMeta {
  bgColor: string;
  fgColor: string;
  accentColor?: string;
  shortMark: string;
}

export const APP_BADGE_VISUALS: Record<AnalyticsAppBadgeKey, AppBadgeVisualMeta> = {
  'windows-store': { bgColor: '#EEF6FF', fgColor: '#0078D4', shortMark: 'win' },
  heytap: { bgColor: '#E7FAF2', fgColor: '#00B87C', shortMark: 'hey' },
  xiaohongshu: { bgColor: '#FF2442', fgColor: '#FFFFFF', shortMark: 'xhs' },
  netease: { bgColor: '#2B1618', fgColor: '#E60012', shortMark: 'ne' },
  qq: { bgColor: '#F2F4F7', fgColor: '#1E293B', accentColor: '#E62E2D', shortMark: 'qq' },
  teams: { bgColor: '#5059C9', fgColor: '#FFFFFF', shortMark: 'T' },
  'apple-push': { bgColor: '#1E293B', fgColor: '#FFFFFF', shortMark: 'apns' },
  slack: { bgColor: '#4A154B', fgColor: '#FFFFFF', shortMark: 'slk' },
  zoom: { bgColor: '#2D8CFF', fgColor: '#FFFFFF', shortMark: 'zm' },
  'google-services': { bgColor: '#F4F6FA', fgColor: '#4285F4', shortMark: 'G' },
};

export interface AnalyticsAppItem {
  key: string;
  name: string;
  badgeKey: AnalyticsAppBadgeKey;
  categoryKey: string;
  categoryName: string;
  categoryIcon: OmadaIconName;
  upBytes: number;
  downBytes: number;
  activeUsers: number;
  status: 'allowed' | 'blocked';
  usersUsing: string[];
  description: string;
}

export interface AnalyticsUserItem {
  key: string;
  name: string;
  clientIcon: OmadaClientIconName;
  forceLightIcon?: boolean;
  mac: string;
  ip: string;
  network: string;
  upBytes: number;
  downBytes: number;
  topApp: string;
}

export interface AnalyticsDatePreset {
  key: string;
  label: string;
  scaleFactor: number;
}

export type ReportTimeRangeKey = '1D' | '1W' | '1M';

export interface ReportsClientOverviewData {
  uniqueClients: number;
  avgClientsPerDay: number;
  avgUsagePerClient: string;
  clientsOverviewTotal: number;
  clientsOverviewBreakdown: Array<{
    key: string;
    label: string;
    count: number;
    percent: number;
    paletteIndex: number;
    overrideThemeColor?: 'warning';
  }>;
  ssidTotal: number;
  ssidDistribution: Array<{
    key: string;
    label: string;
    count: number;
    percent: number;
    paletteIndex: number;
  }>;
  onboardingTimestamps: string[];
  onboardingTickLabels: Set<number>;
  onboardingSeries: {
    s0to1: number[];
    s1to3: number[];
    s3to12: number[];
    sGt12: number[];
  };
  onboardingSuccessRate: string;
  onboardingBuckets: Array<{
    label: string;
    value: number;
    isFailure?: boolean;
  }>;
}

const KB = 1024;
const MB = 1024 * 1024;

/**
 * Formats a byte count into Omada's KB / MB / GB readout (binary KiB/MiB/GiB units).
 */
export function formatTrafficBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  if (bytes < MB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  }
  if (bytes < 1024 * MB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * MB)).toFixed(2)} GB`;
}

export function formatTrafficPercent(partBytes: number, totalBytes: number): number {
  if (totalBytes <= 0 || partBytes <= 0) return 0;
  return Math.round((partBytes / totalBytes) * 100);
}

export const ANALYTICS_DATE_PRESETS: AnalyticsDatePreset[] = [
  { key: 'sep-18-19', label: 'Sep 18, 2025  -  Sep 19, 2025', scaleFactor: 1 },
  { key: 'sep-12-19', label: 'Sep 12, 2025  -  Sep 19, 2025', scaleFactor: 3.4 },
  { key: 'aug-20-sep-19', label: 'Aug 20, 2025  -  Sep 19, 2025', scaleFactor: 8.2 },
];

/**
 * Exact 20 application categories (sorted descending by traffic so 2-column grid matches
 * `steps/281/media_0.png` row-by-row; top 15 selected by default sum to `176.14 MB`).
 */
export const ANALYTICS_CATEGORIES: AnalyticsCategoryItem[] = [
  {
    key: 'app-stores',
    name: 'App-Stores and OS Updates',
    icon: 'app-category-app-stores-and-os-updates',
    bytes: Math.round(58.333 * MB),
    paletteIndex: 0,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'windows-store', name: 'Windows Store', bytes: Math.round(58.30 * MB), iconKey: 'windows-store' },
      { key: 'app-stores-other', name: 'Other', bytes: Math.round(0.03 * MB) },
    ],
  },
  {
    key: 'dev-tools',
    name: 'Development Tools and Services',
    icon: 'app-category-development-tools-and-services',
    bytes: Math.round(46.343 * MB),
    paletteIndex: 1,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'heytap', name: 'HeyTap', bytes: Math.round(46.34 * MB), iconKey: 'heytap' },
    ],
  },
  {
    key: 'social',
    name: 'Social',
    icon: 'app-category-social',
    bytes: Math.round(23.313 * MB),
    paletteIndex: 2,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'xiaohongshu', name: 'Xiaohongshu', bytes: Math.round(23.21 * MB), iconKey: 'xiaohongshu' },
      { key: 'social-other', name: 'Other', bytes: Math.round(0.10 * MB) },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise Services',
    icon: 'app-category-enterprise-services',
    bytes: Math.round(18.933 * MB),
    paletteIndex: 3,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'netease', name: 'NetEase', bytes: Math.round(13.87 * MB), iconKey: 'netease' },
      { key: 'apple-push', name: 'Apple Push', bytes: Math.round(5.06 * MB), iconKey: 'apple-push' },
    ],
  },
  {
    key: 'messaging',
    name: 'Messaging',
    icon: 'app-category-messaging',
    bytes: Math.round(12.182 * MB),
    paletteIndex: 4,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'qq', name: 'QQ', bytes: Math.round(10.58 * MB), iconKey: 'qq' },
      { key: 'slack', name: 'Slack', bytes: Math.round(1.60 * MB), iconKey: 'slack' },
    ],
  },
  {
    key: 'conference',
    name: 'Conference',
    icon: 'app-category-conference',
    bytes: Math.round(6.072 * MB),
    paletteIndex: 5,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'teams', name: 'Microsoft Teams', bytes: Math.round(4.62 * MB), iconKey: 'teams' },
      { key: 'zoom', name: 'Zoom', bytes: Math.round(1.45 * MB), iconKey: 'zoom' },
    ],
  },
  {
    key: 'ads-analytics',
    name: 'Advertisement and Analytics',
    icon: 'app-category-advertisement-and-analytic-services',
    bytes: Math.round(3.971 * MB),
    paletteIndex: 6,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'google-services', name: 'Google Services', bytes: Math.round(3.97 * MB), iconKey: 'google-services' },
    ],
  },
  {
    key: 'education',
    name: 'Education',
    icon: 'app-category-education',
    bytes: Math.round(1.791 * MB),
    paletteIndex: 7,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'coursera', name: 'Coursera Portal', bytes: Math.round(1.79 * MB) },
    ],
  },
  {
    key: 'news',
    name: 'News',
    icon: 'app-category-news',
    bytes: Math.round(1.761 * MB),
    paletteIndex: 8,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'apple-news', name: 'News Feed', bytes: Math.round(1.76 * MB) },
    ],
  },
  {
    key: 'e-commerce',
    name: 'E-Commerce',
    icon: 'app-category-e-commerce',
    bytes: Math.round(1.051 * MB),
    paletteIndex: 9,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'storefront', name: 'Retail CDN', bytes: Math.round(1.05 * MB) },
    ],
  },
  {
    key: 'navigation',
    name: 'Navigation',
    icon: 'app-category-navigation',
    bytes: Math.round(789.96 * KB),
    paletteIndex: 10,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'maps-tile', name: 'Maps Tile Service', bytes: Math.round(789.96 * KB) },
    ],
  },
  {
    key: 'search-engine',
    name: 'Search Engine',
    icon: 'app-category-search-engine',
    bytes: Math.round(649.01 * KB),
    paletteIndex: 11,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'google-search', name: 'Search Indexer', bytes: Math.round(649.01 * KB) },
    ],
  },
  {
    key: 'cloud-cdn',
    name: 'Cloud and CDN Services',
    icon: 'app-category-cloud-and-cdn-services',
    bytes: Math.round(455.88 * KB),
    paletteIndex: 12,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'cloudflare-edge', name: 'Edge CDN Cache', bytes: Math.round(455.88 * KB) },
    ],
  },
  {
    key: 'business',
    name: 'Business',
    icon: 'app-category-generic',
    bytes: Math.round(395.18 * KB),
    paletteIndex: 13,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'erp-sync', name: 'ERP Workspace', bytes: Math.round(395.18 * KB) },
    ],
  },
  {
    key: 'streaming',
    name: 'Streaming',
    icon: 'app-category-streaming',
    bytes: Math.round(154.20 * KB),
    paletteIndex: 14,
    defaultSelected: true,
    showZeroPercent: true,
    topApps: [
      { key: 'media-stream', name: 'Media HLS', bytes: Math.round(154.20 * KB) },
    ],
  },
  {
    key: 'file-transfer',
    name: 'Filetransfer',
    icon: 'app-category-file-transfer',
    bytes: Math.round(118.58 * KB),
    paletteIndex: 15,
    defaultSelected: false,
    showZeroPercent: false,
    topApps: [
      { key: 'sftp-sync', name: 'SFTP Sync', bytes: Math.round(118.58 * KB) },
    ],
  },
  {
    key: 'voip',
    name: 'Voice over IP',
    icon: 'app-category-voice-over-ip',
    bytes: Math.round(49.63 * KB),
    paletteIndex: 16,
    defaultSelected: false,
    showZeroPercent: false,
    topApps: [
      { key: 'sip-trunk', name: 'SIP Signaling', bytes: Math.round(49.63 * KB) },
    ],
  },
  {
    key: 'finance',
    name: 'Finance',
    icon: 'app-category-finance',
    bytes: Math.round(44.38 * KB),
    paletteIndex: 17,
    defaultSelected: false,
    showZeroPercent: false,
    topApps: [
      { key: 'billing-gateway', name: 'Billing API', bytes: Math.round(44.38 * KB) },
    ],
  },
  {
    key: 'device-security',
    name: 'Device Security',
    icon: 'app-category-device-security',
    bytes: Math.round(29.31 * KB),
    paletteIndex: 18,
    defaultSelected: false,
    showZeroPercent: false,
    topApps: [
      { key: 'endpoint-av', name: 'Endpoint Telemetry', bytes: Math.round(29.31 * KB) },
    ],
  },
  {
    key: 'web',
    name: 'Web',
    icon: 'app-category-web',
    bytes: 0,
    paletteIndex: 19,
    defaultSelected: false,
    showZeroPercent: false,
    topApps: [],
  },
];

export const ANALYTICS_APPS: AnalyticsAppItem[] = [
  {
    key: 'windows-store',
    name: 'Windows Store',
    badgeKey: 'windows-store',
    categoryKey: 'app-stores',
    categoryName: 'App-Stores and OS Updates',
    categoryIcon: 'app-category-app-stores-and-os-updates',
    upBytes: Math.round(365.71 * KB),
    downBytes: Math.round(57.94 * MB),
    activeUsers: 1,
    status: 'allowed',
    usersUsing: ['Test_PC'],
    description: 'Microsoft Store application packages and Windows Update delta downloads.',
  },
  {
    key: 'heytap',
    name: 'HeyTap',
    badgeKey: 'heytap',
    categoryKey: 'dev-tools',
    categoryName: 'Development Tools and Services',
    categoryIcon: 'app-category-development-tools-and-services',
    upBytes: Math.round(1.46 * MB),
    downBytes: Math.round(44.88 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['Neffos_X20_Pro', 'StarLight'],
    description: 'Mobile SDK diagnostics, OTA asset sync, and cloud telemetry pipeline.',
  },
  {
    key: 'xiaohongshu',
    name: 'Xiaohongshu',
    badgeKey: 'xiaohongshu',
    categoryKey: 'social',
    categoryName: 'Social',
    categoryIcon: 'app-category-social',
    upBytes: Math.round(2.25 * MB),
    downBytes: Math.round(20.96 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['StarLight', 'Neffos_X20_Pro'],
    description: 'Social media image feed, short video CDN delivery, and content API.',
  },
  {
    key: 'netease',
    name: 'NetEase',
    badgeKey: 'netease',
    categoryKey: 'enterprise',
    categoryName: 'Enterprise Services',
    categoryIcon: 'app-category-enterprise-services',
    upBytes: Math.round(2.00 * MB),
    downBytes: Math.round(11.87 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['Test_PC', 'StarLight'],
    description: 'Enterprise mail sync, document portal, and collaboration endpoints.',
  },
  {
    key: 'qq',
    name: 'QQ',
    badgeKey: 'qq',
    categoryKey: 'messaging',
    categoryName: 'Messaging',
    categoryIcon: 'app-category-messaging',
    upBytes: Math.round(889.37 * KB),
    downBytes: Math.round(9.71 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['Test_PC', 'Neffos_X20_Pro'],
    description: 'Instant messaging, presence heartbeat, and rich attachment transfer.',
  },
  {
    key: 'teams',
    name: 'Microsoft Teams',
    badgeKey: 'teams',
    categoryKey: 'conference',
    categoryName: 'Conference',
    categoryIcon: 'app-category-conference',
    upBytes: Math.round(1.49 * MB),
    downBytes: Math.round(4.58 * MB),
    activeUsers: 3,
    status: 'allowed',
    usersUsing: ['Test_PC', 'StarLight', 'Neffos_X20_Pro'],
    description: 'Real-time audio/video conferencing, screen sharing, and chat channels.',
  },
  {
    key: 'apple-push',
    name: 'Apple Push',
    badgeKey: 'apple-push',
    categoryKey: 'enterprise',
    categoryName: 'Enterprise Services',
    categoryIcon: 'app-category-enterprise-services',
    upBytes: Math.round(612.40 * KB),
    downBytes: Math.round(4.46 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['StarLight', 'Test_PC'],
    description: 'APNs persistent notification channel and MDM policy push payloads.',
  },
  {
    key: 'slack',
    name: 'Slack',
    badgeKey: 'slack',
    categoryKey: 'messaging',
    categoryName: 'Messaging',
    categoryIcon: 'app-category-messaging',
    upBytes: Math.round(318.20 * KB),
    downBytes: Math.round(1.29 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['Test_PC', 'StarLight'],
    description: 'Workspace WebSocket messaging and file preview requests.',
  },
  {
    key: 'zoom',
    name: 'Zoom',
    badgeKey: 'zoom',
    categoryKey: 'conference',
    categoryName: 'Conference',
    categoryIcon: 'app-category-conference',
    upBytes: Math.round(390.15 * KB),
    downBytes: Math.round(1.06 * MB),
    activeUsers: 2,
    status: 'allowed',
    usersUsing: ['Test_PC', 'Neffos_X20_Pro'],
    description: 'HD video meeting media streams and cloud webinar signaling.',
  },
  {
    key: 'google-services',
    name: 'Google Services',
    badgeKey: 'google-services',
    categoryKey: 'ads-analytics',
    categoryName: 'Advertisement and Analytics',
    categoryIcon: 'app-category-advertisement-and-analytic-services',
    upBytes: Math.round(642.10 * KB),
    downBytes: Math.round(3.34 * MB),
    activeUsers: 3,
    status: 'allowed',
    usersUsing: ['Test_PC', 'StarLight', 'Neffos_X20_Pro'],
    description: 'Analytics telemetry beacons, font CDN, and Google Play API traffic.',
  },
];

export const ANALYTICS_USERS: AnalyticsUserItem[] = [
  {
    key: 'test-pc',
    name: 'Test_PC',
    clientIcon: 'computer',
    mac: '1C-1B-0D-F7-E0-96',
    ip: '192.168.0.200',
    network: 'Default (Wired)',
    upBytes: Math.round(14.82 * MB),
    downBytes: Math.round(78.44 * MB),
    topApp: 'Windows Store',
  },
  {
    key: 'starlight',
    name: 'StarLight',
    clientIcon: 'iphone',
    forceLightIcon: true,
    mac: 'A4-83-E7-4B-91-22',
    ip: '192.168.0.116',
    network: 'Employee_Network_5',
    upBytes: Math.round(6.14 * MB),
    downBytes: Math.round(48.92 * MB),
    topApp: 'Xiaohongshu',
  },
  {
    key: 'neffos-x20-pro',
    name: 'Neffos_X20_Pro',
    clientIcon: 'android-phone',
    mac: '00-0A-EB-93-21-54',
    ip: '192.168.0.107',
    network: 'Employee_Network_5',
    upBytes: Math.round(3.26 * MB),
    downBytes: Math.round(24.18 * MB),
    topApp: 'HeyTap',
  },
  {
    key: 'cc-28-aa-75-e6-02',
    name: 'CC-28-AA-75-E6-02',
    clientIcon: 'other',
    mac: 'CC-28-AA-75-E6-02',
    ip: '192.168.0.190',
    network: 'Default (Wired)',
    upBytes: Math.round(92.40 * KB),
    downBytes: Math.round(294.12 * KB),
    topApp: 'NetEase',
  },
];

function buildOnboardingTimeline(range: ReportTimeRangeKey) {
  const slots: string[] = [];
  const tickSet = new Set<number>();
  const labels =
    range === '1D'
      ? [
          '05:25 pm',
          '07:10 pm',
          '08:55 pm',
          '10:40 pm',
          '12:25 am',
          '02:10 am',
          '03:55 am',
          '05:40 am',
          '07:25 am',
          '09:10 am',
          '10:55 am',
          '12:40 pm',
          '02:25 pm',
          '04:10 pm',
        ]
      : range === '1W'
        ? ['Sep 13', 'Sep 14', 'Sep 15', 'Sep 16', 'Sep 17', 'Sep 18', 'Sep 19']
        : ['Aug 21', 'Aug 26', 'Aug 31', 'Sep 05', 'Sep 10', 'Sep 15', 'Sep 19'];

  const totalBars = range === '1D' ? 280 : 140;
  const s0to1 = new Array<number>(totalBars).fill(0);
  const s1to3 = new Array<number>(totalBars).fill(0);
  const s3to12 = new Array<number>(totalBars).fill(0);
  const sGt12 = new Array<number>(totalBars).fill(0);

  for (let i = 0; i < totalBars; i += 1) {
    const labelIndex = Math.round((i / (totalBars - 1)) * (labels.length - 1));
    slots.push(labels[labelIndex]);
  }
  labels.forEach((lbl, idx) => {
    const slotIdx = Math.round((idx / (labels.length - 1)) * (totalBars - 1));
    tickSet.add(slotIdx);
    slots[slotIdx] = lbl;
  });

  if (range === '1D') {
    const greenOne = [1, 2, 26, 185, 186, 189, 191, 202, 205, 217, 218, 248, 253, 256, 278];
    for (const idx of greenOne) {
      if (idx < totalBars) s0to1[idx] = 1;
    }
    s0to1[198] = 2;
  } else if (range === '1W') {
    const bars1 = [4, 18, 29, 44, 58, 72, 86, 95, 108, 121, 134];
    for (const idx of bars1) s0to1[idx] = 2;
    s0to1[45] = 3;
    s0to1[96] = 4;
    s1to3[59] = 1;
  } else {
    for (let i = 3; i < totalBars; i += 9) {
      s0to1[i] = i % 18 === 3 ? 3 : 2;
    }
    s1to3[38] = 1;
    s1to3[92] = 1;
    s3to12[64] = 1;
  }

  return { slots, tickSet, s0to1, s1to3, s3to12, sGt12 };
}

export const REPORTS_CLIENT_APP_DATA: Record<ReportTimeRangeKey, ReportsClientOverviewData> = {
  '1D': (() => {
    const t = buildOnboardingTimeline('1D');
    return {
      uniqueClients: 4,
      avgClientsPerDay: 4,
      avgUsagePerClient: '875.77 MB',
      clientsOverviewTotal: 4,
      clientsOverviewBreakdown: [
        { key: '24g', label: '2.4 GHz Clients', count: 0, percent: 0, paletteIndex: 7, overrideThemeColor: 'warning' },
        { key: '5g', label: '5 GHz Clients', count: 2, percent: 50, paletteIndex: 1 },
        { key: '6g', label: '6 GHz Clients', count: 0, percent: 0, paletteIndex: 3 },
        { key: 'wired', label: 'Wired Clients', count: 2, percent: 50, paletteIndex: 0 },
      ],
      ssidTotal: 2,
      ssidDistribution: [
        { key: 'emp-4', label: 'Employee_Network_4', count: 5, percent: 63, paletteIndex: 0 },
        { key: 'emp-5', label: 'Employee_Network_5', count: 3, percent: 37, paletteIndex: 1 },
        { key: 'guest-2', label: 'Guest_Network_2', count: 0, percent: 0, paletteIndex: 2 },
        { key: 'guest-3', label: 'Guest_Network_3', count: 0, percent: 0, paletteIndex: 3 },
        { key: 'emp-3', label: 'Employee_Network_3', count: 0, percent: 0, paletteIndex: 4 },
        { key: 'others', label: 'Others', count: 0, percent: 0, paletteIndex: 5 },
      ],
      onboardingTimestamps: t.slots,
      onboardingTickLabels: t.tickSet,
      onboardingSeries: {
        s0to1: t.s0to1,
        s1to3: t.s1to3,
        s3to12: t.s3to12,
        sGt12: t.sGt12,
      },
      onboardingSuccessRate: '100.00%',
      onboardingBuckets: [
        { label: '<2s', value: 17 },
        { label: '2-4s', value: 0 },
        { label: '4-6s', value: 0 },
        { label: '6-8s', value: 0 },
        { label: '8-10s', value: 0 },
        { label: '≥10s', value: 0 },
        { label: 'Failure', value: 4, isFailure: true },
      ],
    };
  })(),
  '1W': (() => {
    const t = buildOnboardingTimeline('1W');
    return {
      uniqueClients: 14,
      avgClientsPerDay: 8,
      avgUsagePerClient: '1.42 GB',
      clientsOverviewTotal: 14,
      clientsOverviewBreakdown: [
        { key: '24g', label: '2.4 GHz Clients', count: 2, percent: 14, paletteIndex: 7, overrideThemeColor: 'warning' },
        { key: '5g', label: '5 GHz Clients', count: 7, percent: 50, paletteIndex: 1 },
        { key: '6g', label: '6 GHz Clients', count: 1, percent: 7, paletteIndex: 3 },
        { key: 'wired', label: 'Wired Clients', count: 4, percent: 29, paletteIndex: 0 },
      ],
      ssidTotal: 10,
      ssidDistribution: [
        { key: 'emp-4', label: 'Employee_Network_4', count: 18, percent: 55, paletteIndex: 0 },
        { key: 'emp-5', label: 'Employee_Network_5', count: 11, percent: 33, paletteIndex: 1 },
        { key: 'guest-2', label: 'Guest_Network_2', count: 3, percent: 9, paletteIndex: 2 },
        { key: 'guest-3', label: 'Guest_Network_3', count: 0, percent: 0, paletteIndex: 3 },
        { key: 'emp-3', label: 'Employee_Network_3', count: 1, percent: 3, paletteIndex: 4 },
        { key: 'others', label: 'Others', count: 0, percent: 0, paletteIndex: 5 },
      ],
      onboardingTimestamps: t.slots,
      onboardingTickLabels: t.tickSet,
      onboardingSeries: {
        s0to1: t.s0to1,
        s1to3: t.s1to3,
        s3to12: t.s3to12,
        sGt12: t.sGt12,
      },
      onboardingSuccessRate: '98.40%',
      onboardingBuckets: [
        { label: '<2s', value: 52 },
        { label: '2-4s', value: 6 },
        { label: '4-6s', value: 2 },
        { label: '6-8s', value: 1 },
        { label: '8-10s', value: 0 },
        { label: '≥10s', value: 1 },
        { label: 'Failure', value: 5, isFailure: true },
      ],
    };
  })(),
  '1M': (() => {
    const t = buildOnboardingTimeline('1M');
    return {
      uniqueClients: 28,
      avgClientsPerDay: 11,
      avgUsagePerClient: '4.86 GB',
      clientsOverviewTotal: 28,
      clientsOverviewBreakdown: [
        { key: '24g', label: '2.4 GHz Clients', count: 4, percent: 14, paletteIndex: 7, overrideThemeColor: 'warning' },
        { key: '5g', label: '5 GHz Clients', count: 14, percent: 50, paletteIndex: 1 },
        { key: '6g', label: '6 GHz Clients', count: 2, percent: 7, paletteIndex: 3 },
        { key: 'wired', label: 'Wired Clients', count: 8, percent: 29, paletteIndex: 0 },
      ],
      ssidTotal: 20,
      ssidDistribution: [
        { key: 'emp-4', label: 'Employee_Network_4', count: 42, percent: 56, paletteIndex: 0 },
        { key: 'emp-5', label: 'Employee_Network_5', count: 24, percent: 32, paletteIndex: 1 },
        { key: 'guest-2', label: 'Guest_Network_2', count: 6, percent: 8, paletteIndex: 2 },
        { key: 'guest-3', label: 'Guest_Network_3', count: 2, percent: 3, paletteIndex: 3 },
        { key: 'emp-3', label: 'Employee_Network_3', count: 1, percent: 1, paletteIndex: 4 },
        { key: 'others', label: 'Others', count: 0, percent: 0, paletteIndex: 5 },
      ],
      onboardingTimestamps: t.slots,
      onboardingTickLabels: t.tickSet,
      onboardingSeries: {
        s0to1: t.s0to1,
        s1to3: t.s1to3,
        s3to12: t.s3to12,
        sGt12: t.sGt12,
      },
      onboardingSuccessRate: '97.90%',
      onboardingBuckets: [
        { label: '<2s', value: 142 },
        { label: '2-4s', value: 18 },
        { label: '4-6s', value: 7 },
        { label: '6-8s', value: 3 },
        { label: '8-10s', value: 1 },
        { label: '≥10s', value: 3 },
        { label: 'Failure', value: 9, isFailure: true },
      ],
    };
  })(),
};

export const REPORTS_SUMMARY_DATA = {
  kpis: [
    { key: 'traffic', label: 'Total Site Traffic', value: '2.12 GB', meta: '↓ 1.68 GB  ·  ↑ 452.10 MB' },
    { key: 'devices', label: 'Managed Devices', value: '9', meta: '9 Connected  ·  0 Offline' },
    { key: 'clients', label: 'Unique Clients', value: '4', meta: '2 Wired  ·  2 Wireless' },
    { key: 'availability', label: 'Site Availability', value: '99.94%', meta: '0 Critical Incidents' },
  ],
  trafficTrendLabels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  trafficDownloadMb: [120, 84, 310, 485, 412, 198, 72],
  trafficUploadMb: [28, 19, 82, 126, 118, 54, 25],
};

export const REPORTS_WIRED_DATA = {
  kpis: [
    { key: 'wired-clients', label: 'Wired Clients', value: '2' },
    { key: 'active-ports', label: 'Active Switch Ports', value: '14 / 32' },
    { key: 'poe-budget', label: 'Total PoE Consumption', value: '32.80 W / 150.00 W' },
  ],
  portSpeeds: [
    { key: '1000m', label: '1000 Mbps', count: 11, display: '11 (79%)', paletteIndex: 1 },
    { key: '2500m', label: '2.5 Gbps', count: 2, display: '2 (14%)', paletteIndex: 0 },
    { key: '100m', label: '10/100 Mbps', count: 1, display: '1 (7%)', paletteIndex: 7 },
  ],
  switchTraffic: [
    { name: 'SalesDepartment_Switch_3', rxMb: 540, txMb: 186 },
    { name: 'CTOOffice_Switch_1', rxMb: 380, txMb: 142 },
    { name: 'ServerRoom_Switch_2', rxMb: 295, txMb: 98 },
  ],
};

export const REPORTS_WIRELESS_DATA = {
  kpis: [
    { key: 'wireless-clients', label: 'Wireless Clients', value: '2' },
    { key: 'avg-rssi', label: 'Average Signal (RSSI)', value: '-56 dBm' },
    { key: 'channel-retry', label: 'Avg TX Retry Rate', value: '3.2%' },
  ],
  bandDistribution: [
    { key: '5g', label: '5 GHz Radio', count: 2, display: '2 (100%)', paletteIndex: 1 },
    { key: '24g', label: '2.4 GHz Radio', count: 0, display: '0 (0%)', paletteIndex: 7 },
    { key: '6g', label: '6 GHz Radio', count: 0, display: '0 (0%)', paletteIndex: 3 },
  ],
  apThroughput: [
    { name: 'StorageRoom_Eap_3', downMb: 233.5, upMb: 42.1 },
    { name: 'COOOffice_Eap_1', downMb: 64.2, upMb: 18.4 },
    { name: 'BreakRoom_Eap_2', downMb: 18.7, upMb: 4.9 },
  ],
};
