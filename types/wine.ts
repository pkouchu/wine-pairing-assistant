// types/wine.ts
export type Wine = {
  name: string;
  vintage: number | null;   // null = Non-Vintage (NV)
  varietal: string;
  location: string;
  quantity: number;
  price: number | null;
};

export type PairingResult = {
  wine: Wine;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
};

export type SyncResponse = {
  wines: Wine[];
  skipped: number;
};

export type ApiError = {
  error:
    | 'cellartracker_unavailable'
    | 'pairing_unavailable'
    | 'no_inventory'
    | 'parse_error';
};
