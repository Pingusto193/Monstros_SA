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
  return (
    <div className={styles.splash} role="status">
      <LogoMark size={52} className={styles.splashMark} />
      <span className="sr-only">Carregando o Rastro…</span>
    </div>
  );
}
