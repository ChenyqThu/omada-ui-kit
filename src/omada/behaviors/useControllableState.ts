import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseControllableStateOptions<T> {
  /** Controlled state value; when defined, overrides internal state. */
  value?: T;
  /** Initial value when uncontrolled (`value === undefined`). */
  defaultValue: T | (() => T);
  /** Invoked whenever `setValue` resolves a new value (`!Object.is(prev, next)`). */
  onChange?: (nextValue: T) => void;
}

export type SetControllableState<T> = (
  next: T | ((prev: T) => T),
) => T;

/**
 * Headless controlled / uncontrolled state primitive for custom Omada components.
 * Supports rapid synchronous functional updaters (`setState(prev => next)`), reconciles back
 * to `value` via microtask + commit effect even when a controlled parent ignores `onChange`
 * without re-rendering, avoids stale closures, and deduplicates identical updates via `Object.is`.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, SetControllableState<T>] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const currentRef = useRef<T>(currentValue);
  const latestControlledPropRef = useRef<T | undefined>(value);
  latestControlledPropRef.current = value;

  const prevControlledRef = useRef<T | undefined>(value);
  if (isControlled) {
    if (!Object.is(prevControlledRef.current, value)) {
      currentRef.current = value;
      prevControlledRef.current = value;
    }
  } else {
    currentRef.current = uncontrolledValue;
    prevControlledRef.current = undefined;
  }

  useEffect(() => {
    if (isControlled) {
      currentRef.current = value as T;
      prevControlledRef.current = value;
    }
  });

  const isControlledRef = useRef<boolean>(isControlled);
  isControlledRef.current = isControlled;

  const onChangeRef = useRef<typeof onChange>(onChange);
  onChangeRef.current = onChange;

  const pendingReconcileRef = useRef<boolean>(false);

  const setValue = useCallback<SetControllableState<T>>((next) => {
    const prev = currentRef.current;
    const resolved =
      typeof next === 'function'
        ? (next as (prevState: T) => T)(prev)
        : next;

    if (!Object.is(prev, resolved)) {
      currentRef.current = resolved;
      if (!isControlledRef.current) {
        setUncontrolledValue(resolved);
      } else if (!pendingReconcileRef.current) {
        pendingReconcileRef.current = true;
        queueMicrotask(() => {
          pendingReconcileRef.current = false;
          if (isControlledRef.current) {
            currentRef.current = latestControlledPropRef.current as T;
          }
        });
      }
      onChangeRef.current?.(resolved);
    }

    return resolved;
  }, []);

  return [currentValue, setValue];
}
