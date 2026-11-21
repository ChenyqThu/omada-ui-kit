import type { OmadaProductName } from '@/omada';

export type IncidentSeverity = 'critical' | 'error' | 'warning' | 'info';
export type IncidentStatus = 'Ongoing' | 'Unresolved' | 'Resolved' | 'Ignored';
export type IncidentCategoryKey =
  | 'overview'
  | 'access'
  | 'authentication'
  | 'roaming'
  | 'wireless-network'
  | 'wired-network'
  | 'link'
  | 'wan-services'
  | 'device-status'
  | 'security';

export interface IncidentSuggestionPart {
  id: string;
  prefix: string;
  deviceName?: string;
  linkLabel?: string;
  suffix: string;
}

export interface IncidentPossibleCause {
  key: string;
  title: string;
  suggestions: IncidentSuggestionPart[];
}

export interface IncidentOccurrenceRecord {
  id: string;
  timestamp: string;
  chartTitle: string;
  yMin: number;
  yMax: number;
  yInterval: number;
  yUnit: string;
  xLabels: string[];
  values: number[];
  possibleCauses: IncidentPossibleCause[];
}

export interface EmulatorIncidentRecord {
  key: string;
  title: string;
  categoryKey: Exclude<IncidentCategoryKey, 'overview'>;
  categoryLabel: string;
  severity: IncidentSeverity;
  severityLabel: string;
  status: IncidentStatus;
  lastOccurred: string;
  firstOccurred: string;
  dateWindow: string;
  subtitle: string;
  rootCauseLines: string[];
  rootCauseAnalysis: string;
  improvementSuggestions: string;
  affectedDeviceMac: string;
  affectedDeviceName: string;
  affectedDeviceModel: string;
  affectedDeviceSlug: OmadaProductName;
  affectedDeviceIp: string;
  affectedBand: string;
  affectedClients: number;
  occurrencesCount: number;
  occurrences: IncidentOccurrenceRecord[];
}

export const INCIDENT_CATEGORY_DEFINITIONS: ReadonlyArray<{
  key: IncidentCategoryKey;
  label: string;
}> = [
  { key: 'overview', label: 'Overview' },
  { key: 'access', label: 'Access' },
  { key: 'authentication', label: 'Authentication' },
  { key: 'roaming', label: 'Roaming' },
  { key: 'wireless-network', label: 'Wireless Network' },
  { key: 'wired-network', label: 'Wired Network' },
  { key: 'link', label: 'Link' },
  { key: 'wan-services', label: 'WAN & Services' },
  { key: 'device-status', label: 'Device Status' },
  { key: 'security', label: 'Security' },
];

