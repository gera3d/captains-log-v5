// Focused local mock check: names, assets, placement, responsive layout and isolation.
import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
  const url = new URL(r.request().url());
  if (url.origin !== origin) {
    outbound.push(url.origin + url.pathname);
    return r.abort();
  }
  if (/^\/(api|__mock)\//.test(url.pathname)) apiRequests.push(url.pathname);
  return r.continue();
});
try {
  const provenance = JSON.parse(readFileSync("brand-assets.json"));
  for (const asset of provenance.assets)
    assert.equal(
      createHash("sha256").update(readFileSync(asset.file)).digest("hex"),
      asset.sha256,
    );
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
    ["small", 320, 720],
  ]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    assert.equal(await page.evaluate(() => innerWidth), width);
    page.on("pageerror", (e) => exceptions.push(e.message));
    const response = await page.goto(`${origin}/?preview=homepage`, {
      waitUntil: "networkidle",
    });
    assert.match(
      response.headers()["content-security-policy"],
      /connect-src\s+'self'/,
    );
    const row = page.getByRole("region", {
      name: "Use Good Idea alongside your coding tools.",
    });
    await expect(row).toBeVisible();
    await expect(row.locator("li")).toHaveCount(5);
    for (const label of [
      "Google Antigravity",
      "Cursor",
      "Codex",
      "Claude Code",
      "Google AI Studio",
    ])
      await expect(row.getByText(label, { exact: true })).toBeVisible();
    for (const image of await row.locator("img").all()) {
      assert.equal(
        await image.evaluate((el) => el.complete && el.naturalWidth > 0),
        true,
      );
      assert.equal(
        await image.evaluate((el) => new URL(el.currentSrc).origin),
        origin,
      );
      assert.equal(
        await image.evaluate((el) => getComputedStyle(el).objectFit),
        "contain",
      );
      await expect(image).toHaveAttribute("alt", "");
    }
    await expect(row.getByText("Export prompts", { exact: true })).toBeVisible();
    await expect(
      row.getByText("Bring your build brief", { exact: true }),
    ).toBeVisible();
    assert.equal(await row.locator("a,button,input,select").count(), 0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.ok(
      await row.evaluate(
        (el) =>
          el.getBoundingClientRect().bottom <=
          document.querySelector("#workspace").getBoundingClientRect().top,
      ),
    );
    assert.equal(await page.locator("[data-output]").count(), 3);
    await page.screenshot({
      path: `artifacts/harness-brands-${name}-top.png`,
      animations: "disabled",
    });
    await row.screenshot({
      path: `artifacts/harness-brands-${name}-row.png`,
      animations: "disabled",
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    await page
      .locator("header")
      .getByRole("button", { name: "Create an account", exact: true })
      .click();
    await expect(
      page.getByPlaceholder("e.g. alex or gera", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.close();
    checks.push(
      `${width}px: five readable names/local loaded logos, original aspect via contain, before dashboard, concise human outcome/export labels, no new controls/overflow, keyboard skip and existing signup entry`,
    );
  }
  assert.deepEqual(apiRequests, []);
  const page = await context.newPage();
  await page.goto(origin, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Dismiss onboarding", exact: true }),
  ).toBeVisible();
  await page.close();
  assert.deepEqual(outbound, []);
  assert.deepEqual(exceptions, []);
  const result = {
    passed: true,
    checks,
    outbound,
    exceptions,
    homepageApiRequests: apiRequests,
    assetHashes: "Matched recorded official downloads",
    limits:
      "Source-listed setup/manual transfer options only. No live connector, install or end-to-end tool integration exercised.",
  };
  writeFileSync(
    "artifacts/harness-brands-checks.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
