import type { OmadaProductName } from '@/omada';

// ============================================================================
// Site Settings Types & Defaults (steps/368)
// ============================================================================

export interface SiteSettingsState {
  siteName: string;
  applicationScenario: string;
  countryRegion: string;
  timezone: string;
  ntpServer: string;
  dstEnabled: boolean;
  locationAddress: string;
  latitude: string;
  longitude: string;
  informUrl: string;
  // General Config
  ledEnabled: boolean;
  switchJumbo: number;
  switchLagHash: string;
  rememberDevice: boolean;
  lldpGateway: boolean;
  lldpSwitch: boolean;
  lldpAp: boolean;
  portalLogoutDomain: string;
  remoteLogging: boolean;
  syslogServer: string;
  syslogPort: number;
  automaticUpgrade: boolean;
  upgradeSchedule: string;
  controllerFailover: boolean;
  dataRetention: string;
  alertEmails: boolean;
  alertRecipient: string;
  // Wireless Features (all 15 items)
  mesh: boolean;
  autoFailover: boolean;
  fullSectorDfs: boolean;
  autoChannelSelection: string;
  fastRoaming: boolean;
  nonStickRoaming: boolean;
  aiRoaming: boolean;
  dualBand11kReport: boolean;
  forceDisassociation: boolean;
  bandSteering: boolean;
  airtimeFairness: boolean;
  beaconControl: boolean;
  ofdma: boolean;
  mlo: boolean;
  optimization24Ghz: boolean;
  // Device Account
  deviceUsername: string;
  devicePassword: string;
  // Auto Send Data to Email
  autoSendEnabled: boolean;
  autoSendData: string;
  autoSendFrequency: string;
  autoSendDay: string;
  autoSendTime: string;
  autoSendEmails: string[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsState = {
  siteName: 'Main Office Floor',
  applicationScenario: 'Campus',
  countryRegion: 'United States',
  timezone: '(UTC-08:00) Pacific Time (US & Canada)',
  ntpServer: 'pool.ntp.org',
  dstEnabled: true,
  locationAddress: '1450 Enterprise Pkwy, San Jose, CA',
  latitude: '37.3382',
  longitude: '-121.8863',
  informUrl: 'omada://aps1-omada-device-beta.tplinkcloud.com/site/68cb5f3c0d0b69602995c57e',
  ledEnabled: true,
  switchJumbo: 1518,
  switchLagHash: 'SRC IP+DST IP',
  rememberDevice: false,
  lldpGateway: true,
  lldpSwitch: true,
  lldpAp: true,
  portalLogoutDomain: 'portal.tplink.net',
  remoteLogging: false,
  syslogServer: '192.168.0.50',
  syslogPort: 514,
  automaticUpgrade: false,
  upgradeSchedule: 'Sunday 02:00',
  controllerFailover: false,
  dataRetention: 'Follow Global Configuration',
  alertEmails: false,
  alertRecipient: 'netops@headquarters.local',
  mesh: true,
  autoFailover: true,
  fullSectorDfs: false,
  autoChannelSelection: 'Off',
  fastRoaming: false,
  nonStickRoaming: false,
  aiRoaming: false,
  dualBand11kReport: false,
  forceDisassociation: false,
  bandSteering: false,
  airtimeFairness: false,
  beaconControl: false,
  ofdma: false,
  mlo: false,
  optimization24Ghz: false,
  deviceUsername: 'admin',
  devicePassword: 'Omada@2026',
  autoSendEnabled: false,
  autoSendData: 'Logs',
  autoSendFrequency: 'Weekly',
  autoSendDay: 'Monday',
  autoSendTime: '00:00',
  autoSendEmails: [],
};

export const APPLICATION_SCENARIO_OPTIONS = [
  'Campus',
  'Office',
  'Hotel',
  'Shopping Mall',
  'Hospital',
  'Restaurant',
  'Dormitory',
  'Home',
  'General',
].map((v) => ({ label: v, value: v }));

export const COUNTRY_REGION_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'Australia',
].map((v) => ({ label: v, value: v }));

export const TIMEZONE_OPTIONS = [
  '(UTC-08:00) Pacific Time (US & Canada)',
  '(UTC-05:00) Eastern Time (US & Canada)',
  '(UTC+00:00) London / UTC',
  '(UTC+01:00) Berlin / Paris',
  '(UTC+08:00) Singapore / Taipei',
  '(UTC+09:00) Tokyo',
].map((v) => ({ label: v, value: v }));

export const SWITCH_LAG_HASH_OPTIONS = [
  'SRC IP+DST IP',
  'SRC MAC+DST MAC',
  'SRC IP+DST IP+SRC Port+DST Port',
  'SRC MAC+DST MAC+SRC IP+DST IP',
].map((v) => ({ label: v, value: v }));

export const DATA_RETENTION_OPTIONS = [
  'Follow Global Configuration',
  '7 Days',
  '30 Days',
  '90 Days',
  '180 Days',
  '365 Days',
].map((v) => ({ label: v, value: v }));

export const AUTO_CHANNEL_OPTIONS = ['Off', 'On', 'Scheduled'].map((v) => ({
  label: v,
  value: v,
}));

export const EMAIL_DATA_OPTIONS = ['Logs', 'Alerts', 'Client Statistics', 'All Reports'].map(
  (v) => ({ label: v, value: v }),
);

export const EMAIL_FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly'].map((v) => ({
  label: v,
  value: v,
}));

