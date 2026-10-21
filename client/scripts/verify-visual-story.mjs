import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:5193';
const evidence = process.env.BETA_EVIDENCE_DIR || 'artifacts/visual-story';
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
const errors = [], requests = [], checks = [];
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
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
    window.MediaRecorder = class { constructor() { throw new Error('Recording forbidden'); } };
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/?preview=homepage`, { waitUntil: 'networkidle' });
  for (const width of [1440, 961, 818, 768, 700, 651, 650, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const story = page.locator('.capture-story');
    await expect(page.getByRole('heading', { name: 'Turn your idea into a plan to build.' })).toBeVisible();
    await expect(story.getByRole('heading', { level: 3 })).toHaveText(['Capture', 'Refine', 'Use in your tools']);
    await expect(story.locator('input, textarea, form, button, audio')).toHaveCount(0);
    await expect(story.locator('h3 svg')).toHaveCount(3);
    for (const icon of await story.locator('h3 svg').all()) {
      await expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
    await expect(story.locator('.capture-story-stage').last()).toContainText('Copy the brief into your coding tool.');
    await expect(story.locator('.capture-story-footnote')).toContainText('You choose what to copy and build.');
    const measurements = await story.evaluate(element => {
      const box = item => { const bounds = item.getBoundingClientRect(); return { x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom, height: bounds.height, width: bounds.width }; };
      const note = element.querySelector('.capture-story-note');
      return {
        documentOverflow: document.documentElement.scrollWidth > innerWidth,
        story: box(element),
        stages: [...element.querySelectorAll('.capture-story-stage')].map(box),
        note: box(note),
        noteContents: [...note.children].map(box),
        images: [...element.querySelectorAll('img')].map(image => ({ src: image.getAttribute('src'), complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, rendered: box(image), container: box(image.parentElement) })),
      };
    });
    assert.equal(measurements.documentOverflow, false, `Page overflow at ${width}`);
    assert.ok(measurements.stages.every(stage => stage.x >= 0 && stage.right <= width));
    assert.ok(measurements.noteContents.every(item => item.y >= measurements.note.y && item.bottom <= measurements.note.bottom), `Rough note clipped at ${width}`);
    assert.ok(measurements.images.every(image => image.complete && image.naturalWidth === 716));
    assert.ok(measurements.images.every(image => Math.abs(image.rendered.height - image.rendered.width * image.naturalHeight / image.naturalWidth) < 1 && image.rendered.bottom <= image.container.bottom), `Spec or brief content cropped at ${width}`);
    assert.deepEqual(measurements.images.map(image => image.src), ['/images/outputs/prd-mobile-excerpt.png', '/images/outputs/blueprint-mobile.png']);
    if (width > 650) assert.ok(measurements.stages.every(stage => Math.abs(stage.y - measurements.stages[0].y) < 1));
    else assert.ok(measurements.stages[1].y >= measurements.stages[0].bottom && measurements.stages[2].y >= measurements.stages[1].bottom);
    for (const [name, target] of [['See voice capture', '#workspace'], ['See the product spec', '#output-prd'], ['See the build handoff', '#output-build']]) {
      const link = story.getByRole('link', { name });
      await expect(link).toHaveAttribute('href', target);
      await expect(page.locator(target)).toHaveCount(1);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
    }
    for (const type of ['report', 'prd', 'build']) {
      const figure = page.locator(`figure[data-output="${type}"]`);
      await expect(figure).toBeVisible();
      assert.ok(await figure.locator('img').first().evaluate(image => image.complete && image.naturalWidth > 0));
    }
    await expect(page.getByRole('button', { name: 'Join the waiting list', exact: true })).toHaveCount(3);
    await page.getByRole('button', { name: 'Join the waiting list', exact: true }).first().click();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Open the waiting-list form' })).toHaveAttribute('href', 'http://127.0.0.1:5194/waitlist-form');
    await page.keyboard.press('Escape');
    checks.push({ width, ...measurements });
  }
  assert.equal(await page.evaluate(() => window.__microphoneCalls), 0);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  writeFileSync(`${evidence}/visual-story-checks.json`, JSON.stringify({ passed: true, checks, errors, requests, microphoneCalls: 0, writes: 0 }, null, 2));
  console.log('Visual story passed at9 widths: continuous sequence, real artifacts, manual handoff, local anchors, gallery visibility, note fit and beta CTA.');
} finally {
  await browser.close();
}
