import { LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { paths } from '@/utils/routes';
import styles from './Settings.module.css';

const SECTIONS = [
  { to: paths.editProfile, label: 'Editar perfil', icon: UserRound },
  { to: paths.appearance, label: 'Aparência', icon: Palette },
  { to: paths.account, label: 'Conta e segurança', icon: ShieldCheck },
];

export default function SettingsLayout() {
  const { logout } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Configurações</h1>
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Seções das configurações">
          <ul role="list" className={styles.navList}>
            {SECTIONS.map((section) => (
              <li key={section.to}>
                <NavLink to={section.to} className={({ isActive }) => cn(styles.navLink, isActive && styles.navActive)}>
                  <section.icon size={18} aria-hidden="true" />
                  {section.label}
                </NavLink>
              </li>
            ))}
            <li className={styles.navLogoutItem}>
              <button type="button" className={cn(styles.navLink, styles.navLogout)} onClick={() => void logout()}>
                <LogOut size={18} aria-hidden="true" />
                Sair
              </button>
            </li>
          </ul>
        </nav>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
