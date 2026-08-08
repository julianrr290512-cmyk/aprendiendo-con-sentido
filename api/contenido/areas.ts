import type { VercelRequest, VercelResponse } from '@vercel/node';
import { areasFallback } from '../../src/data/areas';
import { requireMethod } from '../_lib/http';

/**
 * Catalogo curricular servido desde el mismo modulo de datos que usa el
 * frontend como fallback local (src/data/areas.ts): una sola fuente de
 * verdad, ahora expuesta como API real en vez de solo vivir en el bundle.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'GET')) return;
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(areasFallback);
}
