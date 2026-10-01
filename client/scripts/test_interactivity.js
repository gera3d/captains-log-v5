import { chromium } from 'playwright';
import assert from 'assert';

async function testInteractivity() {
  console.log('--- STARTING COMPREHENSIVE PLAYWRIGHT TEST SUITE ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  const url = 'http://10.0.0.60:3001/idea/idea_1790639768294_u5yt4';
  console.log(`1. Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Check Venture Cockpit bottom section
  console.log('2. Verifying V1 Launch Center presence on default Venture Cockpit tab...');
  const cockpitKitHeading = page.locator('h3:has-text("Launch Your Long-Running V1 Build")');
  await cockpitKitHeading.scrollIntoViewIfNeeded();
  assert(await cockpitKitHeading.isVisible(), 'Launch Kit heading should be visible on Cockpit overview');
  console.log('  ✓ V1 Launch Center visible on Cockpit tab');

  // 2. Click Launch Kit dedicated Tab
  console.log('3. Switching to dedicated Launch Kit Tab...');
  const launchKitTab = page.locator('button:has-text("Launch Kit")');
  await launchKitTab.click();
  await page.waitForTimeout(500);

  // 3. Verify Initial State
  const initialPrompt = await page.locator('.font-mono.whitespace-pre-wrap').first().innerText();
  console.log(`4. Initial Prompt loaded (Length: ${initialPrompt.length} chars)`);
  console.log(`Preview: ${initialPrompt.substring(0, 150)}...`);
  assert(initialPrompt.length > 50, 'Prompt should have content');

  // 4. Test Lever 1: Target AI Tool -> Claude Code
  console.log('5. Testing Lever 1: Target AI Tool -> Claude Code...');
  const agentSelect = page.locator('#cfg-agent');
  await agentSelect.scrollIntoViewIfNeeded();
  await agentSelect.selectOption('claude');
  await page.waitForTimeout(300);

  // 5. Test Lever 2: Core Framework -> Next.js 15
  console.log('6. Testing Lever 2: Core Framework -> Next.js 15...');
  const stackSelect = page.locator('#cfg-framework');
  await stackSelect.selectOption('nextjs');
  await page.waitForTimeout(300);

  const nextPrompt = await page.locator('.font-mono.whitespace-pre-wrap').first().innerText();
  assert(nextPrompt.includes('Next.js 15 (App Router)'), 'Prompt must reactively reflect Next.js 15 stack');
  console.log('  ✓ Prompt reactively updated with Next.js 15 stack');

  const termCmd = await page.locator('span.select-all').first().innerText();
  console.log(`  ✓ Reactive Terminal Kickoff Command: "${termCmd}"`);
  assert(termCmd.includes('npx create-next-app@latest'), 'Terminal command must reactively update to create-next-app');

  // 6. Test Lever 3: Data Strategy -> Supabase
  console.log('7. Testing Lever 3: Data & Backend -> Supabase...');
  const dataSelect = page.locator('#cfg-data');
  await dataSelect.selectOption('supabase');
  await page.waitForTimeout(300);

  const supabasePrompt = await page.locator('.font-mono.whitespace-pre-wrap').first().innerText();
  assert(supabasePrompt.includes('Supabase Integration') || supabasePrompt.includes('supabase.ts'), 'Prompt must reactively include Supabase section');
  console.log('  ✓ Prompt reactively updated with Supabase integration');

  // 7. Test Lever 4: Build Horizon -> Rapid Prototype
  console.log('8. Testing Lever 4: Build Horizon -> Rapid Prototype (2-4h)...');
  const horizonSelect = page.locator('#cfg-horizon');
  await horizonSelect.selectOption('prototype');
  await page.waitForTimeout(300);

  const protoPrompt = await page.locator('.font-mono.whitespace-pre-wrap').first().innerText();
  assert(protoPrompt.includes('rapid_prototype_guidelines') || protoPrompt.includes('fastest 4-file'), 'Prompt must reactively update build horizon guidelines');
  console.log('  ✓ Prompt reactively updated with Rapid Prototype guidelines');

  // 8. Test Sub-Tab Switching (Core Engine Directive)
  console.log('9. Testing Prompt Sub-Tab Switching...');
  const engineTab = page.locator('button:has-text("Core Engine Directive")');
  if (await engineTab.isVisible()) {
    await engineTab.click();
    await page.waitForTimeout(300);
    const enginePrompt = await page.locator('.font-mono.whitespace-pre-wrap').first().innerText();
    console.log(`  ✓ Core Engine Directive Tab activated (Length: ${enginePrompt.length} chars)`);
    // Switch back to scaffold
    await page.locator('button:has-text("Cursor / CLI Scaffold")').click();
    await page.waitForTimeout(300);
  }

  // 9. Test Copy Main CTA Button
  console.log('10. Testing Main CTA "Copy Configured V1 Prompt" button...');
  const mainCtaBtn = page.locator('button:has-text("Copy Configured V1 Prompt")');
  await mainCtaBtn.click();
  await page.waitForTimeout(300);
  const isCopiedVisible = await page.locator('button:has-text("Copied V1 Prompt!")').isVisible();
  assert(isCopiedVisible, 'Button text must change to "Copied V1 Prompt!"');
  console.log('  ✓ Main CTA copy button successfully toggled state to "Copied V1 Prompt!"');

  // 10. Test Reset to Recommended
  console.log('11. Testing "Reset to Recommended" button...');
  const resetBtn = page.locator('button:has-text("Reset to Recommended")');
  await resetBtn.click();
  await page.waitForTimeout(400);

  const resetAgent = await agentSelect.inputValue();
  const resetFramework = await stackSelect.inputValue();
  const resetData = await dataSelect.inputValue();
  const resetHorizon = await horizonSelect.inputValue();
  assert.strictEqual(resetAgent, 'cursor', 'Agent should reset to cursor');
  assert.strictEqual(resetFramework, 'vite-react', 'Framework should reset to vite-react');
  assert.strictEqual(resetData, 'mock', 'Data backend should reset to mock');
  assert.strictEqual(resetHorizon, 'v1-modular', 'Horizon should reset to v1-modular');
  console.log('  ✓ All 4 levers successfully restored to recommended defaults');

  // 11. Capture high-res screenshot
  console.log('12. Capturing high-resolution full page screenshot...');
  await page.screenshot({ path: 'scripts/screenshot_customized_interactive.png', fullPage: true });
  console.log('  ✓ Saved screenshot to scripts/screenshot_customized_interactive.png');

  await browser.close();
  console.log('====================================================');
  console.log('🎉 100% OF TESTS PASSED - ALL FEATURES WORKING END-TO-END');
  console.log('====================================================');
}

testInteractivity().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
