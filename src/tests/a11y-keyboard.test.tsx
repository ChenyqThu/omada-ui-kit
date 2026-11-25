import { act, createRef, useState } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OmadaProvider,
  SCascader,
  SCategoryKpiCarousel,
  SCheckbox,
  SInput,
  SMasterDetailSplitBlock,
  SNumberInput,
  SPageHeader,
  SPasswordInput,
  SRadio,
  SSearchInput,
  SSelect,
  SSettingsPageShell,
  SSlider,
  SSwitch,
  STabs,
  STextArea,
  STile,
  STileGroup,
  STransfer,
  STreeSelect,
  useRovingFocus,
} from '@/omada';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('dark');
});

function RovingHarness({
  activeKey,
  orientation = 'horizontal',
  activationMode = 'automatic',
  loop = true,
  onActivate,
}: {
  activeKey?: string;
  orientation?: 'horizontal' | 'vertical' | 'both';
  activationMode?: 'automatic' | 'manual';
  loop?: boolean;
  onActivate: (key: string) => void;
}) {
  const items = [
    { key: 'first', disabled: false },
    { key: 'disabled-mid', disabled: true },
    { key: 'third', disabled: false },
  ];
  const { getItemProps } = useRovingFocus({
    items,
    activeKey,
    orientation,
    activationMode,
    loop,
    onActivate,
  });

  return (
    <div role="toolbar" aria-label="Roving toolbar">
      {items.map((item) => (
        <button key={item.key} type="button" {...getItemProps(item.key, { disabled: item.disabled })}>
          {item.key}
        </button>
      ))}
    </div>
  );
}

