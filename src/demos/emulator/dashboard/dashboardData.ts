import type { OmadaClientIconName, OmadaIconName, OmadaProductName } from '@/omada';
import type { SApDistributionCluster } from '../../../omada/components/SApDistributionRuler';
import type { SChannelBand } from '../../../omada/components/SChannelUtilization';
import type { SHealthTickStatus, SHealthTrendRow } from '../../../omada/components/SHealthTrendBar';

export type DashboardMainTabKey = 'overview' | 'topology' | 'wifi' | 'clients' | 'traffic';
export type DashboardTimeRangeKey = '1D' | '1W' | '1M';
export type ActivityModeKey = 'internet' | 'wifi' | 'isp';

export interface DashboardWanPort {
  key: string;
  label: string;
  shortLabel: string;
  status: 'up' | 'down';
  downRate: string;
  upRate: string;
  wanIp: string;
}

export interface NetworkOverviewItem {
  key: string;
  label: string;
  count: number;
  icon: OmadaIconName;
  routeKey: string;
}

export interface TopClientTrafficItem {
  key: string;
  name: string;
  traffic: string;
  clientIcon: OmadaClientIconName;
  forceLightIcon?: boolean;
  mac: string;
  ssidOrVlan: string;
}

export interface TopAppTrafficItem {
  key: string;
  name: string;
  traffic: string;
  badgeKey: 'm365' | 'zoom' | 'slack' | 'aws' | 'salesforce';
  category: string;
}

export interface ActivitySeriesDataset {
  totalLabel: string;
  yMaxMbps: number;
  yTickLabels: string[];
  timestamps: string[];
  uploadMbps: number[];
  downloadMbps: number[];
  wiredClients: number[];
  wirelessClients: number[];
}

export const DASHBOARD_TIMESTAMP = 'Sep 19, 2025 05:10:21 pm (DST)(UTC+08:00)';

export const DASHBOARD_HEALTH_SCORES = {
  overall: 90,
  wifi: 86,
  client: 85,
  wan: 0,
  device: 80,
} as const;

export const DASHBOARD_GATEWAY = {
  name: 'MainOffice_Gateway_2',
  model: 'ER707-M2 v1.0',
  wanPorts: [
    {
      key: 'wan1',
      label: '2.5G WAN/LAN1',
      shortLabel: '2.5G WAN/L...',
      status: 'up',
      downRate: '0',
      upRate: '0',
      wanIp: '192.168.254.100',
    },
    {
      key: 'wan3',
      label: 'WAN/LAN3',
      shortLabel: 'WAN/LAN3',
      status: 'up',
      downRate: '0',
      upRate: '0',
      wanIp: '192.168.100.2',
    },
  ] satisfies DashboardWanPort[],
};

function buildHealthPattern(
  length: number,
  ranges: Array<{ start: number; end: number; status: SHealthTickStatus }>,
  defaultStatus: SHealthTickStatus = 'good',
): SHealthTickStatus[] {
  const ticks: SHealthTickStatus[] = Array.from({ length }, () => defaultStatus);
  for (const r of ranges) {
    for (let i = r.start; i <= r.end && i < length; i++) {
      if (i >= 0) ticks[i] = r.status;
    }
  }
  return ticks;
}

