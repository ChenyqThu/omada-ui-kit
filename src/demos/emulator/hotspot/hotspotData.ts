export type HotspotRouteKey =
  | 'dashboard'
  | 'authorized-clients'
  | 'statistics'
  | 'voucher-groups'
  | 'local-users'
  | 'form-auth'
  | 'operators';

export interface HotspotSiteOption {
  key: string;
  label: string;
  subtitle: string;
}

export const HOTSPOT_SITES: HotspotSiteOption[] = [
  {
    key: 'main-office-floor',
    label: 'Main Office Floor',
    subtitle: '4 Voucher Groups · 40 Vouchers',
  },
  {
    key: 'branch-west',
    label: 'Branch Office - West',
    subtitle: '2 Voucher Groups · 20 Vouchers',
  },
  {
    key: 'datacenter-core',
    label: 'Data Center Core',
    subtitle: '1 Voucher Group · 10 Vouchers',
  },
];

export interface HotspotDashboardDatePreset {
  key: string;
  label: string;
  historyLabels: string[];
  historyValues: (number | null)[];
  yMax: number;
  yInterval: number;
  authTypes: Array<{ key: string; label: string; value: number }>;
  hotspotTypes: Array<{ key: string; label: string; value: number; percent: number }>;
  totalHotspot: number;
}

export const HOTSPOT_DASHBOARD_PRESETS: HotspotDashboardDatePreset[] = [
  {
    key: 'nov-2026',
    label: 'Nov 15, 2026  -  Nov 22, 2026',
    historyLabels: [
      '',
      '',
      '',
      '',
      '',
      '',
      '2025-09-18 03:10 pm',
      '',
    ],
    historyValues: [null, null, null, null, null, null, 3, null],
    yMax: 3,
    yInterval: 1,
    authTypes: [
      { key: 'voucher', label: 'Voucher', value: 40 },
      { key: 'local-user', label: 'Local User', value: 0 },
      { key: 'simple-password', label: 'Simple Password', value: 0 },
      { key: 'form-auth', label: 'Form Auth', value: 0 },
      { key: 'external-radius', label: 'External RADIUS', value: 0 },
    ],
    hotspotTypes: [
      { key: 'voucher', label: 'Voucher', value: 40, percent: 100 },
    ],
    totalHotspot: 40,
  },
  {
    key: 'sep-2025',
    label: 'Sep 15, 2025  -  Sep 22, 2025',
    historyLabels: [
      '2025-09-16 10:00 am',
      '',
      '2025-09-18 03:10 pm',
      '',
      '2025-09-20 01:20 pm',
      '',
    ],
    historyValues: [1, null, 3, null, 2, null],
    yMax: 3,
    yInterval: 1,
    authTypes: [
      { key: 'voucher', label: 'Voucher', value: 36 },
      { key: 'local-user', label: 'Local User', value: 4 },
      { key: 'simple-password', label: 'Simple Password', value: 0 },
      { key: 'form-auth', label: 'Form Auth', value: 0 },
      { key: 'external-radius', label: 'External RADIUS', value: 0 },
    ],
    hotspotTypes: [
      { key: 'voucher', label: 'Voucher', value: 36, percent: 90 },
      { key: 'local-user', label: 'Local User', value: 4, percent: 10 },
    ],
    totalHotspot: 40,
  },
  {
    key: 'last-30',
    label: 'Oct 23, 2026  -  Nov 22, 2026',
    historyLabels: [
      '2026-10-28 09:00 am',
      '',
      '2026-11-04 02:15 pm',
      '',
      '2026-11-12 11:30 am',
      '',
      '2026-11-18 03:10 pm',
    ],
    historyValues: [2, null, 1, null, 3, null, 3],
    yMax: 3,
    yInterval: 1,
    authTypes: [
      { key: 'voucher', label: 'Voucher', value: 40 },
      { key: 'local-user', label: 'Local User', value: 3 },
      { key: 'simple-password', label: 'Simple Password', value: 0 },
      { key: 'form-auth', label: 'Form Auth', value: 2 },
      { key: 'external-radius', label: 'External RADIUS', value: 0 },
    ],
    hotspotTypes: [
      { key: 'voucher', label: 'Voucher', value: 40, percent: 89 },
      { key: 'local-user', label: 'Local User', value: 3, percent: 7 },
      { key: 'form-auth', label: 'Form Auth', value: 2, percent: 4 },
    ],
    totalHotspot: 45,
  },
];

