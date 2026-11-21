import React, { useMemo, useState } from 'react';
import { Progress, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Copy, Info, Play, Square } from 'lucide-react';
import {
  SButton,
  SIcon,
  SInput,
  SSelect,
  SSwitch,
  STag,
  useOmadaNotification,
} from '@/omada';
import {
  STerminalConsole,
  type STerminalSessionItem,
} from '../../../omada/components/STerminalConsole';
import {
  INITIAL_CABLE_TEST_ROWS,
  INITIAL_INTERFERENCE_ROWS,
  INITIAL_PACKET_CAPTURES,
  INITIAL_REMOTE_TUNNELS,
  TOOL_SOURCE_DEVICES,
  buildNetworkCheckOutput,
  buildTerminalBanner,
  evaluateTerminalCommand,
  type CableTestPortRow,
  type DestinationTypeOption,
  type InterferenceChannelRow,
  type NetworkCheckTestType,
  type NetworkToolsTabKey,
  type PacketCaptureRow,
  type RemoteTunnelSession,
  type ToolDeviceType,
} from './toolsMaintData';

export interface NetworkToolsPageProps {
  /** Optional initial active tab override (defaults to `'network-check'`). */
  initialTab?: NetworkToolsTabKey;
}

const TOOL_TABS: Array<{
  key: NetworkToolsTabKey;
  label: string;
  beta?: boolean;
}> = [
  { key: 'network-check', label: 'Network Check' },
  { key: 'packet-capture', label: 'Packet Capture' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'cable-test', label: 'Cable Test' },
  { key: 'interference-detection', label: 'Interference Detection' },
  { key: 'remote-access', label: 'Remote Access', beta: true },
];

const DEVICE_TYPE_OPTIONS = [
  { label: 'EAP', value: 'EAP' },
  { label: 'Switch', value: 'Switch' },
  { label: 'Gateway', value: 'Gateway' },
];

const TEST_TYPE_OPTIONS = [
  { label: 'Ping', value: 'Ping' },
  { label: 'Traceroute', value: 'Traceroute' },
  { label: 'DNS Lookup', value: 'DNS Lookup' },
];

const DESTINATION_TYPE_OPTIONS = [
  { label: 'Domain/IP Address', value: 'Domain/IP Address' },
  { label: 'Gateway', value: 'Gateway' },
  { label: 'Controller', value: 'Controller' },
];

/**
 * Omada Controller v6.3.0.34 Network Tools Workspace (`#/network-tools`).
 * Features underline navigation across Network Check (default), Packet Capture,
 * Terminal, Cable Test, Interference Detection, and Remote Access (BETA).
 */
