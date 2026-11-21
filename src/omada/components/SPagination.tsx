import React, { useState } from 'react';
import { Pagination, type PaginationProps } from 'antd';

export type SPaginationVariant = 'default' | 'simple' | 'minimal';
export type SPaginationSize = 'small' | 'medium';

export interface SPaginationProps
  extends Omit<PaginationProps, 'size' | 'simple' | 'align'> {
  /** Visual variant matching Figma `43:34717`: full (`default`), compact input (`simple`), or borderless hotspots (`minimal`). */
  variant?: SPaginationVariant;
  /** Component density (`small` or `medium`; never passes deprecated `size="default"` to AntD 6). */
  size?: SPaginationSize;
  /** Displays the `Showing X–Y of Z records` summary label (defaults to `true` for `default` variant). */
  showSummary?: boolean;
  /** Custom formatter for the summary text when `showSummary` is enabled. */
  summaryRender?: (range: [number, number], total: number) => React.ReactNode;
  /** Horizontal alignment of the pagination bar. */
  align?: 'between' | 'left' | 'right' | 'center';
  /** Read-only toggle when `variant="simple"`. */
  simpleReadOnly?: boolean;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Omada Pagination (`43:34717`) supporting `default` (summary + pages + size changer),
 * `simple` (compact prev/input/next), and `minimal` (borderless numeric hover hotspots).
 */
export const SPagination: React.FC<SPaginationProps> = ({
  variant = 'default',
  size = 'medium',
  showSummary,
  summaryRender,
  align,
  simpleReadOnly = false,
  current,
  defaultCurrent = 1,
  pageSize,
  defaultPageSize = 10,
  total = 0,
  showSizeChanger,
  showQuickJumper,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onChange,
  onShowSizeChange,
  className = '',
  classNames,
  ...rest
}) => {
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent);
  const [innerPageSize, setInnerPageSize] = useState(defaultPageSize);

  const activeCurrent = current ?? innerCurrent;
  const activePageSize = pageSize ?? innerPageSize;

  const isSimple = variant === 'simple';
  const isMinimal = variant === 'minimal';

  const resolvedShowSummary = showSummary ?? variant === 'default';
  const resolvedShowSizeChanger =
    showSizeChanger ?? (variant === 'default' && total > 0);
  const resolvedShowQuickJumper = showQuickJumper ?? false;

  const resolvedAlign =
    align ?? (resolvedShowSummary ? 'between' : 'left');

  const alignClass =
    resolvedAlign === 'between'
      ? 'justify-between'
      : resolvedAlign === 'center'
        ? 'justify-center'
        : resolvedAlign === 'right'
          ? 'justify-end'
          : 'justify-start';

  const startIdx = total === 0 ? 0 : (activeCurrent - 1) * activePageSize + 1;
  const endIdx = Math.min(activeCurrent * activePageSize, total);

  const handleChange: PaginationProps['onChange'] = (nextPage, nextSize) => {
    const sizeChanged = nextSize !== activePageSize;
    const resolvedNextPage = sizeChanged ? 1 : nextPage;
    if (current === undefined) {
      setInnerCurrent(resolvedNextPage);
    }
    if (pageSize === undefined && sizeChanged) {
      setInnerPageSize(nextSize);
    }
    onChange?.(resolvedNextPage, nextSize);
  };

  const handleSizeChange: PaginationProps['onShowSizeChange'] = (cur, nextSize) => {
    if (current === undefined) {
      setInnerCurrent(1);
    }
    if (pageSize === undefined) {
      setInnerPageSize(nextSize);
    }
    onShowSizeChange?.(cur, nextSize);
  };

  const numericSizeOptions = pageSizeOptions.map(Number);

  const variantClass = isSimple
    ? 'omada-pagination-simple'
    : isMinimal
      ? 'omada-pagination-minimal'
      : 'omada-pagination-default';

  const sizeChangerProp: PaginationProps['showSizeChanger'] =
    resolvedShowSizeChanger === true
      ? { variant: 'filled' }
      : resolvedShowSizeChanger;

  const resolvedClassNames: PaginationProps['classNames'] =
    typeof classNames === 'function'
      ? (info) => {
          const res = classNames(info);
          return {
            ...res,
            root: `omada-pagination ${variantClass} ${res?.root ?? ''}`.trim(),
          };
        }
      : {
          ...classNames,
          root: `omada-pagination ${variantClass} ${classNames?.root ?? ''}`.trim(),
        };

  return (
    <div
      data-pagination-variant={variant}
      className={`flex flex-wrap items-center gap-3 ${alignClass} ${className}`.trim()}
    >
      {resolvedShowSummary && (
        <span className="tabular-nums text-xs text-[var(--omada-text-secondary)]">
          {summaryRender
            ? summaryRender([startIdx, endIdx], total)
            : total === 0
              ? 'Showing 0 of 0 records'
              : `Showing ${startIdx}–${endIdx} of ${total} records`}
        </span>
      )}

      <Pagination
        current={activeCurrent}
        pageSize={activePageSize}
        total={total}
        size={size === 'small' ? 'small' : undefined}
        simple={isSimple ? (simpleReadOnly ? { readOnly: true } : true) : undefined}
        showSizeChanger={isSimple || isMinimal ? false : sizeChangerProp}
        showQuickJumper={isSimple || isMinimal ? false : resolvedShowQuickJumper}
        pageSizeOptions={numericSizeOptions}
        onChange={handleChange}
        onShowSizeChange={handleSizeChange}
        classNames={resolvedClassNames}
        {...rest}
      />
    </div>
  );
};
