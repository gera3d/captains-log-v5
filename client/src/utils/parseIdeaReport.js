// Parses the Markdown structure produced by the "Idea Structure" n8n workflow
// into a lightweight summary: metric callouts, persona, keyword/source counts,
// blue/red debate counts, market sizing signals, venture scorecard,
// community signals, and 1-click builder prompt kit.

function extractQuoteBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line.startsWith('>')) {
      current.push(line.replace(/^>\s?/, ''));
    } else if (current.length) {
      blocks.push(current.join('\n').trim());
    }
  }
  if (current.length) blocks.push(current.join('\n').trim());
  return blocks;
}

function parseMetricBlock(block) {
  const headlineMatch = block.match(/^\*\*(.+?)\*\*/);
  const limitMatch = block.match(/\*\*What it cannot tell us:\*\*\s*([\s\S]+)$/);
  if (!headlineMatch || !limitMatch) return null;
  const headline = headlineMatch[1];
  const sepIndex = headline.indexOf(' • ') !== -1 ? headline.indexOf(' • ') : headline.indexOf(' · ');
  const value = sepIndex === -1 ? headline : headline.slice(0, sepIndex);
  const label = sepIndex === -1 ? '' : headline.slice(sepIndex + 3);
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  const scopeLine = lines.length > 1 ? lines[1].replace(/\[\d+\]\([^)]+\)/g, '').trim() : '';
  return { value, label, scope: scopeLine, limit: limitMatch[1].trim() };
}

function parsePersonaBlock(block) {
  if (!/working hypothesis/i.test(block)) return null;
  const headlineMatch = block.match(/^\*\*(.+?)\*\*/);
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  const job = lines.length > 1 ? lines[1].replace(/^_|_$/g, '') : '';
  return { label: headlineMatch ? headlineMatch[1] : '', job };
}

function countSection(markdown, headingPattern) {
  const headingMatch = markdown.match(headingPattern);
  if (!headingMatch) return { present: false, argCount: 0 };
  const start = headingMatch.index + headingMatch[0].length;
  const rest = markdown.slice(start);
  const nextHeadingIdx = rest.search(/\n###?\s/);
  const body = nextHeadingIdx === -1 ? rest : rest.slice(0, nextHeadingIdx);
  const bulletCount = (body.match(/^-\s+\*\*/gm) || []).length;
  const bottleneckCount = (body.match(/^Bottleneck \d+/gm) || []).length;
  const paragraphCount = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('>') && p !== '---').length;
  return { present: true, argCount: Math.max(bulletCount, bottleneckCount, paragraphCount) };
}

