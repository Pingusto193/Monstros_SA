import { ChevronLeft, Settings } from 'lucide-react';
import { Link, useLocation, useMatches, useNavigate, useParams } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { IconButton } from '@/components/ui/IconButton';
import { paths } from '@/utils/routes';
import styles from './MobileHeader.module.css';
import { isRouteHandle, type RouteHandle } from './navigation';

/** Cabeçalho do celular: logo nas telas principais; "voltar" + título nas internas. */
export function MobileHeader() {
  const matches = useMatches();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  let handle: RouteHandle | undefined;
  for (const match of matches) {
    if (isRouteHandle(match.handle)) handle = match.handle;
  }

  const title = typeof handle?.title === 'function' ? handle.title(params) : handle?.title;
  const showBack = Boolean(handle?.back);
  const isSettings = location.pathname.startsWith(paths.settings);

  function goBack() {
    // Se a pessoa chegou direto por um link, não há histórico interno: volta para o início.
    if (location.key !== 'default') navigate(-1);
    else navigate(paths.home);
  }

  return (
    <header className={styles.header}>
      {showBack ? (
        <>
          <IconButton label="Voltar" icon={<ChevronLeft size={26} />} onClick={goBack} className={styles.back} />
          <span className={styles.title}>{title}</span>
        </>
      ) : (
        <Link to={paths.home} className={styles.brand} aria-label="Rastro — início">
          <Logo size="sm" />
        </Link>
      )}

      <div className={styles.actions}>
        {!isSettings && (
          <Link to={paths.settings} className={styles.action} aria-label="Configurações">
            <Settings size={22} aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  );
}
