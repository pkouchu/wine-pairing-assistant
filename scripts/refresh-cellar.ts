// scripts/refresh-cellar.ts
// Logs into CellarTracker with a real browser and exports your cellar to data/cellar.csv.
// Run: npm run refresh:cellar
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { buildExportUrl, buildLoginUrl } from '@/lib/cellartracker';

async function main() {
  const username = process.env['CELLARTRACKER_USERNAME'];
  const password = process.env['CELLARTRACKER_PASSWORD'];

  if (!username || !password) {
    console.error('Missing env vars. Set CELLARTRACKER_USERNAME and CELLARTRACKER_PASSWORD in .env.local');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging into CellarTracker...');
  await page.goto(buildLoginUrl());

  await page.locator('input[name="szUser"]').fill(username);
  await page.locator('input[name="szPassword"]').fill(password);
  await page.locator('#sign_in').click();
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();
  if (currentUrl.includes('password.asp')) {
    console.error('Login failed — check your CELLARTRACKER_USERNAME and CELLARTRACKER_PASSWORD');
    await browser.close();
    process.exit(1);
  }

  console.log('Fetching cellar export...');
  const response = await context.request.get(buildExportUrl());

  if (!response.ok()) {
    console.error(`Export failed: HTTP ${response.status()}`);
    await browser.close();
    process.exit(1);
  }

  const data = await response.text();
  const lines = data.split('\n').filter((l) => l.trim()).length - 1;

  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
  writeFileSync(join(process.cwd(), 'data', 'cellar.csv'), data, 'utf-8');

  console.log(`✓ Saved ${lines} bottles to data/cellar.csv`);
  console.log('Run "git add data/cellar.csv && git commit -m \'chore: refresh cellar data\'" to deploy.');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
