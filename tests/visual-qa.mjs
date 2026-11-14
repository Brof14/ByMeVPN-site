import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const evidenceDir = resolve(root, "outputs/final-site-20261114");
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer((request, response) => {
  const raw = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const path = resolve(root, "." + (raw === "/" ? "/index.html" : raw));
  if (!path.startsWith(root + sep)) return response.writeHead(403).end();
  try { response.writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream" }).end(readFileSync(path)); }
  catch { response.writeHead(404).end("Not found"); }
});
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ headless: true });
const report = { date: new Date().toISOString(), viewports: [], reducedMotion: null };
const sizes = [
  { name: "mobile-320", width: 320, height: 740 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

try {
  for (const v of sizes) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    const errors = [];
    const external = [];
    page.on("pageerror", err => errors.push(err.message));
    page.on("request", request => {
      if (!request.url().startsWith(origin + "/")) external.push(request.url());
    });
    await page.goto(origin + "/", { waitUntil: "networkidle" });
    const out = resolve(evidenceDir, v.name);
    mkdirSync(out, { recursive: true });

    const headline = page.locator(".hero h1");
    assert.ok(await headline.isVisible(), v.name + ": missing hero");
    const nav = await page.evaluate(() => ({
      header: getComputedStyle(document.querySelector(".site-header")).position,
      stylesheetLoaded: [...document.styleSheets].some(s => s.href?.includes("styles.css") && (() => { try { return s.cssRules.length > 50; } catch { return false; } })()),
      heroFontSize: parseFloat(getComputedStyle(document.querySelector(".hero h1")).fontSize),
      ctaHeight: document.querySelector(".hero-actions .btn-primary").getBoundingClientRect().height,
      heroDeviceWidth: document.querySelector(".hero-device").getBoundingClientRect().width,
      top: document.querySelector(".hero").getBoundingClientRect().top,
    }));
    assert.equal(nav.header, "sticky");
    assert.ok(nav.stylesheetLoaded, v.name + ": CSS did not load");
    assert.ok(nav.ctaHeight >= 44, v.name + ": CTA below mobile target size");
    assert.ok(nav.heroFontSize >= 39, v.name + ": heading not prominent");
    assert.ok(nav.heroDeviceWidth >= 200, v.name + ": hero product missing");
    assert.equal(await page.locator(".hero-actions .btn-primary").getAttribute("href"), "https://t.me/ByMeVPN_bot?start=src_website");
    await page.screenshot({ path: resolve(out, "hero.png") });

    const sections = ["#features", "#experience", "#pricing", "#how", "#download", "#faq", ".closing"];
    for (const selector of sections) {
      const node = page.locator(selector);
      await node.scrollIntoViewIfNeeded();
      await page.waitForTimeout(75);
      assert.ok(await node.isVisible(), v.name + " invisible " + selector);
      assert.ok(await node.evaluate(el => el.getBoundingClientRect().height > 100), v.name + " collapsed " + selector);
      await page.screenshot({ path: resolve(out, selector.replace(/[.#]/g, "") + ".png") });
    }

    // Real pricing selector: both monthly equivalent and upfront total update.
    const first = page.locator('.plan[data-months="3"]');
    assert.equal((await first.locator(".plan-price").innerText()).trim(), "79");
    assert.match(await first.locator(".plan-total strong").innerText(), /316/);
    await page.locator('[data-tier="10"]').click();
    assert.equal(await page.locator('[data-tier="10"]').getAttribute("aria-pressed"), "true");
    assert.equal((await first.locator(".plan-price").innerText()).trim(), "119");
    assert.match(await first.locator(".plan-total strong").innerText(), /476/);
    await page.locator('[data-tier="5"]').click();
    assert.equal((await first.locator(".plan-price").innerText()).trim(), "99");
    assert.match(await first.locator(".plan-total strong").innerText(), /396/);
    await page.locator('[data-tier="2"]').click();

    // Demo must be visibly interactive but completely isolated from VPN/network.
    await page.locator('[data-demo-state="connecting"]').click();
    assert.equal(await page.locator("#demo-status-text").innerText(), "Подключение…");
    await page.locator('[data-demo-state="on"]').click();
    assert.equal(await page.locator("#demo-status-text").innerText(), "VPN запущен");
    assert.equal(await page.locator("#demo-switch").getAttribute("aria-pressed"), "true");
    await page.screenshot({ path: resolve(out, "demo-connected.png") });
    await page.locator("#demo-switch").click();
    assert.equal(await page.locator("#demo-status-text").innerText(), "VPN выключен");

    const faq = page.locator(".faq-items details").first();
    await faq.locator("summary").click();
    assert.ok(await faq.evaluate(node => node.open), v.name + ": FAQ failed to open");
    await faq.locator("summary").click();
    assert.ok(!(await faq.evaluate(node => node.open)), v.name + ": FAQ failed to close");

    if (v.width <= 700) {
      const toggle = page.locator(".menu-toggle");
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      assert.ok(await page.locator("#mobile-nav").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.ok(await page.locator("#mobile-nav").isHidden());
    }
    const metrics = await page.evaluate(() => ({
      width: innerWidth,
      htmlScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      hiddenSections: [...document.querySelectorAll("main section")].filter(el => {
        const s = getComputedStyle(el); return s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0;
      }).length,
      menuVisible: getComputedStyle(document.querySelector(".menu-toggle")).display !== "none",
    }));
    assert.ok(metrics.htmlScrollWidth <= metrics.width + 1, v.name + " horizontal overflow: " + JSON.stringify(metrics));
    assert.ok(metrics.bodyScrollWidth <= metrics.width + 1, v.name + " body overflow: " + JSON.stringify(metrics));
    assert.equal(metrics.hiddenSections, 0, v.name + ": hidden content");
    assert.deepEqual(errors, [], v.name + ": JavaScript errors");
    assert.deepEqual(external, [], v.name + ": unexpected third-party requests");
    report.viewports.push({ ...v, nav, metrics, errors, externalRequests: external });
    await ctx.close();
    console.log(v.name + ": responsive layout, CTA, pricing, demo, FAQ and navigation passed");
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(origin + "/", { waitUntil: "load" });
  const motion = await page.locator(".demo-power").evaluate(node => getComputedStyle(node).animationDuration);
  assert.ok(parseFloat(motion) <= .01 || motion === "0s", "reduced motion ineffective: " + motion);
  report.reducedMotion = motion;
  await ctx.close();
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(resolve(evidenceDir, "qa-report.json"), JSON.stringify(report, null, 2));
  console.log("Browser QA passed all 5 viewports and reduced motion");
} finally {
  await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
