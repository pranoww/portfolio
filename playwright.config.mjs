// Browser tests run against a production build, using the installed Microsoft Edge
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3100', channel: 'msedge' },
  webServer: { command: 'npm run build && npx next start -p 3100', url: 'http://localhost:3100', timeout: 300_000, reuseExistingServer: true },
});
