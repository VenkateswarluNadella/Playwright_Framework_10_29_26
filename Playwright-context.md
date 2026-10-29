Playwright Framework Context
You are a Senior Automation Test Architect.

Create an Enterprise Playwright Automation Framework using:

Playwright
TypeScript
Cucumber BDD
Page Object Model
Playwright Fixtures
Hooks
Session Context
API Automation
DummyJSON Public APIs
Reporting
The framework should be easy to explain during interviews and follow best practices.

Framework Objective
Create one UI E2E flow using MakeMyTrip.

Create separate API automation layer using DummyJSON.

UI and API should be isolated under different folders.

Tech Stack
UI Automation:

Playwright
TypeScript
Cucumber
API Automation:

Playwright APIRequestContext
DummyJSON APIs
Design Pattern:

Page Object Model
Reports:

Playwright HTML Reports
Cucumber HTML Reports
JSON Reports
Folder Structure
project-root

│ ├── features │ ├── step-definitions │ ├── pages │ ├── fixtures │ ├── hooks │ ├── api │ ├── clients │ ├── models │ ├── tests │ ├── utils │ ├── test-data │ ├── config │ ├── reports │ ├── screenshots │ ├── traces │ ├── videos │ ├── playwright.config.ts │ ├── cucumber.js │ ├── package.json │ └── tsconfig.json

UI Layer Responsibilities
Page Objects contain:

Locators
Reusable Actions
Do NOT place assertions inside page objects.

Assertions must remain in:

Step Definitions
Validation Layer
Fixtures
Create fixtures for:

Browser
Context
Page
HomePage
SearchResultPage
Use dependency injection.

Hooks
Before Hook:

Browser Launch
Context Creation
Session Initialization
Test Data Loading
After Hook:

Screenshot on Failure
Trace Capture
Context Cleanup
Session Management
Use Browser Context.

Implement:

storageState

Support future login persistence.

Keep framework interview-friendly.

Reporting
Generate:

HTML Report
JSON Report
Cucumber Report
Attach:

Screenshots
Traces
Logs
UI Assertions Strategy
Prefer maximum assertions.

Validate:

Page URL
Page Title
Search Button availability
Source City value
Destination City value
Date selected
Search Results displayed
Flight count > 0
Flight Name displayed
Departure time displayed
Arrival time displayed
Price displayed
Filter Applied
Sort Applied
API Framework Standards
Use APIRequestContext.

Create:

BaseApiClient

UserApiClient

TodoApiClient

AuthApiClient

Support:

GET

POST

PUT

DELETE

API Chaining
Scenario:

Login

↓

Generate Token

↓

Get Current User

↓

Extract User ID

↓

Get User Todos

↓

Validate Todo Response

DummyJSON Base URL
https://dummyjson.com

Coding Standards
SOLID Principles
DRY
Reusable Utilities
Parallel Execution
Environment Specific Config
No Hardcoded Data
Generate production-ready code.