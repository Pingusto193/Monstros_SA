/**
 * Implementações reais (API do Back_end) dos contratos de src/services/contracts.ts.
 * Rotas documentadas nos comentários de cada contrato.
 */
import type {
  AuthSession,
  Comment,
  CurrentUser,
  FeaturedUser,
  LikeResult,
  Page,
  RegionSummary,
  Sighting,
  UserProfile,
  UserSummary,
} from '@/types';
import { resizeImageToBlob, validateImageFile } from '@/utils/image';
import type {
  AuthService,
  CommentService,
  MediaService,
  SightingService,
  UploadedImage,
  UserService,
} from '../contracts';
import { AppError, isAppError } from '../errors';
import { tokenStorage } from '../tokenStorage';
import { api } from './apiClient';

const enc = encodeURIComponent;

function saveSession(session: AuthSession): AuthSession {
  tokenStorage.set(session.token);
  return session;
}

export const httpAuthService: AuthService = {
  async login(input) {
    return saveSession(await api<AuthSession>('POST', '/auth/login', { body: input }));
  },

  async register(input) {
    return saveSession(await api<AuthSession>('POST', '/auth/register', { body: input }));
  },

  async logout() {
    try {
      if (tokenStorage.get()) await api<void>('POST', '/auth/logout');
    } catch {
      // Mesmo sem resposta do servidor, a sessão local é encerrada.
    } finally {
      tokenStorage.clear();
    }
  },

  async restoreSession() {
    if (!tokenStorage.get()) return null;
    try {
      return await api<AuthSession>('GET', '/auth/me');
    } catch (error) {
      if (isAppError(error, 'UNAUTHORIZED')) {
        tokenStorage.clear();
        return null;
      }
      throw error;
    }
  },

  async changePassword(input) {
    await api<void>('PUT', '/auth/password', { body: input });
  },
};

export const httpUserService: UserService = {
  getProfile: (username) => api<UserProfile>('GET', `/users/${enc(username)}`),
  updateProfile: (input) => api<CurrentUser>('PATCH', '/users/me', { body: input }),
  search: (query, limit) => api<UserSummary[]>('GET', '/users', { query: { search: query, limit } }),
  getFeatured: (limit) => api<FeaturedUser[]>('GET', '/users/featured', { query: { limit } }),
  async isUsernameAvailable(username) {
    const result = await api<{ available: boolean }>('GET', '/users/availability', { query: { username } });
    return result.available;
  },
};

export const httpSightingService: SightingService = {
  getFeed: ({ cursor, limit }) => api<Page<Sighting>>('GET', '/sightings/feed', { query: { cursor, limit } }),
  search: ({ query, region, period, sort, cursor, limit }) =>
    api<Page<Sighting>>('GET', '/sightings', { query: { query, region, period, sort, cursor, limit } }),
  listByUser: (userId, { cursor, limit }) =>
    api<Page<Sighting>>('GET', `/users/${enc(userId)}/sightings`, { query: { cursor, limit } }),
  getById: (id) => api<Sighting>('GET', `/sightings/${enc(id)}`),
  create: (input) => api<Sighting>('POST', '/sightings', { body: input }),
  remove: (id) => api<void>('DELETE', `/sightings/${enc(id)}`),
  setLike: (id, liked) => api<LikeResult>(liked ? 'PUT' : 'DELETE', `/sightings/${enc(id)}/like`),
  getRegions: (limit) => api<RegionSummary[]>('GET', '/regions', { query: { limit } }),
};

export const httpCommentService: CommentService = {
  list: (sightingId) => api<Comment[]>('GET', `/sightings/${enc(sightingId)}/comments`),
  create: ({ sightingId, text }) => api<Comment>('POST', `/sightings/${enc(sightingId)}/comments`, { body: { text } }),
  remove: (commentId) => api<void>('DELETE', `/comments/${enc(commentId)}`),
};

export const httpMediaService: MediaService = {
  /** Comprime no navegador (economiza dados e espaço no banco) e envia para POST /uploads. */
  async uploadImage(file, { kind }) {
    const error = validateImageFile(file);
    if (error) throw new AppError('INVALID_FILE', error);

    let processed: Awaited<ReturnType<typeof resizeImageToBlob>>;
    try {
      processed =
        kind === 'avatar'
          ? await resizeImageToBlob(file, { maxSize: 320, quality: 0.85, square: true })
          : await resizeImageToBlob(file, { maxSize: 1080, quality: 0.8 });
    } catch {
      throw new AppError('INVALID_FILE', 'Não foi possível processar esta imagem. Tente outro arquivo.');
    }

    const form = new FormData();
    form.append('file', processed.blob, 'foto.jpg');
    form.append('width', String(processed.width));
    form.append('height', String(processed.height));
    form.append('kind', kind);
    return api<UploadedImage>('POST', '/uploads', { form });
  },
};
