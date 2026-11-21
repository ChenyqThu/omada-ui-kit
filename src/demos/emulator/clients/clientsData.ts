import type {
  OmadaClientIconName,
  OmadaProductName,
  SHealthTickStatus,
} from '@/omada';

export type EmulatorClientConnectionType = 'wireless' | 'wired' | 'ipc-nvr';
export type EmulatorClientExperienceBucket = 'good' | 'fair' | 'poor' | 'no-data';
export type EmulatorClientAuthStatus = 'authorized' | 'pending' | 'blocked';
export type EmulatorClientOnlineState = 'online' | 'offline' | 'blocked';
export type EmulatorClientCategory = 'mobile' | 'others' | 'office';

/**
 * Connected client record displayed in the Omada Controller v6.3 Clients table
 * and `ClientPropertiesDrawer`.
 */
export interface EmulatorClientRecord {
  key: string;
  name: string;
  clientIcon: OmadaClientIconName;
  /** Uses the light asset variant when the dark export contains extraneous strokes. */
  forceLightIcon?: boolean;
  /** Renders the green managed/portal corner badge on the client icon (`Test_PC`). */
  hasManagedBadge?: boolean;
  clientCategory: EmulatorClientCategory;
  clientTypeLabel: string;
  connectionType: EmulatorClientConnectionType;
  onlineState: EmulatorClientOnlineState;
  mac: string;
  ipAddress: string;
  authType: string;
  status: EmulatorClientAuthStatus;
  experienceBucket: EmulatorClientExperienceBucket;
  experienceScore?: number;
  experienceLabel: string;
  incidents: number;
  ssid: string;
  network: string;
  vlan: number;
  apOrPort: string;
  uplinkKind: 'gateway' | 'ap' | 'switch';
  uplinkProductSlug: OmadaProductName;
  downloadTraffic: string;
  downloadBytes: number;
  uptime: string;
  /** Snapshot uptime rendered inside the Quick Properties Drawer `Info` card when distinct. */
  drawerUptime?: string;
  downloadThroughput: string;
  upPackets: number;
  upBytes: string;
  downPackets: number;
  downBytes: string;
  healthTicks: SHealthTickStatus[];
}

function buildClientHealthTicks(
  seedOffset: number,
  poorIndices: number[],
  fairIndices: number[],
  noneIndices: number[] = [],
): SHealthTickStatus[] {
  const poorSet = new Set(poorIndices);
  const fairSet = new Set(fairIndices);
  const noneSet = new Set(noneIndices);
  const ticks: SHealthTickStatus[] = [];

  for (let i = 0; i < 96; i += 1) {
    if (noneSet.has(i)) {
      ticks.push('none');
    } else if (poorSet.has(i)) {
      ticks.push('poor');
    } else if (fairSet.has(i)) {
      ticks.push('fair');
    } else if ((i + seedOffset) % 19 === 0) {
      ticks.push('fair');
    } else {
      ticks.push('good');
    }
  }
  return ticks;
}

/**
 * Exact 4 connected client records matching Omada Controller v6.3.0.34 (`Main Office Floor`).
 */
