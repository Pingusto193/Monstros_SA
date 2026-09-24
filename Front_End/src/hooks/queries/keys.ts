import type { ID, SightingSearchParams } from '@/types';

export type SightingFilters = Omit<SightingSearchParams, 'cursor' | 'limit'>;

/** Chaves do cache do TanStack Query, centralizadas para invalidar com precisão. */
export const queryKeys = {
  sightings: {
    all: ['sightings'] as const,
    feed: () => ['sightings', 'feed'] as const,
    search: (filters: SightingFilters) => ['sightings', 'search', filters] as const,
    byUser: (userId: ID) => ['sightings', 'user', userId] as const,
    detail: (id: ID) => ['sightings', 'detail', id] as const,
    regions: () => ['sightings', 'regions'] as const,
  },
  comments: {
    all: ['comments'] as const,
    list: (sightingId: ID) => ['comments', sightingId] as const,
  },
  users: {
    all: ['users'] as const,
    profiles: () => ['users', 'profile'] as const,
    profile: (username: string) => ['users', 'profile', username] as const,
    search: (query: string) => ['users', 'search', query] as const,
    featured: () => ['users', 'featured'] as const,
    usernameAvailability: (username: string) => ['users', 'username-availability', username] as const,
  },
};
