import { GoogleGenAI } from '@google/genai';

const MODELO_DEFECTO = 'gemini-3.6-flash';

let cliente: GoogleGenAI | null = null;

function obtenerCliente(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurada en el servidor.');
  }
  cliente ??= new GoogleGenAI({ apiKey });
  return cliente;
}

/**
 * JSON Schema en el subconjunto que acepta Gemini (OpenAPI 3.0 simplificado):
 * type/properties/items/required/enum. Nada de $ref, oneOf, etc.
 */
export type GeminiJsonSchema = Record<string, unknown>;

interface GenerarJsonParams {
  prompt: string;
  schema: GeminiJsonSchema;
}

/**
 * Pide a Gemini una respuesta JSON que cumpla `schema` y la parsea. Nunca
 * atrapa errores aqui: cada endpoint decide como responder al fallo (los
 * servicios del frontend ya asumen que esta llamada puede fallar y caen a
 * contenido local, asi que dejamos que el error suba tal cual).
 */
export async function generarJson<T>({ prompt, schema }: GenerarJsonParams): Promise<T> {
  const ai = obtenerCliente();
  const modelo = process.env.GEMINI_MODEL || MODELO_DEFECTO;

  const respuesta = await ai.models.generateContent({
    model: modelo,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  const texto = respuesta.text;
  if (!texto) {
    throw new Error('Gemini respondio sin contenido de texto.');
  }

  return JSON.parse(texto) as T;
}
