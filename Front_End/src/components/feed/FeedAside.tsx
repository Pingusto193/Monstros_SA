import { Footprints, SquarePlus } from 'lucide-react';
import { Link } from 'react-router';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/user/Avatar';
import { OfficialBadge } from '@/components/user/UserBadge';
import { useFeaturedUsers } from '@/hooks/queries/useUsers';
import { useCurrentUser } from '@/hooks/useAuth';
import { pluralize } from '@/utils/format';
import { paths } from '@/utils/routes';
import styles from './FeedAside.module.css';

/** Coluna lateral do feed (telas largas): perfil, chamada para registrar e investigadores em destaque. */
export function FeedAside() {
  const user = useCurrentUser();
  const featured = useFeaturedUsers();

  return (
    <aside className={styles.aside} aria-label="Sugestões">
      <div className={styles.me}>
        <Link to={paths.profile(user.username)} tabIndex={-1} aria-hidden="true">
          <Avatar user={user} size={48} />
        </Link>
        <div className={styles.meText}>
          <Link to={paths.profile(user.username)} className={styles.username}>
            {user.username}
          </Link>
          <span className={styles.name}>{user.name}</span>
        </div>
        <Link to={paths.editProfile} className={styles.textLink}>
          Editar
        </Link>
      </div>

      <section className={styles.cta}>
        <Footprints size={22} className={styles.ctaIcon} aria-hidden="true" />
        <h2 className={styles.ctaTitle}>Viu algo na mata?</h2>
        <p className={styles.ctaText}>
          Registre com foto, local e horário. Relatos detalhados ajudam a comunidade a investigar.
        </p>
        <ButtonLink to={paths.createSighting} size="sm" icon={<SquarePlus size={16} />}>
          Registrar avistamento
        </ButtonLink>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Investigadores em destaque</h2>
        {featured.isPending ? (
          <ul role="list" className={styles.people} aria-hidden="true">
            {[0, 1, 2, 3].map((item) => (
              <li key={item} className={styles.person}>
                <Skeleton circle width={36} height={36} />
                <div className={styles.personText}>
                  <Skeleton width={110} height={11} />
                  <Skeleton width={80} height={10} />
                </div>
              </li>
            ))}
          </ul>
        ) : featured.data && featured.data.length > 0 ? (
          <ul role="list" className={styles.people}>
            {featured.data.map((person) => (
              <li key={person.id}>
                <Link to={paths.profile(person.username)} className={styles.person}>
                  <Avatar user={person} size={36} />
                  <span className={styles.personText}>
                    <span className={styles.personName}>
                      {person.username}
                      {person.isOfficial && <OfficialBadge size={12} />}
                    </span>
                    <span className={styles.personMeta}>
                      {pluralize(person.sightingsCount, 'avistamento', 'avistamentos')}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Ainda não há investigadores para mostrar.</p>
        )}
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Rastro · Projeto Monstros S.A.
        <br />
        Relatos publicados pela comunidade. Respeite a natureza e as áreas protegidas.
      </footer>
    </aside>
  );
}
