import { use } from 'react';
import { ThemeContext } from '@/context/contexts';

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  return context;
}
