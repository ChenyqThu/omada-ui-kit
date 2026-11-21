export type LogSubTabKey = 'alerts' | 'events' | 'audit-logs';
export type EventModuleKey = 'all' | 'system' | 'device' | 'client';
export type AlertStatusTabKey = 'unresolved' | 'resolved';
export type AuditResultFilterKey = 'all' | 'success' | 'failed';

export interface LogContentSegment {
  kind: 'text' | 'client' | 'device';
  text: string;
  targetName?: string;
}

export interface EmulatorLogEventRecord {
  key: string;
  module: 'system' | 'device' | 'client';
  type: 'Client Online (Wireless)' | 'Client Offline (Wireless)' | string;
  content: string;
  segments: LogContentSegment[];
  time: string;
  timestampMs: number;
}

export interface EmulatorAlertRecord {
  key: string;
  severity: 'Warning' | 'Error' | 'Info';
  status: 'unresolved' | 'resolved';
  type: string;
  content: string;
  segments: LogContentSegment[];
  time: string;
  timestampMs: number;
}

export interface EmulatorAuditLogRecord {
  key: string;
  operator: string;
  operation: string;
  result: 'Success' | 'Failed';
  content: string;
  segments: LogContentSegment[];
  ipAddress: string;
  time: string;
  timestampMs: number;
}

/**
 * Exact 10 client wireless online/offline event rows matching Omada Controller v6.3 Logs -> Events (`steps/311`).
 */
export const EMULATOR_LOG_EVENTS: EmulatorLogEventRecord[] = [
  {
    key: 'evt-1',
    module: 'client',
    type: 'Client Online (Wireless)',
    content:
      'Neffos_X20_Pro went online on StorageRoom_Eap_3 with SSID "Employee_Network_5" on channel 149.',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' went online on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' with SSID "Employee_Network_5" on channel 149.' },
    ],
    time: 'Sep 18, 2025 03:16:43 pm',
    timestampMs: Date.parse('2025-09-18T15:16:43'),
  },
  {
    key: 'evt-2',
    module: 'client',
    type: 'Client Offline (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went offline from SSID "Employee_Network_5" on COOOffice_Eap_1 (25m connected, 422.71KB).',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went offline from SSID "Employee_Network_5" on ' },
      { kind: 'device', text: 'COOOffice_Eap_1', targetName: 'COOOffice_Eap_1' },
      { kind: 'text', text: ' (25m connected, 422.71KB).' },
    ],
    time: 'Sep 18, 2025 02:57:32 pm',
    timestampMs: Date.parse('2025-09-18T14:57:32'),
  },
  {
    key: 'evt-3',
    module: 'client',
    type: 'Client Online (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went online on COOOffice_Eap_1 with SSID "Employee_Network_5" on channel 48.',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went online on ' },
      { kind: 'device', text: 'COOOffice_Eap_1', targetName: 'COOOffice_Eap_1' },
      { kind: 'text', text: ' with SSID "Employee_Network_5" on channel 48.' },
    ],
    time: 'Sep 18, 2025 02:26:28 pm',
    timestampMs: Date.parse('2025-09-18T14:26:28'),
  },
  {
    key: 'evt-4',
    module: 'client',
    type: 'Client Offline (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went offline from SSID "DCH" on StorageRoom_Eap_3 (11s connected, 10.81KB).',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went offline from SSID "DCH" on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' (11s connected, 10.81KB).' },
    ],
    time: 'Sep 18, 2025 12:34:31 pm',
    timestampMs: Date.parse('2025-09-18T12:34:31'),
  },
  {
    key: 'evt-5',
    module: 'client',
    type: 'Client Online (Wireless)',
    content:
      'Neffos_X20_Pro went online on StorageRoom_Eap_3 with SSID "DCH" on channel 149.',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' went online on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' with SSID "DCH" on channel 149.' },
    ],
    time: 'Sep 18, 2025 12:29:06 pm',
    timestampMs: Date.parse('2025-09-18T12:29:06'),
  },
  {
    key: 'evt-6',
    module: 'client',
    type: 'Client Offline (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went offline from SSID "DCH" on StorageRoom_Eap_3 (3s connected, 812Bytes).',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went offline from SSID "DCH" on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' (3s connected, 812Bytes).' },
    ],
    time: 'Sep 18, 2025 12:27:46 pm',
    timestampMs: Date.parse('2025-09-18T12:27:46'),
  },
  {
    key: 'evt-7',
    module: 'client',
    type: 'Client Online (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went online on StorageRoom_Eap_3 with SSID "DCH" on channel 149.',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went online on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' with SSID "DCH" on channel 149.' },
    ],
    time: 'Sep 18, 2025 12:27:43 pm',
    timestampMs: Date.parse('2025-09-18T12:27:43'),
  },
  {
    key: 'evt-8',
    module: 'client',
    type: 'Client Offline (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went offline from SSID "DCH" on StorageRoom_Eap_3 (4s connected, 812Bytes).',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went offline from SSID "DCH" on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' (4s connected, 812Bytes).' },
    ],
    time: 'Sep 18, 2025 12:27:24 pm',
    timestampMs: Date.parse('2025-09-18T12:27:24'),
  },
  {
    key: 'evt-9',
    module: 'client',
    type: 'Client Online (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went online on StorageRoom_Eap_3 with SSID "DCH" on channel 149.',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went online on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' with SSID "DCH" on channel 149.' },
    ],
    time: 'Sep 18, 2025 12:27:20 pm',
    timestampMs: Date.parse('2025-09-18T12:27:20'),
  },
  {
    key: 'evt-10',
    module: 'client',
    type: 'Client Offline (Wireless)',
    content:
      'Neffos_X20_Pro (IP: 192.168.0.107) went offline from SSID "DCH" on StorageRoom_Eap_3 (8s connected, 11.69KB).',
    segments: [
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' (IP: 192.168.0.107) went offline from SSID "DCH" on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' (8s connected, 11.69KB).' },
    ],
    time: 'Sep 18, 2025 12:27:01 pm',
    timestampMs: Date.parse('2025-09-18T12:27:01'),
  },
];

