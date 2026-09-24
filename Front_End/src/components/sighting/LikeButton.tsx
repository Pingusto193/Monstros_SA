import { Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  liked: boolean;
  onToggle: (liked: boolean) => void;
  size?: number;
}

export function LikeButton({ liked, onToggle, size = 24 }: LikeButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.like, liked && styles.liked)}
      aria-label="Curtir"
      aria-pressed={liked}
      onClick={() => onToggle(!liked)}
    >
      {/* A key força a animação a rodar de novo a cada curtida. */}
      <Heart
        key={liked ? 'on' : 'off'}
        size={size}
        fill={liked ? 'currentColor' : 'none'}
        className={liked ? styles.pop : undefined}
        aria-hidden="true"
      />
    </button>
  );
}
