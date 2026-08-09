import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const ESQUEMA_ESCENARIOS: GeminiJsonSchema = {
  type: 'object',
  properties: {
    escenarios: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          contexto: { type: 'string' },
          pregunta: { type: 'string' },
          explicacion: { type: 'string' },
          pistas: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: { type: 'string' },
          },
          tiempoLimiteSeg: { type: 'number' },
        },
        required: ['id', 'contexto', 'pregunta', 'explicacion', 'pistas'],
      },
    },
  },
  required: ['escenarios'],
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
    const resultado = await generarJson<{ escenarios: unknown[] }>({ prompt, schema: ESQUEMA_ESCENARIOS });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
