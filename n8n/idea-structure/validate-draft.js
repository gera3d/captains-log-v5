function normalizeDraft(d,sources=[]){
 if(!d||typeof d!=='object'||!Array.isArray(d.sections))return d;
 // Some models number their source list S1..Sn while retaining canonical passage IDs.
 // Repair only a complete, unique, verifiable one-to-one alias map; never guess evidence.
 if(Array.isArray(d.research)&&d.research.length&&d.research.every((r,i)=>r?.sourceId==='S'+(i+1))){
  const aliases=new Map(),targets=new Set();let verified=true;
  for(const r of d.research){
   const target=String(r.passageId??'').match(/^(S\d+)\.P\d+$/)?.[1];
   const source=sources.find(s=>s.id===target);
   const extra=r.supportingPassageIds??[];
   if(!target||targets.has(target)||source?.readStatus!=='page'||!Array.isArray(extra)||![r.passageId,...extra].every(id=>source.passages?.some(p=>p.id===id))){verified=false;break;}
   aliases.set(r.sourceId,target);targets.add(target);
  }
  if(verified&&[...aliases].some(([a,b])=>a!==b)){
   const remap=x=>typeof x==='string'?x.replace(/\[(S\d+)\]/g,(m,id)=>aliases.has(id)?'['+aliases.get(id)+']':m):Array.isArray(x)?x.map(remap):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,remap(v)])):x;
   d=remap(d);d.research=d.research.map(r=>({...r,sourceId:aliases.get(r.sourceId)}));d.figures=d.figures?.map(f=>({...f,...(f.sourceId?{sourceId:aliases.get(f.sourceId)??f.sourceId}:{})}));
  }
 }
 return {...d,sections:d.sections.map(s=>s&&typeof s==='object'?{kind:/^blue team\b/i.test(s.heading??'')?'blue_team':/^red team\b/i.test(s.heading??'')?'red_team':'development',paragraphs:[],items:[],ordered:false,...s}:s)};
}
function validateDraft(d,sources,sourceWords,kind='idea'){
 const errors=[];
 const text=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
 if(!d||typeof d!=='object'||!text(d.title,160)||!text(d.summary,1800))return ['Missing title or summary'];
 if(!Array.isArray(d.sections)||d.sections.length>8)return ['Invalid sections'];
 for(const s of d.sections){
  if(!['development','blue_team','red_team','synthesis'].includes(s?.kind)||!text(s?.heading,140)||!Array.isArray(s.paragraphs)||s.paragraphs.length>3||!s.paragraphs.every(x=>text(x,3200))||!Array.isArray(s.items)||s.items.length>10||!s.items.every(x=>text(x,1400))||typeof s.ordered!=='boolean'||s.paragraphs.length+s.items.length===0)errors.push('Invalid section content');
 }
 if(sourceWords>=25&&!['recording_test','unclear'].includes(kind)){
  for(const team of ['blue_team','red_team','synthesis']){
   const matching=d.sections.filter(s=>s?.kind===team);
   if(matching.length!==1)errors.push('Missing or duplicate '+team);
   else if(team!=='synthesis'&&(matching[0].paragraphs?.length??0)+(matching[0].items?.length??0)<2)errors.push('Insufficient '+team+' arguments');
  }
  if(d.sections.at(-1)?.kind!=='synthesis')errors.push('Synthesis must follow both teams');
 }
 if(errors.length)return [...new Set(errors)];
 if(!Array.isArray(d.research)||d.research.length>10)return ['Invalid research list'];
 else for(const r of d.research){
  const source=sources.find(s=>s.id===r.sourceId);
  const ids=[r.passageId,...(Array.isArray(r.supportingPassageIds)?r.supportingPassageIds:[])];
  if(r.supportingPassageIds!==undefined&&(!Array.isArray(r.supportingPassageIds)||r.supportingPassageIds.length>3))errors.push('Invalid supporting passages');
  if(!text(r.name,160)||!text(r.implication,900)||source?.readStatus!=='page'||ids.some(id=>{const passage=source?.passages?.find(p=>p.id===id);return !passage||!String(source.excerpt).replace(/\s+/g,' ').includes(String(passage.text).replace(/\s+/g,' '));}))errors.push('Unverified source passage');
 }
 if(d.research?.length&&!text(d.researchHeading,140))errors.push('Missing research heading');
 const prose=JSON.stringify(d);
 if(/https?:\/\/|www\.|<\/?[a-z][^>]*>/i.test(prose))errors.push('Unsupported links or markup');
 const citedIds=new Set([...prose.matchAll(/\[(S\d+)\]/g)].map(m=>m[1]));
 for(const id of citedIds)if(!d.research?.some(r=>r.sourceId===id))errors.push('Unknown inline source');
 const argumentText=JSON.stringify({summary:d.summary,sections:d.sections,figures:d.figures});
 for(const r of d.research??[])if(!argumentText.includes('['+r.sourceId+']'))errors.push('Source not used in argument');
 if(prose.length>42000)errors.push('Draft exceeds size budget');
 const words=[d.title,d.summary,...d.sections.flatMap(s=>[s.heading,...(s.paragraphs||[]),...(s.items||[])])].join(' ').trim().split(/\s+/).length;
 if(sourceWords<25&&words>220)errors.push('Sparse recording expanded beyond 220 words');
 errors.push(...validateFigures(d,sources,sourceWords,kind));
 return [...new Set(errors)];
}
