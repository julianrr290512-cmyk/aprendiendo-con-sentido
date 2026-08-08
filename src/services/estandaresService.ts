import {
  COMPETENCIAS_MATEMATICAS,
  PENSAMIENTOS_MATEMATICOS,
  estandaresLocal,
  gradoABanda,
} from '@/data/estandares-local';
import type { AreaId, EstandarBC, EstandaresResult, FuenteContenido } from '@/types';
import { retryWithBackoff } from '@/utils/retry';
import {
  estaDesactualizada,
  estaExpirada,
  guardarEntradaCache,
  obtenerEntradaCache,
} from './contentCache';

/**
 * pdf.js (~250KB minificado + un worker de ~1.3MB) se importa de forma dinamica, solo cuando
 * de verdad se necesita parsear un PDF (cache local vacia/expirada). Importarlo de forma
 * estatica lo meteria en el chunk de cualquier pagina que use este servicio, rompiendo el
 * presupuesto de <50KB por chunk de pagina.
 */
let pdfjsListo: Promise<typeof import('pdfjs-dist')> | null = null;

async function cargarPdfjs(): Promise<typeof import('pdfjs-dist')> {
  pdfjsListo ??= (async () => {
    const [pdfjsLib, { default: workerUrl }] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]);
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    return pdfjsLib;
  })();
  return pdfjsListo;
}

/**
 * FUENTE 1: PDF oficial del MEN. La URL que suele circular (.../articles-116042_archivo_pdf.pdf)
 * no resuelve; la URL real verificada del documento "Estandares Basicos de Competencias en
 * Lenguaje, Matematicas, Ciencias y Ciudadanas" (2006) es la de abajo.
 * FUENTE 2: PDF especifico de Matematicas (2003) publicado por Eduteka.
 *
 * NOTA IMPORTANTE: ambas son descargas de PDFs de ~0.5-1.8MB en servidores que no son APIs.
 * Un fetch() desde el navegador muy probablemente sera bloqueado por CORS en produccion
 * (estos servidores no estan pensados para consumo cross-origin desde una SPA). Aqui se
 * implementa el intento real via pdf.js; si CORS lo bloquea, la cascada cae a datos locales
 * sin romper la experiencia. Para que estas dos fuentes funcionen de forma confiable en
 * produccion se recomienda un proxy backend propio.
 */
const MEN_ESTANDARES_PDF_URL =
  import.meta.env.VITE_MEN_ESTANDARES_PDF_URL ||
  'https://www.mineducacion.gov.co/1621/articles-340021_recurso_1.pdf';

const EDUTEKA_ESTANDARES_PDF_URL =
  import.meta.env.VITE_EDUTEKA_ESTANDARES_PDF_URL ||
  'https://eduteka.icesi.edu.co/pdfdir/MENEstandaresMatematicas2003.pdf';

const MARCADORES_BANDA: Record<string, RegExp> = {
  '1-3': /1\s*[°º]?\s*a\s*3\s*[°º]?/i,
  '4-5': /4\s*[°º]?\s*a\s*5\s*[°º]?/i,
  '6-7': /6\s*[°º]?\s*a\s*7\s*[°º]?/i,
  '8-9': /8\s*[°º]?\s*a\s*9\s*[°º]?/i,
  '10-11': /10\s*[°º]?\s*a\s*11\s*[°º]?/i,
};

function claveCache(area: AreaId, banda: string): string {
  return `estandares:${area}:${banda}`;
}

async function extraerTextoPdf(url: string): Promise<string> {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!respuesta.ok) throw new Error(`PDF respondio ${respuesta.status}`);

  const buffer = await respuesta.arrayBuffer();
  const pdfjsLib = await cargarPdfjs();
  const documento = await pdfjsLib.getDocument({ data: buffer }).promise;

  const paginas: string[] = [];
  for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina++) {
    const pagina = await documento.getPage(numeroPagina);
    const contenido = await pagina.getTextContent();
    const texto = contenido.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    paginas.push(texto);
  }
  return paginas.join('\n');
}

/**
 * Extraccion heuristica: localiza el marcador de banda de grado en el texto y busca, cerca
 * de la mencion de cada "pensamiento", una oracion candidata a enunciado. Es best-effort por
 * naturaleza (el texto de un PDF con columnas pierde el orden de lectura); si no encuentra
 * suficientes coincidencias reconocibles, lanza para que la cascada continue.
 */
