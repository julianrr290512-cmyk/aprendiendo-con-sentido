import { openDB, type IDBPDatabase } from 'idb';
import type { FuenteContenido } from '@/types';

const DB_NAME = 'acs-content-cache';
const DB_VERSION = 1;
const STORE_NAME = 'contenido';

const TTL_EXPIRACION_MS = 7 * 24 * 60 * 60 * 1000;
const TTL_DESACTUALIZADO_MS = 3 * 24 * 60 * 60 * 1000;

export interface CacheEntry<T> {
  clave: string;
  valor: T;
  fuente: FuenteContenido;
  guardadoEn: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'clave' });
      }
    },
  });
  return dbPromise;
}

/**
 * Lectura best-effort: si IndexedDB no esta disponible (modo privado, SSR, navegador
 * restringido) la app debe seguir funcionando sin cache persistente, no romperse.
 */
export async function obtenerEntradaCache<T>(clave: string): Promise<CacheEntry<T> | undefined> {
  try {
    const db = await getDb();
    return (await db.get(STORE_NAME, clave)) as CacheEntry<T> | undefined;
  } catch {
    return undefined;
  }
}

export async function guardarEntradaCache<T>(
  clave: string,
  valor: T,
  fuente: FuenteContenido,
): Promise<void> {
  try {
    const db = await getDb();
    const entrada: CacheEntry<T> = { clave, valor, fuente, guardadoEn: Date.now() };
    await db.put(STORE_NAME, entrada);
  } catch {
    // Cache best-effort: un fallo aqui no debe interrumpir el flujo de contenido.
  }
}

export function estaExpirada(entrada: CacheEntry<unknown>): boolean {
  return Date.now() - entrada.guardadoEn > TTL_EXPIRACION_MS;
}

export function estaDesactualizada(entrada: CacheEntry<unknown>): boolean {
  return Date.now() - entrada.guardadoEn > TTL_DESACTUALIZADO_MS;
}
