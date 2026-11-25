import React, { useMemo, useState } from 'react';
import { DatePicker, type DatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { useOmadaAgentControl } from '../agent';
import { SIcon } from '../assets/SIcon';

export type OmadaPickerDate = NonNullable<
  NonNullable<RangePickerProps['value']>[0]
>;

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function pad2(num: number): string {
  return String(num).padStart(2, '0');
}

function formatWithPattern(date: Date, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear();
  const monthIdx = date.getMonth();
  const day = date.getDate();
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const ampm = hour24 >= 12 ? 'PM' : 'AM';

  return pattern
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MMM/g, SHORT_MONTHS[monthIdx])
    .replace(/MM/g, pad2(monthIdx + 1))
    .replace(/M/g, String(monthIdx + 1))
    .replace(/DD/g, pad2(day))
    .replace(/D/g, String(day))
    .replace(/HH/g, pad2(hour24))
    .replace(/H/g, String(hour24))
    .replace(/hh/g, pad2(hour12))
    .replace(/h/g, String(hour12))
    .replace(/mm/g, pad2(minute))
    .replace(/m/g, String(minute))
    .replace(/ss/g, pad2(second))
    .replace(/s/g, String(second))
    .replace(/A/g, ampm)
    .replace(/a/g, ampm.toLowerCase());
}

/**
 * Extracts a native `Date` from an AntD/Dayjs date value or Date.
 */
export function toNativeDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value === 'object' && value !== null) {
    const maybe = value as { toDate?: () => Date; valueOf?: () => number };
    if (typeof maybe.toDate === 'function') {
      const d = maybe.toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof maybe.valueOf === 'function') {
      const ms = maybe.valueOf();
      if (typeof ms === 'number' && !Number.isNaN(ms)) {
        return new Date(ms);
      }
    }
  }
  return null;
}

/**
 * Creates a Dayjs-compatible wrapper backed by a native `Date` so AntD's
 * `@rc-component/picker` dayjs adapter seamlessly promotes it to a real `Dayjs` instance.
 */
