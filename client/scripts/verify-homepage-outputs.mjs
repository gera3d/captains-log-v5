// Visual product gallery checks. Synthetic mode, no real output generation or installation.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
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
await context.route("**/*", (route) => {
  const u = new URL(route.request().url());
  if (u.origin !== origin) {
    outbound.push(u.origin + u.pathname);
    return route.abort();
  }
  if (/^\/(api|__mock)\//.test(u.pathname)) apiRequests.push(u.pathname);
  return route.continue();
});
const page = await context.newPage();
page.on("pageerror", (e) => exceptions.push(e.message));
const names = ["Market report", "Product spec", "Build handoff"];
const tab = (name) => page.getByRole("tab", { name, exact: true });
const noOverflow = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
const selected = async (name) => {
  await expect(tab(name)).toHaveAttribute("aria-selected", "true");
  assert.equal(await page.getByRole("tabpanel").count(), 1);
  for (const label of names) {
    const button = tab(label);
    await expect(button).toHaveAttribute(
      "tabindex",
      label === name ? "0" : "-1",
    );
    const id = await button.getAttribute("aria-controls");
    assert.equal(await page.locator(`#${id}`).count(), 1);
    await expect(page.locator(`#${id}`)).toHaveAttribute(
      "aria-labelledby",
      await button.getAttribute("id"),
    );
  }
};
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
    await page.screenshot({
      path: `artifacts/outputs-visual-${name}-hero.png`,
    });
    await page.screenshot({
      path: `artifacts/outputs-visual-${name}-full.png`,
      fullPage: true,
    });
    await selected("Market report");
    for (const label of names) {
      await tab(label).click();
      await selected(label);
      await noOverflow();
      const panel = page.getByRole("tabpanel");
      const images = panel.locator("img");
      assert.ok((await images.count()) > 0);
      assert.equal(
        await images.evaluateAll((els) =>
          els.every((el) => el.complete && el.naturalWidth > 0),
        ),
        true,
      );
      assert.equal(await panel.locator("pre,code,input,select").count(), 0);
      await expect(panel.getByText(/Illustrative data/)).toBeVisible();
      const enlarge = panel.getByRole("button", {
        name: `Enlarge ${label.toLowerCase()} example`,
        exact: true,
      });
      await enlarge.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: `${label} example`, exact: true }),
      ).toBeVisible();
      const close = dialog.getByRole("button", {
        name: "Close enlarged example",
        exact: true,
      });
      await expect(close).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(
        dialog.getByRole("region", { name: "Enlarged product screens" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(close).toBeFocused();
      if (label === "Product spec" && width <= 650) {
        const image = dialog.locator("img");
        assert.match(
          await image.evaluate((el) => el.currentSrc),
          /prd-desktop/,
        );
        assert.ok(
          await dialog
            .getByRole("region")
            .evaluate((el) => el.scrollWidth > el.clientWidth),
        );
      }
      await noOverflow();
      await page.screenshot({
        path: `artifacts/outputs-visual-${name}-${label === "Market report" ? "report" : label === "Product spec" ? "prd" : "build"}-enlarged.png`,
      });
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(enlarge).toBeFocused();
      await enlarge.click();
      await close.click();
      await expect(enlarge).toBeFocused();
    }
    await tab("Market report").focus();
    for (const [key, label] of [
      ["ArrowRight", "Product spec"],
      ["ArrowDown", "Build handoff"],
      ["ArrowRight", "Market report"],
      ["ArrowLeft", "Build handoff"],
      ["Home", "Market report"],
      ["End", "Build handoff"],
    ]) {
      await page.keyboard.press(key);
      await selected(label);
      await expect(tab(label)).toBeFocused();
      assert.equal(
        await tab(label).evaluate((el) => getComputedStyle(el).outlineWidth),
        "3px",
      );
    }
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", {
        name: "Enlarge build handoff example",
        exact: true,
      }),
    ).toBeFocused();
    await page
      .locator("header")
      .getByRole("button", { name: "Create an account", exact: true })
      .click();
    await expect(
      page.getByPlaceholder("e.g. alex or gera", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.setViewportSize({ width, height: 1800 });
    for (const [label, key] of [
      ["Market report", "report"],
      ["Product spec", "prd"],
      ["Build handoff", "build"],
    ]) {
      await tab(label).click();
      await page
        .locator("#outputs")
        .screenshot({ path: `artifacts/outputs-visual-${name}-${key}.png` });
    }
    checks.push(
      `${width}px: actual screenshot views, responsive images/no overflow, ARIA panels/roving focus, Arrow/Home/End, enlargement focus trap/Escape/close/return; PRD full-width detail accessible on mobile`,
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
      "Actual existing UI captured with disposable synthetic data. No real generation, installation, auth submission, clipboard or context sync tested or claimed.",
  };
  writeFileSync(
    "artifacts/outputs-visual-checks.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
