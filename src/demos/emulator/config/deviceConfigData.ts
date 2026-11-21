import type { OmadaProductName } from '@/omada';

export type PortLinkStatus =
  | '10g'
  | '2.5g'
  | '1000m'
  | '100m'
  | 'disabled'
  | 'disconnected';

export interface SwitchPortRow {
  key: string;
  port: number;
  switchKey: string;
  switchName: string;
  switchProductSlug: OmadaProductName;
  model: string;
  name: string;
  linkStatus: PortLinkStatus;
  isSfp?: boolean;
  isUplink?: boolean;
  isPoe?: boolean;
  isMirroring?: boolean;
  isBlocking?: boolean;
  isLag?: boolean;
  connectionName?: string;
  connectionProductSlug?: OmadaProductName;
  connectionType?: 'gateway' | 'switch' | 'ap' | 'olt' | 'client';
  label: string;
  type: 'Trunk' | 'Access';
  poe: string;
  poeCapable: boolean;
  poePowerW?: number;
  operation: 'Switching' | 'Mirroring' | 'Disabled';
  profile: string;
  nativeNetwork: string;
  txSum: string;
  rxSum: string;
  linkSpeedLabel: string;
  txPackets: string;
  rxPackets: string;
  crcErrors: number;
}

export interface SwitchPortProfileRecord {
  key: string;
  name: string;
  builtIn?: boolean;
  poe: 'Keep Device Settings' | 'On' | 'Off';
  nativeNetwork: string;
  taggedNetworks: string;
  untaggedNetworks: string;
  bandwidthLimit: string;
  lldpMed: 'Enable' | 'Disable';
  isolation: boolean;
  stormControl: boolean;
}

export interface DynamicDnsEntryRecord {
  key: string;
  provider: string;
  interfaceName: string;
  status: 'incorrect-credential' | 'connected' | 'updating' | 'disabled';
  statusLabel: string;
  username: string;
  password: string;
  domainName: string;
  ip: string;
  updateInterval: string;
}

export type DnsProxyType = 'DNSSEC' | 'DoH' | 'DoT';

export interface DnsProxyPresetOption {
  key: string;
  label: string;
  dohUrl: string;
  dotHost: string;
}

export interface DnsProxyCustomServer {
  key: string;
  checked: boolean;
  name: string;
  url: string;
}

export interface DnsCacheConfig {
  enabled: boolean;
  cacheSize: number;
  cacheTtl: number;
  cachedEntries: number;
}

const buildCtoSwitchPorts = (): SwitchPortRow[] => [
  {
    key: 'ctooffice-switch-1-port-1',
    port: 1,
    switchKey: 'ctooffice-switch-1',
    switchName: 'CTOOffice_Switch_1',
    switchProductSlug: 'sg2428p-un-5-40',
    model: 'SG3210 v3.20',
    name: 'Port1',
    linkStatus: '1000m',
    isUplink: true,
    connectionName: 'MainOffice_Gateway_2',
    connectionProductSlug: 'er8411',
    connectionType: 'gateway',
    label: '-',
    type: 'Trunk',
    poe: '--',
    poeCapable: false,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '2.10 GB',
    rxSum: '3.95 GB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '1,942,108',
    rxPackets: '3,418,920',
    crcErrors: 0,
  },
  ...Array.from({ length: 7 }, (_, idx): SwitchPortRow => {
    const port = idx + 2;
    return {
      key: `ctooffice-switch-1-port-${port}`,
      port,
      switchKey: 'ctooffice-switch-1',
      switchName: 'CTOOffice_Switch_1',
      switchProductSlug: 'sg2428p-un-5-40',
      model: 'SG3210 v3.20',
      name: `Port${port}`,
      linkStatus: 'disconnected',
      label: '-',
      type: 'Trunk',
      poe: '--',
      poeCapable: false,
      operation: 'Switching',
      profile: 'All',
      nativeNetwork: 'Default(1)',
      txSum: '0 B',
      rxSum: '0 B',
      linkSpeedLabel: 'Down',
      txPackets: '0',
      rxPackets: '0',
      crcErrors: 0,
    };
  }),
  ...[9, 10].map((port): SwitchPortRow => ({
    key: `ctooffice-switch-1-port-${port}`,
    port,
    switchKey: 'ctooffice-switch-1',
    switchName: 'CTOOffice_Switch_1',
    switchProductSlug: 'sg2428p-un-5-40',
    model: 'SG3210 v3.20',
    name: `Port${port}`,
    linkStatus: 'disconnected',
    isSfp: true,
    label: '-',
    type: 'Trunk',
    poe: '--',
    poeCapable: false,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '0 B',
    rxSum: '0 B',
    linkSpeedLabel: 'Down',
    txPackets: '0',
    rxPackets: '0',
    crcErrors: 0,
  })),
];

