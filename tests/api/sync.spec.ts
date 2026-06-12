// tests/api/sync.spec.ts
import { test, expect } from '../fixtures/app.fixture';
import { buildMockTabPayload } from './helpers';

test.describe('GET /api/sync', () => {
  test('returns wines array and skipped count on success', async ({ page, next }) => {
    next.onFetch((req) => {
      if (req.url.includes('cellartracker.com')) {
        return new Response(buildMockTabPayload(), {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        });
      }
    });
    await page.goto('/');
    const body = await page.evaluate(() =>
      fetch('/api/sync').then((r) => r.json().then((json) => ({ status: r.status, json })))
    );
    expect(body.status).toBe(200);
    expect(body.json).toHaveProperty('wines');
    expect(body.json).toHaveProperty('skipped');
    expect(Array.isArray(body.json.wines)).toBe(true);
  });

  test('returns 503 with error code when CellarTracker is unavailable', async ({ page, next }) => {
    next.onFetch((req) => {
      if (req.url.includes('cellartracker.com')) {
        return new Response(null, { status: 504 });
      }
    });
    await page.goto('/');
    const body = await page.evaluate(() =>
      fetch('/api/sync').then((r) => r.json().then((json) => ({ status: r.status, json })))
    );
    expect(body.status).toBe(503);
    expect(body.json.error).toBe('cellartracker_unavailable');
  });

  test('each wine has required shape', async ({ page, next }) => {
    next.onFetch((req) => {
      if (req.url.includes('cellartracker.com')) {
        return new Response(buildMockTabPayload(), {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        });
      }
    });
    await page.goto('/');
    const body = await page.evaluate(() =>
      fetch('/api/sync').then((r) => r.json())
    );
    for (const wine of body.wines) {
      expect(typeof wine.name).toBe('string');
      expect(wine.vintage === null || typeof wine.vintage === 'number').toBe(true);
      expect(typeof wine.varietal).toBe('string');
      expect(typeof wine.quantity).toBe('number');
    }
  });
});
