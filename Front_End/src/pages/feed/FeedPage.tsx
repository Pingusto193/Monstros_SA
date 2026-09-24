import { CircleCheck, Footprints, SquarePlus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { FeedAside } from '@/components/feed/FeedAside';
import { RegionStrip } from '@/components/feed/RegionStrip';
import { PostCard, PostCardSkeleton } from '@/components/sighting/PostCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { flattenPages } from '@/hooks/queries/cache';
import { useFeed } from '@/hooks/queries/useSightings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { paths } from '@/utils/routes';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  useDocumentTitle('Início');
  const feed = useFeed();
  const sightings = useMemo(() => flattenPages(feed.data), [feed.data]);
  const location = useLocation();
  const navigate = useNavigate();
  const highlightId = (location.state as { highlight?: string } | null)?.highlight;

  // O destaque do post recém-publicado é exibido uma vez; depois, limpa o estado do histórico
  // para não repetir ao recarregar a página.
  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(
      () => navigate('.', { replace: true, state: null, preventScrollReset: true }),
      3000,
    );
    return () => window.clearTimeout(timer);
  }, [highlightId, navigate]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => void feed.fetchNextPage(),
    enabled: Boolean(feed.hasNextPage) && !feed.isFetchingNextPage && !feed.isError,
  });

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        <h1 className="sr-only">Feed de avistamentos</h1>
        <RegionStrip />

        {feed.isPending ? (
          <div className={styles.list}>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : feed.isError && sightings.length === 0 ? (
          <ErrorState error={feed.error} onRetry={() => void feed.refetch()} />
        ) : sightings.length === 0 ? (
          <EmptyState
            icon={<Footprints size={28} />}
            title="Nenhum avistamento ainda"
            description="Seja a primeira pessoa a registrar algo estranho na mata."
            action={
              <ButtonLink to={paths.createSighting} icon={<SquarePlus size={18} />}>
                Registrar avistamento
              </ButtonLink>
            }
          />
        ) : (
          <>
            <ul role="list" className={styles.list}>
              {sightings.map((sighting, index) => (
                <li key={sighting.id}>
                  <PostCard sighting={sighting} priority={index === 0} highlighted={sighting.id === highlightId} />
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} aria-hidden="true" />

            {feed.isFetchingNextPage && (
              <div className={styles.loadingMore}>
                <Spinner size={22} label="Carregando mais avistamentos" />
              </div>
            )}

            {feed.hasNextPage && !feed.isFetchingNextPage && (
              <div className={styles.loadingMore}>
                <Button variant="ghost" size="sm" onClick={() => void feed.fetchNextPage()}>
                  Carregar mais avistamentos
                </Button>
              </div>
            )}

            {!feed.hasNextPage && (
              <div className={styles.end}>
                <CircleCheck size={40} strokeWidth={1.4} aria-hidden="true" />
                <p className={styles.endTitle}>Você está em dia</p>
                <p className={styles.endText}>Você viu todos os avistamentos publicados até agora.</p>
              </div>
            )}
          </>
        )}
      </div>

      <FeedAside />
    </div>
  );
}
