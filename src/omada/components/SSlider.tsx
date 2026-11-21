import React, { useEffect, useState } from 'react';
import { Slider } from 'antd';
import type {
  SliderMarks,
  SliderRangeProps,
  SliderRef,
  SliderSingleProps,
  SliderTooltipProps,
} from 'antd/es/slider';
import { SNumberInput } from './SInput';

export type SSliderPreset = 'default' | 'color-temp' | 'hue' | 'brightness';
export type SSliderHandleVariant = 'ring' | 'solid';
export type SSliderStepPreset = 'levels' | '1-3' | '1-5' | '1-10' | '0-5' | '0-10';

export interface SSliderExtraProps {
  /** Renders paired filled `SNumberInput` field(s) synced with the slider and clamped on blur. */
  showInput?: boolean;
  /** Track color/gradient preset (`'default'` brand green, `'color-temp'`, `'hue'`, `'brightness'`). */
  preset?: SSliderPreset;
  /** Handle visual variant (`'ring'` bordered thumb vs `'solid'` filled thumb). */
  handleVariant?: SSliderHandleVariant;
  /** Renders vertical segmented tick bars on stepped sliders. */
  segmented?: boolean;
  /** Built-in Figma stepped mark presets (`'levels'`, `'1-3'`, `'1-5'`, `'1-10'`, `'0-5'`, `'0-10'`). */
  stepPreset?: SSliderStepPreset;
  /** Optional unit label appended in tooltips and paired inputs (e.g. `'K'`, `'%'`, `'dBm'`). */
  unit?: string;
  /** Optional leading icon rendered to the left of the slider track. */
  startIcon?: React.ReactNode;
  /** Optional trailing icon rendered to the right of the slider track. */
  endIcon?: React.ReactNode;
  /** Ref forwarded to the underlying AntD 6 Slider instance. */
  ref?: React.Ref<SliderRef>;
}

export type SSliderProps = (SliderSingleProps | SliderRangeProps) & SSliderExtraProps;

interface StepPresetConfig {
  min: number;
  max: number;
  step: number;
  marks: SliderMarks;
}

const STEP_PRESETS: Record<SSliderStepPreset, StepPresetConfig> = {
  levels: {
    min: 0,
    max: 100,
    step: 50,
    marks: { 0: 'Low', 50: 'Medium', 100: 'High' },
  },
  '1-3': {
    min: 1,
    max: 3,
    step: 1,
    marks: { 1: '1', 2: '2', 3: '3' },
  },
  '1-5': {
    min: 1,
    max: 5,
    step: 1,
    marks: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
  },
  '1-10': {
    min: 1,
    max: 10,
    step: 1,
    marks: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
    },
  },
  '0-5': {
    min: 0,
    max: 5,
    step: 1,
    marks: { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
  },
  '0-10': {
    min: 0,
    max: 10,
    step: 1,
    marks: {
      0: '0',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
    },
  },
};

