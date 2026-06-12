// tests/fixtures/app.fixture.ts
import { test as base, type APIRequestContext } from '@playwright/test';

type AppFixtures = {
  api: APIRequestContext;
};

export const test = base.extend<AppFixtures>({
  api: async ({ request }, use) => {
    await use(request);
  },
});

export { expect } from '@playwright/test';
