import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const evidence = resolve(process.env.BETA_EVIDENCE_DIR || 'artifacts/beta-relaunch');
mkdirSync(evidence, { recursive: true });
const responder = 'https://docs.google.com/forms/d/e/synthetic-responder/viewform';
const scenarios = [
  { label: 'staging-beta', mode: 'staging', enabled: true, url: 'http://127.0.0.1:5194/waitlist-form' },
  { label: 'production-beta', mode: 'production', enabled: true, url: responder },
  { label: 'production-beta-missing-url', mode: 'production', enabled: true, url: '' },
  { label: 'production-non-beta', mode: 'production', enabled: false, url: '' },
];
function run(args, env, log) {
  const result = spawnSync(process.execPath, args, { env, encoding: 'utf8' });
  writeFileSync(join(evidence, log), `${result.stdout || ''}${result.stderr || ''}`);
  if (result.status !== 0) throw new Error(`${log} failed: ${result.error || result.stderr || result.stdout}`);
}
run(['scripts/verify-beta-config.mjs'], process.env, 'config-checks.log');
for (const scenario of scenarios) {
  const output = `artifacts/beta-relaunch/${scenario.label}`;
  const env = {
    ...process.env,
    VITE_BETA_MODE: String(scenario.enabled), VITE_BETA_WAITLIST_URL: scenario.url,
    VITE_SUPABASE_URL: 'http://127.0.0.1:9', VITE_SUPABASE_ANON_KEY: 'synthetic-public-placeholder',
    VITE_REDIRECT_URL: 'http://127.0.0.1:9', VITE_WORKFLOW_BASE_URL: '',
    BETA_BUILD_DIR: output, BETA_EVIDENCE_DIR: evidence, BETA_CHECK_LABEL: scenario.label,
    BETA_EXPECT_ENABLED: String(scenario.enabled), BETA_EXPECT_URL: scenario.url,
    BETA_EXPECT_MOCK: String(scenario.mode === 'staging'),
  };
  console.log(`Building ${scenario.label} with synthetic configuration.`);
  run(['node_modules/vite/bin/vite.js', 'build', '--mode', scenario.mode, '--outDir', output], env, `${scenario.label}-build.log`);
  console.log(`Checking ${scenario.label} UI and navigation.`);
  run(['scripts/verify-beta-relaunch.mjs'], env, `${scenario.label}-browser.log`);
  console.log(`${scenario.label} passed.`);
}
console.log(`Beta matrix passed; evidence: ${evidence}`);
