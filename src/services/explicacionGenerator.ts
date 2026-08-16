import type {
  AnalogiaVidaReal,
  AreaId,
  Ejercicio,
  ExplicacionGeneradaResult,
  FormulaClave,
  GradoId,
  GraficaFuncion,
} from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';
import { esExpresionValida } from '@/utils/mathExpr';
import { slugify } from '@/utils/slugify';
import { generarExplicacionFallback } from '@/data/explicacionFallback';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
const TIPOS_VALIDOS = ['opcion-multiple', 'respuesta-abierta', 'formula'];
const CATEGORIAS_VALIDAS = ['conceptual', 'procedimental'];

export interface GenerarExplicacionParams {
  temaId: string;
  temaNombre: string;
  areaId: AreaId;
  gradoId: GradoId;
  /** Enfoque libre que el usuario escribio para darle contexto a la IA. */
  descripcion: string;
}

function claveCache(params: GenerarExplicacionParams): string {
  const focoSlug = slugify(params.descripcion).slice(0, 60) || 'sin-enfoque';
  return `explicacion:${params.temaId}:${params.gradoId}:${focoSlug}`;
}

export function construirPromptExplicacion(params: GenerarExplicacionParams): string {
  const materia = params.areaId === 'fisica' ? 'física' : 'matemáticas';
  const foco = params.descripcion.trim()
    ? `El estudiante pidió enfocarse en lo siguiente: "${params.descripcion.trim()}". Dale prioridad a ese enfoque en toda la explicación.`
    : 'El estudiante no especificó un enfoque particular: cubre el concepto de forma general.';

  return `Eres un pedagogo experto en ${materia}, explicando a un estudiante de grado ${params.gradoId}° de colegio.

Tema: "${params.temaNombre}".
${foco}

Genera una única explicación completa y autocontenida (sin preguntas de predicción ni fases previas)
con estas partes:

1. "resumen": explicación clara y rigurosa del concepto, adecuada para grado ${params.gradoId}° (3-6 oraciones).

2. "analogias": exactamente 3 analogías de la vida real que ayuden a entender el concepto, cada una
   con "titulo" (corto) y "texto" (la comparación en sí). Deben ser situaciones tangibles y distintas
   entre sí (deportes, videojuegos, cocina, redes sociales, naturaleza, tecnología, etc.), no ejemplos
   matemáticos disfrazados.

3. "formulasClave": entre 1 y 3 fórmulas escritas correctamente en LaTeX, cada una con "nombre" y
   "explicacion" de qué representa cada símbolo.

4. "graficas": entre 0 y 2 gráficas (solo inclúyelas si el concepto se beneficia de una representación
   gráfica, como una función, un movimiento o una curva). Cada gráfica es una expresión matemática de
   una sola variable "x" en notación simple (+ - * / ^ y funciones sin, cos, tan, sqrt, abs, exp, log;
   ej. "x^2", "2*x+1", "sin(x)"), con un rango razonable de x. Si no aplica, responde "graficas": [].

5. "ejercicios": exactamente 2 ejercicios de práctica sobre "${params.temaNombre}":
   - Uno con "categoria": "conceptual" (evalúa comprensión del concepto, sin cálculos mecánicos).
   - Uno con "categoria": "procedimental" (exige aplicar un procedimiento o cálculo concreto).
   Cada ejercicio tiene: id, categoria, tipo ("opcion-multiple", "respuesta-abierta" o "formula"),
   enunciado, enunciadoLatex opcional, opciones (solo si tipo es "opcion-multiple", con
   id/texto/esCorrecta), respuestaEsperada (si el tipo no es "opcion-multiple"),
   retroalimentacionCorrecta y retroalimentacionIncorrecta.

Responde SOLO en JSON: { "resumen": string, "analogias": [...], "formulasClave": [...],
  "graficas": [...], "ejercicios": [...] }`;
}

function esAnalogiaValida(valor: unknown): valor is AnalogiaVidaReal {
  if (!valor || typeof valor !== 'object') return false;
  const a = valor as Record<string, unknown>;
  return typeof a.titulo === 'string' && typeof a.texto === 'string';
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

function esEjercicioValido(valor: unknown): valor is Ejercicio {
  if (!valor || typeof valor !== 'object') return false;
  const e = valor as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.categoria === 'string' &&
    CATEGORIAS_VALIDAS.includes(e.categoria) &&
    typeof e.tipo === 'string' &&
    TIPOS_VALIDOS.includes(e.tipo) &&
    typeof e.enunciado === 'string' &&
    typeof e.retroalimentacionCorrecta === 'string' &&
    typeof e.retroalimentacionIncorrecta === 'string'
  );
}

interface ExplicacionCruda {
  resumen: string;
  analogias: AnalogiaVidaReal[];
  formulasClave: FormulaClave[];
  graficas: GraficaFuncion[];
  ejercicios: Ejercicio[];
}

function esExplicacionValida(valor: unknown): valor is ExplicacionCruda {
  if (!valor || typeof valor !== 'object') return false;
  const v = valor as Record<string, unknown>;
  if (typeof v.resumen !== 'string') return false;
  if (!Array.isArray(v.analogias) || v.analogias.length !== 3 || !v.analogias.every(esAnalogiaValida)) return false;
  if (!Array.isArray(v.formulasClave) || v.formulasClave.length === 0 || !v.formulasClave.every(esFormulaValida)) {
    return false;
  }
  if (!Array.isArray(v.graficas) || !v.graficas.every(esGraficaValida)) return false;
  if (!Array.isArray(v.ejercicios) || v.ejercicios.length !== 2 || !v.ejercicios.every(esEjercicioValido)) {
    return false;
  }
  return true;
}

async function solicitarExplicacionRemota(params: GenerarExplicacionParams): Promise<ExplicacionCruda> {
  const prompt = construirPromptExplicacion(params);
  const { data } = await aiClient.post<Record<string, unknown>>('/explicacion/generar', {
    prompt,
    temaId: params.temaId,
  });
  if (!esExplicacionValida(data)) throw new Error('Respuesta de /explicacion/generar con formato invalido');
  return {
    ...data,
    ejercicios: data.ejercicios.map((ej) => ({ ...ej, temaId: params.temaId })),
  };
}

/**
 * Obtiene la explicacion completa de un tema, en cascada: cache valida
 * (30 dias, con clave por tema+grado+enfoque) -> backend propio (Gemini) ->
 * contenido local generico garantizado.
 */
export async function generarExplicacion(
  params: GenerarExplicacionParams,
): Promise<ExplicacionGeneradaResult> {
  const clave = claveCache(params);
  const cache = await obtenerEntradaCache<ExplicacionGeneradaResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) return cache.valor;
  }

  try {
    const datos = await retryWithBackoff(() => solicitarExplicacionRemota(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: ExplicacionGeneradaResult = { ...datos, fuente: 'api' };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: ExplicacionGeneradaResult = {
      ...generarExplicacionFallback(params),
      fuente: 'local',
    };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
