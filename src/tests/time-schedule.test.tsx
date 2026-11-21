/// <reference types="node" />
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OmadaProvider, SPasswordInput } from '@/omada';
import type { PasswordRuleConfig } from '../omada/components/SInput';
import {
  SDatePicker,
  SRangePicker,
  SSchedule,
  STimePicker,
  STimeRangePicker,
  STransfer,
  SUpload,
  createEmptySchedule,
  createPickerDate,
  createSchedulePreset,
  formatOmadaDateRange,
  formatScheduleSummary,
  validateUploadFile,
  type SScheduleMatrix,
  type STransferItem,
} from '../omada/modules/time-schedule';
import { TimeScheduleSection } from '../showcase/sections/TimeScheduleSection';

const renderWithOmada = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') =>
  render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);

describe('SPasswordInput with showRules', () => {
  afterEach(() => {
    cleanup();
  });

  it('displays default live password validation rules and updates pass/fail state on input', () => {
    renderWithOmada(
      <SPasswordInput
        showStrength
        showRules
        placeholder="Enter password"
      />,
    );

    const input = screen.getByPlaceholderText('Enter password');
    const ruleItems = screen.getAllByRole('listitem');
    expect(ruleItems).toHaveLength(4);
    ruleItems.forEach((item) => {
      expect(item).toHaveAttribute('data-rule-passed', 'false');
    });

    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.getByText('Weak')).toBeInTheDocument();
    expect(
      document.querySelector('[data-rule-key="minLength"]'),
    ).toHaveAttribute('data-rule-passed', 'false');

    fireEvent.change(input, { target: { value: 'Omada2026!' } });
    expect(screen.getByText('Very Strong')).toBeInTheDocument();
    expect(
      document.querySelector('[data-rule-key="minLength"]'),
    ).toHaveAttribute('data-rule-passed', 'true');
    expect(
      document.querySelector('[data-rule-key="mixedCase"]'),
    ).toHaveAttribute('data-rule-passed', 'true');
    expect(
      document.querySelector('[data-rule-key="digit"]'),
    ).toHaveAttribute('data-rule-passed', 'true');
    expect(
      document.querySelector('[data-rule-key="special"]'),
    ).toHaveAttribute('data-rule-passed', 'true');
  });

  it('supports custom PasswordRuleConfig[] rules', () => {
    const customRules: PasswordRuleConfig[] = [
      {
        key: 'prefix',
        label: 'Starts with omada-',
        validate: (v) => v.startsWith('omada-'),
      },
      {
        key: 'noSpace',
        label: 'No whitespace allowed',
        validate: (v) => !/\s/.test(v),
      },
    ];

    renderWithOmada(
      <SPasswordInput
        showRules
        rules={customRules}
        defaultValue="omada-secret"
      />,
    );

    expect(screen.getByText('Starts with omada-')).toBeInTheDocument();
    expect(
      document.querySelector('[data-rule-key="prefix"]'),
    ).toHaveAttribute('data-rule-passed', 'true');
    expect(
      document.querySelector('[data-rule-key="noSpace"]'),
    ).toHaveAttribute('data-rule-passed', 'true');
  });
});

