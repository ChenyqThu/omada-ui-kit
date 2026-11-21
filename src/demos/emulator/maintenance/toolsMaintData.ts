export type ToolDeviceType = 'EAP' | 'Switch' | 'Gateway';
export type NetworkCheckTestType = 'Ping' | 'Traceroute' | 'DNS Lookup';
export type DestinationTypeOption =
  | 'Domain/IP Address'
  | 'Gateway'
  | 'Controller';

export type NetworkToolsTabKey =
  | 'network-check'
  | 'packet-capture'
  | 'terminal'
  | 'cable-test'
  | 'interference-detection'
  | 'remote-access';

export interface ToolSourceDevice {
  key: string;
  name: string;
  deviceType: ToolDeviceType;
  model: string;
  ip: string;
  mac: string;
  firmware: string;
  uptime: string;
}

export interface PacketCaptureRow {
  key: string;
  no: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'ARP' | 'TLSv1.3';
  length: number;
  info: string;
}

export interface CableTestPortRow {
  key: string;
  port: string;
  linkStatus: '1000M Full' | '2.5G Full' | 'Link Down';
  pairA: 'Normal' | 'Open';
  pairB: 'Normal' | 'Open';
  pairC: 'Normal' | 'Open';
  pairD: 'Normal' | 'Open';
  lengthMeters: string;
  testedAt: string;
}

export interface InterferenceChannelRow {
  key: string;
  channel: string;
  band: '2.4 GHz' | '5 GHz' | '6 GHz';
  utilizationPct: number;
  interferencePct: number;
  noiseFloorDbm: number;
  recommended: boolean;
}

export interface RemoteTunnelSession {
  key: string;
  deviceName: string;
  protocol: 'SSH' | 'HTTPS';
  targetPort: number;
  tunnelUrl: string;
  expiresIn: string;
  status: 'Active' | 'Idle';
}

export const TOOL_SOURCE_DEVICES: ToolSourceDevice[] = [
  {
    key: 'coooffice-eap-1',
    name: 'COOOffice_Eap_1',
    deviceType: 'EAP',
    model: 'EAP773(EU) v1.0',
    ip: '192.168.0.121',
    mac: 'A8-29-48-D0-7B-10',
    firmware: '1.0.14 Build 20250602 Rel.44190',
    uptime: '23h 42m 01s',
  },
  {
    key: 'breakroom-eap-2',
    name: 'BreakRoom_Eap_2',
    deviceType: 'EAP',
    model: 'EAP668-Outdoor HD(EU) v1.0',
    ip: '192.168.0.122',
    mac: '00-FF-00-38-95-10',
    firmware: '1.0.2 Build 20250411 Rel.38210',
    uptime: '23h 41m 52s',
  },
  {
    key: 'storageroom-eap-3',
    name: 'StorageRoom_Eap_3',
    deviceType: 'EAP',
    model: 'EAP620 HD(US) v3.0[Custom]',
    ip: '192.168.0.123',
    mac: '00-FF-00-2B-0E-BC',
    firmware: '1.6.10 Build 20250404 Rel.31009',
    uptime: '23h 40m 15s',
  },
  {
    key: 'ctooffice-switch-1',
    name: 'CTOOffice_Switch_1',
    deviceType: 'Switch',
    model: 'SG3210 v3.20',
    ip: '192.168.0.101',
    mac: '0C-EF-15-EF-B9-10',
    firmware: '3.20.11 Build 20250528 Rel.61024',
    uptime: '18d 04h 51m 12s',
  },
  {
    key: 'salesdepartment-switch-3',
    name: 'SalesDepartment_Switch_3',
    deviceType: 'Switch',
    model: 'SG2210MP v5.0',
    ip: '192.168.0.102',
    mac: '0C-EF-15-4E-90-95',
    firmware: '5.0.8 Build 20250701 Rel.58920',
    uptime: '23h 42m 17s',
  },
  {
    key: 'serverroom-switch-2',
    name: 'ServerRoom_Switch_2',
    deviceType: 'Switch',
    model: 'TL-SG2210MP v2.0',
    ip: '192.168.0.103',
    mac: '00-FF-00-1B-57-93',
    firmware: '2.0.16 Build 20250512 Rel.40812',
    uptime: '5d 14h 09m 33s',
  },
  {
    key: 'mainoffice-gateway-2',
    name: 'MainOffice_Gateway_2',
    deviceType: 'Gateway',
    model: 'ER7412-M2 v1.0',
    ip: '192.168.0.1',
    mac: '00-1D-0F-03-27-B7',
    firmware: '1.0.1 Build 20250618 Rel.51204',
    uptime: '12d 06h 18m 44s',
  },
  {
    key: 'breakroom-gateway-1',
    name: 'BreakRoom_Gateway_1',
    deviceType: 'Gateway',
    model: 'ER701-5G-Outdoor v1.0',
    ip: '192.168.254.100',
    mac: '00-14-78-00-00-00',
    firmware: '1.0.0 Build 20250320 Rel.29401',
    uptime: '8d 19h 11m 05s',
  },
];

