# Environment and CI/CD Guide

This guide describes the environment and CI integration that are present today, and gives safe extension guidance for additional environments and modules.

## 1. Framework Flexibility

The framework separates live-site UI automation from DummyJSON API automation. It supports browser selection, environment-specific dotenv files, Cucumber BDD scenarios, standalone Playwright tests, and CI entry points for Jenkins and GitHub Actions.

Current implementation limits matter:

- UI coverage is one MakeMyTrip flight flow; hotel and bus modules are not implemented.
- Cucumber scenarios run with `parallel: 1`.
- Playwright Test has `fullyParallel: false` and one API smoke test.
- Session storage-state reuse is not configured.
- The UI targets a real third-party site; it is not a deterministic local application.

## 2. Environment Structure

Configuration is centralized in `src/config/configManager.ts`. `.env.example` is the template. The config manager can load `.env` and, based on `ENVIRONMENT`, an additional `.env.<environment>` file. Process variables take precedence over dotenv values.

Current supported values:

```dotenv
ENVIRONMENT=local
UI_BASE_URL=https://www.makemytrip.com
API_BASE_URL=https://dummyjson.com
BROWSER=chromium
HEADLESS=false
DEFAULT_TIMEOUT_MS=60000
ACTION_TIMEOUT_MS=10000
NAVIGATION_TIMEOUT_MS=45000
TRACE_ENABLED=true
VIDEO_ENABLED=true
SLOW_MO_MS=0
```

The application does not currently have pre-created `qa.env`, `uat.env`, or `prod.env` files. Its convention is `.env.qa`, `.env.uat`, and `.env.prod` (the `.env.` prefix is required by the loader).

Do not put real passwords, access tokens, or production secrets into a tracked environment file. Current DummyJSON example credentials in `src/test-data/api.json` are public demonstration test data, not an application secret.

## 3. Switching Environments

Create a file such as `.env.qa` with the relevant URLs, then select it. In PowerShell:

```powershell
$env:ENVIRONMENT = 'qa'
npm run test:api
```

Use `.env.uat` with `ENVIRONMENT=uat` in the same way. Run against production only with explicit authorization and approved test data; the current live UI journey is not designed to purchase or mutate production bookings.

The values are `UI_BASE_URL` and `API_BASE_URL`, not `BASE_URL` and `API_URL`. The existing test data and endpoints are targeted at MakeMyTrip and DummyJSON, so changing URLs alone does not make the suite compatible with a different product.

## 4. Adding an Environment

1. Add `.env.staging` with only non-secret defaults and environment URLs.
2. Set `ENVIRONMENT=staging` in the local process or CI job.
3. Add secrets through the CI platform's secret store if required.
4. Run `npm run typecheck` and the relevant test suite.
5. Do not commit credentials or local `.env` files; `.gitignore` excludes dotenv files except `.env.example`.

Example:

```dotenv
ENVIRONMENT=staging
UI_BASE_URL=https://staging.example.test
API_BASE_URL=https://api-staging.example.test
HEADLESS=true
```

The example URLs above are placeholders. Site-specific Page Objects, API endpoints, test data, and authorization must also be implemented before using this framework with another application.

## 5. Config Manager

`configManager.ts` loads dotenv values and exposes one validated `EnvironmentConfig` via `configManager.get()`. It validates booleans, non-negative integer timeouts, supported browser names, and absolute URLs. Invalid values throw an error rather than silently falling back.

Read configuration from the manager instead of directly parsing process variables:

```typescript
const config = configManager.get();
await browser.newContext();
console.log(config.apiBaseUrl);
```

To add a setting, update `EnvironmentConfig`, parse and validate it in `createConfig()`, add a safe default, and document it in `.env.example` and this guide.

## 6. Browser Configuration

Supported `BROWSER` values are `chromium`, `chrome`, `edge`, `firefox`, and `webkit`. Cucumber hooks use Playwright Chromium for the installed Chrome/Edge channels. The Playwright Test config chooses the matching device profile and channel where applicable.

Install the selected Playwright-managed browser as needed:

```powershell
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

Chrome and Edge channel options use installed desktop browser applications. To add another browser, update the config union/validation, Cucumber `browserTypes` or channel logic, Playwright device selection, and browser-install documentation; verify both Cucumber and Playwright Test execution.

## 7. Execution Configuration

- Cucumber step timeout is sourced from `DEFAULT_TIMEOUT_MS`.
- Playwright action and navigation timeouts are applied in Cucumber hooks using `ACTION_TIMEOUT_MS` and `NAVIGATION_TIMEOUT_MS`.
- Playwright Test retries are `2` when `CI` is set and `0` locally.
- Playwright Test uses one worker in CI by default; local worker count follows Playwright defaults.
- Cucumber is serial (`parallel: 1`).
- Playwright Test has `fullyParallel: false`.

Do not raise concurrency without checking account contention, rate limits, test-data isolation, and live-site stability. The existing UI journey should not run against production at high concurrency.

## 8. Report Configuration

`cucumber.js` writes Cucumber JSON and HTML to `reports/`. `playwright.config.ts` writes its HTML report to `reports/playwright` and attachments to `reports/playwright-artifacts`. Cucumber UI hooks write failure screenshots/traces/videos to `screenshots/`, `traces/`, and `videos/`.

If report paths change, update the reporter config, `scripts/run-cucumber.js`, `package.json`'s `report:open`/`clean` commands, `.gitignore`, Jenkins artifact paths, GitHub artifact paths, and documentation together.

## 9. Adding a Module

### New UI module

For a future train or car module, add a tagged feature, page objects for the module's pages, typed test data, step definitions, and any required hook dependencies. Keep it separate from flight pages. Add tests and report tags only after the actual flow exists.

### New API module

Add model types and a resource client that extends `BaseApiClient`; wire it into `FrameworkWorld` plus Cucumber API hooks, and into `apiFixture` if standalone Playwright tests need it. Add a feature or spec and validate status, response shape, and error behavior.

Hotel, bus, car, and train booking flows are not currently present; documentation or tags should not imply they are implemented.

## 10. Jenkins Integration

`Jenkinsfile` currently declares a NodeJS tool named `NodeJS-20`, runs `npm ci`, installs Chromium, type-checks, then runs `npm run test:all`. It archives reports and evidence, and attempts JUnit publication from `reports/**/*.xml`; this framework does not currently configure a JUnit XML reporter, so the JUnit publisher may find no files.

Current pipeline flow:

```text
Checkout (configured by Jenkins job)
  -> Install dependencies (npm ci)
  -> Install Chromium
  -> Type check
  -> Run Cucumber suite and Playwright Test suite
  -> Archive reports, screenshots, traces, videos
