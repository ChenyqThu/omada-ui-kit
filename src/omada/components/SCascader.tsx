import React from 'react';
import {
  Cascader,
  type CascaderAutoProps,
  type CascaderProps,
} from 'antd';
import type { CascaderRef, DefaultOptionType } from 'antd/es/cascader';
import { SCustomTag } from './STag';

export type SCascaderOption = DefaultOptionType;

export type SCascaderProps<
  OptionType extends DefaultOptionType = SCascaderOption,
  ValueField extends keyof OptionType = keyof OptionType,
> = CascaderAutoProps<OptionType, ValueField> & {
  /** Separator rendered between path segments in the default `displayRender` (defaults to `' / '`). */
  displaySeparator?: React.ReactNode;
};

type SCascaderComponent = (<
  OptionType extends DefaultOptionType = SCascaderOption,
  ValueField extends keyof OptionType = keyof OptionType,
>(
  props: SCascaderProps<OptionType, ValueField> & React.RefAttributes<CascaderRef>,
) => React.ReactElement | null) & {
  SHOW_PARENT: typeof Cascader.SHOW_PARENT;
  SHOW_CHILD: typeof Cascader.SHOW_CHILD;
  Panel: typeof Cascader.Panel;
  displayName?: string;
};

function SCascaderInner<
  OptionType extends DefaultOptionType = SCascaderOption,
  ValueField extends keyof OptionType = keyof OptionType,
>(
  {
    variant = 'filled',
    displaySeparator = ' / ',
    displayRender,
    tagRender,
    multiple,
    className = '',
    classNames,
    styles,
    ...rest
  }: SCascaderProps<OptionType, ValueField>,
  ref: React.ForwardedRef<CascaderRef>,
) {
  const defaultDisplayRender: NonNullable<
    CascaderProps<OptionType, ValueField>['displayRender']
  > = (labels) => {
    if (multiple) {
      return labels[labels.length - 1] ?? '';
    }
    return (
      <span className="inline-flex min-w-0 items-center truncate">
        {labels.map((label, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <span className="px-1 text-[var(--omada-text-tertiary)]">
                {displaySeparator}
              </span>
            )}
            <span
              className={
                idx === labels.length - 1
                  ? 'font-medium text-[var(--omada-text-primary)]'
                  : 'text-[var(--omada-text-secondary)]'
              }
            >
              {label}
            </span>
          </React.Fragment>
        ))}
      </span>
    );
  };

  const defaultTagRender: NonNullable<
    CascaderProps<OptionType, ValueField, true>['tagRender']
  > = ({ label, closable, onClose, isMaxTag }) => {
    const canClose = Boolean(closable && !isMaxTag);
    return (
      <span
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="inline-flex max-w-full items-center py-[1px] pe-1"
      >
        <SCustomTag
          closable={canClose}
          onClose={() => onClose()}
          className={
            variant === 'filled'
              ? '!h-[22px] border border-[var(--omada-border-divider)] !bg-[var(--omada-bg-surface)]'
              : '!h-[22px]'
          }
        >
          {label}
        </SCustomTag>
      </span>
    );
  };

  const resolvedClassNames =
    typeof classNames === 'function'
      ? (info: Parameters<typeof classNames>[0]) => {
          const user = classNames(info);
          return {
            ...user,
            popup: {
              ...user?.popup,
              root: `omada-cascader-popup ${user?.popup?.root ?? ''}`.trim(),
            },
          };
        }
      : {
          ...classNames,
          popup: {
            ...classNames?.popup,
            root: `omada-cascader-popup ${classNames?.popup?.root ?? ''}`.trim(),
          },
        };

  const mergedProps = {
    ...rest,
    ref,
    variant,
    multiple,
    displayRender: displayRender ?? defaultDisplayRender,
    tagRender: multiple ? (tagRender ?? defaultTagRender) : tagRender,
    className: `omada-cascader ${className}`.trim(),
    classNames: resolvedClassNames,
    styles,
  } as CascaderAutoProps<OptionType, ValueField> & {
    ref?: React.ForwardedRef<CascaderRef>;
  };

  return <Cascader<OptionType, ValueField> {...mergedProps} />;
}

/**
 * Omada Cascader control defaulting to `variant="filled"`, supporting single and
 * multi-select hierarchical paths with customizable `displayRender` and removable Omada tags.
 */
export const SCascader = Object.assign(
  React.forwardRef(
    SCascaderInner as (
      props: SCascaderProps<SCascaderOption, keyof SCascaderOption>,
      ref: React.ForwardedRef<CascaderRef>,
    ) => React.ReactElement | null,
  ),
  {
    SHOW_PARENT: Cascader.SHOW_PARENT,
    SHOW_CHILD: Cascader.SHOW_CHILD,
    Panel: Cascader.Panel,
  },
) as unknown as SCascaderComponent;
SCascader.displayName = 'SCascader';
