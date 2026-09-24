import { use } from 'react';
import { AuthContext } from '@/context/contexts';
import type { CurrentUser } from '@/types';

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return context;
}

/** Para páginas protegidas: garante que existe um usuário logado. */
export function useCurrentUser(): CurrentUser {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser só pode ser usado em rotas protegidas.');
  return user;
}
