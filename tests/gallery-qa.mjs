import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const out = resolve(root, "outputs/gallery-qa");
mkdirSync(out, { recursive: true });
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = resolve(root, "." + path);
  if (!file.startsWith(root + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const body = readFileSync(file);
    res.writeHead(200, { "content-type": contentTypes[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ headless: true });
try {
  for (const vp of [{ width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    const response = await page.goto(base + "/screens.html", { waitUntil: "load" });
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => document.querySelectorAll(".tile").length === 16);
    assert.equal(await page.locator(".tile").count(), 16);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert.equal(overflow, false, "gallery horizontal overflow at width " + vp.width);
    const imgs = await page.locator(".mock-phone img").evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth > 0));
    assert.equal(imgs, true, "broken shield image");
    await page.locator('[data-filter="connection"]').click();
    assert.equal(await page.locator(".tile:visible").count(), 6);
    await page.locator('[data-filter="account"]').click();
    assert.equal(await page.locator(".tile:visible").count(), 10);
    await page.locator('[data-filter="all"]').click();
    assert.equal(await page.locator(".tile:visible").count(), 16);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: resolve(out, "gallery-" + vp.width + ".png") });
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log("Gallery browser QA: 16 screens, responsive layout, filter controls, assets and no page errors OK");
