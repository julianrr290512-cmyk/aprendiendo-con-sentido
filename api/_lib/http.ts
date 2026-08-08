import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Verifica el metodo HTTP y responde 405 si no coincide. Devuelve `true`
 * cuando el handler debe continuar, `false` cuando ya respondio y el
 * handler debe retornar de inmediato.
 */
export function requireMethod(req: VercelRequest, res: VercelResponse, metodo: 'GET' | 'POST'): boolean {
  if (req.method !== metodo) {
    res.setHeader('Allow', metodo);
    res.status(405).json({ error: `Metodo no permitido. Usa ${metodo}.` });
    return false;
  }
  return true;
}

/**
 * Traduce un error a una respuesta HTTP: 503 cuando es la falta de
 * configuracion de la API key (esperable hasta que se configure en Vercel),
 * 500 para cualquier otro fallo. El frontend ya cae a contenido local ante
 * cualquier respuesta no exitosa, asi que el mensaje es solo para depurar.
 */
export function responderError(res: VercelResponse, error: unknown): void {
  const mensaje = error instanceof Error ? error.message : 'Error desconocido';
  const esFaltaDeConfiguracion = mensaje.includes('GEMINI_API_KEY');
  res.status(esFaltaDeConfiguracion ? 503 : 500).json({ error: mensaje });
}
