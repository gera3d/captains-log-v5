import { ideaSaveCapability } from '../utils/ideaGraphql';
import { useRef, useState } from 'react';
import { readIdeaContext, IdeaContextError } from '../utils/ideaContext';
import { loadOwnedIdea, saveIdeaAddition } from '../utils/ideaContextStore';
import './IdeaContextPanel.css';

export default function IdeaContextPanel({ id, userId, raw, allowed, busy, onSaved, onBusyChange }) {
  const [draft, setDraft] = useState('');
  const [type, setType] = useState('text');
  const [saving, setSaving] = useState(false);
  const [capability, setCapability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pendingEntry = useRef(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const savingRef = useRef(false);
  const context = readIdeaContext(raw);
  const save = async () => {
    if (!allowed || !capability?.available || !context.supported || !draft.trim() || savingRef.current || busy) return;
    savingRef.current = true; setSaving(true); onBusyChange?.(true); setError(''); setMessage('');
    const entry = pendingEntry.current || { id: crypto.randomUUID(), type, createdAt: new Date().toISOString(), text: draft };
    pendingEntry.current = entry;
    try {
      const saved = await saveIdeaAddition({ id, userId, previousRaw: raw, entry });
      onSaved(saved);
      pendingEntry.current = null;
      setDraft(current => current === entry.text ? '' : current);
      setMessage(draftRef.current !== entry.text ? 'The earlier addition is confirmed saved. Your edited text is still unsaved. Save it separately when ready.' : 'Details saved. Your report and product spec have not been regenerated. Regenerate the report when you want to use all saved material.');
    } catch (error) { setError(error instanceof IdeaContextError ? error.message : 'Save could not be confirmed. Your draft is kept. Retry checks saved details first.'); }
    finally { savingRef.current = false; setSaving(false); onBusyChange?.(false); }
  };
  const reload = async () => {
    if (savingRef.current || busy) return;
    savingRef.current = true; setSaving(true); onBusyChange?.(true);
    try { onSaved(await loadOwnedIdea(id, userId)); setError(''); setMessage('Latest saved details loaded. Your draft is still here.'); }
    catch { setError('Saved details could not be loaded. Your draft is kept.'); }
    finally { savingRef.current = false; setSaving(false); onBusyChange?.(false); }
  };
  const checkSupport = async event => {
    if (!event.currentTarget.open || !allowed || checking || capability) return;
    setChecking(true);
    try { setCapability(await ideaSaveCapability(userId)); }
    catch { setCapability({ available: false, reason: 'Your account or safe save support could not be confirmed. Your draft is kept.' }); }
    finally { setChecking(false); }
  };
  return <details id="idea-context" data-save-support={capability?.available ? 'available' : capability?.stage || (checking ? 'checking' : 'not-checked')} onToggle={checkSupport} className="idea-context-disclosure"><summary>Add to idea <span>{context.supported ? `${context.additions.length} saved additions` : ''}</span></summary><section className="idea-context-panel" aria-labelledby="idea-context-title">
    <div className="idea-context-heading"><div><h2 id="idea-context-title">Add to idea</h2><p>Keep new details or paste a transcript. Save them first; regenerate separately.</p><p className="idea-context-bounds">Up to 64 KB per addition, 100 additions, and 512 KB of combined text. Nothing is shortened.</p></div><span>{context.supported ? `${context.additions.length} saved additions` : 'Saved format unavailable'}</span></div>
    {context.supported && <details className="idea-context-original"><summary>Original material</summary><p>{context.original || 'No original text was saved. The original recording remains separate.'}</p></details>}
    {context.supported && context.additions.length > 0 && <ol className="idea-context-entries">{context.additions.map(item => <li key={item.id}><div><strong>{item.type === 'transcript' ? 'Pasted transcript' : 'Additional text'}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div><p>{item.text}</p></li>)}</ol>}
    {checking && <p role="status">Checking safe save support…</p>}
    {capability && !capability.available && <p role="status">{capability.reason}</p>}
    {!allowed ? <p className="idea-context-limit">Adding details is available for your own recorded notes here. This source can still be opened and read.</p> : !context.supported ? <p role="status">{context.reason}</p> : <>
      <label>Type of addition<select value={type} onChange={event => setType(event.target.value)} disabled={saving || busy}><option value="text">Additional text</option><option value="transcript">Pasted transcript</option></select></label>
      <label>New details<textarea value={draft} onChange={event => setDraft(event.target.value)} rows={5} disabled={saving || busy} placeholder="Add what you have learned, or paste words from another recording." /></label>
      <div className="idea-context-actions"><button type="button" onClick={save} disabled={!capability?.available || !draft.trim() || saving || busy}>{saving ? 'Saving…' : error ? 'Retry save details' : 'Save details'}</button><button type="button" onClick={reload} disabled={saving || busy}>Load latest saved details</button><span>Saving does not run AI.</span></div>
    </>}
    {error && <p className="idea-context-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
  </section></details>;
}
