/**
 * Contratos da camada de dados.
 * A interface (hooks/páginas) só conhece estes tipos. Hoje eles são implementados por
 * mocks (src/services/mock); depois, por clientes HTTP que falam com o Back_end.
 */
import type {
  AuthSession,
  ChangePasswordInput,
  Comment,
  CreateCommentInput,
  CreateSightingInput,
  CurrentUser,
  FeaturedUser,
  ID,
  LikeResult,
  LoginInput,
  Page,
  PageParams,
  RegionSummary,
  RegisterInput,
  Sighting,
  SightingSearchParams,
  UpdateProfileInput,
  UserProfile,
  UserSummary,
} from '@/types';

export interface AuthService {
  /** POST /auth/login */
  login(input: LoginInput): Promise<AuthSession>;
  /** POST /auth/register */
  register(input: RegisterInput): Promise<AuthSession>;
  /** POST /auth/logout */
  logout(): Promise<void>;
  /** GET /auth/me — recupera a sessão salva ao recarregar a página. */
  restoreSession(): Promise<AuthSession | null>;
  /** PUT /auth/password */
  changePassword(input: ChangePasswordInput): Promise<void>;
}

export interface UserService {
  /** GET /users/:username */
  getProfile(username: string): Promise<UserProfile>;
  /** PATCH /users/me */
  updateProfile(input: UpdateProfileInput): Promise<CurrentUser>;
  /** GET /users?search= */
  search(query: string, limit?: number): Promise<UserSummary[]>;
  /** GET /users/featured */
  getFeatured(limit?: number): Promise<FeaturedUser[]>;
  /** GET /users/availability?username= */
  isUsernameAvailable(username: string): Promise<boolean>;
}

export interface SightingService {
  /** GET /sightings/feed?cursor=&limit= */
  getFeed(params: PageParams): Promise<Page<Sighting>>;
  /** GET /sightings?query=&region=&period=&sort= */
  search(params: SightingSearchParams): Promise<Page<Sighting>>;
  /** GET /users/:id/sightings */
  listByUser(userId: ID, params: PageParams): Promise<Page<Sighting>>;
  /** GET /sightings/:id */
  getById(id: ID): Promise<Sighting>;
  /** POST /sightings */
  create(input: CreateSightingInput): Promise<Sighting>;
  /** DELETE /sightings/:id */
  remove(id: ID): Promise<void>;
  /** PUT (curtir) ou DELETE (descurtir) /sightings/:id/like — idempotente. */
  setLike(id: ID, liked: boolean): Promise<LikeResult>;
  /** GET /regions */
  getRegions(limit?: number): Promise<RegionSummary[]>;
}

export interface CommentService {
  /** GET /sightings/:id/comments */
  list(sightingId: ID): Promise<Comment[]>;
  /** POST /sightings/:id/comments */
  create(input: CreateCommentInput): Promise<Comment>;
  /** DELETE /comments/:id */
  remove(commentId: ID): Promise<void>;
}

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

export interface MediaService {
  /** POST /uploads — no backend real, envia para um storage (S3, Supabase Storage…) e devolve a URL. */
  uploadImage(file: File, options: { kind: 'sighting' | 'avatar' }): Promise<UploadedImage>;
}

/** Existe apenas enquanto os dados são mockados (botão "Restaurar dados de demonstração"). */
export interface DemoDataService {
  reset(): Promise<void>;
}