export const HEALTH_TREND_BY_RANGE: Record<DashboardTimeRangeKey, SHealthTrendRow[]> = {
  '1D': [
    {
      key: 'device',
      label: 'Device',
      ticks: buildHealthPattern(96, [
        { start: 0, end: 0, status: 'fair' },
        { start: 2, end: 2, status: 'poor' },
        { start: 4, end: 4, status: 'fair' },
        { start: 7, end: 7, status: 'poor' },
        { start: 22, end: 47, status: 'fair' },
        { start: 48, end: 51, status: 'poor' },
        { start: 52, end: 55, status: 'fair' },
        { start: 67, end: 69, status: 'fair' },
      ]),
    },
    {
      key: 'client',
      label: 'Client',
      ticks: buildHealthPattern(96, [{ start: 48, end: 49, status: 'good' }]),
    },
    {
      key: 'wifi',
      label: 'Wi-Fi',
      ticks: buildHealthPattern(96, [{ start: 47, end: 62, status: 'fair' }]),
    },
    {
      key: 'wan',
      label: 'WAN',
      ticks: buildHealthPattern(96, [
        { start: 0, end: 0, status: 'poor' },
        { start: 47, end: 62, status: 'poor' },
      ]),
    },
  ],
  '1W': [
    {
      key: 'device',
      label: 'Device',
      ticks: buildHealthPattern(96, [
        { start: 12, end: 24, status: 'fair' },
        { start: 54, end: 57, status: 'poor' },
        { start: 72, end: 81, status: 'fair' },
      ]),
    },
    {
      key: 'client',
      label: 'Client',
      ticks: buildHealthPattern(96, [{ start: 55, end: 58, status: 'fair' }]),
    },
    {
      key: 'wifi',
      label: 'Wi-Fi',
      ticks: buildHealthPattern(96, [
        { start: 28, end: 36, status: 'fair' },
        { start: 66, end: 74, status: 'fair' },
      ]),
    },
    {
      key: 'wan',
      label: 'WAN',
      ticks: buildHealthPattern(96, [{ start: 50, end: 60, status: 'poor' }]),
    },
  ],
  '1M': [
    {
      key: 'device',
      label: 'Device',
      ticks: buildHealthPattern(96, [
        { start: 10, end: 18, status: 'fair' },
        { start: 40, end: 44, status: 'poor' },
        { start: 62, end: 70, status: 'fair' },
      ]),
    },
    {
      key: 'client',
      label: 'Client',
      ticks: buildHealthPattern(96, [{ start: 42, end: 45, status: 'fair' }]),
    },
    {
      key: 'wifi',
      label: 'Wi-Fi',
      ticks: buildHealthPattern(96, [{ start: 34, end: 48, status: 'fair' }]),
    },
    {
      key: 'wan',
      label: 'WAN',
      ticks: buildHealthPattern(96, [
        { start: 38, end: 46, status: 'poor' },
        { start: 84, end: 88, status: 'fair' },
      ]),
    },
  ],
};

export const NETWORK_OVERVIEW_ITEMS: NetworkOverviewItem[] = [
  { key: 'gateway', label: 'Gateway', count: 2, icon: 'gateway', routeKey: 'devices' },
  { key: 'switch', label: 'Switch', count: 3, icon: 'switch', routeKey: 'devices' },
  { key: 'olt', label: 'OLT', count: 1, icon: 'olt', routeKey: 'devices' },
  { key: 'ap', label: 'AP', count: 3, icon: 'ap', routeKey: 'devices' },
  { key: 'client', label: 'Client', count: 4, icon: 'client', routeKey: 'clients' },
  { key: 'guest', label: 'Guest', count: 0, icon: 'guest', routeKey: 'clients' },
];

export const TOP_CLIENTS_BY_TRAFFIC: TopClientTrafficItem[] = [
  {
    key: 'test-pc',
    name: 'Test_PC',
    traffic: '336.92 MB',
    clientIcon: 'computer',
    mac: '00-E0-4C-68-12-A1',
    ssidOrVlan: 'Default (LAN)',
  },
  {
    key: 'starlight',
    name: 'StarLight',
    traffic: '247.43 MB',
    clientIcon: 'android-phone',
    mac: '8C-9F-2A-11-4B-09',
    ssidOrVlan: 'Corp-WiFi (5 GHz)',
  },
  {
    key: 'cc-28',
    name: 'CC-28-AA-EC-04-35',
    traffic: '332.16 KB',
    clientIcon: 'other',
    forceLightIcon: true,
    mac: 'CC-28-AA-EC-04-35',
    ssidOrVlan: 'IoT-VLAN20',
  },
  {
    key: 'neffos',
    name: 'Neffos_X20_Pro',
    traffic: '274.62 KB',
    clientIcon: 'android-phone',
    mac: 'F4-8B-32-77-9C-10',
    ssidOrVlan: 'Corp-WiFi (2.4 GHz)',
  },
];

export const TOP_APPS_BY_TRAFFIC: TopAppTrafficItem[] = [
  {
    key: 'm365',
    name: 'Microsoft 365',
    traffic: '58.30 MB',
    badgeKey: 'm365',
    category: 'Productivity',
  },
  {
    key: 'zoom',
    name: 'Zoom Meetings',
    traffic: '52.20 MB',
    badgeKey: 'zoom',
    category: 'Conferencing',
  },
  {
    key: 'slack',
    name: 'Slack',
    traffic: '36.85 MB',
    badgeKey: 'slack',
    category: 'Collaboration',
  },
  {
    key: 'aws',
    name: 'AWS Console',
    traffic: '34.26 MB',
    badgeKey: 'aws',
    category: 'Cloud Services',
  },
  {
    key: 'salesforce',
    name: 'Salesforce',
    traffic: '23.63 MB',
    badgeKey: 'salesforce',
    category: 'Enterprise CRM',
  },
];

