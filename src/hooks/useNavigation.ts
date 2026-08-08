import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { routePrefetchers, type RouteName } from '@/router/routes';

export function useNavigation() {
  const navigate = useNavigate();
  const prefetched = useRef(new Set<RouteName>());

  const prefetchRoute = useCallback((route: RouteName) => {
    if (prefetched.current.has(route)) return;
    prefetched.current.add(route);
    void routePrefetchers[route]();
  }, []);

  const navegarA = useCallback(
    (route: RouteName, path: string) => {
      prefetchRoute(route);
      navigate(path);
    },
    [navigate, prefetchRoute],
  );

  return { navegarA, prefetchRoute };
}
