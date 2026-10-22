// A navigation destination only: it never selects a backend or carries session state.
export function privatePreviewUrls(env = {}) {
  const supplied = env.VITE_MOCK_PREVIEW_URL || 'http://127.0.0.1:5176';
  let url;
  try { url = new URL(supplied); } catch { throw new Error('VITE_MOCK_PREVIEW_URL must be an explicit HTTP loopback origin.'); }
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    || !url.port || url.port === '5177' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_MOCK_PREVIEW_URL must be an HTTP loopback origin with its own port, without credentials, path, query or fragment.');
  }
  return { sample: `${url.origin}/`, real: 'http://127.0.0.1:5177/' };
}