export function createPickerDate(input: Date): OmadaPickerDate {
  const d = new Date(input.getTime());
  const applyUnit = (base: Date, amount: number, unit: string): Date => {
    const next = new Date(base.getTime());
    const u = unit.toLowerCase();
    if (u.startsWith('year') || u === 'y') next.setFullYear(next.getFullYear() + amount);
    else if (u.startsWith('month') || u === 'm') next.setMonth(next.getMonth() + amount);
    else if (u.startsWith('week') || u === 'w') next.setDate(next.getDate() + amount * 7);
    else if (u.startsWith('day') || u === 'd') next.setDate(next.getDate() + amount);
    else if (u.startsWith('hour') || u === 'h') next.setHours(next.getHours() + amount);
    else if (u.startsWith('minute') || u === 'min') next.setMinutes(next.getMinutes() + amount);
    else if (u.startsWith('second') || u === 's') next.setSeconds(next.getSeconds() + amount);
    else next.setTime(next.getTime() + amount);
    return next;
  };

  const wrapper = {
    $isDayjsObject: true,
    $d: d,
    valueOf: () => d.getTime(),
    unix: () => Math.floor(d.getTime() / 1000),
    toDate: () => new Date(d.getTime()),
    toISOString: () => d.toISOString(),
    toJSON: () => d.toISOString(),
    isValid: () => !Number.isNaN(d.getTime()),
    clone: () => createPickerDate(d),
    year: (v?: number) => {
      if (v === undefined) return d.getFullYear();
      const next = new Date(d.getTime());
      next.setFullYear(v);
      return createPickerDate(next);
    },
    month: (v?: number) => {
      if (v === undefined) return d.getMonth();
      const next = new Date(d.getTime());
      next.setMonth(v);
      return createPickerDate(next);
    },
    date: (v?: number) => {
      if (v === undefined) return d.getDate();
      const next = new Date(d.getTime());
      next.setDate(v);
      return createPickerDate(next);
    },
    day: (v?: number) => {
      if (v === undefined) return d.getDay();
      const next = new Date(d.getTime());
      next.setDate(d.getDate() + (v - d.getDay()));
      return createPickerDate(next);
    },
    hour: (v?: number) => {
      if (v === undefined) return d.getHours();
      const next = new Date(d.getTime());
      next.setHours(v);
      return createPickerDate(next);
    },
    minute: (v?: number) => {
      if (v === undefined) return d.getMinutes();
      const next = new Date(d.getTime());
      next.setMinutes(v);
      return createPickerDate(next);
    },
    second: (v?: number) => {
      if (v === undefined) return d.getSeconds();
      const next = new Date(d.getTime());
      next.setSeconds(v);
      return createPickerDate(next);
    },
    millisecond: (v?: number) => {
      if (v === undefined) return d.getMilliseconds();
      const next = new Date(d.getTime());
      next.setMilliseconds(v);
      return createPickerDate(next);
    },
    add: (amount: number, unit: string) => createPickerDate(applyUnit(d, amount, unit)),
    subtract: (amount: number, unit: string) => createPickerDate(applyUnit(d, -amount, unit)),
    startOf: (unit: string) => {
      const next = new Date(d.getTime());
      const u = unit.toLowerCase();
      if (u.startsWith('year')) next.setMonth(0, 1);
      if (u.startsWith('year') || u.startsWith('month')) next.setDate(1);
      if (u.startsWith('year') || u.startsWith('month') || u.startsWith('day')) {
        next.setHours(0, 0, 0, 0);
      }
      return createPickerDate(next);
    },
    endOf: (unit: string) => {
      const next = new Date(d.getTime());
      const u = unit.toLowerCase();
      if (u.startsWith('year')) next.setMonth(11, 31);
      else if (u.startsWith('month')) {
        next.setMonth(next.getMonth() + 1, 0);
      }
      next.setHours(23, 59, 59, 999);
      return createPickerDate(next);
    },
    isAfter: (other: unknown) => {
      const o = toNativeDate(other);
      return o ? d.getTime() > o.getTime() : false;
    },
    isBefore: (other: unknown) => {
      const o = toNativeDate(other);
      return o ? d.getTime() < o.getTime() : false;
    },
    isSame: (other: unknown) => {
      const o = toNativeDate(other);
      return o ? d.getTime() === o.getTime() : false;
    },
    locale: () => wrapper,
    format: (pattern?: string) => formatWithPattern(d, pattern),
  };

  return wrapper as unknown as OmadaPickerDate;
}

/**
 * Formats a date range according to Omada Figma DatePicker (`43:34733`) rules:
 * - Same day: `May 5, 2024`
 * - Same month: `May 5 - 10, 2024`
 * - Cross month (same year): `May 5 - Jun 10, 2024`
 * - Cross year: `May 5, 2024 - May 4, 2025`
 */
export function formatOmadaDateRange(start: Date, end: Date): string {
  const [a, b] =
    start.getTime() <= end.getTime() ? [start, end] : [end, start];
  const y1 = a.getFullYear();
  const m1 = a.getMonth();
  const d1 = a.getDate();
  const y2 = b.getFullYear();
  const m2 = b.getMonth();
  const d2 = b.getDate();

  if (y1 === y2 && m1 === m2 && d1 === d2) {
    return `${SHORT_MONTHS[m1]} ${d1}, ${y1}`;
  }
  if (y1 === y2 && m1 === m2) {
    return `${SHORT_MONTHS[m1]} ${d1} - ${d2}, ${y1}`;
  }
  if (y1 === y2) {
    return `${SHORT_MONTHS[m1]} ${d1} - ${SHORT_MONTHS[m2]} ${d2}, ${y1}`;
  }
  return `${SHORT_MONTHS[m1]} ${d1}, ${y1} - ${SHORT_MONTHS[m2]} ${d2}, ${y2}`;
}

export interface SCapsulePreset {
  key: string;
  label: string;
  title?: string;
  getRange: () => [Date, Date];
}

export type SRangeQuickPreset = NonNullable<RangePickerProps['presets']>[number];

