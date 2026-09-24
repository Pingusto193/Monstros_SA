import { Navigate, Outlet, ScrollRestoration, useLocation, type Location } from 'react-router';
import { SplashScreen } from '@/components/feedback/LoadingState';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import { paths } from '@/utils/routes';

/** /perfil → redireciona para o perfil de quem está logado. */
export function MyProfileRedirect() {
  const user = useCurrentUser();
  return <Navigate to={paths.profile(user.username)} replace />;
}

/** Raiz de todas as rotas: restaura a rolagem ao navegar. */
export function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

/** Só deixa passar quem está logado; os demais vão para o login (guardando a página pedida). */
export function ProtectedRoute() {
  const { status, loggedOutByUser } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <SplashScreen />;
  if (status === 'guest') {
    return <Navigate to={paths.login} replace state={loggedOutByUser ? undefined : { from: location }} />;
  }
  return <Outlet />;
}

function getRedirectTarget(state: unknown): string {
  const from = (state as { from?: Location } | null)?.from;
  if (!from?.pathname || !from.pathname.startsWith('/') || from.pathname.startsWith('//')) return paths.home;
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
}

/** Login e cadastro: quem já está logado é levado para o app. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <SplashScreen />;
  if (status === 'authenticated') return <Navigate to={getRedirectTarget(location.state)} replace />;
  return <Outlet />;
}
