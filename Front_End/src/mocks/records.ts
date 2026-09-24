/**
 * "Tabelas" do banco mockado.
 * Os registros são planos e normalizados, como linhas de um banco relacional,
 * para facilitar a futura migração para o Prisma/PostgreSQL (ver README).
 */
import type { ID, ISODate, ISODateTime } from '@/types';

export interface UserRecord {
  id: ID;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
  isOfficial: boolean;
  createdAt: ISODateTime;
  passwordHash: string;
  passwordSalt: string;
}

export interface SightingRecord {
  id: ID;
  authorId: ID;
  photoUrl: string;
  photoWidth: number;
  photoHeight: number;
  description: string;
  place: string;
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  sightingDate: ISODate;
  sightingTime: string | null;
  createdAt: ISODateTime;
  /** Contador desnormalizado, como `quantidadeCurtidas` no schema Prisma atual. */
  likeCount: number;
}

export interface CommentRecord {
  id: ID;
  sightingId: ID;
  authorId: ID;
  text: string;
  createdAt: ISODateTime;
}

export interface LikeRecord {
  userId: ID;
  sightingId: ID;
  createdAt: ISODateTime;
}

export interface SessionRecord {
  token: string;
  userId: ID;
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
}

export interface MockDatabase {
  users: UserRecord[];
  sightings: SightingRecord[];
  comments: CommentRecord[];
  likes: LikeRecord[];
  sessions: SessionRecord[];
}

export type TableName = keyof MockDatabase;
