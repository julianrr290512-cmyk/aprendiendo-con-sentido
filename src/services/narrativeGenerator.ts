import type { AreaId, NarrativeSlidesResult, SlideNarrativo } from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;

export interface GenerarNarrativaParams {
  temaId: string;
  temaNombre: string;
  areaId: AreaId;
  grado: number;
  nivelNombre: string;
  dificultad: 'introductorio' | 'intermedio' | 'avanzado';
  dbaTexto: string[];
  estandarTexto: string;
}

const ETIQUETA_NIVEL: Record<GenerarNarrativaParams['dificultad'], string> = {
  introductorio: 'básico',
  intermedio: 'medio',
  avanzado: 'avanzado',
};

function claveCache(temaId: string, nivelNombre: string): string {
  return `narrativa:${temaId}:${nivelNombre}`;
}

/**
 * Construye el prompt en español que el backend debe enviar a Claude para
 * generar la secuencia narrativa. Vive aqui (no en el backend) para que el
 * contrato de contenido pedagogico este versionado junto con el resto del
 * dominio curricular del frontend; el backend solo lo reenvia a la API.
 */
export function construirPromptNarrativa(params: GenerarNarrativaParams): string {
  const dba = params.dbaTexto.length > 0 ? params.dbaTexto.join(' | ') : 'No disponible.';

  return `Eres un pedagogo experto en matemáticas colombianas.
Genera una secuencia narrativa de 6-8 slides para enseñar ${params.temaNombre} a estudiantes de ${params.grado}° con nivel ${ETIQUETA_NIVEL[params.dificultad]}.
DBA oficial: ${dba}
Estándar BC: ${params.estandarTexto || 'No disponible.'}

Cada slide debe: conectar con una historia real motivadora,
incluir fórmulas en LaTeX cuando corresponda,
usar analogías del contexto colombiano (fútbol, cocina,
arquitectura, naturaleza colombiana).

Responde SOLO en JSON con el array de slides. Cada slide tiene esta forma:
{
  "id": string,
  "tipo": "historia" | "formula" | "analogia" | "pregunta" | "revelacion",
  "titulo": string,
  "contenido": string (puede incluir LaTeX entre $...$),
  "formulaDestacada": string opcional (LaTeX),
  "sonido": "intro" | "tension" | "descubrimiento" | "logro" (opcional),
  "duracionAuto": number opcional (ms)
}`;
}

function esSlideValido(valor: unknown): valor is SlideNarrativo {
  if (!valor || typeof valor !== 'object') return false;
  const s = valor as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.tipo === 'string' &&
    typeof s.titulo === 'string' &&
    typeof s.contenido === 'string'
  );
}

/**
 * Llama al backend propio (nunca a Anthropic directamente desde el navegador:
 * eso expondria la API key en el bundle). `VITE_AI_API_URL` debe apuntar a un
 * proxy server-side que reciba este prompt y llame a la Messages API con el
 * modelo claude-sonnet-5 y salida estructurada (output_config.format). Ver
 * server-example/narrativa-slides.example.ts para una implementacion de referencia.
 */
async function solicitarSlidesRemoto(params: GenerarNarrativaParams): Promise<SlideNarrativo[]> {
  const prompt = construirPromptNarrativa(params);
  const { data } = await aiClient.post<{ slides?: unknown }>('/narrativa/slides', {
    prompt,
    temaId: params.temaId,
    grado: params.grado,
    dificultad: params.dificultad,
  });

  if (!Array.isArray(data.slides) || !data.slides.every(esSlideValido)) {
    throw new Error('Respuesta de /narrativa/slides con formato invalido');
  }
  return data.slides;
}

function generarSlidesLocalFallback(params: GenerarNarrativaParams): SlideNarrativo[] {
  const nivel = ETIQUETA_NIVEL[params.dificultad];

  return [
    {
      id: 'local-1-historia',
      tipo: 'historia',
      titulo: 'Un reto por resolver',
      contenido: `En ${params.grado}° vas a explorar ${params.temaNombre}. Como en cualquier buen problema, todo empieza con una pregunta que parece simple.`,
      sonido: 'intro',
      duracionAuto: 4200,
    },
    {
      id: 'local-2-analogia',
      tipo: 'analogia',
      titulo: 'Esto ya lo conoces',
      contenido: `${params.temaNombre} aparece en situaciones cotidianas, aunque no lo notes a simple vista.`,
      duracionAuto: 5200,
    },
    {
      id: 'local-3-formula',
      tipo: 'formula',
      titulo: 'Así se ve una relación matemática',
      contenido: `Este es un ejemplo de como se arma una formula paso a paso. La formula real de ${params.temaNombre} la vas a construir en la fase de formalizacion.`,
      sonido: 'descubrimiento',
      duracionAuto: 5200,
    },
    {
      id: 'local-4-pregunta',
      tipo: 'pregunta',
      titulo: '¿Qué opinas?',
      contenido: `Antes de seguir: ¿en que situacion de tu vida diaria crees que aparece ${params.temaNombre.toLowerCase()}?`,
    },
    {
      id: 'local-5-revelacion',
      tipo: 'revelacion',
      titulo: '¡Lo lograste!',
      contenido: `Ya tienes las bases de ${params.temaNombre} en nivel ${nivel}. Es momento de ponerlo en practica.`,
      sonido: 'logro',
      duracionAuto: 3600,
    },
  ];
}

async function refrescarEnSegundoPlano(params: GenerarNarrativaParams, clave: string): Promise<void> {
  try {
    const slides = await solicitarSlidesRemoto(params);
    await guardarEntradaCache(clave, { slides, fuente: 'api', temaId: params.temaId }, 'api');
  } catch {
    // Refresco silencioso: si falla, se conserva el valor cacheado existente.
  }
}

/**
 * Obtiene los slides narrativos para un tema/nivel, en cascada: cache valida
 * (30 dias) -> backend propio (que llama a Claude) -> slides locales
 * garantizados. Nunca rechaza la promesa: siempre resuelve con contenido.
 */
export async function generarSlidesNarrativos(
  params: GenerarNarrativaParams,
): Promise<NarrativeSlidesResult> {
  const clave = claveCache(params.temaId, params.nivelNombre);
  const cache = await obtenerEntradaCache<NarrativeSlidesResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) {
      if (edadMs > TTL_CACHE_MS / 2) void refrescarEnSegundoPlano(params, clave);
      return cache.valor;
    }
  }

  try {
    const slides = await retryWithBackoff(() => solicitarSlidesRemoto(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: NarrativeSlidesResult = { slides, fuente: 'api', temaId: params.temaId };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: NarrativeSlidesResult = {
      slides: generarSlidesLocalFallback(params),
      fuente: 'local',
      temaId: params.temaId,
    };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
