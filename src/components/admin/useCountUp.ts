import { useEffect, useRef, useState } from 'react';

/**
 * Smooth count-up animation that always lands exactly on the target value.
 * Respects prefers-reduced-motion (jumps straight to the final number) and
 * never blocks rendering — the real value is displayed once done.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) {
      setDisplay(target);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const value = from + (target - from) * eased;
      if (elapsed >= 1) {
        fromRef.current = target;
        setDisplay(target);
        return;
      }
      setDisplay(value);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return display;
}
