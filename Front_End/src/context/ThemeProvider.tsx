import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/utils/storage';
import { ThemeContext, type ResolvedTheme, type ThemePreference } from './contexts';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#f6f5f0', dark: '#0c100d' };

function readPreference(): ThemePreference {
  const stored = storage.get(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

function readSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolvedTheme]);
  }, [resolvedTheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      storage.set(STORAGE_KEY, next);
    } catch {
      // Preferência vale só nesta sessão.
    }
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
