import { ArrowLeft, FileSearch, Heart } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentList } from '@/components/comments/CommentList';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PostActions } from '@/components/sighting/PostActions';
import { PostHeader } from '@/components/sighting/PostHeader';
import { SightingImage } from '@/components/sighting/SightingImage';
import { SightingReport } from '@/components/sighting/SightingReport';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSighting, useToggleLike } from '@/hooks/queries/useSightings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDoubleTap } from '@/hooks/useDoubleTap';
import { isAppError } from '@/services';
import type { Sighting } from '@/types';
import { getSightingAlt, getSightingCode, pluralize } from '@/utils/format';
import { paths } from '@/utils/routes';
import styles from './SightingPage.module.css';

export default function SightingPage() {
  const { sightingId } = useParams();
  const sighting = useSighting(sightingId);
  const location = useLocation();
  const focusComment = Boolean((location.state as { focusComment?: boolean } | null)?.focusComment);

  useDocumentTitle(sighting.data ? `Avistamento em ${sighting.data.location.place}` : 'Avistamento');

  if (sighting.isPending) return <SightingPageSkeleton />;

  if (sighting.isError) {
    return isAppError(sighting.error, 'NOT_FOUND') ? (
      <EmptyState
        icon={<FileSearch size={28} />}
        title="Avistamento não encontrado"
        description="Este registro não existe ou foi removido pelo autor."
        action={<ButtonLink to={paths.home}>Voltar ao feed</ButtonLink>}
      />
    ) : (
      <ErrorState error={sighting.error} onRetry={() => void sighting.refetch()} />
    );
  }

  return <SightingDetail sighting={sighting.data} focusComment={focusComment} />;
}

function SightingDetail({ sighting, focusComment }: { sighting: Sighting; focusComment: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleLike = useToggleLike(sighting.id);
  const [burstKey, setBurstKey] = useState(0);
  const doubleTap = useDoubleTap(() => {
    setBurstKey((key) => key + 1);
    if (!sighting.likedByMe) toggleLike.mutate(true);
  });

  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate(paths.home);
  }

  function focusCommentInput() {
    document.getElementById('comentar')?.querySelector('textarea')?.focus();
  }

  return (
    <div className={styles.page}>
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={goBack} className={styles.back}>
        Voltar
      </Button>

      <article className={styles.layout} aria-labelledby="sighting-title">
        <div className={styles.evidenceColumn}>
          <figure className={styles.evidence} {...doubleTap}>
            <SightingImage
              photo={sighting.photo}
              alt={getSightingAlt(sighting)}
              sizes="(max-width: 1023px) 100vw, 60vw"
              fit="contain"
              priority
              className={styles.evidenceImage}
            />
            <figcaption className={styles.evidenceTag}>
              <span className={styles.evidenceDot} aria-hidden="true" />
              Registro {getSightingCode(sighting.id, sighting.createdAt)}
            </figcaption>
            {burstKey > 0 && (
              <span key={burstKey} className={styles.burst} aria-hidden="true" onAnimationEnd={() => setBurstKey(0)}>
                <Heart size={104} fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </figure>
        </div>

        <div className={styles.panel}>
          <div className={styles.headerWrap}>
            <PostHeader sighting={sighting} showViewAction={false} onDeleted={() => navigate(paths.home, { replace: true })} />
          </div>

          <section className={styles.story}>
            <h1 id="sighting-title" className={styles.title}>
              {sighting.location.place}
            </h1>
            <p className={styles.description}>{sighting.description}</p>
          </section>

          <PostActions
            sighting={sighting}
            onToggleLike={(liked) => toggleLike.mutate(liked)}
            onComment={focusCommentInput}
          />

          <SightingReport sighting={sighting} />

          <section className={styles.comments} aria-labelledby="comments-title">
            <h2 id="comments-title" className={styles.commentsTitle}>
              Comentários
              <span className={styles.commentsCount}>{pluralize(sighting.commentCount, 'comentário', 'comentários')}</span>
            </h2>
            <CommentList sightingId={sighting.id} sightingAuthorId={sighting.author.id} />
            <div id="comentar" className={styles.commentForm}>
              <CommentForm sightingId={sighting.id} variant="panel" focusOnMount={focusComment} />
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function SightingPageSkeleton() {
  return (
    <div className={styles.page} aria-busy="true">
      <span className="sr-only" role="status">
        Carregando avistamento…
      </span>
      <div className={styles.layout} aria-hidden="true">
        <div className={styles.evidenceColumn}>
          <Skeleton width="100%" height="auto" radius={16} style={{ aspectRatio: '4 / 5' }} />
        </div>
        <div className={styles.panel}>
          <div className={styles.skeletonHeader}>
            <Skeleton circle width={32} height={32} />
            <Skeleton width={180} height={12} />
          </div>
          <Skeleton width="70%" height={24} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="92%" height={12} />
          <Skeleton width="60%" height={12} />
          <Skeleton width="100%" height={180} radius={12} />
        </div>
      </div>
    </div>
  );
}
