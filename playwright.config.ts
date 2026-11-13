import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 }, // première compilation des pages en mode développement
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 } } },
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: { command: "npm run dev", url: "http://localhost:3000/fr", reuseExistingServer: true, timeout: 120_000 },
});
