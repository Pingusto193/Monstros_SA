import { CloudFog, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/services';
import { cn } from '@/utils/cn';
import styles from './Feedback.module.css';

interface ErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ title = 'Não foi possível carregar', error, onRetry, compact }: ErrorStateProps) {
  const Heading = compact ? 'h3' : 'h2';
  return (
    <div className={cn(styles.state, compact && styles.compact)} role="alert">
      <span className={cn(styles.icon, styles.iconError)} aria-hidden="true">
        <CloudFog size={28} />
      </span>
      <Heading className={styles.title}>{title}</Heading>
      <p className={styles.description}>
        {getErrorMessage(error, 'Algo atrapalhou a conexão com a trilha. Verifique sua internet e tente novamente.')}
      </p>
      {onRetry && (
        <div className={styles.action}>
          <Button variant="outline" icon={<RotateCcw size={16} />} onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
