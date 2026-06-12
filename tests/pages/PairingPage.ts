// tests/pages/PairingPage.ts
import type { Page, Locator } from '@playwright/test';

export class PairingPage {
  readonly page: Page;
  readonly mealInput: Locator;
  readonly submitButton: Locator;
  readonly refreshButton: Locator;
  readonly wineCards: Locator;
  readonly errorMessage: Locator;
  readonly loadingSkeleton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mealInput = page.getByRole('textbox', { name: /meal/i });
    this.submitButton = page.getByRole('button', { name: /find a pairing/i });
    this.refreshButton = page.getByRole('button', { name: /refresh cellar/i });
    this.wineCards = page.locator('[data-testid="wine-card"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loadingSkeleton = page.locator('[data-testid="loading-skeleton"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async submitMeal(meal: string) {
    await this.mealInput.fill(meal);
    await this.submitButton.click();
  }

  firstWineCard(): Locator {
    return this.wineCards.first();
  }

  async waitForResults() {
    await this.wineCards.first().waitFor({ state: 'visible' });
  }
}
