import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const inheritedEnvironment = { ...process.env };
const defaultEnvPath = path.resolve(process.cwd(), '.env');
const defaultEnvValues = existsSync(defaultEnvPath)
  ? dotenv.parse(readFileSync(defaultEnvPath))
  : {};
const environmentName = inheritedEnvironment.ENVIRONMENT ?? defaultEnvValues.ENVIRONMENT ?? 'local';
const environmentPath = path.resolve(process.cwd(), `.env.${environmentName}`);
const environmentValues = existsSync(environmentPath)
  ? dotenv.parse(readFileSync(environmentPath))
  : {};

for (const [key, value] of Object.entries({ ...defaultEnvValues, ...environmentValues })) {
  if (inheritedEnvironment[key] === undefined) process.env[key] = value;
}

export interface EnvironmentConfig {
  environment: string;
  uiBaseUrl: string;
  apiBaseUrl: string;
  browser: 'chromium' | 'chrome' | 'edge' | 'firefox' | 'webkit';
  headless: boolean;
  defaultTimeoutMs: number;
  actionTimeoutMs: number;
  navigationTimeoutMs: number;
  traceEnabled: boolean;
  videoEnabled: boolean;
  slowMoMs: number;
}

/** Parses a boolean environment value and rejects invalid input. */
function readBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  throw new Error(`${name} must be "true" or "false", received "${value}".`);
}

/** Parses a non-negative integer environment value and rejects invalid input. */
function readNonNegativeInteger(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer, received "${raw}".`);
  }
  return value;
}

/** Parses and normalizes an absolute URL from the environment. */
function readUrl(name: string, defaultValue: string): string {
  const value = process.env[name] ?? defaultValue;
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be a valid absolute URL, received "${value}".`);
  }
}

/** Builds validated settings from process variables and dotenv files. */
function createConfig(): EnvironmentConfig {
  const browser = process.env.BROWSER ?? 'chromium';
  if (!['chromium', 'chrome', 'edge', 'firefox', 'webkit'].includes(browser)) {
    throw new Error(`BROWSER must be chromium, chrome, edge, firefox, or webkit, received "${browser}".`);
  }

  return {
    environment: process.env.ENVIRONMENT ?? 'local',
    uiBaseUrl: readUrl('UI_BASE_URL', 'https://www.makemytrip.com'),
    apiBaseUrl: readUrl('API_BASE_URL', 'https://dummyjson.com'),
    browser: browser as EnvironmentConfig['browser'],
    headless: readBoolean('HEADLESS', false),
    defaultTimeoutMs: readNonNegativeInteger('DEFAULT_TIMEOUT_MS', 60_000),
    actionTimeoutMs: readNonNegativeInteger('ACTION_TIMEOUT_MS', 10_000),
    navigationTimeoutMs: readNonNegativeInteger('NAVIGATION_TIMEOUT_MS', 45_000),
    traceEnabled: readBoolean('TRACE_ENABLED', true),
    videoEnabled: readBoolean('VIDEO_ENABLED', true),
    slowMoMs: readNonNegativeInteger('SLOW_MO_MS', 0),
  };
}

/** Exposes the immutable configuration shared by the framework. */
class ConfigManager {
  private readonly config = createConfig();

  /** Returns the validated configuration values. */
  get(): EnvironmentConfig {
    return this.config;
  }
}

export const configManager = new ConfigManager();
