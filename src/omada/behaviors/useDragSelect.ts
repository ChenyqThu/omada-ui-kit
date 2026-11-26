import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type DragSelectStrategy = 'paint' | 'range';

export interface DragSelectItem<K extends string | number = string> {
  key: K;
  disabled?: boolean;
}

export interface UseDragSelectOptions<K extends string | number = string> {
  /** Ordered items matching the visual strip or matrix order. */
  items: readonly DragSelectItem<K>[];
  /** Current selected keys (from `useSelection` or `useControllableState`). */
  selectedKeys: readonly K[];
  /** Invoked whenever pointer drag painting updates the selected keys. */
  onSelectionChange: (keys: K[]) => void;
  /** `'paint'` (toggle brush based on start item state, default) or `'range'` (contiguous span from anchor). */
  strategy?: DragSelectStrategy;
  /** Disable pointer drag selection globally. */
  disabled?: boolean;
}

export interface DragSelectItemProps<E extends HTMLElement = HTMLElement> {
  onPointerDown: React.PointerEventHandler<E>;
  onPointerEnter: React.PointerEventHandler<E>;
  onPointerCancel?: React.PointerEventHandler<E>;
  onClick: React.MouseEventHandler<E>;
  'data-dragging'?: 'true';
}

export interface UseDragSelectReturn<K extends string | number = string> {
  /** `true` while an active primary-pointer drag stroke is in progress. */
  isDragging: boolean;
  /** Brush polarity during an active `'paint'` stroke (`'select'` | `'deselect'` | `null`). */
  paintMode: 'select' | 'deselect' | null;
  /** Returns pointer & click handlers for an individual item without hijacking focus or AntD overlays. */
  getDragItemProps: <E extends HTMLElement = HTMLElement>(
    key: K,
    options?: {
      disabled?: boolean;
      onPointerDown?: React.PointerEventHandler<E>;
      onPointerEnter?: React.PointerEventHandler<E>;
      onPointerCancel?: React.PointerEventHandler<E>;
      onClick?: React.MouseEventHandler<E>;
    },
  ) => DragSelectItemProps<E>;
}

