import React from 'react';
import {
  RocketLaunchIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function parseScore(val) {
  if (typeof val === 'number') return { num: Math.min(10, Math.max(1, val)), text: `${val}/10` };
  if (!val) return { num: 7, text: '7/10' };
  const str = String(val);
  const match = str.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (match) {
    const n = parseFloat(match[1]);
    return { num: Math.min(10, Math.max(1, n)), text: str };
  }
  const digitMatch = str.match(/\b([1-9]|10)\b/);
  if (digitMatch) {
    const n = parseFloat(digitMatch[1]);
    return { num: n, text: str.includes('/') ? str : `${n}/10` };
  }
  return { num: 7, text: str };
}

export default function VentureScorecard({ scorecard, marketPosition }) {
  if (!scorecard && !marketPosition) return null;

  const sc = scorecard || {};

  const metrics = [
    {
      title: 'Market Opportunity',
      ...parseScore(sc.opportunityScore || 9),
      label: sc.opportunityLabel || 'Exceptional Upside',
      context: 'Niche TAM, unaddressed willingness to pay, and revenue ceiling',
      icon: RocketLaunchIcon,
      color: 'emerald',
      barColor: 'bg-emerald-500',
      pillBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Problem Severity',
      ...parseScore(sc.problemSeverity || 9),
      label: sc.problemLabel || 'Severe Hair-on-Fire Pain',
      context: 'Acute customer urgency, active frustration, and switching drive',
      icon: FireIcon,
      color: 'rose',
      barColor: 'bg-rose-500',
      pillBg: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      title: 'Technical Feasibility',
      ...parseScore(sc.feasibility || 8),
      label: sc.feasibilityLabel || 'Turnkey MVP Loop',
      context: 'Available AI APIs, deterministic logic, and low model hallucination risk',
      icon: WrenchScrewdriverIcon,
      color: 'indigo',
      barColor: 'bg-indigo-500',
      pillBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      title: 'Why Now / Timing',
      ...parseScore(sc.whyNow || 9),
      label: sc.whyNowLabel || 'AI / Regulatory Catalyst',
      context: 'Recent model breakthroughs, policy cliff, or consumer habit shift',
      icon: ClockIcon,
      color: 'violet',
      barColor: 'bg-violet-500',
      pillBg: 'bg-violet-50 text-violet-700 border-violet-200'
    },
    {
      title: 'Execution Difficulty',
      ...parseScore(sc.executionDifficulty || '3/10 (Weekend Prototype)'),
      label: String(sc.executionDifficulty || 'Weekend Prototype').replace(/^\d+\/\d+\s*[-—·•]?\s*/, ''),
      context: 'Time-to-functional prototype and infrastructure operational overhead',
      icon: CpuChipIcon,
      color: 'amber',
      barColor: 'bg-amber-500',
      pillBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Go-To-Market Traction',
      ...parseScore(sc.gtmScore || '8/10 (High Organic Pull)'),
      label: String(sc.gtmScore || 'Strong Organic Demand').replace(/^\d+\/\d+\s*[-—·•]?\s*/, ''),
      context: 'Viral mechanics, specific community watering holes, and low CAC',
      icon: ArrowTrendingUpIcon,
      color: 'teal',
      barColor: 'bg-teal-500',
      pillBg: 'bg-teal-50 text-teal-700 border-teal-200'
    }
  ];

  return (
    <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header with Title & Market Position Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🎯</span> Venture Viability Scorecard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic appraisal across market urgency, technical feasibility, and distribution velocity
          </p>
        </div>

        {marketPosition && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs self-start sm:self-auto">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 tracking-wide">
              {marketPosition}
            </span>
          </div>
        )}
      </div>

      {/* 6 Metric Gauge Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {metrics.map((m) => {
          const percent = Math.min(100, Math.max(10, (m.num / 10) * 100));
          return (
            <div
              key={m.title}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <m.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">{m.title}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    {m.num}/10
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${m.barColor}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Label Pill */}
                {m.label && (
                  <div className="mb-2">
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${m.pillBg}`}>
                      {m.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Context Hint */}
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-1">
                {m.context}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
