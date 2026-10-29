import { defineConfig, devices } from '@playwright/test';
import { configManager } from './src/config/configManager';

const configuredDevice = {
  chromium: devices['Desktop Chrome'],
  chrome: devices['Desktop Chrome'],
  edge: devices['Desktop Edge'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
}[configManager.get().browser];

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [
      'html',
      {
        outputFolder: 'reports/playwright',
        open: process.env.CI ? 'never' : 'always',
      },
    ],
  ],
  outputDir: 'reports/playwright-artifacts',
  use: {
    baseURL: configManager.get().apiBaseUrl,
    headless: configManager.get().headless,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: configManager.get().browser,
      use: {
        ...configuredDevice,
        ...(configManager.get().browser === 'chrome' ? { channel: 'chrome' as const } : {}),
        ...(configManager.get().browser === 'edge' ? { channel: 'msedge' as const } : {}),
      },
    },
  ],
});
