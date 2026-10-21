// Whole-page output story: actual screenshots, complete excerpts and no live actions.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
process.chdir(new URL("..", import.meta.url).pathname);
const origin = "http://127.0.0.1:5192";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({ serviceWorkers: "block" });
const outbound = [],
  exceptions = [],
  apiRequests = [],
  checks = [];
await context.route("**/*", (r) => {
  const u = new URL(r.request().url());
  if (u.origin !== origin) {
    outbound.push(u.origin + u.pathname);
    return r.abort();
  }
  if (/^\/(api|__mock)\//.test(u.pathname)) apiRequests.push(u.pathname);
  return r.continue();
});
const page = await context.newPage();
page.on("pageerror", (e) => exceptions.push(e.message));
const noOverflow = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
    ["small", 320, 720],
  ]) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${origin}/?preview=homepage`, {
      waitUntil: "networkidle",
    });
    assert.match(
      response.headers()["content-security-policy"],
      /connect-src\s+'self'/,
    );
    await expect(page.locator('[data-staging-banner="true"]')).toBeVisible();
    await noOverflow();
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.equal(await page.locator(".home-output-scene").count(), 3);
    assert.equal(await page.getByRole("tab").count(), 0);
    for (const [id, label] of [
      ["report", "Market report"],
      ["prd", "Product spec"],
      ["build", "Build handoff"],
    ]) {
      const scene = page.locator(`[data-output="${id}"]`);
      await expect(scene).toBeVisible();
      assert.equal(
        await scene
          .locator("img")
          .evaluateAll((els) =>
            els.every((el) => el.complete && el.naturalWidth > 0),
          ),
        true,
      );
      const picture = scene.locator("img").first();
      if (width <= 650)
        assert.match(
          await picture.evaluate((el) => el.currentSrc),
          width <= 360 ? /-small/ : /-mobile/,
        );
      if (id === "report") {
        for (const img of await scene
          .locator(".home-gallery-risk-details img")
          .all())
          await expect(img).toBeVisible();
      }
      if (id === "prd") {
        assert.equal(
          await scene
            .locator(".home-gallery-prd")
            .evaluate((el) => getComputedStyle(el).maxHeight),
          "none",
        );
        if (width <= 650)
          assert.match(
            await picture.evaluate((el) => el.currentSrc),
            /excerpt/,
          );
      }
      if (id === "build") {
        assert.match(
          await picture.evaluate((el) => el.currentSrc),
          /blueprint-/,
        );
        assert.equal(await scene.locator("input,select,pre,code").count(), 0);
      }
      const enlarge = scene.getByRole("button", {
        name: `Enlarge ${label.toLowerCase()} example`,
        exact: true,
      });
      await enlarge.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: `${label} example`, exact: true }),
      ).toBeVisible();
      const close = dialog.getByRole("button", {
        name: "Close enlarged example",
      });
      await expect(close).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(dialog.getByRole("region")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(close).toBeFocused();
      await noOverflow();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(enlarge).toBeFocused();
      await enlarge.click();
      await close.click();
      await expect(enlarge).toBeFocused();
    }
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
    }
    await page
      .locator("header")
      .getByRole("button", { name: "Create an account", exact: true })
      .click();
    await expect(
      page.getByPlaceholder("e.g. alex or gera", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.goto(`${origin}/?preview=homepage`, {
      waitUntil: "networkidle",
    });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    await page.goto(`${origin}/?preview=homepage`, {
      waitUntil: "networkidle",
    });
    await noOverflow();
    await page.screenshot({
      path: `artifacts/homepage-story-${name}-full.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `artifacts/homepage-story-${name}-hero.png`,
    });
    await page.setViewportSize({ width, height: 2200 });
    for (const id of ["report", "prd", "build"])
      await page
        .locator(`[data-output="${id}"]`)
        .screenshot({ path: `artifacts/homepage-story-${name}-${id}.png` });
    checks.push(
      `${width}px: all three outputs visible without tabs; qualitative analysis visible; coherent spec excerpt/full desktop spec without height clipping; complete blueprint handoff; loaded images, keyboard enlargement/focus trap/Escape/close/return, anchors, account entry and no horizontal overflow`,
    );
  }
  assert.deepEqual(apiRequests, []);
  await page.goto(origin, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Dismiss onboarding", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Dismiss onboarding", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Capture Your Idea", exact: true }),
  ).toBeVisible();
  assert.deepEqual(outbound, []);
  assert.deepEqual(exceptions, []);
  const result = {
    passed: true,
    origin,
    checks,
    outbound,
    exceptions,
    homepageApiRequests: apiRequests,
    limits:
      "Synthetic screenshots of real existing UI. Behavior checks support but do not replace visual inspection/owner approval. No live generation, installation, auth submission or context sync.",
  };
  writeFileSync(
    "artifacts/homepage-story-checks.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
