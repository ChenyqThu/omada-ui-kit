import React, { useMemo, useState } from 'react';
import { Checkbox, Input, Tooltip } from 'antd';
import { Info, Search } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import { SBuiltinIllustration } from '../assets/builtinIllustrations';
import { SSelect } from './SSelect';

export type SAclPolicy = 'Deny' | 'Permit';

export interface SAclObjectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SAclEndpointTypeOption {
  value: string;
  label: string;
  /** Shows a footer `+ Create` button inside the endpoint card when active. */
  creatable?: boolean;
}

export interface SAclEndpointValue {
  type?: string;
  items: string[];
}

export interface SAclRuleBuilderProps {
  /** Traffic rule policy governing the visual center arrow (`Deny` vs `Permit`). */
  policy: SAclPolicy;
  /** Current Source card type + checked item values. */
  source: SAclEndpointValue;
  /** Callback invoked when Source type or checked items change. */
  onSourceChange: (next: SAclEndpointValue) => void;
  /** Current Destination card type + checked item values. */
  destination: SAclEndpointValue;
  /** Callback invoked when Destination type or checked item values change. */
  onDestinationChange: (next: SAclEndpointValue) => void;
  /** Selectable endpoint types for the Source card. */
  sourceTypeOptions: SAclEndpointTypeOption[];
  /** Selectable endpoint types for the Destination card. */
  destinationTypeOptions: SAclEndpointTypeOption[];
  /** Returns checklist items belonging to the chosen endpoint type. */
  getItemsForType: (type: string, side: 'source' | 'destination') => SAclObjectOption[];
  /** Optional tooltip shown next to the Source card heading (e.g., EAP ACL). */
  sourceTooltip?: string;
  /** Optional tooltip shown next to the Destination card heading. */
  destinationTooltip?: string;
  /** Marks Source type selector with validation error border when true. */
  sourceError?: boolean;
  /** Marks Destination type selector with validation error border when true. */
  destinationError?: boolean;
  /** Invoked when the per-row detail icon button is clicked inside either card. */
  onInspectItem?: (type: string, item: SAclObjectOption, side: 'source' | 'destination') => void;
  /** Invoked when `+ Create` in a card footer is clicked (for creatable Group types). */
  onCreateGroup?: (type: string, side: 'source' | 'destination') => void;
  className?: string;
}

interface EndpointCardProps {
  side: 'source' | 'destination';
  title: string;
  tooltip?: string;
  value: SAclEndpointValue;
  typeOptions: SAclEndpointTypeOption[];
  items: SAclObjectOption[];
  hasError?: boolean;
  onChange: (next: SAclEndpointValue) => void;
  onInspectItem?: (type: string, item: SAclObjectOption, side: 'source' | 'destination') => void;
  onCreateGroup?: (type: string, side: 'source' | 'destination') => void;
}

