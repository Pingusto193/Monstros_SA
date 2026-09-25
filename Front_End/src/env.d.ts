declare global {
  interface ImportMetaEnv {
    /** Multiplicador da latência simulada dos mocks (0 = instantâneo). */
    readonly VITE_MOCK_LATENCY?: string;
    /** URL da API (Back_end). Se definida, o app usa a API em vez dos mocks. */
    readonly VITE_API_URL?: string;
    /** "true" mostra a conta de demonstração no login também no modo API. */
    readonly VITE_SHOW_DEMO_ACCOUNT?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
