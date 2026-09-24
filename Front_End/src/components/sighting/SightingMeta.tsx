import { CalendarDays, MapPin } from 'lucide-react';
import type { Sighting } from '@/types';
import { formatSightingMoment } from '@/utils/date';
import { formatCityRegionCountry } from '@/utils/format';
import styles from './Post.module.css';

/** Bloco "nota de campo" com local e data do avistamento. */
export function SightingMeta({ sighting }: { sighting: Sighting }) {
  const { location } = sighting;
  return (
    <dl className={styles.meta}>
      <div className={styles.metaRow}>
        <dt>
          <MapPin size={15} aria-hidden="true" />
          <span className="sr-only">Local do avistamento</span>
        </dt>
        <dd>
          <span className={styles.metaPrimary}>{location.place}</span>
          <span className={styles.metaSecondary}>{formatCityRegionCountry(location)}</span>
        </dd>
      </div>
      <div className={styles.metaRow}>
        <dt>
          <CalendarDays size={15} aria-hidden="true" />
          <span className="sr-only">Data do avistamento</span>
        </dt>
        <dd>
          <span className={styles.metaPrimary}>Avistado em {formatSightingMoment(sighting.sightingDate, sighting.sightingTime)}</span>
        </dd>
      </div>
    </dl>
  );
}
