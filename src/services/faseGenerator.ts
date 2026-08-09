import type {
  AreaId,
  EscenarioExploracion,
  EscenariosExploracionResult,
  PreguntaItem,
  PreguntaPrediccionResult,
} from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_PALABRAS_DEFECTO = 20;
const CANTIDAD_PREDICCION = 2;
const CANTIDAD_EXPLORACION = 2;

export interface GenerarFaseParams {
  temaId: string;
  temaNombre: string;
  areaId: AreaId;
}

/**
 * Nivel objetivo fijo de toda la app: colegio de desempeño superior. Vive
 * como texto propio (no un parametro del modelo) porque es la politica
 * pedagogica de la app, no un detalle de la llamada a la API.
 */
const NIVEL_OBJETIVO = 'Nivel alto, para estudiantes de un colegio de desempeño académico superior. No simplifiques en exceso: exige razonamiento riguroso.';

/**
 * Instrucciones de taxonomia de Bloom compartidas por predicción y
 * exploración: nunca memorizacion, siempre analisis/evaluacion/creacion
 * (niveles 4-6).
 */
const FILOSOFIA_PREGUNTAS = `Las preguntas deben seguir la taxonomía de Bloom en niveles 4-6:
- Análisis: "¿Por qué crees que...?", "¿Qué patrón observas...?"
- Evaluación: "¿Es siempre cierto que...? Justifica con un contraejemplo"
- Creación: "Diseña una situación donde este concepto NO funcione"

NO generes preguntas de memorización. SÍ preguntas que exijan:
- Razonamiento causal ("¿Qué pasaría si cambiamos...?")
- Investigación ("Estima, luego verifica con un método diferente")
- Conexión ("¿Dónde más aparece este comportamiento?")`;

function claveCachePrediccion(temaId: string): string {
  return `fase-prediccion:${temaId}`;
}

function claveCacheExploracion(temaId: string): string {
  return `fase-exploracion:${temaId}`;
}

export function construirPromptPrediccion(params: GenerarFaseParams): string {
  return `Eres un pedagogo experto en ${params.areaId === 'fisica' ? 'física' : 'matemáticas'}.

${NIVEL_OBJETIVO}

${FILOSOFIA_PREGUNTAS}

Genera exactamente ${CANTIDAD_PREDICCION} preguntas de predicción profunda para "${params.temaNombre}",
cada una independiente de la otra (no dependen de la respuesta anterior).

Cada pregunta debe presentar una situación concreta y pedir una hipótesis justificada,
como: "Si duplicas cada lado de un cuadrado, ¿qué le pasa al área? ¿Se duplica también?
Escribe tu hipótesis y explica por qué."

Responde SOLO en JSON: { "preguntas": [{ "contexto": string opcional, "pregunta": string }] }
(exactamente ${CANTIDAD_PREDICCION} elementos)`;
}

export function construirPromptExploracion(params: GenerarFaseParams): string {
  return `Eres un pedagogo experto en ${params.areaId === 'fisica' ? 'física' : 'matemáticas'}.

${NIVEL_OBJETIVO}

${FILOSOFIA_PREGUNTAS}

Genera exactamente ${CANTIDAD_EXPLORACION} escenarios de exploración para "${params.temaNombre}",
ambientados en contextos reales y cercanos a la vida de un estudiante (tienda, transporte,
deporte, comida, tecnología, naturaleza).

Ejemplo de tono: "En una tienda de barrio, María compró [contexto real].
¿Qué operación necesita? ¿Por qué esa y no otra?"

Cada escenario necesita 3 pistas progresivas (la pista 1 orienta sin dar la respuesta,
la pista 3 casi la revela) y una explicación que se muestra despues de responder.

Responde SOLO en JSON con este array:
[{ "id": string, "contexto": string, "pregunta": string, "explicacion": string,
   "pistas": [string, string, string], "tiempoLimiteSeg": 90 }]
(exactamente ${CANTIDAD_EXPLORACION} elementos)`;
}

function esPreguntaItem(valor: unknown): valor is { pregunta: string; contexto?: string } {
  if (!valor || typeof valor !== 'object') return false;
  return typeof (valor as { pregunta?: unknown }).pregunta === 'string';
}

function esEscenarioValido(valor: unknown): valor is EscenarioExploracion {
  if (!valor || typeof valor !== 'object') return false;
  const e = valor as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.contexto === 'string' &&
    typeof e.pregunta === 'string' &&
    typeof e.explicacion === 'string' &&
    Array.isArray(e.pistas) &&
    e.pistas.length === 3
  );
}

async function solicitarPreguntasRemotas(
  params: GenerarFaseParams,
): Promise<{ pregunta: string; contexto?: string }[]> {
  const prompt = construirPromptPrediccion(params);
  const { data } = await aiClient.post<{ preguntas?: unknown }>('/fases/prediccion', {
    prompt,
    temaId: params.temaId,
  });
  if (!Array.isArray(data.preguntas) || !data.preguntas.every(esPreguntaItem)) {
    throw new Error('Respuesta de /fases/prediccion con formato invalido');
  }
  return data.preguntas;
}

