export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_IMAGE_ATTR = ACCEPTED_IMAGE_TYPES.join(',');
export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato não suportado. Envie uma imagem JPG, PNG ou WEBP.';
  }
  if (file.size === 0) return 'O arquivo está vazio.';
  if (file.size > MAX_IMAGE_SIZE_BYTES) return 'A imagem é muito grande. O limite é de 15 MB.';
  return null;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    image.src = src;
  });
}

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Redimensiona e comprime uma imagem no navegador (canvas → JPEG).
 * A orientação EXIF já é aplicada pelos navegadores modernos ao desenhar a imagem.
 */
export async function resizeImageFile(
  file: File,
  options: { maxSize: number; quality?: number; square?: boolean },
): Promise<ProcessedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    let sx = 0;
    let sy = 0;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;
    if (!sw || !sh) throw new Error('Imagem inválida.');

    if (options.square) {
      const side = Math.min(sw, sh);
      sx = (sw - side) / 2;
      sy = (sh - side) / 2;
      sw = side;
      sh = side;
    }

    const scale = Math.min(1, options.maxSize / Math.max(sw, sh));
    const width = Math.max(1, Math.round(sw * scale));
    const height = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Seu navegador não permitiu processar a imagem.');

    context.imageSmoothingQuality = 'high';
    context.fillStyle = '#ffffff'; // PNG com transparência vira JPEG com fundo branco
    context.fillRect(0, 0, width, height);
    context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

    return { dataUrl: canvas.toDataURL('image/jpeg', options.quality ?? 0.82), width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ---------- URLs ----------

function isUnsplash(url: URL): boolean {
  return url.hostname === 'images.unsplash.com';
}

/**
 * Aceita apenas URLs de imagem previsíveis: https, caminhos do próprio app, data URLs de imagem
 * e blob: (pré-visualização local de um arquivo escolhido pela pessoa).
 */
export function isSafeImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  if (url.startsWith('data:')) return /^data:image\/(jpeg|png|webp);base64,/.test(url);
  if (url.startsWith('blob:')) return url.startsWith(`blob:${window.location.origin}/`);
  if (url.startsWith('/')) return !url.startsWith('//');
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function withWidth(url: URL, width: number): string {
  const next = new URL(url);
  const baseWidth = Number(url.searchParams.get('w'));
  const baseHeight = Number(url.searchParams.get('h'));
  next.searchParams.set('w', String(width));
  if (baseWidth && baseHeight) {
    next.searchParams.set('h', String(Math.round((width * baseHeight) / baseWidth)));
  }
  return next.toString();
}

/**
 * Gera src/srcSet para imagens de CDN (hoje, Unsplash nos dados de exemplo).
 * Imagens enviadas pelo usuário (data URL) são devolvidas como estão.
 */
export function getResponsiveImage(
  src: string,
  widths: number[],
  sizes: string,
): { src: string; srcSet?: string; sizes?: string } {
  try {
    const url = new URL(src);
    if (!isUnsplash(url) || widths.length === 0) return { src };
    const fallbackWidth = widths[Math.min(1, widths.length - 1)] ?? widths[0] ?? 640;
    return {
      src: withWidth(url, fallbackWidth),
      srcSet: widths.map((width) => `${withWidth(url, width)} ${width}w`).join(', '),
      sizes,
    };
  } catch {
    return { src };
  }
}

/** Ajusta o tamanho pedido ao CDN para avatares (2x para telas retina). */
export function getAvatarSrc(src: string, displaySize: number): string {
  try {
    const url = new URL(src);
    if (!isUnsplash(url)) return src;
    const pixels = String(Math.min(400, Math.round(displaySize * 2)));
    url.searchParams.set('w', pixels);
    url.searchParams.set('h', pixels);
    return url.toString();
  } catch {
    return src;
  }
}
