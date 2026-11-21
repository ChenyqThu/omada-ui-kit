import React from 'react';

export type DeviceStatusType =
  | 'connected'
  | 'disconnected'
  | 'heartbeat-missed'
  | 'adopt-failed'
  | 'pending'
  | 'provisioning'
  | 'isolated';

const STATUS_META: Record<
  DeviceStatusType,
  { label: string; color: string; pulse?: boolean }
> = {
  connected: { label: 'Connected', color: 'var(--omada-color-success)' },
  disconnected: { label: 'Disconnected', color: 'var(--omada-text-tertiary)' },
  'heartbeat-missed': { label: 'Heartbeat Missed', color: 'var(--omada-color-warning)' },
  'adopt-failed': { label: 'Adopt Failed', color: 'var(--omada-color-error)' },
  pending: { label: 'Pending', color: 'var(--omada-color-info)', pulse: true },
  provisioning: { label: 'Provisioning', color: 'var(--omada-brand-text)', pulse: true },
  isolated: { label: 'Isolated', color: 'var(--omada-color-warning-minor)' },
};

export interface SDeviceStatusProps {
  status: DeviceStatusType;
  label?: string;
  className?: string;
}

/**
 * Semantic network device connectivity/provisioning indicator with colored status dot.
 */
export const SDeviceStatus: React.FC<SDeviceStatusProps> = ({
  status,
  label,
  className = '',
}) => {
  const meta = STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-[var(--omada-text-primary)] ${className}`.trim()}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          meta.pulse ? 'animate-pulse' : ''
        }`}
        style={{ backgroundColor: meta.color }}
      />
      <span>{label ?? meta.label}</span>
    </span>
  );
};
