import { MessageCircle, Send } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/hooks/useToast';
import type { Sighting } from '@/types';
import { pluralize } from '@/utils/format';
import { paths } from '@/utils/routes';
import { absoluteUrl, shareLink } from '@/utils/share';
import { LikeButton } from './LikeButton';
import styles from './Post.module.css';

interface PostActionsProps {
  sighting: Sighting;
  onToggleLike: (liked: boolean) => void;
  onComment: () => void;
}

/** Linha de ações (curtir, comentar, compartilhar) + contador de curtidas. */
export function PostActions({ sighting, onToggleLike, onComment }: PostActionsProps) {
  const toast = useToast();

  async function handleShare() {
    const result = await shareLink({
      title: `Avistamento em ${sighting.location.place}`,
      text: `Relato de @${sighting.author.username} no Rastro`,
      url: absoluteUrl(paths.sighting(sighting.id)),
    });
    if (result === 'copied') toast.success('Link do avistamento copiado.');
    if (result === 'failed') toast.error('Não foi possível compartilhar agora.');
  }

  return (
    <div className={styles.actionsBlock}>
      <div className={styles.actions}>
        <LikeButton liked={sighting.likedByMe} onToggle={onToggleLike} />
        <IconButton label="Comentar" icon={<MessageCircle size={24} />} onClick={onComment} />
        <IconButton label="Compartilhar" icon={<Send size={22} />} onClick={handleShare} />
      </div>
      {sighting.likeCount > 0 ? (
        <p className={styles.likes}>{pluralize(sighting.likeCount, 'curtida', 'curtidas')}</p>
      ) : (
        <p className={styles.likesEmpty}>
          Seja o primeiro a{' '}
          <button type="button" className={styles.inlineLink} onClick={() => onToggleLike(true)}>
            curtir
          </button>
        </p>
      )}
    </div>
  );
}
