import { compareAndSetIdea } from './ideaGraphql';
import { supabase } from '../supabaseClient';
import { IdeaContextError, appendIdeaContext, readIdeaContext, matchingAddition } from './ideaContext';

export async function confirmIdeaOwner(userId) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !userId || data?.user?.id !== userId) throw new IdeaContextError('Your current account could not be confirmed. Your saved content and draft are kept.', 'auth');
}
export async function loadOwnedIdea(id, userId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new IdeaContextError('Adding material is unavailable for this source here.', 'unsupported');
  await confirmIdeaOwner(userId);
  const { data, error } = await supabase.from('voice_notes').select('id,user_id,transcript,business_idea,prd_content').eq('id', id).eq('user_id', userId).single();
  if (error || data?.id !== id || data.user_id !== userId || (data.transcript !== null && typeof data.transcript !== 'string') || (data.business_idea !== null && typeof data.business_idea !== 'string')) throw new IdeaContextError('The saved idea could not be read safely. Your draft is kept.', 'read');
  return data;
}
export const rawMatch = (query, field, value) => value === null ? query.is(field, null) : query.eq(field, value);
export async function saveIdeaAddition({ id, userId, previousRaw, entry }) {
  const latest = await loadOwnedIdea(id, userId);
  if (matchingAddition(latest.transcript, entry)) return latest;
  if (latest.transcript !== previousRaw) throw new IdeaContextError('This idea changed elsewhere. Load the latest saved details, then save your draft again.', 'conflict');
  const transcript = appendIdeaContext(latest.transcript, entry);
  try {
    return await compareAndSetIdea(latest, { transcript }, userId);
  } catch (error) {
    if (['budget', 'auth', 'unsupported'].includes(error.code)) throw error;
    // A transport failure can occur after a committed write. Reconcile once.
  }
  try {
    const confirmed = await loadOwnedIdea(id, userId);
    if (matchingAddition(confirmed.transcript, entry)) return confirmed;
    if (confirmed.transcript !== previousRaw) throw new IdeaContextError('This idea changed elsewhere. Load the latest saved details, then save your draft again.', 'conflict');
  } catch (error) { if (error instanceof IdeaContextError && error.code === 'conflict') throw error; }
  throw new IdeaContextError('Save could not be confirmed. Your draft is kept. Retry checks saved details before adding again.', 'unconfirmed');
}
async function saveGeneratedArtifact(snapshot, text, userId, field) {
  const latest = await loadOwnedIdea(snapshot.id, userId);
  const sameSource = latest.transcript === snapshot.transcript;
  const sameReport = latest.business_idea === snapshot.business_idea;
  if (sameSource && latest[field] === text && (field === 'business_idea' || sameReport)) return latest;
  if (!sameSource || !sameReport || (field === 'prd_content' && latest.prd_content !== snapshot.prd_content)) throw new IdeaContextError('Saved material or the report changed during generation. Your generated text is kept on this page. Load the latest idea before generating again.', 'generation_conflict');
  if (!readIdeaContext(snapshot.transcript).supported) throw new IdeaContextError('Saved details use an unsupported format. Your report is unchanged.', 'unsupported');
  try { return await compareAndSetIdea(snapshot, { [field]: text }, userId, true); }
  catch (error) {
    if (['budget', 'auth', 'unsupported'].includes(error.code)) throw error;
    try {
      const confirmed = await loadOwnedIdea(snapshot.id, userId);
      if (confirmed.transcript === snapshot.transcript && confirmed[field] === text && (field === 'business_idea' || confirmed.business_idea === snapshot.business_idea)) return confirmed;
    } catch { /* A failed reconciliation cannot prove whether the mutation committed. */ }
    throw new IdeaContextError('Could not confirm whether the generated document saved. The generated text is kept on this page. Refresh or check its save before trying generation again.', 'unconfirmed_generation');
  }
}
export const saveGeneratedReport = (snapshot, report, userId) => saveGeneratedArtifact(snapshot, report, userId, 'business_idea');
export const saveGeneratedSpec = (snapshot, spec, userId) => saveGeneratedArtifact(snapshot, spec, userId, 'prd_content');
