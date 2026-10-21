export function betaConfig(env, mode) {
  const setting = env.VITE_BETA_MODE ?? '';
  if (!['', 'true', 'false'].includes(setting)) {
    throw new Error('VITE_BETA_MODE must be true, false or unset.');
  }
  const enabled = setting === 'true';
  const responderUrl = env.VITE_BETA_WAITLIST_URL?.trim() || '';
  if (!enabled || !responderUrl) return { enabled, responderUrl: '' };

  let url;
  try {
    url = new URL(responderUrl);
  } catch {
    throw new Error('VITE_BETA_WAITLIST_URL requires an official Google Forms responder URL.');
  }
  const googleForm = url.origin === 'https://docs.google.com'
    && /^\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform$/.test(url.pathname);
  const localFixture = mode === 'staging' && url.protocol === 'http:'
    && url.hostname === '127.0.0.1' && url.port && url.pathname === '/waitlist-form';
  if ((!googleForm && !localFixture) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_BETA_WAITLIST_URL requires https://docs.google.com/forms/d/e/<published-id>/viewform; loopback fixtures are staging-only.');
  }
  return { enabled, responderUrl: url.href };
}
