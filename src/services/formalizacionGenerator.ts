import type { FormalizacionGeneradaResult, FormulaClave, GraficaFuncion } from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';
import { esExpresionValida } from '@/utils/mathExpr';
import type { GenerarFaseParams } from './faseGenerator';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;

function claveCache(temaId: string): string {
  return `formalizacion:${temaId}`;
}

export function construirPromptFormalizacion(params: GenerarFaseParams): string {
  return `Eres un pedagogo experto en ${params.areaId === 'fisica' ? 'física' : 'matemáticas'}.

Genera la explicación formal de cierre para "${params.temaNombre}", para estudiantes de un
colegio de desempeño académico superior, después de que ya exploraron el concepto de forma
intuitiva (predicción y escenarios reales).

El resumen debe conectar lo intuitivo con el lenguaje formal, con rigor pero en 3-5 oraciones.
Incluye 1 a 2 fórmulas clave en LaTeX, cada una con una explicación breve de qué representa
cada símbolo.

Incluye tambien una "analogia": una comparación con una situación de la vida cotidiana de un
estudiante (no un ejemplo matemático más, sino algo tangible: deportes, videojuegos, redes
sociales, cocina, etc.) que ayude a fijar la intuición del concepto.

Si el concepto se beneficia de una representación gráfica (una función, un movimiento, una
curva), incluye "grafica": una expresión matemática de una sola variable "x" en notación
simple (+ - * / ^ y funciones sin, cos, tan, sqrt, abs, exp, log; ej. "x^2", "2*x+1",
"sin(x)"), con un rango razonable de x. Si no aplica, omite "grafica" por completo.

Responde SOLO en JSON: { "resumen": string, "analogia": string,
  "formulasClave": [{ "id": string, "nombre": string, "latex": string, "explicacion": string }],
  "grafica": { "expresion": string, "rangoX": [number, number], "titulo": string opcional,
    "etiquetaX": string opcional, "etiquetaY": string opcional } opcional }`;
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

function esGraficaValida(valor: unknown): valor is GraficaFuncion {
  if (!valor || typeof valor !== 'object') return false;
  const g = valor as Record<string, unknown>;
  if (typeof g.expresion !== 'string' || !esExpresionValida(g.expresion)) return false;
  if (!Array.isArray(g.rangoX) || g.rangoX.length !== 2) return false;
  const [min, max] = g.rangoX;
  return typeof min === 'number' && typeof max === 'number' && min < max;
}

interface FormalizacionCruda {
  resumen: string;
  analogia: string;
  formulasClave: FormulaClave[];
  grafica?: GraficaFuncion;
}

function esFormalizacionValida(valor: unknown): valor is FormalizacionCruda {
  if (!valor || typeof valor !== 'object') return false;
  const v = valor as Record<string, unknown>;
  if (typeof v.resumen !== 'string' || typeof v.analogia !== 'string') return false;
  if (!Array.isArray(v.formulasClave) || v.formulasClave.length === 0) return false;
  if (!v.formulasClave.every(esFormulaValida)) return false;
  if (v.grafica !== undefined && !esGraficaValida(v.grafica)) return false;
  return true;
}

async function solicitarFormalizacionRemota(params: GenerarFaseParams): Promise<FormalizacionCruda> {
  const prompt = construirPromptFormalizacion(params);
  const { data } = await aiClient.post<Record<string, unknown>>('/fases/formalizacion', {
    prompt,
    temaId: params.temaId,
  });
  if (!esFormalizacionValida(data)) throw new Error('Respuesta de /fases/formalizacion con formato invalido');
  return data;
}

function generarFormalizacionLocalFallback(params: GenerarFaseParams): FormalizacionCruda {
  return {
    resumen: `"${params.temaNombre}" se puede describir formalmente con una relación matemática que resume lo que ya exploraste de forma intuitiva.`,
    analogia: `Piensa en "${params.temaNombre}" como las reglas de un juego que ya conoces: una vez entiendes el patrón, puedes predecir el resultado antes de jugarlo.`,
    formulasClave: [
      {
        id: 'formula-generica',
        nombre: params.temaNombre,
        latex: 'a + b = c',
        explicacion: `Relación general que resume lo trabajado en "${params.temaNombre}": cada letra representa una cantidad clave del problema.`,
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
