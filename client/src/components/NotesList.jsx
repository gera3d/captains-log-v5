import { loadOwnedIdea, saveGeneratedReport } from '../utils/ideaContextStore';
import { readIdeaContext } from '../utils/ideaContext';
import { generationJson, generationText, generationMessage, GenerationError, requireGenerationInput } from '../utils/generationRequest';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ActiveIdeas from './ActiveIdeas';
import './LibraryBrowse.css';
import IdeaIdentity from './IdeaIdentity';
import BrowseArtifactCue, { browseSummary, browseExcerpt } from './BrowsePreview';
import remarkGfm from 'remark-gfm';
import { ideaMarkdownComponents } from '../utils/ideaMarkdownComponents';
import { savedText, formatDuration, RecordingPlayer } from './NotePreview';
import { Link } from 'react-router-dom';
import { readLibraryContext, saveLibraryContext, clearLibraryContext } from '../utils/libraryContext';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, TrashIcon, SparklesIcon, MicrophoneIcon, LightBulbIcon, BookmarkIcon, Squares2X2Icon, DocumentTextIcon, DocumentCheckIcon, BookOpenIcon, ChevronRightIcon, ChevronDownIcon, AdjustmentsHorizontalIcon, PlayCircleIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import { supabase } from '../supabaseClient';
import { workflowUrl } from '../runtimeConfig';
import { useAuth } from '../contexts/AuthContext';
import { useGeneration } from '../contexts/GenerationContext';
import { extractTitle, extractSummary } from '../utils/extractTitle';

const hasReport = note => Boolean(savedText(note.business_idea).trim());
const isArchived = note => note.archived === true || note.archived === 'true' || note.status === 'archived';

