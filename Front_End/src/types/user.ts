import type { ID, ISODateTime } from './common';

/** Dados públicos mínimos de um usuário, usados em publicações e comentários. */
export interface UserSummary {
  id: ID;
  name: string;
  username: string;
  avatarUrl: string | null;
  isOfficial?: boolean;
}

/** Perfil público completo. */
export interface User extends UserSummary {
  bio: string;
  createdAt: ISODateTime;
}

/** Usuário autenticado: inclui dados privados (e-mail). Nunca exposto para outros usuários. */
export interface CurrentUser extends User {
  email: string;
}

export interface UserStats {
  sightings: number;
  likesReceived: number;
  regions: number;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  /** Regiões (estado/província) onde o usuário já registrou avistamentos. */
  regions: string[];
}

export interface FeaturedUser extends UserSummary {
  sightingsCount: number;
}

export interface UpdateProfileInput {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
}
