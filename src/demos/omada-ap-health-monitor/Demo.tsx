import { useMemo, useState } from 'react';
import {
  SPageHeader,
  SCard,
  SKpiCard,
  STabs,
  STag,
  STable,
  SSearchInput,
  SSelect,
  SButton,
  SDrawer,
  SDescriptions,
  SLineChart,
  SSparkChart,
  SChannelUtilization,
  SDeviceStatus,
  SProgress,
  SAlert,
  SEmpty,
} from '@/omada';
import type { SChannelBand, DeviceStatusType, STagColor } from '@/omada';

type HealthLevel = 'good' | 'fair' | 'poor' | 'offline';

interface ApRow {
  key: string;
  name: string;
  model: string;
  ip: string;
  mac: string;
  firmware: string;
  status: DeviceStatusType;
  band: '2.4G' | '5G' | '6G';
  channel: number;
  clients: number;
  channelUtil: number; // %
  retryRate: number; // %
  avgRssi: number; // dBm
  cpu: number; // %
  mem: number; // %
  uptime: string;
  score: number; // 0-100, -1 offline
  trend: number[];
  issues: { title: string; detail: string; action: string; severity: 'red' | 'orange' }[];
}

const levelOf = (s: number): HealthLevel =>
  s < 0 ? 'offline' : s >= 80 ? 'good' : s >= 60 ? 'fair' : 'poor';

const LEVEL_META: Record<HealthLevel, { label: string; color: STagColor; css: string }> = {
  good: { label: 'Good', color: 'green', css: 'var(--omada-color-success)' },
  fair: { label: 'Fair', color: 'orange', css: 'var(--omada-color-warning)' },
  poor: { label: 'Poor', color: 'red', css: 'var(--omada-color-error)' },
  offline: { label: 'No Data', color: 'grey', css: 'var(--omada-text-tertiary)' },
};

