import { getDatabase, transaction } from '@/mocks/db';
import type { UserRecord } from '@/mocks/records';
import type { AuthSession } from '@/types';
import { generateSalt, hashPassword, verifyPassword } from '@/utils/crypto/password';
import { DAY_MS } from '@/utils/date';
import { createId, randomHex } from '@/utils/id';
import { cleanLine } from '@/utils/text';
import {
  hasErrors,
  normalizeEmail,
  normalizeUsername,
  validatePassword,
  validateRegister,
} from '@/utils/validation';
import type { AuthService } from '../contracts';
import { AppError } from '../errors';
import { tokenStorage } from '../tokenStorage';
import { isUsernameFree, requireViewerId, simulateLatency, toCurrentUser } from './support';

const SESSION_DAYS = 30;

function startSession(user: UserRecord): AuthSession {
  const now = Date.now();
  const token = randomHex(32);
  const expiresAt = new Date(now + SESSION_DAYS * DAY_MS).toISOString();

  transaction(['sessions'], (db) => {
    db.sessions = [
      ...db.sessions.filter((session) => Date.parse(session.expiresAt) > now),
      { token, userId: user.id, createdAt: new Date(now).toISOString(), expiresAt },
    ];
  });

  tokenStorage.set(token);
  return { user: toCurrentUser(user), token, expiresAt };
}

export const mockAuthService: AuthService = {
  async login(input) {
    await simulateLatency('write');
    const email = normalizeEmail(input.email);
    const user = getDatabase().users.find((item) => item.email === email);

    // Mensagem genérica: não revela se o e-mail existe.
    if (!user || !verifyPassword(input.password, user.passwordSalt, user.passwordHash)) {
      throw new AppError('INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
    }
    return startSession(user);
  },

  async register(input) {
    await simulateLatency('write');

    const errors = validateRegister({ ...input, confirmPassword: input.password });
    if (hasErrors(errors)) throw new AppError('VALIDATION', 'Revise os campos destacados.', errors);

    const email = normalizeEmail(input.email);
    const username = normalizeUsername(input.username);
    const db = getDatabase();

    if (db.users.some((user) => user.email === email)) {
      throw new AppError('EMAIL_TAKEN', 'Este e-mail já está cadastrado.', {
        email: 'Este e-mail já está cadastrado.',
      });
    }
    if (!isUsernameFree(db, username)) {
      throw new AppError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.', {
        username: 'Este nome de usuário já está em uso.',
      });
    }

    const salt = generateSalt();
    const user: UserRecord = {
      id: createId('usr'),
      name: cleanLine(input.name),
      username,
      email,
      bio: '',
      avatarUrl: null,
      isOfficial: false,
      createdAt: new Date().toISOString(),
      passwordSalt: salt,
      passwordHash: hashPassword(input.password, salt),
    };

    transaction(['users'], (database) => {
      database.users = [...database.users, user];
    });

    return startSession(user);
  },

  async logout() {
    const token = tokenStorage.get();
    tokenStorage.clear();
    if (!token) return;
    try {
      transaction(['sessions'], (db) => {
        db.sessions = db.sessions.filter((session) => session.token !== token);
      });
    } catch {
      // Falhar ao limpar a sessão salva não impede o logout local.
    }
  },

  async restoreSession() {
    await simulateLatency('read');
    const token = tokenStorage.get();
    if (!token) return null;

    const db = getDatabase();
    const session = db.sessions.find((item) => item.token === token);
    const user = session ? db.users.find((item) => item.id === session.userId) : undefined;

    if (!session || !user || Date.parse(session.expiresAt) <= Date.now()) {
      tokenStorage.clear();
      return null;
    }
    return { user: toCurrentUser(user), token, expiresAt: session.expiresAt };
  },

  async changePassword(input) {
    await simulateLatency('write');
    const userId = requireViewerId();
    const currentToken = tokenStorage.get();
    const user = getDatabase().users.find((item) => item.id === userId);
    if (!user) throw new AppError('UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');

    if (!verifyPassword(input.currentPassword, user.passwordSalt, user.passwordHash)) {
      throw new AppError('VALIDATION', 'A senha atual está incorreta.', {
        currentPassword: 'A senha atual está incorreta.',
      });
    }
    const passwordError = validatePassword(input.newPassword);
    if (passwordError) {
      throw new AppError('VALIDATION', passwordError, { newPassword: passwordError });
    }

    const salt = generateSalt();
    transaction(['users', 'sessions'], (db) => {
      db.users = db.users.map((item) =>
        item.id === userId
          ? { ...item, passwordSalt: salt, passwordHash: hashPassword(input.newPassword, salt) }
          : item,
      );
      // Encerra as outras sessões deste usuário, mantendo a atual.
      db.sessions = db.sessions.filter((session) => session.userId !== userId || session.token === currentToken);
    });
  },
};
