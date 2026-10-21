// Browser smoke check for the explicitly synthetic, loopback-only staging mode.
// Start npm run dev:staging (or preview:staging) separately before running this.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { chromium, expect } from '@playwright/test';

const target = new URL(process.env.STAGING_URL || 'http://127.0.0.1:5176');
assert.equal(target.hostname, '127.0.0.1', 'Only the dedicated loopback staging server may be tested');
assert.equal(target.protocol, 'http:');
const cachedChrome = `${homedir()}/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(cachedChrome) ? cachedChrome : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ serviceWorkers: 'block' });
const externalAttempts = [];
const apiRequests = [];
const pageErrors = [];
// Stop outbound requests before transmission, even if application isolation regresses.
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.origin !== target.origin) {
    externalAttempts.push(`${url.protocol}//${url.host}${url.pathname}`);
    await route.abort('blockedbyclient');
    return;
  }
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/__mock/')) apiRequests.push(url.pathname);
  await route.continue();
});
const page = await context.newPage();
page.on('pageerror', error => pageErrors.push(error.message));
try {
  const response = await page.goto(target.origin, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  const csp = response.headers()['content-security-policy'] || '';
  assert.match(csp, /connect-src\s+'self'/, 'Staging must ship its network isolation policy');
  assert.doesNotMatch(csp, /https:/, 'Staging CSP must not allow remote integrations');
  await expect(page.locator('[data-staging-banner="true"]')).toBeVisible();
  const onboarding = page.getByRole('button', { name: 'Dismiss onboarding', exact: true });
  await expect(onboarding).toBeVisible();
  await onboarding.click();
  await page.evaluate(() => {
    window.__stagingSmokeCalls = [];
    const fetch = window.fetch;
    window.fetch = (input, options) => {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href);
      window.__stagingSmokeCalls.push(url.pathname);
      return fetch(input, options);
    };
  });
  const title = `Synthetic isolation smoke ${Date.now()}`;
  await page.getByRole('button', { name: 'Text Monologue', exact: true }).click();
  await page.getByPlaceholder('Idea Title', { exact: false }).fill(title);
  await page.getByPlaceholder('Dump your stream', { exact: false }).fill('Synthetic test only: a local garden planning app with shared seasonal planting reminders.');
  await page.getByRole('button', { name: 'Generate Business Idea', exact: true }).first().click();
  await expect(page.getByText('Idea captured and structured!', { exact: false })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  const appCalls = await page.evaluate(() => window.__stagingSmokeCalls);
  assert.ok(appCalls.includes('/api/v1/ideas/ingest'), 'Exercise application ingestion rather than only a static page');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  mkdirSync(new URL('../artifacts/', import.meta.url), { recursive: true });
  await page.screenshot({ path: new URL('../artifacts/mock-staging.png', import.meta.url).pathname, fullPage: true });
  assert.deepEqual(externalAttempts, [], 'Application attempted outbound requests; intercepted before transmission');
  assert.deepEqual(pageErrors, [], 'Browser application exceptions');
  console.log(JSON.stringify({ passed: true, origin: target.origin, checks: ['mock staging banner', 'CSP network isolation', 'synthetic ingestion and mock generation', 'synthetic persistence after reload', 'zero outbound request attempts', 'zero browser application exceptions'], appCalls, apiRequests }, null, 2));
} finally {
  await browser.close();
}
