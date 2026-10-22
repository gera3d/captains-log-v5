import { UserFacingError } from './userFacingError';
// Provider response bodies are deliberately never part of a user-facing error.
export class GenerationError extends UserFacingError {
  constructor(message, code = 'generation_failed', status = null) {
    super(message);
    this.name = 'GenerationError';
    this.code = code;
    this.status = status;
  }
}
export function generationMessage(error) {
  return error instanceof UserFacingError ? error.message : 'Generation or its save could not be confirmed. Refresh the idea before trying again.';
}
const byteLength = value => new TextEncoder().encode(value).length;
export function requireGenerationInput(text) {
  if (byteLength(text) > 512 * 1024) throw new GenerationError('The saved material is too large to send safely here (512 KB limit). Nothing was shortened or sent. Your saved content is unchanged.', 'input_budget');
}
export async function generationJson(url, options, label = 'generation') {
  if (typeof options?.body === 'string' && byteLength(options.body) > 2 * 1024 * 1024) throw new GenerationError('The generation request is too large to send safely here. Nothing was shortened or sent. Your saved content is unchanged.', 'input_budget');
  let response;
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 180000);
  try { response = await fetch(url, { ...options, signal: controller.signal }); }
  catch {
    clearTimeout(deadline);
    if (controller.signal.aborted) throw new GenerationError(`The ${label} service did not respond in time. Its processing may continue. No generated document was saved by this request. Check before starting again.`, 'timeout');
    throw new GenerationError(`The ${label} service could not be reached. Your saved content is unchanged. Try again later.`, 'network');
  }
  if (!response.ok) {
    clearTimeout(deadline);
    const message = response.status === 429 ? `The ${label} service is busy. Your saved content is unchanged. Try again later.` : response.status >= 500 ? `The ${label} service is temporarily unavailable (${response.status}). Your saved content is unchanged. Try again later.` : `The ${label} request was not accepted (${response.status}). Your saved content is unchanged.`;
    throw new GenerationError(message, 'http', response.status);
  }
  let data;
  try { data = await response.json(); }
  catch { throw new GenerationError(`The ${label} service returned an unreadable response. Your saved content is unchanged. Try again later.`, 'invalid_json'); } finally { clearTimeout(deadline); }
  if (!data || typeof data !== 'object') throw new GenerationError(`The ${label} service returned an incomplete response. Your saved content is unchanged.`, 'invalid_response');
  return data;
}
export function generationText(data, keys, label = 'generation') {
  const text = keys.map(key => data?.[key]).find(value => typeof value === 'string' && value.trim());
  if (!text || /<!doctype\s+html|<\/?(?:html|head|body)(?:\s|>)/i.test(text)) throw new GenerationError(`The ${label} service did not return usable text. Your saved content is unchanged. Try again later.`, 'invalid_content');
  if (byteLength(text) > 2 * 1024 * 1024) throw new GenerationError(`The ${label} response was too large to save safely. Your saved content is unchanged.`, 'output_budget');
  return text.trim();
}
export function transcriptionText(data) {
  const rows = Array.isArray(data) ? data : [data];
  if (!rows.length) throw new GenerationError('Transcription did not return usable text.', 'invalid_content');
  return rows.map(row => generationText(row, ['text', 'data'], 'transcription')).join('\n');
}
