import { Link } from 'react-router-dom';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon, BookOpenIcon, DocumentCheckIcon, ChevronRightIcon, MicrophoneIcon } from '@heroicons/react/16/solid';
import { savedText, formatDuration } from './NotePreview';
import { extractTitle, extractSummary } from '../utils/extractTitle';
import IdeaIdentity from './IdeaIdentity';
import { browseSummary, browseArtifact, browseExcerpt } from './BrowsePreview';
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
  const summary = extractSummary({ business_idea: report });
  return { label: 'From the report', text: excerpt(summary), report: true };
}
export default function ActiveIdeas({ notes, userId, loading, error, onChoose, onViewAll, onRetry, onOpen, libraryUserId }) {
  const selected = notes.filter(note => note.user_id === userId && featured(note) && !archived(note));
  const visible = selected.slice(0, 3);
  return <section className="active-ideas" aria-labelledby="active-ideas-title">
    <div className="original-section-heading"><h2 id="active-ideas-title">Active ideas{' '}{!loading && !error && selected.length > 0 && <span className="active-pinned-count">{selected.length} pinned</span>}</h2><button onClick={onChoose}>{selected.length ? 'Manage pins' : 'Choose ideas'}<ChevronRightIcon aria-hidden="true" /></button></div>
    {loading ? <div className="active-ideas-state" role="status">Loading active ideas…</div> : error ? <div className="active-ideas-state"><h3>Active ideas couldn’t be loaded</h3><p>Retry to see your saved selection.</p><button onClick={onRetry}>Retry loading</button></div> : visible.length ? <>
      <div className="active-idea-gallery">{visible.map((note, index) => {
        const lead = index === 0;
        const preview = savedPreview(note);
        const summary = browseSummary(note, lead ? 150 : 105) || browseExcerpt(preview.text, lead ? 150 : 105);
        const artifact = browseArtifact(note);
        return <div className="active-idea-entry" key={note.id}><Link id={`active-${note.id}`} onClick={onOpen} state={{ libraryUserId }} className={`active-idea-card ${lead ? 'is-lead' : 'is-support'} ${preview.report ? 'is-developed' : 'is-capture'}`} key={note.id} to={`/idea/${note.id}`} aria-label={`Open active idea ${extractTitle(note)}`}>
          <IdeaIdentity developed={preview.report} pinned={featured(note)} voice={Boolean(note.audio_url || formatDuration(note.duration))} />
          {lead ? <>
            <h3 className="active-lead-title">{extractTitle(note)}</h3>
            {summary && <p className={preview.report ? 'active-lead-summary' : 'active-capture-original'}>{summary}</p>}
            {artifact && <div className="active-saved-cue"><artifact.Icon aria-hidden="true" /><span>{artifact.label}<strong>{artifact.text}</strong></span></div>}<span className="active-phone-open">Open idea<ChevronRightIcon aria-hidden="true" /></span>

          </> : <div className="active-support-body"><h3>{extractTitle(note)}</h3><div><p className="active-idea-summary">{summary}</p></div><ChevronRightIcon className="active-support-arrow" aria-hidden="true" /></div>}
        </Link><nav className="active-artifact-links" aria-label={`Saved outputs for ${extractTitle(note)}`} >{preview.report && <Link id={`active-report-${note.id}`} onClick={onOpen} state={{ libraryUserId }} to={`/idea/${note.id}?artifact=report`}><BookOpenIcon aria-hidden="true" />Report</Link>}{savedText(note.prd_content).trim() && <Link id={`active-spec-${note.id}`} onClick={onOpen} state={{ libraryUserId }} to={`/idea/${note.id}?artifact=spec`}><DocumentCheckIcon aria-hidden="true" />Product spec</Link>}{savedText(note.transcript || note.transcription).trim() && <Link id={`active-original-${note.id}`} onClick={onOpen} state={{ libraryUserId }} to={`/idea/${note.id}?artifact=original`}><DocumentTextIcon aria-hidden="true" />Original note</Link>}{note.audio_url && <span><MicrophoneIcon aria-hidden="true" />Recording</span>}<Link className="active-footer-open" id={`active-overview-${note.id}`} onClick={onOpen} state={{ libraryUserId }} to={`/idea/${note.id}`}>Open idea<ChevronRightIcon aria-hidden="true" /></Link></nav></div>;
      })}</div>
      {selected.length > 1 && <button className="active-ideas-view-all" onClick={onViewAll}>View all {selected.length} pinned ideas<ChevronRightIcon aria-hidden="true" /></button>}
    </> : <div className="active-ideas-state"><BookmarkIcon aria-hidden="true" /><h3>Keep the ideas you want to return to</h3><p>Use Pin in your library to keep an idea here. A rough capture can be an active idea too.</p><button onClick={onChoose}>Choose from your library</button></div>}
  </section>;
}