export const EMAIL_DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
].map((v) => ({ label: v, value: v }));

export const EMAIL_TIME_OPTIONS = ['00:00', '03:00', '06:00', '12:00', '18:00'].map((v) => ({
  label: v,
  value: v,
}));

// ============================================================================
// Internet Types & Defaults (steps/379)
// ============================================================================

export interface InternetPortRecord {
  key: string;
  portName: string;
  status: 'Enable' | 'Disable';
  description: string;
  setToWan: boolean;
  connectionType: 'Dynamic IP' | 'Static IP' | 'PPPoE';
  vlanId: number;
  mtu: number;
  primaryDns: string;
  secondaryDns: string;
}

export interface LinkBackupRule {
  key: string;
  name: string;
  primaryWan: string;
  backupWan: string;
  mode: 'Failover' | 'Backup (Time-based)';
  enabled: boolean;
}

export const GATEWAY_MODEL_OPTIONS = [
  'ER7412-M2 v1.0',
  'ER8411 v1.0',
  'ER707-M2 v1.0',
  'ER7206 v2.0',
  'ER605 v2.0',
].map((v) => ({ label: v, value: v }));

export const DETECTION_INTERVAL_OPTIONS = [
  'Custom',
  'Auto (10s)',
  'Fast (5s)',
  'Normal (30s)',
].map((v) => ({ label: v, value: v }));

