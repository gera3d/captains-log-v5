import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, TrashIcon, ArrowTopRightOnSquareIcon, SparklesIcon, MicrophoneIcon, LightBulbIcon, StarIcon, Squares2X2Icon, DocumentTextIcon, DocumentCheckIcon, ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { workflowUrl } from '../runtimeConfig';
import { useAuth } from '../contexts/AuthContext';
import { useGeneration } from '../contexts/GenerationContext';
import { extractTitle, extractSummary } from '../utils/extractTitle';

const isArchived = note => note.archived === true || note.archived === 'true' || note.status === 'archived';

export default function NotesList({ notes = [], setNotes, loadingNotes = false, notesError = null, onReloadNotes, onRecord, onWrite }) {
  const [view, setView] = useState('workspace');
  const [search, setSearch] = useState('');
  const [loadingIdea, setLoadingIdea] = useState({});
  const [pending, setPending] = useState(null);
  const pendingRef = useRef(false);
  const [feedback, setFeedback] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = useRef(null);
  const libraryTitleRef = useRef(null);
  const [focusAfterDelete, setFocusAfterDelete] = useState(false);
  useEffect(() => {
    if (deleteTarget || !focusAfterDelete) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => {
      libraryTitleRef.current?.focus();
      setFocusAfterDelete(false);
    }));
    return () => cancelAnimationFrame(frame);
  }, [deleteTarget, focusAfterDelete]);
  const [deleteError, setDeleteError] = useState(null);
  const { user } = useAuth();
  const ownsNote = note => note?.recordSource === 'voice_notes' && note.user_id === user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id);
  const canDelete = note => ownsNote(note) && note.mirrorCheck === 'standalone';
  const canArchive = ownsNote;
  const { runGeneration } = useGeneration();
  const query = search.trim().toLocaleLowerCase();
  const activeNotes = notes.filter(note => !isArchived(note));
  const isFeatured = note => note.is_featured === true || note.is_featured === 'true';
  const captures = activeNotes.filter(note => !note.business_idea?.trim());
  const ideas = activeNotes.filter(note => note.business_idea?.trim());
  const featuredNotes = activeNotes.filter(isFeatured);
  const archivedNotes = notes.filter(isArchived);
  const views = [
    { id: 'workspace', label: 'Workspace', icon: Squares2X2Icon },
    { id: 'captures', label: 'Captures', icon: MicrophoneIcon, count: captures.length },
    { id: 'ideas', label: 'Ideas', icon: LightBulbIcon, count: ideas.length },
    { id: 'featured', label: 'Featured', icon: StarIcon, count: featuredNotes.length },
    { id: 'archived', label: 'Archived', icon: ArchiveBoxIcon, count: archivedNotes.length },
  ];
  const selectedView = views.find(item => item.id === view);
  const matchesSearch = note => !query || [extractTitle(note), extractSummary(note), note.transcript, note.business_idea, ...(note.tags || [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
  const sourceNotes = ({ captures, ideas, featured: featuredNotes, archived: archivedNotes })[view] || activeNotes;
  const displayedNotes = sourceNotes.filter(matchesSearch);
  const handleFeature = async note => {
    if (!ownsNote(note) || pendingRef.current) return;
    const featured = !isFeatured(note);
    pendingRef.current = true;
    setPending(note.id);
    setFeedback(null);
    try {
      const { data, error } = await supabase.from('voice_notes').update({ is_featured: featured }).eq('id', note.id).eq('user_id', user.id).select('id,is_featured').single();
      if (error || data?.id !== note.id || data.is_featured !== featured) throw new Error('The featured change could not be confirmed. Please retry.');
      setNotes(previous => previous.map(row => row.id === note.id ? { ...row, is_featured: featured } : row));
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” ${featured ? 'added to Featured.' : 'removed from Featured.'}` });
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
      setFeedback({ type: 'success', text: `“${extractTitle(note)}” ${archived ? 'archived. Find it in Archived.' : 'restored to Active.'}` });
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
      setFocusAfterDelete(true);
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

  const renderNote = (note, rich = false) => {
    const title = extractTitle(note);
    const summary = extractSummary(note) || note.transcript || 'Open this note to see the details.';
    const date = new Date(note.created_at || note.createdAt);
    const voiceCapture = Boolean(note.audio_url || (Number.isFinite(note.duration) && note.duration > 0));
    const originalType = voiceCapture ? 'Voice capture' : 'Text capture';
    return <article key={note.id} className={`desk-note ${rich ? 'desk-featured-card' : 'desk-note-row'}`} aria-labelledby={`note-${note.id}`}>
      <div className="desk-note-meta"><span>{voiceCapture ? <MicrophoneIcon aria-hidden="true" /> : <DocumentTextIcon aria-hidden="true" />}{originalType}</span>{Number.isFinite(date.getTime()) && <time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>}</div>
      <div className="desk-note-content"><div><h3 id={`note-${note.id}`}><Link to={`/idea/${note.id}`}>{title}</Link></h3><p className="desk-note-summary">{summary}</p></div>{!rich && <Link className="desk-open" to={`/idea/${note.id}`} aria-label={`Open ${title}`}>Open<ChevronRightIcon aria-hidden="true" /></Link>}</div>
      {rich && <div className="desk-artifact-preview"><span>{note.business_idea ? 'From the report' : 'Original thought'}</span><p>{summary}</p></div>}
      <div className="desk-artifacts">{note.business_idea?.trim() ? <span><DocumentTextIcon aria-hidden="true" />Report ready</span> : <span>Original note</span>}{note.prd_content?.trim() && <span><DocumentCheckIcon aria-hidden="true" />Product spec ready</span>}</div>
      <div className="desk-note-actions">
        {rich && <Link className="desk-open" to={`/idea/${note.id}`} aria-label={`Open ${title}`}>Open<ChevronRightIcon aria-hidden="true" /></Link>}
        <button className={`desk-feature-action ${isFeatured(note) ? 'is-featured' : ''}`} onClick={() => handleFeature(note)} disabled={pending !== null || !ownsNote(note)} aria-label={`${isFeatured(note) ? 'Remove featured' : 'Feature'} ${title}`} title={!ownsNote(note) ? 'Featuring isn’t available for this idea yet.' : undefined}><StarIcon aria-hidden="true" />{isFeatured(note) ? 'Remove featured' : 'Feature'}</button>
        {!rich && ownsNote(note) && !note.business_idea && note.transcript && !isArchived(note) && <button onClick={() => handleGenerateIdea(note)} disabled={pending !== null || loadingIdea[note.id]}><SparklesIcon aria-hidden="true" />{loadingIdea[note.id] ? 'Generating…' : 'Develop idea'}</button>}
        {!rich && <button onClick={() => handleToggleArchive(note)} disabled={pending !== null || !canArchive(note)} aria-label={`${isArchived(note) ? 'Restore' : 'Archive'} ${title}`}>{isArchived(note) ? <ArrowUturnLeftIcon aria-hidden="true" /> : <ArchiveBoxIcon aria-hidden="true" />}{pending === note.id ? 'Saving…' : isArchived(note) ? 'Restore' : 'Archive'}</button>}
        {!rich && <button className="desk-delete" onClick={() => { setDeleteError(null); setDeleteTarget(note); }} disabled={pending !== null || !canDelete(note)} aria-label={`Delete ${title}`}><TrashIcon aria-hidden="true" />{canDelete(note) ? 'Delete' : 'Delete unavailable'}</button>}
      </div>
      {!rich && (!canArchive(note) ? <p className="desk-unavailable">Management isn’t available for this idea yet. You can still open it.</p> : !canDelete(note) && <p className="desk-unavailable">Permanent deletion isn’t available for this note here. Archive keeps it for later.</p>)}
    </article>;
  };
  const emptyCopy = {
    workspace: ['Start with a rough idea', 'Say it while it’s fresh. Your original note stays here; develop it when you’re ready.'],
    captures: ['Room for a rough thought', 'Record a voice memo or write a note. It doesn’t have to become a project.'],
    ideas: ['Ideas take shape here', 'Open a capture and choose Develop idea when you want a structured report.'],
    featured: ['Keep a few ideas close', 'Use Feature on a capture or developed idea to keep it in this view.'],
    archived: ['Nothing archived', 'Archive keeps a note for later. Restore brings supported notes back to your workspace.'],
  };
  return (
    <div className="desk-layout">
      <aside className="desk-rail" aria-label="Workspace navigation">
        <p className="desk-rail-title">Your workspace</p>
        <nav>{views.map(item => <button key={item.id} className={view === item.id ? 'is-active' : ''} onClick={() => { setView(item.id); setSearch(''); }} aria-current={view === item.id ? 'page' : undefined}><item.icon aria-hidden="true" /><span>{item.label}</span>{item.count !== undefined && <span className="desk-nav-count">{item.count}</span>}</button>)}</nav>
        <button className="desk-write" onClick={onWrite}><PencilSquareIcon aria-hidden="true" />Write a note</button>
        <p className="desk-rail-note">A capture can stay a capture.<br />You decide what grows.</p>
      </aside>
      <div className="desk-content">
        <div className="desk-toolbar"><div><h1 ref={libraryTitleRef} tabIndex={-1}>{selectedView.label}</h1><p>{view === 'workspace' ? 'A place for passing thoughts and ideas worth pursuing.' : view === 'captures' ? 'Your original thoughts. Develop them when you’re ready.' : view === 'ideas' ? 'Ideas with a report to build on. Featuring is a separate choice.' : view === 'featured' ? 'Your existing featured marks. Add or remove them any time.' : 'Kept for later. Restore a note when you want it back.'}</p></div><button className="desk-record" onClick={onRecord}><MicrophoneIcon aria-hidden="true" />Record idea</button></div>
        <div className="desk-utility-bar"><label className="desk-search"><MagnifyingGlassIcon aria-hidden="true" /><span className="sr-only">Search ideas</span><input type="search" placeholder={`Search ${selectedView.label.toLowerCase()}`} value={search} onChange={event => setSearch(event.target.value)} /></label><button className="desk-refresh" onClick={onReloadNotes} disabled={loadingNotes}>Refresh</button><label className="desk-mobile-nav"><span className="sr-only">Workspace view</span><select value={view} onChange={event => { setView(event.target.value); setSearch(''); }}>{views.map(item => <option key={item.id} value={item.id}>{item.label}{item.count !== undefined ? ` (${item.count})` : ''}</option>)}</select></label></div>
        {notesError && <div className="library-feedback error" role="alert"><p>{notesError} The library may be incomplete.</p><button onClick={onReloadNotes} disabled={loadingNotes}>Retry loading</button></div>}
        {feedback && <p className={`library-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
        {loadingNotes ? <p className="desk-empty" role="status">Loading your ideas…</p> : displayedNotes.length === 0 ? <div className="desk-empty"><MicrophoneIcon aria-hidden="true" /><h2>{query ? 'No matching ideas' : notesError ? 'Your library is unavailable' : emptyCopy[view][0]}</h2><p>{query ? 'Try a different word or clear your search.' : notesError ? 'Retry loading to see your saved notes.' : emptyCopy[view][1]}</p>{query ? <button onClick={() => setSearch('')}>Clear search</button> : ['workspace','captures'].includes(view) && <div><button className="desk-record" onClick={onRecord}>Record idea</button><button className="desk-empty-write" onClick={onWrite}>Write instead</button></div>}</div> : view === 'workspace' && !query ? <>
          <section className="desk-featured-section" aria-labelledby="featured-title"><div className="desk-section-heading"><div><StarIcon aria-hidden="true" /><h2 id="featured-title">Featured</h2><span>{featuredNotes.length}</span></div><button onClick={() => setView('featured')}>Manage featured<ChevronRightIcon aria-hidden="true" /></button></div>{featuredNotes.length ? <div className="desk-featured-grid">{featuredNotes.slice(0,3).map(note => renderNote(note,true))}</div> : <div className="desk-featured-empty"><StarIcon aria-hidden="true" /><div><h3>Keep the promising ones in sight</h3><p>Feature a raw thought or a developed idea. Generating a report doesn’t feature it.</p></div></div>}</section>
          <section className="desk-captures-section" aria-labelledby="recent-captures-title"><div className="desk-section-heading"><div><h2 id="recent-captures-title">Recent captures</h2><span>{captures.length}</span></div><button onClick={() => setView('captures')}>View captures<ChevronRightIcon aria-hidden="true" /></button></div><p className="desk-section-description">Original notes, ready when you are.</p><div className="desk-note-list">{captures.filter(note => !isFeatured(note)).slice(0,4).map(note => renderNote(note))}</div>{captures.filter(note => !isFeatured(note)).length === 0 && <p className="desk-quiet-empty">Your recent captures will appear here. Featured captures stay on the shelf above.</p>}</section>
        </> : <section aria-label={`${selectedView.label} notes`}><div className="desk-list-heading"><h2>{query ? 'Search results' : selectedView.label}</h2><span>{displayedNotes.length} {displayedNotes.length === 1 ? 'note' : 'notes'}</span></div><div className={view === 'featured' ? 'desk-featured-grid desk-all-featured' : 'desk-note-list'}>{displayedNotes.map(note => renderNote(note,view === 'featured'))}</div></section>}
      </div>
      <Dialog open={Boolean(deleteTarget)} onClose={() => { if (!pendingRef.current) setDeleteTarget(null); }} initialFocus={cancelRef} className="note-dialog">
        <div className="note-dialog-backdrop" aria-hidden="true" /><div className="note-dialog-viewport"><DialogPanel className="note-dialog-panel" aria-busy={pending !== null}><TrashIcon className="note-dialog-icon" aria-hidden="true" /><DialogTitle>{deleteTarget ? `Delete “${extractTitle(deleteTarget)}”?` : 'Delete note?'}</DialogTitle><Description>{deleteTarget ? `“${extractTitle(deleteTarget)}”` : ''}</Description><p>This permanently removes the note, its transcript and any report saved in it. Stored audio files and copies saved elsewhere are kept. This cannot be undone.</p>{deleteError && <p role="alert" className="delete-error">{deleteError}</p>}<div className="note-dialog-actions"><button ref={cancelRef} disabled={pending !== null} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger" disabled={pending !== null} onClick={handleDelete}>{pending !== null ? 'Deleting…' : deleteError ? 'Retry delete' : 'Delete note'}</button></div></DialogPanel></div>
      </Dialog>
    </div>
  );
}
