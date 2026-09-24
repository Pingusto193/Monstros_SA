import type { CSSProperties } from 'react';
import { cn } from '@/utils/cn';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width, height = 12, radius, circle, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skeleton, className)}
      style={{ width, height, borderRadius: circle ? '50%' : radius, ...style }}
    />
  );
}
