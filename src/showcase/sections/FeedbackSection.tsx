import React, { useState } from 'react';
import { Popover, Tooltip } from 'antd';
import {
  SAlert,
  SButton,
  SCard,
  SDrawer,
  SEmpty,
  SForm,
  SFormItem,
  SInput,
  SIpInput,
  SModal,
  SPageHeader,
  useOmadaConfirm,
  useOmadaFeedback,
} from '@/omada';

export const FeedbackSection: React.FC = () => {
  const { toast, notify } = useOmadaFeedback();
  const { confirm, confirmDanger, confirmLeave } = useOmadaConfirm();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSize, setDrawerSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
    <div className="space-y-5">
      <SPageHeader
        title="Feedback & Overlays"
        description="Borderless 12%-tinted Alerts, theme-aware Toasts/Notifications, Modals (540px/640px/880px), Drawers, Tooltips, and Empty States."
      />

      <SCard title="Alerts (Borderless 12% Semantic Tint)">
        <div className="space-y-3">
          <SAlert
            type="success"
            title="Firmware Upgrade Completed"
            description="All 8 switches were upgraded to v1.0.8 without packet loss."
            closable
          />
          <SAlert
            type="info"
            title="Cloud Backup Scheduled"
            description="Automatic configuration snapshot runs every Sunday at 02:00 AM."
            action={
              <SButton variant="link" size="small">
                Configure
              </SButton>
            }
          />
          <SAlert
            type="warning"
            title="PoE Budget Reaching 85% Threshold"
            description="Consider prioritizing critical AP ports on Core-SW-Floor1."
          />
          <SAlert
            type="error"
            title="Adoption Failed on Guest-Lounge-AP"
            description="Verify SSH credentials or factory reset the device before retrying."
          />
        </div>
      </SCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Toast Messages & Notifications (Dark-Mode Aware)">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SButton variant="primary" onClick={() => toast.success('Configuration saved')}>
                Toast Success
              </SButton>
              <SButton variant="secondary" onClick={() => toast.info('Scanning network...')}>
                Toast Info
              </SButton>
              <SButton variant="secondary" onClick={() => toast.warning('Channel overlap detected')}>
                Toast Warning
              </SButton>
              <SButton variant="danger-outline" onClick={() => toast.error('Gateway unreachable')}>
                Toast Error
              </SButton>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[var(--omada-border-divider)] pt-4">
              <SButton
                variant="outline"
                onClick={() =>
                  notify.success(
                    'Site Sync Complete',
                    '48 devices synchronized with Headquarters Building.',
                  )
                }
              >
                Notification Success
              </SButton>
              <SButton
                variant="secondary"
                onClick={() =>
                  notify.warning(
                    'DFS Channel Radar Event',
                    'Conf-Room-North switched from channel 100 to channel 36.',
                  )
                }
              >
                Notification Warning
              </SButton>
            </div>
          </div>
        </SCard>

        <SCard title="Modals & Slide-Over Drawers">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SButton
                variant="secondary"
                onClick={() =>
                  confirm({
                    title: 'Reboot Core-SW-Floor1?',
                    content: 'Connected clients will experience ~90 seconds of downtime.',
                    okText: 'Reboot',
                    onOk: () => {
                      toast.success('Reboot command sent');
                    },
                  })
                }
              >
                Confirm (540px)
              </SButton>
              <SButton
                variant="danger-outline"
                onClick={() =>
                  confirmDanger({
                    title: 'Delete VLAN 20 (Guest)?',
                    content: 'This action cannot be undone and removes associated firewall ACLs.',
                    onOk: () => {
                      toast.success('VLAN 20 deleted');
                    },
                  })
                }
              >
                Danger Confirm
              </SButton>
              <SButton variant="secondary" onClick={() => confirmLeave()}>
                Leave Warning
              </SButton>
              <SButton variant="primary" onClick={() => setFormModalOpen(true)}>
                Form Modal (880px)
              </SButton>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--omada-border-divider)] pt-4">
              {(['sm', 'md', 'lg'] as const).map((sz) => (
                <SButton
                  key={sz}
                  variant="outline"
                  onClick={() => {
                    setDrawerSize(sz);
                    setDrawerOpen(true);
                  }}
                >
                  Open Drawer ({sz.toUpperCase()})
                </SButton>
              ))}
            </div>
          </div>
        </SCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SCard title="Tooltip & Popover">
          <div className="flex flex-wrap items-center gap-4">
            <Tooltip title="400ms hover delay tooltip (#2B2B2B 96%)">
              <SButton variant="secondary">Hover Tooltip</SButton>
            </Tooltip>
            <Popover
              title="Port Quick Stats"
              content={
                <div className="space-y-1 text-xs">
                  <div>Link Speed: 2.5 Gbps Full Duplex</div>
                  <div>PoE Draw: 18.4 W (802.3at)</div>
                </div>
              }
              trigger="click"
            >
              <SButton variant="outline">Click Popover</SButton>
            </Popover>
          </div>
        </SCard>

        <SEmpty
          title="No Rogue Access Points Detected"
          description="Wireless IDS/IPS continuously scans 2.4 GHz, 5 GHz, and 6 GHz channels."
          action={
            <SButton variant="outline" onClick={() => toast.info('Manual RF scan initiated')}>
              Run Scan Now
            </SButton>
          }
        />
      </div>

      {/* 880px Form Modal */}
      <SModal
        open={formModalOpen}
        size="form"
        title="Create Static Route"
        okText="Save Route"
        onCancel={() => setFormModalOpen(false)}
        onOk={() => {
          setFormModalOpen(false);
          toast.success('Static route created');
        }}
      >
        <SForm layout="horizontal" className="pt-3">
          <SFormItem label="Route Name">
            <SInput placeholder="e.g. Branch-Tunnel-Route" />
          </SFormItem>
          <SFormItem label="Destination Subnet">
            <SIpInput mode="cidr" defaultValue="10.20.0.0/16" />
          </SFormItem>
          <SFormItem label="Next Hop Gateway">
            <SIpInput mode="ip" defaultValue="192.168.0.254" />
          </SFormItem>
        </SForm>
      </SModal>

      {/* Slide-over Drawer */}
      <SDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={drawerSize}
        title={`Configuration Drawer (${drawerSize.toUpperCase()})`}
        subtitle="Uses Omada's exact -4px 2px 24px elevation shadow"
        footer={
          <div className="flex justify-end gap-2">
            <SButton variant="secondary" onClick={() => setDrawerOpen(false)}>
              Close
            </SButton>
            <SButton
              variant="primary"
              onClick={() => {
                setDrawerOpen(false);
                toast.success('Drawer changes applied');
              }}
            >
              Apply
            </SButton>
          </div>
        }
      >
        <p className="text-sm text-[var(--omada-text-secondary)]">
          Drawers support preset widths (`sm`: 480px, `md`: 640px, `lg`: 880px), subtitle metadata,
          status indicators, and embedded header tabs.
        </p>
      </SDrawer>
    </div>
  );
};
