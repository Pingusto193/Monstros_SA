import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAppError } from '@/services';

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Permite que o AuthProvider reaja quando qualquer chamada responder "não autorizado". */
export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function notifyIfUnauthorized(error: unknown) {
  if (isAppError(error, 'UNAUTHORIZED')) unauthorizedListeners.forEach((listener) => listener());
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notifyIfUnauthorized }),
  mutationCache: new MutationCache({ onError: notifyIfUnauthorized }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isAppError(error) && ['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN'].includes(error.code)) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});
