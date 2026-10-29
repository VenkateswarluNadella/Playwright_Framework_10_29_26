# Environment and CI/CD Guide Prompt

Generate or update `docs/Environment_And_CICD_Guide.md` for the framework as it is implemented in this repository.

Inspect configuration parsing, `.env.example`, browser setup, Cucumber and Playwright runner settings, Jenkinsfile, GitHub Actions workflow, report paths, and package scripts. Clearly label proposed integrations as guidance, not existing configuration. Identify inconsistencies between actual output paths and CI artifact paths.

Cover framework scope and flexibility; dotenv environment conventions and switching; adding environments; validated config manager; supported browsers; timeouts/retries/workers/parallelism; report output configuration; adding UI/API modules; current Jenkins and GitHub Actions stages; Azure DevOps guidance only if no pipeline exists; CI variables and secrets; scaling considerations; and a maintenance table for URLs, APIs, locators, test data, reports, runtime settings, and pipelines.

Use accurate setting names and file paths. Do not document unavailable hotel/bus modules, storage-state reuse, smoke/regression tags, JUnit reporting, or CI behavior as implemented. Include security guidance against committing or logging credentials.
