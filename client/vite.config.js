import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

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
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'staging' ? [mockStagingPlugin()] : [])],
  server: { host: '127.0.0.1', port: mode === 'staging' ? 5176 : 5174, strictPort: true, ...(mode === 'staging' ? {} : { allowedHosts: ['idea.why57.com'] }) },
  preview: { host: '127.0.0.1', port: 5176, strictPort: true },
}));