export const INITIAL_PACKET_CAPTURES: PacketCaptureRow[] = [
  {
    key: 'pkt-1',
    no: 1,
    time: '0.000000',
    source: '192.168.0.121',
    destination: '192.168.0.10',
    protocol: 'TCP',
    length: 74,
    info: '54812 -> 29814 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
  },
  {
    key: 'pkt-2',
    no: 2,
    time: '0.001420',
    source: '192.168.0.10',
    destination: '192.168.0.121',
    protocol: 'TLSv1.3',
    length: 198,
    info: 'Application Data (Omada Heartbeat Inform Ack)',
  },
  {
    key: 'pkt-3',
    no: 3,
    time: '0.014810',
    source: '192.168.0.156',
    destination: '8.8.8.8',
    protocol: 'DNS',
    length: 84,
    info: 'Standard query 0x4b12 A portal.tplink.net',
  },
  {
    key: 'pkt-4',
    no: 4,
    time: '0.028900',
    source: '8.8.8.8',
    destination: '192.168.0.156',
    protocol: 'DNS',
    length: 116,
    info: 'Standard query response 0x4b12 A 18.143.92.14',
  },
  {
    key: 'pkt-5',
    no: 5,
    time: '0.042310',
    source: '192.168.0.1',
    destination: '192.168.0.102',
    protocol: 'ICMP',
    length: 98,
    info: 'Echo (ping) request id=0x0a11, seq=1/256, ttl=64',
  },
];

export const INITIAL_CABLE_TEST_ROWS: CableTestPortRow[] = [
  {
    key: 'ct-1',
    port: 'Port1 (Uplink)',
    linkStatus: '1000M Full',
    pairA: 'Normal',
    pairB: 'Normal',
    pairC: 'Normal',
    pairD: 'Normal',
    lengthMeters: '18 m',
    testedAt: '2026-11-21 11:32:10',
  },
  {
    key: 'ct-2',
    port: 'Port2 (PoE+)',
    linkStatus: '1000M Full',
    pairA: 'Normal',
    pairB: 'Normal',
    pairC: 'Normal',
    pairD: 'Normal',
    lengthMeters: '26 m',
    testedAt: '2026-11-21 11:32:10',
  },
  {
    key: 'ct-3',
    port: 'Port3 (PoE+)',
    linkStatus: '1000M Full',
    pairA: 'Normal',
    pairB: 'Normal',
    pairC: 'Normal',
    pairD: 'Normal',
    lengthMeters: '41 m',
    testedAt: '2026-11-21 11:32:10',
  },
  {
    key: 'ct-4',
    port: 'Port5',
    linkStatus: 'Link Down',
    pairA: 'Open',
    pairB: 'Open',
    pairC: 'Open',
    pairD: 'Open',
    lengthMeters: '0 m',
    testedAt: '2026-11-21 11:32:10',
  },
];

