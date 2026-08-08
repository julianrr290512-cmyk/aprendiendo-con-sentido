import { useEffect, useRef } from 'react';

export function useRenderCount(label: string): number {
  const count = useRef(0);
  count.current += 1;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug(`[render] ${label}: ${count.current}`);
    }
  });

  return count.current;
}

export function useMountedTime(label: string): void {
  useEffect(() => {
    const start = performance.now();
    return () => {
      if (import.meta.env.DEV) {
        const duration = performance.now() - start;
        console.debug(`[mounted] ${label}: ${duration.toFixed(0)}ms`);
      }
    };
  }, [label]);
}