const buildSalesSwitchPorts = (): SwitchPortRow[] => [
  {
    key: 'salesdepartment-switch-3-port-1',
    port: 1,
    switchKey: 'salesdepartment-switch-3',
    switchName: 'SalesDepartment_Switch_3',
    switchProductSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    name: 'Port1',
    linkStatus: '1000m',
    isUplink: true,
    connectionName: 'MainOffice_Gateway_2',
    connectionProductSlug: 'er8411',
    connectionType: 'gateway',
    label: '-',
    type: 'Trunk',
    poe: 'Off',
    poeCapable: true,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '1.84 GB',
    rxSum: '4.62 GB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '1,680,410',
    rxPackets: '4,120,884',
    crcErrors: 0,
  },
  {
    key: 'salesdepartment-switch-3-port-2',
    port: 2,
    switchKey: 'salesdepartment-switch-3',
    switchName: 'SalesDepartment_Switch_3',
    switchProductSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    name: 'Port2',
    linkStatus: '1000m',
    isPoe: true,
    connectionName: 'COOOffice_Eap_1',
    connectionProductSlug: 'eap727-eu-1-0',
    connectionType: 'ap',
    label: '-',
    type: 'Trunk',
    poe: 'On (12.4W)',
    poeCapable: true,
    poePowerW: 12.4,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '912.40 MB',
    rxSum: '348.12 MB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '814,220',
    rxPackets: '312,005',
    crcErrors: 0,
  },
  {
    key: 'salesdepartment-switch-3-port-3',
    port: 3,
    switchKey: 'salesdepartment-switch-3',
    switchName: 'SalesDepartment_Switch_3',
    switchProductSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    name: 'Port3',
    linkStatus: '1000m',
    isPoe: true,
    connectionName: 'BreakRoom_Eap_2',
    connectionProductSlug: 'eap668-outdoor-hd-un-1-2',
    connectionType: 'ap',
    label: '-',
    type: 'Trunk',
    poe: 'On (11.8W)',
    poeCapable: true,
    poePowerW: 11.8,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '642.18 MB',
    rxSum: '215.40 MB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '568,930',
    rxPackets: '198,412',
    crcErrors: 0,
  },
  {
    key: 'salesdepartment-switch-3-port-4',
    port: 4,
    switchKey: 'salesdepartment-switch-3',
    switchName: 'SalesDepartment_Switch_3',
    switchProductSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    name: 'Port4',
    linkStatus: '1000m',
    isPoe: true,
    connectionName: 'StorageRoom_Eap_3',
    connectionProductSlug: 'eap650',
    connectionType: 'ap',
    label: '-',
    type: 'Trunk',
    poe: 'On (8.6W)',
    poeCapable: true,
    poePowerW: 8.6,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '428.90 MB',
    rxSum: '164.05 MB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '384,120',
    rxPackets: '150,890',
    crcErrors: 0,
  },
  ...Array.from({ length: 4 }, (_, idx): SwitchPortRow => {
    const port = idx + 5;
    return {
      key: `salesdepartment-switch-3-port-${port}`,
      port,
      switchKey: 'salesdepartment-switch-3',
      switchName: 'SalesDepartment_Switch_3',
      switchProductSlug: 'tl-sg3452x-un-1-0',
      model: 'SG2210MP v5.0',
      name: `Port${port}`,
      linkStatus: 'disconnected',
      label: '-',
      type: 'Trunk',
      poe: 'PoE+(30W)',
      poeCapable: true,
      operation: 'Switching',
      profile: 'All',
      nativeNetwork: 'Default(1)',
      txSum: '0 B',
      rxSum: '0 B',
      linkSpeedLabel: 'Down',
      txPackets: '0',
      rxPackets: '0',
      crcErrors: 0,
    };
  }),
  ...[9, 10].map((port): SwitchPortRow => ({
    key: `salesdepartment-switch-3-port-${port}`,
    port,
    switchKey: 'salesdepartment-switch-3',
    switchName: 'SalesDepartment_Switch_3',
    switchProductSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    name: `Port${port}`,
    linkStatus: 'disconnected',
    isSfp: true,
    label: '-',
    type: 'Trunk',
    poe: '--',
    poeCapable: false,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '0 B',
    rxSum: '0 B',
    linkSpeedLabel: 'Down',
    txPackets: '0',
    rxPackets: '0',
    crcErrors: 0,
  })),
];