export const INITIAL_INTERFERENCE_ROWS: InterferenceChannelRow[] = [
  {
    key: 'ch-1',
    channel: 'Ch 1 (2412 MHz)',
    band: '2.4 GHz',
    utilizationPct: 48,
    interferencePct: 19,
    noiseFloorDbm: -88,
    recommended: false,
  },
  {
    key: 'ch-6',
    channel: 'Ch 6 (2437 MHz)',
    band: '2.4 GHz',
    utilizationPct: 24,
    interferencePct: 6,
    noiseFloorDbm: -94,
    recommended: true,
  },
  {
    key: 'ch-11',
    channel: 'Ch 11 (2462 MHz)',
    band: '2.4 GHz',
    utilizationPct: 63,
    interferencePct: 31,
    noiseFloorDbm: -83,
    recommended: false,
  },
  {
    key: 'ch-36',
    channel: 'Ch 36 (5180 MHz)',
    band: '5 GHz',
    utilizationPct: 18,
    interferencePct: 3,
    noiseFloorDbm: -96,
    recommended: true,
  },
  {
    key: 'ch-149',
    channel: 'Ch 149 (5745 MHz)',
    band: '5 GHz',
    utilizationPct: 29,
    interferencePct: 8,
    noiseFloorDbm: -92,
    recommended: false,
  },
];

export const INITIAL_REMOTE_TUNNELS: RemoteTunnelSession[] = [
  {
    key: 'tun-1',
    deviceName: 'MainOffice_Gateway_2',
    protocol: 'HTTPS',
    targetPort: 443,
    tunnelUrl: 'https://aps1-tunnel.omada.tplinkcloud.com/s/er7412-m2-8f2a',
    expiresIn: '59m',
    status: 'Active',
  },
];

export const SAMPLE_RESTORE_FILENAME = 'headquarters_main_office_v6.3.cfg';

export function buildNetworkCheckOutput(params: {
  device: ToolSourceDevice;
  testType: NetworkCheckTestType;
  destination: string;
  packetSize: number;
  count: number;
}): string[] {
  const { device, testType, destination, packetSize, count } = params;
  const target = destination.trim() || '8.8.8.8';
  const resolvedIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(target)
    ? target
    : target === '192.168.0.1'
      ? '192.168.0.1'
      : '172.64.155.14';

  if (testType === 'Traceroute') {
    return [
      `${device.name}# traceroute ${target}`,
      `traceroute to ${target} (${resolvedIp}), 30 hops max, 60 byte packets`,
      ` 1  MainOffice_Gateway_2 (192.168.0.1)  0.842 ms  0.715 ms  0.691 ms`,
      ` 2  10.214.0.1 (10.214.0.1)  3.412 ms  3.285 ms  3.194 ms`,
      ` 3  isp-core-gw01.net (203.118.42.1)  7.921 ms  7.604 ms  7.744 ms`,
      ` 4  ${target} (${resolvedIp})  12.418 ms  12.190 ms  12.304 ms`,
      `--- traceroute completed (4 hops) ---`,
    ];
  }

  if (testType === 'DNS Lookup') {
    return [
      `${device.name}# nslookup ${target}`,
      `Server:    192.168.0.1`,
      `Address:   192.168.0.1#53`,
      ``,
      `Non-authoritative answer:`,
      `Name:      ${target}`,
      `Address:   ${resolvedIp}`,
      `--- DNS lookup completed in 9 ms ---`,
    ];
  }

  const safeCount = Math.min(Math.max(Number.isFinite(count) ? count : 4, 1), 10);
  const safePacketSize = Math.min(
    Math.max(Number.isFinite(packetSize) ? packetSize : 32, 10),
    2000,
  );
  const replyBytes = safePacketSize + 8;
  const lines: string[] = [
    `${device.name}# ping -s ${safePacketSize} -c ${safeCount} ${target}`,
    `PING ${target} (${resolvedIp}) ${safePacketSize}(${safePacketSize + 28}) bytes of data.`,
  ];

  const sampleTimes: number[] = [];
  for (let i = 1; i <= safeCount; i++) {
    const rtt = Number((11.2 + ((i * 1.37) % 3.8)).toFixed(2));
    sampleTimes.push(rtt);
    lines.push(
      `${replyBytes} bytes from ${resolvedIp}: icmp_seq=${i} ttl=57 time=${rtt} ms`,
    );
  }

  const min = Math.min(...sampleTimes).toFixed(2);
  const max = Math.max(...sampleTimes).toFixed(2);
  const avg = (
    sampleTimes.reduce((acc, v) => acc + v, 0) / sampleTimes.length
  ).toFixed(2);

  lines.push(`--- ${target} ping statistics ---`);
  lines.push(
    `${safeCount} packets transmitted, ${safeCount} packets received, 0.0% packet loss`,
  );
  lines.push(`rtt min/avg/max/mdev = ${min}/${avg}/${max}/0.84 ms`);

  return lines;
}