function parseScorecardFromMarkdown(markdown) {
  const scorecardSection = markdown.match(/###\s*.*(?:Venture Viability Scorecard|Scorecard)[\s\S]*?(?=\n---\n|\n###|$)/i);
  if (!scorecardSection) return null;

  const text = scorecardSection[0];
  const getRowVal = (pattern) => {
    const m = text.match(pattern);
    return m ? m[1].trim() : null;
  };

  const opp = getRowVal(/\|\s*\*\*Opportunity\*\*\s*\|\s*\*\*([^\*\|]+)\*\*\s*(?:[•·-]\s*([^\*\|]+))?/i);
  const oppLabel = getRowVal(/\|\s*\*\*Opportunity\*\*\s*\|\s*\*\*[^\*\|]+\*\*\s*[•·-]\s*([^\*\|]+)/i);

  const prob = getRowVal(/\|\s*\*\*Problem Severity\*\*\s*\|\s*\*\*([^\*\|]+)\*\*\s*(?:[•·-]\s*([^\*\|]+))?/i);
  const probLabel = getRowVal(/\|\s*\*\*Problem Severity\*\*\s*\|\s*\*\*[^\*\|]+\*\*\s*[•·-]\s*([^\*\|]+)/i);

  const feas = getRowVal(/\|\s*\*\*Feasibility\*\*\s*\|\s*\*\*([^\*\|]+)\*\*\s*(?:[•·-]\s*([^\*\|]+))?/i);
  const feasLabel = getRowVal(/\|\s*\*\*Feasibility\*\*\s*\|\s*\*\*[^\*\|]+\*\*\s*[•·-]\s*([^\*\|]+)/i);

  const why = getRowVal(/\|\s*\*\*Why Now\*\*\s*\|\s*\*\*([^\*\|]+)\*\*\s*(?:[•·-]\s*([^\*\|]+))?/i);
  const whyLabel = getRowVal(/\|\s*\*\*Why Now\*\*\s*\|\s*\*\*[^\*\|]+\*\*\s*[•·-]\s*([^\*\|]+)/i);

  const exec = getRowVal(/\|\s*\*\*Execution Difficulty\*\*\s*\|\s*\*\*?([^\*\|\n]+)\*\*?/i);
  const gtm = getRowVal(/\|\s*\*\*Go-To-Market Traction\*\*\s*\|\s*\*\*?([^\*\|\n]+)\*\*?/i);

  if (!opp && !prob && !feas && !why && !exec && !gtm) return null;

  const toNum = str => {
    if (!str) return null;
    const m = str.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  };

  return {
    opportunityScore: toNum(opp),
    opportunityLabel: oppLabel ? oppLabel.trim() : null,
    problemSeverity: toNum(prob),
    problemLabel: probLabel ? probLabel.trim() : null,
    feasibility: toNum(feas),
    feasibilityLabel: feasLabel ? feasLabel.trim() : null,
    whyNow: toNum(why),
    whyNowLabel: whyLabel ? whyLabel.trim() : null,
    executionDifficulty: exec ? exec.trim() : null,
    gtmScore: gtm ? gtm.trim() : null
  };
}

function parseCommunitySignalsFromMarkdown(markdown) {
  const commSection = markdown.match(/###\s*.*(?:Community Signals & Distribution Wedges|Community Signals)[\s\S]*?(?=\n---\n###|\n###\s*🚀|$)/i);
  if (!commSection) return null;

  const text = commSection[0];
  const subreddits = [];
  const youtubeThemes = [];
  const organicWedges = [];

  // Subreddits: - **[r/animation](...)** (members) — reason
  for (const m of text.matchAll(/-\s+\*\*\[?(?:r\/)?([A-Za-z0-9_]+)\]?(?:\([^)]+\))?\*\*(?:\s*\(([^)]+)\))?(?:\s*[—–-]\s*(.+))?/g)) {
    subreddits.push({
      name: `r/${m[1]}`,
      members: m[2] ? m[2].trim() : null,
      reason: m[3] ? m[3].trim() : null
    });
  }

  // YouTube queries: - **"query"** — _intent_
  for (const m of text.matchAll(/-\s+\*\*"([^"]+)"\*\*(?:\s*[—–-]\s*_?([^_\n]+)_?)?/g)) {
    youtubeThemes.push({
      query: m[1].trim(),
      intent: m[2] ? m[2].trim() : null
    });
  }

  // Organic Wedges: - **Growth Wedge:** text OR - text
  for (const m of text.matchAll(/-\s+\*\*Growth Wedge:\*\*\s*(.+)/gi)) {
    organicWedges.push(m[1].trim());
  }

  if (subreddits.length === 0 && youtubeThemes.length === 0 && organicWedges.length === 0) {
    return null;
  }

  return { subreddits, youtubeThemes, organicWedges };
}

