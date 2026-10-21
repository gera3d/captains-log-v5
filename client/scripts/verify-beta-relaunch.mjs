import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = resolve(process.env.BETA_BUILD_DIR || 'dist-staging');
const evidence = resolve(process.env.BETA_EVIDENCE_DIR || 'artifacts/beta-relaunch');
const label = process.env.BETA_CHECK_LABEL || 'staging';
const enabled = process.env.BETA_EXPECT_ENABLED !== 'false';
const responder = process.env.BETA_EXPECT_URL || '';
const mock = process.env.BETA_EXPECT_MOCK !== 'false';
mkdirSync(evidence, { recursive: true });
const server = createServer((request, response) => {
  if (request.method !== 'GET') return response.writeHead(405).end();
  let file = join(root, new URL(request.url, 'http://localhost').pathname);
  if (!existsSync(file) || !extname(file)) file = join(root, 'index.html');
  response.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[extname(file)] || 'application/octet-stream');
  response.end(readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
const errors = [], rejected = [], offlineFixtures = [], sockets = [], checks = [];
try {
  const context = await browser.newContext({ serviceWorkers: 'block', deviceScaleFactor: 2 });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() !== 'GET') {
      rejected.push({ method: request.method(), origin: url.origin, path: url.pathname });
      return route.abort();
    }
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    if (request.url() === responder) {
      offlineFixtures.push('responder-navigation');
      return route.fulfill({ contentType: 'text/html', body: '<h1>Offline navigation fixture</h1><p>Nothing is collected or saved.</p>' });
    }
    if (url.hostname === 'fonts.googleapis.com') {
      offlineFixtures.push('existing-font-stylesheet');
      return route.fulfill({ contentType: 'text/css', body: '' });
    }
    if (!mock && url.origin === 'http://127.0.0.1:9' && url.pathname === '/rest/v1/voice_notes') {
      offlineFixtures.push('synthetic-empty-notes');
      return route.fulfill({ contentType: 'application/json', body: '[]' });
    }
    if (!mock && url.origin === origin && url.pathname === '/api/v1/ideas') {
      offlineFixtures.push('synthetic-empty-ideas');
      return route.fulfill({ contentType: 'application/json', body: '{"ideas":[]}' });
    }
    rejected.push({ method: request.method(), origin: url.origin, path: url.pathname });
    return route.abort();
  });
  await context.routeWebSocket('**/*', socket => {
    sockets.push(new URL(socket.url()).origin);
    socket.close();
  });
  await context.addInitScript(() => {
    window.__microphoneCalls = 0;
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: () => {
      window.__microphoneCalls++;
      throw new Error('Microphone forbidden');
    } } });
    window.MediaRecorder = class { constructor() { throw new Error('Recording forbidden'); } };
  });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  for (const width of [1440, 390, 320]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto(`${origin}/${mock ? '?preview=homepage' : ''}`, { waitUntil: 'networkidle' });
    const waitlist = page.getByRole('button', { name: 'Join the waiting list', exact: true });
    const signup = page.getByRole('button', { name: 'Create an account', exact: true });
    await expect(enabled ? waitlist : signup).toHaveCount(3);
    await expect(enabled ? signup : waitlist).toHaveCount(0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await expect(page.locator('img[src="/images/homepage-workspace-desktop.png"]')).toHaveAttribute('alt', /Voice Memo selected and the microphone idle/);
    if (enabled) {
      await expect(page.getByText('Good Idea is in beta.', { exact: true })).toBeVisible();
      await expect(page.getByText(/Have an invitation|Invitation code|Check invitation/)).toHaveCount(0);
      for (let index = 0; index < 3; index++) {
        const trigger = waitlist.nth(index);
        await trigger.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('input, form')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Close waiting list' })).toBeFocused();
        for (let step = 0; step < 4; step++) {
          await page.keyboard.press('Tab');
          assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)));
        }
        const link = dialog.getByRole('link', { name: 'Open the waiting-list form' });
        if (responder) {
          await expect(link).toHaveAttribute('href', responder);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          await expect(dialog).toContainText('Opening it doesn’t save your email.');
          if (index === 0) {
            const popupPromise = context.waitForEvent('page');
            await link.click();
            const popup = await popupPromise;
            await popup.waitForLoadState();
            await expect(popup.getByRole('heading', { name: 'Offline navigation fixture' })).toBeVisible();
            assert.equal(await popup.evaluate(() => window.opener), null);
            await popup.close();
            await page.bringToFront();
          }
        } else {
          await expect(dialog.getByRole('link')).toHaveCount(0);
          await expect(dialog.getByRole('status')).toHaveText('The waiting list isn’t open yet. Please check back soon.');
        }
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
      }
      for (const index of [0, 1]) {
        await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toHaveCount(2);
        await expect(page.getByPlaceholder('Username or your@email.com')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Google', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'GitHub', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: /Create Account|Create Free Account/ })).toHaveCount(0);
        await page.getByRole('button', { name: 'Join the waiting list', exact: true }).nth(3 + index).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: 'Close waiting list' }).click();
      }
      await page.locator('.home-final-actions').getByRole('button', { name: 'Sign in', exact: true }).click();
      await expect(page.getByPlaceholder('Username or your@email.com')).toBeVisible();
      await page.goto(`${origin}/integrations${mock ? '?preview=homepage' : ''}`, { waitUntil: 'networkidle' });
      await expect(waitlist).toHaveCount(3);
    } else {
      await signup.first().click();
      await expect(page.getByRole('button', { name: 'Create Account', exact: true })).toBeVisible();
      await expect(page.getByPlaceholder('e.g. alex or gera')).toBeVisible();
    }
    await page.goto(`${origin}/friends-and-family${mock ? '?preview=homepage' : ''}`, { waitUntil: 'networkidle' });
    await expect(page.getByText(/Have an invitation|Invitation code|Check invitation|Friends & family beta/)).toHaveCount(0);
    assert.equal(await page.evaluate(() => window.__microphoneCalls), 0);
    checks.push({ width, passed: true });
    await page.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(rejected, []);
  assert.ok(sockets.every(socket => socket === 'ws://127.0.0.1:9'));
  const result = { passed: true, label, enabled, mock, root, responder, checks, errors, rejected, offlineFixtures, blockedSockets: sockets, externalRequestsTransmitted: 0, realSubmissions: 0, microphoneCalls: 0, limitations: 'Offline UI/navigation verification only. No real signin, form submission, saved row or server-side admission test.' };
  writeFileSync(join(evidence, `${label}-checks.json`), JSON.stringify(result, null, 2));
  console.log(`${label}: passed at 1440, 390, 320; all network dependencies intercepted before transmission.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
