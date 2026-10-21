import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ActiveIdeas from './ActiveIdeas';
import IdeaIdentity from './IdeaIdentity';
import remarkGfm from 'remark-gfm';
import { ideaMarkdownComponents } from '../utils/ideaMarkdownComponents';
import { savedText, formatDuration, ReportBadges, RecordingPlayer } from './NotePreview';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, TrashIcon, SparklesIcon, MicrophoneIcon, LightBulbIcon, BookmarkIcon, Squares2X2Icon, DocumentTextIcon, DocumentCheckIcon, BookOpenIcon, ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { workflowUrl } from '../runtimeConfig';
import { useAuth } from '../contexts/AuthContext';
import { useGeneration } from '../contexts/GenerationContext';
import { extractTitle, extractSummary } from '../utils/extractTitle';

const isArchived = note => note.archived === true || note.archived === 'true' || note.status === 'archived';

export default function NotesList({ notes = [], setNotes, loadingNotes = false, notesError = null, onReloadNotes, onRecord, onWrite, capture }) {
  const [view, setView] = useState('workspace');
  const [search, setSearch] = useState('');
  const [loadingIdea, setLoadingIdea] = useState({});
  const [pending, setPending] = useState(null);
  const pendingRef = useRef(false);
  const [feedback, setFeedback] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = useRef(null);
  const libraryTitleRef = useRef(null);
  const [focusAfterMutation, setFocusAfterMutation] = useState(false);
  useEffect(() => {
    if (deleteTarget || !focusAfterMutation) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => {
      libraryTitleRef.current?.focus();
      setFocusAfterMutation(false);
    }));
    return () => cancelAnimationFrame(frame);
  }, [deleteTarget, focusAfterMutation]);
  const [deleteError, setDeleteError] = useState(null);
  const { user } = useAuth();
  const ownsNote = note => note?.recordSource === 'voice_notes' && note.user_id === user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id);
  const canDelete = note => ownsNote(note) && note.mirrorCheck === 'no-owned-mirror-seen';
  const canArchive = note => ownsNote(note) && note.mirrorCheck === 'no-owned-mirror-seen';
  const canFeature = canArchive;
  const { runGeneration } = useGeneration();
  const query = search.trim().toLocaleLowerCase();
  const activeNotes = notes.filter(note => !isArchived(note));
  const isFeatured = note => note.is_featured === true || note.is_featured === 'true';
  const captures = activeNotes.filter(note => !note.business_idea?.trim());
  const ideas = activeNotes.filter(note => note.business_idea?.trim());
  const featuredNotes = activeNotes.filter(isFeatured);
  const archivedNotes = notes.filter(isArchived);
  const views = [
    { id: 'workspace', label: 'All notes', icon: Squares2X2Icon, count: activeNotes.length },
    { id: 'captures', label: 'Captures', icon: MicrophoneIcon, count: captures.length },
    { id: 'ideas', label: 'Ideas', icon: LightBulbIcon, count: ideas.length },
    { id: 'featured', label: 'Pinned', icon: BookmarkIcon, count: featuredNotes.length },
    { id: 'archived', label: 'Archived', icon: ArchiveBoxIcon, count: archivedNotes.length },
  ];
  const selectedView = views.find(item => item.id === view);
  const matchesSearch = note => !query || [extractTitle(note), extractSummary(note), note.transcript, note.business_idea, ...(note.tags || [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
  const sourceNotes = ({ captures, ideas, featured: featuredNotes, archived: archivedNotes })[view] || activeNotes;
  const displayedNotes = sourceNotes.filter(matchesSearch);
  const handleFeature = async note => {
    if (!canFeature(note) || pendingRef.current) return;
    const featured = !isFeatured(note);
    pendingRef.current = true;
    setPending(note.id);
    setFeedback(null);
    try {
      const { data, error } = await supabase.from('voice_notes').update({ is_featured: featured }).eq('id', note.id).eq('user_id', user.id).select('id,is_featured').single();
      if (error || data?.id !== note.id || data.is_featured !== featured) throw new Error('The pin change could not be confirmed. Please retry.');
      setNotes(previous => previous.map(row => row.id === note.id ? { ...row, is_featured: featured } : row));
      if (view === 'workspace' || (view === 'featured' && !featured)) setFocusAfterMutation(true);
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” ${featured ? 'pinned.' : 'unpinned.'}` });
    } catch (error) { setFeedback({ type: 'error', text: error.message }); }
    finally { setPending(null); pendingRef.current = false; }
  };

  const handleToggleArchive = async note => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    const archived = !isArchived(note);
    setPending(note.id);
    setFeedback(null);
    try {
      if (!canArchive(note)) throw new Error('This idea cannot be archived here yet.');
      const { data, error } = await supabase.from('voice_notes').update({ archived, status: archived ? 'archived' : 'active' }).eq('id', note.id).eq('user_id', user.id).select('id, archived, status').single();
      if (error || !data || data.id !== note.id || data.archived !== archived || data.status !== (archived ? 'archived' : 'active')) throw new Error('The change could not be confirmed. Refresh the library, then retry.');
      setNotes(previous => previous.map(row => row.id === note.id ? { ...row, archived, status: archived ? 'archived' : 'active' } : row));
      setFocusAfterMutation(true);
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” ${archived ? 'archived. Find it in Archived.' : `restored to ${note.business_idea?.trim() ? 'Ideas' : 'Captures'}.`}` });
    } catch (error) {
      setFeedback({ type: 'error', text: `${archived ? 'Archive' : 'Restore'} failed. ${error.message}` });
    } finally {
      setPending(null);
      pendingRef.current = false;
    }
  };

  const handleDelete = async () => {
    const note = deleteTarget;
    if (pendingRef.current || !canDelete(note)) return;
    pendingRef.current = true;
    setPending(note.id);
    setDeleteError(null);
    try {
      const { data, error } = await supabase.from('voice_notes').delete().eq('id', note.id).eq('user_id', user.id).select('id');
      if (error?.code === '23503') throw new Error('This note is linked to another saved idea and could not be deleted.');
      if (error || !Array.isArray(data) || data.length !== 1 || data[0].id !== note.id) throw new Error('Deletion could not be confirmed. Refresh the library before retrying.');
      setNotes(previous => previous.filter(row => row.id !== note.id));
      setDeleteTarget(null);
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” deleted. Stored audio files and other saved copies are kept.` });
      setFocusAfterMutation(true);
    } catch (error) {
      setDeleteError(error.message || 'The note could not be deleted. Please retry.');
    } finally {
      setPending(null);
      pendingRef.current = false;
    }
  };

  const handleGenerateIdea = async note => {
    if (!ownsNote(note) || loadingIdea[note.id]) return;
    setLoadingIdea(previous => ({ ...previous, [note.id]: true }));
    setFeedback(null);
    let transcript = note.transcript || note.transcription || '';
    try {
      try {
        const parsed = JSON.parse(transcript);
        transcript = typeof parsed === 'object' && parsed !== null ? parsed.data || parsed.text || JSON.stringify(parsed) : String(parsed);
      } catch { /* Plain text is already usable. */ }
      if (!transcript.trim()) throw new Error('This note has no text to develop yet.');
      await runGeneration({
        ideaId: note.id, title: extractTitle(note), type: 'generate',
        execute: async () => {
          const response = await fetch(workflowUrl('summarize'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript.trim() }) });
          if (!response.ok) throw new Error('The idea could not be generated. Please retry.');
          const result = await response.json();
          const content = result.idea || result.text;
          if (typeof content !== 'string' || !content.trim()) throw new Error('No idea was returned. Please retry.');
          const idea = content.replace(/^[^\w#*]+/, '').trim();
          const { data, error } = await supabase.from('voice_notes').update({ business_idea: idea, status: 'active' }).eq('id', note.id).eq('user_id', user.id).select('id').single();
          if (error || data?.id !== note.id) throw new Error('The generated idea could not be saved. Please retry.');
          const title = extractTitle({ business_idea: idea });
          const summary = extractSummary({ business_idea: idea });
          setNotes(previous => previous.map(row => row.id === note.id ? { ...row, business_idea: idea, title: title || row.title, summary: summary || row.summary, status: 'active' } : row));
          return { id: note.id, title: title || note.title, summary, url: `/idea/${note.id}` };
        },
      });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'The idea could not be generated. Please retry.' });
    } finally {
      setLoadingIdea(previous => ({ ...previous, [note.id]: false }));
    }
  };

  const noteIdentity = note => <IdeaIdentity developed={Boolean(savedText(note.business_idea).trim())} pinned={isFeatured(note)} voice={Boolean(note.audio_url || formatDuration(note.duration))} />;
  const noteMeta = note => {
    const date = new Date(note.created_at || note.createdAt);
    const voice = Boolean(note.audio_url || formatDuration(note.duration));
    return <div className="original-note-meta"><span className="original-source-label">{voice ? <MicrophoneIcon aria-hidden="true" /> : <DocumentTextIcon aria-hidden="true" />}{voice ? 'Voice capture' : 'Text capture'}</span>
      {Number.isFinite(date.getTime()) && <time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>}
      {formatDuration(note.duration) && <span>{formatDuration(note.duration)}</span>}
    </div>;
  };
  const renderNote = note => {
    const title = extractTitle(note);
    const reportText = savedText(note.business_idea);
    const report = reportText.trim() ? reportText : '';
    const transcript = savedText(note.transcript || note.transcription);
    const summary = extractSummary({ ...note, business_idea: report }) || transcript;
    return <article key={note.id} className={`original-note ${report.trim() ? 'is-developed' : 'is-capture'}`} aria-labelledby={`note-${note.id}`}>
      {noteIdentity(note)}
      <div className="original-note-heading"><div><div className="original-note-title"><h3 id={`note-${note.id}`}><Link to={`/idea/${note.id}`}>{title}</Link></h3></div>{noteMeta(note)}</div><Link className={`original-open ${!report && transcript && ownsNote(note) && !isArchived(note) ? 'is-secondary' : ''}`} to={`/idea/${note.id}`} aria-label={`Open ${title}`}>Open note<ChevronRightIcon aria-hidden="true" /></Link></div>
      {summary && <p className="original-note-summary">{summary}</p>}
      <div className="original-report-context"><ReportBadges text={report} />{note.prd_content?.trim() && <span className="original-artifact"><DocumentCheckIcon aria-hidden="true" />Product spec saved</span>}</div>
      <div className="original-disclosures">
        {report && <details className="original-report"><summary><BookOpenIcon aria-hidden="true" />Read report<ChevronRightIcon className="original-disclosure-arrow" aria-hidden="true" /></summary><div className="prose prose-sm prose-slate max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} components={ideaMarkdownComponents}>{report}</ReactMarkdown></div></details>}
        {transcript && <details className="original-transcript"><summary><DocumentTextIcon aria-hidden="true" />{note.audio_url || formatDuration(note.duration) ? 'Transcript' : 'Original note'}<ChevronRightIcon className="original-disclosure-arrow" aria-hidden="true" /></summary><p>{transcript}</p></details>}
      </div>
      <RecordingPlayer note={note} title={title} />
      {!report && transcript && <p className="original-next-step">Keep this as a note, or develop it into a structured idea when you’re ready.</p>}
      <div className="original-note-actions">
        {ownsNote(note) && !report && transcript && !isArchived(note) && <button className="original-develop" onClick={() => handleGenerateIdea(note)} disabled={pending !== null || loadingIdea[note.id]}><SparklesIcon aria-hidden="true" />{loadingIdea[note.id] ? 'Generating…' : 'Develop idea'}</button>}
        <button className={isFeatured(note) ? 'original-feature-action is-featured' : 'original-feature-action'} onClick={() => handleFeature(note)} disabled={pending !== null || !canFeature(note)} aria-label={`${isFeatured(note) ? 'Unpin' : 'Pin'} ${title}`}><BookmarkIcon aria-hidden="true" />{isFeatured(note) ? 'Unpin' : 'Pin'}</button>
        <button onClick={() => handleToggleArchive(note)} disabled={pending !== null || !canArchive(note)} aria-label={`${isArchived(note) ? 'Restore' : 'Archive'} ${title}`}>{isArchived(note) ? <ArrowUturnLeftIcon aria-hidden="true" /> : <ArchiveBoxIcon aria-hidden="true" />}{pending === note.id ? 'Saving…' : isArchived(note) ? 'Restore' : 'Archive'}</button>
        <button className="original-delete" onClick={() => { setDeleteError(null); setDeleteTarget(note); }} disabled={pending !== null || !canDelete(note)} aria-label={`Delete ${title}`}><TrashIcon aria-hidden="true" />{canDelete(note) ? 'Delete' : 'Delete unavailable'}</button>
      </div>
      {!canArchive(note) && <p className="original-unavailable">Management isn’t available for this idea here yet. You can still open and read it.</p>}
    </article>;
  };
  const showLibrary = nextView => {
    setView(nextView); setSearch('');
    requestAnimationFrame(() => { libraryTitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); libraryTitleRef.current?.focus(); });
  };
  const emptyCopy = {
    workspace: ['Start with a rough idea', 'Press the mic above to capture a thought. Your original stays here; develop it when you’re ready.'],
    captures: ['No raw captures here', 'Record a thought or write a note. It doesn’t have to become a project.'],
    ideas: ['Ideas take shape here', 'Choose Develop idea on a capture when you want a structured report.'],
    featured: ['Keep a few ideas close', 'Use Pin on a capture or developed idea to keep it in this view.'],
    archived: ['Nothing archived', 'Archive keeps a note for later. Restore brings supported notes back.'],
  };
  return (
    <div className="original-dashboard-content">
      <div className="original-top-grid">
        {capture}
        <ActiveIdeas notes={notes} userId={user?.id} loading={loadingNotes} error={notesError} onChoose={() => showLibrary('workspace')} onViewAll={() => showLibrary('featured')} onRetry={onReloadNotes} />
      </div>
      <section id="all-notes-section" className="original-library" aria-labelledby="library-title">
        <div className="original-library-heading"><div><h1 id="library-title" ref={libraryTitleRef} tabIndex={-1}>Your captured notes &amp; ideas</h1></div><button className="original-write" onClick={onWrite}><PencilSquareIcon aria-hidden="true" />Write a note</button></div>
        <div className="original-library-tools"><label className="original-search"><MagnifyingGlassIcon aria-hidden="true" /><span className="sr-only">Search ideas</span><input type="search" placeholder="Search your notes and ideas" value={search} onChange={event => setSearch(event.target.value)} /></label><button className="original-refresh" onClick={onReloadNotes} disabled={loadingNotes}>Refresh</button></div>
        <div className="original-filter-band"><nav className="original-filters" aria-label="Filter notes">{views.map(item => <button key={item.id} className={view === item.id ? 'is-active' : ''} onClick={() => { setView(item.id); setSearch(''); }} aria-pressed={view === item.id}><item.icon aria-hidden="true" />{item.label}<span>{notesError || loadingNotes ? '—' : item.count}</span></button>)}</nav><span className="original-result-count" role="status">{notesError ? 'Results unavailable' : loadingNotes ? 'Loading…' : `${displayedNotes.length} ${displayedNotes.length === 1 ? 'note' : 'notes'}`}</span></div>
        {notesError && <div className="library-feedback error" role="alert"><p>{notesError} The library may be incomplete.</p><button onClick={onReloadNotes} disabled={loadingNotes}>Retry loading</button></div>}
        {feedback && <p className={`library-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
        <h2 className="sr-only">{query ? 'Search results' : selectedView.label}</h2>
        {loadingNotes ? <p className="original-empty" role="status">Loading your ideas…</p> : displayedNotes.length ? <div className="original-note-list">{displayedNotes.map(renderNote)}</div> : <div className="original-empty"><h3>{query ? 'No matching ideas' : notesError ? 'Your library is unavailable' : emptyCopy[view][0]}</h3><p>{query ? 'Try a different word or clear your search.' : notesError ? 'Retry loading to see your saved notes.' : emptyCopy[view][1]}</p>{query ? <button onClick={() => setSearch('')}>Clear search</button> : ['workspace','captures'].includes(view) && <button onClick={onRecord}>Go to voice capture</button>}</div>}
      </section>
      <Dialog open={Boolean(deleteTarget)} onClose={() => { if (!pendingRef.current) setDeleteTarget(null); }} initialFocus={cancelRef} className="note-dialog">
        <div className="note-dialog-backdrop" aria-hidden="true" /><div className="note-dialog-viewport"><DialogPanel className="note-dialog-panel" aria-busy={pending !== null}><TrashIcon className="note-dialog-icon" aria-hidden="true" /><DialogTitle>{deleteTarget ? `Delete “${extractTitle(deleteTarget)}”?` : 'Delete note?'}</DialogTitle><Description>{deleteTarget ? `“${extractTitle(deleteTarget)}”` : ''}</Description><p>This permanently removes the note, its transcript and any report saved in it. Stored audio files and copies saved elsewhere are kept. This cannot be undone.</p>{deleteError && <p role="alert" className="delete-error">{deleteError}</p>}<div className="note-dialog-actions"><button ref={cancelRef} disabled={pending !== null} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger" disabled={pending !== null} onClick={handleDelete}>{pending !== null ? 'Deleting…' : deleteError ? 'Retry delete' : 'Delete note'}</button></div></DialogPanel></div>
      </Dialog>
    </div>
  );
}
