// Browser-only synthetic preview. This is not Supabase, OAuth, or API qualification.
const STORAGE_KEY = 'goodidea.mock-staging.v1';
const user = { id: 'mock-staging-user', email: 'preview@example.invalid', user_metadata: { full_name: 'Staging Preview', username: 'preview' } };
const session = { user, access_token: 'mock-staging-only-not-a-real-token' };
const listeners = new Set();
const channels = new Set();
function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { voice_notes: [{ id: 'mock-note-1', user_id: user.id, title: 'Synthetic staging idea', transcript: 'A local project notebook for testing the Good Idea interface.', summary: 'Synthetic data for private preview only.', created_at: '2026-10-16T12:00:00.000Z', archived: false, is_featured: false }], ideas: [] };
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
          store[table] = rows.map(row => result.includes(row) ? { ...row, ...values } : row);
          result = store[table].filter(row => filters.every(matches => matches(row)));
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
    getSession: async () => ({ data: { session }, error: null }),
    getUser: async () => ({ data: { user }, error: null }),
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
    if (url.pathname.startsWith('/__mock/workflows/')) {
      if (url.pathname.endsWith('/summarize')) return json({ idea: mockIdea, text: mockIdea, mock: true });
      if (url.pathname.endsWith('/prd')) return json({ prd: mockPrd, text: mockPrd, mock: true });
      if (url.pathname.endsWith('/transcribe')) return json([{ text: 'Synthetic transcript. Audio transcription is not connected.' }]);
      return json({ error: 'Unknown mock workflow' }, 404);
    }
    if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
    const method = options.method || (input instanceof Request ? input.method : 'GET');
    const store = load();
    if (url.pathname === '/api/v1/ideas' && method === 'GET') return json({ ideas: store.ideas });
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
