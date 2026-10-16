const renderPersona=()=>{
 if(!draft.persona)return;
 const p=draft.persona;
 lines.push('---','### Proposed starting customer',`> **${md(p.label)}**\n>\n> ${md(p.job)}\n>\n> _Working hypothesis—not a surveyed customer profile._`);
 lines.push([['Search trigger',p.trigger],['Current workaround',p.alternatives],['Unmet need',p.friction],['Adoption objection',p.objection],['Product implication',p.designImplication]].map(([k,v])=>`- **${k}:** ${md(v)}`).join('\n'));
};
const renderKeywords=()=>{
 if(!draft.keywords.length)return;
 lines.push('---','### What this customer might search','_Proposed US English keywords · Search volume unavailable; no measured keyword provider is connected. These are hypotheses, not observed queries or zero-volume results._');
 for(const [intent,label] of [['problem','Looking for help'],['solution','Looking for a solution'],['alternative','Comparing alternatives']]){
  const rows=draft.keywords.filter(k=>k.intent===intent);
  if(rows.length)lines.push(`**${label}**`,rows.map(k=>`- **“${md(k.query)}”** — ${md(k.reason)}`).join('\n'));
 }
};
const renderMetrics=()=>{
 for(const m of draft.metrics){
  lines.push(`> **${md(m.valueText)} · ${md(m.label)}**\n>\n> ${md(m.scope)} · ${md(m.period)} ${md('['+m.sourceId+']')}\n>\n> **What it cannot tell us:** ${md(m.limit)}`);
 }
 if(!draft.metrics.length&&draft.dataGap)lines.push('> **Evidence gap:** '+md(draft.dataGap));
};
