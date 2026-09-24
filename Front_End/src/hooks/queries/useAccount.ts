import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { authService, demoData } from '@/services';
import type { ChangePasswordInput } from '@/types';

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authService.changePassword(input),
  });
}

/** Apaga os dados locais e recria os exemplos (disponível apenas no modo mock). */
export function useResetDemoData() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!demoData) throw new Error('Dados de demonstração indisponíveis.');
      await demoData.reset();
      await logout({ silent: true });
    },
  });
}

export const isDemoDataAvailable = demoData !== null;