export type VoucherStatus = 'Unused' | 'In Use' | 'Expired';

export interface VoucherCodeRecord {
  key: string;
  code: string;
  status: VoucherStatus;
  usedClients: string;
  expiresAt: string;
}

export interface VoucherGroupRecord {
  key: string;
  name: string;
  createdTime: string;
  createdTimestamp: number;
  creator: string;
  usedAmount: number;
  totalAmount: number;
  unitPrice: number | null;
  totalPrice: number | null;
  currency: string;
  duration: string;
  expiredCount: number;
  vouchers: VoucherCodeRecord[];
}

function buildGroupVouchers(
  groupKey: string,
  seed: number,
  total: number,
  usedCount: number,
  expiredCount: number,
): VoucherCodeRecord[] {
  const list: VoucherCodeRecord[] = [];
  for (let i = 0; i < total; i += 1) {
    const num = ((seed + i * 7919) % 9000000000) + 1000000000;
    const code = String(num).padStart(10, '0');
    let status: VoucherStatus = 'Unused';
    if (i < expiredCount) {
      status = 'Expired';
    } else if (i < usedCount) {
      status = 'In Use';
    }
    list.push({
      key: `${groupKey}-v-${i + 1}`,
      code,
      status,
      usedClients: status === 'Unused' ? '0 / 1' : '1 / 1',
      expiresAt: status === 'Expired' ? 'Jan 13, 2022 11:02:25 pm' : '8h after activation',
    });
  }
  return list;
}

export const INITIAL_VOUCHER_GROUPS: VoucherGroupRecord[] = [
  {
    key: 'vg-1',
    name: 'VoucherGroup_1',
    createdTime: 'Oct 18, 2021 07:54:28 pm',
    createdTimestamp: new Date('2021-10-18T19:54:28Z').getTime(),
    creator: '-',
    usedAmount: 0,
    totalAmount: 9,
    unitPrice: null,
    totalPrice: null,
    currency: 'AUD',
    duration: 'Client - 8h - By Time',
    expiredCount: 0,
    vouchers: buildGroupVouchers('vg-1', 4829103841, 9, 0, 0),
  },
  {
    key: 'vg-2',
    name: 'VoucherGroup_2',
    createdTime: 'Jan 13, 2022 03:02:25 pm',
    createdTimestamp: new Date('2022-01-13T15:02:25Z').getTime(),
    creator: '-',
    usedAmount: 1,
    totalAmount: 10,
    unitPrice: null,
    totalPrice: null,
    currency: 'AUD',
    duration: 'Client - 8h - By Time',
    expiredCount: 1,
    vouchers: buildGroupVouchers('vg-2', 7391820412, 10, 1, 1),
  },
  {
    key: 'vg-3',
    name: 'VoucherGroup_3',
    createdTime: 'Aug 16, 2023 07:09:27 pm',
    createdTimestamp: new Date('2023-08-16T19:09:27Z').getTime(),
    creator: '-',
    usedAmount: 0,
    totalAmount: 10,
    unitPrice: null,
    totalPrice: null,
    currency: 'AUD',
    duration: 'Voucher - 8h - By Time',
    expiredCount: 0,
    vouchers: buildGroupVouchers('vg-3', 5910283746, 10, 0, 0),
  },
  {
    key: 'vg-4',
    name: 'VoucherGroup_4',
    createdTime: 'Aug 16, 2023 07:09:32 pm',
    createdTimestamp: new Date('2023-08-16T19:09:32Z').getTime(),
    creator: '-',
    usedAmount: 0,
    totalAmount: 10,
    unitPrice: null,
    totalPrice: null,
    currency: 'AUD',
    duration: 'Voucher - 8h - By Time',
    expiredCount: 0,
    vouchers: buildGroupVouchers('vg-4', 6102938475, 10, 0, 0),
  },
];

