import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const ESQUEMA_SLIDES: GeminiJsonSchema = {
  type: 'object',
  properties: {
    slides: {
      type: 'array',
      minItems: 6,
      maxItems: 8,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tipo: { type: 'string', enum: ['historia', 'formula', 'analogia', 'pregunta', 'revelacion'] },
          titulo: { type: 'string' },
          contenido: { type: 'string' },
          formulaDestacada: { type: 'string' },
          sonido: { type: 'string', enum: ['intro', 'tension', 'descubrimiento', 'logro'] },
          duracionAuto: { type: 'number' },
        },
        required: ['id', 'tipo', 'titulo', 'contenido'],
      },
    },
  },
  required: ['slides'],
};

interface RequestBody {
  prompt?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  const { prompt } = req.body as RequestBody;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Falta "prompt" en el cuerpo de la solicitud.' });
    return;
  }

  try {
    const resultado = await generarJson<{ slides: unknown[] }>({ prompt, schema: ESQUEMA_SLIDES });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
