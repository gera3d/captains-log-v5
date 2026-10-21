import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:5193';
const evidence = process.env.BETA_EVIDENCE_DIR || 'artifacts/visual-story';
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
const captures = [];
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['818', 818, 900], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const request = route.request();
      if (new URL(request.url()).origin === origin && request.method() === 'GET') return route.continue();
      return route.abort();
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: () => { throw new Error('Microphone forbidden'); } } });
    });
    const page = await context.newPage();
    await page.goto(`${origin}/?preview=homepage`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Turn your idea into a plan to build.' })).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    });
    const session = await context.newCDPSession(page);
    const save = async label => {
      const { data } = await session.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false, clip: { x: 0, y: await page.evaluate(() => scrollY), width, height, scale: 1 } });
      const png = Buffer.from(data, 'base64');
      if (png.readUInt32BE(16) !== width || png.readUInt32BE(20) !== height) throw new Error('Viewport screenshot dimensions differ.');
      const path = `${evidence}/story-${name}-${label}.png`;
      writeFileSync(path, png);
      captures.push({ name, width, height, path, scrollY: await page.evaluate(() => scrollY), method: 'CDP surface with explicit viewport clip, initial exact viewport, DPR1' });
    };
    await save('opening');
    await page.locator('.capture-story').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 22));
    await save('overview');
    if (name === 'mobile') {
      await page.locator('.capture-story-stage').nth(1).evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 22));
      await save('spec');
      await page.locator('.capture-story-stage').nth(2).evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 22));
      await save('handoff');
    }
    await context.close();
  }
  writeFileSync(`${evidence}/story-captures.json`, JSON.stringify(captures, null, 2));
  console.log('Captured viewport candidates at1440,818,390; dimensions verified, pixels require visual inspection.');
} finally {
  await browser.close();
}
