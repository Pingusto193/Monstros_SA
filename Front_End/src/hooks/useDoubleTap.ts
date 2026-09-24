import { useRef, type PointerEvent } from 'react';

/** Detecta toque/clique duplo (funciona no celular, onde o dblclick nem sempre dispara). */
export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const last = useRef<{ time: number; x: number; y: number } | null>(null);

  return {
    onPointerUp(event: PointerEvent) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const previous = last.current;
      const isDouble =
        previous !== null &&
        event.timeStamp - previous.time < delay &&
        Math.abs(event.clientX - previous.x) < 30 &&
        Math.abs(event.clientY - previous.y) < 30;

      if (isDouble) {
        last.current = null;
        onDoubleTap();
      } else {
        last.current = { time: event.timeStamp, x: event.clientX, y: event.clientY };
      }
    },
  };
}
