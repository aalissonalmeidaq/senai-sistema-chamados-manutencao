import { defineConfig, devices } from "@playwright/test";

/**
 * Testes E2E (navegador) — npm run test:e2e
 *
 * Pré-requisitos: Supabase local rodando com o seed (npm run db:reset) e
 * .env.local configurado. O Playwright sobe a aplicação sozinho:
 *  - local: reaproveita um `npm run dev` já aberto em localhost:3000, ou inicia um;
 *  - CI: usa o build de produção (`npm run start`).
 * Relatório HTML: npx playwright show-report
 */
const URL_BASE = process.env.E2E_URL_BASE ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: URL_BASE,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: `${URL_BASE}/api/saude`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
