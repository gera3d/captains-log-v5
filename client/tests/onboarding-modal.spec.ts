import { test, expect } from '@playwright/test';

test.describe('Dashboard Onboarding Modal', () => {
  test('appears for first-time users, is styled, dismissible, and does not reappear', async ({ page }) => {
    // 1. Go to the app
    await page.goto('https://whisper.why57.com');

    // 2. Clear onboarding state to simulate first-time user
    await page.evaluate(() => {
      localStorage.removeItem('dashboardOnboardingSeen');
    });

    // 3. Reload to ensure clean state
    await page.reload();

    // 4. --- AUTHENTICATION STEP ---
    // NOTE: The app uses Google OAuth, which is hard to automate in Playwright.
    // If you have a test user/session, set it up here. Otherwise, run the test, log in manually, and let the test continue.
    // Pause for manual login if not already authenticated
    // Use a more specific locator for the "Sign In" button to avoid strict mode violation
    // If VITE_BYPASS_AUTH is set, skip manual login pause
    const bypassAuth = process.env.VITE_BYPASS_AUTH === "true";
    if (!bypassAuth) {
      const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
      if (await signInButton.isVisible()) {
        console.log('Please sign in manually to continue the onboarding modal test...');
        await page.pause();
      }
    }

    // 5. Wait for onboarding modal to appear
    const modal = page.locator('text=Welcome to Captain\'s Log!');
    await expect(modal).toBeVisible();

    // 6. Check modal styling (basic checks)
    const modalContainer = page.locator('.fixed.inset-0.z-50');
    await expect(modalContainer).toBeVisible();
    await expect(modalContainer).toHaveCSS('background-color', /rgba|rgb/);

    // 7. Check onboarding message and features
    await expect(page.locator('text=Here’s a quick guide to get you started:')).toBeVisible();
    await expect(page.locator('text=Record: Tap the mic to capture voice notes instantly.')).toBeVisible();
    await expect(page.locator('text=View: See and organize all your notes below.')).toBeVisible();
    await expect(page.locator('text=Share/Export: Easily share or export your notes anytime.')).toBeVisible();

    // 8. Dismiss the modal (click "Got it!")
    await page.locator('button:has-text("Got it!")').click();

    // 9. Modal should disappear
    await expect(modal).toBeHidden();

    // 10. Reload the page
    await page.reload();

    // 11. Modal should NOT reappear
    await expect(modal).toBeHidden();
  });
});