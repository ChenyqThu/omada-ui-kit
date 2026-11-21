import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OmadaProvider, SButton, SDrawer, SModal } from '@/omada';
import * as FeedbackOverlaysBarrel from '@/omada/modules/feedback-overlays';
import {
  SDrawerFooter,
  SInfoDialog,
  SLoading,
  SMask,
  SNotification,
  SPopconfirm,
  SPopover,
  SProgress,
  SSkeleton,
  SStepModal,
  STooltip,
  STruncatedText,
  useOmadaNotification,
} from '@/omada/modules/feedback-overlays';
import { FeedbackOverlaysSection } from '@/showcase/sections/FeedbackOverlaysSection';

function renderWithProvider(
  ui: React.ReactElement,
  themeMode: 'light' | 'dark' = 'light',
) {
  return render(
    <OmadaProvider defaultThemeMode={themeMode}>{ui}</OmadaProvider>,
  );
}

describe('feedback-overlays module barrel', () => {
  it('exports all new public components/hooks and excludes root-exported symbols', () => {
    const exportedKeys = Object.keys(FeedbackOverlaysBarrel);
    for (const symbol of [
      'SInfoDialog',
      'SStepModal',
      'SDrawerFooter',
      'SNotification',
      'useOmadaNotification',
      'SPopover',
      'SPopconfirm',
      'STooltip',
      'STruncatedText',
      'SProgress',
      'SLoading',
      'SSkeleton',
      'SMask',
    ]) {
      expect(exportedKeys).toContain(symbol);
    }

    for (const forbidden of [
      'SModal',
      'useOmadaConfirm',
      'SDrawer',
      'SAlert',
      'useOmadaFeedback',
    ]) {
      expect(exportedKeys).not.toContain(forbidden);
    }
  });
});

describe('SModal, SInfoDialog, SStepModal', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('supports expanded SModal sizes and subtitle/icon header slots', () => {
    renderWithProvider(
      <SModal
        open
        size="xl"
        icon={<span data-testid="modal-header-icon">IC</span>}
        title="VLAN Topology"
        subtitle="Configure core switches"
      >
        <div>Modal Body</div>
      </SModal>,
    );

    expect(screen.getByTestId('modal-header-icon')).toBeInTheDocument();
    expect(screen.getByText('VLAN Topology')).toBeInTheDocument();
    expect(screen.getByText('Configure core switches')).toBeInTheDocument();
    const modalDialog = document.querySelector('.ant-modal') as HTMLElement | null;
    expect(modalDialog?.style.width).toBe('1040px');
  });

  it('renders SInfoDialog with Figma status icon and Stop/OK actions', () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();

    renderWithProvider(
      <SInfoDialog
        open
        status="success"
        title="Firmware Upgrade Done"
        description="All 8 switches upgraded cleanly."
        cancelText="Stop"
        okText="Done"
        onOk={onOk}
        onCancel={onCancel}
      />,
    );

    expect(
      document.querySelector('[data-omada-icon="alert-status-success"]'),
    ).not.toBeNull();
    expect(screen.getByText('Firmware Upgrade Done')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it('navigates SStepModal steps and respects onBeforeNext guard', async () => {
    const onFinish = vi.fn();
    let allowAdvance = false;
    const onBeforeNext = vi.fn(() => allowAdvance);

    renderWithProvider(
      <SStepModal
        open
        title="Setup Wizard"
        onBeforeNext={onBeforeNext}
        onFinish={onFinish}
        steps={[
          { title: 'Step One', content: <div>Content One</div> },
          { title: 'Step Two', content: <div>Content Two</div> },
          { title: 'Step Three', content: <div>Content Three</div> },
        ]}
      />,
    );

    expect(screen.getByText('Content One')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();

    // Guard blocks advance when returning false
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(onBeforeNext).toHaveBeenCalledWith(0));
    expect(screen.getByText('Content One')).toBeInTheDocument();

    // Allow advance -> Step 2
    allowAdvance = true;
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('Content Two')).toBeInTheDocument());
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    // Back -> Step 1
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Content One')).toBeInTheDocument();

    // Advance to final step and click Finish
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('Content Two')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('Content Three')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  });
});

