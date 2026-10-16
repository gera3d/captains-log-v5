import React from 'react';
import {
  BookOpenIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  UserCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export default function IdeaMetricsDashboard({ summary }) {
  if (!summary) return null;

  const { metrics, persona, keywordCount, sourceCount, blueArgCount, redArgCount, hasBlueRed, wordCount } = summary;

  const stats = [
    {
      label: 'Target Customer',
      value: persona?.label ? (persona.label.length > 20 ? persona.label.slice(0, 18) + '...' : persona.label) : 'Creator / Builder',
      desc: persona?.job ? 'Identified from intent' : 'General target profile',
      icon: UserCircleIcon,
      tone: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Search Intent Targets',
      value: keywordCount > 0 ? `${keywordCount} Queries` : 'Discovery Matrix',
      desc: 'US search demand signals',
      icon: MagnifyingGlassIcon,
      tone: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Moats vs Reality',
      value: hasBlueRed ? `${blueArgCount} : ${redArgCount}` : '2 : 2',
      desc: hasBlueRed ? `${blueArgCount} moats • ${redArgCount} bottlenecks` : 'Dialectical analysis',
      icon: ScaleIcon,
      tone: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Venture Depth',
      value: wordCount ? `${wordCount} words` : 'Full Synthesis',
      desc: sourceCount > 0 ? `${sourceCount} verified citations` : 'Architect blueprint',
      icon: BookOpenIcon,
      tone: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-xl mb-2.5 ${s.tone}`}>
              <s.icon className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight truncate" title={String(s.value)}>
              {s.value}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{s.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Target Customer Highlight Card */}
      {persona && (
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/40 to-white p-4 sm:p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
            <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                Primary Ideal Customer Profile
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{persona.label}</h4>
            {persona.job && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                <span className="font-semibold text-slate-800">Core Job to be Done:</span> {persona.job}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Metric Highlight (if metrics exist) */}
      {Array.isArray(metrics) && metrics.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {metrics.slice(0, 2).map((m, i) => (
            <div key={i} className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Verified Benchmark
              </div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-1">{m.value}</div>
              <div className="text-xs text-slate-700 mt-0.5">{m.label}</div>
              {m.scope && <div className="text-[11px] text-slate-500 mt-1 italic">{m.scope}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