export const EMULATOR_INCIDENTS: EmulatorIncidentRecord[] = [
  {
    key: 'inc-wireless-interference',
    title: '00-FF-00-38-95-10 wireless interference rate high',
    categoryKey: 'wireless-network',
    categoryLabel: 'Wireless Network',
    severity: 'warning',
    severityLabel: 'Warning',
    status: 'Ongoing',
    lastOccurred: 'Jul 09, 2026 04:46:37 pm',
    firstOccurred: 'Jul 09, 2026 04:46:37 pm',
    dateWindow: 'Aug 20, 2025 05:10 pm - Sep 19, 2025 05:10 pm',
    subtitle:
      'Within 15 min, on the 2.4G band, the percentage of the interference rate samples exceeding 50% is ≥ %.',
    rootCauseLines: ['1. Too many devices nearby', '2. Network interference'],
    rootCauseAnalysis: '1. Too many devices nearby  2. Network interference',
    improvementSuggestions:
      "1. Use the AP 00-FF-00-38-95-10's another channel or band. 2. Refer to the FAQ.",
    affectedDeviceMac: '00-FF-00-38-95-10',
    affectedDeviceName: 'BreakRoom_Eap_2',
    affectedDeviceModel: 'EAP668-Outdoor HD(EU) v1.0',
    affectedDeviceSlug: 'eap668-outdoor-hd-un-1-2',
    affectedDeviceIp: '192.168.0.122',
    affectedBand: '2.4 GHz',
    affectedClients: 0,
    occurrencesCount: 1,
    occurrences: [
      {
        id: 'occ-interference-1',
        timestamp: 'Jul 09, 2026 04:46 pm',
        chartTitle: 'Wireless Interference Rate (2.4 GHz)',
        yMin: 0,
        yMax: 90,
        yInterval: 18,
        yUnit: '%',
        xLabels: [
          '04:32:37 pm',
          '04:33:37 pm',
          '04:34:37 pm',
          '04:35:37 pm',
          '04:36:37 pm',
          '04:37:37 pm',
          '04:38:37 pm',
          '04:39:37 pm',
          '04:40:37 pm',
          '04:41:37 pm',
          '04:42:37 pm',
          '04:43:37 pm',
          '04:44:37 pm',
          '04:45:37 pm',
          '04:46:37 pm',
        ],
        values: [80, 71, 71, 77, 63, 63, 71, 74, 66, 64, 66, 68, 65, 67, 70],
        possibleCauses: [
          {
            key: 'cause-nearby-devices',
            title: '1. Too many devices nearby',
            suggestions: [
              {
                id: 'sug-1',
                prefix: '1. Use the AP ',
                deviceName: 'BreakRoom_Eap_2',
                linkLabel: 'BreakRoom_Eap_2',
                suffix: "'s another channel or band.",
              },
              {
                id: 'sug-2',
                prefix: '2. Refer to the ',
                linkLabel: 'FAQ',
                suffix: '.',
              },
            ],
          },
          {
            key: 'cause-interference',
            title: '2. Network interference',
            suggestions: [
              {
                id: 'sug-3',
                prefix: '1. Run WLAN Optimization or adjust ',
                deviceName: 'BreakRoom_Eap_2',
                linkLabel: 'BreakRoom_Eap_2',
                suffix: ' channel width to 20 MHz on 2.4 GHz.',
              },
              {
                id: 'sug-4',
                prefix: '2. Refer to the ',
                linkLabel: 'FAQ',
                suffix: '.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'inc-noise-floor',
    title: 'Noise floor high on device 00-FF-00-38-95-10',
    categoryKey: 'wireless-network',
    categoryLabel: 'Wireless Network',
    severity: 'info',
    severityLabel: 'Info',
    status: 'Ongoing',
    lastOccurred: 'Jul 09, 2026 04:13:17 pm',
    firstOccurred: 'Jul 09, 2026 04:13:17 pm',
    dateWindow: 'Aug 20, 2025 05:10 pm - Sep 19, 2025 05:10 pm',
    subtitle:
      'Within 15 min, on the 2.4G band, the noise floor samples exceeded the recommended baseline threshold.',
    rootCauseLines: ['Network interference'],
    rootCauseAnalysis: 'Network interference',
    improvementSuggestions:
      "1. Refer to the FAQ. 2. Use the AP 00-FF-00-38-95-10's another channel or band.",
    affectedDeviceMac: '00-FF-00-38-95-10',
    affectedDeviceName: 'BreakRoom_Eap_2',
    affectedDeviceModel: 'EAP668-Outdoor HD(EU) v1.0',
    affectedDeviceSlug: 'eap668-outdoor-hd-un-1-2',
    affectedDeviceIp: '192.168.0.122',
    affectedBand: '2.4 GHz',
    affectedClients: 0,
    occurrencesCount: 2,
    occurrences: [
      {
        id: 'occ-noise-1',
        timestamp: 'Jul 09, 2026 04:13 pm',
        chartTitle: 'Wireless Interference Rate (2.4 GHz)',
        yMin: 0,
        yMax: 90,
        yInterval: 18,
        yUnit: '%',
        xLabels: [
          '03:59:17 pm',
          '04:00:17 pm',
          '04:01:17 pm',
          '04:02:17 pm',
          '04:03:17 pm',
          '04:04:17 pm',
          '04:05:17 pm',
          '04:06:17 pm',
          '04:07:17 pm',
          '04:08:17 pm',
          '04:09:17 pm',
          '04:10:17 pm',
          '04:11:17 pm',
          '04:12:17 pm',
          '04:13:17 pm',
        ],
        values: [54, 58, 61, 56, 60, 64, 59, 55, 57, 62, 60, 58, 56, 59, 61],
        possibleCauses: [
          {
            key: 'cause-noise-interference',
            title: '1. Network interference',
            suggestions: [
              {
                id: 'noise-sug-1',
                prefix: '1. Refer to the ',
                linkLabel: 'FAQ',
                suffix: '.',
              },
              {
                id: 'noise-sug-2',
                prefix: '2. Use the AP ',
                deviceName: 'BreakRoom_Eap_2',
                linkLabel: 'BreakRoom_Eap_2',
                suffix: "'s another channel or band.",
              },
            ],
          },
        ],
      },
      {
        id: 'occ-noise-2',
        timestamp: 'Jul 09, 2026 03:58 pm',
        chartTitle: 'Wireless Interference Rate (2.4 GHz)',
        yMin: 0,
        yMax: 90,
        yInterval: 18,
        yUnit: '%',
        xLabels: [
          '03:44:17 pm',
          '03:45:17 pm',
          '03:46:17 pm',
          '03:47:17 pm',
          '03:48:17 pm',
          '03:49:17 pm',
          '03:50:17 pm',
          '03:51:17 pm',
          '03:52:17 pm',
          '03:53:17 pm',
          '03:54:17 pm',
          '03:55:17 pm',
          '03:56:17 pm',
          '03:57:17 pm',
          '03:58:17 pm',
        ],
        values: [48, 52, 55, 51, 54, 58, 56, 53, 55, 59, 57, 54, 53, 55, 56],
        possibleCauses: [
          {
            key: 'cause-noise-interference-2',
            title: '1. Network interference',
            suggestions: [
              {
                id: 'noise-sug-3',
                prefix: '1. Refer to the ',
                linkLabel: 'FAQ',
                suffix: '.',
              },
              {
                id: 'noise-sug-4',
                prefix: '2. Use the AP ',
                deviceName: 'BreakRoom_Eap_2',
                linkLabel: 'BreakRoom_Eap_2',
                suffix: "'s another channel or band.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const EMULATOR_RESOLVED_INCIDENTS: EmulatorIncidentRecord[] = [
  {
    key: 'inc-resolved-channel',
    title: 'A8-29-48-D0-7B-10 co-channel interference detected',
    categoryKey: 'wireless-network',
    categoryLabel: 'Wireless Network',
    severity: 'warning',
    severityLabel: 'Warning',
    status: 'Resolved',
    lastOccurred: 'Jul 08, 2026 02:14:09 pm',
    firstOccurred: 'Jul 08, 2026 01:49:09 pm',
    dateWindow: 'Aug 20, 2025 05:10 pm - Sep 19, 2025 05:10 pm',
    subtitle:
      'Within 15 min, on the 5G band, adjacent AP overlap exceeded the recommended threshold.',
    rootCauseLines: ['1. Overlapping 5 GHz channel allocation'],
    rootCauseAnalysis: '1. Overlapping 5 GHz channel allocation',
    improvementSuggestions:
      "1. Re-assign COOOffice_Eap_1 to channel 149. 2. Refer to the FAQ.",
    affectedDeviceMac: 'A8-29-48-D0-7B-10',
    affectedDeviceName: 'COOOffice_Eap_1',
    affectedDeviceModel: 'EAP773(EU) v1.0',
    affectedDeviceSlug: 'eap727-eu-1-0',
    affectedDeviceIp: '192.168.0.121',
    affectedBand: '5 GHz',
    affectedClients: 2,
    occurrencesCount: 1,
    occurrences: [
      {
        id: 'occ-resolved-1',
        timestamp: 'Jul 08, 2026 02:14 pm',
        chartTitle: 'Wireless Interference Rate (5 GHz)',
        yMin: 0,
        yMax: 90,
        yInterval: 18,
        yUnit: '%',
        xLabels: [
          '02:00:09 pm',
          '02:01:09 pm',
          '02:02:09 pm',
          '02:03:09 pm',
          '02:04:09 pm',
          '02:05:09 pm',
          '02:06:09 pm',
          '02:07:09 pm',
          '02:08:09 pm',
          '02:09:09 pm',
          '02:10:09 pm',
          '02:11:09 pm',
          '02:12:09 pm',
          '02:13:09 pm',
          '02:14:09 pm',
        ],
        values: [62, 58, 54, 49, 44, 38, 32, 28, 24, 21, 18, 16, 15, 14, 12],
        possibleCauses: [
          {
            key: 'cause-resolved-1',
            title: '1. Overlapping 5 GHz channel allocation',
            suggestions: [
              {
                id: 'res-sug-1',
                prefix: '1. Verify channel assignment on ',
                deviceName: 'COOOffice_Eap_1',
                linkLabel: 'COOOffice_Eap_1',
                suffix: '.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'inc-resolved-snr',
    title: '00-FF-00-2B-0E-BC client SNR drop recovered',
    categoryKey: 'wireless-network',
    categoryLabel: 'Wireless Network',
    severity: 'info',
    severityLabel: 'Info',
    status: 'Resolved',
    lastOccurred: 'Jul 07, 2026 11:05:41 am',
    firstOccurred: 'Jul 07, 2026 10:50:41 am',
    dateWindow: 'Aug 20, 2025 05:10 pm - Sep 19, 2025 05:10 pm',
    subtitle:
      'Client signal-to-noise ratio dipped briefly during peak office traffic and recovered automatically.',
    rootCauseLines: ['Temporary RF attenuation'],
    rootCauseAnalysis: 'Temporary RF attenuation',
    improvementSuggestions:
      "1. Monitor StorageRoom_Eap_3 transmit power. 2. Refer to the FAQ.",
    affectedDeviceMac: '00-FF-00-2B-0E-BC',
    affectedDeviceName: 'StorageRoom_Eap_3',
    affectedDeviceModel: 'EAP620 HD(US) v3.0[Custom]',
    affectedDeviceSlug: 'eap650',
    affectedDeviceIp: '192.168.0.123',
    affectedBand: '2.4 GHz',
    affectedClients: 1,
    occurrencesCount: 1,
    occurrences: [
      {
        id: 'occ-resolved-2',
        timestamp: 'Jul 07, 2026 11:05 am',
        chartTitle: 'Wireless Interference Rate (2.4 GHz)',
        yMin: 0,
        yMax: 90,
        yInterval: 18,
        yUnit: '%',
        xLabels: [
          '10:51:41 am',
          '10:52:41 am',
          '10:53:41 am',
          '10:54:41 am',
          '10:55:41 am',
          '10:56:41 am',
          '10:57:41 am',
          '10:58:41 am',
          '10:59:41 am',
          '11:00:41 am',
          '11:01:41 am',
          '11:02:41 am',
          '11:03:41 am',
          '11:04:41 am',
          '11:05:41 am',
        ],
        values: [46, 49, 53, 50, 44, 39, 34, 29, 26, 24, 22, 20, 19, 18, 17],
        possibleCauses: [
          {
            key: 'cause-resolved-2',
            title: '1. Temporary RF attenuation',
            suggestions: [
              {
                id: 'res-sug-2',
                prefix: '1. Check AP ',
                deviceName: 'StorageRoom_Eap_3',
                linkLabel: 'StorageRoom_Eap_3',
                suffix: ' placement and antenna orientation.',
              },
            ],
          },
        ],
      },
    ],
  },
];
