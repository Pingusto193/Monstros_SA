/**
 * ============================================================================
 *  PONTO ÚNICO DE TROCA: MOCK ↔ API
 * ============================================================================
 *  Toda a interface importa os serviços DESTE arquivo.
 *
 *  - Sem VITE_API_URL → modo mock: tudo roda no navegador (localStorage).
 *  - Com VITE_API_URL → modo API: fala com o Back_end (Express + Prisma + PostgreSQL).
 *
 *  Nenhuma página, componente ou hook muda entre os dois modos.
 * ============================================================================
 */
import { DEMO_ACCOUNT } from '@/mocks/seed';
import type { LoginInput } from '@/types';
import type {
  AuthService,
  CommentService,
  DemoDataService,
  MediaService,
  SightingService,
  UserService,
} from './contracts';
import {
  httpAuthService,
  httpCommentService,
  httpMediaService,
  httpSightingService,
  httpUserService,
} from './http/httpServices';
import { mockAuthService } from './mock/mockAuthService';
import { mockCommentService } from './mock/mockCommentService';
import { mockDemoDataService } from './mock/mockDemoDataService';
import { mockMediaService } from './mock/mockMediaService';
import { mockSightingService } from './mock/mockSightingService';
import { mockUserService } from './mock/mockUserService';

export const dataSource: 'api' | 'mock' = import.meta.env.VITE_API_URL ? 'api' : 'mock';
const useApi = dataSource === 'api';

export const authService: AuthService = useApi ? httpAuthService : mockAuthService;
export const userService: UserService = useApi ? httpUserService : mockUserService;
export const sightingService: SightingService = useApi ? httpSightingService : mockSightingService;
export const commentService: CommentService = useApi ? httpCommentService : mockCommentService;
export const mediaService: MediaService = useApi ? httpMediaService : mockMediaService;

/**
 * Conta de demonstração exibida na tela de login. No modo API ela só aparece com
 * VITE_SHOW_DEMO_ACCOUNT=true (em um site público, qualquer pessoa poderia alterá-la).
 */
export const demoAccount: LoginInput | null =
  !useApi || import.meta.env.VITE_SHOW_DEMO_ACCOUNT === 'true' ? DEMO_ACCOUNT : null;

/** Restaurar dados de exemplo só existe no modo mock. */
export const demoData: DemoDataService | null = useApi ? null : mockDemoDataService;

export type * from './contracts';
export { AppError, getErrorMessage, isAppError } from './errors';
