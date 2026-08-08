import { useQuery } from '@tanstack/react-query';
import {
  obtenerAreas,
  obtenerGradosPorArea,
  obtenerNivelesPorTema,
  obtenerTemasPorGrado,
} from '@/services/contentService';

export function useAreas() {
  return useQuery({
    queryKey: ['areas'],
    queryFn: obtenerAreas,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGradosPorArea(areaId: string | null) {
  return useQuery({
    queryKey: ['grados', areaId],
    queryFn: () => obtenerGradosPorArea(areaId as string),
    enabled: Boolean(areaId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTemasPorGrado(gradoId: string | null) {
  return useQuery({
    queryKey: ['temas', gradoId],
    queryFn: () => obtenerTemasPorGrado(gradoId as string),
    enabled: Boolean(gradoId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useNivelesPorTema(temaId: string | null) {
  return useQuery({
    queryKey: ['niveles', temaId],
    queryFn: () => obtenerNivelesPorTema(temaId as string),
    enabled: Boolean(temaId),
    staleTime: 10 * 60 * 1000,
  });
}
