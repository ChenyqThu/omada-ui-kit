import React, { useState } from 'react';
import '@chenyqthu/omada-ui-kit/style.css';
import {
  Col,
  OmadaProvider,
  Row,
  SButton,
  SCard,
  SChannelUtilization,
  SEmulatorShell,
  SHealthGauge,
  SHealthTrendBar,
  SIcon,
  SKpiCard,
  SLineChart,
  SPageHeader,
  useOmadaTheme,
  type SHealthTickStatus,
} from '@chenyqthu/omada-ui-kit';

const TREND_TICKS: SHealthTickStatus[] = Array.from({ length: 48 }, (_, i) =>
  i === 19 || i === 34 ? 'fair' : 'good',
);

const SiteDashboardContent: React.FC = () => {
  const [activeKey, setActiveKey] = useState('dashboard');
  const { resolvedTheme, setThemeMode } = useOmadaTheme();

  return (
    <SEmulatorShell
      activeKey={activeKey}
      onSelect={setActiveKey}
      controllerName="Headquarters Building"
    >
      <div style={{ padding: '20px 44px 24px 24px' }}>
        <SPageHeader
          title="Site Dashboard"
          subtitle="Real-time network health & Wi-Fi spectrum overview"
          extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <SButton
                variant="secondary"
                onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                Theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
              </SButton>
              <SButton variant="primary" icon={<SIcon name="refresh" size={14} />}>
                Refresh
              </SButton>
            </div>
          }
        />

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <SKpiCard title="Gateway Throughput" value="418 Mbps" meta="WAN1 Online · 14 ms latency" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <SKpiCard title="Managed Devices" value={9} meta="1 Gateway · 2 Switches · 6 APs" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <SKpiCard title="Active Clients" value={142} meta="118 Wireless · 24 Wired" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <SKpiCard title="24h Traffic" value="128.4 GB" meta="Peak 520 Mbps at 14:30" />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={10}>
            <SCard title="Network Health">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <SHealthGauge score={94} label="Excellent" />
              </div>
              <SHealthTrendBar
                rows={[
                  { key: 'device', label: 'Device', ticks: TREND_TICKS },
                  { key: 'client', label: 'Client', ticks: TREND_TICKS },
                  { key: 'wifi', label: 'Wi-Fi', ticks: TREND_TICKS },
                  { key: 'wan', label: 'WAN', ticks: TREND_TICKS },
                ]}
              />
            </SCard>
          </Col>
          <Col xs={24} lg={14}>
            <SCard title="WAN Traffic (Last 6 Hours)">
              <SLineChart
                height={272}
                xData={['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']}
                yUnit="Mbps"
                series={[
                  { name: 'Download', data: [210, 295, 340, 280, 418, 365] },
                  { name: 'Upload', data: [64, 88, 102, 91, 134, 112] },
                ]}
              />
            </SCard>
          </Col>
        </Row>

        <SCard title="Radio Channel Utilization">
          <SChannelUtilization
            bands={[
              {
                key: '2.4g',
                label: '2.4 GHz',
                channels: [
                  { channel: 1, utilization: 28 },
                  { channel: 6, utilization: 46 },
                  { channel: 11, utilization: 19 },
                ],
              },
              {
                key: '5g',
                label: '5 GHz',
                channels: [
                  { channel: 36, utilization: 22 },
                  { channel: 44, utilization: 15 },
                  { channel: 149, utilization: 31 },
                ],
              },
            ]}
          />
        </SCard>
      </div>
    </SEmulatorShell>
  );
};

export const DashboardTemplate: React.FC = () => (
  <OmadaProvider defaultThemeMode="light">
    <SiteDashboardContent />
  </OmadaProvider>
);
