# Execution Guide Prompt

Generate or update `docs/Execution_Guide.md` for the actual test commands and configuration in this repository.

Inspect `package.json`, `cucumber.js`, `playwright.config.ts`, hooks, and CI config first. Document only commands and suites that actually exist. Explicitly identify unsupported hotel/bus UI suites and nonexistent smoke/regression tags instead of inventing scripts.

Cover prerequisites and setup, UI and flight execution, hotel/bus scope, current tags and smoke/regression status, API/product/login/chaining execution, all-suite execution, parallelism and its current limits, headed/headless commands, report generation/opening, and screenshot/trace/video locations. Include a text flow diagram for both Cucumber UI and API tests and the standalone Playwright API smoke test.

Use correct PowerShell syntax where relevant. Match real report and evidence output paths. Explain what each command runs and any live-site/network caveat. Do not claim that a test passed merely because a command was documented.
