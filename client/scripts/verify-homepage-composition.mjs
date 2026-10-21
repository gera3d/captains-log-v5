import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:5193';
const evidence = process.env.BETA_EVIDENCE_DIR || 'artifacts/beta-relaunch';
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
const errors = [], requests = [], checks = [];
try {
  const context = await browser.newContext({ serviceWorkers: 'block', deviceScaleFactor: 2 });
  await context.route('**/*', route => {
    const request = route.request();
    if (new URL(request.url()).origin === origin && request.method() === 'GET') return route.continue();
    requests.push({ method: request.method(), origin: new URL(request.url()).origin });
    return route.abort();
  });
  await context.addInitScript(() => {
    window.__microphoneCalls = 0;
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: () => {
      window.__microphoneCalls++;
      throw new Error('Microphone forbidden');
    } } });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/?preview=homepage`, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('[MOCK STAGING] GoodIdea');
  for (const width of [1440, 1280, 1100, 961, 960, 900, 851, 850, 818, 768, 700, 651, 650, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const measurements = await page.evaluate(() => {
      const rect = selector => {
        const element = document.querySelector(selector), bounds = element.getBoundingClientRect();
        return { x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom, width: bounds.width, height: bounds.height, font: getComputedStyle(element).fontSize };
      };
      const brands = [...document.querySelectorAll('.goodidea-word')].map(element => ({
        text: element.textContent, whitespace: getComputedStyle(element).whiteSpace,
        regular: getComputedStyle(element).fontWeight,
        emphasis: getComputedStyle(element.querySelector('strong')).fontWeight,
      }));
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        headline: rect('.home-intro h1'), copy: rect('.home-intro-copy'),
        nav: rect('.home-nav'), logo: rect('.home-nav > a'),
        links: rect('.home-nav-links'), actions: rect('.home-account-actions'),
        brandText: document.querySelector('.home-page').innerText,
        brands,
      };
    });
    assert.equal(measurements.overflow, false, `Page overflow at ${width}`);
    for (const item of ['logo', 'links', 'actions']) {
      assert.ok(measurements[item].x >= 0 && measurements[item].right <= width, `${item} clipped at ${width}`);
    }
    assert.ok(measurements.logo.right <= measurements.actions.x, `Account controls overlap logo at ${width}`);
    if (width > 650) {
      const centers = ['logo', 'links', 'actions'].map(key => measurements[key].y + measurements[key].height / 2);
      assert.ok(Math.max(...centers) - Math.min(...centers) < 2, `Header wraps at ${width}`);
      assert.ok(measurements.logo.right < measurements.links.x && measurements.links.right < measurements.actions.x, `Header controls overlap at ${width}`);
    } else {
      assert.ok(measurements.links.y >= measurements.actions.bottom, `Mobile section navigation overlaps account controls at ${width}`);
    }
    if (width <= 960) {
      assert.ok(measurements.copy.y >= measurements.headline.bottom + 16, `Hero reading flow disconnected at ${width}`);
      assert.ok(Math.abs(measurements.copy.x - measurements.headline.x) < 2, `Hero left edges differ at ${width}`);
    } else {
      assert.ok(measurements.copy.x > measurements.headline.right, `Desktop hero lost columns at ${width}`);
      assert.ok(Math.abs(measurements.copy.y - measurements.headline.y) < 8, `Desktop hero top alignment differs at ${width}`);
    }
    assert.ok(!measurements.brandText.includes('Good Idea'), `Split brand name at ${width}`);
    assert.ok(measurements.brands.length >= 4);
    assert.ok(measurements.brands.every(brand => brand.text === 'GoodIdea' && brand.whitespace === 'nowrap' && brand.regular === '400' && brand.emphasis === '700'));
    await expect(page.getByRole('button', { name: 'Join the waiting list', exact: true })).toHaveCount(3);
    checks.push({ width, ...measurements, brandText: undefined });
  }
  await page.setViewportSize({ width: 818, height: 1000 });
  await page.getByRole('button', { name: 'Join the waiting list', exact: true }).first().click();
  await expect(page.getByRole('dialog').locator('.goodidea-word')).toHaveText('GoodIdea');
  const bounds = await page.getByRole('dialog').boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 818);
  await page.getByRole('button', { name: 'Close waiting list' }).click();
  await page.getByRole('button', { name: 'Enlarge market report example' }).click();
  await expect(page.getByRole('dialog').locator('.goodidea-word')).toHaveText('GoodIdea');
  await page.getByRole('button', { name: 'Close enlarged example' }).click();
  assert.equal(await page.evaluate(() => window.__microphoneCalls), 0);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  writeFileSync(`${evidence}/composition-checks.json`, JSON.stringify({ passed: true, checks, errors, requests, microphoneCalls: 0 }, null, 2));
  console.log('Composition passed at 15 widths including818: header rows, hero alignment, no clipping/overflow, GoodIdea word treatment and dialogs.');
} finally {
  await browser.close();
}
