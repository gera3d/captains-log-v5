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
      console.warn('No notes loaded.');
      console.warn('No notes loaded.');
      console.warn('No notes loaded.');
      console.warn('No notes loaded.');
      console.warn('No notes loaded.');
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
    <div className="flex flex-col gap-y-6 w-full max-w-full px-1 sm:max-w-3xl sm:px-0 overflow-x-hidden">
      {/* Toggle Active/Archived */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => setShowArchived(false)}
          className={`rounded-full px-5 py-2 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500
            ${!showArchived
              ? 'bg-sky-600 text-white border-sky-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
          `}
          aria-pressed={!showArchived}
          aria-label="Show active notes"
        >
          Active Notes
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`rounded-full px-5 py-2 text-sm font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500
            ${showArchived
              ? 'bg-sky-600 text-white border-sky-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
          `}
          aria-pressed={showArchived}
          aria-label="Show archived notes"
        >
          Archived Notes
        </button>
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-700 drop-shadow mb-2">Your Voice Notes</h2>
      {loadingNotes ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-lg">No notes found.</div>
      ) : (
        <div className="flex flex-col gap-y-8">
          {notes.map((note) => {
            // Parse and extract idea/root causes
            let rootCauses = '';
            let ideaText = '';
            try {
              const trimmed = note.business_idea?.trim() || '';
              let markdownText = trimmed;
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === 'object' && parsed.text) {
                  markdownText = parsed.text;
                }
              }
              markdownText = markdownText.replace(/\\n/g, '\n').trim();
              // Extract root causes
              const rootCausesMatch = markdownText.match(/(🚨 Possible Root Causes[\s\S]*?)(?=\n\s*\n|$)/);
              if (rootCausesMatch) {
                rootCauses = rootCausesMatch[1].trim();
                markdownText = markdownText.replace(rootCausesMatch[1], '').trim();
              }
              // Extract only the Core Idea section
              const coreIdeaMatch = markdownText.match(/(\*\*Core Idea\*\*[\s\S]*?)(?=\n\s*\n|$)/i);
              if (coreIdeaMatch) {
                ideaText = coreIdeaMatch[1].trim();
              } else {
                ideaText = markdownText;
              }
              // Clean up spacing
              ideaText = ideaText.replace(/\n{2,}/g, '\n\n').trim();
              // Remove leading 'text":"'
              ideaText = ideaText.replace(/^"?text":"?/, '').trim();
              // Remove trailing quote if present
              ideaText = ideaText.replace(/"$/, '').trim();
            } catch {
              ideaText = note.business_idea || '';
            }

            return (
              <div
                key={note.id}
                className="relative bg-white rounded-xl sm:rounded-3xl shadow-md sm:shadow-xl p-3 sm:p-6 flex flex-col gap-y-4 border border-gray-100 transition-all duration-200 hover:shadow-2xl w-full max-w-full"
              >
                {/* Top Row: Actions & Info */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center justify-between min-w-0 w-full">
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
                        focus:outline-none focus:ring-2 focus:ring-sky-500
                        ${loadingIdea[note.id]
                          ? 'bg-gray-400 cursor-wait text-white animate-pulse'
                          : note.business_idea
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'}
                        shadow
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
                        focus:outline-none focus:ring-2 focus:ring-sky-500
                        ${showArchived
                          ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                        shadow
                      `}
                      aria-label={showArchived ? 'Restore note' : 'Archive note'}
                    >
                      {showArchived ? 'Restore' : 'Archive'}
                    </button>
                    <button
                      onClick={() => setShowFull(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 hover:bg-sky-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow"
                      aria-label={showFull[note.id] ? 'Collapse idea' : 'Expand idea'}
                    >
                      {showFull[note.id] ? 'Collapse Idea' : 'Expand Idea'}
                    </button>
                    <Link
                      to={`/idea/${note.id}`}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-300 bg-white text-xs font-medium hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow"
                      aria-label="Share note"
                    >
                      Share
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/idea/' + note.id);
                        setCopiedLink(note.id);
                        setTimeout(() => setCopiedLink(null), 1500);
                      }}
                      className="inline-flex items-center px-4 py-1.5 rounded-full border border-green-300 bg-green-50 text-xs font-medium text-green-700 hover:bg-green-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow"
                      aria-label="Copy public link"
                    >
                      Copy Link
                    </button>
                    {copiedLink === note.id && (
                      <span className="ml-2 text-green-600 font-semibold">Link copied!</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
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
                      <span className="text-gray-300">• Duration unavailable</span>
                    )}
                  </div>
                </div>
                {/* Idea Preview/Full */}
                {!showFull[note.id] && ideaText && (
                  <div className="mt-2 prose prose-sm prose-sky max-w-none leading-tight">
                    <ReactMarkdown>
                      {(() => {
                        let preview = ideaText.trim();
                        if (preview.length > 300) {
                          preview = preview.slice(0, 300) + '...';
                        }
                        return preview;
                      })()}
                    </ReactMarkdown>
                  </div>
                )}
                {showFull[note.id] && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-gray-800">Business Idea</h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="prose max-w-none">
                        <ReactMarkdown>{ideaText}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                {/* Root Causes */}
                {rootCauses && (
                  <div className="prose max-w-none mb-4">
                    <ReactMarkdown>{rootCauses}</ReactMarkdown>
                  </div>
                )}
                {/* Audio Player */}
                <AudioPlayer src={note.audio_url} className="rounded-lg mb-4" />
                {/* Transcript */}
                <p className="text-gray-700 whitespace-pre-wrap mb-2 text-sm">
                  {(() => {
                    if (!note.transcript) return 'Transcription pending...';
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
                  })()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}