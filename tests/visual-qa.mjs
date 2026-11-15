import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = resolve(root, "outputs/bymevpn-site-redesign/visual");
const mime = {".html":"text/html",".css":"text/css",".js":"text/javascript",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2",".svg":"image/svg+xml"};
const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  const file = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!file.startsWith(root + sep)) return response.writeHead(403).end();
  try { response.writeHead(200, {"content-type":mime[extname(file)] || "application/octet-stream"}).end(readFileSync(file)); }
  catch { response.writeHead(404).end("Not found"); }
});
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({headless:true});
const results = {testedAt:new Date().toISOString(),viewports:[],reducedMotion:false};
const viewports = [
  {name:"mobile-320",width:320,height:740},
  {name:"mobile-390",width:390,height:844},
  {name:"tablet-768",width:768,height:1024},
  {name:"desktop-1440",width:1440,height:900},
  {name:"desktop-1920",width:1920,height:1080}
];

try {
  for (const v of viewports) {
    const context = await browser.newContext({viewport:{width:v.width,height:v.height},reducedMotion:"no-preference"});
    const page = await context.newPage();
    const errors = [], outgoing = [], failed = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {if (!request.url().startsWith(origin + "/")) outgoing.push(request.url());});
    page.on("requestfailed", request => failed.push(request.url() + ": " + request.failure()?.errorText));
    await page.goto(origin + "/", {waitUntil:"networkidle"});
    const folder = resolve(output,v.name);
    mkdirSync(folder,{recursive:true});

    const hero = await page.evaluate(() => {
      const box = query => document.querySelector(query).getBoundingClientRect();
      const css = query => getComputedStyle(document.querySelector(query));
      return {
        headerPosition:css(".site-header").position,
        titleSize:parseFloat(css(".hero h1").fontSize),
        stageTop:box(".hero-product").top,
        stageHeight:box(".hero-product").height,
        imageTop:box(".product-screen img").top,
        imageWidth:box(".product-screen img").width,
        primaryHeight:box(".hero-copy .button").height,
        stylesheet:[...document.styleSheets].some(sheet => sheet.href?.includes("styles.css") && (() => {try{return sheet.cssRules.length>90;}catch{return false;}})()),
        imageReady:document.querySelector(".product-screen img").naturalWidth>0,
      };
    });
    assert.equal(hero.headerPosition,"relative",v.name+": header position");
    assert.ok(hero.stylesheet,v.name+": styles not loaded");
    assert.ok(hero.imageReady,v.name+": hero screenshot missing");
    assert.ok(hero.titleSize>=40,v.name+": title too small");
    assert.ok(hero.stageHeight>=500,v.name+": product stage too short");
    assert.ok(hero.stageTop<=(v.width<=740?475:355),v.name+": product appears too low: "+hero.stageTop);
    assert.ok(hero.imageTop>=hero.stageTop-25,v.name+": product top cut off");
    assert.ok(hero.imageWidth>=200,v.name+": product image too small");
    assert.ok(hero.primaryHeight>=44,v.name+": CTA target too small");
    assert.equal(await page.locator(".hero-copy .button").getAttribute("href"),"https://t.me/ByMeVPN_bot?start=src_website");
    await page.screenshot({path:resolve(folder,"hero.png")});

    const sections = [
      ["screens",".app-section"],["pricing","#pricing"],["how","#how"],
      ["referral",".referral-section"],["faq","#questions"],["closing",".closing"]
    ];
    for(const [name,selector] of sections){
      const element = page.locator(selector);
      await element.evaluate(node=>window.scrollTo({top:scrollY+node.getBoundingClientRect().top-70,behavior:"instant"}));
      await page.waitForTimeout(90);
      assert.ok(await element.isVisible(),v.name+": "+name+" not visible");
      assert.ok(await element.evaluate(node=>node.getBoundingClientRect().height>150),v.name+": "+name+" collapsed");
      await page.screenshot({path:resolve(folder,name+".png")});
    }

    // Gallery states show locally sourced V2 design mockups, not a live tunnel.
    for(const [name,filename] of [["servers","servers"],["account","account"],["settings","settings"],["pricing","pricing"],["off","home-off"]]){
      const button=page.locator('.display-tabs button[data-screen="'+name+'"]');
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"),"true");
      assert.equal(await page.locator("#demo-stage").getAttribute("data-screen"),name);
      assert.equal(await page.locator("#demo-screen").getAttribute("src"),"assets/app/"+filename+".png");
      assert.ok((await page.locator("#screen-title").innerText()).length>3,v.name+": missing gallery title");
      await page.locator("#demo-screen").evaluate(async image=>{
        if(!image.complete) await new Promise(resolveImage=>{
          image.addEventListener("load",resolveImage,{once:true});
          image.addEventListener("error",resolveImage,{once:true});
        });
      });
      assert.ok(await page.locator("#demo-screen").evaluate(image=>image.naturalWidth>0),v.name+": missing image "+name);
    }
    await page.locator('[data-screen="pricing"]').click();
    await page.screenshot({path:resolve(folder,"gallery-pricing.png")});
    await page.locator('[data-screen="off"]').click();

    // Full prepaid totals, including "extra" months, need accurate arithmetic.
    const card=page.locator('.plan[data-months="3"]');
    assert.equal((await card.locator(".plan-price").innerText()).trim(),"79");
    assert.match(await card.locator(".plan-total strong").innerText(),/316/);
    await page.locator('[data-tier="5"]').click();
    assert.equal((await card.locator(".plan-price").innerText()).trim(),"99");
    assert.match(await card.locator(".plan-total strong").innerText(),/396/);
    await page.locator('[data-tier="10"]').click();
    assert.equal((await card.locator(".plan-price").innerText()).trim(),"119");
    assert.match(await card.locator(".plan-total strong").innerText(),/476/);
    await page.locator('[data-tier="2"]').click();

    const faq=page.locator(".faq-list details").first();
    await faq.locator("summary").click();
    assert.ok(await faq.evaluate(node=>node.open),v.name+": FAQ failed to open");
    await faq.locator("summary").click();
    assert.ok(!(await faq.evaluate(node=>node.open)),v.name+": FAQ failed to close");
    if(v.width<=740){
      const button=page.locator(".menu-toggle");
      await button.click();
      assert.equal(await button.getAttribute("aria-expanded"),"true");
      assert.ok(await page.locator("#mobile-nav").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await button.getAttribute("aria-expanded"),"false");
      assert.ok(await page.locator("#mobile-nav").isHidden());
    }
    const geometry=await page.evaluate(()=>({
      width:innerWidth,
      htmlWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth,
      badImages:[...document.images].filter(img=>!img.complete||img.naturalWidth<=0).map(img=>img.src),
      hiddenSections:[...document.querySelectorAll("main section")].filter(node=>{const s=getComputedStyle(node);return s.display==="none"||s.visibility==="hidden"||parseFloat(s.opacity)===0;}).length
    }));
    assert.ok(geometry.htmlWidth<=v.width+1,v.name+": horizontal scroll "+JSON.stringify(geometry));
    assert.ok(geometry.bodyWidth<=v.width+1,v.name+": body overflow "+JSON.stringify(geometry));
    assert.equal(geometry.hiddenSections,0,v.name+": hidden chapters");
    assert.deepEqual(geometry.badImages,[],v.name+": broken local images");
    assert.deepEqual(errors,[],v.name+": JavaScript errors");
    assert.deepEqual(outgoing,[],v.name+": third-party network requests");
    assert.deepEqual(failed,[],v.name+": failed requests");

    if(v.name==="mobile-390"||v.name==="desktop-1440"){
      await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
      await page.screenshot({path:resolve(folder,"full-page.png"),fullPage:true});
    }
    results.viewports.push({...v,hero,geometry,errors});
    console.log(v.name+": app, sections, gallery, pricing, keyboard, FAQ and overflow verified");
    await context.close();
  }

  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
  const page=await context.newPage();
  await page.goto(origin+"/",{waitUntil:"load"});
  const reduced=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);
  assert.equal(reduced,"auto","reduced-motion scroll behavior");
  results.reducedMotion=true;
  await context.close();
  mkdirSync(output,{recursive:true});
  writeFileSync(resolve(output,"qa-report.json"),JSON.stringify(results,null,2));
  console.log("All five viewports and reduced motion passed");
} finally {
  await browser.close();
  await new Promise(resolveClose=>server.close(resolveClose));
}
