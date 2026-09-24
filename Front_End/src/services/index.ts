/**
 * ============================================================================
 *  PONTO ÚNICO DE TROCA: MOCK → API/BANCO DE DADOS
 * ============================================================================
 *  Toda a interface importa os serviços DESTE arquivo. Para conectar o backend:
 *
 *   1. Crie implementações HTTP em src/services/http/ que satisfaçam as mesmas
 *      interfaces de ./contracts (ex.: `export const httpSightingService: SightingService`).
 *   2. Troque as atribuições abaixo (ex.: `sightingService = httpSightingService`).
 *   3. Defina `demoAccount` e `demoData` como `null`.
 *
 *  Nenhuma página, componente ou hook precisa mudar.
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
import { mockAuthService } from './mock/mockAuthService';
import { mockCommentService } from './mock/mockCommentService';
import { mockDemoDataService } from './mock/mockDemoDataService';
import { mockMediaService } from './mock/mockMediaService';
import { mockSightingService } from './mock/mockSightingService';
import { mockUserService } from './mock/mockUserService';

export const authService: AuthService = mockAuthService;
export const userService: UserService = mockUserService;
export const sightingService: SightingService = mockSightingService;
export const commentService: CommentService = mockCommentService;
export const mediaService: MediaService = mockMediaService;

/** Conta de demonstração exibida na tela de login (somente no modo mock). */
export const demoAccount: LoginInput | null = DEMO_ACCOUNT;

/** Permite restaurar os dados de exemplo (somente no modo mock). */
export const demoData: DemoDataService | null = mockDemoDataService;

export type * from './contracts';
export { AppError, getErrorMessage, isAppError } from './errors';