describe('SDatePicker, SRangePicker, STimePicker & STimeRangePicker', () => {
  afterEach(() => {
    cleanup();
  });

  it('formats Omada date ranges consistently for same-month, cross-month, and cross-year', () => {
    expect(
      formatOmadaDateRange(new Date(2024, 4, 5), new Date(2024, 4, 10)),
    ).toBe('May 5 - 10, 2024');
    expect(
      formatOmadaDateRange(new Date(2024, 4, 5), new Date(2024, 5, 10)),
    ).toBe('May 5 - Jun 10, 2024');
    expect(
      formatOmadaDateRange(new Date(2024, 4, 5), new Date(2025, 4, 4)),
    ).toBe('May 5, 2024 - May 4, 2025');
    expect(
      formatOmadaDateRange(new Date(2024, 4, 5), new Date(2024, 4, 5)),
    ).toBe('May 5, 2024');
  });

  it('renders filled SDatePicker and capsule SRangePicker presets (1D / 1W / 1M)', () => {
    const onPresetChange = vi.fn();
    const onChange = vi.fn();

    renderWithOmada(
      <div className="space-y-3">
        <SDatePicker placeholder="Pick date" />
        <SRangePicker
          capsule
          onPresetChange={onPresetChange}
          onChange={onChange}
        />
      </div>,
    );

    const pickerInput = screen.getByPlaceholderText('Pick date');
    expect(pickerInput.closest('.ant-picker-filled')).not.toBeNull();

    const btn1W = screen.getByRole('button', { name: '1W' });
    const btn1M = screen.getByRole('button', { name: '1M' });
    fireEvent.click(btn1W);
    expect(onPresetChange).toHaveBeenCalledWith(
      '1w',
      expect.arrayContaining([expect.any(Date), expect.any(Date)]),
    );
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.click(btn1M);
    expect(onPresetChange).toHaveBeenLastCalledWith(
      '1m',
      expect.arrayContaining([expect.any(Date), expect.any(Date)]),
    );
  });

  it('opens standard SRangePicker quick presets and selects Last 7 Days cleanly', () => {
    const onChange = vi.fn();
    renderWithOmada(
      <SRangePicker
        defaultValue={[
          createPickerDate(new Date(2024, 4, 1)),
          createPickerDate(new Date(2024, 4, 5)),
        ]}
        onChange={onChange}
      />,
    );

    const startInput = screen.getByPlaceholderText('Start Date');
    fireEvent.mouseDown(startInput);
    fireEvent.click(startInput);

    const preset7d = screen.getByText('Last 7 Days');
    expect(preset7d).toBeInTheDocument();
    fireEvent.click(preset7d);
    expect(onChange).toHaveBeenCalledTimes(1);
    const [range] = onChange.mock.calls[0];
    expect(range).toHaveLength(2);
    expect(range[0].isValid()).toBe(true);
    expect(range[1].isValid()).toBe(true);
  });

  it('opens capsule Custom range trigger popup and toggles cleanly', () => {
    renderWithOmada(<SRangePicker capsule />);

    const customBtn = screen.getByRole('button', { name: 'Custom date range' });
    fireEvent.mouseDown(customBtn);
    fireEvent.click(customBtn);

    expect(customBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
  });

  it('renders STimePicker and STimeRangePicker in filled mode with 24h and 12h options and opens wheel popup', () => {
    renderWithOmada(
      <div>
        <STimePicker placeholder="Pick time" />
        <STimePicker use12Hours placeholder="Pick 12h time" />
        <STimeRangePicker />
      </div>,
    );

    const single = screen.getByPlaceholderText('Pick time');
    expect(single.closest('.ant-picker-filled')).not.toBeNull();
    expect(screen.getByPlaceholderText('Pick 12h time')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Start Time')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('End Time')).toBeInTheDocument();

    fireEvent.mouseDown(single);
    fireEvent.click(single);
    expect(document.querySelector('.omada-timepicker-popup')).not.toBeNull();
  });
});

describe('STransfer', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleItems: STransferItem[] = [
    { key: 'a', title: 'AP-Lobby' },
    { key: 'b', title: 'AP-Hallway' },
    { key: 'c', title: 'SW-Core' },
    { key: 'd', title: 'GW-Main' },
    { key: 'e', title: 'OC300' },
  ];

  it('filters by search query, shows item counts, and transfers selected items', () => {
    const onChange = vi.fn();
    renderWithOmada(
      <STransfer
        dataSource={sampleItems}
        targetKeys={['e']}
        onChange={onChange}
        pagination={{ pageSize: 3 }}
      />,
    );

    expect(screen.getByText('Unselected')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText('0/4')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();

    const searchInputs = screen.getAllByPlaceholderText('Search');
    fireEvent.change(searchInputs[0], { target: { value: 'SW-' } });
    expect(screen.getByText('SW-Core')).toBeInTheDocument();
    expect(screen.queryByText('AP-Lobby')).toBeNull();

    fireEvent.click(screen.getByText('SW-Core'));
    const moveRightBtn = document.querySelector('.ant-transfer-actions button');
    expect(moveRightBtn).not.toBeNull();
    fireEvent.click(moveRightBtn as HTMLButtonElement);

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(['e', 'c']),
      'right',
      ['c'],
    );
  });

  it('supports 2-level grouped tree mode and group checkbox selection', () => {
    const onChange = vi.fn();
    const groupedData: STransferItem[] = [
      {
        key: 'vlans',
        title: 'VLANs',
        children: [
          { key: 'v10', title: 'VLAN 10' },
          { key: 'v20', title: 'VLAN 20' },
        ],
      },
      {
        key: 'ssids',
        title: 'SSIDs',
        children: [{ key: 's1', title: 'Corp-WiFi' }],
      },
    ];

    renderWithOmada(
      <STransfer
        grouped
        dataSource={groupedData}
        targetKeys={[]}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('VLANs')).toBeInTheDocument();
    expect(screen.getByText('VLAN 10')).toBeInTheDocument();

    const collapseBtn = screen.getByRole('button', { name: 'Collapse VLANs' });
    fireEvent.click(collapseBtn);
    expect(screen.queryByText('VLAN 10')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Expand VLANs' }));
    expect(screen.getByText('VLAN 10')).toBeInTheDocument();

    const groupCheckbox = screen.getByLabelText('Select group VLANs');
    fireEvent.click(groupCheckbox);

    const moveRightBtn = document.querySelector('.ant-transfer-actions button');
    fireEvent.click(moveRightBtn as HTMLButtonElement);

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(['v10', 'v20']),
      'right',
      expect.arrayContaining(['v10', 'v20']),
    );
  });
});

describe('SUpload', () => {
  afterEach(() => {
    cleanup();
  });

  it('validates file extensions and size limits accurately via validateUploadFile', () => {
    const validFw = { name: 'er8411.bin', size: 1024 * 1024, type: 'application/octet-stream' };
    expect(
      validateUploadFile(validFw, { accept: '.bin,.img', maxSizeBytes: 5 * 1024 * 1024 }),
    ).toEqual({ valid: true });

    const badExt = { name: 'notes.txt', size: 512, type: 'text/plain' };
    const extRes = validateUploadFile(badExt, { accept: '.bin,.img', maxSizeBytes: 5 * 1024 * 1024 });
    expect(extRes.valid).toBe(false);
    expect(extRes.reason).toBe('accept');

    const tooBig = { name: 'huge.bin', size: 60 * 1024 * 1024, type: 'application/octet-stream' };
    const sizeRes = validateUploadFile(tooBig, { accept: '.bin,.img', maxSizeBytes: 50 * 1024 * 1024 });
    expect(sizeRes.valid).toBe(false);
    expect(sizeRes.reason).toBe('size');
  });

  it('blocks invalid files with explicit alert feedback and supports Download Template', async () => {
    const onValidationError = vi.fn();
    const onDownloadTemplate = vi.fn();

    const { container } = renderWithOmada(
      <div className="space-y-4">
        <SUpload
          preset="config"
          templateText="Download Template"
          onDownloadTemplate={onDownloadTemplate}
          onValidationError={onValidationError}
        />
        <SUpload variant="dragger" preset="firmware" />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Download Template/i }));
    expect(onDownloadTemplate).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('Click or drag firmware file to this area to upload'),
    ).toBeInTheDocument();

    const getFileInput = () =>
      container.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(['hello'], 'bad.exe', { type: 'application/x-msdownload' });
    await act(async () => {
      fireEvent.change(getFileInput(), { target: { files: [badFile] } });
    });

    expect(onValidationError).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported file type'),
      badFile,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unsupported file type');

    // Oversized valid extension is also blocked with size error
    const bigConfig = new File(['x'], 'big.cfg', { type: 'text/plain' });
    Object.defineProperty(bigConfig, 'size', { value: 20 * 1024 * 1024 });
    await act(async () => {
      fireEvent.change(getFileInput(), { target: { files: [bigConfig] } });
    });
    expect(screen.getByRole('alert')).toHaveTextContent('exceeds the 10.0 MB size limit');

    // Valid config file clears alert
    const okConfig = new File(['vlan 10'], 'site.cfg', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(getFileInput(), { target: { files: [okConfig] } });
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('SSchedule (7×24 Weekly Matrix)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders 168 hourly cells, supports click toggle, hover tooltip, and quick presets', () => {
    const onChange = vi.fn();
    renderWithOmada(<SSchedule onChange={onChange} />);

    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(168);

    const mon9 = screen.getByRole('gridcell', { name: 'Mon 09:00–10:00' });
    fireEvent.mouseEnter(mon9);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Mon 09:00–10:00');

    fireEvent.click(mon9);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mon: [9],
      }),
    );
    expect(mon9).toHaveAttribute('data-active', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Workdays 9–18' }));
    const workdaysExpected = createSchedulePreset('workdays');
    expect(onChange).toHaveBeenLastCalledWith(workdaysExpected);
    expect(formatScheduleSummary(workdaysExpected)).toBe(
      'Mon–Fri 09:00–18:00 (45 / 168 hrs)',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenLastCalledWith(createEmptySchedule());
  });

  it('supports pointer-drag rectangular paint and erase', () => {
    const onChange = vi.fn();
    renderWithOmada(<SSchedule onChange={onChange} />);

    // Drag rectangle Mon 09:00 -> Tue 10:00 (2 days × 2 hours = 4 cells painted)
    const mon9 = screen.getByRole('gridcell', { name: 'Mon 09:00–10:00' });
    const tue10 = screen.getByRole('gridcell', { name: 'Tue 10:00–11:00' });

    fireEvent.pointerDown(mon9, { button: 0, pointerType: 'mouse' });
    fireEvent.pointerEnter(tue10);
    fireEvent.pointerUp(tue10);

    const painted: SScheduleMatrix = onChange.mock.calls.at(-1)?.[0];
    expect(painted.mon).toEqual([9, 10]);
    expect(painted.tue).toEqual([9, 10]);
    expect(painted.wed).toEqual([]);

    // Drag starting on active Mon 09:00 -> Tue 09:00 erases those cells
    const tue9 = screen.getByRole('gridcell', { name: 'Tue 09:00–10:00' });
    fireEvent.pointerDown(mon9, { button: 0, pointerType: 'mouse' });
    fireEvent.pointerEnter(tue9);
    fireEvent.pointerUp(tue9);

    const erased: SScheduleMatrix = onChange.mock.calls.at(-1)?.[0];
    expect(erased.mon).toEqual([10]);
    expect(erased.tue).toEqual([10]);
  });

  it('supports keyboard navigation/toggle and respects readOnly and disabled modes', () => {
    const onChange = vi.fn();
    const { unmount } = renderWithOmada(<SSchedule onChange={onChange} />);

    const mon0 = screen.getByRole('gridcell', { name: 'Mon 00:00–01:00' });
    act(() => {
      mon0.focus();
    });
    fireEvent.keyDown(mon0, { key: 'ArrowRight' });
    const mon1 = screen.getByRole('gridcell', { name: 'Mon 01:00–02:00' });
    expect(document.activeElement).toBe(mon1);

    fireEvent.keyDown(mon1, { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ mon: [1] }),
    );
    unmount();

    const roChange = vi.fn();
    renderWithOmada(
      <SSchedule readOnly defaultValue={createSchedulePreset('weekends')} onChange={roChange} />,
      'dark',
    );
    const sat0 = screen.getByRole('gridcell', { name: 'Sat 00:00–01:00' });
    expect(sat0).toHaveAttribute('data-active', 'true');
    fireEvent.click(sat0);
    expect(roChange).not.toHaveBeenCalled();
  });
});

describe('TimeScheduleSection Showcase (Light & Dark, zero AntD warnings)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders cleanly in both Light and Dark themes without React or AntD deprecation errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { unmount } = renderWithOmada(<TimeScheduleSection />, 'light');
    expect(screen.getByText('Time, Schedule, Transfer & Upload')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount();

    renderWithOmada(<TimeScheduleSection />, 'dark');
    expect(screen.getByText('Time, Schedule, Transfer & Upload')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
