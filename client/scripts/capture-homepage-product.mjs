// Capture actual dashboard UI with disposable synthetic local data for public illustration.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
const origin = "http://127.0.0.1:5192";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({ serviceWorkers: "block" });
const externalAttempts = [],
  exceptions = [];
await context.route("**/*", (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin) {
    externalAttempts.push(url.origin + url.pathname);
    return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
page.on("pageerror", (e) => exceptions.push(e.message));
mkdirSync("public/images", { recursive: true });
try {
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.goto(origin, { waitUntil: "networkidle" });
  await expect(page.locator('[data-staging-banner="true"]')).toBeVisible();
  await page
    .getByRole("button", { name: "Dismiss onboarding", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Text Monologue", exact: true })
    .click();
  const title = "A tool library for the neighborhood";
  const thought =
    "I only use my drill a few times a year. Other people on the street probably have tools sitting around too.\n\nCould we make a simple way to see what's available and borrow it? Start with a few neighbors and find out what actually gets used.";
  await page.getByPlaceholder("Idea Title", { exact: false }).fill(title);
  await page
    .getByRole("textbox", { name: "Your idea", exact: true })
    .fill(thought);
  await page
    .getByRole("button", { name: "Generate Business Idea", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Idea captured and structured!", { exact: false }),
  ).toBeVisible({ timeout: 15000 });
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Text Monologue", exact: true })
    .click();
  await page.getByPlaceholder("Idea Title", { exact: false }).fill(title);
  await page
    .getByRole("textbox", { name: "Your idea", exact: true })
    .fill(thought);
  const group = page.locator("main > div > div").first();
  await group.screenshot({
    path: "public/images/homepage-workspace-desktop.png",
  });
  await page.screenshot({
    path: "artifacts/homepage-example-source-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const capture = group.locator(":scope > div").first();
  await capture.screenshot({
    path: "public/images/homepage-workspace-mobile.png",
  });
  await page.screenshot({
    path: "artifacts/homepage-example-source-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(externalAttempts, []);
  assert.deepEqual(exceptions, []);
  writeFileSync(
    "artifacts/homepage-product-provenance.json",
    JSON.stringify(
      {
        origin,
        description:
          "Actual dashboard capture. New disposable browser context, synthetic note and deterministic mock generation only. Images crop the capture/active-ideas group (desktop) and capture form (mobile). No real user data.",
        externalAttempts,
        exceptions,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
