import type { ISODate, ISODateTime } from '@/types';

const LOCALE = 'pt-BR';
export const DAY_MS = 86_400_000;

const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const shortDateYearFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const monthYearFormat = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Converte Date para "YYYY-MM-DD" usando o fuso local (sem o bug de UTC). */
export function toISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISODate(): ISODate {
  return toISODate(new Date());
}

/** Interpreta "YYYY-MM-DD" como meia-noite local (new Date("2026-09-18") usaria UTC). */
export function parseISODate(value: ISODate): Date {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toISODate(parseISODate(value)) === value;
}

/** "18 de setembro de 2026" */
export function formatLongDate(value: ISODate): string {
  return longDateFormat.format(parseISODate(value));
}

/** "18 de setembro de 2026 às 16:40" */
export function formatDateTime(value: ISODateTime): string {
  return dateTimeFormat.format(new Date(value));
}

/** "setembro de 2026" */
export function formatMonthYear(value: ISODateTime): string {
  return monthYearFormat.format(new Date(value));
}

/** "há 5 minutos", "ontem", "há 3 dias"… */
export function formatRelativeTime(value: ISODateTime, now = Date.now()): string {
  const seconds = Math.round((now - Date.parse(value)) / 1000);
  if (seconds < 45) return 'agora mesmo';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  return longDateFormat.format(new Date(value));
}

/** Versão compacta, estilo rede social: "agora", "5 min", "2 h", "3 d", "2 sem", "12 de set." */
export function formatCompactRelativeTime(value: ISODateTime, now = Date.now()): string {
  const date = new Date(value);
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d`;
  if (days < 35) return `${Math.round(days / 7)} sem`;
  return date.getFullYear() === new Date(now).getFullYear()
    ? shortDateFormat.format(date)
    : shortDateYearFormat.format(date);
}

/** Descrição completa do momento do avistamento: "18 de setembro de 2026, às 16:40" */
export function formatSightingMoment(date: ISODate, time: string | null): string {
  const formatted = formatLongDate(date);
  return time ? `${formatted}, às ${time}` : formatted;
}
