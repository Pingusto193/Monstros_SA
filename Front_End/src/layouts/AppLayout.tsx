import { Outlet } from 'react-router';
import { BottomNav } from '@/components/navigation/BottomNav';
import { MobileHeader } from '@/components/navigation/MobileHeader';
import { Sidebar } from '@/components/navigation/Sidebar';
import styles from './AppLayout.module.css';

/** Estrutura das páginas logadas: sidebar (desktop/tablet) ou cabeçalho + barra inferior (celular). */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className={styles.column}>
        <MobileHeader />
        <main id="conteudo" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
