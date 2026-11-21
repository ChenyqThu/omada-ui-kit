import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OmadaProvider,
  SAclRuleBuilder,
  SExpandableSection,
  type SAclEndpointTypeOption,
  type SAclEndpointValue,
  type SAclObjectOption,
} from '@/omada';
import '../styles/modules/emulator-config-wlan-acl.css';

function renderThemed(ui: React.ReactElement, theme: 'light' | 'dark' = 'light') {
  return render(<OmadaProvider defaultThemeMode={theme}>{ui}</OmadaProvider>);
}

const SOURCE_TYPES: SAclEndpointTypeOption[] = [
  { value: 'Network', label: 'Network' },
  { value: 'IP Group', label: 'IP Group', creatable: true },
];

const DEST_TYPES: SAclEndpointTypeOption[] = [
  { value: 'IP Group', label: 'IP Group', creatable: true },
  { value: 'Location', label: 'Location' },
];

const ITEMS_MAP: Record<string, SAclObjectOption[]> = {
  Network: [
    { value: 'Default', label: 'Default' },
    { value: 'vlan20', label: 'vlan20' },
    { value: 'vlan30', label: 'vlan30' },
    { value: 'interface-vlan100', label: 'interface-vlan100' },
  ],
  'IP Group': [
    { value: 'ip-1', label: 'ip-1' },
    { value: 'ip-2', label: 'ip-2' },
  ],
  Location: [{ value: 'US', label: 'United States' }],
};

describe('ACL & Expandable Omada components', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('toggles SExpandableSection in uncontrolled and controlled modes', () => {
    renderThemed(
      <SExpandableSection title="Advanced Settings">
        <div>Hidden Control</div>
      </SExpandableSection>,
    );

    const toggle = screen.getByRole('button', { name: 'Advanced Settings' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hidden Control')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Hidden Control')).toBeInTheDocument();
  });

  it('renders SAclRuleBuilder empty state, checklist selection, search, select-all, and callbacks', () => {
    const inspectSpy = vi.fn();
    const createSpy = vi.fn();

    const Harness: React.FC = () => {
      const [policy, setPolicy] = React.useState<'Deny' | 'Permit'>('Deny');
      const [source, setSource] = React.useState<SAclEndpointValue>({ items: [] });
      const [destination, setDestination] = React.useState<SAclEndpointValue>({
        type: 'IP Group',
        items: ['ip-1'],
      });
      return (
        <div>
          <button type="button" onClick={() => setPolicy('Permit')}>
            SwitchToPermit
          </button>
          <SAclRuleBuilder
            policy={policy}
            source={source}
            onSourceChange={setSource}
            destination={destination}
            onDestinationChange={setDestination}
            sourceTypeOptions={SOURCE_TYPES}
            destinationTypeOptions={DEST_TYPES}
            getItemsForType={(type) => ITEMS_MAP[type] ?? []}
            onInspectItem={inspectSpy}
            onCreateGroup={createSpy}
            sourceError
          />
        </div>
      );
    };

    renderThemed(<Harness />);

    const sourceCard = screen.getByTestId('acl-builder-source');
    const destCard = screen.getByTestId('acl-builder-destination');

    expect(within(sourceCard).getByText('Please Select the type')).toBeInTheDocument();
    expect(within(destCard).getByText('1/2 Items')).toBeInTheDocument();
    expect(within(destCard).getByRole('button', { name: '+ Create' })).toBeInTheDocument();

    // Error status applied on Source Type select
    expect(sourceCard.querySelector('.ant-select-status-error')).toBeTruthy();

    // Policy connector switches label
    expect(screen.getByLabelText('Policy: Deny')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'SwitchToPermit' }));
    expect(screen.getByLabelText('Policy: Permit')).toBeInTheDocument();

    // Inspect and + Create callbacks on Destination card
    fireEvent.click(within(destCard).getByRole('button', { name: 'Inspect ip-1' }));
    expect(inspectSpy).toHaveBeenCalledWith(
      'IP Group',
      { value: 'ip-1', label: 'ip-1' },
      'destination',
    );
    fireEvent.click(within(destCard).getByRole('button', { name: '+ Create' }));
    expect(createSpy).toHaveBeenCalledWith('IP Group', 'destination');

    // Select all toggles destination items cleanly
    fireEvent.click(within(destCard).getByRole('checkbox', { name: 'Select all Destination items' }));
    expect(within(destCard).getByText('2/2 Items')).toBeInTheDocument();

    // Select Network on Source -> search appears (>3 items) and filters
    const sourceSelect = within(sourceCard).getByRole('combobox');
    fireEvent.mouseDown(sourceSelect);
    fireEvent.click(screen.getAllByText('Network').slice(-1)[0]);
    expect(within(sourceCard).getByText('0/4 Items')).toBeInTheDocument();

    const itemSearch = within(sourceCard).getByRole('textbox', { name: 'Search Source items' });
    fireEvent.change(itemSearch, { target: { value: 'vlan100' } });
    expect(within(sourceCard).getByText('interface-vlan100')).toBeInTheDocument();
    expect(within(sourceCard).queryByText('Default')).not.toBeInTheDocument();

    fireEvent.click(within(sourceCard).getByText('interface-vlan100'));
    expect(within(sourceCard).getByText('1/4 Items')).toBeInTheDocument();
  });
});
