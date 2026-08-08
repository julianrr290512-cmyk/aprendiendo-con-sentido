import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini';
import { requireMethod, responderError } from '../_lib/http';

const ESQUEMA_PREDICCION: GeminiJsonSchema = {
  type: 'object',
  properties: {
    contexto: { type: 'string' },
    pregunta: { type: 'string' },
  },
  required: ['pregunta'],
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
    const resultado = await generarJson<{ pregunta: string; contexto?: string }>({
      prompt,
      schema: ESQUEMA_PREDICCION,
    });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