export interface SDatePickerProps extends DatePickerProps {
  /** Renders the picker input with an Omada capsule pill silhouette (`rounded-full`). */
  capsule?: boolean;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

function parseAgentDateInput(raw: unknown): Date | null {
  const fromObj = toNativeDate(raw);
  if (fromObj) return fromObj;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (isoDay) {
      return new Date(
        Number(isoDay[1]),
        Number(isoDay[2]) - 1,
        Number(isoDay[3]),
        0,
        0,
        0,
        0,
      );
    }
    const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
      trimmed,
    );
    if (isoDateTime) {
      return new Date(
        Number(isoDateTime[1]),
        Number(isoDateTime[2]) - 1,
        Number(isoDateTime[3]),
        Number(isoDateTime[4]),
        Number(isoDateTime[5]),
        Number(isoDateTime[6] ?? 0),
        0,
      );
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function mergeClassNames<T extends { root?: string; popup?: unknown }>(
  baseRoot: string,
  basePopupRoot: string,
  userClassNames?: T | ((info: never) => T),
): T | ((info: never) => T) {
  if (typeof userClassNames === 'function') {
    return (info: never) => mergeClassNames(baseRoot, basePopupRoot, userClassNames(info)) as T;
  }
  const userPopup =
    typeof userClassNames?.popup === 'string'
      ? { root: userClassNames.popup }
      : (userClassNames?.popup as { root?: string } | undefined);

  return {
    ...userClassNames,
    root: `${baseRoot} ${userClassNames?.root ?? ''}`.trim(),
    popup: {
      ...userPopup,
      root: `${basePopupRoot} ${userPopup?.root ?? ''}`.trim(),
    },
  } as T;
}

/**
 * Omada single DatePicker defaulting to filled styling (`#F4F4F4` light / `#272727` dark),
 * official Figma calendar icon, and optional capsule pill appearance.
 */
export const SDatePicker: React.FC<SDatePickerProps> = ({
  variant = 'filled',
  capsule = false,
  suffix,
  value,
  defaultValue,
  onChange,
  disabled,
  showTime,
  agentId,
  className = '',
  classNames,
  ...rest
}) => {
  const [innerDate, setInnerDate] = useState<DatePickerProps['value']>(
    defaultValue ?? null,
  );
  const isControlled = value !== undefined;
  const currentDate = isControlled ? value : innerDate;

  const serializedDate = useMemo(() => {
    const native = toNativeDate(currentDate);
    if (!native) return null;
    return formatWithPattern(
      native,
      showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
    );
  }, [currentDate, showTime]);

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'datepicker',
          label:
            ((rest as Record<string, unknown>)['aria-label'] as
              | string
              | undefined) ??
            (typeof rest.placeholder === 'string' ? rest.placeholder : undefined),
          value: serializedDate,
          disabled: Boolean(disabled),
          actions: {
            setValue: (next: unknown) => {
              if (next === null || next === '') {
                if (!isControlled) setInnerDate(null);
                onChange?.(null as never, '');
                return null;
              }
              const parsed = parseAgentDateInput(next);
              if (!parsed) {
                throw new Error(`Invalid date value "${String(next)}".`);
              }
              const pickerDate = createPickerDate(parsed);
              const formatted = formatWithPattern(
                parsed,
                showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
              );
              if (!isControlled) {
                setInnerDate(pickerDate as never);
              }
              onChange?.(pickerDate as never, formatted);
              return formatted;
            },
            clear: () => {
              if (!isControlled) setInnerDate(null);
              onChange?.(null as never, '');
              return null;
            },
          },
        }
      : null,
  );

  const mergedClassNames = mergeClassNames(
    `omada-input omada-date-picker ${capsule ? 'omada-date-picker-capsule' : ''}`.trim(),
    'omada-picker-popup',
    classNames as { root?: string; popup?: unknown } | undefined,
  );

  return (
    <DatePicker
      variant={variant}
      value={isControlled ? value : agentId ? innerDate : undefined}
      defaultValue={agentId ? undefined : defaultValue}
      disabled={disabled}
      showTime={showTime}
      onChange={(d, dStr) => {
        if (!isControlled) {
          setInnerDate(d);
        }
        onChange?.(d, dStr);
      }}
      suffix={
        suffix ?? (
          <SIcon
            name="icon-46146-123043"
            size={16}
            className="text-[var(--omada-text-tertiary)]"
          />
        )
      }
      className={className}
      classNames={mergedClassNames as DatePickerProps['classNames']}
      {...rest}
    />
  );
};

