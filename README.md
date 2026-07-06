# Liverpool E2E Automation Challenge

## Setup Instructions
1. Clone this repository.
2. Install dependencies by running these 2 commands in your terminal:
   npm install
   npx playwright install

## Run Headless (Default)
npx playwright test

## Run Headed 
npx playwright test --headed

## View HTML Report
npx playwright show-report

## ⚠️ Note on GitHub Actions CI Execution
The GitHub Actions CI pipeline is fully configured, operational, and executes on every push. 
However, because GitHub runners use public Microsoft Azure Datacenter IPs, Liverpool's Akamai WAF (Web Application Firewall) actively blocks the headless browser at the edge layer, resulting in an "Acnpx playwright test tests/liverpool-search.spec.ts --headedcess Denied" timeout during Step 2. 

The test suite executes flawlessly with a 100% pass rate when run locally on a residential IP. I have documented how a QA team handles this exact infrastructure limitation in my `TEST_STRATEGY.md` (e.g., IP whitelisting or testing against lower staging environments).

[![Playwright Tests](https://github.com/AngelOsuna/liverpool-challenge/actions/workflows/playwright.yml/badge.svg)](https://github.com/AngelOsuna/liverpool-challenge/actions/workflows/playwright.yml)