export function buildTerminalBanner(device: ToolSourceDevice): string[] {
  return [
    `Establishing secure Omada remote control session to ${device.name} (${device.ip})...`,
    `Connected: ${device.model} | MAC ${device.mac} | Firmware ${device.firmware}`,
    `Type "help" to list supported diagnostic commands.`,
  ];
}

export function evaluateTerminalCommand(
  device: ToolSourceDevice,
  rawCommand: string,
): { lines: string[]; clear?: boolean; exit?: boolean } {
  const cmd = rawCommand.trim();
  const lower = cmd.toLowerCase();

  if (lower === 'clear') {
    return { lines: [], clear: true };
  }

  if (lower === 'exit' || lower === 'quit') {
    return {
      lines: [
        `${device.name}# ${cmd}`,
        `Session closed by administrator.`,
      ],
      exit: true,
    };
  }

  if (lower === 'help' || lower === '?') {
    return {
      lines: [
        `${device.name}# ${cmd}`,
        `Supported commands:`,
        `  show version       Display hardware model and firmware build`,
        `  show ip            Display management IP, MAC, and controller inform IP`,
        `  show interfaces    Display active uplink & radio/port summary`,
        `  uptime             Display device uptime and load`,
        `  ping <host>        Run 4-packet ICMP echo test`,
        `  clear              Clear terminal output buffer`,
        `  exit               Close remote terminal session`,
      ],
    };
  }

  if (lower === 'show version') {
    return {
      lines: [
        `${device.name}# ${cmd}`,
        `Device Name : ${device.name}`,
        `Model       : ${device.model}`,
        `Firmware    : ${device.firmware}`,
        `Controller  : 192.168.0.10 (Omada v6.3.0.34)`,
      ],
    };
  }

  if (lower === 'show ip' || lower === 'ifconfig') {
    return {
      lines: [
        `${device.name}# ${cmd}`,
        `br0       Link encap:Ethernet  HWaddr ${device.mac}`,
        `          inet addr:${device.ip}  Bcast:192.168.0.255  Mask:255.255.255.0`,
        `          UP BROADCAST RUNNING MULTICAST  MTU:1500`,
      ],
    };
  }

  if (lower === 'show interfaces' || lower === 'iwconfig') {
    return {
      lines: [
        `${device.name}# ${cmd}`,
        device.deviceType === 'EAP'
          ? `eth0: 2500Mb/s Full | ath0 (2.4G): Ch 6 | ath1 (5G): Ch 36 | ath2 (6G): Ch 37`
          : device.deviceType === 'Switch'
            ? `Gi1/0/1: Link UP 1000FDX (Uplink -> MainOffice_Gateway_2) | PoE Budget: 32.8W / 150W`
            : `WAN1: Link UP 2500FDX (DHCP 203.118.42.19) | LAN1: 192.168.0.1/24`,
      ],
    };
  }

  if (lower === 'uptime') {
    return {
      lines: [
        `${device.name}# ${cmd}`,
        `up ${device.uptime},  load average: 0.14, 0.11, 0.08`,
      ],
    };
  }

  if (lower.startsWith('ping ')) {
    const target = cmd.slice(5).trim() || '192.168.0.1';
    return {
      lines: buildNetworkCheckOutput({
        device,
        testType: 'Ping',
        destination: target,
        packetSize: 32,
        count: 4,
      }),
    };
  }

  return {
    lines: [
      `${device.name}# ${cmd}`,
      `Executed "${cmd}" on ${device.name} (${device.ip}) [OK].`,
    ],
  };
}