// ---- Sample data (prototype only) ----
const AP_DATA: ApRow[] = [
  { key: '1', name: 'Lobby_EAP670_01', model: 'EAP670', ip: '192.168.10.21', mac: '1C-61-B4-3A-10-21', firmware: '1.1.2 Build 20260812', status: 'connected', band: '5G', channel: 36, clients: 42, channelUtil: 38, retryRate: 6, avgRssi: -58, cpu: 22, mem: 41, uptime: '23d 4h', score: 92, trend: [90, 91, 93, 92, 94, 92, 92], issues: [] },
  { key: '2', name: 'Floor2_EAP650_West', model: 'EAP650', ip: '192.168.10.34', mac: '1C-61-B4-3A-10-34', firmware: '1.0.8 Build 20260610', status: 'connected', band: '5G', channel: 149, clients: 68, channelUtil: 81, retryRate: 19, avgRssi: -71, cpu: 64, mem: 72, uptime: '9d 12h', score: 54, trend: [76, 72, 69, 63, 58, 55, 54],
    issues: [
      { title: '信道利用率过高 (81%)', detail: 'CH149 与 Floor2_EAP650_East 同信道重叠，空口拥塞', action: '执行 WLAN Optimization 或手动迁移至 CH157', severity: 'red' },
      { title: '重传率偏高 (19%)', detail: '弱信号终端占比 34%，拖慢整体空口效率', action: '开启 Minimum RSSI (-75 dBm) 与 Band Steering', severity: 'orange' },
      { title: '固件落后', detail: '当前 1.0.8，最新推荐 1.1.2', action: '在维护窗口内批量升级', severity: 'orange' },
    ] },
  { key: '3', name: 'Floor2_EAP650_East', model: 'EAP650', ip: '192.168.10.35', mac: '1C-61-B4-3A-10-35', firmware: '1.1.2 Build 20260812', status: 'connected', band: '5G', channel: 149, clients: 51, channelUtil: 66, retryRate: 11, avgRssi: -64, cpu: 41, mem: 55, uptime: '9d 12h', score: 71, trend: [80, 79, 77, 74, 72, 71, 71],
    issues: [
      { title: '同信道干扰', detail: '与 Floor2_EAP650_West 共用 CH149', action: '调整信道规划，避免相邻 AP 同信道', severity: 'orange' },
    ] },
  { key: '4', name: 'MeetingRoom_EAP773', model: 'EAP773', ip: '192.168.10.40', mac: '1C-61-B4-3A-10-40', firmware: '1.0.3 Build 20260901', status: 'connected', band: '6G', channel: 37, clients: 18, channelUtil: 21, retryRate: 3, avgRssi: -55, cpu: 15, mem: 33, uptime: '41d 2h', score: 97, trend: [96, 97, 97, 98, 97, 97, 97], issues: [] },
  { key: '5', name: 'Warehouse_EAP225_Outdoor', model: 'EAP225-Outdoor', ip: '192.168.10.52', mac: '1C-61-B4-3A-10-52', firmware: '5.1.0 Build 20260402', status: 'heartbeat-missed', band: '2.4G', channel: 6, clients: 9, channelUtil: 72, retryRate: 27, avgRssi: -78, cpu: 58, mem: 61, uptime: '2d 7h', score: 38, trend: [62, 55, 51, 47, 44, 40, 38],
    issues: [
      { title: '心跳丢失', detail: '过去 1 小时内 4 次心跳超时，疑似上行链路不稳', action: '检查上联交换机端口 Gi1/0/12 及 PoE 供电', severity: 'red' },
      { title: '终端信号弱 (-78 dBm)', detail: '覆盖边缘终端多，2.4G 干扰严重', action: '评估加装 AP 或调整天线朝向', severity: 'red' },
    ] },
  { key: '6', name: 'Cafeteria_EAP670_02', model: 'EAP670', ip: '192.168.10.23', mac: '1C-61-B4-3A-10-23', firmware: '1.1.2 Build 20260812', status: 'connected', band: '5G', channel: 44, clients: 87, channelUtil: 63, retryRate: 9, avgRssi: -62, cpu: 47, mem: 58, uptime: '23d 4h', score: 76, trend: [85, 83, 80, 78, 77, 76, 76],
    issues: [
      { title: '高峰时段终端密度高', detail: '12:00–13:30 关联终端峰值 112', action: '开启 Airtime Fairness 并限制单终端速率', severity: 'orange' },
    ] },
  { key: '7', name: 'Floor3_EAP653_North', model: 'EAP653', ip: '192.168.10.61', mac: '1C-61-B4-3A-10-61', firmware: '1.1.0 Build 20260715', status: 'connected', band: '5G', channel: 100, clients: 33, channelUtil: 29, retryRate: 5, avgRssi: -60, cpu: 19, mem: 37, uptime: '17d 9h', score: 89, trend: [88, 89, 90, 89, 88, 89, 89], issues: [] },
  { key: '8', name: 'StorageRoom_EAP115', model: 'EAP115', ip: '192.168.10.70', mac: '1C-61-B4-3A-10-70', firmware: '5.0.4 Build 20250911', status: 'disconnected', band: '2.4G', channel: 11, clients: 0, channelUtil: 0, retryRate: 0, avgRssi: 0, cpu: 0, mem: 0, uptime: '—', score: -1, trend: [70, 68, 66, 0, 0, 0, 0],
    issues: [
      { title: '设备离线', detail: '已离线 3 天 6 小时', action: '现场检查供电与网线连接', severity: 'red' },
    ] },
  { key: '9', name: 'Floor3_EAP653_South', model: 'EAP653', ip: '192.168.10.62', mac: '1C-61-B4-3A-10-62', firmware: '1.1.0 Build 20260715', status: 'connected', band: '5G', channel: 116, clients: 27, channelUtil: 34, retryRate: 7, avgRssi: -63, cpu: 24, mem: 40, uptime: '17d 9h', score: 85, trend: [84, 85, 86, 85, 85, 85, 85], issues: [] },
  { key: '10', name: 'Reception_EAP610', model: 'EAP610', ip: '192.168.10.80', mac: '1C-61-B4-3A-10-80', firmware: '1.3.1 Build 20260520', status: 'connected', band: '2.4G', channel: 1, clients: 14, channelUtil: 57, retryRate: 14, avgRssi: -69, cpu: 33, mem: 49, uptime: '5d 1h', score: 63, trend: [71, 70, 68, 66, 65, 64, 63],
    issues: [
      { title: '2.4G 干扰', detail: '检测到非 Wi-Fi 干扰源（疑似微波炉/蓝牙）', action: '启用 5G 优先，减少 2.4G 终端关联', severity: 'orange' },
    ] },
];

