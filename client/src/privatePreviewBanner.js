// Separate-origin links deliberately carry no query, fragment, auth token or sample data.
export function installPrivatePreviewBanner({ mock, live, urls, document }) {
  if (!mock && !live) return;
  const banner = document.createElement('section');
  banner.className = `private-preview-banner ${live ? 'private-preview-banner--live' : ''}`;
  banner.setAttribute('aria-label', 'Private test website');
  if (mock) banner.dataset.stagingBanner = 'true';
  else banner.dataset.livePreviewBanner = 'true';

  const description = document.createElement('div');
  description.className = 'private-preview-description';
  const identity = document.createElement('strong');
  identity.textContent = mock ? 'Viewing sample data' : 'Viewing my real data';
  const warning = document.createElement('p');
  warning.textContent = mock
    ? 'MOCK STAGING — Synthetic local data. No production backend or real AI. Browser data persists on this origin.'
    : 'LIVE BACKEND — Saves, deletes, uploads and AI requests affect the real app and may incur costs. Sign in with your own account.';
  description.append(identity, warning);

  const navigation = document.createElement('nav');
  navigation.className = 'private-preview-switch';
  navigation.setAttribute('aria-label', 'Choose website data');
  for (const [key, label, active] of [['sample', 'Sample data', mock], ['real', 'My real data', live]]) {
    const link = document.createElement('a');
    link.href = urls[key];
    link.textContent = label;
    if (active) link.setAttribute('aria-current', 'page');
    navigation.append(link);
  }
  banner.append(description, navigation);
  document.body.prepend(banner);
  document.title = mock ? '[MOCK STAGING] GoodIdea' : '[LIVE BACKEND TEST] GoodIdea';
}
