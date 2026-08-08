import { useQuery } from '@tanstack/react-query';
import {
  generarEscenariosExploracion,
  generarPreguntaPrediccion,
  type GenerarFaseParams,
} from '@/services/faseGenerator';
import { generarEjercicios, type GenerarEjerciciosParams } from '@/services/ejercicioGenerator';

export function usePreguntaPrediccion(params: GenerarFaseParams | null) {
  return useQuery({
    queryKey: ['fase-prediccion', params?.temaId],
    queryFn: () => generarPreguntaPrediccion(params as GenerarFaseParams),
    enabled: Boolean(params),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useEscenariosExploracion(params: GenerarFaseParams | null) {
  return useQuery({
    queryKey: ['fase-exploracion', params?.temaId],
    queryFn: () => generarEscenariosExploracion(params as GenerarFaseParams),
    enabled: Boolean(params),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useEjerciciosGenerados(params: GenerarEjerciciosParams | null) {
  return useQuery({
    queryKey: ['ejercicios', params?.nivelId],
    queryFn: () => generarEjercicios(params as GenerarEjerciciosParams),
    enabled: Boolean(params),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
