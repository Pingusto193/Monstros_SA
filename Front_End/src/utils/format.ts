import type { Coordinates, SightingLocation } from '@/types';

const numberFormat = new Intl.NumberFormat('pt-BR');
const coordinateFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** pluralize(3, 'curtida', 'curtidas') → "3 curtidas" */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** "46,7867° N, 121,7353° O" */
export function formatCoordinates({ latitude, longitude }: Coordinates): string {
  const lat = `${coordinateFormat.format(Math.abs(latitude))}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lng = `${coordinateFormat.format(Math.abs(longitude))}° ${longitude >= 0 ? 'L' : 'O'}`;
  return `${lat}, ${lng}`;
}

/** Link para o ponto no OpenStreetMap (link externo simples, sem API). */
export function getMapUrl({ latitude, longitude }: Coordinates): string {
  const lat = latitude.toFixed(5);
  const lng = longitude.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`;
}

/** "Ashford, Washington" */
export function formatCityRegion(location: Pick<SightingLocation, 'city' | 'region'>): string {
  return [location.city, location.region].filter(Boolean).join(', ');
}

/** "Ashford, Washington, Estados Unidos" */
export function formatCityRegionCountry(location: SightingLocation): string {
  return [location.city, location.region, location.country].filter(Boolean).join(', ');
}

/** Texto alternativo descritivo para a foto de um avistamento. */
export function getSightingAlt(sighting: {
  author: { name: string };
  location: Pick<SightingLocation, 'place' | 'city' | 'region'>;
}): string {
  const { place, city, region } = sighting.location;
  return `Foto do avistamento registrado por ${sighting.author.name} em ${place}, ${city}, ${region}.`;
}

/** Código de registro estável e legível, ex.: "RST-2026-4K9Q". */
export function getSightingCode(id: string, createdAt: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const suffix = hash.toString(36).toUpperCase().padStart(4, '0').slice(-4);
  return `RST-${new Date(createdAt).getFullYear()}-${suffix}`;
}
