import React, { useState } from 'react';
import { Collapse, Descriptions, Progress, Steps } from 'antd';
import type { EChartsOption } from 'echarts';
import { Activity, ShieldCheck, Wifi } from 'lucide-react';
import {
  SCard,
  SChart,
  SCustomTag,
  SDeviceStatus,
  SKpiCard,
  SPageHeader,
  SPortPanel,
  STabs,
  STag,
  type SPortItem,
  type STagColor,
} from '@/omada';

const TAG_COLORS: STagColor[] = [
  'green',
  'orange',
  'blue',
  'red',
  'magenta',
  'purple',
  'grey',
];

const DEMO_SWITCH_PORTS: SPortItem[] = [
  { id: 1, status: '100m', badges: ['poe'], vlan: 'VLAN 1', poeWatts: 6.5, clientName: 'Lobby Intercom' },
  { id: 2, status: '1g', badges: ['poe'], vlan: 'VLAN 1', poeWatts: 12.1, clientName: 'EAP670-North' },
  { id: 3, status: '2.5g', badges: ['poe'], vlan: 'VLAN 10', poeWatts: 18.4, clientName: 'EAP783-Lobby' },
  { id: 4, status: '5g', vlan: 'VLAN 10', clientName: 'Workstation-Pro' },
  { id: 5, status: '10g', badges: ['uplink'], vlan: 'Trunk', clientName: 'Core-Router' },
  { id: 6, status: '25g', type: 'sfp', badges: ['stack'], vlan: 'Stack', clientName: 'Dist-SW-2' },
  { id: 7, status: '40g', type: 'sfp', vlan: 'Backbone', clientName: 'Spine-01' },
  { id: 8, status: '100g', type: 'sfp', vlan: 'Backbone', clientName: 'Spine-02' },
  { id: 9, status: 'connected', vlan: 'OLT PON-1', clientName: 'ONU-Room104' },
  { id: 10, status: 'disconnected', vlan: 'VLAN 1' },
  { id: 11, status: 'disabled' },
  { id: 12, status: '1g', badges: ['blocking'], vlan: 'VLAN 20', clientName: 'Loop Guard' },
];

const DEMO_GATEWAY_PORTS: SPortItem[] = [
  { id: 1, label: 'WAN1', type: 'wan', status: '10g', badges: ['uplink'], clientName: 'ISP-Fiber' },
  { id: 2, label: 'WAN2', type: 'wan', status: '2.5g', clientName: 'ISP-LTE' },
  { id: 3, label: 'LAN1', type: 'lan', status: '1g', clientName: 'Core-SW' },
  { id: 4, label: 'LAN2', type: 'lan', status: 'disconnected' },
];

const TRAFFIC_CHART_OPTION: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['Download (Mbps)', 'Upload (Mbps)'], top: 0, right: 0 },
  grid: { left: 42, right: 16, top: 34, bottom: 26 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Download (Mbps)',
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.14 },
      data: [210, 145, 380, 690, 840, 720, 410],
    },
    {
      name: 'Upload (Mbps)',
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.1 },
      data: [68, 42, 130, 260, 310, 245, 138],
    },
  ],
};

const BAR_CHART_OPTION: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 42, right: 16, top: 20, bottom: 28 },
  xAxis: {
    type: 'category',
    data: ['Corp-5G', 'Corp-6G', 'Guest', 'IoT-VLAN', 'VoIP'],
  },
  yAxis: { type: 'value', axisLabel: { formatter: '{value} GB' } },
  series: [
    {
      name: 'Traffic',
      type: 'bar',
      barWidth: 26,
      itemStyle: { color: '#00A870', borderRadius: [4, 4, 0, 0] },
      data: [420, 318, 164, 92, 58],
    },
  ],
};

const DONUT_CHART_OPTION: EChartsOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      name: 'Clients by Band',
      type: 'pie',
      radius: ['48%', '70%'],
      center: ['50%', '44%'],
      label: { show: false },
      data: [
        { value: 182, name: '5 GHz' },
        { value: 96, name: '6 GHz' },
        { value: 88, name: '2.4 GHz' },
        { value: 46, name: 'Wired' },
      ],
    },
  ],
};

