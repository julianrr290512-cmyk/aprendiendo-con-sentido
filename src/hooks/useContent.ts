import { useQuery } from '@tanstack/react-query';
import { obtenerAreas } from '@/services/contentService';

export function useAreas() {
  return useQuery({
    queryKey: ['areas'],
    queryFn: obtenerAreas,
    staleTime: 10 * 60 * 1000,
  });
}
