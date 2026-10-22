// Invented local data only; no provider, account, microphone or production calls.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createServer} from 'vite';
import {createServer as probeServer} from 'node:net';
import {chromium,expect} from '@playwright/test';
import preview from '../src/fixtures/dashboard-preview.json' with {type:'json'};
const evidence=resolve(process.env.CONTEXT_EVIDENCE_DIR||'artifacts/generation-context');mkdirSync(evidence,{recursive:true});
const probe=probeServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const server=await createServer({mode:'staging',server:{host:'127.0.0.1',port,strictPort:true}});await server.listen();const origin=`http://127.0.0.1:${port}`;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
const id=preview.voice_notes[0].id,user='mock-staging-user',key='goodidea.mock-staging.v4',checks=[],blocked=[],errors=[];
const record=name=>{checks.push(name);console.log('PASS '+name)};
async function setup(fixture=preview,width=818){
 const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():(blocked.push(r.request().url()),r.abort()));await context.routeWebSocket('**/*',s=>s.close());
 await context.addInitScript(({fixture,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>{throw Error('Real microphone blocked')}}});},{fixture,key});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`${origin}/idea/${id}`,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  window.ctx=await import('/src/utils/ideaContext.js');window.store=await import('/src/utils/ideaContextStore.js');window.gql=await import('/src/utils/ideaGraphql.js');window.gen=await import('/src/utils/generationRequest.js');window.mock=await import('/src/stagingMock.js');
  const base=window.fetch.bind(window);window.requests=[];window.fault=null;
  window.fetch=async(input,options={})=>{const url=typeof input==='string'?input:input.url;const isGql=url.includes('/__mock/graphql');const mutation=isGql&&JSON.parse(options.body).query.includes('mutation SaveIdea');
   if(isGql||url.includes('/__mock/workflows/'))window.requests.push({url,body:typeof options.body==='string'?JSON.parse(options.body):null,mutation});
   if(window.fault&&(mutation||(!isGql&&url.includes('/__mock/workflows/')))){
    if(fault==='throw')throw Error('Synthetic transport failure');
    if(fault==='commitThrow'){await base(input,options);throw Error('Synthetic lost receipt');}
    if(fault==='zero')return new Response(JSON.stringify({data:{saved:{affectedCount:0,records:[]}}}));
    if(fault==='malformedErrors'){const data=await(await base(input,options)).json();return new Response(JSON.stringify({...data,errors:{unexpected:true}}));}
    if(fault==='html502')return new Response('<html>SECRET_CLOUDFLARE_BODY</html>',{status:502});
    if(fault==='html200')return new Response('<html>SECRET_CLOUDFLARE_BODY</html>');
   }return base(input,options);
  };
 });return {context,page};
}
const entry=text=>({id:crypto.randomUUID(),type:'text',text,createdAt:new Date().toISOString()});
try{
 {
 const {context,page}=await setup();
 const out=await page.evaluate(async({id,user,a,b})=>{const old=await store.loadOwnedIdea(id,user);window.fault='commitThrow';const saved=await store.saveIdeaAddition({id,userId:user,previousRaw:old.transcript,entry:a});window.fault=null;const again=await store.saveIdeaAddition({id,userId:user,previousRaw:old.transcript,entry:a});let conflict;try{await store.saveIdeaAddition({id,userId:user,previousRaw:old.transcript,entry:b})}catch(e){conflict=e.code}return {old,saved,parsed:ctx.readIdeaContext(saved.transcript),again:ctx.readIdeaContext(again.transcript),conflict,requests};},{id,user,a:entry('Neighbors confirm the pickup and return.'),b:entry('A second client has a different addition.')});
 assert.equal(out.parsed.originalRaw,out.old.transcript);assert.equal(out.parsed.additions.length,1);assert.equal(out.again.additions.length,1);assert.equal(out.saved.business_idea,out.old.business_idea);assert.equal(out.saved.prd_content,out.old.prd_content);assert.equal(out.conflict,'conflict');assert.equal(out.requests.filter(r=>r.mutation).length,1);assert.equal(out.requests.filter(r=>r.url.includes('workflows')).length,0);
 await page.reload({waitUntil:'networkidle'});await page.getByRole('link',{name:'Add to idea',exact:true}).click();await expect(page.locator('#idea-context')).toHaveAttribute('data-save-support','available');await expect(page.locator('.idea-context-entries')).toContainText('Neighbors confirm');record('Lossless addition/reload; lost receipt reconciles stable ID once; stale client cannot overwrite; no AI');await context.close();
 }
 {
 const {context,page}=await setup();
 const out=await page.evaluate(async({id,user,a})=>{const old=await store.loadOwnedIdea(id,user);const newer=await store.saveIdeaAddition({id,userId:user,previousRaw:old.transcript,entry:a});let conflict;try{await store.saveGeneratedReport(old,'# Stale report',user)}catch(e){conflict=e.code}const fresh=await store.saveGeneratedReport(newer,'# Fresh report\nAll saved words are used.',user);window.fault='malformedErrors';let malformed;try{await gql.compareAndSetIdea(fresh,{transcript:'new source'},user)}catch(e){malformed=e.code}return {conflict,malformed,fresh,combined:ctx.readIdeaContext(fresh.transcript).combined,requests};},{id,user,a:entry('Use the weekend return trial.')});
 assert.equal(out.conflict,'generation_conflict');assert.equal(out.malformed,'response');assert.match(out.combined,/weekend return/);assert.equal(out.fresh.business_idea,'# Fresh report\nAll saved words are used.');assert.equal(out.requests.filter(r=>r.url.includes('workflows')).length,0);record('Stale generation cannot overwrite source; save-only persistence has no AI; malformed errors cannot confirm mutation');await context.close();
 }
 {
 const data=structuredClone(preview);data.voice_notes[0].transcript='α'.repeat(51200);data.voice_notes[0].business_idea='# Existing report\n'+'r'.repeat(102400);
 const {context,page}=await setup(data);
 const out=await page.evaluate(async({id,user,a})=>{const old=await store.loadOwnedIdea(id,user);const saved=await store.saveIdeaAddition({id,userId:user,previousRaw:old.transcript,entry:a});const request=requests.find(r=>r.mutation);let budget;try{ctx.appendIdeaContext(saved.transcript,{...a,id:crypto.randomUUID(),text:'x'.repeat(65537)})}catch(e){budget=e.code}const originalChecks=[null,'Plain original',JSON.stringify({data:'Wrapped original'})].map(raw=>ctx.readIdeaContext(ctx.appendIdeaContext(raw,{...a,id:crypto.randomUUID()})).originalRaw===raw);return {bytes:ctx.utf8Bytes(ctx.readIdeaContext(saved.transcript).originalRaw),url:request.url,bodyBytes:ctx.utf8Bytes(JSON.stringify(request.body)),budget,originalChecks,future:ctx.readIdeaContext(JSON.stringify({goodidea_context:2})).supported};},{id,user,a:entry('A return window is required.')});
 assert.equal(out.bytes,102400);assert.equal(out.url,'/__mock/graphql');assert.ok(out.bodyBytes>400000);assert.equal(out.budget,'budget');assert.deepEqual(out.originalChecks,[true,true,true]);assert.equal(out.future,false);record('100 KB source plus 100 KB report uses complete body CAS; null/legacy bytes retained; budgets/future version fail closed');await context.close();
 }
 {
 const {context,page}=await setup();
 const out=await page.evaluate(async()=>{const messages=[];for(const mode of ['html502','html200','throw']){window.fault=mode;try{await gen.generationJson('/__mock/workflows/summarize',{method:'POST',body:JSON.stringify({text:'Saved input'})})}catch(e){messages.push(gen.generationMessage(e))}}window.fault=null;for(const value of [{idea:'<html>bad</html>'},{idea:42},null]){try{gen.generationText(value,['idea'])}catch(e){messages.push(e.message)}}return {messages,count:requests.filter(r=>r.url.includes('workflows')).length};});
 assert.equal(out.count,3);assert.equal(out.messages.length,6);out.messages.forEach(m=>assert.doesNotMatch(m,/SECRET_|<html>/));record('502 HTML/non-JSON/network/invalid content errors are bounded; one POST per explicit attempt');await context.close();
 }
 {
 const {context,page}=await setup(preview,390);await page.getByRole('link',{name:'Add to idea',exact:true}).click();await expect(page.locator('#idea-context')).toHaveAttribute('data-save-support','available');await page.getByLabel('New details').fill('Use a clear return window for the first pickup trial.');await page.locator('#idea-context').screenshot({path:resolve(evidence,'add-to-idea-390.png')});await page.getByRole('button',{name:'Save details',exact:true}).click();await expect(page.locator('#idea-context')).toContainText('Details saved.');await expect(page.getByLabel('New details')).toHaveValue('');await page.evaluate(()=>window.fault='html502');await page.getByRole('button',{name:'Regenerate',exact:true}).click();await expect(page.getByText(/temporarily unavailable \(502\)/).first()).toBeVisible();assert.doesNotMatch(await page.locator('body').innerText(),/SECRET_CLOUDFLARE_BODY/);await page.screenshot({path:resolve(evidence,'generation-safe-error-390.png'),fullPage:true});assert.equal(await page.evaluate(()=>requests.filter(r=>r.url.includes('workflows/summarize')).length),1);await page.getByRole('button',{name:'Close and continue',exact:true}).click();await expect(page.getByRole('button',{name:'Regenerate',exact:true})).toBeEnabled();record('Actual phone Add/Save independent of AI; safe dismissible 502 HUD with explicit retry control');await context.close();
 }
 assert.deepEqual(blocked,[]);assert.deepEqual(errors,[]);record('Zero external requests and browser exceptions');
}finally{writeFileSync(resolve(evidence,'checks.json'),JSON.stringify({checks,blocked,errors},null,2));await browser.close();await server.close();}
