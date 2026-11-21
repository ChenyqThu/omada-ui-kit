import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, type TooltipProps } from 'antd';
import type { TooltipPlacement, TooltipRef } from 'antd/es/tooltip';

export type STooltipProps = TooltipProps;

/**
 * Omada-styled Ant Design 6 Tooltip defaulting to Figma's 400ms (`0.4s`) hover delay,
 * `#2B2B2B 96%` / `#333333` surface, `4px` radius, and `[6, 8]` compact padding.
 */
export const STooltip = React.forwardRef<TooltipRef, STooltipProps>(
  ({ mouseEnterDelay = 0.4, classNames, styles, ...rest }, ref) => {
    const mergedClassNames: TooltipProps['classNames'] =
      typeof classNames === 'function'
        ? (info) => {
            const resolved = classNames(info);
            return {
              ...resolved,
              root: `omada-tooltip ${resolved?.root ?? ''}`.trim(),
            };
          }
        : {
            ...classNames,
            root: `omada-tooltip ${classNames?.root ?? ''}`.trim(),
          };

    const mergedStyles: TooltipProps['styles'] =
      typeof styles === 'function'
        ? (info) => {
            const resolved = styles(info);
            return {
              ...resolved,
              container: {
                backgroundColor: 'var(--omada-bg-tooltip)',
                boxShadow: 'var(--omada-shadow-tooltip)',
                borderRadius: 4,
                padding: '6px 8px',
                ...resolved?.container,
              },
            };
          }
        : {
            ...styles,
            container: {
              backgroundColor: 'var(--omada-bg-tooltip)',
              boxShadow: 'var(--omada-shadow-tooltip)',
              borderRadius: 4,
              padding: '6px 8px',
              ...styles?.container,
            },
          };

    return (
      <Tooltip
        ref={ref}
        mouseEnterDelay={mouseEnterDelay}
        classNames={mergedClassNames}
        styles={mergedStyles}
        {...rest}
      />
    );
  },
);

STooltip.displayName = 'STooltip';

export interface STruncatedTextProps {
  /** Text string to display with ellipsis truncation */
  text: string;
  /** Optional custom tooltip content (defaults to `text`) */
  tooltip?: React.ReactNode;
  /** Tooltip placement (defaults to `'top'`) */
  placement?: TooltipPlacement;
  /** Hover delay in seconds (defaults to `0.2` — 200ms per Figma spec) */
  mouseEnterDelay?: number;
  /** Maximum width CSS value (e.g., `180`, `'12rem'`, `'100%'`) */
  maxWidth?: number | string;
  /** Number of visible lines before truncation (defaults to `1`) */
  lines?: number;
  /** Wrapper element tag (`'span' | 'div' | 'p'`, defaults to `'span'`) */
  as?: 'span' | 'div' | 'p';
  /** Force showing tooltip regardless of measured overflow */
  forceTooltip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ellipsis-truncated text that automatically reveals a `200ms` `<STooltip>`
 * ONLY when its rendered content overflows (`scrollWidth > clientWidth` or `scrollHeight > clientHeight`).
 */
export const STruncatedText: React.FC<STruncatedTextProps> = ({
  text,
  tooltip,
  placement = 'top',
  mouseEnterDelay = 0.2,
  maxWidth = '100%',
  lines = 1,
  as = 'span',
  forceTooltip = false,
  className = '',
  style,
}) => {
  const textRef = useRef<HTMLElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    const overflow =
      lines <= 1
        ? el.scrollWidth > el.clientWidth
        : el.scrollHeight > el.clientHeight;
    setIsTruncated(overflow);
  }, [lines]);

  useEffect(() => {
    checkTruncation();
    const el = textRef.current;
    if (!el || typeof ResizeObserver !== 'function') return;

    const observer = new ResizeObserver(() => {
      checkTruncation();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkTruncation, text, maxWidth]);

  const truncationStyle: React.CSSProperties =
    lines <= 1
      ? {
          display: as === 'span' ? 'inline-block' : 'block',
          maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          verticalAlign: as === 'span' ? 'bottom' : undefined,
          ...style,
        }
      : {
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          maxWidth,
          ...style,
        };

  const Tag = as;

  return (
    <STooltip
      title={isTruncated || forceTooltip ? (tooltip ?? text) : undefined}
      placement={placement}
      mouseEnterDelay={mouseEnterDelay}
    >
      <Tag
        ref={textRef as React.RefObject<never>}
        onMouseEnter={checkTruncation}
        onFocus={checkTruncation}
        data-truncated={String(isTruncated || forceTooltip)}
        className={className}
        style={truncationStyle}
      >
        {text}
      </Tag>
    </STooltip>
  );
};
