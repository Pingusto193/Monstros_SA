import { Link } from 'react-router';
import { Avatar } from '@/components/user/Avatar';
import { OfficialBadge } from '@/components/user/UserBadge';
import type { UserSummary } from '@/types';
import { paths } from '@/utils/routes';
import styles from './UserResults.module.css';

/** Pessoas encontradas pela busca (por nome ou @usuário). */
export function UserResults({ users }: { users: UserSummary[] }) {
  if (users.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby="explore-people">
      <h2 id="explore-people" className={styles.title}>
        Investigadores
      </h2>
      <ul role="list" className={styles.list}>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={paths.profile(user.username)} className={styles.person}>
              <Avatar user={user} size={44} />
              <span className={styles.text}>
                <span className={styles.username}>
                  {user.username}
                  {user.isOfficial && <OfficialBadge size={12} />}
                </span>
                <span className={styles.name}>{user.name}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
