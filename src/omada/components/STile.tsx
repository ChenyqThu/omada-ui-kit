import React, { createContext, useContext, useState } from 'react';
import { Check } from 'lucide-react';

export type STileSelectionMode = 'single' | 'multiple';
export type STileLayout = 'horizontal' | 'vertical';

export interface STileOption {
  value: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface STileGroupContextValue {
  mode: STileSelectionMode;
  selectedValues: string[];
  toggleValue: (val: string) => void;
  layout?: STileLayout;
  size?: 'sm' | 'md';
  indicator?: 'corner-check' | 'check' | 'none';
  disabled?: boolean;
}

const STileGroupContext = createContext<STileGroupContextValue | null>(null);

export interface STileProps {
  /** Option identifier when used inside `<STileGroup>`. */
  value?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  /** Controlled selection state when used standalone. */
  checked?: boolean;
  /** Default uncontrolled selection state when used standalone. */
  defaultChecked?: boolean;
  /** Change callback when used standalone. */
  onChange?: (checked: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  layout?: STileLayout;
  size?: 'sm' | 'md';
  indicator?: 'corner-check' | 'check' | 'none';
  selectionMode?: STileSelectionMode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Selectable Omada option tile (`Normal`, `Hover`, `Selected` green border + corner checkmark,
 * `Disabled`) usable standalone or inside `<STileGroup>`.
 */
export const STile: React.FC<STileProps> = ({
  value,
  title,
  description,
  icon,
  badge,
  checked,
  defaultChecked = false,
  onChange,
  onClick,
  disabled,
  layout,
  size,
  indicator,
  selectionMode,
  className = '',
  style,
}) => {
  const group = useContext(STileGroupContext);
  const [innerChecked, setInnerChecked] = useState(defaultChecked);

  const isGrouped = Boolean(group && value !== undefined);
  const resolvedMode = selectionMode ?? group?.mode ?? 'single';
  const resolvedLayout = layout ?? group?.layout ?? 'horizontal';
  const resolvedSize = size ?? group?.size ?? 'md';
  const resolvedIndicator = indicator ?? group?.indicator ?? 'corner-check';
  const isDisabled = Boolean(disabled || group?.disabled);

  const isSelected = isGrouped
    ? group!.selectedValues.includes(value!)
    : (checked ?? innerChecked);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isDisabled) return;
    if (isGrouped) {
      group!.toggleValue(value!);
    } else {
      const next = !isSelected;
      if (checked === undefined) {
        setInnerChecked(next);
      }
      onChange?.(next);
    }
    onClick?.(e);
  };

  const isSmall = resolvedSize === 'sm';
  const isVertical = resolvedLayout === 'vertical';

