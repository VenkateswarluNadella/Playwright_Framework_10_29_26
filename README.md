# Playwright + TypeScript + Cucumber BDD Framework

The framework keeps MakeMyTrip UI automation and DummyJSON API automation in separate feature, page, and client layers. Cucumber is the BDD runner; Playwright Test is available for focused non-BDD tests and its HTML report.

## Folder structure

```text
.
├── src/
│   ├── api/
│   │   ├── clients/                 # Shared HTTP client and product/auth/todo APIs
│   │   └── models/                  # Typed API request and response data
│   ├── config/                      # Environment variable parsing and validation
│   ├── features/
│   │   ├── api/                     # DummyJSON Cucumber scenarios
│   │   ├── ui/                      # MakeMyTrip Cucumber scenario
│   │   └── step-definitions/        # Glue between Gherkin and framework actions
│   ├── fixtures/                    # Playwright API fixtures
│   ├── hooks/                       # Cucumber scenario state and lifecycle
│   ├── pages/                       # MakeMyTrip flight Page Objects
│   ├── test-data/                   # External JSON scenario inputs
│   ├── tests/api/                   # Standalone Playwright API smoke test
│   └── utils/                       # Logging and test-data loading
├── scripts/                         # Cucumber runner and report opening
└── reports, screenshots, traces,
    videos/                          # Generated test reports and failure evidence
```

The Cucumber World and hooks manage browser lifecycle for the BDD flight scenario. Playwright fixtures are used by the standalone API smoke test; API chaining uses `AuthApiClient` to retrieve the logged-in user and `TodoApiClient` to retrieve that user's todos.

## Contributor guides

- [Framework user guide](docs/Framework_User_Guide.md)
- [Execution guide](docs/Execution_Guide.md)
- [Environment and CI/CD guide](docs/Environment_And_CICD_Guide.md)

## Setup

Requirements: Node.js 20 or later.

```powershell
npm ci
npx playwright install chromium
Copy-Item .env.example .env
```

Set environment-specific values in `.env`, or create `.env.<ENVIRONMENT>` (for example `.env.staging`) and set `ENVIRONMENT=staging`. Existing process variables take precedence over dotenv files.

## Execution

```powershell
# All Cucumber scenarios
npm test

# UI or API BDD scenarios only
npm run test:ui
npm run test:api

# Focused Playwright Test runner and HTML report
npm run test:playwright
npm run report:open

# Run BDD and Playwright suites
npm run test:all

# TypeScript validation and cleanup
npm run typecheck
npm run clean
```

Cucumber writes `reports/cucumber-report.html` and `reports/cucumber-report.json`, and automatically opens the HTML report after local test runs. Playwright Test writes `reports/playwright/index.html` and automatically opens its HTML report after local runs. Automatic browser opening is disabled in CI. Failed UI scenarios attach a screenshot, trace, video, and collected logs; screenshots, traces, and videos are also written to their respective folders.

## Configuration

Copy `.env.example` to `.env`. UI tests run headed by default (`HEADLESS=false`) in both the Cucumber hooks and Playwright Test configuration. Set `HEADLESS=true` in `.env` or the process environment to run headlessly. Other settings include `UI_BASE_URL`, `API_BASE_URL`, `BROWSER`, `DEFAULT_TIMEOUT_MS`, `ACTION_TIMEOUT_MS`, `NAVIGATION_TIMEOUT_MS`, `TRACE_ENABLED`, `VIDEO_ENABLED`, and `SLOW_MO_MS`. Browser selection accepts `chromium`, `chrome`, `edge`, `firefox`, or `webkit`. Chrome and Edge use installed Google Chrome and Microsoft Edge, respectively (`BROWSER=chrome` or `BROWSER=edge`); install the selected Playwright browser with `npx playwright install <browser>` when needed.

The UI suite contains one real MakeMyTrip flight end-to-end scenario; hotel and bus UI flows are intentionally out of scope. It validates the selected source, destination, date and passenger mix from the live search URL, then checks result count, airline and fare before opening the booking-review tab with the first available fare. The review page is validated for itinerary, travel date, fare summary and traveller details. No local substitute or route interception is used. The Cucumber World creates a fresh browser context per UI scenario and clears cookies to prevent saved session data from leaking between runs. Service workers remain enabled for site compatibility. Pages wait for the full `load` event before continuing.

MakeMyTrip is a live third-party site and may present regional content, consent dialogs, access-denial pages, or change its UI selectors. Run the UI suite from a network that is authorized to access MakeMyTrip. An Akamai 403 is an environment access failure, not a passing UI test; the framework does not attempt to bypass it. Update Page Object locators if the live site changes. The DummyJSON API scenarios are independent of the UI suite.

## Live-site execution note

During validation against the live MakeMyTrip site, initial navigation intermittently failed with `ERR_HTTP2_PROTOCOL_ERROR`. Playwright and the installed Chrome channel launched successfully. Google and MakeMyTrip both loaded in a standalone Chrome validation, and the flight search/results/review locators were inspected against the live pages. However, the complete Cucumber UI scenario did not pass consistently: some runs failed before interaction began, while a successful homepage load exposed and allowed correction of a duplicate Flights-link locator.

The UI framework uses a fresh browser context with cleared cookies, retries initial navigation up to three times with a short delay, logs the URL/browser/version and failed requests/page errors, and captures screenshots, traces, video, and logs on scenario failure. The UI result should be reported as environment-dependent unless a complete run passes on the execution network.

For an interview submission, describe this as an intermittent live-site navigation issue, distinguish it from test assertion failures, and show the evidence and resiliency measures above. Do not claim the end-to-end UI scenario passed unless it completes successfully.
