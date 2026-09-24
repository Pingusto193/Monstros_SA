declare global {
  interface ImportMetaEnv {
    /** Multiplicador da latência simulada dos mocks (0 = instantâneo). */
    readonly VITE_MOCK_LATENCY?: string;
    /** URL da futura API (ainda não utilizada). */
    readonly VITE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
