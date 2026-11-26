import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  OmadaAgentProvider,
  OmadaProvider,
  Popover,
  SButton,
  SCheckbox,
  SModal,
  useControllableState,
  useDragSelect,
  useOmadaAgentControl,
  useRovingFocus,
  useSelection,
  type OmadaAgentRuntime,
} from '../omada';

describe('Headless Behavior Primitives & 4-Layer AntD Non-Conflict Suite', () => {
  describe('useControllableState', () => {
    it('supports uncontrolled functional updates, Object.is deduplication, and controlled external state', async () => {
      const onChange = vi.fn();

      const Counter: React.FC<{ value?: number }> = ({ value }) => {
        const [count, setCount] = useControllableState<number>({
          value,
          defaultValue: () => 2,
          onChange,
        });
        return (
          <div>
            <span data-testid="val">{count}</span>
            <button type="button" onClick={() => setCount((prev) => prev + 3)}>
              inc
            </button>
            <button type="button" onClick={() => setCount((prev) => prev)}>
              noop
            </button>
            <button
              type="button"
              onClick={() => {
                setCount((prev) => prev + 3);
                setCount((prev) => prev + 3);
              }}
            >
              double-inc
            </button>
          </div>
        );
      };

      const { rerender } = render(<Counter />);
      expect(screen.getByTestId('val').textContent).toBe('2');

      // No-op update does not invoke onChange
      fireEvent.click(screen.getByText('noop'));
      expect(onChange).not.toHaveBeenCalled();

      // Uncontrolled functional update mutates state and invokes onChange
      fireEvent.click(screen.getByText('inc'));
      expect(screen.getByTestId('val').textContent).toBe('5');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(5);

      // Controlled mode: UI tracks prop `value` and emits `onChange(13)` without self-mutating
      rerender(<Counter value={10} />);
      expect(screen.getByTestId('val').textContent).toBe('10');
      fireEvent.click(screen.getByText('inc'));
      expect(onChange).toHaveBeenLastCalledWith(13);
      expect(screen.getByTestId('val').textContent).toBe('10');

      rerender(<Counter value={13} />);
      expect(screen.getByTestId('val').textContent).toBe('13');

      // Consecutive synchronous functional updates in controlled mode accumulate (13 -> 16 -> 19)
      fireEvent.click(screen.getByText('double-inc'));
      expect(onChange).toHaveBeenLastCalledWith(19);
      // After the event turn ends, if parent chose NOT to update `value={13}`, next click reconciles from 13 -> 16
      await Promise.resolve();
      fireEvent.click(screen.getByText('inc'));
      expect(onChange).toHaveBeenLastCalledWith(16);
    });
  });

  describe('useSelection', () => {
    const ITEMS: ReadonlyArray<{ key: string; disabled?: boolean }> = [
      { key: 'p1' },
      { key: 'p2' },
      { key: 'p3', disabled: true },
      { key: 'p4' },
      { key: 'p5' },
    ];

    it('handles multi-select, Shift+Click contiguous range (skipping disabled), selectAll, invert, clear, and indeterminate flags', () => {
      let api!: ReturnType<typeof useSelection<string>>;
      const Harness: React.FC = () => {
        api = useSelection({
          items: ITEMS,
          mode: 'multiple',
          defaultSelectedKeys: ['p1'],
        });
        return (
          <div data-testid="sel">
            {api.selectedKeys.join(',')}|{String(api.isAllSelected)}|
            {String(api.isPartiallySelected)}
          </div>
        );
      };

      render(<Harness />);
      expect(screen.getByTestId('sel').textContent).toBe('p1|false|true');

      // Shift+Click from anchor p1 -> p4 selects p1, p2, p4 (skipping disabled p3!)
      act(() => {
        api.toggle('p4', { shiftKey: true });
      });
      expect(api.selectedKeys).toEqual(['p1', 'p2', 'p4']);
      expect(api.isPartiallySelected).toBe(true);
      expect(api.isAllSelected).toBe(false);

      // Select all enabled items -> p1, p2, p4, p5
      act(() => {
        api.selectAll();
      });
      expect(api.selectedKeys).toEqual(['p1', 'p2', 'p4', 'p5']);
      expect(api.isAllSelected).toBe(true);
      expect(api.isPartiallySelected).toBe(false);

      // Deselect p2, then invert -> only p2 selected
      act(() => {
        api.deselect('p2');
        api.invert();
      });
      expect(api.selectedKeys).toEqual(['p2']);

      // Disabled item cannot be selected
      act(() => {
        api.toggle('p3');
      });
      expect(api.selectedKeys).toEqual(['p2']);

      // Clear resets to empty
      act(() => {
        api.clear();
      });
      expect(api.selectedKeys).toEqual([]);
      expect(api.isAllSelected).toBe(false);
      expect(api.isPartiallySelected).toBe(false);
    });

    it('enforces single-select mode and disallowEmpty guard', () => {
      let api!: ReturnType<typeof useSelection<string>>;
      const SingleHarness: React.FC = () => {
        api = useSelection({
          items: ITEMS,
          mode: 'single',
          defaultSelectedKeys: ['p1'],
          disallowEmpty: true,
        });
        return <div data-testid="single">{api.selectedKeys.join(',')}</div>;
      };

      render(<SingleHarness />);
      expect(api.selectedKeys).toEqual(['p1']);

      // Toggling the active item when disallowEmpty=true preserves ['p1']
      act(() => {
        api.toggle('p1');
      });
      expect(api.selectedKeys).toEqual(['p1']);

      // Selecting p4 replaces p1
      act(() => {
        api.toggle('p4');
      });
      expect(api.selectedKeys).toEqual(['p4']);
    });
  });

  describe('useDragSelect', () => {
    it('supports brush paint/erase strokes without synthetic-click double-toggle and range strategy', () => {
      const CELLS = [
        { key: 'h0' },
        { key: 'h1' },
        { key: 'h2', disabled: true },
        { key: 'h3' },
        { key: 'h4' },
      ];

      const PaintGrid: React.FC<{ strategy?: 'paint' | 'range' }> = ({
        strategy = 'paint',
      }) => {
        const [keys, setKeys] = useState<string[]>([]);
        const drag = useDragSelect({
          items: CELLS,
          selectedKeys: keys,
          onSelectionChange: setKeys,
          strategy,
        });

        return (
          <div>
            <div data-testid="keys">{keys.join(',')}</div>
            <div data-testid="dragging">{String(drag.isDragging)}</div>
            {CELLS.map((c) => (
              <button
                key={c.key}
                type="button"
                data-testid={c.key}
                disabled={c.disabled}
                {...drag.getDragItemProps(c.key, {
                  disabled: c.disabled,
                  onClick: () =>
                    setKeys((prev) =>
                      prev.includes(c.key)
                        ? prev.filter((k) => k !== c.key)
                        : [...prev, c.key],
                    ),
                })}
              >
                {c.key}
              </button>
            ))}
          </div>
        );
      };

      const { unmount } = render(<PaintGrid strategy="paint" />);

      // 1. Single pointer press + synthetic click does NOT double-toggle back to empty
      const h0 = screen.getByTestId('h0');
      fireEvent.pointerDown(h0, { button: 0 });
      expect(screen.getByTestId('dragging').textContent).toBe('true');
      fireEvent.pointerUp(window);
      fireEvent.click(h0, { detail: 1 });
      expect(screen.getByTestId('dragging').textContent).toBe('false');
      expect(screen.getByTestId('keys').textContent).toBe('h0');

      // 2. Drag-paint stroke from unselected h1 across disabled h2 -> h3 -> h4
      fireEvent.pointerDown(screen.getByTestId('h1'), { button: 0 });
      fireEvent.pointerEnter(screen.getByTestId('h2'));
      fireEvent.pointerEnter(screen.getByTestId('h3'));
      fireEvent.pointerEnter(screen.getByTestId('h4'));
      fireEvent.pointerUp(window);
      expect(screen.getByTestId('keys').textContent).toBe('h0,h1,h3,h4');

      // 3. Erase stroke starting on selected h1 across h3
      fireEvent.pointerDown(screen.getByTestId('h1'), { button: 0 });
      fireEvent.pointerEnter(screen.getByTestId('h3'));
      fireEvent.pointerUp(window);
      expect(screen.getByTestId('keys').textContent).toBe('h0,h4');

      unmount();

      // 4. Range strategy spans anchor -> target
      render(<PaintGrid strategy="range" />);
      fireEvent.pointerDown(screen.getByTestId('h1'), { button: 0 });
      fireEvent.pointerEnter(screen.getByTestId('h4'));
      fireEvent.pointerUp(window);
      expect(screen.getByTestId('keys').textContent).toBe('h1,h3,h4');
    });
  });

  describe('4-Layer Custom Omada Component inside AntD SModal + Popover + Scoped CSS + Agent Bridge', () => {
    const PORTS: ReadonlyArray<{
      key: string;
      label: string;
      disabled?: boolean;
    }> = [
      { key: 'ge1', label: 'GE1' },
      { key: 'ge2', label: 'GE2' },
      { key: 'ge3', label: 'GE3' },
      { key: 'ge4', label: 'GE4 (Uplink)', disabled: true },
      { key: 'ge5', label: 'GE5' },
    ];

    const CustomPoePortMatrix: React.FC<{
      agentId: string;
      defaultValue?: string[];
    }> = ({ agentId, defaultValue = ['ge1'] }) => {
      const selection = useSelection({
        items: PORTS,
        mode: 'multiple',
        defaultSelectedKeys: defaultValue,
      });

      const drag = useDragSelect({
        items: PORTS,
        selectedKeys: selection.selectedKeys,
        onSelectionChange: selection.setSelectedKeys,
        strategy: 'paint',
      });

      const roving = useRovingFocus({
        items: PORTS,
        orientation: 'horizontal',
        activationMode: 'manual',
        onActivate: (key) => selection.toggle(key),
      });

      useOmadaAgentControl({
        id: agentId,
        kind: 'checkbox',
        label: 'PoE Port Matrix',
        value: selection.selectedKeys,
        actions: {
          setValue: (next: unknown) =>
            selection.setSelectedKeys(Array.isArray(next) ? next.map(String) : []),
          selectAll: () => selection.selectAll(),
          clear: () => selection.clear(),
        },
      });

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SCheckbox
              checked={selection.isAllSelected}
              indeterminate={selection.isPartiallySelected}
              onChange={() =>
                selection.isAllSelected ? selection.clear() : selection.selectAll()
              }
            >
              All PoE Ports
            </SCheckbox>
            <Popover
              trigger="click"
              content={<div data-testid="poe-budget-popover">PoE Budget: 120W</div>}
            >
              <SButton size="small" variant="outline">
                Budget Info
              </SButton>
            </Popover>
          </div>
          <div role="group" aria-label="PoE Port Matrix">
            {PORTS.map((port) => {
              const isDisabled = Boolean(port.disabled);
              const rovingProps = roving.getItemProps<HTMLButtonElement>(port.key, {
                disabled: isDisabled,
              });
              const dragProps = drag.getDragItemProps<HTMLButtonElement>(port.key, {
                disabled: isDisabled,
                onClick: (e) => selection.toggle(port.key, { shiftKey: e.shiftKey }),
              });
              return (
                <button
                  key={port.key}
                  type="button"
                  data-testid={`port-${port.key}`}
                  disabled={isDisabled}
                  aria-pressed={selection.isSelected(port.key)}
                  {...rovingProps}
                  {...dragProps}
                >
                  {port.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    it('operates orthogonally inside scoped SModal + Popover with roving focus, drag paint, Shift+Click, and window.__OMADA_AGENT__', () => {
      const onModalCancel = vi.fn();

      const { unmount } = render(
        <OmadaProvider syncDocumentTheme={false} defaultThemeMode="dark">
          <OmadaAgentProvider exposeWindowBridge>
            <SModal
              agentId="poe.modal"
              open
              title="Configure PoE Schedule Ports"
              onCancel={onModalCancel}
            >
              <CustomPoePortMatrix agentId="poe.ports" />
            </SModal>
          </OmadaAgentProvider>
        </OmadaProvider>,
      );

      // 1. Single roving tabStop inside modal
      const ge1 = screen.getByTestId('port-ge1');
      const ge2 = screen.getByTestId('port-ge2');
      const ge3 = screen.getByTestId('port-ge3');
      const ge5 = screen.getByTestId('port-ge5');
      expect(ge1.tabIndex).toBe(0);
      expect(ge2.tabIndex).toBe(-1);

      // 2. Keyboard navigation + Enter toggle does NOT dismiss SModal
      ge1.focus();
      fireEvent.keyDown(ge1, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(ge2);
      fireEvent.keyDown(ge2, { key: 'Enter' });
      expect(ge2.getAttribute('aria-pressed')).toBe('true');
      expect(onModalCancel).not.toHaveBeenCalled();

      // 3. Pointer drag-paint across ge3 -> ge5 inside SModal works cleanly
      act(() => {
        fireEvent.pointerDown(ge3, { button: 0 });
        fireEvent.pointerEnter(ge5);
        fireEvent.pointerUp(window);
      });
      expect(ge3.getAttribute('aria-pressed')).toBe('true');
      expect(ge5.getAttribute('aria-pressed')).toBe('true');
      expect(onModalCancel).not.toHaveBeenCalled();

      // 4. Inner AntD Popover mounts inside .omada-scope without closing outer SModal
      fireEvent.click(screen.getByRole('button', { name: 'Budget Info' }));
      const popContent = screen.getByTestId('poe-budget-popover');
      expect(popContent.closest('.omada-scope')).not.toBeNull();
      expect(onModalCancel).not.toHaveBeenCalled();

      // 5. External Agent Bridge reads & mutates custom component deterministically
      const win = window as unknown as { __OMADA_AGENT__?: OmadaAgentRuntime };
      expect(win.__OMADA_AGENT__).toBeDefined();
      const snap = win.__OMADA_AGENT__!.query({ id: 'poe.ports' })[0];
      expect(snap.value).toEqual(['ge1', 'ge2', 'ge3', 'ge5']);

      act(() => {
        win.__OMADA_AGENT__!.act('poe.ports', 'setValue', ['ge1', 'ge5']);
      });
      expect(ge2.getAttribute('aria-pressed')).toBe('false');
      expect(ge5.getAttribute('aria-pressed')).toBe('true');

      unmount();
    });
  });
});
