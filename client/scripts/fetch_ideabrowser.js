import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const url = 'https://www.ideabrowser.com/idea/student-loan-plan-picker-for-borrowers-kicked-off-save-7306dde7';
  console.log('Navigating to:', url);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log('Navigation warning:', e.message);
  }

  // Wait for challenge or content to load
  await page.waitForTimeout(6000);

  const title = await page.title();
  console.log('Page Title:', title);

  const bodyText = await page.innerText('body');
  console.log('Body Text length:', bodyText.length);

  fs.writeFileSync('scripts/ideabrowser_page.txt', bodyText, 'utf8');
  console.log('Saved page text to scripts/ideabrowser_page.txt');

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
