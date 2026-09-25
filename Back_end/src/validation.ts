/**
 * Validação de tudo o que chega do cliente. As regras e mensagens espelham
 * Front_End/src/utils/validation.ts — a interface valida antes, mas o servidor nunca confia nela.
 */
import { z } from 'zod';
import { notFound, validationError } from './errors.ts';
import { cleanLine, cleanText } from './text.ts';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const RESERVED_USERNAMES = new Set([
  'admin', 'suporte', 'rastro', 'api', 'root', 'sistema', 'moderacao', 'me', 'featured', 'availability',
]);

/** Linha obrigatória, limpa de espaços extras. */
const requiredLine = (max: number, emptyMessage: string) =>
  z
    .string({ error: emptyMessage })
    .transform(cleanLine)
    .pipe(z.string().min(1, emptyMessage).max(max, `Use no máximo ${max} caracteres.`));

export const emailSchema = z
  .string({ error: 'Informe seu e-mail.' })
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.string().min(1, 'Informe seu e-mail.').max(254, 'Informe um e-mail válido.').regex(EMAIL_PATTERN, 'Informe um e-mail válido.'));

export const passwordSchema = z
  .string({ error: 'Crie uma senha.' })
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .max(72, 'A senha pode ter no máximo 72 caracteres.')
  .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), 'Use letras e números na senha.');

export const usernameSchema = z
  .string({ error: 'Escolha um nome de usuário.' })
  .transform((value) => value.trim().replace(/^@+/, '').toLowerCase())
  .pipe(
    z
      .string()
      .min(3, 'Use pelo menos 3 caracteres.')
      .max(30, 'Use no máximo 30 caracteres.')
      .regex(/^[a-z0-9._]+$/, 'Use apenas letras minúsculas, números, ponto e sublinhado.')
      .refine((value) => !value.startsWith('.') && !value.endsWith('.'), 'O nome de usuário não pode começar nem terminar com ponto.')
      .refine((value) => !value.includes('..'), 'Não use dois pontos seguidos.'),
  );

const nameSchema = z
  .string({ error: 'Informe seu nome.' })
  .transform(cleanLine)
  .pipe(z.string().min(2, 'O nome está muito curto.').max(50, 'Use no máximo 50 caracteres.'));

export const registerSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Informe sua senha.' }).min(1, 'Informe sua senha.').max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: 'Informe sua senha atual.' }).min(1, 'Informe sua senha atual.').max(200),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  bio: z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(160, 'A biografia pode ter no máximo 160 caracteres.')),
  avatarUrl: z.string().max(500).nullable(),
});

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Aceita até "amanhã" em UTC, para não recusar quem está em fuso adiantado. */
function isNotFuture(value: string) {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return value <= tomorrow;
}

export const createSightingSchema = z.object({
  photo: z.object({
    url: z.string({ error: 'Adicione uma foto do avistamento.' }).min(1, 'Adicione uma foto do avistamento.').max(500),
    width: z.number().int().min(1).max(10_000),
    height: z.number().int().min(1).max(10_000),
  }),
  description: z
    .string({ error: 'Conte o que você viu.' })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(1, 'Conte o que você viu.')
        .min(20, 'Descreva com pelo menos 20 caracteres.')
        .max(2200, 'Use no máximo 2200 caracteres.'),
    ),
  location: z.object({
    place: requiredLine(80, 'Informe o local (trilha, parque, lago…).'),
    city: requiredLine(60, 'Informe a cidade.'),
    region: requiredLine(60, 'Informe o estado ou região.'),
    country: requiredLine(60, 'Informe o país.'),
    coordinates: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        accuracy: z.number().min(0).max(1_000_000).nullable(),
      })
      .nullable(),
  }),
  sightingDate: z
    .string({ error: 'Informe a data do avistamento.' })
    .refine(isValidDate, 'Informe uma data válida.')
    .refine((value) => value >= '1900-01-01', 'Informe uma data a partir de 1900.')
    .refine(isNotFuture, 'A data não pode estar no futuro.'),
  sightingTime: z.string().regex(TIME_PATTERN, 'Informe um horário válido.').nullable(),
});

export const commentSchema = z.object({
  text: z
    .string({ error: 'Escreva um comentário.' })
    .transform(cleanText)
    .pipe(z.string().min(1, 'Escreva um comentário.').max(500, 'Comentários podem ter no máximo 500 caracteres.')),
});

export const likeSchema = z.object({ liked: z.boolean() });

const cursorSchema = z
  .string()
  .regex(/^\d{1,7}$/)
  .optional()
  .transform((value) => (value ? Number(value) : 0));

export const pageQuerySchema = z.object({
  cursor: cursorSchema,
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const searchQuerySchema = pageQuerySchema.extend({
  query: z.string().max(80).optional().default(''),
  region: z.string().max(60).optional().default(''),
  period: z.enum(['all', '7d', '30d', '365d']).optional().default('all'),
  sort: z.enum(['recent', 'popular', 'discussed', 'sighting-date']).optional().default('recent'),
});

const idSchema = z.coerce.number().int().positive().max(2_147_483_647);

/** ID vindo da URL. Um ID malformado simplesmente não existe → 404. */
export function parseId(value: unknown, notFoundMessage: string): number {
  const result = idSchema.safeParse(value);
  if (!result.success) throw notFound(notFoundMessage);
  return result.data;
}

/**
 * Valida e devolve o dado já limpo. Em caso de erro, lança um 400 com fieldErrors
 * usando os nomes de campo que a interface conhece (ex.: "place" em vez de "location.place").
 */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.map(String);
    const field = path[0] === 'photo' ? 'photo' : path[0] === 'location' ? (path[1] ?? 'place') : path[0];
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  const first = Object.values(fieldErrors)[0];
  throw validationError(first ?? 'Dados inválidos.', fieldErrors);
}
