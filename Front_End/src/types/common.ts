/** Identificador opaco. Hoje é uma string gerada no front; no banco pode virar UUID/cuid. */
export type ID = string;

/** Data e hora em ISO 8601 (ex.: "2026-09-18T19:40:00.000Z"). */
export type ISODateTime = string;

/** Data de calendário sem fuso (ex.: "2026-09-18"). */
export type ISODate = string;

/** Página de resultados com paginação por cursor — formato esperado da futura API. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}

export interface PageParams {
  cursor?: string | null;
  limit?: number;
}
