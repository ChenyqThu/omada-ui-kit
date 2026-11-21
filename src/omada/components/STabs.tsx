import React, { useState } from 'react';
import { Tabs } from 'antd';

export type STabsVariant = 'line' | 'capsule' | 'segment';

export interface STabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  dotColor?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface STabsProps {
  items: STabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: STabsVariant;
  pill?: boolean;
  extra?: React.ReactNode;
  className?: string;
}

/**
 * Omada Tabs supporting:
 * - `line`: primary page navigation underline tabs (`34px` height, `#00A870` indicator)
 * - `capsule`: Omada green active capsule tabs (or `pill` rounded-full)
 * - `segment`: neutral surface segmented switcher with optional legend dot
 */
export const STabs: React.FC<STabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = 'line',
  pill = false,
  extra,
  className = '',
}) => {
  const [innerKey, setInnerKey] = useState<string>(
    defaultActiveKey ?? items[0]?.key ?? '',
  );
  const currentKey = activeKey ?? innerKey;

  const handleSelect = (key: string) => {
    if (activeKey === undefined) {
      setInnerKey(key);
    }
    onChange?.(key);
  };

  if (variant === 'line') {
    return (
      <Tabs
        activeKey={currentKey}
        onChange={handleSelect}
        tabBarExtraContent={extra}
        className={className}
        items={items.map((item) => ({
          key: item.key,
          label: (
            <span className="inline-flex items-center gap-1.5">
              {item.icon}
              <span>{item.label}</span>
            </span>
          ),
          disabled: item.disabled,
          children: item.children,
        }))}
      />
    );
  }

  const activeItem = items.find((i) => i.key === currentKey);
  const isCapsule = variant === 'capsule';

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          className={`inline-flex items-center gap-1 bg-[var(--omada-bg-field)] ${
            isCapsule ? 'p-0.5' : 'p-1'
          } ${pill ? 'rounded-full' : 'rounded'}`}
        >
          {items.map((item) => {
            const isActive = item.key === currentKey;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={item.disabled}
                onClick={() => !item.disabled && handleSelect(item.key)}
                className={`inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  pill ? 'rounded-full' : 'rounded-[2px]'
                } ${isCapsule ? 'h-7 px-3' : 'h-6 px-3'} ${
                  isActive
                    ? isCapsule
                      ? 'bg-[var(--omada-brand)] font-semibold text-white'
                      : 'bg-[var(--omada-bg-sidebar-active)] font-semibold text-[var(--omada-text-primary)] shadow-2xs'
                    : 'bg-transparent text-[var(--omada-text-secondary)] hover:text-[var(--omada-text-primary)]'
                }`}
              >
                {item.dotColor && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        isActive && isCapsule ? '#FFFFFF' : item.dotColor,
                    }}
                  />
                )}
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        {extra && <div>{extra}</div>}
      </div>

      {activeItem?.children !== undefined && (
        <div className="mt-3">{activeItem.children}</div>
      )}
    </div>
  );
};
