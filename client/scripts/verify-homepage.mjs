// Synthetic-only homepage review. Network attempts are intercepted before transmission.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
const target = new URL(process.env.STAGING_URL || "http://127.0.0.1:5192");
assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.protocol, "http:");
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({ serviceWorkers: "block" });
const externalAttempts = [],
  pageErrors = [],
  apiRequests = [],
  results = [];
await context.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== target.origin) {
    externalAttempts.push(url.origin + url.pathname);
    await route.abort("blockedbyclient");
    return;
  }
  if (/^\/(api|__mock)\//.test(url.pathname)) apiRequests.push(url.pathname);
  await route.continue();
});
const page = await context.newPage();
page.on("pageerror", (error) => pageErrors.push(error.message));
mkdirSync("artifacts", { recursive: true });
const gotoHome = async () => {
  const response = await page.goto(`${target.origin}/?preview=homepage`, {
    waitUntil: "networkidle",
  });
  assert.match(
    response.headers()["content-security-policy"],
    /connect-src\s+'self'/,
  );
  await expect(page.locator('[data-staging-banner="true"]')).toBeVisible();
  assert.match(
    await response.text(),
    /<title>GoodIdea \| Record your thoughts and work through your ideas<\/title>/,
  );
  await expect(page).toHaveTitle("[MOCK STAGING] Good Idea");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Record a voice memo or type out an idea. Keep the original note, work through it, and decide what to do next with GoodIdea.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Have an idea\?\s*Let’s figure out what\s*to do with it\./,
  );
};
const checkOverflow = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Horizontal overflow",
  );
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
    ["small", 320, 720],
  ]) {
    await page.setViewportSize({ width, height });
    await gotoHome();
    await checkOverflow();
    assert.match(
      await page.locator(".home-demo img").evaluate((el) => el.currentSrc),
      width <= 650 ? /homepage-workspace-mobile/ : /homepage-workspace-desktop/,
    );
    // Local anchors must reach the named section without a hidden/mobile menu dependency.
    for (const [label, id] of [
      ["How it works", "how-it-works"],
      ["The dashboard", "workspace"],
      ["Questions", "faq"],
    ]) {
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: label, exact: true })
        .click();
      assert.equal(new URL(page.url()).hash, `#${id}`);
      await expect
        .poll(() =>
          page.locator(`#${id}`).evaluate((el) => {
            const top = el.getBoundingClientRect().top;
            const atBottom =
              Math.abs(
                scrollY - (document.documentElement.scrollHeight - innerHeight),
              ) < 2;
            return (
              Math.abs(top) < 50 || (atBottom && top >= 0 && top < innerHeight)
            );
          }),
        )
        .toBe(true);
    }
    // Every homepage account entry opens the existing correct form; no form is submitted.
    for (const [scope, label, mode, index] of [
      ["header", "Sign in", "signin", 0],
      ["header", "Create an account", "signup", 0],
      ["main", "Create an account", "signup", 0],
      ["main", "Create an account", "signup", 1],
      ["main", "Sign in", "signin", 0],
    ]) {
      await page
        .locator(scope)
        .getByRole("button", { name: label, exact: true })
        .nth(index)
        .click();
      await expect(
        page.getByRole("button", { name: "Close", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByPlaceholder(
          mode === "signup"
            ? "e.g. alex or gera"
            : "Username or your@email.com",
          { exact: true },
        ),
      ).toBeVisible();
      if (mode === "signup")
        await expect(
          page.getByPlaceholder("your@email.com", { exact: true }),
        ).toBeVisible();
      await checkOverflow();
      await page.getByRole("button", { name: "Close", exact: true }).click();
    }
    // Keyboard access: skip link, main navigation with visible focus, native FAQ expansion.
    await gotoHome();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    await gotoHome();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const link = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "How it works", exact: true });
    await expect(link).toBeFocused();
    const outline = await link.evaluate(
      (el) => getComputedStyle(el).outlineWidth,
    );
    assert.equal(outline, "3px");
    await page.keyboard.press("Enter");
    assert.equal(new URL(page.url()).hash, "#how-it-works");
    const faq = page.locator("summary").first();
    await faq.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("details").first()).toHaveAttribute("open", "");
    await checkOverflow();
    await gotoHome();
    await page.screenshot({
      path: `artifacts/homepage-revised-${name}-full.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `artifacts/homepage-revised-${name}-hero.png`,
    });
    results.push(
      `${name} ${width}px: anchors, all account controls, keyboard focus/skip/FAQ, no overflow`,
    );
  }
  // Preserve destinations, and explicitly label synthetic product content.
  for (const route of ["privacy", "terms", "contact"])
    await expect(
      page.locator("footer").getByRole("link", { name: route, exact: false }),
    ).toHaveAttribute("href", `/${route}`);
  await expect(
    page.getByText("Example content", {
      exact: true,
    }),
  ).toBeVisible();
  assert.deepEqual(
    apiRequests,
    [],
    "Opening/reading homepage and auth forms must not invoke API workflows",
  );
  // Default mock path remains signed in and retains approved onboarding.
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(target.origin, { waitUntil: "networkidle" });
    await expect(
      page.getByRole("button", { name: "Dismiss onboarding", exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: `artifacts/welcome-regression-${name}.png` });
    await page
      .getByRole("button", { name: "Dismiss onboarding", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Text Monologue", exact: true })
      .click();
    await page.screenshot({
      path: `artifacts/dashboard-reference-${name}.png`,
      fullPage: true,
    });
    await page.evaluate(() =>
      localStorage.removeItem("dashboardOnboardingSeen"),
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoHome();
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  results.push(
    "Reduced motion disables smooth scrolling; legal/contact destinations preserved; mobile-specific actual product capture selected",
  );
  assert.deepEqual(externalAttempts, []);
  assert.deepEqual(pageErrors, []);
  const result = {
    passed: true,
    origin: target.origin,
    results,
    externalAttempts,
    pageErrors,
    homepageApiRequests: apiRequests,
    limits:
      "Synthetic browser checks only; no credentials submitted, real auth/backend/AI exercised or independent acceptance inferred.",
  };
  writeFileSync(
    "artifacts/homepage-revised-checks.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
