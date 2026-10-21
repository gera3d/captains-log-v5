import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { betaConfig } from './config/beta.mjs'

const stagingCsp = "default-src 'self'; connect-src 'self' ws://127.0.0.1:5176; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'";
function mockStagingPlugin() {
  const middleware = (_req, res, next) => {
    res.setHeader('Content-Security-Policy', stagingCsp);
    res.setHeader('X-GoodIdea-Environment', 'mock-staging');
    next();
  };
  return {
    name: 'private-mock-staging',
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
    transformIndexHtml(html) {
      // Do not even preconnect to production or third-party font services.
      return html.replace(/\s*<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/g, '');
    },
  };
}
function livePreviewConfig(env) {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_REDIRECT_URL', 'VITE_WORKFLOW_BASE_URL', 'LIVE_API_TARGET', 'LIVE_WORKFLOW_TARGET'];
  for (const name of required) {
    if (!env[name]?.trim()) throw new Error(`Live preview requires ${name}; configure ignored .env.live.local.`);
  }
  for (const name of ['VITE_SUPABASE_URL', 'LIVE_API_TARGET', 'LIVE_WORKFLOW_TARGET']) {
    let url;
    try { url = new URL(env[name]); } catch { throw new Error(`Live preview requires a valid ${name}.`); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
      throw new Error(`Live preview requires an HTTP(S) origin without credentials or paths for ${name}.`);
    }
  }
  if (env.VITE_REDIRECT_URL !== 'http://127.0.0.1:5177') throw new Error('Live preview requires VITE_REDIRECT_URL=http://127.0.0.1:5177.');
  if (env.VITE_WORKFLOW_BASE_URL !== '/__live/workflows') throw new Error('Live preview requires VITE_WORKFLOW_BASE_URL=/__live/workflows.');
  const key = env.VITE_SUPABASE_ANON_KEY;
  let browserSafe = key.startsWith('sb_publishable_');
  if (!browserSafe) {
    try { browserSafe = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon'; } catch { /* Rejected below. */ }
  }
  if (!browserSafe) throw new Error('Live preview requires a browser-safe publishable or legacy anon Supabase key.');
  return {
    '^/api/v1(?:/|[?]|$)': { target: env.LIVE_API_TARGET, changeOrigin: true },
    '^/__live/workflows/': {
      target: env.LIVE_WORKFLOW_TARGET,
      changeOrigin: true,
      rewrite: path => path.replace(/^\/__live\/workflows\//, '/webhook/'),
    },
  };
}

function livePreviewPlugin() {
  const middleware = (_req, res, next) => {
    res.setHeader('X-GoodIdea-Environment', 'live-backend-preview');
    res.setHeader('Cache-Control', 'no-store');
    next();
  };
  return {
    name: 'private-live-backend-preview',
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

export default defineConfig(({ mode }) => {
  betaConfig({ ...loadEnv(mode, process.cwd(), ''), ...process.env }, mode);
  const live = mode === 'live';
  // Explicit live mode has no hardcoded backend target or production fallback.
  const proxy = live ? livePreviewConfig(loadEnv(mode, process.cwd(), '')) : undefined;
  return {
    plugins: [react(), ...(mode === 'staging' ? [mockStagingPlugin()] : []), ...(live ? [livePreviewPlugin()] : [])],
    server: { host: '127.0.0.1', port: live ? 5177 : mode === 'staging' ? 5176 : 5174, strictPort: true, ...(live ? { proxy } : mode === 'staging' ? {} : { allowedHosts: ['idea.why57.com'] }) },
    preview: { host: '127.0.0.1', port: live ? 5177 : 5176, strictPort: true, ...(live ? { proxy } : {}) },
    ...(live ? { build: { outDir: 'dist-live' } } : {}),
  };
});
