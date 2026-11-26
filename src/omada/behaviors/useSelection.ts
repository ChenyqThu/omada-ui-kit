import { useCallback, useMemo, useRef } from 'react';
import { useControllableState } from './useControllableState';

export type SelectionMode = 'single' | 'multiple';

export interface SelectionItem<K extends string | number = string> {
  key: K;
  disabled?: boolean;
}

export interface ToggleSelectionOptions {
  /** In `'multiple'` mode, selects or deselects the contiguous item span from the last anchor to `key`. */
  shiftKey?: boolean;
}

export interface UseSelectionOptions<K extends string | number = string> {
  /** Ordered candidate items (drives `selectAll`, `invert`, `Shift` range slicing, and `disabled` guards). */
  items: readonly SelectionItem<K>[];
  /** `'multiple'` (default) or `'single'`. */
  mode?: SelectionMode;
  /** Controlled selected keys. */
  selectedKeys?: readonly K[];
  /** Initial selected keys when uncontrolled. */
  defaultSelectedKeys?: readonly K[];
  /** Prevent deselecting the active item in `'single'` mode (default `false`). */
  disallowEmpty?: boolean;
  /** Invoked whenever the selected key list changes. */
  onSelectionChange?: (keys: K[]) => void;
}

export interface UseSelectionReturn<K extends string | number = string> {
  /** Currently selected keys. */
  selectedKeys: K[];
  /** Fast O(1) lookup set of currently selected keys. */
  selectedKeySet: ReadonlySet<K>;
  /** Most recently interacted item key used as the `Shift+Click` range anchor. */
  anchorKey: K | null;
  /** `true` when at least 1 enabled item exists and all enabled items are selected. */
  isAllSelected: boolean;
  /** `true` when some (but not all) enabled items are selected — maps directly to `<SCheckbox indeterminate>`. */
  isPartiallySelected: boolean;
  /** Checks whether `key` is currently selected. */
  isSelected: (key: K) => boolean;
  /** Toggles `key` (or contiguous `Shift` range in `'multiple'` mode) and returns the next keys. */
  toggle: (key: K, options?: ToggleSelectionOptions) => K[];
  /** Ensures `key` is selected (if enabled) and returns the next keys. */
  select: (key: K) => K[];
  /** Ensures `key` is deselected and returns the next keys. */
  deselect: (key: K) => K[];
  /** Replaces selected keys (deduplicated) and returns the next keys. */
  setSelectedKeys: (next: readonly K[] | ((prev: K[]) => readonly K[])) => K[];
  /** Selects all enabled items (in `'multiple'` mode) and returns the next keys. */
  selectAll: () => K[];
  /** Clears all non-disabled selections and returns the next keys. */
  clear: () => K[];
  /** Inverts selection across all enabled items (in `'multiple'` mode) and returns the next keys. */
  invert: () => K[];
}

