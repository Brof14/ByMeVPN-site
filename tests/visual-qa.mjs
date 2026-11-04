import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const evidenceRoot = resolve(root, "outputs/bymevpn-recovery/visual");
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
];
const sections = [
  ["hero", "section.hero"],
  ["product", "#product"],
  ["features", "#benefits"],
  ["android", "#android"],
  ["next-steps", "#how"],
  ["terms", "#plans"],
  ["faq", "#faq"],
  ["footer", "footer"],
];
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const report = { testedAt: new Date().toISOString(), viewports: [], fallbackChecks: [] };

const server = createServer((request, response) => {
  const requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const target = resolve(root, `.${requested === "/" ? "/index.html" : requested}`);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = readFileSync(target);
    response.writeHead(200, { "content-type": mimeTypes[extname(target)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const baseUrl = `http://127.0.0.1:${server.address().port}/`;
const chromePath = process.env.BYMEVPN_CHROME_PATH
  ?? (existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);
const browser = await chromium.launch({ headless: true, ...(chromePath ? { executablePath: chromePath } : {}) });

async function assertRevealVisible(page, element, index, direction) {
  await element.evaluate((node) => node.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForFunction((itemIndex) => {
    const node = document.querySelectorAll("[data-reveal]")[itemIndex];
    return node && Number.parseFloat(getComputedStyle(node).opacity) >= 0.99;
  }, index, { timeout: 4000 });
  const measurement = await element.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      opacity: Number.parseFloat(getComputedStyle(node).opacity),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      inViewport: rect.bottom > 0 && rect.top < innerHeight,
    };
  });
  assert.ok(measurement.opacity >= 0.99, `${direction} reveal ${index}: opacity ${measurement.opacity}`);
  assert.ok(measurement.width > 0 && measurement.height > 0, `${direction} reveal ${index} has no size`);
  assert.ok(measurement.inViewport, `${direction} reveal ${index} is outside the viewport`);
  return measurement;
}

try {
  for (const viewport of viewports) {
    const viewportDir = resolve(evidenceRoot, viewport.name);
    const videoTemp = resolve(viewportDir, "video-temp");
    mkdirSync(videoTemp, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
      recordVideo: { dir: videoTemp, size: { width: viewport.width, height: viewport.height } },
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    // Conversion + root CSS smoke checks: interactive, visible actions before scrolling.
    const primaryAction = page.locator(".hero .button-primary");
    assert.equal(await primaryAction.getAttribute("href"), "https://t.me/ByMeVPNbot");
    assert.ok(await primaryAction.isVisible(), `${viewport.name}: hero CTA is not visible`);
    const heroActionRect = await primaryAction.boundingBox();
    assert.ok(heroActionRect && heroActionRect.y < viewport.height,
      `${viewport.name}: first action requires scrolling past the first viewport`);

    const rootMinWidth = await page.evaluate(() => getComputedStyle(document.documentElement).minWidth);
    assert.equal(rootMinWidth, "320px",
      `${viewport.name}: root CSS has been nested or its global html styles are missing`);

    const navAction = page.locator(".site-nav .nav-cta");
    assert.equal(await navAction.getAttribute("href"), "https://t.me/ByMeVPNbot");
    if (viewport.width <= 760) {
      const menuButton = page.locator(".menu-toggle");
      assert.equal(await menuButton.getAttribute("aria-expanded"), "false");
      await menuButton.click();
      assert.equal(await menuButton.getAttribute("aria-expanded"), "true");
      await navAction.waitFor({ state: "visible", timeoutMs: 3000 });
      assert.ok(await navAction.isVisible(), `${viewport.name}: opened menu hides the CTA`);
      await menuButton.press("Escape");
      assert.equal(await menuButton.getAttribute("aria-expanded"), "false");
    } else {
      assert.ok(await navAction.isVisible(), `${viewport.name}: header CTA is missing`);
    }

    const revealElements = page.locator("[data-reveal]");
    const revealCount = await revealElements.count();
    assert.equal(revealCount, 14, `${viewport.name}: expected fourteen reveal elements`);
    const downMeasurements = [];
    for (let index = 0; index < revealCount; index += 1) {
      downMeasurements.push(await assertRevealVisible(page, revealElements.nth(index), index, "down"));
    }

    const sceneLocators = page.locator(".story-scenes > .story-scene");
    const sceneCount = await sceneLocators.count();
    assert.equal(sceneCount, 4, `${viewport.name}: expected four scroll scenes`);
    const sceneRows = [];
    for (let index = 0; index < sceneCount; index += 1) {
      const scene = sceneLocators.nth(index);
      const sceneId = await scene.getAttribute("data-scene");
      await scene.evaluate((node) => node.scrollIntoView({ behavior: "instant", block: "center" }));
      await page.waitForFunction((id) => document.getElementById("demo-screen")?.dataset.state === id, sceneId, { timeout: 2500 });
      await page.waitForFunction((id) => document.querySelector(`[data-scene="${id}"]`)?.classList.contains("is-current"), sceneId, { timeout: 2500 });
      await page.waitForTimeout(520);
      const sceneLayout = await scene.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const screenRect = document.getElementById("demo-screen").getBoundingClientRect();
        const copy = node.querySelector(".scene-copy");
        const copyRect = copy.getBoundingClientRect();
        const row = getComputedStyle(node).gridRowStart;
        return {
          id: node.dataset.scene,
          row,
          top: Math.round(rect.top + scrollY),
          bottom: Math.round(rect.bottom + scrollY),
          width: Math.round(rect.width),
          copyOpacity: Number.parseFloat(getComputedStyle(copy).opacity),
          copyInViewport: copyRect.bottom > 0 && copyRect.top < innerHeight,
          screenVisible: screenRect.bottom > 0 && screenRect.top < innerHeight,
          screenState: document.getElementById("demo-screen").dataset.state,
        };
      });
      assert.equal(sceneLayout.row, String(index + 1), `${viewport.name}: ${sceneId} occupies grid row ${sceneLayout.row}`);
      assert.ok(sceneLayout.copyOpacity >= 0.99, `${viewport.name}: active ${sceneId} copy opacity ${sceneLayout.copyOpacity}`);
      assert.ok(sceneLayout.copyInViewport, `${viewport.name}: ${sceneId} copy left the viewport`);
      assert.ok(sceneLayout.screenVisible, `${viewport.name}: phone screen left the viewport during ${sceneId}`);
      assert.equal(sceneLayout.screenState, sceneId, `${viewport.name}: screen and story diverged at ${sceneId}`);
      sceneRows.push(sceneLayout);
      await page.screenshot({ path: resolve(viewportDir, `scene-${String(index + 1).padStart(2, "0")}-${sceneId}.png`) });
    }
    for (let index = 1; index < sceneRows.length; index += 1) {
      assert.ok(sceneRows[index - 1].top < sceneRows[index].top, `${viewport.name}: scene order is not increasing`);
      assert.ok(sceneRows[index - 1].bottom <= sceneRows[index].top + 1, `${viewport.name}: scenes overlap`);
      assert.ok(sceneRows[index].top - sceneRows[index - 1].bottom <= viewport.height * 0.22, `${viewport.name}: blank gap between scenes`);
    }
    const stickyPosition = await page.locator(".story-device-stage").evaluate((node) => getComputedStyle(node).position);
    assert.equal(stickyPosition, "sticky", `${viewport.name}: phone stage is not sticky`);

    const activeManual = page.locator('[data-demo-scene="connected"]');
    await activeManual.click();
    assert.equal(await page.locator("#demo-screen").getAttribute("data-state"), "connected");
    assert.equal(await activeManual.getAttribute("aria-pressed"), "true");
    await page.locator("#demo-toggle").click();
    assert.equal(await page.locator("#demo-screen").getAttribute("data-state"), "off");
    await page.locator("#demo-toggle").click();
    assert.equal(await page.locator("#demo-screen").getAttribute("data-state"), "connecting");
    await page.waitForFunction(() => document.getElementById("demo-screen")?.dataset.state === "connected", null, { timeout: 2000 });
    await page.locator("#server-open").click();
    assert.equal(await page.locator("#demo-screen").getAttribute("data-state"), "servers");
    await page.locator("#auto-server").click();
    assert.equal(await page.locator("#selected-server").textContent(), "Автоматически");

    const sectionShots = [];
    for (const [name, selector] of sections) {
      if (name === "hero") await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      else await page.locator(selector).evaluate((node) => node.scrollIntoView({ behavior: "instant", block: "center" }));
      await page.waitForTimeout(560);
      const targetOpacity = await page.locator(selector).evaluate((node) => Number.parseFloat(getComputedStyle(node).opacity));
      assert.ok(targetOpacity >= 0.99, `${viewport.name}: ${name} section opacity is ${targetOpacity}`);
      const heading = await page.locator(selector).locator("h1, h2").first().innerText().catch(() => "");
      const content = await page.locator(selector).innerText();
      assert.ok(heading.trim().length > 0 || content.trim().length > 30, `${viewport.name}: ${name} section has no visible content`);
      const path = resolve(viewportDir, `section-${name}.png`);
      await page.screenshot({ path });
      sectionShots.push(path);
    }

    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(70);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(70);
    const upMeasurements = [];
    for (let index = revealCount - 1; index >= 0; index -= 1) {
      upMeasurements.push(await assertRevealVisible(page, revealElements.nth(index), index, "up"));
    }

    const scrollBeforeFastSkip = await page.evaluate(() => scrollY);
    await page.locator('[data-scene="servers"]').evaluate((node) => node.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(80);
    const fastSkip = await page.evaluate((startY) => {
      const scenes = [...document.querySelectorAll("[data-scene]")];
      const focusY = innerHeight / 2;
      const nearest = scenes.reduce((best, scene) => {
        const rect = scene.getBoundingClientRect();
        const distance = Math.abs((rect.top + rect.bottom) / 2 - focusY);
        return distance < best.distance ? { id: scene.dataset.scene, distance } : best;
      }, { id: "", distance: Infinity });
      return { ...nearest, distanceScrolled: Math.abs(scrollY - startY) };
    }, scrollBeforeFastSkip);
    assert.ok(fastSkip.distanceScrolled >= viewport.height, `${viewport.name}: fast skip did not move at least one viewport`);
    await page.waitForFunction((id) => document.getElementById("demo-screen")?.dataset.state === id, fastSkip.id, { timeout: 2500 }).catch(async () => {
      const state = await page.locator("#demo-screen").getAttribute("data-state");
      throw new Error(`${viewport.name}: fast skip targeted ${fastSkip.id}, but app remained ${state}`);
    });
    const reverseSceneStates = [];
    for (let index = sceneCount - 2; index >= 0; index -= 1) {
      const sceneId = await sceneLocators.nth(index).getAttribute("data-scene");
      await sceneLocators.nth(index).evaluate((node) => node.scrollIntoView({ behavior: "instant", block: "center" }));
      await page.waitForFunction((id) => document.getElementById("demo-screen")?.dataset.state === id, sceneId, { timeout: 2500 });
      reverseSceneStates.push(await page.locator("#demo-screen").getAttribute("data-state"));
    }
    assert.deepEqual(reverseSceneStates, ["connected", "connecting", "off"], `${viewport.name}: reverse scene sync`);

    await page.setViewportSize({ width: viewport.width, height: viewport.height - 100 });
    await page.waitForTimeout(80);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(80);

    const overflow = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(overflow.width <= overflow.viewport + 1, `${viewport.name}: horizontal overflow ${JSON.stringify(overflow)}`);
    assert.deepEqual(pageErrors, [], `${viewport.name}: uncaught browser errors`);

    const video = page.video();
    await context.close();
    const recordedVideo = await video.path();
    const finalVideo = resolve(viewportDir, `scroll-${viewport.name}.webm`);
    renameSync(recordedVideo, finalVideo);
    report.viewports.push({
      ...viewport,
      revealCount,
      downMeasurements,
      upMeasurements,
      sceneRows,
      sectionShots: sectionShots.map((path) => path.split(sep).slice(-1)[0]),
      video: finalVideo.split(sep).slice(-4).join("/"),
      fastSkipScene: fastSkip.id,
      overflow,
      browserErrors: pageErrors,
    });

    for (const fallback of ["javascript-disabled", "intersection-observer-unsupported", "reduced-motion"]) {
      const fallbackContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        javaScriptEnabled: fallback !== "javascript-disabled",
        reducedMotion: fallback === "reduced-motion" ? "reduce" : "no-preference",
      });
      if (fallback === "intersection-observer-unsupported") {
        await fallbackContext.addInitScript(() => Object.defineProperty(window, "IntersectionObserver", { value: undefined }));
      }
      const fallbackPage = await fallbackContext.newPage();
      await fallbackPage.goto(baseUrl, { waitUntil: "load" });
      const fallbackOpacity = await fallbackPage.locator("[data-reveal]").evaluateAll((elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).opacity)));
      assert.equal(fallbackOpacity.length, 14);
      assert.ok(fallbackOpacity.every((opacity) => opacity >= 0.99), `${viewport.name}: reveal content hidden with ${fallback}`);
      report.fallbackChecks.push({ viewport: viewport.name, mode: fallback, count: fallbackOpacity.length, minimumOpacity: Math.min(...fallbackOpacity) });
      await fallbackContext.close();
    }

    console.log(`${viewport.name}: ${revealCount} reveals visible down/up; four ordered scenes; sections captured; scroll video recorded.`);
  }
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

const reportPath = resolve(evidenceRoot, "qa-report.json");
mkdirSync(evidenceRoot, { recursive: true });
await import("node:fs/promises").then(({ writeFile }) => writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8"));
console.log(`Browser QA evidence: ${reportPath}`);
