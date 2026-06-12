// pages/api/sync.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCellarInventory } from '@/lib/cellartracker';
import { createCache } from '@/lib/cache';
import type { SyncResponse, ApiError } from '@/types/wine';

const ONE_HOUR = 60 * 60 * 1000;
const cache = createCache<SyncResponse>(ONE_HOUR);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse | ApiError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'cellartracker_unavailable' });
  }

  const cached = cache.get();
  if (cached) return res.status(200).json(cached);

  const username = process.env['CELLARTRACKER_USERNAME'];
  if (!username) {
    return res.status(503).json({ error: 'cellartracker_unavailable' });
  }

  try {
    const data = await fetchCellarInventory(username);
    cache.set(data);
    return res.status(200).json(data);
  } catch {
    return res.status(503).json({ error: 'cellartracker_unavailable' });
  }
}
