function validateExtras(d,sources,sourceWords,kind){
 const e=[],text=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
 const substantive=sourceWords>=25&&kind==='idea';
 if(!Array.isArray(d.figures)||d.figures.length)e.push('Images are disabled');
 if(substantive&&(!d.persona||!['label','job','trigger','alternatives','friction','objection','designImplication'].every(k=>text(d.persona[k],650))))e.push('Missing useful proposed persona');
 if(d.persona!==null&&d.persona!==undefined&&!['label','job','trigger','alternatives','friction','objection','designImplication'].every(k=>text(d.persona[k],650)))e.push('Invalid persona');
 if(!Array.isArray(d.keywords)||d.keywords.length>8||(substantive&&d.keywords.length<6))e.push('Invalid keyword coverage');
 else {
  if(new Set(d.keywords.map(k=>String(k.query).trim().toLowerCase())).size!==d.keywords.length)e.push('Duplicate keywords');
  for(const k of d.keywords)if(!text(k.query,100)||!text(k.reason,360)||!['problem','solution','alternative'].includes(k.intent)||Object.keys(k).some(x=>!['query','intent','reason'].includes(x)))e.push('Invalid or unmeasured keyword metrics');
  if(substantive&&!['problem','solution','alternative'].every(i=>d.keywords.some(k=>k.intent===i)))e.push('Missing search intent');
 }
 const now=new Date(),cutoff=new Date(now);cutoff.setUTCFullYear(cutoff.getUTCFullYear()-2);
 const recent=s=>s?.recency==='recent'&&s.publishedDate>=cutoff.toISOString().slice(0,10)&&s.publishedDate<=now.toISOString().slice(0,10);
 const usable=sources.filter(s=>s.readStatus==='page'&&recent(s));
 if(substantive&&usable.length>=6&&(d.research?.length??0)<3)e.push('Research underused: develop the argument using at least three relevant supplied read sources, including counterevidence; do not pad with unrelated pages');
 for(const r of d.research??[]){const s=sources.find(x=>x.id===r.sourceId);if(!recent(s))e.push('Source outside current evidence window');if(!['trend','product','context'].includes(r.role))e.push('Missing source role');if(r.role==='trend'&&s?.dateBasis!=='page_publication')e.push('Trend publication date unverified');}
 if(!Array.isArray(d.metrics)||d.metrics.length>3)e.push('Invalid metrics');
 else for(const m of d.metrics){
  const s=sources.find(s=>s.id===m.sourceId),p=s?.passages?.find(p=>p.id===m.passageId);
  if(!['valueText','label','scope','period','limit'].every(k=>text(m[k],500))||!/^[$€£]?\d[\d,.]*(?:\s?(?:%|percent|million|billion|thousand))?$/i.test(m.valueText??'')||!p||!p.text.includes(m.valueText)||!recent(s)||s.dateBasis!=='page_publication'||!Array.isArray(m.contextPassageIds)||m.contextPassageIds.length>4||!m.contextPassageIds.every(id=>s.passages.some(p=>p.id===id))||!d.research.some(r=>r.sourceId===m.sourceId))e.push('Unverified current metric');
  const years=String(m.period).match(/\b20\d{2}\b/g)??[];
  if(/project(?:ion|ed|s)|forecast|predict|expected|by the end of/i.test([m.label,m.period,m.limit].join(' ')))e.push('Metric must be an observed measurement, not a projection');
  if(!years.some(y=>+y>=cutoff.getUTCFullYear()&&+y<=now.getUTCFullYear()))e.push('Old or undated measurement');
 }
 return [...new Set(e)];
}