export const EMULATOR_ALERTS: EmulatorAlertRecord[] = [
  {
    key: 'alt-1',
    severity: 'Warning',
    status: 'resolved',
    type: 'PoE Power Budget Alert',
    content:
      'SalesDepartment_Switch_3 PoE power output stabilized at 32.80W / 150.00W after Port 3 recovery.',
    segments: [
      {
        kind: 'device',
        text: 'SalesDepartment_Switch_3',
        targetName: 'SalesDepartment_Switch_3',
      },
      { kind: 'text', text: ' PoE power output stabilized at 32.80W / 150.00W after Port 3 recovery.' },
    ],
    time: 'Sep 18, 2025 02:44:10 pm',
    timestampMs: Date.parse('2025-09-18T14:44:10'),
  },
  {
    key: 'alt-2',
    severity: 'Warning',
    status: 'resolved',
    type: 'Wireless Interference High',
    content:
      'BreakRoom_Eap_2 2.4 GHz channel interference dropped below 35% threshold after auto-channel scan.',
    segments: [
      { kind: 'device', text: 'BreakRoom_Eap_2', targetName: 'BreakRoom_Eap_2' },
      {
        kind: 'text',
        text: ' 2.4 GHz channel interference dropped below 35% threshold after auto-channel scan.',
      },
    ],
    time: 'Sep 18, 2025 01:18:52 pm',
    timestampMs: Date.parse('2025-09-18T13:18:52'),
  },
  {
    key: 'alt-3',
    severity: 'Error',
    status: 'resolved',
    type: 'AP Heartbeat Missed',
    content:
      'StorageRoom_Eap_3 missed 2 heartbeat packets and reconnected cleanly via Port 4 PoE link.',
    segments: [
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      {
        kind: 'text',
        text: ' missed 2 heartbeat packets and reconnected cleanly via Port 4 PoE link.',
      },
    ],
    time: 'Sep 18, 2025 11:05:19 am',
    timestampMs: Date.parse('2025-09-18T11:05:19'),
  },
  {
    key: 'alt-4',
    severity: 'Warning',
    status: 'resolved',
    type: 'STP Topology Change',
    content:
      'ServerRoom_Switch_2 cleared transient spanning-tree notification on MLAG peer Port 2.',
    segments: [
      { kind: 'device', text: 'ServerRoom_Switch_2', targetName: 'ServerRoom_Switch_2' },
      {
        kind: 'text',
        text: ' cleared transient spanning-tree notification on MLAG peer Port 2.',
      },
    ],
    time: 'Sep 17, 2025 06:41:08 pm',
    timestampMs: Date.parse('2025-09-17T18:41:08'),
  },
  {
    key: 'alt-5',
    severity: 'Info',
    status: 'resolved',
    type: 'WAN Link Failover',
    content:
      'MainOffice_Gateway_2 restored primary WAN1 optical uplink (latency 4 ms, 0% packet loss).',
    segments: [
      { kind: 'device', text: 'MainOffice_Gateway_2', targetName: 'MainOffice_Gateway_2' },
      {
        kind: 'text',
        text: ' restored primary WAN1 optical uplink (latency 4 ms, 0% packet loss).',
      },
    ],
    time: 'Sep 17, 2025 03:22:47 pm',
    timestampMs: Date.parse('2025-09-17T15:22:47'),
  },
  {
    key: 'alt-6',
    severity: 'Info',
    status: 'resolved',
    type: 'Channel Width Adjusted',
    content:
      'COOOffice_Eap_1 switched 5 GHz radio to channel 48 (80 MHz) to avoid radar overlap.',
    segments: [
      { kind: 'device', text: 'COOOffice_Eap_1', targetName: 'COOOffice_Eap_1' },
      {
        kind: 'text',
        text: ' switched 5 GHz radio to channel 48 (80 MHz) to avoid radar overlap.',
      },
    ],
    time: 'Sep 17, 2025 09:14:30 am',
    timestampMs: Date.parse('2025-09-17T09:14:30'),
  },
];