const buildServerRoomSwitchPorts = (): SwitchPortRow[] => [
  {
    key: 'serverroom-switch-2-port-1',
    port: 1,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port1',
    linkStatus: '1000m',
    isUplink: true,
    connectionName: 'MainOffice_Gateway_2',
    connectionProductSlug: 'er8411',
    connectionType: 'gateway',
    label: '-',
    type: 'Trunk',
    poe: 'Off',
    poeCapable: true,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '3.12 GB',
    rxSum: '6.84 GB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '2,894,110',
    rxPackets: '5,912,040',
    crcErrors: 0,
  },
  {
    key: 'serverroom-switch-2-port-2',
    port: 2,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port2',
    linkStatus: '1000m',
    isPoe: true,
    connectionName: 'Core-NAS-01',
    connectionType: 'client',
    label: 'Storage',
    type: 'Trunk',
    poe: 'On (14.2W)',
    poeCapable: true,
    poePowerW: 14.2,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '1.45 GB',
    rxSum: '890.12 MB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '1,210,330',
    rxPackets: '744,012',
    crcErrors: 0,
  },
  {
    key: 'serverroom-switch-2-port-3',
    port: 3,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port3',
    linkStatus: '1000m',
    isPoe: true,
    connectionName: 'Core-NAS-02',
    connectionType: 'client',
    label: 'Storage',
    type: 'Trunk',
    poe: 'On (13.8W)',
    poeCapable: true,
    poePowerW: 13.8,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '1.22 GB',
    rxSum: '740.30 MB',
    linkSpeedLabel: '1000M FDX',
    txPackets: '1,038,440',
    rxPackets: '619,220',
    crcErrors: 0,
  },
  {
    key: 'serverroom-switch-2-port-4',
    port: 4,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port4',
    linkStatus: '100m',
    connectionName: 'Rack-PDU-Mgmt',
    connectionType: 'client',
    label: '-',
    type: 'Access',
    poe: 'Off',
    poeCapable: true,
    operation: 'Switching',
    profile: 'Mgmt',
    nativeNetwork: 'Default(1)',
    txSum: '44.10 MB',
    rxSum: '12.40 MB',
    linkSpeedLabel: '100M FDX',
    txPackets: '41,280',
    rxPackets: '15,940',
    crcErrors: 0,
  },
  ...Array.from({ length: 3 }, (_, idx): SwitchPortRow => {
    const port = idx + 5;
    return {
      key: `serverroom-switch-2-port-${port}`,
      port,
      switchKey: 'serverroom-switch-2',
      switchName: 'ServerRoom_Switch_2',
      switchProductSlug: 'sg3452p-un-3-40',
      model: 'TL-SG2210MP v2.0',
      name: `Port${port}`,
      linkStatus: 'disconnected',
      label: '-',
      type: 'Trunk',
      poe: 'PoE+(30W)',
      poeCapable: true,
      operation: 'Switching',
      profile: 'All',
      nativeNetwork: 'Default(1)',
      txSum: '0 B',
      rxSum: '0 B',
      linkSpeedLabel: 'Down',
      txPackets: '0',
      rxPackets: '0',
      crcErrors: 0,
    };
  }),
  {
    key: 'serverroom-switch-2-port-8',
    port: 8,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port8',
    linkStatus: 'disabled',
    label: '-',
    type: 'Trunk',
    poe: 'Off',
    poeCapable: true,
    operation: 'Disabled',
    profile: 'Disabled',
    nativeNetwork: 'Default(1)',
    txSum: '0 B',
    rxSum: '0 B',
    linkSpeedLabel: 'Disabled',
    txPackets: '0',
    rxPackets: '0',
    crcErrors: 0,
  },
  {
    key: 'serverroom-switch-2-port-9',
    port: 9,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port9',
    linkStatus: 'disconnected',
    isSfp: true,
    label: '-',
    type: 'Trunk',
    poe: '--',
    poeCapable: false,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '0 B',
    rxSum: '0 B',
    linkSpeedLabel: 'Down',
    txPackets: '0',
    rxPackets: '0',
    crcErrors: 0,
  },
  {
    key: 'serverroom-switch-2-port-10',
    port: 10,
    switchKey: 'serverroom-switch-2',
    switchName: 'ServerRoom_Switch_2',
    switchProductSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    name: 'Port10',
    linkStatus: '10g',
    isSfp: true,
    connectionName: 'DataCenter_Olt_1',
    connectionProductSlug: 'nvr-3',
    connectionType: 'olt',
    label: 'Fiber Link',
    type: 'Trunk',
    poe: '--',
    poeCapable: false,
    operation: 'Switching',
    profile: 'All',
    nativeNetwork: 'Default(1)',
    txSum: '2.80 GB',
    rxSum: '1.94 GB',
    linkSpeedLabel: '10G FDX',
    txPackets: '2,412,900',
    rxPackets: '1,690,410',
    crcErrors: 0,
  },
];

