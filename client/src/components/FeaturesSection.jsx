import React from 'react';
import { MicrophoneIcon, DocumentTextIcon, CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    step: '01',
    badgeColor: 'bg-blue-500/10 border-blue-400/20 text-blue-300',
    iconGradient: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    icon: MicrophoneIcon,
    title: 'Speak Freely',
    description: 'Tap record and brain-dump your idea out loud. No script, formatting, or typing required — just speak naturally.',
    feature: 'Lossless audio capture & noise cancellation',
  },
  {
    step: '02',
    badgeColor: 'bg-purple-500/10 border-purple-400/20 text-purple-300',
    iconGradient: 'from-indigo-500 to-purple-600 shadow-purple-500/20',
    icon: DocumentTextIcon,
    title: 'AI Structuring',
    description: 'State-of-the-art AI instantly transcribes and organizes raw rambling into executive problem statements and core features.',
    feature: 'Whisper AI transcription & smart summarization',
  },
  {
    step: '03',
    badgeColor: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300',
    iconGradient: 'from-purple-500 to-pink-600 shadow-pink-500/20',
    icon: CheckBadgeIcon,
    title: 'Validate & Prioritize',
    description: 'Receive an objective viability score, competitive market analysis, and tailored execution roadmap in minutes.',
    feature: 'Data-driven viability scoring & next actions',
  },
];

export default function FeaturesSection() {
  return (
    <section id="how-it-works" className="relative py-24 bg-slate-950/70 border-t border-b border-white/10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight mb-4">
            From Spoken Thought to Validated Startup
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Turn fleeting flashes of inspiration into structured, research-backed venture plans in three effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-blue-400/40 hover:bg-slate-800/70 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-mono font-bold ${item.badgeColor}`}>
                      STEP {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <SparklesIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{item.feature}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}