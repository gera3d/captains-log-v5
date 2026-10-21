import { workflowUrl } from '../runtimeConfig';
// TODO[progress-md][P1][VoiceRecorder] See progress.md for all open voice recording tasks
import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../supabaseClient';

console.log('[VoiceRecorder][DEBUG] VoiceRecorder component loaded');

export default function VoiceRecorder({ onNoteSaved, compact = false, onStatusChange }) {
  const [status, setStatus] = useState('idle');
  const mountedRef = useRef(true);
  const streamRef = useRef(null);
  const startingRef = useRef(false);
  const savedTimerRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const reportStatus = next => {
    if (!mountedRef.current) return;
    setStatus(next);
    onStatusChange?.(next);
  };

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
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(recordingTimerRef.current);
      clearTimeout(savedTimerRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        recorder.ondataavailable = null;
        recorder.onerror = null;
        try { if (recorder.state !== 'inactive') recorder.stop(); } catch { /* Already stopped. */ }
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
      onStatusChange?.('idle');
    };
  }, []);

  // --- Recording logic unchanged ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.onerror = () => { stream.getTracks().forEach(track => track.stop()); reportStatus('error'); };
      chunksRef.current = [];
      const startedAt = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      setProgress(0);
      setIsUploading(true);

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (!mountedRef.current) return;
        try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const fileName = `voice-note-${Date.now()}.webm`;
        const { data, error } = await supabase.storage.from('voice-notes').upload(fileName, blob, {
          contentType: 'audio/webm',
        });
        if (!mountedRef.current) return;
        if (error) {
          reportStatus('error');
          return;
        }

        const getPlayableUrl = async (baseName) => {
          const tryExts = ['mp3', 'm4a', 'webm'];
          for (const ext of tryExts) {
            if (!mountedRef.current) return '';
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
        if (!mountedRef.current) return;

        let transcriptText = '';
        try {
          const formData = new FormData();
          formData.append('file', blob, fileName);
          const response = await fetch(workflowUrl('transcribe'), {
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

        if (!mountedRef.current) return;
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
        await saveNote(duration);

        async function saveNote(duration) {
          if (!mountedRef.current) return;
          const { data: userData } = await supabase.auth.getUser();
          if (!mountedRef.current) return;
          if (!userData?.user?.id) { reportStatus('error'); return; }
          const { data: insertData, error: insertError } = await supabase.from('voice_notes').insert([
            {
              user_id: userData?.user?.id,
              audio_url: publicUrl,
              transcript: transcriptText,
              duration: duration,
              archived: false,
              is_featured: false,
            },
          ]).select();
          if (!mountedRef.current) return;
          const savedNote = Array.isArray(insertData) && insertData.length === 1 ? insertData[0] : null;
          if (insertError || !savedNote || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedNote.id) || savedNote.user_id !== userData.user.id || savedNote.is_featured !== false) {
            reportStatus('error');
            return;
          } else {
            if (onNoteSaved && insertData && insertData.length > 0) {
              onNoteSaved(insertData[0]);
            }
          }
          reportStatus('done');
          savedTimerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            reportStatus('idle');
            setAudioUrl(null);
            setRecordingTime(0);
          }, 2000);
        }
        } catch (error) {
          reportStatus('error');
        }
      };

      mediaRecorder.start();
      reportStatus('recording');
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startedAt) / 1000));
      }, 1000);
    } catch (err) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      reportStatus('error');
    }
  };

  // --- Auth check for mic press ---
  const handleMicPress = async event => {
    event.preventDefault();
    if (status !== 'idle' || startingRef.current) return;
    startingRef.current = true;
    reportStatus('preparing');
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!mountedRef.current) return;
      if (!userData?.user) { reportStatus('error'); return; }
      await startRecording();
    } catch (error) {
      reportStatus('error');
    } finally { startingRef.current = false; }
  };

  const stopRecording = () => {
    if (status !== 'recording' || !mediaRecorderRef.current) return;
    clearInterval(recordingTimerRef.current);
    reportStatus('saving');
    try { mediaRecorderRef.current.stop(); } catch (error) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      reportStatus('error');
    }
  };

  // --- UI ---
  return (
    <div className={`flex flex-col items-center w-full max-w-md mx-auto relative ${compact ? "voice-recorder-compact" : ""}`}>
      {/* Premium mic button with depth and animation */}
      <div className="relative group">
        {/* Pulsing ring animation when idle */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          status === 'idle' ? 'bg-blue-400/20 animate-ping-slow opacity-70' : 'opacity-0'
        }`}></div>
        
        {/* Inner shadow ring */}
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Mic button */}
        <button
          onClick={status === 'recording' ? stopRecording : handleMicPress}
          disabled={status === 'saving' || status === 'preparing'}
          aria-busy={status === 'saving' || status === 'preparing'}
          aria-disabled={status === 'saving' || status === 'preparing'}
          aria-label={
            status === 'idle' ? 'Start recording' :
            status === 'preparing' ? 'Preparing microphone' :
            status === 'recording' ? 'Stop recording' :
            status === 'saving' ? 'Saving recording' :
            status === 'done' ? 'Recording saved' :
            status === 'error' ? 'Recording unavailable' : 'Voice recorder'
          }
          className={`
            relative rounded-full flex items-center justify-center transition-all duration-300
            w-32 h-32 z-10 transform
            ${status === 'idle' || status === 'preparing' ? 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 hover:scale-105' : ''}
            ${status === 'recording' ? 'bg-gradient-to-br from-red-400 to-red-600 scale-110 animate-pulse-subtle' : ''}
            ${status === 'saving' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : ''}
            ${status === 'done' ? 'bg-gradient-to-br from-green-400 to-green-600 scale-105' : ''}
            ${status === 'error' ? 'bg-gradient-to-br from-red-600 to-red-800' : ''}
            disabled:opacity-70 disabled:cursor-not-allowed
            shadow-[0_10px_25px_-12px_rgba(0,0,0,0.6)]
            border border-white/20
            focus:outline-none focus:ring-4 focus:ring-blue-300/50
          `}
        >
          {/* Subtle inner lighting effect */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
          
          {/* Mic icon with enhanced styling */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" 
               className={`w-16 h-16 drop-shadow-lg transition-transform duration-300 ${status === 'recording' ? 'scale-110' : ''}`} 
               aria-hidden="true">
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
          </svg>
        </button>
      </div>

      {/* Status/prompt with enhanced styling */}
      {status === 'saving' ? (
        <div className="mt-8 flex flex-col items-center" aria-live="polite" aria-busy="true">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping-slow"></div>
            <LoadingSpinner />
          </div>
          <p className="text-white mt-4 font-medium">Processing your recording...</p>
        </div>
      ) : (
        <>
          <div className="mt-8 text-center">
            <span className={`text-2xl font-medium tracking-wide ${
              status === 'recording' ? 'text-red-400 animate-pulse-subtle' : 'text-white'
            } drop-shadow-md transition-all`}>
              {status === 'preparing' && 'Preparing microphone…'}
              {status === 'idle' && (
                <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
                  Press to Record
                </span>
              )}
              {status === 'recording' && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-red-100 font-bold">Recording</span>
                  <span className="text-red-100 font-mono">{`${Math.floor(recordingTime / 60)}:${('0' + (recordingTime % 60)).slice(-2)}`}</span>
                </div>
              )}
              {status === 'done' && (
                <span className="text-green-300 flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Recording Saved!
                </span>
              )}
              {status === 'error' && "Recording unavailable"}
            </span>
          </div>

          {/* Enhanced visualizer during recording */}
          {status === 'recording' && (
            <div className="flex space-x-1 justify-center h-10 mt-6">
              <div className="flex items-end gap-x-1">
                {waveformHeights.map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 rounded-full bg-gradient-to-t from-red-400 to-red-300"
                    style={{
                      height: `${h/1.5}px`,
                      opacity: 0.8,
                      transition: 'height 0.15s',
                      animationDelay: `${idx * 0.05}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </>
      )}



      {status === 'error' && <button type="button" onClick={() => reportStatus('idle')} className="mt-3 text-sm font-semibold text-indigo-700 underline">Try again</button>}
      {/* Add animation styles */}
      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}