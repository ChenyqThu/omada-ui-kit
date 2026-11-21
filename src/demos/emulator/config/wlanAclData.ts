import { createSchedulePreset, type SScheduleMatrix } from '@/omada';

/* ============================================================================
 * WLAN (`#/wlan`) Data & Types
 * ============================================================================ */

export type WlanBandKey = '2.4 GHz' | '5 GHz' | '6 GHz';
export type WlanSecurityType = 'None' | 'WPA-Personal' | 'WPA-Enterprise' | 'WPA3-Personal';

export interface WlanSsidRecord {
  key: string;
  ssidName: string;
  enabled: boolean;
  security: WlanSecurityType;
  passphrase?: string;
  bands: WlanBandKey[];
  devicesLabel: string;
  apGroups: string[];
  clients: number;
  traffic: string;
  vlan: string;
  guestNetwork?: boolean;
  broadcastSsid?: boolean;
  rateLimitProfile?: string;
}

export interface WlanOptimizationRadioRecord {
  key: string;
  apName: string;
  model: string;
  band24Channel: string;
  band24Power: string;
  band5Channel: string;
  band5Power: string;
  band6Channel: string;
  interference: string;
}

export interface WlanOptimizationHistoryRecord {
  key: string;
  time: string;
  trigger: 'Manual' | 'Scheduled' | 'AI Auto';
  apCount: number;
  changes24: string;
  changes5: string;
  changes6: string;
  status: 'Succeeded' | 'Skipped';
}

export interface WlanClientPreviewItem {
  key: string;
  name: string;
  mac: string;
  ip: string;
  ap: string;
  band: WlanBandKey;
  signal: string;
}

export const INITIAL_WLAN_SSIDS: WlanSsidRecord[] = [
  {
    key: 'test-ssid-1',
    ssidName: 'test_ssid_1',
    enabled: true,
    security: 'None',
    bands: ['2.4 GHz', '5 GHz', '6 GHz'],
    devicesLabel: 'All Devices',
    apGroups: ['Default AP Group (3 APs)'],
    clients: 3,
    traffic: '-',
    vlan: '-',
    guestNetwork: false,
    broadcastSsid: true,
    rateLimitProfile: 'Unlimited',
  },
  {
    key: 'office-staff',
    ssidName: 'Office_Staff',
    enabled: true,
    security: 'WPA-Personal',
    passphrase: '••••••••••••',
    bands: ['2.4 GHz', '5 GHz'],
    devicesLabel: '2 Groups (3 APs)',
    apGroups: ['Main Office Group (2 APs)', 'Break & Storage Group (1 AP)'],
    clients: 3,
    traffic: '-',
    vlan: '-',
    guestNetwork: false,
    broadcastSsid: true,
    rateLimitProfile: 'Staff_100M',
  },
];

export const WLAN_OPTIMIZATION_RADIOS: WlanOptimizationRadioRecord[] = [
  {
    key: 'ap-1',
    apName: 'COOOffice_Eap_1',
    model: 'EAP670 v1.0',
    band24Channel: 'Ch 1 (20 MHz)',
    band24Power: 'Medium (14 dBm)',
    band5Channel: 'Ch 36 (80 MHz)',
    band5Power: 'High (21 dBm)',
    band6Channel: 'Ch 37 (160 MHz)',
    interference: '6%',
  },
  {
    key: 'ap-2',
    apName: 'BreakRoom_Eap_2',
    model: 'EAP650 v1.0',
    band24Channel: 'Ch 6 (20 MHz)',
    band24Power: 'Medium (14 dBm)',
    band5Channel: 'Ch 149 (80 MHz)',
    band5Power: 'High (20 dBm)',
    band6Channel: '--',
    interference: '11%',
  },
  {
    key: 'ap-3',
    apName: 'StorageRoom_Eap_3',
    model: 'EAP773 v1.0',
    band24Channel: 'Ch 11 (20 MHz)',
    band24Power: 'Low (11 dBm)',
    band5Channel: 'Ch 52 DFS (80 MHz)',
    band5Power: 'Medium (17 dBm)',
    band6Channel: 'Ch 69 (160 MHz)',
    interference: '4%',
  },
];

export const INITIAL_WLAN_OPTIMIZATION_HISTORY: WlanOptimizationHistoryRecord[] = [
  {
    key: 'opt-1',
    time: '2026-11-21 03:00:12',
    trigger: 'Scheduled',
    apCount: 3,
    changes24: '2 APs tuned (Ch 1 / Ch 6 / Ch 11)',
    changes5: '1 AP moved to Ch 149',
    changes6: '0 changes',
    status: 'Succeeded',
  },
  {
    key: 'opt-2',
    time: '2026-11-18 14:22:05',
    trigger: 'Manual',
    apCount: 3,
    changes24: 'Power calibrated to Medium',
    changes5: 'Width locked to 80 MHz',
    changes6: 'PSC Channel 37 assigned',
    status: 'Succeeded',
  },
];

export const WLAN_CLIENT_SAMPLES: Record<string, WlanClientPreviewItem[]> = {
  'test-ssid-1': [
    {
      key: 'c1',
      name: 'Neffos_X20_Pro',
      mac: '74-DA-88-11-9C-20',
      ip: '192.168.0.104',
      ap: 'COOOffice_Eap_1',
      band: '5 GHz',
      signal: '-54 dBm',
    },
    {
      key: 'c2',
      name: 'Visitor-iPad',
      mac: '3C-22-FB-88-12-09',
      ip: '192.168.0.118',
      ap: 'BreakRoom_Eap_2',
      band: '6 GHz',
      signal: '-49 dBm',
    },
    {
      key: 'c3',
      name: 'Scanner-Handset',
      mac: 'B8-27-EB-4A-71-0C',
      ip: '192.168.0.129',
      ap: 'StorageRoom_Eap_3',
      band: '2.4 GHz',
      signal: '-62 dBm',
    },
  ],
  'office-staff': [
    {
      key: 'c4',
      name: 'Test_PC',
      mac: 'AC-84-C6-32-11-8A',
      ip: '192.168.100.15',
      ap: 'COOOffice_Eap_1',
      band: '5 GHz',
      signal: '-48 dBm',
    },
    {
      key: 'c5',
      name: 'Finance-MacBook',
      mac: 'F0-18-98-44-C2-10',
      ip: '192.168.100.22',
      ap: 'COOOffice_Eap_1',
      band: '5 GHz',
      signal: '-52 dBm',
    },
    {
      key: 'c6',
      name: 'Conference-Display',
      mac: 'D8-0D-17-90-45-E1',
      ip: '192.168.100.38',
      ap: 'BreakRoom_Eap_2',
      band: '2.4 GHz',
      signal: '-59 dBm',
    },
  ],
};

/* ============================================================================
 * ACL (`#/acl`) Data & Types
 * ============================================================================ */

export type AclTabKey = 'gateway' | 'switch' | 'eap';
export type AclPolicyType = 'Permit' | 'Deny';

export interface AclRuleRecord {
  key: string;
  enabled: boolean;
  description: string;
  direction: string;
  policy: AclPolicyType;
  protocols: string;
  source: string;
  destination: string;
  binding?: string;
  biDirectional?: boolean;
  timeRange?: string;
}

export const INITIAL_GATEWAY_ACL_RULES: AclRuleRecord[] = [
  {
    key: 'gw-acl-1',
    enabled: true,
    description: 'Gateway_ACL_1',
    direction: 'LAN→WAN',
    policy: 'Permit',
    protocols: 'All',
    source: 'Network:interface-vlan100',
    destination: 'IP Group:ip-1',
    biDirectional: false,
    timeRange: 'Any',
  },
  {
    key: 'gw-acl-2',
    enabled: false,
    description: 'Gateway_ACL_2',
    direction: 'LAN→WAN',
    policy: 'Permit',
    protocols: 'All',
    source: 'IP-Port Group:port-1',
    destination: 'IP Group:ip-1',
    biDirectional: false,
    timeRange: 'Any',
  },
  {
    key: 'gw-acl-3',
    enabled: true,
    description: 'Gateway_ACL_3',
    direction: 'LAN→WAN',
    policy: 'Permit',
    protocols: 'All',
    source: 'Network:interface-vlan100',
    destination: 'IP Group:ip-1',
    biDirectional: false,
    timeRange: 'Workdays_09_18',
  },
];

