import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';
import type { BrowserType } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit, request as playwrightRequest } from '@playwright/test';
import { AuthApiClient } from '../api/clients/authApiClient';
import { ProductApiClient } from '../api/clients/productApiClient';
import { TodoApiClient } from '../api/clients/todoApiClient';
import { configManager } from '../config/configManager';
import { FlightBookingPage } from '../pages/flightBookingPage';
import { FlightResultsPage } from '../pages/flightResultsPage';
import { FlightSearchPage } from '../pages/flightSearchPage';
import { HomePage } from '../pages/homePage';
import { logger } from '../utils/logger';
import { TestDataLoader } from '../utils/testDataLoader';
import type { ApiTestData, FrameworkWorld, TravelTestData } from './frameworkWorld';

const browserTypes: Record<string, BrowserType> = { chromium, firefox, webkit };
setDefaultTimeout(configManager.get().defaultTimeoutMs);

/** Identifies scenarios that need a browser instead of an API request context. */
function isUiScenario(scenario: { pickle: { tags: readonly { name: string }[] } }): boolean {
  return scenario.pickle.tags.some((tag) => tag.name === '@ui');
}

/** Initializes isolated browser or API state and scenario test data. */
Before(async function (this: FrameworkWorld, scenario) {
  logger.clear();
  this.testData = TestDataLoader.load<TravelTestData>('travel.json');
  this.apiData = TestDataLoader.load<ApiTestData>('api.json');

  if (isUiScenario(scenario)) {
    const config = configManager.get();
    const browserType = ['chrome', 'edge'].includes(config.browser)
      ? chromium
      : browserTypes[config.browser];
    if (!browserType) throw new Error(`No Playwright browser is registered for ${config.browser}.`);
    this.browser = await browserType.launch({
      ...(config.browser === 'chrome' ? { channel: 'chrome' as const } : {}),
      ...(config.browser === 'edge' ? { channel: 'msedge' as const } : {}),
      headless: config.headless,
      slowMo: config.slowMoMs,
    });

    const videoDirectory = path.resolve(process.cwd(), 'videos');
    const screenshotDirectory = path.resolve(process.cwd(), 'screenshots');
    const traceDirectory = path.resolve(process.cwd(), 'traces');
    mkdirSync(videoDirectory, { recursive: true });
    mkdirSync(screenshotDirectory, { recursive: true });
    mkdirSync(traceDirectory, { recursive: true });

    this.context = await this.browser.newContext({
      ...(config.videoEnabled ? { recordVideo: { dir: videoDirectory } } : {}),
      viewport: { width: 1440, height: 1000 },
    });
    await this.context.clearCookies();
    this.context.setDefaultTimeout(config.actionTimeoutMs);
    this.context.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    this.page = await this.context.newPage();
    this.page.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    this.page.on('requestfailed', (request) => {
      logger.warn('Browser request failed', {
        url: request.url(),
        error: request.failure()?.errorText,
      });
    });
    this.page.on('pageerror', (error) => {
      logger.error('Page JavaScript error', { error: error.message });
    });
    if (config.traceEnabled) {
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    }

    this.homePage = new HomePage(this.page);
    this.flightSearchPage = new FlightSearchPage(this.page);
    this.flightResultsPage = new FlightResultsPage(this.page);
    this.flightBookingPage = new FlightBookingPage(this.page);
    logger.info('UI scenario initialized', {
      scenario: scenario.pickle.name,
      browser: config.browser,
      baseUrl: config.uiBaseUrl,
    });
    return;
  }

  const config = configManager.get();
  this.apiRequest = await playwrightRequest.newContext({
    baseURL: config.apiBaseUrl,
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  this.productApiClient = new ProductApiClient(this.apiRequest, config.apiBaseUrl);
  this.authApiClient = new AuthApiClient(this.apiRequest, config.apiBaseUrl);
  this.todoApiClient = new TodoApiClient(this.apiRequest, config.apiBaseUrl);
  logger.info('API scenario initialized', { scenario: scenario.pickle.name });
});

/** Saves failure evidence and closes scenario resources. */
After(async function (this: FrameworkWorld, scenario) {
  const failed = scenario.result?.status === Status.FAILED;
  const name = scenario.pickle.name.replace(/[^a-zA-Z0-9-_]/g, '-');
  const artifactName = `${Date.now()}-${name}`;

  if (failed && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    const screenshotPath = path.resolve(process.cwd(), 'screenshots', `${artifactName}.png`);
    await writeFile(screenshotPath, screenshot);
    await this.attach(screenshot, 'image/png');
  }

  if (this.context) {
    if (configManager.get().traceEnabled) {
      const tracePath = path.resolve(process.cwd(), 'traces', `${artifactName}.zip`);
      await this.context.tracing.stop({ path: tracePath });
      if (failed) await this.attach(readFileSync(tracePath), 'application/zip');
    }
    const video = this.page?.video();
    await this.context.close();
    if (failed && video) {
      const videoPath = await video.path();
      await this.attach(readFileSync(videoPath), 'video/webm');
    }
    await this.browser?.close();
  }

  if (this.apiRequest) await this.apiRequest.dispose();
  if (failed) {
    const logs = logger.snapshot();
    if (logs) await this.attach(logs, 'text/plain');
  }
});
