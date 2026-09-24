import { generateSalt, hashPassword } from '@/utils/crypto/password';
import type { CommentRecord, LikeRecord, MockDatabase, SightingRecord, UserRecord } from '../records';
import { SEED_COMMENTS } from './comments';
import { createSeedClock, unsplashAvatar, unsplashPhoto } from './helpers';
import { SEED_SIGHTINGS } from './sightings';
import { DEMO_PASSWORD, SEED_USERS } from './users';

const MINUTE_MS = 60_000;

export { DEMO_ACCOUNT } from './users';

/** Monta o banco inicial com usuários, avistamentos, comentários e curtidas de exemplo. */
export function buildSeedDatabase(now = Date.now()): MockDatabase {
  const clock = createSeedClock(now);

  const users: UserRecord[] = SEED_USERS.map((seed) => {
    const salt = generateSalt();
    return {
      id: seed.id,
      name: seed.name,
      username: seed.username,
      email: seed.email,
      bio: seed.bio,
      avatarUrl: !seed.avatar
        ? null
        : 'unsplash' in seed.avatar
          ? unsplashAvatar(seed.avatar.unsplash)
          : seed.avatar.path,
      isOfficial: seed.isOfficial ?? false,
      createdAt: clock.ago({ days: seed.joinedDaysAgo }),
      passwordSalt: salt,
      passwordHash: hashPassword(DEMO_PASSWORD, salt),
    };
  });

  const sightings: SightingRecord[] = SEED_SIGHTINGS.map((seed) => {
    const photo = unsplashPhoto(seed.photo.unsplash, seed.photo.aspect);
    return {
      id: seed.id,
      authorId: seed.authorId,
      photoUrl: photo.url,
      photoWidth: photo.width,
      photoHeight: photo.height,
      description: seed.description,
      place: seed.place,
      city: seed.city,
      region: seed.region,
      country: seed.country,
      latitude: seed.coordinates?.[0] ?? null,
      longitude: seed.coordinates?.[1] ?? null,
      locationAccuracy: seed.coordinates?.[2] ?? null,
      sightingDate: clock.dateAgo(seed.sightingDaysAgo),
      sightingTime: seed.sightingTime,
      createdAt: clock.ago(seed.posted),
      likeCount: seed.likeCount,
    };
  });

  const postedAt = new Map(sightings.map((sighting) => [sighting.id, Date.parse(sighting.createdAt)]));

  const comments: CommentRecord[] = SEED_COMMENTS.map((seed, index) => {
    const base = postedAt.get(seed.sightingId) ?? now;
    // Nunca no futuro: comentários de posts recentes ficam limitados a "alguns minutos atrás".
    const createdAt = Math.min(base + seed.after * MINUTE_MS, now - (SEED_COMMENTS.length - index) * MINUTE_MS);
    return {
      id: `cmt_seed_${String(index + 1).padStart(3, '0')}`,
      sightingId: seed.sightingId,
      authorId: seed.authorId,
      text: seed.text,
      createdAt: new Date(createdAt).toISOString(),
    };
  });

  const likes: LikeRecord[] = SEED_SIGHTINGS.flatMap((seed) =>
    seed.likedBy.map((userId, index) => ({
      userId,
      sightingId: seed.id,
      createdAt: new Date((postedAt.get(seed.id) ?? now) + (index + 1) * 7 * MINUTE_MS).toISOString(),
    })),
  );

  return { users, sightings, comments, likes, sessions: [] };
}