describe('SDrawer loading & SDrawerFooter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders AntD skeleton when SDrawer loading={true} and renders SDrawerFooter actions', () => {
    const onCancel = vi.fn();
    const onOk = vi.fn();

    const { rerender } = renderWithProvider(
      <SDrawer
        open
        size="sm"
        loading
        title="Device Details"
        footer={<SDrawerFooter onCancel={onCancel} onOk={onOk} extra={<span>24 ports</span>} />}
      >
        <div>Loaded Drawer Content</div>
      </SDrawer>,
    );

    expect(document.querySelector('.ant-drawer-body-skeleton')).not.toBeNull();
    expect(screen.queryByText('Loaded Drawer Content')).toBeNull();
    expect(screen.getByText('24 ports')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOk).toHaveBeenCalledTimes(1);

    rerender(
      <OmadaProvider defaultThemeMode="light">
        <SDrawer open size="sm" loading={false} title="Device Details">
          <div>Loaded Drawer Content</div>
        </SDrawer>
      </OmadaProvider>,
    );
    expect(screen.getByText('Loaded Drawer Content')).toBeInTheDocument();
  });
});

describe('SNotification & useOmadaNotification', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders SNotification card with status icon, actions, and close handler', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <SNotification
        type="warning"
        title="DFS Radar Event"
        description="Channel changed automatically."
        onClose={onClose}
        actions={<SButton size="small">Acknowledge</SButton>}
      />,
    );

    expect(
      document.querySelector('[data-omada-icon="alert-status-warning"]'),
    ).not.toBeNull();
    expect(screen.getByText('DFS Radar Event')).toBeInTheDocument();
    expect(screen.getByText('Channel changed automatically.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close notification'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('DFS Radar Event')).toBeNull();
  });

  it('triggers AntD 6 notification via useOmadaNotification()', async () => {
    const DemoTrigger: React.FC = () => {
      const notify = useOmadaNotification();
      return (
        <SButton
          onClick={() =>
            notify.success({
              title: 'Backup Uploaded',
              description: 'Cloud sync succeeded.',
              actions: <SButton size="small">View</SButton>,
            })
          }
        >
          Notify
        </SButton>
      );
    };

    renderWithProvider(<DemoTrigger />);
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));

    await waitFor(() => {
      expect(screen.getByText('Backup Uploaded')).toBeInTheDocument();
      expect(screen.getByText('Cloud sync succeeded.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    });
  });
});

