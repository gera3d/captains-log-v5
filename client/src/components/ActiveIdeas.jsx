import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { StarIcon, LightBulbIcon, DocumentTextIcon, BookOpenIcon, DocumentCheckIcon, ChevronRightIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { savedText } from './NotePreview';
import { extractTitle, extractSummary } from '../utils/extractTitle';
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
  if (!report) return { label: 'Original note', text: excerpt(original), report: false };
  const pitch = report.match(/\*\*Elevator Pitch:\*\*\s*([^\n]+)/i)?.[1] || report.match(/\*{0,2}Elevator Pitch\*{0,2}\s*:\s*([^\n]+)/i)?.[1];
  if (pitch) return { label: 'From the report', text: excerpt(pitch.trim()), report: true };
  const summary = extractSummary({ ...note, business_idea: report, transcript: original });
  return { label: 'From the report', text: excerpt(summary), report: true };
}
function keywords(note) {
  const report = savedText(note.business_idea);
  const section = report.match(/#{2,3}\s+.*What this customer might search[^\n]*\n([\s\S]*?)(?=\n#{1,3}\s|$)/i)?.[1] || '';
  return [...section.matchAll(/^-\s+\*\*([^*\n]+)\*\*/gm)].slice(0, 3).map(match => match[1]);
}
function Availability({ note }) {
  const report = Boolean(savedText(note.business_idea).trim());
  const original = Boolean(savedText(note.transcript || note.transcription).trim());
  return <div className="active-idea-availability">{report && <span><BookOpenIcon aria-hidden="true" />Report</span>}{note.prd_content?.trim() && <span><DocumentCheckIcon aria-hidden="true" />Product spec</span>}{original && <span><DocumentTextIcon aria-hidden="true" />Original note</span>}{note.audio_url && <span><MicrophoneIcon aria-hidden="true" />Recording</span>}</div>;
}
export default function ActiveIdeas({ notes, userId, loading, error, onChoose, onViewAll, onRetry }) {
  const selected = notes.filter(note => note.user_id === userId && featured(note) && !archived(note));
  const visible = selected.slice(0, 3);
  return <section className="active-ideas" aria-labelledby="active-ideas-title">
    <div className="original-section-heading"><h2 id="active-ideas-title">Active ideas</h2><button onClick={onChoose}>{selected.length ? 'Manage ideas' : 'Choose ideas'}<ChevronRightIcon aria-hidden="true" /></button></div>
    {loading ? <div className="active-ideas-state" role="status">Loading active ideas…</div> : error ? <div className="active-ideas-state"><h3>Active ideas couldn’t be loaded</h3><p>Retry to see your saved selection.</p><button onClick={onRetry}>Retry loading</button></div> : visible.length ? <>
      <div className="active-idea-gallery">{visible.map((note, index) => {
        const lead = index === 0;
        const preview = savedPreview(note);
        const summary = extractSummary({ ...note, business_idea: savedText(note.business_idea), transcript: savedText(note.transcript || note.transcription) }) || preview.text;
        const terms = keywords(note);
        return <Link className={`active-idea-card ${lead ? 'is-lead' : 'is-support'}`} key={note.id} to={`/idea/${note.id}`} aria-label={`Open active idea ${extractTitle(note)}`}>
          <div className="active-idea-heading"><LightBulbIcon aria-hidden="true" /><h3>{extractTitle(note)}</h3>{!lead && <ChevronRightIcon className="active-idea-arrow" aria-hidden="true" />}</div>
          {!lead && summary && <p className="active-idea-summary">{summary}</p>}
          {lead && preview.text && <div className="active-idea-reading"><span>{preview.label}</span><ReactMarkdown allowedElements={['p','strong','em','ul','ol','li','blockquote']} unwrapDisallowed>{preview.text}</ReactMarkdown></div>}
          <Availability note={note} />
          {lead && terms.length > 0 && <p className="active-idea-keywords"><span className="sr-only">Saved search terms: </span>{terms.join(' · ')}</p>}
          {lead && <span className="active-idea-open">Open idea<ChevronRightIcon aria-hidden="true" /></span>}
        </Link>;
      })}</div>
      {selected.length > 3 && <button className="active-ideas-view-all" onClick={onViewAll}>View all {selected.length} active ideas<ChevronRightIcon aria-hidden="true" /></button>}
    </> : <div className="active-ideas-state"><StarIcon aria-hidden="true" /><h3>Keep the ideas you want to return to</h3><p>Use Feature on any note in your library to bring it here. A rough capture can be an active idea too.</p><button onClick={onChoose}>Choose from your library</button></div>}
  </section>;
}
