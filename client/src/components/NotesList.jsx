import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

export default function NotesList({ notes, setNotes }) {
  const [durations, setDurations] = useState({});
  const [loadingIdea, setLoadingIdea] = useState({});
  const [showFull, setShowFull] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Persist showArchived state
  useEffect(() => {
    const saved = localStorage.getItem('showArchived');
    setShowArchived(saved === 'true');
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoadingNotes(true);
      let query = supabase.from('voice_notes').select('*');
      if (showArchived) {
        query = query.eq('archived', true);
      } else {
        query = query.or('archived.is.false,archived.is.null');
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('NotesList fetchNotes error:', error);
        setNotes([]);
      } else {
        setNotes(data);
      }
      setLoadingNotes(false);
    };
    fetchNotes();

    const channel = supabase
      .channel('public:voice_notes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'voice_notes' }, (payload) => {
        if (!!payload.new.archived === showArchived) {
          setNotes((prev) => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showArchived]);

  useEffect(() => {
    localStorage.setItem('showArchived', showArchived.toString());
  }, [showArchived]);

  // Preload durations for audio
  useEffect(() => {
    notes.forEach(note => {
      if (note.duration && Number.isFinite(note.duration) && note.duration > 0) {
        setDurations(prev => ({ ...prev, [note.id]: note.duration }));
        return;
      }
      if (!note.audio_url || durations[note.id]) return;
      const audio = new Audio(note.audio_url);
      audio.addEventListener('loadedmetadata', () => {
        setDurations(prev => ({ ...prev, [note.id]: audio.duration }));
      });
    });
  }, [notes]);

  return (
    <div className="w-full">
      {/* Tab Buttons - Enhanced Styling */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`
            rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 
            ${!showArchived ? 'bg-[#4285F4] text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}
          `}
          onClick={() => setShowArchived(false)}
          aria-pressed={!showArchived}
          aria-label="Show active notes"
        >
          Active Notes
        </button>
        <button
          className={`
            rounded-full px-5 py-2 text-sm font-medium transition-all duration-200
            ${showArchived ? 'bg-[#4285F4] text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}
          `}
          onClick={() => setShowArchived(true)}
          aria-pressed={showArchived}
          aria-label="Show archived notes"
        >
          Archived Notes
        </button>
      </div>

      {/* List Title - Refined Styling */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {showArchived ? 'Archived Voice Notes' : 'Your Voice Notes'}
      </h2>

      {/* Loading and Empty States */}
      {loadingNotes ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-500 py-16 text-lg font-medium">
          {showArchived ? 'No archived notes found.' : 'No active notes yet. Record your first idea!'}
        </div>
      ) : (
        <div className="flex flex-col gap-y-6 sm:gap-y-8">
          {notes.map((note) => {
            let ideaText = '';
            try {
              const trimmed = note.business_idea?.trim() || '';
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === 'object') {
                  if (parsed.idea) ideaText = parsed.idea;
                  else if (parsed.text) ideaText = parsed.text;
                  else ideaText = JSON.stringify(parsed);
                } else {
                  ideaText = String(parsed);
                }
              } else {
                ideaText = trimmed;
              }
              ideaText = ideaText.replace(/^"?text":"?/, '').replace(/"$/, '').replace(/\\n/g, '\n').trim();
            } catch {
              ideaText = note.business_idea || '';
            }

            return (
              <div
                key={note.id}
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 flex flex-col gap-y-4 border border-gray-100/80 transition-all duration-200 hover:shadow-2xl w-full max-w-full"
              >
                {/* Top Row: Actions & Info */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center justify-between min-w-0 w-full">
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={async () => {
                        setLoadingIdea(prev => ({ ...prev, [note.id]: true }));
                        const transcriptText = (() => {
                          if (!note.transcript) return '';
                          try {
                            const parsed = JSON.parse(note.transcript);
                            if (typeof parsed === 'object' && parsed !== null) {
                              if (parsed.data) return parsed.data;
                              if (parsed.text) return parsed.text;
                              return JSON.stringify(parsed);
                            }
                            return String(parsed);
                          } catch {
                            return note.transcript;
                          }
                        })();
                        try {
                          const response = await fetch('https://n8n.why57.com/webhook/transcript-summarize', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: transcriptText }),
                          });
                          if (!response.ok) throw new Error('Network response was not ok');
                          const data = await response.json();
                          let idea = data.idea || JSON.stringify(data);
                          idea = idea.replace(/^[^\w#*]+/, '').trim();
                          const { data: updateData, error } = await supabase
                            .from('voice_notes')
                            .update({ business_idea: idea })
                            .eq('id', note.id)
                            .select()
                            .single();
                          if (error || !updateData) {
                            alert('Failed to save business idea.');
                          } else {
                            setNotes(prev =>
                              prev.map(n =>
                                n.id === note.id ? { ...n, business_idea: idea } : n
                              )
                            );
                          }
                        } catch {
                          alert('Failed to generate business idea.');
                        } finally {
                          setLoadingIdea(prev => ({ ...prev, [note.id]: false }));
                        }
                      }}
                      className={`
                        inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500
                        ${loadingIdea[note.id]
                          ? 'bg-gray-400 cursor-wait text-white animate-pulse'
                          : note.business_idea
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'}
                        shadow-sm
                      `}
                      aria-busy={loadingIdea[note.id]}
                      aria-label={note.business_idea ? 'Regenerate business idea' : 'Generate business idea'}
                      disabled={loadingIdea[note.id]}
                    >
                      {loadingIdea[note.id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (note.business_idea ? 'Regenerate Idea' : 'Generate Business Idea')}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('voice_notes')
                            .update({ archived: !showArchived })
                            .eq('id', note.id);
                          if (error) {
                            alert('Failed to update note.');
                            return;
                          }
                          setNotes(prev => prev.filter(n => n.id !== note.id));
                        } catch {
                          alert('Failed to update note.');
                        }
                      }}
                      className={`
                        inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-medium transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500
                        ${showArchived
                          ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                        shadow-sm
                      `}
                      aria-label={showArchived ? 'Restore note' : 'Archive note'}
                    >
                      {showArchived ? 'Restore' : 'Archive'}
                    </button>
                  </div>

                  {/* Right side action buttons with improved visibility */}
                  <div className="flex flex-wrap gap-2 items-center mt-2 sm:mt-0">
                    {ideaText && (
                      <button
                        onClick={() => setShowFull(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 hover:bg-sky-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 shadow-sm"
                        aria-label={showFull[note.id] ? 'Collapse idea' : 'Expand idea'}
                      >
                        {showFull[note.id] ? 'Collapse Idea' : 'Expand Idea'}
                      </button>
                    )}
                    <Link
                      to={`/idea/${note.id}`}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border border-indigo-500 bg-indigo-100 text-xs font-bold text-indigo-700 hover:bg-indigo-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 shadow-md"
                      aria-label="Go to full note view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Full Note
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/idea/' + note.id);
                        setCopiedLink(note.id);
                        setTimeout(() => setCopiedLink(null), 1500);
                      }}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border border-green-500 bg-green-100 text-xs font-bold text-green-700 hover:bg-green-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 shadow-md"
                      aria-label="Copy public link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {copiedLink === note.id ? 'Link Copied!' : 'Share'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-xs text-gray-500 border-t border-gray-100 pt-3 mt-3">
                  <span>{new Date(note.created_at).toLocaleString()}</span>
                  {Number.isFinite(durations[note.id]) && durations[note.id] > 0 ? (
                    <span>
                      • Length: {(() => {
                        const totalSeconds = Math.round(durations[note.id]);
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = totalSeconds % 60;
                        if (minutes > 0) {
                          return `${minutes}m ${seconds}s`;
                        } else {
                          return `${seconds}s`;
                        }
                      })()}
                    </span>
                  ) : (
                    <span className="text-gray-400">• Duration unavailable</span>
                  )}
                </div>

                {!showFull[note.id] && ideaText && (
                  <div className="mt-2 prose prose-sm prose-slate max-w-none leading-relaxed cursor-pointer" onClick={() => setShowFull(prev => ({ ...prev, [note.id]: true }))}>
                    <ReactMarkdown>
                      {(() => {
                        let preview = ideaText.trim();
                        if (preview.length > 250) {
                          preview = preview.slice(0, 250) + '...';
                        }
                        return preview;
                      })()}
                    </ReactMarkdown>
                  </div>
                )}
                {showFull[note.id] && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 shadow-inner overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-base text-gray-700">Business Idea</h3>
                      <button
                        onClick={() => setShowFull(prev => ({ ...prev, [note.id]: false }))}
                        className="text-xs font-semibold text-sky-700 hover:text-sky-900"
                      >
                        Collapse
                      </button>
                    </div>
                    <div className="px-5 py-4">
                      <div className="prose prose-sm prose-slate max-w-none leading-relaxed">
                        <ReactMarkdown>{ideaText}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {note.audio_url && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <AudioPlayer
                      src={note.audio_url}
                      onPlay={e => console.log("onPlay")}
                      showJumpControls={false}
                      customAdditionalControls={[]}
                      layout="horizontal-reverse"
                      className="w-full rounded-lg shadow-sm border border-gray-200 bg-white"
                      style={{ padding: '0.5rem 0.75rem' }}
                      onLoadedData={(e) => {
                        const audio = e.target;
                        if (audio && !durations[note.id] && isFinite(audio.duration) && audio.duration > 0) {
                          setDurations(prev => ({ ...prev, [note.id]: audio.duration }));
                        }
                      }}
                    />
                  </div>
                )}

                {/* Transcript */}
                <p className="text-gray-700 whitespace-pre-wrap mt-4 text-sm">
                  {note.transcript
                    ? (() => {
                        try {
                          const p = JSON.parse(note.transcript);
                          return p && typeof p === 'object' ? p.data || p.text || JSON.stringify(p) : String(p);
                        } catch {
                          return note.transcript;
                        }
                      })()
                    : 'Transcription pending...'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}