export const EMULATOR_CLIENTS: EmulatorClientRecord[] = [
  {
    key: 'test-pc',
    name: 'Test_PC',
    clientIcon: 'computer',
    hasManagedBadge: true,
    clientCategory: 'office',
    clientTypeLabel: 'Computer',
    connectionType: 'wired',
    onlineState: 'online',
    mac: '1C-1B-0D-F7-E0-96',
    ipAddress: '192.168.0.200',
    authType: 'Administrator - admin',
    status: 'authorized',
    experienceBucket: 'poor',
    experienceScore: 3,
    experienceLabel: 'Poor - 3',
    incidents: 0,
    ssid: '--',
    network: 'Default',
    vlan: 1,
    apOrPort: 'MainOffice_Gateway_2',
    uplinkKind: 'gateway',
    uplinkProductSlug: 'er8411',
    downloadTraffic: '278.75 MB',
    downloadBytes: 278.75 * 1024 * 1024,
    uptime: '5h 13m 49s',
    drawerUptime: '5h 8m 48s',
    downloadThroughput: '19.16 Kbps',
    upPackets: 168415,
    upBytes: '59.03 MB',
    downPackets: 310267,
    downBytes: '278.37 MB',
    healthTicks: buildClientHealthTicks(
      3,
      [3, 4, 15, 21, 31, 41, 47, 57, 65, 73, 79, 86, 92],
      [7, 11, 18, 25, 36, 44, 52, 61, 69, 76, 83, 89],
    ),
  },
  {
    key: 'cc-28-aa-75-e6-02',
    name: 'CC-28-AA-75-E6-02',
    clientIcon: 'other',
    forceLightIcon: true,
    clientCategory: 'others',
    clientTypeLabel: 'Others',
    connectionType: 'wired',
    onlineState: 'online',
    mac: 'CC-28-AA-75-E6-02',
    ipAddress: '192.168.0.190',
    authType: '--',
    status: 'pending',
    experienceBucket: 'no-data',
    experienceLabel: 'No Data',
    incidents: 0,
    ssid: '--',
    network: 'Default',
    vlan: 1,
    apOrPort: 'MainOffice_Gateway_2',
    uplinkKind: 'gateway',
    uplinkProductSlug: 'er8411',
    downloadTraffic: '0',
    downloadBytes: 0,
    uptime: '5m 58s',
    downloadThroughput: '0 Kbps',
    upPackets: 0,
    upBytes: '0 B',
    downPackets: 0,
    downBytes: '0 B',
    healthTicks: Array.from({ length: 96 }, () => 'none' as const),
  },
  {
    key: 'starlight',
    name: 'StarLight',
    clientIcon: 'iphone',
    clientCategory: 'mobile',
    clientTypeLabel: 'Mobile',
    connectionType: 'wireless',
    onlineState: 'online',
    mac: '8C-9F-2A-11-4B-09',
    ipAddress: '192.168.0.116',
    authType: 'Simple Password',
    status: 'authorized',
    experienceBucket: 'fair',
    experienceScore: 7,
    experienceLabel: 'Fair - 7',
    incidents: 0,
    ssid: 'Employee_Network_5',
    network: '--',
    vlan: 1,
    apOrPort: 'StorageRoom_Eap_3',
    uplinkKind: 'ap',
    uplinkProductSlug: 'eap650',
    downloadTraffic: '233.31 MB',
    downloadBytes: 233.31 * 1024 * 1024,
    uptime: '1h 4m 10s',
    downloadThroughput: '142.80 Kbps',
    upPackets: 98420,
    upBytes: '14.12 MB',
    downPackets: 214590,
    downBytes: '233.31 MB',
    healthTicks: buildClientHealthTicks(
      5,
      [19, 64],
      [8, 14, 29, 34, 48, 53, 71, 78, 84],
    ),
  },
  {
    key: 'neffos-x20-pro',
    name: 'Neffos_X20_Pro',
    clientIcon: 'iphone',
    clientCategory: 'mobile',
    clientTypeLabel: 'Mobile',
    connectionType: 'wireless',
    onlineState: 'online',
    mac: 'F4-8B-32-77-9C-10',
    ipAddress: '192.168.0.107',
    authType: 'Administrator - admin',
    status: 'authorized',
    experienceBucket: 'good',
    experienceScore: 10,
    experienceLabel: 'Good - 10',
    incidents: 0,
    ssid: 'Employee_Network_5',
    network: '--',
    vlan: 1,
    apOrPort: 'StorageRoom_Eap_3',
    uplinkKind: 'ap',
    uplinkProductSlug: 'eap650',
    downloadTraffic: '205.27 KB',
    downloadBytes: 205.27 * 1024,
    uptime: '1h 17m 54s',
    downloadThroughput: '2.40 Kbps',
    upPackets: 840,
    upBytes: '69.35 KB',
    downPackets: 1420,
    downBytes: '205.27 KB',
    healthTicks: buildClientHealthTicks(7, [], [42]),
  },
];
