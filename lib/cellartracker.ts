// lib/cellartracker.ts
import type { SyncResponse, Wine } from '@/types/wine';

export function buildExportUrl(username: string): string {
  return `https://www.cellartracker.com/list.asp?iUserOverride=${username}&Table=List&fInStock=1&format=tab`;
}

export function parseTabExport(raw: string): SyncResponse {
  const lines = raw.split('\n').map((l) => l.trimEnd());
  const [header, ...dataLines] = lines;

  if (!header) return { wines: [], skipped: 0 };

  const cols = header.split('\t');
  const idx = (name: string) => cols.indexOf(name);

  const wines: Wine[] = [];
  let skipped = 0;

  for (const line of dataLines) {
    if (!line.trim()) continue;
    const cells = line.split('\t');

    const name = cells[idx('Wine')]?.trim() ?? '';
    const vintageRaw = cells[idx('Vintage')]?.trim() ?? '';
    const varietal = cells[idx('Varietal')]?.trim() ?? '';
    const qtyRaw = cells[idx('Quantity')]?.trim() ?? '';

    if (!name || !varietal || !qtyRaw) {
      skipped++;
      continue;
    }

    const quantity = parseInt(qtyRaw, 10);
    if (isNaN(quantity) || quantity <= 0) {
      skipped++;
      continue;
    }

    const vintageNum = parseInt(vintageRaw, 10);
    const vintage = isNaN(vintageNum) ? null : vintageNum;

    const priceRaw = cells[idx('Price')]?.trim() ?? '';
    const priceNum = parseFloat(priceRaw);
    const price = isNaN(priceNum) ? null : priceNum;

    wines.push({
      name,
      vintage,
      varietal,
      location: cells[idx('Bin')]?.trim() ?? '',
      quantity,
      price,
    });
  }

  return { wines, skipped };
}

export async function fetchCellarInventory(username: string): Promise<SyncResponse> {
  const url = buildExportUrl(username);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`cellartracker_unavailable: ${res.status}`);
  }
  const text = await res.text();
  return parseTabExport(text);
}
