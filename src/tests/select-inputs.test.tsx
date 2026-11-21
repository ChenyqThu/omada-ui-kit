import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OmadaProvider } from '@/omada';
import {
  SCascader,
  SCheckbox,
  SCheckboxGroup,
  SColorPicker,
  SRadio,
  SRadioGroup,
  SSelect,
  SSlider,
  SSwitch,
  STreeSelect,
} from '../omada/modules/select-inputs';
import { SelectInputsSection } from '../showcase/sections/SelectInputsSection';

function renderWithProvider(
  ui: React.ReactElement,
  themeMode: 'light' | 'dark' = 'light',
) {
  return render(
    <OmadaProvider defaultThemeMode={themeMode}>{ui}</OmadaProvider>,
  );
}

describe('SSelect', () => {
  it('defaults to filled variant and renders removable tags in multiple mode', () => {
    const onChange = vi.fn();
    const { container } = renderWithProvider(
      <SSelect
        mode="multiple"
        value={['2.4g', '5g']}
        onChange={onChange}
        options={[
          { label: '2.4 GHz', value: '2.4g' },
          { label: '5 GHz', value: '5g' },
          { label: '6 GHz', value: '6g' },
        ]}
      />,
    );

    const selectEl = container.querySelector('.ant-select');
    expect(selectEl).toHaveClass('ant-select-filled');
    expect(selectEl).toHaveClass('omada-select');

    const removeButtons = screen.getAllByLabelText('Remove tag');
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['5g'], expect.anything());
  });

  it('renders sticky add-new footer inside popup and triggers onAddNew', () => {
    const onAddNew = vi.fn();
    renderWithProvider(
      <SSelect
        open
        addNewLabel="Add New VLAN"
        onAddNew={onAddNew}
        options={[
          {
            label: 'Corporate',
            value: 'corp',
            description: 'Main office subnet',
          },
        ]}
      />,
    );

    expect(screen.getByText('Main office subnet')).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: 'Add New VLAN' });
    fireEvent.click(addBtn);
    expect(onAddNew).toHaveBeenCalledTimes(1);
  });

  it('filters options by label and description when showSearch is enabled', async () => {
    renderWithProvider(
      <SSelect
        open
        showSearch
        options={[
          { label: 'WPA3-Personal', value: 'wpa3', description: 'SAE encryption' },
          { label: 'Open Portal', value: 'open', description: 'Captive guest portal' },
        ]}
      />,
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'Captive' } });

    await waitFor(() => {
      expect(screen.getByText('Open Portal')).toBeInTheDocument();
      expect(screen.queryByText('WPA3-Personal')).not.toBeInTheDocument();
    });
  });
});

describe('SCascader', () => {
  const options = [
    {
      value: 'hq',
      label: 'HQ Campus',
      children: [
        {
          value: 'fl-1',
          label: 'Floor 1',
        },
        {
          value: 'fl-2',
          label: 'Floor 2',
        },
      ],
    },
  ];

  it('defaults to filled variant and uses custom displaySeparator', () => {
    const { container } = renderWithProvider(
      <SCascader
        options={options}
        defaultValue={['hq', 'fl-1']}
        displaySeparator=">"
      />,
    );

    expect(container.querySelector('.ant-cascader')).toHaveClass('ant-select-filled');
    expect(screen.getByText('HQ Campus')).toBeInTheDocument();
    expect(screen.getByText('>')).toBeInTheDocument();
    expect(screen.getByText('Floor 1')).toBeInTheDocument();
  });

  it('renders removable Omada tags in multiple mode', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <SCascader
        multiple
        options={options}
        value={[['hq', 'fl-1']]}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Floor 1')).toBeInTheDocument();
    const removeBtn = screen.getByLabelText('Remove tag');
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith([], []);
  });
});

describe('STreeSelect', () => {
  const treeData = [
    {
      title: 'HQ Core',
      value: 'hq-core',
      children: [
        { title: 'ER8411 Gateway', value: 'er8411' },
        { title: 'EAP783 Access Point', value: 'eap783' },
      ],
    },
  ];

  it('renders filled checkable multi-select and filters via popupSearch bar', async () => {
    const { container } = renderWithProvider(
      <STreeSelect
        open
        treeCheckable
        popupSearch
        searchPlaceholder="Filter tree..."
        treeDefaultExpandAll
        defaultValue={['er8411']}
        treeData={treeData}
      />,
    );

    expect(container.querySelector('.ant-tree-select')).toHaveClass('ant-select-filled');
    expect(screen.getByLabelText('Remove tag')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Filter tree...');
    fireEvent.change(searchInput, { target: { value: 'EAP783' } });

    await waitFor(() => {
      expect(screen.getByText('EAP783 Access Point')).toBeInTheDocument();
    });
  });
});

describe('SCheckbox & SCheckboxGroup', () => {
  it('supports description, showSelectAll indeterminate state, and button variant', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <div>
        <SCheckbox description="Enables 802.11r fast transition">
          Fast Roaming
        </SCheckbox>
        <SCheckboxGroup
          showSelectAll
          selectAllLabel="All Protocols"
          defaultValue={['dhcp']}
          onChange={onChange}
          options={[
            { label: 'DHCP Guard', value: 'dhcp' },
            { label: 'mDNS', value: 'mdns' },
            { label: 'Locked', value: 'locked', disabled: true },
          ]}
        />
      </div>,
    );

    expect(screen.getByText('Enables 802.11r fast transition')).toBeInTheDocument();
    const selectAllCheckbox = screen.getByRole('checkbox', {
      name: 'All Protocols',
    }) as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);

    fireEvent.click(selectAllCheckbox);
    expect(onChange).toHaveBeenLastCalledWith(['dhcp', 'mdns']);

    fireEvent.click(selectAllCheckbox);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('toggles items in button variant', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <SCheckboxGroup
        variant="button"
        defaultValue={['5g']}
        onChange={onChange}
        options={[
          { label: '2.4 GHz', value: '2.4g' },
          { label: '5 GHz', value: '5g' },
        ]}
      />,
    );

    const cb24 = screen.getByRole('checkbox', { name: '2.4 GHz' });
    fireEvent.click(cb24);
    expect(onChange).toHaveBeenCalledWith(['5g', '2.4g']);
  });
});

