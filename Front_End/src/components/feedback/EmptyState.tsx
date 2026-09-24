import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from './Feedback.module.css';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Versão menor, usada dentro de seções (ex.: lista de comentários). */
  compact?: boolean;
  className?: string;
}

export function EmptyState({ icon, title, description, action, compact, className }: EmptyStateProps) {
  // Dentro de uma seção que já tem título, o estado vazio vira um subtítulo.
  const Heading = compact ? 'h3' : 'h2';
  return (
    <div className={cn(styles.state, compact && styles.compact, className)}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