const ANCHOR_TIMES_1D = [
  '05:25 pm',
  '08:00 pm',
  '10:35 pm',
  '01:10 am',
  '03:45 am',
  '06:20 am',
  '08:55 am',
  '11:30 am',
  '02:05 pm',
  '04:40 pm',
];

function build1DTimestamps(): string[] {
  const result: string[] = [];
  for (let seg = 0; seg < ANCHOR_TIMES_1D.length - 1; seg++) {
    result.push(ANCHOR_TIMES_1D[seg]);
    for (let step = 1; step < 10; step++) {
      const minsTotal = (17 * 60 + 25 + (seg * 10 + step) * 15.5) % (24 * 60);
      const h24 = Math.floor(minsTotal / 60);
      const mins = Math.round(minsTotal % 60) % 60;
      const suffix = h24 >= 12 ? 'pm' : 'am';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      result.push(`${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`);
    }
  }
  result.push(ANCHOR_TIMES_1D[ANCHOR_TIMES_1D.length - 1]);
  return result; // 91 points, anchor labels cleanly at idx % 10 === 0
}

const TIMESTAMPS_1D = build1DTimestamps();

function build1DInternetData(): ActivitySeriesDataset {
  const downloadMbps = TIMESTAMPS_1D.map((_, i) => {
    if (i === 1) return 5.18;
    if (i === 2) return 1.15;
    if (i === 4) return 0.92;
    if (i === 10) return 2.86;
    if (i === 11) return 0.45;
    if (i >= 12 && i <= 62) {
      return i % 7 === 0 ? 0.24 : i % 3 === 0 ? 0.14 : 0.08;
    }
    if (i === 63) return 1.05;
    if (i === 64) return 2.82;
    if (i === 65) return 0.85;
    if (i === 66) return 1.94;
    if (i === 68) return 1.48;
    if (i === 69) return 1.24;
    if (i === 71) return 1.08;
    if (i === 72) return 2.02;
    if (i === 73) return 1.32;
    if (i === 75) return 0.96;
    if (i === 81) return 2.48;
    if (i === 82) return 0.42;
    if (i === 89) return 0.65;
    if (i === 90) return 7.47;
    return 0.12;
  });

  const uploadMbps = TIMESTAMPS_1D.map((_, i) => {
    if (i === 1) return 1.42;
    if (i === 4) return 0.48;
    if (i === 10) return 0.72;
    if (i >= 12 && i <= 62) return i % 9 === 0 ? 0.12 : 0.04;
    if (i === 64) return 0.68;
    if (i === 66) return 0.56;
    if (i === 68) return 0.52;
    if (i === 71) return 0.62;
    if (i === 73) return 0.44;
    if (i === 81) return 0.36;
    if (i === 90) return 1.85;
    return 0.08;
  });

  const wirelessClients = TIMESTAMPS_1D.map((_, i) => {
    if (i === 1) return 2;
    if (i >= 64 && i <= 76) return i % 2 === 0 ? 2 : 1;
    return 1;
  });

  const wiredClients = TIMESTAMPS_1D.map((_, i) => {
    if (i === 1) return 3;
    if (i >= 2 && i <= 4) return 2;
    if (i === 64) return 4;
    if (i === 65) return 2;
    if (i === 66) return 3;
    if (i === 67 || i === 68) return 2;
    if (i === 71 || i === 72) return 3;
    if (i === 73) return 5;
    if (i === 74) return 4;
    if (i >= 75 && i <= 77) return 2;
    if (i === 90) return 2;
    return 1;
  });

  return {
    totalLabel: 'Internet Activity (2.12 GB)',
    yMaxMbps: 7.47,
    yTickLabels: ['0', '1.49 Mbps', '2.99 Mbps', '4.48 Mbps', '5.97 Mbps', '7.47 Mbps'],
    timestamps: TIMESTAMPS_1D,
    uploadMbps,
    downloadMbps,
    wiredClients,
    wirelessClients,
  };
}

const DATA_1D_INTERNET = build1DInternetData();

