import { Database, KeyRound, LogOut } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PasswordField } from '@/components/ui/Field';
import { isDemoDataAvailable, useChangePassword, useResetDemoData } from '@/hooks/queries/useAccount';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, isAppError } from '@/services';
import { formatMonthYear } from '@/utils/date';
import {
  LIMITS,
  hasErrors,
  validateChangePassword,
  type ChangePasswordValues,
  type FieldErrors,
} from '@/utils/validation';
import styles from './Settings.module.css';

const EMPTY_PASSWORDS: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function AccountPage() {
  useDocumentTitle('Conta e segurança');
  const user = useCurrentUser();
  const { logout } = useAuth();
  const toast = useToast();
  const changePassword = useChangePassword();
  const resetDemoData = useResetDemoData();

  const [passwords, setPasswords] = useState<ChangePasswordValues>(EMPTY_PASSWORDS);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors<keyof ChangePasswordValues>>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const errors = submitted ? { ...serverErrors, ...validateChangePassword(passwords) } : serverErrors;

  function update(field: keyof ChangePasswordValues, value: string) {
    setPasswords((current) => ({ ...current, [field]: value }));
    setServerErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setServerErrors({});
    if (hasErrors(validateChangePassword(passwords))) return;

    changePassword.mutate(
      { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
      {
        onSuccess: () => {
          toast.success('Senha alterada com sucesso.');
          setPasswords(EMPTY_PASSWORDS);
          setSubmitted(false);
        },
        onError: (error) => {
          if (isAppError(error) && error.fieldErrors) {
            setServerErrors(error.fieldErrors as FieldErrors<keyof ChangePasswordValues>);
          } else {
            toast.error(getErrorMessage(error, 'Não foi possível alterar a senha.'));
          }
        },
      },
    );
  }

  return (
    <>
      <section className={styles.section} aria-labelledby="account-info-title">
        <h2 id="account-info-title" className={styles.sectionTitle}>
          Sua conta
        </h2>
        <dl className={`${styles.infoList} ${styles.sectionBody}`}>
          <div className={styles.infoItem}>
            <dt>E-mail</dt>
            <dd>{user.email}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>Nome de usuário</dt>
            <dd>@{user.username}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>Membro desde</dt>
            <dd>{formatMonthYear(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="password-title">
        <h2 id="password-title" className={styles.sectionTitle}>
          Alterar senha
        </h2>
        <p className={styles.sectionDescription}>Use pelo menos {LIMITS.passwordMin} caracteres, com letras e números.</p>
        <form className={styles.sectionBody} onSubmit={handleChangePassword} noValidate>
          <PasswordField
            label="Senha atual"
            name="current-password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(event) => update('currentPassword', event.target.value)}
            error={errors.currentPassword}
            disabled={changePassword.isPending}
          />
          <PasswordField
            label="Nova senha"
            name="new-password"
            autoComplete="new-password"
            maxLength={LIMITS.passwordMax}
            value={passwords.newPassword}
            onChange={(event) => update('newPassword', event.target.value)}
            error={errors.newPassword}
            disabled={changePassword.isPending}
          />
          <PasswordField
            label="Confirmar nova senha"
            name="confirm-new-password"
            autoComplete="new-password"
            maxLength={LIMITS.passwordMax}
            value={passwords.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
            error={errors.confirmPassword}
            disabled={changePassword.isPending}
          />
          <div className={styles.formActions}>
            <Button type="submit" icon={<KeyRound size={16} />} loading={changePassword.isPending} loadingText="Salvando…">
              Alterar senha
            </Button>
          </div>
        </form>
      </section>

      {isDemoDataAvailable && (
        <section className={`${styles.section} ${styles.dangerZone}`} aria-labelledby="demo-data-title">
          <h2 id="demo-data-title" className={styles.sectionTitle}>
            Dados de demonstração
          </h2>
          <p className={styles.sectionDescription}>
            Nesta versão, contas, avistamentos, curtidas e comentários ficam salvos apenas neste navegador. Restaurar
            apaga tudo o que foi criado aqui e recarrega os exemplos originais.
          </p>
          <div className={styles.formActions}>
            <Button variant="outline" icon={<Database size={16} />} onClick={() => setConfirmReset(true)}>
              Restaurar dados de demonstração
            </Button>
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="session-title">
        <h2 id="session-title" className={styles.sectionTitle}>
          Sessão
        </h2>
        <p className={styles.sectionDescription}>Você está conectado como @{user.username}.</p>
        <div className={styles.formActions}>
          <Button variant="danger" icon={<LogOut size={16} />} onClick={() => void logout()}>
            Sair da conta
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Restaurar dados de demonstração?"
        description="Todas as contas, publicações, curtidas e comentários criados neste navegador serão apagados. Você precisará entrar novamente."
        confirmLabel="Restaurar"
        tone="danger"
        loading={resetDemoData.isPending}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() =>
          resetDemoData.mutate(undefined, {
            onSuccess: () => toast.success('Dados de demonstração restaurados. Entre novamente.'),
            onError: (error) => {
              setConfirmReset(false);
              toast.error(getErrorMessage(error, 'Não foi possível restaurar os dados.'));
            },
          })
        }
      />
    </>
  );
}
