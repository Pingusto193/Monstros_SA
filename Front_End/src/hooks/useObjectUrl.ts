import { useEffect, useState } from 'react';

/** Cria uma URL temporária para pré-visualizar um arquivo e a libera ao trocar/desmontar. */
export function useObjectUrl(file: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  // Sincroniza com um recurso externo (Object URL do navegador): criar e liberar no mesmo efeito
  // garante que a URL continue válida no StrictMode e não vaze memória.
  useEffect(() => {
    if (!file) {
      // oxlint-disable-next-line react/set-state-in-effect
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    // oxlint-disable-next-line react/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
