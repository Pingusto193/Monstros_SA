import { ChevronDown, CircleAlert, Eye, EyeOff } from 'lucide-react';
import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from './Field.module.css';

interface FieldShellProps {
  id: string;
  label: string;
  labelHidden?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  counter?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Estrutura comum: rótulo, controle, dica/erro ligados por aria-describedby. */
function FieldShell({ id, label, labelHidden, optional, hint, error, counter, className, children }: FieldShellProps) {
  return (
    <div className={cn(styles.field, className)}>
      <div className={cn(styles.labelRow, labelHidden && !counter && 'sr-only')}>
        <label htmlFor={id} className={cn(styles.label, labelHidden && 'sr-only')}>
          {label}
          {optional && <span className={styles.optional}> (opcional)</span>}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          <CircleAlert size={14} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className={styles.hint}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

// ---------- TextField ----------

interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'prefix'> {
  label: string;
  labelHidden?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fieldClassName?: string;
}

export function TextField({
  label,
  labelHidden,
  optional,
  hint,
  error,
  prefix,
  suffix,
  id,
  className,
  fieldClassName,
  disabled,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      labelHidden={labelHidden}
      optional={optional}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <div className={cn(styles.control, error && styles.invalid, disabled && styles.disabled, className)}>
        {prefix && (
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          disabled={disabled}
          {...inputProps}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    </FieldShell>
  );
}

// ---------- PasswordField ----------

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'suffix'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}

// ---------- TextArea ----------

interface TextAreaProps extends ComponentPropsWithRef<'textarea'> {
  label: string;
  labelHidden?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  showCounter?: boolean;
  fieldClassName?: string;
}

export function TextArea({
  label,
  labelHidden,
  optional,
  hint,
  error,
  showCounter = true,
  id,
  className,
  fieldClassName,
  maxLength,
  value,
  ...textareaProps
}: TextAreaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const length = typeof value === 'string' ? value.length : 0;
  const nearLimit = maxLength !== undefined && length > maxLength * 0.9;

  return (
    <FieldShell
      id={inputId}
      label={label}
      labelHidden={labelHidden}
      optional={optional}
      hint={hint}
      error={error}
      className={fieldClassName}
      counter={
        showCounter && maxLength !== undefined ? (
          <span className={cn(styles.counter, nearLimit && styles.counterWarn)} aria-hidden="true">
            {length}/{maxLength}
          </span>
        ) : undefined
      }
    >
      <div className={cn(styles.control, styles.textareaControl, error && styles.invalid, className)}>
        <textarea
          id={inputId}
          className={styles.textarea}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          maxLength={maxLength}
          value={value}
          {...textareaProps}
        />
      </div>
    </FieldShell>
  );
}

// ---------- SelectField ----------

interface SelectFieldProps extends ComponentPropsWithRef<'select'> {
  label: string;
  labelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  fieldClassName?: string;
}

export function SelectField({
  label,
  labelHidden,
  hint,
  error,
  id,
  className,
  fieldClassName,
  children,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <FieldShell id={selectId} label={label} labelHidden={labelHidden} hint={hint} error={error} className={fieldClassName}>
      <div className={cn(styles.control, styles.selectControl, error && styles.invalid, className)}>
        <select
          id={selectId}
          className={styles.select}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown size={16} className={styles.selectIcon} aria-hidden="true" />
      </div>
    </FieldShell>
  );
}
