export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continua para o fallback abaixo.
  }

  // Fallback para contextos sem Clipboard API (ex.: acesso via IP da rede local, sem HTTPS).
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * Em celulares usa a folha de compartilhamento nativa; no desktop, copia o link.
 */
export async function shareLink(data: { title: string; text?: string; url: string }): Promise<ShareResult> {
  const prefersNativeShare =
    typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;

  if (prefersNativeShare) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }

  return (await copyToClipboard(data.url)) ? 'copied' : 'failed';
}

export function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}
