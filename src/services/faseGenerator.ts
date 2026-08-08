import type {
  AreaId,
  EscenarioExploracion,
  EscenariosExploracionResult,
  PreguntaPrediccionResult,
} from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_PALABRAS_DEFECTO = 20;

export interface GenerarFaseParams {
  temaId: string;
  temaNombre: string;
  areaId: AreaId;
  grado: number;
  dificultad: 'introductorio' | 'intermedio' | 'avanzado';
  dbaTexto: string[];
}

/**
 * Instrucciones de taxonomia de Bloom compartidas por ambos generadores: nunca
 * memorizacion, siempre analisis/evaluacion/creacion (niveles 4-6). Vive como
 * texto propio (no un parametro del modelo) porque es la politica pedagogica
 * de la app, no un detalle de la llamada a la API.
 */
const FILOSOFIA_PREGUNTAS = `Las preguntas deben seguir la taxonomía de Bloom en niveles 4-6:
- Análisis: "¿Por qué crees que...?", "¿Qué patrón observas...?"
- Evaluación: "¿Es siempre cierto que...? Justifica con un contraejemplo"
- Creación: "Diseña una situación donde este concepto NO funcione"

NO generes preguntas de memorización. SÍ preguntas que exijan:
- Razonamiento causal ("¿Qué pasaría si cambiamos...?")
- Investigación ("Estima, luego verifica con un método diferente")
- Conexión ("¿Dónde más en matemáticas aparece este comportamiento?")`;

function claveCachePrediccion(temaId: string): string {
  return `fase-prediccion:${temaId}`;
}

function claveCacheExploracion(temaId: string): string {
  return `fase-exploracion:${temaId}`;
}

export function construirPromptPrediccion(params: GenerarFaseParams): string {
  const dba = params.dbaTexto.length > 0 ? params.dbaTexto.join(' | ') : 'No disponible.';
  return `Eres un pedagogo experto en matemáticas colombianas.

${FILOSOFIA_PREGUNTAS}

Genera exactamente 1 pregunta de predicción profunda para ${params.temaNombre}, dirigida a
estudiantes de ${params.grado}° con nivel ${params.dificultad}.
DBA oficial: ${dba}

La pregunta debe presentar una situación concreta y pedir una hipótesis justificada,
como: "Si duplicas cada lado de un cuadrado, ¿qué le pasa al área? ¿Se duplica también?
Escribe tu hipótesis y explica por qué."

Responde SOLO en JSON: { "contexto": string opcional, "pregunta": string }`;
}

export function construirPromptExploracion(params: GenerarFaseParams): string {
  const dba = params.dbaTexto.length > 0 ? params.dbaTexto.join(' | ') : 'No disponible.';
  return `Eres un pedagogo experto en matemáticas colombianas.

${FILOSOFIA_PREGUNTAS}

Genera exactamente 3 escenarios de exploración para ${params.temaNombre}
(grado ${params.grado}°, nivel ${params.dificultad}), ambientados en contextos reales
colombianos (tienda de barrio, transporte, deporte, comida, naturaleza).
DBA oficial: ${dba}

Ejemplo de tono: "En una tienda de barrio, María compró [contexto real colombiano].
¿Qué operación matemática necesita? ¿Por qué esa y no otra?"

Cada escenario necesita 3 pistas progresivas (la pista 1 orienta sin dar la respuesta,
la pista 3 casi la revela) y una explicación que se muestra despues de responder.

Responde SOLO en JSON con este array:
[{ "id": string, "contexto": string, "pregunta": string, "explicacion": string,
   "pistas": [string, string, string], "tiempoLimiteSeg": 90 }]
(exactamente 3 elementos)`;
}