function createOffsetDate(hoursOffset: number): Date {
  return new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
}

const DEFAULT_RANGE_PRESETS: SRangeQuickPreset[] = [
  {
    label: 'Last 24 Hours',
    value: () => [createPickerDate(createOffsetDate(-24)), createPickerDate(new Date())],
  },
  {
    label: 'Last 7 Days',
    value: () => [createPickerDate(createOffsetDate(-24 * 7)), createPickerDate(new Date())],
  },
  {
    label: 'Last 30 Days',
    value: () => [createPickerDate(createOffsetDate(-24 * 30)), createPickerDate(new Date())],
  },
];

const DEFAULT_CAPSULE_PRESETS: SCapsulePreset[] = [
  {
    key: '1d',
    label: '1D',
    title: 'Last 24 Hours',
    getRange: () => [createOffsetDate(-24), new Date()],
  },
  {
    key: '1w',
    label: '1W',
    title: 'Last 7 Days',
    getRange: () => [createOffsetDate(-24 * 7), new Date()],
  },
  {
    key: '1m',
    label: '1M',
    title: 'Last 30 Days',
    getRange: () => [createOffsetDate(-24 * 30), new Date()],
  },
];

export interface SRangePickerProps extends Omit<RangePickerProps, 'presets'> {
  /** Renders Omada's Figma capsule preset switcher (`1D · 1W · 1M` + Custom calendar trigger). */
  capsule?: boolean;
  /** Quick preset list for standard RangePicker (pass `false` to hide default presets). */
  presets?: RangePickerProps['presets'] | false;
  /** Custom preset pills for `capsule` mode (defaults to `1D`, `1W`, `1M`). */
  capsulePresets?: SCapsulePreset[];
  /** Controlled active preset key in `capsule` mode (`'1d' | '1w' | '1m' | 'custom'`). */
  activePreset?: string;
  /** Initial active preset key in uncontrolled `capsule` mode. */
  defaultPreset?: string;
  /** Callback invoked when a capsule preset pill or custom range is selected. */
  onPresetChange?: (presetKey: string, range: [Date, Date]) => void;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
}

/**
 * Omada Date RangePicker supporting:
 * - Standard filled RangePicker with quick range presets (`Last 24 Hours`, `Last 7 Days`, `Last 30 Days`)
 * - Capsule filter bar (`capsule`) with `1D · 1W · 1M` segmented pills + Custom calendar range trigger.
 */
