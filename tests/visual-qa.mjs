import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const evidence = resolve(root, "outputs/bright-20261115/visual");
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer((request, response) => {
  const requested = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const path = resolve(root, "." + (requested === "/" ? "/index.html" : requested));
  if (!path.startsWith(root + sep)) return response.writeHead(403).end();
  try { response.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream" }).end(readFileSync(path)); }
  catch { response.writeHead(404).end("Not found"); }
});
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ headless: true });
const report = { capturedAt: new Date().toISOString(), results: [], reducedMotion: null };

const viewports = [
  { name: "mobile-320", width: 320, height: 740 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const pageErrors = [];
    const failedRequests = [];
    const outsideRequests = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("requestfailed", request => failedRequests.push(request.url() + " " + request.failure()?.errorText));
    page.on("request", request => { if (!request.url().startsWith(origin + "/")) outsideRequests.push(request.url()); });
    await page.goto(origin + "/", { waitUntil: "networkidle" });
    const folder = resolve(evidence, viewport.name);
    mkdirSync(folder, { recursive: true });

    const layout = await page.evaluate(() => {
      const css = selector => getComputedStyle(document.querySelector(selector));
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      return {
        headerPosition: css(".header").position,
        heroBg: css(".hero").backgroundImage,
        phoneWidth: Math.round(rect(".hero-phone").width),
        phoneHeight: Math.round(rect(".hero-phone").height),
        heroTitleFont: parseFloat(css(".hero h1").fontSize),
        ctaHeight: Math.round(rect(".hero-buttons .button-blue").height),
        loadedCss: [...document.styleSheets].some(sheet => sheet.href?.includes("styles.css") && (() => { try { return sheet.cssRules.length > 100; } catch { return false; } })()),
        firstPhoneVisible: rect(".hero-phone").width > 205 && rect(".hero-phone").height > 440,
        heroVisible: rect(".hero h1").width > 50 && css(".hero h1").visibility === "visible",
      };
    });
    assert.equal(layout.headerPosition, "sticky");
    assert.ok(layout.loadedCss, viewport.name + ": CSS not loaded");
    assert.ok(layout.heroTitleFont >= 40, viewport.name + ": headline too small");
    assert.ok(layout.ctaHeight >= 44, viewport.name + ": CTA touch target too small");
    assert.ok(layout.firstPhoneVisible, viewport.name + ": main product object missing");
    assert.ok(layout.heroVisible, viewport.name + ": title hidden");
    assert.equal(await page.locator(".hero-buttons .button-blue").getAttribute("href"), "https://t.me/ByMeVPN_bot?start=src_website");
    const brokenImages = await page.locator("img").evaluateAll(images => images.filter(img => !img.complete || img.naturalWidth <= 0).map(img => img.getAttribute("src")));
    assert.deepEqual(brokenImages, [], viewport.name + ": broken images");
    await page.screenshot({ path: resolve(folder, "hero.png") });

    const sections = [
      ["numbers", ".numbers"], ["benefits", "#benefits"], ["app", "#app"],
      ["steps", "#steps"], ["pricing", "#prices"], ["friends", "#friends"],
      ["platforms", "#platforms"], ["faq", "#faq"], ["final", ".final-cta"]
    ];
    for (const [name, selector] of sections) {
      const element = page.locator(selector);
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(130);
      assert.ok(await element.isVisible(), viewport.name + ": " + name + " hidden");
      const dims = await element.evaluate(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }));
      assert.ok(dims.width > 200 && dims.height > 90, viewport.name + ": " + name + " collapsed");
      await page.screenshot({ path: resolve(folder, name + ".png") });
    }

    // Tariff selector updates BOTH the advertised monthly rate and charged term.
    const card = page.locator('.plan[data-months="3"]');
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "79");
    assert.match(await card.locator(".plan-total strong").innerText(), /316/);
    await page.locator('[data-tier="10"]').click();
    assert.equal(await page.locator('[data-tier="10"]').getAttribute("aria-pressed"), "true");
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "119");
    assert.match(await card.locator(".plan-total strong").innerText(), /476/);
    await page.locator('[data-tier="5"]').click();
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "99");
    assert.match(await card.locator(".plan-total strong").innerText(), /396/);
    await page.locator('[data-tier="2"]').click();
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "79");

    // Demonstration state machine: no VPN network request.
    await page.locator('[data-demo-state="connecting"]').click();
    assert.equal(await page.locator("#demo-status-text").innerText(), "Подключение…");
    await page.locator('[data-demo-state="on"]').click();
    assert.equal(await page.locator("#demo-status-text").innerText(), "VPN запущен");
    assert.equal(await page.locator("#demo-switch").getAttribute("aria-pressed"), "true");
    await page.screenshot({ path: resolve(folder, "demo-on.png") });
    await page.locator("#demo-switch").click();
    assert.equal(await page.locator("#demo-status-text").innerText(), "VPN выключен");
    await page.locator("#demo-switch").click();
    await page.waitForFunction(() => document.querySelector("#demo-stage")?.dataset.state === "on", null, { timeout: 2200 });
    await page.locator("#demo-switch").click();

    const faq = page.locator(".faq-list details").first();
    await faq.locator("summary").click();
    assert.ok(await faq.evaluate(node => node.open), viewport.name + ": FAQ open");
    await faq.locator("summary").click();
    assert.ok(!(await faq.evaluate(node => node.open)), viewport.name + ": FAQ close");

    if (viewport.width <= 760) {
      const navButton = page.locator(".menu-toggle");
      await navButton.click();
      assert.equal(await navButton.getAttribute("aria-expanded"), "true");
      assert.ok(await page.locator("#mobile-nav").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await navButton.getAttribute("aria-expanded"), "false");
      assert.ok(await page.locator("#mobile-nav").isHidden());
    }
    const metrics = await page.evaluate(() => ({
      viewport: innerWidth, htmlWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
      hiddenSections: [...document.querySelectorAll("main section")].filter(section => {
        const style = getComputedStyle(section);
        return style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0;
      }).length,
    }));
    assert.ok(metrics.htmlWidth <= metrics.viewport + 1, viewport.name + " html overflow " + JSON.stringify(metrics));
    assert.ok(metrics.bodyWidth <= metrics.viewport + 1, viewport.name + " body overflow " + JSON.stringify(metrics));
    assert.equal(metrics.hiddenSections, 0, viewport.name + ": hidden sections");
    assert.deepEqual(pageErrors, [], viewport.name + " JavaScript errors");
    assert.deepEqual(failedRequests, [], viewport.name + " failed requests");
    assert.deepEqual(outsideRequests, [], viewport.name + " external network requests");
    report.results.push({ ...viewport, layout, metrics, pageErrors, failedRequests, outsideRequests });
    console.log(viewport.name + ": styles, product visuals, sections, pricing, demo and FAQ passed.");
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(origin + "/", { waitUntil: "load" });
  await page.locator('[data-demo-state="connecting"]').click();
  const duration = await page.locator("#demo-switch").evaluate(element => getComputedStyle(element).animationDuration);
  assert.ok(parseFloat(duration) <= 0.01, "Reduced motion animation still playing: " + duration);
  report.reducedMotion = duration;
  await context.close();
  mkdirSync(evidence, { recursive: true });
  writeFileSync(resolve(evidence, "qa-report.json"), JSON.stringify(report, null, 2));
  console.log("Passed: five Chromium viewports, pricing, demo, navigation, FAQ and reduced motion.");
} finally {
  await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
