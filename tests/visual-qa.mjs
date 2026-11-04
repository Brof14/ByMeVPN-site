import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dir = resolve(root, 'outputs/immersive-showcase/visual');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server = createServer((req,res)=>{
  const raw = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const target=resolve(root, `.${raw==='/'?'/index.html':raw}`);
  if(!target.startsWith(root+sep)){res.writeHead(403).end();return;}
  try{const body=readFileSync(target);res.writeHead(200,{'content-type':mime[extname(target)]||'application/octet-stream'}).end(body)}
  catch{res.writeHead(404).end('Not found')}
});
await new Promise(resolveListen=>server.listen(0,'127.0.0.1',resolveListen));
const url=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true});
let passed=0;
try {
  for(const v of [{n:'mobile-390',w:390,h:844},{n:'tablet-768',w:768,h:1024},{n:'desktop-1440',w:1440,h:900}]){
    const context=await browser.newContext({viewport:{width:v.w,height:v.h},reducedMotion:'no-preference'});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'networkidle'});
    const out=resolve(dir,v.n);mkdirSync(out,{recursive:true});
    await page.screenshot({path:resolve(out,'hero.png')});
    assert.ok(await page.locator('.hero h1').isVisible());
    assert.equal(await page.locator('.hero-actions .button-primary').getAttribute('href'),'#download');
    assert.ok(await page.locator('.download-disabled').isDisabled());
    const positions=[];
    for(const [name,sel] of [['experience','#experience'],['features','#features'],['download','#download'],['faq','#questions']]){
      const element=page.locator(sel);await element.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
      assert.ok(await element.isVisible(),`${v.n}: ${name} invisible`);
      const opacity=await element.evaluate(node=>parseFloat(getComputedStyle(node).opacity));
      assert.ok(opacity>.95,`${v.n}: ${name} opacity ${opacity}`);
      await page.screenshot({path:resolve(out,`${name}.png`)});
      positions.push({name,y:await element.evaluate(node=>Math.round(node.getBoundingClientRect().top))});
    }
    await page.locator('#demo-switch').click();
    await page.waitForTimeout(1250);
    assert.equal(await page.locator('#demo-status-text').innerText(),'VPN запущен');
    await page.screenshot({path:resolve(out,'connected.png')});
    await page.locator('#demo-switch').click();
    assert.equal(await page.locator('#demo-status-text').innerText(),'VPN выключен');
    if(v.w<=700){await page.locator('.mobile-menu-button').click();assert.ok(await page.locator('.mobile-nav').isVisible());await page.keyboard.press('Escape');assert.ok(await page.locator('.mobile-nav').isHidden())}
    const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,hiddenContent:[...document.querySelectorAll('main [data-reveal]')].filter(n=>parseFloat(getComputedStyle(n).opacity)===0).length,sections:[...document.querySelectorAll('main section')].map(x=>({top:Math.round(x.offsetTop),height:Math.round(x.offsetHeight)}))}));
    assert.ok(metrics.documentWidth<=metrics.width+2,`${v.n}: horizontal overflow`);
    assert.equal(metrics.hiddenContent,0,`${v.n}: unrevealed content hidden`);
    assert.deepEqual(errors,[],`${v.n}: uncaught errors`);
    console.log(v.n,JSON.stringify({metrics,positions,errors}));passed++;
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto(url,{waitUntil:'load'});
  assert.ok(await page.locator('#experience').isVisible());
  const anim=await page.locator('.hero-copy').evaluate(el=>getComputedStyle(el).animationDuration);
  assert.ok(parseFloat(anim)<=0.01,`reduced-motion animation duration: ${anim}`);
  await context.close();
  console.log(`Browser QA passed: ${passed} viewports plus reduced motion`);
} finally {await browser.close();server.close();}
