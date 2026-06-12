// tests/e2e/visual.spec.ts
import { test, expect } from '../fixtures/cellar.fixture';
import { PairingPage } from '../pages/PairingPage';

test.describe('Visual regression', () => {
  test('WineCard matches desktop snapshot', async ({ cellarPage }) => {
    await cellarPage.submitMeal('braised short ribs');
    await cellarPage.waitForResults();
    await expect(cellarPage.firstWineCard()).toHaveScreenshot('wine-card-desktop.png');
  });

  test('WineCard matches mobile snapshot', async ({ cellarPage, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await cellarPage.submitMeal('braised short ribs');
    await cellarPage.waitForResults();
    await expect(cellarPage.firstWineCard()).toHaveScreenshot('wine-card-mobile.png');
  });

  test('error message matches snapshot', async ({ page }) => {
    await page.route('**/api/pair', (route) =>
      route.fulfill({ status: 503, body: JSON.stringify({ error: 'pairing_unavailable' }) })
    );
    await page.goto('/');
    const p = new PairingPage(page);
    await p.submitMeal('test');
    await expect(p.errorMessage).toHaveScreenshot('error-message.png');
  });
});
