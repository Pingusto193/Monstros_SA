/**
 * Erros no mesmo formato que o front-end espera: { code, message, fieldErrors }.
 * Os códigos batem com AppErrorCode em Front_End/src/services/errors.ts.
 */
export type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'USERNAME_TAKEN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_FILE'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(status: number, code: ErrorCode, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export const notFound = (message = 'Não encontrado.') => new HttpError(404, 'NOT_FOUND', message);
export const unauthorized = () => new HttpError(401, 'UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');
export const forbidden = (message: string) => new HttpError(403, 'FORBIDDEN', message);
export const validationError = (message: string, fieldErrors?: Record<string, string>) =>
  new HttpError(400, 'VALIDATION', message, fieldErrors);