export const PRINTING_LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: 'Deutsch', value: 'Deutsch' },
  { label: 'Français', value: 'Français' },
  { label: 'Español', value: 'Español' },
  { label: '日本語', value: '日本語' },
  { label: '中文(简体)', value: '中文(简体)' },
];

export const CURRENCY_OPTIONS = [
  { label: 'AUD', value: 'AUD' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'CAD', value: 'CAD' },
  { label: 'JPY', value: 'JPY' },
];

export interface VoucherStatisticsSummary {
  totalAmountLabel: string;
  totalRevenueValue: string;
  usedRevenueValue: string;
  unusedRevenueValue: string;
  totalVouchersCount: number;
  usedVouchersCount: number;
  unusedVouchersCount: number;
  trendLabels: string[];
  usedSeries: number[];
  revenueSeries: number[];
}

export const VOUCHER_STATISTICS_DATA: VoucherStatisticsSummary = {
  totalAmountLabel: 'USD 95',
  totalRevenueValue: 'USD 95',
  usedRevenueValue: 'USD 39',
  unusedRevenueValue: 'USD 16',
  totalVouchersCount: 39,
  usedVouchersCount: 16,
  unusedVouchersCount: 23,
  trendLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  usedSeries: [2, 4, 3, 1, 3, 2, 1],
  revenueSeries: [12, 20, 18, 8, 17, 12, 8],
};

export interface HotspotAuthorizedClient {
  key: string;
  name: string;
  mac: string;
  ip: string;
  authType: 'Voucher' | 'Local User' | 'Form Auth';
  credential: string;
  ssid: string;
  authorizedTime: string;
  remainingTime: string;
  downloadTraffic: string;
  uploadTraffic: string;
}

export const INITIAL_AUTHORIZED_CLIENTS: HotspotAuthorizedClient[] = [
  {
    key: 'hc-1',
    name: 'Visitor-iPhone-15',
    mac: 'A4-5E-60-C1-18-2B',
    ip: '192.168.0.104',
    authType: 'Voucher',
    credential: '7391820412',
    ssid: 'Office_Guest',
    authorizedTime: 'Nov 22, 2026 09:15:10 am',
    remainingTime: '6h 44m',
    downloadTraffic: '142.8 MB',
    uploadTraffic: '18.4 MB',
  },
  {
    key: 'hc-2',
    name: 'Contractor-MacBook',
    mac: '3C-22-FB-91-40-7E',
    ip: '192.168.0.118',
    authType: 'Local User',
    credential: 'contractor_01',
    ssid: 'Office_Guest',
    authorizedTime: 'Nov 22, 2026 10:02:44 am',
    remainingTime: '5h 57m',
    downloadTraffic: '418.2 MB',
    uploadTraffic: '64.1 MB',
  },
  {
    key: 'hc-3',
    name: 'Reception-iPad',
    mac: 'B8-C1-11-84-55-09',
    ip: '192.168.0.125',
    authType: 'Form Auth',
    credential: 'alex.morgan@partner.io',
    ssid: 'Lobby_Portal',
    authorizedTime: 'Nov 22, 2026 11:20:03 am',
    remainingTime: '7h 12m',
    downloadTraffic: '86.5 MB',
    uploadTraffic: '9.2 MB',
  },
];

export interface HotspotLocalUser {
  key: string;
  username: string;
  enabled: boolean;
  expiration: string;
  bindingType: 'No Binding' | 'MAC Binding';
  maxUsers: number;
  rateLimit: string;
  trafficQuota: string;
}