  return (
    <button
      type="button"
      role={resolvedMode === 'multiple' ? 'checkbox' : 'radio'}
      aria-checked={isSelected}
      disabled={isDisabled}
      onClick={handleClick}
      style={style}
      className={`group relative overflow-hidden rounded-lg border text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--omada-brand)] ${
        isSmall ? 'px-3 py-2' : 'px-4 py-3.5'
      } ${
        isDisabled
          ? 'cursor-not-allowed border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] opacity-55'
          : isSelected
            ? 'cursor-pointer border-[var(--omada-brand)] bg-[var(--omada-brand-bg-subtlest)] ring-1 ring-[var(--omada-brand)]/20'
            : 'cursor-pointer border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] hover:border-[var(--omada-brand)] hover:bg-[var(--omada-bg-field)]'
      } ${className}`.trim()}
    >
      {isSelected && resolvedIndicator === 'corner-check' && (
        <span
          data-tile-check="true"
          aria-hidden="true"
          className={`absolute top-0 right-0 flex items-center justify-center rounded-bl-lg bg-[var(--omada-brand)] text-white ${
            isSmall ? 'h-4 w-4' : 'h-5 w-5'
          }`}
        >
          <Check size={isSmall ? 10 : 12} strokeWidth={2.8} />
        </span>
      )}

      <div
        className={`flex ${
          isVertical
            ? 'flex-col items-start gap-2.5'
            : 'items-center gap-3'
        } ${isSelected && resolvedIndicator === 'corner-check' ? 'pr-4' : ''}`}
      >
        {icon && (
          <div
            className={`flex shrink-0 items-center justify-center rounded-md transition-colors ${
              isSmall ? 'h-7 w-7' : isVertical ? 'h-9 w-9' : 'h-10 w-10'
            } ${
              isSelected
                ? 'bg-[var(--omada-brand-bg-subtle)] text-[var(--omada-brand-text)]'
                : 'bg-[var(--omada-bg-field)] text-[var(--omada-text-secondary)] group-hover:text-[var(--omada-brand-text)]'
            }`}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`truncate font-semibold ${
                isSmall ? 'text-[13px]' : 'text-sm'
              } ${
                isSelected
                  ? 'text-[var(--omada-brand-text)]'
                  : 'text-[var(--omada-text-primary)]'
              }`}
            >
              {title}
            </span>
            {badge}
          </div>
          {description && (
            <div className="mt-0.5 text-xs leading-4 text-[var(--omada-text-secondary)]">
              {description}
            </div>
          )}
        </div>

        {resolvedIndicator === 'check' && (
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
              resolvedMode === 'multiple' ? 'rounded-[3px]' : 'rounded-full'
            } ${
              isSelected
                ? 'border-[var(--omada-brand)] bg-[var(--omada-brand)] text-white'
                : 'border-[var(--omada-border-strong)] bg-transparent'
            }`}
          >
            {isSelected && <Check size={11} strokeWidth={3} />}
          </span>
        )}
      </div>
    </button>
  );
};

export interface STileGroupBaseProps {
  options?: STileOption[];
  children?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  layout?: STileLayout;
  size?: 'sm' | 'md';
  indicator?: 'corner-check' | 'check' | 'none';
  disabled?: boolean;
  className?: string;
}

export interface STileGroupSingleProps extends STileGroupBaseProps {
  mode?: 'single';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface STileGroupMultiProps extends STileGroupBaseProps {
  mode: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export type STileGroupProps = STileGroupSingleProps | STileGroupMultiProps;

const COLUMN_CLASSES: Record<NonNullable<STileGroupBaseProps['columns']>, string> = {
  1: 'grid grid-cols-1 gap-3',
  2: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  3: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  auto: 'flex flex-wrap gap-2.5',
};

/**
 * Single- or multi-select Omada option tile group supporting declarative `options`
 * or composable `<STile>` children.
 */
export const STileGroup: React.FC<STileGroupProps> = (props) => {
  const {
    options,
    children,
    mode = 'single',
    value,
    defaultValue,
    onChange,
    columns = 3,
    layout = 'horizontal',
    size = 'md',
    indicator = 'corner-check',
    disabled = false,
    className = '',
  } = props;

  const [innerSingle, setInnerSingle] = useState<string>(
    typeof defaultValue === 'string' ? defaultValue : (options?.[0]?.value ?? ''),
  );
  const [innerMulti, setInnerMulti] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [],
  );

  const selectedValues: string[] =
    mode === 'multiple'
      ? (Array.isArray(value) ? value : innerMulti)
      : (typeof value === 'string'
          ? value
            ? [value]
            : []
          : innerSingle
            ? [innerSingle]
            : []);

  const toggleValue = (val: string) => {
    if (disabled) return;
    if (mode === 'multiple') {
      const exists = selectedValues.includes(val);
      const next = exists
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val];
      if (value === undefined) {
        setInnerMulti(next);
      }
      (onChange as ((v: string[]) => void) | undefined)?.(next);
    } else {
      if (value === undefined) {
        setInnerSingle(val);
      }
      (onChange as ((v: string) => void) | undefined)?.(val);
    }
  };

  return (
    <STileGroupContext.Provider
      value={{
        mode,
        selectedValues,
        toggleValue,
        layout,
        size,
        indicator,
        disabled,
      }}
    >
      <div
        role={mode === 'multiple' ? 'group' : 'radiogroup'}
        className={`${COLUMN_CLASSES[columns]} ${className}`.trim()}
      >
        {options
          ? options.map((opt) => (
              <STile
                key={opt.value}
                value={opt.value}
                title={opt.title}
                description={opt.description}
                icon={opt.icon}
                badge={opt.badge}
                disabled={opt.disabled}
              />
            ))
          : children}
      </div>
    </STileGroupContext.Provider>
  );
};
