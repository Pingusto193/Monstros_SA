// Remover caracteres de controle é justamente o objetivo destas expressões.
// oxlint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g; // exceto \n e \t
// oxlint-disable-next-line no-control-regex
const LINE_BREAKS = /[\u0000-\u001F\u007F]+/g;

/** Limpa texto de várias linhas (descrições, comentários, bio). */
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Limpa texto de uma linha (nome, cidade…): remove quebras e espaços repetidos. */
export function cleanLine(value: string): string {
  return value.replace(LINE_BREAKS, ' ').replace(/\s+/g, ' ').trim();
}

/** Normaliza para busca: sem acentos, minúsculo. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
