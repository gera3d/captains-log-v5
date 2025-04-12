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

  useEffect(() => {
    return () => clearInterval(recordingTimerRef.current);
  }, []);

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
        console.log('[VoiceRecorder] onstop fired');
        // --- IMPORTANT: iOS Safari and many mobile browsers do NOT support webm audio playback. ---
        // To ensure cross-platform playback, a server-side conversion step is required after upload.
        // The backend (cloud function, n8n, etc.) should:
        //   1. Listen for new .webm uploads in the 'voice-notes' bucket,
        //   2. Convert them to .mp3 or .m4a using ffmpeg or similar,
        //   3. Save the converted file back to storage (same name, new extension),
        //   4. Optionally update the DB or provide a way for the client to find the mp3/m4a version.
        // See README and progress.md for more info.

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('[VoiceRecorder][AUDIO DIAG] Blob type:', blob.type, 'size:', blob.size);
        console.log('[VoiceRecorder] Blob created:', blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const fileName = `voice-note-${Date.now()}.webm`;
        console.log('[VoiceRecorder] Uploading to Supabase:', fileName);
        const { data, error } = await supabase.storage.from('voice-notes').upload(fileName, blob, {
          contentType: 'audio/webm',
        });
        if (error) {
          console.error('[VoiceRecorder] Upload error:', error);
          setStatus('error');
          return;
        }
        console.log('[VoiceRecorder] Upload successful:', data);

        // Try to use the mp3/m4a version if it exists (after server-side conversion)
        const getPlayableUrl = async (baseName) => {
          // Try .mp3, then .m4a, then fallback to .webm
          const tryExts = ['mp3', 'm4a', 'webm'];
          for (const ext of tryExts) {
            const candidate = baseName.replace(/\.webm$/, `.${ext}`);
            const { data: urlData } = supabase.storage.from('voice-notes').getPublicUrl(candidate);
            // Try to HEAD request the file to see if it exists (Supabase publicUrl always returns a URL, even if file is missing)
            try {
              const resp = await fetch(urlData.publicUrl, { method: 'HEAD' });
              if (resp.ok) {
                console.log(`[VoiceRecorder] Found playable audio: ${candidate}`);
                return urlData.publicUrl;
              }
            } catch (e) {
              // Ignore and try next
            }
          }
          // Fallback: return original webm public URL
          const { data: fallbackUrlData } = supabase.storage.from('voice-notes').getPublicUrl(baseName);
          return fallbackUrlData.publicUrl;
        };

        const publicUrl = await getPlayableUrl(fileName);
        console.log('[VoiceRecorder] Playable Public URL:', publicUrl);

        let transcriptText = '';
        try {
          const formData = new FormData();
          formData.append('file', blob, fileName);
          console.log('[VoiceRecorder] Sending to transcription webhook');
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
          console.log('[VoiceRecorder] Transcription result:', transcriptText);
        } catch (err) {
          console.error('[VoiceRecorder] Transcription webhook error:', err);
        }

        // --- Robust duration detection with fallback for mobile devices ---
        // On some mobile browsers, the Audio element never resolves duration for remote files.
        // We use a Promise with a timeout: if duration can't be determined in 2.5s, we proceed with null.
        // This prevents the UI from hanging on "saving" forever.
        const audio = new Audio(publicUrl);
        console.log('[VoiceRecorder] Created Audio element for duration');

        function getAudioDurationWithTimeout(audioEl, timeoutMs = 2500) {
          return new Promise((resolve) => {
            let settled = false;
            // Handler for when metadata is loaded
            function onLoadedMetadata() {
              if (!settled && isFinite(audioEl.duration) && audioEl.duration > 0) {
                settled = true;
                cleanup();
                resolve(audioEl.duration);
              }
            }
            // Handler for timeupdate fallback
            function onTimeUpdate() {
              if (!settled && isFinite(audioEl.duration) && audioEl.duration > 0) {
                settled = true;
                cleanup();
                resolve(audioEl.duration);
              }
            }
            // Timeout fallback
            const timeoutId = setTimeout(() => {
              if (!settled) {
                settled = true;
                cleanup();
                resolve(null); // fallback: duration unknown
              }
            }, timeoutMs);

            function cleanup() {
              audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
              audioEl.removeEventListener('timeupdate', onTimeUpdate);
              clearTimeout(timeoutId);
            }

            audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
            audioEl.addEventListener('timeupdate', onTimeUpdate);

            // Try to force duration calculation (for some browsers)
            audioEl.currentTime = 1e101;
          });
        }

        // Use the robust duration detection
        const duration = await getAudioDurationWithTimeout(audio, 2500);
        console.log('[VoiceRecorder] Final duration (may be null):', duration);
        saveNote(duration);

        async function saveNote(duration) {
          console.log('[VoiceRecorder] Saving note with duration:', duration);
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
            console.error('[VoiceRecorder] Insert note error:', insertError);
            setStatus('error');
          } else {
            if (onNoteSaved && insertData && insertData.length > 0) {
              onNoteSaved(insertData[0]);
            }
            console.log('[VoiceRecorder] Note saved successfully');
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
      console.error('Mic access denied or error:', err);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.stop();
    setStatus('saving');
  };

  return (
    <>
      <button
        onClick={(status === 'recording' || status === 'saving') ? stopRecording : startRecording}
        className={`
          flex items-center justify-center rounded-full transition-all duration-300 ease-in-out
          w-28 h-28 text-white text-3xl mx-auto
          ${status === 'idle' ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}
          ${status === 'recording' ? 'bg-blue-500 hover:bg-blue-600 animate-ping-fast' : ''}
          ${status === 'saving' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          ${status === 'done' ? 'bg-green-500 hover:bg-green-600' : ''}
          ${status === 'error' ? 'bg-red-700 hover:bg-red-800' : ''}
        `}
        style={{
          boxShadow:
            status === 'idle'
              ? '0 8px 20px rgba(239, 68, 68, 0.4)'
            : status === 'recording'
              ? '0 0 30px 10px rgba(59, 130, 246, 0.6)'
            : status === 'saving'
              ? '0 0 20px 5px rgba(234, 179, 8, 0.5)'
            : status === 'done'
              ? '0 0 20px 5px rgba(34,197,94,0.5)'
            : status === 'error'
              ? '0 0 20px 5px rgba(239,68,68,0.7)'
            : '0 8px 20px rgba(0,0,0,0.2)',
        }}
      >
        <MicrophoneIcon className="h-12 w-12 text-white" />
      </button>

      {status === 'saving' ? (
        <LoadingSpinner className="mt-6" />
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-800 text-center mt-4">
            {status === 'idle' && 'Tap to Record'}
            {status === 'recording' && `Recording... ${Math.floor(recordingTime / 60)}:${('0' + (recordingTime % 60)).slice(-2)}`}
            {status === 'done' && 'Recording Saved!'}
            {status === 'error' && 'Mic access denied'}
          </h3>

          <div className="flex space-x-1 mt-4 justify-center">
            {Array.from({ length: 40 }).map((_, idx) => (
              <div
                key={idx}
                className="w-1 h-4 rounded-full"
                style={{
                  backgroundColor: '#60a5fa',
                }}
              ></div>
            ))}
          </div>

          {audioUrl && (
            <div className="w-full mt-6">
              <AudioDiagnosticsPlayer src={audioUrl} />
            </div>
          )}
        </>
      )}
    </>
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
  return <audio ref={audioRef} src={src} controls className="w-full rounded-xl shadow" />;
}