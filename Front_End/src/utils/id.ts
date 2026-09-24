/**
 * Geração de identificadores aleatórios.
 * Usa crypto.getRandomValues (disponível mesmo fora de HTTPS, ex.: teste pelo IP da rede local),
 * ao contrário de crypto.randomUUID, que exige contexto seguro.
 */

export function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createId(prefix: string): string {
  return `${prefix}_${randomHex(8)}`;
}