function extraerEstandaresDeTexto(texto: string, banda: string): EstandarBC[] {
  const marcador = MARCADORES_BANDA[banda];
  const coincidenciaBanda = marcador ? texto.match(marcador) : null;
  const inicioBusqueda = coincidenciaBanda?.index ?? 0;
  const seccion = texto.slice(inicioBusqueda, inicioBusqueda + 8000);

  const resultados: EstandarBC[] = [];
  for (const pensamiento of PENSAMIENTOS_MATEMATICOS) {
    const palabraClave = pensamiento.split(' ')[1] ?? pensamiento;
    const indice = seccion.toLowerCase().indexOf(palabraClave.toLowerCase());
    if (indice === -1) continue;

    const fragmento = seccion.slice(indice, indice + 500).replace(/\s+/g, ' ').trim();
    const oracion = fragmento.split(/(?<=[.;])\s/).find((frase) => frase.length > 40);
    if (oracion) {
      resultados.push({ enunciado: oracion.trim(), pensamiento, grupoGrados: banda });
    }
  }

  if (resultados.length < 2) {
    throw new Error(`Extraccion de PDF no encontro suficientes estandares reconocibles para la banda ${banda}`);
  }
  return resultados;
}

async function intentarPdf(
  url: string,
  banda: string,
): Promise<EstandarBC[]> {
  const texto = await extraerTextoPdf(url);
  return extraerEstandaresDeTexto(texto, banda);
}

async function obtenerEstandaresRemoto(
  banda: string,
): Promise<{ estandares: EstandarBC[]; fuente: Extract<FuenteContenido, 'api' | 'web'> }> {
  try {
    const estandares = await intentarPdf(MEN_ESTANDARES_PDF_URL, banda);
    return { estandares, fuente: 'api' };
  } catch {
    const estandares = await intentarPdf(EDUTEKA_ESTANDARES_PDF_URL, banda);
    return { estandares, fuente: 'web' };
  }
}

function obtenerEstandaresLocal(area: AreaId, banda: string): EstandarBC[] {
  return estandaresLocal[area]?.[banda] ?? [];
}

function construirResultado(
  area: AreaId,
  banda: string,
  estandares: EstandarBC[],
  fuente: FuenteContenido,
): EstandaresResult {
  return {
    estandares,
    pensamientos: [...PENSAMIENTOS_MATEMATICOS],
    competencias: [...COMPETENCIAS_MATEMATICAS],
    fuente,
    grupoGrados: banda,
    area,
  };
}

async function refrescarEnSegundoPlano(area: AreaId, banda: string, clave: string): Promise<void> {
  try {
    const { estandares, fuente } = await obtenerEstandaresRemoto(banda);
    await guardarEntradaCache(clave, construirResultado(area, banda, estandares, fuente), fuente);
  } catch {
    // Refresco silencioso: si falla, se conserva el valor cacheado existente.
  }
}

/**
 * Obtiene los Estandares Basicos de Competencias para un area y grado (mapeado a su banda
 * de grado oficial), intentando en cascada: cache valida -> PDF MEN -> PDF Eduteka -> datos
 * locales garantizados. Nunca rechaza la promesa ni pide datos al usuario.
 */
export async function fetchEstandares(area: AreaId, grado: number): Promise<EstandaresResult> {
  const banda = gradoABanda(grado);
  const clave = claveCache(area, banda);
  const cache = await obtenerEntradaCache<EstandaresResult>(clave);

  if (cache && !estaExpirada(cache)) {
    if (estaDesactualizada(cache)) {
      void refrescarEnSegundoPlano(area, banda, clave);
    }
    return cache.valor;
  }

  try {
    const { estandares, fuente } = await retryWithBackoff(() => obtenerEstandaresRemoto(banda), {
      intentos: 3,
      baseMs: 400,
    });
    const resultado = construirResultado(area, banda, estandares, fuente);
    await guardarEntradaCache(clave, resultado, fuente);
    return resultado;
  } catch {
    const resultado = construirResultado(area, banda, obtenerEstandaresLocal(area, banda), 'local');
    await guardarEntradaCache(clave, resultado, 'local');
    return resultado;
  }
}
