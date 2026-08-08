import type { AreaId, Ejercicio } from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';
import { ejerciciosFallback } from '@/data/contenidoNivel';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
const CANTIDAD_EJERCICIOS = 4;

export interface GenerarEjerciciosParams {
  nivelId: string;
  temaNombre: string;
  areaId: AreaId;
  dificultad: 'introductorio' | 'intermedio' | 'avanzado';
}

export interface EjerciciosResult {
  ejercicios: Ejercicio[];
  fuente: 'api' | 'local';
}

function claveCache(nivelId: string): string {
  return `ejercicios:${nivelId}`;
}

function esEjercicioValido(valor: unknown): valor is Ejercicio {
  if (!valor || typeof valor !== 'object') return false;
  const e = valor as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.tipo === 'string' &&
    typeof e.enunciado === 'string' &&
    typeof e.retroalimentacionCorrecta === 'string' &&
    typeof e.retroalimentacionIncorrecta === 'string' &&
    typeof e.puntaje === 'number'
  );
}

async function solicitarEjerciciosRemoto(params: GenerarEjerciciosParams): Promise<Ejercicio[]> {
  const { data } = await aiClient.post<{ ejercicios?: unknown[] }>('/ejercicios/generar', {
    temaId: params.temaNombre,
    dificultad: params.dificultad,
    cantidad: CANTIDAD_EJERCICIOS,
  });
  if (!Array.isArray(data.ejercicios) || !data.ejercicios.every(esEjercicioValido)) {
    throw new Error('Respuesta de /ejercicios/generar con formato invalido');
  }
  return data.ejercicios.map((ej) => ({ ...ej, nivelId: params.nivelId }));
}

function generarEjerciciosLocalFallback(params: GenerarEjerciciosParams): Ejercicio[] {
  return ejerciciosFallback[params.nivelId] ?? [];
}

/**
 * Obtiene los ejercicios de practica para un nivel, en cascada: cache valida
 * (30 dias) -> backend propio (Gemini) -> ejercicios locales garantizados
 * (que pueden ser una lista vacia si el nivel no tiene fallback estatico).
 */
export async function generarEjercicios(params: GenerarEjerciciosParams): Promise<EjerciciosResult> {
  const clave = claveCache(params.nivelId);
  const cache = await obtenerEntradaCache<EjerciciosResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) return cache.valor;
  }

  try {
    const ejercicios = await retryWithBackoff(() => solicitarEjerciciosRemoto(params), {
      intentos: 2,
      baseMs: 500,
    });
    if (ejercicios.length === 0) throw new Error('El backend devolvio una lista vacia de ejercicios');
    const resultado: EjerciciosResult = { ejercicios, fuente: 'api' };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: EjerciciosResult = {
      ejercicios: generarEjerciciosLocalFallback(params),
      fuente: 'local',
    };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
