import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Sighting } from '@/types';
import { formatNumber, pluralize } from '@/utils/format';
import { paths } from '@/utils/routes';
import styles from './SightingGrid.module.css';
import { SightingImage } from './SightingImage';

const GRID_SIZES = '(max-width: 767px) 34vw, 320px';

const SightingTile = memo(function SightingTile({ sighting }: { sighting: Sighting }) {
  const { location } = sighting;
  const label = `Avistamento em ${location.place}, ${location.city} — ${pluralize(sighting.likeCount, 'curtida', 'curtidas')} e ${pluralize(sighting.commentCount, 'comentário', 'comentários')}`;

  return (
    <Link to={paths.sighting(sighting.id)} className={styles.tile} aria-label={label}>
      <SightingImage photo={sighting.photo} alt="" sizes={GRID_SIZES} aspect="square" />
      <span className={styles.label} aria-hidden="true">
        <MapPin size={11} />
        <span>
          {location.city}, {location.region}
        </span>
      </span>
      <span className={styles.overlay} aria-hidden="true">
        <span>
          <Heart size={18} fill="currentColor" strokeWidth={0} />
          {formatNumber(sighting.likeCount)}
        </span>
        <span>
          <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
          {formatNumber(sighting.commentCount)}
        </span>
      </span>
    </Link>
  );
});

export function SightingGrid({ sightings }: { sightings: Sighting[] }) {
  return (
    <ul role="list" className={styles.grid}>
      {sightings.map((sighting) => (
        <li key={sighting.id}>
          <SightingTile sighting={sighting} />
        </li>
      ))}
    </ul>
  );
}

export function SightingGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <ul role="list" className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Skeleton width="100%" height="auto" radius={0} className={styles.skeleton} />
        </li>
      ))}
    </ul>
  );
}
