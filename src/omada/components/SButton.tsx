import React from 'react';
import { Button, type ButtonProps } from 'antd';

export type SButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'dashed'
  | 'text'
  | 'link'
  | 'danger'
  | 'danger-outline';

export interface SButtonProps extends Omit<ButtonProps, 'type' | 'variant' | 'danger'> {
  variant?: SButtonVariant;
}

/**
 * Omada-styled button supporting primary green, neutral filled secondary,
 * green outline, dashed, text, link, danger solid, and danger outline variants.
 */
export const SButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, SButtonProps>(
  ({ variant = 'primary', className = '', children, ...rest }, ref) => {
    let antdType: ButtonProps['type'] = 'default';
    let danger = false;
    let extraClass = 's-btn';

    switch (variant) {
      case 'primary':
        antdType = 'primary';
        break;
      case 'secondary':
        antdType = 'default';
        extraClass += ' s-btn-secondary';
        break;
      case 'outline':
        antdType = 'default';
        extraClass += ' s-btn-outline';
        break;
      case 'dashed':
        antdType = 'dashed';
        break;
      case 'text':
        antdType = 'text';
        break;
      case 'link':
        antdType = 'link';
        break;
      case 'danger':
        antdType = 'primary';
        danger = true;
        break;
      case 'danger-outline':
        antdType = 'default';
        extraClass += ' s-btn-danger-outline';
        break;
    }

    return (
      <Button
        ref={ref}
        type={antdType}
        danger={danger}
        className={`${extraClass} ${className}`.trim()}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

SButton.displayName = 'SButton';
