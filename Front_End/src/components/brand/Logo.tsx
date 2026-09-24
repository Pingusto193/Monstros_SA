import { cn } from '@/utils/cn';
import styles from './Logo.module.css';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Marca do Rastro: uma pegada estilizada. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn(styles.mark, className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" className={styles.markBg} />
      <g className={styles.markFoot}>
        <path d="M16 10.8C19.2 10.8 21.5 12.4 21.4 15.3 21.3 17.6 19.9 19.2 19.6 21.4 19.3 23.6 19.4 25.4 18.7 26.8 18 28.1 16.9 28.8 15.5 28.8 13.4 28.8 12 27.4 12 25.2 12 23.4 13 22.3 12.9 20.6 12.8 18.9 10.4 17.6 10.5 15 10.6 12.4 12.9 10.8 16 10.8Z" />
        <ellipse cx="11.4" cy="7.6" rx="2.1" ry="2.4" />
        <circle cx="15.1" cy="5.9" r="1.7" />
        <circle cx="18.3" cy="6.1" r="1.5" />
        <circle cx="20.9" cy="7.6" r="1.3" />
        <circle cx="22.6" cy="10" r="1.1" />
      </g>
    </svg>
  );
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** 'light' para usar sobre fotos/fundos escuros. */
  tone?: 'default' | 'light';
  showMark?: boolean;
  className?: string;
}

const MARK_SIZES = { sm: 26, md: 30, lg: 40 };

export function Logo({ size = 'md', tone = 'default', showMark = true, className }: LogoProps) {
  return (
    <span className={cn(styles.logo, styles[size], tone === 'light' && styles.light, className)}>
      {showMark && <LogoMark size={MARK_SIZES[size]} />}
      <span className={styles.wordmark}>rastro</span>
    </span>
  );
}