async function solicitarEscenariosRemoto(params: GenerarFaseParams): Promise<EscenarioExploracion[]> {
  const prompt = construirPromptExploracion(params);
  const { data } = await aiClient.post<{ escenarios?: unknown }>('/fases/exploracion', {
    prompt,
    temaId: params.temaId,
  });
  if (!Array.isArray(data.escenarios) || !data.escenarios.every(esEscenarioValido)) {
    throw new Error('Respuesta de /fases/exploracion con formato invalido');
  }
  return data.escenarios;
}

function generarPreguntasLocalFallback(params: GenerarFaseParams): PreguntaItem[] {
  return [
    {
      contexto: `Vas a explorar "${params.temaNombre}".`,
      pregunta: `Si cambiaras uno de los valores clave de "${params.temaNombre}" al doble, ¿qué crees que pasaría con el resultado? Escribe tu hipótesis y explica tu razonamiento.`,
      minPalabras: MIN_PALABRAS_DEFECTO,
    },
    {
      contexto: `Piensa en un caso extremo de "${params.temaNombre}".`,
      pregunta: `¿Existe alguna situación donde "${params.temaNombre}" deje de comportarse como esperas? Describe esa situación y justifica por qué ocurriría.`,
      minPalabras: MIN_PALABRAS_DEFECTO,
    },
  ];
}

function generarEscenariosLocalFallback(params: GenerarFaseParams): EscenarioExploracion[] {
  return [
    {
      id: 'esc-generico-1',
      contexto: `Un estudiante necesita tomar una decisión cotidiana relacionada con "${params.temaNombre.toLowerCase()}".`,
      pregunta: `¿Qué relación de "${params.temaNombre}" necesita usar? ¿Por qué esa y no otra?`,
      explicacion: `La elección correcta depende de qué cantidad se busca: en "${params.temaNombre}" esa distinción es clave.`,
      pistas: [
        'Piensa en qué cantidad estás buscando: ¿un total, un promedio, o un cambio?',
        'Revisa qué datos tienes y cuáles te faltan para calcular esa cantidad.',
        'Aplica la relación que conecta directamente esos datos con lo que buscas.',
      ],
      tiempoLimiteSeg: 90,
    },
    {
      id: 'esc-generico-2',
      contexto: `Durante una actividad deportiva, alguien quiere explicar "${params.temaNombre.toLowerCase()}" con datos reales.`,
      pregunta: '¿Qué patrón observas en los datos y qué te dice sobre la situación?',
      explicacion: 'Identificar el patrón antes de calcular ayuda a verificar si el resultado numérico tiene sentido.',
      pistas: [
        'Observa si los valores suben, bajan o se mantienen.',
        'Compara los cambios entre datos consecutivos.',
        'El patrón que identificaste debería coincidir con el resultado de tu cálculo.',
      ],
      tiempoLimiteSeg: 90,
    },
  ];
}

async function refrescarPrediccionEnSegundoPlano(params: GenerarFaseParams, clave: string): Promise<void> {
  try {
    const preguntas = await solicitarPreguntasRemotas(params);
    await guardarEntradaCache(
      clave,
      {
        preguntas: preguntas.map((p) => ({ ...p, minPalabras: MIN_PALABRAS_DEFECTO })),
        fuente: 'api',
      } satisfies PreguntaPrediccionResult,
      'api',
    );
  } catch {
    // Refresco silencioso.
  }
}

export async function generarPreguntaPrediccion(
  params: GenerarFaseParams,
): Promise<PreguntaPrediccionResult> {
  const clave = claveCachePrediccion(params.temaId);
  const cache = await obtenerEntradaCache<PreguntaPrediccionResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) {
      if (edadMs > TTL_CACHE_MS / 2) void refrescarPrediccionEnSegundoPlano(params, clave);
      return cache.valor;
    }
  }

  try {
    const preguntas = await retryWithBackoff(() => solicitarPreguntasRemotas(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: PreguntaPrediccionResult = {
      preguntas: preguntas.map((p) => ({ ...p, minPalabras: MIN_PALABRAS_DEFECTO })),
      fuente: 'api',
    };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: PreguntaPrediccionResult = {
      preguntas: generarPreguntasLocalFallback(params),
      fuente: 'local',
    };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}

export async function generarEscenariosExploracion(
  params: GenerarFaseParams,
): Promise<EscenariosExploracionResult> {
  const clave = claveCacheExploracion(params.temaId);
  const cache = await obtenerEntradaCache<EscenariosExploracionResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) return cache.valor;
  }

  try {
    const escenarios = await retryWithBackoff(() => solicitarEscenariosRemoto(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: EscenariosExploracionResult = { escenarios, fuente: 'api' };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: EscenariosExploracionResult = {
      escenarios: generarEscenariosLocalFallback(params),
      fuente: 'local',
    };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
