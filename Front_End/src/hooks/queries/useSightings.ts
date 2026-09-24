import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage, mediaService, sightingService } from '@/services';
import type { ID, Sighting, SightingLocation } from '@/types';
import {
  findSightingInCache,
  prependToFeed,
  removeSightingFromCache,
  updateSightingInCache,
} from './cache';
import { queryKeys, type SightingFilters } from './keys';

const firstPage = null as string | null;

// ---------- Consultas ----------

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.sightings.feed(),
    queryFn: ({ pageParam }) => sightingService.getFeed({ cursor: pageParam }),
    initialPageParam: firstPage,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useSightingSearch(filters: SightingFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.sightings.search(filters),
    queryFn: ({ pageParam }) => sightingService.search({ ...filters, cursor: pageParam }),
    initialPageParam: firstPage,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // Mantém os resultados anteriores visíveis enquanto os novos filtros carregam.
    placeholderData: keepPreviousData,
  });
}

export function useUserSightings(userId: ID | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.sightings.byUser(userId ?? ''),
    queryFn: ({ pageParam }) => sightingService.listByUser(userId ?? '', { cursor: pageParam }),
    initialPageParam: firstPage,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(userId),
  });
}

export function useSighting(id: ID | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.sightings.detail(id ?? ''),
    queryFn: () => sightingService.getById(id ?? ''),
    enabled: Boolean(id),
    // Vindo do feed/explorar, mostra os dados que já temos enquanto busca a versão completa.
    placeholderData: () => (id ? findSightingInCache(queryClient, id) : undefined),
  });
}

export function useRegions() {
  return useQuery({
    queryKey: queryKeys.sightings.regions(),
    queryFn: () => sightingService.getRegions(12),
    staleTime: 60_000,
  });
}

// ---------- Mutações ----------

/**
 * Curtir/descurtir com atualização otimista. As chamadas de um mesmo avistamento
 * são enfileiradas (scope) para que cliques rápidos não cheguem fora de ordem.
 */
export function useToggleLike(sightingId: ID) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutationKey = ['like', sightingId];

  return useMutation({
    mutationKey,
    scope: { id: `like:${sightingId}` },
    mutationFn: (liked: boolean) => sightingService.setLike(sightingId, liked),
    onMutate: (liked) => {
      updateSightingInCache(queryClient, sightingId, (sighting) =>
        sighting.likedByMe === liked
          ? sighting
          : { ...sighting, likedByMe: liked, likeCount: Math.max(0, sighting.likeCount + (liked ? 1 : -1)) },
      );
    },
    onSuccess: (result) => {
      // Só aplica a resposta do servidor se não houver outro clique pendente.
      if (queryClient.isMutating({ mutationKey }) <= 1) {
        updateSightingInCache(queryClient, sightingId, (sighting) => ({
          ...sighting,
          likedByMe: result.likedByMe,
          likeCount: result.likeCount,
        }));
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profiles(), refetchType: 'none' });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Não foi possível atualizar a curtida.'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all });
    },
  });
}

export interface CreateSightingPayload {
  file: File;
  description: string;
  location: SightingLocation;
  sightingDate: string;
  sightingTime: string | null;
}

export function useCreateSighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, ...data }: CreateSightingPayload): Promise<Sighting> => {
      const photo = await mediaService.uploadImage(file, { kind: 'sighting' });
      return sightingService.create({ ...data, photo });
    },
    onSuccess: (sighting) => {
      prependToFeed(queryClient, sighting);
      queryClient.setQueryData(queryKeys.sightings.detail(sighting.id), sighting);
      void queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all, refetchType: 'none' });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all, refetchType: 'none' });
    },
  });
}

export function useDeleteSighting(options: { onDeleted?: (id: ID) => void } = {}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: ID) => sightingService.remove(id),
    onSuccess: (_result, id) => {
      options.onDeleted?.(id);
      removeSightingFromCache(queryClient, id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all, refetchType: 'none' });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('Avistamento excluído.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Não foi possível excluir o avistamento.'));
    },
  });
}