function clampValue(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function parseInputText(raw: string, unit?: string): number | null {
  let cleaned = raw.trim();
  if (unit && cleaned.endsWith(unit)) {
    cleaned = cleaned.slice(0, -unit.length).trim();
  }
  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Omada Slider supporting single, range, stepped `marks`/`stepPreset`,
 * paired `showInput` numeric fields with blur clamping, and `color-temp` / `hue` / `brightness` presets.
 */
export const SSlider: React.FC<SSliderProps> = ({
  showInput = false,
  preset = 'default',
  handleVariant,
  segmented = false,
  stepPreset,
  unit,
  startIcon,
  endIcon,
  range,
  min,
  max,
  step,
  marks,
  dots,
  value,
  defaultValue,
  onChange,
  tooltip,
  disabled,
  className = '',
  style,
  ref,
  ...rest
}) => {
  const presetConfig = stepPreset ? STEP_PRESETS[stepPreset] : undefined;
  const resolvedMin = min ?? presetConfig?.min ?? 0;
  const resolvedMax = max ?? presetConfig?.max ?? 100;
  const resolvedStep = step === undefined ? (presetConfig?.step ?? 1) : step;
  const resolvedMarks = marks ?? presetConfig?.marks;
  const resolvedDots = dots ?? Boolean(stepPreset || segmented);
  const resolvedHandleVariant: SSliderHandleVariant =
    handleVariant ?? (preset !== 'default' ? 'solid' : 'ring');

  const isRange = Boolean(range);
  const isControlled = value !== undefined;

  const initialSingle =
    typeof defaultValue === 'number'
      ? clampValue(defaultValue, resolvedMin, resolvedMax)
      : resolvedMin;
  const initialRange: [number, number] =
    Array.isArray(defaultValue) && defaultValue.length >= 2
      ? [
          clampValue(defaultValue[0], resolvedMin, resolvedMax),
          clampValue(defaultValue[1], resolvedMin, resolvedMax),
        ]
      : [resolvedMin, resolvedMax];

  const [innerSingle, setInnerSingle] = useState<number>(initialSingle);
  const [innerRange, setInnerRange] = useState<[number, number]>(initialRange);

  const currentSingle =
    typeof value === 'number'
      ? clampValue(value, resolvedMin, resolvedMax)
      : innerSingle;

  const currentRange: [number, number] =
    Array.isArray(value) && value.length >= 2
      ? [
          clampValue(value[0], resolvedMin, resolvedMax),
          clampValue(value[1], resolvedMin, resolvedMax),
        ]
      : innerRange;

  const [singleDraft, setSingleDraft] = useState<string | number>(currentSingle);
  const [rangeLowDraft, setRangeLowDraft] = useState<string | number>(currentRange[0]);
  const [rangeHighDraft, setRangeHighDraft] = useState<string | number>(currentRange[1]);

  useEffect(() => {
    setSingleDraft(currentSingle);
  }, [currentSingle]);

  useEffect(() => {
    setRangeLowDraft(currentRange[0]);
    setRangeHighDraft(currentRange[1]);
  }, [currentRange[0], currentRange[1]]);

  const commitSingle = (next: number) => {
    const clamped = clampValue(next, resolvedMin, resolvedMax);
    if (!isControlled) {
      setInnerSingle(clamped);
    }
    setSingleDraft(clamped);
    (onChange as SliderSingleProps['onChange'])?.(clamped);
  };

  const commitRange = (next: [number, number]) => {
    const low = clampValue(next[0], resolvedMin, resolvedMax);
    const high = clampValue(Math.max(low, next[1]), resolvedMin, resolvedMax);
    const pair: [number, number] = [low, high];
    if (!isControlled) {
      setInnerRange(pair);
    }
    setRangeLowDraft(low);
    setRangeHighDraft(high);
    (onChange as SliderRangeProps['onChange'])?.(pair);
  };

  const handleSliderChange = (nextVal: number | number[]) => {
    if (isRange && Array.isArray(nextVal)) {
      commitRange([nextVal[0] ?? resolvedMin, nextVal[1] ?? resolvedMax]);
    } else if (!isRange && typeof nextVal === 'number') {
      commitSingle(nextVal);
    }
  };

  const formatTooltip = (val?: number) => {
    if (val === undefined) return '';
    if (!unit) return val;
    return unit === '%' ? `${val}%` : `${val} ${unit}`;
  };

  const mergedTooltip: SliderTooltipProps | undefined = unit
    ? {
        formatter: formatTooltip,
        ...tooltip,
      }
    : tooltip;

  const presetClass =
    preset !== 'default' ? `omada-slider-${preset}` : '';
  const handleClass =
    resolvedHandleVariant === 'solid' ? 'omada-slider-solid' : '';
  const segmentedClass = segmented ? 'omada-slider-segmented' : '';
  const sliderDisabled =
    typeof disabled === 'boolean'
      ? disabled
      : Array.isArray(disabled)
        ? disabled.every(Boolean)
        : false;

  const sliderProps = {
    ...rest,
    range,
    min: resolvedMin,
    max: resolvedMax,
    step: resolvedStep,
    marks: resolvedMarks,
    dots: resolvedDots,
    disabled,
    tooltip: mergedTooltip,
    value: isRange ? currentRange : currentSingle,
    onChange: handleSliderChange,
    className:
      `omada-slider ${presetClass} ${handleClass} ${segmentedClass} flex-1 ${className}`.trim(),
    style,
  } as SliderSingleProps | SliderRangeProps;

  const sliderNode = <Slider ref={ref} {...sliderProps} />;
  const inputWidth = unit ? 88 : 68;
  const unitSuffix = unit ? (
    <span className="text-xs text-[var(--omada-text-tertiary)]">{unit}</span>
  ) : undefined;

  if (!showInput && !startIcon && !endIcon) {
    return sliderNode;
  }

  return (
    <div className="flex w-full items-center gap-3">
      {showInput && isRange && (
        <SNumberInput
          aria-label="Minimum slider value"
          controls={false}
          disabled={sliderDisabled}
          value={rangeLowDraft as number}
          suffix={unitSuffix}
          style={{ width: inputWidth }}
          onChange={(val) => {
            if (val === null || val === undefined) {
              setRangeLowDraft('');
              return;
            }
            const num = Number(val);
            setRangeLowDraft(num);
            if (Number.isFinite(num) && num >= resolvedMin && num <= currentRange[1]) {
              commitRange([num, currentRange[1]]);
            }
          }}
          onBlur={(e) => {
            const parsed = parseInputText(e.target.value, unit);
            const clamped =
              parsed === null
                ? currentRange[0]
                : clampValue(parsed, resolvedMin, currentRange[1]);
            commitRange([clamped, currentRange[1]]);
          }}
        />
      )}

      {startIcon && (
        <span className="shrink-0 text-[var(--omada-text-secondary)]">
          {startIcon}
        </span>
      )}

      <div className="min-w-0 flex-1">{sliderNode}</div>

      {endIcon && (
        <span className="shrink-0 text-[var(--omada-text-secondary)]">
          {endIcon}
        </span>
      )}

      {showInput && isRange && (
        <SNumberInput
          aria-label="Maximum slider value"
          controls={false}
          disabled={sliderDisabled}
          value={rangeHighDraft as number}
          suffix={unitSuffix}
          style={{ width: inputWidth }}
          onChange={(val) => {
            if (val === null || val === undefined) {
              setRangeHighDraft('');
              return;
            }
            const num = Number(val);
            setRangeHighDraft(num);
            if (Number.isFinite(num) && num >= currentRange[0] && num <= resolvedMax) {
              commitRange([currentRange[0], num]);
            }
          }}
          onBlur={(e) => {
            const parsed = parseInputText(e.target.value, unit);
            const clamped =
              parsed === null
                ? currentRange[1]
                : clampValue(parsed, currentRange[0], resolvedMax);
            commitRange([currentRange[0], clamped]);
          }}
        />
      )}

      {showInput && !isRange && (
        <SNumberInput
          aria-label="Slider numeric value"
          controls={false}
          disabled={sliderDisabled}
          value={singleDraft as number}
          suffix={unitSuffix}
          style={{ width: inputWidth }}
          onChange={(val) => {
            if (val === null || val === undefined) {
              setSingleDraft('');
              return;
            }
            const num = Number(val);
            setSingleDraft(num);
            if (Number.isFinite(num) && num >= resolvedMin && num <= resolvedMax) {
              commitSingle(num);
            }
          }}
          onBlur={(e) => {
            const parsed = parseInputText(e.target.value, unit);
            const clamped =
              parsed === null
                ? currentSingle
                : clampValue(parsed, resolvedMin, resolvedMax);
            commitSingle(clamped);
          }}
        />
      )}
    </div>
  );
};
