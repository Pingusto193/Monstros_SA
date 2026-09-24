/**
 * Acesso seguro ao localStorage, com prefixo do app.
 * Se o navegador bloquear o armazenamento (modo privado, cota, políticas),
 * cai para um Map em memória para que a aplicação continue funcionando.
 */

const PREFIX = 'rastro:';
const memoryFallback = new Map<string, string>();

function resolveStorage(): Storage | null {
  try {
    const probe = `${PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

const backend = resolveStorage();

export const storage = {
  get(key: string): string | null {
    try {
      return backend ? backend.getItem(PREFIX + key) : (memoryFallback.get(key) ?? null);
    } catch {
      return null;
    }
  },

  /** Pode lançar QuotaExceededError — quem chama decide como tratar. */
  set(key: string, value: string): void {
    if (backend) backend.setItem(PREFIX + key, value);
    else memoryFallback.set(key, value);
  },

  remove(key: string): void {
    try {
      if (backend) backend.removeItem(PREFIX + key);
      else memoryFallback.delete(key);
    } catch {
      // Ignorado: remover uma chave inexistente/inacessível não é crítico.
    }
  },

  readJSON<T>(key: string): T | null {
    const raw = this.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  writeJSON(key: string, value: unknown): void {
    this.set(key, JSON.stringify(value));
  },

  isPersistent(): boolean {
    return backend !== null;
  },
};

export function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}
