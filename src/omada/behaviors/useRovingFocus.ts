import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type RovingFocusOrientation = 'horizontal' | 'vertical' | 'both';
export type RovingFocusActivationMode = 'automatic' | 'manual';

export interface RovingFocusItem {
  key: string;
  disabled?: boolean;
}

export interface UseRovingFocusOptions {
  /** Ordered list of candidate items in the composite widget. */
  items: readonly RovingFocusItem[];
  /** Currently selected/active item key. */
  activeKey?: string;
  /** Callback invoked when an item is activated via keyboard. */
  onActivate?: (key: string) => void;
  /** Arrow-key axis (`'horizontal'` default, `'vertical'`, or `'both'`). */
  orientation?: RovingFocusOrientation;
  /** `'automatic'` activates on arrow focus; `'manual'` moves focus first and activates on Enter/Space. */
  activationMode?: RovingFocusActivationMode;
  /** Wrap focus from last enabled item to first (and vice versa). Default `true`. */
  loop?: boolean;
}

export interface RovingItemProps<E extends HTMLElement = HTMLElement> {
  ref: (node: E | null) => void;
  tabIndex: 0 | -1;
  onKeyDown: (event: React.KeyboardEvent<E>) => void;
  onFocus: (event: React.FocusEvent<E>) => void;
}

export interface UseRovingFocusReturn {
  /** Returns `ref`, `tabIndex`, `onKeyDown`, and `onFocus` props for each composite item. */
  getItemProps: <E extends HTMLElement = HTMLElement>(
    key: string,
    options?: {
      disabled?: boolean;
      onKeyDown?: React.KeyboardEventHandler<E>;
      onFocus?: React.FocusEventHandler<E>;
    },
  ) => RovingItemProps<E>;
  /** Key of the item currently holding `tabIndex={0}` (guaranteed first enabled item when no activeKey matches). */
  tabStopKey: string | null;
  /** Imperatively focus a registered item by key. */
  focusItem: (key: string) => void;
}

/**
 * Headless WAI-ARIA roving `tabIndex` hook supporting horizontal, vertical, and 2D grid navigation,
 * `Home` / `End` jumps, optional circular looping, and automatic or manual activation.
 */
export function useRovingFocus({
  items,
  activeKey,
  onActivate,
  orientation = 'horizontal',
  activationMode = 'automatic',
  loop = true,
}: UseRovingFocusOptions): UseRovingFocusReturn {
  const nodesRef = useRef<Map<string, HTMLElement>>(new Map());
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeKey !== undefined) {
      setFocusedKey(activeKey);
    }
  }, [activeKey]);

  const enabledItems = useMemo(
    () => items.filter((item) => !item.disabled),
    [items],
  );

  const enabledKeySet = useMemo(
    () => new Set(enabledItems.map((item) => item.key)),
    [enabledItems],
  );

  const tabStopKey = useMemo<string | null>(() => {
    if (enabledItems.length === 0) {
      return null;
    }
    if (
      activationMode === 'manual' &&
      focusedKey !== null &&
      enabledKeySet.has(focusedKey)
    ) {
      return focusedKey;
    }
    if (activeKey !== undefined && enabledKeySet.has(activeKey)) {
      return activeKey;
    }
    if (focusedKey !== null && enabledKeySet.has(focusedKey)) {
      return focusedKey;
    }
    return enabledItems[0].key;
  }, [enabledItems, enabledKeySet, activationMode, focusedKey, activeKey]);

  const focusItem = useCallback((targetKey: string) => {
    setFocusedKey(targetKey);
    const el = nodesRef.current.get(targetKey);
    if (el) {
      el.focus();
      el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
  }, []);

  const getItemProps = useCallback(
    <E extends HTMLElement = HTMLElement>(
      key: string,
      options?: {
        disabled?: boolean;
        onKeyDown?: React.KeyboardEventHandler<E>;
        onFocus?: React.FocusEventHandler<E>;
      },
    ): RovingItemProps<E> => {
      const isItemDisabled = Boolean(options?.disabled) || !enabledKeySet.has(key);
      const isTabStop = !isItemDisabled && tabStopKey === key;

      return {
        ref: (node: E | null) => {
          if (node) {
            nodesRef.current.set(key, node);
          } else {
            nodesRef.current.delete(key);
          }
        },
        tabIndex: isTabStop ? 0 : -1,
        onFocus: (event: React.FocusEvent<E>) => {
          options?.onFocus?.(event);
          if (!isItemDisabled) {
            setFocusedKey(key);
          }
        },
        onKeyDown: (event: React.KeyboardEvent<E>) => {
          options?.onKeyDown?.(event);
          if (event.defaultPrevented || isItemDisabled || enabledItems.length === 0) {
            return;
          }

          const allowHorizontal = orientation === 'horizontal' || orientation === 'both';
          const allowVertical = orientation === 'vertical' || orientation === 'both';

          let nextIndex: number | null = null;
          const currentIndex = enabledItems.findIndex((item) => item.key === key);
          const safeIndex = currentIndex >= 0 ? currentIndex : 0;
          const total = enabledItems.length;

          if (
            (allowHorizontal && event.key === 'ArrowRight') ||
            (allowVertical && event.key === 'ArrowDown')
          ) {
            if (safeIndex + 1 < total) {
              nextIndex = safeIndex + 1;
            } else if (loop) {
              nextIndex = 0;
            }
          } else if (
            (allowHorizontal && event.key === 'ArrowLeft') ||
            (allowVertical && event.key === 'ArrowUp')
          ) {
            if (safeIndex - 1 >= 0) {
              nextIndex = safeIndex - 1;
            } else if (loop) {
              nextIndex = total - 1;
            }
          } else if (event.key === 'Home') {
            nextIndex = 0;
          } else if (event.key === 'End') {
            nextIndex = total - 1;
          } else if (event.key === 'Enter' || event.key === ' ') {
            const isNativeButton = event.currentTarget.tagName === 'BUTTON';
            if (activationMode === 'manual' || !isNativeButton) {
              event.preventDefault();
              onActivate?.(key);
            }
            return;
          }

          if (nextIndex !== null) {
            event.preventDefault();
            event.stopPropagation();
            const target = enabledItems[nextIndex];
            if (target) {
              focusItem(target.key);
              if (activationMode === 'automatic') {
                onActivate?.(target.key);
              }
            }
          }
        },
      };
    },
    [enabledItems, enabledKeySet, tabStopKey, orientation, loop, activationMode, focusItem, onActivate],
  );

  return {
    getItemProps,
    tabStopKey,
    focusItem,
  };
}
