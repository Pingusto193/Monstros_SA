import { Outlet } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { getResponsiveImage } from '@/utils/image';
import styles from './AuthLayout.module.css';

// Imagem de identidade visual (floresta com neblina — Unsplash, licença livre).
const HERO_URL =
  'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=1400&h=1800&q=80';
const hero = getResponsiveImage(HERO_URL, [800, 1200, 1600], '50vw');

/** Layout das telas públicas: foto de floresta à esquerda (desktop) e formulário à direita. */
export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <section className={styles.visual} aria-label="Sobre o Rastro">
        <img className={styles.photo} src={hero.src} srcSet={hero.srcSet} sizes={hero.sizes} alt="" loading="lazy" />
        <div className={styles.scrim} />
        <div className={styles.visualContent}>
          <Logo size="lg" tone="light" />
          <div className={styles.statement}>
            <p className={styles.tagline}>Toda lenda começa com um avistamento.</p>
            <p className={styles.subtitle}>
              Registre, compare e investigue relatos do Pé Grande com uma comunidade que leva a floresta a sério.
            </p>
          </div>
          <p className={styles.caption}>
            <span className={styles.captionCode}>RST-2026-0412</span>
            Floresta Nacional Gifford Pinchot · Washington
          </p>
        </div>
      </section>

      <main className={styles.formSide}>
        <div className={styles.formContainer}>
          <Outlet />
        </div>
        <footer className={styles.footer}>© {new Date().getFullYear()} Rastro · Projeto Monstros S.A.</footer>
      </main>
    </div>
  );
}
