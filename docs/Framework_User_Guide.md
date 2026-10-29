# Framework User Guide

This guide explains the framework as it exists in this repository. It is intended for QA engineers, SDETs, and automation engineers who need to run tests or make a focused contribution.

## 1. Framework Overview

### Objective

The project has two independent automation suites:

- A real MakeMyTrip flight-search and booking-review journey, automated through Cucumber and Playwright.
- DummyJSON product, authentication, user, and todo API checks, automated through Cucumber and Playwright Test.

The flight journey stops at the booking review. It does not purchase a ticket. Hotel and bus UI scenarios are not currently implemented.

### Technology and design

| Area | Technology or pattern |
|---|---|
| Browser and HTTP automation | Playwright |
| Language | TypeScript with strict compiler checks |
| BDD | Cucumber feature files and step definitions |
| UI organization | Page Object Model |
| HTTP organization | Typed API clients built on `APIRequestContext` |
| Configuration | Environment variables and dotenv files |
| Evidence | Cucumber HTML/JSON reports, Playwright HTML report, and failure artifacts |

Playwright provides browser automation and API requests, TypeScript catches many errors before execution, and Cucumber makes business flows readable as Gherkin. Page Objects and API clients keep implementation details out of scenario descriptions.

## 2. Project Structure

```text
.
├── docs/                         # Onboarding, execution, and CI/CD guides
├── prompts/                      # Prompts used to produce the guides
├── scripts/                      # Cucumber launch and report-opening helper
├── src/
│   ├── api/
│   │   ├── clients/              # BaseApiClient and endpoint-specific clients
│   │   └── models/               # TypeScript API data contracts
│   ├── config/                   # Validated environment configuration
│   ├── features/
│   │   ├── api/                  # DummyJSON Gherkin scenarios
│   │   ├── ui/                   # MakeMyTrip Gherkin scenario
│   │   └── step-definitions/     # Cucumber glue code
│   ├── fixtures/                 # Playwright fixtures for the API smoke test
│   ├── hooks/                    # Cucumber World and before/after lifecycle
│   ├── pages/                    # Flight UI Page Objects
│   ├── test-data/                # JSON data used by scenarios
│   ├── tests/api/                # Standalone Playwright API smoke test
│   └── utils/                    # Logger and JSON test-data loader
├── reports/                      # Generated reports and Playwright artifacts
├── screenshots/                  # Cucumber UI failure screenshots
├── traces/                       # Cucumber UI failure traces
└── videos/                       # Cucumber UI failure videos
```

| Path | Responsibility | Example |
|---|---|---|
| `src/features/ui/` | Describes the MakeMyTrip flight flow in Gherkin. | `flights.feature` |
| `src/features/api/` | Describes product, login, and API-chain scenarios. | `api-chaining.feature` |
| `src/features/step-definitions/` | Maps Gherkin steps to Page Objects, API clients, and assertions. | `ui.steps.ts` |
| `src/pages/` | Owns UI locators and user actions; assertions remain in steps. | `flightSearchPage.ts` |
| `src/api/clients/` | Encapsulates API endpoint calls and common request handling. | `authApiClient.ts` |
| `src/api/models/` | Defines response and request types. | `product.model.ts` |
| `src/fixtures/` | Creates the shared environment and API client fixtures for Playwright Test. | `apiFixture.ts` |
| `src/hooks/` | Creates Cucumber scenario state, browser context, and API request context; cleans up and attaches evidence. | `hooks.ts` |
| `src/config/` | Loads and validates environment values. | `configManager.ts` |
| `src/test-data/` | Stores non-secret test inputs as JSON. | `travel.json` |
| `src/utils/` | Provides logging and safe loading of JSON test data. | `logger.ts` |
| `scripts/` | Starts Cucumber and opens its generated HTML report locally. | `run-cucumber.js` |
| `docs/`, `prompts/` | Guides for contributors and source prompts for those guides. | This document |

Root configuration files include `package.json` (commands/dependencies), `package-lock.json` (locked dependency versions), `tsconfig.json` (TypeScript checks), `cucumber.js` (BDD paths/reporters), `playwright.config.ts` (Playwright Test settings), `.env.example` (configuration template), `Jenkinsfile`, and `.github/workflows/playwright.yml`.

The main source files are:

