import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node --import tsx fixtures/trello/server.ts",
      url: "http://localhost:9999",
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "NODE_ENV=test TRELLO_BASE_URL=http://localhost:9999 TRELLO_API_KEY=test-api-key TRELLO_API_TOKEN=test-api-token NEXTAUTH_SECRET=cVfM4hau1qdO8imEsVC417G1F3dKQ0ht NEXTAUTH_URL=http://localhost:3001 pnpm dev -p 3001",
      url: "http://localhost:3001",
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});
