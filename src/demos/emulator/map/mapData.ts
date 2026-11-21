import type { OmadaClientIconName, OmadaIconName, OmadaProductName } from '@/omada';

export type HeatMapBand = '2.4 GHz' | '5 GHz' | '6 GHz';
export type HeatMapIconSize = 'Small' | 'Medium' | 'Large';

export interface HeatMapFloorPlan {
  id: string;
  name: string;
  scaleMeters: number;
  dimensionsLabel: string;
  virtualDevice: {
    id: string;
    label: string;
    x: number;
    y: number;
  };
  extraAps?: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
  }>;
  description: string;
}

export interface DeviceMapPin {
  key: string;
  name: string;
  model: string;
  productSlug: OmadaProductName;
  category: 'gateway' | 'switch' | 'ap' | 'olt';
  status: 'connected' | 'disconnected';
  locationLabel: string;
  x: number;
  y: number;
}

export interface DeviceMapCluster {
  id: string;
  count: number;
  x: number;
  y: number;
  devices: Array<{
    key: string;
    name: string;
    model: string;
    productSlug: OmadaProductName;
    locationLabel: string;
  }>;
}

export interface MapGeoLabel {
  text: string;
  x: number;
  y: number;
  kind: 'country' | 'city';
}

export interface TopologyNodeData {
  id: string;
  name: string;
  kind: 'internet' | 'device' | 'client' | 'controller';
  category?: 'gateway' | 'switch' | 'ap' | 'olt';
  productSlug?: OmadaProductName;
  clientIcon?: OmadaClientIconName;
  status: 'connected' | 'disconnected' | 'pending';
  healthBucket?: 'good' | 'fair' | 'poor' | 'no-data';
  statusDotTone?: 'good' | 'poor' | 'no-data';
  ip?: string;
  mac?: string;
  model?: string;
  network?: string;
  ssid?: string;
  portLabel?: string;
  speedLabel?: string;
  linkDashed?: boolean;
  showLinkAlertBadge?: boolean;
  collapsible?: boolean;
  children?: TopologyNodeData[];
}

export interface QuickConfigTileItem {
  key: string;
  label: string;
  icon: OmadaIconName;
  routeKey?: string;
  description: string;
}

export const HEAT_MAP_FLOORS: HeatMapFloorPlan[] = [
  {
    id: 'map-1',
    name: 'Map_1',
    scaleMeters: 39.13,
    dimensionsLabel: '48.2m × 24.6m',
    virtualDevice: {
      id: 'virtual-ap-1',
      label: 'Virtual Device',
      x: 262,
      y: 204,
    },
    description: 'Headquarters Building · Main Office Floor CAD Floorplan',
  },
  {
    id: 'floor-2',
    name: 'Floor_2',
    scaleMeters: 32.5,
    dimensionsLabel: '40.0m × 20.5m',
    virtualDevice: {
      id: 'virtual-ap-2',
      label: 'COOOffice_Eap_1',
      x: 410,
      y: 258,
    },
    extraAps: [
      { id: 'ap-fl2-2', label: 'BreakRoom_Eap_2', x: 640, y: 280 },
    ],
    description: 'Headquarters Building · Second Floor Executive Wing',
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    scaleMeters: 54.8,
    dimensionsLabel: '64.0m × 32.0m',
    virtualDevice: {
      id: 'virtual-ap-3',
      label: 'StorageRoom_Eap_3',
      x: 495,
      y: 270,
    },
    description: 'Logistics Annex · High-Bay Storage Floorplan',
  },
];