function parseBrutalTruth(markdown, scorecard) {
  const blueMatch = markdown.match(/###\s*.*(?:Blue team|Strategic Moats)[^\n]*\n([\s\S]*?)(?=\n---\n###|\n###|$)/i);
  const bluePoints = [];
  if (blueMatch) {
    const raw = blueMatch[1];
    for (const line of raw.split(/\n{2,}|\n(?=-\s)/)) {
      const trimmed = line.replace(/^[-\*\s]+/, '').replace(/^First,\s*|^Second,\s*/i, '').trim();
      if (trimmed && !trimmed.startsWith('---') && trimmed.length > 20) {
        bluePoints.push(trimmed.replace(/\[\d+\](?:\([^)]+\))?/g, '').trim());
      }
    }
  }

  const redMatch = markdown.match(/###\s*.*(?:Red team|Engineering Reality Check|Technical Bottlenecks)[^\n]*\n([\s\S]*?)(?=\n---\n###|\n###|$)/i);
  const redPoints = [];
  if (redMatch) {
    const raw = redMatch[1];
    for (const line of raw.split(/\n{2,}|\n(?=-\s)/)) {
      const trimmed = line.replace(/^[-\*\s]+/, '').replace(/^First,\s*|^Second,\s*/i, '').replace(/^Bottleneck \d+:\s*/i, '').trim();
      if (trimmed && !trimmed.startsWith('---') && trimmed.length > 20) {
        redPoints.push(trimmed.replace(/\[\d+\](?:\([^)]+\))?/g, '').trim());
      }
    }
  }

  if (!bluePoints.length && !redPoints.length) return null;
  return { superpowers: bluePoints.slice(0, 3), fatalTraps: redPoints.slice(0, 3) };

}

function unescapeMarkdown(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    try { str = JSON.parse(str); } catch {}
  }
  if (str.includes('\\n')) {
    str = str.replace(/\\n/g, '\n');
  }
  return str;
}

