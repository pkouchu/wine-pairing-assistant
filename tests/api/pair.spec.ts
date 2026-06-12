// tests/api/pair.spec.ts
import { test, expect } from '../fixtures/app.fixture';
import { buildMockTabPayload, buildEmptyTabPayload } from './helpers';

test.describe('POST /api/pair', () => {
  test('returns 400 when meal field is missing', async ({ page, next }) => {
    next.onFetch(() => undefined);
    await page.goto('/');
    const body = await page.evaluate(() =>
      fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).then((r) => r.json().then((json) => ({ status: r.status, json })))
    );
    expect(body.status).toBe(400);
  });

  test('returns 400 with no_inventory when cellar is empty', async ({ page, next }) => {
    next.onFetch((req) => {
      if (req.url.includes('cellartracker.com')) {
        return new Response(buildEmptyTabPayload(), {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        });
      }
    });
    await page.goto('/');
    const body = await page.evaluate(() =>
      fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal: 'braised short ribs' }),
      }).then((r) => r.json().then((json) => ({ status: r.status, json })))
    );
    expect(body.status).toBe(400);
    expect(body.json.error).toBe('no_inventory');
  });

  test('returns pairing results array on success', async ({ page, next }) => {
    next.onFetch((req) => {
      if (req.url.includes('cellartracker.com')) {
        return new Response(buildMockTabPayload(), {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        });
      }
      if (req.url.includes('api.anthropic.com')) {
        return new Response(JSON.stringify({
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          content: [{ type: 'text', text: JSON.stringify([
            { wineName: 'Ridge Monte Bello', rationale: 'Bold tannins complement the ribs.', confidence: 'high' }
          ])}],
          model: 'claude-haiku-4-5-20251001',
          stop_reason: 'end_turn',
          usage: { input_tokens: 100, output_tokens: 50 },
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
    });
    await page.goto('/');
    const body = await page.evaluate(() =>
      fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal: 'braised short ribs' }),
      }).then((r) => r.json().then((json) => ({ status: r.status, json })))
    );
    expect(body.status).toBe(200);
    expect(Array.isArray(body.json)).toBe(true);
    expect(body.json[0]).toHaveProperty('wine');
    expect(body.json[0]).toHaveProperty('rationale');
    expect(body.json[0]).toHaveProperty('confidence');
  });
});
