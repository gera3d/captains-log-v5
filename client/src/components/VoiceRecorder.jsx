import { supabase } from '../supabaseClient';
import React, { useState, useRef, useEffect } from 'react';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [freqData, setFreqData] = useState(new Uint8Array(32));

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const animateFrequency = () => {
    if (!analyserRef.current || !isRecording) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    setFreqData(new Uint8Array(dataArrayRef.current));
    animationFrameRef.current = requestAnimationFrame(animateFrequency);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      animateFrequency();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsLoading(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        try {
          const formData = new FormData();
          formData.append('file', blob, 'recording.webm');

          const response = await fetch('http://localhost:5678/webhook/a37165d8-dcbd-4c54-8712-4400bec5f17b', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          console.log('Webhook response:', data);

          if (Array.isArray(data) && data.length > 0) {
            const item = data[0];
            console.dir(item, { depth: null });

            let transcript = item.data || item.text || '';
            let audio_url = item.file_url || item.url || '';

            // Fix double slash in URL
            audio_url = audio_url.replace('voice-notes//', 'voice-notes/');

            console.log('Saving to Supabase:', { audio_url, transcript });

            if (audio_url && audio_url.trim() !== '') {
              const { error } = await supabase
                .from('voice_notes')
                .insert([{ audio_url, transcript }]);
              if (error) {
                console.error('Supabase insert error:', error);
              } else {
                console.log('Saved voice note to Supabase');
              }
            } else {
              console.warn('Webhook did not return a valid audio URL, skipping save');
            }
          } else {
            console.warn('Webhook did not return expected array data');
          }
        } catch (err) {
          console.error('Error sending audio to webhook or saving transcript:', err);
        }

        setIsLoading(false);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setFreqData(new Uint8Array(32));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 transition-all duration-500 bg-gradient-to-br from-blue-50 to-white border border-blue-100">
      <h2 className={`text-2xl font-bold transition-all duration-300 ${isRecording ? 'text-blue-600' : 'text-gray-800'}`}>
        {isRecording ? 'Recording...' : 'Tap to Record'}
      </h2>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300
        ${isRecording ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-300' : 'bg-gradient-to-br from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 ring-4 ring-blue-300 pulse-twice'}`}
        style={{ width: '100px', height: '100px' }}
      >
        <span className="relative z-10 flex items-center justify-center">
          {isRecording ? (
            <span className="text-3xl">■</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v4m0 0H8m4 0h4m-4-4a4 4 0 004-4V8a4 4 0 10-8 0v6a4 4 0 004 4z" />
            </svg>
          )}
        </span>
      </button>

      {isLoading && (
        <div className="text-blue-500 font-semibold animate-pulse">Saving your note...</div>
      )}

      <div className="flex items-end gap-1 h-16 mt-2">
        {Array.from(freqData).map((val, i) => (
          <div
            key={i}
            className="w-1 rounded bg-blue-400 transition-all duration-100"
            style={{
              height: `${Math.max(10, val * 2)}px`,
              opacity: isRecording ? 1 : 0.4,
            }}
          ></div>
        ))}
      </div>

      {audioURL && audioURL !== '' && (
        <audio controls src={audioURL} className="mt-4 rounded-lg shadow w-full outline-none border-0 shadow-none" />
      )}
    </div>
  );
}

export default VoiceRecorder;