| File | Purpose |
|---|---|
| `src/api/clients/baseApiClient.ts` | Shared HTTP verbs, URL handling, timing, and JSON response parsing. |
| `src/api/clients/authApiClient.ts` | DummyJSON login and authenticated profile requests. |
| `src/api/clients/productApiClient.ts` | DummyJSON product lookup. |
| `src/api/clients/todoApiClient.ts` | DummyJSON user-todo lookup. |
| `src/api/models/auth.model.ts` | Login request and authenticated-user response types. |
| `src/api/models/product.model.ts` | Product response type. |
| `src/api/models/todo.model.ts` | Todo and todo-list response types. |
| `src/config/configManager.ts` | Loads and validates environment values. |
| `src/hooks/frameworkWorld.ts` | Typed per-scenario Cucumber state and required-state guard. |
| `src/hooks/hooks.ts` | Initializes and disposes scenario resources; captures failure evidence. |
| `src/fixtures/baseFixture.ts` | Playwright Test fixture exposing validated environment config. |
| `src/fixtures/apiFixture.ts` | Playwright Test request context and typed API clients. |
| `src/pages/homePage.ts` | MakeMyTrip home navigation and homepage locators. |
| `src/pages/flightSearchPage.ts` | Flight route, date, passenger, and search actions. |
| `src/pages/flightResultsPage.ts` | Results/fare locators and booking action. |
| `src/pages/flightBookingPage.ts` | Booking-review page locators. |
| `src/features/step-definitions/ui.steps.ts` | Flight-flow actions and UI assertions. |
| `src/features/step-definitions/api.steps.ts` | Product, login, and API-chaining steps and assertions. |
| `src/utils/logger.ts` | Structured console logging and failed-scenario log attachment data. |
| `src/utils/testDataLoader.ts` | Loads JSON test input files from `src/test-data/`. |
| `src/tests/api/product.spec.ts` | Standalone Playwright Test product API smoke check. |

## 3. Features

Feature files describe desired behavior, not locator or transport implementation. Current features:

- UI: `src/features/ui/flights.feature`
- API product: `src/features/api/get-product.feature`
- API login: `src/features/api/login.feature`
- API chaining: `src/features/api/api-chaining.feature`

Example:

```gherkin
@ui @flights
Feature: Flight booking flow
  Scenario: Search flights and validate booking review details
    Given I open the MakeMyTrip home page
    Then the MakeMyTrip home page is ready
    When I search flights using the configured itinerary
    Then the flight search selections are correct
```

To add a feature, create a `.feature` file in the correct `ui/` or `api/` directory, use tags consistently, and implement or reuse its steps in the matching step-definition file. Cucumber discovers `src/features/**/*.feature` automatically. Do not describe hotel/bus coverage as available until the feature, implementation, and test data exist.

## 4. Step Definitions

Step definitions connect Gherkin expressions to framework actions and assertions. UI steps use Page Objects and Playwright `expect`; API steps use typed clients and validate returned values.

Example from the UI flow:

```typescript
Given('I open the MakeMyTrip home page', async function () {
  await required(this.homePage, 'homePage').open();
});
```

Best practices:

- Use business-readable steps and keep individual steps focused.
- Put UI interaction in a Page Object and API transport in a client.
- Keep scenario-specific assertions in step definitions.
- Store state on the typed Cucumber `FrameworkWorld`; avoid module-level mutable test state.
- Reuse existing steps where their meaning is genuinely the same.
- Give each scenario independent setup and cleanup.

`FrameworkWorld` and its `required` helper are in `src/hooks/frameworkWorld.ts`. The helper fails with an explicit error if a hook or earlier step did not initialize required state.

## 5. Page Objects

The Page Object Model keeps locators and repeatable browser actions together so locator changes are localized and scenario steps remain readable.

Example method from `FlightSearchPage`:

```typescript
async selectCities(source: string, destination: string): Promise<void> {
  await this.sourceField.click();
  await this.sourceAutocomplete.fill(source);
  await this.page.getByRole('option', { name: new RegExp(source, 'i') }).first().click();
  await this.destinationField.click();
  await this.destinationAutocomplete.fill(destination);
  await this.page.getByRole('option', { name: new RegExp(destination, 'i') }).first().click();
}
```

