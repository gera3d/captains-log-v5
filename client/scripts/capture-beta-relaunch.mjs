import { mkdirSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:5193';
const destination = 'http://127.0.0.1:5194/waitlist-form';
const output = process.env.BETA_EVIDENCE_DIR;
if (!output) throw new Error('Set BETA_EVIDENCE_DIR for screenshots.');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', deviceScaleFactor: 2 });
  await context.route('**/*', route => {
    const request = route.request();
    if (request.method() === 'GET' && (new URL(request.url()).origin === origin || request.url() === destination)) return route.continue();
    throw new Error(`Unexpected request: ${request.method()} ${new URL(request.url()).origin}`);
  });
  await context.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => { throw new Error('Microphone forbidden'); };
  });
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['small', 320, 740]]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}/?preview=homepage`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${output}/early-${name}-homepage.png`, fullPage: true });
    await page.getByRole('button', { name: 'Join the waiting list', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: `${output}/early-${name}-waiting-list.png` });
    await page.getByRole('button', { name: 'Close waiting list' }).click();
    await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.screenshot({ path: `${output}/early-${name}-signin.png` });
    await page.close();
  }
  console.log(`Captured desktop, mobile and small homepage/waiting-list/signin screenshots in ${output}`);
} finally {
  await browser.close();
}
