const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const root = 'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 fs.mkdirSync('test-screenshots',{recursive:true});
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(root+'/',{waitUntil:'networkidle'});
 assert.match(await page.title(),/777xsz/);
 assert.equal(await page.locator('.journey-item').count(),7);
 assert.equal(await page.locator('.visual').count(),6);
 assert.equal(await page.locator('.benefit').count(),6);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow: '+name);
 await page.locator('.journey-item button').nth(6).click();
 assert.equal(await page.locator('#stage-number').textContent(),'07 / 07');
 assert.equal(await page.locator('.stage-graphic .done').count(),7);
 await page.locator('.journey-item button').nth(1).click();
 assert.equal(await page.locator('#stage-number').textContent(),'02 / 07');
 assert.match((await page.locator('#saving').textContent()).replace(/\s/g,''),/120000/);
 await page.locator('#monthly').fill('150000');
 assert.equal(await page.locator('#payback').textContent(),'Нет');
 await page.locator('#monthly').fill('0');
 await page.locator('#task').fill(' ');
 await page.locator('#brief button[type=submit]').click();
 assert.match(await page.locator('#notice').textContent(),/Введите/);
 await page.locator('#task').fill('');
 await page.locator('#notice').evaluate(el=>el.textContent='');
 await page.locator('#home').scrollIntoViewIfNeeded();
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:'test-screenshots/'+name+'.png',fullPage:true,animations:'disabled'});
 const links=await page.locator('a[href^="/services/"]').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
 assert.equal(new Set(links).size,6);
 for(const link of links){const resp=await page.request.get(root+link);assert.equal(resp.status(),200,link);assert.match(await resp.text(),/name="author" content="777xsz"/);}
 await page.route('https://wa.me/**',r=>r.fulfill({status:200,contentType:'text/plain',body:'Intercepted for testing only'}));
 await page.locator('#task').fill('Тестовая заявка: сайт');
 await Promise.all([page.waitForURL(/wa\.me\/77760001966/),page.locator('#brief button[type=submit]').click()]);
 assert.match(new URL(page.url()).searchParams.get('text'),/Тестовая заявка: сайт/);
 assert.deepEqual(errors,[]);
 await page.close();console.log(name+': PASS');
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