const EndpointCard: React.FC<EndpointCardProps> = ({
  side,
  title,
  tooltip,
  value,
  typeOptions,
  items,
  hasError = false,
  onChange,
  onInspectItem,
  onCreateGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSet = useMemo(() => new Set(value.items), [value.items]);
  const selectedTypeMeta = useMemo(
    () => typeOptions.find((opt) => opt.value === value.type),
    [typeOptions, value.type],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const validSelectedCount = useMemo(
    () => items.filter((item) => selectedSet.has(item.value)).length,
    [items, selectedSet],
  );
  const allSelected = items.length > 0 && validSelectedCount === items.length;
  const indeterminate = validSelectedCount > 0 && validSelectedCount < items.length;

  const handleTypeChange = (nextType: string) => {
    setSearchQuery('');
    onChange({ type: nextType, items: [] });
  };

  const handleToggleItem = (itemValue: string, checked: boolean) => {
    if (checked) {
      if (selectedSet.has(itemValue)) return;
      onChange({ ...value, items: [...value.items, itemValue] });
    } else {
      onChange({ ...value, items: value.items.filter((v) => v !== itemValue) });
    }
  };

  const handleToggleAll = (checked: boolean) => {
    onChange({
      ...value,
      items: checked ? items.map((item) => item.value) : [],
    });
  };

  return (
    <div
      className="omada-acl-card"
      data-testid={`acl-builder-${side}`}
    >
      <div className="omada-acl-card-header">
        <div className="omada-acl-card-title-row">
          <span className="omada-acl-card-title">{title}</span>
          {tooltip && (
            <Tooltip title={tooltip}>
              <span className="omada-acl-info-icon" aria-label={`${title} help`}>
                <Info size={13} />
              </span>
            </Tooltip>
          )}
        </div>

        <label className="omada-acl-card-type-label" htmlFor={`acl-${side}-type-select`}>
          Type
        </label>
        <SSelect
          id={`acl-${side}-type-select`}
          aria-label={`${title} Type`}
          value={value.type || undefined}
          status={hasError ? 'error' : undefined}
          onChange={(next) => handleTypeChange(String(next))}
          options={typeOptions}
          className="w-full"
          placeholder=""
        />
      </div>

      <div className="omada-acl-card-body">
        {!value.type ? (
          <div className="omada-acl-card-empty">
            <SBuiltinIllustration name="no-data" width={88} />
            <span>Please Select the type</span>
          </div>
        ) : (
          <div className="omada-acl-card-list-wrap">
            {items.length > 3 && (
              <div className="omada-acl-card-search">
                <Input
                  variant="filled"
                  size="small"
                  aria-label={`Search ${title} items`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suffix={<Search size={13} className="text-[var(--omada-text-tertiary)]" />}
                />
              </div>
            )}

            <div className="omada-acl-card-scroll">
              {filteredItems.length === 0 ? (
                <div className="omada-acl-card-no-match">No matching items</div>
              ) : (
                filteredItems.map((item) => {
                  const checked = selectedSet.has(item.value);
                  return (
                    <div key={item.value} className="omada-acl-card-option">
                      <Checkbox
                        checked={checked}
                        onChange={(e) => handleToggleItem(item.value, e.target.checked)}
                        className="omada-acl-card-checkbox"
                      >
                        <span className="omada-acl-card-option-text" title={item.label}>
                          {item.label}
                        </span>
                      </Checkbox>
                      {onInspectItem && (
                        <Tooltip title="Inspect Object">
                          <button
                            type="button"
                            aria-label={`Inspect ${item.label}`}
                            onClick={() => onInspectItem(value.type!, item, side)}
                            className="omada-acl-card-inspect-btn"
                          >
                            <SIcon name="detail" size={16} />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="omada-acl-card-footer">
        {value.type ? (
          <>
            <Checkbox
              checked={allSelected}
              indeterminate={indeterminate}
              disabled={items.length === 0}
              onChange={(e) => handleToggleAll(e.target.checked)}
              aria-label={`Select all ${title} items`}
            >
              <span className="omada-acl-card-count">
                {validSelectedCount}/{items.length} Items
              </span>
            </Checkbox>

            {selectedTypeMeta?.creatable && onCreateGroup && (
              <button
                type="button"
                onClick={() => onCreateGroup(value.type!, side)}
                className="omada-acl-card-create-btn"
              >
                + Create
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Omada Controller v6.3 visual `Source → Policy Arrow → Destination` dual-card
 * selector used in Gateway ACL, Switch ACL, and EAP ACL rule configuration.
 */
export const SAclRuleBuilder: React.FC<SAclRuleBuilderProps> = ({
  policy,
  source,
  onSourceChange,
  destination,
  onDestinationChange,
  sourceTypeOptions,
  destinationTypeOptions,
  getItemsForType,
  sourceTooltip,
  destinationTooltip,
  sourceError = false,
  destinationError = false,
  onInspectItem,
  onCreateGroup,
  className = '',
}) => {
  const sourceItems = useMemo(
    () => (source.type ? getItemsForType(source.type, 'source') : []),
    [source.type, getItemsForType],
  );
  const destinationItems = useMemo(
    () => (destination.type ? getItemsForType(destination.type, 'destination') : []),
    [destination.type, getItemsForType],
  );

  return (
    <div className={`omada-acl-builder ${className}`.trim()}>
      <EndpointCard
        side="source"
        title="Source"
        tooltip={sourceTooltip}
        value={source}
        typeOptions={sourceTypeOptions}
        items={sourceItems}
        hasError={sourceError}
        onChange={onSourceChange}
        onInspectItem={onInspectItem}
        onCreateGroup={onCreateGroup}
      />

      <div className="omada-acl-connector" aria-label={`Policy: ${policy}`}>
        <span className="omada-acl-connector-label">{policy}</span>
        {policy === 'Permit' ? (
          <svg
            width="78"
            height="16"
            viewBox="0 0 78 16"
            fill="none"
            aria-hidden="true"
          >
            <line x1="2" y1="8" x2="70" y2="8" stroke="var(--omada-color-success)" strokeWidth="1.5" />
            <polygon points="76,8 68,4 68,12" fill="var(--omada-color-success)" />
          </svg>
        ) : (
          <svg
            width="78"
            height="24"
            viewBox="0 0 78 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 5 H72 V17"
              stroke="var(--omada-color-warning)"
              strokeWidth="1.5"
              fill="none"
            />
            <polygon points="72,22 68,15 76,15" fill="var(--omada-color-warning)" />
          </svg>
        )}
      </div>

      <EndpointCard
        side="destination"
        title="Destination"
        tooltip={destinationTooltip}
        value={destination}
        typeOptions={destinationTypeOptions}
        items={destinationItems}
        hasError={destinationError}
        onChange={onDestinationChange}
        onInspectItem={onInspectItem}
        onCreateGroup={onCreateGroup}
      />
    </div>
  );
};
