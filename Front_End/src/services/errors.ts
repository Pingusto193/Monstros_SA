export type AppErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'USERNAME_TAKEN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'STORAGE_FULL'
  | 'INVALID_FILE'
  | 'UNKNOWN';

/**
 * Erro de domínio padronizado. A futura API deve responder com o mesmo `code`
 * (e `fieldErrors` para erros de formulário) para que a interface não precise mudar.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(code: AppErrorCode, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function isAppError(error: unknown, code?: AppErrorCode): error is AppError {
  return error instanceof AppError && (code === undefined || error.code === code);
}

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  return error instanceof AppError ? error.message : fallback;
}
