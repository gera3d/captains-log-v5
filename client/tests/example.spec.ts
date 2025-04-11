import { test, expect } from '@playwright/test';

test('homepage has expected title and takes screenshot', async ({ page }) => {
  // Go to your Vite dev server
  await page.goto('http://localhost:5173');
  // Check the title contains "Vite" (or change as needed)
  await expect(page).toHaveTitle(/Vite/i);
  // Take a screenshot of the full page
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
});