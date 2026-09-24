import { DAY_MS, toISODate } from '@/utils/date';

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

/**
 * Datas dos exemplos são relativas ao momento em que os dados são criados,
 * para que o feed sempre pareça "vivo" na primeira abertura.
 */
export function createSeedClock(now: number) {
  return {
    now,
    ago({ days = 0, hours = 0, minutes = 0 }: { days?: number; hours?: number; minutes?: number }) {
      return new Date(now - days * DAY_MS - hours * HOUR_MS - minutes * MINUTE_MS).toISOString();
    },
    dateAgo(days: number) {
      return toISODate(new Date(now - days * DAY_MS));
    },
  };
}

export type PhotoAspect = 'portrait' | 'square' | 'landscape';

const PHOTO_SIZES: Record<PhotoAspect, [number, number]> = {
  portrait: [1080, 1350],
  square: [1080, 1080],
  landscape: [1080, 720],
};

/** Fotos reais do Unsplash (licença livre), servidas pelo CDN deles com recorte definido. */
export function unsplashPhoto(photoId: string, aspect: PhotoAspect) {
  const [width, height] = PHOTO_SIZES[aspect];
  return {
    url: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`,
    width,
    height,
  };
}

export function unsplashAvatar(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&crop=faces&w=256&h=256&q=80`;
}
