import { Check, CircleCheck, CircleX } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import type { UsernameStatus as Status } from '@/hooks/queries/useUsers';
import { cn } from '@/utils/cn';
import { getPasswordChecks } from '@/utils/validation';
import styles from './FormHints.module.css';

/** Dica ao vivo sobre a disponibilidade do nome de usuário. */
export function UsernameStatus({ status, username }: { status: Status; username: string }) {
  if (status === 'checking') {
    return (
      <span className={styles.hint}>
        <Spinner size={12} /> Verificando disponibilidade…
      </span>
    );
  }
  if (status === 'available') {
    return (
      <span className={cn(styles.hint, styles.ok)}>
        <CircleCheck size={13} aria-hidden="true" /> @{username} está disponível
      </span>
    );
  }
  if (status === 'taken') {
    return (
      <span className={cn(styles.hint, styles.bad)}>
        <CircleX size={13} aria-hidden="true" /> @{username} já está em uso
      </span>
    );
  }
  return <span className={styles.hint}>Letras minúsculas, números, ponto e sublinhado.</span>;
}

/** Lista de requisitos da senha, marcados conforme a pessoa digita. */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul role="list" className={styles.checklist}>
      {getPasswordChecks(password).map((check) => (
        <li key={check.id} className={cn(check.ok && styles.ok)}>
          <Check size={13} aria-hidden="true" className={styles.checkIcon} />
          {check.label}
          <span className="sr-only">{check.ok ? ' (atendido)' : ' (pendente)'}</span>
        </li>
      ))}
    </ul>
  );
}