/**
 * Exact 30 switch port entries across the 3 Headquarters Building switches:
 * `CTOOffice_Switch_1` (Ports 1-10), `SalesDepartment_Switch_3` (Ports 1-10),
 * and `ServerRoom_Switch_2` (Ports 1-10).
 */
export const INITIAL_SWITCH_PORTS: SwitchPortRow[] = [
  ...buildCtoSwitchPorts(),
  ...buildSalesSwitchPorts(),
  ...buildServerRoomSwitchPorts(),
];

export const INITIAL_PORT_PROFILES: SwitchPortProfileRecord[] = [
  {
    key: 'profile-all',
    name: 'All',
    builtIn: true,
    poe: 'Keep Device Settings',
    nativeNetwork: 'Default(1)',
    taggedNetworks: 'All',
    untaggedNetworks: '--',
    bandwidthLimit: 'Off',
    lldpMed: 'Enable',
    isolation: false,
    stormControl: false,
  },
  {
    key: 'profile-disabled',
    name: 'Disabled',
    builtIn: true,
    poe: 'Off',
    nativeNetwork: '--',
    taggedNetworks: '--',
    untaggedNetworks: '--',
    bandwidthLimit: 'Off',
    lldpMed: 'Disable',
    isolation: false,
    stormControl: false,
  },
  {
    key: 'profile-default',
    name: 'Default',
    poe: 'On',
    nativeNetwork: 'Default(1)',
    taggedNetworks: '--',
    untaggedNetworks: 'Default(1)',
    bandwidthLimit: 'Off',
    lldpMed: 'Enable',
    isolation: false,
    stormControl: false,
  },
  {
    key: 'profile-ap-trunk',
    name: 'AP_Trunk',
    poe: 'On',
    nativeNetwork: 'Default(1)',
    taggedNetworks: 'vlan20(20), interface-vlan100(100)',
    untaggedNetworks: '--',
    bandwidthLimit: 'Off',
    lldpMed: 'Enable',
    isolation: false,
    stormControl: true,
  },
  {
    key: 'profile-mgmt',
    name: 'Mgmt',
    poe: 'Off',
    nativeNetwork: 'Default(1)',
    taggedNetworks: '--',
    untaggedNetworks: 'Default(1)',
    bandwidthLimit: '100 Mbps',
    lldpMed: 'Disable',
    isolation: true,
    stormControl: true,
  },
  {
    key: 'profile-voip',
    name: 'VoIP_Phone',
    poe: 'On',
    nativeNetwork: 'Default(1)',
    taggedNetworks: 'interface-vlan110(110)',
    untaggedNetworks: 'Default(1)',
    bandwidthLimit: 'Off',
    lldpMed: 'Enable',
    isolation: false,
    stormControl: false,
  },
];

