import axios from 'axios';

/**
 * Por defecto, ambos clientes apuntan al mismo origen (`/api/...`), que es
 * donde vive el backend en `api/` (funciones serverless de Vercel, mismo
 * proyecto que el frontend: sin CORS, sin URL externa que configurar).
 * `VITE_API_BASE_URL` / `VITE_AI_API_URL` solo hacen falta si el backend de
 * IA vive en otro dominio.
 *
 * En `npm run dev` (Vite solo, sin `vercel dev`) estas rutas /api no existen
 * todavia — cada servicio (contentService, narrativeGenerator, etc.) ya
 * valida la forma de la respuesta y cae a datos locales si no es la
 * esperada, asi que el desarrollo local sigue funcionando con contenido de
 * fallback. Para probar el backend real en local, usa `vercel dev`.
 */
const BASE_URL_DEFECTO = '/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || BASE_URL_DEFECTO,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 10000),
  headers: { 'Content-Type': 'application/json' },
});

export const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || import.meta.env.VITE_API_BASE_URL || BASE_URL_DEFECTO,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 10000),
  headers: { 'Content-Type': 'application/json' },
});

export const ENABLE_LOCAL_FALLBACK =
  import.meta.env.VITE_ENABLE_LOCAL_FALLBACK !== 'false';
