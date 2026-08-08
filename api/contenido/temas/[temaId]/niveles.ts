import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nivelesFallback } from '../../../../src/data/temas';
import { requireMethod } from '../../../_lib/http';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'GET')) return;
  const { temaId } = req.query;
  const niveles = nivelesFallback.filter((nivel) => nivel.temaId === temaId);
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(niveles);
}
