// Built synthetic preview only: no live auth, API writes, clipboard or installation.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
const origin = "http://127.0.0.1:5192";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({ serviceWorkers: "block" });
const outbound = [],
  exceptions = [],
  apiRequests = [],
  checks = [],
  heroComparison = {};
await context.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin) {
    outbound.push(url.origin + url.pathname);
    return route.abort("blockedbyclient");
  }
  if (/^\/(api|__mock)\//.test(url.pathname)) apiRequests.push(url.pathname);
  return route.continue();
});
const page = await context.newPage();
page.on("pageerror", (error) => exceptions.push(error.message));
const labels = ["Market report", "Product spec", "Coding context"];
const tab = (label) => page.getByRole("tab", { name: label, exact: true });
const noOverflow = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
const assertSelected = async (label) => {
  await expect(tab(label)).toHaveAttribute("aria-selected", "true");
  assert.equal(await page.getByRole("tab", { selected: true }).count(), 1);
  assert.equal(await page.getByRole("tabpanel").count(), 1);
  assert.equal(await page.locator('[role="tabpanel"]').count(), 3);
  for (const name of labels) {
    const control = await tab(name).getAttribute("aria-controls");
    assert.equal(await page.locator(`#${control}`).count(), 1);
    await expect(page.locator(`#${control}`)).toHaveAttribute(
      "aria-labelledby",
      await tab(name).getAttribute("id"),
    );
    await expect(tab(name)).toHaveAttribute(
      "tabindex",
      name === label ? "0" : "-1",
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
    await page.screenshot({ path: `artifacts/outputs-${name}-hero.png` });
    if (["desktop", "mobile"].includes(name))
      heroComparison[name] = readFileSync(
        `artifacts/outputs-${name}-hero.png`,
      ).equals(readFileSync(`artifacts/homepage-revised-${name}-hero.png`));
    await page.screenshot({
      path: `artifacts/outputs-${name}-full.png`,
      fullPage: true,
    });
    await assertSelected("Market report");
    for (const label of labels) {
      await tab(label).click();
      await assertSelected(label);
      await expect(
        page
          .getByRole("tabpanel")
          .getByText("Illustrative example", { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole("tabpanel").getByRole("heading")).toHaveText(
        /A tool library for\s*the neighborhood/,
      );
      await noOverflow();
    }
    await tab("Market report").focus();
    for (const [key, label] of [
      ["ArrowRight", "Product spec"],
      ["ArrowDown", "Coding context"],
      ["ArrowRight", "Market report"],
      ["ArrowLeft", "Coding context"],
      ["ArrowUp", "Product spec"],
      ["Home", "Market report"],
      ["End", "Coding context"],
    ]) {
      await page.keyboard.press(key);
      await assertSelected(label);
      await expect(tab(label)).toBeFocused();
      assert.equal(
        await tab(label).evaluate((el) => getComputedStyle(el).outlineWidth),
        "3px",
      );
    }
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tabpanel")).toBeFocused();
    // Existing account entry is preserved; no form submission or OAuth.
    await page
      .locator("header")
      .getByRole("button", { name: "Create an account", exact: true })
      .click();
    await expect(
      page.getByPlaceholder("e.g. alex or gera", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page
      .locator("header")
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await expect(
      page.getByPlaceholder("Username or your@email.com", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(
      page.getByText(/Illustrative excerpts for the same neighborhood/),
    ).toBeVisible();
    await expect(
      page.getByText(/You can also install the GoodIdea capture skill/),
    ).toBeVisible();
    assert.equal(
      await page
        .locator("#outputs a, #outputs input, #outputs pre, #outputs code")
        .count(),
      0,
    );
    // Capture a tall section in a tall viewport to avoid browser fixed-element clipping artifacts.
    await page.setViewportSize({ width, height: 2000 });
    for (const [label, key] of [
      ["Market report", "report"],
      ["Product spec", "prd"],
      ["Coding context", "coding"],
    ]) {
      await tab(label).click();
      await page
        .locator("#outputs")
        .screenshot({ path: `artifacts/outputs-${name}-${key}.png` });
    }
    checks.push(
      `${name} ${width}px: three output views, resolved ARIA panels, keyboard arrows/Home/End/Tab, focus visibility, no overflow, existing sign-in/signup entry`,
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
  checks.push(
    "Normal mock dashboard/welcome unchanged; output walkthrough has no API, clipboard, installation or external actions",
  );
  assert.deepEqual(outbound, []);
  assert.deepEqual(exceptions, []);
  const result = {
    passed: true,
    origin,
    checks,
    heroComparison,
    outbound,
    exceptions,
    homepageApiRequests: apiRequests,
    scope:
      "Synthetic illustrative homepage checks only. Live output generation, skill installation and round-trip context sync are not tested or claimed.",
  };
  writeFileSync(
    "artifacts/outputs-checks.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
