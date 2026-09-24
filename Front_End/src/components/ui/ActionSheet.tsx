import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from './ActionSheet.module.css';
import { Modal } from './Modal';

export interface SheetAction {
  id: string;
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  onSelect: () => void;
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  actions: SheetAction[];
}

/** Lista de ações em modal (no celular, abre como folha inferior). */
export function ActionSheet({ open, onClose, title, actions }: ActionSheetProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} hideTitle variant="sheet" size="sm">
      <ul role="list" className={styles.list}>
        {actions.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              className={cn(styles.action, action.tone === 'danger' && styles.danger)}
              onClick={() => {
                onClose();
                action.onSelect();
              }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={cn(styles.action, styles.cancel)} onClick={onClose}>
            Cancelar
          </button>
        </li>
      </ul>
    </Modal>
  );
}
