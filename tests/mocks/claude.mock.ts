// tests/mocks/claude.mock.ts
import type { PairingResult } from '@/types/wine';
import { SAMPLE_INVENTORY } from './cellartracker.mock';

export const MOCK_PAIRING_RESULTS: PairingResult[] = [
  {
    wine: SAMPLE_INVENTORY[0]!,
    rationale: 'The bold structure of this Cabernet Blend stands up beautifully to the rich, fatty braised short ribs.',
    confidence: 'high',
  },
  {
    wine: SAMPLE_INVENTORY[2]!,
    rationale: 'A special occasion calls for DRC — the earthy Pinot Noir will complement the umami depth of the braising liquid.',
    confidence: 'medium',
  },
];
