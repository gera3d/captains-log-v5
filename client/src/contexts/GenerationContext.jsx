import { generationMessage } from '../utils/generationRequest';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const GenerationContext = createContext(null);

export const STAGES = [
  {
    id: 'ingest',
    label: 'Analyzing Monologue & Premise',
    detail: 'De-noising speech, extracting core problem, characters & setting',
    icon: '🎙️',
    startSec: 0,
    endSec: 7
  },
  {
    id: 'market',
    label: 'Market Demand & Search Sizing',
    detail: 'Estimating keyword search volumes, platform split & TAM/SAM/SOM',
    icon: '📊',
    startSec: 7,
    endSec: 18
  },
  {
    id: 'blueprint',
    label: 'Domain Blueprint & Secret Sauce',
    detail: 'Compiling 9-beat battle matrix, tech pipeline & unit economics',
    icon: '🥋',
    startSec: 18,
    endSec: 32
  },
  {
    id: 'review',
    label: 'Strategic Moats & Senior Review',
    detail: 'Adversarial reality check, edge case testing & schema validation',
    icon: '🛡️',
    startSec: 32,
    endSec: 43
  },
  {
    id: 'finalize',
    label: 'Finalizing & Publishing',
    detail: 'Compiling verified markdown report & updating your dashboard',
    icon: '🚀',
    startSec: 43,
    endSec: 52
  }
];

export const ESTIMATED_TOTAL_SECONDS = 42;

export function playCompletionChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Harmonic 3-tone chime (C5 -> E5 -> G5)
    const tones = [
      { freq: 523.25, time: 0, dur: 0.45, gain: 0.12 },
      { freq: 659.25, time: 0.11, dur: 0.55, gain: 0.14 },
      { freq: 783.99, time: 0.23, dur: 0.85, gain: 0.18 }
    ];

    tones.forEach(({ freq, time, dur, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      g.gain.setValueAtTime(gain, now + time);
      g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.debug('Audio chime error:', err);
  }
}

export function triggerDesktopNotification(title, summary, targetUrl) {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notif = new Notification(`💡 Idea Ready: ${title || 'Startup Blueprint'}`, {
          body: summary || 'Your structured business blueprint and market analysis are ready to view!',
          icon: '/goodideas.png',
          tag: 'goodidea-ready-' + Date.now()
        });
        notif.onclick = () => {
          window.focus();
          if (targetUrl) {
            window.location.href = targetUrl;
          }
        };
      }
    }
  } catch (err) {
    console.debug('Desktop notification error:', err);
  }
}

export function GenerationProvider({ children }) {
  const [activeTask, setActiveTask] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === 'hud') {
        return {
          id: 'preview_demo',
          title: 'Startup Blueprint',
          type: 'generate',
          startTime: Date.now() - 19000,
          elapsedSeconds: 19,
          isComplete: false,
          isMinimized: false,
          error: null,
          result: null
        };
      }
    }
    return null;
  });
  const timerRef = useRef(null);
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');

  // Expose test helper on window for direct verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__setPreviewHUD = (task) => setActiveTask(task);
    }
  }, []);

  // Sound and notification preferences (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('goodidea_chime_enabled') !== 'false';
  });
  const [notifyEnabled, setNotifyEnabled] = useState(() => {
    return localStorage.getItem('goodidea_notify_enabled') !== 'false';
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('goodidea_chime_enabled', String(next));
      return next;
    });
  };

  const toggleNotify = () => {
    setNotifyEnabled(prev => {
      const next = !prev;
      localStorage.setItem('goodidea_notify_enabled', String(next));
      if (next && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      return next;
    });
  };

  // Timer loop for active generation
  useEffect(() => {
    if (activeTask && !activeTask.isComplete && !activeTask.error) {
      timerRef.current = setInterval(() => {
        setActiveTask(prev => {
          if (!prev || prev.isComplete || prev.error) return prev;
          const newElapsed = Math.round((Date.now() - prev.startTime) / 1000);

          // Update tab title with live elapsed time
          if (typeof document !== 'undefined') {
            document.title = `(⏳ ${newElapsed}s) Structuring "${prev.title || 'Idea'}"... | GoodIdea`;
          }

          return {
            ...prev,
            elapsedSeconds: newElapsed
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTask?.isComplete, activeTask?.error]);

  const minimizeHUD = useCallback(() => {
    setActiveTask(prev => prev ? { ...prev, isMinimized: true } : null);
  }, []);

  const maximizeHUD = useCallback(() => {
    setActiveTask(prev => prev ? { ...prev, isMinimized: false } : null);
  }, []);

  const closeHUD = useCallback(() => {
    setActiveTask(null);
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current || 'GoodIdea';
    }
  }, []);

  // Main runner function
  const runGeneration = useCallback(async ({ ideaId, title, type = 'generate', execute }) => {
    if (typeof window !== 'undefined') {
      originalTitleRef.current = document.title;
      // Proactively request notification permission on user action
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }

    const startTime = Date.now();
    setActiveTask({
      id: ideaId,
      title: title || 'New Startup Idea',
      type, // 'generate' | 'regenerate' | 'ingest'
      startTime,
      elapsedSeconds: 0,
      isComplete: false,
      isMinimized: false,
      error: null,
      result: null
    });

    try {
      const result = await execute();

      const resolvedTitle = result?.title || title || 'New Startup Idea';
      const resolvedSummary = result?.summary || result?.processedContent?.problemStatement || '';
      const resolvedUrl = result?.url || (ideaId ? `/idea/${ideaId}` : null);

      setActiveTask(prev => ({
        ...prev,
        title: resolvedTitle,
        isComplete: true,
        result
      }));

      // Audio cue
      if (soundEnabled) {
        playCompletionChime();
      }

      // Desktop Push Notification
      if (notifyEnabled) {
        triggerDesktopNotification(resolvedTitle, resolvedSummary, resolvedUrl);
      }

      // Flash tab title
      if (typeof document !== 'undefined') {
        document.title = `(🔔 Ready!) ${resolvedTitle} | GoodIdea`;
        setTimeout(() => {
          document.title = originalTitleRef.current || 'GoodIdea';
        }, 12000);
      }

      return result;
    } catch (err) {
      console.error('[GenerationContext] Generation failed:', err?.code || 'generation_failed');
      setActiveTask(prev => ({
        ...prev,
        error: generationMessage(err),
        isComplete: false
      }));
      if (typeof document !== 'undefined') {
        document.title = originalTitleRef.current || 'GoodIdea';
      }
      throw err;
    }
  }, [soundEnabled, notifyEnabled]);

  return (
    <GenerationContext.Provider
      value={{
        activeTask,
        isGenerating: !!activeTask && !activeTask.isComplete && !activeTask.error,
        runGeneration,
        minimizeHUD,
        maximizeHUD,
        closeHUD,
        soundEnabled,
        toggleSound,
        notifyEnabled,
        toggleNotify
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}