function esPreguntaValida(valor: unknown): valor is { pregunta: string; contexto?: string } {
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

async function solicitarPreguntaRemota(
  params: GenerarFaseParams,
): Promise<{ pregunta: string; contexto?: string }> {
  const prompt = construirPromptPrediccion(params);
  const { data } = await aiClient.post<{ pregunta?: unknown; contexto?: unknown }>(
    '/fases/prediccion',
    { prompt, temaId: params.temaId, grado: params.grado },
  );
  if (!esPreguntaValida(data)) throw new Error('Respuesta de /fases/prediccion con formato invalido');
  return data;
}

async function solicitarEscenariosRemoto(params: GenerarFaseParams): Promise<EscenarioExploracion[]> {
  const prompt = construirPromptExploracion(params);
  const { data } = await aiClient.post<{ escenarios?: unknown }>('/fases/exploracion', {
    prompt,
    temaId: params.temaId,
    grado: params.grado,
  });
  if (!Array.isArray(data.escenarios) || !data.escenarios.every(esEscenarioValido)) {
    throw new Error('Respuesta de /fases/exploracion con formato invalido');
  }
  return data.escenarios;
}

/** Pregunta local garantizada para el tema de demostracion (velocidad/derivada). */
const PREDICCION_LOCAL_CONOCIDA: Record<string, { pregunta: string; contexto: string }> = {
  'tema-derivada-intro': {
    contexto: 'Una moto acelera de forma constante en una pista recta.',
    pregunta:
      'Si duplicas la velocidad de la moto, ¿qué le pasa a la distancia recorrida en el mismo tiempo? ¿Se duplica también, o cambia de otra forma? Escribe tu hipótesis y explica por qué.',
  },
};

function generarPreguntaLocalFallback(params: GenerarFaseParams): { pregunta: string; contexto?: string } {
  const conocida = PREDICCION_LOCAL_CONOCIDA[params.temaId];
  if (conocida) return conocida;
  return {
    contexto: `Vas a explorar ${params.temaNombre}.`,
    pregunta: `Si cambiaras uno de los valores clave de ${params.temaNombre} al doble, ¿qué crees que pasaría con el resultado? Escribe tu hipótesis y explica tu razonamiento.`,
  };
}

const EXPLORACION_LOCAL_CONOCIDA: Record<string, EscenarioExploracion[]> = {
  'tema-derivada-intro': [
    {
      id: 'esc-1',
      contexto:
        'En una tienda de barrio en Medellín, don Jairo vende arepas. Cada hora anota cuántas arepas lleva vendidas: hora 1: 12, hora 2: 27, hora 3: 45.',
      pregunta: '¿La velocidad de venta (arepas por hora) es constante? ¿Cómo lo sabes sin calcular todas las diferencias?',
      explicacion:
        'Comparando los incrementos (15 y 18) vemos que la tasa de cambio no es constante: las ventas se aceleran, igual que una velocidad que aumenta con el tiempo.',
      pistas: [
        'Compara cuánto aumentó de la hora 1 a la 2, y de la 2 a la 3.',
        'Si la venta fuera constante, ambos incrementos serían iguales. ¿Lo son?',
        'El incremento pasó de 15 a 18: la tasa de cambio esta aumentando, no es constante.',
      ],
      tiempoLimiteSeg: 90,
    },
    {
      id: 'esc-2',
      contexto:
        'Un bus intermunicipal sale de Bogotá hacia Girardot. A los 30 minutos lleva 40 km recorridos; a los 60 minutos lleva 95 km.',
      pregunta: '¿Qué operación matemática necesitas para estimar la velocidad promedio en ese tramo? ¿Por qué esa y no otra?',
      explicacion:
        'La velocidad promedio es la razón de cambio: (distancia final - distancia inicial) / (tiempo final - tiempo inicial). Es una division de diferencias, no una resta simple ni un producto.',
      pistas: [
        'La velocidad relaciona una distancia recorrida con el tiempo que tomó recorrerla.',
        'Necesitas la diferencia de distancias y la diferencia de tiempos.',
        'Divide el cambio en distancia entre el cambio en tiempo: (95-40)/(60-30).',
      ],
      tiempoLimiteSeg: 90,
    },
    {
      id: 'esc-3',
      contexto:
        'Una atleta colombiana acelera en los últimos 100 metros de una carrera: pasa de 8 m/s a 10 m/s en 4 segundos.',
      pregunta: '¿Dónde más en matemáticas aparece este mismo comportamiento de "razón de cambio de una razón de cambio"?',
      explicacion:
        'La aceleración es la derivada de la velocidad, igual que la velocidad es la derivada de la posición. Ese patrón de "derivada de una derivada" aparece tambien en economía (aceleración de precios) y en fisica (jerk, el cambio de la aceleración).',
      pistas: [
        'La velocidad es la razón de cambio de la posición respecto al tiempo.',
        'La aceleración es la razón de cambio de... ¿de qué cantidad?',
        'La aceleración es la derivada de la velocidad: una "derivada de una derivada".',
      ],
      tiempoLimiteSeg: 90,
    },
  ],
};

function generarEscenariosLocalFallback(params: GenerarFaseParams): EscenarioExploracion[] {
  const conocidos = EXPLORACION_LOCAL_CONOCIDA[params.temaId];
  if (conocidos) return conocidos;

  return [
    {
      id: 'esc-generico-1',
      contexto: `En un mercado campesino colombiano, un vendedor de ${params.temaNombre.toLowerCase()} necesita tomar una decisión con sus datos del día.`,
      pregunta: `¿Qué operación matemática relacionada con ${params.temaNombre} necesita? ¿Por qué esa y no otra?`,
      explicacion: `La eleccion correcta depende de si se busca un total, una razon o un cambio: en ${params.temaNombre} esa distincion es clave.`,
      pistas: [
        'Piensa en qué cantidad estás buscando: ¿un total, un promedio, o un cambio?',
        'Revisa qué datos tienes y cuáles te faltan para calcular esa cantidad.',
        'Aplica la operación que relaciona directamente esos datos con lo que buscas.',
      ],
      tiempoLimiteSeg: 90,
    },
    {
      id: 'esc-generico-2',
      contexto: `Durante un partido de fútbol en Colombia, un comentarista quiere explicar ${params.temaNombre.toLowerCase()} con las estadísticas del equipo.`,
      pregunta: '¿Qué patrón observas en los datos y qué te dice sobre la situación?',
      explicacion: 'Identificar el patrón antes de calcular ayuda a verificar si el resultado numérico tiene sentido.',
      pistas: [
        'Observa si los valores suben, bajan o se mantienen.',
        'Compara los cambios entre datos consecutivos.',
        'El patrón que identificaste debería coincidir con el resultado de tu cálculo.',
      ],
      tiempoLimiteSeg: 90,
    },
    {
      id: 'esc-generico-3',
      contexto: `Un estudiante colombiano está diseñando una receta de cocina y quiere usar ${params.temaNombre.toLowerCase()} para ajustar las cantidades.`,
      pregunta: 'Diseña una situación donde este concepto NO funcione como esperas. ¿Qué lo rompe?',
      explicacion: 'Buscar contraejemplos revela las condiciones bajo las cuales un concepto matemático deja de aplicar.',
      pistas: [
        'Piensa en un caso extremo: ¿qué pasa con valores muy grandes o muy pequeños?',
        'Piensa en un caso donde falte un dato necesario.',
        'Si cambias una condición clave del problema, el concepto puede dejar de aplicar tal cual.',
      ],
      tiempoLimiteSeg: 90,
    },
  ];
}

async function refrescarPrediccionEnSegundoPlano(params: GenerarFaseParams, clave: string): Promise<void> {
  try {
    const { pregunta, contexto } = await solicitarPreguntaRemota(params);
    await guardarEntradaCache(
      clave,
      { pregunta, contexto, minPalabras: MIN_PALABRAS_DEFECTO, fuente: 'api' } satisfies PreguntaPrediccionResult,
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
    const { pregunta, contexto } = await retryWithBackoff(() => solicitarPreguntaRemota(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: PreguntaPrediccionResult = {
      pregunta,
      contexto,
      minPalabras: MIN_PALABRAS_DEFECTO,
      fuente: 'api',
    };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const { pregunta, contexto } = generarPreguntaLocalFallback(params);
    const resultado: PreguntaPrediccionResult = {
      pregunta,
      contexto,
      minPalabras: MIN_PALABRAS_DEFECTO,
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
