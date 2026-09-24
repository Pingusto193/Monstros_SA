import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  /** Quando informado, o spinner vira uma região de status anunciada por leitores de tela. */
  label?: string;
  className?: string;
}

export function Spinner({ size = 20, label, className }: SpinnerProps) {
  return (
    <span className={cn(styles.spinner, className)} role={label ? 'status' : undefined}>
      <LoaderCircle size={size} className={styles.icon} aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
