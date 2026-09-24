/**
 * Utilidades internas dos serviços mockados: latência simulada, sessão atual,
 * paginação e conversão de registros do "banco" para os tipos da interface.
 */
import { getDatabase } from '@/mocks/db';
import type { CommentRecord, MockDatabase, SightingRecord, UserRecord } from '@/mocks/records';
import type {
  Comment,
  CurrentUser,
  ID,
  Page,
  PageParams,
  Sighting,
  User,
  UserSummary,
} from '@/types';
import { AppError } from '../errors';
import { tokenStorage } from '../tokenStorage';

// ---------- Latência ----------

const latencyFactor = (() => {
  const value = Number(import.meta.env.VITE_MOCK_LATENCY ?? 1);
  return Number.isFinite(value) && value >= 0 ? value : 1;
})();

/** Simula o tempo de resposta de uma API real (curto, para não atrapalhar o uso). */
export function simulateLatency(kind: 'read' | 'write' = 'read'): Promise<void> {
  const [min, max] = kind === 'read' ? [180, 420] : [120, 280];
  const ms = (min + Math.random() * (max - min)) * latencyFactor;
  return ms <= 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Sessão ----------

export function getViewerId(): ID | null {
  const token = tokenStorage.get();
  if (!token) return null;
  const session = getDatabase().sessions.find((item) => item.token === token);
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  return session.userId;
}

export function requireViewerId(): ID {
  const viewerId = getViewerId();
  if (!viewerId) throw new AppError('UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');
  return viewerId;
}

const RESERVED_USERNAMES = new Set(['admin', 'suporte', 'rastro', 'api', 'root', 'sistema', 'moderacao']);

export function isUsernameFree(db: MockDatabase, username: string, exceptUserId?: ID): boolean {
  if (RESERVED_USERNAMES.has(username) && !db.users.some((u) => u.id === exceptUserId && u.username === username)) {
    return false;
  }
  return !db.users.some((user) => user.username === username && user.id !== exceptUserId);
}

// ---------- Paginação (cursor = deslocamento) ----------

export function paginate<T>(items: T[], params: PageParams, defaultLimit: number): Page<T> {
  const offset = Math.max(0, Number.parseInt(params.cursor ?? '0', 10) || 0);
  const limit = Math.min(50, Math.max(1, params.limit ?? defaultLimit));
  const end = offset + limit;
  return {
    items: items.slice(offset, end),
    nextCursor: end < items.length ? String(end) : null,
    total: items.length,
  };
}

// ---------- Conversões registro → tipo da interface ----------

const REMOVED_USER: UserSummary = {
  id: 'removed',
  name: 'Usuário removido',
  username: 'removido',
  avatarUrl: null,
};

export function toUserSummary(user: UserRecord): UserSummary {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOfficial: user.isOfficial || undefined,
  };
}

export function toUser(user: UserRecord): User {
  return { ...toUserSummary(user), bio: user.bio, createdAt: user.createdAt };
}

export function toCurrentUser(user: UserRecord): CurrentUser {
  return { ...toUser(user), email: user.email };
}

function indexUsers(db: MockDatabase): Map<ID, UserSummary> {
  return new Map(db.users.map((user) => [user.id, toUserSummary(user)]));
}

export function createCommentMapper(db: MockDatabase) {
  const users = indexUsers(db);
  return (record: CommentRecord): Comment => ({
    id: record.id,
    sightingId: record.sightingId,
    author: users.get(record.authorId) ?? REMOVED_USER,
    text: record.text,
    createdAt: record.createdAt,
  });
}

/** Cria um conversor com índices pré-calculados (evita buscas repetidas em listas). */
export function createSightingMapper(db: MockDatabase, viewerId: ID | null) {
  const users = indexUsers(db);
  const toComment = createCommentMapper(db);

  const commentsBySighting = new Map<ID, CommentRecord[]>();
  for (const comment of db.comments) {
    const list = commentsBySighting.get(comment.sightingId);
    if (list) list.push(comment);
    else commentsBySighting.set(comment.sightingId, [comment]);
  }

  const likedByViewer = new Set(
    viewerId ? db.likes.filter((like) => like.userId === viewerId).map((like) => like.sightingId) : [],
  );

  return (record: SightingRecord): Sighting => {
    const comments = commentsBySighting.get(record.id) ?? [];
    const recent = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-2);

    return {
      id: record.id,
      author: users.get(record.authorId) ?? REMOVED_USER,
      photo: { url: record.photoUrl, width: record.photoWidth, height: record.photoHeight },
      description: record.description,
      location: {
        place: record.place,
        city: record.city,
        region: record.region,
        country: record.country,
        coordinates:
          record.latitude !== null && record.longitude !== null
            ? { latitude: record.latitude, longitude: record.longitude, accuracy: record.locationAccuracy }
            : null,
      },
      sightingDate: record.sightingDate,
      sightingTime: record.sightingTime,
      createdAt: record.createdAt,
      likeCount: record.likeCount,
      commentCount: comments.length,
      likedByMe: likedByViewer.has(record.id),
      recentComments: recent.map(toComment),
    };
  };
}

export function countCommentsBySighting(db: MockDatabase): Map<ID, number> {
  const counts = new Map<ID, number>();
  for (const comment of db.comments) {
    counts.set(comment.sightingId, (counts.get(comment.sightingId) ?? 0) + 1);
  }
  return counts;
}
