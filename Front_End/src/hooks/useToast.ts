import { use } from 'react';
import { ToastContext } from '@/context/contexts';

export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  return context;
}
