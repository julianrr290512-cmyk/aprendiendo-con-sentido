import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const NIVELES_BLOOM = ['comprender', 'aplicar', 'analizar', 'evaluar', 'crear'];

const ESQUEMA_EJERCICIOS: GeminiJsonSchema = {
  type: 'object',
  properties: {
    ejercicios: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          temaId: { type: 'string' },
          tipo: { type: 'string', enum: ['opcion-multiple', 'respuesta-abierta', 'formula'] },
          nivelBloom: { type: 'string', enum: NIVELES_BLOOM },
          esTransferencia: { type: 'boolean' },
          enunciado: { type: 'string' },
          enunciadoLatex: { type: 'string' },
          opciones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                texto: { type: 'string' },
                esCorrecta: { type: 'boolean' },
              },
              required: ['id', 'texto', 'esCorrecta'],
            },
          },
          respuestaEsperada: { type: 'string' },
          retroalimentacionCorrecta: { type: 'string' },
          retroalimentacionIncorrecta: { type: 'string' },
          puntaje: { type: 'number' },
        },
        required: [
          'id',
          'temaId',
          'tipo',
          'nivelBloom',
          'esTransferencia',
          'enunciado',
          'retroalimentacionCorrecta',
          'retroalimentacionIncorrecta',
          'puntaje',
        ],
      },
    },
  },
  required: ['ejercicios'],
};

interface RequestBody {
  temaId?: string;
  areaId?: string;
  cantidad?: number;
}

/**
 * A diferencia de /fases/*, el frontend no arma el prompt aqui
 * (ejercicioGenerator.ts solo envia {temaId, areaId, cantidad}), asi que el
 * prompt se construye en el servidor.
 */
function construirPrompt(temaId: string, areaId: string, cantidad: number): string {
  return `Eres un pedagogo experto en ${areaId === 'fisica' ? 'física' : 'matemáticas'}.

Genera ${cantidad} ejercicios de práctica para el tema "${temaId}", dirigidos a estudiantes de
un colegio de desempeño académico superior (nivel alto, exige razonamiento riguroso).

Los ejercicios deben escalar en la taxonomía de Bloom, en este orden exacto de "nivelBloom":
1. "comprender", 2. "aplicar", 3. "analizar", 4. "evaluar", 5. "crear".
Los ejercicios 4 y 5 deben tener "esTransferencia": true — deben aplicar el concepto en un
contexto distinto al usado en los ejercicios anteriores (otra área de conocimiento, otra
situación de la vida real). Los ejercicios 1-3 tienen "esTransferencia": false.

Cada ejercicio tiene: id, temaId (usa "${temaId}"), tipo ("opcion-multiple",
"respuesta-abierta" o "formula"), nivelBloom, esTransferencia, enunciado, enunciadoLatex
opcional, opciones (solo si tipo es "opcion-multiple", con id/texto/esCorrecta),
respuestaEsperada (si no es opcion-multiple), retroalimentacionCorrecta,
retroalimentacionIncorrecta, y puntaje (10-20, creciente con el nivel de Bloom).

Responde SOLO en JSON: { "ejercicios": [...] } (exactamente ${cantidad} elementos, en el orden de Bloom indicado)`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  const { temaId, areaId, cantidad } = req.body as RequestBody;
  if (!temaId || !areaId || !cantidad) {
    res.status(400).json({ error: 'Faltan "temaId", "areaId" o "cantidad" en el cuerpo de la solicitud.' });
    return;
  }

  try {
    const prompt = construirPrompt(temaId, areaId, cantidad);
    const resultado = await generarJson<{ ejercicios: unknown[] }>({ prompt, schema: ESQUEMA_EJERCICIOS });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