describe('SRadio & SRadioGroup', () => {
  it('supports default descriptions, button variant, and capsule variant', () => {
    const onCapsuleChange = vi.fn();
    const { container } = renderWithProvider(
      <div>
        <SRadioGroup
          defaultValue="auto"
          options={[
            {
              label: 'Auto',
              value: 'auto',
              description: 'Recommended dynamic channel plan',
            },
            { label: 'Manual', value: 'manual' },
          ]}
        />
        <SRadioGroup
          variant="button"
          defaultValue="40"
          options={[
            { label: '20 MHz', value: '20' },
            { label: '40 MHz', value: '40' },
          ]}
        />
        <SRadioGroup
          variant="capsule"
          defaultValue="5g"
          onChange={(e) => onCapsuleChange(e.target.value)}
          options={[
            { label: '2.4 GHz', value: '2.4g' },
            { label: '5 GHz', value: '5g' },
            { label: '6 GHz', value: '6g' },
          ]}
        />
        <SRadio value="standalone" description="Standalone radio">
          Standalone
        </SRadio>
      </div>,
    );

    expect(screen.getByText('Recommended dynamic channel plan')).toBeInTheDocument();
    expect(container.querySelector('.omada-radio-button')).toBeInTheDocument();

    const radio6g = screen.getByRole('radio', { name: '6 GHz' });
    fireEvent.click(radio6g);
    expect(onCapsuleChange).toHaveBeenCalledWith('6g');
  });
});

describe('SSwitch', () => {
  it('renders medium/small geometry and toggles via companion label', () => {
    const onChange = vi.fn();
    const { container } = renderWithProvider(
      <div>
        <SSwitch
          label="Enable Band Steering"
          description="Steers dual-band clients to 5 GHz."
          defaultChecked={false}
          onChange={onChange}
        />
        <SSwitch size="small" defaultChecked />
      </div>,
    );

    expect(container.querySelector('.ant-switch-small')).toBeInTheDocument();
    expect(screen.getByText('Steers dual-band clients to 5 GHz.')).toBeInTheDocument();

    const sw = screen.getByRole('switch', { name: 'Enable Band Steering' });
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });
});

describe('SSlider', () => {
  it('clamps out-of-range manual numeric input back to [min, max] on blur', () => {
    const onChange = vi.fn();
    renderWithProvider(
      <SSlider showInput min={10} max={50} defaultValue={25} onChange={onChange} />,
    );

    const input = screen.getByLabelText('Slider numeric value') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenLastCalledWith(50);
    expect(input.value).toBe('50');

    fireEvent.change(input, { target: { value: '-10' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(input.value).toBe('10');
  });

  it('supports stepped presets, range dual inputs with blur clamping, and color-temp preset', () => {
    const onRangeChange = vi.fn();
    const { container } = renderWithProvider(
      <div>
        <SSlider stepPreset="levels" defaultValue={50} />
        <SSlider
          range
          showInput
          min={0}
          max={100}
          defaultValue={[20, 80]}
          onChange={onRangeChange}
        />
        <SSlider preset="color-temp" defaultValue={4500} min={2700} max={6500} />
      </div>,
    );

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    const minInput = screen.getByLabelText('Minimum slider value') as HTMLInputElement;
    const maxInput = screen.getByLabelText('Maximum slider value') as HTMLInputElement;
    expect(minInput).toHaveValue('20');
    expect(maxInput).toHaveValue('80');

    fireEvent.change(maxInput, { target: { value: '150' } });
    fireEvent.blur(maxInput);
    expect(onRangeChange).toHaveBeenLastCalledWith([20, 100]);
    expect(maxInput).toHaveValue('100');

    fireEvent.change(minInput, { target: { value: '120' } });
    fireEvent.blur(minInput);
    expect(onRangeChange).toHaveBeenLastCalledWith([100, 100]);
    expect(minInput).toHaveValue('100');

    expect(container.querySelector('.omada-slider-color-temp')).toHaveClass('omada-slider-solid');
  });
});

describe('SColorPicker', () => {
  it('renders filled trigger with uppercase hex readout, error status, and Omada preset swatches', () => {
    const { container } = renderWithProvider(
      <div>
        <SColorPicker open defaultValue="#00A870" />
        <SColorPicker status="error" defaultValue="#EE385C" />
      </div>,
    );

    const trigger = container.querySelector('.omada-color-picker');
    expect(trigger).toBeInTheDocument();
    expect(container.querySelector('.ant-color-picker-status-error')).toBeInTheDocument();
    expect(screen.getByText('#00A870')).toBeInTheDocument();
    expect(screen.getByText('Omada Brand & Status')).toBeInTheDocument();
    expect(screen.getByText('Neutrals & Topology')).toBeInTheDocument();
  });
});

describe('SelectInputsSection Showcase', () => {
  it('renders all sections cleanly in both Light and Dark themes', () => {
    const { unmount } = renderWithProvider(<SelectInputsSection />, 'light');
    expect(screen.getByText('Selection & Toggle Controls')).toBeInTheDocument();
    unmount();

    renderWithProvider(<SelectInputsSection />, 'dark');
    expect(screen.getByText('Selection & Toggle Controls')).toBeInTheDocument();
  });
});
