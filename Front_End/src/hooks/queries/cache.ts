/**
 * Helpers para atualizar o cache de forma otimista: a interface reage na hora
 * (curtidas, comentários, novas publicações) e o servidor confirma depois.
 */
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Comment, ID, Page, Sighting, UserSummary } from '@/types';
import { queryKeys } from './keys';

type SightingPages = InfiniteData<Page<Sighting>>;

const OPTIMISTIC_PREFIX = 'temp_';

export function isOptimisticId(id: string): boolean {
  return id.startsWith(OPTIMISTIC_PREFIX);
}

export function createOptimisticId(): string {
  return `${OPTIMISTIC_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function isSightingPages(data: unknown): data is SightingPages {
  return typeof data === 'object' && data !== null && Array.isArray((data as SightingPages).pages);
}

function isSighting(data: unknown): data is Sighting {
  return typeof data === 'object' && data !== null && 'photo' in data && 'author' in data && 'id' in data;
}

/** Remove itens repetidos entre páginas (proteção para paginação por deslocamento). */
export function flattenPages(data: SightingPages | undefined): Sighting[] {
  if (!data) return [];
  const seen = new Set<ID>();
  const items: Sighting[] = [];
  for (const page of data.pages) {
    for (const item of page.items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      }
    }
  }
  return items;
}

/** Aplica `updater` nos avistamentos que satisfazem `match`, em todas as listas e detalhes do cache. */
function updateSightings(queryClient: QueryClient, match: (s: Sighting) => boolean, updater: (s: Sighting) => Sighting) {
  queryClient.setQueriesData({ queryKey: queryKeys.sightings.all }, (data: unknown) => {
    if (isSightingPages(data)) {
      let changed = false;
      const pages = data.pages.map((page) => {
        if (!page.items.some(match)) return page;
        changed = true;
        return { ...page, items: page.items.map((item) => (match(item) ? updater(item) : item)) };
      });
      return changed ? { ...data, pages } : data;
    }
    if (isSighting(data) && match(data)) return updater(data);
    return data;
  });
}

export function updateSightingInCache(queryClient: QueryClient, id: ID, updater: (s: Sighting) => Sighting) {
  updateSightings(queryClient, (sighting) => sighting.id === id, updater);
}

export function findSightingInCache(queryClient: QueryClient, id: ID): Sighting | undefined {
  for (const [, data] of queryClient.getQueriesData({ queryKey: queryKeys.sightings.all })) {
    if (isSightingPages(data)) {
      for (const page of data.pages) {
        const found = page.items.find((item) => item.id === id);
        if (found) return found;
      }
    } else if (isSighting(data) && data.id === id) {
      return data;
    }
  }
  return undefined;
}

export function prependToFeed(queryClient: QueryClient, sighting: Sighting) {
  queryClient.setQueryData<SightingPages>(queryKeys.sightings.feed(), (data) => {
    const [first, ...rest] = data?.pages ?? [];
    if (!data || !first) return data;
    return {
      ...data,
      pages: [
        { ...first, items: [sighting, ...first.items.filter((item) => item.id !== sighting.id)], total: first.total + 1 },
        ...rest,
      ],
    };
  });
}

export function removeSightingFromCache(queryClient: QueryClient, id: ID) {
  queryClient.setQueriesData({ queryKey: queryKeys.sightings.all }, (data: unknown) => {
    if (!isSightingPages(data)) return data;
    let changed = false;
    const pages = data.pages.map((page) => {
      if (!page.items.some((item) => item.id === id)) return page;
      changed = true;
      return { ...page, items: page.items.filter((item) => item.id !== id), total: Math.max(0, page.total - 1) };
    });
    return changed ? { ...data, pages } : data;
  });
  // Consultas ainda abertas na tela (ex.: a própria página de detalhe) são descartadas ao sair.
  queryClient.removeQueries({ queryKey: queryKeys.sightings.detail(id), type: 'inactive' });
  queryClient.removeQueries({ queryKey: queryKeys.comments.list(id), type: 'inactive' });
}

/** Atualiza nome/@/avatar do autor em tudo que já está em cache (após editar o perfil). */
export function updateAuthorInCache(queryClient: QueryClient, author: UserSummary) {
  const patchAuthor = <T extends { author: UserSummary }>(item: T): T =>
    item.author.id === author.id ? { ...item, author: { ...item.author, ...author } } : item;

  updateSightings(
    queryClient,
    (sighting) =>
      sighting.author.id === author.id || sighting.recentComments.some((comment) => comment.author.id === author.id),
    (sighting) => ({ ...patchAuthor(sighting), recentComments: sighting.recentComments.map(patchAuthor) }),
  );

  queryClient.setQueriesData({ queryKey: queryKeys.comments.all }, (data: unknown) =>
    Array.isArray(data) && data.some((comment: Comment) => comment.author.id === author.id)
      ? data.map((comment: Comment) => patchAuthor(comment))
      : data,
  );
}
