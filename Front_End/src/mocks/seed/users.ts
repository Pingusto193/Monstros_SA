/** Usuários de exemplo. Todos usam a mesma senha de demonstração (armazenada apenas como hash). */

export const DEMO_PASSWORD = 'pegada123';

export const DEMO_ACCOUNT = {
  email: 'victor@rastro.app',
  password: DEMO_PASSWORD,
};

export interface SeedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  /** ID da foto no Unsplash ou caminho local em /public. */
  avatar: { unsplash: string } | { path: string } | null;
  isOfficial?: boolean;
  joinedDaysAgo: number;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'usr_victor',
    name: 'Victor Oliveira',
    username: 'victor',
    email: 'victor@rastro.app',
    bio: 'Explorando relatos e possíveis evidências do desconhecido.',
    avatar: null,
    joinedDaysAgo: 40,
  },
  {
    id: 'usr_marina',
    name: 'Marina Castilho',
    username: 'marina.trilhas',
    email: 'marina@rastro.app',
    bio: 'Guia de trilhas no noroeste do Pacífico. Câmera sempre ligada, olhos na linha das árvores.',
    avatar: { unsplash: '1544005313-94ddf0286df2' },
    joinedDaysAgo: 412,
  },
  {
    id: 'usr_lucas',
    name: 'Lucas Andrade',
    username: 'lucas.pegadas',
    email: 'lucas@rastro.app',
    bio: 'Moldes de gesso, fita métrica e paciência. Pesquisador amador desde 2014.',
    avatar: { unsplash: '1506794778202-cad84cf45f1d' },
    joinedDaysAgo: 388,
  },
  {
    id: 'usr_aiyana',
    name: 'Aiyana Brooks',
    username: 'aiyana.bc',
    email: 'aiyana@rastro.app',
    bio: 'Colúmbia Britânica. Cresci ouvindo histórias sobre quem vive além da última trilha.',
    avatar: { unsplash: '1488426862026-3ee34a7d66df' },
    joinedDaysAgo: 301,
  },
  {
    id: 'usr_rafael',
    name: 'Rafael Nunes',
    username: 'rafa.nomade',
    email: 'rafael@rastro.app',
    bio: 'Fotógrafo de natureza. Nem tudo que aparece na foto eu consigo explicar.',
    avatar: { unsplash: '1522075469751-3a6694fb2f61' },
    joinedDaysAgo: 265,
  },
  {
    id: 'usr_helena',
    name: 'Helena Duarte',
    username: 'helena.bio',
    email: 'helena@rastro.app',
    bio: 'Bióloga de campo. Cética por profissão, curiosa por natureza.',
    avatar: { unsplash: '1508214751196-bcfd4ca60f91' },
    joinedDaysAgo: 350,
  },
  {
    id: 'usr_tom',
    name: 'Tom Becker',
    username: 'tom.montana',
    email: 'tom@rastro.app',
    bio: 'Montana. Vinte invernos na mata e algumas perguntas sem resposta.',
    avatar: { unsplash: '1552058544-f2b08422138a' },
    joinedDaysAgo: 198,
  },
  {
    id: 'usr_clara',
    name: 'Clara Menezes',
    username: 'clara.sons',
    email: 'clara@rastro.app',
    bio: 'Gravo paisagens sonoras na floresta. Alguns sons não deveriam existir.',
    avatar: { unsplash: '1438761681033-6461ffad8d80' },
    joinedDaysAgo: 240,
  },
  {
    id: 'usr_ethan',
    name: 'Ethan Clearwater',
    username: 'ethan.cascades',
    email: 'ethan@rastro.app',
    bio: 'Engenheiro florestal nas Cascatas. Só relato o que vi com os próprios olhos.',
    avatar: { unsplash: '1531427186611-ecfd6d936c79' },
    joinedDaysAgo: 176,
  },
  {
    id: 'usr_noah',
    name: 'Noah Tremblay',
    username: 'noah.tremblay',
    email: 'noah@rastro.app',
    bio: 'Canadense, campista e insone. A Ilha de Vancouver é outro planeta.',
    avatar: { unsplash: '1539571696357-5a69c17a67c6' },
    joinedDaysAgo: 150,
  },
  {
    id: 'usr_rastro',
    name: 'Equipe Rastro',
    username: 'rastro',
    email: 'equipe@rastro.app',
    bio: 'Conta oficial. Guias de campo, expedições da comunidade e boas práticas para registrar avistamentos.',
    avatar: { path: '/brand/rastro-avatar.svg' },
    isOfficial: true,
    joinedDaysAgo: 500,
  },
];
