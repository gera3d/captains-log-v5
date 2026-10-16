import React, { Children } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  ChartBarSquareIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  SparklesIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  PresentationChartLineIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

// Helper to extract text from React children tree
function textOf(children) {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'number') return String(child);
      if (child && child.props && child.props.children) return textOf(child.props.children);
      return '';
    })
    .join('');
}

function Blockquote({ children }) {
  const text = textOf(children);

  // 1. Elevator Pitch Flagship Callout
  if (/elevator pitch/i.test(text)) {
    return (
      <blockquote className="not-prose my-6 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-transparent p-5 sm:p-6 shadow-sm flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5 border border-amber-200">
          <SparklesIcon className="w-5 h-5 text-amber-600" />
        </div>
        <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium [&_strong]:text-amber-950 [&_p]:my-0">
          {children}
        </div>
      </blockquote>
    );
  }

  // 2. Working Hypothesis Persona Quote
  if (/working hypothesis/i.test(text)) {
    return (
      <blockquote className="not-prose my-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5 flex gap-3.5 shadow-sm">
        <UserCircleIcon className="h-6 w-6 text-indigo-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-slate-800 [&_p]:my-1 [&_strong]:text-indigo-900 leading-relaxed">
          {children}
        </div>
      </blockquote>
    );
  }

  // 3. Observed Metric Limit Callout
  if (/what it cannot tell us:/i.test(text)) {
    return (
      <blockquote className="not-prose my-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex gap-3.5 shadow-sm">
        <ChartBarSquareIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-slate-800 [&_p]:my-1 [&_strong]:text-emerald-900 leading-relaxed">
          {children}
        </div>
      </blockquote>
    );
  }

  // 4. Evidence Gap Callout
  if (/evidence gap:/i.test(text)) {
    return (
      <blockquote className="not-prose my-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex gap-3.5 shadow-sm">
        <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-slate-800 [&_p]:my-1 [&_strong]:text-amber-900 leading-relaxed">
          {children}
        </div>
      </blockquote>
    );
  }

  return (
    <blockquote className="border-l-4 border-indigo-500 bg-slate-50 pl-4 py-2 pr-4 rounded-r-xl italic text-slate-700 my-4 leading-relaxed">
      {children}
    </blockquote>
  );
}

function Heading3({ children }) {
  const text = textOf(children);

  // 1. Blue Team / Strategic Moats
  if (/blue team|strategic moat/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50/60 shadow-sm">
        <ShieldCheckIcon className="h-5 w-5 text-sky-600 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-sky-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 2. Red Team / Engineering Reality Check
  if (/red team|engineering reality/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50/60 shadow-sm">
        <ExclamationTriangleIcon className="h-5 w-5 text-rose-600 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-rose-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 3. Domain Blueprint / Secret Sauce
  if (/domain blueprint|secret sauce/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50/60 shadow-sm">
        <span className="text-lg">🥋</span>
        <h3 className="text-sm sm:text-base font-bold text-indigo-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 4. Market Viability, Search Demand & Unit Economics
  if (/market viability|search demand|unit economics/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50/60 shadow-sm">
        <PresentationChartLineIcon className="h-5 w-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-purple-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 5. Technical Architecture & AI Pipeline
  if (/technical architecture|ai pipeline/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50 shadow-sm">
        <CommandLineIcon className="h-5 w-5 text-slate-700 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 6. 48-Hour Weekend MVP Build Plan
  if (/mvp build plan|48-hour/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 shadow-sm">
        <BoltIcon className="h-5 w-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-amber-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 7. Proposed Starting Customer
  if (/proposed starting customer/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 shadow-sm">
        <UserCircleIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-indigo-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 8. What This Customer Might Search
  if (/what this customer might search/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50/70 shadow-sm">
        <span className="text-base">🔍</span>
        <h3 className="text-sm sm:text-base font-bold text-sky-950 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  // 9. Sources and Limits
  if (/sources and limits/i.test(text)) {
    return (
      <div className="not-prose mt-8 mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <WrenchScrewdriverIcon className="h-5 w-5 text-slate-500 flex-shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-bold text-slate-700 uppercase tracking-wide m-0">
          {children}
        </h3>
      </div>
    );
  }

  return <h3 className="mt-8 mb-3 text-lg font-bold text-slate-900">{children}</h3>;
}

// Convert Multi-stage pipeline flow `[...] -> [...]` into an interactive node chain
function Paragraph({ children }) {
  const text = textOf(children);
  if (/\[.+\]\s*->\s*\[.+\]/.test(text)) {
    const rawSteps = text.replace(/^[^\n]*flow:\s*/i, '').trim();
    const steps = rawSteps.split(/\s*->\s*/).map(s => s.replace(/^\[|\]$/g, '').trim()).filter(Boolean);
    if (steps.length >= 3) {
      return (
        <div className="not-prose my-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg overflow-x-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
            <CommandLineIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Execution Pipeline Architecture</span>
          </div>
          <div className="flex items-center gap-2 min-w-max pb-1">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-xs font-semibold text-indigo-200 shadow-sm flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
                {idx < steps.length - 1 && (
                  <span className="text-slate-500 font-bold text-sm px-0.5">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return <p className="leading-relaxed text-slate-700 my-3">{children}</p>;
}

function Hr() {
  return <hr className="my-7 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />;
}

function Anchor({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:text-indigo-800 font-medium underline decoration-indigo-300 hover:decoration-indigo-600 inline-flex items-center gap-0.5 transition-colors"
    >
      {children}
      <ArrowTopRightOnSquareIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
    </a>
  );
}

// GitHub Flavored Markdown Table Components
function Table({ children }) {
  return (
    <div className="not-prose my-6 w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
        {children}
      </table>
    </div>
  );
}

function Thead({ children }) {
  return (
    <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px] border-b border-slate-200">
      {children}
    </thead>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-900 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 text-slate-700 leading-relaxed align-top">
      {children}
    </td>
  );
}

function Tr({ children }) {
  return (
    <tr className="hover:bg-indigo-50/30 transition-colors even:bg-slate-50/40">
      {children}
    </tr>
  );
}

export const ideaMarkdownComponents = {
  blockquote: Blockquote,
  h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4 tracking-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 tracking-tight border-b border-slate-200 pb-2">{children}</h2>,
  h3: Heading3,
  h4: ({ children }) => <h4 className="text-base font-bold text-indigo-900 mt-6 mb-2">{children}</h4>,
  p: Paragraph,
  table: Table,
  thead: Thead,
  tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
  th: Th,
  td: Td,
  tr: Tr,
  hr: Hr,
  a: Anchor,
  ul: ({ children }) => <ul className="my-3 space-y-2 list-disc list-outside pl-5 text-slate-700 leading-relaxed">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 space-y-2 list-decimal list-outside pl-5 text-slate-700 leading-relaxed">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed text-slate-700">{children}</li>,
  code: ({ inline, children }) => inline ? (
    <code className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-indigo-700 font-mono text-xs">{children}</code>
  ) : (
    <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-slate-100 font-mono text-xs my-4 leading-relaxed">{children}</pre>
  )
};
