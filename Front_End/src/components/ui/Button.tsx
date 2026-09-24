import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/utils/cn';
import styles from './Button.module.css';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function buttonClassName({ variant = 'primary', size = 'md', fullWidth }: ButtonStyleProps, extra?: string) {
  return cn(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, extra);
}

interface ButtonProps extends ComponentPropsWithRef<'button'>, ButtonStyleProps {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  loadingText,
  icon,
  iconRight,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : icon}
      {children !== undefined && <span className={styles.label}>{loading && loadingText ? loadingText : children}</span>}
      {!loading && iconRight}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps, ButtonStyleProps {
  icon?: ReactNode;
}

export function ButtonLink({ variant, size, fullWidth, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClassName({ variant, size, fullWidth }, className)} {...rest}>
      {icon}
      <span className={styles.label}>{children}</span>
    </Link>
  );
}
