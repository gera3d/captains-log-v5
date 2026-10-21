// Synthetic browser verification. No real auth, microphone, API, storage, or AI calls.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
const evidence = resolve(process.env.DASHBOARD_EVIDENCE_DIR || 'artifacts/dashboard-usability');
mkdirSync(evidence, { recursive: true });
const server = await createServer({ mode: 'staging', server: { host: '127.0.0.1', port: 0, strictPort: true } });
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
const user = 'mock-staging-user';
const ids = { own:'11111111-1111-4111-8111-111111111111', raw:'22222222-2222-4222-8222-222222222222', other:'33333333-3333-4333-8333-333333333333', archived:'44444444-4444-4444-8444-444444444444', mirrored:'55555555-5555-4555-8555-555555555555' };
const own = { id:ids.own, user_id:user, title:'A neighborhood tool library', summary:'Borrow the tools you only need once. A shared place for neighbors to lend, reserve and return equipment.', business_idea:'# A neighborhood tool library\n\n## Summary\nBorrow the tools you only need once.',created_at:'2026-10-20T12:00:00Z' };
const fixture = {voice_notes:[own, {id:ids.raw,user_id:user,title:'Make meeting follow-ups easier',transcript:'Turn messy notes into a clear list of decisions and next steps.',summary:'Turn messy notes into a clear list of decisions and next steps.',created_at:'2026-10-19T12:00:00Z'},{id:ids.other,user_id:'another-person',title:'A shared reference',summary:'Readable but not owned by this synthetic user.',transcript:'A shared reference to read without changing it.',created_at:'2026-10-18T12:00:00Z'},{id:ids.archived,user_id:user,title:'An earlier experiment',summary:'A saved idea to revisit later.',archived:true,status:'archived',created_at:'2026-10-17T12:00:00Z'},{id:ids.mirrored,user_id:user,title:'A connected idea',summary:'This note has an ambient mirror.',created_at:'2026-10-16T12:00:00Z'}],ideas:[{id:'idea_mirror',supabaseId:ids.mirrored,userId:user,title:'A connected idea',createdAt:'2026-10-16T12:00:00Z'},{id:'idea_ambient',userId:user,title:'An idea from another tool',summary:'An ambient idea remains readable.',createdAt:'2026-10-15T12:00:00Z'}]};
fixture.voice_notes.push({id:'66666666-6666-4666-8666-666666666666',user_id:null,title:'Legacy unknown owner',transcript:'A legacy reference.',created_at:'2026-10-14T12:00:00Z'});
fixture.ideas.push({id:'idea_other',userId:'another-person',title:'Other person ambient note'},{id:'idea_unknown',title:'Unknown ambient owner'});
const rejected=[],errors=[],checks=[];
async function contextFor(data=fixture, options={}) {
 const context=await browser.newContext({deviceScaleFactor:2,serviceWorkers:'block'});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin){rejected.push(url.origin+url.pathname);return route.abort();}
  if(url.pathname==='/src/stagingMock.js'){
   const response=await route.fetch();let source=await response.text();
   assert.ok(source.includes('return Promise.resolve().then(() => {'));
   source=source.replace('function query(table) {', 'window.__emitStaging = emit; function query(table) {');
   source=source.replace('const filters = [];','const filters = []; const recordedFilters = [];').replace('eq(key, value) { filters.push','eq(key, value) { recordedFilters.push([key, value]); filters.push');
   source=source.replace('return Promise.resolve().then(() => {',`return Promise.resolve().then(async () => {
     if(operation !== 'select') {
       window.__mutations.push({ operation, table, filters:recordedFilters });
       if(window.__mutationDelay) await new Promise(resolve=>setTimeout(resolve,window.__mutationDelay));
       const fault=window.__fault;
       if(fault?.operation===operation){
         if(fault.kind==='throw') throw new Error('Synthetic transport failure');
         if(fault.kind==='zero') return {data:[],error:null};
         if(fault.kind==='mismatch') return {data:[{id:'unexpected'}],error:null};
         if(fault.kind==='incomplete') return {data:{id:recordedFilters.find(([key])=>key==='id')[1]},error:null};
         return {data:null,error:{message:'Synthetic failure',code:fault.kind==='fk'?'23503':'42501'}};
       }
     } else { window.__reads.push({table,filters:recordedFilters}); if(window.__readFault) return {data:null,error:{message:'Synthetic read failure'}}; }
   `);
   if(options.incomplete) source=source.replace('total: store.ideas.length, limit, offset','total: 101, limit, offset');
   if(options.apiFailure) source=source.replace("if (url.pathname === '/api/v1/ideas' && method === 'GET') {", "if (url.pathname === '/api/v1/ideas' && method === 'GET') return json({error:'Synthetic list failure'}, 500); if(false) {");
   return route.fulfill({response,body:source});
  }
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/__mock/')){rejected.push(url.pathname);return route.abort();}
  return route.continue();
 });
 await context.routeWebSocket('**/*',socket=>socket.close());
 await context.addInitScript(({data,seen,readFault})=>{
   if(!localStorage.getItem('goodidea.mock-staging.v2'))localStorage.setItem('goodidea.mock-staging.v2',JSON.stringify(data));
   if(seen!==undefined) localStorage.setItem('dashboardOnboardingSeen',String(seen));
   window.__mutations=[];window.__reads=[];window.__micCalls=0;window.__readFault=readFault;
   Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>{window.__micCalls++;throw Error('Microphone blocked')}}});
   window.MediaRecorder=class{constructor(){throw Error('Recording blocked')}};
 },{data,seen:options.seen,readFault:options.readFault||false});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin,{waitUntil:'networkidle'});
 await expect(page.getByRole('heading',{name:'Idea library',exact:true})).toBeVisible();
 return {context,page};
}
const note=(page,title)=>page.locator('article').filter({has:page.locator('h3').filter({hasText:title})});
const writes=page=>page.evaluate(()=>window.__mutations);
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('goodidea.mock-staging.v2')));
try {
 for(const seen of [undefined,true,false]){
  for(const empty of [false,true]){
   const {context,page}=await contextFor(empty?{voice_notes:[],ideas:[]}:fixture,{seen});
   await expect(page.getByRole('dialog')).toHaveCount(0);
   await expect(page.getByRole('button',{name:'Voice Memo',exact:true})).toHaveAttribute('aria-pressed','true');
   await expect(page.getByRole('button',{name:'Text',exact:true})).toHaveAttribute('aria-pressed','false');
   if(empty){await expect(page.getByRole('heading',{name:'Your next idea starts here'})).toBeVisible();if(seen===undefined)await page.screenshot({path:resolve(evidence,'dashboard-empty.png'),fullPage:true});}
   await page.getByRole('button',{name:'Text',exact:true}).click();
   await expect(page.getByLabel('Your idea',{exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Voice Memo',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.__micCalls),0);
   assert.deepEqual(await writes(page),[]);await context.close();
  }
 }
 checks.push('fresh-origin and prior welcome flag: new/returning users land directly in voice-selected workspace; explicit Text only; zero microphone calls');
 for(const width of [1440,818,390,320]){
  const {context,page}=await contextFor();await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('a[href="#"]').count(),0);
  await expect(page.getByRole('button',{name:'Innovator',exact:false})).toBeVisible();
  await page.screenshot({path:resolve(evidence,`dashboard-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName(`Delete “${own.title}”?`);
  await expect(page.getByRole('button',{name:'Cancel',exact:true})).toBeFocused();
  await page.screenshot({path:resolve(evidence,`delete-${width}.png`),fullPage:true});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:`Delete ${own.title}`,exact:true})).toBeFocused();
  assert.deepEqual(await writes(page),[]);await context.close();
 }
 checks.push('1440/818/390/320 rendered capture/library, persona visible, no placeholder links or horizontal overflow, named delete dialog and safe initial/restored focus');
 {
  const {context,page}=await contextFor();const before=await saved(page);
  await page.getByRole('searchbox',{name:'Search ideas'}).fill('meeting');await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('searchbox',{name:'Search ideas'}).fill('does not exist');await expect(page.getByRole('heading',{name:'No matching ideas'})).toBeVisible();
  await page.getByRole('button',{name:'Clear search'}).click();
  await expect(note(page,'A shared reference')).toHaveCount(0);
  await expect(note(page,'Legacy unknown owner')).toHaveCount(0);
  await expect(note(page,'Other person ambient note')).toHaveCount(0);
  await expect(note(page,'Unknown ambient owner')).toHaveCount(0);
  for(const title of ['A connected idea','An idea from another tool']){
   await expect(note(page,title).getByRole('button',{name:`Delete ${title}`,exact:true})).toBeDisabled();
  }
  await expect(note(page,'An idea from another tool').getByRole('button',{name:'Archive An idea from another tool',exact:true})).toBeDisabled();
  await expect(note(page,'An idea from another tool').getByRole('button',{name:'Generate idea',exact:true})).toHaveCount(0);
  const readAudit=await page.evaluate(()=>window.__reads.filter(read=>read.table==='voice_notes'));
  assert.ok(readAudit.length>0 && readAudit.every(read=>read.filters.some(([key,value])=>key==='user_id'&&value==='mock-staging-user')));
  assert.deepEqual(await saved(page),before);assert.deepEqual(await writes(page),[]);
  await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await writes(page),[]);
  await page.evaluate(()=>window.__mutationDelay=600);
  await page.getByRole('button',{name:`Archive ${own.title}`,exact:true}).click();await expect(note(page,own.title)).toBeVisible();await expect(page.getByRole('button',{name:`Archive ${own.title}`,exact:true})).toBeDisabled();
  await expect(note(page,own.title)).toHaveCount(0);assert.equal((await writes(page)).length,1);
  assert.deepEqual((await writes(page))[0].filters,[['id',ids.own],['user_id',user]]);
  await page.reload({waitUntil:'networkidle'});await expect(note(page,own.title)).toHaveCount(0);await page.getByRole('button',{name:/^Archived/}).click();await expect(note(page,own.title)).toBeVisible();
  await page.getByRole('button',{name:`Restore ${own.title}`,exact:true}).click();await expect(note(page,own.title)).toHaveCount(0);
  await page.getByRole('button',{name:/^Active/}).click();await expect(note(page,own.title)).toBeVisible();
  await page.evaluate(()=>window.__mutationDelay=1000);
  await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();
  await page.getByRole('button',{name:'Delete note',exact:true}).evaluate(button=>{button.click();button.click();});
  await expect(page.getByRole('button',{name:'Deleting…',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Cancel',exact:true})).toBeDisabled();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);await expect(note(page,own.title)).toHaveCount(0);
  assert.equal((await writes(page)).filter(write=>write.operation==='delete').length,1);
  await expect(page.getByRole('heading',{name:'Idea library',exact:true})).toBeFocused();
  assert.equal((await saved(page)).voice_notes.some(row=>row.id===ids.own),false);
  await context.close();
 }
 {
  const {context,page}=await contextFor();
  for(const id of [ids.other,'idea_ambient']) {
   await page.goto(`${origin}/idea/${id}`,{waitUntil:'networkidle'});
   await expect(page.getByText('You can read this idea.',{exact:false})).toBeVisible();
   await page.getByRole('button',{name:'More actions',exact:true}).click();
   await expect(page.getByRole('button',{name:'Create Product Requirement Document',exact:true})).toBeDisabled();
   const generation=page.getByRole('button',{name:/^(Generate idea|Regenerate)$/});
   for(const button of await generation.all())await expect(button).toBeDisabled();
  }
  assert.deepEqual(await writes(page),[]);await page.screenshot({path:resolve(evidence,'detail-read-only.png'),fullPage:true});await context.close();
 }
 {
  const {context,page}=await contextFor();
  await note(page,'Make meeting follow-ups easier').getByRole('button',{name:'Generate idea',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Synthetic idea preview',exact:true})).toBeVisible();
  assert.deepEqual((await writes(page))[0].filters,[['id',ids.raw],['user_id',user]]);
  await context.close();
 }
 checks.push('search/filter, zero-write cancellation and unavailable actions, confirmed owner-filtered archive/restore, pending states and duplicate-delete guard, exact-row success and focus after removal');
 {
  const {context,page}=await contextFor();
  await page.evaluate(()=>{
   window.__emitStaging('INSERT',{id:'77777777-7777-4777-8777-777777777777',user_id:'another-person',title:'Foreign realtime insert'});
   window.__emitStaging('INSERT',{id:'88888888-8888-4888-8888-888888888888',title:'Unknown realtime insert'});
   window.__emitStaging('INSERT',{id:'99999999-9999-4999-8999-999999999999',user_id:'mock-staging-user',title:'Own realtime capture'});
  });
  await expect(note(page,'Own realtime capture')).toBeVisible();await expect(note(page,'Foreign realtime insert')).toHaveCount(0);await expect(note(page,'Unknown realtime insert')).toHaveCount(0);
  await page.evaluate(()=>window.__emitStaging('UPDATE',{id:'99999999-9999-4999-8999-999999999999',user_id:'another-person',title:'Own realtime capture'}));
  await expect(note(page,'Own realtime capture')).toHaveCount(0);assert.deepEqual(await writes(page),[]);await context.close();
 }
 checks.push('exact-owner library read filters and ambient response gates; foreign/unknown realtime exclusion; archive remains persisted after reload');
 for(const kind of ['error','zero','mismatch','fk','throw']){
  const {context,page}=await contextFor();const before=await saved(page);
  await page.evaluate(kind=>{window.__fault={operation:'delete',kind}},kind);
  await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();await page.getByRole('button',{name:'Delete note',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText(kind==='fk'?'linked to another saved idea':kind==='throw'?'Synthetic transport failure':'could not be confirmed');
  assert.deepEqual(await saved(page),before);await expect(note(page,own.title)).toBeVisible();
  await page.evaluate(()=>window.__fault=null);await page.getByRole('button',{name:'Retry delete',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await context.close();
 }
 checks.push('delete denied/zero-row/wrong-row/linked-copy/transport failure: retain note and dialog, explicit failure, retry succeeds');
 for(const operation of ['archive','restore','malformed']){
  const {context,page}=await contextFor();if(operation==='restore')await page.getByRole('button',{name:/^Archived/}).click();
  const target=operation!=='restore'?own.title:'An earlier experiment';
  await page.evaluate(operation=>window.__fault={operation:'update',kind:operation==='malformed'?'incomplete':'error'},operation);
  await page.getByRole('button',{name:`${operation!=='restore'?'Archive':'Restore'} ${target}`,exact:true}).click();await expect(page.getByRole('alert')).toContainText(`${operation!=='restore'?'Archive':'Restore'} failed`);await expect(note(page,target)).toBeVisible();
  await page.evaluate(()=>window.__fault=null);await page.getByRole('button',{name:`${operation!=='restore'?'Archive':'Restore'} ${target}`,exact:true}).click();await expect(note(page,target)).toHaveCount(0);await context.close();
 }
 for(const options of [{incomplete:true},{apiFailure:true},{readFault:true}]){
  const {context,page}=await contextFor(fixture,options);
  if(!options.readFault){await expect(page.getByRole('button',{name:`Delete ${own.title}`,exact:true})).toBeDisabled();}
  if(options.apiFailure||options.readFault){await expect(page.getByRole('button',{name:'Retry loading'})).toBeVisible();}
  assert.deepEqual(await writes(page),[]);await context.close();
 }
 checks.push('archive/restore failure retains visible state and retry works; incomplete/error list fails closed for deletion; load errors expose retry');
 assert.deepEqual(errors,[]);assert.deepEqual(rejected,[]);
 const report={passed:true,checks,pageErrors:errors,rejectedRequests:rejected,externalRequestsTransmitted:0,realMutations:0,microphoneCalls:0,limitations:'Synthetic mocked browser and adapter behavior only. No real database writes, API writes, AI, auth or recording qualification. Ambient and mirrored full-idea deletion requires backend work.'};
 writeFileSync(resolve(evidence,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await server.close();}
