import React from 'react';

const savedValue = value => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
const savedList = value => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : [];

// Only facts carried by the saved report are shown. Missing fields stay absent.
export default function VentureBentoCockpit({ summary, reportSummary }) {
  const data = summary || reportSummary;
  if (!data) return null;
  const sc = data.scorecard || {};
  const bt = data.brutalTruth || {};
  const metrics = [
    ['Market opportunity', sc.opportunityScore, sc.opportunityLabel],
    ['Problem severity', sc.problemSeverity, sc.problemLabel],
    ['Technical feasibility', sc.feasibility, sc.feasibilityLabel],
    ['Why now / timing', sc.whyNow, sc.whyNowLabel],
    ['Execution difficulty', sc.executionDifficulty],
    ['Go-to-market traction', sc.gtmScore],
  ].filter(([, value]) => savedValue(value) !== '');
  const strengths = savedList(bt.superpowers), risks = savedList(bt.fatalTraps);
  const score = savedValue(bt.score), grade = savedValue(bt.grade), verdict = savedValue(bt.verdictSummary || bt.verdict);
  const persona = savedValue(data.persona?.label), job = savedValue(data.persona?.job);
  if (!metrics.length && !strengths.length && !risks.length && !score && !grade && !verdict && !persona && !job) return null;
  return <div className="space-y-6">
    {(score || grade || verdict) && <section className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-xl font-semibold text-slate-900 mb-3">Saved assessment</h2>{(score || grade) && <p className="font-semibold text-slate-900">{[grade, score].filter(Boolean).join(' · ')}</p>}{verdict && <p className="mt-2 text-sm leading-relaxed text-slate-700">{verdict}</p>}</section>}
    {(strengths.length > 0 || risks.length > 0) && <div className="grid md:grid-cols-2 gap-5">{[["What could work", strengths], ["What needs checking", risks]].filter(([, items]) => items.length).map(([label, items]) => <section key={label} className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-lg font-semibold text-slate-900 mb-3">{label}</h2><ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed text-slate-700">{items.map((text, index) => <li key={index}>{text}</li>)}</ul></section>)}</div>}
    {metrics.length > 0 && <section className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-xl font-semibold text-slate-900 mb-4">Saved scores</h2><dl className="grid sm:grid-cols-2 gap-5">{metrics.map(([label, value, context]) => <div key={label}><dt className="text-sm text-slate-600">{label}</dt><dd className="font-semibold text-slate-900 mt-1">{savedValue(value)}{typeof value === 'number' ? '/10' : ''}</dd>{savedValue(context) && <p className="text-sm text-slate-600 mt-1">{savedValue(context)}</p>}</div>)}</dl></section>}
    {(persona || job) && <section className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-xl font-semibold text-slate-900 mb-3">Saved customer hypothesis</h2>{persona && <p className="font-semibold text-slate-900">{persona}</p>}{job && <p className="text-sm text-slate-700 leading-relaxed mt-2">{job}</p>}</section>}
  </div>;
}
