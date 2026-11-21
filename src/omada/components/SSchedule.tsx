import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SButton } from './SButton';

export type SScheduleDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type SScheduleMatrix = Record<SScheduleDayKey, number[]>;

export type SSchedulePresetKey = 'workdays' | 'weekends' | 'all' | 'clear';

export interface SSchedulePreset {
  key: string;
  label: string;
  getMatrix: () => SScheduleMatrix;
}

const DAY_DEFS: ReadonlyArray<{ key: SScheduleDayKey; label: string; fullName: string }> = [
  { key: 'mon', label: 'Mon', fullName: 'Monday' },
  { key: 'tue', label: 'Tue', fullName: 'Tuesday' },
  { key: 'wed', label: 'Wed', fullName: 'Wednesday' },
  { key: 'thu', label: 'Thu', fullName: 'Thursday' },
  { key: 'fri', label: 'Fri', fullName: 'Friday' },
  { key: 'sat', label: 'Sat', fullName: 'Saturday' },
  { key: 'sun', label: 'Sun', fullName: 'Sunday' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function padHour(h: number): string {
  return String(h).padStart(2, '0');
}

function normalizeHours(hours?: number[]): number[] {
  if (!Array.isArray(hours) || hours.length === 0) return [];
  const unique = new Set<number>();
  for (const h of hours) {
    if (Number.isInteger(h) && h >= 0 && h <= 23) {
      unique.add(h);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

/**
 * Normalizes a partial schedule matrix into a canonical 7-day record with sorted unique hours (`0..23`).
 */
export function normalizeScheduleValue(
  value?: Partial<Record<SScheduleDayKey, number[]>>,
): SScheduleMatrix {
  return {
    mon: normalizeHours(value?.mon),
    tue: normalizeHours(value?.tue),
    wed: normalizeHours(value?.wed),
    thu: normalizeHours(value?.thu),
    fri: normalizeHours(value?.fri),
    sat: normalizeHours(value?.sat),
    sun: normalizeHours(value?.sun),
  };
}

/**
 * Creates an empty 7×24 Omada weekly schedule matrix.
 */
export function createEmptySchedule(): SScheduleMatrix {
  return {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
}

/**
 * Builds a canonical schedule matrix for Omada quick presets (`workdays`, `weekends`, `all`, `clear`).
 */
export function createSchedulePreset(preset: SSchedulePresetKey): SScheduleMatrix {
  const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  switch (preset) {
    case 'workdays':
      return {
        mon: [...workHours],
        tue: [...workHours],
        wed: [...workHours],
        thu: [...workHours],
        fri: [...workHours],
        sat: [],
        sun: [],
      };
    case 'weekends':
      return {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [...HOURS],
        sun: [...HOURS],
      };
    case 'all':
      return {
        mon: [...HOURS],
        tue: [...HOURS],
        wed: [...HOURS],
        thu: [...HOURS],
        fri: [...HOURS],
        sat: [...HOURS],
        sun: [...HOURS],
      };
    case 'clear':
      return createEmptySchedule();
  }
}

export const DEFAULT_SCHEDULE_PRESETS: SSchedulePreset[] = [
  {
    key: 'workdays',
    label: 'Workdays 9–18',
    getMatrix: () => createSchedulePreset('workdays'),
  },
  {
    key: 'weekends',
    label: 'Weekends',
    getMatrix: () => createSchedulePreset('weekends'),
  },
  {
    key: 'all',
    label: 'All Day',
    getMatrix: () => createSchedulePreset('all'),
  },
  {
    key: 'clear',
    label: 'Clear',
    getMatrix: () => createSchedulePreset('clear'),
  },
];

function countTotalHours(matrix: SScheduleMatrix): number {
  return DAY_DEFS.reduce((sum, day) => sum + matrix[day.key].length, 0);
}

/**
 * Produces a concise summary string describing active weekly hours (e.g. `Mon–Fri 09:00–18:00 (45 hrs/wk)`).
 */
export function formatScheduleSummary(matrix: SScheduleMatrix): string {
  const total = countTotalHours(matrix);
  if (total === 0) return 'No active hours (0 / 168 hrs)';
  if (total === 168) return 'All Week · 24/7 (168 / 168 hrs)';

  const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const isWorkdays =
    (['mon', 'tue', 'wed', 'thu', 'fri'] as const).every(
      (k) =>
        matrix[k].length === workHours.length &&
        matrix[k].every((h, idx) => h === workHours[idx]),
    ) &&
    matrix.sat.length === 0 &&
    matrix.sun.length === 0;

  if (isWorkdays) {
    return 'Mon–Fri 09:00–18:00 (45 / 168 hrs)';
  }

  const isWeekends =
    (['mon', 'tue', 'wed', 'thu', 'fri'] as const).every((k) => matrix[k].length === 0) &&
    matrix.sat.length === 24 &&
    matrix.sun.length === 24;

  if (isWeekends) {
    return 'Sat–Sun All Day (48 / 168 hrs)';
  }

  const activeDays = DAY_DEFS.filter((d) => matrix[d.key].length > 0).map((d) => d.label);
  return `${activeDays.join(', ')} (${total} / 168 hrs)`;
}

export interface SScheduleProps {
  /** Controlled 7×24 schedule matrix. */
  value?: Partial<SScheduleMatrix>;
  /** Initial uncontrolled 7×24 schedule matrix (defaults to empty). */
  defaultValue?: Partial<SScheduleMatrix>;
  /** Fired whenever cells are toggled, dragged, or a preset is applied. */
  onChange?: (value: SScheduleMatrix) => void;
  /** Disable all pointer & keyboard interaction with muted appearance. */
  disabled?: boolean;
  /** Prevent edits while retaining full visual contrast and hover tooltips. */
  readOnly?: boolean;
  /** Render quick preset buttons (`Workdays 9–18`, `Weekends`, `All Day`, `Clear`). */
  showPresets?: boolean;
  /** Custom preset button definitions. */
  presets?: SSchedulePreset[];
  /** Show legend and active weekly hour summary footer. */
  showSummary?: boolean;
  /** Optional schedule label above or for assistive technology. */
  'aria-label'?: string;
  className?: string;
}

interface CellCoord {
  dayIdx: number;
  hour: number;
}

interface DragSession {
  start: CellCoord;
  current: CellCoord;
  mode: 'paint' | 'erase';
  origin: 'pointer' | 'mouse';
}

function isInRect(coord: CellCoord, start: CellCoord, current: CellCoord): boolean {
  const minDay = Math.min(start.dayIdx, current.dayIdx);
  const maxDay = Math.max(start.dayIdx, current.dayIdx);
  const minHour = Math.min(start.hour, current.hour);
  const maxHour = Math.max(start.hour, current.hour);
  return (
    coord.dayIdx >= minDay &&
    coord.dayIdx <= maxDay &&
    coord.hour >= minHour &&
    coord.hour <= maxHour
  );
}

function applyRectToMatrix(
  matrix: SScheduleMatrix,
  start: CellCoord,
  current: CellCoord,
  mode: 'paint' | 'erase',
): SScheduleMatrix {
  const minDay = Math.min(start.dayIdx, current.dayIdx);
  const maxDay = Math.max(start.dayIdx, current.dayIdx);
  const minHour = Math.min(start.hour, current.hour);
  const maxHour = Math.max(start.hour, current.hour);

  const next = normalizeScheduleValue(matrix);
  for (let d = minDay; d <= maxDay; d++) {
    const dayKey = DAY_DEFS[d].key;
    const set = new Set(next[dayKey]);
    for (let h = minHour; h <= maxHour; h++) {
      if (mode === 'paint') {
        set.add(h);
      } else {
        set.delete(h);
      }
    }
    next[dayKey] = Array.from(set).sort((a, b) => a - b);
  }
  return next;
}

export function formatSlotRange(dayIdx: number, hour: number): string {
  const dayLabel = DAY_DEFS[dayIdx]?.label ?? 'Mon';
  return `${dayLabel} ${padHour(hour)}:00–${padHour(hour + 1)}:00`;
}

/**
 * Custom Omada 7-day × 24-hour weekly schedule matrix (`Mon`–`Sun` × `00`–`23`).
 * Supports click toggle, pointer-drag rectangle paint/erase, day/hour header toggles,
 * quick presets (`Workdays 9–18`, `Weekends`, `All Day`, `Clear`), hover tooltips,
 * full keyboard grid navigation, `readOnly`/`disabled` states, and Light/Dark `--omada-*` tokens.
 */
export const SSchedule: React.FC<SScheduleProps> = ({
  value,
  defaultValue,
  onChange,
  disabled = false,
  readOnly = false,
  showPresets = true,
  presets = DEFAULT_SCHEDULE_PRESETS,
  showSummary = true,
  'aria-label': ariaLabel = 'Weekly 7 by 24 hour schedule',
  className = '',
}) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<SScheduleMatrix>(() =>
    normalizeScheduleValue(defaultValue),
  );
  const currentMatrix = useMemo(
    () => (isControlled ? normalizeScheduleValue(value) : innerValue),
    [isControlled, value, innerValue],
  );

  const [dragState, setDragState] = useState<Omit<DragSession, 'origin'> | null>(null);
  const [activeSlot, setActiveSlot] = useState<CellCoord | null>(null);
  const [focusedSlot, setFocusedSlot] = useState<CellCoord>({ dayIdx: 0, hour: 0 });

  const dragRef = useRef<DragSession | null>(null);
  const handledByDragRef = useRef(false);
  const matrixRef = useRef<SScheduleMatrix>(currentMatrix);
  const onChangeRef = useRef(onChange);
  const isControlledRef = useRef(isControlled);
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  matrixRef.current = currentMatrix;
  onChangeRef.current = onChange;
  isControlledRef.current = isControlled;

  const isInteractive = !disabled && !readOnly;

  const commitMatrix = useCallback((next: SScheduleMatrix) => {
    if (!isControlledRef.current) {
      setInnerValue(next);
    }
    onChangeRef.current?.(next);
  }, []);

  const finishDrag = useCallback(() => {
    const active = dragRef.current;
    if (!active) return;
    dragRef.current = null;
    setDragState(null);
    handledByDragRef.current = true;
    const next = applyRectToMatrix(
      matrixRef.current,
      active.start,
      active.current,
      active.mode,
    );
    commitMatrix(next);
    window.setTimeout(() => {
      handledByDragRef.current = false;
    }, 0);
  }, [commitMatrix]);

  const cancelDrag = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragState(null);
    handledByDragRef.current = false;
  }, []);

  useEffect(() => {
    const handleGlobalUp = () => finishDrag();
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('pointercancel', cancelDrag);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('pointercancel', cancelDrag);
    };
  }, [finishDrag, cancelDrag]);

  const startDrag = (
    dayIdx: number,
    hour: number,
    origin: 'pointer' | 'mouse',
  ) => {
    if (!isInteractive) return;
    if (dragRef.current) return;
    handledByDragRef.current = false;
    const dayKey = DAY_DEFS[dayIdx].key;
    const currentlyActive = currentMatrix[dayKey].includes(hour);
    const mode: 'paint' | 'erase' = currentlyActive ? 'erase' : 'paint';
    const coord = { dayIdx, hour };
    dragRef.current = { start: coord, current: coord, mode, origin };
    setDragState({ start: coord, current: coord, mode });
    setActiveSlot(coord);
    setFocusedSlot(coord);
  };

  const enterCell = (dayIdx: number, hour: number) => {
    const coord = { dayIdx, hour };
    setActiveSlot(coord);
    if (!dragRef.current || !isInteractive) return;
    dragRef.current.current = coord;
    setDragState({
      start: dragRef.current.start,
      current: coord,
      mode: dragRef.current.mode,
    });
  };

  const toggleSingleCell = (dayIdx: number, hour: number) => {
    if (!isInteractive) return;
    const dayKey = DAY_DEFS[dayIdx].key;
    const currentlyActive = currentMatrix[dayKey].includes(hour);
    const next = applyRectToMatrix(
      currentMatrix,
      { dayIdx, hour },
      { dayIdx, hour },
      currentlyActive ? 'erase' : 'paint',
    );
    commitMatrix(next);
  };

  const handleCellClick = (dayIdx: number, hour: number) => {
    if (!isInteractive) return;
    if (handledByDragRef.current) {
      handledByDragRef.current = false;
      return;
    }
    toggleSingleCell(dayIdx, hour);
  };

  const toggleDayRow = (dayIdx: number) => {
    if (!isInteractive) return;
    const dayKey = DAY_DEFS[dayIdx].key;
    const allSelected = currentMatrix[dayKey].length === 24;
    const next = applyRectToMatrix(
      currentMatrix,
      { dayIdx, hour: 0 },
      { dayIdx, hour: 23 },
      allSelected ? 'erase' : 'paint',
    );
    commitMatrix(next);
  };

  const toggleHourColumn = (hour: number) => {
    if (!isInteractive) return;
    const allSelected = DAY_DEFS.every((d) => currentMatrix[d.key].includes(hour));
    const next = applyRectToMatrix(
      currentMatrix,
      { dayIdx: 0, hour },
      { dayIdx: DAY_DEFS.length - 1, hour },
      allSelected ? 'erase' : 'paint',
    );
    commitMatrix(next);
  };

  const moveFocusTo = (dayIdx: number, hour: number) => {
    const boundedDay = Math.max(0, Math.min(DAY_DEFS.length - 1, dayIdx));
    const boundedHour = Math.max(0, Math.min(23, hour));
    const coord = { dayIdx: boundedDay, hour: boundedHour };
    setFocusedSlot(coord);
    setActiveSlot(coord);
    cellRefs.current[`${boundedDay}-${boundedHour}`]?.focus();
  };

  const handleCellKeyDown = (
    dayIdx: number,
    hour: number,
    e: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        moveFocusTo(dayIdx, hour + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveFocusTo(dayIdx, hour - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveFocusTo(dayIdx + 1, hour);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocusTo(dayIdx - 1, hour);
        break;
      case 'Home':
        e.preventDefault();
        moveFocusTo(dayIdx, 0);
        break;
      case 'End':
        e.preventDefault();
        moveFocusTo(dayIdx, 23);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        toggleSingleCell(dayIdx, hour);
        break;
      case 'Escape':
        cancelDrag();
        break;
    }
  };

  const activeTooltipText = activeSlot
    ? formatSlotRange(activeSlot.dayIdx, activeSlot.hour)
    : null;
  const activeTooltipIsSelected = activeSlot
    ? currentMatrix[DAY_DEFS[activeSlot.dayIdx].key].includes(activeSlot.hour)
    : false;

  const summaryText = useMemo(
    () => formatScheduleSummary(currentMatrix),
    [currentMatrix],
  );

  return (
    <div
      className={`omada-schedule rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-4 ${
        disabled ? 'opacity-55' : ''
      } ${className}`.trim()}
    >
      {/* Header Toolbar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--omada-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[2px] bg-[var(--omada-brand)]" />
            <span>Active</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[2px] border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)]" />
            <span>Inactive</span>
          </span>
          {activeTooltipText && (
            <span
              role="tooltip"
              className="tabular-nums inline-flex items-center gap-1.5 rounded bg-[var(--omada-bg-tooltip)] px-2 py-0.5 text-[11px] font-medium text-[var(--omada-text-inverse)] shadow-[var(--omada-shadow-tooltip)]"
            >
              <span>{activeTooltipText}</span>
              <span className="opacity-75">
                · {activeTooltipIsSelected ? 'Active' : 'Inactive'}
              </span>
            </span>
          )}
        </div>

        {showPresets && presets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((preset) => (
              <SButton
                key={preset.key}
                size="small"
                variant="secondary"
                disabled={!isInteractive}
                onClick={() => isInteractive && commitMatrix(normalizeScheduleValue(preset.getMatrix()))}
              >
                {preset.label}
              </SButton>
            ))}
          </div>
        )}
      </div>

      {/* 7 × 24 Interactive Matrix */}
      <div
        className="overflow-x-auto pb-1"
        onMouseLeave={() => {
          if (!dragRef.current) setActiveSlot(null);
        }}
        onPointerUp={finishDrag}
        onMouseUp={finishDrag}
      >
        <div
          role="grid"
          aria-label={ariaLabel}
          aria-readonly={readOnly}
          aria-disabled={disabled}
          className="inline-grid min-w-[640px] select-none gap-1"
          style={{
            gridTemplateColumns: '48px repeat(24, minmax(22px, 1fr))',
          }}
        >
          {/* Hour Header Row */}
          <div role="row" className="contents">
            <div
              role="columnheader"
              className="flex h-6 items-center justify-start text-[11px] font-medium text-[var(--omada-text-tertiary)]"
            >
              Day
            </div>
            {HOURS.map((hour) => (
              <button
                key={`hdr-${hour}`}
                type="button"
                role="columnheader"
                disabled={!isInteractive}
                title={`Toggle ${padHour(hour)}:00 across all days`}
                aria-label={`Toggle ${padHour(hour)}:00 across all days`}
                onClick={() => toggleHourColumn(hour)}
                className={`tabular-nums flex h-6 items-center justify-center rounded-[2px] text-[11px] font-medium text-[var(--omada-text-secondary)] transition-colors ${
                  isInteractive
                    ? 'cursor-pointer hover:bg-[var(--omada-bg-field)] hover:text-[var(--omada-text-primary)]'
                    : 'cursor-default'
                }`}
              >
                {padHour(hour)}
              </button>
            ))}
          </div>

          {/* 7 Day Rows */}
          {DAY_DEFS.map((day, dayIdx) => {
            const activeSet = new Set(currentMatrix[day.key]);
            return (
              <div key={day.key} role="row" className="contents">
                <button
                  type="button"
                  role="rowheader"
                  disabled={!isInteractive}
                  title={`Toggle all of ${day.fullName}`}
                  aria-label={`Toggle all of ${day.fullName}`}
                  onClick={() => toggleDayRow(dayIdx)}
                  className={`flex h-7 items-center justify-start rounded-[2px] px-1 text-xs font-medium text-[var(--omada-text-primary)] transition-colors ${
                    isInteractive
                      ? 'cursor-pointer hover:bg-[var(--omada-bg-field)]'
                      : 'cursor-default'
                  }`}
                >
                  {day.label}
                </button>

                {HOURS.map((hour) => {
                  const baseActive = activeSet.has(hour);
                  const inDragRect =
                    dragState !== null &&
                    isInRect({ dayIdx, hour }, dragState.start, dragState.current);
                  const effectiveActive = inDragRect
                    ? dragState.mode === 'paint'
                    : baseActive;
                  const isErasingPreview =
                    inDragRect && dragState.mode === 'erase' && baseActive;
                  const isPaintingPreview =
                    inDragRect && dragState.mode === 'paint' && !baseActive;
                  const isFocused =
                    focusedSlot.dayIdx === dayIdx && focusedSlot.hour === hour;
                  const slotLabel = formatSlotRange(dayIdx, hour);

                  return (
                    <button
                      key={`${day.key}-${hour}`}
                      ref={(el) => {
                        cellRefs.current[`${dayIdx}-${hour}`] = el;
                      }}
                      type="button"
                      role="gridcell"
                      tabIndex={isFocused ? 0 : -1}
                      disabled={disabled}
                      aria-selected={effectiveActive}
                      aria-label={slotLabel}
                      title={slotLabel}
                      data-day={day.key}
                      data-hour={hour}
                      data-active={String(effectiveActive)}
                      onPointerDown={(e) => {
                        if (e.button === 0 || e.pointerType !== 'mouse') {
                          startDrag(dayIdx, hour, 'pointer');
                        }
                      }}
                      onMouseDown={(e) => {
                        if (e.button === 0) {
                          startDrag(dayIdx, hour, 'mouse');
                        }
                      }}
                      onPointerEnter={() => enterCell(dayIdx, hour)}
                      onMouseEnter={() => enterCell(dayIdx, hour)}
                      onFocus={() => {
                        const coord = { dayIdx, hour };
                        setFocusedSlot(coord);
                        setActiveSlot(coord);
                      }}
                      onClick={() => handleCellClick(dayIdx, hour)}
                      onKeyDown={(e) => handleCellKeyDown(dayIdx, hour, e)}
                      className={`omada-schedule-cell h-7 rounded-[2px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--omada-border-focus)] ${
                        disabled
                          ? 'cursor-not-allowed'
                          : readOnly
                            ? 'cursor-default'
                            : 'cursor-pointer'
                      } ${
                        isErasingPreview
                          ? 'border-[var(--omada-color-error)] bg-[var(--omada-color-error-bg)]'
                          : isPaintingPreview
                            ? 'border-[var(--omada-brand-hover)] bg-[var(--omada-brand-hover)]'
                            : effectiveActive
                              ? 'border-transparent bg-[var(--omada-brand)] hover:bg-[var(--omada-brand-hover)]'
                              : 'border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] hover:border-[var(--omada-brand)] hover:bg-[var(--omada-bg-field-hover)]'
                      }`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Summary */}
      {showSummary && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--omada-border-divider)] pt-2.5 text-xs text-[var(--omada-text-secondary)]">
          <span className="tabular-nums font-medium text-[var(--omada-text-primary)]">
            {summaryText}
          </span>
          <span className="text-[11px] text-[var(--omada-text-tertiary)]">
            {readOnly
              ? 'Read-only preview'
              : 'Click or drag across cells to paint / erase hours'}
          </span>
        </div>
      )}
    </div>
  );
};