export const INITIAL_SWITCH_ACL_RULES: AclRuleRecord[] = [
  {
    key: 'sw-acl-1',
    enabled: true,
    description: 'Switch_ACL_1',
    direction: 'Ingress',
    policy: 'Permit',
    protocols: 'All',
    source: 'Network:interface-vlan100',
    destination: 'Network:Default',
    binding: 'All Switches',
    biDirectional: true,
    timeRange: 'Any',
  },
  {
    key: 'sw-acl-2',
    enabled: true,
    description: 'Switch_ACL_2',
    direction: 'Ingress',
    policy: 'Deny',
    protocols: 'TCP',
    source: 'IP Group:guest-subnet',
    destination: 'IP Group:ip-1',
    binding: 'SalesDepartment_Switch_3',
    biDirectional: false,
    timeRange: 'Any',
  },
  {
    key: 'sw-acl-3',
    enabled: false,
    description: 'Switch_ACL_3',
    direction: 'Ingress',
    policy: 'Permit',
    protocols: 'UDP',
    source: 'IP-Port Group:port-1',
    destination: 'Network:interface-vlan4090',
    binding: 'CTOOffice_Switch_1',
    biDirectional: false,
    timeRange: 'Workdays_09_18',
  },
];

export const INITIAL_EAP_ACL_RULES: AclRuleRecord[] = [
  {
    key: 'eap-acl-1',
    enabled: true,
    description: 'EAP_ACL_1',
    direction: 'Wireless→LAN',
    policy: 'Deny',
    protocols: 'All',
    source: 'SSID:test_ssid_1',
    destination: 'Network:Default',
    binding: 'test_ssid_1',
    biDirectional: false,
    timeRange: 'Any',
  },
  {
    key: 'eap-acl-2',
    enabled: true,
    description: 'EAP_ACL_2',
    direction: 'Wireless→LAN',
    policy: 'Permit',
    protocols: 'TCP, UDP',
    source: 'SSID:Office_Staff',
    destination: 'IP Group:ip-1',
    binding: 'Office_Staff',
    biDirectional: false,
    timeRange: 'Any',
  },
];

export const ACL_OBJECT_DETAILS: Record<
  string,
  { type: string; summary: string; entries: string[] }
> = {
  'Network:interface-vlan100': {
    type: 'LAN Network',
    summary: 'VLAN 100 · Corporate Staff Subnet',
    entries: ['Subnet: 192.168.100.1/24', 'DHCP Pool: 192.168.100.50 - 192.168.100.240'],
  },
  'Network:Default': {
    type: 'LAN Network',
    summary: 'VLAN 1 · Management & Default Subnet',
    entries: ['Subnet: 192.168.0.1/24', 'Gateway: MainOffice_Gateway_2'],
  },
  'Network:interface-vlan4090': {
    type: 'LAN Network',
    summary: 'VLAN 4090 · Device Management',
    entries: ['Subnet: 192.168.90.1/24', 'Isolation: Disabled'],
  },
  'IP Group:ip-1': {
    type: 'IP Address Group',
    summary: 'Primary External & Server Destinations',
    entries: ['10.20.0.0/16 (Campus Core)', '172.16.40.10/32 (Auth Server)'],
  },
  'IP Group:guest-subnet': {
    type: 'IP Address Group',
    summary: 'Guest Wireless Range',
    entries: ['192.168.200.0/24'],
  },
  'IP-Port Group:port-1': {
    type: 'IP-Port Group',
    summary: 'Web & App Management Ports',
    entries: ['0.0.0.0/0 · TCP 80, 443, 8080', '0.0.0.0/0 · UDP 443'],
  },
  'SSID:test_ssid_1': {
    type: 'Wireless SSID',
    summary: 'Open Multi-Band SSID (All Devices)',
    entries: ['Bands: 2.4 GHz, 5 GHz, 6 GHz', 'Connected Clients: 3'],
  },
  'SSID:Office_Staff': {
    type: 'Wireless SSID',
    summary: 'Corporate WPA-Personal SSID',
    entries: ['Bands: 2.4 GHz, 5 GHz', 'Connected Clients: 3'],
  },
};

/* ============================================================================
 * Schema-Driven Configuration Submodules (All 41 remaining Config routes)
 * ============================================================================ */

export type ConfigFieldType =
  | 'switch'
  | 'input'
  | 'number'
  | 'select'
  | 'ip'
  | 'cidr'
  | 'mac'
  | 'password'
  | 'textarea';

export interface ConfigFieldSchema {
  key: string;
  label: string;
  type: ConfigFieldType;
  defaultValue: string | number | boolean;
  placeholder?: string;
  suffixText?: string;
  options?: Array<{ label: string; value: string }>;
  tooltip?: string;
}

export interface ConfigTableColumnSchema {
  key: string;
  title: string;
  width?: number;
  kind?: 'text' | 'status-switch' | 'badge' | 'link';
}

export type ConfigSubmoduleRow = Record<string, string | number | boolean>;

export interface ConfigSubmoduleSchema {
  key: string;
  title: string;
  breadcrumbGroup: string;
  tabs?: Array<{ key: string; label: string }>;
  infoBanner?: string;
  sectionTitle?: string;
  fields: ConfigFieldSchema[];
  scheduleEditor?: {
    label: string;
    profileName: string;
    initialSchedule: SScheduleMatrix;
  };
  table?: {
    title: string;
    addButtonLabel: string;
    columns: ConfigTableColumnSchema[];
    initialRows: ConfigSubmoduleRow[];
    modalFields: ConfigFieldSchema[];
  };
}

function makeSubmodule(schema: ConfigSubmoduleSchema): ConfigSubmoduleSchema {
  return schema;
}

