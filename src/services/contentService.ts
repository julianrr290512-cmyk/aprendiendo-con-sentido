import { areasFallback } from '@/data/areas';
import { gradosFallback, nivelesFallback, temasFallback } from '@/data/temas';
import type { ApiResponse, Area, Grado, Nivel, Tema } from '@/types';
import { ENABLE_LOCAL_FALLBACK, apiClient } from './apiClient';

/**
 * En `npm run dev` sin `vercel dev`, una ruta /api inexistente puede
 * responder 200 con el index.html de Vite (su fallback de SPA) en lugar de
 * un 404 real. Sin esta validacion, ese HTML se trataria como "datos" y
 * rompería el primer `.map()` en la UI en vez de caer al contenido local.
 */
function comoArray<T>(data: unknown): T[] {
  if (!Array.isArray(data)) {
    throw new Error('Respuesta de la API con formato invalido (se esperaba un array).');
  }
  return data as T[];
}

export async function obtenerAreas(): Promise<ApiResponse<Area[]>> {
  try {
    const { data } = await apiClient.get<Area[]>('/contenido/areas');
    return { data: comoArray<Area>(data), fuente: 'api', timestamp: new Date().toISOString() };
  } catch (error) {
    if (!ENABLE_LOCAL_FALLBACK) throw error;
    return { data: areasFallback, fuente: 'fallback-local', timestamp: new Date().toISOString() };
  }
}

export async function obtenerTemasPorGrado(gradoId: string): Promise<ApiResponse<Tema[]>> {
  try {
    const { data } = await apiClient.get<Tema[]>(`/contenido/grados/${gradoId}/temas`);
    return { data: comoArray<Tema>(data), fuente: 'api', timestamp: new Date().toISOString() };
  } catch (error) {
    if (!ENABLE_LOCAL_FALLBACK) throw error;
    const data = temasFallback.filter((tema) => tema.gradoId === gradoId);
    return { data, fuente: 'fallback-local', timestamp: new Date().toISOString() };
  }
}

export async function obtenerGradosPorArea(areaId: string): Promise<ApiResponse<Grado[]>> {
  try {
    const { data } = await apiClient.get<Grado[]>(`/contenido/areas/${areaId}/grados`);
    return { data: comoArray<Grado>(data), fuente: 'api', timestamp: new Date().toISOString() };
  } catch (error) {
    if (!ENABLE_LOCAL_FALLBACK) throw error;
    const data = gradosFallback.filter((grado) => grado.areaId === areaId);
    return { data, fuente: 'fallback-local', timestamp: new Date().toISOString() };
  }
}

export async function obtenerNivelesPorTema(temaId: string): Promise<ApiResponse<Nivel[]>> {
  try {
    const { data } = await apiClient.get<Nivel[]>(`/contenido/temas/${temaId}/niveles`);
    return { data: comoArray<Nivel>(data), fuente: 'api', timestamp: new Date().toISOString() };
  } catch (error) {
    if (!ENABLE_LOCAL_FALLBACK) throw error;
    const data = nivelesFallback.filter((nivel) => nivel.temaId === temaId);
    return { data, fuente: 'fallback-local', timestamp: new Date().toISOString() };
  }
}
