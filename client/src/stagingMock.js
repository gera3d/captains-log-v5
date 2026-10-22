// Browser-only synthetic preview. This is not Supabase, OAuth, or API qualification.
import { isMockStaging } from './runtimeConfig';
import dashboardPreview from './fixtures/dashboard-preview.json';

// A reloadable public-page fixture, confined to the existing synthetic build.
const previewSignedOut = isMockStaging && new URLSearchParams(window.location.search).get('preview') === 'homepage';
const STORAGE_KEY = 'goodidea.mock-staging.v4';
const user = { id: 'mock-staging-user', email: 'preview@example.invalid', user_metadata: { full_name: 'Staging Preview', username: 'preview' } };
const session = { user, access_token: 'mock-staging-only-not-a-real-token' };
const listeners = new Set();
const channels = new Set();
function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const store = saved ? JSON.parse(saved) : dashboardPreview;
  return { ...store, voice_notes: (store.voice_notes || []).map(row => ({ transcript: null, business_idea: null, prd_content: null, ...row })) };
}
function save(store) { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
function emit(event, row, old = {}) {
  for (const channel of channels) for (const item of channel.handlers) {
    if (item.filter.event === event) queueMicrotask(() => item.callback({ new: row, old }));
  }
}
function query(table) {
  const filters = [];
  let operation = 'select', values, single = false, sort;
  const chain = {
    select() { return chain; },
    eq(key, value) { filters.push(row => row[key] === value); return chain; },
    is(key, value) { filters.push(row => row[key] === value); return chain; },
    order(key, options = {}) { sort = { key, ascending: options.ascending !== false }; return chain; },
    insert(rows) { operation = 'insert'; values = Array.isArray(rows) ? rows : [rows]; return chain; },
    update(row) { operation = 'update'; values = row; return chain; },
    delete() { operation = 'delete'; return chain; },
    single() { single = true; return chain; },
    maybeSingle() { single = true; return chain; },
    then(resolve, reject) {
      return Promise.resolve().then(() => {
        const store = load(), rows = store[table] || [];
        let result = rows.filter(row => filters.every(matches => matches(row)));
        if (operation === 'insert') {
          result = values.map(row => ({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row }));
          store[table] = [...rows, ...result];
          save(store);
          if (table === 'voice_notes') result.forEach(row => emit('INSERT', row));
        } else if (operation === 'update') {
          const matchedIds = new Set(result.map(row => row.id));
          store[table] = rows.map(row => matchedIds.has(row.id) ? { ...row, ...values } : row);
          result = store[table].filter(row => matchedIds.has(row.id));
          save(store);
          if (table === 'voice_notes') result.forEach(row => emit('UPDATE', row));
        } else if (operation === 'delete') {
          store[table] = rows.filter(row => !result.includes(row)); save(store);
          if (table === 'voice_notes') result.forEach(row => emit('DELETE', {}, row));
        }
        if (sort) result.sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * (sort.ascending ? 1 : -1));
        return { data: single ? result[0] || null : result, error: null };
      }).then(resolve, reject);
    },
  };
  return chain;
}
const disabled = async () => ({ data: null, error: { message: 'Unavailable in mock staging. No real authentication, storage, or integrations are connected.' } });
export const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: previewSignedOut ? null : session }, error: null }),
    getUser: async () => ({ data: { user: previewSignedOut ? null : user }, error: null }),
    onAuthStateChange(callback) { listeners.add(callback); return { data: { subscription: { unsubscribe() { listeners.delete(callback); } } } }; },
    signInWithOAuth: disabled, signInWithPassword: disabled, signUp: disabled,
    async signOut() { listeners.forEach(fn => fn('SIGNED_OUT', null)); return { error: null }; },
  },
  from: query,
  channel() { const channel = { handlers: [], on(_type, filter, callback) { channel.handlers.push({ filter, callback }); return channel; }, subscribe() { channels.add(channel); return channel; } }; return channel; },
  removeChannel(channel) { channels.delete(channel); },
  functions: { invoke: disabled },
  storage: { from: () => ({ upload: disabled, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
};
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-GoodIdea-Mock': 'true' } }); }
const mockIdea = '# Synthetic idea preview\n\n## Summary\nA deterministic local example for UI testing. No AI provider was contacted.\n\n## Problem\nTeams need a safe place to refine ideas.\n\n## Solution\nA private notebook for testing the interface.';
const mockPrd = '# Synthetic PRD preview\n\n## Scope\nExercise the interface using local synthetic data.\n\n## Acceptance criteria\nNo production services are contacted. This is not a generated product specification.';
export function installStagingFetch() {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    if (url.origin !== window.location.origin) throw new Error('Mock staging blocks external requests.');
    if (url.pathname === '/__mock/graphql') {
      const { query: document = '', variables = {} } = JSON.parse(options.body || '{}');
      const scalar = name => ({ kind: 'SCALAR', name, ofType: null });
      const object = name => ({ kind: 'OBJECT', name, ofType: null });
      const recordsType = { kind: 'NON_NULL', name: null, ofType: { kind: 'LIST', name: null, ofType: { kind: 'NON_NULL', name: null, ofType: object('voice_notes') } } };
      const names = ['id', 'user_id', 'transcript', 'business_idea', 'prd_content'];
      if (document.includes('query SaveSupport')) return json({ data: { __schema: { mutationType: { fields: [{ name: 'updatevoice_notesCollection', args: [{ name: 'set', type: { kind: 'INPUT_OBJECT', name: 'voice_notesUpdateInput' } }, { name: 'filter', type: { kind: 'INPUT_OBJECT', name: 'voice_notesFilter' } }, { name: 'atMost', type: scalar('Int') }], type: object('voice_notesUpdateResponse') }] } } } });
      if (document.includes('query SaveShape')) return json({ data: { set: { inputFields: names.map(name => ({ name })) }, filter: { inputFields: names.map(name => ({ name })) }, result: { fields: [{ name: 'affectedCount', type: scalar('Int') }, { name: 'records', type: recordsType }] } } });
      if (document.includes('query SaveRecordShape')) return json({ data: { record: { fields: names.map(name => ({ name })) } } });
      if (document.includes('mutation SaveIdea')) {
        const store = load();
        const { set = {}, filter = {} } = variables;
        const matches = row => row.user_id === user.id && Object.entries(filter).every(([key, condition]) => Object.hasOwn(condition, 'eq') ? row[key] === condition.eq : condition.is === 'NULL' && row[key] === null);
        const matched = store.voice_notes.filter(matches);
        if (matched.length > 1) return json({ errors: [{ message: 'Synthetic atMost limit exceeded.' }] });
        const ids = new Set(matched.map(row => row.id));
        store.voice_notes = store.voice_notes.map(row => ids.has(row.id) ? { ...row, ...set } : row);
        const records = store.voice_notes.filter(row => ids.has(row.id));
        save(store);
        records.forEach(row => emit('UPDATE', row));
        return json({ data: { saved: { affectedCount: records.length, records } } });
      }
      return json({ errors: [{ message: 'Unsupported synthetic GraphQL operation.' }] });
    }
    if (url.pathname.startsWith('/__mock/workflows/')) {
      if (url.pathname.endsWith('/summarize')) return json({ idea: mockIdea, text: mockIdea, mock: true });
      if (url.pathname.endsWith('/prd')) return json({ prd: mockPrd, text: mockPrd, mock: true });
      if (url.pathname.endsWith('/transcribe')) return json([{ text: 'Synthetic transcript. Audio transcription is not connected.' }]);
      return json({ error: 'Unknown mock workflow' }, 404);
    }
    if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
    const method = options.method || (input instanceof Request ? input.method : 'GET');
    const store = load();
    if (url.pathname === '/api/v1/ideas' && method === 'GET') {
      const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
      const offset = Number(url.searchParams.get('offset')) || 0;
      // Match the real authenticated list: another account's and ownerless
      // ambient copies are outside this caller's visible list and total.
      const ownedIdeas = store.ideas.filter(idea => idea.userId === user.id);
      return json({ ideas: ownedIdeas.slice(offset, offset + limit), total: ownedIdeas.length, limit, offset });
    }
    if (url.pathname === '/api/v1/ideas/ingest' && method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const idea = { id: `idea_${crypto.randomUUID()}`, userId: user.id, title: body.title || 'Synthetic local idea', transcript: body.transcript, summary: 'Local preview only', businessIdeaMarkdown: body.synthesize ? mockIdea : '', createdAt: new Date().toISOString(), tags: ['mock-staging'] };
      store.ideas.push(idea); save(store); return json(idea, 201);
    }
    const match = url.pathname.match(/^\/api\/v1\/ideas\/([^/]+)(\/prd)?$/);
    if (match) {
      const idea = store.ideas.find(row => row.id === match[1]);
      if (!idea) return json({ error: 'Synthetic idea not found' }, 404);
      if (match[2] && method === 'POST') { idea.prdContent = mockPrd; save(store); return json({ prdContent: mockPrd, mock: true }); }
      if (method === 'PATCH' || method === 'PUT') {
        const patch = JSON.parse(options.body || '{}');
        Object.assign(idea, patch);
        if ('business_idea' in patch) idea.businessIdeaMarkdown = patch.business_idea;
        if ('is_featured' in patch) idea.isFeatured = patch.is_featured;
        save(store);
      }
      if (method === 'DELETE') { store.ideas = store.ideas.filter(row => row.id !== idea.id); save(store); }
      return json(idea);
    }
    // No network fallback for unsupported routes, credentials, or external actions.
    return json({ error: 'This API operation is unavailable in mock staging.' }, 501);
  };
}
