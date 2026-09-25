/**
 * Sessões opacas: o navegador recebe um token aleatório e o banco guarda apenas o hash dele.
 * Assim dá para encerrar sessões (logout, troca de senha) sem depender de JWT.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { User } from '../../generated/prisma/client.ts';
import { prisma } from './db.ts';
import { unauthorized } from './errors.ts';

const SESSION_DAYS = 30;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.sessao.create({ data: { tokenHash: hashToken(token), usuarioId: userId, expiraEm: expiresAt } });
  return { token, expiresAt: expiresAt.toISOString() };
}

function readBearer(req: Request): string | null {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

interface AuthLocals {
  user?: User;
  sessionId?: number;
  token?: string;
  sessionExpiresAt?: Date;
}

/** Identifica o usuário (se houver token válido) em todas as rotas. */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next();

  const session = await prisma.sessao.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: true },
  });
  if (session && session.expiraEm > new Date()) {
    const locals = res.locals as AuthLocals;
    locals.user = session.usuario;
    locals.sessionId = session.id;
    locals.token = token;
    locals.sessionExpiresAt = session.expiraEm;
  }
  next();
}

export function getViewer(res: Response): User | null {
  return (res.locals as AuthLocals).user ?? null;
}

export function requireViewer(res: Response): User {
  const user = getViewer(res);
  if (!user) throw unauthorized();
  return user;
}

export function getSession(res: Response) {
  const locals = res.locals as AuthLocals;
  if (!locals.sessionId || !locals.token || !locals.sessionExpiresAt) throw unauthorized();
  return { id: locals.sessionId, token: locals.token, expiresAt: locals.sessionExpiresAt.toISOString() };
}
