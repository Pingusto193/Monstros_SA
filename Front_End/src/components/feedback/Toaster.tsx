import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import type { ToastMessage, ToastTone } from '@/context/contexts';
import { cn } from '@/utils/cn';
import styles from './Toaster.module.css';

const ICONS: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

interface ToasterProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

/** Região de notificações sempre presente, para que leitores de tela anunciem as mensagens. */
export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className={styles.region} role="status" aria-live="polite" aria-label="Notificações">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone];
        return (
          <div key={toast.id} className={cn(styles.toast, styles[toast.tone])}>
            <Icon size={18} className={styles.icon} aria-hidden="true" />
            <p className={styles.message}>{toast.message}</p>
            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
