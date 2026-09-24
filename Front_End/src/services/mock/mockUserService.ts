import { getDatabase, transaction } from '@/mocks/db';
import type { UserRecord } from '@/mocks/records';
import type { FeaturedUser, ID } from '@/types';
import { isSafeImageUrl } from '@/utils/image';
import { cleanLine, cleanText, normalizeForSearch } from '@/utils/text';
import {
  hasErrors,
  normalizeUsername,
  validateProfileForm,
  validateUsername,
} from '@/utils/validation';
import type { UserService } from '../contracts';
import { AppError } from '../errors';
import {
  getViewerId,
  isUsernameFree,
  requireViewerId,
  simulateLatency,
  toCurrentUser,
  toUser,
  toUserSummary,
} from './support';

export const mockUserService: UserService = {
  async getProfile(username) {
    await simulateLatency();
    const db = getDatabase();
    const user = db.users.find((item) => item.username === normalizeUsername(username));
    if (!user) throw new AppError('NOT_FOUND', 'Perfil não encontrado.');

    const sightings = db.sightings.filter((sighting) => sighting.authorId === user.id);
    const regionCounts = new Map<string, number>();
    for (const sighting of sightings) {
      regionCounts.set(sighting.region, (regionCounts.get(sighting.region) ?? 0) + 1);
    }
    const regions = [...regionCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
      .map(([region]) => region);

    return {
      user: toUser(user),
      stats: {
        sightings: sightings.length,
        likesReceived: sightings.reduce((sum, sighting) => sum + sighting.likeCount, 0),
        regions: regions.length,
      },
      regions,
    };
  },

  async updateProfile(input) {
    await simulateLatency('write');
    const userId = requireViewerId();

    const errors = validateProfileForm(input);
    if (hasErrors(errors)) throw new AppError('VALIDATION', 'Revise os campos destacados.', errors);
    if (input.avatarUrl !== null && !isSafeImageUrl(input.avatarUrl)) {
      throw new AppError('VALIDATION', 'A imagem de perfil é inválida.');
    }

    const username = normalizeUsername(input.username);
    if (!isUsernameFree(getDatabase(), username, userId)) {
      throw new AppError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.', {
        username: 'Este nome de usuário já está em uso.',
      });
    }

    const updated = transaction(['users'], (db) => {
      let result: UserRecord | undefined;
      db.users = db.users.map((user) => {
        if (user.id !== userId) return user;
        result = {
          ...user,
          name: cleanLine(input.name),
          username,
          bio: cleanText(input.bio),
          avatarUrl: input.avatarUrl,
        };
        return result;
      });
      if (!result) throw new AppError('UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.');
      return result;
    });

    return toCurrentUser(updated);
  },

  async search(query, limit = 8) {
    await simulateLatency();
    const term = normalizeForSearch(query.replace(/^@+/, ''));
    if (!term) return [];
    return getDatabase()
      .users.filter(
        (user) =>
          normalizeForSearch(user.username).includes(term) || normalizeForSearch(user.name).includes(term),
      )
      .slice(0, limit)
      .map(toUserSummary);
  },

  async getFeatured(limit = 5) {
    await simulateLatency();
    const db = getDatabase();
    const viewerId = getViewerId();
    const counts = new Map<ID, number>();
    for (const sighting of db.sightings) {
      counts.set(sighting.authorId, (counts.get(sighting.authorId) ?? 0) + 1);
    }

    return db.users
      .filter((user) => user.id !== viewerId && !user.isOfficial && (counts.get(user.id) ?? 0) > 0)
      .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, limit)
      .map((user): FeaturedUser => ({ ...toUserSummary(user), sightingsCount: counts.get(user.id) ?? 0 }));
  },

  async isUsernameAvailable(username) {
    await simulateLatency();
    const normalized = normalizeUsername(username);
    if (validateUsername(normalized)) return false;
    return isUsernameFree(getDatabase(), normalized, getViewerId() ?? undefined);
  },
};
