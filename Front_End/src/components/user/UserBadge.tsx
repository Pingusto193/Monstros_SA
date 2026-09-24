import { BadgeCheck } from 'lucide-react';
import styles from './UserBadge.module.css';

/** Selo discreto para a conta oficial da plataforma. */
export function OfficialBadge({ size = 14 }: { size?: number }) {
  return (
    <span className={styles.official} title="Conta oficial">
      <BadgeCheck size={size} aria-hidden="true" />
      <span className="sr-only">Conta oficial</span>
    </span>
  );
}
