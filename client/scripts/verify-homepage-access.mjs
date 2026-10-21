import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';

const output = resolve(process.env.BETA_EVIDENCE_DIR || 'artifacts/homepage-access');
const label = process.env.ACCESS_LABEL || 'production-beta';
const beta = process.env.ACCESS_BETA !== 'false';
const rejected = [], errors = [], checks = [];
mkdirSync(output, { recursive: true });
let server;
let origin = process.env.ACCESS_ORIGIN;
if (!origin) {
  const root = resolve(process.env.BETA_BUILD_DIR || 'artifacts/homepage-access/production-beta');
  server = createServer((request, response) => {
    if (request.method !== 'GET') return response.writeHead(405).end();
    let path = join(root, new URL(request.url, 'http://localhost').pathname);
    if (!existsSync(path) || !extname(path)) path = join(root, 'index.html');
    response.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[extname(path)] || 'application/octet-stream');
    response.end(readFileSync(path));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
}
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', deviceScaleFactor: 1 });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() === 'GET' && url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    if (request.method() === 'GET' && url.hostname === 'fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: '' });
    if (request.method() === 'GET' && url.origin === 'http://127.0.0.1:9' && url.pathname === '/rest/v1/voice_notes') return route.fulfill({ contentType: 'application/json', body: '[]' });
    if (request.method() === 'GET' && url.origin === origin && url.pathname === '/api/v1/ideas') return route.fulfill({ contentType: 'application/json', body: '{"ideas":[]}' });
    rejected.push(`${request.method()} ${url.origin}${url.pathname}`);
    return route.abort();
  });
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.addInitScript(() => {
    window.__microphoneCalls = 0;
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: () => { window.__microphoneCalls++; throw new Error('Microphone forbidden'); } } });
  });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  for (const width of [1440, 818, 390, 320]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: width === 818 ? 720 : 900 });
    await page.goto(origin, { waitUntil: 'networkidle' });
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(await overflow(), false);
    await expect(page.locator('.capture-story-stage h3')).toHaveText(['Capture', 'Refine', 'Use in your tools']);
    await expect(page.locator('a[href="/terms"], a[href="/contact"]')).toHaveCount(0);
    await page.screenshot({ path: join(output, `${label}-${width}-homepage.png`), fullPage: true });
    await page.getByRole('link', { name: 'Read about the waiting list.' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Beta access & privacy' })).toBeVisible();
    assert.equal(await overflow(), false);
    await page.goBack();
    await expect(page.locator('.home-page')).toBeVisible();
    await page.locator('footer').getByRole('link', { name: 'Beta access & privacy' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Beta access & privacy');
    await page.screenshot({ path: join(output, `${label}-${width}-information.png`), fullPage: true });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Beta access & privacy');
    await page.getByRole('link', { name: 'Back to homepage' }).first().click();
    await page.locator('footer').getByRole('link', { name: 'Questions' }).click();
    await expect(page).toHaveURL(/#faq$/);
    const signIn = page.locator('header').getByRole('button', { name: 'Sign in', exact: true });
    await signIn.click();
    const dialog = page.getByRole('dialog', { name: beta ? 'Sign in to GoodIdea' : 'GoodIdea account access', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Username or Email', { exact: true })).toBeFocused();
    await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute('required', '');
    await dialog.getByLabel('Password', { exact: true }).fill('synthetic-password');
    await dialog.getByRole('button', { name: 'Show password', exact: true }).click();
    await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
    await dialog.getByRole('button', { name: 'Hide password', exact: true }).click();
    await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press(key);
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), `${key} escaped dialog at${width}`);
      }
    }
    await expect(dialog.getByRole('button', { name: 'Google', exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'GitHub', exact: true })).toBeVisible();
    await page.screenshot({ path: join(output, `${label}-${width}-signin.png`) });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(signIn).toBeFocused();
    await signIn.click();
    await page.mouse.click(2, 2);
    await expect(dialog).toHaveCount(0);
    await expect(signIn).toBeFocused();
    await signIn.click();
    await page.getByRole('button', { name: 'Close sign-in dialog' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(signIn).toBeFocused();
    if (beta) {
      for (let index = 0; index < 2; index++) {
        await signIn.click();
        await dialog.getByRole('button', { name: 'Join the waiting list', exact: true }).nth(index).click();
        const waitlist = page.getByRole('dialog', { name: 'Join the beta waiting list.' });
        await expect(waitlist).toBeVisible();
        await expect(dialog).toHaveCount(0);
        await expect(waitlist.locator('form,input')).toHaveCount(0);
        await expect(waitlist.getByRole('link', { name: 'Open the waiting-list form' })).toHaveAttribute('href', 'https://docs.google.com/forms/d/e/synthetic-responder/viewform');
        await page.keyboard.press('Escape');
        await expect(waitlist).toHaveCount(0);
      }
    } else {
      await page.getByRole('button', { name: 'Create an account', exact: true }).first().click();
      await expect(dialog.getByLabel('Username', { exact: true })).toBeFocused();
      for (const key of ['Tab', 'Shift+Tab']) {
        for (let i = 0; i < 14; i++) {
          await page.keyboard.press(key);
          assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), `${key} escaped signup dialog at${width}`);
        }
      }
      await expect(dialog.getByLabel('Email Address', { exact: true })).toHaveAttribute('required', '');
      await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute('autocomplete', 'new-password');
      await dialog.getByRole('button', { name: 'Sign In', exact: true }).click();
      await expect(dialog.getByLabel('Username or Email', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Create Account', exact: true }).click();
      await expect(dialog.getByLabel('Email Address', { exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
    }
    assert.equal(await page.evaluate(() => window.__microphoneCalls), 0);
    checks.push({ width, passed: true });
    await page.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(rejected, []);
  writeFileSync(join(output, `${label}-checks.json`), JSON.stringify({ passed: true, beta, checks, errors, rejected, externalRequestsTransmitted: 0, authSubmissions: 0, microphoneCalls: 0, limitations: 'Offline UI verification. No real authentication, form submission, saved row, backend policy or native reviewer verdict.' }, null, 2));
  console.log(`${label}: homepage destinations, labels, focus, keyboard, pointer dismissal and account routing passed at1440/818/390/320.`);
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
