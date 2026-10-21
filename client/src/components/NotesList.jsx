import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowUturnLeftIcon, TrashIcon, ArrowTopRightOnSquareIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { workflowUrl } from '../runtimeConfig';
import { useAuth } from '../contexts/AuthContext';
import { useGeneration } from '../contexts/GenerationContext';
import { extractTitle, extractSummary } from '../utils/extractTitle';

const isArchived = note => note.archived === true || note.archived === 'true' || note.status === 'archived';

export default function NotesList({ notes = [], setNotes, loadingNotes = false, notesError = null, onReloadNotes }) {
  const [filter, setFilter] = useState('active');
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
  const displayedNotes = notes.filter(note => isArchived(note) === (filter === 'archived')).filter(note => !query || [extractTitle(note), extractSummary(note), note.transcript, note.business_idea, ...(note.tags || [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query));
  const activeCount = notes.filter(note => !isArchived(note)).length;

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
          const { data, error } = await supabase.from('voice_notes').update({ business_idea: idea, is_featured: true, status: 'active' }).eq('id', note.id).eq('user_id', user.id).select('id').single();
          if (error || data?.id !== note.id) throw new Error('The generated idea could not be saved. Please retry.');
          const title = extractTitle({ business_idea: idea });
          const summary = extractSummary({ business_idea: idea });
          setNotes(previous => previous.map(row => row.id === note.id ? { ...row, business_idea: idea, title: title || row.title, summary: summary || row.summary, is_featured: true, status: 'active' } : row));
          return { id: note.id, title: title || note.title, summary, url: `/idea/${note.id}` };
        },
      });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'The idea could not be generated. Please retry.' });
    } finally {
      setLoadingIdea(previous => ({ ...previous, [note.id]: false }));
    }
  };

  return (
    <>
      <div className="library-heading"><div><h2 id="library-title" ref={libraryTitleRef} tabIndex={-1}>Idea library</h2><p>Open an idea to refine it and use it in your tools.</p></div><button className="library-refresh" onClick={onReloadNotes} disabled={loadingNotes} aria-label="Refresh library">Refresh</button></div>
      <div className="library-controls">
        <div className="library-filters" aria-label="Library filter">
          <button aria-pressed={filter === 'active'} onClick={() => setFilter('active')}>Active <span>{activeCount}</span></button>
          <button aria-pressed={filter === 'archived'} onClick={() => setFilter('archived')}>Archived <span>{notes.length - activeCount}</span></button>
        </div>
        <label className="library-search"><MagnifyingGlassIcon aria-hidden="true" /><span className="sr-only">Search ideas</span><input type="search" placeholder="Search ideas" value={search} onChange={event => setSearch(event.target.value)} /></label>
      </div>
      {notesError && <div className="library-feedback error" role="alert"><p>{notesError} The library may be incomplete.</p><button onClick={onReloadNotes} disabled={loadingNotes}>Retry loading</button></div>}
      <p className="library-filter-hint">{filter === 'archived' ? 'Archived ideas stay saved. Restore brings supported notes back to Active.' : 'Archive keeps a note for later. Delete permanently removes supported notes.'}</p>
      {feedback && <p className={`library-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
      {loadingNotes ? <p role="status" className="library-empty">Loading your ideas…</p> : displayedNotes.length === 0 ? <div className="library-empty"><h3>{query ? 'No matching ideas' : notesError ? 'Your library is unavailable' : filter === 'archived' ? 'No archived ideas' : 'Your next idea starts here'}</h3><p>{query ? 'Try a different word or clear your search.' : notesError ? 'Retry loading to see your saved ideas.' : filter === 'archived' ? 'Ideas you archive will appear here. You can restore them any time.' : 'Record a voice memo or write a note. It will appear in this library.'}</p>{query && <button onClick={() => setSearch('')}>Clear search</button>}</div> : <div className="library-list">{displayedNotes.map(note => {
        const title = extractTitle(note);
        const summary = extractSummary(note) || note.transcript || 'Open this note to see the details.';
        const date = new Date(note.created_at || note.createdAt);
        return <article key={note.id} className="library-note" aria-labelledby={`note-${note.id}`}>
          <div className="library-note-main"><div><p className="library-note-meta">{note.business_idea ? 'Structured idea' : note.audio_url ? 'Voice memo' : 'Text note'}{Number.isFinite(date.getTime()) && <time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>}</p><h3 id={`note-${note.id}`}><Link to={`/idea/${note.id}`}>{title}</Link></h3><p className="library-note-summary">{summary}</p></div><Link className="library-open" to={`/idea/${note.id}`} aria-label={`Open ${title}`}>Open <ArrowTopRightOnSquareIcon aria-hidden="true" /></Link></div>
          <div className="library-note-actions">
            {ownsNote(note) && !note.business_idea && (note.transcript || note.transcription) && !isArchived(note) && <button onClick={() => handleGenerateIdea(note)} disabled={loadingIdea[note.id] || pending !== null}><SparklesIcon aria-hidden="true" />{loadingIdea[note.id] ? 'Generating…' : 'Generate idea'}</button>}
            <button onClick={() => handleToggleArchive(note)} disabled={pending !== null || !canArchive(note)} title={!canArchive(note) ? 'Archive and Restore are not available for this idea yet.' : undefined} aria-label={`${isArchived(note) ? 'Restore' : 'Archive'} ${title}`}>{isArchived(note) ? <ArrowUturnLeftIcon aria-hidden="true" /> : <ArchiveBoxIcon aria-hidden="true" />}{pending === note.id ? 'Saving…' : isArchived(note) ? 'Restore' : 'Archive'}</button>
            <button className="library-delete" onClick={() => { setDeleteError(null); setDeleteTarget(note); }} disabled={pending !== null || !canDelete(note)} title={!canDelete(note) ? 'Permanent deletion is not available for this idea yet.' : undefined} aria-label={`Delete ${title}`}><TrashIcon aria-hidden="true" />{canDelete(note) ? 'Delete' : 'Delete unavailable'}</button>
          </div>
          {!canArchive(note) ? <p className="library-unavailable">Archive, Restore and Delete aren’t available for this idea yet. You can still open it.</p> : !canDelete(note) && <p className="library-unavailable">{note.mirrorCheck === 'unverified' ? 'Refresh the library to check whether this note can be deleted.' : 'Permanent deletion isn’t available for this idea yet. You can still archive or restore this note.'}</p>}
        </article>;
      })}</div>}
      <Dialog open={Boolean(deleteTarget)} onClose={() => { if (!pendingRef.current) setDeleteTarget(null); }} initialFocus={cancelRef} className="note-dialog">
        <div className="note-dialog-backdrop" aria-hidden="true" /><div className="note-dialog-viewport"><DialogPanel className="note-dialog-panel" aria-busy={pending !== null}>
          <TrashIcon className="note-dialog-icon" aria-hidden="true" />
          <DialogTitle>{canDelete(deleteTarget) ? `Delete “${extractTitle(deleteTarget)}”?` : 'Delete isn’t available for this idea'}</DialogTitle>
          <Description>{deleteTarget ? `“${extractTitle(deleteTarget)}”` : ''}</Description>
          {canDelete(deleteTarget) ? <p>This permanently removes the note, its transcript and any report saved in it. Stored audio files and copies saved elsewhere are kept. This cannot be undone.</p> : <p>This idea can’t be permanently deleted here yet. It is still saved.{canArchive(deleteTarget) ? ' You can archive this note to keep it out of Active, then restore it later from Archived.' : ' You can still open it from your library.'}</p>}
          {deleteError && <p role="alert" className="delete-error">{deleteError}</p>}
          <div className="note-dialog-actions"><button ref={cancelRef} disabled={pending !== null} onClick={() => setDeleteTarget(null)}>Cancel</button>
            {canDelete(deleteTarget) ? <button className="danger" disabled={pending !== null} onClick={handleDelete}>{pending !== null ? 'Deleting…' : deleteError ? 'Retry delete' : 'Delete note'}</button> : deleteTarget && !isArchived(deleteTarget) && canArchive(deleteTarget) && <button className="dashboard-primary" disabled={pending !== null} onClick={() => { const note = deleteTarget; setDeleteTarget(null); handleToggleArchive(note); }}>Archive instead</button>}
          </div>
        </DialogPanel></div>
      </Dialog>
    </>
  );
}
