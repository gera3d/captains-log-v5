import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
const origin='http://127.0.0.1:5192';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({serviceWorkers:'block'});
const external=[],writes=[],errors=[],checks=[];
await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin){external.push(u.origin);return r.abort();}if(!['GET','HEAD'].includes(r.request().method())){writes.push(u.pathname);return r.abort();}return r.continue();});
await context.addInitScript(()=>{window.__micCalls=0;navigator.mediaDevices.getUserMedia=()=>{window.__micCalls++;throw Error('Microphone forbidden');};});
try {
for(const width of [1440,390,320]){
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height:1000});
 await page.goto(origin+'/?preview=homepage',{waitUntil:'networkidle'});
 const triggers=page.getByRole('button',{name:'Join the waiting list',exact:true});await expect(triggers).toHaveCount(3);
 for(let i=0;i<3;i++){
  const trigger=triggers.nth(i);await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  await expect(page.getByRole('button',{name:'Close waiting list'})).toBeFocused();
  for(let n=0;n<6;n++){await page.keyboard.press('Tab');assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));}
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 }
 await triggers.first().click();await page.getByLabel('Email address',{exact:true}).fill('bad');assert.equal(await page.getByLabel('Email address',{exact:true}).evaluate(el=>el.validity.valid),false);
 await page.getByLabel('Email address',{exact:true}).fill('synthetic-beta@example.invalid');await page.getByRole('dialog').getByRole('button',{name:'Join the waiting list',exact:true}).click();await expect(page.locator('.beta-preview-result')).toHaveText('Preview only. Your email wasn’t sent or saved.');
 await page.getByRole('button',{name:'Close waiting list'}).click();
 for(const label of ['Join waiting list','Join the waiting list']){
  await page.locator('header').getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('button',{name:'Sign In',exact:true}).first()).toBeVisible();await expect(page.getByRole('button',{name:'Create Account',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:label,exact:true}).last().click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close waiting list'}).click();
 }
 await triggers.first().click();await page.getByRole('link',{name:'Have an invitation?'}).click();await expect(page).toHaveURL(/friends-and-family/);
 await page.getByLabel('Invitation code').fill('synthetic-no-admission');await page.getByRole('button',{name:'Check invitation',exact:true}).click();await expect(page.locator('.beta-preview-result')).toContainText('wasn’t checked and no account was created');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'Join the waiting list.',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}).includes('synthetic-')),false);
 assert.equal(await page.evaluate(()=>window.__micCalls),0);
 await page.goto(origin+'/integrations?preview=homepage',{waitUntil:'networkidle'});await expect(page.getByRole('button',{name:'Join the waiting list',exact:true}).first()).toBeVisible();await expect(page.getByRole('button',{name:'Create an account',exact:true})).toHaveCount(0);
 checks.push({width,passed:true,checks:['three signup entrances','signin signup switches','email validity and truthful status','focus trap Escape and return','invitation draft no admission','fallback landing','no overflow or input persistence']});await page.close();
}
assert.deepEqual(external,[]);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
writeFileSync(new URL('../artifacts/beta-draft-checks.json',import.meta.url),JSON.stringify({passed:true,checks,external,writes,errors},null,2));console.log('Beta draft checks passed at 1440, 390, 320; zero external attempts, writes, microphone calls, exceptions.');
}finally{await browser.close();}