const HOURS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
const SITE_TREND = [88, 87, 82, 74, 77, 80, 78];

const CHANNEL_BANDS: SChannelBand[] = [
  { key: '24', label: '2.4 GHz', channels: [{ channel: 1, utilization: 57 }, { channel: 6, utilization: 72 }, { channel: 11, utilization: 18 }] },
  { key: '5', label: '5 GHz', channels: [
    { channel: 36, utilization: 38 }, { channel: 44, utilization: 63 }, { channel: 100, utilization: 29 },
    { channel: 116, utilization: 34 }, { channel: 149, utilization: 81 }, { channel: 157, utilization: 0 } ] },
  { key: '6', label: '6 GHz', channels: [{ channel: 37, utilization: 21 }, { channel: 53, utilization: 0 }, { channel: 69, utilization: 0 }] },
];

const statusTone = (v: number, warn: number, bad: number) =>
  v >= bad ? 'var(--omada-color-error)' : v >= warn ? 'var(--omada-color-warning)' : 'var(--omada-text-primary)';

export default function Demo() {
  const [range, setRange] = useState('1d');
  const [levelFilter, setLevelFilter] = useState<HealthLevel | 'all'>('all');
  const [band, setBand] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ApRow | null>(null);

  const counts = useMemo(() => {
    const c = { good: 0, fair: 0, poor: 0, offline: 0 };
    AP_DATA.forEach((a) => { c[levelOf(a.score)] += 1; });
    return c;
  }, []);

  const online = AP_DATA.filter((a) => a.score >= 0);
  const avgScore = Math.round(online.reduce((s, a) => s + a.score, 0) / online.length);
  const totalClients = AP_DATA.reduce((s, a) => s + a.clients, 0);

  const rows = useMemo(
    () =>
      AP_DATA.filter((a) => (levelFilter === 'all' ? true : levelOf(a.score) === levelFilter))
        .filter((a) => (band === 'all' ? true : a.band === band))
        .filter((a) => {
          const q = query.trim().toLowerCase();
          return !q || a.name.toLowerCase().includes(q) || a.ip.includes(q) || a.model.toLowerCase().includes(q);
        })
        .sort((x, y) => x.score - y.score),
    [levelFilter, band, query],
  );

  const topIssues = AP_DATA.filter((a) => a.issues.some((i) => i.severity === 'red'));

  const toggleLevel = (l: HealthLevel) => setLevelFilter((cur) => (cur === l ? 'all' : l));

  const columns = [
    {
      title: 'AP Name', dataIndex: 'name', key: 'name', fixed: 'left' as const, width: 220,
      render: (_: unknown, r: ApRow) => (
        <div className="flex flex-col">
          <a className="font-medium text-[var(--omada-brand)]" onClick={() => setSelected(r)}>{r.name}</a>
          <span className="text-[12px] text-[var(--omada-text-tertiary)]">{r.model} · {r.ip}</span>
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 150, render: (s: DeviceStatusType) => <SDeviceStatus status={s} /> },
    {
      title: 'Health', dataIndex: 'score', key: 'score', width: 170,
      render: (s: number) => {
        const l = levelOf(s);
        return (
          <div className="flex items-center gap-2">
            <span className="w-8 tabular-nums font-semibold" style={{ color: LEVEL_META[l].css }}>{s < 0 ? '—' : s}</span>
            <STag color={LEVEL_META[l].color}>{LEVEL_META[l].label}</STag>
          </div>
        );
      },
    },
    {
      title: 'Trend (24h)', dataIndex: 'trend', key: 'trend', width: 140,
      render: (t: number[], r: ApRow) => (
        <SSparkChart data={t} variant="line" height={28} color={LEVEL_META[levelOf(r.score)].css} />
      ),
    },
    { title: 'Band / CH', key: 'band', width: 110, render: (_: unknown, r: ApRow) => <span className="tabular-nums">{r.band} / {r.channel}</span> },
    { title: 'Clients', dataIndex: 'clients', key: 'clients', width: 90, render: (v: number) => <span className="tabular-nums">{v}</span> },
    {
      title: 'Ch. Util', dataIndex: 'channelUtil', key: 'channelUtil', width: 100,
      render: (v: number) => <span className="tabular-nums" style={{ color: statusTone(v, 60, 75) }}>{v}%</span>,
    },
    {
      title: 'Retry', dataIndex: 'retryRate', key: 'retryRate', width: 90,
      render: (v: number) => <span className="tabular-nums" style={{ color: statusTone(v, 10, 18) }}>{v}%</span>,
    },
    {
      title: 'Avg RSSI', dataIndex: 'avgRssi', key: 'avgRssi', width: 110,
      render: (v: number) => <span className="tabular-nums" style={{ color: v === 0 ? undefined : v <= -75 ? 'var(--omada-color-error)' : v <= -68 ? 'var(--omada-color-warning)' : undefined }}>{v === 0 ? '—' : `${v} dBm`}</span>,
    },
    {
      title: 'Issues', key: 'issues', width: 90,
      render: (_: unknown, r: ApRow) => r.issues.length ? <STag color={r.issues.some((i) => i.severity === 'red') ? 'red' : 'orange'}>{r.issues.length}</STag> : <span className="text-[var(--omada-text-tertiary)]">—</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--omada-bg-page)] p-6">
      <SPageHeader
        title="AP Health Monitor"
        description="Site: HQ-Irvine · 10 APs · 示例数据（原型演示）"
        extra={
          <div className="flex items-center gap-3">
            <STabs variant="segment" activeKey={range} onChange={setRange}
              items={[{ key: '1d', label: '1D' }, { key: '1w', label: '1W' }, { key: '1m', label: '1M' }]} />
            <SButton variant="outline">Export</SButton>
            <SButton variant="primary">Optimize WLAN</SButton>
          </div>
        }
      />

      {topIssues.length > 0 && (
        <SAlert
          type="warning"
          title={`${topIssues.length} 台 AP 存在严重问题需要处理`}
          description={topIssues.map((a) => a.name).join('、')}
          action={<SButton size="small" variant="secondary" onClick={() => setLevelFilter('poor')}>只看 Poor</SButton>}
          className="mb-4"
        />
      )}

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SKpiCard title="Avg Health Score" value={avgScore} meta={`在线 AP ${online.length}/${AP_DATA.length}`} accentColor="var(--omada-brand)" onClick={() => setLevelFilter('all')} active={levelFilter === 'all'} />
        <SKpiCard title="Good" value={counts.good} meta="Score ≥ 80" accentColor={LEVEL_META.good.css} onClick={() => toggleLevel('good')} active={levelFilter === 'good'} />
        <SKpiCard title="Fair" value={counts.fair} meta="60 – 79" accentColor={LEVEL_META.fair.css} onClick={() => toggleLevel('fair')} active={levelFilter === 'fair'} />
        <SKpiCard title="Poor" value={counts.poor} meta="< 60" accentColor={LEVEL_META.poor.css} onClick={() => toggleLevel('poor')} active={levelFilter === 'poor'} />
        <SKpiCard title="Offline / No Data" value={counts.offline} meta={`关联终端 ${totalClients}`} accentColor={LEVEL_META.offline.css} onClick={() => toggleLevel('offline')} active={levelFilter === 'offline'} />
      </div>

      {/* Charts row */}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SCard title="Site AP Health Trend" subtitle="平均健康分（在线 AP）" className="xl:col-span-2">
          <SLineChart
            xData={HOURS}
            series={[
              { name: 'Avg Health', data: SITE_TREND, area: true, smooth: true, color: 'var(--omada-brand)' },
              { name: 'Floor2_EAP650_West', data: AP_DATA[1].trend, smooth: true, dashed: true, color: 'var(--omada-color-error)' },
            ]}
            yMin={0}
            yMax={100}
            showLegend
            legendPosition="top"
            height={240}
          />
        </SCard>
        <SCard title="Channel Utilization" subtitle="按信道聚合 · 红色 ≥ 70%">
          <SChannelUtilization bands={CHANNEL_BANDS} />
          <div className="mt-4 text-[12px] text-[var(--omada-text-secondary)]">
            CH149 两台 AP 同信道重叠，建议迁移至空闲的 CH157。
          </div>
        </SCard>
      </div>

      {/* Table */}
      <SCard title="AP List" subtitle="默认按健康分升序（问题优先）" padding="none">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
          <SSearchInput placeholder="搜索名称 / IP / 型号" value={query} onChange={(e) => setQuery(e.target.value)} />
          <SSelect
            style={{ width: 160 }}
            value={band}
            onChange={(v) => setBand(v as string)}
            options={[
              { label: 'All Bands', value: 'all' },
              { label: '2.4 GHz', value: '2.4G' },
              { label: '5 GHz', value: '5G' },
              { label: '6 GHz', value: '6G' },
            ]}
          />
          <SSelect
            style={{ width: 160 }}
            value={levelFilter}
            onChange={(v) => setLevelFilter(v as HealthLevel | 'all')}
            options={[
              { label: 'All Health', value: 'all' },
              { label: 'Good', value: 'good' },
              { label: 'Fair', value: 'fair' },
              { label: 'Poor', value: 'poor' },
              { label: 'No Data', value: 'offline' },
            ]}
          />
          <span className="ml-auto text-[13px] text-[var(--omada-text-secondary)]">{rows.length} / {AP_DATA.length} APs</span>
        </div>
        {rows.length === 0 ? (
          <div className="p-8"><SEmpty title="没有匹配的 AP" description="调整筛选条件试试" /></div>
        ) : (
          <STable<ApRow>
            rowKey="key"
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 1300 }}
            onRow={(r) => ({ onClick: () => setSelected(r), style: { cursor: 'pointer' } })}
          />
        )}
      </SCard>

      {/* Detail drawer */}
      <SDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        size="md"
        title={selected?.name}
        subtitle={selected ? `${selected.model} · ${selected.mac}` : undefined}
        statusSlot={selected ? <SDeviceStatus status={selected.status} /> : undefined}
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-6">
              <SProgress
                type="circle"
                percent={selected.score < 0 ? 0 : selected.score}
                status={levelOf(selected.score) === 'good' ? 'success' : levelOf(selected.score) === 'fair' ? 'warning' : 'exception'}
                format={() => (selected.score < 0 ? '—' : `${selected.score}`)}
              />
              <div className="flex-1">
                <div className="mb-1 text-[13px] text-[var(--omada-text-secondary)]">Health Trend (24h)</div>
                <SSparkChart data={selected.trend} labels={HOURS} variant="area" height={80} showAxisTicks color={LEVEL_META[levelOf(selected.score)].css} />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[14px] font-semibold text-[var(--omada-text-primary)]">诊断与建议</div>
              {selected.issues.length === 0 ? (
                <SAlert type="success" title="运行健康，无待处理问题" />
              ) : (
                <div className="flex flex-col gap-2">
                  {selected.issues.map((i) => (
                    <div key={i.title} className="rounded-lg border border-[var(--omada-border-divider)] p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <STag color={i.severity}>{i.severity === 'red' ? 'Critical' : 'Warning'}</STag>
                        <span className="font-medium text-[var(--omada-text-primary)]">{i.title}</span>
                      </div>
                      <div className="text-[13px] text-[var(--omada-text-secondary)]">{i.detail}</div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[13px] text-[var(--omada-text-primary)]">建议：{i.action}</span>
                        <SButton size="small" variant="link">Apply</SButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SDescriptions
              column={1}
              variant="filled"
              labelWidth={140}
              items={[
                { key: 'ip', label: 'IP Address', children: selected.ip, mono: true },
                { key: 'fw', label: 'Firmware', children: selected.firmware },
                { key: 'band', label: 'Band / Channel', children: `${selected.band} / CH${selected.channel}` },
                { key: 'clients', label: 'Clients', children: selected.clients },
                { key: 'util', label: 'Channel Util.', children: `${selected.channelUtil}%` },
                { key: 'retry', label: 'Retry Rate', children: `${selected.retryRate}%` },
                { key: 'rssi', label: 'Avg Client RSSI', children: selected.avgRssi === 0 ? '—' : `${selected.avgRssi} dBm` },
                { key: 'cpu', label: 'CPU / Memory', children: `${selected.cpu}% / ${selected.mem}%` },
                { key: 'uptime', label: 'Uptime', children: selected.uptime },
              ]}
            />

            <div className="flex gap-2">
              <SButton variant="primary">Optimize Channel</SButton>
              <SButton variant="outline">Reboot</SButton>
              <SButton variant="outline">Upgrade Firmware</SButton>
            </div>
          </div>
        )}
      </SDrawer>
    </div>
  );
}
