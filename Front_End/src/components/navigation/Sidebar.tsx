import { LogOut, Settings } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { Logo, LogoMark } from '@/components/brand/Logo';
import { Avatar } from '@/components/user/Avatar';
import { useAuth, useCurrentUser } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { paths } from '@/utils/routes';
import { MAIN_NAV } from './navigation';
import styles from './Sidebar.module.css';

/** Navegação lateral: completa no desktop, só ícones (com dica) em telas médias. */
export function Sidebar() {
  const user = useCurrentUser();
  const { logout } = useAuth();

  return (
    <nav className={styles.sidebar} aria-label="Navegação principal">
      <Link to={paths.home} className={styles.brand} aria-label="Rastro — início">
        <Logo size="md" className={styles.brandFull} />
        <LogoMark size={32} className={styles.brandMark} />
      </Link>

      <ul role="list" className={styles.list}>
        {MAIN_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(styles.link, isActive && styles.active, item.primary && styles.primary)
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} strokeWidth={isActive ? 2.4 : 1.9} className={styles.icon} aria-hidden="true" />
                  <span className={styles.label}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink
            to={paths.profile(user.username)}
            className={({ isActive }) => cn(styles.link, isActive && styles.active)}
          >
            {({ isActive }) => (
              <>
                <Avatar user={user} size={26} ring={isActive} className={styles.icon} />
                <span className={styles.label}>Perfil</span>
              </>
            )}
          </NavLink>
        </li>
      </ul>

      <ul role="list" className={cn(styles.list, styles.bottom)}>
        <li>
          <NavLink to={paths.settings} className={({ isActive }) => cn(styles.link, isActive && styles.active)}>
            {({ isActive }) => (
              <>
                <Settings size={24} strokeWidth={isActive ? 2.4 : 1.9} className={styles.icon} aria-hidden="true" />
                <span className={styles.label}>Configurações</span>
              </>
            )}
          </NavLink>
        </li>
        <li>
          <button type="button" className={styles.link} onClick={() => void logout()}>
            <LogOut size={24} strokeWidth={1.9} className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
