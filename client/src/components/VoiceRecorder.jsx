// TODO[progress-md][P1][VoiceRecorder] See progress.md for all open voice recording tasks
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MicrophoneIcon } from '@heroicons/react/24/outline';

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
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const fileName = `voice-note-${Date.now()}.webm`;
        const { data, error } = await supabase.storage.from('voice-notes').upload(fileName, blob, {
          contentType: 'audio/webm',
        });
        if (error) {
          console.error('Upload error:', error);
          setStatus('error');
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('voice-notes').getPublicUrl(fileName);
        const publicUrl = publicUrlData.publicUrl;

        let transcriptText = '';
        try {
          const formData = new FormData();
          formData.append('file', blob, fileName);
          const response = await fetch('http://localhost:5678/webhook/a37165d8-dcbd-4c54-8712-4400bec5f17b', {
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
        } catch (err) {
          console.error('Transcription webhook error:', err);
        }

        const audio = new Audio(publicUrl);
        audio.addEventListener('loadedmetadata', async () => {
          if (isFinite(audio.duration) && audio.duration > 0) {
            saveNote(audio.duration);
          } else {
            audio.currentTime = 1e101;
            audio.addEventListener('timeupdate', function onTimeUpdate() {
              if (isFinite(audio.duration) && audio.duration > 0) {
                audio.removeEventListener('timeupdate', onTimeUpdate);
                saveNote(audio.duration);
              }
            });
          }
        });

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
            console.error('Insert note error:', insertError);
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

      <h3 className="text-lg font-semibold text-gray-800 text-center mt-4">
        {status === 'idle' && 'Tap to Record'}
        {status === 'recording' && `Recording... ${Math.floor(recordingTime / 60)}:${('0' + (recordingTime % 60)).slice(-2)}`}
        {status === 'saving' && 'Saving...'}
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
          <audio src={audioUrl} controls className="w-full rounded-xl shadow" />
        </div>
      )}
    </>
  );
}