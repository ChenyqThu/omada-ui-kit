import React, { useMemo, useState } from 'react';
import '@chenyqthu/omada-ui-kit/style.css';
import {
  Col,
  OmadaProvider,
  Row,
  SCategoryKpiCarousel,
  SDonutSummaryCard,
  SEmulatorShell,
  SFilterTableBlock,
  SPageHeader,
  STag,
  type ColumnsType,
  type STagColor,
} from '@chenyqthu/omada-ui-kit';

interface LogRow {
  key: string;
  time: string;
  category: string;
  severity: STagColor;
  event: string;
}

const LOG_ROWS: LogRow[] = [
  { key: '1', time: '2026-11-21 15:24:10', category: 'wireless', severity: 'orange', event: 'High channel interference detected on EAP650-Lobby (Ch 36)' },
  { key: '2', time: '2026-11-21 15:18:02', category: 'auth', severity: 'green', event: 'WPA-Enterprise 802.1X RADIUS session renewed for Finance-MacBook' },
  { key: '3', time: '2026-11-21 14:55:41', category: 'wan', severity: 'red', event: 'WAN2 link jitter exceeded 80 ms threshold for 45s' },
];

const AnalyticsLogsContent: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      LOG_ROWS.filter((r) => {
        const matchCat = category === 'all' || r.category === category;
        const matchSearch =
          !search.trim() || r.event.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [category, search],
  );

  const columns: ColumnsType<LogRow> = [
    { title: 'Time', dataIndex: 'time', key: 'time', width: 175 },
    {
      title: 'Level',
      dataIndex: 'severity',
      key: 'severity',
      width: 110,
      render: (c: STagColor) => (
        <STag color={c}>{c === 'red' ? 'Critical' : c === 'orange' ? 'Warning' : 'Normal'}</STag>
      ),
    },
    { title: 'Message', dataIndex: 'event', key: 'event' },
  ];

  return (
    <SEmulatorShell activeKey="incidents" onSelect={() => {}} controllerName="Headquarters Building">
      <div style={{ padding: '20px 24px' }}>
        <div style={{ paddingRight: 20 }}>
          <SPageHeader
            title="Incident & Event Analytics"
            description="Intelligent correlation across wireless, auth, and WAN anomalies"
          />
        </div>

        <div className="pr-9" style={{ marginBottom: 16 }}>
          <SCategoryKpiCarousel
            activeKey={category}
            onSelect={setCategory}
            items={[
              { key: 'all', label: 'All Incidents', count: LOG_ROWS.length },
              { key: 'wireless', label: 'RF & Wireless', count: 1 },
              { key: 'auth', label: 'Authentication', count: 1 },
              { key: 'wan', label: 'WAN & Uplink', count: 1 },
            ]}
          />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={9}>
            <SDonutSummaryCard
              title="Severity Breakdown"
              centerValue={String(LOG_ROWS.length)}
              centerLabel="Events"
              layout="horizontal"
              data={[
                { key: 'critical', label: 'Critical', value: 1, displayValue: '1' },
                { key: 'warning', label: 'Warning', value: 1, displayValue: '1' },
                { key: 'info', label: 'Info', value: 1, displayValue: '1' },
              ]}
            />
          </Col>
          <Col xs={24} lg={15}>
            <SFilterTableBlock<LogRow>
              title="Event Timeline"
              searchPlaceholder="Filter event message"
              searchValue={search}
              onSearchChange={setSearch}
              tableProps={{
                rowKey: 'key',
                dataSource: filtered,
                pagination: false,
                columns,
              }}
            />
          </Col>
        </Row>
      </div>
    </SEmulatorShell>
  );
};

export const AnalyticsLogsTemplate: React.FC = () => (
  <OmadaProvider defaultThemeMode="light">
    <AnalyticsLogsContent />
  </OmadaProvider>
);
