import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { mediaService, userService } from '@/services';
import { normalizeUsername, validateUsername } from '@/utils/validation';
import { updateAuthorInCache } from './cache';
import { queryKeys } from './keys';

export function useProfile(username: string | undefined) {
  const normalized = normalizeUsername(username ?? '');
  return useQuery({
    queryKey: queryKeys.users.profile(normalized),
    queryFn: () => userService.getProfile(normalized),
    enabled: normalized.length > 0,
  });
}

export function useUserSearch(query: string) {
  const term = query.trim();
  return useQuery({
    queryKey: queryKeys.users.search(term),
    queryFn: () => userService.search(term, 8),
    enabled: term.replace(/^@+/, '').length >= 2,
    placeholderData: keepPreviousData,
  });
}

export function useFeaturedUsers() {
  return useQuery({
    queryKey: queryKeys.users.featured(),
    queryFn: () => userService.getFeatured(5),
    staleTime: 60_000,
  });
}

export type UsernameStatus = 'idle' | 'invalid' | 'unchanged' | 'checking' | 'available' | 'taken';

/** Verifica (com atraso) se o nome de usuário está livre enquanto a pessoa digita. */
export function useUsernameAvailability(value: string, currentUsername?: string): UsernameStatus {
  const normalized = normalizeUsername(value);
  const debounced = useDebouncedValue(normalized, 400);
  const invalid = normalized.length > 0 && validateUsername(normalized) !== null;
  const unchanged = currentUsername !== undefined && normalized === currentUsername;

  const query = useQuery({
    queryKey: queryKeys.users.usernameAvailability(debounced),
    queryFn: () => userService.isUsernameAvailable(debounced),
    enabled: debounced.length > 0 && debounced === normalized && !invalid && !unchanged,
    staleTime: 10_000,
  });

  if (!normalized) return 'idle';
  if (invalid) return 'invalid';
  if (unchanged) return 'unchanged';
  if (debounced !== normalized || query.isFetching) return 'checking';
  if (query.data === true) return 'available';
  if (query.data === false) return 'taken';
  return 'idle';
}

export type AvatarChange = { type: 'keep' } | { type: 'remove' } | { type: 'replace'; file: File };

export interface UpdateProfilePayload {
  name: string;
  username: string;
  bio: string;
  avatar: AvatarChange;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  return useMutation({
    mutationFn: async ({ avatar, ...values }: UpdateProfilePayload) => {
      let avatarUrl = user?.avatarUrl ?? null;
      if (avatar.type === 'remove') avatarUrl = null;
      if (avatar.type === 'replace') avatarUrl = (await mediaService.uploadImage(avatar.file, { kind: 'avatar' })).url;
      return userService.updateProfile({ ...values, avatarUrl });
    },
    onSuccess: (updated) => {
      updateUser(updated);
      updateAuthorInCache(queryClient, {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        avatarUrl: updated.avatarUrl,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
