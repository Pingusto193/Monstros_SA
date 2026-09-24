import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { commentService, getErrorMessage } from '@/services';
import type { Comment, ID } from '@/types';
import { cleanText } from '@/utils/text';
import { createOptimisticId, updateSightingInCache } from './cache';
import { queryKeys } from './keys';

export function useComments(sightingId: ID | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.list(sightingId ?? ''),
    queryFn: () => commentService.list(sightingId ?? ''),
    enabled: Boolean(sightingId),
  });
}

/** Publica um comentário: aparece na hora (otimista) e é confirmado em seguida. */
export function useAddComment(sightingId: ID) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();
  const listKey = queryKeys.comments.list(sightingId);

  return useMutation({
    mutationFn: (text: string) => commentService.create({ sightingId, text }),
    onMutate: async (text) => {
      if (!user) return { optimisticId: null };
      const optimistic: Comment = {
        id: createOptimisticId(),
        sightingId,
        author: { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl },
        text: cleanText(text),
        createdAt: new Date().toISOString(),
      };
      // Evita que uma busca em andamento sobrescreva o comentário otimista.
      if (queryClient.getQueryData(listKey)) await queryClient.cancelQueries({ queryKey: listKey });
      queryClient.setQueryData<Comment[]>(listKey, (current) => (current ? [...current, optimistic] : current));
      updateSightingInCache(queryClient, sightingId, (sighting) => ({
        ...sighting,
        commentCount: sighting.commentCount + 1,
        recentComments: [...sighting.recentComments, optimistic].slice(-2),
      }));
      return { optimisticId: optimistic.id };
    },
    onSuccess: (comment, _text, context) => {
      const replace = (item: Comment) => (item.id === context?.optimisticId ? comment : item);
      queryClient.setQueryData<Comment[]>(listKey, (current) => current?.map(replace));
      updateSightingInCache(queryClient, sightingId, (sighting) => ({
        ...sighting,
        recentComments: sighting.recentComments.map(replace),
      }));
    },
    onError: (error, _text, context) => {
      const keep = (item: Comment) => item.id !== context?.optimisticId;
      queryClient.setQueryData<Comment[]>(listKey, (current) => current?.filter(keep));
      updateSightingInCache(queryClient, sightingId, (sighting) => ({
        ...sighting,
        commentCount: Math.max(0, sighting.commentCount - (context?.optimisticId ? 1 : 0)),
        recentComments: sighting.recentComments.filter(keep),
      }));
      toast.error(getErrorMessage(error, 'Não foi possível publicar o comentário.'));
    },
  });
}

export function useDeleteComment(sightingId: ID) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const listKey = queryKeys.comments.list(sightingId);

  return useMutation({
    mutationFn: (commentId: ID) => commentService.remove(commentId),
    onMutate: (commentId) => {
      queryClient.setQueryData<Comment[]>(listKey, (current) => current?.filter((item) => item.id !== commentId));
      updateSightingInCache(queryClient, sightingId, (sighting) => ({
        ...sighting,
        commentCount: Math.max(0, sighting.commentCount - 1),
        recentComments: sighting.recentComments.filter((item) => item.id !== commentId),
      }));
    },
    onSuccess: () => {
      toast.success('Comentário excluído.');
      // A prévia do feed pode precisar do comentário anterior; busca de novo em segundo plano.
      void queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Não foi possível excluir o comentário.'));
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all });
    },
  });
}
