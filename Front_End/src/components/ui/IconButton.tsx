import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  /** Texto acessível obrigatório: botões só com ícone precisam de nome. */
  label: string;
  icon: ReactNode;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'soft' | 'overlay';
}

export function IconButton({ label, icon, size = 'md', variant = 'ghost', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(styles.iconButton, styles[size], styles[variant], className)}
      {...rest}
    >
      {icon}
    </button>
  );
}
