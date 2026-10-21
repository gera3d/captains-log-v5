import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon, BookOpenIcon, DocumentCheckIcon, ChevronRightIcon, MicrophoneIcon } from '@heroicons/react/16/solid';
import { savedText, formatDuration } from './NotePreview';
import { extractTitle, extractSummary } from '../utils/extractTitle';
import IdeaIdentity from './IdeaIdentity';
import './ActiveIdeas.css';

const archived = note => note.archived === true || note.archived === 'true' || note.status === 'archived';
const featured = note => note.is_featured === true || note.is_featured === 'true';
const excerpt = text => {
  if (text.length <= 300) return text;
  const end = text.slice(0, 290).lastIndexOf(' ');
  return `${text.slice(0, end > 220 ? end : 290)}…`;
};
function savedPreview(note) {
  const report = savedText(note.business_idea).trim();
  const original = savedText(note.transcript || note.transcription).trim();
  if (!report) return { label: 'Original capture', text: excerpt(original || (typeof note.summary === 'string' ? note.summary.trim() : '')), report: false };
  const pitch = report.match(/\*\*Elevator Pitch:\*\*\s*([^\n]+)/i)?.[1] || report.match(/\*{0,2}Elevator Pitch\*{0,2}\s*:\s*([^\n]+)/i)?.[1];
  if (pitch) return { label: 'From the report', text: excerpt(pitch.trim()), report: true };
  const summary = extractSummary({ ...note, business_idea: report, transcript: original });
  return { label: 'From the report', text: excerpt(summary), report: true };
}
function documentSection(note, summary) {
  const report = savedText(note.business_idea).trim();
  const comparable = text => text.replace(/[*_#>]/g, '').replace(/elevator pitch\s*:/ig, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const headings = [...report.matchAll(/^#{1,6}\s+(.+)$/gm)];
  for (let index = 0; index < headings.length; index++) {
    const match = headings[index];
    if (!match[0].startsWith('##') || /sources|limits|keywords|might search/i.test(match[1])) continue;
    const body = report.slice(match.index + match[0].length, headings[index + 1]?.index ?? report.length).trim();
    const blocks = body.split(/\n\s*\n/).filter(block => block.trim() && !/^\s*\|/m.test(block));
    const block = blocks.find(value => comparable(value) !== comparable(summary));
    if (!block) continue;
    const bullets = block.split(/\n(?=\s*[-*]\s)/).filter(Boolean);
    let text = bullets.slice(0, 1).join('\n').trim();
    if (text.split(/\s+/).length > 80) {
      const sentence = text.match(/^[\s\S]{1,450}?[.!?](?=\s|$)/)?.[0];
      text = sentence || excerpt(text);
    }
    if (!text || comparable(text) === comparable(summary)) continue;
    return { heading: match[1].replace(/[*_]/g, '').trim(), text };
  }
  return null;
}
const Reading = ({ children }) => <ReactMarkdown allowedElements={['p','strong','em','ul','ol','li','blockquote']} unwrapDisallowed>{children}</ReactMarkdown>;
function Availability({ note }) {
  const report = Boolean(savedText(note.business_idea).trim());
  const original = Boolean(savedText(note.transcript || note.transcription).trim());
  return <div className="active-idea-availability">{report && <span><BookOpenIcon aria-hidden="true" />Report</span>}{note.prd_content?.trim() && <span><DocumentCheckIcon aria-hidden="true" />Product spec</span>}{original && <span><DocumentTextIcon aria-hidden="true" />Original note</span>}{note.audio_url && <span><MicrophoneIcon aria-hidden="true" />Recording</span>}</div>;
}
export default function ActiveIdeas({ notes, userId, loading, error, onChoose, onViewAll, onRetry }) {
  const selected = notes.filter(note => note.user_id === userId && featured(note) && !archived(note));
  const visible = selected.slice(0, 3);
  return <section className="active-ideas" aria-labelledby="active-ideas-title">
    <div className="original-section-heading"><h2 id="active-ideas-title">Active ideas</h2><button onClick={onChoose}>{selected.length ? 'Manage pins' : 'Choose ideas'}<ChevronRightIcon aria-hidden="true" /></button></div>
    {loading ? <div className="active-ideas-state" role="status">Loading active ideas…</div> : error ? <div className="active-ideas-state"><h3>Active ideas couldn’t be loaded</h3><p>Retry to see your saved selection.</p><button onClick={onRetry}>Retry loading</button></div> : visible.length ? <>
      <div className="active-idea-gallery">{visible.map((note, index) => {
        const lead = index === 0;
        const preview = savedPreview(note);
        const summary = extractSummary({ ...note, business_idea: savedText(note.business_idea), transcript: savedText(note.transcript || note.transcription) }) || preview.text;
        const section = lead && preview.report ? documentSection(note, preview.text) : null;
        return <Link className={`active-idea-card ${lead ? 'is-lead' : 'is-support'} ${preview.report ? 'is-developed' : 'is-capture'}`} key={note.id} to={`/idea/${note.id}`} aria-label={`Open active idea ${extractTitle(note)}`}>
          <IdeaIdentity developed={preview.report} pinned={featured(note)} voice={Boolean(note.audio_url || formatDuration(note.duration))} />
          {lead ? <>
            <h3 className="active-lead-title">{extractTitle(note)}</h3>
            {preview.report ? (section || preview.text) && <div className={`active-lead-body ${section ? 'has-document' : 'single-document'}`}>
              {section && preview.text && <div className="active-lead-summary"><Reading>{preview.text}</Reading></div>}
              <div className="active-report-pane">{section && <h4>{section.heading}</h4>}<Reading>{section?.text || preview.text}</Reading></div>
            </div> : preview.text && <div className="active-capture-original"><Reading>{preview.text}</Reading></div>}
            <div className="active-idea-footer"><Availability note={note} /><span className="active-idea-open">Open idea<ChevronRightIcon aria-hidden="true" /></span></div>
          </> : <div className="active-support-body"><h3>{extractTitle(note)}</h3><div><p className="active-idea-summary">{excerpt(summary)}</p><Availability note={note} /></div><ChevronRightIcon className="active-support-arrow" aria-hidden="true" /></div>}
        </Link>;
      })}</div>
      {selected.length > 3 && <button className="active-ideas-view-all" onClick={onViewAll}>View all {selected.length} active ideas<ChevronRightIcon aria-hidden="true" /></button>}
    </> : <div className="active-ideas-state"><BookmarkIcon aria-hidden="true" /><h3>Keep the ideas you want to return to</h3><p>Use Pin in your library to keep an idea here. A rough capture can be an active idea too.</p><button onClick={onChoose}>Choose from your library</button></div>}
  </section>;
}
