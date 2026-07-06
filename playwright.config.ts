/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1, // Mitigates minor network flakes
  reporter: [['html', { open: 'never' }]], // Part 3: HTML Report
  use: {
    headless: true, // Part 1: Headless by default
    screenshot: 'only-on-failure', // Part 3: Automatic screenshots on failure
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use local Chrome for dev, but use default Chromium in GitHub Actions
        channel: process.env.CI ? undefined : 'chrome', 
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
