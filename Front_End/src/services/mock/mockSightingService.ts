import { getDatabase, transaction } from '@/mocks/db';
import type { SightingRecord } from '@/mocks/records';
import type { Coordinates, RegionSummary, SightingPeriod, SightingSort } from '@/types';
import { DAY_MS, toISODate } from '@/utils/date';
import { createId } from '@/utils/id';
import { isSafeImageUrl } from '@/utils/image';
import { cleanLine, cleanText, normalizeForSearch } from '@/utils/text';
import { hasErrors, validateSightingForm } from '@/utils/validation';
import type { SightingService } from '../contracts';
import { AppError } from '../errors';
import {
  countCommentsBySighting,
  createSightingMapper,
  getViewerId,
  paginate,
  requireViewerId,
  simulateLatency,
} from './support';

const FEED_PAGE_SIZE = 6;
const SEARCH_PAGE_SIZE = 18;
const USER_PAGE_SIZE = 12;

const PERIOD_DAYS: Record<Exclude<SightingPeriod, 'all'>, number> = { '7d': 7, '30d': 30, '365d': 365 };

const byNewest = (a: SightingRecord, b: SightingRecord) => b.createdAt.localeCompare(a.createdAt);

function notFound(): AppError {
  return new AppError('NOT_FOUND', 'Este avistamento não existe ou foi removido.');
}

function sanitizeCoordinates(coordinates: Coordinates | null): Coordinates | null {
  if (!coordinates) return null;
  const { latitude, longitude, accuracy } = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {
    latitude: Math.round(latitude * 1e5) / 1e5,
    longitude: Math.round(longitude * 1e5) / 1e5,
    accuracy: accuracy !== null && Number.isFinite(accuracy) ? Math.round(Math.max(0, accuracy)) : null,
  };
}

