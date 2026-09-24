import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { SightingPhoto } from '@/types';
import { cn } from '@/utils/cn';
import { getResponsiveImage, isSafeImageUrl } from '@/utils/image';
import styles from './SightingImage.module.css';

const WIDTHS = [480, 720, 1080];

interface SightingImageProps {
  photo: SightingPhoto;
  alt: string;
  /** Atributo sizes do srcset (quanto espaço a imagem ocupa na tela). */
  sizes: string;
  /** 'natural' respeita a proporção (limitada entre 4:5 e 1,91:1); 'square' recorta em quadrado. */
  aspect?: 'natural' | 'square';
  /** 'contain' mostra a foto inteira, sem cortes (usado na página de evidência). */
  fit?: 'cover' | 'contain';
  priority?: boolean;
  className?: string;
}

export function SightingImage({
  photo,
  alt,
  sizes,
  aspect = 'natural',
  fit = 'cover',
  priority = false,
  className,
}: SightingImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const ratio = aspect === 'square' ? 1 : Math.min(1.91, Math.max(0.8, photo.width / photo.height || 1));
  const safe = isSafeImageUrl(photo.url);
  const image = safe ? getResponsiveImage(photo.url, WIDTHS, sizes) : null;

  return (
    <div
      className={cn(styles.frame, fit === 'contain' && styles.contain, className)}
      style={{ aspectRatio: String(ratio) }}
      data-status={image ? status : 'error'}
    >
      {image && status !== 'error' ? (
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={image.sizes}
          alt={alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
          className={styles.image}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : (
        <div className={styles.fallback} role="img" aria-label={alt}>
          <ImageOff size={28} aria-hidden="true" />
          <span>Imagem indisponível</span>
        </div>
      )}
    </div>
  );
}