Use role, label, and placeholder locators where the live page provides stable accessible names. Use a CSS selector when the site exposes a stable identifier and no suitable semantic locator exists. Avoid positional selectors unless the page offers no better stable identity. Keep assertions out of Page Objects and keep each method named for the user action it performs.

Current UI objects: `HomePage`, `FlightSearchPage`, `FlightResultsPage`, and `FlightBookingPage`.

## 6. Fixtures

Playwright fixtures create and dispose test dependencies and expose them to test functions. In this repository, `baseFixture` exposes validated environment settings and `apiFixture` adds an `APIRequestContext` plus product/auth/todo clients for the standalone Playwright API test.

```typescript
apiFixture('DummyJSON product endpoint returns product details', async ({ productApiClient }) => {
  const response = await productApiClient.getProduct(1);
  expect(response.status).toBe(200);
});
```

The Cucumber UI flow does not use a Playwright Test page fixture. Its Cucumber `Before` hook launches the browser, creates a fresh context and page, and constructs Page Objects. The Cucumber API hooks create a request context and clients. This distinction prevents readers from assuming all runners share the same fixture lifecycle.

When adding a standalone Playwright fixture, extend `baseFixture` or `apiFixture`, keep setup and teardown in the fixture lifecycle, and give the fixture a specific TypeScript type. For Cucumber scenarios, add typed state to `FrameworkWorld` and initialize it in hooks.

## 7. Hooks and Evidence

`src/hooks/hooks.ts` has a Cucumber `Before` hook and an `After` hook:

- **Before:** loads JSON data, then initializes either UI browser state or API request state depending on the scenario tag.
- **After:** on UI failure, saves and attaches a screenshot; stops tracing and attaches the trace on failure; closes context/browser and attaches recorded video on failure; disposes API request state; attaches captured logs on failure.

The `Before` hook performs the following UI setup after selecting the browser and creating the artifact directories:

```typescript
this.browser = await browserType.launch({
  ...(config.browser === 'chrome' ? { channel: 'chrome' as const } : {}),
  ...(config.browser === 'edge' ? { channel: 'msedge' as const } : {}),
  headless: config.headless,
  slowMo: config.slowMoMs,
});
this.context = await this.browser.newContext({
  ...(config.videoEnabled ? { recordVideo: { dir: videoDirectory } } : {}),
  viewport: { width: 1440, height: 1000 },
});
await this.context.clearCookies();
this.context.setDefaultTimeout(config.actionTimeoutMs);
this.context.setDefaultNavigationTimeout(config.navigationTimeoutMs);
this.page = await this.context.newPage();
if (config.traceEnabled) {
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
}
```

On failure, the hook captures and attaches a screenshot, stops and attaches a trace when tracing is enabled, closes the context, and attaches the recorded video when video is enabled. It also attaches structured logs. The full implementation handles API scenarios and cleanup in `src/hooks/hooks.ts`. `TRACE_ENABLED` and `VIDEO_ENABLED` control trace and video collection.

## 8. Session Management

Each Cucumber UI scenario receives a new `BrowserContext` and page, and cookies are cleared. Context isolation prevents cookies and local browser state from leaking between scenarios. Service workers are not blocked.

**Storage-state reuse is not currently configured.** There is no committed `storageState` file, login setup, or session-reuse fixture. If authenticated UI testing is added, use a dedicated setup flow to create state, store it outside version control, load it into the relevant context, and avoid reusing one mutable session across parallel tests. Do not store credentials or personal tokens in source control.

To add storage-state support, define the file path via environment configuration, generate the state through an authorized login setup, pass `storageState` to `browser.newContext`, and document expiration/refresh handling. Keep unauthenticated MakeMyTrip scenarios isolated from that change.

## 9. API Framework

- `BaseApiClient` implements GET/POST/PUT/DELETE helpers, URL construction, JSON parsing, status capture, and request timing.
- `AuthApiClient` logs in and fetches the authenticated user's profile with the access token.
- `ProductApiClient` retrieves a product by ID.
- `TodoApiClient` retrieves todos for a user.
- Model interfaces in `src/api/models/` type request and response data.

The API chain is:

```text
Login -> use access token to get current user -> use user ID/token to get todos -> validate user IDs and todo data
```

Each method returns an `ApiResult<T>` containing `status`, `durationMs`, and typed `data`. Add a new API by creating a model if needed, adding a narrow endpoint method to the relevant client (or a new client for a distinct resource), wiring it into Cucumber World/hooks or `apiFixture`, then adding assertions in a step or test.

