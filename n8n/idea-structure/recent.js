function evidenceWindow(now=new Date()){
 const end=new Date(now),start=new Date(now);start.setUTCFullYear(start.getUTCFullYear()-2);
 return {currentDate:end.toISOString().slice(0,10),evidenceCutoff:start.toISOString().slice(0,10)};
}
function publicationEvidence(body,indexDate,now=new Date()){
 const candidates=[];
 const push=x=>{const d=new Date(x);if(!Number.isNaN(d.getTime()))candidates.push(d.toISOString().slice(0,10));};
 // Publication metadata only: last-modified and copyright dates are not publication.
 for(const m of String(body).matchAll(/"datePublished"\s*:\s*"([^"]+)"/gi))push(m[1]);
 for(const m of String(body).matchAll(/<meta\b[^>]*>/gi)){
  const attrs={};for(const a of m[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g))attrs[a[1].toLowerCase()]=a[2];
  if(/^(?:article:published_time|datePublished|date|pubdate|publishdate|dc.date.issued|citation_publication_date)$/i.test(attrs.property??attrs.name??attrs.itemprop??''))push(attrs.content);
 }
 for(const m of String(body).matchAll(/<time\b[^>]*itemprop=["']datePublished["'][^>]*datetime=["']([^"']+)["']/gi))push(m[1]);
 const indexed=new Date(indexDate??'');
 const date=candidates.sort()[0]??(!Number.isNaN(indexed.getTime())?indexed.toISOString().slice(0,10):null);
 const dateBasis=candidates.length?'page_publication':date?'search_index':'unknown';
 const {evidenceCutoff,currentDate}=evidenceWindow(now);
 return {publishedDate:date,dateBasis,recency:date&&date>=evidenceCutoff&&date<=currentDate?'recent':date?'outside_window':'unknown'};
}
