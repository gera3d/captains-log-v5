import React, { useState, useMemo } from 'react';
import {
  CommandLineIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  MegaphoneIcon,
  WindowIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowPathIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';

export default function BuilderPromptKit({ builderKit, title }) {
  const [copiedKey, setCopiedKey] = useState('');
  const [activeTab, setActiveTab] = useState('scaffold'); // 'scaffold' | 'engine'

  // Configurator state
  const [targetAgent, setTargetAgent] = useState('cursor'); // 'cursor' | 'claude' | 'antigravity' | 'aistudio'
  const [framework, setFramework] = useState('vite-react'); // 'vite-react' | 'nextjs' | 'sveltekit'
  const [dataBackend, setDataBackend] = useState('mock'); // 'mock' | 'supabase' | 'sqlite'
  const [buildHorizon, setBuildHorizon] = useState('v1-modular'); // 'v1-modular' | 'prototype'

  const safeKit = builderKit || {};
  const { landingPageCopy, adHooks, v1Spec, cursorScaffoldPrompt, coreEnginePrompt, mvpSystemPrompt } = safeKit;

  const copyToClipboard = async (text, key) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API not available in non-secure context');
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (err) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy to clipboard:', err, fallbackErr);
      }
    }
  };

  const copyAllLandingPage = () => {
    if (!landingPageCopy) return;
    const parts = [
      `# Landing Page Copy for ${title || 'Venture'}`,
      `\nHero Headline:\n${landingPageCopy.headline || ''}`,
      `\nSubheadline:\n${landingPageCopy.subheadline || ''}`,
      `\nPrimary Call to Action:\n${landingPageCopy.ctaText || 'Get Started'}`,
      `\nCore Value Propositions:\n${(landingPageCopy.valueProps || []).map(v => `- ${v}`).join('\n')}`
    ];
    copyToClipboard(parts.join('\n'), 'landingPage');
  };

  const copyAllAdHooks = () => {
    if (!Array.isArray(adHooks)) return;
    const text = adHooks.map(h => `${h.angle || 'Ad Angle'}: "${h.hook || h}"`).join('\n\n');
    copyToClipboard(text, 'adHooks');
  };

  const resetToDefaults = () => {
    setTargetAgent('cursor');
    setFramework('vite-react');
    setDataBackend('mock');
    setBuildHorizon('v1-modular');
  };

  const appSlug = useMemo(() => {
    return (title || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'app';
  }, [title]);

  const terminalKickoffCommand = useMemo(() => {
    if (framework === 'nextjs') {
      return `npx create-next-app@latest ${appSlug} --typescript --tailwind --app && cd ${appSlug} && npm i lucide-react`;
    }
    if (framework === 'sveltekit') {
      return `npx sv create ${appSlug} --template minimal --types ts && cd ${appSlug} && npm i -D tailwindcss lucide-svelte`;
    }
    return `npx create-vite ${appSlug} --template react-ts && cd ${appSlug} && npm i lucide-react clsx tailwindcss`;
  }, [framework, appSlug]);

  // Dynamically assemble configured prompt
  const configuredPrompt = useMemo(() => {
    if (targetAgent === 'aistudio') {
      return coreEnginePrompt || v1Spec?.coreEnginePrompt || mvpSystemPrompt || `You are the Lead Core Engine Architect for ${title || 'the app'}. Provide domain formulas and output strict JSON.`;
    }

    const basePrompt = (activeTab === 'engine' ? (coreEnginePrompt || v1Spec?.coreEnginePrompt) : null) ||
                       cursorScaffoldPrompt ||
                       v1Spec?.cursorScaffoldPrompt ||
                       mvpSystemPrompt || '';

    if (!basePrompt) return '';

    let modified = basePrompt;
    const hasXmlTags = modified.includes('<tech_stack>');

    if (hasXmlTags) {
      // 1. Adapt Framework Stack
      if (framework === 'nextjs') {
        modified = modified.replace(/<tech_stack>[\s\S]*?<\/tech_stack>/, `<tech_stack>\n- Framework: Next.js 15 (App Router) + TypeScript\n- Styling: Tailwind CSS (dark mode by default)\n- Components: Lucide React\n- State: React hooks / Server Actions\n</tech_stack>`);
      } else if (framework === 'sveltekit') {
        modified = modified.replace(/<tech_stack>[\s\S]*?<\/tech_stack>/, `<tech_stack>\n- Framework: SvelteKit 2 + TypeScript\n- Styling: Tailwind CSS\n- Components: Lucide Svelte\n</tech_stack>`);
      }

      // 2. Adapt Data & Backend
      if (dataBackend === 'supabase') {
        const supabaseSection = `<data_backend>\n- Supabase Integration: Create \`src/lib/supabase.ts\` client.\n- Provide SQL table schemas and enable offline mock fallback when SUPABASE_URL is missing.\n</data_backend>`;
        if (modified.includes('<mock_engine_presets>')) {
          modified = modified.replace(/<mock_engine_presets>[\s\S]*?<\/mock_engine_presets>/, supabaseSection);
        } else {
          modified = modified.replace('</tech_stack>', `</tech_stack>\n\n${supabaseSection}`);
        }
      } else if (dataBackend === 'sqlite') {
        const sqliteSection = `<data_backend>\n- Local Database: SQLite with Prisma ORM.\n- Provide \`prisma/schema.prisma\` and \`prisma/seed.ts\` with pre-seeded test scenarios.\n</data_backend>`;
        if (modified.includes('<mock_engine_presets>')) {
          modified = modified.replace(/<mock_engine_presets>[\s\S]*?<\/mock_engine_presets>/, sqliteSection);
        } else {
          modified = modified.replace('</tech_stack>', `</tech_stack>\n\n${sqliteSection}`);
        }
      }

      // 3. Adapt Build Horizon
      if (buildHorizon === 'prototype') {
        modified = modified.replace(/<long_running_v1_guidelines>[\s\S]*?<\/long_running_v1_guidelines>/, `<rapid_prototype_guidelines>\n- Build the fastest 4-file interactive core loop.\n- Prioritize instant browser interactivity with mock state.\n</rapid_prototype_guidelines>`);
      }

      // 4. Adapt Target Agent wrapper
      if (targetAgent === 'claude') {
        modified = modified.replace('<cursor_v1_composer_scaffold>', '<claude_code_v1_task>')
                           .replace('</cursor_v1_composer_scaffold>', '</claude_code_v1_task>');
      } else if (targetAgent === 'antigravity') {
        modified = modified.replace('<cursor_v1_composer_scaffold>', '<antigravity_workspace_task>')
                           .replace('</cursor_v1_composer_scaffold>', '</antigravity_workspace_task>');
      }
    } else {
      // Legacy Prompt Adaptation (Natural language / prose)
      // Framework
      if (framework === 'nextjs') {
        modified = modified.replace(/Create a (?:Next\.js|Vite|React|SvelteKit)[^.]*application[^.]*\./i, 'Create a Next.js 15 (App Router) application using TypeScript, Tailwind CSS, and Lucide React.');
      } else if (framework === 'sveltekit') {
        modified = modified.replace(/Create a (?:Next\.js|Vite|React|SvelteKit)[^.]*application[^.]*\./i, 'Create a SvelteKit 2 application using TypeScript, Tailwind CSS, and Lucide Svelte.');
      } else if (framework === 'vite-react') {
        modified = modified.replace(/Create a (?:Next\.js|Vite|React|SvelteKit)[^.]*application[^.]*\./i, 'Create a Vite + React 19 application using TypeScript, Tailwind CSS, and Lucide React.');
      }

      // Data Backend
      if (dataBackend === 'supabase') {
        modified += '\n\n[Data Strategy: Supabase]\n- Connect to Supabase for database & auth.\n- Include src/lib/supabase.ts with offline mock fallback.';
      } else if (dataBackend === 'sqlite') {
        modified += '\n\n[Data Strategy: SQLite]\n- Use SQLite with Prisma ORM.\n- Include prisma/schema.prisma and seed demo.';
      }

      // Build Horizon
      if (buildHorizon === 'prototype') {
        modified += '\n\n[Build Horizon: Rapid Prototype]\n- Build the fastest 4-file interactive core loop prioritizing instant browser interactivity.';
      }

      // Target Agent header
      if (targetAgent === 'claude') {
        modified = `// TARGET AGENT: Claude Code CLI (/agent)\n` + modified;
      } else if (targetAgent === 'antigravity') {
        modified = `// TARGET AGENT: Antigravity Workspace\n` + modified;
      }
    }

    return modified;
  }, [targetAgent, framework, dataBackend, buildHorizon, activeTab, cursorScaffoldPrompt, coreEnginePrompt, v1Spec, mvpSystemPrompt, title]);

  const wordCount = useMemo(() => {
    return configuredPrompt.trim().split(/\s+/).length;
  }, [configuredPrompt]);

  if (!builderKit) return null;

  return (
    <div className="space-y-6">
      {/* 🚀 Main Launch Center / Call to Action */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-indigo-500/20 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
                🚀 1-Click Launch Kit
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                {v1Spec?.buildHorizon || 'Long-Running V1 Ready'}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Launch Your Long-Running V1 Build
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Target: <strong className="text-white">{v1Spec?.targetApp || title || 'V1 Core Application'}</strong>. Pre-configured with modular architecture, strict types, and pre-seeded mock presets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => copyToClipboard(configuredPrompt, 'mainCta')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer"
            >
              {copiedKey === 'mainCta' ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-300" />
                  <span>Copied V1 Prompt!</span>
                </>
              ) : (
                <>
                  <CommandLineIcon className="w-5 h-5 text-indigo-200" />
                  <span>Copy Configured V1 Prompt</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Paste into Cursor (Cmd+I) or Claude Code
            </span>
          </div>
        </div>

        {/* Terminal Kickoff One-Liner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-indigo-300">Step 1: Terminal Kickoff:</span>
            <span>Run this before pasting your prompt:</span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-slate-700/60 px-3.5 py-2 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto">
            <span className="select-all">{terminalKickoffCommand}</span>
            <button
              onClick={() => copyToClipboard(terminalKickoffCommand, 'terminalCmd')}
              className="text-slate-400 hover:text-white transition cursor-pointer ml-1.5"
              title="Copy terminal command"
            >
              {copiedKey === 'terminalCmd' ? (
                <span className="text-emerald-400 font-bold text-[10px]">Copied!</span>
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Features Checklist */}
        {v1Spec?.interactiveFeatures && v1Spec.interactiveFeatures.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Features Testable on Minute One (Zero API Key Required):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
              {v1Spec.interactiveFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ⚙️ Interactive Architecture Configurator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5 text-indigo-600" />
              <h4 className="text-base font-bold text-slate-900">
                Customize Architecture & Tooling
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pre-selected with optimal defaults for this build. Toggling options updates the prompt below in real-time.
            </p>
          </div>

          <button
            onClick={resetToDefaults}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition self-start sm:self-auto"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Reset to Recommended</span>
          </button>
        </div>

        {/* 4 Levers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Lever 1: Target AI Tool */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Target AI Tool</label>
              <span className="text-[10px] text-emerald-600 font-semibold">Recommended</span>
            </div>
            <select
              id="cfg-agent"
              data-testid="cfg-agent"
              value={targetAgent}
              onChange={(e) => setTargetAgent(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
            >
              <option value="cursor">Cursor Composer (Cmd+I)</option>
              <option value="claude">Claude Code (CLI /agent)</option>
              <option value="antigravity">Antigravity / Codex Workspace</option>
              <option value="aistudio">Google AI Studio (Model System Prompt)</option>
            </select>
          </div>

          {/* Lever 2: Core Framework */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Core Framework</label>
              <span className="text-[10px] text-emerald-600 font-semibold">Fastest MVP</span>
            </div>
            <select
              id="cfg-framework"
              data-testid="cfg-framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
            >
              <option value="vite-react">Vite + React 19 + TypeScript (Fastest SPA)</option>
              <option value="nextjs">Next.js 15 App Router (Full-Stack SSR)</option>
              <option value="sveltekit">SvelteKit 2 + TypeScript (Ultra-Lean)</option>
            </select>
          </div>

          {/* Lever 3: Data & Backend */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Data Strategy</label>
              <span className="text-[10px] text-emerald-600 font-semibold">Zero-Key Instant</span>
            </div>
            <select
              id="cfg-data"
              data-testid="cfg-data"
              value={dataBackend}
              onChange={(e) => setDataBackend(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
            >
              <option value="mock">Self-Contained Mock Engine (3 Presets)</option>
              <option value="supabase">Supabase (PostgreSQL + Auth)</option>
              <option value="sqlite">Local SQLite + Prisma</option>
            </select>
          </div>

          {/* Lever 4: Build Horizon */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Build Horizon</label>
              <span className="text-[10px] text-indigo-600 font-semibold">V1 Foundation</span>
            </div>
            <select
              id="cfg-horizon"
              data-testid="cfg-horizon"
              value={buildHorizon}
              onChange={(e) => setBuildHorizon(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
            >
              <option value="v1-modular">Long-Running V1 (Modular, Types, Rules)</option>
              <option value="prototype">Rapid 48-Hour Weekend Prototype</option>
            </select>
          </div>
        </div>

        {/* Live Prompt Box */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Configured Prompt ({targetAgent.toUpperCase()})
              </h5>
              <span className="text-[11px] font-mono text-slate-400">~{wordCount} words</span>
            </div>

            <button
              onClick={() => copyToClipboard(configuredPrompt, 'configuredPrompt')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                copiedKey === 'configuredPrompt'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedKey === 'configuredPrompt' ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 leading-relaxed shadow-inner overflow-x-auto max-h-[380px] whitespace-pre-wrap select-all">
            {configuredPrompt}
          </div>
        </div>
      </div>

      {/* 🧠 Standalone Core AI Engine Prompt (If Available) */}
      {(coreEnginePrompt || v1Spec?.coreEnginePrompt) && targetAgent !== 'aistudio' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Core AI Engine System Prompt (Google AI Studio / Backend API)
                </h4>
                <p className="text-xs text-slate-500">
                  The internal LLM prompt powering the intelligence & formulas behind your app.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-sm cursor-pointer"
              >
                <span>AI Studio</span>
                <ArrowTopRightOnSquareIcon className="w-3 h-3 text-slate-400" />
              </a>

              <button
                onClick={() => copyToClipboard(coreEnginePrompt || v1Spec?.coreEnginePrompt, 'coreEngine')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                  copiedKey === 'coreEngine'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copiedKey === 'coreEngine' ? (
                  <>
                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                    <span>Copy AI Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 leading-relaxed shadow-inner overflow-x-auto max-h-[300px] whitespace-pre-wrap select-all">
            {coreEnginePrompt || v1Spec?.coreEnginePrompt}
          </div>
        </div>
      )}

      {/* 2. High-Converting Landing Page Copy */}
      {landingPageCopy && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <WindowIcon className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                High-Converting Landing Page Blueprint
              </h4>
            </div>

            <button
              onClick={copyAllLandingPage}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition shadow-sm cursor-pointer ${
                copiedKey === 'landingPage'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {copiedKey === 'landingPage' ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied Spec!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Landing Page Spec</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Hero Headline (H1)
              </span>
              <h5 className="text-base sm:text-lg font-bold text-slate-900">
                {landingPageCopy.headline}
              </h5>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Value Subheadline
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                {landingPageCopy.subheadline}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Primary CTA Button
              </span>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-sm">
                "{landingPageCopy.ctaText || 'Get Early Access — Free'}"
              </div>
            </div>

            {Array.isArray(landingPageCopy.valueProps) && landingPageCopy.valueProps.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Core Value Propositions
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {landingPageCopy.valueProps.map((prop, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Ad Angles & Viral Hooks */}
      {Array.isArray(adHooks) && adHooks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MegaphoneIcon className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                High-Converting Ad Angles & Hooks
              </h4>
            </div>

            <button
              onClick={copyAllAdHooks}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition shadow-sm cursor-pointer ${
                copiedKey === 'adHooks'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {copiedKey === 'adHooks' ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied All Hooks!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Ad Angles</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adHooks.map((item, idx) => {
              const angle = item.angle || `Hook ${idx + 1}`;
              const hook = item.hook || item;
              const hookKey = `hook-${idx}`;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 inline-block mb-2">
                      {angle}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed italic m-0">
                      "{hook}"
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(hook, hookKey)}
                    className="self-start text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer pt-1 transition-colors"
                  >
                    {copiedKey === hookKey ? 'Copied!' : 'Copy Hook'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
