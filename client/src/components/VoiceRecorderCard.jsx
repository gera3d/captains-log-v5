import React from "react";
import VoiceRecorder from "./VoiceRecorder";

/**
 * Premium Hero Card for Voice Recording
 * - Modern gradient background
 * - Glassmorphism effect
 * - Clear visual hierarchy
 * - Responsive and accessible
 * - Delightful, inviting copy
 */
const VoiceRecorderCard = () => {
  return (
    <section
      className="
        relative max-w-2xl mx-auto mt-12 mb-8
        rounded-3xl shadow-2xl overflow-hidden
        px-0 sm:px-0
        flex flex-col items-center
        bg-gradient-to-br from-sky-100 via-white to-indigo-100
        border border-slate-200
        backdrop-blur-md
        ring-1 ring-sky-200/40
        transition-shadow
        focus-within:ring-2 focus-within:ring-sky-400
      "
      aria-label="Voice Recorder Hero Card"
    >
      {/* Hero Headline */}
      <div className="w-full flex flex-col items-center pt-10 pb-2 px-6 sm:px-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center drop-shadow-lg">
          🎤 Speak Your Next Big Idea
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-slate-700 text-center font-medium max-w-xl">
          Hold the mic, share your thoughts, and let us turn your voice into validated insights.
        </p>
      </div>
      {/* Mic CTA */}
      <div className="w-full flex justify-center mt-4 mb-2 px-4">
        <VoiceRecorder />
      </div>
      {/* Subtext */}
      <div className="w-full flex flex-col items-center pb-8 pt-2 px-6 sm:px-12">
        <p className="text-base text-slate-500 text-center font-normal max-w-lg">
          Your recording will be transcribed, analyzed, and checked for market potential—instantly.
        </p>
      </div>
    </section>
  );
};

export default VoiceRecorderCard;