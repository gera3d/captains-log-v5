import React, { useState } from 'react';
import {
  FilmIcon,
  VideoCameraIcon,
  SparklesIcon,
  CommandLineIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const DOMAIN_CONFIG = {
  video: {
    badge: '🎬 Storyboard & Directing Engine',
    badgeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    title: 'Operational Keyframe & Continuity Ledger',
    subtitle: 'Sequential shot composition, spatial continuity anchors, and camera directives that eliminate generative hallucination',
    metricTag: 'Sequential Keyframe Beats',
    canvasHeader: 'Shot-by-Shot Directing Canvas',
    canvasHint: 'Click any prompt directive to copy',
    itemPrefix: 'BEAT',
    ruleHeader: 'Continuity & Prompt Rule:',
    formulaHeader: '⚡ Choreography & Narrative Archetypes',
    formulaPrefix: 'Formula',
    icon: FilmIcon,
  },
  saas: {
    badge: '⚡ Architecture & Data Schema',
    badgeClass: 'text-sky-700 bg-sky-50 border-sky-200',
    title: 'Operational Data Matrix & Execution Pipeline',
    subtitle: 'Core data models, event triggers, deterministic business logic, and validation constraints',
    metricTag: 'Entity Models & Pipelines',
    canvasHeader: 'Data Architecture & Trigger Pipeline',
    canvasHint: 'Deterministic state transitions & validation rules',
    itemPrefix: 'MODEL',
    ruleHeader: 'Integrity & Validation Rule:',
    formulaHeader: '⚙️ Core Automation & Architecture Patterns',
    formulaPrefix: 'Pattern',
    icon: CommandLineIcon,
  },
  consumer: {
    badge: '🔄 Core Habit Loop & Behavioral Engine',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'User Journey & Retention Matrix',
    subtitle: 'Step-by-step user cues, system feedback loops, retention mechanics, and viral flywheels',
    metricTag: 'Journey Stages',
    canvasHeader: 'User Journey & Retention Canvas',
    canvasHint: 'Behavioral cues, feedback hooks, and viral loops',
    itemPrefix: 'STAGE',
    ruleHeader: 'Success Metric & Feedback Hook:',
    formulaHeader: '✨ Viral & Engagement Mechanics',
    formulaPrefix: 'Mechanic',
    icon: SparklesIcon,
  },
  capabilities: {
    badge: '💎 Core Mechanics & Secret Sauce',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'Proprietary Product Architecture & Capabilities',
    subtitle: 'The 10x mechanics, core workflow anchors, and unfair technical advantages',
    metricTag: 'Core Capabilities',
    canvasHeader: 'Proprietary Capabilities & Workflow Anchors',
    canvasHint: 'Unfair advantages and operational mechanisms',
    itemPrefix: 'CAPABILITY',
    ruleHeader: 'Operational Rule:',
    formulaHeader: '⚡ Strategic & Technical Archetypes',
    formulaPrefix: 'Archetype',
    icon: SparklesIcon,
  },
  general: {
    badge: '🥋 Secret Sauce Blueprint',
    badgeClass: 'text-violet-700 bg-violet-50 border-violet-200',
    title: 'Operational Execution Matrix & Core Mechanics',
    subtitle: 'The proprietary mechanics, state transitions, and operational rules powering this product',
    metricTag: 'Execution Beats',
    canvasHeader: 'Operational Mechanics Canvas',
    canvasHint: 'Key execution steps and operational constraints',
    itemPrefix: 'STEP',
    ruleHeader: 'Operational Rule & Constraint:',
    formulaHeader: '⚡ Strategic & Operational Formulas',
    formulaPrefix: 'Formula',
    icon: DocumentDuplicateIcon,
  }
};

export default function DomainBlueprintShowcase({ blueprint, domainBlueprint }) {
  const activeBlueprint = blueprint || domainBlueprint;
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!activeBlueprint || (!activeBlueprint.rows?.length && !activeBlueprint.formulas?.length)) return null;

  const { domainType = 'general', headers = [], rows = [], formulas = [] } = activeBlueprint;

  // If no rows and no formulas, hide cleanly
  if ((!rows || rows.length === 0) && (!formulas || formulas.length === 0)) return null;

  const config = DOMAIN_CONFIG[domainType] || DOMAIN_CONFIG.general;
  const DomainIcon = config.icon;

  const copyPrompt = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-7">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
              {config.badge}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-display">
            {config.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {config.subtitle}
          </p>
        </div>

        {rows && rows.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
            <DomainIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>{rows.length} {config.metricTag}</span>
          </span>
        )}
      </div>

      {/* Interactive Canvas Deck */}
      {rows && rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {config.canvasHeader}
            </span>
            <span className="text-xs text-slate-400">
              {config.canvasHint}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {rows.map((row, idx) => {
              const rowId = row.id || row.beat || String(idx + 1);
              const formattedId = String(rowId).padStart(2, '0');
              const title = row.title || row.name || `${config.itemPrefix} ${idx + 1}`;
              const tag = row.tag || row.framing || '';
              const action = row.action || '';
              const rule = row.rule || row.promptCue || '';

              return (
                <div
                  key={idx}
                  className="bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-3.5 group"
                >
                  <div className="space-y-2.5">
                    {/* Top row: Prefix # & Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {config.itemPrefix} {formattedId}
                      </span>
                      {tag && (
                        <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]" title={tag}>
                          {domainType === 'video' ? '📹 ' : (domainType === 'saas' ? '🔑 ' : '⚡ ')}{tag}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {title}
                    </h4>

                    {action && (
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {action}
                      </p>
                    )}
                  </div>

                  {rule && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {config.ruleHeader}
                        </span>
                        {domainType === 'video' && (
                          <button
                            onClick={() => copyPrompt(rule, idx)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                            title="Copy prompt directive"
                          >
                            {copiedIdx === idx ? (
                              <>
                                <ClipboardDocumentCheckIcon className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <DocumentDuplicateIcon className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div 
                        onClick={() => domainType === 'video' && copyPrompt(rule, idx)}
                        className={`text-[11px] font-mono text-slate-800 bg-white hover:bg-indigo-50/40 p-2.5 rounded-lg border border-slate-200 leading-relaxed transition ${domainType === 'video' ? 'cursor-pointer' : ''}`}
                      >
                        {domainType === 'video' ? `"${rule}"` : rule}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Choreography / Architecture Formulas */}
      {formulas && formulas.length > 0 && (
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {config.formulaHeader}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formulas.map((form, idx) => {
              const name = form.name || `${config.formulaPrefix} ${idx + 1}`;
              const desc = form.desc || form.description || '';
              return (
                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {config.formulaPrefix} {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {name}
                    </span>
                  </div>
                  {desc && (
                    <p className="text-xs text-slate-700 leading-relaxed font-normal m-0 pt-1">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