export const INITIAL_INTERNET_PORTS: InternetPortRecord[] = [
  {
    key: 'usb-modem',
    portName: 'USB Modem',
    status: 'Enable',
    description: '-',
    setToWan: false,
    connectionType: 'Dynamic IP',
    vlanId: 1,
    mtu: 1500,
    primaryDns: '8.8.8.8',
    secondaryDns: '1.1.1.1',
  },
  {
    key: 'wan-lan1',
    portName: '2.5G WAN/LAN1',
    status: 'Enable',
    description: '-',
    setToWan: true,
    connectionType: 'Dynamic IP',
    vlanId: 1,
    mtu: 1500,
    primaryDns: '8.8.8.8',
    secondaryDns: '1.1.1.1',
  },
  {
    key: 'wan-lan2',
    portName: '2.5G WAN/LAN2',
    status: 'Enable',
    description: '-',
    setToWan: false,
    connectionType: 'Dynamic IP',
    vlanId: 1,
    mtu: 1500,
    primaryDns: '8.8.8.8',
    secondaryDns: '1.1.1.1',
  },
  {
    key: 'wan-lan3',
    portName: 'WAN/LAN3',
    status: 'Enable',
    description: '-',
    setToWan: true,
    connectionType: 'Static IP',
    vlanId: 10,
    mtu: 1500,
    primaryDns: '8.8.4.4',
    secondaryDns: '1.0.0.1',
  },
  ...Array.from({ length: 7 }, (_, i): InternetPortRecord => {
    const portNum = i + 4;
    return {
      key: `wan-lan${portNum}`,
      portName: `WAN/LAN${portNum}`,
      status: 'Enable',
      description: '-',
      setToWan: false,
      connectionType: 'Dynamic IP',
      vlanId: 1,
      mtu: 1500,
      primaryDns: '8.8.8.8',
      secondaryDns: '1.1.1.1',
    };
  }),
  {
    key: 'sfp-wan-lan11',
    portName: 'SFP WAN/LAN11',
    status: 'Enable',
    description: '-',
    setToWan: false,
    connectionType: 'Dynamic IP',
    vlanId: 1,
    mtu: 1500,
    primaryDns: '8.8.8.8',
    secondaryDns: '1.1.1.1',
  },
  {
    key: 'sfp-wan-lan12',
    portName: 'SFP WAN/LAN12',
    status: 'Enable',
    description: '-',
    setToWan: false,
    connectionType: 'Dynamic IP',
    vlanId: 1,
    mtu: 1500,
    primaryDns: '8.8.8.8',
    secondaryDns: '1.1.1.1',
  },
];

export const INITIAL_LINK_BACKUP_RULES: LinkBackupRule[] = [
  {
    key: 'lb-1',
    name: 'Primary Fiber Failover',
    primaryWan: '2.5G WAN/LAN1',
    backupWan: 'WAN/LAN3',
    mode: 'Failover',
    enabled: true,
  },
];

// ============================================================================
// LAN -> VLAN, Ports, Multicast Snooping, Isolation & LAN DNS (steps/387)
// ============================================================================

export interface LanVlanRecord {
  key: string;
  name: string;
  vlanId: number;
  subnet: string;
  dhcpPool: string;
  availableIps: number;
  totalIps: number;
  portalEnabled: boolean;
  accessControlRule: string;
  rateLimit: string;
  purpose: 'Interface' | 'VLAN';
  dhcpEnabled: boolean;
  dhcpServerNodeId: string;
  memberNodeIds: string[];
  igmpSnooping: boolean;
  fastLeave: boolean;
}

export interface VlanTopoNode {
  id: string;
  name: string;
  kind: 'device' | 'controller';
  productSlug: OmadaProductName;
  ip: string;
  mac: string;
  model: string;
  healthDot: 'good' | 'fair' | 'poor' | 'none';
  portLabel?: string;
  speedLabel?: string;
  linkDashed?: boolean;
  collapsible?: boolean;
  children?: VlanTopoNode[];
}

export interface VlanPortAssignment {
  key: string;
  deviceName: string;
  productSlug: OmadaProductName;
  model: string;
  port: string;
  pvid: number;
  tagging: 'Untagged' | 'Tagged' | 'Excluded';
  linkStatus: '1000FDX' | '2.5GFDX' | 'Disconnected';
}

export interface LanIsolationRule {
  key: string;
  name: string;
  sourceVlan: string;
  isolatedTarget: string;
  direction: 'Bidirectional' | 'Outbound Only';
  enabled: boolean;
}

export interface LanDnsRecord {
  key: string;
  name: string;
  domain: string;
  type: 'Host' | 'CNAME' | 'SRV';
  ipOrTarget: string;
  ttl: number;
  enabled: boolean;
}

