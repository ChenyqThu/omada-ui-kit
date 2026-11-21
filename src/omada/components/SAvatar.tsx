import React, { useState } from 'react';
import { Avatar, type AvatarProps, type GetProps } from 'antd';
import { User } from 'lucide-react';
import { SIcon } from '../assets/SIcon';

export type SAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | number;
export type SAvatarStatus = 'online' | 'offline' | 'busy' | 'away';

const AVATAR_PIXEL_SIZES: Record<'xs' | 'sm' | 'md' | 'lg', number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 48,
};

const STATUS_COLORS: Record<SAvatarStatus, string> = {
  online: 'var(--omada-color-success)',
  offline: 'var(--omada-text-tertiary)',
  busy: 'var(--omada-color-error)',
  away: 'var(--omada-color-warning)',
};

function resolveAvatarSize(size: SAvatarSize = 'md'): number {
  return typeof size === 'number' ? size : AVATAR_PIXEL_SIZES[size];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface SAvatarProps extends Omit<AvatarProps, 'size'> {
  /** Named Omada presets (`xs`: 20px, `sm`: 24px, `md`: 32px, `lg`: 48px) or numeric px. */
  size?: SAvatarSize;
  /** User display name; renders initials when no `src` or `icon` is given. */
  name?: string;
  /** Render neutral guest avatar state instead of authenticated brand tint. */
  guest?: boolean;
  /** Optional presence dot rendered at the bottom-right corner. */
  status?: SAvatarStatus;
}

/**
 * Omada Avatar component supporting `20px` (`xs`), `24px` (`sm`), `32px` (`md`), and `48px` (`lg`) sizes,
 * image with graceful fallback, initials, guest/authenticated states, and optional status indicator.
 */
export const SAvatar: React.FC<SAvatarProps> = ({
  size = 'md',
  name,
  guest = false,
  status,
  src,
  icon,
  children,
  shape = 'circle',
  style,
  className = '',
  onError,
  ...rest
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const px = resolveAvatarSize(size);
  const initials = name ? getInitials(name) : '';
  const useImage = Boolean(src && !imgFailed);

  const fallbackIcon = (
    <SIcon
      name="general-account"
      size={Math.max(12, Math.round(px * 0.56))}
      aria-hidden
    />
  );

  const avatarContent = useImage
    ? undefined
    : (children ?? (initials || icon || (guest ? <User size={Math.max(12, Math.round(px * 0.52))} /> : fallbackIcon)));

  const toneStyle: React.CSSProperties = useImage
    ? {}
    : guest
      ? {
          backgroundColor: 'var(--omada-bg-field)',
          color: 'var(--omada-text-secondary)',
        }
      : {
          backgroundColor: 'var(--omada-brand-bg-subtle)',
          color: 'var(--omada-brand-text)',
        };

  const fontSize = Math.max(10, Math.round(px * 0.4));

  const avatarNode = (
    <Avatar
      src={useImage ? src : undefined}
      size={px}
      shape={shape}
      alt={rest.alt ?? name}
      onError={() => {
        setImgFailed(true);
        return onError ? onError() : false;
      }}
      style={{
        fontSize,
        fontWeight: 600,
        border: '1px solid var(--omada-border-divider)',
        ...toneStyle,
        ...style,
      }}
      className={`inline-flex shrink-0 items-center justify-center select-none ${!status ? className : ''}`.trim()}
      {...rest}
    >
      {avatarContent}
    </Avatar>
  );

  if (!status) {
    return avatarNode;
  }

  const dotSize = px >= 44 ? 10 : px <= 22 ? 6 : 8;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`.trim()}>
      {avatarNode}
      <span
        aria-label={`Status: ${status}`}
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: STATUS_COLORS[status],
        }}
        className="absolute right-0 bottom-0 rounded-full ring-2 ring-[var(--omada-bg-surface)]"
      />
    </span>
  );
};

export interface SAvatarGroupProps
  extends Omit<
    GetProps<typeof Avatar.Group>,
    'size' | 'maxCount' | 'maxStyle' | 'maxPopoverPlacement' | 'maxPopoverTrigger'
  > {
  size?: SAvatarSize;
  /** Maximum avatars shown before collapsing into a `+N` overflow badge (AntD 6 `max.count`). */
  maxCount?: number;
}

/**
 * Omada Avatar stack wrapper using AntD 6 `max` overflow popover config.
 */
export const SAvatarGroup: React.FC<SAvatarGroupProps> = ({
  size = 'md',
  maxCount,
  max,
  shape = 'circle',
  children,
  className = '',
  ...rest
}) => {
  const px = resolveAvatarSize(size);
  const resolvedMax =
    max ??
    (maxCount !== undefined
      ? {
          count: maxCount,
          style: {
            backgroundColor: 'var(--omada-bg-field)',
            color: 'var(--omada-text-primary)',
            borderColor: 'var(--omada-bg-surface)',
            fontSize: Math.max(10, Math.round(px * 0.38)),
            fontWeight: 600,
          },
        }
      : undefined);

  return (
    <Avatar.Group
      size={px}
      shape={shape}
      max={resolvedMax}
      className={className}
      {...rest}
    >
      {children}
    </Avatar.Group>
  );
};
