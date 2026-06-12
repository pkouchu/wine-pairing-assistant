// lib/__tests__/claude.test.ts
import { describe, it, expect, vi } from 'vitest';
import { buildPairingPrompt, parsePairingResponse } from '../claude';
import type { Wine } from '@/types/wine';

const SAMPLE_WINES: Wine[] = [
  { name: 'Ridge Monte Bello', vintage: 2018, varietal: 'Cabernet Blend', location: 'Rack 1', quantity: 6, price: 89.99 },
  { name: 'Billecart-Salmon Brut Réserve', vintage: null, varietal: 'Chardonnay', location: 'Fridge', quantity: 2, price: 65 },
];

describe('buildPairingPrompt', () => {
  it('includes the meal description in the prompt', () => {
    const prompt = buildPairingPrompt('braised short ribs', SAMPLE_WINES);
    expect(prompt).toContain('braised short ribs');
  });

  it('includes each wine name in the prompt', () => {
    const prompt = buildPairingPrompt('grilled wagyu', SAMPLE_WINES);
    expect(prompt).toContain('Ridge Monte Bello');
    expect(prompt).toContain('Billecart-Salmon Brut Réserve');
  });

  it('renders NV vintage as "N.V." in the prompt', () => {
    const prompt = buildPairingPrompt('oysters', SAMPLE_WINES);
    expect(prompt).toContain('N.V.');
  });
});

describe('parsePairingResponse', () => {
  it('parses a valid JSON response from Claude', () => {
    const raw = JSON.stringify([
      {
        wineName: 'Ridge Monte Bello',
        rationale: 'The bold tannins complement the richness of the ribs.',
        confidence: 'high',
      },
    ]);
    const wines = SAMPLE_WINES;
    const results = parsePairingResponse(raw, wines);
    expect(results).toHaveLength(1);
    expect(results[0]!.wine.name).toBe('Ridge Monte Bello');
    expect(results[0]!.rationale).toBe('The bold tannins complement the richness of the ribs.');
    expect(results[0]!.confidence).toBe('high');
  });

  it('matches wine by name case-insensitively', () => {
    const raw = JSON.stringify([
      { wineName: 'ridge monte bello', rationale: 'Great match.', confidence: 'medium' },
    ]);
    const results = parsePairingResponse(raw, SAMPLE_WINES);
    expect(results[0]!.wine.name).toBe('Ridge Monte Bello');
  });

  it('skips suggestions where the wine is not found in inventory', () => {
    const raw = JSON.stringify([
      { wineName: 'Wine Not In Cellar', rationale: 'Ignore me.', confidence: 'low' },
    ]);
    const results = parsePairingResponse(raw, SAMPLE_WINES);
    expect(results).toHaveLength(0);
  });

  it('throws on malformed JSON', () => {
    expect(() => parsePairingResponse('not json', SAMPLE_WINES)).toThrow();
  });
});
