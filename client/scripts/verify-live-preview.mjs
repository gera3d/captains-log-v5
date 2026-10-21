// Independent transport check. Starts disposable loopback upstreams only;
// never reads local credential files or sends a request to production.
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const vite = join(root, 'node_modules/vite/bin/vite.js');
const workspace = await mkdtemp(join(tmpdir(), 'goodidea-live-check-'));
const children = new Set();
const requests = [];
const stub = http.createServer(async (req, res) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  const record = { method: req.method, path: req.url, authorization: req.headers.authorization || null, body };
  requests.push(record);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(record));
});
await new Promise(resolve => stub.listen(0, '127.0.0.1', resolve));
const upstream = `http://127.0.0.1:${stub.address().port}`;
// Process values take precedence over ignored .env.live.local values.
const env = { ...process.env, VITE_SUPABASE_URL: upstream, VITE_SUPABASE_ANON_KEY: 'sb_publishable_synthetic_verification_only', VITE_REDIRECT_URL: 'http://127.0.0.1:5177', VITE_WORKFLOW_BASE_URL: '/__live/workflows', LIVE_API_TARGET: upstream, LIVE_WORKFLOW_TARGET: upstream };
function launch(args, overrides = {}) {
  const child = spawn(process.execPath, [vite, ...args], { cwd: root, env: { ...env, ...overrides }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.add(child);
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  child.on('exit', () => children.delete(child));
  return { child, output: () => output };
}
async function finish(processInfo) {
  if (processInfo.child.exitCode !== null) return processInfo.child.exitCode;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { processInfo.child.kill('SIGTERM'); reject(new Error('Local verification subprocess timed out')); }, 60000);
    processInfo.child.once('exit', code => { clearTimeout(timeout); resolve(code); });
  });
}
async function stop(info) {
  if (info.child.exitCode !== null) return;
  info.child.kill('SIGTERM');
  await new Promise(resolve => info.child.once('exit', resolve));
}
async function freePort() {
  const server = http.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function waitFor(origin, info) {
  for (let i = 0; i < 150; i++) {
    if (info.child.exitCode !== null) throw new Error('Disposable Vite server exited before readiness');
    try { const response = await fetch(origin); if (response.ok) return response; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Disposable Vite server did not become ready');
}
let browser;
const checks = [];
try {
  const packageJson = JSON.parse(await (await import('node:fs/promises')).readFile(join(root, 'package.json'), 'utf8'));
  assert.match(packageJson.scripts['dev:live'], /127\.0\.0\.1/);
  assert.match(packageJson.scripts['dev:live'], /5177/);
  assert.match(packageJson.scripts['preview:live'], /5177/);
  assert.match(packageJson.scripts['dev:staging'], /5176/);
  assert.match(packageJson.scripts['preview:staging'], /5176/);
  checks.push('distinct explicit loopback ports for live and mock commands');
  for (const name of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_REDIRECT_URL', 'VITE_WORKFLOW_BASE_URL', 'LIVE_API_TARGET', 'LIVE_WORKFLOW_TARGET']) {
    const missing = launch(['build', '--mode', 'live', '--outDir', join(workspace, 'missing')], { [name]: '' });
    assert.notEqual(await finish(missing), 0, `Missing ${name} must refuse startup/build`);
  }
  checks.push('missing configuration fails closed without endpoint fallback');
  for (const key of ['sb_secret_synthetic_rejected', `header.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`]) {
    const privileged = launch(['build', '--mode', 'live', '--outDir', join(workspace, 'privileged')], { VITE_SUPABASE_ANON_KEY: key });
    assert.notEqual(await finish(privileged), 0, 'Privileged or unrecognized Supabase key must be rejected');
  }
  checks.push('secret and legacy service-role Supabase keys rejected');
  const build = launch(['build', '--mode', 'live', '--outDir', join(workspace, 'build')]);
  assert.equal(await finish(build), 0, 'Placeholder-only live build must pass');
  checks.push('live build with synthetic browser settings');
  const cachedChrome = `${homedir()}/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(cachedChrome) ? cachedChrome : undefined) });
  for (const mode of ['development', 'built-preview']) {
    const port = await freePort();
    const origin = `http://127.0.0.1:${port}`;
    const info = launch([...(mode === 'built-preview' ? ['preview', '--outDir', join(workspace, 'build')] : []), '--mode', 'live', '--host', '127.0.0.1', '--port', String(port), '--strictPort']);
    try {
      const response = await waitFor(origin, info);
      assert.match(response.headers.get('x-goodidea-environment') || '', /live/);
      assert.match(response.headers.get('cache-control') || '', /no-cache|no-store/);
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const external = [];
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) { external.push({ origin: url.origin, type: route.request().resourceType() }); await route.abort(); } else await route.continue();
      });
      const page = await context.newPage();
      await page.goto(origin, { waitUntil: 'networkidle' });
      await expect(page.locator('[data-live-preview-banner="true"]')).toBeVisible();
      await expect(page.locator('[data-live-preview-banner="true"]')).toContainText(/LIVE BACKEND/);
      // The browser receives a synthetic Supabase origin. Any automatic request
      // is intercepted before transmission, and no real sign-in is attempted.
      await context.close();
      for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
        const path = '/api/v1/verification-only?synthetic=yes';
        const body = method === 'GET' ? undefined : JSON.stringify({ synthetic: method });
        const result = await fetch(origin + path, { method, headers: { authorization: 'Bearer synthetic-verification-only', 'content-type': 'application/json' }, body });
        assert.equal(result.status, 200);
        assert.deepEqual(await result.json(), { method, path, authorization: 'Bearer synthetic-verification-only', body: body || '' });
      }
      const workflowPath = '/__live/workflows/prd?synthetic=yes';
      const workflow = await fetch(origin + workflowPath, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"synthetic":true}' });
      assert.deepEqual(await workflow.json(), { method: 'POST', path: '/webhook/prd?synthetic=yes', authorization: null, body: '{"synthetic":true}' });
      assert.ok(external.every(value => value.origin === upstream || (['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://i.pravatar.cc'].includes(value.origin) && ['stylesheet', 'font', 'image'].includes(value.type))), 'Browser attempted an unexpected application destination; all external requests were intercepted');
      checks.push(`${mode}: visible live warning, environment header/revalidation, API methods/query/body/auth forwarding, workflow prefix rewrite`);
    } finally { await stop(info); }
  }
  console.log(JSON.stringify({ passed: true, checks, syntheticUpstreamRequests: requests.length, productionRequests: 0, limits: ['No actual login, data, storage, API or AI workflow operation performed', 'Real authentication redirects and backend permission behavior require Gera manual testing'] }, null, 2));
} finally {
  if (browser) await browser.close();
  for (const child of children) child.kill('SIGTERM');
  await new Promise(resolve => stub.close(resolve));
  await rm(workspace, { recursive: true, force: true });
}