export const SRangePicker: React.FC<SRangePickerProps> = ({
  variant = 'filled',
  capsule = false,
  presets,
  capsulePresets = DEFAULT_CAPSULE_PRESETS,
  activePreset,
  defaultPreset = '1d',
  onPresetChange,
  suffix,
  value,
  defaultValue,
  onChange,
  disabled,
  placeholder = ['Start Date', 'End Date'],
  agentId,
  className = '',
  classNames,
  open: controlledOpen,
  onOpenChange,
  ...rest
}) => {
  const [innerPreset, setInnerPreset] = useState<string>(defaultPreset);
  const [innerCustomValue, setInnerCustomValue] = useState<RangePickerProps['value']>(
    defaultValue ?? null,
  );
  const [innerOpen, setInnerOpen] = useState(false);

  const currentPreset = activePreset ?? innerPreset;
  const currentRange = value !== undefined ? value : innerCustomValue;
  const isOpen = controlledOpen !== undefined ? controlledOpen : innerOpen;
  const isAllDisabled = Array.isArray(disabled) ? disabled[0] && disabled[1] : Boolean(disabled);

  const mergedPresets = useMemo(() => {
    if (presets === false) return undefined;
    return presets ?? DEFAULT_RANGE_PRESETS;
  }, [presets]);

  const mergedClassNames = mergeClassNames(
    `omada-input omada-date-picker ${capsule ? 'omada-date-picker-capsule' : ''}`.trim(),
    'omada-picker-popup',
    classNames as { root?: string; popup?: unknown } | undefined,
  );

  const customRangeLabel = useMemo(() => {
    if (!currentRange || !currentRange[0] || !currentRange[1]) return null;
    const start = toNativeDate(currentRange[0]);
    const end = toNativeDate(currentRange[1]);
    if (!start || !end) return null;
    return formatOmadaDateRange(start, end);
  }, [currentRange]);

  const serializedRange = useMemo<[string, string] | null>(() => {
    if (!currentRange || !currentRange[0] || !currentRange[1]) return null;
    const start = toNativeDate(currentRange[0]);
    const end = toNativeDate(currentRange[1]);
    if (!start || !end) return null;
    return [
      formatWithPattern(start, 'YYYY-MM-DD'),
      formatWithPattern(end, 'YYYY-MM-DD'),
    ];
  }, [currentRange]);

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'rangepicker',
          label:
            ((rest as Record<string, unknown>)['aria-label'] as
              | string
              | undefined) ??
            (capsule ? 'Date range quick filter' : `${placeholder[0]} - ${placeholder[1]}`),
          value: capsule
            ? { preset: currentPreset, range: serializedRange }
            : serializedRange,
          disabled: isAllDisabled,
          options: capsule
            ? capsulePresets.map((p) => ({
                value: p.key,
                label: p.label,
              }))
            : undefined,
          actions: {
            setRange: (pairArg: unknown) => {
              let rawStart: unknown;
              let rawEnd: unknown;
              if (Array.isArray(pairArg) && pairArg.length >= 2) {
                [rawStart, rawEnd] = pairArg;
              } else if (pairArg && typeof pairArg === 'object') {
                const rec = pairArg as Record<string, unknown>;
                rawStart = rec.start;
                rawEnd = rec.end;
              }
              const sDate = parseAgentDateInput(rawStart);
              const eDate = parseAgentDateInput(rawEnd);
              if (!sDate || !eDate) {
                throw new Error(
                  'Expected [startDate, endDate] or { start, end } with valid dates.',
                );
              }
              const pickerRange: [OmadaPickerDate, OmadaPickerDate] = [
                createPickerDate(sDate),
                createPickerDate(eDate),
              ];
              const strPair: [string, string] = [
                formatWithPattern(sDate, 'YYYY-MM-DD'),
                formatWithPattern(eDate, 'YYYY-MM-DD'),
              ];
              if (value === undefined) {
                setInnerCustomValue(pickerRange);
              }
              if (capsule) {
                if (activePreset === undefined) {
                  setInnerPreset('custom');
                }
                onPresetChange?.('custom', [sDate, eDate]);
              }
              onChange?.(pickerRange, strPair);
              return strPair;
            },
            ...(capsule
              ? {
                  selectPreset: (presetKey: unknown) => {
                    const target = capsulePresets.find(
                      (p) => p.key === String(presetKey ?? ''),
                    );
                    if (!target) {
                      throw new Error(
                        `Unknown range preset "${String(presetKey)}".`,
                      );
                    }
                    const [sDate, eDate] = target.getRange();
                    const pickerRange: [OmadaPickerDate, OmadaPickerDate] = [
                      createPickerDate(sDate),
                      createPickerDate(eDate),
                    ];
                    if (activePreset === undefined) {
                      setInnerPreset(target.key);
                    }
                    if (value === undefined) {
                      setInnerCustomValue(pickerRange);
                    }
                    onChange?.(pickerRange, [
                      formatWithPattern(sDate, 'YYYY-MM-DD'),
                      formatWithPattern(eDate, 'YYYY-MM-DD'),
                    ]);
                    onPresetChange?.(target.key, [sDate, eDate]);
                    return target.key;
                  },
                }
              : {}),
            clear: () => {
              if (value === undefined) {
                setInnerCustomValue(null);
              }
              onChange?.(null, ['', '']);
              return null;
            },
          },
        }
      : null,
  );

  if (!capsule) {
    return (
      <DatePicker.RangePicker
        variant={variant}
        presets={mergedPresets}
        value={value !== undefined ? value : agentId ? innerCustomValue : undefined}
        defaultValue={agentId ? undefined : defaultValue}
        onChange={(dates, dateStrings) => {
          if (value === undefined) {
            setInnerCustomValue(dates);
          }
          onChange?.(dates, dateStrings);
        }}
        disabled={disabled}
        placeholder={placeholder}
        open={controlledOpen}
        onOpenChange={onOpenChange}
        suffix={
          suffix ?? (
            <SIcon
              name="icon-46146-123043"
              size={16}
              className="text-[var(--omada-text-tertiary)]"
            />
          )
        }
        className={className}
        classNames={mergedClassNames as RangePickerProps['classNames']}
        {...rest}
      />
    );
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInnerOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handlePresetClick = (preset: SCapsulePreset) => {
    if (isAllDisabled) return;
    const [startDate, endDate] = preset.getRange();
    const pickerRange: [OmadaPickerDate, OmadaPickerDate] = [
      createPickerDate(startDate),
      createPickerDate(endDate),
    ];
    if (activePreset === undefined) {
      setInnerPreset(preset.key);
    }
    if (value === undefined) {
      setInnerCustomValue(pickerRange);
    }
    handleOpenChange(false);
    onChange?.(pickerRange, [
      formatWithPattern(startDate, 'YYYY-MM-DD'),
      formatWithPattern(endDate, 'YYYY-MM-DD'),
    ]);
    onPresetChange?.(preset.key, [startDate, endDate]);
  };

  const handleCustomRangeChange: NonNullable<RangePickerProps['onChange']> = (
    dates,
    dateStrings,
  ) => {
    if (value === undefined) {
      setInnerCustomValue(dates);
    }
    if (dates && dates[0] && dates[1]) {
      if (activePreset === undefined) {
        setInnerPreset('custom');
      }
      const startDate = toNativeDate(dates[0]);
      const endDate = toNativeDate(dates[1]);
      if (startDate && endDate) {
        onPresetChange?.('custom', [startDate, endDate]);
      }
      handleOpenChange(false);
    }
    onChange?.(dates, dateStrings);
  };

  const isCustomActive = currentPreset === 'custom';

  return (
    <div
      className={`omada-capsule-datepicker relative inline-flex items-center gap-0.5 rounded-full border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-0.5 ${
        isAllDisabled ? 'cursor-not-allowed opacity-55' : ''
      } ${className}`.trim()}
      role="group"
      aria-label="Date range quick filter"
    >
      {capsulePresets.map((preset) => {
        const active = currentPreset === preset.key;
        return (
          <button
            key={preset.key}
            type="button"
            title={preset.title ?? preset.label}
            aria-pressed={active}
            disabled={isAllDisabled}
            onClick={() => handlePresetClick(preset)}
            className={`inline-flex h-7 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
              active
                ? 'bg-[var(--omada-brand)] font-semibold text-[var(--omada-text-inverse)]'
                : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
            }`}
          >
            {preset.label}
          </button>
        );
      })}

      <div className="relative inline-flex items-center">
        <button
          type="button"
          aria-label={
            isCustomActive && customRangeLabel
              ? `Custom range: ${customRangeLabel}`
              : 'Custom date range'
          }
          aria-pressed={isCustomActive}
          aria-expanded={isOpen}
          disabled={isAllDisabled}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => !isAllDisabled && handleOpenChange(!isOpen)}
          className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
            isCustomActive
              ? 'bg-[var(--omada-brand)] font-semibold text-[var(--omada-text-inverse)]'
              : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
          }`}
        >
          <SIcon name="icon-46146-123043" size={14} />
          {isCustomActive && customRangeLabel && (
            <span className="tabular-nums whitespace-nowrap">{customRangeLabel}</span>
          )}
        </button>

        {/* Visually hidden anchor inside the trigger so AntD aligns the calendar popup cleanly */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-0"
        >
          <DatePicker.RangePicker
            tabIndex={-1}
            variant={variant}
            presets={mergedPresets}
            value={currentRange}
            onChange={handleCustomRangeChange}
            disabled={disabled}
            placeholder={placeholder}
            open={isOpen}
            onOpenChange={handleOpenChange}
            classNames={mergedClassNames as RangePickerProps['classNames']}
            {...rest}
          />
        </div>
      </div>
    </div>
  );
};
