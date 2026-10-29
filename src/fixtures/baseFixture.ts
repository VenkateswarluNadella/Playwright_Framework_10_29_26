import { test as playwrightTest, expect } from '@playwright/test';
import { configManager } from '../config/configManager';

/** Makes validated environment settings available to Playwright fixtures. */
export const baseFixture = playwrightTest.extend<{
  environment: ReturnType<typeof configManager.get>;
}>({
  environment: async ({}, use) => {
    await use(configManager.get());
  },
});

export { expect };
