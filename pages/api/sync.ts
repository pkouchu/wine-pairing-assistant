// pages/api/sync.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseTabExport } from '@/lib/cellartracker';
import { createCache } from '@/lib/cache';
import type { SyncResponse, ApiError } from '@/types/wine';

const ONE_HOUR = 60 * 60 * 1000;
const cache = createCache<SyncResponse>(ONE_HOUR);

// In testmode, skip the in-memory cache so each test gets a fresh fetch.
const isTestMode = !!process.env['NEXT_PRIVATE_TEST_PROXY'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse | ApiError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'cellartracker_unavailable' });
  }

  const cached = isTestMode ? null : cache.get();
  if (cached) return res.status(200).json(cached);

  try {
    const filePath = join(process.cwd(), 'data', 'cellar.csv');
    const raw = readFileSync(filePath, 'utf-8');
    const data = parseTabExport(raw);
    if (!isTestMode) cache.set(data);
    return res.status(200).json(data);
  } catch {
    return res.status(503).json({ error: 'cellartracker_unavailable' });
  }
}
