/**
 * Regras de validação compartilhadas.
 * A UI usa para feedback imediato; os serviços (mock hoje, API amanhã) validam de novo,
 * porque dados vindos do usuário nunca devem ser aceitos sem conferência.
 */
import { isValidISODate, todayISODate } from './date';
import { cleanLine, cleanText } from './text';

export const LIMITS = {
  nameMin: 2,
  nameMax: 50,
  usernameMin: 3,
  usernameMax: 30,
  bioMax: 160,
  emailMax: 254,
  passwordMin: 8,
  passwordMax: 72,
  descriptionMin: 20,
  descriptionMax: 2200,
  commentMax: 500,
  placeMax: 80,
  cityMax: 60,
  regionMax: 60,
  countryMax: 60,
} as const;

export const MIN_SIGHTING_DATE = '1900-01-01';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

/** Remove entradas vazias para que o objeto só contenha erros reais. */
function compact<K extends string>(errors: Record<K, string | null>): FieldErrors<K> {
  const result: FieldErrors<K> = {};
  for (const key of Object.keys(errors) as K[]) {
    const message = errors[key];
    if (message) result[key] = message;
  }
  return result;
}

// ---------- Normalizadores ----------

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

// ---------- Campos ----------

export function validateEmail(value: string): string | null {
  const email = normalizeEmail(value);
  if (!email) return 'Informe seu e-mail.';
  if (email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
    return 'Informe um e-mail válido.';
  }
  return null;
}

export function getPasswordChecks(value: string) {
  return [
    { id: 'length', label: `Pelo menos ${LIMITS.passwordMin} caracteres`, ok: value.length >= LIMITS.passwordMin },
    { id: 'mix', label: 'Letras e números', ok: /[a-zA-Z]/.test(value) && /\d/.test(value) },
  ];
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Crie uma senha.';
  if (value.length < LIMITS.passwordMin) {
    return `A senha precisa ter pelo menos ${LIMITS.passwordMin} caracteres.`;
  }
  if (value.length > LIMITS.passwordMax) {
    return `A senha pode ter no máximo ${LIMITS.passwordMax} caracteres.`;
  }
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return 'Use letras e números na senha.';
  return null;
}

export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);
  if (!username) return 'Escolha um nome de usuário.';
  if (username.length < LIMITS.usernameMin) {
    return `Use pelo menos ${LIMITS.usernameMin} caracteres.`;
  }
  if (username.length > LIMITS.usernameMax) {
    return `Use no máximo ${LIMITS.usernameMax} caracteres.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use apenas letras minúsculas, números, ponto e sublinhado.';
  }
  if (username.startsWith('.') || username.endsWith('.')) {
    return 'O nome de usuário não pode começar nem terminar com ponto.';
  }
  if (username.includes('..')) return 'Não use dois pontos seguidos.';
  return null;
}

export function validateName(value: string): string | null {
  const name = cleanLine(value);
  if (!name) return 'Informe seu nome.';
  if (name.length < LIMITS.nameMin) return 'O nome está muito curto.';
  if (name.length > LIMITS.nameMax) return `Use no máximo ${LIMITS.nameMax} caracteres.`;
  return null;
}

export function validateBio(value: string): string | null {
  if (cleanText(value).length > LIMITS.bioMax) {
    return `A biografia pode ter no máximo ${LIMITS.bioMax} caracteres.`;
  }
  return null;
}

export function validateComment(value: string): string | null {
  const text = cleanText(value);
  if (!text) return 'Escreva um comentário.';
  if (text.length > LIMITS.commentMax) {
    return `Comentários podem ter no máximo ${LIMITS.commentMax} caracteres.`;
  }
  return null;
}

function validateRequiredLine(value: string, max: number, emptyMessage: string): string | null {
  const text = cleanLine(value);
  if (!text) return emptyMessage;
  if (text.length > max) return `Use no máximo ${max} caracteres.`;
  return null;
}

// ---------- Formulários ----------

export interface LoginValues {
  email: string;
  password: string;
}

export function validateLogin(values: LoginValues): FieldErrors<keyof LoginValues> {
  return compact({
    email: validateEmail(values.email),
    password: values.password ? null : 'Informe sua senha.',
  });
}

export interface RegisterValues {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegister(values: RegisterValues): FieldErrors<keyof RegisterValues> {
  return compact({
    name: validateName(values.name),
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword: !values.confirmPassword
      ? 'Confirme sua senha.'
      : values.confirmPassword !== values.password
        ? 'As senhas não coincidem.'
        : null,
  });
}

export interface SightingFormValues {
  description: string;
  place: string;
  city: string;
  region: string;
  country: string;
  sightingDate: string;
  sightingTime: string;
}

export type SightingFormField = keyof SightingFormValues | 'photo';

export function validateSightingForm(
  values: SightingFormValues,
  options: { hasPhoto: boolean },
): FieldErrors<SightingFormField> {
  const description = cleanText(values.description);
  const today = todayISODate();

  let dateError: string | null = null;
  if (!values.sightingDate) dateError = 'Informe a data do avistamento.';
  else if (!isValidISODate(values.sightingDate)) dateError = 'Informe uma data válida.';
  else if (values.sightingDate > today) dateError = 'A data não pode estar no futuro.';
  else if (values.sightingDate < MIN_SIGHTING_DATE) dateError = 'Informe uma data a partir de 1900.';

  let timeError: string | null = null;
  if (values.sightingTime) {
    if (!TIME_PATTERN.test(values.sightingTime)) timeError = 'Informe um horário válido.';
    else if (values.sightingDate === today) {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (values.sightingTime > current) timeError = 'O horário não pode estar no futuro.';
    }
  }

  return compact({
    photo: options.hasPhoto ? null : 'Adicione uma foto do avistamento.',
    description: !description
      ? 'Conte o que você viu.'
      : description.length < LIMITS.descriptionMin
        ? `Descreva com pelo menos ${LIMITS.descriptionMin} caracteres.`
        : description.length > LIMITS.descriptionMax
          ? `Use no máximo ${LIMITS.descriptionMax} caracteres.`
          : null,
    place: validateRequiredLine(values.place, LIMITS.placeMax, 'Informe o local (trilha, parque, lago…).'),
    city: validateRequiredLine(values.city, LIMITS.cityMax, 'Informe a cidade.'),
    region: validateRequiredLine(values.region, LIMITS.regionMax, 'Informe o estado ou região.'),
    country: validateRequiredLine(values.country, LIMITS.countryMax, 'Informe o país.'),
    sightingDate: dateError,
    sightingTime: timeError,
  });
}

export interface ProfileFormValues {
  name: string;
  username: string;
  bio: string;
}

export function validateProfileForm(values: ProfileFormValues): FieldErrors<keyof ProfileFormValues> {
  return compact({
    name: validateName(values.name),
    username: validateUsername(values.username),
    bio: validateBio(values.bio),
  });
}

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validateChangePassword(
  values: ChangePasswordValues,
): FieldErrors<keyof ChangePasswordValues> {
  return compact({
    currentPassword: values.currentPassword ? null : 'Informe sua senha atual.',
    newPassword:
      validatePassword(values.newPassword) ??
      (values.newPassword === values.currentPassword ? 'A nova senha deve ser diferente da atual.' : null),
    confirmPassword: !values.confirmPassword
      ? 'Confirme a nova senha.'
      : values.confirmPassword !== values.newPassword
        ? 'As senhas não coincidem.'
        : null,
  });
}
