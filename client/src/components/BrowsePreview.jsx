import { Link } from 'react-router-dom';
import { BookOpenIcon, DocumentCheckIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { savedText } from './NotePreview';
import { artifactSections } from './SavedArtifactPreview';

// Presentation only: never rewrite saved content or infer arbitrary envelope fields.
export function browseText(value, depth = 0) {
  if (depth > 5 || typeof value !== 'string' || value.length > 200000) return '';
  let text = value.trim();
  if (!text) return '';
  const fenced = text.match(/^```(?:json|text|markdown)?\s*\n([\s\S]*?)\n```$/i);
  if (fenced) text = fenced[1].trim();
  text = text.replace(/^(?:saved response|response|result)\s*:\s*(?=[{"\[])/i, '');
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') return browseText(parsed, depth + 1);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key of ['text', 'data', 'idea', 'transcript', 'business_idea', 'summary']) {
        const field = parsed[key];
        const candidate = typeof field === 'string' ? browseText(field, depth + 1) : field && typeof field === 'object' && !Array.isArray(field) ? browseText(JSON.stringify(field), depth + 1) : '';
        if (candidate) return candidate;
      }
      return '';
    }
    if (Array.isArray(parsed) || parsed === null || typeof parsed === 'boolean') return '';
  } catch { /* Ordinary saved prose is not JSON. Ambiguous envelopes are rejected below. */ }
  if (/^[{\[]|^["']?(?:text|data|idea|transcript|business_idea|summary)["']?\s*:/.test(text) || /^"/.test(text)) return '';
  return text.replace(/\\n/g, '\n').replace(/\\t/g, ' ');
}
export function plainBrowseText(value) {
  return browseText(value).replace(/```[\s\S]*?```/g, '').split('\n')
    .filter(line => !/^\s*(?:\||#{1,6}\s)/.test(line))
    .map(line => line.replace(/^\s*(?:>\s*)+/, '').replace(/^\s*(?:[-*]\s+|\d+(?:\.\d+)*[.)]?\s+)/, ''))
    .join(' ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '').replace(/^Elevator pitch\s*:\s*/i, '').replace(/\s+/g, ' ').trim();
}
export function browseExcerpt(value, limit = 150) {
  const text = plainBrowseText(value).replace(/(?:\.{3,}|…)(?:\s*(?:\.{3,}|…))*/g, '…').replace(/([.!?])\s*…$/, '$1');
  if (text.length <= limit) return text;
  const sentence = text.match(/^(.+?[.!?])(?:\s|$)/u)?.[1];
  if (sentence && sentence.length >= 30 && sentence.length <= limit + 35) return sentence;
  const end = text.lastIndexOf(' ', limit);
  const cut = text.slice(0, end > limit * .5 ? end : limit).trim();
  return /[.!?]$/.test(cut) ? cut : `${cut.replace(/[,:;.…]+$/, '')}…`;
}
function proseBlocks(value) {
  return browseText(value).replace(/```[\s\S]*?```/g, '').split(/\n\s*\n|\n(?=\s*(?:[-*]\s+|\d+[.)]\s+))/)
    .map(plainBrowseText).filter(Boolean);
}
export function browseSummary(note, limit = 150) {
  const explicit = plainBrowseText(note.summary);
  if (explicit && !/raw monologue capture/i.test(explicit)) return browseExcerpt(explicit, limit);
  const report = browseText(note.business_idea);
  const pitch = report.match(/\*{0,2}Elevator Pitch\*{0,2}\s*:\s*([^\n]+)/i)?.[1];
  const source = pitch || proseBlocks(report)[0] || browseText(note.transcript || note.transcription);
  return browseExcerpt(source, limit);
}
// Administrative document prose is availability, not a distinctive idea preview.
function documentInstruction(text) {
  const thought = text.replace(/^[^:]{1,24}:\s*/, '');
  const documentObject = /\b(?:document|report|specification|prd|notes?|observations?|wording|outline|plan|next step|constraints?|agreement|item)\b/i.test(thought);
  const instruction = /^(?:please\s+)?(?:open|read|review|view|see|consult|return|navigate|scroll|compare|confirm|record|retain|keep|understand)\b/i.test(thought);
  const description = /\b(?:document|report|specification|prd)\b[^.!?]*\b(?:describes?|outlines?|covers?|requirements?|implementation|presentation|details?)\b/i.test(thought);
  const processPreface = /^(?:begin|start|focus|think|consider)\b/i.test(thought) && /\b(?:situation|context|process|workflow|approach|scope)\b/i.test(thought);
  const documentLabel = /^(?:[\p{L}-]+\s+){0,4}(?:report|product specification|specification|prd)\.?$/iu.test(thought);
  return (instruction && documentObject) || description || processPreface || documentLabel;
}
const comparable = value => plainBrowseText(value).toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
export function browseArtifact(note) {
  const summary = comparable(browseSummary(note, 1000));
  const title = comparable(note.title);
  for (const [value, label, tab, Icon] of [[note.prd_content, 'Product spec', 'spec', DocumentCheckIcon], [note.business_idea, 'Report', 'report', BookOpenIcon]]) {
    const text = browseText(value);
    if (!text) continue;
    const sections = artifactSections(text);
    const meaningful = sections.filter(section => !/^(?:introduction|overview|about (?:this|the) document|document purpose)$/i.test(section.heading));
    const candidates = meaningful.flatMap(section => {
      const prose = proseBlocks(section.body);
      const rows = section.body.split('\n').filter(line => /^\s*\|/.test(line)).map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())).filter(row => !row.every(cell => /^[-: ]+$/.test(cell)));
      return [...prose, ...(rows.length > 1 && !/^(?:state|status|version|owner|revision|created(?: at| by| on)?|updated(?: at| by| on)?|section|type)$/i.test(rows[0][0]) ? [rows[1].filter(Boolean).slice(0, 2).join(': ')] : [])];
    });
    candidates.push(...proseBlocks(text));
    for (const candidate of candidates.flatMap(value => value.split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u))) {
      const clean = plainBrowseText(candidate), key = comparable(clean);
      if (clean.length < 20 || documentInstruction(clean) || !key || key === title || (summary && (summary.includes(key) || key.includes(summary)))) continue;
      return { label, tab, text: browseExcerpt(clean, 115), Icon };
    }
  }
  const specSaved = Boolean(savedText(note.prd_content).trim());
  const reportSaved = Boolean(savedText(note.business_idea).trim());
  return specSaved || reportSaved ? { label: specSaved ? 'Product spec' : 'Report', tab: specSaved ? 'spec' : 'report', text: 'Saved', availableOnly: true, Icon: specSaved ? DocumentCheckIcon : BookOpenIcon } : null;
}
export default function BrowseArtifactCue({ note, onOpen, userId, title }) {
  const artifact = browseArtifact(note);
  if (!artifact) return null;
  return <Link className="browse-artifact-cue" id={`open-${note.id}-artifact`} onClick={onOpen} state={{ libraryUserId: userId }} to={`/idea/${note.id}?artifact=${artifact.tab}`} aria-label={`Open ${artifact.label.toLowerCase()} for ${title}`}><artifact.Icon aria-hidden="true" /><span><span className="browse-artifact-kind">{artifact.label}</span><span className="browse-artifact-text">{artifact.text}</span></span><ChevronRightIcon aria-hidden="true" /></Link>;
}
