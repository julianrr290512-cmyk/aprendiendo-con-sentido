import type { VercelRequest, VercelResponse } from '@vercel/node';
import { temasFallback } from '../../../../src/data/temas';
import { requireMethod } from '../../../_lib/http';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'GET')) return;
  const { gradoId } = req.query;
  const temas = temasFallback.filter((tema) => tema.gradoId === gradoId);
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(temas);
}