export const INITIAL_VLANS: LanVlanRecord[] = [
  {
    key: 'vlan-1',
    name: 'Default',
    vlanId: 1,
    subnet: '192.168.0.1 / 24',
    dhcpPool: '192.168.0.1-192.168.0.254',
    availableIps: 2,
    totalIps: 65535,
    portalEnabled: true,
    accessControlRule: '-',
    rateLimit: '-',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: [
      'mainoffice-gateway-2',
      'ctooffice-switch-1',
      'serverroom-switch-2',
      'salesdepartment-switch-3',
      'datacenter-olt-1',
      'coooffice-eap-1',
      'breakroom-eap-2',
      'storageroom-eap-3',
    ],
    igmpSnooping: true,
    fastLeave: false,
  },
  {
    key: 'vlan-4090',
    name: 'interface-vlan4090',
    vlanId: 4090,
    subnet: '192.168.91.1 / 24',
    dhcpPool: '192.168.91.10-192.168.91.254',
    availableIps: 241,
    totalIps: 245,
    portalEnabled: false,
    accessControlRule: '-',
    rateLimit: '-',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: [
      'mainoffice-gateway-2',
      'serverroom-switch-2',
      'datacenter-olt-1',
    ],
    igmpSnooping: false,
    fastLeave: false,
  },
  {
    key: 'vlan-100',
    name: 'interface-vlan100',
    vlanId: 100,
    subnet: '192.168.100.1 / 24',
    dhcpPool: '192.168.100.10-192.168.100.254',
    availableIps: 238,
    totalIps: 245,
    portalEnabled: true,
    accessControlRule: 'Corp-ACL',
    rateLimit: '-',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: [
      'mainoffice-gateway-2',
      'ctooffice-switch-1',
      'salesdepartment-switch-3',
      'coooffice-eap-1',
      'storageroom-eap-3',
    ],
    igmpSnooping: true,
    fastLeave: true,
  },
  {
    key: 'vlan-20',
    name: 'vlan20',
    vlanId: 20,
    subnet: '192.168.20.1 / 24',
    dhcpPool: '192.168.20.10-192.168.20.254',
    availableIps: 240,
    totalIps: 245,
    portalEnabled: true,
    accessControlRule: 'Guest-Isolate',
    rateLimit: '50 Mbps',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: [
      'mainoffice-gateway-2',
      'salesdepartment-switch-3',
      'breakroom-eap-2',
    ],
    igmpSnooping: false,
    fastLeave: false,
  },
  {
    key: 'vlan-71',
    name: 'inteface-vlan71',
    vlanId: 71,
    subnet: '192.168.71.1 / 24',
    dhcpPool: '192.168.71.10-192.168.71.254',
    availableIps: 244,
    totalIps: 245,
    portalEnabled: false,
    accessControlRule: '-',
    rateLimit: '-',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: ['mainoffice-gateway-2', 'ctooffice-switch-1'],
    igmpSnooping: false,
    fastLeave: false,
  },
  {
    key: 'vlan-110',
    name: 'interface-vlan110',
    vlanId: 110,
    subnet: '192.168.110.1 / 24',
    dhcpPool: '192.168.110.10-192.168.110.254',
    availableIps: 242,
    totalIps: 245,
    portalEnabled: false,
    accessControlRule: 'VoIP-Priority',
    rateLimit: '-',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: [
      'mainoffice-gateway-2',
      'serverroom-switch-2',
      'salesdepartment-switch-3',
      'coooffice-eap-1',
    ],
    igmpSnooping: true,
    fastLeave: false,
  },
  {
    key: 'vlan-200',
    name: 'vlan 200',
    vlanId: 200,
    subnet: '192.168.200.1 / 24',
    dhcpPool: '192.168.200.10-192.168.200.254',
    availableIps: 245,
    totalIps: 245,
    portalEnabled: false,
    accessControlRule: '-',
    rateLimit: '20 Mbps',
    purpose: 'Interface',
    dhcpEnabled: true,
    dhcpServerNodeId: 'mainoffice-gateway-2',
    memberNodeIds: ['mainoffice-gateway-2', 'serverroom-switch-2'],
    igmpSnooping: false,
    fastLeave: false,
  },
];

