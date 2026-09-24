import { Link } from 'react-router';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRegions } from '@/hooks/queries/useSightings';
import { pluralize } from '@/utils/format';
import { getAvatarSrc, isSafeImageUrl } from '@/utils/image';
import { paths } from '@/utils/routes';
import styles from './RegionStrip.module.css';

/** Faixa de regiões com avistamentos (no estilo "stories"), atalho para o Explorar filtrado. */
export function RegionStrip() {
  const regions = useRegions();

  if (regions.isPending) {
    return (
      <div className={styles.strip} aria-hidden="true">
        <ul role="list" className={styles.list}>
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className={styles.item}>
              <Skeleton circle width={64} height={64} />
              <Skeleton width={52} height={10} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (regions.isError || !regions.data?.length) return null;

  return (
    <nav className={styles.strip} aria-label="Regiões com avistamentos">
      <ul role="list" className={styles.list}>
        {regions.data.map((region) => (
          <li key={`${region.region}-${region.country}`}>
            <Link to={paths.exploreRegion(region.region)} className={styles.item}>
              <span className={styles.ring}>
                {isSafeImageUrl(region.coverUrl) ? (
                  <img src={getAvatarSrc(region.coverUrl, 64)} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className={styles.placeholder} />
                )}
                <span className={styles.count} aria-hidden="true">
                  {region.count}
                </span>
              </span>
              <span className={styles.name}>{region.region}</span>
              <span className="sr-only">{`: ${pluralize(region.count, 'avistamento', 'avistamentos')}`}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
