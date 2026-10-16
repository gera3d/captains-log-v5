import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'How do I record my voice notes?',
    answer: 'Simply tap the glowing microphone button in the recorder card, allow browser microphone permission when prompted, and start speaking. When finished, tap stop to generate your transcript and analysis.',
  },
  {
    question: 'Can I transcribe existing audio files?',
    answer: 'Currently, live in-browser voice capture is the primary flow to keep ideation immediate. Direct upload support for MP3, WAV, and M4A files is scheduled on our upcoming roadmap.',
  },
  {
    question: 'How accurate is the transcription?',
    answer: 'We leverage OpenAI Whisper AI models capable of 98%+ precision across complex jargon, accents, and casual conversational pacing.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'All audio recordings and transcriptions are encrypted both in transit and at rest using enterprise-grade AES-256 encryption. We never sell your data or train public models on your proprietary ideas.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-24 bg-slate-950 border-t border-white/10 text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-4">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about transforming voice notes into validated startup concepts.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="group bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-blue-400/30 rounded-2xl p-6 sm:p-7 shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-lg text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {item.question}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}