export const VLAN_TOPOLOGY_TREE: VlanTopoNode = {
  id: 'breakroom-gateway-1',
  name: 'BreakRoom_Gateway_1',
  kind: 'device',
  productSlug: 'eap221-lr-kit',
  ip: '192.168.254.100',
  mac: '00-14-78-00-00-00',
  model: 'ER701-5G-Outdoor v1.0',
  healthDot: 'good',
  linkDashed: true,
  children: [
    {
      id: 'mainoffice-gateway-2',
      name: 'MainOffice_Gateway_2',
      kind: 'device',
      productSlug: 'er8411',
      ip: '192.168.0.1',
      mac: '00-1D-0F-03-27-B7',
      model: 'ER7412-M2 v1.0',
      healthDot: 'good',
      collapsible: true,
      children: [
        {
          id: 'ctooffice-switch-1',
          name: 'CTOOffice_Switch_1',
          kind: 'device',
          productSlug: 'sg2428p-un-5-40',
          ip: '192.168.0.101',
          mac: '0C-EF-15-EF-B9-10',
          model: 'SG3210 v3.20',
          healthDot: 'good',
          portLabel: '→ #1',
          speedLabel: '1000FDX',
        },
        {
          id: 'serverroom-switch-2',
          name: 'ServerRoom_Switch_2',
          kind: 'device',
          productSlug: 'sg3452p-un-3-40',
          ip: '192.168.0.103',
          mac: '00-FF-00-1B-57-93',
          model: 'TL-SG2210MP v2.0',
          healthDot: 'poor',
          portLabel: '→ #1',
          speedLabel: '1000FDX',
        },
        {
          id: 'salesdepartment-switch-3',
          name: 'SalesDepartment_Switch_3',
          kind: 'device',
          productSlug: 'tl-sg3452x-un-1-0',
          ip: '192.168.0.102',
          mac: '0C-EF-15-4E-90-95',
          model: 'SG2210MP v5.0',
          healthDot: 'fair',
          portLabel: '→ #1',
          speedLabel: '1000FDX',
          collapsible: true,
          children: [
            {
              id: 'coooffice-eap-1',
              name: 'COOOffice_Eap_1',
              kind: 'device',
              productSlug: 'eap727-eu-1-0',
              ip: '192.168.0.121',
              mac: 'A8-29-48-D0-7B-10',
              model: 'EAP773(EU) v1.0',
              healthDot: 'fair',
              portLabel: '#2 ←',
              speedLabel: '1000FDX',
            },
            {
              id: 'breakroom-eap-2',
              name: 'BreakRoom_Eap_2',
              kind: 'device',
              productSlug: 'eap668-outdoor-hd-un-1-2',
              ip: '192.168.0.122',
              mac: '00-FF-00-38-95-10',
              model: 'EAP668-Outdoor HD(EU) v1.0',
              healthDot: 'good',
              portLabel: '#3 ←',
              speedLabel: '1000FDX',
            },
            {
              id: 'storageroom-eap-3',
              name: 'StorageRoom_Eap_3',
              kind: 'device',
              productSlug: 'eap650',
              ip: '192.168.0.123',
              mac: '00-FF-00-2B-0E-BC',
              model: 'EAP620 HD(US) v3.0[Custom]',
              healthDot: 'none',
              portLabel: '#4 ←',
              speedLabel: '1000FDX',
            },
          ],
        },
        {
          id: 'datacenter-olt-1',
          name: 'DataCenter_Olt_1',
          kind: 'device',
          productSlug: 'nvr-3',
          ip: '192.168.0.200',
          mac: '00-FF-00-16-B6-3E',
          model: 'DS-P7001-08 1.0',
          healthDot: 'none',
        },
        {
          id: 'omada-controller',
          name: 'Omada Controller',
          kind: 'controller',
          productSlug: 'controller',
          ip: '192.168.0.10',
          mac: '50-91-E3-AA-10-01',
          model: 'Software Controller v6.3',
          healthDot: 'none',
        },
      ],
    },
  ],
};

