// pages/api/pair.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseTabExport } from '@/lib/cellartracker';
import { getPairingSuggestions } from '@/lib/claude';
import { createCache } from '@/lib/cache';
import type { PairingResult, ApiError, SyncResponse } from '@/types/wine';

const ONE_HOUR = 60 * 60 * 1000;
const inventoryCache = createCache<SyncResponse>(ONE_HOUR);

// In testmode, skip the in-memory cache so each test gets a fresh fetch.
const isTestMode = !!process.env['NEXT_PRIVATE_TEST_PROXY'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PairingResult[] | ApiError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'pairing_unavailable' });
  }

  const meal = req.body?.meal;
  if (!meal || typeof meal !== 'string' || !meal.trim()) {
    return res.status(400).json({ error: 'no_inventory' });
  }

  let inventory = isTestMode ? undefined : inventoryCache.get();
  if (!inventory) {
    try {
      const filePath = join(process.cwd(), 'data', 'cellar.csv');
      const raw = readFileSync(filePath, 'utf-8');
      inventory = parseTabExport(raw);
      if (!isTestMode && inventory.wines.length > 0) {
        inventoryCache.set(inventory);
      }
    } catch {
      return res.status(503).json({ error: 'cellartracker_unavailable' });
    }
  }

  if (inventory.wines.length === 0) {
    return res.status(400).json({ error: 'no_inventory' });
  }

  try {
    const results = await getPairingSuggestions(meal.trim(), inventory.wines);
    return res.status(200).json(results);
  } catch {
    return res.status(503).json({ error: 'pairing_unavailable' });
  }
}
