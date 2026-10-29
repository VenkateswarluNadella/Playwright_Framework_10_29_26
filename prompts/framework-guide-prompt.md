# Framework User Guide Prompt

Generate or update `docs/Framework_User_Guide.md` for the actual Playwright + TypeScript + Cucumber framework in this repository.

Before writing, inspect the source, package scripts, runner configuration, README, test data, and CI files. Document implemented behavior only. Clearly distinguish current functionality from proposed future extensions. In particular, do not claim hotel/bus UI, storage-state reuse, or browser fixtures for Cucumber unless they exist.

Write an onboarding- and interview-ready guide for QA engineers, SDETs, and automation engineers, covering:

1. Objective, technology stack, design patterns, and benefits.
2. Actual project structure and purpose of the important folders/files.
3. UI/API feature files and how to add one.
4. Step definitions and their connection to Gherkin, with examples and practices.
5. Page Objects, locator strategy, action methods, and examples.
6. Playwright fixtures and the distinction between Playwright Test fixtures and Cucumber hooks.
7. Before/After hooks, failure screenshot, trace, video, and log evidence.
8. Browser-context isolation and the actual storage-state/session-reuse status.
9. Base and resource API clients, typed models, API chaining, and adding APIs.
10. HTML/JSON reports and artifact paths.
11. JSON test data and environment configuration.
12. Structured logging and safe error handling.
13. Step-by-step instructions for adding a UI or API test.
14. Naming, folder, locator, assertion, and reuse practices.

Keep all commands, paths, tags, examples, and claims consistent with the current repository. Avoid pseudocode presented as drop-in production code.
