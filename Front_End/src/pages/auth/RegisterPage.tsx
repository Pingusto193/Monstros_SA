import { AtSign, CircleAlert, Mail } from 'lucide-react';
import { useRef, useState, type FormEvent, type RefObject } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { PasswordChecklist, UsernameStatus } from '@/components/forms/UsernameStatus';
import { Button } from '@/components/ui/Button';
import { PasswordField, TextField } from '@/components/ui/Field';
import { useUsernameAvailability } from '@/hooks/queries/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, isAppError } from '@/services';
import { paths } from '@/utils/routes';
import {
  LIMITS,
  normalizeUsername,
  validateRegister,
  type FieldErrors,
  type RegisterValues,
} from '@/utils/validation';
import styles from './AuthForm.module.css';

type Field = keyof RegisterValues;
const FIELD_ORDER: Field[] = ['name', 'username', 'email', 'password', 'confirmPassword'];
const TAKEN_MESSAGE = 'Este nome de usuário já está em uso.';

export default function RegisterPage() {
  useDocumentTitle('Criar conta');
  const { register } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState<RegisterValues>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const usernameStatus = useUsernameAvailability(values.username);

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  function focusField(field: Field) {
    const fieldRefs: Record<Field, RefObject<HTMLInputElement | null>> = {
      name: nameRef,
      username: usernameRef,
      email: emailRef,
      password: passwordRef,
      confirmPassword: confirmPasswordRef,
    };
    fieldRefs[field].current?.focus();
  }

  function update(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    setFormError(null);
    if (submitted) setErrors(validateRegister(next));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const validation = validateRegister(values);
    if (!validation.username && usernameStatus === 'taken') validation.username = TAKEN_MESSAGE;
    setErrors(validation);

    const firstInvalid = FIELD_ORDER.find((field) => validation[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const user = await register({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      toast.success(`Conta criada! Boas-vindas ao Rastro, ${user.name.split(' ')[0]}.`);
    } catch (error) {
      if (isAppError(error) && error.fieldErrors) {
        const fieldErrors = error.fieldErrors as FieldErrors<Field>;
        setErrors(fieldErrors);
        const field = FIELD_ORDER.find((item) => fieldErrors[item]);
        if (field) focusField(field);
      }
      setFormError(getErrorMessage(error, 'Não foi possível criar sua conta agora. Tente novamente.'));
      setSubmitting(false);
    }
  }

  const usernameError = errors.username ?? (usernameStatus === 'taken' && submitted ? TAKEN_MESSAGE : undefined);

  return (
    <>
      <div className={styles.mobileBrand}>
        <Logo size="lg" />
      </div>
      <header className={styles.heading}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>Junte-se a quem registra o que a floresta esconde.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className={styles.formError} role="alert">
            <CircleAlert size={16} aria-hidden="true" />
            {formError}
          </p>
        )}

        <TextField
          ref={nameRef}
          label="Nome"
          name="name"
          autoComplete="name"
          placeholder="Como você quer ser chamado"
          value={values.name}
          maxLength={LIMITS.nameMax}
          onChange={(event) => update('name', event.target.value)}
          error={errors.name}
          disabled={submitting}
        />

        <TextField
          ref={usernameRef}
          label="Nome de usuário"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="seu.usuario"
          value={values.username}
          maxLength={LIMITS.usernameMax}
          onChange={(event) => update('username', normalizeUsername(event.target.value).replace(/\s+/g, ''))}
          error={usernameError}
          hint={<UsernameStatus status={usernameStatus} username={normalizeUsername(values.username)} />}
          prefix={<AtSign size={16} />}
          disabled={submitting}
        />

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
          name="new-password"
          autoComplete="new-password"
          placeholder="Crie uma senha"
          value={values.password}
          maxLength={LIMITS.passwordMax}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
          hint={<PasswordChecklist password={values.password} />}
          disabled={submitting}
        />

        <PasswordField
          ref={confirmPasswordRef}
          label="Confirmar senha"
          name="confirm-password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={values.confirmPassword}
          maxLength={LIMITS.passwordMax}
          onChange={(event) => update('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          disabled={submitting}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          loadingText="Criando conta…"
          className={styles.submit}
        >
          Criar conta
        </Button>
      </form>

      <p className={styles.switch}>
        Já tem uma conta? <Link to={paths.login}>Entrar</Link>
      </p>
    </>
  );
}
