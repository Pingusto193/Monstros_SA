import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { IconButton } from './IconButton';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  description?: string;
  /** 'sheet' abre a partir da base da tela no celular (lista de ações). */
  variant?: 'dialog' | 'sheet';
  size?: 'sm' | 'md';
  children: ReactNode;
}

/**
 * Modal acessível baseado no <dialog> nativo: prende o foco, fecha com Esc
 * ou clique fora e devolve o foco para quem abriu.
 */
export function Modal({ open, ...props }: ModalProps) {
  if (!open) return null;
  return createPortal(<ModalDialog {...props} />, document.body);
}

function ModalDialog({
  onClose,
  title,
  hideTitle,
  description,
  variant = 'dialog',
  size = 'md',
  children,
}: Omit<ModalProps, 'open'>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  return (
    // O clique no fundo é só um atalho de mouse: pelo teclado, o Esc fecha (evento cancel).
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={cn(styles.dialog, styles[variant], styles[size])}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clique fora do painel (na área escurecida) fecha o modal.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={cn(styles.header, hideTitle && styles.headerCompact)}>
          <h2 id={titleId} className={cn(styles.title, hideTitle && 'sr-only')}>
            {title}
          </h2>
          {!hideTitle && <IconButton label="Fechar" icon={<X size={20} />} size="sm" onClick={onClose} />}
        </header>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
