import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeneration, STAGES, ESTIMATED_TOTAL_SECONDS } from '../contexts/GenerationContext';
import { 
  XMarkIcon, 
  MinusIcon, 
  ArrowsPointingOutIcon,
  CheckCircleIcon, 
  SparklesIcon,
  BellIcon,
  BellAlertIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowRightIcon,
  ClockIcon,
  MicrophoneIcon,
  ChartBarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const STAGE_ICONS = {
  ingest: MicrophoneIcon,
  market: ChartBarIcon,
  blueprint: CpuChipIcon,
  review: ShieldCheckIcon,
  finalize: RocketLaunchIcon,
};

export default function GenerationProgressHUD() {
  const navigate = useNavigate();
  const { 
    activeTask, 
    minimizeHUD, 
    maximizeHUD, 
    closeHUD,
    soundEnabled,
    toggleSound,
    notifyEnabled,
    toggleNotify
  } = useGeneration();

  const [previewBannerHeight, setPreviewBannerHeight] = useState(0);
  useEffect(() => {
    const banner = document.querySelector('[data-staging-banner], [data-live-preview-banner]');
    if (!banner) return;
    const update = () => setPreviewBannerHeight(banner.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  if (!activeTask) return null;

  const handleViewBlueprint = () => {
    const targetId = activeTask?.id || activeTask?.result?.id;
    if (targetId) {
      navigate(`/idea/${targetId}`);
    }
    closeHUD();
  };

  const elapsed = activeTask.elapsedSeconds || 0;
  const isComplete = activeTask.isComplete;
  const isError = !!activeTask.error;

  // Determine current active stage
  let currentStageIndex = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (elapsed >= STAGES[i].startSec) {
      currentStageIndex = i;
    }
  }
  if (isComplete) {
    currentStageIndex = STAGES.length - 1;
  }

  // Smooth animated percentage: 0 to 95% while waiting, 100% on completion
  const progressPercent = isComplete 
    ? 100 
    : Math.min(94, Math.max(6, Math.round((elapsed / ESTIMATED_TOTAL_SECONDS) * 100)));

  const estRemaining = Math.max(1, ESTIMATED_TOTAL_SECONDS - elapsed);
  const currentStage = STAGES[currentStageIndex] || STAGES[0];
  const ActiveStageIcon = STAGE_ICONS[currentStage?.id] || SparklesIcon;

  // =========================================================================
  // 1. MINIMIZED FLOATING DOCK (Bottom-Right Pill matching Dashboard theme)
  // =========================================================================
  if (activeTask.isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
        <div 
          onClick={isComplete ? handleViewBlueprint : maximizeHUD}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
            isComplete
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10 hover:border-emerald-400'
              : isError
                ? 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-500/10 hover:border-rose-400'
                : 'bg-white/95 border-indigo-200/90 text-slate-850 shadow-indigo-500/10 hover:border-indigo-400'
          }`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 shadow-sm ${
            isComplete
              ? 'bg-emerald-600 text-white'
              : isError
                ? 'bg-rose-600 text-white'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          }`}>
            {isComplete ? (
              <CheckCircleIcon className="w-5 h-5 text-white" />
            ) : isError ? (
              <ExclamationTriangleIcon className="w-5 h-5 text-white" />
            ) : (
              <ActiveStageIcon className="w-4.5 h-4.5 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isComplete ? 'text-emerald-700' : isError ? 'text-rose-700' : 'text-indigo-600'
              }`}>
                {isComplete ? 'Blueprint Ready' : isError ? 'Error' : `Step ${currentStageIndex + 1}/5`}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">• {formatTime(elapsed)}</span>
            </div>
            <p className="text-xs font-bold truncate max-w-[200px] text-slate-900">
              {isComplete ? activeTask.title : currentStage.label}
            </p>
          </div>

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); maximizeHUD(); }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Expand tracker"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. FULL EXPANDED PROGRESS MODAL (Matching Main Dashboard Signature Style)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" style={{ paddingTop: previewBannerHeight + 16 }}>
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden animate-dropdown"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: `calc(100dvh - ${previewBannerHeight + 32}px)`, overflowY: 'auto' }}
      >
        {/* Signature Header Bar (Matching GoodIdea Main Dashboard Header) */}
        <div className="relative bg-gradient-to-r from-[#2d1b8c] via-[#1e3a8a] to-[#1355b8] p-6 sm:p-7 text-white overflow-hidden">
          {/* Subtle radial overlay pattern matching dashboard header */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_70%)] pointer-events-none" />

          {/* Header Eyebrow & Window Controls */}
          <div className="flex items-center justify-between relative z-10 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-sm">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              {isComplete ? 'Synthesis Complete' : isError ? 'Generation Issue' : 'Adaptive Product Architect'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={minimizeHUD}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Minimize to corner"
              >
                <MinusIcon className="w-5 h-5" />
              </button>
              {isComplete && (
                <button
                  onClick={closeHUD}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Title & Goal */}
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight leading-snug">
              {isComplete ? (
                <span className="text-emerald-300 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-300 flex-shrink-0" />
                  <span>"{activeTask.title}" is ready!</span>
                </span>
              ) : isError ? (
                <span className="text-rose-200">Generation Encountered an Issue</span>
              ) : (
                <span>Structuring <span className="text-amber-300 font-extrabold">"{activeTask.title}"</span></span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 font-normal leading-relaxed">
              {isComplete
                ? 'Your verified domain blueprint, empirical market sizing, and builder brief are saved to your dashboard.'
                : isError
                  ? activeTask.error
                  : 'Transforming spoken brainstorm into an investor & builder-ready blueprint.'}
            </p>
          </div>
        </div>

        {/* Modal Body with Slate-50 Background */}
        <div className="p-6 sm:p-7 bg-slate-50/70 space-y-4">
          {/* Progress Bar & Real-Time Stats Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ClockIcon className="w-3.5 h-3.5" />
                </span>
                <span>Elapsed: <strong className="text-slate-900 font-bold">{formatTime(elapsed)}</strong></span>
              </span>

              <span className="text-slate-500 font-medium">
                {isComplete ? (
                  <span className="text-emerald-600 font-bold">Done in {formatTime(elapsed)}</span>
                ) : (
                  <span>Est. remaining: <strong className="text-indigo-600 font-bold">~{estRemaining}s</strong></span>
                )}
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative p-0.5 border border-slate-200/70">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
                  isComplete
                    ? 'from-emerald-500 to-teal-500'
                    : 'from-[#2d1b8c] via-indigo-600 to-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 5-Stage Stepper List */}
          <div className="space-y-2.5">
            {STAGES.map((stage, idx) => {
              const isStageComplete = isComplete || currentStageIndex > idx;
              const isStageActive = !isComplete && currentStageIndex === idx;
              const isStagePending = !isComplete && currentStageIndex < idx;
              const StageIcon = STAGE_ICONS[stage.id] || SparklesIcon;

              return (
                <div 
                  key={stage.id}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ${
                    isStageActive 
                      ? 'bg-white border-2 border-indigo-500 shadow-md ring-4 ring-indigo-50/80'
                      : isStageComplete
                        ? 'bg-white/90 border-slate-200/90 shadow-sm'
                        : 'bg-slate-100/50 border-slate-200/50 opacity-60'
                  }`}
                >
                  {/* Step Icon / Status Bubble */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm ${
                    isStageComplete
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : isStageActive
                        ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                        : 'bg-slate-200/80 text-slate-500 border border-slate-200'
                  }`}>
                    {isStageComplete ? (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                    ) : isStageActive ? (
                      <StageIcon className="w-4 h-4 animate-pulse text-white" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${
                        isStageActive 
                          ? 'text-indigo-950' 
                          : isStageComplete 
                            ? 'text-slate-900' 
                            : 'text-slate-500 font-medium'
                      }`}>
                        <span>{stage.label}</span>
                      </p>
                      <span className="flex-shrink-0">
                        {isStageComplete ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Done
                          </span>
                        ) : isStageActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                            In progress...
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            Pending
                          </span>
                        )}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 leading-relaxed ${
                      isStageActive 
                        ? 'text-slate-600' 
                        : isStageComplete 
                          ? 'text-slate-500' 
                          : 'text-slate-400'
                    }`}>
                      {stage.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Notification Preferences & Action */}
        <div className="p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleNotify}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer ${
                notifyEnabled 
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Desktop notification when idea is ready"
            >
              {notifyEnabled ? <BellAlertIcon className="w-4 h-4 text-indigo-600" /> : <BellIcon className="w-4 h-4 text-slate-400" />}
              <span>Notify tab switch</span>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer ${
                soundEnabled 
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Play pleasant chime when complete"
            >
              {soundEnabled ? <SpeakerWaveIcon className="w-4 h-4 text-emerald-600" /> : <SpeakerXMarkIcon className="w-4 h-4 text-slate-400" />}
              <span>Audio chime</span>
            </button>
          </div>

          <div>
            {isComplete ? (
              <button
                type="button"
                onClick={handleViewBlueprint}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>View Blueprint</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={minimizeHUD}
                className="text-slate-500 hover:text-indigo-600 font-semibold transition cursor-pointer text-xs underline-offset-2 hover:underline"
              >
                Keep working in background
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
