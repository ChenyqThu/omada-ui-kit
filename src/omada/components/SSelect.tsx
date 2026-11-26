import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  type RefSelectProps,
  type SelectProps,
} from 'antd';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { useOmadaAgentControl } from '../agent';
import { SIcon } from '../assets/SIcon';
import { SCustomTag } from './STag';

export interface SSelectOption extends DefaultOptionType {
  label?: React.ReactNode;
  value?: string | number | null;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  options?: SSelectOption[];
}

export interface SSelectProps<
  ValueType = unknown,
  OptionType extends BaseOptionType | DefaultOptionType = SSelectOption,
> extends SelectProps<ValueType, OptionType> {
  /** Optional label for the sticky popup footer Add action button. */
  addNewLabel?: React.ReactNode;
  /** Callback fired when the sticky popup footer Add action is clicked. */
  onAddNew?: () => void;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

type SSelectComponent = (<
  ValueType = unknown,
  OptionType extends BaseOptionType | DefaultOptionType = SSelectOption,
>(
  props: SSelectProps<ValueType, OptionType> & React.RefAttributes<RefSelectProps>,
) => React.ReactElement | null) & {
  displayName?: string;
};

function flattenSelectOptions<OptionType>(
  list: readonly OptionType[] | undefined,
): OptionType[] {
  if (!list || list.length === 0) return [];
  const flat: OptionType[] = [];
  for (const item of list) {
    const rec = item as Record<string, unknown>;
    if (Array.isArray(rec.options)) {
      flat.push(...flattenSelectOptions(rec.options as OptionType[]));
    } else {
      flat.push(item);
    }
  }
  return flat;
}

function SSelectInner<
  ValueType = unknown,
  OptionType extends BaseOptionType | DefaultOptionType = SSelectOption,
>(
  {
    variant = 'filled',
    listHeight = 256,
    mode,
    showSearch,
    fieldNames,
    tagRender,
    optionRender,
    popupRender,
    addNewLabel,
    onAddNew,
    value,
    defaultValue,
    onChange,
    disabled,
    options,
    agentId,
    className = '',
    classNames,
    styles,
    ...rest
  }: SSelectProps<ValueType, OptionType>,
  ref: React.ForwardedRef<RefSelectProps>,
) {
  const isMulti = mode === 'multiple' || mode === 'tags';
  const [innerValue, setInnerValue] = useState<ValueType | null | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const wasControlledRef = useRef<boolean>(isControlled);
  const currentValue = isControlled ? value : innerValue;
  const liveValueRef = useRef<ValueType | null | undefined>(currentValue);
  liveValueRef.current = currentValue;

  useEffect(() => {
    if (wasControlledRef.current && !isControlled) {
      setInnerValue(defaultValue);
      liveValueRef.current = defaultValue;
    }
    wasControlledRef.current = isControlled;
  }, [isControlled, defaultValue]);

  const labelField = (fieldNames?.label as string | undefined) ?? 'label';
  const valueField = (fieldNames?.value as string | undefined) ?? 'value';
  const flatOptions = flattenSelectOptions(options);

  const commitSelect = (
    nextVal: ValueType,
    opt?: OptionType | OptionType[],
  ) => {
    liveValueRef.current = nextVal;
    if (!isControlled) {
      setInnerValue(nextVal);
    }
    onChange?.(
      nextVal,
      (opt ?? ({} as OptionType)) as OptionType | OptionType[],
    );
  };

  const resolveValidatedOption = (candidate: unknown): OptionType => {
    const matched = flatOptions.find((o) => {
      const v = (o as Record<string, unknown>)[valueField];
      return v === candidate || String(v) === String(candidate);
    });
    if (!matched) {
      throw new Error(`Unknown select option "${String(candidate)}".`);
    }
    if ((matched as Record<string, unknown>).disabled) {
      throw new Error(`Select option "${String(candidate)}" is disabled.`);
    }
    return matched;
  };

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'select',
          label:
            (rest['aria-label'] as string | undefined) ??
            (typeof rest.placeholder === 'string' ? rest.placeholder : undefined),
          value: currentValue,
          getValue: () => liveValueRef.current,
          disabled: Boolean(disabled),
          options: flatOptions
            .map((opt) => {
              const rec = opt as Record<string, unknown>;
              const v = rec[valueField];
              if (typeof v !== 'string' && typeof v !== 'number') return null;
              const lbl = rec[labelField];
              return {
                value: v,
                label: typeof lbl === 'string' ? lbl : String(v),
                disabled: Boolean(rec.disabled),
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null),
          actions: {
            setValue: (next: unknown) => {
              if (mode === 'multiple') {
                if (!Array.isArray(next)) {
                  throw new Error(
                    'Expected an array of option values for multiple-mode SSelect.',
                  );
                }
                const prevArr = Array.isArray(liveValueRef.current)
                  ? (liveValueRef.current as unknown[])
                  : [];
                const resolvedVals: unknown[] = [];
                const resolvedOpts: OptionType[] = [];
                for (const item of next) {
                  if (flatOptions.length > 0) {
                    const matched = flatOptions.find((o) => {
                      const v = (o as Record<string, unknown>)[valueField];
                      return v === item || String(v) === String(item);
                    });
                    if (!matched) {
                      throw new Error(`Unknown select option "${String(item)}".`);
                    }
                    const canonicalVal = (matched as Record<string, unknown>)[valueField];
                    if (
                      (matched as Record<string, unknown>).disabled &&
                      !prevArr.includes(canonicalVal)
                    ) {
                      throw new Error(`Select option "${String(item)}" is disabled.`);
                    }
                    if (!resolvedVals.includes(canonicalVal)) {
                      resolvedVals.push(canonicalVal);
                      resolvedOpts.push(matched);
                    }
                  } else if (!resolvedVals.includes(item)) {
                    resolvedVals.push(item);
                  }
                }
                commitSelect(resolvedVals as unknown as ValueType, resolvedOpts);
                return resolvedVals;
              }

              if (mode === 'tags') {
                if (!Array.isArray(next)) {
                  throw new Error(
                    'Expected an array of tag values for tags-mode SSelect.',
                  );
                }
                const resolvedTags: Array<string | number> = [];
                for (const item of next) {
                  if (typeof item !== 'string' && typeof item !== 'number') {
                    throw new Error('Tag values must be strings or numbers.');
                  }
                  const matched = flatOptions.find((o) => {
                    const v = (o as Record<string, unknown>)[valueField];
                    return v === item || String(v) === String(item);
                  });
                  if (matched && (matched as Record<string, unknown>).disabled) {
                    throw new Error(`Select option "${String(item)}" is disabled.`);
                  }
                  const canonicalTag = matched
                    ? ((matched as Record<string, unknown>)[valueField] as string | number)
                    : item;
                  if (!resolvedTags.includes(canonicalTag)) {
                    resolvedTags.push(canonicalTag);
                  }
                }
                commitSelect(resolvedTags as unknown as ValueType);
                return resolvedTags;
              }

              if (Array.isArray(next)) {
                throw new Error(
                  'Single-mode SSelect does not accept an array value.',
                );
              }
              if ((next === undefined || next === null) && rest.allowClear) {
                commitSelect(undefined as unknown as ValueType);
                return null;
              }
              if (flatOptions.length > 0) {
                const matched = resolveValidatedOption(next);
                const canonicalVal = (matched as Record<string, unknown>)[
                  valueField
                ] as ValueType;
                commitSelect(canonicalVal, matched);
                return canonicalVal;
              }
              commitSelect(next as ValueType);
              return next;
            },
            select: (next: unknown) => {
              if (Array.isArray(next)) {
                throw new Error('Action "select" expects a single option value.');
              }
              if (mode === 'multiple') {
                const prevArr = Array.isArray(liveValueRef.current)
                  ? [...(liveValueRef.current as unknown[])]
                  : [];
                if (flatOptions.length > 0) {
                  const matched = resolveValidatedOption(next);
                  const canonicalVal = (matched as Record<string, unknown>)[valueField];
                  const nextArr = prevArr.includes(canonicalVal)
                    ? prevArr
                    : [...prevArr, canonicalVal];
                  commitSelect(nextArr as unknown as ValueType);
                  return nextArr;
                }
                const nextArr = prevArr.includes(next) ? prevArr : [...prevArr, next];
                commitSelect(nextArr as unknown as ValueType);
                return nextArr;
              }
              if (mode === 'tags') {
                if (typeof next !== 'string' && typeof next !== 'number') {
                  throw new Error('Tag value must be a string or number.');
                }
                const matched = flatOptions.find((o) => {
                  const v = (o as Record<string, unknown>)[valueField];
                  return v === next || String(v) === String(next);
                });
                if (matched && (matched as Record<string, unknown>).disabled) {
                  throw new Error(`Select option "${String(next)}" is disabled.`);
                }
                const prevArr = Array.isArray(liveValueRef.current)
                  ? [...(liveValueRef.current as unknown[])]
                  : [];
                const nextArr = prevArr.includes(next) ? prevArr : [...prevArr, next];
                commitSelect(nextArr as unknown as ValueType);
                return nextArr;
              }
              if (flatOptions.length > 0) {
                const matched = resolveValidatedOption(next);
                const canonicalVal = (matched as Record<string, unknown>)[
                  valueField
                ] as ValueType;
                commitSelect(canonicalVal, matched);
                return canonicalVal;
              }
              commitSelect(next as ValueType);
              return next;
            },
            clear: () => {
              const cleared = (isMulti ? [] : undefined) as unknown as ValueType;
              commitSelect(cleared);
              return isMulti ? [] : null;
            },
          },
        }
      : null,
  );

  const defaultFilterOption = (input: string, option?: OptionType) => {
    if (!option) return false;
    const q = input.trim().toLowerCase();
    if (!q) return true;
    const record = option as Record<string, unknown>;
    const candidates = [record[labelField], record.description, record[valueField]];
    return candidates.some(
      (item) =>
        (typeof item === 'string' || typeof item === 'number') &&
        String(item).toLowerCase().includes(q),
    );
  };

  const resolvedShowSearch: SelectProps<ValueType, OptionType>['showSearch'] =
    showSearch === true
      ? { filterOption: defaultFilterOption }
      : typeof showSearch === 'object' &&
          showSearch !== null &&
          showSearch.filterOption === undefined &&
          showSearch.optionFilterProp === undefined
        ? { filterOption: defaultFilterOption, ...showSearch }
        : showSearch;

  const defaultTagRender: NonNullable<SelectProps<ValueType, OptionType>['tagRender']> = ({
    label,
    closable,
    onClose,
    isMaxTag,
  }) => {
    const canClose = Boolean(closable && !isMaxTag);
    return (
      <span
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="inline-flex max-w-full items-center py-[1px] pe-1"
      >
        <SCustomTag
          closable={canClose}
          onClose={() => onClose()}
          className={
            variant === 'filled'
              ? '!h-[22px] border border-[var(--omada-border-divider)] !bg-[var(--omada-bg-surface)]'
              : '!h-[22px]'
          }
        >
          {label}
        </SCustomTag>
      </span>
    );
  };

  const resolvedOptionRender: SelectProps<ValueType, OptionType>['optionRender'] =
    optionRender ??
    ((oriOption) => {
      const data = oriOption.data as SSelectOption | undefined;
      if (data && (data.icon || data.description)) {
        return (
          <div className="flex items-start gap-2 py-0.5">
            {data.icon && (
              <span className="mt-0.5 shrink-0 text-[var(--omada-text-secondary)]">
                {data.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium leading-5 text-[var(--omada-text-primary)]">
                {oriOption.label}
              </div>
              {data.description && (
                <div className="truncate text-xs leading-4 text-[var(--omada-text-tertiary)]">
                  {data.description}
                </div>
              )}
            </div>
          </div>
        );
      }
      return oriOption.label;
    });

  const hasAddFooter = Boolean(onAddNew || addNewLabel);
  const resolvedPopupRender: SelectProps<ValueType, OptionType>['popupRender'] =
    hasAddFooter || popupRender
      ? (menu) => {
          const renderedMenu = popupRender ? popupRender(menu) : menu;
          if (!hasAddFooter) {
            return renderedMenu;
          }
          return (
            <div>
              {renderedMenu}
              <div className="mt-1 border-t border-[var(--omada-border-divider)] px-1 pt-1 pb-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onAddNew?.()}
                  className="flex w-full cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs font-medium text-[var(--omada-brand-text)] transition-colors hover:bg-[var(--omada-brand-bg-subtlest)]"
                >
                  <SIcon name="add-2" size={14} />
                  <span>{addNewLabel ?? 'Add New Item'}</span>
                </button>
              </div>
            </div>
          );
        }
      : undefined;

  const resolvedClassNames: SelectProps<ValueType, OptionType>['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const user = classNames(info);
          return {
            ...user,
            popup: {
              ...user?.popup,
              root: `omada-select-popup ${user?.popup?.root ?? ''}`.trim(),
            },
          };
        }
      : {
          ...classNames,
          popup: {
            ...classNames?.popup,
            root: `omada-select-popup ${classNames?.popup?.root ?? ''}`.trim(),
          },
        };

  return (
    <Select<ValueType, OptionType>
      ref={ref}
      variant={variant}
      listHeight={listHeight}
      mode={mode}
      value={isControlled ? value : (agentId ? (innerValue ?? undefined) : undefined)}
      defaultValue={agentId ? undefined : defaultValue}
      disabled={disabled}
      options={options}
      onChange={(nextVal, opt) => commitSelect(nextVal, opt)}
      showSearch={resolvedShowSearch}
      fieldNames={fieldNames}
      tagRender={isMulti ? (tagRender ?? defaultTagRender) : tagRender}
      optionRender={resolvedOptionRender}
      popupRender={resolvedPopupRender}
      className={`omada-select ${className}`.trim()}
      classNames={resolvedClassNames}
      styles={styles}
      {...rest}
    />
  );
}

/**
 * Omada Select control defaulting to `variant="filled"` (`#F4F4F4` Light / `#272727` Dark),
 * supporting single/multiple/tags modes, removable Omada tags, rich icon/description rows,
 * 8-item scroll height (`256px`), and an optional sticky popup footer Add action.
 */
export const SSelect = React.forwardRef(
  SSelectInner as (
    props: SSelectProps<unknown, SSelectOption>,
    ref: React.ForwardedRef<RefSelectProps>,
  ) => React.ReactElement | null,
) as unknown as SSelectComponent;
SSelect.displayName = 'SSelect';