export const DEVICE_MAP_PINS: DeviceMapPin[] = [
  {
    key: 'salesdepartment-switch-3',
    name: 'SalesDepartment_Switch_3',
    model: 'SG2210MP v5.0',
    productSlug: 'tl-sg3452x-un-1-0',
    category: 'switch',
    status: 'connected',
    locationLabel: 'Gao Corridor · North Sales Annex',
    x: 706,
    y: 96,
  },
  {
    key: 'mainoffice-gateway-2',
    name: 'MainOffice_Gateway_2',
    model: 'ER7412-M2 v1.0',
    productSlug: 'er8411',
    category: 'gateway',
    status: 'connected',
    locationLabel: 'Niamey North · Core Gateway',
    x: 574,
    y: 382,
  },
  {
    key: 'coooffice-eap-1',
    name: 'COOOffice_Eap_1',
    model: 'EAP773(EU) v1.0',
    productSlug: 'eap727-eu-1-0',
    category: 'ap',
    status: 'connected',
    locationLabel: 'Burkina West · Executive Office',
    x: 304,
    y: 496,
  },
  {
    key: 'breakroom-eap-2',
    name: 'BreakRoom_Eap_2',
    model: 'EAP668-Outdoor HD(EU) v1.0',
    productSlug: 'eap668-outdoor-hd-un-1-2',
    category: 'ap',
    status: 'connected',
    locationLabel: 'Kaya East · Outdoor Courtyard',
    x: 512,
    y: 472,
  },
  {
    key: 'ctooffice-switch-1',
    name: 'CTOOffice_Switch_1',
    model: 'SG3210 v3.20',
    productSlug: 'sg2428p-un-5-40',
    category: 'switch',
    status: 'connected',
    locationLabel: 'Torodi-Say · Engineering Core',
    x: 636,
    y: 526,
  },
  {
    key: 'datacenter-olt-1',
    name: 'DataCenter_Olt_1',
    model: 'DS-P7001-08 1.0',
    productSlug: 'nvr-3',
    category: 'olt',
    status: 'connected',
    locationLabel: 'Dosso East · Fiber Aggregation',
    x: 846,
    y: 486,
  },
  {
    key: 'storageroom-eap-3',
    name: 'StorageRoom_Eap_3',
    model: 'EAP620 HD(US) v3.0[Custom]',
    productSlug: 'eap650',
    category: 'ap',
    status: 'connected',
    locationLabel: 'Bolgatanga North · Storage Hub',
    x: 564,
    y: 638,
  },
];

export const DEVICE_MAP_CLUSTER: DeviceMapCluster = {
  id: 'cluster-niamey-south',
  count: 2,
  x: 564,
  y: 454,
  devices: [
    {
      key: 'breakroom-gateway-1',
      name: 'BreakRoom_Gateway_1',
      model: 'ER701-5G-Outdoor v1.0',
      productSlug: 'eap221-lr-kit',
      locationLabel: 'Niamey · 5G Backup Link',
    },
    {
      key: 'serverroom-switch-2',
      name: 'ServerRoom_Switch_2',
      model: 'TL-SG2210MP v2.0',
      productSlug: 'sg3452p-un-3-40',
      locationLabel: 'Niamey · Rack A Distribution',
    },
  ],
};

/** West Africa country & regional vector polygons (1000×720 coordinate space matching reference). */
export const WEST_AFRICA_COUNTRY_BORDERS: string[] = [
  // Mali - Burkina Faso border
  'M 120 458 L 165 450 L 208 432 L 245 436 L 285 415 L 332 426 L 368 408 L 415 390 L 456 365 L 502 362 L 542 356',
  // Mali - Niger border
  'M 542 356 L 560 326 L 575 292 L 584 260 L 615 232 L 622 185 L 635 140 L 642 105 L 652 72',
  // Burkina Faso - Niger border
  'M 542 356 L 566 382 L 574 415 L 598 446 L 625 462 L 658 492 L 672 522 L 664 556',
  // Burkina Faso southern border (Ivory Coast / Ghana / Togo / Benin)
  'M 120 458 L 138 495 L 154 532 L 152 578 L 165 628 L 185 676 L 222 690 L 248 686 L 268 656 L 296 654 L 312 678 L 365 676 L 420 676 L 478 676 L 522 678 L 562 670 L 596 652 L 626 620 L 664 556',
  // Niger - Benin / Nigeria border
  'M 664 556 L 696 575 L 728 572 L 758 564 L 788 532 L 826 516 L 868 504 L 912 496 L 964 494 L 998 485',
  // Niger eastern internal / Nigeria northern divide
  'M 792 315 L 774 378 L 768 442 L 760 502 L 758 564',
  // Upper Mali northern boundary
  'M 42 192 L 145 186 L 258 175 L 385 164 L 495 152 L 635 140 L 765 132 L 998 118',
];

