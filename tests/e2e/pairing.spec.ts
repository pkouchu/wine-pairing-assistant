// tests/e2e/pairing.spec.ts
import { test, expect } from '../fixtures/cellar.fixture';
import { PairingPage } from '../pages/PairingPage';

test.describe('Pairing flow — happy path', () => {
  test('renders the meal input form on load', async ({ cellarPage }) => {
    await expect(cellarPage.mealInput).toBeVisible();
    await expect(cellarPage.submitButton).toBeVisible();
    await expect(cellarPage.refreshButton).toBeVisible();
  });

  test('submit button is disabled when meal input is empty', async ({ cellarPage }) => {
    await expect(cellarPage.submitButton).toBeDisabled();
  });

  test('submit button enables when meal text is entered', async ({ cellarPage }) => {
    await cellarPage.mealInput.fill('braised short ribs');
    await expect(cellarPage.submitButton).toBeEnabled();
  });

  test('shows loading skeleton immediately after submission', async ({ cellarPage, page }) => {
    await page.route('**/api/pair', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    await cellarPage.mealInput.fill('braised short ribs');
    await cellarPage.submitButton.click();
    await expect(cellarPage.loadingSkeleton).toBeVisible({ timeout: 200 });
  });

  test('displays wine cards after successful pairing', async ({ cellarPage }) => {
    await cellarPage.submitMeal('braised short ribs');
    await cellarPage.waitForResults();
    const count = await cellarPage.wineCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each wine card shows name, varietal, and rationale', async ({ cellarPage }) => {
    await cellarPage.submitMeal('braised short ribs');
    await cellarPage.waitForResults();
    const card = cellarPage.firstWineCard();
    await expect(card).toContainText('Ridge Monte Bello');
    await expect(card).toContainText('Cabernet Blend');
    await expect(card).toContainText('bold');
  });
});

test.describe('Pairing flow — error states', () => {
  test('shows cellartracker error when pair returns 503 cellartracker_unavailable', async ({ page }) => {
    await page.route('**/api/pair', (route) =>
      route.fulfill({ status: 503, body: JSON.stringify({ error: 'cellartracker_unavailable' }) })
    );
    await page.goto('/');
    const p = new PairingPage(page);
    await p.submitMeal('test meal');
    await expect(p.errorMessage).toBeVisible();
    await expect(p.errorMessage).toContainText('CellarTracker');
  });

  test('shows pairing unavailable error when pair returns 503 pairing_unavailable', async ({ page }) => {
    await page.route('**/api/pair', (route) =>
      route.fulfill({ status: 503, body: JSON.stringify({ error: 'pairing_unavailable' }) })
    );
    await page.goto('/');
    const p = new PairingPage(page);
    await p.submitMeal('wagyu steak');
    await expect(p.errorMessage).toBeVisible();
    await expect(p.errorMessage).toContainText('pairing service');
  });

  test('shows no_inventory error when pair returns 400', async ({ page }) => {
    await page.route('**/api/pair', (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'no_inventory' }) })
    );
    await page.goto('/');
    const p = new PairingPage(page);
    await p.submitMeal('pasta');
    await expect(p.errorMessage).toBeVisible();
    await expect(p.errorMessage).toContainText('No bottles found');
  });

  test('shows NV for non-vintage wines in results', async ({ page }) => {
    await page.route('**/api/pair', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          wine: { name: 'Billecart-Salmon Brut Réserve', vintage: null, varietal: 'Chardonnay', location: 'Fridge', quantity: 2, price: 65 },
          rationale: 'Perfect with oysters.',
          confidence: 'high',
        }]),
      })
    );
    await page.goto('/');
    const p = new PairingPage(page);
    await p.submitMeal('oysters');
    await p.waitForResults();
    await expect(p.firstWineCard()).toContainText('N.V.');
  });
});
