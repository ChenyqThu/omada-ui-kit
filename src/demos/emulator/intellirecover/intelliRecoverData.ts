import type { OmadaProductName } from '@/omada';

export type IntelliRecoverTargetTab = 'devices' | 'clients';
export type IntelliRecoverStatus = 'monitoring' | 'recovering' | 'paused';

export interface EmulatorIntelliRecoverHistoryEntry {
  key: string;
  time: string;
  reason: string;
  action: string;
  result: 'Success' | 'In Progress';
}

export interface EmulatorIntelliRecoverDeviceRecord {
  key: string;
  name: string;
  type: 'AP' | 'Switch' | 'IPC' | 'Client';
  model: string;
  productSlug: OmadaProductName;
  deviceStatus: 'Connected' | 'Disconnected';
  mac: string;
  ip: string;
  status: IntelliRecoverStatus;
  recoveryTimes: number;
  uplinkDeviceName: string;
  uplinkPort: number;
  uplinkLabel: string;
  history: EmulatorIntelliRecoverHistoryEntry[];
}

export interface IntelliRecoverPolicyConfig {
  enabled: boolean;
  offlineMinutes: number;
  maxRetries: number;
  retryIntervalMinutes: number;
}

export const DEFAULT_INTELLIRECOVER_POLICY: IntelliRecoverPolicyConfig = {
  enabled: false,
  offlineMinutes: 8,
  maxRetries: 10,
  retryIntervalMinutes: 15,
};

/**
 * Exact 3 monitored PoE AP devices matching Omada Controller v6.3 IntelliRecover (`steps/333`).
 */
export const EMULATOR_INTELLIRECOVER_DEVICES: EmulatorIntelliRecoverDeviceRecord[] = [
  {
    key: 'ir-storageroom-eap-3',
    name: 'StorageRoom_Eap_3',
    type: 'AP',
    model: 'EAP620 HD(US) v3.0',
    productSlug: 'eap650',
    deviceStatus: 'Connected',
    mac: '00-FF-00-2B-0E-BC',
    ip: '192.168.0.103',
    status: 'monitoring',
    recoveryTimes: 2,
    uplinkDeviceName: 'SalesDepartment_Switch_3',
    uplinkPort: 4,
    uplinkLabel: 'SalesDepartment_Switch_3 - Port 4',
    history: [
      {
        key: 'hist-sr-2',
        time: 'Sep 18, 2025 11:05:19 am',
        reason: 'Heartbeat missed for 8 minutes',
        action: 'PoE Power Cycle (Port 4)',
        result: 'Success',
      },
      {
        key: 'hist-sr-1',
        time: 'Sep 14, 2025 04:22:07 pm',
        reason: 'Device offline timeout (8 min)',
        action: 'PoE Power Cycle (Port 4)',
        result: 'Success',
      },
    ],
  },
  {
    key: 'ir-breakroom-eap-2',
    name: 'BreakRoom_Eap_2',
    type: 'AP',
    model: 'EAP668-Outdoor HD(EU) v1.0',
    productSlug: 'eap668-outdoor-hd-un-1-2',
    deviceStatus: 'Connected',
    mac: '00-FF-00-38-95-10',
    ip: '192.168.0.104',
    status: 'recovering',
    recoveryTimes: 1,
    uplinkDeviceName: 'SalesDepartment_Switch_3',
    uplinkPort: 3,
    uplinkLabel: 'SalesDepartment_Switch_3 - Port 3',
    history: [
      {
        key: 'hist-br-1',
        time: 'Sep 18, 2025 02:41:12 pm',
        reason: 'Abnormal radio telemetry / link stall',
        action: 'PoE Power Cycle (Port 3)',
        result: 'In Progress',
      },
    ],
  },
  {
    key: 'ir-coooffice-eap-1',
    name: 'COOOffice_Eap_1',
    type: 'AP',
    model: 'EAP773(EU) v1.0',
    productSlug: 'eap727-eu-1-0',
    deviceStatus: 'Connected',
    mac: 'A8-29-48-D0-7B-10',
    ip: '192.168.0.105',
    status: 'monitoring',
    recoveryTimes: 0,
    uplinkDeviceName: 'SalesDepartment_Switch_3',
    uplinkPort: 2,
    uplinkLabel: 'SalesDepartment_Switch_3 - Port 2',
    history: [],
  },
];

export const EMULATOR_INTELLIRECOVER_CANDIDATES: Array<{
  key: string;
  name: string;
  type: 'AP' | 'IPC';
  model: string;
  productSlug: OmadaProductName;
  mac: string;
  ip: string;
  uplinkDeviceName: string;
  uplinkPort: number;
}> = [
  {
    key: 'cand-lobby-eap-4',
    name: 'Lobby_Eap_4',
    type: 'AP',
    model: 'EAP650 v1.0',
    productSlug: 'eap650',
    mac: '00-FF-00-4C-88-12',
    ip: '192.168.0.106',
    uplinkDeviceName: 'SalesDepartment_Switch_3',
    uplinkPort: 5,
  },
  {
    key: 'cand-outdoor-cam-1',
    name: 'Entrance_IPC_1',
    type: 'IPC',
    model: 'VIGI C340 v1.0',
    productSlug: 'eap650-outdoor-1-0',
    mac: '00-FF-00-5D-21-44',
    ip: '192.168.0.141',
    uplinkDeviceName: 'CTOOffice_Switch_1',
    uplinkPort: 6,
  },
];
