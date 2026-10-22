import { supabase } from '../supabaseClient';
import { IdeaContextError, requireContextBudget } from './ideaContext';

const typeName = type => type ? type.name || typeName(type.ofType) : null;
const typeRef = 'kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } }';
const capabilities = new Map();
async function authenticatedHeaders(userId) {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  if (authError || sessionError || !userId || auth?.user?.id !== userId || session?.session?.user?.id !== userId || !session.session.access_token) throw new IdeaContextError('Your current account could not be confirmed. Your saved content and draft are kept.', 'auth');
  const key = import.meta.env.MODE === 'staging' ? 'synthetic-only' : import.meta.env.VITE_SUPABASE_ANON_KEY;
  return { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${session.session.access_token}` };
}
async function graphql(query, variables, userId) {
  const bodyText = JSON.stringify({ query, variables });
  requireContextBudget(bodyText, 12 * 1024 * 1024, 'The complete save request');
  const headers = await authenticatedHeaders(userId);
  const url = import.meta.env.MODE === 'staging' ? '/__mock/graphql' : `${import.meta.env.VITE_SUPABASE_URL}/graphql/v1`;
  let response;
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 30000);
  try { response = await fetch(url, { method: 'POST', headers, body: bodyText, signal: controller.signal }); }
  catch { clearTimeout(deadline); throw new IdeaContextError('The save service did not confirm a response. Your draft is kept; its save will be checked before any retry.', 'transport'); }
  if (!response.ok) { clearTimeout(deadline); throw new IdeaContextError('The save service did not confirm a successful response. Your draft is kept; saved details will be checked before retrying.', 'transport'); }
  let body;
  try { body = await response.json(); } catch { throw new IdeaContextError('The save response could not be read. Your draft is kept.', 'response'); } finally { clearTimeout(deadline); }
  if (!body || typeof body !== 'object' || (Object.hasOwn(body, 'errors') && (!Array.isArray(body.errors) || body.errors.length > 0)) || !body.data || typeof body.data !== 'object') throw new IdeaContextError('The save request could not be confirmed. Your draft is kept.', 'response');
  return body.data;
}
export async function ideaSaveCapability(userId) {
  await authenticatedHeaders(userId);
  if (capabilities.has(userId)) return capabilities.get(userId);
  let stage = 'mutation-schema';
  try {
    const data = await graphql(`query SaveSupport { __schema { mutationType { fields { name args { name type { ${typeRef} } } type { ${typeRef} } } } } }`, {}, userId);
    const field = data.__schema?.mutationType?.fields?.find(row => row.name === 'updatevoice_notesCollection');
    const set = typeName(field?.args?.find(row => row.name === 'set')?.type);
    const filter = typeName(field?.args?.find(row => row.name === 'filter')?.type);
    const result = typeName(field?.type);
    if (!field?.args?.some(row => row.name === 'atMost') || ![set, filter, result].every(value => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value || ''))) throw new Error('unsupported');
    stage = 'set-filter-response-shape';
    const shape = await graphql(`query SaveShape { set: __type(name: "${set}") { inputFields { name } } filter: __type(name: "${filter}") { inputFields { name } } result: __type(name: "${result}") { fields { name type { ${typeRef} } } } }`, {}, userId);
    const names = value => (value || []).map(row => row.name);
    if (!['transcript', 'business_idea'].every(name => names(shape.set?.inputFields).includes(name)) || !['id', 'user_id', 'transcript', 'business_idea'].every(name => names(shape.filter?.inputFields).includes(name)) || !['affectedCount', 'records'].every(name => names(shape.result?.fields).includes(name))) throw new Error('unsupported');
    stage = 'record-type';
    const recordType = typeName(shape.result.fields.find(row => row.name === 'records')?.type);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(recordType || '')) throw new Error('unsupported');
    stage = 'record-fields';
    const record = await graphql(`query SaveRecordShape { record: __type(name: "${recordType}") { fields { name } } }`, {}, userId);
    if (!['id', 'user_id', 'transcript', 'business_idea'].every(name => names(record.record?.fields).includes(name))) throw new Error('unsupported');
    const capability = { available: true, mutation: field.name, set, filter, setFields: names(shape.set.inputFields), filterFields: names(shape.filter.inputFields), recordFields: names(record.record.fields) };
    capabilities.set(userId, capability);
    return capability;
  } catch (error) {
    if (error instanceof IdeaContextError && error.code === 'auth') throw error;
    return { available: false, stage, reason: 'Safe saving is not available for this account here. Your original and draft are unchanged.' };
  }
}
const equal = value => value === null ? { is: 'NULL' } : { eq: value };
export async function compareAndSetIdea(snapshot, changes, userId, includeReport = false) {
  const nullableText = value => value === null || typeof value === 'string';
  const fields = changes && typeof changes === 'object' && !Array.isArray(changes) ? Object.keys(changes) : [];
  const field = fields[0];
  if (!userId || typeof userId !== 'string' || !userId.trim() || !snapshot || Array.isArray(snapshot) || typeof snapshot.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(snapshot.id) || snapshot.user_id !== userId || !nullableText(snapshot.transcript) || !nullableText(snapshot.business_idea) || fields.length !== 1 || !['transcript', 'business_idea', 'prd_content'].includes(field) || typeof changes[field] !== 'string' || typeof includeReport !== 'boolean' || (field !== 'transcript' && !includeReport) || (field === 'prd_content' && !nullableText(snapshot.prd_content))) {
    throw new IdeaContextError('The intended save could not be confirmed safely. Your draft is kept.', 'invalid_snapshot');
  }
  requireContextBudget(snapshot.transcript || '', 2 * 1024 * 1024, 'The saved original and additions');
  requireContextBudget(snapshot.business_idea || '', 2 * 1024 * 1024, 'The saved report');
  for (const value of Object.values(changes)) if (typeof value === 'string') requireContextBudget(value, 2 * 1024 * 1024, 'The new document');
  const capability = await ideaSaveCapability(userId);
  if (!capability.available) throw new IdeaContextError(capability.reason, 'unsupported');
  const filter = { id: { eq: snapshot.id }, user_id: { eq: userId }, transcript: equal(snapshot.transcript) };
  if (includeReport) filter.business_idea = equal(snapshot.business_idea);
  if (Object.hasOwn(changes, 'prd_content')) {
    if (!['setFields', 'filterFields', 'recordFields'].every(key => capability[key].includes('prd_content'))) throw new IdeaContextError('Safe product spec saving is unavailable here.', 'unsupported');
    filter.prd_content = equal(snapshot.prd_content);
  }
  const data = await graphql(`mutation SaveIdea($set: ${capability.set}!, $filter: ${capability.filter}!) { saved: ${capability.mutation}(set: $set, filter: $filter, atMost: 1) { affectedCount records { id user_id transcript business_idea prd_content } } }`, { set: changes, filter }, userId);
  const result = data.saved;
  const row = Array.isArray(result?.records) && result.records.length === 1 ? result.records[0] : null;
  if (result?.affectedCount !== 1 || row?.id !== snapshot.id || row.user_id !== userId || row.transcript !== (Object.hasOwn(changes, 'transcript') ? changes.transcript : snapshot.transcript) || (Object.hasOwn(changes, 'business_idea') && row.business_idea !== changes.business_idea) || (Object.hasOwn(changes, 'prd_content') && row.prd_content !== changes.prd_content)) throw new IdeaContextError('The change could not be confirmed. Saved details may have changed. Your draft and current report are kept.', 'conflict');
  return row;
}
