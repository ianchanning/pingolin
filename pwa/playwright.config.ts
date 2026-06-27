import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Explicitly include only Playwright e2e specs; sync-worker.spec.js is a Vitest unit test
  // that imports a browser-only ES module and will fail if Playwright tries to evaluate it.
  testMatch: ['**/fortress.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
