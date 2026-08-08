import { useQuery } from '@tanstack/react-query';
import { fetchDBA } from '@/services/dbaService';
import { fetchEstandares } from '@/services/estandaresService';
import type { AreaId } from '@/types';

/**
 * Orquesta la obtencion de DBA y Estandares oficiales para un area/grado: cache de 7 dias,
 * cascada api -> web -> local dentro de cada servicio (con reintento y backoff exponencial
 * ya resuelto ahi), y expone un unico estado de carga/error/fuente para la UI.
 *
 * Vive en su propio archivo (separado de useContent.ts) a proposito: dbaService/estandaresService
 * cargan pdf.js bajo demanda, y queremos que solo las paginas que de verdad llaman a este hook
 * paguen ese costo de bundle, sin arrastrarlo a paginas que solo navegan areas/grados/temas.
 *
 * `retry: false` es intencional: fetchDBA/fetchEstandares nunca rechazan la promesa (siempre
 * resuelven, en el peor caso con datos locales), asi que no hay nada que React Query deba
 * reintentar a este nivel.
 */
export function useContenidoCurricular(area: AreaId | null, grado: number | null) {
  const dbaQuery = useQuery({
    queryKey: ['dba', area, grado],
    queryFn: () => fetchDBA(area as AreaId, grado as number),
    enabled: Boolean(area) && grado !== null,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const estandaresQuery = useQuery({
    queryKey: ['estandares', area, grado],
    queryFn: () => fetchEstandares(area as AreaId, grado as number),
    enabled: Boolean(area) && grado !== null,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  return {
    dba: dbaQuery.data,
    estandares: estandaresQuery.data,
    loading: dbaQuery.isLoading || estandaresQuery.isLoading,
    error: dbaQuery.error ?? estandaresQuery.error ?? null,
    source: dbaQuery.data?.fuente ?? estandaresQuery.data?.fuente,
  };
}
