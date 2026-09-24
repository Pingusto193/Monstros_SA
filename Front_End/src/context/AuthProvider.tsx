import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onUnauthorized } from '@/hooks/queries/queryClient';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services';
import type { CurrentUser, LoginInput, RegisterInput } from '@/types';
import { AuthContext, type AuthContextValue, type AuthStatus } from './contexts';

interface AuthState {
  status: AuthStatus;
  user: CurrentUser | null;
}

/**
 * Mantém a sessão do usuário. Toda a lógica de autenticação real fica no authService
 * (mock hoje, API amanhã) — este provider só guarda o estado para a interface.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [state, setState] = useState<AuthState>({ status: 'checking', user: null });
  const [loggedOutByUser, setLoggedOutByUser] = useState(false);

  // Restaura a sessão salva ao abrir/recarregar a página.
  useEffect(() => {
    let active = true;
    authService
      .restoreSession()
      .then((session) => {
        if (active) setState(session ? { status: 'authenticated', user: session.user } : { status: 'guest', user: null });
      })
      .catch(() => {
        if (active) setState({ status: 'guest', user: null });
      });
    return () => {
      active = false;
    };
  }, []);

  const startSession = useCallback(
    (user: CurrentUser) => {
      queryClient.clear();
      setLoggedOutByUser(false);
      setState({ status: 'authenticated', user });
      return user;
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginInput) => startSession((await authService.login(input)).user),
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => startSession((await authService.register(input)).user),
    [startSession],
  );

  const logout = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      await authService.logout();
      queryClient.clear();
      setLoggedOutByUser(true);
      setState({ status: 'guest', user: null });
      if (!silent) toast.info('Você saiu da sua conta.');
    },
    [queryClient, toast],
  );

  const updateUser = useCallback((user: CurrentUser) => {
    setState((current) => (current.status === 'authenticated' ? { ...current, user } : current));
  }, []);

  // Se alguma chamada responder "não autorizado" (sessão expirada), encerra a sessão local.
  const statusRef = useRef(state.status);
  useEffect(() => {
    statusRef.current = state.status;
  }, [state.status]);

  useEffect(
    () =>
      onUnauthorized(() => {
        if (statusRef.current !== 'authenticated') return;
        statusRef.current = 'guest';
        void authService.logout();
        queryClient.clear();
        setState({ status: 'guest', user: null });
        toast.error('Sua sessão expirou. Entre novamente.');
      }),
    [queryClient, toast],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loggedOutByUser, login, register, logout, updateUser }),
    [state, loggedOutByUser, login, register, logout, updateUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
