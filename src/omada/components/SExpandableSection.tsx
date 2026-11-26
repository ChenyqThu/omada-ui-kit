import React, { useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useOmadaAgentControl } from '../agent';

export interface SExpandableSectionProps {
  /** Optional deterministic ID for Agent Bridge state inspection and actions. */
  agentId?: string;
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
  agentId,
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
  const liveExpandedRef = useRef<boolean>(isExpanded);
  liveExpandedRef.current = isExpanded;

  const setExpandedState = (next: boolean) => {
    liveExpandedRef.current = next;
    if (controlledExpanded === undefined) {
      setInnerExpanded(next);
    }
    onExpandedChange?.(next);
    return next;
  };

  const handleToggle = () => {
    setExpandedState(!liveExpandedRef.current);
  };

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'switch',
          label: typeof title === 'string' ? title : undefined,
          value: isExpanded,
          getValue: () => liveExpandedRef.current,
          actions: {
            expand: () => setExpandedState(true),
            collapse: () => setExpandedState(false),
            toggle: () => setExpandedState(!liveExpandedRef.current),
            setValue: (next: unknown) => setExpandedState(Boolean(next)),
          },
        }
      : null,
  );

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