describe('Accessibility, Roving Focus, Scoped Theme & forwardRef', () => {
  it('assigns fallback tabIndex=0 when activeKey does not match and navigates skipping disabled items', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();

    render(<RovingHarness activeKey="non-existent" onActivate={onActivate} />);

    const first = screen.getByRole('button', { name: 'first' });
    const mid = screen.getByRole('button', { name: 'disabled-mid' });
    const third = screen.getByRole('button', { name: 'third' });

    expect(first).toHaveAttribute('tabindex', '0');
    expect(mid).toHaveAttribute('tabindex', '-1');
    expect(third).toHaveAttribute('tabindex', '-1');

    await user.tab();
    expect(first).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(third).toHaveFocus();
    expect(onActivate).toHaveBeenCalledWith('third');

    await user.keyboard('{ArrowRight}');
    expect(first).toHaveFocus();
    expect(onActivate).toHaveBeenCalledWith('first');

    await user.keyboard('{End}');
    expect(third).toHaveFocus();

    await user.keyboard('{Home}');
    expect(first).toHaveFocus();
  });

  it('supports manual activation mode in useRovingFocus (moves focus without firing onActivate until Enter/Space)', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();

    render(<RovingHarness activeKey="first" activationMode="manual" onActivate={onActivate} />);

    const first = screen.getByRole('button', { name: 'first' });
    const third = screen.getByRole('button', { name: 'third' });

    act(() => {
      first.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(third).toHaveFocus();
    expect(onActivate).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith('third');
  });

  it('forwards custom options.onFocus handler in useRovingFocus', () => {
    const onItemFocus = vi.fn();
    function FocusProbe() {
      const { getItemProps } = useRovingFocus({
        items: [{ key: 'only' }],
        activeKey: 'only',
      });
      return (
        <button type="button" {...getItemProps('only', { onFocus: onItemFocus })}>
          Only
        </button>
      );
    }
    render(<FocusProbe />);
    act(() => {
      screen.getByRole('button', { name: 'Only' }).focus();
    });
    expect(onItemFocus).toHaveBeenCalledTimes(1);
  });

  it('renders STabs page & filter variants with ARIA tabpanel linkage and roving focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function TabsDemo() {
      const [key, setKey] = useState('all');
      return (
        <OmadaProvider>
          <STabs
            variant="filter"
            aria-label="Device status filter"
            activeKey={key}
            onChange={(next) => {
              setKey(next);
              onChange(next);
            }}
            block
            items={[
              { key: 'all', label: 'All', count: 12, children: <div>All devices body</div> },
              {
                key: 'connected',
                label: 'Connected',
                dotColor: 'var(--omada-color-success)',
                count: 10,
                children: <div>Connected body</div>,
              },
              { key: 'offline', label: 'Offline', count: 2, disabled: true },
            ]}
          />
          <STabs
            variant="page"
            size="lg"
            bordered={false}
            aria-label="Page sections"
            defaultActiveKey="overview"
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'clients', label: 'Clients' },
            ]}
          />
        </OmadaProvider>
      );
    }

    render(<TabsDemo />);

    const filterTablist = screen.getByRole('tablist', { name: 'Device status filter' });
    const allTab = within(filterTablist).getByRole('tab', { name: 'All (12)' });
    const connectedTab = within(filterTablist).getByRole('tab', { name: 'Connected (10)' });
    const panel = screen.getByRole('tabpanel');

    expect(allTab.getAttribute('aria-controls')).toBe(panel.getAttribute('id'));
    expect(panel.getAttribute('aria-labelledby')).toBe(allTab.getAttribute('id'));

    act(() => {
      allTab.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(connectedTab).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('connected');
    expect(screen.getByText('Connected body')).toBeInTheDocument();
  });

  it('binds SSwitch description to aria-describedby', () => {
    render(
      <OmadaProvider>
        <SSwitch
          label="Enable Band Steering"
          description="Steers dual-band clients toward 5 GHz."
          defaultChecked
        />
      </OmadaProvider>,
    );

    const sw = screen.getByRole('switch');
    const describedBy = sw.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl).not.toBeNull();
    expect(descEl?.textContent).toContain('Steers dual-band clients');
  });

  it('supports keyboard roving focus on SCategoryKpiCarousel, STileGroup (options & children), and SMasterDetailSplitBlock', async () => {
    const user = userEvent.setup();
    const onCategory = vi.fn();
    const onTileOpt = vi.fn();
    const onTileChild = vi.fn();
    const onMaster = vi.fn();

    render(
      <OmadaProvider>
        <SCategoryKpiCarousel
          items={[
            { key: 'overview', label: 'Overview', count: 3 },
            { key: 'wireless', label: 'Wireless', count: 1 },
          ]}
          defaultActiveKey="overview"
          onSelect={onCategory}
        />

        <STileGroup
          mode="single"
          aria-label="Radio tile options"
          defaultValue="auto"
          onChange={(v) => onTileOpt(v)}
          options={[
            { value: 'auto', title: 'Auto Mode' },
            { value: 'manual', title: 'Manual Mode' },
          ]}
        />

        <STileGroup
          mode="single"
          aria-label="Radio tile children"
          defaultValue="ch1"
          onChange={(v) => onTileChild(v)}
        >
          <STile value="ch1" title="Channel 1" />
          <STile value="ch6" title="Channel 6" disabled />
          <STile value="ch11" title="Channel 11" />
        </STileGroup>

        <SMasterDetailSplitBlock
          masterTitle="Profiles"
          items={[
            { key: 'lan', title: 'Default LAN' },
            { key: 'iot', title: 'IoT VLAN' },
          ]}
          activeKey="lan"
          onSelect={onMaster}
        >
          <div>Profile detail</div>
        </SMasterDetailSplitBlock>
      </OmadaProvider>,
    );

    // SCategoryKpiCarousel
    const catTablist = screen.getByRole('tablist', { name: 'Incident categories' });
    const overviewTab = within(catTablist).getByRole('tab', { name: /Overview/ });
    act(() => {
      overviewTab.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(onCategory).toHaveBeenCalledWith('wireless');

    // STileGroup with options
    const optGroup = screen.getByRole('radiogroup', { name: 'Radio tile options' });
    const autoRadio = within(optGroup).getByRole('radio', { name: 'Auto Mode' });
    act(() => {
      autoRadio.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(onTileOpt).toHaveBeenCalledWith('manual');

    // STileGroup with <STile> children (skipping disabled ch6)
    const childGroup = screen.getByRole('radiogroup', { name: 'Radio tile children' });
    const ch1Radio = within(childGroup).getByRole('radio', { name: 'Channel 1' });
    act(() => {
      ch1Radio.focus();
    });
    await user.keyboard('{ArrowRight}');
    expect(onTileChild).toHaveBeenCalledWith('ch11');

    // SMasterDetailSplitBlock vertical listbox
    const listbox = screen.getByRole('listbox', { name: 'Profiles' });
    const lanOption = within(listbox).getByRole('option', { name: /Default LAN/ });
    act(() => {
      lanOption.focus();
    });
    await user.keyboard('{ArrowDown}');
    expect(onMaster).toHaveBeenCalledWith('iot');
  });

  it('maintains single roving tab stop and keyboard expand/collapse/select on STransfer grouped tree', async () => {
    const user = userEvent.setup();

    render(
      <OmadaProvider>
        <STransfer
          grouped
          titles={['Available', 'Assigned']}
          dataSource={[
            { key: 'ap-1', title: 'EAP670-Lobby', group: 'aps', groupTitle: 'Access Points' },
            { key: 'ap-2', title: 'EAP650-Floor2', group: 'aps', groupTitle: 'Access Points' },
            { key: 'sw-1', title: 'SG3428X-Core', group: 'switches', groupTitle: 'Switches' },
          ]}
          targetKeys={[]}
        />
      </OmadaProvider>,
    );

    const trees = screen.getAllByRole('tree');
    const sourceTree = trees[0];
    const treeItems = within(sourceTree).getAllByRole('treeitem');

    const tabZeroItems = treeItems.filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabZeroItems).toHaveLength(1);

    // Inner checkboxes and buttons inside tree must have tabIndex=-1
    const innerInputs = sourceTree.querySelectorAll('input[type="checkbox"], button');
    innerInputs.forEach((node) => {
      expect(node.getAttribute('tabindex')).toBe('-1');
    });

    const firstGroup = treeItems[0];
    expect(firstGroup).toHaveAttribute('aria-expanded', 'true');
    act(() => {
      firstGroup.focus();
    });

    // Collapse group with ArrowLeft
    await user.keyboard('{ArrowLeft}');
    expect(firstGroup).toHaveAttribute('aria-expanded', 'false');

    // Re-expand group with ArrowRight
    await user.keyboard('{ArrowRight}');
    expect(firstGroup).toHaveAttribute('aria-expanded', 'true');

    // Move down to first leaf item and toggle selection with Space
    await user.keyboard('{ArrowDown}');
    const leafItem = within(sourceTree).getByRole('treeitem', { name: /EAP670-Lobby/ });
    expect(leafItem).toHaveFocus();
    expect(leafItem).toHaveAttribute('aria-selected', 'false');

    await user.keyboard(' ');
    expect(leafItem).toHaveAttribute('aria-selected', 'true');
  });

  it('isolates theme to .omada-scope, ignores host localStorage, and portals popups locally when syncDocumentTheme={false}', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    window.localStorage.setItem('omada-theme-mode', 'light');

    const { container } = render(
      <div>
        <div data-testid="light-host-wrap">
          <OmadaProvider defaultThemeMode="light" syncDocumentTheme={false}>
            <span>Light Scoped Child</span>
          </OmadaProvider>
        </div>
        <div data-testid="dark-host-wrap">
          <OmadaProvider defaultThemeMode="dark" syncDocumentTheme={false}>
            <SSelect
              aria-label="Scoped select"
              open
              options={[
                { value: 'vlan1', label: 'VLAN 1 (Management)' },
                { value: 'vlan10', label: 'VLAN 10 (Guest)' },
              ]}
            />
          </OmadaProvider>
        </div>
      </div>,
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const lightScope = container.querySelector('[data-testid="light-host-wrap"] .omada-scope');
    const darkScope = container.querySelector('[data-testid="dark-host-wrap"] .omada-scope');
    expect(lightScope).toHaveAttribute('data-theme', 'light');
    expect(darkScope).toHaveAttribute('data-theme', 'dark');
    expect(darkScope?.textContent).toContain('VLAN 1 (Management)');
    window.localStorage.removeItem('omada-theme-mode');
  });

  it('applies SSettingsPageShell quick-drawer clearance to both title and tabs rows and SPageHeader subtitle fallback', () => {
    render(
      <OmadaProvider>
        <SPageHeader title="AP Inventory" subtitle="Fallback subtitle text" />
        <SSettingsPageShell
          title="Wireless Settings"
          tabs={[
            { key: 'basic', label: 'Basic' },
            { key: 'advanced', label: 'Advanced' },
          ]}
          activeTab="basic"
        >
          <div>Settings content</div>
        </SSettingsPageShell>
      </OmadaProvider>,
    );

    expect(screen.getByText('Fallback subtitle text')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: 'Wireless Settings' });
    expect((heading.parentElement as HTMLElement).style.paddingRight).toBe('44px');
    const tablist = screen.getByRole('tablist', { name: 'Settings sections' });
    const tabsRowWrapper = tablist.closest('.mb-4') as HTMLElement | null;
    expect(tabsRowWrapper?.style.paddingRight).toBe('44px');
  });

  it('forwards refs across all 12 input and selection components', () => {
    const cascaderRef = createRef<any>();
    const checkboxRef = createRef<any>();
    const radioRef = createRef<any>();
    const selectRef = createRef<any>();
    const sliderRef = createRef<any>();
    const switchRef = createRef<HTMLButtonElement>();
    const treeSelectRef = createRef<any>();
    const inputRef = createRef<any>();
    const searchRef = createRef<any>();
    const passwordRef = createRef<any>();
    const numberRef = createRef<HTMLInputElement>();
    const textAreaRef = createRef<any>();

    render(
      <OmadaProvider>
        <SCascader ref={cascaderRef} options={[{ value: 'a', label: 'A' }]} />
        <SCheckbox ref={checkboxRef}>Check</SCheckbox>
        <SRadio ref={radioRef}>Radio</SRadio>
        <SSelect ref={selectRef} options={[{ value: '1', label: 'One' }]} />
        <SSlider ref={sliderRef} defaultValue={30} />
        <SSwitch ref={switchRef} aria-label="Ref switch" />
        <STreeSelect ref={treeSelectRef} treeData={[{ value: 'root', title: 'Root' }]} />
        <SInput ref={inputRef} aria-label="Ref input" />
        <SSearchInput ref={searchRef} aria-label="Ref search" />
        <SPasswordInput ref={passwordRef} aria-label="Ref password" />
        <SNumberInput ref={numberRef} aria-label="Ref number" />
        <STextArea ref={textAreaRef} aria-label="Ref textarea" />
      </OmadaProvider>,
    );

    expect(cascaderRef.current).not.toBeNull();
    expect(checkboxRef.current).not.toBeNull();
    expect(radioRef.current).not.toBeNull();
    expect(selectRef.current).not.toBeNull();
    expect(sliderRef.current).not.toBeNull();
    expect(switchRef.current).not.toBeNull();
    expect(treeSelectRef.current).not.toBeNull();
    expect(inputRef.current).not.toBeNull();
    expect(searchRef.current).not.toBeNull();
    expect(passwordRef.current).not.toBeNull();
    expect(numberRef.current).not.toBeNull();
    expect(textAreaRef.current).not.toBeNull();
  });
});
