import { APP_ERROR_CODES, AppError, type AppErrorCode } from '../errors';
import { tokenStorage } from '../tokenStorage';

export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

type QueryValue = string | number | null | undefined;

interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  form?: FormData;
}

function isAppErrorCode(value: unknown): value is AppErrorCode {
  return typeof value === 'string' && (APP_ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Cliente HTTP da API do Rastro: envia o token da sessão e converte as respostas de erro
 * ({ code, message, fieldErrors }) em AppError — o mesmo erro que a interface já trata.
 */
export async function api<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch {
    throw new AppError(
      'NETWORK',
      'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
    );
  }

  // Lê o corpo sempre (mesmo vazio) para a requisição terminar de forma limpa.
  const raw = await response.text().catch(() => '');
  let data: unknown = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  if (response.ok && response.status === 204) return undefined as T;

  if (!response.ok) {
    const payload = (data ?? {}) as { code?: unknown; message?: unknown; fieldErrors?: unknown };
    throw new AppError(
      isAppErrorCode(payload.code) ? payload.code : 'UNKNOWN',
      typeof payload.message === 'string' ? payload.message : 'Algo deu errado. Tente novamente.',
      payload.fieldErrors && typeof payload.fieldErrors === 'object'
        ? (payload.fieldErrors as Record<string, string>)
        : undefined,
    );
  }
  return data as T;
}