function parseDomainBlueprint(rawMarkdown) {
  const markdown = unescapeMarkdown(rawMarkdown);
  if (!markdown || markdown.length < 30) return null;

  // 1. Check for explicit Domain Blueprint / Secret Sauce section
  const dbMatch = markdown.match(/###\s*.*(?:Domain Blueprint|Secret Sauce)[\s\S]*?(?=\n---\n###|\n###\s*(?:Market|Technical|Blue|Red|Proposed|Sources)|$)/i);
  
  if (dbMatch) {
    const text = dbMatch[0];
    const tableMatch = text.match(/\|([^\n]+)\|\n\|(?:\s*:?---+:?\s*\|)+\n([\s\S]*?)(?=\n\n\n|\n\s*-\s*\*\*|\n###|$)/);
    
    // Parse Archetypes / Formulas with clean names
    const formulas = [];
    const cleanText = text.replace(/^>\s*/gm, '');
    for (const m of cleanText.matchAll(/-\s+\*\*([^:]+):\*\*\s*(.+)/g)) {
      const rawLabel = m[1].trim();
      const rawContent = m[2].trim();
      
      let name = rawLabel;
      let desc = rawContent;
      
      // If label is 'Formula Archetype X' or similar, extract the true name from the content
      if (/^formula(\s+archetype)?\s*\d*$/i.test(rawLabel)) {
        const splitMatch = rawContent.match(/^(.+?)(?:\s+[—–-]\s+|\s*:\s+|(?<=[a-zA-Z])—)\s*(.+)$/);
        if (splitMatch) {
          name = splitMatch[1].trim();
          desc = splitMatch[2].trim();
        } else {
          name = rawContent;
          desc = '';
        }
      }
      
      formulas.push({ name, desc, description: desc });
    }

    if (tableMatch) {
      const headerCols = tableMatch[1].split('|').map(c => c.trim()).filter(Boolean);
      const rows = tableMatch[2].trim().split('\n').filter(r => r.trim().startsWith('|'));
      
      const isVideo = headerCols.some(h => /beat|shot|framing|camera|lens|keyframe|storyboard|cinemat/i.test(h));
      const isSaas = headerCols.some(h => /entity|schema|field|trigger|validation|pipeline|model/i.test(h));
      const isConsumer = headerCols.some(h => /stage|listener|user|experience|habit|cue|loop|hook|reward|onboarding|viral/i.test(h));
      
      const domainType = isVideo ? 'video' : (isSaas ? 'saas' : (isConsumer ? 'consumer' : 'general'));

      const parsedRows = rows.map((r, rowIdx) => {
        const cells = r.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const cellMap = {};
        headerCols.forEach((h, idx) => {
          cellMap[h] = cells[idx] || '';
        });

        let id = String(rowIdx + 1);
        let title = '';
        let tag = '';
        let action = '';
        let rule = '';

        if (isVideo) {
          id = cellMap['Beat'] || String(rowIdx + 1);
          title = cellMap['Shot Name'] || cells[1] || ('Shot ' + (rowIdx + 1));
          tag = cellMap['Framing & Camera'] || cells[2] || '';
          action = cellMap['Action & Narrative Beat'] || cells[3] || '';
          rule = cellMap['Continuity & Prompt Directives'] || cellMap['Prompt Directives'] || cells[4] || '';
        } else if (isSaas) {
          id = String(rowIdx + 1);
          title = cellMap['Entity'] || cellMap['Entity / Stage'] || cells[0] || ('Model ' + (rowIdx + 1));
          tag = cellMap['Key fields'] || cellMap['Required fields'] || cells[1] || '';
          action = cellMap['Trigger or action'] || cellMap['Trigger → action'] || cellMap['Trigger'] || cellMap['Operational purpose'] || cells[2] || '';
          rule = cellMap['Validation rule'] || cellMap['Validation Rule'] || cellMap['Automated validation'] || cellMap['Deterministic Action'] || cells[3] || '';
        } else if (isConsumer) {
          id = String(rowIdx + 1);
          title = cellMap['Stage'] || cells[0] || ('Stage ' + (rowIdx + 1));
          tag = cellMap['Success Signal'] || cells[3] || '';
          action = cellMap['Listener Experience'] || cellMap['User Experience'] || cells[1] || '';
          rule = cellMap['System Action'] || cells[2] || '';
        } else {
          id = String(rowIdx + 1);
          title = cells[1] && cells[1].length < 60 ? cells[1] : (cells[0] || ('Step ' + (rowIdx + 1)));
          tag = cells[2] || '';
          action = cells[3] || cells[1] || '';
          rule = cells[4] || '';
        }

        return {
          id,
          beat: id,
          title,
          name: title,
          tag,
          framing: tag,
          action,
          rule,
          promptCue: rule,
          cells: cellMap
        };
      });

      return {
        domainType,
        headers: headerCols,
        rows: parsedRows,
        formulas
      };
    }
  }

  // 2. Fallback for ideas without a table: Key Features, Core Mechanism, or Solution
  const featuresMatch = markdown.match(/###\s*.*Key Features[\s\S]*?(?=\n---\n###|\n###|$)/i);
  const mechanismMatch = markdown.match(/###\s*.*(?:The Core Mechanism & Unmet Need|Core Mechanism)[\s\S]*?(?=\n---\n###|\n###|$)/i);
  const solutionMatch = markdown.match(/###\s*.*Solution[\s\S]*?(?=\n---\n###|\n###|$)/i);

  const capabilityRows = [];
  if (featuresMatch) {
    for (const m of featuresMatch[0].matchAll(/^[-*]\s+\*\*?([^:\n]+)\*\*?:?\s*(.+)$/gm)) {
      capabilityRows.push({
        id: String(capabilityRows.length + 1),
        beat: String(capabilityRows.length + 1),
        title: m[1].replace(/^\*\*|\*\*$/g, '').trim(),
        name: m[1].replace(/^\*\*|\*\*$/g, '').trim(),
        tag: 'Core Feature',
        framing: 'Core Feature',
        action: m[2].trim(),
        rule: '',
        promptCue: '',
        cells: { Capability: m[1].trim(), Details: m[2].trim() }
      });
    }
  }
  
  if (capabilityRows.length === 0 && mechanismMatch) {
    for (const m of mechanismMatch[0].matchAll(/^[-*]\s+\*\*?([^:\n]+)\*\*?:?\s*(.+)$/gm)) {
      capabilityRows.push({
        id: String(capabilityRows.length + 1),
        beat: String(capabilityRows.length + 1),
        title: m[1].replace(/^\*\*|\*\*$/g, '').trim(),
        name: m[1].replace(/^\*\*|\*\*$/g, '').trim(),
        tag: 'Mechanism Anchor',
        framing: 'Mechanism Anchor',
        action: m[2].trim(),
        rule: '',
        promptCue: '',
        cells: { Mechanism: m[1].trim(), Implementation: m[2].trim() }
      });
    }
  }

  if (capabilityRows.length === 0 && solutionMatch) {
    const lines = solutionMatch[0].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('---'));
    if (lines.length > 0) {
      capabilityRows.push({
        id: '1',
        beat: '1',
        title: 'Core Solution Architecture',
        name: 'Core Solution Architecture',
        tag: 'Primary Mechanism',
        framing: 'Primary Mechanism',
        action: lines.join(' '),
        rule: '',
        promptCue: '',
        cells: { Solution: lines.join(' ') }
      });
    }
  }

  if (capabilityRows.length > 0) {
    return {
      domainType: 'capabilities',
      headers: ['Capability', 'Implementation'],
      rows: capabilityRows,
      formulas: []
    };
  }

  return null;
}

function parseBuilderKitFromMarkdown(markdown) {
  const kitSection = markdown.match(/###\s*.*(?:1-Click Builder (?:Launch|Prompt) Kit|Builder (?:Launch|Prompt) Kit)[\s\S]*?(?=\n---\n###\s*Sources|\n###\s*Sources|$)/i);
  if (!kitSection) return null;

  const text = kitSection[0];

  // Landing Page
  const h1Match = text.match(/>\s*\*\*Hero Headline:\*\*\s*([^\n]+)/i);
  const subMatch = text.match(/>\s*\*\*Subheadline:\*\*\s*([^\n]+)/i);
  const ctaMatch = text.match(/>\s*\*\*Primary CTA:\*\*\s*([^\n]+)/i);

  const valueProps = [];
  const vpBlock = text.match(/\*\*Core Value Propositions:\*\*([\s\S]*?)(?=\n####|\n```|$)/i);
  if (vpBlock) {
    for (const line of vpBlock[1].split('\n')) {
      const trimmed = line.replace(/^-\s+/, '').trim();
      if (trimmed) valueProps.push(trimmed);
    }
  }

  // Ad Hooks
  const adHooks = [];
  for (const m of text.matchAll(/-\s+\*\*([^:]+):\*\*\s*"([^"]+)"/g)) {
    adHooks.push({ angle: m[1].trim(), hook: m[2].trim() });
  }

  // V1 Spec
  const targetAppMatch = text.match(/>\s*\*\*Target Prototype:\*\*\s*([^\n]+)/i);
  const stackMatch = text.match(/>\s*\*\*Recommended Stack:\*\*\s*([^\n]+)/i);
  const horizonMatch = text.match(/>\s*\*\*Build Horizon:\*\*\s*([^\n]+)/i);
  const termMatch = text.match(/```bash[\s\S]*?# Step 1: Run terminal kickoff command\s*([^\n]+)[\s\S]*?```/i);
  
  const interactiveFeatures = [];
  const featSection = text.match(/\*\*Interactive Features to Test Immediately[^\n]*\*\*([\s\S]*?)(?=\n```|\n\*\*Step 2|$)/i);
  if (featSection) {
    for (const m of featSection[1].matchAll(/>\s*-\s*([^\n]+)/g)) {
      interactiveFeatures.push(m[1].trim());
    }
  }

  // Prompts
  const cursorMatch = text.match(/####\s*.*(?:Cursor Composer|Scaffolding Prompt)[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i);
  const engineMatch = text.match(/####\s*.*(?:Core AI Engine|System Prompt \(Google AI Studio\)?)[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i);
  const oldPromptMatch = text.match(/####\s*.*(?:MVP Technical System Prompt)[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i) || text.match(/```(?:text)?\s*([\s\S]*?)```/);

  const cursorScaffoldPrompt = cursorMatch ? cursorMatch[1].trim() : null;
  const coreEnginePrompt = engineMatch ? engineMatch[1].trim() : null;
  const mvpSystemPrompt = cursorScaffoldPrompt || (oldPromptMatch ? oldPromptMatch[1].trim() : null);

  let rawHeadline = h1Match ? h1Match[1].trim() : '';
  if (rawHeadline) {
    rawHeadline = rawHeadline.replace(/Solve\s+(Direct|Build|Automate|Create|Scale|Manage|Track)\b/i, '$1');
  }

  const v1Spec = (targetAppMatch || stackMatch || cursorScaffoldPrompt || coreEnginePrompt) ? {
    targetApp: targetAppMatch ? targetAppMatch[1].trim() : '',
    recommendedStack: stackMatch ? stackMatch[1].trim() : 'Vite + React 19 + TypeScript + Tailwind CSS',
    buildHorizon: horizonMatch ? horizonMatch[1].trim() : 'Long-Running V1',
    terminalKickoff: termMatch ? termMatch[1].trim() : 'npx create-vite app --template react-ts && cd app && npm i lucide-react clsx tailwindcss',
    interactiveFeatures,
    cursorScaffoldPrompt,
    coreEnginePrompt
  } : null;

  return {
    landingPageCopy: (h1Match || subMatch || ctaMatch) ? {
      headline: rawHeadline,
      subheadline: subMatch ? subMatch[1].trim() : '',
      ctaText: ctaMatch ? ctaMatch[1].trim() : 'Get Started — Free',
      valueProps
    } : null,
    adHooks: adHooks.length > 0 ? adHooks : null,
    v1Spec,
    cursorScaffoldPrompt,
    coreEnginePrompt,
    mvpSystemPrompt
  };
}

export function parseIdeaReportSummary(rawInput) {
  if (!rawInput) return null;

  let markdown = '';
  let parsedReport = null;

  if (typeof rawInput === 'object') {
    parsedReport = rawInput.report || rawInput;
    markdown = rawInput.text || rawInput.business_idea || '';
  } else if (typeof rawInput === 'string') {
    let trimmed = rawInput.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj === 'object') {
          parsedReport = obj.report || obj;
          markdown = obj.text || obj.business_idea || trimmed;
        }
      } catch {
        markdown = trimmed;
      }
    } else {
      markdown = trimmed;
    }
  }

  if (!markdown || typeof markdown !== 'string') return null;
  markdown = unescapeMarkdown(markdown);

  const quoteBlocks = extractQuoteBlocks(markdown);
  const metrics = Array.isArray(parsedReport?.metrics) ? [...parsedReport.metrics] : [];
  let persona = parsedReport?.persona || null;
  let dataGap = null;
  for (const block of quoteBlocks) {
    const metric = parseMetricBlock(block);
    if (metric) {
      metrics.push(metric);
      continue;
    }
    const p = parsePersonaBlock(block);
    if (p) {
      persona = p;
      continue;
    }
    const gapMatch = block.match(/\*\*Evidence gap:\*\*\s*([\s\S]+)$/);
    if (gapMatch) dataGap = gapMatch[1].trim();
  }

  // Fallback persona extraction from section
  if (!persona) {
    const personaMatch = markdown.match(/###\s*.*Proposed starting customer[\s\S]*?(?=\n###\s|\n---\n###|$)/i);
    if (personaMatch) {
      const pText = personaMatch[0];
      const labelMatch = pText.match(/>\s*\*\*([^\*\n]+)\*\*/);
      const lines = pText.split('\n').map(l => l.replace(/^>\s?/, '').trim()).filter(Boolean);
      if (labelMatch) {
        persona = {
          label: labelMatch[1].trim(),
          job: lines.length > 2 ? lines[2].replace(/^_|_$/g, '') : ''
        };
      }
    }
    if (!persona) {
      const targetMatch = markdown.match(/###\s*.*(?:Target Market|Target Audience)[\s\S]*?(?=\n###\s|\n---\n###|$)/i);
      if (targetMatch) {
        const lines = targetMatch[0].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('---'));
        if (lines.length > 0) {
          persona = {
            label: lines[0].replace(/^[-*0-9.]\s*|\*\*/g, '').split(/[:.]/)[0].trim(),
            job: lines.slice(0, 2).join(' ').replace(/[*_]/g, '').trim()
          };
        }
      }
    }
  }

  // Keywords count
  const keywordSection = markdown.match(/###\s*.*What this customer might search[\s\S]*?(?=\n###\s|\n---\n###|$)/i);
  let keywordCount = keywordSection ? (keywordSection[0].match(/^-\s+\*\*/gm) || []).length : 0;

  // Search Volume table query count
  const searchTableMatch = markdown.match(/\|[^\n]+\|\n\|(?:\s*:?---+:?\s*\|)+\n([\s\S]*?)(?=\n\n|\n###|$)/);
  if (searchTableMatch) {
    const rows = searchTableMatch[1].trim().split('\n').filter(r => r.trim().startsWith('|'));
    if (rows.length > 0) {
      keywordCount = Math.max(keywordCount, rows.length);
    }
  }

  // Sources count
  const sourcesSection = markdown.match(/###\s*.*Sources and limits[\s\S]*$/i);
  let sourceCount = sourcesSection ? (sourcesSection[0].match(/^\*\*\[\d+\./gm) || []).length : 0;
  if (!sourceCount) {
    const uniqueCitations = new Set();
    for (const match of markdown.matchAll(/\[(\d+)\]\([^)]+\)/g)) {
      uniqueCitations.add(match[1]);
    }
    sourceCount = uniqueCitations.size;
  }

  // Blue / Red debate sections
  const blueTeam = countSection(markdown, /###\s*.*(?:Blue team|Strategic Moats)[^\n]*\n/i);
  const redTeam = countSection(markdown, /###\s*.*(?:Red team|Engineering Reality Check)[^\n]*\n/i);

  // Market Sizing
  const tamMatch = markdown.match(/TAM[^—–-]*[—–-]\s*([^.,\n]+(?:\$[0-9.]+[BMK]|\$[0-9,]+))/i);
  const somMatch = markdown.match(/SOM[^—–-]*[—–-]\s*([^.,\n]+(?:\$[0-9.]+[BMK]\s*ARR|\$[0-9,]+))/i);

  // Market Position
  const posMatch = markdown.match(/>\s*\*\*Strategic Market Position:\*\*\s*([^\n]+)/i) ||
                   markdown.match(/>\s*\*\*Strategic Framework Positioning:\*\*\s*([^\n]+)/i);
  const marketPosition = parsedReport?.marketPosition ?? (posMatch ? posMatch[1].trim() : null);

  // Structured values are supplied only by saved fields or actual Markdown.
  const scorecard = parsedReport?.scorecard || parseScorecardFromMarkdown(markdown);
  const communitySignals = parsedReport?.communitySignals || parseCommunitySignalsFromMarkdown(markdown);
  const builderKit = parsedReport?.builderKit || parseBuilderKitFromMarkdown(markdown);
  const brutalTruth = parsedReport?.brutalTruth || parseBrutalTruth(markdown);
  const domainBlueprint = parseDomainBlueprint(markdown);

  // Elevator pitch extraction
  let elevatorPitch = null;
  const elevatorMatch = markdown.match(/>\s*(?:\*\*)?Elevator Pitch(?:\*\*)?:?\s*([^\n]+)/i);
  if (elevatorMatch) {
    elevatorPitch = elevatorMatch[1].replace(/^\*\*|\*\*$/g, '').trim();
  } else {
    for (const b of quoteBlocks) {
      if (/elevator pitch/i.test(b)) {
        elevatorPitch = b.replace(/.*elevator pitch[:\s*]*/i, '').replace(/^[*\s]+|[*\s]+$/g, '').trim();
        break;
      }
    }
  }

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const hasAnyStructure = metrics.length || persona || keywordCount || sourceCount || blueTeam.present || redTeam.present || scorecard || domainBlueprint || elevatorPitch || marketPosition || communitySignals || builderKit || brutalTruth || wordCount > 20;
  if (!hasAnyStructure) return null;

  return {
    metrics,
    persona,
    dataGap,
    keywordCount,
    sourceCount,
    blueArgCount: blueTeam.argCount,
    redArgCount: redTeam.argCount,
    hasBlueRed: blueTeam.present && redTeam.present,
    tam: parsedReport?.tam ?? (tamMatch ? tamMatch[1].trim() : null),
    som: parsedReport?.som ?? (somMatch ? somMatch[1].trim() : null),
    scorecard,
    marketPosition,
    communitySignals,
    builderKit,
    brutalTruth,
    domainBlueprint,
    elevatorPitch,
    wordCount,
  };
}
