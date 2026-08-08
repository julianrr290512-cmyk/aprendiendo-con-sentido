import { useQuery } from '@tanstack/react-query';
import { generarSlidesNarrativos, type GenerarNarrativaParams } from '@/services/narrativeGenerator';

export function useNarrativeSlides(params: GenerarNarrativaParams | null) {
  return useQuery({
    queryKey: ['narrativa-slides', params?.temaId, params?.nivelNombre],
    queryFn: () => generarSlidesNarrativos(params as GenerarNarrativaParams),
    enabled: Boolean(params),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
