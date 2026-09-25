import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { Spinner } from '@/components/ui/Spinner';
import styles from './Feedback.module.css';

/** Indicador de carregamento para uma seção ou página. */
export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className={styles.loading}>
      <Spinner size={24} label={label} />
    </div>
  );
}

/** Tela cheia exibida enquanto a sessão salva é verificada. */
export function SplashScreen() {
  // Servidores gratuitos "dormem" quando ficam parados; a primeira resposta pode demorar.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.splash} role="status">
      <div className={styles.splashContent}>
        <LogoMark size={52} className={styles.splashMark} />
        {slow ? (
          <p className={styles.splashText}>
            Acordando o servidor…
            <br />
            Na primeira visita isso pode levar até um minuto.
          </p>
        ) : (
          <span className="sr-only">Carregando o Rastro…</span>
        )}
      </div>
    </div>
  );
}
