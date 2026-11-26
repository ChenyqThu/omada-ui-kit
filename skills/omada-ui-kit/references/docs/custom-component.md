# Authoring Custom Omada Components — Headless Hooks & 4-Layer Formula (`@chenyqthu/omada-ui-kit/core`)

When a PRD needs a novel domain widget not in the built-in catalog (e.g., RF channel spectrum strip, PoE port painter, VLAN matrix, custom policy card), combine these headless hooks with AntD 6 overlay shells and `--omada-*` tokens for zero DOM/focus conflicts and automatic Agent Bridge support.

### `useControllableState` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Headless controlled / uncontrolled state primitive for custom Omada components. Supports rapid synchronous functional updaters (`setState(prev => next)`), reconciles back to `value` via microtask + commit effect even when a controlled parent ignores `onChange` without re-rendering, avoids stale closures, and deduplicates identical updates via `Object.is`.

### `useDragSelect` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Headless pointer drag-paint / range-sweep primitive for custom Omada widgets (7x24 schedules, switch port panels, RF channel strips, VLAN tag grids). Orthogonal to Ant Design 6 `Modal` / `Drawer` / `Popover` and `useRovingFocus`: - Installs pointerup/cancel listeners synchronously on `pointerdown` and cleans up all timers/listeners on unmount. - Tracks `pointerId` so secondary touch/pen pointers cannot corrupt an active stroke. - Defers `Shift+Click` to `useSelection` and preserves keyboard `Enter`/`Space` activation.

### `useRovingFocus` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Headless WAI-ARIA roving `tabIndex` hook supporting horizontal, vertical, and 2D grid navigation, `Home` / `End` jumps, optional circular looping, and automatic or manual activation.

### `useSelection` (`hook` · `@chenyqthu/omada-ui-kit/core`)
Headless single/multi selection state machine for custom Omada widgets (port matrices, channel strips, card grids, grouped checklists). Supports `Shift+Click` contiguous range selection, `indeterminate` header state, and `disabled` guards.

## The 4-Layer Zero-Conflict Authoring Formula

1. **Layer 1 — Reuse AntD 6 Overlay & Container Shells (Never Re-invent DOM Globals)**
   - Wrap popups, menus, dialogs, and drawers in `<Popover>`, `<Dropdown>`, `<SModal>`, or `<SDrawer>`.
   - **NEVER** call `createPortal(..., document.body)`, attach `document.addEventListener('mousedown', ...)` click-outside traps, or mutate `document.body.style.overflow`. `<OmadaProvider>` already binds AntD `getPopupContainer` (preserving `.omada-scope` Dark Mode variables), `Escape` dismissal stacks, and focus traps.
2. **Layer 2 — Drive State, Selection, Pointer Drag & Keyboard with Headless Hooks**
   - `useControllableState({ value, defaultValue, onChange })`: Dual controlled/uncontrolled state without stale closures.
   - `useSelection({ items, mode, selectedKeys, defaultSelectedKeys, onSelectionChange })`: Single/multi selection, `Shift+Click` range toggle (`toggle(key, { shiftKey })`), `selectAll()`, `clear()`, `invert()`, and `isAllSelected` / `isPartiallySelected` (maps directly to `<SCheckbox indeterminate>`).
   - `useDragSelect({ items, selectedKeys, onSelectionChange, strategy })`: Pointer brush-paint (`'paint'`) or span (`'range'`) across ports, channels, or schedule cells without stealing keyboard focus or breaking outer AntD modals.
   - `useRovingFocus({ items, activeKey, onActivate, orientation, activationMode })`: Single `tabIndex={0}` stop + `Arrow*` / `Home` / `End` WAI-ARIA keyboard navigation.
3. **Layer 3 — Style Exclusively with `var(--omada-*)` Tokens & Official Figma Assets**
   - Use `--omada-bg-surface`, `--omada-bg-field`, `--omada-border-divider`, `--omada-brand`, `--omada-brand-bg-subtlest`, and `--omada-text-primary`. Because `@layer antd` is lower priority than `@layer utilities`, Tailwind utilities override cleanly without `!important`.
4. **Layer 4 — Register Deterministic Agent & WebMCP Control (`useOmadaAgentControl`)**
   - Bind `agentId?: string` to `useOmadaAgentControl` so `window.__OMADA_AGENT__` and WebMCP (`snapshot` / `query` / `act`) inspect and operate your custom widget identically to native `S*` components.

## Blueprint: Custom 6 GHz PSC Channel Matrix Widget

```tsx
import React from 'react';
import {
  SCheckbox,
  useDragSelect,
  useRovingFocus,
  useSelection,
} from '@chenyqthu/omada-ui-kit/core';
import { useOmadaAgentControl } from '@chenyqthu/omada-ui-kit/agent';

export interface ChannelItem {
  key: string;
  label: string;
  dfs?: boolean;
  disabled?: boolean;
}

export interface CustomChannelMatrixProps {
  agentId?: string;
  channels: readonly ChannelItem[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (channels: string[]) => void;
}

export const CustomChannelMatrix: React.FC<CustomChannelMatrixProps> = ({
  agentId,
  channels,
  value,
  defaultValue = [],
  onChange,
}) => {
  const selection = useSelection({
    items: channels,
    mode: 'multiple',
    selectedKeys: value,
    defaultSelectedKeys: defaultValue,
    onSelectionChange: onChange,
  });

  const drag = useDragSelect({
    items: channels,
    selectedKeys: selection.selectedKeys,
    onSelectionChange: selection.setSelectedKeys,
    strategy: 'paint',
  });

  const roving = useRovingFocus({
    items: channels,
    orientation: 'horizontal',
    activationMode: 'manual',
    onActivate: (k) => selection.toggle(k),
  });

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'checkbox',
          label: '6 GHz PSC Channels',
          value: selection.selectedKeys,
          options: channels.map((c) => ({ value: c.key, label: c.label, disabled: c.disabled })),
          actions: {
            setValue: (next: unknown) =>
              selection.setSelectedKeys(Array.isArray(next) ? next.map(String) : []),
            toggle: (k: unknown) => selection.toggle(String(k)),
            selectAll: () => selection.selectAll(),
            clear: () => selection.clear(),
          },
        }
      : null,
  );

  return (
    <div className="space-y-2 rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-3">
      <div className="flex items-center justify-between">
        <SCheckbox
          checked={selection.isAllSelected}
          indeterminate={selection.isPartiallySelected}
          onChange={() => (selection.isAllSelected ? selection.clear() : selection.selectAll())}
        >
          Select All PSC Channels ({selection.selectedKeys.length}/{channels.length})
        </SCheckbox>
      </div>
      <div role="group" aria-label="6 GHz PSC Channels" className="flex flex-wrap gap-1.5 select-none">
        {channels.map((ch) => {
          const active = selection.isSelected(ch.key);
          const rovingProps = roving.getItemProps<HTMLButtonElement>(ch.key, { disabled: ch.disabled });
          const dragProps = drag.getDragItemProps<HTMLButtonElement>(ch.key, {
            disabled: ch.disabled,
            onClick: (e) => selection.toggle(ch.key, { shiftKey: e.shiftKey }),
          });
          return (
            <button
              key={ch.key}
              type="button"
              disabled={ch.disabled}
              aria-pressed={active}
              {...rovingProps}
              {...dragProps}
              className={`h-8 min-w-[52px] rounded px-2 text-xs font-medium transition-colors ${
                active
                  ? 'border border-[var(--omada-brand)] bg-[var(--omada-brand-bg-subtlest)] text-[var(--omada-brand-text)]'
                  : 'border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] text-[var(--omada-text-primary)]'
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```
