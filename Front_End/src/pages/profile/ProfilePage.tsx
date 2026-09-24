import { Camera, Grid3x3, SquarePlus, UserRoundX } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ProfileHeader, ProfileHeaderSkeleton } from '@/components/profile/ProfileHeader';
import { SightingGrid, SightingGridSkeleton } from '@/components/sighting/SightingGrid';
import { ButtonLink } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { flattenPages } from '@/hooks/queries/cache';
import { useUserSightings } from '@/hooks/queries/useSightings';
import { useProfile } from '@/hooks/queries/useUsers';
import { useCurrentUser } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { isAppError } from '@/services';
import { paths } from '@/utils/routes';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { username = '' } = useParams();
  const currentUser = useCurrentUser();
  const profile = useProfile(username);
  const userId = profile.data?.user.id;
  const sightings = useUserSightings(userId);
  const items = useMemo(() => flattenPages(sightings.data), [sightings.data]);
  const isOwnProfile = userId === currentUser.id;

  useDocumentTitle(profile.data ? `${profile.data.user.name} (@${profile.data.user.username})` : 'Perfil');

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => void sightings.fetchNextPage(),
    enabled: Boolean(sightings.hasNextPage) && !sightings.isFetchingNextPage,
  });

  if (profile.isPending) {
    return (
      <div className={styles.page}>
        <ProfileHeaderSkeleton />
        <SightingGridSkeleton count={6} />
      </div>
    );
  }

  if (profile.isError) {
    return isAppError(profile.error, 'NOT_FOUND') ? (
      <EmptyState
        icon={<UserRoundX size={28} />}
        title="Perfil não encontrado"
        description={`Não existe ninguém com o usuário @${username}. Talvez o nome tenha mudado.`}
        action={<ButtonLink to={paths.explore}>Explorar avistamentos</ButtonLink>}
      />
    ) : (
      <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />
    );
  }

  return (
    <div className={styles.page}>
      <ProfileHeader profile={profile.data} isOwnProfile={isOwnProfile} />

      <div className={styles.tabs} role="presentation">
        <h2 className={styles.tab}>
          <Grid3x3 size={14} aria-hidden="true" />
          Avistamentos
        </h2>
      </div>

      {sightings.isPending ? (
        <SightingGridSkeleton count={6} />
      ) : sightings.isError ? (
        <ErrorState error={sightings.error} onRetry={() => void sightings.refetch()} compact />
      ) : items.length === 0 ? (
        isOwnProfile ? (
          <EmptyState
            icon={<Camera size={28} />}
            title="Você ainda não registrou avistamentos"
            description="Quando você publicar um relato, ele aparece aqui no seu perfil."
            action={
              <ButtonLink to={paths.createSighting} icon={<SquarePlus size={18} />}>
                Registrar avistamento
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={<Camera size={28} />}
            title="Nenhum avistamento publicado"
            description={`@${profile.data.user.username} ainda não compartilhou relatos.`}
          />
        )
      ) : (
        <>
          <SightingGrid sightings={items} />
          <div ref={sentinelRef} aria-hidden="true" />
          {sightings.isFetchingNextPage && (
            <div className={styles.loadingMore}>
              <Spinner size={22} label="Carregando mais avistamentos" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
