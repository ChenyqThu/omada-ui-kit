import React from 'react';
import {
  TimePicker,
  type TimePickerProps,
  type TimeRangePickerProps,
} from 'antd';
import { SIcon } from '../assets/SIcon';

export interface STimePickerProps extends TimePickerProps {}

export interface STimeRangePickerProps extends TimeRangePickerProps {}

function mergeTimeClassNames<T extends { root?: string; popup?: unknown }>(
  baseRoot: string,
  basePopupRoot: string,
  userClassNames?: T | ((info: never) => T),
): T | ((info: never) => T) {
  if (typeof userClassNames === 'function') {
    return (info: never) =>
      mergeTimeClassNames(baseRoot, basePopupRoot, userClassNames(info)) as T;
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
 * Omada single TimePicker defaulting to filled styling (`#F4F4F4` light / `#272727` dark),
 * Figma clock icon, and 24-hour (`HH:mm:ss`) or 12-hour (`hh:mm A`) wheel popup.
 */
export const STimePicker: React.FC<STimePickerProps> = ({
  variant = 'filled',
  use12Hours = false,
  format,
  placeholder = 'Select time',
  suffix,
  className = '',
  classNames,
  ...rest
}) => {
  const resolvedFormat = format ?? (use12Hours ? 'hh:mm A' : 'HH:mm:ss');
  const mergedClassNames = mergeTimeClassNames(
    'omada-input omada-time-picker',
    'omada-timepicker-popup',
    classNames as { root?: string; popup?: unknown } | undefined,
  );

  return (
    <TimePicker
      variant={variant}
      use12Hours={use12Hours}
      format={resolvedFormat}
      placeholder={placeholder}
      suffix={
        suffix ?? (
          <SIcon
            name="input-time"
            size={16}
            className="text-[var(--omada-text-tertiary)]"
          />
        )
      }
      className={className}
      classNames={mergedClassNames as TimePickerProps['classNames']}
      {...rest}
    />
  );
};

/**
 * Omada TimeRangePicker defaulting to filled styling (`Start Time` - `End Time`),
 * Figma clock icon, and Light/Dark popup parity.
 */
export const STimeRangePicker: React.FC<STimeRangePickerProps> = ({
  variant = 'filled',
  use12Hours = false,
  format,
  placeholder = ['Start Time', 'End Time'],
  suffix,
  className = '',
  classNames,
  ...rest
}) => {
  const resolvedFormat = format ?? (use12Hours ? 'hh:mm A' : 'HH:mm:ss');
  const mergedClassNames = mergeTimeClassNames(
    'omada-input omada-time-picker omada-time-range-picker',
    'omada-timepicker-popup',
    classNames as { root?: string; popup?: unknown } | undefined,
  );

  return (
    <TimePicker.RangePicker
      variant={variant}
      use12Hours={use12Hours}
      format={resolvedFormat}
      placeholder={placeholder}
      suffix={
        suffix ?? (
          <SIcon
            name="input-time"
            size={16}
            className="text-[var(--omada-text-tertiary)]"
          />
        )
      }
      className={className}
      classNames={mergedClassNames as TimeRangePickerProps['classNames']}
      {...rest}
    />
  );
};
