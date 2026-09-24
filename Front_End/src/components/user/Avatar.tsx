import { useState, type CSSProperties } from 'react';
import type { UserSummary } from '@/types';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';
import { getAvatarSrc, isSafeImageUrl } from '@/utils/image';
import styles from './Avatar.module.css';

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 88, xxl: 150 } as const;
export type AvatarSize = keyof typeof SIZES;

/** Cores terrosas para avatares sem foto (escolhidas de forma estável pelo nome). */
const FALLBACK_COLORS = ['#2f5d46', '#6b4f2c', '#3d5c6a', '#7a4035', '#4d5f2c', '#5b4a6e', '#2f4f5d'];

function pickColor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

interface AvatarProps {
  user: Pick<UserSummary, 'name' | 'avatarUrl'> & { username?: string };
  size?: AvatarSize | number;
  /** Anel verde (ex.: item ativo na navegação). */
  ring?: boolean;
  /** Quando o avatar aparece sozinho (sem o nome ao lado), descreva-o. */
  decorative?: boolean;
  className?: string;
}

export function Avatar({ user, size = 'md', ring = false, decorative = true, className }: AvatarProps) {
  const pixels = typeof size === 'number' ? size : SIZES[size];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = isSafeImageUrl(user.avatarUrl) ? getAvatarSrc(user.avatarUrl, pixels) : null;
  const showImage = src !== null && src !== failedSrc;

  const style = {
    width: pixels,
    height: pixels,
    fontSize: Math.max(10, Math.round(pixels * 0.38)),
    '--avatar-bg': pickColor(user.username ?? user.name),
  } as CSSProperties;

  return (
    <span
      className={cn(styles.avatar, ring && styles.ring, className)}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Foto de perfil de ${user.name}`}
      aria-hidden={decorative ? true : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          width={pixels}
          height={pixels}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className={styles.initials}>{getInitials(user.name)}</span>
      )}
    </span>
  );
}
