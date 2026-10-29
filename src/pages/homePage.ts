import type { Locator, Page } from '@playwright/test';
import { configManager } from '../config/configManager';
import { logger } from '../utils/logger';

/** Locators and actions for opening and validating the MakeMyTrip home page. */
export class HomePage {
  readonly logo: Locator;
  readonly flightsTab: Locator;
  readonly loginModalCloseButton: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByRole('img', { name: 'Make My Trip', exact: true });
    this.flightsTab = page.getByRole('navigation').getByRole('link', {
      name: 'Flights',
      exact: true,
    });
    this.loginModalCloseButton = page.locator('.commonModal__close');
  }

  /** Opens the configured site with retries and closes its optional login prompt. */
  async open(): Promise<void> {
    const url = `${configManager.get().uiBaseUrl}/`;
    const browser = this.page.context().browser();

    logger.info('Opening MakeMyTrip', {
      url,
      browser: configManager.get().browser,
      browserVersion: browser?.version(),
    });

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      logger.info('MakeMyTrip navigation attempt', { attempt, url });
      try {
        await this.page.goto(url, { waitUntil: 'load', timeout: 120_000 });
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('MakeMyTrip navigation attempt failed', { attempt, url, error: message });

        if (attempt === 3) {
          logger.error('MakeMyTrip navigation failed after all attempts', { url });
          throw error;
        }

        await this.page.waitForTimeout(3_000);
      }
    }

    if (await this.loginModalCloseButton.isVisible()) {
      await this.loginModalCloseButton.click();
    }
  }
}