describe('SPopover, SPopconfirm, STooltip, STruncatedText', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('opens SPopover with header icon, subtitle, content, and footer', async () => {
    renderWithProvider(
      <SPopover
        trigger="click"
        icon={<span data-testid="pop-icon">P</span>}
        title="Port Stats"
        subtitle="2.5G PoE+"
        content={<div>18.4W draw</div>}
        footer={<SButton size="small">Reset</SButton>}
      >
        <SButton>Open Popover</SButton>
      </SPopover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Popover' }));
    await waitFor(() => {
      expect(screen.getByTestId('pop-icon')).toBeInTheDocument();
      expect(screen.getByText('Port Stats')).toBeInTheDocument();
      expect(screen.getByText('2.5G PoE+')).toBeInTheDocument();
      expect(screen.getByText('18.4W draw')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });
  });

  it('supports SPopconfirm with icon={null} and triggers Yes/No callbacks', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProvider(
      <SPopconfirm
        icon={null}
        title="Clear lease table?"
        description="Clients will renew leases."
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <SButton>Clear Leases</SButton>
      </SPopconfirm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear Leases' }));
    await waitFor(() => {
      expect(screen.getByText('Clear lease table?')).toBeInTheDocument();
      expect(screen.getByText('Clients will renew leases.')).toBeInTheDocument();
    });

    expect(document.querySelector('.ant-popconfirm-message-icon')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows STooltip when open and detects overflow in STruncatedText', () => {
    renderWithProvider(
      <div>
        <STooltip open title="Tooltip body">
          <SButton>Tip Target</SButton>
        </STooltip>
        <STruncatedText text="Very long truncated switch name" maxWidth={120} />
      </div>,
    );

    expect(screen.getByText('Tooltip body')).toBeInTheDocument();

    const textEl = screen.getByText('Very long truncated switch name');
    expect(textEl).toHaveAttribute('data-truncated', 'false');

    // Simulate horizontal overflow and trigger mouseEnter
    Object.defineProperty(textEl, 'scrollWidth', { configurable: true, value: 260 });
    Object.defineProperty(textEl, 'clientWidth', { configurable: true, value: 120 });
    fireEvent.mouseEnter(textEl);
    expect(textEl).toHaveAttribute('data-truncated', 'true');
  });
});

describe('SProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all 5 states, indeterminate bar, circular ring, and PoE budget thresholds', () => {
    renderWithProvider(
      <div className="space-y-3">
        <SProgress percent={35} status="normal" />
        <SProgress percent={55} status="active" />
        <SProgress percent={100} status="success" />
        <SProgress percent={70} status="warning" />
        <SProgress percent={40} status="exception" />
        <SProgress indeterminate label="Scanning" />
        <SProgress type="circle" percent={80} label="CPU" />
        <SProgress variant="budget" label="PoE Normal" used={186.4} total={384} unit="W" />
        <SProgress variant="budget" label="PoE Warning" used={320} total={384} unit="W" />
        <SProgress variant="budget" label="PoE Critical" used={375} total={384} unit="W" />
      </div>,
    );

    expect(document.querySelector('[data-progress-status="normal"]')).not.toBeNull();
    expect(document.querySelector('[data-progress-status="active"]')).not.toBeNull();
    expect(document.querySelector('[data-progress-status="success"]')).not.toBeNull();
    expect(document.querySelector('[data-progress-status="warning"]')).not.toBeNull();
    expect(document.querySelector('[data-progress-status="exception"]')).not.toBeNull();
    expect(document.querySelector('[data-progress-indeterminate="true"]')).not.toBeNull();

    expect(screen.getByText('186.4W')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();

    const budgets = document.querySelectorAll('[data-progress-variant="budget"]');
    expect(budgets[0]).toHaveAttribute('data-progress-status', 'normal');
    expect(budgets[1]).toHaveAttribute('data-progress-status', 'warning');
    expect(budgets[2]).toHaveAttribute('data-progress-status', 'exception');
  });
});

describe('SLoading, SSkeleton, SMask & Showcase parity', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders SLoading inline and container wrapper modes', () => {
    renderWithProvider(
      <div>
        <SLoading size="lg" tone="brand" description="Loading.." />
        <SLoading spinning description="Wrapping panel">
          <div>Panel Content</div>
        </SLoading>
      </div>,
    );

    expect(screen.getByText('Loading..')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
    expect(document.querySelector('[data-loading-size="32"]')).not.toBeNull();
    expect(document.querySelector('.ant-spin-spinning')).not.toBeNull();
  });

  it('renders SSkeleton presets and passes through children when loading={false}', () => {
    renderWithProvider(
      <div>
        <SSkeleton preset="list" rows={2} />
        <SSkeleton preset="table" rows={2} columns={3} />
        <SSkeleton preset="card" />
        <SSkeleton loading={false}>
          <div>Loaded Body</div>
        </SSkeleton>
      </div>,
    );

    expect(document.querySelector('[data-skeleton-preset="list"]')).not.toBeNull();
    expect(document.querySelector('[data-skeleton-preset="table"]')).not.toBeNull();
    expect(document.querySelector('[data-skeleton-preset="card"]')).not.toBeNull();
    expect(screen.getByText('Loaded Body')).toBeInTheDocument();
  });

  it('controls SMask visibility, scope, blur, and click handling', () => {
    const onMaskClick = vi.fn();
    const { rerender } = renderWithProvider(
      <div className="relative">
        <SMask open={false} scope="container" />
        <SMask open scope="container" blur loading loadingText="Syncing" onClick={onMaskClick} />
      </div>,
    );

    const mask = document.querySelector('[data-smask-scope="container"]') as HTMLElement;
    expect(mask).not.toBeNull();
    expect(mask).toHaveAttribute('data-smask-blur', 'true');
    expect(screen.getByText('Syncing')).toBeInTheDocument();
    fireEvent.click(mask);
    expect(onMaskClick).toHaveBeenCalledTimes(1);

    rerender(
      <OmadaProvider defaultThemeMode="dark">
        <SMask open scope="page" />
      </OmadaProvider>,
    );
    expect(document.querySelector('[data-smask-scope="page"]')).not.toBeNull();
  });

  it('smoke-renders FeedbackOverlaysSection cleanly in both Light and Dark modes', () => {
    const { unmount } = renderWithProvider(<FeedbackOverlaysSection />, 'light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByText('Feedback & Overlays')).toBeInTheDocument();
    unmount();

    renderWithProvider(<FeedbackOverlaysSection />, 'dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByText('Feedback & Overlays')).toBeInTheDocument();
  });
});
