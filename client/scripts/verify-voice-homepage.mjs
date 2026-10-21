import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium, expect } from "@playwright/test";
process.chdir(new URL("..", import.meta.url).pathname);
const origin = "http://127.0.0.1:5192",
  browser = await chromium.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  }),
  context = await browser.newContext({ serviceWorkers: "block" }),
  outbound = [],
  exceptions = [],
  writes = [],
  checks = [];
await context.route("**/*", (r) => {
  const u = new URL(r.request().url());
  if (u.origin !== origin) {
    outbound.push(u.origin + u.pathname);
    return r.abort();
  }
  if (!["GET", "HEAD"].includes(r.request().method())) {
    writes.push(u.pathname);
    return r.abort();
  }
  return r.continue();
});
await context.addInitScript(() => {
  window.__micCalls = 0;
  navigator.mediaDevices.getUserMedia = () => {
    window.__micCalls++;
    throw new Error("No microphone use allowed");
  };
});
try {
  for (const [name, width] of [
    ["desktop", 1440],
    ["mobile", 390],
    ["small", 320],
  ]) {
    const page = await context.newPage();
    page.on("pageerror", (e) => exceptions.push(e.message));
    await page.setViewportSize({ width, height: 2200 });
    await page.goto(`${origin}/?preview=homepage`, {
      waitUntil: "networkidle",
    });
    const image = page.locator("#workspace img");
    await expect(image).toHaveAttribute(
      "alt",
      /Voice Memo selected.*microphone idle/,
    );
    await expect(
      page.getByText("Voice Memo example", { exact: true }),
    ).toBeVisible();
    const dimensions = await image.evaluate((el) => ({
      width: el.width,
      height: el.height,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      src: new URL(el.currentSrc).pathname,
    }));
    assert.ok(dimensions.naturalWidth / dimensions.width >= 2);
    assert.ok(
      Math.abs(
        dimensions.width / dimensions.height -
          dimensions.naturalWidth / dimensions.naturalHeight,
      ) < 0.01,
    );
    const response = await page.request.get(origin + dimensions.src),
      hash = (data) => createHash("sha256").update(data).digest("hex");
    assert.equal(
      hash(await response.body()),
      hash(readFileSync("public" + dimensions.src)),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.equal(await page.locator("[data-output]").count(), 3);
    assert.equal(await page.evaluate(() => window.__micCalls), 0);
    await page
      .locator("#workspace")
      .screenshot({
        path: `artifacts/homepage-voice-${name}-capture.png`,
        animations: "disabled",
      });
    await page.screenshot({
      path: `artifacts/homepage-voice-${name}-full.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.close();
    checks.push({
      width,
      dimensions,
      servedHashMatchesSource: true,
      naturalRatio: true,
      microphoneCalls: 0,
    });
  }
  const page = await context.newPage();
  page.on("pageerror", (e) => exceptions.push(e.message));
  await page.goto(origin, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Dismiss onboarding", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Voice Memo", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Press to Record", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Text Monologue", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Your idea", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voice Memo", exact: true }).click();
  assert.equal(await page.evaluate(() => window.__micCalls), 0);
  assert.deepEqual(outbound, []);
  assert.deepEqual(exceptions, []);
  assert.deepEqual(writes, []);
  const result = {
    passed: true,
    checks,
    outbound,
    exceptions,
    writes,
    defaultVoiceAndSecondaryText: true,
    microphoneCalls: 0,
    limits:
      "Synthetic staging only; no recording, generation, live service or production change.",
  };
  writeFileSync(
    "artifacts/homepage-voice-checks.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
