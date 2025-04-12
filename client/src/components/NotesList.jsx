// TODO[progress-md][P1][NotesList] See progress.md for all open notes display, fetch, and sharing tasks
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
  const [loadingNotes, setLoadingNotes] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem('showArchived');
    if (saved === 'true') {
      setShowArchived(true);
    } else {
      setShowArchived(false);
    }
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
        console.error('Fetch notes error:', error);
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
    <div className="space-y-6">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
            !showArchived ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Active Notes
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
            showArchived ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Archived Notes
        </button>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Voice Notes</h2>
      {loadingNotes ? (
        <LoadingSpinner />
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No notes found.</div>
      ) : (
        notes.map((note) => {
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
            <div key={note.id} className="relative bg-white rounded-3xl shadow-xl p-6 flex flex-col space-y-4">

              <div className="text-sm text-gray-500 mt-2 flex flex-wrap items-center gap-4">
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

                      if (error) {
                        console.error('Error saving idea to Supabase:', error);
                        alert('Failed to save business idea.');
                      } else if (!updateData) {
                        console.warn('No note updated, check note id:', note.id);
                        alert('Failed to save business idea.');
                      } else {
                        setNotes(prev =>
                          prev.map(n =>
                            n.id === note.id ? { ...n, business_idea: idea } : n
                          )
                        );
                      }
                    } catch (error) {
                      console.error('Error generating idea:', error);
                      alert('Failed to generate business idea.');
                    } finally {
                      setLoadingIdea(prev => ({ ...prev, [note.id]: false }));
                    }
                  }}
                  className={
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
                    (loadingIdea[note.id]
                      ? "bg-gray-400 cursor-wait text-white animate-pulse"
                      : note.business_idea
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white")
                  }
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
                      const { data, error } = await supabase
                        .from('voice_notes')
                        .update({ archived: !showArchived })
                        .eq('id', note.id);
                      if (error) {
                        console.error('Error updating archive status:', error);
                        alert('Failed to update note.');
                        return;
                      }
                      setNotes(prev => prev.filter(n => n.id !== note.id));
                    } catch (error) {
                      console.error('Unexpected error updating archive status:', error);
                      alert('Failed to update note.');
                    }
                  }}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium transition ${
                    showArchived
                      ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  {showArchived ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={() => setShowFull(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {showFull[note.id] ? 'Collapse Idea' : 'Expand Idea'}
                </button>
                <Link
                  to={`/idea/${note.id}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white text-xs font-medium hover:bg-gray-50 hover:text-gray-800 transition"
                >
                  Share
                </Link>
                <span>{new Date(note.created_at).toLocaleString()}</span>
                {Number.isFinite(durations[note.id]) && durations[note.id] > 0 ? (
                  <span className="ml-4">
                    Length:{' '}
                    {(() => {
                      const totalSeconds = Math.round(durations[note.id]);
                      const minutes = Math.floor(totalSeconds / 60);
                      const seconds = totalSeconds % 60;
                      if (minutes > 0) {
                        return `${minutes} Minute${minutes !== 1 ? 's' : ''} ${seconds} Second${seconds !== 1 ? 's' : ''}`;
                      } else {
                        return `${seconds} Second${seconds !== 1 ? 's' : ''}`;
                      }
                    })()}
                  </span>
                ) : (
                  <span className="ml-4 text-gray-400">Duration unavailable</span>
                )}
              </div>

              {!showFull[note.id] && ideaText && (
                <div className="mt-2 prose prose-sm prose-green max-w-none leading-tight">
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

              {rootCauses && (
                <div className="prose max-w-none mb-4">
                  <ReactMarkdown>{rootCauses}</ReactMarkdown>
                </div>
              )}

              <AudioPlayer src={note.audio_url} className="rounded-lg mb-4" />


              <p className="text-gray-700 whitespace-pre-wrap mb-2">
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
    })
      )}
    </div>
  );
}