// TODO[progress-md][P1][VoiceRecorder] See progress.md for all open voice recording tasks
import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../supabaseClient';
import { MicrophoneIcon } from '@heroicons/react/24/outline';

console.log('[VoiceRecorder][DEBUG] VoiceRecorder component loaded');

export default function VoiceRecorder({ onNoteSaved }) {
  const [status, setStatus] = useState('idle');
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Tooltip state for first-time users
  const [showTooltip, setShowTooltip] = useState(false);

  // Animated waveform state
  const [waveformHeights, setWaveformHeights] = useState(Array(40).fill(8));

  // Show tooltip only once per user (localStorage)
  useEffect(() => {
    if (localStorage.getItem('voiceRecorderTooltipShown') !== 'true') {
      setShowTooltip(true);
    }
  }, []);

  const handleTooltipClose = () => {
    setShowTooltip(false);
    localStorage.setItem('voiceRecorderTooltipShown', 'true');
  };

  // Animate waveform bars when recording
  useEffect(() => {
    let interval;
    if (status === 'recording') {
      interval = setInterval(() => {
        setWaveformHeights(
          Array(40)
            .fill(0)
            .map(() => 8 + Math.floor(Math.random() * 24))
        );
      }, 120);
    } else {
      setWaveformHeights(Array(40).fill(8));
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    return () => clearInterval(recordingTimerRef.current);
  }, []);

  // --- Recording logic unchanged ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingStartTime(Date.now());

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      setProgress(0);
      setIsUploading(true);

      mediaRecorder.onstop = async () => {
        // ... unchanged ...
        // (omitted for brevity, see original)
        // ... unchanged ...
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const fileName = `voice-note-${Date.now()}.webm`;
        const { data, error } = await supabase.storage.from('voice-notes').upload(fileName, blob, {
          contentType: 'audio/webm',
        });
        if (error) {
          setStatus('error');
          return;
        }

        // ... rest of upload/transcription logic unchanged ...
        // (omitted for brevity, see original)
        // ... unchanged ...
        const getPlayableUrl = async (baseName) => {
          const tryExts = ['mp3', 'm4a', 'webm'];
          for (const ext of tryExts) {
            const candidate = baseName.replace(/\.webm$/, `.${ext}`);
            const { data: urlData } = supabase.storage.from('voice-notes').getPublicUrl(candidate);
            try {
              const resp = await fetch(urlData.publicUrl, { method: 'HEAD' });
              if (resp.ok) {
                return urlData.publicUrl;
              }
            } catch (e) {}
          }
          const { data: fallbackUrlData } = supabase.storage.from('voice-notes').getPublicUrl(baseName);
          return fallbackUrlData.publicUrl;
        };

        const publicUrl = await getPlayableUrl(fileName);

        let transcriptText = '';
        try {
          const formData = new FormData();
          formData.append('file', blob, fileName);
          const response = await fetch('https://n8n.why57.com/webhook/a37165d8-dcbd-4c54-8712-4400bec5f17b', {
            method: 'POST',
            body: formData,
          });
          const responseText = await response.text();
          let transcriptArray = [];
          try {
            transcriptArray = JSON.parse(responseText);
          } catch {
            transcriptArray = [];
          }
          if (Array.isArray(transcriptArray)) {
            transcriptText = transcriptArray.map(item => {
              if (typeof item === 'object' && item !== null) {
                if (item.text) return item.text;
                if (item.data) return item.data;
                return JSON.stringify(item);
              } else {
                return String(item);
              }
            }).join(' ');
          }
        } catch (err) {}

        const audio = new Audio(publicUrl);

        function getAudioDurationWithTimeout(audioEl, timeoutMs = 2500) {
          return new Promise((resolve) => {
            let settled = false;
            function onLoadedMetadata() {
              if (!settled && isFinite(audioEl.duration) && audioEl.duration > 0) {
                settled = true;
                cleanup();
                resolve(audioEl.duration);
              }
            }
            function onTimeUpdate() {
              if (!settled && isFinite(audioEl.duration) && audioEl.duration > 0) {
                settled = true;
                cleanup();
                resolve(audioEl.duration);
              }
            }
            const timeoutId = setTimeout(() => {
              if (!settled) {
                settled = true;
                cleanup();
                resolve(null);
              }
            }, timeoutMs);

            function cleanup() {
              audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
              audioEl.removeEventListener('timeupdate', onTimeUpdate);
              clearTimeout(timeoutId);
            }

            audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
            audioEl.addEventListener('timeupdate', onTimeUpdate);
            audioEl.currentTime = 1e101;
          });
        }

        const duration = await getAudioDurationWithTimeout(audio, 2500);
        saveNote(duration);

        async function saveNote(duration) {
          const { data: userData } = await supabase.auth.getUser();
          const { data: insertData, error: insertError } = await supabase.from('voice_notes').insert([
            {
              user_id: userData?.user?.id,
              audio_url: publicUrl,
              transcript: transcriptText,
              duration: duration,
              archived: false,
            },
          ]).select();
          if (insertError) {
            setStatus('error');
          } else {
            if (onNoteSaved && insertData && insertData.length > 0) {
              onNoteSaved(insertData[0]);
            }
          }
          setStatus('done');
          setTimeout(() => {
            setStatus('idle');
            setAudioUrl(null);
            setRecordingTime(0);
          }, 2000);
        }
      };

      mediaRecorder.start();
      setStatus('recording');
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 1000);
    } catch (err) {
      setStatus('error');
    }
  };

  // --- Auth check for mic press ---
  const handleMicPress = async (e) => {
    e.preventDefault && e.preventDefault();
    // Only allow if idle
    if (status !== 'idle') return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      // Not logged in, trigger Google OAuth
      await supabase.auth.signInWithOAuth({ provider: 'google' });
      return;
    }
    // User is logged in, proceed to record
    startRecording();
  };

  const stopRecording = () => {
    clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.stop();
    setStatus('saving');
  };

  // --- UI ---
  return (
    <div className="flex flex-col items-center w-full gap-y-4 font-sans relative">
      {/* Tooltip for first-time users */}
      {showTooltip && status === 'idle' && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 bg-white border border-brand-link rounded-lg shadow-lg px-4 py-2 text-sm text-brand-link font-semibold flex items-center gap-2 animate-fade-in">
          <span role="img" aria-label="info">💡</span>
          Press and hold the mic to start recording your idea!
          <button
            className="ml-2 px-2 py-0.5 rounded bg-brand-link text-white text-xs font-bold"
            onClick={handleTooltipClose}
            aria-label="Close tooltip"
          >
            Got it
          </button>
        </div>
      )}

      {/* Mic Button */}
      <button
        onMouseDown={handleMicPress}
        onMouseUp={status === 'recording' ? stopRecording : undefined}
        onTouchStart={handleMicPress}
        onTouchEnd={status === 'recording' ? stopRecording : undefined}
        disabled={status === 'saving'}
        aria-busy={status === 'saving'}
        aria-disabled={status === 'saving'}
        aria-label={
          status === 'idle' ? 'Start recording' :
          status === 'recording' ? 'Stop recording' :
          status === 'saving' ? 'Saving recording' :
          status === 'done' ? 'Recording saved' :
          status === 'error' ? 'Error' : 'Voice recorder'
        }
        className={`
          flex items-center justify-center rounded-full transition-all duration-300 ease-in-out
          w-32 h-32 text-brand-primary-text text-4xl shadow-lg
          ${status === 'idle' ? 'bg-brand-gradient-start hover:bg-brand-gradient-end animate-mic-glow' : ''}
          ${status === 'recording' ? 'bg-brand-link hover:bg-brand-gradient-end animate-mic-glow ring-4 ring-sky-300' : ''}
          ${status === 'saving' ? 'bg-brand-accent-yellow hover:bg-yellow-400' : ''}
          ${status === 'done' ? 'bg-green-600 hover:bg-green-700' : ''}
          ${status === 'error' ? 'bg-red-700 hover:bg-red-800' : ''}
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
        style={{
          boxShadow:
            status === 'idle'
              ? '0 8px 30px 0 rgba(129, 212, 250, 0.5)'
            : status === 'recording'
              ? '0 0 50px 10px rgba(129, 212, 250, 0.8)'
            : status === 'saving'
              ? '0 0 20px 5px rgba(234, 179, 8, 0.5)'
            : status === 'done'
              ? '0 0 20px 5px rgba(34,197,94,0.5)'
            : status === 'error'
              ? '0 0 20px 5px rgba(239,68,68,0.7)'
            : '0 8px 20px rgba(0,0,0,0.2)',
        }}
      >
        <MicrophoneIcon className="h-16 w-16 text-brand-primary-text" />
      </button>

      {/* Prompt / State */}
      {status === 'saving' ? (
        <span aria-live="polite" aria-busy="true">
          <LoadingSpinner />
        </span>
      ) : (
        <>
          <h3 className={`
            ${status === 'idle' ? 'text-2xl sm:text-3xl font-extrabold text-brand-link drop-shadow text-center font-sans' : ''}
            ${status === 'recording' ? 'text-lg font-bold text-brand-link text-center font-sans flex items-center justify-center gap-2' : ''}
            ${status === 'done' ? 'text-lg font-bold text-green-600 text-center font-sans' : ''}
            ${status === 'error' ? 'text-lg font-bold text-brand-accent-yellow text-center font-sans' : ''}
          `}>
            {status === 'idle' && (
              <span>
                <span className="font-bold">Hold to Record</span>
              </span>
            )}
            {status === 'recording' && (
              <span className="flex items-center gap-2">
                <span className="text-base font-medium text-brand-button-text block mb-1">
                  <span className="inline-block animate-listening-dots">Listening</span>
                  <span className="inline-block animate-listening-dots">...</span>
                </span>
                <span className="text-2xl font-extrabold text-brand-link">{`${Math.floor(recordingTime / 60)}:${('0' + (recordingTime % 60)).slice(-2)}`}</span>
              </span>
            )}
            {status === 'done' && 'Recording Saved!'}
            {status === 'error' && <span className="text-base font-light text-brand-accent-yellow">Mic access denied</span>}
          </h3>

          {/* Animated Waveform */}
          <div className="flex space-x-1 justify-center h-10 mt-2">
            {waveformHeights.map((h, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full bg-brand-link transition-all duration-200 ${status === 'recording' ? 'animate-wave-bounce' : ''}`}
                style={{
                  height: `${h}px`,
                  opacity: status === 'recording' ? 0.85 : 0.5,
                  backgroundColor: status === 'recording' ? '#81D4FA' : '#B3E5FC',
                  transition: 'height 0.2s, background 0.2s, opacity 0.2s',
                }}
              ></div>
            ))}
          </div>

          {audioUrl && (
            <div className="w-full">
              <AudioDiagnosticsPlayer src={audioUrl} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- AudioDiagnosticsPlayer: logs diagnostics for debugging mobile audio playback issues ---
function AudioDiagnosticsPlayer({ src }) {
  const audioRef = useRef(null);
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    console.log('[VoiceRecorder][AUDIO DIAG] userAgent:', navigator.userAgent);
    console.log('[VoiceRecorder][AUDIO DIAG] src:', src);
    function onError(e) {
      const err = audioEl.error;
      console.error('[VoiceRecorder][AUDIO DIAG] audio error:', err ? err.message : e, 'code:', err ? err.code : undefined);
    }
    function onLoadedMetadata() {
      console.log('[VoiceRecorder][AUDIO DIAG] loadedmetadata duration:', audioEl.duration, 'src:', audioEl.src);
    }
    function onCanPlay() {
      console.log('[VoiceRecorder][AUDIO DIAG] canplay event fired, duration:', audioEl.duration);
    }
    audioEl.addEventListener('error', onError);
    audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
    audioEl.addEventListener('canplay', onCanPlay);
    return () => {
      audioEl.removeEventListener('error', onError);
      audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioEl.removeEventListener('canplay', onCanPlay);
    };
  }, [src]);
  if (!src) return null;
  return <audio ref={audioRef} src={src} controls className="w-full rounded-xl shadow font-sans text-brand-primary-text bg-brand-gradient" />;
}