import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export interface SExpandableSectionProps {
  /** Section heading displayed next to the `[+]` / `[-]` toggle square. */
  title: React.ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial uncontrolled expanded state (default `false`). */
  defaultExpanded?: boolean;
  /** Invoked when the section toggle is clicked. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Optional trailing content rendered on the same row as the toggle header. */
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Omada Controller v6.3 square `[+]` / `[-]` expandable settings section
 * (used for `Advanced Settings`, `ACL Binding`, and progressive disclosure blocks).
 */
export const SExpandableSection: React.FC<SExpandableSectionProps> = ({
  title,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  extra,
  children,
  className = '',
}) => {
  const [innerExpanded, setInnerExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? innerExpanded;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setInnerExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <div className={`omada-expandable-section ${className}`.trim()}>
      <div className="omada-expandable-header">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={handleToggle}
          className="omada-expandable-trigger"
        >
          <span className="omada-expandable-box" aria-hidden="true">
            {isExpanded ? <Minus size={11} strokeWidth={2.2} /> : <Plus size={11} strokeWidth={2.2} />}
          </span>
          <span className="omada-expandable-title">{title}</span>
        </button>
        {extra && <div className="shrink-0">{extra}</div>}
      </div>

      {isExpanded && <div className="omada-expandable-body">{children}</div>}
    </div>
  );
};
