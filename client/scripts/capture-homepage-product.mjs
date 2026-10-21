// Actual idle Voice Memo UI. Disposable synthetic context; no microphone, recording or generation.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
import { fixtureStore } from "./fixtures/homepage-output-example.mjs";
process.chdir(new URL("..", import.meta.url).pathname);
const origin = "http://127.0.0.1:5192";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({
  serviceWorkers: "block",
  deviceScaleFactor: 2,
});
const externalAttempts = [],
  exceptions = [],
  apiWrites = [];
await context.route("**/*", (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== origin) {
    externalAttempts.push(url.origin + url.pathname);
    return route.abort();
  }
  if (!["GET", "HEAD"].includes(route.request().method())) {
    apiWrites.push(url.pathname);
    return route.abort();
  }
  return route.continue();
});
await context.addInitScript((store) => {
  localStorage.setItem("goodidea.mock-staging.v1", JSON.stringify(store));
  localStorage.setItem("dashboardOnboardingSeen", "true");
  localStorage.setItem("voiceRecorderTooltipShown", "true");
  window.__homepageMicrophoneAttempts = 0;
  navigator.mediaDevices.getUserMedia = () => {
    window.__homepageMicrophoneAttempts++;
    throw new Error("Microphone disabled in screenshot fixture");
  };
}, fixtureStore);
const page = await context.newPage();
page.on("pageerror", (e) => exceptions.push(e.message));
mkdirSync("public/images", { recursive: true });
mkdirSync("artifacts", { recursive: true });
try {
  const captures = [];
  for (const [name, width, height] of [
    ["desktop", 1280, 1800],
    ["mobile", 390, 1800],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin, { waitUntil: "networkidle" });
    await expect(page.locator('[data-staging-banner="true"]')).toBeVisible();
    const voice = page.getByRole("button", { name: "Voice Memo", exact: true });
    await expect(voice).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Text Monologue", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByText("Press to Record", { exact: true }),
    ).toBeVisible();
    assert.equal(
      await page.evaluate(() => window.__homepageMicrophoneAttempts),
      0,
    );
    const group = page.locator("main > div > div").first();
    const target =
      name === "desktop" ? group : group.locator(":scope > div").first();
    const box = await target.boundingBox();
    let captureHeight = box.height;
    if (name === "mobile") {
      // Complete idle-control excerpt; exclude the native fixed-height card's cramped footer.
      await page.evaluate(() => scrollTo(0, 0));
      const idleBox = await page
        .getByText("Press to Record", { exact: true })
        .boundingBox();
      captureHeight = idleBox.y + idleBox.height + 28 - box.y;
      await page.screenshot({
        path: `public/images/homepage-workspace-${name}.png`,
        clip: { x: box.x, y: box.y, width: box.width, height: captureHeight },
        animations: "disabled",
      });
    } else {
      await target.screenshot({
        path: `public/images/homepage-workspace-${name}.png`,
        animations: "disabled",
      });
    }
    await page.screenshot({
      path: `artifacts/homepage-voice-source-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
    captures.push({
      name,
      cssWidth: box.width,
      cssHeight: captureHeight,
      scale: 2,
      selected: "voice",
      state: "idle",
    });
  }
  assert.deepEqual(externalAttempts, []);
  assert.deepEqual(exceptions, []);
  assert.deepEqual(apiWrites, []);
  writeFileSync(
    "artifacts/homepage-voice-provenance.json",
    JSON.stringify(
      {
        passed: true,
        origin,
        captures,
        description:
          "Actual dashboard Voice Memo idle UI; existing synthetic tool-library idea. Text remains secondary. No fake recorded state, mic call, generation or API write.",
        externalAttempts,
        exceptions,
        apiWrites,
        microphoneAttempts: 0,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