export const NetworkToolsPage: React.FC<NetworkToolsPageProps> = ({
  initialTab = 'network-check',
}) => {
  const notification = useOmadaNotification();
  const [activeTab, setActiveTab] = useState<NetworkToolsTabKey>(initialTab);

  // Network Check state
  const [checkDeviceType, setCheckDeviceType] = useState<ToolDeviceType>('EAP');
  const [checkTestType, setCheckTestType] = useState<NetworkCheckTestType>('Ping');
  const [checkSourceKey, setCheckSourceKey] = useState<string | undefined>(undefined);
  const [destinationType, setDestinationType] =
    useState<DestinationTypeOption>('Domain/IP Address');
  const [destinationInput, setDestinationInput] = useState<string>('');
  const [packetSize, setPacketSize] = useState<string>('32');
  const [pingCount, setPingCount] = useState<string>('4');
  const [maxHop, setMaxHop] = useState<string>('30');
  const [dnsServer, setDnsServer] = useState<string>('8.8.8.8');
  const [timeoutSec, setTimeoutSec] = useState<string>('5');
  const [outputSessions, setOutputSessions] = useState<STerminalSessionItem[]>([]);
  const [activeOutputKey, setActiveOutputKey] = useState<string | null>(null);

  // Terminal state
  const [termDeviceType, setTermDeviceType] = useState<ToolDeviceType>('EAP');
  const [termSourceKey, setTermSourceKey] = useState<string | undefined>(undefined);
  const [terminalSessions, setTerminalSessions] = useState<STerminalSessionItem[]>([]);
  const [activeTerminalKey, setActiveTerminalKey] = useState<string | null>(null);

  // Packet Capture state
  const [captureDeviceKey, setCaptureDeviceKey] = useState<string>('mainoffice-gateway-2');
  const [captureIface, setCaptureIface] = useState<string>('WAN/LAN1');
  const [captureFilter, setCaptureFilter] = useState<string>('port 80 or port 443');
  const [captureCount, setCaptureCount] = useState<string>('1000');
  const [captureRunning, setCaptureRunning] = useState<boolean>(false);
  const [capturedRows, setCapturedRows] = useState<PacketCaptureRow[]>(
    INITIAL_PACKET_CAPTURES,
  );

  // Cable Test state
  const [cableSwitchKey, setCableSwitchKey] = useState<string>('salesdepartment-switch-3');
  const [cablePortSelection, setCablePortSelection] = useState<string>('All Ports');
  const [cableRows, setCableRows] = useState<CableTestPortRow[]>(INITIAL_CABLE_TEST_ROWS);

  // Interference Detection state
  const [interferenceApKey, setInterferenceApKey] = useState<string>('coooffice-eap-1');
  const [interferenceBand, setInterferenceBand] = useState<'2.4 GHz' | '5 GHz' | '6 GHz'>(
    '2.4 GHz',
  );
  const [interferenceRows, setInterferenceRows] = useState<InterferenceChannelRow[]>(
    INITIAL_INTERFERENCE_ROWS,
  );

  // Remote Access (BETA) state
  const [remoteAccessEnabled, setRemoteAccessEnabled] = useState<boolean>(true);
  const [remoteDeviceKey, setRemoteDeviceKey] = useState<string>('mainoffice-gateway-2');
  const [remoteProtocol, setRemoteProtocol] = useState<'SSH' | 'HTTPS'>('SSH');
  const [remotePort, setRemotePort] = useState<string>('22');
  const [remoteTunnels, setRemoteTunnels] = useState<RemoteTunnelSession[]>(
    INITIAL_REMOTE_TUNNELS,
  );

  const checkSourceOptions = useMemo(
    () =>
      TOOL_SOURCE_DEVICES.filter((d) => d.deviceType === checkDeviceType).map((d) => ({
        label: d.name,
        value: d.key,
        description: `${d.model} · ${d.ip}`,
      })),
    [checkDeviceType],
  );

  const termSourceOptions = useMemo(
    () =>
      TOOL_SOURCE_DEVICES.filter((d) => d.deviceType === termDeviceType).map((d) => ({
        label: d.name,
        value: d.key,
        description: `${d.model} · ${d.ip}`,
      })),
    [termDeviceType],
  );

  const handleDestinationTypeChange = (nextType: DestinationTypeOption) => {
    setDestinationType(nextType);
    if (nextType === 'Gateway') {
      setDestinationInput('192.168.0.1');
    } else if (nextType === 'Controller') {
      setDestinationInput('192.168.0.10');
    }
  };

  const handleRunNetworkCheck = () => {
    const matchingDevices = TOOL_SOURCE_DEVICES.filter(
      (d) => d.deviceType === checkDeviceType,
    );
    const targetDevice =
      matchingDevices.find((d) => d.key === checkSourceKey) ??
      matchingDevices[0] ??
      TOOL_SOURCE_DEVICES[0];

    if (!targetDevice) return;

    if (!checkSourceKey) {
      setCheckSourceKey(targetDevice.key);
    }

    const effectiveDest =
      destinationInput.trim() ||
      (destinationType === 'Controller'
        ? '192.168.0.10'
        : destinationType === 'Gateway'
          ? '192.168.0.1'
          : '8.8.8.8');

    const lines = buildNetworkCheckOutput({
      device: targetDevice,
      testType: checkTestType,
      destination: effectiveDest,
      packetSize: Number.parseInt(packetSize, 10) || 32,
      count: Number.parseInt(pingCount, 10) || 4,
    });

    setOutputSessions((prev) => {
      const existing = prev.find((item) => item.key === targetDevice.key);
      if (existing) {
        return prev.map((item) =>
          item.key === targetDevice.key
            ? {
                ...item,
                status: 'completed',
                lines: [...item.lines, '', ...lines],
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          key: targetDevice.key,
          deviceName: targetDevice.name,
          subtitle: `${targetDevice.model} · ${targetDevice.ip}`,
          status: 'completed',
          lines,
        },
      ];
    });
    setActiveOutputKey(targetDevice.key);
  };

  const handleOpenTerminal = () => {
    const matchingDevices = TOOL_SOURCE_DEVICES.filter(
      (d) => d.deviceType === termDeviceType,
    );
    const targetDevice =
      matchingDevices.find((d) => d.key === termSourceKey) ??
      matchingDevices[0] ??
      TOOL_SOURCE_DEVICES[0];

    if (!targetDevice) return;

    if (!termSourceKey) {
      setTermSourceKey(targetDevice.key);
    }

    setTerminalSessions((prev) => {
      const existing = prev.find((item) => item.key === targetDevice.key);
      if (existing) {
        return prev.map((item) =>
          item.key === targetDevice.key ? { ...item, status: 'active' } : item,
        );
      }
      return [
        ...prev,
        {
          key: targetDevice.key,
          deviceName: targetDevice.name,
          subtitle: `${targetDevice.model} · ${targetDevice.ip}`,
          status: 'active',
          prompt: `${targetDevice.name}#`,
          lines: buildTerminalBanner(targetDevice),
        },
      ];
    });
    setActiveTerminalKey(targetDevice.key);
  };

  const handleSubmitTerminalCommand = (sessionKey: string, command: string) => {
    const targetDevice =
      TOOL_SOURCE_DEVICES.find((d) => d.key === sessionKey) ?? TOOL_SOURCE_DEVICES[0];
    if (!targetDevice) return;

    const result = evaluateTerminalCommand(targetDevice, command);
    setTerminalSessions((prev) =>
      prev.map((session) => {
        if (session.key !== sessionKey) return session;
        if (result.clear) {
          return { ...session, lines: [] };
        }
        return {
          ...session,
          status: result.exit ? 'closed' : 'active',
          lines: [...session.lines, ...result.lines],
        };
      }),
    );
  };

  const handleCloseTerminalSession = (sessionKey: string) => {
    setTerminalSessions((prev) => prev.filter((item) => item.key !== sessionKey));
    if (activeTerminalKey === sessionKey) {
      setActiveTerminalKey(null);
    }
  };

  const handleToggleCapture = () => {
    if (captureRunning) {
      setCaptureRunning(false);
      notification.info({
        title: 'Packet Capture Stopped',
        description: `Captured ${capturedRows.length} packets on ${captureIface}.`,
      });
      return;
    }
    setCaptureRunning(true);
    const newRow: PacketCaptureRow = {
      key: `pkt-${Date.now()}`,
      no: capturedRows.length + 1,
      time: `0.0${capturedRows.length + 1}420`,
      source: '192.168.0.102',
      destination: '192.168.0.1',
      protocol: 'TCP',
      length: 142,
      info: `${captureFilter || 'any'} [PSH, ACK] Seq=12 Ack=1 Win=65535`,
    };
    setCapturedRows((prev) => [...prev, newRow]);
    notification.success({
      title: 'Packet Capture Started',
      description: `Listening on ${captureIface} (max ${captureCount} packets).`,
    });
  };

  const handleRunCableTest = () => {
    const sw =
      TOOL_SOURCE_DEVICES.find((d) => d.key === cableSwitchKey) ??
      TOOL_SOURCE_DEVICES[3];
    const timestamp = '2026-11-21 11:48:00';
    setCableRows((prev) =>
      prev.map((row) => ({
        ...row,
        testedAt: timestamp,
      })),
    );
    notification.success({
      title: 'Cable Test Completed',
      description: `Verified ${cablePortSelection} on ${sw?.name ?? 'Switch'}.`,
    });
  };

  const handleRunInterferenceScan = () => {
    const ap =
      TOOL_SOURCE_DEVICES.find((d) => d.key === interferenceApKey) ??
      TOOL_SOURCE_DEVICES[0];
    setInterferenceRows((prev) =>
      prev.map((row, idx) => ({
        ...row,
        utilizationPct: Math.max(8, Math.min(85, row.utilizationPct + (idx % 2 === 0 ? -3 : 2))),
      })),
    );
    notification.success({
      title: 'Interference Scan Completed',
      description: `Updated ${interferenceBand} RF spectrum metrics for ${ap?.name ?? 'AP'}.`,
    });
  };

  const handleCreateTunnel = () => {
    const target =
      TOOL_SOURCE_DEVICES.find((d) => d.key === remoteDeviceKey) ??
      TOOL_SOURCE_DEVICES[0];
    if (!target) return;
    const suffix = Math.random().toString(16).slice(2, 6);
    const created: RemoteTunnelSession = {
      key: `tun-${Date.now()}`,
      deviceName: target.name,
      protocol: remoteProtocol,
      targetPort: Number.parseInt(remotePort, 10) || (remoteProtocol === 'SSH' ? 22 : 443),
      tunnelUrl: `https://aps1-tunnel.omada.tplinkcloud.com/s/${target.key}-${suffix}`,
      expiresIn: '60m',
      status: 'Active',
    };
    setRemoteTunnels((prev) => [created, ...prev]);
    notification.success({
      title: 'Remote Access Tunnel Ready',
      description: `Created ${remoteProtocol} tunnel for ${target.name}.`,
    });
  };

  const packetColumns: ColumnsType<PacketCaptureRow> = [
    { title: 'No.', dataIndex: 'no', key: 'no', width: 64 },
    { title: 'Time (s)', dataIndex: 'time', key: 'time', width: 100 },
    { title: 'Source', dataIndex: 'source', key: 'source', width: 136 },
    { title: 'Destination', dataIndex: 'destination', key: 'destination', width: 136 },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 96,
      render: (proto: string) => <STag color="blue">{proto}</STag>,
    },
    { title: 'Length', dataIndex: 'length', key: 'length', width: 84 },
    { title: 'Info', dataIndex: 'info', key: 'info' },
  ];

  const cableColumns: ColumnsType<CableTestPortRow> = [
    { title: 'Port', dataIndex: 'port', key: 'port', width: 150 },
    {
      title: 'Link Status',
      dataIndex: 'linkStatus',
      key: 'linkStatus',
      width: 130,
      render: (status: CableTestPortRow['linkStatus']) => (
        <STag color={status === 'Link Down' ? 'grey' : 'green'}>{status}</STag>
      ),
    },
    { title: 'Pair A', dataIndex: 'pairA', key: 'pairA', width: 96 },
    { title: 'Pair B', dataIndex: 'pairB', key: 'pairB', width: 96 },
    { title: 'Pair C', dataIndex: 'pairC', key: 'pairC', width: 96 },
    { title: 'Pair D', dataIndex: 'pairD', key: 'pairD', width: 96 },
    { title: 'Cable Length', dataIndex: 'lengthMeters', key: 'lengthMeters', width: 120 },
    { title: 'Last Tested', dataIndex: 'testedAt', key: 'testedAt' },
  ];

  const interferenceColumns: ColumnsType<InterferenceChannelRow> = [
    { title: 'Channel', dataIndex: 'channel', key: 'channel', width: 180 },
    { title: 'Band', dataIndex: 'band', key: 'band', width: 100 },
    {
      title: 'Channel Utilization',
      dataIndex: 'utilizationPct',
      key: 'utilizationPct',
      width: 220,
      render: (pct: number) => (
        <Progress
          percent={pct}
          size="small"
          strokeColor={pct > 55 ? 'var(--omada-color-warning)' : 'var(--omada-brand)'}
        />
      ),
    },
    {
      title: 'Interference',
      dataIndex: 'interferencePct',
      key: 'interferencePct',
      width: 120,
      render: (pct: number) => `${pct}%`,
    },
    {
      title: 'Noise Floor',
      dataIndex: 'noiseFloorDbm',
      key: 'noiseFloorDbm',
      width: 120,
      render: (dbm: number) => `${dbm} dBm`,
    },
    {
      title: 'Recommendation',
      dataIndex: 'recommended',
      key: 'recommended',
      render: (rec: boolean) =>
        rec ? <STag color="green">Optimal</STag> : <STag color="grey">Normal</STag>,
    },
  ];

  const tunnelColumns: ColumnsType<RemoteTunnelSession> = [
    { title: 'Device', dataIndex: 'deviceName', key: 'deviceName', width: 180 },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 100,
      render: (proto: string) => <STag color="blue">{proto}</STag>,
    },
    { title: 'Port', dataIndex: 'targetPort', key: 'targetPort', width: 80 },
    {
      title: 'Tunnel URL',
      dataIndex: 'tunnelUrl',
      key: 'tunnelUrl',
      render: (url: string) => (
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[12px] text-[var(--omada-link)]">
            {url}
          </span>
          <button
            type="button"
            aria-label={`Copy tunnel URL ${url}`}
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                void navigator.clipboard.writeText(url);
              }
              notification.success({
                title: 'Tunnel URL Copied',
                description: url,
              });
            }}
            className="omada-tools-inline-icon-btn"
          >
            <Copy size={13} />
          </button>
        </div>
      ),
    },
    { title: 'Expires In', dataIndex: 'expiresIn', key: 'expiresIn', width: 100 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (st: string) => <STag color="green">{st}</STag>,
    },
  ];

  return (
    <div
      className="omada-tools-maint-page px-6 pt-4 pb-8"
      data-testid="network-tools-page"
    >
      {/* Top Underline Sub-Tabs */}
      <div className="border-b border-[var(--omada-border-divider)] pr-9">
        <div
          role="tablist"
          aria-label="Network Tools views"
          className="flex flex-wrap items-center gap-7"
        >
          {TOOL_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`omada-tools-subtab-btn inline-flex cursor-pointer items-center gap-1.5 text-[18px] leading-[26px] ${
                  isActive ? 'is-active font-medium' : 'font-normal'
                }`}
              >
                <span>{tab.label}</span>
                {tab.beta && <span className="omada-emu-beta-tag">BETA</span>}
                {isActive && (
                  <span className="omada-tools-subtab-indicator absolute inset-x-0 -bottom-[1px] h-[2px]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Network Check (Default) */}
      {activeTab === 'network-check' && (
        <div className="pt-5" data-testid="network-check-tab">
          <h2 className="m-0 mb-5 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
            Network Check
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="nc-device-type"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Device Type
              </label>
              <SSelect
                id="nc-device-type"
                aria-label="Device Type"
                value={checkDeviceType}
                options={DEVICE_TYPE_OPTIONS}
                onChange={(val) => {
                  setCheckDeviceType(val as ToolDeviceType);
                  setCheckSourceKey(undefined);
                }}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="nc-test-type"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Test
              </label>
              <SSelect
                id="nc-test-type"
                aria-label="Test"
                value={checkTestType}
                options={TEST_TYPE_OPTIONS}
                onChange={(val) => setCheckTestType(val as NetworkCheckTestType)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="nc-sources"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Sources
              </label>
              <SSelect
                id="nc-sources"
                aria-label="Sources"
                allowClear
                placeholder="Please Select..."
                value={checkSourceKey}
                options={checkSourceOptions}
                onChange={(val) => setCheckSourceKey(val as string | undefined)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="nc-destination-type"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Destination Type
              </label>
              <SSelect
                id="nc-destination-type"
                aria-label="Destination Type"
                value={destinationType}
                options={DESTINATION_TYPE_OPTIONS}
                onChange={(val) =>
                  handleDestinationTypeChange(val as DestinationTypeOption)
                }
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="nc-destination-input"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Domain/IP Address
              </label>
              <SInput
                id="nc-destination-input"
                aria-label="Domain/IP Address"
                variant="filled"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="w-[350px]"
              />
            </div>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <h2 className="m-0 mb-5 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
            Advanced Test Settings
          </h2>

          {checkTestType === 'Ping' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-y-2">
                <label
                  htmlFor="nc-packet-size"
                  className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
                >
                  Packet Size
                </label>
                <div className="flex items-center gap-3">
                  <SInput
                    id="nc-packet-size"
                    aria-label="Packet Size"
                    variant="filled"
                    value={packetSize}
                    onChange={(e) => setPacketSize(e.target.value)}
                    className="w-[350px] shrink-0"
                  />
                  <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                    (10-2000)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-2">
                <label
                  htmlFor="nc-count"
                  className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
                >
                  Count
                </label>
                <div className="flex items-center gap-3">
                  <SInput
                    id="nc-count"
                    aria-label="Count"
                    variant="filled"
                    value={pingCount}
                    onChange={(e) => setPingCount(e.target.value)}
                    className="w-[350px] shrink-0"
                  />
                  <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                    (1-100)
                  </span>
                </div>
              </div>
            </div>
          )}

          {checkTestType === 'Traceroute' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-y-2">
                <label
                  htmlFor="nc-max-hop"
                  className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
                >
                  Max Hop
                </label>
                <div className="flex items-center gap-3">
                  <SInput
                    id="nc-max-hop"
                    aria-label="Max Hop"
                    variant="filled"
                    value={maxHop}
                    onChange={(e) => setMaxHop(e.target.value)}
                    className="w-[350px]"
                  />
                  <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                    (1-64)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-2">
                <label
                  htmlFor="nc-trace-timeout"
                  className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
                >
                  Timeout
                </label>
                <div className="flex items-center gap-3">
                  <SInput
                    id="nc-trace-timeout"
                    aria-label="Timeout"
                    variant="filled"
                    value={timeoutSec}
                    onChange={(e) => setTimeoutSec(e.target.value)}
                    className="w-[350px]"
                  />
                  <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                    Seconds (1-10)
                  </span>
                </div>
              </div>
            </div>
          )}

          {checkTestType === 'DNS Lookup' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-y-2">
                <label
                  htmlFor="nc-dns-server"
                  className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
                >
                  DNS Server
                </label>
                <div className="flex items-center gap-3">
                  <SInput
                    id="nc-dns-server"
                    aria-label="DNS Server"
                    variant="filled"
                    value={dnsServer}
                    onChange={(e) => setDnsServer(e.target.value)}
                    className="w-[350px]"
                  />
                  <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                    (Optional)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-2">
                <label
                  htmlFor="nc-dns-timeout"
                  className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
                >
                  Timeout
                </label>
                <div className="flex items-center gap-3">
                  <SInput
                    id="nc-dns-timeout"
                    aria-label="Timeout"
                    variant="filled"
                    value={timeoutSec}
                    onChange={(e) => setTimeoutSec(e.target.value)}
                    className="w-[350px]"
                  />
                  <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                    Seconds (1-10)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Soft Blue Info Banner */}
          <div
            role="note"
            className="omada-tools-info-banner mt-5 flex items-center gap-2.5 rounded-[6px] px-4 py-2.5"
          >
            <Info size={16} className="omada-tools-info-icon shrink-0" />
            <span className="text-[13px] leading-5">
              Devices which are already running commands shall not execute newly added commands.
              Output history of device with buffer space issues shall be automatically cleared.
            </span>
          </div>

          <div className="mt-5">
            <SButton variant="primary" onClick={handleRunNetworkCheck}>
              Run
            </SButton>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <STerminalConsole
            title="Device Output"
            searchPlaceholder="Search Device Output"
            sessions={outputSessions}
            activeKey={activeOutputKey}
            onSelectSession={setActiveOutputKey}
            onClear={() => {
              setOutputSessions([]);
              setActiveOutputKey(null);
            }}
            minHeight={260}
            data-testid="network-check-console"
          />
        </div>
      )}

      {/* Tab 2: Packet Capture */}
      {activeTab === 'packet-capture' && (
        <div className="pt-5" data-testid="packet-capture-tab">
          <div className="mb-5 flex items-center justify-between pr-9">
            <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
              Packet Capture
            </h2>
            <div className="flex items-center gap-2">
              <SIcon name="packet-capture" size={18} />
              <span className="text-[13px] text-[var(--omada-text-secondary)]">
                {captureRunning ? 'Capture Running' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="pc-device"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Device
              </label>
              <SSelect
                id="pc-device"
                aria-label="Capture Device"
                value={captureDeviceKey}
                options={TOOL_SOURCE_DEVICES.map((d) => ({
                  label: d.name,
                  value: d.key,
                  description: `${d.deviceType} · ${d.ip}`,
                }))}
                onChange={(val) => setCaptureDeviceKey(val as string)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="pc-interface"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Interface
              </label>
              <SSelect
                id="pc-interface"
                aria-label="Capture Interface"
                value={captureIface}
                options={[
                  { label: 'WAN/LAN1', value: 'WAN/LAN1' },
                  { label: 'LAN (br-lan)', value: 'LAN (br-lan)' },
                  { label: 'ath0 (2.4 GHz)', value: 'ath0 (2.4 GHz)' },
                ]}
                onChange={(val) => setCaptureIface(val as string)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="pc-filter"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Capture Filter
              </label>
              <SInput
                id="pc-filter"
                aria-label="Capture Filter"
                variant="filled"
                value={captureFilter}
                onChange={(e) => setCaptureFilter(e.target.value)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="pc-count"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Max Packets
              </label>
              <div className="flex items-center gap-3">
                <SInput
                  id="pc-count"
                  aria-label="Max Packets"
                  variant="filled"
                  value={captureCount}
                  onChange={(e) => setCaptureCount(e.target.value)}
                  className="w-[350px]"
                />
                <span className="text-[13px] text-[var(--omada-text-tertiary)]">
                  (1-5000)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <SButton
              variant={captureRunning ? 'danger' : 'primary'}
              onClick={handleToggleCapture}
            >
              <span className="inline-flex items-center gap-1.5">
                {captureRunning ? <Square size={13} /> : <Play size={13} />}
                <span>{captureRunning ? 'Stop Capture' : 'Start Capture'}</span>
              </span>
            </SButton>
            <SButton
              variant="outline"
              onClick={() =>
                notification.success({
                  title: 'PCAP Exported',
                  description: `Downloaded capture_${captureIface.replace(/[^a-z0-9]/gi, '_')}.pcap`,
                })
              }
            >
              Download .pcap
            </SButton>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <div className="omada-tools-table-shell">
            <Table
              className="omada-tools-table"
              rowKey="key"
              size="small"
              pagination={false}
              columns={packetColumns}
              dataSource={capturedRows}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Terminal */}
      {activeTab === 'terminal' && (
        <div className="pt-5" data-testid="terminal-tab">
          <h2 className="m-0 mb-5 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
            Remote Control Terminal Session
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="term-device-type"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Device Type
              </label>
              <SSelect
                id="term-device-type"
                aria-label="Device Type"
                value={termDeviceType}
                options={DEVICE_TYPE_OPTIONS}
                onChange={(val) => {
                  setTermDeviceType(val as ToolDeviceType);
                  setTermSourceKey(undefined);
                }}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="term-sources"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Sources
              </label>
              <SSelect
                id="term-sources"
                aria-label="Sources"
                allowClear
                placeholder="Please Select..."
                value={termSourceKey}
                options={termSourceOptions}
                onChange={(val) => setTermSourceKey(val as string | undefined)}
                className="w-[350px]"
              />
            </div>
          </div>

          <div className="mt-5">
            <SButton variant="primary" onClick={handleOpenTerminal}>
              Open Terminal
            </SButton>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <STerminalConsole
            title="Sessions"
            searchPlaceholder="Search Sessions"
            emptyText="Please run a terminal first"
            interactive
            sessions={terminalSessions}
            activeKey={activeTerminalKey}
            onSelectSession={setActiveTerminalKey}
            onCloseSession={handleCloseTerminalSession}
            onSubmitCommand={handleSubmitTerminalCommand}
            onClear={() => {
              setTerminalSessions([]);
              setActiveTerminalKey(null);
            }}
            minHeight={440}
            data-testid="terminal-sessions-console"
          />
        </div>
      )}

      {/* Tab 4: Cable Test */}
      {activeTab === 'cable-test' && (
        <div className="pt-5" data-testid="cable-test-tab">
          <div className="mb-5 flex items-center justify-between pr-9">
            <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
              Cable Test
            </h2>
            <SIcon name="cable-test-cable-test" size={18} />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="ct-switch"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Switch
              </label>
              <SSelect
                id="ct-switch"
                aria-label="Switch"
                value={cableSwitchKey}
                options={TOOL_SOURCE_DEVICES.filter((d) => d.deviceType === 'Switch').map(
                  (d) => ({
                    label: d.name,
                    value: d.key,
                    description: `${d.model} · ${d.ip}`,
                  }),
                )}
                onChange={(val) => setCableSwitchKey(val as string)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="ct-ports"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Ports
              </label>
              <SSelect
                id="ct-ports"
                aria-label="Ports"
                value={cablePortSelection}
                options={[
                  { label: 'All Ports', value: 'All Ports' },
                  { label: 'Port1 - Port4', value: 'Port1 - Port4' },
                  { label: 'Port5 - Port8', value: 'Port5 - Port8' },
                ]}
                onChange={(val) => setCablePortSelection(val as string)}
                className="w-[350px]"
              />
            </div>
          </div>

          <div className="mt-5">
            <SButton variant="primary" onClick={handleRunCableTest}>
              Test
            </SButton>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <div className="omada-tools-table-shell">
            <Table
              className="omada-tools-table"
              rowKey="key"
              size="small"
              pagination={false}
              columns={cableColumns}
              dataSource={cableRows}
            />
          </div>
        </div>
      )}

      {/* Tab 5: Interference Detection */}
      {activeTab === 'interference-detection' && (
        <div className="pt-5" data-testid="interference-detection-tab">
          <h2 className="m-0 mb-5 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
            Interference Detection
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="id-ap"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Access Point
              </label>
              <SSelect
                id="id-ap"
                aria-label="Access Point"
                value={interferenceApKey}
                options={TOOL_SOURCE_DEVICES.filter((d) => d.deviceType === 'EAP').map(
                  (d) => ({
                    label: d.name,
                    value: d.key,
                    description: `${d.model} · ${d.ip}`,
                  }),
                )}
                onChange={(val) => setInterferenceApKey(val as string)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="id-band"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Frequency Band
              </label>
              <SSelect
                id="id-band"
                aria-label="Frequency Band"
                value={interferenceBand}
                options={[
                  { label: '2.4 GHz', value: '2.4 GHz' },
                  { label: '5 GHz', value: '5 GHz' },
                  { label: '6 GHz', value: '6 GHz' },
                ]}
                onChange={(val) =>
                  setInterferenceBand(val as '2.4 GHz' | '5 GHz' | '6 GHz')
                }
                className="w-[350px]"
              />
            </div>
          </div>

          <div className="mt-5">
            <SButton variant="primary" onClick={handleRunInterferenceScan}>
              Start Scan
            </SButton>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <div className="omada-tools-table-shell">
            <Table
              className="omada-tools-table"
              rowKey="key"
              size="small"
              pagination={false}
              columns={interferenceColumns}
              dataSource={interferenceRows}
            />
          </div>
        </div>
      )}

      {/* Tab 6: Remote Access (BETA) */}
      {activeTab === 'remote-access' && (
        <div className="pt-5" data-testid="remote-access-tab">
          <div className="mb-4 flex items-center justify-between pr-9">
            <div className="flex items-center gap-2">
              <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
                Remote Access
              </h2>
              <span className="omada-emu-beta-tag">BETA</span>
            </div>
            <SIcon name="remote-access" size={18} />
          </div>

          <div
            role="note"
            className="omada-tools-info-banner mb-5 flex items-center gap-2.5 rounded-[6px] px-4 py-2.5"
          >
            <Info size={16} className="omada-tools-info-icon shrink-0" />
            <span className="text-[13px] leading-5">
              Remote Access creates an encrypted temporary cloud tunnel to manage local gateway,
              switch, or AP interfaces without opening inbound firewall ports.
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-y-2">
              <span className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]">
                Tunnel Service
              </span>
              <SSwitch
                checked={remoteAccessEnabled}
                onChange={setRemoteAccessEnabled}
                aria-label="Enable Remote Access Tunnel"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="ra-device"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Target Device
              </label>
              <SSelect
                id="ra-device"
                aria-label="Target Device"
                disabled={!remoteAccessEnabled}
                value={remoteDeviceKey}
                options={TOOL_SOURCE_DEVICES.map((d) => ({
                  label: d.name,
                  value: d.key,
                  description: `${d.model} · ${d.ip}`,
                }))}
                onChange={(val) => setRemoteDeviceKey(val as string)}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="ra-protocol"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Protocol
              </label>
              <SSelect
                id="ra-protocol"
                aria-label="Tunnel Protocol"
                disabled={!remoteAccessEnabled}
                value={remoteProtocol}
                options={[
                  { label: 'SSH', value: 'SSH' },
                  { label: 'HTTPS', value: 'HTTPS' },
                ]}
                onChange={(val) => {
                  const next = val as 'SSH' | 'HTTPS';
                  setRemoteProtocol(next);
                  setRemotePort(next === 'SSH' ? '22' : '443');
                }}
                className="w-[350px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-y-2">
              <label
                htmlFor="ra-port"
                className="w-[210px] shrink-0 text-[14px] text-[var(--omada-text-primary)]"
              >
                Target Port
              </label>
              <SInput
                id="ra-port"
                aria-label="Target Port"
                disabled={!remoteAccessEnabled}
                variant="filled"
                value={remotePort}
                onChange={(e) => setRemotePort(e.target.value)}
                className="w-[350px]"
              />
            </div>
          </div>

          <div className="mt-5">
            <SButton
              variant="primary"
              disabled={!remoteAccessEnabled}
              onClick={handleCreateTunnel}
            >
              Generate Tunnel URL
            </SButton>
          </div>

          <div className="my-5 border-t border-[var(--omada-border-divider)]" />

          <div className="omada-tools-table-shell">
            <Table
              className="omada-tools-table"
              rowKey="key"
              size="small"
              pagination={false}
              columns={tunnelColumns}
              dataSource={remoteTunnels}
            />
          </div>
        </div>
      )}
    </div>
  );
};
