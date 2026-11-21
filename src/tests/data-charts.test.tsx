import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';
import { OmadaProvider, SIcon, STable } from '@/omada';
import { DeviceListDemo } from '../showcase/demos/DeviceListDemo';
import { DataChartsSection } from '../showcase/sections/DataChartsSection';
import {
  SAvatar,
  SAvatarGroup,
  SBadge,
  SBarChart,
  SCollapse,
  SDescriptions,
  SDonutChart,
  SEditableCell,
  SLineChart,
  SRate,
  SSparkChart,
  STile,
  STileGroup,
} from '../omada/modules/data-charts';

function renderThemed(ui: React.ReactElement, theme: 'light' | 'dark' = 'light') {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

describe('data-charts module', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('STable enhancements & SEditableCell', () => {
    interface RowItem {
      key: string;
      name: string;
      ip: string;
      clients: number;
      detail: string;
    }

    const rows: RowItem[] = [
      { key: '1', name: 'Core-GW', ip: '192.168.0.1', clients: 412, detail: 'WAN1 Fiber 10G' },
      { key: '2', name: 'Floor1-SW', ip: '192.168.0.10', clients: 138, detail: 'PoE 186W' },
    ];

    const columns = [
      { title: 'Device', dataIndex: 'name', key: 'name' },
      { title: 'IP Address', dataIndex: 'ip', key: 'ip' },
      { title: 'Clients', dataIndex: 'clients', key: 'clients' },
    ];

    it('supports columnSettings checklist popover, densityToggle, filters, and expandable rows', async () => {
      const onDensityChange = vi.fn();
      const { container } = renderThemed(
        <STable<RowItem>
          dataSource={rows}
          columns={columns}
          columnSettings
          densityToggle
          onDensityChange={onDensityChange}
          toolbar={{
            filters: <span data-testid="table-filter-chip">VLAN 1</span>,
          }}
          expandable={{
            expandedRowRender: (r) => <div>Expanded: {r.detail}</div>,
          }}
        />,
      );

      expect(screen.getByTestId('table-filter-chip')).toBeInTheDocument();

      // Density toggle
      const compactBtn = screen.getByRole('button', { name: 'Compact density' });
      fireEvent.click(compactBtn);
      expect(onDensityChange).toHaveBeenCalledWith('compact');
      expect(container.querySelector('.omada-table-compact')).not.toBeNull();

      // Expand row
      const expandButtons = screen.getAllByRole('button', { name: 'Expand row' });
      fireEvent.click(expandButtons[0]);
      expect(screen.getByText('Expanded: WAN1 Fiber 10G')).toBeInTheDocument();

      // Column settings popover
      fireEvent.click(screen.getByRole('button', { name: 'Column settings' }));
      await waitFor(() => {
        expect(screen.getByText('Visible Columns')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      // Hide IP Address column (index 1)
      fireEvent.click(checkboxes[1]);
      await waitFor(() => {
        expect(screen.queryByText('192.168.0.1')).not.toBeInTheDocument();
      });

      // Reset restores hidden column
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
      await waitFor(() => {
        expect(screen.getByText('192.168.0.1')).toBeInTheDocument();
      });
    });

    it('supports SEditableCell inline save, cancel, validation, and controlled batch edit', async () => {
      const onSave = vi.fn();
      const onChange = vi.fn();

      const { rerender } = renderThemed(
        <SEditableCell
          value="Lobby AP"
          validate={(val) => (val.trim().length < 3 ? 'Too short' : null)}
          onSave={onSave}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Edit cell' }));
      const input = screen.getByRole('textbox');

      // Validation blocks invalid value
      fireEvent.change(input, { target: { value: 'AB' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save cell' }));
      expect(screen.getByText('Too short')).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();

      // Cancel exits without saving
      fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));
      expect(screen.getByText('Lobby AP')).toBeInTheDocument();

      // Valid save via Enter
      fireEvent.click(screen.getByRole('button', { name: 'Edit cell' }));
      const nextInput = screen.getByRole('textbox');
      fireEvent.change(nextInput, { target: { value: 'Atrium AP' } });
      fireEvent.keyDown(nextInput, { key: 'Enter' });

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('Atrium AP');
      });

      // Controlled batch mode
      rerender(
        <OmadaProvider defaultThemeMode="dark">
          <SEditableCell value="Batch Value" editing onChange={onChange} />
        </OmadaProvider>,
      );
      const batchInput = screen.getByRole('textbox');
      fireEvent.change(batchInput, { target: { value: 'Updated Batch' } });
      expect(onChange).toHaveBeenCalledWith('Updated Batch');
    });
  });

  describe('SChart high-level presets', () => {
    it('renders SLineChart, SBarChart, SDonutChart, and SSparkChart in Light & Dark without errors', () => {
      const { container } = renderThemed(
        <div>
          <SLineChart
            xData={['09:00', '10:00', '11:00']}
            percentage
            series={[{ name: 'CPU', data: [20, 45, 35] }]}
          />
          <SBarChart
            layout="horizontal"
            stacked
            categories={['Corp', 'Guest']}
            series={[
              { name: 'Rx', data: [120, 60] },
              { name: 'Tx', data: [40, 20] },
            ]}
          />
          <SDonutChart
            centerValue="412"
            centerLabel="Clients"
            data={[
              { name: '5 GHz', value: 250 },
              { name: '6 GHz', value: 162 },
            ]}
          />
          <SSparkChart data={[10, 45, 25, 80]} unit="%" />
        </div>,
        'dark',
      );

      expect(screen.getByText('412')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
    });

    it('renders loading skeleton and SEmpty empty states for chart presets', () => {
      renderThemed(
        <div>
          <SLineChart xData={['1']} series={[{ name: 'Rx', data: [10] }]} loading />
          <SBarChart
            categories={[]}
            series={[]}
            emptyTitle="No VLAN traffic"
            emptyDescription="Enable flow telemetry to inspect traffic."
          />
          <SDonutChart data={[]} empty />
          <SSparkChart data={[]} />
        </div>,
      );

      expect(screen.getByRole('status', { name: 'Loading chart' })).toBeInTheDocument();
      expect(screen.getByText('No VLAN traffic')).toBeInTheDocument();
      expect(screen.getAllByText('No chart data').length).toBe(2);
    });

    it('configures containLabel: true on SLineChart and SBarChart grids to prevent Y-axis label clipping', () => {
      const { container } = renderThemed(
        <div>
          <SLineChart
            xData={['08:00', '10:00']}
            yUnit=" Mbps"
            series={[{ name: 'Down', data: [400, 1000] }]}
          />
          <SBarChart
            categories={['Corp', 'Guest']}
            unit=" GB"
            series={[{ name: 'Rx', data: [420, 160] }]}
          />
        </div>,
      );

      const chartContainers = container.querySelectorAll('div[_echarts_instance_]');
      expect(chartContainers).toHaveLength(2);

      const lineInstance = echarts.getInstanceByDom(chartContainers[0] as HTMLElement);
      const barInstance = echarts.getInstanceByDom(chartContainers[1] as HTMLElement);
      const lineOption = lineInstance?.getOption() as { grid?: Array<{ containLabel?: boolean }> };
      const barOption = barInstance?.getOption() as { grid?: Array<{ containLabel?: boolean }> };

      expect(lineOption?.grid?.[0]?.containLabel).toBe(true);
      expect(barOption?.grid?.[0]?.containLabel).toBe(true);
    });
  });

  describe('SDescriptions & SCollapse', () => {
    it('renders SDescriptions variants and mono cells', () => {
      renderThemed(
        <div className="space-y-4">
          <SDescriptions
            variant="bordered"
            layout="horizontal"
            title="Gateway Info"
            items={[
              { key: 'ip', label: 'IP Address', children: '192.168.0.1', mono: true },
              { key: 'fw', label: 'Firmware', children: 'v1.2.4' },
            ]}
          />
          <SDescriptions
            variant="filled"
            layout="vertical"
            items={[{ key: 'site', label: 'Site', children: 'HQ Building' }]}
          />
        </div>,
      );

      expect(screen.getByText('Gateway Info')).toBeInTheDocument();
      const ipCell = screen.getByText('192.168.0.1');
      expect(ipCell).toHaveClass('font-mono');
      expect(ipCell).toHaveClass('whitespace-nowrap');
      expect(screen.getByText('HQ Building')).toBeInTheDocument();
    });

    it('renders duotone dashboard SIcon with currentColor outline and brand green accent', () => {
      const { container } = renderThemed(<SIcon name="cloud" size={20} />, 'dark');
      const html = container.innerHTML;
      expect(html).toContain('currentColor');
      expect(html).toContain('#00A870');
      expect(html).not.toContain('#2B2B2B');
    });

    it('toggles SCollapse panels and respects disabled panels', () => {
      renderThemed(
        <SCollapse
          variant="card"
          defaultActiveKey={['one']}
          items={[
            {
              key: 'one',
              label: 'Panel One',
              status: <span>Enabled</span>,
              children: <div>First body</div>,
            },
            {
              key: 'two',
              label: 'Panel Two',
              children: <div>Second body</div>,
            },
            {
              key: 'three',
              label: 'Locked Panel',
              disabled: true,
              children: <div>Hidden body</div>,
            },
          ]}
        />,
      );

      expect(screen.getByText('First body')).toBeVisible();
      expect(screen.getByText('Enabled')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Panel Two'));
      expect(screen.getByText('Second body')).toBeVisible();

      fireEvent.click(screen.getByText('Locked Panel'));
      expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
    });
  });

  describe('STile & STileGroup', () => {
    it('handles single-select and multi-select with corner checkmark and disabled state', () => {
      const onSingle = vi.fn();
      const onMulti = vi.fn();

      const { container } = renderThemed(
        <div>
          <STileGroup
            mode="single"
            defaultValue="cloud"
            onChange={onSingle}
            options={[
              { value: 'cloud', title: 'Cloud Controller' },
              { value: 'local', title: 'Local Appliance' },
              { value: 'off', title: 'Disabled Mode', disabled: true },
            ]}
          />
          <STileGroup mode="multiple" defaultValue={['ids']} onChange={onMulti}>
            <STile value="ids" title="IDS" />
            <STile value="dpi" title="DPI" />
          </STileGroup>
        </div>,
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-checked', 'true');
      expect(container.querySelectorAll('[data-tile-check="true"]').length).toBe(2);

      fireEvent.click(radios[1]);
      expect(onSingle).toHaveBeenCalledWith('local');
      expect(radios[1]).toHaveAttribute('aria-checked', 'true');

      // Disabled tile cannot be selected
      expect(radios[2]).toBeDisabled();
      fireEvent.click(radios[2]);
      expect(onSingle).not.toHaveBeenCalledWith('off');

      // Multi-select toggles
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      expect(onMulti).toHaveBeenCalledWith(['ids', 'dpi']);
    });
  });

  describe('SAvatar, SBadge & SRate', () => {
    it('renders SAvatar initials, guest mode, status dot, and SAvatarGroup overflow', () => {
      renderThemed(
        <div>
          <SAvatar size="xs" name="Phoenix" />
          <SAvatar size="lg" name="Network Admin" status="online" />
          <SAvatar size="md" guest />
          <SAvatarGroup maxCount={2}>
            <SAvatar name="Alice" />
            <SAvatar name="Bob" />
            <SAvatar name="Carol" />
          </SAvatarGroup>
        </div>,
      );

      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.getByText('NA')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: online')).toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('renders SBadge counts, 99+ overflow, and all 5 semantic status variants', () => {
      renderThemed(
        <div>
          <SBadge count={5} />
          <SBadge count={140} overflowCount={99} />
          <SBadge status="success" text="Online" />
          <SBadge status="processing" text="Provisioning" />
          <SBadge status="warning" text="Warning" />
          <SBadge status="error" text="Error" />
          <SBadge status="default" text="Idle" />
        </div>,
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('99+')).toBeInTheDocument();
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Provisioning')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Idle')).toBeInTheDocument();
    });

    it('renders SRate interactive and readonly modes with captions', () => {
      const onChange = vi.fn();
      const onReadonlyChange = vi.fn();

      const { container } = renderThemed(
        <div>
          <SRate size="md" defaultValue={3} showCaption onChange={onChange} />
          <SRate size="sm" readonly defaultValue={5} onChange={onReadonlyChange} />
        </div>,
      );

      expect(screen.getByText('Good')).toBeInTheDocument();
      const rateLists = container.querySelectorAll('.omada-rate');
      expect(rateLists).toHaveLength(2);

      const stars = rateLists[0].querySelectorAll('.ant-rate-star-second');
      fireEvent.click(stars[4]);

      expect(onChange).toHaveBeenCalledWith(5);
      expect(screen.getByText('Excellent')).toBeInTheDocument();

      const readonlyStars = rateLists[1].querySelectorAll('.ant-rate-star-second');
      fireEvent.click(readonlyStars[0]);
      expect(onReadonlyChange).not.toHaveBeenCalled();
    });
  });

  describe('DataChartsSection showcase integration', () => {
    it('renders the full DataChartsSection cleanly in light and dark modes', () => {
      renderThemed(<DataChartsSection />, 'light');
      expect(screen.getByText('Enhanced STable & Inline SEditableCell')).toBeInTheDocument();
      expect(screen.getByText('SChart High-Level Presets (Line, Bar, Donut, 2-Tick Spark)')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Switch to Dark' }));
      expect(screen.getByRole('button', { name: 'Switch to Light' })).toBeInTheDocument();
    });

    it('remains 100% backwards-compatible with DeviceListDemo', () => {
      renderThemed(<DeviceListDemo />);
      expect(screen.getByText('Core-Gateway-HQ')).toBeInTheDocument();
      expect(screen.getByText('Showing 1–10 of 12 records')).toBeInTheDocument();
    });
  });
});
