// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import type { Wine, PairingResult } from '@/types/wine';

export function buildPairingPrompt(meal: string, wines: Wine[]): string {
  const inventory = wines
    .map((w) => {
      const vintage = w.vintage !== null ? w.vintage : 'N.V.';
      const price = w.price !== null ? `$${w.price}` : 'price unknown';
      return `- ${vintage} ${w.name} (${w.varietal}) | Bin: ${w.location || 'unspecified'} | Qty: ${w.quantity} | ${price}`;
    })
    .join('\n');

  return `Here is a wine inventory:\n${inventory}\n\nMeal: ${meal}\n\nFrom the inventory above, suggest 3-5 bottles that pair well with this meal. Return a JSON array with objects having these keys: wineName (exact name from inventory), rationale (1-2 sentences), confidence ("high" | "medium" | "low"). Return only the JSON array, no other text.`;
}

type ClaudesuggestionRaw = {
  wineName: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
};

export function parsePairingResponse(raw: string, inventory: Wine[]): PairingResult[] {
  const parsed = JSON.parse(raw) as ClaudesuggestionRaw[];
  const results: PairingResult[] = [];

  for (const item of parsed) {
    const wine = inventory.find(
      (w) => w.name.toLowerCase() === item.wineName.toLowerCase()
    );
    if (!wine) continue;
    results.push({ wine, rationale: item.rationale, confidence: item.confidence });
  }

  return results;
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
  return _client;
}

export async function getPairingSuggestions(
  meal: string,
  wines: Wine[]
): Promise<PairingResult[]> {
  const client = getClient();
  const inventoryText = wines
    .map((w) => {
      const vintage = w.vintage !== null ? w.vintage : 'N.V.';
      const price = w.price !== null ? `$${w.price}` : 'price unknown';
      return `- ${vintage} ${w.name} (${w.varietal}) | Bin: ${w.location || 'unspecified'} | Qty: ${w.quantity} | ${price}`;
    })
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: 'You are an expert sommelier. When given a wine inventory and a meal description, you suggest specific bottles from the inventory that pair well with the meal. You return only valid JSON arrays.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Here is the wine inventory:\n${inventoryText}`,
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text: `Meal: ${meal}\n\nFrom the inventory above, suggest 3-5 bottles that pair well with this meal. Return a JSON array with objects having these keys: wineName (exact name from inventory), rationale (1-2 sentences), confidence ("high" | "medium" | "low"). Return only the JSON array, no other text.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  return parsePairingResponse(textBlock.text, wines);
}
