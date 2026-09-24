import { Link } from 'react-router';
import { Avatar } from '@/components/user/Avatar';
import { OfficialBadge } from '@/components/user/UserBadge';
import { isOptimisticId } from '@/hooks/queries/cache';
import type { Comment as CommentType } from '@/types';
import { cn } from '@/utils/cn';
import { formatCompactRelativeTime, formatDateTime } from '@/utils/date';
import { paths } from '@/utils/routes';
import styles from './Comments.module.css';

interface CommentProps {
  comment: CommentType;
  canDelete?: boolean;
  onDelete?: () => void;
}

export function Comment({ comment, canDelete = false, onDelete }: CommentProps) {
  const pending = isOptimisticId(comment.id);
  const profilePath = paths.profile(comment.author.username);

  return (
    <li className={cn(styles.comment, pending && styles.pending)}>
      <Link to={profilePath} className={styles.avatarLink} tabIndex={-1} aria-hidden="true">
        <Avatar user={comment.author} size="sm" />
      </Link>
      <div className={styles.content}>
        <p className={styles.text}>
          <Link to={profilePath} className={styles.author}>
            {comment.author.username}
          </Link>
          {comment.author.isOfficial && (
            <>
              {' '}
              <OfficialBadge size={12} />
            </>
          )}{' '}
          <span className={styles.body}>{comment.text}</span>
        </p>
        <div className={styles.meta}>
          {pending ? (
            <span>Publicando…</span>
          ) : (
            <time dateTime={comment.createdAt} title={formatDateTime(comment.createdAt)}>
              {formatCompactRelativeTime(comment.createdAt)}
            </time>
          )}
          {canDelete && !pending && (
            <button type="button" className={styles.delete} onClick={onDelete}>
              Excluir
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
