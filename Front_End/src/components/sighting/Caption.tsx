import { useState } from 'react';
import { Link } from 'react-router';
import type { UserSummary } from '@/types';
import { paths } from '@/utils/routes';
import styles from './Post.module.css';

const PREVIEW_LENGTH = 150;

function truncateAtWord(text: string, max: number) {
  const flat = text.replace(/\s+/g, ' ');
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).trimEnd();
}

/** Descrição com "mais" para textos longos, como nas redes sociais. */
export function Caption({ author, text }: { author: UserSummary; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > PREVIEW_LENGTH + 20 || text.includes('\n');

  return (
    <p className={styles.caption}>
      <Link to={paths.profile(author.username)} className={styles.captionAuthor}>
        {author.username}
      </Link>{' '}
      {expanded || !isLong ? (
        <span className={styles.captionText}>{text}</span>
      ) : (
        <>
          <span>{truncateAtWord(text, PREVIEW_LENGTH)}… </span>
          <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
            mais
          </button>
        </>
      )}
    </p>
  );
}