export const INITIAL_LOCAL_USERS: HotspotLocalUser[] = [
  {
    key: 'lu-1',
    username: 'guest_vip',
    enabled: true,
    expiration: 'Dec 31, 2026',
    bindingType: 'No Binding',
    maxUsers: 5,
    rateLimit: '50 Mbps / 20 Mbps',
    trafficQuota: 'Unlimited',
  },
  {
    key: 'lu-2',
    username: 'contractor_01',
    enabled: true,
    expiration: 'Nov 30, 2026',
    bindingType: 'MAC Binding',
    maxUsers: 2,
    rateLimit: '25 Mbps / 10 Mbps',
    trafficQuota: '20 GB',
  },
  {
    key: 'lu-3',
    username: 'event_staff',
    enabled: true,
    expiration: 'Dec 15, 2026',
    bindingType: 'No Binding',
    maxUsers: 10,
    rateLimit: '30 Mbps / 15 Mbps',
    trafficQuota: '50 GB',
  },
  {
    key: 'lu-4',
    username: 'meeting_room_1',
    enabled: false,
    expiration: 'Jan 15, 2027',
    bindingType: 'No Binding',
    maxUsers: 3,
    rateLimit: 'Unlimited',
    trafficQuota: '10 GB',
  },
];

export interface HotspotFormAuthRecord {
  key: string;
  portalName: string;
  clientMac: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  submittedAt: string;
}

export const INITIAL_FORM_AUTH_RECORDS: HotspotFormAuthRecord[] = [
  {
    key: 'fa-1',
    portalName: 'HQ_Visitor_Survey',
    clientMac: 'B8-C1-11-84-55-09',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@partner.io',
    phone: '+1 415-555-0142',
    company: 'Northwind Partners',
    submittedAt: 'Nov 22, 2026 11:19:58 am',
  },
  {
    key: 'fa-2',
    portalName: 'HQ_Visitor_Survey',
    clientMac: '70-3A-CB-42-19-F1',
    fullName: 'Hannah Lee',
    email: 'hannah.lee@fabrikam.com',
    phone: '+1 415-555-0199',
    company: 'Fabrikam Labs',
    submittedAt: 'Nov 21, 2026 04:42:11 pm',
  },
  {
    key: 'fa-3',
    portalName: 'Conference_Guest_Form',
    clientMac: 'D4-6A-6A-10-9B-33',
    fullName: 'David Chen',
    email: 'd.chen@contoso.org',
    phone: '+1 650-555-0184',
    company: 'Contoso Systems',
    submittedAt: 'Nov 20, 2026 02:08:35 pm',
  },
];

export interface HotspotOperatorRecord {
  key: string;
  name: string;
  privilege: 'Admin' | 'Operator';
  validSites: string;
  lastLogin: string;
  status: 'Active' | 'Disabled';
  note: string;
}

export const INITIAL_HOTSPOT_OPERATORS: HotspotOperatorRecord[] = [
  {
    key: 'op-1',
    name: 'hotspot_admin',
    privilege: 'Admin',
    validSites: 'All Sites (3)',
    lastLogin: 'Nov 22, 2026 11:40:12 am',
    status: 'Active',
    note: 'Primary Hotspot Administrator',
  },
  {
    key: 'op-2',
    name: 'frontdesk_op',
    privilege: 'Operator',
    validSites: 'Main Office Floor',
    lastLogin: 'Nov 22, 2026 08:55:04 am',
    status: 'Active',
    note: 'Lobby reception voucher issuer',
  },
  {
    key: 'op-3',
    name: 'branch_desk',
    privilege: 'Operator',
    validSites: 'Branch Office - West',
    lastLogin: 'Nov 19, 2026 03:18:49 pm',
    status: 'Active',
    note: 'West campus guest support',
  },
];

export function generateVoucherCodesForNewGroup(
  groupKey: string,
  count: number,
  durationLabel: string,
): VoucherCodeRecord[] {
  const seed = Date.now() % 8999999999 + 1000000000;
  return Array.from({ length: count }, (_, idx) => {
    const code = String(((seed + idx * 104729) % 9000000000) + 1000000000).padStart(10, '0');
    return {
      key: `${groupKey}-v-${idx + 1}`,
      code,
      status: 'Unused' as const,
      usedClients: '0 / 1',
      expiresAt: durationLabel,
    };
  });
}
