import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const ESQUEMA_SIMULACION: GeminiJsonSchema = {
  type: 'object',
  properties: {
    categoria: { type: 'string', enum: ['fracciones', 'algebra', 'geometria', 'estadistica'] },
    formulaLatex: { type: 'string' },
    configFracciones: {
      type: 'object',
      properties: {
        numeroPartes: { type: 'number' },
        formaBase: { type: 'string', enum: ['barra', 'circulo'] },
      },
    },
    configAlgebra: {
      type: 'object',
      properties: {
        terminosDisponibles: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              etiqueta: { type: 'string' },
              simboloLatex: { type: 'string' },
              valor: { type: 'number' },
            },
            required: ['id', 'etiqueta', 'simboloLatex', 'valor'],
          },
        },
      },
    },
    configGeometria: {
      type: 'object',
      properties: {
        instrucciones: { type: 'string' },
      },
    },
    configEstadistica: {
      type: 'object',
      properties: {
        etiquetaDataset: { type: 'string' },
        unidad: { type: 'string' },
        categorias: { type: 'array', items: { type: 'string' } },
        valores: { type: 'array', items: { type: 'number' } },
      },
    },
  },
  required: ['categoria'],
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
    const resultado = await generarJson<Record<string, unknown>>({ prompt, schema: ESQUEMA_SIMULACION });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
