import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toaster } from '@/components/feedback/Toaster';
import { ToastContext, type ToastApi, type ToastMessage, type ToastTone } from './contexts';

const MAX_VISIBLE = 3;
const DURATION: Record<ToastTone, number> = { success: 3200, info: 3200, error: 5200 };

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      counter += 1;
      const id = `toast-${counter}`;
      setToasts((current) =>
        [...current.filter((toast) => toast.message !== message), { id, tone, message }].slice(-MAX_VISIBLE),
      );
      timers.current.set(id, window.setTimeout(() => dismiss(id), DURATION[tone]));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}
