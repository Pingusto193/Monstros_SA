import { AtSign, ImagePlus } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { UsernameStatus } from '@/components/forms/UsernameStatus';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { Avatar } from '@/components/user/Avatar';
import { useUpdateProfile, useUsernameAvailability, type AvatarChange } from '@/hooks/queries/useUsers';
import { useCurrentUser } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, isAppError } from '@/services';
import { ACCEPTED_IMAGE_ATTR, validateImageFile } from '@/utils/image';
import {
  LIMITS,
  hasErrors,
  normalizeUsername,
  validateProfileForm,
  type FieldErrors,
  type ProfileFormValues,
} from '@/utils/validation';
import styles from './Settings.module.css';

type Field = keyof ProfileFormValues;
const TAKEN_MESSAGE = 'Este nome de usuário já está em uso.';

export default function EditProfilePage() {
  useDocumentTitle('Editar perfil');
  const user = useCurrentUser();
  const toast = useToast();
  const updateProfile = useUpdateProfile();

  const [values, setValues] = useState<ProfileFormValues>({ name: user.name, username: user.username, bio: user.bio });
  const [avatar, setAvatar] = useState<AvatarChange>({ type: 'keep' });
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors<Field>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useObjectUrl(avatar.type === 'replace' ? avatar.file : null);
  const usernameStatus = useUsernameAvailability(values.username, user.username);

  const errors: FieldErrors<Field> = submitted ? { ...serverErrors, ...validateProfileForm(values) } : serverErrors;
  const usernameError = errors.username ?? (submitted && usernameStatus === 'taken' ? TAKEN_MESSAGE : undefined);
  const pending = updateProfile.isPending;

  const previewAvatarUrl =
    avatar.type === 'remove' ? null : avatar.type === 'replace' ? previewUrl : user.avatarUrl;

  const isDirty =
    values.name !== user.name ||
    normalizeUsername(values.username) !== user.username ||
    values.bio !== user.bio ||
    avatar.type !== 'keep';

  function pickAvatar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setAvatarError(validation);
      return;
    }
    setAvatarError(null);
    setAvatar({ type: 'replace', file });
  }

  function reset() {
    setValues({ name: user.name, username: user.username, bio: user.bio });
    setAvatar({ type: 'keep' });
    setAvatarError(null);
    setSubmitted(false);
    setServerErrors({});
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setServerErrors({});

    const validation = validateProfileForm(values);
    if (!validation.username && usernameStatus === 'taken') validation.username = TAKEN_MESSAGE;
    if (hasErrors(validation)) {
      const first = (['name', 'username', 'bio'] as Field[]).find((field) => validation[field]);
      if (first) document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    updateProfile.mutate(
      { ...values, avatar },
      {
        onSuccess: (updated) => {
          toast.success('Perfil atualizado.');
          setValues({ name: updated.name, username: updated.username, bio: updated.bio });
          setAvatar({ type: 'keep' });
          setSubmitted(false);
        },
        onError: (error) => {
          if (isAppError(error) && error.fieldErrors) setServerErrors(error.fieldErrors as FieldErrors<Field>);
          toast.error(getErrorMessage(error, 'Não foi possível salvar as alterações.'));
        },
      },
    );
  }

  return (
    <section className={styles.section} aria-labelledby="edit-profile-title">
      <h2 id="edit-profile-title" className={styles.sectionTitle}>
        Editar perfil
      </h2>
      <p className={styles.sectionDescription}>Essas informações aparecem no seu perfil público e nas suas publicações.</p>

      <form className={styles.sectionBody} onSubmit={handleSubmit} noValidate>
        <div className={styles.avatarRow}>
          <Avatar user={{ name: values.name || user.name, avatarUrl: previewAvatarUrl, username: user.username }} size={64} />
          <div className={styles.avatarText}>
            <strong>{normalizeUsername(values.username) || user.username}</strong>
            <span>{values.name || user.name}</span>
          </div>
          <div className={styles.avatarActions}>
            <Button
              size="sm"
              icon={<ImagePlus size={14} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={pending}
            >
              Alterar foto
            </Button>
            {previewAvatarUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAvatar(user.avatarUrl ? { type: 'remove' } : { type: 'keep' })}
                disabled={pending}
              >
                Remover foto
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_ATTR}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              pickAvatar(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
        {avatarError && (
          <p className={styles.inlineError} role="alert">
            {avatarError}
          </p>
        )}

        <TextField
          label="Nome"
          name="name"
          autoComplete="name"
          value={values.name}
          maxLength={LIMITS.nameMax}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          error={errors.name}
          disabled={pending}
        />

        <TextField
          label="Nome de usuário"
          name="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={values.username}
          maxLength={LIMITS.usernameMax}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              username: normalizeUsername(event.target.value).replace(/\s+/g, ''),
            }))
          }
          error={usernameError}
          hint={
            usernameStatus === 'unchanged' ? (
              'Seu endereço de perfil muda junto com o nome de usuário.'
            ) : (
              <UsernameStatus status={usernameStatus} username={normalizeUsername(values.username)} />
            )
          }
          prefix={<AtSign size={16} />}
          disabled={pending}
        />

        <TextArea
          label="Biografia"
          name="bio"
          rows={3}
          value={values.bio}
          maxLength={LIMITS.bioMax}
          placeholder="Conte o que você investiga e por onde costuma explorar…"
          onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
          error={errors.bio}
          disabled={pending}
        />

        <div className={styles.formActions}>
          <Button variant="ghost" onClick={reset} disabled={!isDirty || pending}>
            Descartar
          </Button>
          <Button type="submit" loading={pending} loadingText="Salvando…" disabled={!isDirty}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </section>
  );
}
