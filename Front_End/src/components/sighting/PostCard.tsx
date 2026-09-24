import { Heart } from 'lucide-react';
import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CommentForm } from '@/components/comments/CommentForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { isOptimisticId } from '@/hooks/queries/cache';
import { useToggleLike } from '@/hooks/queries/useSightings';
import { useDoubleTap } from '@/hooks/useDoubleTap';
import type { Sighting } from '@/types';
import { cn } from '@/utils/cn';
import { getSightingAlt } from '@/utils/format';
import { paths } from '@/utils/routes';
import { Caption } from './Caption';
import styles from './Post.module.css';
import { PostActions } from './PostActions';
import { PostHeader } from './PostHeader';
import { SightingImage } from './SightingImage';
import { SightingMeta } from './SightingMeta';

interface PostCardProps {
  sighting: Sighting;
  /** Primeira imagem da tela: carrega com prioridade. */
  priority?: boolean;
  /** Destaca brevemente uma publicação recém-criada. */
  highlighted?: boolean;
}

export const PostCard = memo(function PostCard({ sighting, priority = false, highlighted = false }: PostCardProps) {
  const navigate = useNavigate();
  const toggleLike = useToggleLike(sighting.id);
  const [burstKey, setBurstKey] = useState(0);
  const detailPath = paths.sighting(sighting.id);

  const doubleTap = useDoubleTap(() => {
    setBurstKey((key) => key + 1);
    if (!sighting.likedByMe) toggleLike.mutate(true);
  });

  const openComments = () => navigate(detailPath, { state: { focusComment: true } });

  return (
    <article
      className={cn(styles.card, highlighted && styles.highlighted)}
      aria-label={`Avistamento de ${sighting.author.name} em ${sighting.location.place}`}
    >
      <PostHeader sighting={sighting} />

      <div className={styles.media} {...doubleTap}>
        <SightingImage
          photo={sighting.photo}
          alt={getSightingAlt(sighting)}
          sizes="(max-width: 767px) 100vw, 500px"
          priority={priority}
        />
        {burstKey > 0 && <HeartBurst key={burstKey} onDone={() => setBurstKey(0)} />}
      </div>

      <div className={styles.body}>
        <PostActions sighting={sighting} onToggleLike={(liked) => toggleLike.mutate(liked)} onComment={openComments} />
        <Caption author={sighting.author} text={sighting.description} />
        <SightingMeta sighting={sighting} />

        {sighting.commentCount > 0 && (
          <Link to={detailPath} className={styles.viewComments}>
            {sighting.commentCount === 1 ? 'Ver 1 comentário' : `Ver todos os ${sighting.commentCount} comentários`}
          </Link>
        )}

        {sighting.recentComments.length > 0 && (
          <ul role="list" className={styles.preview}>
            {sighting.recentComments.map((comment) => (
              <li key={comment.id} className={cn(isOptimisticId(comment.id) && styles.pending)}>
                <Link to={paths.profile(comment.author.username)} className={styles.previewAuthor}>
                  {comment.author.username}
                </Link>{' '}
                <span>{comment.text}</span>
              </li>
            ))}
          </ul>
        )}

        <CommentForm sightingId={sighting.id} variant="inline" />
      </div>
    </article>
  );
});

function HeartBurst({ onDone }: { onDone: () => void }) {
  return (
    <span className={styles.burst} aria-hidden="true">
      <Heart size={96} fill="currentColor" strokeWidth={0} onAnimationEnd={onDone} />
    </span>
  );
}

export function PostCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.header}>
        <Skeleton circle width={32} height={32} />
        <div className={styles.skeletonLines}>
          <Skeleton width={180} height={12} />
          <Skeleton width={120} height={10} />
        </div>
      </div>
      <div className={styles.media}>
        <Skeleton width="100%" height="auto" radius={0} style={{ aspectRatio: '4 / 5' }} />
      </div>
      <div className={styles.body}>
        <div className={styles.skeletonLines} style={{ paddingTop: 16 }}>
          <Skeleton width={96} height={12} />
          <Skeleton width="92%" height={12} />
          <Skeleton width="68%" height={12} />
        </div>
      </div>
    </div>
  );
}
