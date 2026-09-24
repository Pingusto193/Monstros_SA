import { useCallback, useState } from 'react';
import type { Coordinates } from '@/types';

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Captura as coordenadas GPS do navegador (sem API externa).
 * Etapa futura: converter coordenadas em cidade/estado (geocodificação reversa) no backend.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    () =>
      new Promise<Coordinates | null>((resolve) => {
        const fail = (message: string) => {
          setStatus('error');
          setError(message);
          resolve(null);
        };

        if (!('geolocation' in navigator)) {
          fail('Seu navegador não oferece localização. Preencha os campos manualmente.');
          return;
        }
        if (!window.isSecureContext) {
          fail('A localização só funciona em conexões seguras (HTTPS ou localhost). Preencha manualmente.');
          return;
        }

        setStatus('loading');
        setError(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setStatus('success');
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: Math.round(position.coords.accuracy),
            });
          },
          (positionError) => {
            fail(
              positionError.code === positionError.PERMISSION_DENIED
                ? 'Permissão de localização negada. Você pode preencher os campos manualmente.'
                : 'Não foi possível obter sua localização agora. Tente de novo ou preencha manualmente.',
            );
          },
          { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
        );
      }),
    [],
  );

  return { status, error, request };
}
