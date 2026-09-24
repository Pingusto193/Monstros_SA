import { ExternalLink, FileText } from 'lucide-react';
import { useId } from 'react';
import type { Sighting } from '@/types';
import { formatDateTime, formatLongDate } from '@/utils/date';
import { formatCoordinates, formatNumber, getMapUrl, getSightingCode } from '@/utils/format';
import styles from './SightingReport.module.css';

/** "Ficha do avistamento": os dados do registro organizados como documentação de campo. */
export function SightingReport({ sighting }: { sighting: Sighting }) {
  const titleId = useId();
  const { location } = sighting;
  const coordinates = location.coordinates;

  return (
    <section className={styles.report} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          <FileText size={14} aria-hidden="true" />
          Ficha do avistamento
        </h2>
        <span className={styles.code} title="Código do registro">
          {getSightingCode(sighting.id, sighting.createdAt)}
        </span>
      </header>

      <dl className={styles.grid}>
        <div className={styles.item}>
          <dt>Local</dt>
          <dd>{location.place}</dd>
        </div>
        <div className={styles.item}>
          <dt>Cidade</dt>
          <dd>{location.city}</dd>
        </div>
        <div className={styles.item}>
          <dt>Estado / região</dt>
          <dd>{location.region}</dd>
        </div>
        <div className={styles.item}>
          <dt>País</dt>
          <dd>{location.country}</dd>
        </div>
        <div className={styles.item}>
          <dt>Data</dt>
          <dd>{formatLongDate(sighting.sightingDate)}</dd>
        </div>
        <div className={styles.item}>
          <dt>Horário</dt>
          <dd className={sighting.sightingTime ? undefined : styles.muted}>{sighting.sightingTime ?? 'Não informado'}</dd>
        </div>
        <div className={`${styles.item} ${styles.wide}`}>
          <dt>Coordenadas</dt>
          <dd>
            {coordinates ? (
              <span className={styles.coordinates}>
                <span className={styles.mono}>{formatCoordinates(coordinates)}</span>
                {coordinates.accuracy !== null && (
                  <span className={styles.muted}> · precisão de ±{formatNumber(coordinates.accuracy)} m</span>
                )}
                <a className={styles.mapLink} href={getMapUrl(coordinates)} target="_blank" rel="noopener noreferrer">
                  Ver no mapa
                  <ExternalLink size={12} aria-hidden="true" />
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </span>
            ) : (
              <span className={styles.muted}>Não registradas</span>
            )}
          </dd>
        </div>
        <div className={`${styles.item} ${styles.wide}`}>
          <dt>Publicado em</dt>
          <dd>{formatDateTime(sighting.createdAt)}</dd>
        </div>
      </dl>
    </section>
  );
}
