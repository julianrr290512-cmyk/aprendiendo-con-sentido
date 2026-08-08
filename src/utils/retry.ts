function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryOptions {
  intentos?: number;
  baseMs?: number;
  onIntentoFallido?: (intento: number, error: unknown) => void;
}

/**
 * Reintenta `fn` hasta `intentos` veces con backoff exponencial (baseMs * 2^intento).
 * Relanza el ultimo error si todos los intentos fallan.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  { intentos = 3, baseMs = 400, onIntentoFallido }: RetryOptions = {},
): Promise<T> {
  let ultimoError: unknown;

  for (let intento = 0; intento < intentos; intento++) {
    try {
      return await fn();
    } catch (error) {
      ultimoError = error;
      onIntentoFallido?.(intento + 1, error);
      const esUltimoIntento = intento === intentos - 1;
      if (!esUltimoIntento) {
        await esperar(baseMs * 2 ** intento);
      }
    }
  }

  throw ultimoError;
}
