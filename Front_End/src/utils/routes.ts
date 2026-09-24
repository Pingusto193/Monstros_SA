/** Caminhos das rotas em um só lugar, para não espalhar strings pela interface. */
export const paths = {
  home: '/',
  login: '/login',
  register: '/cadastro',
  explore: '/explorar',
  createSighting: '/registrar',
  settings: '/configuracoes',
  editProfile: '/configuracoes/perfil',
  appearance: '/configuracoes/aparencia',
  account: '/configuracoes/conta',
  sighting: (id: string) => `/avistamento/${encodeURIComponent(id)}`,
  profile: (username: string) => `/perfil/${encodeURIComponent(username)}`,
  exploreRegion: (region: string) => `/explorar?regiao=${encodeURIComponent(region)}`,
  exploreSearch: (query: string) => `/explorar?q=${encodeURIComponent(query)}`,
};
