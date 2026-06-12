// tests/fixtures/cellar.fixture.ts
import { test as base } from '@playwright/test';
import { PairingPage } from '../pages/PairingPage';
import { MOCK_SYNC_RESPONSE, SAMPLE_INVENTORY } from '../mocks/cellartracker.mock';
import { MOCK_PAIRING_RESULTS } from '../mocks/claude.mock';

type CellarFixtures = {
  cellarPage: PairingPage;
};

export const test = base.extend<CellarFixtures>({
  cellarPage: async ({ page }, use) => {
    await page.route('**/api/sync', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SYNC_RESPONSE),
      })
    );
    await page.route('**/api/pair', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PAIRING_RESULTS),
      })
    );
    const pairingPage = new PairingPage(page);
    await pairingPage.goto();
    await use(pairingPage);
  },
});

export { expect } from '@playwright/test';
export { SAMPLE_INVENTORY, MOCK_SYNC_RESPONSE, MOCK_PAIRING_RESULTS };
