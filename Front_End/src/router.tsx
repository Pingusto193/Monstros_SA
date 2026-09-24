import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { SplashScreen } from '@/components/feedback/LoadingState';
import type { RouteHandle } from '@/components/navigation/navigation';
import { RouteErrorBoundary } from '@/components/routing/RouteErrorBoundary';
import {
  MyProfileRedirect,
  ProtectedRoute,
  PublicOnlyRoute,
  RootLayout,
} from '@/components/routing/RouteGuards';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import FeedPage from '@/pages/feed/FeedPage';

/** Carrega a página sob demanda (divide o JavaScript por rota). */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default });
}

const handle = (value: RouteHandle) => value;

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    HydrateFallback: SplashScreen,
    children: [
      // Rotas públicas
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', lazy: page(() => import('@/pages/auth/LoginPage')) },
              { path: 'cadastro', lazy: page(() => import('@/pages/auth/RegisterPage')) },
            ],
          },
        ],
      },

      // Rotas protegidas (exigem login)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <FeedPage /> },
              {
                path: 'explorar',
                lazy: page(() => import('@/pages/explore/ExplorePage')),
                handle: handle({ title: 'Explorar' }),
              },
              {
                path: 'registrar',
                lazy: page(() => import('@/pages/sighting/CreateSightingPage')),
                handle: handle({ title: 'Registrar avistamento', back: true }),
              },
              {
                path: 'avistamento/:sightingId',
                lazy: page(() => import('@/pages/sighting/SightingPage')),
                handle: handle({ title: 'Avistamento', back: true }),
              },
              { path: 'perfil', element: <MyProfileRedirect /> },
              {
                path: 'perfil/:username',
                lazy: page(() => import('@/pages/profile/ProfilePage')),
                handle: handle({ title: (params) => `@${params.username ?? ''}`, back: true }),
              },
              {
                path: 'configuracoes',
                lazy: page(() => import('@/pages/settings/SettingsLayout')),
                handle: handle({ title: 'Configurações', back: true }),
                children: [
                  { index: true, element: <Navigate to="perfil" replace /> },
                  { path: 'perfil', lazy: page(() => import('@/pages/settings/EditProfilePage')) },
                  { path: 'aparencia', lazy: page(() => import('@/pages/settings/AppearancePage')) },
                  { path: 'conta', lazy: page(() => import('@/pages/settings/AccountPage')) },
                ],
              },
              {
                path: '*',
                lazy: page(() => import('@/pages/NotFoundPage')),
                handle: handle({ title: 'Página não encontrada', back: true }),
              },
            ],
          },
        ],
      },
    ],
  },
]);
