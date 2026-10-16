const context=$('Build Review Request').first().json;
const raw=$json.body??$json,choice=raw.choices?.[0];
const fail=(code,message)=>[{json:{saveReport:false,statusCode:502,response:{text:'',error:{code,message},requestId:context.requestId}}}];
if($json.error||raw.error||!choice?.message?.content||choice.finish_reason==='length')return fail('REVIEW_FAILED','The idea could not finish its source check. Your original recording is unchanged; please try again.');
let review;
try{review=JSON.parse(choice.message.content.replace(/^```(?:json)?\s*|\s*```$/g,''));}catch{return fail('INVALID_REVIEW','The final source check could not be read. Please try again.');}
if(!review||!['accept','revise'].includes(review.action)||!Array.isArray(review.issues)||review.issues.length>20||!review.issues.every(x=>typeof x==='string'))return fail('REVIEW_REJECTED','The draft did not pass its source check. Please try again.');
if(review.action==='accept'&&(review.issues.length||review.draft||(review.patches?.length??0)>0))return fail('INVALID_REVIEW','The reviewer left unresolved issues or corrections. Please try again.');
let draft=context.draft;
if(review.action==='revise'){
 if(review.draft&&(!review.patches||review.patches.length===0))draft=review.draft;
 else if(!review.draft&&draft&&Array.isArray(review.patches)&&review.patches.length>0&&review.patches.length<=12){
  draft=JSON.parse(JSON.stringify(draft));
  const edited=new Set();
  for(const patch of review.patches){
   const key=patch.field+':'+(patch.index??'');
   if(edited.has(key))return fail('INVALID_REVISION','The editor returned conflicting corrections. Please try again.');edited.add(key);
   if(patch.field==='summary'||patch.field==='title'||patch.field==='dataGap')draft[patch.field]=patch.value;
   else if(patch.field==='research')draft.research=patch.value;
   else if(patch.field==='figures')draft.figures=patch.value;
   else if(patch.field==='section'&&Array.isArray(draft.sections)&&Number.isInteger(patch.index)&&patch.index>=0&&patch.index<draft.sections.length)draft.sections[patch.index]=patch.value;
   else return fail('INVALID_REVISION','The editor returned an invalid correction. Please try again.');
  }
 }else return fail('INVALID_REVISION','The editor did not supply a usable corrected idea. Please try again.');
}
draft=normalizeDraft(draft,context.research.sources);
const sources=context.research.sources;
const validationErrors=validateDraft(draft,sources,context.text.split(/\s+/).length,context.kind);
if(validationErrors.length)return fail('INVALID_REPORT','The organized idea failed its final structure or source checks. Please try again.');
draft={...draft,research:draft.research.filter((x,i,a)=>a.findIndex(y=>y.sourceId===x.sourceId)===i).map(x=>{const s=sources.find(s=>s.id===x.sourceId);return {...x,quote:s.passages.find(p=>p.id===x.passageId).text,quotes:[...new Set([x.passageId,...(x.supportingPassageIds??[])])].map(id=>s.passages.find(p=>p.id===id).text)};})};
const plain=s=>String(s).replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim();
const safeUrl=s=>String(s).replace(/[()\[\]<>\s]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
const md=s=>plain(s).replace(/\]\s*\[S(?=\d+\])/g,'] [S').replace(/[\\`*_{}\[\]<>#|]/g,'\\$&').replace(/\\\[(S\d+)\\\]/g,(_,id)=>{const i=draft.research.findIndex(r=>r.sourceId===id);return `[${i+1}](${safeUrl(sources.find(s=>s.id===id).url)})`;});
const generatedAt=new Date().toISOString();
const artifactId=sha256(context.sourceHash+':'+context.requestId+':'+generatedAt);
draft.figures=draft.figures.map(f=>({...f,svg:renderFigure(f,sources.find(s=>s.id===f.sourceId)?.title??'')}));
const figureLines=(f,i)=>{const alt=f.type==='bar'?f.title+'. '+f.points.map(p=>p.label+': '+p.value+' '+f.unit).join('; '):'Proposed experience: '+f.steps.map(s=>s.label).join(' → ');return `![${md(alt)}](https://n8n.why57.com/webhook/idea-figure?id=${artifactId}&figure=${i})\n\n_${f.type==='bar'?'Reported data':'Proposed design'} · ${md(f.caption)}_`;};
const lines=[`# ${md(draft.title)}`,md(draft.summary)];
for(const [sectionIndex,s] of draft.sections.entries()){
 lines.push('### '+md(s.heading));
 for(const p of s.paragraphs)lines.push(md(p));
 if(s.items.length)lines.push(s.items.map((x,i)=>(s.ordered?(i+1)+'. ':'- ')+md(x)).join('\n'));
 for(const [i,f] of draft.figures.entries())if(f.sectionIndex===sectionIndex)lines.push(figureLines(f,i));
 if(sectionIndex===0&&draft.dataGap&&!draft.figures.some(f=>f.type==='bar'))lines.push('_Evidence gap: '+md(draft.dataGap)+'_');
}
const facts=context.facts??{},calculations=context.calculations??[];
if(calculations.length){
 lines.push(context.language==='ru'?'### Расчёты по вашим данным':'### Calculations from your supplied figures');
 const symbols=[...new Set(Object.entries(facts).filter(([k])=>k!=='units').flatMap(([,x])=>x.quote.match(/[$€£]/g)||[]))],symbol=symbols.length===1?symbols[0]:'';
 lines.push(calculations.filter(x=>!x.label.startsWith('Variable costs')&&!x.label.startsWith('Contribution per unit')).map(x=>`- ${md(x.label)}: **${x.label.startsWith('Whole units')?'':symbol}${Number(x.value).toLocaleString('en-US',{maximumFractionDigits:2})}**`).join('\n'));
 lines.push(context.language==='ru'?'_Расчёты используют указанные вами данные; прочие расходы не учтены._':'_Calculated from your supplied inputs. Contribution excludes other costs and is not profit._');
}
for(const [i,r] of draft.research.entries()){
 const s=sources.find(s=>s.id===r.sourceId);
 if(i===0)lines.push('### '+md(draft.researchHeading));
 lines.push(`**[${i+1}. ${md(r.name)}](${safeUrl(s.url)})**\n\n${md(r.implication)}`);
}
const used=[...new Set(draft.research.map(x=>x.sourceId))];
const cost=u=>typeof u?.cost==='number'?u.cost:null;
const costs=[context.plannerUsage,context.writerUsage,raw.usage,...(context.research.selectionCalls?[context.research.selectionUsage]:[])].map(cost);
const modelCost=costs.every(c=>c!==null)?costs.reduce((a,b)=>a+b,0):null;
const response={text:lines.join('\n\n'),report:{...draft,inputs:facts,calculations,sources:used.map(id=>sources.find(s=>s.id===id)),researchStatus:context.research.status},meta:{version:'quality-v9.0',generationId:context.requestId,model:context.request.model,reviewModel:context.reviewRequest.model,cache:'bypassed_for_regeneration',researchCache:context.research.cache,researchStatus:context.research.status,citedSourceCount:used.length,figureCount:draft.figures.length,dataChartCount:draft.figures.filter(f=>f.type==='bar').length,artifactId,modelCalls:3+(context.research.selectionCalls??0),searchCalls:context.research.searchCalls??0,pageFetchCalls:context.research.pageFetchCalls??0,pagesRead:sources.filter(s=>s.readStatus==='page').length,modelCostUsd:modelCost,searchCostEstimateUsd:(context.research.searchCalls??0)*0.005,generatedAt,durationMs:Date.now()-context.startedAt,reviewAction:review.action,reviewIssues:review.issues,extractedDetailCount:context.details.length,usage:{planner:context.plannerUsage,writer:context.writerUsage,reviewer:raw.usage??{},selection:context.research.selectionUsage??{}}}};
const history={generationId:context.requestId,sourceHash:context.sourceHash,mode:context.mode,transcript:context.originalTranscript??context.text,extractedDetails:context.details,uncertainties:context.uncertainties,review:{action:review.action,issues:review.issues},response};
return [{json:{saveReport:true,statusCode:200,response,cacheKey:'generation-quality-v9:'+artifactId,payload:JSON.stringify(history),expiresAt:9007199254740991}}];
