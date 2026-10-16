import React from 'react';
import {
  FireIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  ScaleIcon,
  SparklesIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Helper to highlight leading keywords for scannability
function FormattedBullet({ text, iconType = 'check' }) {
  if (!text) return null;
  
  // If the text contains a colon or dash near the start, bold the premise
  const colonMatch = text.match(/^([^:—–]{3,45})[:—–]\s*(.+)$/);
  if (colonMatch) {
    return (
      <li className="flex items-start gap-2.5">
        <span className={`font-bold mt-0.5 flex-shrink-0 text-sm ${iconType === 'check' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {iconType === 'check' ? '✓' : '⚠'}
        </span>
        <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-semibold">{colonMatch[1].trim()}: </strong>
          {colonMatch[2].trim()}
        </span>
      </li>
    );
  }

  // Otherwise bold the first 4 words for quick scannability
  const words = text.split(' ');
  const lead = words.slice(0, 4).join(' ');
  const rest = words.slice(4).join(' ');

  return (
    <li className="flex items-start gap-2.5">
      <span className={`font-bold mt-0.5 flex-shrink-0 text-sm ${iconType === 'check' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {iconType === 'check' ? '✓' : '⚠'}
      </span>
      <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        <strong className="text-slate-900 font-semibold">{lead} </strong>
        {rest}
      </span>
    </li>
  );
}

export default function VentureBentoCockpit({ summary, reportSummary, onOpenLaunchKit, onOpenPRD }) {
  const activeSummary = summary || reportSummary;
  if (!activeSummary) return null;

  const { brutalTruth, scorecard, persona } = activeSummary;

  const sc = scorecard || {};
  const bt = brutalTruth || {
    score: '8.8/10',
    grade: 'STRONG BUILD SIGNAL',
    tone: 'emerald',
    verdictSummary: 'High urgency pain, feasible MVP loop, and durable moats against foundation model commoditization.',
    superpowers: [
      'Stateful Continuity Graph: Captures directing intent in a stateful choreography graph above commoditizing video APIs.',
      'Keyframe Gatekeeping: Enforces locked character still approval before video render to eliminate costly floaty motion.'
    ],
    fatalTraps: [
      'Two-Character Contact Bottleneck: Crossed limbs and close contact invite severe diffusion model failures.',
      'Full-Reroll Credit Burn: Full sequence regenerations destroy creator budget; single-card regeneration is required.'
    ]
  };

  const verdictBadgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs',
    amber: 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs',
    rose: 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
  }[bt.tone || 'emerald'];

  const gauges = [
    { label: 'Market Opportunity', score: sc.opportunityScore || 9, tag: sc.opportunityLabel || 'Exceptional', bar: 'bg-emerald-500' },
    { label: 'Problem Severity', score: sc.problemSeverity || 9, tag: sc.problemLabel || 'Acute Pain', bar: 'bg-rose-500' },
    { label: 'Technical Feasibility', score: sc.feasibility || 8, tag: sc.feasibilityLabel || 'Turnkey MVP Loop', bar: 'bg-indigo-600' },
    { label: 'Why Now / Timing', score: sc.whyNow || 9, tag: sc.whyNowLabel || 'AI Platform Catalyst', bar: 'bg-violet-600' },
    { label: 'Execution Difficulty', score: 3, customText: sc.executionDifficulty || '3/10 (Weekend MVP)', bar: 'bg-amber-500' },
    { label: 'Go-To-Market Traction', score: 8, customText: sc.gtmScore || '8/10 (High Organic Pull)', bar: 'bg-teal-500' }
  ];

  return (
    <div className="space-y-6">
      {/* SECTION 1: THE BRUTAL REALITY CHECK */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${verdictBadgeClasses}`}>
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              <span>{bt.grade} • {bt.score}</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              ⚡ Technical Wedge
            </span>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Venture Risk & Defensibility Appraisal
          </span>
        </div>

        {/* Side-by-side: Superpower vs Fatal Trap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* The Unfair Advantage (Why It Wins) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm tracking-tight">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <FireIcon className="w-4 h-4 text-emerald-700" />
              </div>
              <span>The Unfair Superpower (Why It Wins)</span>
            </div>
            <ul className="space-y-2.5">
              {bt.superpowers.map((point, idx) => (
                <FormattedBullet key={idx} text={point} iconType="check" />
              ))}
            </ul>
          </div>

          {/* The Fatal Trap (Why 90% Will Fail) */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm tracking-tight">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <ShieldExclamationIcon className="w-4 h-4 text-rose-700" />
              </div>
              <span>The Fatal Trap (Why 90% Will Fail)</span>
            </div>
            <ul className="space-y-2.5">
              {bt.fatalTraps.map((point, idx) => (
                <FormattedBullet key={idx} text={point} iconType="warning" />
              ))}
            </ul>
          </div>
        </div>

        {/* The Bottom Line Banner */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs sm:text-sm text-slate-700 flex items-start gap-3.5">
          <span className="text-lg flex-shrink-0 mt-0.5">🎯</span>
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900">Founder Bottom Line: </span>
            <span>{bt.verdictSummary}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE 3 ASYMMETRIC BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* BENTO TILE 1: 6-AXIS VIABILITY GAUGES */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ScaleIcon className="w-4 h-4 text-indigo-600" />
                <span>Viability Radar (0–10)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Scorecard
              </span>
            </div>

            <div className="space-y-3.5">
              {gauges.map((g) => {
                const percent = (g.score / 10) * 100;
                return (
                  <div key={g.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600">{g.label}</span>
                      <span className="font-bold text-slate-900">{g.customText || `${g.score}/10`}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
            <span>Overall Score: <strong className="text-slate-900">{bt.score}</strong></span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Turnkey Feasibility
            </span>
          </div>
        </div>

        {/* BENTO TILE 2: IDEAL CUSTOMER PROFILE (ICP) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <UserCircleIcon className="w-4 h-4 text-sky-600" />
                <span>Primary Target Customer</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                ICP
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block mb-1">
                  Target Persona
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {persona?.label || 'Independent Anime Short Creator'}
                </h4>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Core Job-to-be-Done
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium m-0">
                  {persona?.job || 'Direct a coherent 15–45 second fight teaser featuring two original characters.'}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                  The Acute Frustration
                </span>
                <p className="text-xs text-slate-700 leading-relaxed m-0">
                  Hours wasted rerolling video prompts that warp anatomy, blend character costumes, and break camera consistency.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Validated Demand</span>
            <span className="font-semibold text-slate-700">Zero-CAC Audience</span>
          </div>
        </div>

        {/* BENTO TILE 3: STRATEGIC MOAT & WHY NOW TIMING */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <SparklesIcon className="w-4 h-4 text-violet-600" />
                <span>Strategic Moat & Timing</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                Defensibility
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  The Reusable Continuity Moat
                </span>
                <p className="text-xs text-slate-700 leading-relaxed m-0">
                  Directing graph retains framing transitions, pose skeletons, and character bibles. Switching costs grow with every approved shot.
                </p>
              </div>

              <div className="rounded-xl bg-violet-50/60 p-3 border border-violet-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block">
                  Why Now (2026 Platform Shift)
                </span>
                <p className="text-xs text-slate-700 leading-relaxed m-0">
                  Generative video APIs are commoditizing; value concentrates in choreography control and single-card regeneration.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Platform Timing</span>
            <span className="font-bold text-violet-700">Durable API Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
