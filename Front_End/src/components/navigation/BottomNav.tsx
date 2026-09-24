import { NavLink } from 'react-router';
import { Avatar } from '@/components/user/Avatar';
import { useCurrentUser } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { paths } from '@/utils/routes';
import styles from './BottomNav.module.css';
import { MAIN_NAV } from './navigation';

/** Barra de navegação inferior (celular). */
export function BottomNav() {
  const user = useCurrentUser();

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <ul role="list" className={styles.list}>
        {MAIN_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(styles.item, isActive && styles.active, item.primary && styles.primary)}
            >
              {({ isActive }) => (
                <>
                  <span className={styles.iconWrap}>
                    <item.icon size={item.primary ? 22 : 24} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                  </span>
                  <span className={styles.label}>{item.shortLabel}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink
            to={paths.profile(user.username)}
            className={({ isActive }) => cn(styles.item, isActive && styles.active)}
          >
            {({ isActive }) => (
              <>
                <span className={styles.iconWrap}>
                  <Avatar user={user} size={26} ring={isActive} />
                </span>
                <span className={styles.label}>Perfil</span>
              </>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
