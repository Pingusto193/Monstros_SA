/**
 * Hash de senha para a autenticação MOCKADA (demonstração local).
 * Garante que nenhuma senha fique em texto puro no localStorage.
 * Não substitui o hash no servidor: quando houver backend, a senha só trafega via HTTPS
 * e é armazenada com bcrypt/argon2 (campo senhaHash do schema Prisma).
 */
import { randomHex } from '../id';
import { sha256, toHex } from './sha256';

const ITERATIONS = 2048;
const encoder = new TextEncoder();

export function generateSalt(): string {
  return randomHex(16);
}

export function hashPassword(password: string, salt: string): string {
  const saltBytes = encoder.encode(salt);
  let digest = sha256(encoder.encode(`${salt}:${password}`));
  const input = new Uint8Array(digest.length + saltBytes.length);
  for (let i = 1; i < ITERATIONS; i++) {
    input.set(digest, 0);
    input.set(saltBytes, digest.length);
    digest = sha256(input);
  }
  return toHex(digest);
}

/** Comparação em tempo constante para não vazar informação pelo tempo de resposta. */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actual = hashPassword(password, salt);
  if (actual.length !== expectedHash.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) {
    difference |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return difference === 0;
}
