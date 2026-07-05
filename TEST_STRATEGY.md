# Test Strategy & Architecture

## 1. What would you not automate in this flow, and why?
I would not automate the actual payment gateway processing or exhaustive permutations of every filter category in the UI. E2E tests are expensive and slow. Validating that the backend returns correct data for 50 different filters is better suited for API integration tests. The E2E layer should only verify that the critical user journey (search -> filter -> view results) correctly integrates the UI components with the backend services.

## 2. Handling CAPTCHA in the test suite
Automating a CAPTCHA defeats its purpose. If Liverpool introduced a CAPTCHA, I would bypass it in the test environment using one of these strategies:
*   **Whitelisting:** Ask DevOps to whitelist the static IPs of our GitHub Actions runners.
*   **Test Cookies/Headers:** Have the application look for a secure, secret HTTP header or cookie injected by Playwright that disables the CAPTCHA in lower environments.
*   **API Mocking:** If testing production is mandatory, intercept the CAPTCHA network request and mock a successful validation response.

## 3. Flakiness risks and mitigations
*   **Risk: Network Timing & Async UI Rendering.** E-commerce product grids often render placeholders before the actual DOM updates.
*   **Mitigation:** I mitigated this by implementing a **Wait-for-API pattern**. Instead of relying solely on arbitrary UI timeouts, the script explicitly intercepts `/web-bff/product/search`. It waits for the 200 OK response *before* attempting to interact with the sorted DOM. 
*   **Risk: Fragile CSS Selectors.**
*   **Mitigation:** Used specific semantic text filtering (`.filter({ hasText: 'Menor precio' })`) so the test survives even if the dropdown order changes.

## 4. Scaling to a CI pipeline with 50+ test suites
If integrating this into a massive suite, sequential execution would bottleneck the deployment pipeline. I would:
*   **Enable Playwright Sharding:** Split the 50 suites across multiple concurrent CI containers (e.g., 5 machines running 10 suites each).
*   **Tagging:** Implement `@smoke` and `@regression` tags. This search flow would be a `@smoke` test that blocks merges, while edge-case suites run on a nightly schedule.
*   **Dedicated Test Environments:** Ensure tests run against a stable staging environment rather than production to avoid rate-limiting and live-data mutations.