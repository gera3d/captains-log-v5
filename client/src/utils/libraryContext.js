// Presentation only: no note content, tokens or record state is stored here.
const prefix = 'goodidea.library-return.v1:';
const views = ['workspace', 'captures', 'ideas', 'featured', 'archived'];
export function readLibraryContext(userId) {
  if (!userId) return null;
  try {
    const key = prefix + userId;
    Object.keys(sessionStorage).filter(item => item.startsWith(prefix) && item !== key).forEach(item => sessionStorage.removeItem(item));
    const value = JSON.parse(sessionStorage.getItem(key));
    if (value?.userId !== userId || !views.includes(value.view) || typeof value.search !== 'string' || value.search.length > 500 || !Number.isFinite(value.scroll) || value.scroll < 0 || value.scroll > 100000 || typeof value.focus !== 'string' || value.focus.length > 180 || (value.focus && !/^(active(?:-report|-spec|-original|-overview)?|title|open|report|spec)-[A-Za-z0-9_-]+$/.test(value.focus))) return null;
    value.disclosures = Array.isArray(value.disclosures) ? value.disclosures.filter(id => typeof id === 'string' && id.length <= 180 && /^inline-(report|original)-[A-Za-z0-9_-]+$/.test(id)).slice(0, 30) : [];
    return value;
  } catch { return null; }
}
export function saveLibraryContext(userId, value) {
  if (!userId) return;
  try { sessionStorage.setItem(prefix + userId, JSON.stringify({ userId, view: value.view, search: value.search.slice(0, 500), scroll: Math.max(0, Math.min(100000, window.scrollY)), focus: value.focus || '', disclosures: (value.disclosures || []).slice(0, 30) })); } catch { /* Navigation still works when storage is unavailable. */ }
}
export function clearLibraryContext(userId) { try { if (userId) sessionStorage.removeItem(prefix + userId); } catch { /* Optional browser presentation state. */ } }
export const artifactTabs = { overview: 'cockpit', report: 'dossier', spec: 'prd', prompts: 'launch_kit', original: 'transcript' };