export const WEST_AFRICA_REGION_BORDERS: string[] = [
  // Mali internal regions
  'M 215 178 L 245 245 L 235 318 L 208 385 L 208 432',
  'M 365 166 L 380 220 L 365 282 L 352 346 L 332 426',
  'M 495 152 L 478 210 L 468 278 L 456 365',
  'M 245 245 L 380 220 L 478 210 L 615 232',
  'M 235 318 L 365 282 L 468 278 L 575 292',
  // Burkina Faso provinces
  'M 285 415 L 292 486 L 284 558 L 268 656',
  'M 368 408 L 382 478 L 372 548 L 365 676',
  'M 456 365 L 468 436 L 458 518 L 452 595 L 478 676',
  'M 502 362 L 516 440 L 526 520 L 522 605 L 522 678',
  'M 208 492 L 292 486 L 382 478 L 468 436 L 566 382',
  'M 154 532 L 284 558 L 372 548 L 458 518 L 574 496 L 658 492',
  'M 165 628 L 284 595 L 372 602 L 452 595 L 562 612 L 626 620',
  // Niger western regions (Tillaberi / Dosso / Tahoua)
  'M 615 232 L 724 248 L 792 315 L 892 332 L 998 318',
  'M 584 260 L 664 295 L 774 378',
  'M 598 446 L 692 428 L 768 442 L 876 426 L 998 438',
  'M 658 492 L 732 496 L 760 502',
  'M 696 575 L 728 648 L 716 716',
  'M 826 516 L 856 598 L 844 716',
];

export const NIGER_RIVER_PATH =
  'M 178 468 C 205 426 226 382 246 336 C 266 292 276 236 306 218 C 344 196 404 188 456 194 C 498 198 516 248 524 294 C 534 342 560 368 588 408 C 618 450 644 488 686 534 C 718 570 738 618 758 672';

export const WEST_AFRICA_LABELS: MapGeoLabel[] = [
  { text: 'Mali', x: 422, y: 174, kind: 'country' },
  { text: 'Tin Aicha', x: 238, y: 215, kind: 'city' },
  { text: 'Timbuktu', x: 304, y: 218, kind: 'city' },
  { text: 'Gourma\nRharous', x: 376, y: 204, kind: 'city' },
  { text: 'Bourem', x: 484, y: 200, kind: 'city' },
  { text: 'Gao', x: 505, y: 260, kind: 'city' },
  { text: 'Douentza', x: 312, y: 364, kind: 'city' },
  { text: 'Mopti', x: 226, y: 405, kind: 'city' },
  { text: 'Djenné', x: 198, y: 446, kind: 'city' },
  { text: 'Gorom-Gorom', x: 482, y: 404, kind: 'city' },
  { text: 'Djibo', x: 394, y: 432, kind: 'city' },
  { text: 'Dori', x: 504, y: 438, kind: 'city' },
  { text: 'Ouahigouya', x: 348, y: 472, kind: 'city' },
  { text: 'Nouna', x: 248, y: 540, kind: 'city' },
  { text: 'Kaya', x: 434, y: 512, kind: 'city' },
  { text: 'Burkina Faso', x: 402, y: 576, kind: 'country' },
  { text: 'Kombissiri', x: 416, y: 595, kind: 'city' },
  { text: 'Fada N\'Gourma', x: 528, y: 594, kind: 'city' },
  { text: 'Tenkodogo', x: 486, y: 616, kind: 'city' },
  { text: 'Manga', x: 434, y: 626, kind: 'city' },
  { text: 'Pô', x: 430, y: 666, kind: 'city' },
  { text: 'Leo', x: 368, y: 672, kind: 'city' },
  { text: 'Bobo-Dioulasso', x: 220, y: 666, kind: 'city' },
  { text: 'Banfora', x: 186, y: 704, kind: 'city' },
  { text: 'Houndé', x: 274, y: 636, kind: 'city' },
  { text: 'Boromo', x: 312, y: 618, kind: 'city' },
  { text: 'Dano', x: 302, y: 668, kind: 'city' },
  { text: 'Diébougou', x: 286, y: 682, kind: 'city' },
  { text: 'Bawku', x: 492, y: 676, kind: 'city' },
  { text: 'Bolgatanga', x: 454, y: 696, kind: 'city' },
  { text: 'Bankilaré', x: 554, y: 392, kind: 'city' },
  { text: 'Banibangou', x: 686, y: 356, kind: 'city' },
  { text: 'Abala', x: 738, y: 364, kind: 'city' },
  { text: 'Filingué', x: 726, y: 412, kind: 'city' },
  { text: 'Tahoua', x: 856, y: 372, kind: 'city' },
  { text: 'Illela', x: 856, y: 414, kind: 'city' },
  { text: 'Bouza', x: 916, y: 404, kind: 'city' },
  { text: 'Madaoua', x: 926, y: 438, kind: 'city' },
  { text: 'Balleyara', x: 706, y: 458, kind: 'city' },
  { text: 'Niamey', x: 648, y: 478, kind: 'city' },
  { text: 'Torodi', x: 626, y: 508, kind: 'city' },
  { text: 'Say', x: 668, y: 512, kind: 'city' },
  { text: 'Dosso', x: 722, y: 516, kind: 'city' },
  { text: 'Gusau', x: 954, y: 564, kind: 'city' },
];

