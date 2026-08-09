import type { FormalizacionGeneradaResult, FormulaClave } from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';
import type { GenerarFaseParams } from './faseGenerator';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;

function claveCache(temaId: string): string {
  return `formalizacion:${temaId}`;
}

export function construirPromptFormalizacion(params: GenerarFaseParams): string {
  const dba = params.dbaTexto.length > 0 ? params.dbaTexto.join(' | ') : 'No disponible.';

  return `Eres un pedagogo experto en matemáticas colombianas.

Genera el resumen formal de cierre para ${params.temaNombre}, dirigido a estudiantes de
${params.grado}° con nivel ${params.dificultad}, después de que ya exploraron el concepto de
forma intuitiva (predicción, simulación y escenarios reales).
DBA oficial: ${dba}

El resumen debe conectar lo intuitivo con el lenguaje matemático formal, en 2-4 oraciones.
Incluye 1 a 2 fórmulas clave en LaTeX, cada una con una explicación breve en lenguaje sencillo
de qué representa cada símbolo.

Responde SOLO en JSON: { "resumen": string,
  "formulasClave": [{ "id": string, "nombre": string, "latex": string, "explicacion": string }] }`;
}

function esFormulaValida(valor: unknown): valor is FormulaClave {
  if (!valor || typeof valor !== 'object') return false;
  const f = valor as Record<string, unknown>;
  return (
    typeof f.id === 'string' &&
    typeof f.nombre === 'string' &&
    typeof f.latex === 'string' &&
    typeof f.explicacion === 'string'
  );
}

function esFormalizacionValida(
  valor: unknown,
): valor is { resumen: string; formulasClave: FormulaClave[] } {
  if (!valor || typeof valor !== 'object') return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.resumen === 'string' &&
    Array.isArray(v.formulasClave) &&
    v.formulasClave.length > 0 &&
    v.formulasClave.every(esFormulaValida)
  );
}

async function solicitarFormalizacionRemota(
  params: GenerarFaseParams,
): Promise<{ resumen: string; formulasClave: FormulaClave[] }> {
  const prompt = construirPromptFormalizacion(params);
  const { data } = await aiClient.post<Record<string, unknown>>('/fases/formalizacion', {
    prompt,
    temaId: params.temaId,
    grado: params.grado,
  });
  if (!esFormalizacionValida(data)) throw new Error('Respuesta de /fases/formalizacion con formato invalido');
  return data;
}

function generarFormalizacionLocalFallback(
  params: GenerarFaseParams,
): { resumen: string; formulasClave: FormulaClave[] } {
  return {
    resumen: `${params.temaNombre} se puede describir formalmente con una relación matemática que resume lo que ya exploraste de forma intuitiva.`,
    formulasClave: [
      {
        id: 'formula-generica',
        nombre: params.temaNombre,
        latex: 'a + b = c',
        explicacion: `Relación general que resume lo trabajado en ${params.temaNombre}: cada letra representa una cantidad clave del problema.`,
      },
    ],
  };
}

export async function generarFormalizacion(
  params: GenerarFaseParams,
): Promise<FormalizacionGeneradaResult> {
  const clave = claveCache(params.temaId);
  const cache = await obtenerEntradaCache<FormalizacionGeneradaResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) return cache.valor;
  }

  try {
    const datos = await retryWithBackoff(() => solicitarFormalizacionRemota(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: FormalizacionGeneradaResult = { ...datos, fuente: 'api' };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: FormalizacionGeneradaResult = {
      ...generarFormalizacionLocalFallback(params),
      fuente: 'local',
    };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
