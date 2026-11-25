import React, { useMemo, useState } from 'react';
import { Tooltip } from 'antd';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useOmadaAgentControl } from '../agent';
import { SDeviceStatus, type DeviceStatusType } from '../components/SDeviceStatus';
import { SDrawer } from '../components/SDrawer';
import { STabs, type STabItem } from '../components/STabs';

export interface SDetailInspectorTab {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface SDetailInspectorDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional leading icon/product thumbnail rendered before the title. */
  icon?: React.ReactNode;
  /** Semantic status dot + label displayed beside the title. */
  status?: DeviceStatusType;
  /** Custom status label overriding `status` default text. */
  statusLabel?: string;
  /** Enables Omada's 2-stage `420px <-> 1040px` expand/collapse button (default `true`). */
  expandable?: boolean;
  defaultWidth?: number;
  expandedWidth?: number;
  /** Optional tabs rendered cleanly inside the inspector drawer. */
  tabs?: SDetailInspectorTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  /** Optional deterministic Agent Bridge control ID. */
  agentId?: string;
  children?: React.ReactNode;
}

/**
 * Omada Controller 2-stage slide-out inspector drawer (`420px` <-> `1040px`)
 * combining device/client title header, status dot, expand toggle, and underline tabs.
 */
export const SDetailInspectorDrawer: React.FC<SDetailInspectorDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  status,
  statusLabel,
  expandable = true,
  defaultWidth = 420,
  expandedWidth = 1040,
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  headerExtra,
  footer,
  agentId,
  children,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [innerTab, setInnerTab] = useState(() => tabs?.[0]?.key ?? '');

  const currentTabKey = controlledActiveTab ?? (tabs?.some((t) => t.key === innerTab) ? innerTab : tabs?.[0]?.key ?? '');

  const tabItems: STabItem[] = useMemo(
    () => (tabs ?? []).map((t) => ({ key: t.key, label: t.label })),
    [tabs],
  );

  const activeTabContent = useMemo(
    () => tabs?.find((t) => t.key === currentTabKey)?.content,
    [tabs, currentTabKey],
  );

  useOmadaAgentControl(
    agentId
      ? {
          id: agentId,
          kind: 'drawer',
          label:
            typeof title === 'string'
              ? title
              : typeof subtitle === 'string'
                ? subtitle
                : undefined,
          value: {
            open,
            expanded,
            activeTab: tabs && tabs.length > 0 ? currentTabKey : null,
          },
          options: tabs?.map((t) => ({
            value: t.key,
            label: typeof t.label === 'string' ? t.label : t.key,
          })),
          meta: {
            open,
            expanded,
            status: status ?? null,
          },
          actions: {
            close: () => {
              setExpanded(false);
              onClose();
              return false;
            },
            ...(expandable
              ? {
                  setExpanded: (next: unknown) => {
                    const nextExp = Boolean(next);
                    setExpanded(nextExp);
                    return nextExp;
                  },
                  toggleExpand: () => {
                    const nextExp = !expanded;
                    setExpanded(nextExp);
                    return nextExp;
                  },
                }
              : {}),
            ...(tabs && tabs.length > 0
              ? {
                  selectTab: (nextKey: unknown) => {
                    const key = String(nextKey ?? '');
                    const found = tabs.find((t) => t.key === key);
                    if (!found) {
                      throw new Error(`Unknown drawer tab "${key}".`);
                    }
                    if (controlledActiveTab === undefined) {
                      setInnerTab(found.key);
                    }
                    onTabChange?.(found.key);
                    return found.key;
                  },
                }
              : {}),
          },
        }
      : null,
  );

  return (
    <SDrawer
      open={open}
      onClose={() => {
        setExpanded(false);
        onClose();
      }}
      width={expanded ? expandedWidth : defaultWidth}
      title={
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="inline-flex shrink-0 items-center justify-center leading-none">
              {icon}
            </span>
          )}
          <span className="truncate">{title}</span>
        </div>
      }
      subtitle={subtitle}
      statusSlot={status ? <SDeviceStatus status={status} label={statusLabel} /> : undefined}
      extra={
        <div className="flex items-center gap-1.5">
          {headerExtra}
          {expandable && (
            <Tooltip title={expanded ? 'Collapse to 420px' : 'Expand details'}>
              <button
                type="button"
                aria-label={expanded ? 'Collapse drawer width' : 'Expand drawer width'}
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] text-[var(--omada-text-secondary)] hover:border-[var(--omada-brand)] hover:text-[var(--omada-brand-text)]"
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </Tooltip>
          )}
        </div>
      }
      headerTabs={
        tabs && tabs.length > 0 ? (
          <STabs
            items={tabItems}
            activeKey={currentTabKey}
            onChange={(key) => {
              if (controlledActiveTab === undefined) {
                setInnerTab(key);
              }
              onTabChange?.(key);
            }}
          />
        ) : undefined
      }
      footer={footer}
      destroyOnHidden
    >
      {tabs && tabs.length > 0 ? activeTabContent : children}
    </SDrawer>
  );
};
