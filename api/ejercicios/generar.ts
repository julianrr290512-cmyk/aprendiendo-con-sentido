import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const ESQUEMA_EJERCICIOS: GeminiJsonSchema = {
  type: 'object',
  properties: {
    ejercicios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nivelId: { type: 'string' },
          tipo: { type: 'string', enum: ['opcion-multiple', 'respuesta-abierta', 'arrastrar-soltar', 'formula'] },
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
        required: ['id', 'nivelId', 'tipo', 'enunciado', 'retroalimentacionCorrecta', 'retroalimentacionIncorrecta', 'puntaje'],
      },
    },
  },
  required: ['ejercicios'],
};

interface RequestBody {
  temaId?: string;
  dificultad?: 'introductorio' | 'intermedio' | 'avanzado';
  cantidad?: number;
}

/**
 * A diferencia de /narrativa/slides y /fases/*, el frontend no arma el prompt
 * aqui (aiService.ts solo envia {temaId, dificultad, cantidad}), asi que el
 * prompt se construye en el servidor.
 */
function construirPrompt(temaId: string, dificultad: string, cantidad: number): string {
  return `Eres un pedagogo experto en matemáticas colombianas.

Genera ${cantidad} ejercicios de práctica para el tema "${temaId}", nivel ${dificultad}.
Sigue taxonomía de Bloom niveles 4-6 (análisis, evaluación, creación) — nada de
memorización pura. Usa contextos reales colombianos cuando aplique.

Cada ejercicio tiene: id, nivelId (usa "${temaId}"), tipo ("opcion-multiple",
"respuesta-abierta", "arrastrar-soltar" o "formula"), enunciado, enunciadoLatex
opcional, opciones (solo si tipo es "opcion-multiple", con id/texto/esCorrecta),
respuestaEsperada (si no es opcion-multiple), retroalimentacionCorrecta,
retroalimentacionIncorrecta, y puntaje (10-20).

Responde SOLO en JSON: { "ejercicios": [...] }`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  const { temaId, dificultad, cantidad } = req.body as RequestBody;
  if (!temaId || !dificultad || !cantidad) {
    res.status(400).json({ error: 'Faltan "temaId", "dificultad" o "cantidad" en el cuerpo de la solicitud.' });
    return;
  }

  try {
    const prompt = construirPrompt(temaId, dificultad, cantidad);
    const resultado = await generarJson<{ ejercicios: unknown[] }>({ prompt, schema: ESQUEMA_EJERCICIOS });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
