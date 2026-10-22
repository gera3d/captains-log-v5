import { UserFacingError } from './userFacingError';
import { savedText } from '../components/NotePreview';

export const CONTEXT_VERSION = 1;
export const CONTEXT_LIMITS = Object.freeze({ sourceBytes: 512 * 1024, additionBytes: 64 * 1024, additions: 100, envelopeBytes: 2 * 1024 * 1024 });
export const utf8Bytes = value => new TextEncoder().encode(value).length;
export function requireContextBudget(value, limit, label) {
  if (utf8Bytes(value) > limit) throw new IdeaContextError(`${label} is too large to save safely here. Your original and draft are kept; no text was shortened.`, 'budget');
}
const marker = 'goodidea_context';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class IdeaContextError extends UserFacingError {
  constructor(message, code = 'context_error') { super(message); this.name = 'IdeaContextError'; this.code = code; }
}
export function readIdeaContext(raw) {
  if (raw !== null && typeof raw !== 'string') return { supported: false, reason: 'The saved original could not be read safely.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { /* A legacy plain-text original is valid. */ }
  if (parsed && typeof parsed === 'object' && Object.hasOwn(parsed, marker)) {
    const invalid = { supported: false, reason: 'These saved details use an unsupported format. They have not been changed.' };
    if (parsed[marker] !== CONTEXT_VERSION || (parsed.originalRaw !== null && typeof parsed.originalRaw !== 'string') || !Array.isArray(parsed.additions)) return invalid;
    const seen = new Set();
    for (const item of parsed.additions) {
      if (!item || !uuid.test(item.id) || seen.has(item.id) || !['text', 'transcript'].includes(item.type) || typeof item.text !== 'string' || !item.text.trim() || typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) || new Date(item.createdAt).toISOString() !== item.createdAt) return invalid;
      seen.add(item.id);
    }
    const original = parsed.originalRaw === null ? '' : savedText(parsed.originalRaw);
    const combined = [original, ...parsed.additions.map(item => item.text)].filter(value => value.trim()).join('\n\n');
    if (![parsed.data, parsed.text, parsed.transcript].every(value => value === combined)) return invalid;
    return { supported: true, originalRaw: parsed.originalRaw, original, additions: parsed.additions, combined, envelope: true };
  }
  const original = raw === null ? '' : savedText(raw);
  return { supported: true, originalRaw: raw, original, additions: [], combined: original, envelope: false };
}
export function appendIdeaContext(raw, addition) {
  const context = readIdeaContext(raw);
  if (!context.supported) throw new IdeaContextError(context.reason, 'unsupported');
  const found = context.additions.find(item => item.id === addition.id);
  if (found) {
    if (JSON.stringify(found) !== JSON.stringify(addition)) throw new IdeaContextError('A saved addition could not be confirmed. Your draft is kept.', 'identity_conflict');
    return raw;
  }
  requireContextBudget(context.originalRaw || '', CONTEXT_LIMITS.sourceBytes, 'The original material');
  requireContextBudget(addition.text, CONTEXT_LIMITS.additionBytes, 'This addition');
  if (context.additions.length >= CONTEXT_LIMITS.additions) throw new IdeaContextError('This idea has reached the limit of 100 saved additions. Your draft is kept.', 'budget');
  const additions = [...context.additions, addition];
  const combined = [context.original, ...additions.map(item => item.text)].filter(value => value.trim()).join('\n\n');
  requireContextBudget(combined, CONTEXT_LIMITS.sourceBytes, 'The combined material');
  const serialized = JSON.stringify({ [marker]: CONTEXT_VERSION, originalRaw: context.originalRaw, additions, data: combined, text: combined, transcript: combined });
  requireContextBudget(serialized, CONTEXT_LIMITS.envelopeBytes, 'The saved material');
  if (!readIdeaContext(serialized).supported) throw new IdeaContextError('The addition could not be prepared safely. Your draft is kept.', 'invalid_addition');
  return serialized;
}
export function matchingAddition(raw, entry) {
  const context = readIdeaContext(raw);
  const item = context.supported && context.additions.find(row => row.id === entry.id);
  return item && item.text === entry.text && item.type === entry.type && item.createdAt === entry.createdAt;
}
