import { Ellipsis, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { IconButton } from '@/components/ui/IconButton';
import { Avatar } from '@/components/user/Avatar';
import { OfficialBadge } from '@/components/user/UserBadge';
import type { Sighting } from '@/types';
import { formatCompactRelativeTime, formatDateTime, formatRelativeTime } from '@/utils/date';
import { paths } from '@/utils/routes';
import styles from './Post.module.css';
import { PostOptions } from './PostOptions';

interface PostHeaderProps {
  sighting: Sighting;
  /** Oculta a opção "Ver registro completo" (já estamos na página do registro). */
  showViewAction?: boolean;
  onDeleted?: () => void;
}

/** Cabeçalho da publicação: autor, @usuário, tempo, local e menu de opções. */
export function PostHeader({ sighting, showViewAction = true, onDeleted }: PostHeaderProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const { author, location } = sighting;
  const profilePath = paths.profile(author.username);

  return (
    <header className={styles.header}>
      <Link to={profilePath} className={styles.avatarLink} tabIndex={-1} aria-hidden="true">
        <Avatar user={author} size="sm" />
      </Link>

      <div className={styles.headerText}>
        <div className={styles.nameRow}>
          <Link to={profilePath} className={styles.name}>
            {author.name}
          </Link>
          {author.isOfficial && <OfficialBadge />}
          <span className={styles.username}>@{author.username}</span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <Link
            to={paths.sighting(sighting.id)}
            className={styles.time}
            aria-label={`Publicado ${formatRelativeTime(sighting.createdAt)}`}
          >
            <time dateTime={sighting.createdAt} title={formatDateTime(sighting.createdAt)}>
              {formatCompactRelativeTime(sighting.createdAt)}
            </time>
          </Link>
        </div>
        <Link to={paths.exploreSearch(location.city)} className={styles.location}>
          <MapPin size={12} aria-hidden="true" />
          <span>{location.place}</span>
        </Link>
      </div>

      <IconButton
        label="Opções do avistamento"
        icon={<Ellipsis size={20} />}
        onClick={() => setOptionsOpen(true)}
        className={styles.optionsButton}
      />
      <PostOptions
        sighting={sighting}
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        showViewAction={showViewAction}
        onDeleted={onDeleted}
      />
    </header>
  );
}