## 10. Reports and Artifacts

| Output | Location | Produced by |
|---|---|---|
| Cucumber HTML | `reports/cucumber-report.html` | Cucumber formatter |
| Cucumber JSON | `reports/cucumber-report.json` | Cucumber formatter |
| Playwright HTML | `reports/playwright/index.html` | Playwright Test HTML reporter |
| Playwright test output/evidence | `reports/playwright-artifacts/` | Playwright Test |
| Cucumber UI failure screenshots | `screenshots/` and scenario attachments | Cucumber `After` hook |
| Cucumber UI failure traces | `traces/` and scenario attachments | Cucumber `After` hook |
| Cucumber UI failure videos | `videos/` and scenario attachments | Browser context recording and hook |
| Structured console log | Attached to failed Cucumber scenarios | `logger` and Cucumber hook |

The Cucumber runner opens its HTML report after local execution. The Playwright reporter opens its report after local runs; it is disabled when `CI` is set. Run `npm run clean` to remove generated report and failure-artifact contents.

## 11. Test Data and Configuration

`src/test-data/travel.json` supplies the route, passenger mix, and date offset for the flight scenario. `src/test-data/api.json` supplies the product ID and DummyJSON demonstration login. These are test inputs, not production credentials.

`.env.example` lists supported runtime settings. Copy it to `.env`; process environment variables override dotenv values. To use a named environment, create `.env.qa` and set `ENVIRONMENT=qa`. Current keys include `UI_BASE_URL`, `API_BASE_URL`, `BROWSER`, `HEADLESS`, timeout values, trace/video flags, and `SLOW_MO_MS`.

Add scenario input to JSON and update the TypeScript data interfaces in `FrameworkWorld`. Add configuration that changes by deployment environment to `.env.<name>` and parse/validate it in `configManager.ts`; keep secrets in the CI secret store, not in `.env.example` or committed JSON.

## 12. Logging

Import `logger` from `src/utils/logger.ts` and use structured context:

```typescript
logger.info('Flight results validated', { resultCount, route });
logger.warn('Navigation attempt failed', { attempt, url, error });
```

The logger writes JSON entries to the console and retains entries for a failed Cucumber scenario attachment. Use `error` for an unrecoverable failure with useful context, and rethrow errors after logging rather than turning a failed operation into a success-shaped fallback. Do not log passwords, tokens, or other secrets.

## 13. Adding a Test

### UI scenario

1. Add a Gherkin scenario in `src/features/ui/` with `@ui` and a module tag such as `@flights`.
2. Put new locators/actions in an existing Page Object or create a focused new one in `src/pages/`.
3. Add step definitions in `src/features/step-definitions/ui.steps.ts` and store cross-step data in `FrameworkWorld`.
4. Put variable itinerary data in `src/test-data/travel.json`; update its interface.
5. Run `npm run typecheck`, then `npm run test:ui`. The UI uses a live third-party site and may be affected by regional access, availability, and locator changes.

### API scenario

1. Add a Gherkin file in `src/features/api/` tagged `@api` and with a focused resource tag.
2. Add or reuse a typed API client and model.
3. Wire scenario state through `FrameworkWorld` and initialize the client in the API branch of `Before`.
4. Add steps and explicit response assertions.
5. Run `npm run typecheck` and `npm run test:api`.

For a direct Playwright API smoke check, add a `.spec.ts` file under `src/tests/api/` and use `apiFixture`; run `npm run test:playwright`.

## 14. Best Practices

- Keep feature names and steps focused on behavior; use tags consistently.
- Use one Page Object per page or cohesive UI area and one API client per resource.
- Prefer accessible, stable locators; centralize them in Page Objects.
- Keep assertions in steps/tests, not in Page Objects or API clients.
- Use strict TypeScript types for scenario state, test data, and API models.
- Keep scenarios isolated and cleanup deterministic.
- Make failure messages actionable; never swallow request or navigation errors.
- Keep secrets out of source, logs, screenshots, and reports.
- Run type checking and the narrowest relevant test command before submitting a change.
- Treat live-site failures accurately: distinguish application/access/network failure from an assertion failure, and do not report an uncompleted scenario as passing.