export const INITIAL_DDNS_ENTRIES: DynamicDnsEntryRecord[] = [
  {
    key: 'ddns-1',
    provider: 'DynDNS',
    interfaceName: '3_832db9e5f1ef49dfa771961a9f8885c4',
    status: 'incorrect-credential',
    statusLabel: 'Incorrect Credential',
    username: 'admin',
    password: '••••••••',
    domainName: 'test.com',
    ip: '192.168.220.168',
    updateInterval: 'never',
  },
];

export const DDNS_PROVIDER_OPTIONS = [
  { label: 'DynDNS', value: 'DynDNS' },
  { label: 'No-IP', value: 'No-IP' },
  { label: 'DuckDNS', value: 'DuckDNS' },
  { label: 'Cloudflare', value: 'Cloudflare' },
  { label: 'Peanuthull', value: 'Peanuthull' },
  { label: 'Comexe', value: 'Comexe' },
];

export const DDNS_INTERFACE_OPTIONS = [
  {
    label: '3_832db9e5f1ef49dfa771961a9f8885c4',
    value: '3_832db9e5f1ef49dfa771961a9f8885c4',
  },
  { label: '2.5G WAN/LAN1', value: '2.5G WAN/LAN1' },
  { label: 'WAN/LAN3', value: 'WAN/LAN3' },
];

export const DDNS_INTERVAL_OPTIONS = [
  { label: 'never', value: 'never' },
  { label: '1 hour', value: '1 hour' },
  { label: '6 hours', value: '6 hours' },
  { label: '12 hours', value: '12 hours' },
  { label: '1 day', value: '1 day' },
];

export const DNS_PROXY_PRESETS: DnsProxyPresetOption[] = [
  {
    key: 'google',
    label: 'Google',
    dohUrl: 'https://dns.google/dns-query',
    dotHost: 'dns.google',
  },
  {
    key: 'cloudflare',
    label: 'Cloudflare',
    dohUrl: 'https://cloudflare-dns.com/dns-query',
    dotHost: '1dot1dot1dot1.cloudflare-dns.com',
  },
  {
    key: 'quad9-1',
    label: 'Quad9_1',
    dohUrl: 'https://dns.quad9.net/dns-query',
    dotHost: 'dns.quad9.net',
  },
  {
    key: 'quad9-2',
    label: 'Quad9_2',
    dohUrl: 'https://dns9.quad9.net/dns-query',
    dotHost: 'dns9.quad9.net',
  },
  {
    key: 'cleanbrowsing',
    label: 'CleanBrowsing',
    dohUrl: 'https://doh.cleanbrowsing.org/doh/security-filter/',
    dotHost: 'security-filter-dns.cleanbrowsing.org',
  },
];

export const INITIAL_DNS_PROXY_CUSTOM_SERVERS: DnsProxyCustomServer[] = [
  {
    key: 'custom-1',
    checked: false,
    name: 'Test_Dns_Proxy_1',
    url: 'https://www.tp-link-test-1.com',
  },
  {
    key: 'custom-2',
    checked: true,
    name: 'Test_Dns_Proxy_2',
    url: 'https://www.tp-link-test-2.com',
  },
];

export const INITIAL_DNS_CACHE_CONFIG: DnsCacheConfig = {
  enabled: false,
  cacheSize: 5000,
  cacheTtl: 1200,
  cachedEntries: 0,
};