function sameKeys<K>(a: readonly K[], b: readonly K[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

/**
 * Headless pointer drag-paint / range-sweep primitive for custom Omada widgets
 * (7x24 schedules, switch port panels, RF channel strips, VLAN tag grids).
 *
 * Orthogonal to Ant Design 6 `Modal` / `Drawer` / `Popover` and `useRovingFocus`:
 * - Installs pointerup/cancel listeners synchronously on `pointerdown` and cleans up all timers/listeners on unmount.
 * - Tracks `pointerId` so secondary touch/pen pointers cannot corrupt an active stroke.
 * - Defers `Shift+Click` to `useSelection` and preserves keyboard `Enter`/`Space` activation.
 */
export function useDragSelect<K extends string | number = string>({
  items,
  selectedKeys,
  onSelectionChange,
  strategy = 'paint',
  disabled = false,
}: UseDragSelectOptions<K>): UseDragSelectReturn<K> {
  const [isDragging, setIsDragging] = useState(false);
  const [paintMode, setPaintMode] = useState<'select' | 'deselect' | null>(null);

  const selectedRef = useRef<readonly K[]>(selectedKeys);
  selectedRef.current = selectedKeys;

  const onChangeRef = useRef(onSelectionChange);
  onChangeRef.current = onSelectionChange;

  const strokeRef = useRef<{
    active: boolean;
    pointerId: number | null;
    mode: 'select' | 'deselect';
    anchorKey: K;
    initialSelection: K[];
    additiveRange: boolean;
  } | null>(null);

  const handledPointerClickKeyRef = useRef<K | null>(null);
  const clickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowCleanupRef = useRef<(() => void) | null>(null);

  const clearClickResetTimer = useCallback(() => {
    if (clickResetTimerRef.current !== null) {
      clearTimeout(clickResetTimerRef.current);
      clickResetTimerRef.current = null;
    }
  }, []);

  const detachWindowListeners = useCallback(() => {
    if (windowCleanupRef.current) {
      windowCleanupRef.current();
      windowCleanupRef.current = null;
    }
  }, []);

  const endStroke = useCallback(
    (scheduleClickGuardCleanup = true) => {
      detachWindowListeners();
      if (!strokeRef.current?.active) return;
      const lastHandledKey = handledPointerClickKeyRef.current;
      strokeRef.current = null;
      setIsDragging(false);
      setPaintMode(null);
      clearClickResetTimer();
      if (scheduleClickGuardCleanup && lastHandledKey !== null) {
        clickResetTimerRef.current = setTimeout(() => {
          clickResetTimerRef.current = null;
          if (handledPointerClickKeyRef.current === lastHandledKey) {
            handledPointerClickKeyRef.current = null;
          }
        }, 0);
      }
    },
    [clearClickResetTimer, detachWindowListeners],
  );

  useEffect(() => {
    return () => {
      detachWindowListeners();
      clearClickResetTimer();
      strokeRef.current = null;
      handledPointerClickKeyRef.current = null;
    };
  }, [clearClickResetTimer, detachWindowListeners]);

  const attachWindowSession = useCallback(() => {
    detachWindowListeners();
    if (typeof window === 'undefined') return;

    const handlePointerFinish = (ev: Event) => {
      const stroke = strokeRef.current;
      const evPointerId = (ev as PointerEvent).pointerId;
      if (
        stroke &&
        stroke.pointerId !== null &&
        typeof evPointerId === 'number' &&
        evPointerId !== stroke.pointerId
      ) {
        return;
      }
      endStroke(true);
    };

    const handleWindowBlur = () => endStroke(false);

    window.addEventListener('pointerup', handlePointerFinish);
    window.addEventListener('pointercancel', handlePointerFinish);
    window.addEventListener('blur', handleWindowBlur);

    windowCleanupRef.current = () => {
      window.removeEventListener('pointerup', handlePointerFinish);
      window.removeEventListener('pointercancel', handlePointerFinish);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [detachWindowListeners, endStroke]);

  const itemMetaMap = useMemo(() => {
    const map = new Map<K, { index: number; disabled: boolean }>();
    items.forEach((item, index) => {
      map.set(item.key, { index, disabled: Boolean(item.disabled) });
    });
    return map;
  }, [items]);

  const applyKeyDuringStroke = useCallback(
    (targetKey: K) => {
      const stroke = strokeRef.current;
      if (!stroke || !stroke.active) return;
      const meta = itemMetaMap.get(targetKey);
      if (!meta || meta.disabled) return;

      if (strategy === 'range') {
        const anchorMeta = itemMetaMap.get(stroke.anchorKey);
        if (!anchorMeta) return;
        const start = Math.min(anchorMeta.index, meta.index);
        const end = Math.max(anchorMeta.index, meta.index);
        const spanKeys = items
          .slice(start, end + 1)
          .filter((item) => !item.disabled)
          .map((item) => item.key);
        const next = stroke.additiveRange
          ? Array.from(new Set([...stroke.initialSelection, ...spanKeys]))
          : spanKeys;
        if (!sameKeys(selectedRef.current, next)) {
          selectedRef.current = next;
          onChangeRef.current(next);
        }
        return;
      }

      const current = selectedRef.current;
      const exists = current.includes(targetKey);
      if (stroke.mode === 'select' && !exists) {
        const next = [...current, targetKey];
        selectedRef.current = next;
        onChangeRef.current(next);
      } else if (stroke.mode === 'deselect' && exists) {
        const next = current.filter((k) => k !== targetKey);
        selectedRef.current = next;
        onChangeRef.current(next);
      }
    },
    [itemMetaMap, items, strategy],
  );

  const getDragItemProps = useCallback(
    <E extends HTMLElement = HTMLElement>(
      key: K,
      options?: {
        disabled?: boolean;
        onPointerDown?: React.PointerEventHandler<E>;
        onPointerEnter?: React.PointerEventHandler<E>;
        onPointerCancel?: React.PointerEventHandler<E>;
        onClick?: React.MouseEventHandler<E>;
      },
    ): DragSelectItemProps<E> => {
      const isItemDisabled =
        disabled || Boolean(options?.disabled) || Boolean(itemMetaMap.get(key)?.disabled);

      return {
        ...(isDragging ? { 'data-dragging': 'true' as const } : {}),
        onPointerDown: (event: React.PointerEvent<E>) => {
          options?.onPointerDown?.(event);
          if (
            event.defaultPrevented ||
            isItemDisabled ||
            (event.button !== undefined && event.button !== 0) ||
            event.shiftKey
          ) {
            return;
          }

          clearClickResetTimer();
          const current = selectedRef.current;
          const nextMode: 'select' | 'deselect' = current.includes(key)
            ? 'deselect'
            : 'select';
          const pointerId =
            typeof event.pointerId === 'number' ? event.pointerId : null;

          strokeRef.current = {
            active: true,
            pointerId,
            mode: nextMode,
            anchorKey: key,
            initialSelection: [...current],
            additiveRange: Boolean(event.metaKey || event.ctrlKey),
          };
          handledPointerClickKeyRef.current = key;
          attachWindowSession();
          setIsDragging(true);
          setPaintMode(nextMode);
          applyKeyDuringStroke(key);
        },
        onPointerEnter: (event: React.PointerEvent<E>) => {
          options?.onPointerEnter?.(event);
          const stroke = strokeRef.current;
          if (event.defaultPrevented || isItemDisabled || !stroke?.active) {
            return;
          }
          if (
            stroke.pointerId !== null &&
            typeof event.pointerId === 'number' &&
            event.pointerId !== stroke.pointerId
          ) {
            return;
          }
          applyKeyDuringStroke(key);
        },
        onPointerCancel: (event: React.PointerEvent<E>) => {
          options?.onPointerCancel?.(event);
          endStroke(false);
        },
        onClick: (event: React.MouseEvent<E>) => {
          if (handledPointerClickKeyRef.current === key) {
            handledPointerClickKeyRef.current = null;
            clearClickResetTimer();
            return;
          }
          options?.onClick?.(event);
        },
      };
    },
    [
      applyKeyDuringStroke,
      attachWindowSession,
      clearClickResetTimer,
      disabled,
      endStroke,
      isDragging,
      itemMetaMap,
    ],
  );

  return {
    isDragging,
    paintMode,
    getDragItemProps,
  };
}
