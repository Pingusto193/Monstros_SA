import type { Comment } from './comment';
import type { ID, ISODate, ISODateTime, PageParams } from './common';
import type { UserSummary } from './user';

export interface Coordinates {
  latitude: number;
  longitude: number;
  /** Precisão em metros informada pelo GPS, quando disponível. */
  accuracy: number | null;
}

export interface SightingLocation {
  /** Ponto de referência: trilha, parque, lago… */
  place: string;
  city: string;
  /** Estado, província ou região. */
  region: string;
  country: string;
  coordinates: Coordinates | null;
}

export interface SightingPhoto {
  url: string;
  width: number;
  height: number;
}

/** Publicação de avistamento, já "montada" para a interface (autor + contadores). */
export interface Sighting {
  id: ID;
  author: UserSummary;
  photo: SightingPhoto;
  description: string;
  location: SightingLocation;
  sightingDate: ISODate;
  /** Horário local no formato HH:mm, opcional. */
  sightingTime: string | null;
  createdAt: ISODateTime;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  /** Até 2 comentários mais recentes, para a prévia do feed. */
  recentComments: Comment[];
}

export interface CreateSightingInput {
  photo: SightingPhoto;
  description: string;
  location: SightingLocation;
  sightingDate: ISODate;
  sightingTime: string | null;
}

export type SightingSort = 'recent' | 'popular' | 'discussed' | 'sighting-date';
export type SightingPeriod = 'all' | '7d' | '30d' | '365d';

export interface SightingSearchParams extends PageParams {
  query?: string;
  region?: string;
  period?: SightingPeriod;
  sort?: SightingSort;
}

export interface RegionSummary {
  region: string;
  country: string;
  count: number;
  coverUrl: string | null;
}

export interface LikeResult {
  likeCount: number;
  likedByMe: boolean;
}