export const CONFIG_SUBMODULE_SCHEMAS: Record<string, ConfigSubmoduleSchema> = {
  ssh: makeSubmodule({
    key: 'ssh',
    title: 'SSH',
    breadcrumbGroup: 'Network Config · General Settings',
    infoBanner:
      'Enabling SSH allows remote CLI access to managed gateways, switches, and EAPs on the configured port.',
    sectionTitle: 'SSH Server Configuration',
    fields: [
      { key: 'sshEnabled', label: 'SSH Login', type: 'switch', defaultValue: true },
      {
        key: 'sshPort',
        label: 'Server Port',
        type: 'number',
        defaultValue: 22,
        suffixText: '(1-65535)',
      },
      {
        key: 'idleTimeout',
        label: 'Session Idle Timeout',
        type: 'number',
        defaultValue: 15,
        suffixText: 'Minutes (1-60)',
      },
      {
        key: 'cipherPolicy',
        label: 'Key Exchange Policy',
        type: 'select',
        defaultValue: 'modern',
        options: [
          { label: 'Modern (Ed25519 / AES-GCM)', value: 'modern' },
          { label: 'Compatible (RSA + AES-CBC)', value: 'compatible' },
        ],
      },
    ],
    table: {
      title: 'SSH Authorized Keys & Access Rules',
      addButtonLabel: 'Add SSH Access Rule',
      columns: [
        { key: 'name', title: 'Rule Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'sourceIp', title: 'Allowed Source IP' },
        { key: 'scope', title: 'Device Scope' },
      ],
      initialRows: [
        {
          key: 'ssh-1',
          name: 'NOC_Admin_Subnet',
          enabled: true,
          sourceIp: '192.168.0.0/24',
          scope: 'All Managed Devices',
        },
        {
          key: 'ssh-2',
          name: 'JumpHost_Bastion',
          enabled: true,
          sourceIp: '10.20.1.15/32',
          scope: 'MainOffice_Gateway_2',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Rule Name', type: 'input', defaultValue: '', placeholder: 'e.g. Ops_Bastion' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        { key: 'sourceIp', label: 'Allowed Source IP', type: 'cidr', defaultValue: '192.168.0.0/24' },
        {
          key: 'scope',
          label: 'Device Scope',
          type: 'select',
          defaultValue: 'All Managed Devices',
          options: [
            { label: 'All Managed Devices', value: 'All Managed Devices' },
            { label: 'MainOffice_Gateway_2', value: 'MainOffice_Gateway_2' },
            { label: 'SalesDepartment_Switch_3', value: 'SalesDepartment_Switch_3' },
          ],
        },
      ],
    },
  }),

  schedule: makeSubmodule({
    key: 'schedule',
    title: 'Schedule',
    breadcrumbGroup: 'Network Config · General Settings',
    infoBanner:
      'Create reusable weekly reboot, PoE power-saving, or WLAN broadcast schedules using the 7×24 time grid.',
    sectionTitle: 'Active Schedule Matrix',
    fields: [
      {
        key: 'scheduleName',
        label: 'Profile Name',
        type: 'input',
        defaultValue: 'Office_PoE_Workhours',
      },
      {
        key: 'applyTarget',
        label: 'Apply To',
        type: 'select',
        defaultValue: 'wlan',
        options: [
          { label: 'WLAN Availability', value: 'wlan' },
          { label: 'Switch PoE Schedule', value: 'poe' },
          { label: 'LED Control', value: 'led' },
        ],
      },
    ],
    scheduleEditor: {
      label: 'Weekly Active Hours (7×24)',
      profileName: 'Office_PoE_Workhours',
      initialSchedule: createSchedulePreset('workdays'),
    },
    table: {
      title: 'Saved Schedules',
      addButtonLabel: 'Create New Schedule',
      columns: [
        { key: 'name', title: 'Schedule Name' },
        { key: 'target', title: 'Module' },
        { key: 'summary', title: 'Active Window' },
        { key: 'status', title: 'Status', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'sch-1',
          name: 'Office_PoE_Workhours',
          target: 'Switch PoE Schedule',
          summary: 'Mon-Fri 09:00 - 18:00',
          status: true,
        },
        {
          key: 'sch-2',
          name: 'Nightly_Radio_Off',
          target: 'WLAN Availability',
          summary: 'Sat-Sun 00:00 - 24:00',
          status: false,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Schedule Name', type: 'input', defaultValue: '', placeholder: 'e.g. Weekend_Maintenance' },
        {
          key: 'target',
          label: 'Module',
          type: 'select',
          defaultValue: 'WLAN Availability',
          options: [
            { label: 'WLAN Availability', value: 'WLAN Availability' },
            { label: 'Switch PoE Schedule', value: 'Switch PoE Schedule' },
            { label: 'LED Control', value: 'LED Control' },
          ],
        },
        { key: 'summary', label: 'Active Window', type: 'input', defaultValue: 'Mon-Fri 08:00 - 19:00' },
        { key: 'status', label: 'Status', type: 'switch', defaultValue: true },
      ],
    },
  }),

  mdns: makeSubmodule({
    key: 'mdns',
    title: 'mDNS',
    breadcrumbGroup: 'Network Config · General Settings',
    infoBanner:
      'Bonjour / mDNS Reflector forwards multicast service discovery packets (AirPlay, Chromecast, printers) across VLANs.',
    fields: [
      { key: 'mdnsEnabled', label: 'mDNS Repeater', type: 'switch', defaultValue: true },
      {
        key: 'serviceScope',
        label: 'Default Services',
        type: 'select',
        defaultValue: 'all-media',
        options: [
          { label: 'AirPlay, AirPrint, Google Cast', value: 'all-media' },
          { label: 'Printers & Scanners Only', value: 'printers' },
        ],
      },
    ],
    table: {
      title: 'mDNS Repeater Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Rule Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'type', title: 'Device Type' },
        { key: 'service', title: 'Services' },
        { key: 'vlans', title: 'Service Networks' },
      ],
      initialRows: [
        {
          key: 'mdns-1',
          name: 'Conference_AirPlay',
          enabled: true,
          type: 'Gateway',
          service: 'AirPlay, Google Cast',
          vlans: 'Default, interface-vlan100',
        },
        {
          key: 'mdns-2',
          name: 'Office_AirPrint',
          enabled: true,
          type: 'AP',
          service: 'AirPrint, IPP',
          vlans: 'interface-vlan100, vlan20',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Rule Name', type: 'input', defaultValue: '', placeholder: 'e.g. Lobby_Cast' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        {
          key: 'type',
          label: 'Device Type',
          type: 'select',
          defaultValue: 'Gateway',
          options: [
            { label: 'Gateway', value: 'Gateway' },
            { label: 'AP', value: 'AP' },
          ],
        },
        { key: 'service', label: 'Services', type: 'input', defaultValue: 'AirPlay, AirPrint' },
        { key: 'vlans', label: 'Service Networks', type: 'input', defaultValue: 'Default, interface-vlan100' },
      ],
    },
  }),

  voip: makeSubmodule({
    key: 'voip',
    title: 'VoIP',
    breadcrumbGroup: 'Network Config · General Settings',
    infoBanner:
      'Configure SIP ALG, Voice VLAN prioritization, and FXS/FXO telephony profiles on Omada gateways.',
    fields: [
      { key: 'sipAlg', label: 'SIP ALG', type: 'switch', defaultValue: false },
      {
        key: 'voiceVlan',
        label: 'Voice VLAN ID',
        type: 'number',
        defaultValue: 110,
        suffixText: '(2-4094)',
      },
      {
        key: 'dscp',
        label: 'RTP DSCP Priority',
        type: 'select',
        defaultValue: 'ef-46',
        options: [
          { label: 'EF (46 - Expedited Forwarding)', value: 'ef-46' },
          { label: 'AF41 (34 - Assured Forwarding)', value: 'af41-34' },
        ],
      },
    ],
    table: {
      title: 'SIP Trunk & Phone Profiles',
      addButtonLabel: 'Add SIP Profile',
      columns: [
        { key: 'name', title: 'Profile Name' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
        { key: 'registrar', title: 'SIP Registrar' },
        { key: 'codec', title: 'Preferred Codec' },
      ],
      initialRows: [
        {
          key: 'voip-1',
          name: 'HQ_PBX_Trunk',
          enabled: true,
          registrar: '192.168.110.10:5060',
          codec: 'G.711u / Opus',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Profile Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
        { key: 'registrar', label: 'SIP Registrar', type: 'input', defaultValue: '192.168.110.10:5060' },
        { key: 'codec', label: 'Preferred Codec', type: 'input', defaultValue: 'G.711u / Opus' },
      ],
    },
  }),

  'cli-config': makeSubmodule({
    key: 'cli-config',
    title: 'CLI Configuration',
    breadcrumbGroup: 'Network Config · General Settings',
    tabs: [
      { key: 'device-cli', label: 'Device CLI' },
      { key: 'site-cli', label: 'Site CLI' },
    ],
    infoBanner:
      'Push custom switch or gateway CLI scripts to devices without overriding controller-managed GUI settings.',
    fields: [
      { key: 'cliSync', label: 'Auto-Push on Adopt', type: 'switch', defaultValue: true },
      {
        key: 'scriptBody',
        label: 'Startup CLI Snippet',
        type: 'textarea',
        defaultValue: 'spanning-tree mode rstp\nerrdisable recovery interval 300',
      },
    ],
    table: {
      title: 'CLI Configuration Templates',
      addButtonLabel: 'Create CLI Template',
      columns: [
        { key: 'name', title: 'Template Name' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
        { key: 'target', title: 'Target Devices' },
        { key: 'lastSync', title: 'Last Applied' },
      ],
      initialRows: [
        {
          key: 'cli-1',
          name: 'Switch_RSTP_Timers',
          enabled: true,
          target: 'CTOOffice_Switch_1, SalesDepartment_Switch_3',
          lastSync: '2026-11-20 18:10:04',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Template Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
        { key: 'target', label: 'Target Devices', type: 'input', defaultValue: 'All Switches' },
        { key: 'lastSync', label: 'Last Applied', type: 'input', defaultValue: 'Pending' },
      ],
    },
  }),

  snmp: makeSubmodule({
    key: 'snmp',
    title: 'SNMP',
    breadcrumbGroup: 'Network Config · General Settings',
    fields: [
      { key: 'snmpEnabled', label: 'SNMP Agent', type: 'switch', defaultValue: true },
      {
        key: 'snmpVersion',
        label: 'SNMP Version',
        type: 'select',
        defaultValue: 'v3',
        options: [
          { label: 'SNMPv3 (AuthPriv)', value: 'v3' },
          { label: 'SNMPv2c', value: 'v2c' },
          { label: 'SNMPv1', value: 'v1' },
        ],
      },
      {
        key: 'community',
        label: 'Read Community',
        type: 'input',
        defaultValue: 'omada-readonly',
      },
      {
        key: 'trapIp',
        label: 'Trap Receiver IP',
        type: 'ip',
        defaultValue: '192.168.0.250',
      },
    ],
  }),

  portal: makeSubmodule({
    key: 'portal',
    title: 'Portal',
    breadcrumbGroup: 'Network Config · Authentication',
    tabs: [
      { key: 'portal-list', label: 'Portal' },
      { key: 'free-auth', label: 'Free Authentication Policy' },
    ],
    infoBanner:
      'Captive portal policies redirect guest wireless or wired clients to authentication pages before granting WAN access.',
    fields: [
      { key: 'portalHttps', label: 'HTTPS Redirection', type: 'switch', defaultValue: true },
      {
        key: 'landingUrl',
        label: 'Success Landing URL',
        type: 'input',
        defaultValue: 'https://intranet.headquarters.local',
      },
    ],
    table: {
      title: 'Configured Portals',
      addButtonLabel: 'Create New Portal',
      columns: [
        { key: 'name', title: 'Portal Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'authType', title: 'Authentication Type' },
        { key: 'ssid', title: 'Bound SSID / Network' },
      ],
      initialRows: [
        {
          key: 'pt-1',
          name: 'Visitor_Voucher_Portal',
          enabled: true,
          authType: 'Voucher',
          ssid: 'test_ssid_1',
        },
        {
          key: 'pt-2',
          name: 'Contractor_RADIUS_Portal',
          enabled: false,
          authType: 'External RADIUS Server',
          ssid: 'interface-vlan100',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Portal Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        {
          key: 'authType',
          label: 'Authentication Type',
          type: 'select',
          defaultValue: 'Voucher',
          options: [
            { label: 'No Authentication', value: 'No Authentication' },
            { label: 'Simple Password', value: 'Simple Password' },
            { label: 'Voucher', value: 'Voucher' },
            { label: 'External RADIUS Server', value: 'External RADIUS Server' },
          ],
        },
        { key: 'ssid', label: 'Bound SSID / Network', type: 'input', defaultValue: 'test_ssid_1' },
      ],
    },
  }),

  dot1x: makeSubmodule({
    key: 'dot1x',
    title: '802.1X',
    breadcrumbGroup: 'Network Config · Authentication',
    fields: [
      { key: 'dot1xEnabled', label: '802.1X Authentication', type: 'switch', defaultValue: true },
      {
        key: 'radiusProfile',
        label: 'RADIUS Profile',
        type: 'select',
        defaultValue: 'hq-nps',
        options: [
          { label: 'HQ_RADIUS_NPS (192.168.0.20)', value: 'hq-nps' },
          { label: 'Backup_FreeRADIUS (192.168.0.21)', value: 'backup-radius' },
        ],
      },
      {
        key: 'authMode',
        label: 'Port Control Mode',
        type: 'select',
        defaultValue: 'mac-based',
        options: [
          { label: 'MAC-Based', value: 'mac-based' },
          { label: 'Port-Based', value: 'port-based' },
        ],
      },
      { key: 'mabFallback', label: 'MAB Fallback', type: 'switch', defaultValue: true },
    ],
  }),

  'mac-auth': makeSubmodule({
    key: 'mac-auth',
    title: 'MAC-Based Auth',
    breadcrumbGroup: 'Network Config · Authentication',
    fields: [
      { key: 'macAuthEnabled', label: 'MAC-Based Authentication', type: 'switch', defaultValue: false },
      {
        key: 'authSource',
        label: 'Authentication Source',
        type: 'select',
        defaultValue: 'local',
        options: [
          { label: 'Local MAC Group', value: 'local' },
          { label: 'RADIUS Server', value: 'radius' },
        ],
      },
    ],
    table: {
      title: 'Authorized MAC Devices',
      addButtonLabel: 'Add Authorized MAC',
      columns: [
        { key: 'name', title: 'Device Label' },
        { key: 'mac', title: 'MAC Address' },
        { key: 'vlan', title: 'Assigned VLAN' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'ma-1',
          name: 'Badge_Reader_MainDoor',
          mac: '00-1A-7D-DA-71-13',
          vlan: 'VLAN 100',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Device Label', type: 'input', defaultValue: '' },
        { key: 'mac', label: 'MAC Address', type: 'mac', defaultValue: '00-1A-7D-00-00-01' },
        { key: 'vlan', label: 'Assigned VLAN', type: 'input', defaultValue: 'VLAN 100' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  'vpn-status': makeSubmodule({
    key: 'vpn-status',
    title: 'VPN Status',
    breadcrumbGroup: 'Network Config · VPN',
    tabs: [
      { key: 'ipsec', label: 'IPsec VPN' },
      { key: 'openvpn', label: 'OpenVPN' },
      { key: 'wireguard', label: 'WireGuard' },
    ],
    fields: [],
    table: {
      title: 'Active VPN Tunnels',
      addButtonLabel: 'Refresh Tunnels',
      columns: [
        { key: 'name', title: 'Tunnel Name' },
        { key: 'type', title: 'Protocol', kind: 'badge' },
        { key: 'localSubnet', title: 'Local Subnet' },
        { key: 'remotePeer', title: 'Remote Peer' },
        { key: 'uptime', title: 'Uptime' },
        { key: 'enabled', title: 'Active', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'vpns-1',
          name: 'Branch_West_S2S',
          type: 'IPsec IKEv2',
          localSubnet: '192.168.0.0/24',
          remotePeer: '203.0.113.45',
          uptime: '6d 14h 22m',
          enabled: true,
        },
        {
          key: 'vpns-2',
          name: 'DataCenter_Core_Link',
          type: 'WireGuard',
          localSubnet: '192.168.100.0/24',
          remotePeer: '198.51.100.12:51820',
          uptime: '19d 03h 11m',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Tunnel Name', type: 'input', defaultValue: '' },
        { key: 'type', label: 'Protocol', type: 'input', defaultValue: 'IPsec IKEv2' },
        { key: 'localSubnet', label: 'Local Subnet', type: 'cidr', defaultValue: '192.168.0.0/24' },
        { key: 'remotePeer', label: 'Remote Peer', type: 'ip', defaultValue: '203.0.113.50' },
        { key: 'enabled', label: 'Active', type: 'switch', defaultValue: true },
      ],
    },
  }),

  vpn: makeSubmodule({
    key: 'vpn',
    title: 'VPN',
    breadcrumbGroup: 'Network Config · VPN',
    tabs: [
      { key: 'site-to-site', label: 'Site-to-Site VPN' },
      { key: 'client-to-site', label: 'Client-to-Site VPN' },
      { key: 'vpn-users', label: 'VPN Users' },
    ],
    fields: [
      { key: 'natTraversal', label: 'IPsec NAT Traversal', type: 'switch', defaultValue: true },
      {
        key: 'ikeLifetime',
        label: 'IKE Key Lifetime',
        type: 'number',
        defaultValue: 28800,
        suffixText: 'Seconds',
      },
    ],
    table: {
      title: 'VPN Policies',
      addButtonLabel: 'Create New VPN Policy',
      columns: [
        { key: 'name', title: 'Policy Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'purpose', title: 'Purpose', kind: 'badge' },
        { key: 'protocol', title: 'VPN Type' },
        { key: 'remoteGateway', title: 'Remote Gateway' },
      ],
      initialRows: [
        {
          key: 'vpn-1',
          name: 'Branch_West_IPsec',
          enabled: true,
          purpose: 'Site-to-Site',
          protocol: 'Auto IPsec',
          remoteGateway: '203.0.113.45',
        },
        {
          key: 'vpn-2',
          name: 'Remote_Engineers_WG',
          enabled: true,
          purpose: 'Client-to-Site',
          protocol: 'WireGuard Server',
          remoteGateway: '10.66.0.1/24',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Policy Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        {
          key: 'purpose',
          label: 'Purpose',
          type: 'select',
          defaultValue: 'Site-to-Site',
          options: [
            { label: 'Site-to-Site', value: 'Site-to-Site' },
            { label: 'Client-to-Site', value: 'Client-to-Site' },
          ],
        },
        {
          key: 'protocol',
          label: 'VPN Type',
          type: 'select',
          defaultValue: 'Auto IPsec',
          options: [
            { label: 'Auto IPsec', value: 'Auto IPsec' },
            { label: 'Manual IPsec', value: 'Manual IPsec' },
            { label: 'OpenVPN', value: 'OpenVPN' },
            { label: 'WireGuard Server', value: 'WireGuard Server' },
          ],
        },
        { key: 'remoteGateway', label: 'Remote Gateway', type: 'ip', defaultValue: '203.0.113.45' },
      ],
    },
  }),

  'url-filtering': makeSubmodule({
    key: 'url-filtering',
    title: 'URL Filtering',
    breadcrumbGroup: 'Network Config · Security',
    tabs: [
      { key: 'gateway', label: 'Gateway URL Filtering' },
      { key: 'eap', label: 'EAP URL Filtering' },
    ],
    fields: [
      { key: 'urlFilterEnabled', label: 'URL Filtering', type: 'switch', defaultValue: true },
    ],
    table: {
      title: 'URL Filtering Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Rule Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'action', title: 'Action', kind: 'badge' },
        { key: 'urls', title: 'Filtered Domains / Categories' },
        { key: 'source', title: 'Source Network' },
      ],
      initialRows: [
        {
          key: 'url-1',
          name: 'Block_Social_Guest',
          enabled: true,
          action: 'Deny',
          urls: '*.tiktok.com, Social Media',
          source: 'test_ssid_1',
        },
        {
          key: 'url-2',
          name: 'Allow_Corporate_SaaS',
          enabled: true,
          action: 'Permit',
          urls: '*.google.com, *.github.com',
          source: 'interface-vlan100',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Rule Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        {
          key: 'action',
          label: 'Action',
          type: 'select',
          defaultValue: 'Deny',
          options: [
            { label: 'Deny', value: 'Deny' },
            { label: 'Permit', value: 'Permit' },
          ],
        },
        { key: 'urls', label: 'Domains / Categories', type: 'input', defaultValue: '*.example.com' },
        { key: 'source', label: 'Source Network', type: 'input', defaultValue: 'interface-vlan100' },
      ],
    },
  }),

  'app-control': makeSubmodule({
    key: 'app-control',
    title: 'Application Control',
    breadcrumbGroup: 'Network Config · Security',
    infoBanner:
      'Deep Packet Inspection (DPI) enforces layer-7 application blocking or throttling rules on MainOffice_Gateway_2.',
    fields: [
      { key: 'dpiEnabled', label: 'Application Control Engine', type: 'switch', defaultValue: true },
      { key: 'logging', label: 'Log Blocked Flows', type: 'switch', defaultValue: true },
    ],
    table: {
      title: 'Application Control Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Rule Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'category', title: 'Application Category' },
        { key: 'policy', title: 'Policy', kind: 'badge' },
        { key: 'network', title: 'Target Network' },
      ],
      initialRows: [
        {
          key: 'app-1',
          name: 'Block_P2P_Torrents',
          enabled: true,
          category: 'P2P & File Transfer',
          policy: 'Block',
          network: 'All LAN Networks',
        },
        {
          key: 'app-2',
          name: 'Limit_Streaming_Hours',
          enabled: true,
          category: 'Video Streaming',
          policy: 'QoS Limit',
          network: 'interface-vlan100',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Rule Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        { key: 'category', label: 'Application Category', type: 'input', defaultValue: 'Social Networking' },
        {
          key: 'policy',
          label: 'Policy',
          type: 'select',
          defaultValue: 'Block',
          options: [
            { label: 'Block', value: 'Block' },
            { label: 'QoS Limit', value: 'QoS Limit' },
            { label: 'Allow', value: 'Allow' },
          ],
        },
        { key: 'network', label: 'Target Network', type: 'input', defaultValue: 'All LAN Networks' },
      ],
    },
  }),

  'ids-ips': makeSubmodule({
    key: 'ids-ips',
    title: 'IDS/IPS',
    breadcrumbGroup: 'Network Config · Security',
    infoBanner:
      'Intrusion Detection & Prevention inspects gateway WAN/LAN traffic against updated threat signatures.',
    fields: [
      { key: 'idsEnabled', label: 'IDS/IPS Protection', type: 'switch', defaultValue: true },
      {
        key: 'mode',
        label: 'Operation Mode',
        type: 'select',
        defaultValue: 'ips',
        options: [
          { label: 'Detection & Prevention (IPS)', value: 'ips' },
          { label: 'Detection Only (IDS)', value: 'ids' },
        ],
      },
      {
        key: 'sensitivity',
        label: 'Threat Sensitivity',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { label: 'High (Recommended)', value: 'high' },
          { label: 'Medium (Balanced)', value: 'medium' },
          { label: 'Low (Minimal False Positives)', value: 'low' },
        ],
      },
      { key: 'autoSignature', label: 'Auto Update Signatures', type: 'switch', defaultValue: true },
    ],
  }),

  'wireless-ids-ips': makeSubmodule({
    key: 'wireless-ids-ips',
    title: 'Wireless IDS/IPS',
    breadcrumbGroup: 'Network Config · Security',
    fields: [
      { key: 'widsEnabled', label: 'Rogue AP Detection', type: 'switch', defaultValue: true },
      { key: 'floodDetect', label: 'Deauth Flood Protection', type: 'switch', defaultValue: true },
      { key: 'evilTwin', label: 'Evil Twin Mitigation', type: 'switch', defaultValue: true },
      {
        key: 'rssiThreshold',
        label: 'Rogue RSSI Threshold',
        type: 'number',
        defaultValue: -75,
        suffixText: 'dBm',
      },
    ],
  }),

  firewall: makeSubmodule({
    key: 'firewall',
    title: 'Firewall',
    breadcrumbGroup: 'Network Config · Security',
    tabs: [
      { key: 'attack-defense', label: 'Attack Defense' },
      { key: 'session-timeouts', label: 'Session Timeouts' },
    ],
    fields: [
      { key: 'spiFirewall', label: 'SPI Firewall', type: 'switch', defaultValue: true },
      { key: 'synFlood', label: 'SYN Flood Defense', type: 'switch', defaultValue: true },
      { key: 'udpFlood', label: 'UDP Flood Defense', type: 'switch', defaultValue: true },
      { key: 'icmpFlood', label: 'ICMP Flood Defense', type: 'switch', defaultValue: true },
      { key: 'blockPingWan', label: 'Block Ping from WAN', type: 'switch', defaultValue: false },
      {
        key: 'synThreshold',
        label: 'SYN Threshold',
        type: 'number',
        defaultValue: 2000,
        suffixText: 'packets/s',
      },
    ],
  }),

  impb: makeSubmodule({
    key: 'impb',
    title: 'IP-MAC-Port Binding',
    breadcrumbGroup: 'Network Config · Security',
    infoBanner:
      'Switch-level IP-MAC-Port Binding enforces ARP Inspection and IP Source Guard on access switch ports.',
    fields: [
      { key: 'arpInspection', label: 'Dynamic ARP Inspection', type: 'switch', defaultValue: true },
      { key: 'ipSourceGuard', label: 'IP Source Guard', type: 'switch', defaultValue: false },
    ],
    table: {
      title: 'Switch IMPB Binding Entries',
      addButtonLabel: 'Add Binding Entry',
      columns: [
        { key: 'name', title: 'Host Description' },
        { key: 'ip', title: 'IP Address' },
        { key: 'mac', title: 'MAC Address' },
        { key: 'port', title: 'Switch Port' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'impb-1',
          name: 'Finance_Workstation',
          ip: '192.168.100.15',
          mac: 'AC-84-C6-32-11-8A',
          port: 'SalesDepartment_Switch_3 · Port5',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Host Description', type: 'input', defaultValue: '' },
        { key: 'ip', label: 'IP Address', type: 'ip', defaultValue: '192.168.100.20' },
        { key: 'mac', label: 'MAC Address', type: 'mac', defaultValue: 'AC-84-C6-00-00-20' },
        { key: 'port', label: 'Switch Port', type: 'input', defaultValue: 'SalesDepartment_Switch_3 · Port6' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  routing: makeSubmodule({
    key: 'routing',
    title: 'Routing',
    breadcrumbGroup: 'Network Config · Transmission',
    tabs: [
      { key: 'static-route', label: 'Static Route' },
      { key: 'policy-routing', label: 'Policy Routing' },
      { key: 'ospf', label: 'OSPF' },
      { key: 'rip', label: 'RIP' },
    ],
    fields: [
      { key: 'ecmp', label: 'ECMP Load Sharing', type: 'switch', defaultValue: true },
      {
        key: 'defaultMetric',
        label: 'Default Route Metric',
        type: 'number',
        defaultValue: 1,
      },
    ],
    table: {
      title: 'Static Routing Table',
      addButtonLabel: 'Create New Route',
      columns: [
        { key: 'name', title: 'Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'destination', title: 'Destination IP/Subnet' },
        { key: 'nextHop', title: 'Next Hop' },
        { key: 'interface', title: 'Interface' },
        { key: 'metric', title: 'Metric' },
      ],
      initialRows: [
        {
          key: 'rt-1',
          name: 'DataCenter_Subnet',
          enabled: true,
          destination: '10.20.0.0/16',
          nextHop: '192.168.0.254',
          interface: 'Default',
          metric: 1,
        },
        {
          key: 'rt-2',
          name: 'Lab_Test_Route',
          enabled: false,
          destination: '172.16.80.0/24',
          nextHop: '192.168.100.254',
          interface: 'interface-vlan100',
          metric: 5,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        { key: 'destination', label: 'Destination IP/Subnet', type: 'cidr', defaultValue: '10.30.0.0/16' },
        { key: 'nextHop', label: 'Next Hop', type: 'ip', defaultValue: '192.168.0.254' },
        { key: 'interface', label: 'Interface', type: 'input', defaultValue: 'Default' },
        { key: 'metric', label: 'Metric', type: 'number', defaultValue: 1 },
      ],
    },
  }),

  nat: makeSubmodule({
    key: 'nat',
    title: 'NAT',
    breadcrumbGroup: 'Network Config · Transmission',
    tabs: [
      { key: 'port-forwarding', label: 'Port Forwarding' },
      { key: 'port-triggering', label: 'Port Triggering' },
      { key: 'one-to-one', label: 'One-to-One NAT' },
      { key: 'virtual-servers', label: 'Virtual Servers' },
      { key: 'alg', label: 'ALG' },
    ],
    fields: [
      { key: 'hairpinNat', label: 'NAT Loopback (Hairpin)', type: 'switch', defaultValue: true },
    ],
    table: {
      title: 'Port Forwarding Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'wanInterface', title: 'Interface' },
        { key: 'externalPort', title: 'Source Port' },
        { key: 'destinationIp', title: 'Destination IP' },
        { key: 'internalPort', title: 'Destination Port' },
        { key: 'protocol', title: 'Protocol' },
      ],
      initialRows: [
        {
          key: 'nat-1',
          name: 'HQ_HTTPS_Portal',
          enabled: true,
          wanInterface: '2.5G WAN/LAN1',
          externalPort: '443',
          destinationIp: '192.168.0.50',
          internalPort: '443',
          protocol: 'TCP',
        },
        {
          key: 'nat-2',
          name: 'WireGuard_Relay',
          enabled: true,
          wanInterface: '2.5G WAN/LAN1',
          externalPort: '51820',
          destinationIp: '192.168.0.2',
          internalPort: '51820',
          protocol: 'UDP',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        { key: 'wanInterface', label: 'Interface', type: 'input', defaultValue: '2.5G WAN/LAN1' },
        { key: 'externalPort', label: 'Source Port', type: 'input', defaultValue: '8443' },
        { key: 'destinationIp', label: 'Destination IP', type: 'ip', defaultValue: '192.168.0.60' },
        { key: 'internalPort', label: 'Destination Port', type: 'input', defaultValue: '443' },
        {
          key: 'protocol',
          label: 'Protocol',
          type: 'select',
          defaultValue: 'TCP',
          options: [
            { label: 'TCP', value: 'TCP' },
            { label: 'UDP', value: 'UDP' },
            { label: 'All', value: 'All' },
          ],
        },
      ],
    },
  }),

  'dhcp-reservation': makeSubmodule({
    key: 'dhcp-reservation',
    title: 'DHCP Reservation',
    breadcrumbGroup: 'Network Config · Transmission',
    infoBanner:
      'Bind fixed IPv4 addresses to specific client MAC addresses so critical hosts always receive deterministic leases.',
    fields: [
      { key: 'quickIp', label: 'Default Subnet IP', type: 'ip', defaultValue: '192.168.0.50' },
      { key: 'quickMac', label: 'Default Client MAC', type: 'mac', defaultValue: '00-1B-44-11-3A-B7' },
    ],
    table: {
      title: 'DHCP Reservation List',
      addButtonLabel: 'Create New Entry',
      columns: [
        { key: 'description', title: 'Description' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'network', title: 'Network' },
        { key: 'mac', title: 'MAC Address' },
        { key: 'ip', title: 'IP Address' },
      ],
      initialRows: [
        {
          key: 'dhcp-1',
          description: 'MainOffice_Printer_01',
          enabled: true,
          network: 'Default',
          mac: '00-1B-44-11-3A-B7',
          ip: '192.168.0.50',
        },
        {
          key: 'dhcp-2',
          description: 'Door_Controller_01',
          enabled: true,
          network: 'interface-vlan100',
          mac: 'A8-6E-84-22-19-04',
          ip: '192.168.100.51',
        },
      ],
      modalFields: [
        { key: 'description', label: 'Description', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        {
          key: 'network',
          label: 'Network',
          type: 'select',
          defaultValue: 'Default',
          options: [
            { label: 'Default', value: 'Default' },
            { label: 'interface-vlan100', value: 'interface-vlan100' },
          ],
        },
        { key: 'mac', label: 'MAC Address', type: 'mac', defaultValue: '00-1B-44-00-00-01' },
        { key: 'ip', label: 'IP Address', type: 'ip', defaultValue: '192.168.0.55' },
      ],
    },
  }),

  'bandwidth-control': makeSubmodule({
    key: 'bandwidth-control',
    title: 'Bandwidth Control',
    breadcrumbGroup: 'Network Config · Transmission',
    fields: [
      { key: 'bwControlEnabled', label: 'Bandwidth Control', type: 'switch', defaultValue: true },
      {
        key: 'activationThreshold',
        label: 'Activation Threshold',
        type: 'number',
        defaultValue: 80,
        suffixText: '% WAN Usage',
      },
    ],
    table: {
      title: 'Bandwidth Control Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Rule Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'interface', title: 'WAN Interface' },
        { key: 'upLimit', title: 'Upstream Limit' },
        { key: 'downLimit', title: 'Downstream Limit' },
      ],
      initialRows: [
        {
          key: 'bw-1',
          name: 'Guest_Cap_50M',
          enabled: true,
          interface: '2.5G WAN/LAN1',
          upLimit: '25 Mbps',
          downLimit: '50 Mbps',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Rule Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        { key: 'interface', label: 'WAN Interface', type: 'input', defaultValue: '2.5G WAN/LAN1' },
        { key: 'upLimit', label: 'Upstream Limit', type: 'input', defaultValue: '25 Mbps' },
        { key: 'downLimit', label: 'Downstream Limit', type: 'input', defaultValue: '50 Mbps' },
      ],
    },
  }),

  'session-limit': makeSubmodule({
    key: 'session-limit',
    title: 'Session Limit',
    breadcrumbGroup: 'Network Config · Transmission',
    fields: [
      { key: 'sessionLimitEnabled', label: 'Session Limit', type: 'switch', defaultValue: true },
    ],
    table: {
      title: 'Concurrent Session Limit Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Rule Name' },
        { key: 'enabled', title: 'Status', kind: 'status-switch' },
        { key: 'ipGroup', title: 'IP Group' },
        { key: 'maxSessions', title: 'Max Sessions / Host' },
      ],
      initialRows: [
        {
          key: 'sl-1',
          name: 'Guest_NAT_Cap',
          enabled: true,
          ipGroup: 'IP Group:guest-subnet',
          maxSessions: 1200,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Rule Name', type: 'input', defaultValue: '' },
        { key: 'enabled', label: 'Status', type: 'switch', defaultValue: true },
        { key: 'ipGroup', label: 'IP Group', type: 'input', defaultValue: 'IP Group:guest-subnet' },
        { key: 'maxSessions', label: 'Max Sessions / Host', type: 'number', defaultValue: 1200 },
      ],
    },
  }),

  'gateway-qos': makeSubmodule({
    key: 'gateway-qos',
    title: 'Gateway QoS',
    breadcrumbGroup: 'Network Config · Transmission',
    tabs: [
      { key: 'class-of-service', label: 'Class of Service' },
      { key: 'app-qos', label: 'Application QoS' },
    ],
    fields: [
      { key: 'qosEnabled', label: 'Gateway QoS', type: 'switch', defaultValue: true },
      {
        key: 'scheduler',
        label: 'Queue Scheduling',
        type: 'select',
        defaultValue: 'wfq',
        options: [
          { label: 'Weighted Fair Queuing (WFQ)', value: 'wfq' },
          { label: 'Strict Priority (SP)', value: 'sp' },
        ],
      },
    ],
  }),

  'switch-qos': makeSubmodule({
    key: 'switch-qos',
    title: 'Switch QoS',
    breadcrumbGroup: 'Network Config · Transmission',
    fields: [
      {
        key: 'trustMode',
        label: 'Global Trust Mode',
        type: 'select',
        defaultValue: 'dscp',
        options: [
          { label: 'DSCP Priority', value: 'dscp' },
          { label: '802.1p CoS', value: 'cos' },
          { label: 'Port Priority', value: 'port' },
        ],
      },
      {
        key: 'scheduleAlgo',
        label: 'Egress Scheduler',
        type: 'select',
        defaultValue: 'sp-wrr',
        options: [
          { label: 'SP + WRR Hybrid', value: 'sp-wrr' },
          { label: 'Weighted Round Robin (WRR)', value: 'wrr' },
        ],
      },
    ],
  }),

  'oui-vlan': makeSubmodule({
    key: 'oui-vlan',
    title: 'OUI-Based VLAN',
    breadcrumbGroup: 'Network Config · Transmission',
    fields: [
      { key: 'ouiEnabled', label: 'Auto-Tag OUI Traffic', type: 'switch', defaultValue: true },
    ],
    table: {
      title: 'OUI Vendor Rules',
      addButtonLabel: 'Add OUI Rule',
      columns: [
        { key: 'vendor', title: 'Vendor / Description' },
        { key: 'oui', title: 'MAC OUI Prefix' },
        { key: 'vlan', title: 'Assigned VLAN' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'oui-1',
          vendor: 'Yealink IP Phones',
          oui: '80-5E-C0',
          vlan: 'VLAN 110 (VoIP)',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'vendor', label: 'Vendor / Description', type: 'input', defaultValue: '' },
        { key: 'oui', label: 'MAC OUI Prefix', type: 'input', defaultValue: '80-5E-C0' },
        { key: 'vlan', label: 'Assigned VLAN', type: 'input', defaultValue: 'VLAN 110' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  groups: makeSubmodule({
    key: 'groups',
    title: 'Groups',
    breadcrumbGroup: 'Network Config · Profile',
    tabs: [
      { key: 'ip-group', label: 'IP Group' },
      { key: 'ip-port-group', label: 'IP-Port Group' },
      { key: 'mac-group', label: 'MAC Group' },
    ],
    fields: [],
    table: {
      title: 'IP & Port Profile Groups',
      addButtonLabel: 'Create New Group',
      columns: [
        { key: 'name', title: 'Group Name' },
        { key: 'type', title: 'Type', kind: 'badge' },
        { key: 'entries', title: 'Members / Subnets' },
      ],
      initialRows: [
        {
          key: 'grp-1',
          name: 'ip-1',
          type: 'IP Group',
          entries: '10.20.0.0/16, 172.16.40.10/32',
        },
        {
          key: 'grp-2',
          name: 'port-1',
          type: 'IP-Port Group',
          entries: '0.0.0.0/0 : TCP/UDP 80, 443, 8080',
        },
        {
          key: 'grp-3',
          name: 'guest-subnet',
          type: 'IP Group',
          entries: '192.168.200.0/24',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Group Name', type: 'input', defaultValue: '' },
        {
          key: 'type',
          label: 'Type',
          type: 'select',
          defaultValue: 'IP Group',
          options: [
            { label: 'IP Group', value: 'IP Group' },
            { label: 'IP-Port Group', value: 'IP-Port Group' },
            { label: 'MAC Group', value: 'MAC Group' },
          ],
        },
        { key: 'entries', label: 'Subnet / CIDR', type: 'cidr', defaultValue: '192.168.50.0/24' },
      ],
    },
  }),

  'time-range': makeSubmodule({
    key: 'time-range',
    title: 'Time Range',
    breadcrumbGroup: 'Network Config · Profile',
    infoBanner:
      'Time Range profiles bind active weekly hours to Gateway ACL, URL Filtering, and Firewall policies.',
    fields: [
      {
        key: 'rangeName',
        label: 'Time Range Name',
        type: 'input',
        defaultValue: 'Workdays_09_18',
      },
    ],
    scheduleEditor: {
      label: 'Weekly Time Range Grid',
      profileName: 'Workdays_09_18',
      initialSchedule: createSchedulePreset('workdays'),
    },
    table: {
      title: 'Time Range Profiles',
      addButtonLabel: 'Create New Time Range',
      columns: [
        { key: 'name', title: 'Name' },
        { key: 'mode', title: 'Schedule Mode', kind: 'badge' },
        { key: 'window', title: 'Active Hours' },
      ],
      initialRows: [
        {
          key: 'tr-1',
          name: 'Workdays_09_18',
          mode: 'Periodic',
          window: 'Mon-Fri 09:00 - 18:00',
        },
        {
          key: 'tr-2',
          name: 'Weekend_Backup_Window',
          mode: 'Periodic',
          window: 'Sat-Sun 00:00 - 24:00',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Name', type: 'input', defaultValue: '' },
        { key: 'mode', label: 'Schedule Mode', type: 'input', defaultValue: 'Periodic' },
        { key: 'window', label: 'Active Hours', type: 'input', defaultValue: 'Mon-Fri 09:00 - 18:00' },
      ],
    },
  }),

  'rate-limit': makeSubmodule({
    key: 'rate-limit',
    title: 'Rate Limit',
    breadcrumbGroup: 'Network Config · Profile',
    fields: [],
    table: {
      title: 'Rate Limit Profiles',
      addButtonLabel: 'Create New Profile',
      columns: [
        { key: 'name', title: 'Profile Name' },
        { key: 'download', title: 'Download Limit' },
        { key: 'upload', title: 'Upload Limit' },
        { key: 'appliedTo', title: 'Assigned To' },
      ],
      initialRows: [
        {
          key: 'rl-1',
          name: 'Staff_100M',
          download: '100 Mbps',
          upload: '50 Mbps',
          appliedTo: 'Office_Staff',
        },
        {
          key: 'rl-2',
          name: 'Guest_25M',
          download: '25 Mbps',
          upload: '10 Mbps',
          appliedTo: 'test_ssid_1',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Profile Name', type: 'input', defaultValue: '' },
        { key: 'download', label: 'Download Limit', type: 'input', defaultValue: '50 Mbps' },
        { key: 'upload', label: 'Upload Limit', type: 'input', defaultValue: '20 Mbps' },
        { key: 'appliedTo', label: 'Assigned To', type: 'input', defaultValue: 'Office_Staff' },
      ],
    },
  }),

  ppsk: makeSubmodule({
    key: 'ppsk',
    title: 'PPSK',
    breadcrumbGroup: 'Network Config · Profile',
    infoBanner:
      'Private Pre-Shared Key (PPSK) allows assigning unique passphrases and dynamic VLANs on a single WPA-Personal SSID.',
    fields: [],
    table: {
      title: 'PPSK Profiles',
      addButtonLabel: 'Create New PPSK Profile',
      columns: [
        { key: 'name', title: 'Profile Name' },
        { key: 'keysCount', title: 'Total Keys' },
        { key: 'vlanBinding', title: 'VLAN Binding' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'ppsk-1',
          name: 'Dept_Access_Keys',
          keysCount: 14,
          vlanBinding: 'VLAN 100 / VLAN 20',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Profile Name', type: 'input', defaultValue: '' },
        { key: 'keysCount', label: 'Total Keys', type: 'number', defaultValue: 5 },
        { key: 'vlanBinding', label: 'VLAN Binding', type: 'input', defaultValue: 'VLAN 100' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  'radius-profile': makeSubmodule({
    key: 'radius-profile',
    title: 'RADIUS Profile',
    breadcrumbGroup: 'Network Config · Profile',
    fields: [
      { key: 'authPort', label: 'Default Auth Port', type: 'number', defaultValue: 1812 },
      { key: 'acctPort', label: 'Default Accounting Port', type: 'number', defaultValue: 1813 },
    ],
    table: {
      title: 'RADIUS Server Profiles',
      addButtonLabel: 'Create New RADIUS Profile',
      columns: [
        { key: 'name', title: 'Profile Name' },
        { key: 'serverIp', title: 'Auth Server IP' },
        { key: 'port', title: 'Port' },
        { key: 'vlanAssign', title: 'VLAN Assignment', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'rad-1',
          name: 'HQ_RADIUS_NPS',
          serverIp: '192.168.0.20',
          port: 1812,
          vlanAssign: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Profile Name', type: 'input', defaultValue: '' },
        { key: 'serverIp', label: 'Auth Server IP', type: 'ip', defaultValue: '192.168.0.21' },
        { key: 'port', label: 'Port', type: 'number', defaultValue: 1812 },
        { key: 'vlanAssign', label: 'VLAN Assignment', type: 'switch', defaultValue: true },
      ],
    },
  }),

  'ldap-profile': makeSubmodule({
    key: 'ldap-profile',
    title: 'LDAP Profile',
    breadcrumbGroup: 'Network Config · Profile',
    fields: [
      { key: 'serverHost', label: 'Directory Server IP', type: 'ip', defaultValue: '192.168.0.25' },
      { key: 'port', label: 'LDAP Port', type: 'number', defaultValue: 389 },
      { key: 'baseDn', label: 'Base DN', type: 'input', defaultValue: 'dc=headquarters,dc=local' },
      { key: 'useLdaps', label: 'Enable LDAPS (TLS)', type: 'switch', defaultValue: true },
    ],
  }),

  'apn-profile': makeSubmodule({
    key: 'apn-profile',
    title: 'APN Profile',
    breadcrumbGroup: 'Network Config · Profile',
    fields: [],
    table: {
      title: 'LTE / 5G Backup APN Profiles',
      addButtonLabel: 'Create New APN Profile',
      columns: [
        { key: 'name', title: 'Profile Name' },
        { key: 'apn', title: 'APN' },
        { key: 'pdpType', title: 'PDP Type' },
        { key: 'authType', title: 'Auth Type' },
      ],
      initialRows: [
        {
          key: 'apn-1',
          name: 'Primary_Carrier_LTE',
          apn: 'broadband',
          pdpType: 'IPv4/IPv6',
          authType: 'PAP/CHAP',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Profile Name', type: 'input', defaultValue: '' },
        { key: 'apn', label: 'APN', type: 'input', defaultValue: 'internet' },
        { key: 'pdpType', label: 'PDP Type', type: 'input', defaultValue: 'IPv4' },
        { key: 'authType', label: 'Auth Type', type: 'input', defaultValue: 'None' },
      ],
    },
  }),

  'cert-profile': makeSubmodule({
    key: 'cert-profile',
    title: 'Certificate',
    breadcrumbGroup: 'Network Config · Profile',
    tabs: [
      { key: 'site-cert', label: 'Site Certificate' },
      { key: 'ca-cert', label: 'CA & Intermediate' },
    ],
    fields: [],
    table: {
      title: 'Installed Certificates',
      addButtonLabel: 'Import Certificate',
      columns: [
        { key: 'name', title: 'Certificate Name' },
        { key: 'issuer', title: 'Issuer' },
        { key: 'usage', title: 'Usage', kind: 'badge' },
        { key: 'expires', title: 'Expiration Date' },
      ],
      initialRows: [
        {
          key: 'cert-1',
          name: 'omada-portal-tls',
          issuer: "Let's Encrypt R11",
          usage: 'Portal / Captive',
          expires: '2027-08-19',
        },
        {
          key: 'cert-2',
          name: 'campus-radsec-ca',
          issuer: 'HQ Internal Root CA',
          usage: '802.1X / RADIUS',
          expires: '2029-12-31',
        },
      ],
      modalFields: [
        { key: 'name', label: 'Certificate Name', type: 'input', defaultValue: '' },
        { key: 'issuer', label: 'Issuer', type: 'input', defaultValue: 'HQ Internal Root CA' },
        { key: 'usage', label: 'Usage', type: 'input', defaultValue: 'Portal / Captive' },
        { key: 'expires', label: 'Expiration Date', type: 'input', defaultValue: '2028-11-21' },
      ],
    },
  }),

  'mac-filtering': makeSubmodule({
    key: 'mac-filtering',
    title: 'MAC Filtering',
    breadcrumbGroup: 'Device Config · Gateway',
    fields: [
      { key: 'macFilterEnabled', label: 'MAC Filtering', type: 'switch', defaultValue: true },
      {
        key: 'filterMode',
        label: 'Default Policy Mode',
        type: 'select',
        defaultValue: 'deny',
        options: [
          { label: 'Deny Listed MACs (Blacklist)', value: 'deny' },
          { label: 'Allow Listed MACs Only (Whitelist)', value: 'allow' },
        ],
      },
      { key: 'quickMac', label: 'Target MAC Address', type: 'mac', defaultValue: 'E4-5F-01-9A-12-34' },
    ],
    table: {
      title: 'Gateway MAC Filtering Rules',
      addButtonLabel: 'Create New Rule',
      columns: [
        { key: 'name', title: 'Description' },
        { key: 'mac', title: 'MAC Address' },
        { key: 'policy', title: 'Policy', kind: 'badge' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'mf-1',
          name: 'Unauthorized_IOT_Cam',
          mac: 'E4-5F-01-9A-12-34',
          policy: 'Deny',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Description', type: 'input', defaultValue: '' },
        { key: 'mac', label: 'MAC Address', type: 'mac', defaultValue: 'E4-5F-01-00-00-01' },
        {
          key: 'policy',
          label: 'Policy',
          type: 'select',
          defaultValue: 'Deny',
          options: [
            { label: 'Deny', value: 'Deny' },
            { label: 'Allow', value: 'Allow' },
          ],
        },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  'ip-mac-binding': makeSubmodule({
    key: 'ip-mac-binding',
    title: 'IP-MAC Binding',
    breadcrumbGroup: 'Device Config · Gateway',
    infoBanner:
      'Binds client IPv4 addresses to MAC addresses at the gateway ARP table to prevent ARP spoofing attacks.',
    fields: [
      { key: 'bindingEnabled', label: 'Gateway IP-MAC Binding', type: 'switch', defaultValue: true },
      { key: 'dropUnknown', label: 'Drop Unmatched ARP Packets', type: 'switch', defaultValue: false },
      { key: 'sampleIp', label: 'New Binding IP', type: 'ip', defaultValue: '192.168.0.88' },
      { key: 'sampleMac', label: 'New Binding MAC', type: 'mac', defaultValue: '28-87-BA-11-4C-90' },
    ],
    table: {
      title: 'Gateway IP-MAC Binding Table',
      addButtonLabel: 'Add Binding',
      columns: [
        { key: 'name', title: 'Host Name' },
        { key: 'ip', title: 'IP Address' },
        { key: 'mac', title: 'MAC Address' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'imb-1',
          name: 'NAS_Storage_Primary',
          ip: '192.168.0.88',
          mac: '28-87-BA-11-4C-90',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'name', label: 'Host Name', type: 'input', defaultValue: '' },
        { key: 'ip', label: 'IP Address', type: 'ip', defaultValue: '192.168.0.89' },
        { key: 'mac', label: 'MAC Address', type: 'mac', defaultValue: '28-87-BA-11-4C-91' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  upnp: makeSubmodule({
    key: 'upnp',
    title: 'UPnP',
    breadcrumbGroup: 'Device Config · Gateway',
    fields: [
      { key: 'upnpEnabled', label: 'UPnP Service', type: 'switch', defaultValue: false },
      {
        key: 'wanPort',
        label: 'Listening WAN Port',
        type: 'select',
        defaultValue: 'wan1',
        options: [
          { label: '2.5G WAN/LAN1', value: 'wan1' },
          { label: 'WAN/LAN3', value: 'wan3' },
        ],
      },
    ],
  }),

  iptv: makeSubmodule({
    key: 'iptv',
    title: 'IPTV',
    breadcrumbGroup: 'Device Config · Gateway',
    fields: [
      { key: 'iptvEnabled', label: 'IPTV / Multicast Proxy', type: 'switch', defaultValue: false },
      {
        key: 'igmpVersion',
        label: 'IGMP Proxy Version',
        type: 'select',
        defaultValue: 'v3',
        options: [
          { label: 'IGMPv3', value: 'v3' },
          { label: 'IGMPv2', value: 'v2' },
        ],
      },
      { key: 'iptvVlan', label: 'IPTV VLAN ID', type: 'number', defaultValue: 300 },
    ],
  }),

  vrrp: makeSubmodule({
    key: 'vrrp',
    title: 'VRRP',
    breadcrumbGroup: 'Device Config · Switch',
    infoBanner:
      'Virtual Router Redundancy Protocol provides active/standby L3 gateway failover across core switches.',
    fields: [
      { key: 'virtualIp', label: 'Default Virtual IP', type: 'ip', defaultValue: '192.168.100.254' },
    ],
    table: {
      title: 'VRRP Groups',
      addButtonLabel: 'Create VRRP Group',
      columns: [
        { key: 'vrid', title: 'VRID' },
        { key: 'switchName', title: 'Switch' },
        { key: 'virtualIp', title: 'Virtual IP' },
        { key: 'priority', title: 'Priority' },
        { key: 'state', title: 'Role', kind: 'badge' },
        { key: 'enabled', title: 'Enabled', kind: 'status-switch' },
      ],
      initialRows: [
        {
          key: 'vrrp-1',
          vrid: 10,
          switchName: 'CTOOffice_Switch_1',
          virtualIp: '192.168.100.254',
          priority: 120,
          state: 'Master',
          enabled: true,
        },
        {
          key: 'vrrp-2',
          vrid: 10,
          switchName: 'ServerRoom_Switch_2',
          virtualIp: '192.168.100.254',
          priority: 100,
          state: 'Backup',
          enabled: true,
        },
      ],
      modalFields: [
        { key: 'vrid', label: 'VRID', type: 'number', defaultValue: 20 },
        { key: 'switchName', label: 'Switch', type: 'input', defaultValue: 'CTOOffice_Switch_1' },
        { key: 'virtualIp', label: 'Virtual IP', type: 'ip', defaultValue: '192.168.20.254' },
        { key: 'priority', label: 'Priority', type: 'number', defaultValue: 110 },
        { key: 'state', label: 'Role', type: 'input', defaultValue: 'Master' },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
      ],
    },
  }),

  'eogre-tunnel': makeSubmodule({
    key: 'eogre-tunnel',
    title: 'EoGRE Tunnel',
    breadcrumbGroup: 'Device Config · AP',
    fields: [
      { key: 'eogreEnabled', label: 'EoGRE Tunneling', type: 'switch', defaultValue: false },
      { key: 'gatewayIp', label: 'Remote Concentrator IP', type: 'ip', defaultValue: '198.51.100.40' },
      { key: 'greKey', label: 'GRE Tunnel Key', type: 'number', defaultValue: 1001 },
    ],
  }),

  bluetooth: makeSubmodule({
    key: 'bluetooth',
    title: 'Bluetooth',
    breadcrumbGroup: 'Device Config · AP',
    fields: [
      { key: 'bleEnabled', label: 'BLE Beacon Advertising', type: 'switch', defaultValue: true },
      {
        key: 'beaconMode',
        label: 'Beacon Protocol',
        type: 'select',
        defaultValue: 'ibeacon',
        options: [
          { label: 'iBeacon', value: 'ibeacon' },
          { label: 'Eddystone-URL', value: 'eddystone' },
        ],
      },
      {
        key: 'txInterval',
        label: 'Advertising Interval',
        type: 'number',
        defaultValue: 100,
        suffixText: 'ms',
      },
    ],
  }),

  'wifi-calling': makeSubmodule({
    key: 'wifi-calling',
    title: 'Wi-Fi Calling',
    breadcrumbGroup: 'Device Config · AP',
    infoBanner:
      'Prioritizes cellular carrier ePDG IPsec media over WLAN using WMM Voice (AC_VO) queues.',
    fields: [
      { key: 'wifiCallingEnabled', label: 'Wi-Fi Calling QoS', type: 'switch', defaultValue: true },
      {
        key: 'carrierRegion',
        label: 'Carrier ePDG Profile',
        type: 'select',
        defaultValue: 'us-carriers',
        options: [
          { label: 'North America Carriers (AT&T / T-Mobile / Verizon)', value: 'us-carriers' },
          { label: 'Global Generic ePDG', value: 'global' },
        ],
      },
    ],
  }),
};

export const CONFIG_SUBMODULE_KEYS = Object.keys(CONFIG_SUBMODULE_SCHEMAS);
