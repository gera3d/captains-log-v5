import assert from 'node:assert/strict';
import { betaConfig } from '../config/beta.mjs';

const form = 'https://docs.google.com/forms/d/e/synthetic-responder/viewform';
const settings = { VITE_BETA_MODE: 'true', VITE_BETA_WAITLIST_URL: form };
for (const mode of ['production', 'live', 'staging']) {
  assert.deepEqual(betaConfig(settings, mode), { enabled: true, responderUrl: form });
  assert.deepEqual(betaConfig({ VITE_BETA_MODE: 'true' }, mode), { enabled: true, responderUrl: '' });
  for (const setting of ['', 'false', undefined]) {
    assert.deepEqual(betaConfig({ ...settings, VITE_BETA_MODE: setting }, mode), { enabled: false, responderUrl: '' });
  }
  for (const setting of ['TRUE', '1', 'yes', ' true ']) {
    assert.throws(() => betaConfig({ ...settings, VITE_BETA_MODE: setting }, mode), /VITE_BETA_MODE/);
  }
  for (const url of [
    'not-a-url', 'javascript:alert(1)', 'https://forms.gle/synthetic',
    'https://docs.google.com/forms/d/owner-id/preview',
    'https://docs.google.com/forms/d/owner-id/edit',
    'https://docs.google.com/forms/d/e/synthetic/formResponse',
    'https://docs.google.com.evil.invalid/forms/d/e/synthetic/viewform',
    'http://docs.google.com/forms/d/e/synthetic/viewform',
    'https://user:password@docs.google.com/forms/d/e/synthetic/viewform',
    `${form}?entry.123=email`, `${form}#fragment`,
  ]) {
    assert.throws(() => betaConfig({ ...settings, VITE_BETA_WAITLIST_URL: url }, mode), /VITE_BETA_WAITLIST_URL/);
  }
}
const local = { ...settings, VITE_BETA_WAITLIST_URL: 'http://127.0.0.1:5194/waitlist-form' };
assert.equal(betaConfig(local, 'staging').responderUrl, local.VITE_BETA_WAITLIST_URL);
for (const mode of ['production', 'live', 'development']) {
  assert.throws(() => betaConfig(local, mode), /staging-only/);
}
console.log('Beta configuration checks passed: explicit mode, canonical responder URL, missing URL fail-closed, local fixtures confined to staging.');