export const TOPOLOGY_TREE_DATA: TopologyNodeData = {
  id: 'internet',
  name: 'Internet',
  kind: 'internet',
  productSlug: 'internet',
  status: 'disconnected',
  healthBucket: 'no-data',
  statusDotTone: 'no-data',
  network: 'All',
  showLinkAlertBadge: true,
  children: [
    {
      id: 'breakroom-gateway-1',
      name: 'BreakRoom_Gateway_1',
      kind: 'device',
      category: 'gateway',
      productSlug: 'eap221-lr-kit',
      status: 'connected',
      healthBucket: 'good',
      statusDotTone: 'good',
      ip: '192.168.254.100',
      mac: '00-14-78-00-00-00',
      model: 'ER701-5G-Outdoor v1.0',
      network: 'Default',
      linkDashed: true,
      children: [
        {
          id: 'mainoffice-gateway-2',
          name: 'MainOffice_Gateway_2',
          kind: 'device',
          category: 'gateway',
          productSlug: 'er8411',
          status: 'connected',
          healthBucket: 'good',
          statusDotTone: 'good',
          ip: '192.168.0.1',
          mac: '00-1D-0F-03-27-B7',
          model: 'ER7412-M2 v1.0',
          network: 'Default',
          collapsible: true,
          children: [
            {
              id: 'ctooffice-switch-1',
              name: 'CTOOffice_Switch_1',
              kind: 'device',
              category: 'switch',
              productSlug: 'sg2428p-un-5-40',
              status: 'connected',
              healthBucket: 'good',
              statusDotTone: 'good',
              ip: '192.168.0.101',
              mac: '0C-EF-15-EF-B9-10',
              model: 'SG3210 v3.20',
              network: 'Default',
              portLabel: '→ #1',
              speedLabel: '1000FDX',
            },
            {
              id: 'serverroom-switch-2',
              name: 'ServerRoom_Switch_2',
              kind: 'device',
              category: 'switch',
              productSlug: 'sg3452p-un-3-40',
              status: 'connected',
              healthBucket: 'poor',
              statusDotTone: 'poor',
              ip: '192.168.0.103',
              mac: '00-FF-00-1B-57-93',
              model: 'TL-SG2210MP v2.0',
              network: 'Default',
              portLabel: '→ #1',
              speedLabel: '1000FDX',
            },
            {
              id: 'salesdepartment-switch-3',
              name: 'SalesDepartment_Switch_3',
              kind: 'device',
              category: 'switch',
              productSlug: 'tl-sg3452x-un-1-0',
              status: 'connected',
              healthBucket: 'fair',
              statusDotTone: 'good',
              ip: '192.168.0.102',
              mac: '0C-EF-15-4E-90-95',
              model: 'SG2210MP v5.0',
              network: 'Default',
              portLabel: '→ #1',
              speedLabel: '1000FDX',
              collapsible: true,
              children: [
                {
                  id: 'coooffice-eap-1',
                  name: 'COOOffice_Eap_1',
                  kind: 'device',
                  category: 'ap',
                  productSlug: 'eap727-eu-1-0',
                  status: 'connected',
                  healthBucket: 'fair',
                  statusDotTone: 'good',
                  ip: '192.168.0.121',
                  mac: 'A8-29-48-D0-7B-10',
                  model: 'EAP773(EU) v1.0',
                  network: 'Default',
                  ssid: 'Corp-WiFi',
                  portLabel: '#2 ←',
                  speedLabel: '1000FDX',
                },
                {
                  id: 'breakroom-eap-2',
                  name: 'BreakRoom_Eap_2',
                  kind: 'device',
                  category: 'ap',
                  productSlug: 'eap668-outdoor-hd-un-1-2',
                  status: 'connected',
                  healthBucket: 'good',
                  statusDotTone: 'good',
                  ip: '192.168.0.122',
                  mac: '00-FF-00-38-95-10',
                  model: 'EAP668-Outdoor HD(EU) v1.0',
                  network: 'Default',
                  ssid: 'Guest-WiFi',
                  portLabel: '#3 ←',
                  speedLabel: '1000FDX',
                },
                {
                  id: 'storageroom-eap-3',
                  name: 'StorageRoom_Eap_3',
                  kind: 'device',
                  category: 'ap',
                  productSlug: 'eap650',
                  status: 'connected',
                  healthBucket: 'no-data',
                  statusDotTone: 'no-data',
                  ip: '192.168.0.123',
                  mac: '1C-61-B4-71-04-38',
                  model: 'EAP620 HD(US) v3.0[Custom]',
                  network: 'Default',
                  ssid: 'Corp-WiFi',
                  portLabel: '#4 ←',
                  speedLabel: '1000FDX',
                  collapsible: true,
                  children: [
                    {
                      id: 'client-starlight',
                      name: 'StarLight',
                      kind: 'client',
                      clientIcon: 'android-phone',
                      status: 'connected',
                      healthBucket: 'good',
                      statusDotTone: 'good',
                      ip: '192.168.0.151',
                      mac: '8C-9F-2A-11-4B-09',
                      network: 'Default',
                      ssid: 'Corp-WiFi',
                    },
                    {
                      id: 'client-neffos',
                      name: 'Neffos_X20_Pro',
                      kind: 'client',
                      clientIcon: 'android-phone',
                      status: 'connected',
                      healthBucket: 'fair',
                      statusDotTone: 'good',
                      ip: '192.168.0.152',
                      mac: 'F4-8B-32-77-9C-10',
                      network: 'Default',
                      ssid: 'Corp-WiFi',
                    },
                  ],
                },
              ],
            },
            {
              id: 'datacenter-olt-1',
              name: 'DataCenter_Olt_1',
              kind: 'device',
              category: 'olt',
              productSlug: 'nvr-3',
              status: 'connected',
              healthBucket: 'no-data',
              statusDotTone: 'no-data',
              ip: '192.168.0.200',
              mac: '00-FF-00-16-B6-3E',
              model: 'DS-P7001-08 1.0',
              network: 'Default',
            },
            {
              id: 'omada-controller',
              name: 'Omada Controller',
              kind: 'controller',
              productSlug: 'controller',
              status: 'connected',
              healthBucket: 'good',
              statusDotTone: 'good',
              ip: '192.168.0.10',
              mac: '50-91-E3-AA-10-01',
              model: 'Software Controller v6.3',
              network: 'Default',
            },
            {
              id: 'client-cc-28',
              name: 'CC-28-AA-75-E6-02',
              kind: 'client',
              clientIcon: 'other',
              status: 'pending',
              healthBucket: 'no-data',
              statusDotTone: 'no-data',
              ip: '192.168.0.190',
              mac: 'CC-28-AA-75-E6-02',
              network: 'Default',
            },
          ],
        },
      ],
    },
  ],
};

