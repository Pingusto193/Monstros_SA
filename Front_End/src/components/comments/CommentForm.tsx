import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Avatar } from '@/components/user/Avatar';
import { useAddComment } from '@/hooks/queries/useComments';
import { useCurrentUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { ID } from '@/types';
import { cn } from '@/utils/cn';
import { LIMITS, validateComment } from '@/utils/validation';
import styles from './Comments.module.css';

interface CommentFormProps {
  sightingId: ID;
  /** 'inline' no card do feed; 'panel' na página do avistamento (com avatar). */
  variant?: 'inline' | 'panel';
  /** Foca o campo ao abrir (quando a pessoa tocou em "Comentar" no feed). */
  focusOnMount?: boolean;
}

export function CommentForm({ sightingId, variant = 'inline', focusOnMount = false }: CommentFormProps) {
  const user = useCurrentUser();
  const toast = useToast();
  const addComment = useAddComment(sightingId);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validateComment(text);
    if (validation) {
      setError(validation);
      return;
    }
    const submitted = text;
    setError(null);
    setText('');
    addComment.mutate(submitted, {
      onSuccess: () => toast.success('Comentário publicado.'),
      // Em caso de erro, devolve o texto para a pessoa não perder o que escreveu.
      onError: () => setText((current) => current || submitted),
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className={cn(styles.form, styles[variant])} onSubmit={handleSubmit} noValidate>
      {variant === 'panel' && <Avatar user={user} size="sm" />}
      <div className={styles.inputWrap}>
        <label htmlFor={inputId} className="sr-only">
          Adicionar um comentário
        </label>
        <textarea
          ref={inputRef}
          id={inputId}
          className={styles.input}
          rows={1}
          value={text}
          maxLength={LIMITS.commentMax}
          placeholder="Adicione um comentário…"
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className={styles.formError}>
            {error}
          </p>
        )}
      </div>
      <button type="submit" className={styles.submit} disabled={!text.trim()}>
        Publicar
      </button>
    </form>
  );
}
