import type { VercelRequest, VercelResponse } from '@vercel/node';
import { gradosFallback } from '../../../../src/data/temas';
import { requireMethod } from '../../../_lib/http';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'GET')) return;
  const { areaId } = req.query;
  const grados = gradosFallback.filter((grado) => grado.areaId === areaId);
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(grados);
}
