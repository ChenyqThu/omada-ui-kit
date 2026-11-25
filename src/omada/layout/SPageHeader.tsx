import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface SPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Alias for `description` kept for backward compatibility with single-file templates. */
  subtitle?: React.ReactNode;
  onBack?: () => void;
  tabs?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

/**
 * Standard Omada page header supporting optional back navigation, description (`subtitle` alias), tabs, and right-aligned actions.
 */
export const SPageHeader: React.FC<SPageHeaderProps> = ({
  title,
  description,
  subtitle,
  onBack,
  tabs,
  extra,
  className = '',
}) => {
  const resolvedDescription = description ?? subtitle;

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] text-[var(--omada-text-primary)] transition-colors hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)]"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="m-0 text-[22px] font-semibold leading-[32px] text-[var(--omada-text-primary)]">
              {title}
            </h1>
            {resolvedDescription && (
              <p className="mt-0.5 text-sm leading-5 text-[var(--omada-text-secondary)]">
                {resolvedDescription}
              </p>
            )}
          </div>
        </div>
        {extra && <div className="flex flex-wrap items-center gap-2.5">{extra}</div>}
      </div>
      {tabs && <div className="mt-3">{tabs}</div>}
    </div>
  );
};
