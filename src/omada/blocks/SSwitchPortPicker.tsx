import React, { useMemo, useState } from 'react';
import { SButton } from '../components/SButton';
import { SPortPanel, type SPortItem } from '../components/SPortPanel';
import { SSelect } from '../components/SSelect';
import { STag } from '../components/STag';

export interface SSwitchPortDevice {
  id: string;
  name: string;
  model?: string;
  ports: SPortItem[];
}

export interface SSwitchPortPickerProps {
  /** Switch devices whose ports can be interactively picked. */
  switches: SSwitchPortDevice[];
  /** Controlled selection map `{ [switchId]: number[] }`. */
  value?: Record<string, number[]>;
  /** Uncontrolled initial selection map. */
  defaultValue?: Record<string, number[]>;
  /** Invoked whenever port selection changes across any switch. */
  onChange?: (next: Record<string, number[]>) => void;
  /** Shows the Omada port link speed legend beneath the panel (default `true`). */
  showLegend?: boolean;
  className?: string;
}

/**
 * Interactive multi-switch port selector composing a switch picker,
 * `<SPortPanel selectable />`, batch `Select All` / `Clear` actions, and summary tags.
 */
export const SSwitchPortPicker: React.FC<SSwitchPortPickerProps> = ({
  switches,
  value: controlledValue,
  defaultValue = {},
  onChange,
  showLegend = true,
  className = '',
}) => {
  const [activeSwitchId, setActiveSwitchId] = useState(() => switches[0]?.id ?? '');
  const [innerValue, setInnerValue] = useState<Record<string, number[]>>(defaultValue);

  const selectionMap = controlledValue ?? innerValue;
  const activeSwitch = useMemo(
    () => switches.find((s) => s.id === activeSwitchId) ?? switches[0],
    [switches, activeSwitchId],
  );

  const updateSelection = (nextMap: Record<string, number[]>) => {
    if (controlledValue === undefined) {
      setInnerValue(nextMap);
    }
    onChange?.(nextMap);
  };

  const activePorts = activeSwitch ? (selectionMap[activeSwitch.id] ?? []) : [];

  const summaryEntries = useMemo(
    () =>
      switches
        .map((sw) => ({
          id: sw.id,
          name: sw.name,
          ports: [...(selectionMap[sw.id] ?? [])].sort((a, b) => a - b),
        }))
        .filter((entry) => entry.ports.length > 0),
    [switches, selectionMap],
  );

  return (
    <div className={`omada-port-picker ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <SSelect
            aria-label="Select Switch"
            value={activeSwitch?.id}
            onChange={(val) => setActiveSwitchId(String(val))}
            options={switches.map((sw) => ({
              value: sw.id,
              label: sw.model ? `${sw.name} (${sw.model})` : sw.name,
            }))}
            style={{ width: 280 }}
          />
          <span className="text-xs text-[var(--omada-text-secondary)]">
            {activePorts.length} / {activeSwitch?.ports.length ?? 0} ports selected
          </span>
        </div>

        {activeSwitch && (
          <div className="flex items-center gap-2">
            <SButton
              size="small"
              variant="secondary"
              onClick={() =>
                updateSelection({
                  ...selectionMap,
                  [activeSwitch.id]: activeSwitch.ports.map((p) => p.id),
                })
              }
            >
              Select All
            </SButton>
            <SButton
              size="small"
              variant="secondary"
              disabled={activePorts.length === 0}
              onClick={() =>
                updateSelection({
                  ...selectionMap,
                  [activeSwitch.id]: [],
                })
              }
            >
              Clear
            </SButton>
          </div>
        )}
      </div>

      {activeSwitch && (
        <div className="rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-4">
          <SPortPanel
            ports={activeSwitch.ports}
            selectable
            selectedIds={activePorts}
            onSelectChange={(ids) =>
              updateSelection({
                ...selectionMap,
                [activeSwitch.id]: ids,
              })
            }
            showLegend={showLegend}
          />
        </div>
      )}

      {summaryEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {summaryEntries.map((entry) => (
            <STag key={entry.id} color="green">
              {entry.name}: Port {entry.ports.join(', ')}
            </STag>
          ))}
        </div>
      )}
    </div>
  );
};
