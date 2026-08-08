import type {
  AiGenerarEjercicioRequest,
  AiGenerarEjercicioResponse,
  Ejercicio,
} from '@/types';
import { aiClient } from './apiClient';

export async function generarEjerciciosIA(
  request: AiGenerarEjercicioRequest,
): Promise<Ejercicio[]> {
  const { data } = await aiClient.post<AiGenerarEjercicioResponse>(
    '/ejercicios/generar',
    request,
  );
  return data.ejercicios;
}

export async function generarNarrativaIA(temaId: string): Promise<string> {
  const { data } = await aiClient.post<{ narrativa: string }>('/narrativa/generar', {
    temaId,
  });
  return data.narrativa;
}
