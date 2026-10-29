# Execution Guide

This guide documents commands that exist in the current `package.json`. Commands use PowerShell syntax where environment variables are set.

## 1. Prerequisites

- Node.js 20 or newer (`node --version`).
- npm, installed with Node.js (`npm --version`).
- Network access to install packages and reach DummyJSON. The UI flow additionally needs authorized access to the live MakeMyTrip site.

The repository pins dependency versions with `package-lock.json`; prefer `npm ci` over `npm install` for repeatable CI/onboarding installs.

## 2. Framework Setup

```powershell
git clone <repository-url>
Set-Location <repository-folder>
npm ci
npx playwright install chromium
Copy-Item .env.example .env
npm run typecheck
```

Use `npx playwright install firefox` or `npx playwright install webkit` if configuring those browsers. `BROWSER=chrome` and `BROWSER=edge` select installed Google Chrome and Microsoft Edge channels; those applications must already be installed.

## 3. UI Test Execution

Run the implemented MakeMyTrip flight scenario:

```powershell
npm run test:ui
```

It runs Cucumber scenarios tagged `@ui`, initializes a fresh browser context, navigates to the configured site, performs the flight journey, and writes Cucumber JSON and HTML reports. The UI uses a live third-party application; a network or access failure is a failed run, not a passing test.

## 4. Execute Flight Tests

There is one UI scenario tagged `@ui @flights`:

```powershell
npm run test:bdd -- --tags "@ui and @flights"
```

The report is written to `reports/cucumber-report.html` and `reports/cucumber-report.json`. The Cucumber runner opens the HTML report locally after execution.

## 5. Hotel Tests

Hotel UI tests are not implemented. There is no hotel feature, Page Object, step-definition flow, or test tag. `npm run test:ui` runs only the implemented UI-tagged MakeMyTrip flight scenario. Add hotel coverage before advertising or executing a hotel test command.

## 6. Bus Tests

Bus UI tests are not implemented. There is no bus feature, Page Object, step-definition flow, or test tag. Add bus coverage before advertising or executing a bus test command.

## 7. Smoke and Regression Suites

There are no dedicated `@smoke` or `@regression` tags. Current usable Cucumber suite tags are `@ui`, `@flights`, `@api`, `@product`, `@auth`, and `@chaining`. Until smoke/regression membership is defined, run the actual suites rather than using nonexistent tags:

```powershell
npm run test:ui
npm run test:api
```

## 8. Execute API Tests

Run all Cucumber API scenarios (product retrieval, login, and login-to-user-to-todos chaining):

```powershell
npm run test:api
```

Filter the API chaining scenario only:

```powershell
npm run test:bdd -- --tags "@api and @chaining"
```

## 9. Execute GET API Tests

The product feature makes a GET request and is tagged `@api @product`:

```powershell
npm run test:bdd -- --tags "@api and @product"
```

The login feature uses a POST request and the chaining feature makes authentication plus user/todo requests. There is no separate comprehensive GET-method suite.

## 10. Execute POST API Tests

The configured login scenario exercises the DummyJSON login POST endpoint:

```powershell
npm run test:bdd -- --tags "@api and @auth"
```

The login scenario is tagged `@auth`; the same tag is also used by the chaining feature. To run only the standalone login feature, filter the API and auth tags and exclude chaining:

```powershell
npm run test:bdd -- --tags "@api and @auth and not @chaining"
```

## 11. Execute API Chaining Tests

```powershell
npm run test:bdd -- --tags "@api and @chaining"
```

The scenario logs in, uses the returned access token to retrieve the current user, then uses that user's ID and token to retrieve and validate todos.

## 12. Run All Tests

```powershell
npm run test:all
```

This executes the complete Cucumber suite first (UI and API), then the standalone Playwright Test suite. The first command failing prevents the second command from running. To run the API suites without the live UI dependency, run `npm run test:api` followed by `npm run test:playwright`.

## 13. Parallel Execution

Cucumber is configured with `parallel: 1` in `cucumber.js`; BDD scenarios run serially. Playwright Test uses `fullyParallel: false`, and the repository currently has one standalone Playwright spec. A worker override can be passed:

```powershell
npm run test:playwright -- --workers=4
```

This does not parallelize tests within one file when `fullyParallel` is false, and a single test offers no useful parallelism. Increase Cucumber parallelism or Playwright workers only after test data, site limits, isolation, and shared account behavior are safe for concurrent execution.

## 14. Headed Execution

Headed mode is the default in `.env.example` (`HEADLESS=false`). Choose a browser with `BROWSER`:

```powershell
$env:BROWSER = 'chromium'
$env:HEADLESS = 'false'
npm run test:ui
```

Installed Chrome or Edge can be selected with `chrome` or `edge`.

## 15. Headless Execution

```powershell
$env:HEADLESS = 'true'
npm run test:ui
```

Playwright Test also reads the same configuration. In PowerShell, remove a process override after a command if continuing in the same terminal:

```powershell
Remove-Item Env:HEADLESS
```

## 16. Generate Reports

Reports are generated automatically by test runs:

- Cucumber: `reports/cucumber-report.html` and `reports/cucumber-report.json`.
- Playwright Test: `reports/playwright/index.html`.
- Playwright test attachments: `reports/playwright-artifacts/`.

There is no separate report-generation command. To regenerate reports, run the relevant test command.

## 17. Open Reports

After a local Cucumber run, `scripts/run-cucumber.js` opens the Cucumber HTML report automatically. To open the Playwright HTML report:

```powershell
npm run report:open
```

Equivalent Playwright command:

```powershell
npx playwright show-report reports/playwright
```

Automatic opening is disabled in CI.

## 18. Screenshot Locations

Cucumber UI failure screenshots are written under `screenshots/` and attached to the Cucumber report. Standalone Playwright Test failure screenshots are stored in `reports/playwright-artifacts/`.

## 19. Trace Locations

Cucumber UI failure traces are written under `traces/` and attached to the report when `TRACE_ENABLED=true`. Playwright Test traces are in `reports/playwright-artifacts/` because the runner uses `retain-on-failure`.

## 20. Video Locations

Cucumber UI failure videos are saved under `videos/` and attached to the report when `VIDEO_ENABLED=true`. Playwright Test videos are stored under its output directory, `reports/playwright-artifacts/`, with `retain-on-failure`.

## 21. Execution Flow

```text
UI / BDD
Feature (Gherkin)
  -> Step definition
  -> Page Object (locators and actions)
  -> Playwright browser/context/page
  -> Step assertions
  -> Cucumber JSON/HTML report and failure evidence

API / BDD
Feature (Gherkin)
  -> Step definition
  -> Typed API client
  -> BaseApiClient / APIRequestContext
  -> API response
  -> Step assertions
  -> Cucumber JSON/HTML report

API / Playwright Test
product.spec.ts
  -> apiFixture
  -> ProductApiClient
  -> APIRequestContext
  -> Playwright expect assertions
  -> Playwright HTML report
```

The Cucumber `Before` hook loads scenario data and initializes browser state for `@ui`, or API request/client state for API scenarios. The `After` hook attaches failure evidence, closes browser resources, and disposes API request contexts.