function scaleDataset(
  base: ActivitySeriesDataset,
  factor: number,
  totalLabel: string,
  yTickLabels: string[],
  yMaxMbps: number,
  timestamps = base.timestamps,
): ActivitySeriesDataset {
  return {
    totalLabel,
    yMaxMbps,
    yTickLabels,
    timestamps,
    uploadMbps: base.uploadMbps.map((v, i) =>
      Number((v * factor * (0.85 + ((i * 7) % 5) * 0.06)).toFixed(2)),
    ),
    downloadMbps: base.downloadMbps.map((v, i) =>
      Number((v * factor * (0.85 + ((i * 3) % 4) * 0.05)).toFixed(2)),
    ),
    wiredClients: base.wiredClients,
    wirelessClients: base.wirelessClients,
  };
}

export function getActivityDataset(
  range: DashboardTimeRangeKey,
  mode: ActivityModeKey,
): ActivitySeriesDataset {
  if (range === '1D' && mode === 'internet') {
    return DATA_1D_INTERNET;
  }

  if (mode === 'wifi') {
    const labelMap: Record<DashboardTimeRangeKey, string> = {
      '1D': 'Wi-Fi Activity (1.46 GB)',
      '1W': 'Wi-Fi Activity (9.84 GB)',
      '1M': 'Wi-Fi Activity (39.10 GB)',
    };
    return scaleDataset(
      DATA_1D_INTERNET,
      0.72,
      labelMap[range],
      ['0', '1.20 Mbps', '2.40 Mbps', '3.60 Mbps', '4.80 Mbps', '6.00 Mbps'],
      6.0,
    );
  }

  if (mode === 'isp') {
    const labelMap: Record<DashboardTimeRangeKey, string> = {
      '1D': 'ISP Load (18.4% Peak)',
      '1W': 'ISP Load (24.2% Peak)',
      '1M': 'ISP Load (31.6% Peak)',
    };
    return scaleDataset(
      DATA_1D_INTERNET,
      0.58,
      labelMap[range],
      ['0', '1.00 Mbps', '2.00 Mbps', '3.00 Mbps', '4.00 Mbps', '5.00 Mbps'],
      5.0,
    );
  }

  if (range === '1W') {
    return scaleDataset(
      DATA_1D_INTERNET,
      1.15,
      'Internet Activity (14.86 GB)',
      ['0', '1.80 Mbps', '3.60 Mbps', '5.40 Mbps', '7.20 Mbps', '9.00 Mbps'],
      9.0,
      TIMESTAMPS_1D.map((t, i) => (i % 10 === 0 ? `Day ${Math.floor(i / 10) + 1}` : t)),
    );
  }

  return scaleDataset(
    DATA_1D_INTERNET,
    1.32,
    'Internet Activity (58.42 GB)',
    ['0', '2.00 Mbps', '4.00 Mbps', '6.00 Mbps', '8.00 Mbps', '10.00 Mbps'],
    10.0,
    TIMESTAMPS_1D.map((t, i) => (i % 10 === 0 ? `Sep ${Math.min(19, 1 + i * 2)}` : t)),
  );
}

export const AP_DISTRIBUTION_CLUSTERS: SApDistributionCluster[] = [
  {
    id: 'rssi-72',
    dbm: -72,
    count: 1,
    status: 'warning',
    productSlug: 'eap230-wall-v1-20' as OmadaProductName,
    apNames: ['BreakRoom_Eap_2'],
  },
  {
    id: 'rssi-47',
    dbm: -47,
    count: 2,
    status: 'good',
    productSlug: 'eap650' as OmadaProductName,
    apNames: ['COOOffice_Eap_1', 'StorageRoom_Eap_3'],
  },
];

export const CHANNEL_UTILIZATION_BANDS: SChannelBand[] = [
  {
    key: '2g',
    label: '2.4 GHz',
    channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((ch) => ({
      channel: ch,
      utilization: ch === 1 ? 42 : ch === 2 ? 18 : ch === 6 ? 48 : ch === 11 ? 66 : 0,
      level: 'low',
    })),
  },
  {
    key: '5g',
    label: '5 GHz',
    channels: [
      36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140,
      144, 149, 153, 157, 161, 165,
    ].map((ch) => ({
      channel: ch,
      utilization: ch === 44 ? 20 : ch === 48 ? 28 : ch === 149 ? 46 : 0,
      level: 'low',
    })),
  },
  {
    key: '6g',
    label: '6 GHz',
    channels: [33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77].map((ch) => ({
      channel: ch,
      utilization: 0,
      level: 'low',
    })),
  },
];
