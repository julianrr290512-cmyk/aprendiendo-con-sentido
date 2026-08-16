import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generarJson, type GeminiJsonSchema } from '../_lib/gemini.js';
import { requireMethod, responderError } from '../_lib/http.js';

const ESQUEMA_EXPLICACION: GeminiJsonSchema = {
  type: 'object',
  properties: {
    resumen: { type: 'string' },
    analogias: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          texto: { type: 'string' },
        },
        required: ['titulo', 'texto'],
      },
    },
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
    graficas: {
      type: 'array',
      minItems: 0,
      maxItems: 2,
      items: {
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
    ejercicios: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          categoria: { type: 'string', enum: ['conceptual', 'procedimental'] },
          tipo: { type: 'string', enum: ['opcion-multiple', 'respuesta-abierta', 'formula'] },
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
        },
        required: ['id', 'categoria', 'tipo', 'enunciado', 'retroalimentacionCorrecta', 'retroalimentacionIncorrecta'],
      },
    },
  },
  required: ['resumen', 'analogias', 'formulasClave', 'graficas', 'ejercicios'],
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
    const resultado = await generarJson<Record<string, unknown>>({ prompt, schema: ESQUEMA_EXPLICACION });
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}