function sameKeyArray<K>(a: readonly K[], b: readonly K[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

function dedupeKeys<K>(keys: readonly K[]): K[] {
  return Array.from(new Set(keys));
}

/**
 * Headless single/multi selection state machine for custom Omada widgets
 * (port matrices, channel strips, card grids, grouped checklists).
 * Supports `Shift+Click` contiguous range selection, `indeterminate` header state, and `disabled` guards.
 */
export function useSelection<K extends string | number = string>({
  items,
  mode = 'multiple',
  selectedKeys: controlledKeys,
  defaultSelectedKeys = [],
  disallowEmpty = false,
  onSelectionChange,
}: UseSelectionOptions<K>): UseSelectionReturn<K> {
  const controlledArray = useMemo(
    () => (controlledKeys !== undefined ? dedupeKeys(controlledKeys) : undefined),
    [controlledKeys],
  );

  const [selectedKeys, setRawSelectedKeys] = useControllableState<K[]>({
    value: controlledArray,
    defaultValue: () => dedupeKeys(defaultSelectedKeys),
    onChange: onSelectionChange,
  });

  const anchorRef = useRef<K | null>(defaultSelectedKeys[0] ?? null);

  const itemIndexMap = useMemo(() => {
    const map = new Map<K, { index: number; disabled: boolean }>();
    items.forEach((item, index) => {
      map.set(item.key, { index, disabled: Boolean(item.disabled) });
    });
    return map;
  }, [items]);

  const enabledKeys = useMemo(
    () => items.filter((item) => !item.disabled).map((item) => item.key),
    [items],
  );

  const selectedKeySet = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const commitKeys = useCallback(
    (updater: (prev: K[]) => readonly K[]): K[] => {
      return setRawSelectedKeys((prev) => {
        const candidate = dedupeKeys(updater(prev));
        const normalized = mode === 'single' ? candidate.slice(0, 1) : candidate;
        return sameKeyArray(prev, normalized) ? prev : normalized;
      });
    },
    [mode, setRawSelectedKeys],
  );

  const isSelected = useCallback(
    (key: K) => selectedKeySet.has(key),
    [selectedKeySet],
  );

  const setSelectedKeys = useCallback(
    (next: readonly K[] | ((prev: K[]) => readonly K[])): K[] => {
      return commitKeys((prev) =>
        typeof next === 'function' ? next(prev) : next,
      );
    },
    [commitKeys],
  );

  const select = useCallback(
    (key: K): K[] => {
      const meta = itemIndexMap.get(key);
      if (meta?.disabled) return selectedKeys;
      anchorRef.current = key;
      return commitKeys((prev) =>
        mode === 'single' ? [key] : prev.includes(key) ? prev : [...prev, key],
      );
    },
    [commitKeys, itemIndexMap, mode, selectedKeys],
  );

  const deselect = useCallback(
    (key: K): K[] => {
      const meta = itemIndexMap.get(key);
      if (meta?.disabled) return selectedKeys;
      return commitKeys((prev) => {
        if (disallowEmpty && prev.length <= 1 && prev[0] === key) {
          return prev;
        }
        return prev.filter((k) => k !== key);
      });
    },
    [commitKeys, disallowEmpty, itemIndexMap, selectedKeys],
  );

  const toggle = useCallback(
    (key: K, options?: ToggleSelectionOptions): K[] => {
      const meta = itemIndexMap.get(key);
      if (!meta || meta.disabled) return selectedKeys;

      if (mode === 'single') {
        anchorRef.current = key;
        return commitKeys((prev) => {
          if (prev[0] === key) {
            return disallowEmpty ? prev : [];
          }
          return [key];
        });
      }

      const anchor = anchorRef.current;
      if (options?.shiftKey && anchor !== null && itemIndexMap.has(anchor)) {
        const anchorIndex = itemIndexMap.get(anchor)!.index;
        const start = Math.min(anchorIndex, meta.index);
        const end = Math.max(anchorIndex, meta.index);
        const rangeEnabledKeys = items
          .slice(start, end + 1)
          .filter((item) => !item.disabled)
          .map((item) => item.key);

        return commitKeys((prev) => {
          const prevSet = new Set(prev);
          const shouldSelect = !prevSet.has(key);
          if (shouldSelect) {
            return [...prev, ...rangeEnabledKeys];
          }
          const removeSet = new Set(rangeEnabledKeys);
          const remaining = prev.filter((k) => !removeSet.has(k));
          return disallowEmpty && remaining.length === 0 ? prev.slice(0, 1) : remaining;
        });
      }

      anchorRef.current = key;
      return commitKeys((prev) => {
        if (prev.includes(key)) {
          if (disallowEmpty && prev.length <= 1) return prev;
          return prev.filter((k) => k !== key);
        }
        return [...prev, key];
      });
    },
    [commitKeys, disallowEmpty, itemIndexMap, items, mode, selectedKeys],
  );

  const selectAll = useCallback((): K[] => {
    if (mode === 'single') {
      return enabledKeys.length > 0 ? commitKeys(() => [enabledKeys[0]]) : selectedKeys;
    }
    return commitKeys((prev) => {
      const disabledSelected = prev.filter((k) => itemIndexMap.get(k)?.disabled);
      return [...disabledSelected, ...enabledKeys];
    });
  }, [commitKeys, enabledKeys, itemIndexMap, mode, selectedKeys]);

  const clear = useCallback((): K[] => {
    return commitKeys((prev) => {
      const disabledSelected = prev.filter((k) => itemIndexMap.get(k)?.disabled);
      if (disallowEmpty && disabledSelected.length === 0 && prev.length > 0) {
        return prev.slice(0, 1);
      }
      return disabledSelected;
    });
  }, [commitKeys, disallowEmpty, itemIndexMap]);

  const invert = useCallback((): K[] => {
    if (mode === 'single') return selectedKeys;
    return commitKeys((prev) => {
      const prevSet = new Set(prev);
      const disabledSelected = prev.filter((k) => itemIndexMap.get(k)?.disabled);
      const invertedEnabled = enabledKeys.filter((k) => !prevSet.has(k));
      const next = [...disabledSelected, ...invertedEnabled];
      return disallowEmpty && next.length === 0 ? prev.slice(0, 1) : next;
    });
  }, [commitKeys, disallowEmpty, enabledKeys, itemIndexMap, mode, selectedKeys]);

  const selectedEnabledCount = useMemo(
    () => enabledKeys.filter((k) => selectedKeySet.has(k)).length,
    [enabledKeys, selectedKeySet],
  );

  const isAllSelected =
    enabledKeys.length > 0 && selectedEnabledCount === enabledKeys.length;
  const isPartiallySelected =
    selectedEnabledCount > 0 && selectedEnabledCount < enabledKeys.length;

  return {
    selectedKeys,
    selectedKeySet,
    anchorKey: anchorRef.current,
    isAllSelected,
    isPartiallySelected,
    isSelected,
    toggle,
    select,
    deselect,
    setSelectedKeys,
    selectAll,
    clear,
    invert,
  };
}
