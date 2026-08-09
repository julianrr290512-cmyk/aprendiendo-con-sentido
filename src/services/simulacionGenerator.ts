import type { SimulacionGeneradaResult } from '@/types';
import { aiClient } from './apiClient';
import { obtenerEntradaCache, guardarEntradaCache } from './contentCache';
import { retryWithBackoff } from '@/utils/retry';
import type { GenerarFaseParams } from './faseGenerator';

const TTL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;

function claveCache(temaId: string): string {
  return `simulacion:${temaId}`;
}

export function construirPromptSimulacion(params: GenerarFaseParams): string {
  const dba = params.dbaTexto.length > 0 ? params.dbaTexto.join(' | ') : 'No disponible.';

  return `Eres un pedagogo experto en matemáticas colombianas.

Elige la categoría de simulación interactiva más adecuada para enseñar ${params.temaNombre}
a estudiantes de ${params.grado}° con nivel ${params.dificultad}, entre estas 4 opciones:
- "algebra": balanza con 2-4 términos numéricos que deben sumar/igualar correctamente. Úsala para ecuaciones, funciones o cualquier relación algebraica.
- "geometria": el estudiante dibuja puntos/líneas y mide un ángulo o figura. Úsala para trigonometría, ángulos, figuras.
- "estadistica": el estudiante explora un conjunto de datos numéricos. Úsala para medidas de tendencia central, dispersión o probabilidad.
- "fracciones": dividir una barra o círculo en partes. Úsala solo para fracciones o proporciones básicas.

DBA oficial: ${dba}

Si eliges "algebra", los terminosDisponibles deben ser numéricamente consistentes (si un término
representa la suma de otros dos, los valores deben cumplirlo realmente).
Si eliges "estadistica", genera entre 5 y 8 valores numéricos realistas relacionados con ${params.temaNombre}.

Responde SOLO en JSON con esta forma exacta, incluyendo SOLO el config que corresponda a la
categoría elegida (los demás config* se omiten):
{ "categoria": "algebra"|"geometria"|"estadistica"|"fracciones", "formulaLatex": string opcional,
  "configAlgebra": { "terminosDisponibles": [{"id":string,"etiqueta":string,"simboloLatex":string,"valor":number}] } opcional,
  "configGeometria": { "instrucciones": string } opcional,
  "configEstadistica": { "etiquetaDataset": string, "unidad": string, "categorias": string[], "valores": number[] } opcional,
  "configFracciones": { "numeroPartes": number, "formaBase": "barra"|"circulo" } opcional }`;
}

function esSimulacionValida(valor: unknown): valor is Omit<SimulacionGeneradaResult, 'fuente'> {
  if (!valor || typeof valor !== 'object') return false;
  const categoria = (valor as Record<string, unknown>).categoria;
  return categoria === 'fracciones' || categoria === 'algebra' || categoria === 'geometria' || categoria === 'estadistica';
}

async function solicitarSimulacionRemota(
  params: GenerarFaseParams,
): Promise<Omit<SimulacionGeneradaResult, 'fuente'>> {
  const prompt = construirPromptSimulacion(params);
  const { data } = await aiClient.post<Record<string, unknown>>('/fases/simulacion', {
    prompt,
    temaId: params.temaId,
    grado: params.grado,
  });
  if (!esSimulacionValida(data)) throw new Error('Respuesta de /fases/simulacion con formato invalido');
  return data;
}

/** Balanza generica de 2 terminos: siempre numericamente consistente (10 = 6 + 4). */
function generarSimulacionLocalFallback(params: GenerarFaseParams): Omit<SimulacionGeneradaResult, 'fuente'> {
  return {
    categoria: 'algebra',
    formulaLatex: 'a + b = c',
    configAlgebra: {
      terminosDisponibles: [
        { id: 'a', etiqueta: `Parte de ${params.temaNombre} (6)`, simboloLatex: 'a', valor: 6 },
        { id: 'b', etiqueta: 'Complemento (4)', simboloLatex: 'b', valor: 4 },
        { id: 'c', etiqueta: 'Total (10)', simboloLatex: 'c', valor: 10 },
      ],
    },
  };
}

export async function generarSimulacion(params: GenerarFaseParams): Promise<SimulacionGeneradaResult> {
  const clave = claveCache(params.temaId);
  const cache = await obtenerEntradaCache<SimulacionGeneradaResult>(clave);

  if (cache) {
    const edadMs = Date.now() - cache.guardadoEn;
    if (edadMs < TTL_CACHE_MS) return cache.valor;
  }

  try {
    const datos = await retryWithBackoff(() => solicitarSimulacionRemota(params), {
      intentos: 2,
      baseMs: 500,
    });
    const resultado: SimulacionGeneradaResult = { ...datos, fuente: 'api' };
    await guardarEntradaCache(clave, resultado, 'api');
    return resultado;
  } catch {
    const resultado: SimulacionGeneradaResult = { ...generarSimulacionLocalFallback(params), fuente: 'local' };
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
