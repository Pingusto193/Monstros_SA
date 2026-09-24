import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '@/context/contexts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';
import styles from './Settings.module.css';

const OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  hint: string;
  icon: typeof Sun;
  previewClass: string;
}> = [
  { value: 'system', label: 'Automático', hint: 'Acompanha o tema do seu dispositivo.', icon: Monitor, previewClass: styles.previewSystem },
  { value: 'light', label: 'Claro', hint: 'Tons de papel e floresta, ideal de dia.', icon: Sun, previewClass: styles.previewLight },
  { value: 'dark', label: 'Escuro', hint: 'Confortável à noite — e no acampamento.', icon: Moon, previewClass: styles.previewDark },
];

export default function AppearancePage() {
  useDocumentTitle('Aparência');
  const { preference, setPreference } = useTheme();

  return (
    <section className={styles.section} aria-labelledby="appearance-title">
      <h2 id="appearance-title" className={styles.sectionTitle}>
        Aparência
      </h2>
      <p className={styles.sectionDescription}>Escolha como o Rastro aparece neste navegador.</p>

      <fieldset className={styles.themeOptions}>
        <legend className="sr-only">Tema</legend>
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <label key={option.value} className={cn(styles.themeOption, selected && styles.themeOptionActive)}>
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={selected}
                onChange={() => setPreference(option.value)}
                className="sr-only"
              />
              <span className={cn(styles.themePreview, option.previewClass)} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={styles.themeText}>
                <span className={styles.themeLabel}>
                  <option.icon size={15} aria-hidden="true" />
                  {option.label}
                </span>
                <span className={styles.themeHint}>{option.hint}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}
