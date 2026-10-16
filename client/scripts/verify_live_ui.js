import { chromium } from 'playwright';

async function verify() {
  console.log('Launching headless browser to verify GoodIdea live UI...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Error]: ${msg.text()}`);
  });

  const url = 'http://10.0.0.60:3001/idea/idea_1790639768294_u5yt4';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  console.log('Page loaded. Checking title...');
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Check Venture Scorecard presence
  const scorecardHeading = await page.locator('text=Venture Viability Scorecard').isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`Venture Scorecard visible: ${scorecardHeading}`);

  // Check Community Signals presence
  const commSignalsHeading = await page.locator('text=Community Signals & Distribution Wedges').isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`Community Signals visible: ${commSignalsHeading}`);

  // Check Launch Kit Tab
  const launchKitTab = page.locator('button:has-text("Launch Kit")');
  const launchKitVisible = await launchKitTab.isVisible();
  console.log(`Launch Kit tab button visible: ${launchKitVisible}`);

  if (launchKitVisible) {
    console.log('Clicking "Launch Kit" tab...');
    await launchKitTab.click();
    await page.waitForTimeout(500);

    const v1Heading = await page.locator('text=Launch Your Long-Running V1 Build').first().isVisible().catch(() => false);
    const configHeading = await page.locator('text=Customize Architecture & Tooling').first().isVisible().catch(() => false);
    const landingPageHeading = await page.locator('text=High-Converting Landing Page').first().isVisible().catch(() => false);
    const adHooksHeading = await page.locator('text=High-Converting Ad Angles').first().isVisible().catch(() => false);

    console.log(`- V1 Launch Center visible: ${v1Heading}`);
    console.log(`- Architecture Configurator visible: ${configHeading}`);
    console.log(`- Landing Page Copy visible: ${landingPageHeading}`);
    console.log(`- Ad Hooks visible: ${adHooksHeading}`);

    // Take screenshot of Launch Kit
    await page.screenshot({ path: 'scripts/screenshot_launch_kit.png', fullPage: true });
    console.log('Saved screenshot to scripts/screenshot_launch_kit.png');
  }

  // Click back to Core Idea and take screenshot
  const coreIdeaTab = page.locator('button:has-text("Core Idea")');
  await coreIdeaTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/screenshot_core_idea.png', fullPage: false });
  console.log('Saved screenshot to scripts/screenshot_core_idea.png');

  await browser.close();
  console.log('Verification finished successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