export const mockSightingService: SightingService = {
  async getFeed(params) {
    await simulateLatency();
    const db = getDatabase();
    const toSighting = createSightingMapper(db, getViewerId());
    const page = paginate([...db.sightings].sort(byNewest), params, FEED_PAGE_SIZE);
    return { ...page, items: page.items.map(toSighting) };
  },

  async search({ query = '', region = '', period = 'all', sort = 'recent', ...pageParams }) {
    await simulateLatency();
    const db = getDatabase();
    const authors = new Map(db.users.map((user) => [user.id, user]));
    const commentCounts = countCommentsBySighting(db);

    const terms = normalizeForSearch(query).split(/\s+/).filter(Boolean).map((term) => term.replace(/^@+/, ''));
    const regionFilter = normalizeForSearch(region);
    const minDate =
      period !== 'all' && PERIOD_DAYS[period] ? toISODate(new Date(Date.now() - PERIOD_DAYS[period] * DAY_MS)) : null;

    const filtered = db.sightings.filter((sighting) => {
      if (regionFilter && normalizeForSearch(sighting.region) !== regionFilter) return false;
      if (minDate && sighting.sightingDate < minDate) return false;
      if (terms.length === 0) return true;
      const author = authors.get(sighting.authorId);
      const haystack = normalizeForSearch(
        [
          sighting.place,
          sighting.city,
          sighting.region,
          sighting.country,
          sighting.description,
          author?.name ?? '',
          author?.username ?? '',
        ].join(' '),
      );
      return terms.every((term) => haystack.includes(term));
    });

    const comparators: Record<SightingSort, (a: SightingRecord, b: SightingRecord) => number> = {
      recent: byNewest,
      popular: (a, b) =>
        b.likeCount - a.likeCount || (commentCounts.get(b.id) ?? 0) - (commentCounts.get(a.id) ?? 0) || byNewest(a, b),
      discussed: (a, b) =>
        (commentCounts.get(b.id) ?? 0) - (commentCounts.get(a.id) ?? 0) || b.likeCount - a.likeCount || byNewest(a, b),
      'sighting-date': (a, b) =>
        b.sightingDate.localeCompare(a.sightingDate) ||
        (b.sightingTime ?? '').localeCompare(a.sightingTime ?? '') ||
        byNewest(a, b),
    };

    const sorted = filtered.sort(comparators[sort] ?? byNewest);
    const page = paginate(sorted, pageParams, SEARCH_PAGE_SIZE);
    const toSighting = createSightingMapper(db, getViewerId());
    return { ...page, items: page.items.map(toSighting) };
  },

  async listByUser(userId, params) {
    await simulateLatency();
    const db = getDatabase();
    const own = db.sightings.filter((sighting) => sighting.authorId === userId).sort(byNewest);
    const page = paginate(own, params, USER_PAGE_SIZE);
    const toSighting = createSightingMapper(db, getViewerId());
    return { ...page, items: page.items.map(toSighting) };
  },

  async getById(id) {
    await simulateLatency();
    const db = getDatabase();
    const record = db.sightings.find((sighting) => sighting.id === id);
    if (!record) throw notFound();
    return createSightingMapper(db, getViewerId())(record);
  },

  async create(input) {
    await simulateLatency('write');
    const userId = requireViewerId();

    const errors = validateSightingForm(
      {
        description: input.description,
        place: input.location.place,
        city: input.location.city,
        region: input.location.region,
        country: input.location.country,
        sightingDate: input.sightingDate,
        sightingTime: input.sightingTime ?? '',
      },
      { hasPhoto: isSafeImageUrl(input.photo.url) },
    );
    if (hasErrors(errors)) throw new AppError('VALIDATION', 'Revise os campos destacados.', errors);

    const coordinates = sanitizeCoordinates(input.location.coordinates);
    const record: SightingRecord = {
      id: createId('sgt'),
      authorId: userId,
      photoUrl: input.photo.url,
      photoWidth: Math.max(1, Math.round(input.photo.width)),
      photoHeight: Math.max(1, Math.round(input.photo.height)),
      description: cleanText(input.description),
      place: cleanLine(input.location.place),
      city: cleanLine(input.location.city),
      region: cleanLine(input.location.region),
      country: cleanLine(input.location.country),
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      locationAccuracy: coordinates?.accuracy ?? null,
      sightingDate: input.sightingDate,
      sightingTime: input.sightingTime || null,
      createdAt: new Date().toISOString(),
      likeCount: 0,
    };

    transaction(['sightings'], (db) => {
      db.sightings = [record, ...db.sightings];
    });

    return createSightingMapper(getDatabase(), userId)(record);
  },

  async remove(id) {
    const userId = requireViewerId();
    transaction(['sightings', 'comments', 'likes'], (db) => {
      const record = db.sightings.find((sighting) => sighting.id === id);
      if (!record) throw notFound();
      if (record.authorId !== userId) {
        throw new AppError('FORBIDDEN', 'Você só pode excluir os seus próprios avistamentos.');
      }
      db.sightings = db.sightings.filter((sighting) => sighting.id !== id);
      db.comments = db.comments.filter((comment) => comment.sightingId !== id);
      db.likes = db.likes.filter((like) => like.sightingId !== id);
    });
    await simulateLatency('write');
  },

  async setLike(id, liked) {
    const userId = requireViewerId();
    // A alteração é gravada na hora; a latência só atrasa a resposta (como uma API otimista).
    const result = transaction(['sightings', 'likes'], (db) => {
      const record = db.sightings.find((sighting) => sighting.id === id);
      if (!record) throw notFound();

      const alreadyLiked = db.likes.some((like) => like.userId === userId && like.sightingId === id);
      if (alreadyLiked === liked) return { likeCount: record.likeCount, likedByMe: liked };

      const likeCount = Math.max(0, record.likeCount + (liked ? 1 : -1));
      db.likes = liked
        ? [...db.likes, { userId, sightingId: id, createdAt: new Date().toISOString() }]
        : db.likes.filter((like) => !(like.userId === userId && like.sightingId === id));
      db.sightings = db.sightings.map((sighting) => (sighting.id === id ? { ...sighting, likeCount } : sighting));
      return { likeCount, likedByMe: liked };
    });
    await simulateLatency('write');
    return result;
  },

  async getRegions(limit = 10) {
    await simulateLatency();
    const groups = new Map<string, RegionSummary & { latest: string }>();
    for (const sighting of [...getDatabase().sightings].sort(byNewest)) {
      const key = `${sighting.region}|${sighting.country}`;
      const group = groups.get(key);
      if (group) group.count += 1;
      else {
        groups.set(key, {
          region: sighting.region,
          country: sighting.country,
          count: 1,
          coverUrl: sighting.photoUrl,
          latest: sighting.createdAt,
        });
      }
    }
    return [...groups.values()]
      .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest))
      .slice(0, limit)
      .map(({ latest: _latest, ...summary }) => summary);
  },
};
