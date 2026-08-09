import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const ESQUEMA_FORMALIZACION: GeminiJsonSchema = {
  type: 'object',
  properties: {
    resumen: { type: 'string' },
    analogia: { type: 'string' },
    formulasClave: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nombre: { type: 'string' },
          latex: { type: 'string' },
          explicacion: { type: 'string' },
        },
        required: ['id', 'nombre', 'latex', 'explicacion'],
      },
    },
    grafica: {
      type: 'object',
      properties: {
        expresion: { type: 'string' },
        rangoX: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: { type: 'number' },
        },
        titulo: { type: 'string' },
        etiquetaX: { type: 'string' },
        etiquetaY: { type: 'string' },
      },
      required: ['expresion', 'rangoX'],
    },
  },
  required: ['resumen', 'analogia', 'formulasClave'],
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
    const resultado = await generarJson<Record<string, unknown>>({ prompt, schema: ESQUEMA_FORMALIZACION });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
