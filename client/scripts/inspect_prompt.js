import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://10.0.0.60:3001/idea/idea_1790639768294_u5yt4');
  await page.locator('button:has-text("Launch Kit")').click();
  await page.waitForTimeout(500);
  const prompt = await page.locator('.font-mono.whitespace-pre-wrap').first().innerText();
  console.log('=== FULL PROMPT IN BROWSER ===');
  console.log(prompt);
  console.log('==============================');
  await browser.close();
}

main().catch(console.error);
