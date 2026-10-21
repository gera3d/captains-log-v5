// Synthetic browser verification. No real auth, microphone, API, storage, or AI calls.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { createServer as createPortProbe } from 'node:net';
import representativeFixture from '../src/fixtures/dashboard-preview.json' with { type: 'json' };
import { chromium, expect } from '@playwright/test';
const scopeOnly = process.env.DASHBOARD_SCOPE_ONLY === 'true';
const evidence = resolve(process.env.DASHBOARD_EVIDENCE_DIR || 'artifacts/dashboard-usability');
mkdirSync(evidence, { recursive: true });
const portProbe = createPortProbe();
await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
const freePort = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const server = await createServer({ mode: 'staging', server: { host: '127.0.0.1', port: freePort, strictPort: true } });
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu', '--mute-audio', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
const user = 'mock-staging-user';
const ids = { own:'11111111-1111-4111-8111-111111111111', raw:'22222222-2222-4222-8222-222222222222', other:'33333333-3333-4333-8333-333333333333', archived:'44444444-4444-4444-8444-444444444444', mirrored:'55555555-5555-4555-8555-555555555555' };
const own = { id:ids.own, user_id:user, title:'A neighborhood tool library', summary:'Borrow the tools you only need once. A shared place for neighbors to lend, reserve and return equipment.', business_idea:'',transcript:'Borrow the tools you only need once.',duration:42,created_at:'2026-10-20T12:00:00Z' };
const fixture = {voice_notes:[own, {id:ids.raw,user_id:user,title:'Make meeting follow-ups easier',transcript:'Turn messy notes into a clear list of decisions and next steps.',summary:'Turn messy notes into a clear list of decisions and next steps.',created_at:'2026-10-19T12:00:00Z'},{id:ids.other,user_id:'another-person',title:'A shared reference',summary:'Readable but not owned by this synthetic user.',transcript:'A shared reference to read without changing it.',created_at:'2026-10-18T12:00:00Z'},{id:ids.archived,user_id:user,title:'An earlier experiment',summary:'A saved idea to revisit later.',archived:true,status:'archived',created_at:'2026-10-17T12:00:00Z'},{id:ids.mirrored,user_id:user,title:'A connected idea',summary:'This note has an ambient mirror.',created_at:'2026-10-16T12:00:00Z'}],ideas:[{id:'idea_mirror',supabaseId:ids.mirrored,userId:user,title:'A connected idea',createdAt:'2026-10-16T12:00:00Z'},{id:'idea_ambient',userId:user,title:'An idea from another tool',summary:'An ambient idea remains readable.',createdAt:'2026-10-15T12:00:00Z'}]};
fixture.voice_notes.push({id:'66666666-6666-4666-8666-666666666666',user_id:null,title:'Legacy unknown owner',transcript:'A legacy reference.',created_at:'2026-10-14T12:00:00Z'});
fixture.ideas.push({id:'idea_other',userId:'another-person',title:'Other person ambient note'},{id:'idea_unknown',title:'Unknown ambient owner'});
fixture.voice_notes.push({id:'88888888-8888-4888-8888-888888888888',user_id:user,title:'A developed idea',summary:'A saved report to continue.',business_idea:'# A developed idea\n\n## Summary\nA saved report to continue.',created_at:'2026-10-18T10:00:00Z'}, {id:'99999999-9999-4999-8999-999999999999',user_id:user,title:'A featured thought',transcript:'A rough thought deliberately kept close.',is_featured:true,created_at:'2026-10-17T10:00:00Z'});
const rejected=[],errors=[],checks=[];
const record=message=>{checks.push(message);console.log('PASS '+message)};
async function contextFor(data=fixture, options={}) {
 const context=await browser.newContext({deviceScaleFactor:1,serviceWorkers:'block'});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin){rejected.push(url.origin+url.pathname);return route.abort();}
  if(url.pathname==='/__fixture__/silence.wav' && options.audioBytes)return route.fulfill({status:200,contentType:'audio/wav',body:options.audioBytes});
  if(url.pathname==='/src/stagingMock.js'){
   const response=await route.fetch();let source=await response.text();
   assert.ok(source.includes('return Promise.resolve().then(() => {'));
   source=source.replace('function query(table) {', 'window.__emitStaging = emit; function query(table) {');
   source=source.replace('const filters = [];','const filters = []; const recordedFilters = [];').replace('eq(key, value) { filters.push','eq(key, value) { recordedFilters.push([key, value]); filters.push');
   source=source.replace('return Promise.resolve().then(() => {',`return Promise.resolve().then(async () => {
     if(operation !== 'select') {
       window.__mutations.push({ operation, table, filters:recordedFilters, values });
       if(window.__mutationDelay) await new Promise(resolve=>setTimeout(resolve,window.__mutationDelay));
       const fault=window.__fault;
       if(fault?.operation===operation){
         if(fault.kind==='throw') throw new Error('Synthetic transport failure');
         if(fault.kind==='zero') return {data:[],error:null};
         if(fault.kind==='mismatch') return {data:[{id:'unexpected'}],error:null};
         if(fault.kind==='foreign') return {data:[{id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',user_id:'another-person',is_featured:false}],error:null};
         if(fault.kind==='incomplete') return {data:{id:recordedFilters.find(([key])=>key==='id')[1]},error:null};
         return {data:null,error:{message:'Synthetic failure',code:fault.kind==='fk'?'23503':'42501'}};
       }
     } else { window.__reads.push({table,filters:recordedFilters}); if(window.__readFault) return {data:null,error:{message:'Synthetic read failure'}}; }
   `);
   if(options.incomplete) source=source.replace('total: ownedIdeas.length, limit, offset','total: 101, limit, offset');
   if(options.apiFailure) source=source.replace("if (url.pathname === '/api/v1/ideas' && method === 'GET') {", "if (url.pathname === '/api/v1/ideas' && method === 'GET') return json({error:'Synthetic list failure'}, 500); if(false) {");
   source=source.replace("getUser: async () => ({ data: { user: previewSignedOut ? null : user }, error: null })", "getUser: async () => { window.__getUserCalls=(window.__getUserCalls||0)+1; if(window.__rejectUserAfter && window.__getUserCalls>=window.__rejectUserAfter)throw new Error('Synthetic auth transport rejection'); return { data: { user: previewSignedOut ? null : user }, error: null }; }");
   source=source.replace('upload: disabled', `upload: async () => { window.__uploads=(window.__uploads||0)+1; if(window.__rejectUpload)throw new Error('Synthetic upload transport rejection'); if(window.__uploadDelay) await new Promise(resolve=>setTimeout(resolve,window.__uploadDelay)); return window.__completeSave?{data:{path:'synthetic'},error:null}:{data:null,error:{message:'Synthetic upload failure'}}; }`);
   return route.fulfill({response,body:source});
  }
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/__mock/')){rejected.push(url.pathname);return route.abort();}
  return route.continue();
 });
 await context.routeWebSocket('**/*',socket=>socket.close());
 await context.addInitScript(({data,seen,readFault})=>{
   if(!localStorage.getItem('goodidea.mock-staging.v4'))localStorage.setItem('goodidea.mock-staging.v4',JSON.stringify(data));
   if(seen!==undefined) localStorage.setItem('dashboardOnboardingSeen',String(seen));
   window.__mutations=[];window.__reads=[];window.__micCalls=0;window.__readFault=readFault;
   Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>{window.__micCalls++;throw Error('Microphone blocked')}}});
   window.MediaRecorder=class{constructor(){throw Error('Recording blocked')}};
 },{data,seen:options.seen,readFault:options.readFault||false});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin,{waitUntil:'networkidle'});
 await expect(page.getByRole('heading',{name:'Your captured notes & ideas',exact:true})).toBeVisible();
 return {context,page};
}
const note=(page,title)=>page.locator('article').filter({has:page.locator('h3').filter({hasText:title})});
const writes=page=>page.evaluate(()=>window.__mutations);
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('goodidea.mock-staging.v4')));
const selectView = async (page, view) => {
 const label = view === 'workspace' ? 'All notes' : view[0].toUpperCase()+view.slice(1);
 await page.getByRole('navigation',{name:'Filter notes'}).getByRole('button',{name:new RegExp('^'+label)}).click();
};
const clearSearch=page=>page.getByRole('searchbox',{name:'Search ideas'}).fill('');
const openRecord=async page=>{await page.getByRole('button',{name:'Voice Memo',exact:true}).click();await expect(page.getByRole('button',{name:'Start recording',exact:true})).toBeVisible()};
try {
 if (scopeOnly) {
  const knownNote = { ...own, id: ids.raw, title: 'Owned note with a known owned mirror' };
  const knownMirror = { id: 'idea_known_owned_mirror', userId: user, supabaseId: ids.raw, title: knownNote.title };
  for (const hiddenOwner of ['another-person', null]) {
   const hiddenMirror = { id: hiddenOwner ? 'idea_foreign_legacy_copy' : 'idea_ownerless_legacy_copy', supabaseId: ids.own, title: 'Hidden legacy ambient copy', ...(hiddenOwner ? { userId: hiddenOwner } : {}) };
   const data = { voice_notes: [{ ...own, is_featured: false }, knownNote], ideas: [hiddenMirror, knownMirror] };
   const { context, page } = await contextFor(data);
   const visibleList = await page.evaluate(() => fetch('/api/v1/ideas?limit=100').then(response => response.json()));
   assert.deepEqual(visibleList.ideas.map(row => row.id), [knownMirror.id]);
   assert.equal(visibleList.total, 1);
   const nextPage = await page.evaluate(() => fetch('/api/v1/ideas?limit=1&offset=1').then(response => response.json()));
   assert.deepEqual(nextPage.ideas, []);
   assert.equal(nextPage.total, 1, 'total is current-account scoped before pagination');
   for (const action of ['Feature', 'Archive', 'Delete']) {
    await expect(note(page, own.title).getByRole('button', { name: `${action} ${own.title}`, exact: true })).toBeEnabled();
    await expect(note(page, knownNote.title).getByRole('button', { name: `${action} ${knownNote.title}`, exact: true })).toBeDisabled();
   }
   const before = await saved(page);
   await page.getByRole('button', { name: `Delete ${own.title}`, exact: true }).click();
   await expect(page.getByRole('dialog')).toContainText('This permanently removes the note, its transcript and any report saved in it.');
   await expect(page.getByRole('dialog')).toContainText('Stored audio files and copies saved elsewhere are kept.');
   await expect(page.getByRole('button', { name: 'Delete note', exact: true })).toBeVisible();
   await page.screenshot({ path: resolve(evidence, `note-row-${hiddenOwner ? 'foreign' : 'ownerless'}-copy-confirmation.png`), fullPage: true });
   await page.getByRole('button', { name: 'Cancel', exact: true }).click();
   assert.deepEqual(await saved(page), before);
   assert.deepEqual(await writes(page), []);
   await page.getByRole('button', { name: `Delete ${own.title}`, exact: true }).click();
   await page.getByRole('button', { name: 'Delete note', exact: true }).click();
   await expect(page.getByRole('dialog')).toHaveCount(0);
   await expect(page.locator('.library-feedback[role="status"]')).toContainText('Stored audio files and other saved copies are kept.');
   const after = await saved(page);
   assert.deepEqual(after.voice_notes.map(row => row.id), [knownNote.id]);
   assert.deepEqual(after.ideas, before.ideas, 'all hidden and known-owned ambient copies are retained');
   assert.equal((await writes(page)).length, 1);
   assert.deepEqual((await writes(page))[0].filters, [['id', ids.own], ['user_id', user]]);
   assert.equal(await page.evaluate(() => window.__micCalls), 0);
   await context.close();
   record(`${hiddenOwner ? 'foreign-owner' : 'ownerless'} mirror is hidden by account-scoped list/total; exact owned note-row removal retains all ambient copies and explicit retained-copy wording`);
   const incomplete = await contextFor(data, { incomplete: true });
   for (const action of ['Feature', 'Archive', 'Delete']) await expect(note(incomplete.page, own.title).getByRole('button', { name: `${action} ${own.title}`, exact: true })).toBeDisabled();
   assert.deepEqual(await writes(incomplete.page), []);
   await incomplete.context.close();
  }
  record('known account-visible mirrors and incomplete metadata retain existing closed guards; no global mirror-absence inference');
 } else {
 // Compare with the same truthful synthetic content used by the original baseline.
 for (const width of [1440,818,390,320]) {
  const {context,page}=await contextFor(representativeFixture);await page.setViewportSize({width,height:1000});
  const mic=page.getByRole('button',{name:'Start recording',exact:true});await expect(mic).toBeVisible();const bounds=await mic.boundingBox();assert.equal(bounds.width,128);assert.equal(bounds.height,128);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:resolve(evidence,`restored-dashboard-top-${width}.png`)});
  await page.screenshot({path:resolve(evidence,`restored-dashboard-full-${width}.png`),fullPage:true});
  const first=note(page,'A tool library for the neighborhood');await first.scrollIntoViewIfNeeded();await expect(first.getByLabel('Saved report contents')).toHaveText('3 keywords');
  await expect(first.getByLabel('Saved report contents')).not.toContainText('sources');await expect(first.getByLabel('Saved report contents')).not.toContainText('metrics');await expect(page.locator('audio')).toHaveCount(0);
  await page.screenshot({path:resolve(evidence,`restored-recognition-${width}.png`)});
  const report=first.locator('details.original-report');await report.locator('summary').focus();await page.keyboard.press('Enter');await expect(report).toHaveAttribute('open','');await expect(report.getByRole('heading',{name:'Blue team: What could work'})).toBeVisible();
  const original=first.locator('details.original-transcript');await original.locator('summary').click();await expect(original).toContainText('I only use my drill a few times a year.');await expect(page.getByText('Strong Market Pull',{exact:true})).toHaveCount(0);
  await page.screenshot({path:resolve(evidence,`restored-expanded-${width}.png`)});
  await report.locator('summary').click();await expect(report).not.toHaveAttribute('open');
  assert.deepEqual(await writes(page),[]);assert.equal(await page.evaluate(()=>window.__micCalls),0);await context.close();
 }
 for (const [value,expected] of [['Plain original words','Plain original words'],[JSON.stringify({data:'Data wrapper words'}),'Data wrapper words'],[JSON.stringify({transcript:'Transcript wrapper words'}),'Transcript wrapper words'],[JSON.stringify('String wrapper words'),'String wrapper words'],[JSON.stringify({legacy:'Unrecognized saved wrapper'}),'{"legacy":"Unrecognized saved wrapper"}']]) {
  const {context,page}=await contextFor({voice_notes:[{...own,title:'Original content preservation',transcript:value}],ideas:[]});const original=note(page,'Original content preservation').locator('details.original-transcript');await original.locator('summary').click();await expect(original.locator('p')).toHaveText(expected);assert.deepEqual(await writes(page),[]);await context.close();
 }
 record('original comparison at four widths: inline128pxmic, truthful report counts, readable summaries, keyboard report/transcript disclosures, no fabricated metrics/audio, saved wrapper/plain content preserved');
 {
  // Real playable bytes generated solely for this local fixture: one second of silence.
  const wav=Buffer.alloc(44+16000);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
  const {context,page}=await contextFor({voice_notes:[{...own,audio_url:`${origin}/__fixture__/silence.wav`,duration:1}],ideas:[]},{audioBytes:wav});
  const audio=page.getByLabel(`Original recording of ${own.title}`,{exact:true});await expect(audio).toHaveAttribute('preload','none');assert.equal(await audio.evaluate(element=>element.paused),true);await audio.evaluate(element=>{void element.play().catch(()=>{});});await expect.poll(()=>audio.evaluate(element=>element.duration)).toBe(1);await expect.poll(()=>audio.evaluate(element=>element.currentTime)).toBeGreaterThan(0);await audio.evaluate(element=>{element.pause();element.dispatchEvent(new Event('error'))});await expect(page.getByRole('alert')).toContainText('recording couldn’t be loaded');await note(page,own.title).locator('details.original-transcript>summary').click();await expect(note(page,own.title)).toContainText(own.transcript);assert.deepEqual(await writes(page),[]);await context.close();
 }
 record('recording player uses actual local WAV fixture bytes, never autoplays or requests microphone, reports media error without losing transcript; no audio player for missing URL');
 for(const seen of [undefined,true,false])for(const empty of [false,true]){
  const {context,page}=await contextFor(empty?{voice_notes:[],ideas:[]}:fixture,{seen});
  await expect(page.getByRole('dialog')).toHaveCount(0);
  if(empty)await expect(page.getByRole('heading',{name:'Start with a rough idea'})).toBeVisible();
  await openRecord(page);await expect(page.getByRole('button',{name:'Voice Memo',exact:true})).toBeFocused();
  assert.equal(await page.evaluate(()=>window.__micCalls),0);
  await page.getByRole('button',{name:'Text',exact:true}).click();await expect(page.getByLabel('Your idea',{exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await openRecord(page);await expect(page.getByRole('dialog')).toHaveCount(0);
  assert.deepEqual(await writes(page),[]);assert.equal(await page.evaluate(()=>window.__micCalls),0);await context.close();
 }
 record('fresh/new/returning origins: direct workspace, no welcome, inline large microphone, voice selected, Text explicit, zero automatic microphone calls');
 for(const width of [1440,818,390,320]){
  const {context,page}=await contextFor();await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('a[href="#"]').count(),0);
  await expect(page.getByRole('button',{name:'Innovator',exact:false})).toBeVisible();
  await page.screenshot({path:resolve(evidence,`final-workspace-${width}.png`),fullPage:true});
  await selectView(page,'captures');await expect(page.getByRole('heading',{name:'Captures',exact:true}).first()).toBeVisible();
  await page.screenshot({path:resolve(evidence,`final-captures-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();await expect(page.getByRole('dialog')).toHaveAccessibleName(`Delete “${own.title}”?`);await expect(page.getByRole('button',{name:'Cancel',exact:true})).toBeFocused();
  await page.screenshot({path:resolve(evidence,`final-delete-${width}.png`),fullPage:true});await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);assert.deepEqual(await writes(page),[]);
  await context.close();
 }
 record('1440/818/390/320 at1x: hierarchy, active filters, readable actions, persona, no overflow, named deletion confirmation and safe focus');
 {
  const developed=fixture.voice_notes.find(row=>row.title==='A developed idea');
  for(const data of [{voice_notes:[],ideas:[]},{voice_notes:[developed],ideas:[]}]){
   const {context,page}=await contextFor(data);const active=page.getByRole('region',{name:'Active ideas',exact:true});await expect(active.locator('a[href^="/idea/"]')).toHaveCount(0);await expect(active).toContainText('Use Feature in your library');if(data.voice_notes.length){await expect(note(page,'A developed idea')).toBeVisible();await active.getByRole('button',{name:'Choose from your library',exact:true}).click();await expect(page.getByRole('heading',{name:'Your captured notes & ideas',exact:true})).toBeFocused();await selectView(page,'ideas');await expect(note(page,'A developed idea')).toBeVisible()}assert.deepEqual(await writes(page),[]);await expect(active.locator('a[href^="/idea/"]')).toHaveCount(0);
   await page.screenshot({path:resolve(evidence,data.voice_notes.length?'final-returning-developed.png':'final-empty.png'),fullPage:true});await context.close();
  }
 }
 record('empty Active ideas does not auto-select unfeatured developed work; choose reaches full library and Ideas without mutation or generation');
 {
  const {context,page}=await contextFor();const before=await saved(page);
  await page.getByRole('searchbox',{name:'Search ideas'}).fill('meeting');await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('searchbox',{name:'Search ideas'}).fill('does not exist');await expect(page.getByRole('heading',{name:'No matching ideas'})).toBeVisible();await page.getByRole('button',{name:'Clear search'}).click();
  for(const title of ['A shared reference','Legacy unknown owner','Other person ambient note','Unknown ambient owner'])await expect(note(page,title)).toHaveCount(0);
  for(const title of ['A connected idea','An idea from another tool'])for(const action of ['Feature','Archive','Delete'])await expect(note(page,title).getByRole('button',{name:`${action} ${title}`,exact:true})).toBeDisabled();
  const reads=await page.evaluate(()=>window.__reads.filter(read=>read.table==='voice_notes'));assert.ok(reads.length&&reads.every(read=>read.filters.some(([key,value])=>key==='user_id'&&value==='mock-staging-user')));
  await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual(await saved(page),before);assert.deepEqual(await writes(page),[]);
  await page.evaluate(()=>window.__mutationDelay=800);
  await page.getByRole('button',{name:`Archive ${own.title}`,exact:true}).click();await expect(page.getByRole('button',{name:`Archive ${own.title}`,exact:true})).toBeDisabled();await expect(note(page,own.title)).toHaveCount(0);
  assert.deepEqual((await writes(page))[0].filters,[['id',ids.own],['user_id',user]]);
  await page.reload({waitUntil:'networkidle'});await expect(note(page,own.title)).toHaveCount(0);await selectView(page,'archived');await expect(note(page,own.title)).toBeVisible();await page.getByRole('button',{name:`Restore ${own.title}`,exact:true}).click();await expect(note(page,own.title)).toHaveCount(0);await expect(page.locator('.library-feedback[role="status"]')).toContainText('restored to Captures');
  await selectView(page,'captures');await page.evaluate(()=>window.__mutationDelay=1000);await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();await page.getByRole('button',{name:'Delete note',exact:true}).evaluate(button=>{button.click();button.click()});await expect(page.getByRole('button',{name:'Deleting…',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Cancel',exact:true})).toBeDisabled();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(1);await expect(page.getByRole('dialog')).toHaveCount(0);assert.equal((await writes(page)).filter(write=>write.operation==='delete').length,1);await expect(page.locator('h1')).toBeFocused();assert.equal((await saved(page)).voice_notes.some(row=>row.id===ids.own),false);await context.close();
 }
 record('scoped reads/search, unsupported linked/ambient actions closed, zero-write cancellation, confirmed archive/reload/restore, pending deletion duplicate guard and exact-row success');
 for(const kind of ['error','zero','mismatch','fk','throw']){
  const {context,page}=await contextFor();const before=await saved(page);await page.evaluate(kind=>window.__fault={operation:'delete',kind},kind);await page.getByRole('button',{name:`Delete ${own.title}`,exact:true}).click();await page.getByRole('button',{name:'Delete note',exact:true}).click();await expect(page.getByRole('alert')).toContainText(kind==='fk'?'linked to another saved idea':kind==='throw'?'Synthetic transport failure':'could not be confirmed');assert.deepEqual(await saved(page),before);await page.evaluate(()=>window.__fault=null);await page.getByRole('button',{name:'Retry delete',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await context.close();
 }
 record('delete denied/zero/wrong-row/FK/transport failure retains original and retryable dialog; retry succeeds');
 for(const kind of ['error','zero','mismatch','incomplete'])for(const action of ['archive','feature']){
  const {context,page}=await contextFor();const before=await saved(page);await page.evaluate(kind=>window.__fault={operation:'update',kind},kind);await page.getByRole('button',{name:`${action==='archive'?'Archive':'Feature'} ${own.title}`,exact:true}).click();await expect(page.getByRole('alert')).toContainText('could not be confirmed');assert.deepEqual(await saved(page),before);await expect(note(page,own.title)).toBeVisible();await page.evaluate(()=>window.__fault=null);await page.getByRole('button',{name:`${action==='archive'?'Archive':'Feature'} ${own.title}`,exact:true}).click();await expect(page.locator('.library-feedback[role="status"]')).toContainText(action==='archive'?'archived':'added to Featured');await context.close();
 }
 {
  const {context,page}=await contextFor();await page.evaluate(()=>window.__mutationDelay=1000);await page.getByRole('button',{name:`Feature ${own.title}`,exact:true}).evaluate(button=>{button.click();button.click()});await expect(page.getByRole('button',{name:`Feature ${own.title}`,exact:true})).toBeDisabled();await expect(page.locator('.library-feedback[role="status"]')).toContainText('added to Featured');assert.equal((await writes(page)).length,1);assert.deepEqual((await writes(page))[0].values,{is_featured:true});await page.reload({waitUntil:'networkidle'});await selectView(page,'featured');await expect(note(page,own.title)).toBeVisible();await page.getByRole('button',{name:`Remove featured ${own.title}`,exact:true}).click();await expect(note(page,own.title)).toHaveCount(0);assert.equal((await saved(page)).voice_notes.find(row=>row.id===ids.own).is_featured,false);await context.close();
 }
 record('manual Feature independent of development: strict owner/result, denied/zero/malformed retry, duplicate/pending guard, persistence after reload and explicit removal');
 for(const id of [ids.own,'99999999-9999-4999-8999-999999999999']){
  const {context,page}=await contextFor();await selectView(page,'captures');const target=fixture.voice_notes.find(row=>row.id===id);await note(page,target.title).getByRole('button',{name:'Develop idea',exact:true}).click();await expect.poll(async () => (await saved(page)).voice_notes.find(row=>row.id===id).business_idea || '').toContain('Synthetic idea preview');await page.getByTitle('Close',{exact:true}).click();await selectView(page,'ideas');await expect(note(page,'Synthetic idea preview')).toBeVisible();const row=(await saved(page)).voice_notes.find(row=>row.id===id);assert.equal(row.is_featured===true,target.is_featured===true);assert.equal(row.transcript,target.transcript);assert.equal((await writes(page)).some(write=>write.values&&'is_featured'in write.values),false);await context.close();
 }
 record('development saves original transcript and preserves historical true/false Featured flag without auto-promotion');
 for(const kind of ['error','zero','mismatch','incomplete']){
  const {context,page}=await contextFor();const id='88888888-8888-4888-8888-888888888888';await page.goto(`${origin}/idea/${id}`,{waitUntil:'networkidle'});const before=await saved(page);await page.evaluate(kind=>window.__fault={operation:'update',kind},kind);await page.getByRole('button',{name:'Regenerate',exact:true}).click();await expect(page.getByRole('alert')).toContainText('could not be saved');await expect(page.getByRole('heading',{name:'A developed idea',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Synthetic idea preview',exact:true})).toHaveCount(0);assert.deepEqual(await saved(page),before);await context.close();
 }
 record('detail regeneration denied/zero/malformed/wrong-row retains original visible content and explicit error; no optimistic success');
 {
  const {context,page}=await contextFor();for(const id of [ids.other,'idea_ambient']){await page.goto(`${origin}/idea/${id}`,{waitUntil:'networkidle'});await expect(page.getByText('You can read this idea.',{exact:false})).toBeVisible();await page.getByRole('button',{name:'More actions',exact:true}).click();await expect(page.getByRole('button',{name:'Create Product Requirement Document',exact:true})).toBeDisabled();for(const button of await page.getByRole('button',{name:/^(Generate idea|Regenerate)$/}).all())await expect(button).toBeDisabled()}
  assert.deepEqual(await writes(page),[]);await page.screenshot({path:resolve(evidence,'final-detail-read-only.png'),fullPage:true});await context.close();
 }
 for(const options of [{incomplete:true},{apiFailure:true},{readFault:true}]){
  const {context,page}=await contextFor(fixture,options);if(!options.readFault)for(const action of ['Feature','Archive','Delete'])await expect(page.getByRole('button',{name:`${action} ${own.title}`,exact:true})).toBeDisabled();if(options.apiFailure||options.readFault)await expect(page.getByRole('button',{name:'Retry loading'})).toBeVisible();assert.deepEqual(await writes(page),[]);await context.close();
 }
 record('public/ambient detail readable with mutation controls closed; incomplete/error metadata closes all cross-store management actions');
 for(const mode of ['recording','preparing','saving']){
  const {context,page}=await contextFor();if(mode==='recording')await page.clock.install();await page.evaluate(mode=>{
   window.__tracksStopped=0;window.__recorderStops=0;window.__recorderStarts=0;window.__uploads=0;window.__uploadDelay=mode==='saving'?1200:0;
   const stream={getTracks:()=>[{stop:()=>window.__tracksStopped++}]};window.__syntheticStream=stream;
   navigator.mediaDevices.getUserMedia=()=>{window.__micCalls++;return mode==='preparing'?new Promise(resolve=>window.__resolveMedia=resolve):Promise.resolve(stream)};
   window.MediaRecorder=class{state='inactive';constructor(){window.__syntheticRecorder=this}start(){this.state='recording';window.__recorderStarts++}stop(){this.state='inactive';window.__recorderStops++;this.onstop?.()}};
  },mode);await openRecord(page);await page.getByRole('button',{name:'Start recording',exact:true}).focus();await page.keyboard.press('Enter');
  if(mode==='preparing')await expect(page.getByRole('button',{name:'Preparing microphone',exact:true})).toBeDisabled();else await expect(page.getByRole('button',{name:'Stop recording',exact:true})).toBeVisible();
  if(mode==='recording'){await page.clock.runFor(1100);await expect(page.getByText('0:01',{exact:true})).toBeVisible();await page.clock.runFor(1000);await expect(page.getByText('0:02',{exact:true})).toBeVisible()}
  if(mode==='saving')await page.getByRole('button',{name:'Stop recording',exact:true}).click();
  await expect(page.getByRole('button',{name:'Text',exact:true})).toBeDisabled();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Text',exact:true})).toBeDisabled();await expect(page.getByRole('dialog')).toHaveCount(0);
  if(mode==='saving'){await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeVisible();assert.ok(await page.evaluate(()=>window.__tracksStopped)>0);await page.getByRole('button',{name:'Text',exact:true}).click()}
  else{await page.evaluate(()=>{history.pushState({},'', '/idea/88888888-8888-4888-8888-888888888888');dispatchEvent(new PopStateEvent('popstate'))});await expect(page.getByRole('dialog')).toHaveCount(0);if(mode==='preparing')await page.evaluate(()=>window.__resolveMedia(window.__syntheticStream));await expect.poll(()=>page.evaluate(()=>window.__tracksStopped)).toBeGreaterThan(0);assert.equal(await page.evaluate(()=>window.__uploads),0)}
  assert.deepEqual(await writes(page),[]);await context.close();
 }
 for(const failure of ['upload','auth','insert','zero','mismatch','incomplete','foreign','success']){
  const {context,page}=await contextFor();const before=await saved(page);await page.evaluate(failure=>{
   window.__tracksStopped=0;window.__micCalls=0;window.__getUserCalls=0;window.__completeSave=failure!=='upload';window.__rejectUpload=failure==='upload';window.__rejectUserAfter=failure==='auth'?2:0;
   if(['insert','zero','mismatch','incomplete','foreign'].includes(failure))window.__fault={operation:'insert',kind:failure==='insert'?'throw':failure};
   navigator.mediaDevices.getUserMedia=()=>{window.__micCalls++;return Promise.resolve({getTracks:()=>[{stop:()=>window.__tracksStopped++}]})};
   window.MediaRecorder=class{state='inactive';start(){this.state='recording'}stop(){this.state='inactive';this.onstop?.()}};
   window.Audio=class{duration=1;addEventListener(type,callback){if(type==='loadedmetadata')queueMicrotask(callback)}removeEventListener(){}};
   const originalFetch=window.fetch;window.fetch=(input,options)=>options?.method==='HEAD'?Promise.resolve(new Response(null,{status:200})):originalFetch(input,options);
  },failure);await openRecord(page);await page.getByRole('button',{name:'Start recording',exact:true}).click();await expect(page.getByRole('button',{name:'Stop recording',exact:true})).toBeVisible();await page.getByRole('button',{name:'Stop recording',exact:true}).click();
  if(failure==='success'){await expect.poll(async()=> (await saved(page)).voice_notes.length).toBe(before.voice_notes.length+1);const row=(await saved(page)).voice_notes.find(row=>!before.voice_notes.some(old=>old.id===row.id));assert.equal(row.is_featured,false)}
  else{await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeVisible();assert.deepEqual(await saved(page),before)}
  await expect(page.getByRole('button',{name:'Text',exact:true})).toBeEnabled();await expect(page.getByRole('dialog')).toHaveCount(0);assert.ok(await page.evaluate(()=>window.__tracksStopped)>0);await page.getByRole('button',{name:'Text',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await context.close();
 }
 record('synthetic microphone lifecycle only: keyboard Start/Stop, Text switching blocked while preparing/recording/saving, tracks stopped and no upload on unmount or late permission');
 {
  const {context,page}=await contextFor();await page.evaluate(()=>{window.__emitStaging('INSERT',{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',user_id:'another-person',title:'Foreign realtime insert'});window.__emitStaging('INSERT',{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',title:'Unknown realtime insert'});window.__emitStaging('INSERT',{id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',user_id:'mock-staging-user',title:'Own realtime capture'})});await selectView(page,'captures');await expect(note(page,'Own realtime capture')).toBeVisible();await expect(note(page,'Foreign realtime insert')).toHaveCount(0);await expect(note(page,'Unknown realtime insert')).toHaveCount(0);await page.evaluate(()=>window.__emitStaging('UPDATE',{id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',user_id:'another-person',title:'Own realtime capture'}));await expect(note(page,'Own realtime capture')).toHaveCount(0);await context.close();
 }
 record('foreign/unknown realtime insert/update handling stays outside Your workspace');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(rejected,[]);
 const report={passed:true,scopeOnly,listScope:scopeOnly?'current-account':undefined,globalMirrorAbsenceProven:false,completeIdeaErasureQualified:false,checks,pageErrors:errors,rejectedRequests:rejected,externalRequestsTransmitted:0,realMutations:0,realMicrophoneCalls:0,syntheticMediaLifecycleCases:scopeOnly?0:11,syntheticExplicitMicrophoneCalls:scopeOnly?0:11,screenshotDeviceScaleFactor:1,limitations:'Synthetic UI/adapter verification only. No real auth, recording, storage, database, AI or API mutation qualification. Complete cross-store deletion awaits separately reviewed/installed backend566.'};writeFileSync(resolve(evidence,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await server.close()}
