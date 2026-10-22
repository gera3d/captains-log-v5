import { Link } from 'react-router-dom';
import { BookOpenIcon, DocumentCheckIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { savedText } from './NotePreview';
import { artifactSections } from './SavedArtifactPreview';
import { extractSummary } from '../utils/extractTitle';

// Browse-only text. The complete saved Markdown remains in the existing readers.
export function plainBrowseText(value) {
  return savedText(value).split('\n').filter(line => !/^\s*\|/.test(line)).map(line => line.replace(/^\s*(?:[-*]\s+|\d+[.)]\s+)/, '')).join(' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(?:^|\s)[#>]+\s*/g, ' ').replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ').trim();
}
export function browseExcerpt(value, limit = 155) {
  const text = plainBrowseText(value);
  if (text.length <= limit) return text;
  const end = text.lastIndexOf(' ', limit);
  return `${text.slice(0, end > limit * .7 ? end : limit).trim()}…`;
}
export function browseSummary(note, limit = 105) {
  return browseExcerpt(extractSummary({ ...note, business_idea: savedText(note.business_idea), transcript: savedText(note.transcript || note.transcription) }), limit);
}
export function browseArtifact(note) {
  const spec = savedText(note.prd_content).trim();
  const report = savedText(note.business_idea).trim();
  const value = spec || report;
  if (!value) return null;
  const sections = artifactSections(value);
  let cue = '';
  for (const section of sections) {
    const firstLine = section.body.split('\n').find(line => line.trim() && !/^\s*[#|]/.test(line));
    cue = plainBrowseText(firstLine || '');
    if (cue) break;
    const rows = section.body.split('\n').filter(line => /^\s*\|/.test(line)).map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())).filter(row => !row.every(cell => /^[-: ]+$/.test(cell)));
    if (rows.length > 1) { cue = rows[1].filter(Boolean).slice(0, 2).join(': '); break; }
  }
  cue ||= plainBrowseText(value.replace(/^#{1,6}\s+.+$/gm, ''));
  if (!cue) return null;
  const sentence = cue.match(/^(.{25,}?[.!?])(?:\s|$)/)?.[1];
  return { label: spec ? 'Product spec' : 'Report', tab: spec ? 'spec' : 'report', text: browseExcerpt(sentence || cue, 75), Icon: spec ? DocumentCheckIcon : BookOpenIcon };
}
export default function BrowseArtifactCue({ note, onOpen, userId, title }) {
  const artifact = browseArtifact(note);
  if (!artifact) return null;
  return <Link className="browse-artifact-cue" id={`open-${note.id}-artifact`} onClick={onOpen} state={{ libraryUserId: userId }} to={`/idea/${note.id}?artifact=${artifact.tab}`} aria-label={`Open ${artifact.label.toLowerCase()} for ${title}`}><artifact.Icon aria-hidden="true" /><span><span className="browse-artifact-kind">{artifact.label}</span><span className="browse-artifact-text">{artifact.text}</span></span><ChevronRightIcon aria-hidden="true" /></Link>;
}
