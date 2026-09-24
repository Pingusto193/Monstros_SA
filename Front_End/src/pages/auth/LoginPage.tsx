import { CircleAlert, Mail } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { PasswordField, TextField } from '@/components/ui/Field';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { demoAccount, getErrorMessage } from '@/services';
import { paths } from '@/utils/routes';
import { validateLogin, type FieldErrors, type LoginValues } from '@/utils/validation';
import styles from './AuthForm.module.css';

export default function LoginPage() {
  useDocumentTitle('Entrar');
  const { login } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<keyof LoginValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function update(field: keyof LoginValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    setFormError(null);
    if (submitted) setErrors(validateLogin(next));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const validation = validateLogin(values);
    setErrors(validation);
    if (validation.email) return emailRef.current?.focus();
    if (validation.password) return passwordRef.current?.focus();

    setSubmitting(true);
    setFormError(null);
    try {
      const user = await login(values);
      // O redirecionamento para o feed (ou para a página pedida) acontece no PublicOnlyRoute.
      toast.success(`Que bom ver você, ${user.name.split(' ')[0]}!`);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível entrar agora. Tente novamente.'));
      setSubmitting(false);
      passwordRef.current?.select();
    }
  }

  return (
    <>
      <div className={styles.mobileBrand}>
        <Logo size="lg" />
      </div>
      <header className={styles.heading}>
        <h1 className={styles.title}>Entrar</h1>
        <p className={styles.subtitle}>Continue acompanhando os relatos da comunidade.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className={styles.formError} role="alert">
            <CircleAlert size={16} aria-hidden="true" />
            {formError}
          </p>
        )}

        <TextField
          ref={emailRef}
          label="E-mail"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
          prefix={<Mail size={16} />}
          disabled={submitting}
        />

        <PasswordField
          ref={passwordRef}
          label="Senha"
          name="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={values.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
          disabled={submitting}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting} loadingText="Entrando…" className={styles.submit}>
          Entrar
        </Button>
      </form>

      {demoAccount && (
        <div className={styles.demo}>
          <div className={styles.demoText}>
            <strong>Conta de demonstração</strong>
            <code>
              {demoAccount.email} · {demoAccount.password}
            </code>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (!demoAccount) return;
              setValues({ email: demoAccount.email, password: demoAccount.password });
              setErrors({});
              setFormError(null);
            }}
            disabled={submitting}
          >
            Preencher
          </Button>
        </div>
      )}

      <p className={styles.switch}>
        Ainda não tem conta? <Link to={paths.register}>Criar conta</Link>
      </p>
    </>
  );
}
