import { useQuery } from '@tanstack/react-query';
import { generarExplicacion, type GenerarExplicacionParams } from '@/services/explicacionGenerator';

export function useExplicacionGenerada(params: GenerarExplicacionParams | null) {
  return useQuery({
    queryKey: ['explicacion', params?.temaId, params?.gradoId, params?.descripcion],
    queryFn: () => generarExplicacion(params as GenerarExplicacionParams),
    enabled: Boolean(params),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
