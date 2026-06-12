// tests/fixtures/app.fixture.ts
import { test as nextTest } from 'next/experimental/testmode/playwright';
import type { APIRequestContext } from '@playwright/test';

type AppFixtures = {
  api: APIRequestContext;
};

export const test = nextTest.extend<AppFixtures>({
  api: async ({ page }, use) => {
    await use(page.request);
  },
});

export { expect } from '@playwright/test';
