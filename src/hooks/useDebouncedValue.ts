import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(valor: T, demoraMs = 300): T {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(valor), demoraMs);
    return () => window.clearTimeout(timer);
  }, [valor, demoraMs]);

  return debounced;
}