export const INITIAL_VLAN_PORTS: VlanPortAssignment[] = [
  {
    key: 'vp-1',
    deviceName: 'MainOffice_Gateway_2',
    productSlug: 'er8411',
    model: 'ER7412-M2 v1.0',
    port: 'LAN1 (#1)',
    pvid: 1,
    tagging: 'Untagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-2',
    deviceName: 'MainOffice_Gateway_2',
    productSlug: 'er8411',
    model: 'ER7412-M2 v1.0',
    port: 'LAN2 (#2)',
    pvid: 1,
    tagging: 'Untagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-3',
    deviceName: 'CTOOffice_Switch_1',
    productSlug: 'sg2428p-un-5-40',
    model: 'SG3210 v3.20',
    port: 'Port1 (Uplink)',
    pvid: 1,
    tagging: 'Tagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-4',
    deviceName: 'ServerRoom_Switch_2',
    productSlug: 'sg3452p-un-3-40',
    model: 'TL-SG2210MP v2.0',
    port: 'Port1 (Uplink)',
    pvid: 1,
    tagging: 'Tagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-5',
    deviceName: 'SalesDepartment_Switch_3',
    productSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    port: 'Port1 (Uplink)',
    pvid: 1,
    tagging: 'Tagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-6',
    deviceName: 'SalesDepartment_Switch_3',
    productSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    port: 'Port2 -> COOOffice_Eap_1',
    pvid: 1,
    tagging: 'Untagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-7',
    deviceName: 'SalesDepartment_Switch_3',
    productSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    port: 'Port3 -> BreakRoom_Eap_2',
    pvid: 1,
    tagging: 'Untagged',
    linkStatus: '1000FDX',
  },
  {
    key: 'vp-8',
    deviceName: 'SalesDepartment_Switch_3',
    productSlug: 'tl-sg3452x-un-1-0',
    model: 'SG2210MP v5.0',
    port: 'Port4 -> StorageRoom_Eap_3',
    pvid: 1,
    tagging: 'Untagged',
    linkStatus: '1000FDX',
  },
];

export const INITIAL_ISOLATION_RULES: LanIsolationRule[] = [
  {
    key: 'iso-1',
    name: 'Guest VLAN Isolation',
    sourceVlan: 'vlan20 (VLAN 20)',
    isolatedTarget: 'Default (VLAN 1)',
    direction: 'Bidirectional',
    enabled: true,
  },
  {
    key: 'iso-2',
    name: 'IoT Subnet Quarantine',
    sourceVlan: 'vlan 200 (VLAN 200)',
    isolatedTarget: 'interface-vlan100 (VLAN 100)',
    direction: 'Bidirectional',
    enabled: true,
  },
];

export const INITIAL_LAN_DNS_RULES: LanDnsRecord[] = [
  {
    key: 'dns-1',
    name: 'Omada Local Controller',
    domain: 'controller.hq.local',
    type: 'Host',
    ipOrTarget: '192.168.0.10',
    ttl: 3600,
    enabled: true,
  },
  {
    key: 'dns-2',
    name: 'Server Room NAS',
    domain: 'nas.hq.local',
    type: 'Host',
    ipOrTarget: '192.168.91.20',
    ttl: 1800,
    enabled: true,
  },
  {
    key: 'dns-3',
    name: 'Captive Portal Alias',
    domain: 'portal.tplink.net',
    type: 'CNAME',
    ipOrTarget: 'controller.hq.local',
    ttl: 600,
    enabled: true,
  },
];
