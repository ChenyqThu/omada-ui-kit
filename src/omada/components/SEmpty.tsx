import React from 'react';
import { Inbox } from 'lucide-react';

export interface SEmptyProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Clean Omada empty state placeholder for tables, drawers, and sub-panels.
 */
export const SEmpty: React.FC<SEmptyProps> = ({
  title = 'No data available',
  description = 'There are no records matching your current filter or configuration.',
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] px-6 py-10 text-center ${className}`.trim()}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--omada-bg-field)] text-[var(--omada-text-tertiary)]">
        {icon ?? <Inbox size={22} />}
      </div>
      <div className="text-sm font-semibold text-[var(--omada-text-primary)]">
        {title}
      </div>
      {description && (
        <div className="mt-1 max-w-sm text-xs leading-5 text-[var(--omada-text-secondary)]">
          {description}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