```

The agent must have NodeJS tool support and a tool installation named `NodeJS-20`. The current pipeline does not explicitly set `HEADLESS=true`; configure that in Jenkins for agents without a graphical desktop. The live MakeMyTrip flow may also require approved network access.

To add JUnit reporting, configure an appropriate reporter/formatter and verify its output path before relying on Jenkins test trend views.

## 11. GitHub Actions Integration

`.github/workflows/playwright.yml` currently checks out the repository, sets up Node, installs packages and Playwright browsers, runs `npx playwright test`, and uploads an artifact.

Important alignment issue: the Playwright HTML reporter is configured to write `reports/playwright/`, but the workflow currently uploads `playwright-report/`. Update the workflow artifact `path` to `reports/playwright/` (and optionally `reports/playwright-artifacts/`) if the generated report should be retained. The workflow currently runs only Playwright Test; it does not run Cucumber BDD or `npm run test:all`.

Use GitHub repository/environment secrets for credentials and set configuration through job `env`. Never echo secret values. For a test run intended to include BDD, use a deliberate command such as `npm run test:all`, and consider the live UI network/access constraints.

## 12. Azure DevOps Integration

There is no Azure DevOps pipeline file in the repository. A pipeline can follow the existing Jenkins stages:

1. Select Node.js 20.
2. Run `npm ci`.
3. Install required Playwright browser dependencies.
4. Run `npm run typecheck`.
5. Run the desired test command (`npm run test:api`, `npm run test:all`, or `npm run test:ui`).
6. Publish `reports/`, `screenshots/`, `traces/`, and `videos/` as pipeline artifacts even when tests fail.

Set environment values through the pipeline variable group and secrets through secret variables. Confirm the hosted agent can reach external test services before requiring the UI suite.

## 13. Running in CI/CD

Use CI variables for non-secret settings (`ENVIRONMENT`, `BROWSER`, `HEADLESS`, base URLs) and secret stores for credentials. Keep secrets masked and avoid logging them or attaching them in test evidence. Use separate test accounts and API environments where appropriate.

The committed API fixture uses DummyJSON's public demonstration credentials. Replace them with approved, externally supplied credentials if testing another service; do not move secrets into `src/test-data/api.json`.

## 14. Scaling the Framework

For a larger suite:

- Keep test domains in separate feature, page, client, and model areas.
- Add tag conventions and define smoke/regression membership explicitly.
- Split test data by environment and use isolated accounts/resources.
- Add retries only for understood transient conditions; keep failures observable.
- Add Cucumber parallelism after hooks and state are isolated and the target can handle concurrency.
- Use Playwright sharding/workers for independent specs, with `fullyParallel` enabled only when tests are safe to run concurrently.
- Publish reports and evidence with retention policies.
- Add a verified JUnit reporter if CI needs standardized test trends.
- Keep live third-party UI suites small and use controlled test environments for high-volume coverage.

Do not scale by simply increasing worker counts against the live MakeMyTrip site.

## 15. Maintenance Guide

| Change | Update |
|---|---|
| UI or API URL | `.env.example`/environment dotenv file and validated keys in `src/config/configManager.ts`. |
| UI locator or action | Relevant Page Object under `src/pages/`; keep assertion changes in step definitions. |
| API endpoint or response | Resource client under `src/api/clients/` and corresponding type under `src/api/models/`. |
| Test input | JSON under `src/test-data/` and its TypeScript interface in `src/hooks/frameworkWorld.ts`. |
| Report destination | `cucumber.js`, `playwright.config.ts`, `scripts/run-cucumber.js`, `package.json`, `.gitignore`, CI artifact paths, and docs. |
| Timeout, browser, tracing | `src/config/configManager.ts`, `.env.example`, and the relevant runner config. |
| CI pipeline | `Jenkinsfile`, `.github/workflows/`, or the future Azure pipeline; retain reports on failure. |
| Feature scope/tags | Feature files and execution documentation; verify tags with the actual runner. |

For every maintenance change, run `npm run typecheck` and the narrowest relevant test suite. Re-run broader suites when shared hooks, configuration, or clients change.