export default function NotesList({ notes = [], setNotes, loadingNotes = false, notesError = null, onReloadNotes, onRecord, onWrite, capture }) {
  const { user } = useAuth();
  const initialContext = useRef(readLibraryContext(user?.id));
  const [view, setView] = useState(initialContext.current?.view || 'workspace');
  const [search, setSearch] = useState(initialContext.current?.search || '');
  const restoreContext = useRef(initialContext.current);
  const pinFocusRef = useRef(null);
  useEffect(() => {
    const context = readLibraryContext(user?.id);
    setView(context?.view || 'workspace'); setSearch(context?.search || '');
    restoreContext.current = context;
  }, [user?.id]);
  useEffect(() => {
    if (loadingNotes || !restoreContext.current) return;
    const context = restoreContext.current;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => {
      for (const id of context.disclosures || []) { const details = document.getElementById(id); if (details?.tagName === 'DETAILS') details.open = true; }
      const origin = context.focus && document.getElementById(context.focus);
      if (origin) { window.scrollTo({ top: context.scroll, behavior: 'instant' }); origin.focus({ preventScroll: true }); }
      restoreContext.current = null;
      clearLibraryContext(user?.id);
    }));
    return () => cancelAnimationFrame(frame);
  }, [loadingNotes, notes, view, search]);
  const rememberOpen = event => saveLibraryContext(user?.id, { view, search, focus: event.currentTarget.id, disclosures: [...document.querySelectorAll('.original-note details[open][id]')].map(item => item.id) });
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
  const ownsNote = note => note?.recordSource === 'voice_notes' && note.user_id === user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id);
  const canDelete = note => ownsNote(note) && note.mirrorCheck === 'no-owned-mirror-seen';
  const canArchive = note => ownsNote(note) && note.mirrorCheck === 'no-owned-mirror-seen';
  const canFeature = canArchive;
  const { runGeneration } = useGeneration();
  const query = search.trim().toLocaleLowerCase();
  const activeNotes = notes.filter(note => !isArchived(note));
  const isFeatured = note => note.is_featured === true || note.is_featured === 'true';
  const captures = activeNotes.filter(note => !hasReport(note));
  const ideas = activeNotes.filter(note => hasReport(note));
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
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” ${featured ? 'pinned.' : 'unpinned.'}` });
    } catch (error) { setFeedback({ type: 'error', text: error.message }); }
    finally { pinFocusRef.current = note.id; setPending(null); pendingRef.current = false; }
  };

  useEffect(() => {
    if (pending || !pinFocusRef.current) return;
    const id = pinFocusRef.current;
    pinFocusRef.current = null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const retained = document.getElementById(`pin-${id}`);
      if (retained) { retained.focus({ preventScroll: true }); return; }
      const candidates = [...document.querySelectorAll('.original-note .browse-management > summary')];
      const distance = node => Math.abs(node.getBoundingClientRect().top - window.innerHeight / 2);
      const fallback = candidates.sort((left, right) => distance(left) - distance(right))[0] || libraryTitleRef.current;
      fallback?.focus({ preventScroll: true });
      const rect = fallback?.getBoundingClientRect();
      if (rect && (rect.top < 8 || rect.bottom > window.innerHeight - 8)) fallback.scrollIntoView({ block: 'center', behavior: 'instant' });
    }));
  }, [pending, notes]);

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
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” ${archived ? 'archived. Find it in Archived.' : `restored to ${hasReport(note) ? 'Ideas' : 'Captures'}.`}` });
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
    try {
      const snapshot = await loadOwnedIdea(note.id, user.id);
      const material = readIdeaContext(snapshot.transcript);
      if (!material.supported) throw new GenerationError(material.reason, 'unsupported');
      const transcript = material.combined;
      requireGenerationInput(transcript);
      if (!transcript.trim()) throw new GenerationError('This note has no saved text to develop yet.', 'empty_source');
      await runGeneration({
        ideaId: note.id, title: extractTitle(note), type: 'generate',
        execute: async () => {
          const result = await generationJson(workflowUrl('summarize'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript.trim() }) });
          const content = generationText(result, ['idea', 'text'], 'idea generation');
          const idea = content.replace(/^[^\w#*]+/, '').trim();
          await saveGeneratedReport(snapshot, idea, user.id);
          const title = extractTitle({ business_idea: idea });
          const summary = extractSummary({ business_idea: idea });
          setNotes(previous => previous.map(row => row.id === note.id ? { ...row, business_idea: idea, title: title || row.title, summary: summary || row.summary, status: 'active' } : row));
          return { id: note.id, title: title || note.title, summary, url: `/idea/${note.id}` };
        },
      });
    } catch (error) {
      setFeedback({ type: 'error', text: generationMessage(error) });
    } finally {
      setLoadingIdea(previous => ({ ...previous, [note.id]: false }));
    }
  };

  const noteIdentity = note => <IdeaIdentity developed={hasReport(note)} pinned={isFeatured(note)} voice={Boolean(note.audio_url || formatDuration(note.duration))} />;
  const noteMeta = note => {
    const date = new Date(note.created_at || note.createdAt);
    const voice = Boolean(note.audio_url || formatDuration(note.duration));
    return <div className="original-note-meta"><span className="original-source-label">{voice ? <MicrophoneIcon aria-hidden="true" /> : <DocumentTextIcon aria-hidden="true" />}{voice ? 'Voice capture' : 'Text capture'}</span>
      {Number.isFinite(date.getTime()) && <time dateTime={date.toISOString()}>Created {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>}
      {!note.audio_url && formatDuration(note.duration) && <span>{formatDuration(note.duration)}</span>}
    </div>;
  };
  const closeReport = event => {
    const details = event.currentTarget.closest('details');
    const summary = details.querySelector('summary');
    details.open = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      summary.focus({ preventScroll: true });
      summary.scrollIntoView({ block: 'center', behavior: 'instant' });
    }));
  };
  const renderNote = note => {
    const title = extractTitle(note);
    const reportText = savedText(note.business_idea);
    const report = reportText.trim() ? reportText : '';
    const transcript = savedText(note.transcript || note.transcription);
    const summary = browseSummary(note) || browseExcerpt(transcript, 125);
    return <article key={note.id} className={`original-note ${report.trim() ? 'is-developed' : 'is-capture'}`} aria-labelledby={`note-${note.id}`}>
      <div className="original-note-composition"><div className="original-note-content">
      {noteIdentity(note)}
      <div className="original-note-heading"><div><div className="original-note-title"><h3 id={`note-${note.id}`}><Link id={`title-${note.id}`} onClick={rememberOpen} state={{ libraryUserId: user?.id }} to={`/idea/${note.id}`}>{title}</Link></h3></div></div></div>
      {summary && <p className="original-note-summary">{summary}</p>}
      <BrowseArtifactCue note={note} title={title} userId={user?.id} onOpen={rememberOpen} />
      {noteMeta(note)}
      </div></div>
      <div className="original-note-footer"><div className="browse-card-controls"><Link className={`original-open ${!report && transcript && ownsNote(note) && !isArchived(note) ? 'is-secondary' : ''}`} id={`open-${note.id}`} onClick={rememberOpen} state={{ libraryUserId: user?.id }} to={`/idea/${note.id}`} aria-label={`Open ${title}`}>Open idea<ChevronRightIcon aria-hidden="true" /></Link>
<details className="browse-management"><summary><AdjustmentsHorizontalIcon aria-hidden="true" /><span>Manage<span className="browse-management-hint">{canArchive(note) ? `${isFeatured(note) ? 'Unpin' : 'Pin'}, ${isArchived(note) ? 'restore' : 'archive'}, delete` : 'Availability & limits'}</span></span><ChevronDownIcon aria-hidden="true" /></summary><div className="browse-management-body" role="group" aria-label={`Manage ${title}`}>
      <div className="original-note-actions">

        <button id={`pin-${note.id}`} className={isFeatured(note) ? 'original-feature-action is-featured' : 'original-feature-action'} onClick={() => handleFeature(note)} disabled={pending !== null || !canFeature(note)} aria-label={`${isFeatured(note) ? 'Unpin' : 'Pin'} ${title}`}><BookmarkIcon aria-hidden="true" />{isFeatured(note) ? 'Unpin' : 'Pin'}</button>
        <button onClick={() => handleToggleArchive(note)} disabled={pending !== null || !canArchive(note)} aria-label={`${isArchived(note) ? 'Restore' : 'Archive'} ${title}`}>{isArchived(note) ? <ArrowUturnLeftIcon aria-hidden="true" /> : <ArchiveBoxIcon aria-hidden="true" />}{pending === note.id ? 'Saving…' : isArchived(note) ? 'Restore' : 'Archive'}</button>
        <button className={canDelete(note) ? 'original-delete' : 'original-delete is-unavailable'} onClick={() => { setDeleteError(null); setDeleteTarget(note); }} disabled={pending !== null || !canDelete(note)} aria-label={`Delete ${title}`}><TrashIcon aria-hidden="true" />{canDelete(note) ? 'Delete' : 'Delete unavailable'}</button>
      </div>
      {!canArchive(note) && <p className="original-unavailable">Management isn’t available for this idea here yet. You can still open and read it.</p>}
</div></details></div>
      {!report && transcript && <p className="original-next-step">{ownsNote(note) && !isArchived(note) ? 'Keep this as a note, or choose Develop idea for a structured report.' : 'Your original is saved. Later development is not available for this source here yet.'}</p>}
        {ownsNote(note) && !report && transcript && !isArchived(note) && <button className="original-develop" onClick={() => handleGenerateIdea(note)} disabled={pending !== null || loadingIdea[note.id]}><SparklesIcon aria-hidden="true" />{loadingIdea[note.id] ? 'Generating…' : 'Develop idea'}</button>}
<div className="original-disclosures browse-reading-controls">
        {transcript && <details id={`inline-original-${note.id}`} className="original-transcript"><summary><DocumentTextIcon aria-hidden="true" />{note.audio_url || formatDuration(note.duration) ? 'Transcript' : 'Original note'}<ChevronRightIcon className="original-disclosure-arrow" aria-hidden="true" /></summary><p>{transcript}</p></details>}
      {note.audio_url && <details className="original-recording" onToggle={event => { if (!event.currentTarget.open) event.currentTarget.querySelector('audio')?.pause(); }}><summary aria-label={formatDuration(note.duration) ? `Listen to original recording ${formatDuration(note.duration)}` : 'Listen to original recording'}><PlayCircleIcon aria-hidden="true" />Listen{formatDuration(note.duration) && <span>{formatDuration(note.duration)}</span>}<ChevronDownIcon className="original-disclosure-arrow" aria-hidden="true" /></summary><RecordingPlayer note={note} title={title} /></details>}
        {report && <details id={`inline-report-${note.id}`} className="original-report"><summary aria-label="Read report"><BookOpenIcon aria-hidden="true" />Report<ChevronRightIcon className="original-disclosure-arrow" aria-hidden="true" /></summary><div className="original-report-reading"><Link id={`report-${note.id}`} onClick={rememberOpen} state={{ libraryUserId: user?.id }} to={`/idea/${note.id}?artifact=report`}>Open report page<ChevronRightIcon aria-hidden="true" /></Link><div className="prose prose-sm prose-slate max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} components={ideaMarkdownComponents}>{report}</ReactMarkdown></div><button className="original-close-report" onClick={closeReport}>Close report</button></div></details>}
</div>
      </div>
    </article>;
  };
  const showLibrary = nextView => {
    setView(nextView);
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
    <div className="original-dashboard-content browse-collection">
      <div className="browse-workspace-toolbar"><a href="#all-notes-section" onClick={event => { event.preventDefault(); libraryTitleRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); libraryTitleRef.current?.focus({ preventScroll: true }); }}><Squares2X2Icon aria-hidden="true" />Browse library<ChevronRightIcon aria-hidden="true" /></a></div>
      <div className="original-top-grid">
        {capture}
        <ActiveIdeas notes={notes} userId={user?.id} loading={loadingNotes} error={notesError} onChoose={() => { setSearch(''); showLibrary('workspace'); }} onViewAll={() => { setSearch(''); showLibrary('featured'); }} onRetry={onReloadNotes} onOpen={rememberOpen} libraryUserId={user?.id} />
      </div>
      <section id="all-notes-section" className="original-library" aria-labelledby="library-title">
        <div className="original-library-heading"><div><h1 id="library-title" ref={libraryTitleRef} tabIndex={-1}>Your library</h1><div className="browse-view-context"><span>{selectedView.label}</span><span className="original-result-count" role="status">{notesError ? 'Results unavailable' : loadingNotes ? 'Loading…' : query ? `${displayedNotes.length} ${displayedNotes.length === 1 ? 'match' : 'matches'}` : `${displayedNotes.length} ${displayedNotes.length === 1 ? 'note' : 'notes'}`}</span></div></div><button className="original-write" onClick={onWrite}><PencilSquareIcon aria-hidden="true" />Write a note</button></div>
        <div className="original-library-tools"><label className="original-search"><MagnifyingGlassIcon aria-hidden="true" /><span className="sr-only">Search ideas</span><input type="search" maxLength={500} placeholder="Search ideas" value={search} onChange={event => setSearch(event.target.value)} /></label>{search && <button className="browse-clear-search" onClick={() => setSearch('')} aria-label="Clear search"><XMarkIcon aria-hidden="true" />Clear</button>}<button className="original-refresh" onClick={onReloadNotes} disabled={loadingNotes}>Refresh</button></div>
        <div className="original-filter-band"><nav className="original-filters" aria-label="Filter notes">{views.map(item => <button key={item.id} className={view === item.id ? 'is-active' : ''} onClick={() => setView(item.id)} aria-pressed={view === item.id}><item.icon aria-hidden="true" />{item.label}<span>{notesError || loadingNotes ? '—' : item.count}</span></button>)}</nav></div>
        {notesError && <div className="library-feedback error" role="alert"><p>{notesError} The library may be incomplete.</p><button onClick={onReloadNotes} disabled={loadingNotes}>Retry loading</button></div>}
        {feedback && <p className={`library-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
        <h2 className="sr-only">{query ? 'Search results' : selectedView.label}</h2>
        {loadingNotes ? <p className="original-empty" role="status">Loading your ideas…</p> : displayedNotes.length ? <div className="original-note-list">{displayedNotes.map(renderNote)}</div> : <div className="original-empty"><h3>{notesError ? 'Your library is unavailable' : query ? 'No matching ideas' : emptyCopy[view][0]}</h3><p>{notesError ? 'Retry loading to see your saved notes. Your search will stay here.' : query ? 'Try a different word or clear your search.' : emptyCopy[view][1]}</p>{notesError ? <button onClick={onReloadNotes}>Retry loading</button> : query ? <button onClick={() => setSearch('')}>Clear search</button> : ['workspace','captures'].includes(view) && <button onClick={onRecord}>Go to voice capture</button>}</div>}
      </section>
      <Dialog open={Boolean(deleteTarget)} onClose={() => { if (!pendingRef.current) setDeleteTarget(null); }} initialFocus={cancelRef} className="note-dialog">
        <div className="note-dialog-backdrop" aria-hidden="true" /><div className="note-dialog-viewport"><DialogPanel className="note-dialog-panel" aria-busy={pending !== null}><TrashIcon className="note-dialog-icon" aria-hidden="true" /><DialogTitle>{deleteTarget ? `Delete “${extractTitle(deleteTarget)}”?` : 'Delete note?'}</DialogTitle><Description>{deleteTarget ? `“${extractTitle(deleteTarget)}”` : ''}</Description><p>This permanently removes the note, its transcript and any report saved in it. Stored audio files and copies saved elsewhere are kept. This cannot be undone.</p>{deleteError && <p role="alert" className="delete-error">{deleteError}</p>}<div className="note-dialog-actions"><button ref={cancelRef} disabled={pending !== null} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger" disabled={pending !== null} onClick={handleDelete}>{pending !== null ? 'Deleting…' : deleteError ? 'Retry delete' : 'Delete note'}</button></div></DialogPanel></div>
      </Dialog>
    </div>
  );
}
