import { useEffect, useRef, useState } from 'react';

/**
 * Chama `onLoadMore` quando o elemento sentinela se aproxima da área visível.
 * Retorna um ref callback para colocar no sentinela.
 */
export function useInfiniteScroll({
  onLoadMore,
  enabled,
  rootMargin = '800px 0px',
}: {
  onLoadMore: () => void;
  enabled: boolean;
  rootMargin?: string;
}) {
  const callback = useRef(onLoadMore);
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    callback.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!node || !enabled || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callback.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, enabled, rootMargin]);

  return setNode;
}