export const TOPOLOGY_HEALTH_SUMMARY = {
  total: 9,
  rows: [
    { key: 'good', label: 'Good', count: 4 },
    { key: 'fair', label: 'Fair', count: 2 },
    { key: 'poor', label: 'Poor', count: 1 },
    { key: 'no-data', label: 'No Data', count: 2 },
  ],
} as const;

export const TOPOLOGY_QUICK_CONFIG_TILES: QuickConfigTileItem[] = [
  {
    key: 'network-wizard',
    label: 'Network Wizard',
    icon: 'quick-action-vlan-wizard',
    description: 'Guided setup for site LAN/VLAN interfaces and DHCP pools.',
  },
  {
    key: 'wlan-optimization',
    label: 'WLAN Optimization',
    icon: 'quick-action-wlan-optimization',
    description: 'Auto-tune channel width and TX power across adopted APs.',
  },
  {
    key: 'wlan',
    label: 'WLAN',
    icon: 'quick-action-ssid',
    description: 'Manage wireless SSIDs, security profiles, and band steering.',
  },
  {
    key: 'extend-mode',
    label: 'Extend Mode',
    icon: 'quick-action-extend-mode',
    description: 'Configure long-range PoE extend mode on supported switch ports.',
  },
  {
    key: 'port-reboot',
    label: 'Port Reboot',
    icon: 'quick-action-poe-recovery',
    description: 'Power-cycle PoE ports or schedule automated PD recovery.',
  },
  {
    key: 'port-isolation',
    label: 'Port Isolation',
    icon: 'quick-action-port-isolation',
    description: 'Isolate switch downlink ports for guest and IoT segmentation.',
  },
  {
    key: 'intelli-recover',
    label: 'IntelliRecover',
    icon: 'quick-action-inteli-recover',
    routeKey: 'intelli-recover',
    description: 'Open IntelliRecover auto-remediation playbooks.',
  },
  {
    key: 'add-devices',
    label: 'Add Devices',
    icon: 'quick-action-add-devices',
    routeKey: 'devices',
    description: 'Adopt pending devices or add hardware by MAC / serial number.',
  },
];
