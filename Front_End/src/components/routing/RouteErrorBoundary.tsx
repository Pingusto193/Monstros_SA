import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import styles from './RouteErrorBoundary.module.css';

/** Última linha de defesa: erros inesperados de renderização ou de carregamento de página. */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env.DEV && !notFound) console.error(error);

  return (
    <main className={styles.page}>
      <Logo size="md" />
      <h1 className={styles.title}>{notFound ? 'Página não encontrada' : 'Algo saiu da trilha'}</h1>
      <p className={styles.text}>
        {notFound
          ? 'O endereço acessado não existe.'
          : 'Encontramos um erro inesperado. Recarregue a página para continuar de onde parou.'}
      </p>
      <div className={styles.actions}>
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
        <Button variant="secondary" onClick={() => window.location.assign('/')}>
          Ir para o início
        </Button>
      </div>
    </main>
  );
}
