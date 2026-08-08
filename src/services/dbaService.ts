import { ANIO_DBA_MATEMATICAS, dbaLocal } from '@/data/dba-local';
import type { AreaId, DBAResult, FuenteContenido } from '@/types';
import { retryWithBackoff } from '@/utils/retry';
import {
  estaDesactualizada,
  estaExpirada,
  guardarEntradaCache,
  obtenerEntradaCache,
} from './contentCache';

/**
 * FUENTE 1 (API oficial MEN): al verificar esta URL responde 404 hoy, no existe una API
 * publica documentada de DBA. Se deja implementada y configurable via VITE_MEN_DBA_API_URL
 * (por ejemplo, apuntando a un proxy propio) para que la cascada tenga efecto real si en el
 * futuro existe un endpoint valido; mientras tanto simplemente fallara rapido y se pasara a
 * la fuente 2.
 */
const MEN_DBA_API_URL =
  import.meta.env.VITE_MEN_DBA_API_URL || 'https://www.mineducacion.gov.co/portal/api/dba';

/**
 * FUENTE 2 (scraping Colombia Aprende): el portal no expone IDs de nodo estables por grado
 * de forma publica, e incluso teniendolos, un fetch() desde el navegador a este dominio muy
 * probablemente sera bloqueado por CORS (es un sitio de contenido, no una API). Por eso esta
 * fuente solo se activa si se configura explicitamente una plantilla de URL; si no hay
 * configuracion, se omite sin gastar una peticion de red que sabemos que fallara.
 */
const COLOMBIA_APRENDE_DBA_URL_TEMPLATE = import.meta.env.VITE_COLOMBIA_APRENDE_DBA_URL;

function claveCache(area: AreaId, grado: number): string {
  return `dba:${area}:${grado}`;
}

function nivelParaGrado(grado: number): 'primaria' | 'secundaria' {
  return grado <= 5 ? 'primaria' : 'secundaria';
}

async function intentarApiMen(area: AreaId, grado: number): Promise<string[]> {
  const url = new URL(MEN_DBA_API_URL);
  url.searchParams.set('area', area);
  url.searchParams.set('grado', String(grado));
  url.searchParams.set('nivel', nivelParaGrado(grado));

  const respuesta = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!respuesta.ok) throw new Error(`API MEN respondio ${respuesta.status}`);

  const datos = (await respuesta.json()) as { dba?: string[] };
  if (!datos.dba?.length) throw new Error('Respuesta de API MEN sin contenido de DBA');
  return datos.dba;
}

async function intentarScrapingColombiaAprende(grado: number): Promise<string[]> {
  if (!COLOMBIA_APRENDE_DBA_URL_TEMPLATE) {
    throw new Error('VITE_COLOMBIA_APRENDE_DBA_URL no configurada; se omite fuente web');
  }

  const url = COLOMBIA_APRENDE_DBA_URL_TEMPLATE.replace('{grado}', String(grado));
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!respuesta.ok) throw new Error(`Colombia Aprende respondio ${respuesta.status}`);

  const html = await respuesta.text();
  const documento = new DOMParser().parseFromString(html, 'text/html');
  const filas = Array.from(documento.querySelectorAll('table tr'));

  const dba = filas
    .map((fila) => fila.textContent?.replace(/\s+/g, ' ').trim())
    .filter((texto): texto is string => Boolean(texto && texto.length > 10));

  if (!dba.length) throw new Error('No se encontraron filas de DBA en la tabla esperada');
  return dba;
}

async function obtenerDbaRemoto(
  area: AreaId,
  grado: number,
): Promise<{ dba: string[]; fuente: Extract<FuenteContenido, 'api' | 'web'> }> {
  try {
    const dba = await intentarApiMen(area, grado);
    return { dba, fuente: 'api' };
  } catch {
    const dba = await intentarScrapingColombiaAprende(grado);
    return { dba, fuente: 'web' };
  }
}

function obtenerDbaLocal(area: AreaId, grado: number): string[] {
  return dbaLocal[area]?.[grado] ?? [];
}

function construirResultado(area: AreaId, grado: number, dba: string[], fuente: FuenteContenido): DBAResult {
  return { dba, fuente, grado, area, anio: ANIO_DBA_MATEMATICAS };
}

async function refrescarEnSegundoPlano(area: AreaId, grado: number, clave: string): Promise<void> {
  try {
    const { dba, fuente } = await obtenerDbaRemoto(area, grado);
    await guardarEntradaCache(clave, construirResultado(area, grado, dba, fuente), fuente);
  } catch {
    // Refresco silencioso: si falla, se conserva el valor cacheado existente.
  }
}

/**
 * Obtiene los Derechos Basicos de Aprendizaje para un area y grado, intentando en cascada:
 * cache valida -> API MEN -> scraping Colombia Aprende -> datos locales garantizados.
 * Nunca rechaza la promesa ni pide datos al usuario: siempre resuelve con algun contenido.
 */
export async function fetchDBA(area: AreaId, grado: number): Promise<DBAResult> {
  const clave = claveCache(area, grado);
  const cache = await obtenerEntradaCache<DBAResult>(clave);

  if (cache && !estaExpirada(cache)) {
    if (estaDesactualizada(cache)) {
      void refrescarEnSegundoPlano(area, grado, clave);
    }
    return cache.valor;
  }

  try {
    const { dba, fuente } = await retryWithBackoff(() => obtenerDbaRemoto(area, grado), {
      intentos: 3,
      baseMs: 400,
    });
    const resultado = construirResultado(area, grado, dba, fuente);
    await guardarEntradaCache(clave, resultado, fuente);
    return resultado;
  } catch {
    const resultado = construirResultado(area, grado, obtenerDbaLocal(area, grado), 'local');
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
