import React, { useState } from 'react';
import {
  SButton,
  SCard,
  SDrawer,
  SForm,
  SFormItem,
  SIcon,
  SInput,
  SModal,
  SPageHeader,
  STag,
  useOmadaFeedback,
  type SModalSize,
} from '@/omada';
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
  type SInfoDialogStatus,
} from '@/omada/modules/feedback-overlays';
import '../../styles/modules/feedback-overlays.css';

export const FeedbackOverlaysSection: React.FC = () => {
  const { toast } = useOmadaFeedback();
  const notify = useOmadaNotification();

  // Enhanced Modal states
  const [enhancedModalSize, setEnhancedModalSize] = useState<SModalSize | null>(null);

  // InfoDialog states
  const [infoStatus, setInfoStatus] = useState<SInfoDialogStatus | null>(null);
  const [infoIllustrationOpen, setInfoIllustrationOpen] = useState(false);

  // StepModal states
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('Campus-Branch-01');
  const [vlanId, setVlanId] = useState('120');

  // Drawer loading + footer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(true);

  // Loading & Mask states
  const [panelSpinning, setPanelSpinning] = useState(true);
  const [cardMaskOpen, setCardMaskOpen] = useState(true);
  const [cardMaskBlur, setCardMaskBlur] = useState(true);
  const [pageMaskOpen, setPageMaskOpen] = useState(false);

  // Skeleton preset state
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Feedback & Overlays"
        description="Enhanced Modals & Drawers, Notifications, Popovers/Popconfirms, 400ms/200ms Tooltips, 5-State & PoE Budget Progress, Spinners, Skeletons, and Masks."
      />

      {/* 1. Dialogs & Wizards */}
      <SCard
        title="Dialogs & Multi-Step Wizards (SModal, SInfoDialog, SStepModal)"
        subtitle="Preset widths (480 / 540 / 640 / 764 / 880 / 1040px), header icon + subtitle slots, status dialogs, and wizard flows."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-[var(--omada-text-secondary)]">
              SModal Sizes:
            </span>
            {(['sm', 'confirm', 'default', 'centered', 'form', 'xl'] as const).map(
              (sz) => (
                <SButton
                  key={sz}
                  variant="secondary"
                  size="small"
                  onClick={() => setEnhancedModalSize(sz)}
                >
                  {sz}
                </SButton>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--omada-border-divider)] pt-3">
            <span className="mr-1 text-xs font-medium text-[var(--omada-text-secondary)]">
              SInfoDialog:
            </span>
            {(['info', 'success', 'warning', 'error', 'loading'] as const).map(
              (status) => (
                <SButton
                  key={status}
                  variant="outline"
                  size="small"
                  onClick={() => setInfoStatus(status)}
                >
                  {status}
                </SButton>
              ),
            )}
            <SButton
              variant="secondary"
              size="small"
              onClick={() => setInfoIllustrationOpen(true)}
            >
              Centered Illustration (764px)
            </SButton>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--omada-border-divider)] pt-3">
            <span className="mr-1 text-xs font-medium text-[var(--omada-text-secondary)]">
              Wizard & Drawer:
            </span>
            <SButton variant="primary" onClick={() => setStepModalOpen(true)}>
              Open SStepModal Wizard
            </SButton>
            <SButton
              variant="outline"
              onClick={() => {
                setDrawerLoading(true);
                setDrawerOpen(true);
              }}
            >
              Open Loading Drawer + SDrawerFooter
            </SButton>
          </div>
        </div>
      </SCard>

      {/* 2. Notifications */}
      <SCard
        title="Notifications (SNotification & useOmadaNotification)"
        subtitle="Static inline cards and imperative AntD 6 App.useApp() toast notifications ({ title, description, actions })."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <SButton
              variant="secondary"
              onClick={() =>
                notify.info({
                  title: 'Firmware Update Available',
                  description: 'EAP670 v1.2.4 includes 6 GHz AFC stability enhancements.',
                  actions: (
                    <SButton
                      variant="primary"
                      size="small"
                      onClick={() => {
                        notify.destroy();
                        toast.success('Firmware rollout scheduled');
                      }}
                    >
                      Enable
                    </SButton>
                  ),
                })
              }
            >
              Trigger Info + Action
            </SButton>
            <SButton
              variant="outline"
              onClick={() =>
                notify.success(
                  'Configuration Backed Up',
                  'Encrypted site snapshot uploaded to Omada Cloud.',
                )
              }
            >
              Trigger Success
            </SButton>
            <SButton
              variant="secondary"
              onClick={() =>
                notify.warning({
                  title: 'PoE Power Threshold Warning',
                  description: 'Core-SW-Floor1 is drawing 86% of its 384W PoE+ budget.',
                  actions: (
                    <div className="flex items-center gap-2">
                      <SButton
                        variant="secondary"
                        size="small"
                        onClick={() => notify.destroy()}
                      >
                        Cancel
                      </SButton>
                      <SButton
                        variant="primary"
                        size="small"
                        onClick={() => {
                          notify.destroy();
                          toast.info('PoE priority policy applied');
                        }}
                      >
                        Apply
                      </SButton>
                    </div>
                  ),
                })
              }
            >
              Trigger Warning + Apply/Cancel
            </SButton>
            <SButton
              variant="danger-outline"
              onClick={() =>
                notify.error({
                  title: 'RADIUS Authentication Timeout',
                  description: 'Primary server 10.10.1.50 failed to respond within 5000ms.',
                  actions: (
                    <SButton
                      variant="primary"
                      size="small"
                      onClick={() => notify.destroy()}
                    >
                      OK
                    </SButton>
                  ),
                })
              }
            >
              Trigger Error + OK
            </SButton>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[var(--omada-border-divider)] pt-4 md:grid-cols-2">
            <SNotification
              type="info"
              title="Title-only notification preview"
            />
            <SNotification
              type="success"
              title="Site Synchronization Complete"
              description="All 24 switches and 68 access points applied the updated VLAN profile."
            />
            <SNotification
              type="warning"
              title="Channel Radar Detected (DFS)"
              description="AP-Conf-North switched from channel 100 to channel 36 to avoid weather radar interference."
              actions={
                <SButton variant="primary" size="small" onClick={() => toast.info('Acknowledged')}>
                  OK
                </SButton>
              }
            />
            <SNotification
              type="error"
              title="Gateway WAN1 Link Down"
              description="Traffic failed over to WAN2 backup LTE uplink. Inspect SFP+ transceiver diagnostics."
              actions={
                <>
                  <SButton variant="secondary" size="small" onClick={() => toast.info('Dismissed')}>
                    Cancel
                  </SButton>
                  <SButton variant="primary" size="small" onClick={() => toast.success('Diagnostic started')}>
                    Retry
                  </SButton>
                </>
              }
            />
          </div>
        </div>
      </SCard>

      {/* 3. Popovers, Popconfirms & Tooltips */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard
          title="Popover & Popconfirm (SPopover, SPopconfirm)"
          subtitle="Omada elevation shadow + all 4 Popconfirm icon/description combinations."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SPopover
                trigger="click"
                icon={<SIcon name="alert-status-info" size={18} />}
                title="Port Gi1/0/4 Telemetry"
                subtitle="802.3at PoE+ · 2.5G Full Duplex"
                content={
                  <div className="space-y-1 text-xs text-[var(--omada-text-secondary)]">
                    <div>RX / TX Rate: 412 Mbps / 184 Mbps</div>
                    <div>Power Draw: 18.4 W (Class 4)</div>
                  </div>
                }
                footer={
                  <>
                    <SButton variant="secondary" size="small">
                      Bounce PoE
                    </SButton>
                    <SButton variant="primary" size="small">
                      Inspect
                    </SButton>
                  </>
                }
              >
                <SButton variant="outline">Rich SPopover</SButton>
              </SPopover>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--omada-border-divider)] pt-3">
              <SPopconfirm
                title="Restart selected AP?"
                description="Connected Wi-Fi clients will briefly roam to adjacent APs."
                onConfirm={() => toast.success('AP restart initiated')}
              >
                <SButton variant="secondary" size="small">
                  Icon + Desc
                </SButton>
              </SPopconfirm>

              <SPopconfirm
                title="Apply port profile now?"
                onConfirm={() => toast.success('Profile applied')}
              >
                <SButton variant="secondary" size="small">
                  Icon Only
                </SButton>
              </SPopconfirm>

              <SPopconfirm
                icon={null}
                title="Clear DHCP lease table?"
                description="Active clients will renew leases automatically."
                onConfirm={() => toast.info('DHCP leases cleared')}
              >
                <SButton variant="secondary" size="small">
                  No Icon + Desc
                </SButton>
              </SPopconfirm>

              <SPopconfirm
                icon={null}
                danger
                title="Delete VLAN 40?"
                okText="Delete"
                cancelText="Cancel"
                onConfirm={() => toast.success('VLAN 40 removed')}
              >
                <SButton variant="danger-outline" size="small">
                  No Icon (Danger)
                </SButton>
              </SPopconfirm>
            </div>
          </div>
        </SCard>

        <SCard
          title="Tooltip & Truncated Text (STooltip, STruncatedText)"
          subtitle="400ms button tooltip delay, clickable tooltip links, and 200ms auto-overflow tooltip."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <STooltip title="400ms hover delay tooltip matching Figma 43:34749">
                <SButton variant="secondary">Hover 400ms (Top)</SButton>
              </STooltip>

              <STooltip
                placement="bottom"
                title={
                  <span>
                    Configure IEEE 802.1X policy.{' '}
                    <a
                      href="#docs"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('Opened 802.1X reference');
                      }}
                    >
                      Learn more
                    </a>
                  </span>
                }
              >
                <SButton variant="outline">Tooltip with Link</SButton>
              </STooltip>
            </div>

            <div className="space-y-2 border-t border-[var(--omada-border-divider)] pt-3">
              <div className="text-xs font-medium text-[var(--omada-text-secondary)]">
                STruncatedText (200ms tooltip only appears when text overflows):
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-56 rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-2.5 py-1.5 text-sm">
                  <STruncatedText text="Core-Distribution-Switch-Building-A-Floor-03-Stack-Master" />
                </div>
                <div className="w-56 rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] px-2.5 py-1.5 text-sm">
                  <STruncatedText text="Short Device Name" />
                </div>
              </div>
            </div>
          </div>
        </SCard>
      </div>

      {/* 4. Progress (5 States + Indeterminate + Circular + PoE Budget) */}
      <SCard
        title="Progress Indicators (SProgress)"
        subtitle="Linear 6px pill bars across all 5 Figma states, indeterminate animation, 112px circular rings, and PoE budget presets."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3.5">
            <SProgress label="Normal (Firmware Download)" percent={45} status="normal" />
            <SProgress label="Active (Provisioning 12 APs)" percent={68} status="active" />
            <SProgress label="Success (Backup Verified)" percent={100} status="success" />
            <SProgress label="Warning (Task Interrupted)" percent={62} status="warning" />
            <SProgress label="Exception (Checksum Error)" percent={34} status="exception" />
            <SProgress label="Indeterminate (Scanning Mesh Topology)" indeterminate />
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-around gap-4 rounded-lg border border-[var(--omada-border-divider)] p-4">
              <SProgress type="circle" percent={72} status="normal" label="CPU Load" />
              <SProgress type="circle" percent={100} status="success" label="Sync Done" />
              <SProgress type="circle" percent={86} status="warning" label="PoE Peak" />
            </div>

            <div className="space-y-3 rounded-lg border border-[var(--omada-border-divider)] p-4">
              <SProgress
                variant="budget"
                label="PoE Budget — SG3428XMP (Normal)"
                used={186.4}
                total={384}
                unit="W"
              />
              <SProgress
                variant="budget"
                label="PoE Budget — Core-SW-02 (Warning)"
                used={322}
                total={384}
                unit="W"
              />
              <SProgress
                variant="budget"
                label="PoE Budget — Edge-SW-05 (Critical)"
                used={124}
                total={130}
                unit="W"
              />
            </div>
          </div>
        </div>
      </SCard>

      {/* 5. Loading, Skeleton & Mask */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard
          title="Spinners & Container Loading (SLoading)"
          subtitle="16px / 20px / 32px Figma conic-ring spinners in brand, neutral, and inverse tones."
          extra={
            <SButton
              variant="secondary"
              size="small"
              onClick={() => setPanelSpinning((v) => !v)}
            >
              {panelSpinning ? 'Stop Container Spin' : 'Start Container Spin'}
            </SButton>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <SLoading size="sm" tone="brand" description="16px inline" />
              <SLoading size="md" tone="brand" description="Loading.." />
              <SLoading size="lg" tone="neutral" description="32px neutral" />
              <span className="inline-flex items-center rounded bg-[var(--omada-bg-tooltip)] px-3 py-1.5">
                <SLoading size="sm" tone="inverse" description="Inverse" />
              </span>
            </div>

            <SLoading spinning={panelSpinning} description="Polling switch telemetry...">
              <div className="rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-4">
                <div className="text-sm font-medium text-[var(--omada-text-primary)]">
                  Live Telemetry Container
                </div>
                <p className="mt-1 text-xs text-[var(--omada-text-secondary)]">
                  Wrapping existing cards or forms in &lt;SLoading spinning&gt; overlays a
                  non-destructive AntD 6 spinner while keeping layout stable.
                </p>
              </div>
            </SLoading>
          </div>
        </SCard>

        <SCard
          title="Backdrop Mask Overlay (SMask — Figma 43:34769)"
          subtitle="rgba(0, 0, 0, 0.40) container or full-page mask with optional frosted blur."
          extra={
            <div className="flex items-center gap-2">
              <SButton
                variant="secondary"
                size="small"
                onClick={() => setCardMaskBlur((b) => !b)}
              >
                Blur: {cardMaskBlur ? 'On' : 'Off'}
              </SButton>
              <SButton
                variant="secondary"
                size="small"
                onClick={() => setCardMaskOpen((o) => !o)}
              >
                {cardMaskOpen ? 'Hide Card Mask' : 'Show Card Mask'}
              </SButton>
              <SButton
                variant="primary"
                size="small"
                onClick={() => setPageMaskOpen(true)}
              >
                Page Mask
              </SButton>
            </div>
          }
        >
          <div className="relative min-h-[180px] overflow-hidden rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--omada-text-primary)]">
                  Protected Site Topology Canvas
                </span>
                <STag color="green">Active</STag>
              </div>
              <p className="text-xs text-[var(--omada-text-secondary)]">
                Underlying topology widgets remain mounted while SMask blocks interaction
                during batch provisioning or controller reboot.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-2 text-xs">
                  Gateway: ER8411
                </div>
                <div className="rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-2 text-xs">
                  Switch: SG3428X
                </div>
                <div className="rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-2 text-xs">
                  APs: 24 Online
                </div>
              </div>
            </div>

            <SMask
              open={cardMaskOpen}
              scope="container"
              blur={cardMaskBlur}
              loading
              loadingText="Applying site provisioning..."
            />
          </div>
        </SCard>
      </div>

      {/* 6. Skeletons */}
      <SCard
        title="Skeleton Placeholders (SSkeleton)"
        subtitle="Light/Dark gradient shimmer across default, list, table, and card presets."
        extra={
          <SButton
            variant="secondary"
            size="small"
            onClick={() => setSkeletonLoading((v) => !v)}
          >
            {skeletonLoading ? 'Simulate Loaded' : 'Show Skeletons'}
          </SButton>
        }
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Default Text Lines
              </div>
              <SSkeleton preset="default" loading={skeletonLoading}>
                <div className="rounded border border-[var(--omada-border-divider)] p-3 text-sm text-[var(--omada-text-primary)]">
                  Controller telemetry loaded cleanly!
                </div>
              </SSkeleton>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                List Preset
              </div>
              <SSkeleton preset="list" rows={3} loading={skeletonLoading}>
                <div className="rounded border border-[var(--omada-border-divider)] p-3 text-sm text-[var(--omada-text-primary)]">
                  3 wireless clients online.
                </div>
              </SSkeleton>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Card Preset
              </div>
              <SSkeleton preset="card" avatar rows={2} loading={skeletonLoading}>
                <div className="rounded border border-[var(--omada-border-divider)] p-3 text-sm text-[var(--omada-text-primary)]">
                  Site overview card loaded.
                </div>
              </SSkeleton>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--omada-text-secondary)]">
                Table Preset
              </div>
              <SSkeleton preset="table" rows={3} columns={4} loading={skeletonLoading}>
                <div className="rounded border border-[var(--omada-border-divider)] p-3 text-sm text-[var(--omada-text-primary)]">
                  Device inventory table ready.
                </div>
              </SSkeleton>
            </div>
          </div>
        </div>
      </SCard>

      {/* Modals & Drawers rendered cleanly at bottom */}
      <SModal
        open={enhancedModalSize !== null}
        size={enhancedModalSize ?? 'default'}
        destroyOnHidden
        icon={<SIcon name="alert-status-info" size={22} />}
        title={`Enhanced SModal (${enhancedModalSize ?? 'default'})`}
        subtitle="Supports sm (480px), confirm (540px), default (640px), centered (764px), form (880px), xl (1040px)"
        onCancel={() => setEnhancedModalSize(null)}
        onOk={() => {
          setEnhancedModalSize(null);
          toast.success('Modal confirmed');
        }}
      >
        <p className="text-sm text-[var(--omada-text-secondary)]">
          This modal demonstrates the expanded Omada size presets alongside the new header{' '}
          <code>icon</code> and <code>subtitle</code> slots in Ant Design 6.
        </p>
      </SModal>

      <SInfoDialog
        open={infoStatus !== null}
        status={infoStatus ?? 'info'}
        title={
          infoStatus === 'loading'
            ? 'Upgrading Switch Firmware...'
            : infoStatus === 'success'
              ? 'Adoption Successful'
              : infoStatus === 'warning'
                ? 'Firmware Rollback Recommended'
                : infoStatus === 'error'
                  ? 'Provisioning Failed'
                  : 'Scheduled Maintenance Window'
        }
        description={
          infoStatus === 'loading'
            ? 'Core-SW-Floor1 is downloading v1.0.9. Do not power off the device.'
            : 'Status dialogs map directly to Figma status icons with optional Stop/OK controls.'
        }
        cancelText={infoStatus === 'loading' ? 'Stop' : undefined}
        okText={infoStatus === 'loading' ? null : 'OK'}
        onCancel={() => setInfoStatus(null)}
        onOk={() => setInfoStatus(null)}
      >
        {infoStatus === 'loading' && (
          <SProgress percent={64} status="active" />
        )}
      </SInfoDialog>

      <SInfoDialog
        open={infoIllustrationOpen}
        size="centered"
        illustration="email-success"
        title="Invitation Sent to Site Administrators"
        description="Administrators will receive a secure activation link valid for 24 hours."
        okText="Done"
        onCancel={() => setInfoIllustrationOpen(false)}
        onOk={() => setInfoIllustrationOpen(false)}
      />

      <SStepModal
        open={stepModalOpen}
        title="Create Branch Network"
        subtitle="3-step guided site provisioning wizard"
        size="default"
        onCancel={() => setStepModalOpen(false)}
        onFinish={() => {
          setStepModalOpen(false);
          toast.success(`Provisioned ${siteName} (VLAN ${vlanId})`);
        }}
        steps={[
          {
            title: 'Site Profile',
            description: 'Name & region',
            content: (
              <SForm layout="horizontal">
                <SFormItem label="Site Name">
                  <SInput
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </SFormItem>
              </SForm>
            ),
          },
          {
            title: 'VLAN Setup',
            description: 'Subnet & tagging',
            content: (
              <SForm layout="horizontal">
                <SFormItem label="Management VLAN ID">
                  <SInput
                    value={vlanId}
                    onChange={(e) => setVlanId(e.target.value)}
                  />
                </SFormItem>
              </SForm>
            ),
          },
          {
            title: 'Review',
            description: 'Confirm & deploy',
            content: (
              <div className="space-y-2 rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-4 text-sm">
                <div>
                  <span className="text-[var(--omada-text-secondary)]">Site:</span>{' '}
                  <strong className="text-[var(--omada-text-primary)]">{siteName}</strong>
                </div>
                <div>
                  <span className="text-[var(--omada-text-secondary)]">VLAN ID:</span>{' '}
                  <strong className="text-[var(--omada-text-primary)]">{vlanId}</strong>
                </div>
              </div>
            ),
          },
        ]}
      />

      <SDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden
        size="md"
        loading={drawerLoading}
        title="Port Security Configuration"
        subtitle="Demonstrates SDrawer loading skeleton + SDrawerFooter helper"
        extra={
          <SButton
            variant="secondary"
            size="small"
            onClick={() => setDrawerLoading((v) => !v)}
          >
            {drawerLoading ? 'Finish Loading' : 'Show Loading'}
          </SButton>
        }
        footer={
          <SDrawerFooter
            extra={<span>Changes apply to 24 ports</span>}
            onCancel={() => setDrawerOpen(false)}
            onOk={() => {
              setDrawerOpen(false);
              toast.success('Port security saved');
            }}
          />
        }
      >
        <div className="space-y-3 text-sm text-[var(--omada-text-secondary)]">
          <p>
            Drawer content is now loaded. Toggle <strong>Show Loading</strong> in the header
            to preview AntD 6&apos;s skeleton loading state.
          </p>
        </div>
      </SDrawer>

      <SMask
        open={pageMaskOpen}
        scope="page"
        blur
        onClick={() => setPageMaskOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-4 rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-overlay)] px-8 py-6 text-center shadow-lg"
        >
          <SLoading size="lg" tone="brand" layout="vertical" description="Controller Rebooting..." />
          <p className="m-0 max-w-xs text-xs text-[var(--omada-text-secondary)]">
            Full-page SMask uses rgba(0, 0, 0, 0.40) across Light &amp; Dark themes.
          </p>
          <SButton variant="secondary" size="small" onClick={() => setPageMaskOpen(false)}>
            Dismiss Preview
          </SButton>
        </div>
      </SMask>
    </div>
  );
};
