import { CalendarDays, MapPin, Pencil, Settings, Share2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/user/Avatar';
import { OfficialBadge } from '@/components/user/UserBadge';
import { useToast } from '@/hooks/useToast';
import type { UserProfile } from '@/types';
import { formatMonthYear } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { paths } from '@/utils/routes';
import { absoluteUrl, shareLink } from '@/utils/share';
import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { user, stats, regions } = profile;
  const toast = useToast();

  async function handleShare() {
    const result = await shareLink({
      title: `${user.name} no Rastro`,
      text: `Veja os avistamentos de @${user.username}`,
      url: absoluteUrl(paths.profile(user.username)),
    });
    if (result === 'copied') toast.success('Link do perfil copiado.');
    if (result === 'failed') toast.error('Não foi possível compartilhar agora.');
  }

  return (
    <header className={styles.header}>
      <div className={styles.avatar}>
        <Avatar user={user} size={150} decorative={false} className={styles.avatarLarge} />
        <Avatar user={user} size={86} decorative={false} className={styles.avatarSmall} />
      </div>

      <div className={styles.info}>
        <div className={styles.topRow}>
          <h1 className={styles.username}>
            {user.username}
            {user.isOfficial && <OfficialBadge size={18} />}
          </h1>
          <div className={styles.actions}>
            {isOwnProfile ? (
              <>
                <ButtonLink to={paths.editProfile} variant="secondary" size="sm" icon={<Pencil size={14} />}>
                  Editar perfil
                </ButtonLink>
                <Link to={paths.settings} className={styles.iconLink} aria-label="Configurações">
                  <Settings size={20} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <Button variant="secondary" size="sm" icon={<Share2 size={14} />} onClick={handleShare}>
                Compartilhar perfil
              </Button>
            )}
          </div>
        </div>

        <ul role="list" className={styles.stats}>
          <li>
            <strong>{formatNumber(stats.sightings)}</strong> {stats.sightings === 1 ? 'avistamento' : 'avistamentos'}
          </li>
          <li>
            <strong>{formatNumber(stats.likesReceived)}</strong> curtidas recebidas
          </li>
          <li>
            <strong>{formatNumber(stats.regions)}</strong> {stats.regions === 1 ? 'região' : 'regiões'}
          </li>
        </ul>

        <div className={styles.bio}>
          <p className={styles.name}>{user.name}</p>
          {user.bio ? (
            <p className={styles.bioText}>{user.bio}</p>
          ) : (
            isOwnProfile && (
              <p className={styles.bioEmpty}>
                Você ainda não escreveu uma biografia. <Link to={paths.editProfile}>Adicionar</Link>
              </p>
            )
          )}
          <p className={styles.since}>
            <CalendarDays size={13} aria-hidden="true" />
            Membro desde {formatMonthYear(user.createdAt)}
          </p>
        </div>

        {regions.length > 0 && (
          <ul role="list" className={styles.regions} aria-label="Regiões investigadas">
            {regions.map((region) => (
              <li key={region}>
                <Link to={paths.exploreRegion(region)} className={styles.region}>
                  <MapPin size={12} aria-hidden="true" />
                  {region}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className={styles.header} aria-hidden="true">
      <div className={styles.avatar}>
        <Skeleton circle width={150} height={150} className={styles.avatarLarge} />
        <Skeleton circle width={86} height={86} className={styles.avatarSmall} />
      </div>
      <div className={styles.info} style={{ display: 'grid', gap: 14 }}>
        <Skeleton width={180} height={20} />
        <Skeleton width={280} height={14} />
        <Skeleton width={220} height={12} />
        <Skeleton width={260} height={12} />
      </div>
    </div>
  );
}
