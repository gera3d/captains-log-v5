import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";
import {
  fixtureIdea,
  fixtureStore,
} from "./fixtures/homepage-output-example.mjs";
// Keep capture outputs in this worktree regardless of the invoking shell directory.
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
const outbound = [],
  exceptions = [];
await context.route("**/*", (r) => {
  const u = new URL(r.request().url());
  if (u.origin !== origin) {
    outbound.push(u.origin + u.pathname);
    return r.abort();
  }
  return r.continue();
});
await context.addInitScript((store) => {
  localStorage.setItem("goodidea.mock-staging.v1", JSON.stringify(store));
  localStorage.setItem("dashboardOnboardingSeen", "true");
}, fixtureStore);
const page = await context.newPage();
page.on("pageerror", (e) => exceptions.push(e.message));
mkdirSync("public/images/outputs", { recursive: true });

try {
  for (const [name, width] of [
    ["desktop", 1280],
    ["mobile", 390],
    ["small", 320],
  ]) {
    await page.setViewportSize({ width, height: 12000 });
    await page.goto(`${origin}/idea/${fixtureIdea.id}`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator('[data-staging-banner="true"]')).toBeVisible();
    await expect(
      page
        .getByRole("heading", {
          name: "A tool library for the neighborhood",
          exact: true,
        })
        .first(),
    ).toBeVisible();
    const green = page
      .getByText("The Unfair Superpower (Why It Wins)", { exact: true })
      .locator("..")
      .locator("..");
    const comparison = green.locator("..");
    await expect(comparison).toContainText("Local availability");
    await expect(comparison).toContainText("Trust and damage");
    assert.doesNotMatch(
      await comparison.innerText(),
      /video|diffusion|anime|choreography/i,
    );
    await green.screenshot({
      path: `public/images/outputs/strengths-${name}.png`,
      animations: "disabled",
    });
    await page
      .getByText("The Fatal Trap (Why 90% Will Fail)", { exact: true })
      .locator("..")
      .locator("..")
      .screenshot({
        path: `public/images/outputs/risks-${name}.png`,
        animations: "disabled",
      });
    await comparison.screenshot({
      path: `artifacts/outputs-source-report-${name}.png`,
      animations: "disabled",
    });
    const chart = page
      .getByText("Viability Radar (0–10)", { exact: true })
      .locator("..")
      .locator("..")
      .locator("..")
      .locator("..");
    await expect(chart).toContainText("6/10");
    await chart.screenshot({
      path: `public/images/outputs/scorecard-${name}.png`,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Product Spec (PRD)", exact: true })
      .click();
    const spec = page
      .locator("main .prose")
      .filter({ hasText: "Illustrative product spec" });
    await expect(spec).toContainText("An agreed return date");
    await spec.screenshot({
      path:
        name === "desktop"
          ? "public/images/outputs/prd-desktop.png"
          : `artifacts/outputs-source-prd-${name}.png`,
      animations: "disabled",
    });
    if (name !== "desktop") {
      await page.evaluate(() => scrollTo(0, 0));
      const panelBox = await spec.boundingBox();
      const scopeBox = await spec
        .getByRole("heading", { name: "Scope", exact: true })
        .boundingBox();
      const lastBox = await spec.locator(":scope > p").last().boundingBox();
      assert.ok(panelBox && scopeBox && lastBox);
      await page.screenshot({
        path: `public/images/outputs/prd-${name}-excerpt.png`,
        clip: {
          x: panelBox.x,
          y: scopeBox.y - 20,
          width: panelBox.width,
          height: lastBox.y + lastBox.height - scopeBox.y + 42,
        },
      });
    }
    await page.getByRole("button", { name: "Launch Kit", exact: true }).click();
    const blueprint = page
      .getByRole("heading", {
        name: "High-Converting Landing Page Blueprint",
        exact: true,
      })
      .locator("..")
      .locator("..")
      .locator("..");
    await expect(blueprint).toContainText("Borrow a tool from a neighbor.");
    assert.doesNotMatch(
      await blueprint.innerText(),
      /fixture placeholder|Bearer|https?:|api\//i,
    );
    await blueprint.screenshot({
      path: `public/images/outputs/blueprint-${name}.png`,
      animations: "disabled",
    });
    const config = page
      .getByRole("heading", {
        name: "Customize Architecture & Tooling",
        exact: true,
      })
      .locator("..")
      .locator("..")
      .locator("..")
      .locator("..");
    await page.locator("#cfg-agent").selectOption("claude");
    const levers = config.locator(":scope > div").nth(1);
    await expect(levers).toContainText("Target AI Tool");
    assert.doesNotMatch(
      await levers.innerText(),
      /fixture placeholder|Bearer|https?:|api\//i,
    );
    await levers.screenshot({
      path: `artifacts/outputs-source-config-${name}.png`,
      animations: "disabled",
    });
    const hero = page
      .getByRole("heading", {
        name: "Launch Your Long-Running V1 Build",
        exact: true,
      })
      .locator("..")
      .locator("..");
    assert.doesNotMatch(
      await hero.innerText(),
      /fixture placeholder|Bearer|https?:/i,
    );
    await hero.screenshot({
      path: `artifacts/outputs-source-handoff-${name}.png`,
      animations: "disabled",
    });
  }
  assert.deepEqual(outbound, []);
  assert.deepEqual(exceptions, []);
  writeFileSync(
    "artifacts/outputs-visual-provenance.json",
    JSON.stringify(
      {
        passed: true,
        origin,
        fixture: "scripts/fixtures/homepage-output-example.mjs",
        recordId: fixtureIdea.id,
        source:
          "Unmodified existing FullIdeaPage / VentureBentoCockpit / BuilderPromptKit and PRD renderer. Disposable local mock store, read-only UI actions; no generation or installation.",
        crops:
          "Actual risk comparison/scorecard, complete desktop PRD, complete mobile/320 Scope + first-version-check excerpts, and entire actual copyable page-spec panel. Unrelated hardcoded cards, native settings, clipped banner, raw prompts and terminal content are excluded from public assets.",
        outbound,
        exceptions,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
