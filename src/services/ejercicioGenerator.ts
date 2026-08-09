import type { AreaId, Ejercicio, NivelBloom } from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';
import { generarEjerciciosFallbackGenerico } from '@/data/ejerciciosFallbackGenerico';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
const CANTIDAD_EJERCICIOS = 5;
const NIVELES_BLOOM: NivelBloom[] = ['comprender', 'aplicar', 'analizar', 'evaluar', 'crear'];
const TIPOS_VALIDOS = ['opcion-multiple', 'respuesta-abierta', 'formula'];

export interface GenerarEjerciciosParams {
  temaId: string;
  temaNombre: string;
  areaId: AreaId;
}

export interface EjerciciosResult {
  ejercicios: Ejercicio[];
  fuente: 'api' | 'local';
}

function claveCache(temaId: string): string {
  return `ejercicios:${temaId}`;
}

function esEjercicioValido(valor: unknown): valor is Ejercicio {
  if (!valor || typeof valor !== 'object') return false;
  const e = valor as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.tipo === 'string' &&
    TIPOS_VALIDOS.includes(e.tipo) &&
    typeof e.nivelBloom === 'string' &&
    NIVELES_BLOOM.includes(e.nivelBloom as NivelBloom) &&
    typeof e.esTransferencia === 'boolean' &&
    typeof e.enunciado === 'string' &&
    typeof e.retroalimentacionCorrecta === 'string' &&
    typeof e.retroalimentacionIncorrecta === 'string' &&
    typeof e.puntaje === 'number'
  );
}

async function solicitarEjerciciosRemoto(params: GenerarEjerciciosParams): Promise<Ejercicio[]> {
  const { data } = await aiClient.post<{ ejercicios?: unknown[] }>('/ejercicios/generar', {
    temaId: params.temaNombre,
    areaId: params.areaId,
    cantidad: CANTIDAD_EJERCICIOS,
  });
  if (!Array.isArray(data.ejercicios) || !data.ejercicios.every(esEjercicioValido)) {
    throw new Error('Respuesta de /ejercicios/generar con formato invalido');
  }
  return data.ejercicios.map((ej) => ({ ...ej, temaId: params.temaId }));
}

function generarEjerciciosLocalFallback(params: GenerarEjerciciosParams): Ejercicio[] {
  return generarEjerciciosFallbackGenerico(params.temaId, params.temaNombre);
}

/**
 * Obtiene los 5 ejercicios de practica para un tema, en cascada: cache
 * valida (30 dias) -> backend propio (Gemini) -> ejercicios locales
 * genericos garantizados.
 */
export async function generarEjercicios(params: GenerarEjerciciosParams): Promise<EjerciciosResult> {
  const clave = claveCache(params.temaId);
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
