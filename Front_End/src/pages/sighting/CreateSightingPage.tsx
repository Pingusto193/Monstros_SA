import { CircleAlert, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { LocationInput } from '@/components/forms/LocationInput';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TextArea, TextField } from '@/components/ui/Field';
import { useCreateSighting } from '@/hooks/queries/useSightings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, isAppError } from '@/services';
import type { SightingLocation } from '@/types';
import { todayISODate } from '@/utils/date';
import { paths } from '@/utils/routes';
import {
  LIMITS,
  MIN_SIGHTING_DATE,
  hasErrors,
  validateSightingForm,
  type FieldErrors,
  type SightingFormField,
  type SightingFormValues,
} from '@/utils/validation';
import styles from './CreateSightingPage.module.css';

const EMPTY_LOCATION: SightingLocation = { place: '', city: '', region: '', country: '', coordinates: null };
const FIELD_ORDER: SightingFormField[] = [
  'photo',
  'description',
  'place',
  'city',
  'region',
  'country',
  'sightingDate',
  'sightingTime',
];

export default function CreateSightingPage() {
  useDocumentTitle('Registrar avistamento');
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const toast = useToast();
  const createSighting = useCreateSighting();

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<SightingLocation>(EMPTY_LOCATION);
  const [sightingDate, setSightingDate] = useState(todayISODate);
  const [sightingTime, setSightingTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors<SightingFormField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const allowLeave = useRef(false);
  const photoButtonRef = useRef<HTMLButtonElement>(null);

  const values: SightingFormValues = {
    description,
    place: location.place,
    city: location.city,
    region: location.region,
    country: location.country,
    sightingDate,
    sightingTime,
  };
  const errors = submitted ? { ...serverErrors, ...validateSightingForm(values, { hasPhoto: file !== null }) } : {};
  const pending = createSighting.isPending;

  const isDirty =
    file !== null ||
    description.trim() !== '' ||
    [location.place, location.city, location.region, location.country].some((value) => value.trim() !== '') ||
    location.coordinates !== null ||
    sightingTime !== '';

  // Confirma antes de sair com um relato não publicado.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  function handleCancel() {
    // Sem histórico interno (link aberto direto), voltar sairia do app: vai para o feed.
    if (routerLocation.key !== 'default') navigate(-1);
    else navigate(paths.home);
  }

  function focusField(field: SightingFormField) {
    if (field === 'photo') {
      photoButtonRef.current?.focus();
      return;
    }
    const element = document.querySelector<HTMLElement>(`[name="${field}"]`);
    element?.focus();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setServerErrors({});
    setFormError(null);

    const validation = validateSightingForm(values, { hasPhoto: file !== null });
    if (hasErrors(validation) || !file) {
      const first = FIELD_ORDER.find((field) => validation[field]);
      if (first) focusField(first);
      return;
    }

    createSighting.mutate(
      {
        file,
        description,
        location,
        sightingDate,
        sightingTime: sightingTime || null,
      },
      {
        onSuccess: (sighting) => {
          allowLeave.current = true;
          toast.success('Avistamento publicado! Ele já está no topo do feed.');
          navigate(paths.home, { state: { highlight: sighting.id } });
        },
        onError: (error) => {
          if (isAppError(error) && error.fieldErrors) {
            setServerErrors(error.fieldErrors as FieldErrors<SightingFormField>);
          }
          setFormError(getErrorMessage(error, 'Não foi possível publicar o avistamento. Tente novamente.'));
        },
      },
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Registrar avistamento</h1>
        <p className={styles.subtitle}>
          Descreva com o máximo de detalhes. Relatos completos ajudam a comunidade a investigar.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.photoColumn} aria-label="Foto do avistamento">
          <ImageUploader
            file={file}
            onChange={setFile}
            error={errors.photo}
            disabled={pending}
            triggerRef={photoButtonRef}
          />
          <p className={styles.photoTip}>
            Dica: se possível, inclua algo que dê noção de escala — uma árvore, uma pedra ou sua mochila.
          </p>
        </section>

        <div className={styles.fields}>
          {formError && (
            <p className={styles.formError} role="alert">
              <CircleAlert size={16} aria-hidden="true" />
              {formError}
            </p>
          )}

          <TextArea
            label="Descrição"
            name="description"
            placeholder="Conte tudo o que você viu..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={LIMITS.descriptionMax}
            error={errors.description}
            hint="Tamanho, cor, comportamento, sons, cheiros, por quanto tempo durou…"
            disabled={pending}
            rows={6}
          />

          <LocationInput
            value={location}
            onChange={(patch) => setLocation((current) => ({ ...current, ...patch }))}
            errors={errors}
            disabled={pending}
          />

          <fieldset className={styles.fieldset} disabled={pending}>
            <legend className={styles.legend}>Quando aconteceu</legend>
            <div className={styles.row}>
              <TextField
                label="Data do avistamento"
                name="sightingDate"
                type="date"
                value={sightingDate}
                min={MIN_SIGHTING_DATE}
                max={todayISODate()}
                onChange={(event) => setSightingDate(event.target.value)}
                error={errors.sightingDate}
              />
              <TextField
                label="Horário"
                optional
                name="sightingTime"
                type="time"
                value={sightingTime}
                onChange={(event) => setSightingTime(event.target.value)}
                error={errors.sightingTime}
              />
            </div>
          </fieldset>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleCancel} disabled={pending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              icon={<Send size={18} />}
              loading={pending}
              loadingText="Publicando…"
              className={styles.submit}
            >
              Publicar avistamento
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Descartar este relato?"
        description="Você começou a registrar um avistamento. Se sair agora, a foto e as informações preenchidas serão perdidas."
        confirmLabel="Descartar e sair"
        cancelLabel="Continuar editando"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
