import { mkdirSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:5193';
const destination = 'http://127.0.0.1:5194/waitlist-form';
const output = process.env.BETA_EVIDENCE_DIR;
if (!output) throw new Error('Set BETA_EVIDENCE_DIR for screenshots.');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
try {
  const design = process.env.BETA_CAPTURE_DESIGN === 'true';
  const context = await browser.newContext({ serviceWorkers: 'block', deviceScaleFactor: design ? 1 : 2 });
  await context.route('**/*', route => {
    const request = route.request();
    if (request.method() === 'GET' && (new URL(request.url()).origin === origin || request.url() === destination)) return route.continue();
    throw new Error(`Unexpected request: ${request.method()} ${new URL(request.url()).origin}`);
  });
  await context.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => { throw new Error('Microphone forbidden'); };
  });
  const sizes = design ? [['818', 818, 720], ['desktop', 1440, 1000], ['mobile', 390, 844]] : [['desktop', 1440, 1000], ['mobile', 390, 844], ['small', 320, 740]];
  for (const [name, width, height] of sizes) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}/?preview=homepage`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${output}/${design ? 'design' : 'early'}-${name}-${design ? 'hero' : 'homepage'}.png`, fullPage: !design, scale: design ? 'css' : 'device' });
    await page.getByRole('button', { name: 'Join the waiting list', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: `${output}/${design ? 'design' : 'early'}-${name}-waiting-list.png` });
    await page.getByRole('button', { name: 'Close waiting list' }).click();
    await page.locator('header').getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.screenshot({ path: `${output}/${design ? 'design' : 'early'}-${name}-signin.png` });
    await page.close();
  }
  console.log(`Captured ${sizes.map(([name]) => name).join(', ')} homepage/waiting-list/signin screenshots in ${output}`);
} finally {
  await browser.close();
}
