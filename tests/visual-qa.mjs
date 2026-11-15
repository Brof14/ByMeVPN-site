import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const captures = resolve(root, "outputs/app-showcase-20261115/visual");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml" };
const server = createServer((req, res) => {
  const target = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  const file = resolve(root, "." + (target === "/" ? "/index.html" : target));
  if (!file.startsWith(root + sep)) return res.writeHead(403).end();
  try { res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(readFileSync(file)); }
  catch { res.writeHead(404).end("Not found"); }
});
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ headless: true });
const report = { testedAt: new Date().toISOString(), viewports: [], reducedMotion: null };

const dimensions = [
  ["mobile-320", 320, 740],
  ["mobile-390", 390, 844],
  ["tablet-768", 768, 1024],
  ["desktop-1440", 1440, 900],
  ["desktop-1920", 1920, 1080],
];

try {
  for (const [name, width, height] of dimensions) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const errors = [];
    const outgoing = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (!request.url().startsWith(origin + "/")) outgoing.push(request.url()); });
    await page.goto(origin, { waitUntil: "networkidle" });
    const out = resolve(captures, name);
    mkdirSync(out, { recursive: true });

    const layout = await page.evaluate(() => {
      const box = sel => document.querySelector(sel).getBoundingClientRect();
      const css = sel => getComputedStyle(document.querySelector(sel));
      return {
        header: css(".header").position,
        font: parseFloat(css(".hero h1").fontSize),
        cta: box(".hero-actions .button-black").height,
        phoneWidth: box(".hero-stage .handset-front").width,
        phoneHeight: box(".hero-stage .handset-front").height,
        cssLoaded: [...document.styleSheets].some(sheet => sheet.href?.includes("styles.css") && (() => { try { return sheet.cssRules.length > 80; } catch { return false; } })()),
        heroBackground: css(".hero").backgroundColor,
      };
    });
    assert.equal(layout.header, "sticky", name + ": header not sticky");
    assert.ok(layout.cssLoaded, name + ": stylesheet missing");
    assert.ok(layout.font >= 45, name + ": headline too small");
    assert.ok(layout.cta >= 44, name + ": CTA too small");
    assert.ok(layout.phoneWidth >= 180 && layout.phoneHeight >= 400, name + ": product mockup absent");
    assert.equal(await page.locator(".hero-actions .button-black").getAttribute("href"), "https://t.me/ByMeVPN_bot?start=src_website");
    assert.ok(layout.heroBackground.includes("105, 211, 188") || layout.heroBackground.includes("rgb(105, 211, 188)"), name + ": mint canvas missing");
    await page.screenshot({ path: resolve(out, "hero.png") });

    const sections = [
      ["showcase", "#app"], ["servers", "#servers"], ["account", "#account"],
      ["settings", "#settings"], ["pricing", "#prices"], ["how", "#how"],
      ["referral", "#friends"], ["faq", "#faq"], ["closing", ".closing-section"]
    ];
    for (const [label, selector] of sections) {
      const node = page.locator(selector);
      await node.scrollIntoViewIfNeeded();
      assert.ok(await node.isVisible(), name + " invisible " + selector);
      assert.ok(await node.evaluate(el => el.getBoundingClientRect().height > 120), name + " collapsed " + selector);
      await page.screenshot({ path: resolve(out, label + ".png") });
    }

    // Gallery uses genuine design PNGs and changes the real media, not a fake VPN status.
    for (const screen of ["on", "servers", "account", "settings", "pricing", "off"]) {
      await page.locator('.showcase-controls button[data-screen="' + screen + '"]').click();
      assert.equal(await page.locator("#demo-stage").getAttribute("data-screen"), screen);
      assert.equal(await page.locator('.showcase-controls button[data-screen="' + screen + '"]').getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator("#demo-screen").getAttribute("src"), "assets/app/" + (screen === "off" ? "home-off" : screen === "on" ? "home-on" : screen) + ".png");
      await page.locator("#demo-screen").evaluate(async img => { if (!img.complete) await new Promise(resolveImg => { img.addEventListener("load", resolveImg, { once: true }); img.addEventListener("error", resolveImg, { once: true }); }); });
      assert.ok(await page.locator("#demo-screen").evaluate(img => img.naturalWidth > 0), name + " screenshot failed " + screen);
    }
    await page.locator('.showcase-controls button[data-screen="on"]').click();
    await page.screenshot({ path: resolve(out, "showcase-on.png") });

    // The website should never misstate the cost for the complete 3+1-month term.
    const card = page.locator('.plan[data-months="3"]');
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "79");
    assert.match(await card.locator(".plan-total strong").innerText(), /316/);
    await page.locator('[data-tier="10"]').click();
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "119");
    assert.match(await card.locator(".plan-total strong").innerText(), /476/);
    await page.locator('[data-tier="5"]').click();
    assert.equal((await card.locator(".plan-price").innerText()).trim(), "99");
    assert.match(await card.locator(".plan-total strong").innerText(), /396/);
    await page.locator('[data-tier="2"]').click();

    const faq = page.locator(".faq-list details").first();
    await faq.locator("summary").click();
    assert.ok(await faq.evaluate(node => node.open), name + ": FAQ open");
    await faq.locator("summary").click();
    assert.ok(!(await faq.evaluate(node => node.open)), name + ": FAQ close");
    if (width <= 760) {
      await page.locator(".menu-toggle").click();
      assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "true");
      assert.ok(await page.locator("#mobile-nav").isVisible());
      await page.keyboard.press("Escape");
      assert.ok(await page.locator("#mobile-nav").isHidden());
    }
    const metrics = await page.evaluate(() => ({
      width: innerWidth,
      docWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      badImages: [...document.querySelectorAll("img")].filter(img => !img.complete || img.naturalWidth <= 0).map(img => img.getAttribute("src")),
      hiddenSections: [...document.querySelectorAll("main section")].filter(section => {
        const style = getComputedStyle(section); return style.visibility === "hidden" || style.display === "none" || parseFloat(style.opacity) === 0;
      }).length,
    }));
    assert.ok(metrics.docWidth <= metrics.width + 2, name + ": document overflow " + JSON.stringify(metrics));
    assert.ok(metrics.bodyWidth <= metrics.width + 2, name + ": body overflow " + JSON.stringify(metrics));
    assert.equal(metrics.hiddenSections, 0, name + ": hidden content");
    assert.deepEqual(metrics.badImages, [], name + ": broken image");
    assert.deepEqual(errors, [], name + ": JS errors");
    assert.deepEqual(outgoing, [], name + ": unexpected external requests");
    report.viewports.push({ name, width, height, layout, metrics, errors, outgoing });
    await context.close();
    console.log(name + ": visuals, actual design screens, tier calculator, FAQ, keyboard and assets passed");
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(origin);
  const duration = await page.locator(".handset").first().evaluate(node => getComputedStyle(node).transitionDuration);
  assert.ok(parseFloat(duration) <= 0.01, "Reduced motion not respected " + duration);
  report.reducedMotion = duration;
  await context.close();
  mkdirSync(captures, { recursive: true });
  writeFileSync(resolve(captures, "qa-report.json"), JSON.stringify(report, null, 2));
  console.log("Browser QA complete: 5 viewports and reduced motion.");
} finally {
  await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