export const DataDisplaySection: React.FC = () => {
  const [customTags, setCustomTags] = useState(['Core-Rack', 'PoE++', 'Wi-Fi 7', 'HQ-Floor1']);
  const [selectedPorts, setSelectedPorts] = useState<number[]>([2, 3, 5]);

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Data Display & Charts"
        description="Tabs, Tags, Device Statuses, KPI Cards, interactive Port Matrix, ECharts visualizations, Steps, and Descriptions."
      />

      {/* Tabs */}
      <SCard title="Tabs (Line / Page / Filter / Capsule / Pill / Segment)">
        <div className="space-y-5">
          <STabs
            variant="line"
            aria-label="Primary device detail tabs"
            items={[
              { key: '1', label: 'Overview', children: <span className="text-xs text-[var(--omada-text-secondary)]">Primary line tab content area.</span> },
              { key: '2', label: 'Interfaces' },
              { key: '3', label: 'Clients (412)' },
            ]}
          />
          <div className="space-y-3">
            <STabs
              variant="page"
              size="lg"
              aria-label="Controller v6.3 header sub-tabs"
              items={[
                { key: 'general', label: 'General Settings', count: 6 },
                { key: 'dns', label: 'DNS Proxy' },
                { key: 'dhcp', label: 'DHCP Relay', disabled: true },
              ]}
            />
            <STabs
              variant="page"
              size="md"
              bordered={false}
              aria-label="Drawer sub-section tabs"
              items={[
                { key: 'telemetry', label: 'Telemetry' },
                { key: 'radios', label: 'Radios', count: 3 },
                { key: 'events', label: 'Recent Events' },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <STabs
              variant="filter"
              aria-label="Controller v6.3 filter pill tabs"
              items={[
                { key: 'all', label: 'All', count: 48 },
                { key: 'online', label: 'Online', dotColor: 'var(--omada-color-success)', count: 44 },
                { key: 'alert', label: 'Alerts', dotColor: 'var(--omada-color-warning)', count: 4 },
              ]}
            />
            <STabs
              variant="capsule"
              aria-label="Device category capsule tabs"
              items={[
                { key: 'all', label: 'All (48)' },
                { key: 'ap', label: 'APs (32)' },
                { key: 'sw', label: 'Switches (8)' },
              ]}
            />
            <STabs
              variant="capsule"
              pill
              aria-label="Time range pill tabs"
              items={[
                { key: '24h', label: '24 Hours' },
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
              ]}
            />
            <STabs
              variant="segment"
              aria-label="Rx/Tx metric switcher"
              items={[
                { key: 'rx', label: 'Rx', dotColor: '#006F71' },
                { key: 'tx', label: 'Tx', dotColor: '#00E194' },
              ]}
            />
          </div>
        </div>
      </SCard>

      {/* Tags & Device Statuses */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Tags (Subtle, Solid & Custom Removable)">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((color) => (
                <STag key={`subtle-${color}`} color={color} variant="subtle">
                  {color}
                </STag>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((color) => (
                <STag key={`solid-${color}`} color={color} variant="solid">
                  {color}
                </STag>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {customTags.map((tag) => (
                <SCustomTag
                  key={tag}
                  closable
                  onClose={() => setCustomTags((prev) => prev.filter((t) => t !== tag))}
                >
                  {tag}
                </SCustomTag>
              ))}
              {customTags.length === 0 && (
                <button
                  type="button"
                  onClick={() => setCustomTags(['Core-Rack', 'PoE++', 'Wi-Fi 7'])}
                  className="cursor-pointer text-xs text-[var(--omada-link)] hover:underline"
                >
                  Restore tags
                </button>
              )}
            </div>
          </div>
        </SCard>

        <SCard title="Device Status Indicators (7 States)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SDeviceStatus status="connected" />
            <SDeviceStatus status="disconnected" />
            <SDeviceStatus status="heartbeat-missed" />
            <SDeviceStatus status="adopt-failed" />
            <SDeviceStatus status="pending" />
            <SDeviceStatus status="provisioning" />
            <SDeviceStatus status="isolated" />
          </div>
        </SCard>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SKpiCard
          title="Site Health Score"
          value="98%"
          accentColor="var(--omada-color-success)"
          icon={<ShieldCheck size={16} className="text-[var(--omada-color-success)]" />}
          meta="All core gateways optimal"
        />
        <SKpiCard
          title="Wireless Throughput"
          value="1.42 Gbps"
          icon={<Wifi size={16} className="text-[var(--omada-brand-text)]" />}
          meta="Peak 1.88 Gbps at 15:20"
        />
        <SKpiCard
          title="Active Tunnels"
          value="14 / 14"
          icon={<Activity size={16} className="text-[var(--omada-color-info)]" />}
          meta="Site-to-Site IPsec + WireGuard"
        />
      </div>

      {/* Interactive Port Panels */}
      <SCard title="Device Port Matrix (All 11 Speed States · Small 26px & Large 40px)">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Switch Double-Row Matrix (Selectable — selected: {selectedPorts.join(', ') || 'none'})
            </div>
            <SPortPanel
              ports={DEMO_SWITCH_PORTS}
              size="sm"
              layout="double-row"
              selectable
              selectedIds={selectedPorts}
              onSelectChange={setSelectedPorts}
            />
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
              Gateway Detail Single-Row (Large 40px)
            </div>
            <SPortPanel
              ports={DEMO_GATEWAY_PORTS}
              size="lg"
              layout="single-row"
              showLegend={false}
            />
          </div>
        </div>
      </SCard>

      {/* ECharts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SCard title="Traffic Trend (Line)" className="lg:col-span-2">
          <SChart option={TRAFFIC_CHART_OPTION} height={240} />
        </SCard>
        <SCard title="Client Distribution (Donut)">
          <SChart option={DONUT_CHART_OPTION} height={240} />
        </SCard>
      </div>

      <SCard title="SSID Traffic Breakdown (Bar)">
        <SChart option={BAR_CHART_OPTION} height={220} />
      </SCard>

      {/* Steps, Descriptions, Progress & Collapse */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Steps & Progress">
          <div className="space-y-5">
            <Steps
              size="small"
              current={1}
              items={[
                { title: 'Discover' },
                { title: 'Adopt & Provision' },
                { title: 'Online' },
              ]}
            />
            <div className="space-y-2">
              <Progress percent={72} status="active" />
              <Progress percent={100} />
              <Progress percent={35} status="exception" />
            </div>
          </div>
        </SCard>

        <SCard title="Descriptions & Collapse">
          <div className="space-y-4">
            <Descriptions
              size="small"
              column={2}
              bordered
              items={[
                { key: '1', label: 'Controller', children: 'v6.3.0.34' },
                { key: '2', label: 'Cloud Access', children: 'Connected' },
              ]}
            />
            <Collapse
              size="small"
              items={[
                {
                  key: '1',
                  label: 'Advanced Radio Resource Management',
                  children: (
                    <span className="text-xs text-[var(--omada-text-secondary)]">
                      AI WLAN Optimization runs nightly at 03:00 UTC across all managed EAPs.
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </SCard>
      </div>
    </div>
  );
};
