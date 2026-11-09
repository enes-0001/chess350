import { defineConfig, devices } from '@playwright/test';

// E2E runs against the PRODUCTION build served by the real server (npm run build first).
// Two players = two browser contexts (separate localStorage = separate identities, AGENTS.md §8.2).
// E2E_PORT lets you run the suite next to a dev server that already uses :3000.
const PORT = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run start -w @chess350/server',
    cwd: '../..',
    url: `http://localhost:${PORT}/healthz`,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: String(PORT),
      LOG_LEVEL: 'warn',
      ALLOWED_ORIGINS: `http://localhost:${PORT}`,
    },
  },
});
