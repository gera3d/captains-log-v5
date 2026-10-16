/**
 * Utility to extract clean, punchy titles and summaries from notes/ideas.
 */

export function extractTitle(idea) {
  if (!idea) return 'Untitled Idea';
  
  // 1. Manually set or API title
  if (idea.title && typeof idea.title === 'string' && idea.title.trim()) {
    return idea.title.trim();
  }

  // 2. Parse from business_idea
  if (idea.business_idea) {
    let content = String(idea.business_idea).trim();

    // Handle JSON wrappers
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          if (parsed.title) return String(parsed.title).trim();
          if (parsed.idea) content = String(parsed.idea);
          else if (parsed.text) content = String(parsed.text);
        }
      } catch (e) {}
    }

    content = content
      .replace(/^text['"]\s*:\s*["']/, '')
      .replace(/^["']text["']\s*:\s*["']/, '')
      .replace(/^["']/, '')
      .replace(/["']$/, '')
      .trim();

    // Look for H1 (# Title)
    const h1Match = content.match(/^#\s+([^\n]+)/m);
    if (h1Match) {
      const title = h1Match[1].replace(/[*_#]/g, '').trim();
      if (title) return title.length > 65 ? title.substring(0, 62) + '...' : title;
    }

    // Look for H2 (## Title)
    const h2Regex = /^##\s+([^\n]+)|[\n]##\s+([^\n]+)/m;
    const h2Match = content.match(h2Regex);
    if (h2Match) {
      const h2Title = (h2Match[1] || h2Match[2]).replace(/[*_#]/g, '').trim();
      const skipHeaders = ['elevator pitch', 'problem statement', 'solution', 'target market', 'key features', 'business model', 'overview'];
      if (h2Title && !skipHeaders.includes(h2Title.toLowerCase())) {
        return h2Title.length > 65 ? h2Title.substring(0, 62) + '...' : h2Title;
      }
    }

    // Check first non-empty lines
    const lines = content.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    for (const line of lines) {
      const cleaned = line
        .replace(/^#+\s+/, '')
        .replace(/^[*_]+|[*_]+$/g, '')
        .replace(/\\["']/g, '')
        .trim();
      const lower = cleaned.toLowerCase();
      if (cleaned && !lower.startsWith('elevator pitch') && !lower.startsWith('problem statement') && !lower.startsWith('solution')) {
        return cleaned.length > 65 ? cleaned.substring(0, 62) + '...' : cleaned;
      }
    }
  }

  // 3. Fallback to transcript
  const rawTranscript = idea.transcript || idea.transcription;
  if (rawTranscript && typeof rawTranscript === 'string') {
    let text = rawTranscript.trim();
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        text = parsed.data || parsed.text || text;
      }
    } catch {}
    
    // Remove introductory filler to get to the core concept
    const cleanedTranscript = text
      .replace(/^(in this idea|so this idea is|i want to explore|the base idea of this application is)\s*,?\s*/i, '');
    
    return cleanedTranscript.length > 55 ? cleanedTranscript.substring(0, 52) + '...' : cleanedTranscript;
  }

  return 'Untitled Idea';
}

export function extractSummary(idea) {
  if (!idea) return '';

  // 1. If explicit summary field is present
  if (idea.summary && typeof idea.summary === 'string' && idea.summary.trim()) {
    if (!idea.summary.toLowerCase().includes('raw monologue capture')) {
      return idea.summary.trim();
    }
  }

  // 2. Extract from business_idea
  if (idea.business_idea) {
    let content = String(idea.business_idea).trim();

    // Check for **Elevator Pitch**: ... or Elevator Pitch: ...
    const pitchMatch = content.match(/\*{0,2}Elevator Pitch\*{0,2}\s*:\s*([^\n]+)/i);
    if (pitchMatch && pitchMatch[1].trim()) {
      return pitchMatch[1].replace(/[*_]/g, '').trim();
    }

    // Check for Problem Statement or first body paragraph after title
    const lines = content.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));

    if (lines.length > 0) {
      const firstPara = lines[0].replace(/[*_]/g, '').trim();
      if (firstPara.length > 250) {
        const cut = firstPara.substring(0, 240);
        const lastSpace = cut.lastIndexOf(' ');
        return (lastSpace > 180 ? cut.substring(0, lastSpace) : cut) + '...';
      }
      return firstPara;
    }
  }

  // 3. Fallback to transcript preview
  const rawTranscript = idea.transcript || idea.transcription;
  if (rawTranscript && typeof rawTranscript === 'string') {
    let text = rawTranscript.trim();
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        text = parsed.data || parsed.text || text;
      }
    } catch {}
    if (text.length > 200) {
      return text.substring(0, 195) + '...';
    }
    return text;
  }

  return '';
}
