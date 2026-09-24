import { storage } from '@/utils/storage';

const KEY = 'session';

/**
 * Guarda o token da sessão. O mock usa este token para identificar o usuário;
 * a futura API vai recebê-lo no cabeçalho Authorization (ou trocar por cookie httpOnly).
 */
export const tokenStorage = {
  get(): string | null {
    return storage.get(KEY);
  },
  set(token: string): void {
    try {
      storage.set(KEY, token);
    } catch {
      // Sem armazenamento: a sessão vale só até recarregar a página.
    }
  },
  clear(): void {
    storage.remove(KEY);
  },
};