export const EMULATOR_AUDIT_LOGS: EmulatorAuditLogRecord[] = [
  {
    key: 'aud-1',
    operator: 'admin',
    operation: 'Edit IntelliRecover Policy',
    result: 'Success',
    content:
      'Updated PoE offline trigger to 8 min, max retries 10, interval 15 min on Main Office Floor.',
    segments: [
      {
        kind: 'text',
        text: 'Updated PoE offline trigger to 8 min, max retries 10, interval 15 min on Main Office Floor.',
      },
    ],
    ipAddress: '192.168.0.200',
    time: 'Sep 18, 2025 03:12:09 pm',
    timestampMs: Date.parse('2025-09-18T15:12:09'),
  },
  {
    key: 'aud-2',
    operator: 'admin',
    operation: 'Update Switch Port Profile',
    result: 'Success',
    content: 'Applied PoE+(30W) Trunk profile on SalesDepartment_Switch_3 Ports 2-4.',
    segments: [
      { kind: 'text', text: 'Applied PoE+(30W) Trunk profile on ' },
      {
        kind: 'device',
        text: 'SalesDepartment_Switch_3',
        targetName: 'SalesDepartment_Switch_3',
      },
      { kind: 'text', text: ' Ports 2-4.' },
    ],
    ipAddress: '192.168.0.200',
    time: 'Sep 18, 2025 02:40:18 pm',
    timestampMs: Date.parse('2025-09-18T14:40:18'),
  },
  {
    key: 'aud-3',
    operator: 'admin',
    operation: 'Authorize Client',
    result: 'Success',
    content: 'Authorized wireless client Neffos_X20_Pro on SSID "Employee_Network_5".',
    segments: [
      { kind: 'text', text: 'Authorized wireless client ' },
      { kind: 'client', text: 'Neffos_X20_Pro', targetName: 'Neffos_X20_Pro' },
      { kind: 'text', text: ' on SSID "Employee_Network_5".' },
    ],
    ipAddress: '192.168.0.200',
    time: 'Sep 18, 2025 01:55:44 pm',
    timestampMs: Date.parse('2025-09-18T13:55:44'),
  },
  {
    key: 'aud-4',
    operator: 'admin',
    operation: 'Check Device Firmware',
    result: 'Success',
    content: 'Triggered firmware verification on MainOffice_Gateway_2 and 8 site devices.',
    segments: [
      { kind: 'text', text: 'Triggered firmware verification on ' },
      { kind: 'device', text: 'MainOffice_Gateway_2', targetName: 'MainOffice_Gateway_2' },
      { kind: 'text', text: ' and 8 site devices.' },
    ],
    ipAddress: '192.168.0.200',
    time: 'Sep 18, 2025 11:30:05 am',
    timestampMs: Date.parse('2025-09-18T11:30:05'),
  },
  {
    key: 'aud-5',
    operator: 'admin',
    operation: 'Modify WLAN Schedule',
    result: 'Success',
    content: 'Enabled band steering on StorageRoom_Eap_3 and COOOffice_Eap_1.',
    segments: [
      { kind: 'text', text: 'Enabled band steering on ' },
      { kind: 'device', text: 'StorageRoom_Eap_3', targetName: 'StorageRoom_Eap_3' },
      { kind: 'text', text: ' and ' },
      { kind: 'device', text: 'COOOffice_Eap_1', targetName: 'COOOffice_Eap_1' },
      { kind: 'text', text: '.' },
    ],
    ipAddress: '192.168.0.200',
    time: 'Sep 18, 2025 10:12:37 am',
    timestampMs: Date.parse('2025-09-18T10:12:37'),
  },
  {
    key: 'aud-6',
    operator: 'admin',
    operation: 'Controller Sign-In',
    result: 'Success',
    content: 'Administrator admin signed in from Test_PC (192.168.0.200) via Web UI.',
    segments: [
      { kind: 'text', text: 'Administrator admin signed in from ' },
      { kind: 'client', text: 'Test_PC', targetName: 'Test_PC' },
      { kind: 'text', text: ' (192.168.0.200) via Web UI.' },
    ],
    ipAddress: '192.168.0.200',
    time: 'Sep 18, 2025 09:04:12 am',
    timestampMs: Date.parse('2025-09-18T09:04:12'),
  },
];
