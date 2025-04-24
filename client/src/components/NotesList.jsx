import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import 'react-h5-audio-player/lib/styles.css';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

export default function NotesList({ notes, setNotes }) {
  const [durations, setDurations] = useState({});
  const [loadingIdea, setLoadingIdea] = useState({});
  const [showFull, setShowFull] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [pushingToGitHub, setPushingToGitHub] = useState({}); // State for GitHub push loading
  const [gitHubError, setGitHubError] = useState(null); // State for GitHub errors
  const [gitHubSuccess, setGitHubSuccess] = useState(null); // State for GitHub success messages

  const { session, loginWithGitHub } = useAuth(); // Get session and login function from AuthContext

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

  // Function to handle pushing a note to GitHub
  const handlePushToGitHub = async (note) => {
    setGitHubError(null);
    setGitHubSuccess(null);

    // 1. Check if user has linked GitHub and has necessary tokens
    const isGitHubLinked = session?.user?.app_metadata?.providers?.includes('github');
    if (!isGitHubLinked || !session?.provider_token || !session?.access_token) {
      alert('Please log in specifically with GitHub first to use this feature.');
      try {
        // Attempt to initiate GitHub login
        await loginWithGitHub(); 
      } catch (error) {
        console.error('GitHub login initiation failed:', error);
        setGitHubError('Failed to initiate GitHub login.');
      }
      return;
    }

    // 2. Prompt for repository details
    const repoName = prompt("Enter GitHub repository name (e.g., my-captains-log-notes):");
    if (!repoName) return; // User cancelled

    const isNewRepo = confirm("Is this a new repository? (Click OK for Yes, Cancel for No)");

    setPushingToGitHub(prev => ({ ...prev, [note.id]: true }));

    // Log the session object for debugging
    console.log("Session object before invoking function:", session);

    try {
      // Ensure session, access_token, and provider_token exist
      const accessToken = session.access_token;
      const githubProviderToken = session.provider_token; // Get the GitHub token
      if (!accessToken) {
        throw new Error("Supabase access token not found in session.");
      }
      if (!githubProviderToken) {
        // This check might be redundant given the earlier check, but good for clarity
        throw new Error("GitHub provider token not found in session.");
      }
      console.log("Using Access Token for Authorization header:", accessToken);
      console.log("Sending GitHub Provider Token in body:", githubProviderToken); // Log the provider token

      // 3. Invoke the Edge Function with explicit Authorization header AND provider_token in body
      const { data, error } = await supabase.functions.invoke('push-to-github', {
        body: {
          note,
          repoName,
          isNewRepo,
          githubToken: githubProviderToken // Pass the token in the body
        },
        headers: {
          'Authorization': `Bearer ${accessToken}` // Keep this for Supabase function auth
        }
      });

      if (error) throw error;

      console.log('GitHub push response:', data);
      setGitHubSuccess(`Successfully pushed to ${data.repoUrl || repoName}. File: ${data.fileUrl || 'link unavailable'}`);
      // Optionally clear success message after a few seconds
      setTimeout(() => setGitHubSuccess(null), 5000);

    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      const errorMessage = error.message || (error.context?.error_description) || 'Failed to push note to GitHub.';
      setGitHubError(`Error: ${errorMessage}`);
      // Optionally clear error message after a few seconds
      setTimeout(() => setGitHubError(null), 7000);
    } finally {
      setPushingToGitHub(prev => ({ ...prev, [note.id]: false }));
    }
  };

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

      {/* Global GitHub Messages */}
      {gitHubError && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300 text-sm">
          {gitHubError}
        </div>
      )}
      {gitHubSuccess && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 border border-green-300 text-sm">
          {gitHubSuccess}
        </div>
      )}

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

                    {/* Add Push to GitHub Button */}
                    <button
                      onClick={() => handlePushToGitHub(note)}
                      disabled={pushingToGitHub[note.id]}
                      className={`
                        inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-medium transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 shadow-sm
                        ${pushingToGitHub[note.id]
                          ? 'border-gray-300 bg-gray-200 text-gray-500 cursor-wait'
                          : 'border-purple-500 bg-purple-100 text-purple-700 hover:bg-purple-200'}
                      `}
                      aria-label="Push note to GitHub repository"
                      aria-busy={pushingToGitHub[note.id]}
                    >
                      {pushingToGitHub[note.id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Pushing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253m9-1.747c1.168.776 2.754 1.253 4.5 1.253s3.332-.477 4.5-1.253m0-13C13.168 7.523 14.754 8 16.5 8s3.332-.477 4.5-1.253" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15.75l3-3m0 0l3 3m-3-3v-6m-1.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          </svg>
                          Push to GitHub
                        </>
                      )}
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
                    <div className="rounded-xl bg-gradient-to-r from-[#f3f4fd] to-[#eef5ff] p-4 shadow-sm border border-blue-100">
                      {/* Custom audio wrapper */}
                      <div className="flex items-center w-full" id={`audio-player-${note.id}`}>
                        {/* Simplified play button with guaranteed visibility */}
                        <button 
                          type="button"
                          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#4285F4] text-white shadow-md hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 mr-3"
                          onClick={() => {
                            const audioId = `audio-element-${note.id}`;
                            const audio = document.getElementById(audioId);
                            const playerContainer = document.getElementById(`audio-player-${note.id}`);
                            
                            if (audio) {
                              if (audio.paused) {
                                audio.play().then(() => {
                                  playerContainer.classList.add('is-playing');
                                }).catch(err => console.error('Audio play error:', err));
                              } else {
                                audio.pause();
                                playerContainer.classList.remove('is-playing');
                              }
                            }
                          }}
                          aria-label="Play or pause audio"
                        >
                          {/* Unicode triangle character for guaranteed visibility */}
                          <span className="play-icon text-lg leading-none" style={{marginLeft: "2px", marginTop: "-1px"}}>▶</span>
                          
                          {/* Unicode pause character */}
                          <span className="pause-icon hidden text-lg">⏸</span>
                        </button>
                        
                        {/* Audio info and controls */}
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">Voice Recording</span>
                            <span className="text-xs font-medium text-gray-500">
                              <span className="current-time">0:00</span> / 
                              {Number.isFinite(durations[note.id]) && durations[note.id] > 0 
                                ? (() => {
                                    const totalSeconds = Math.round(durations[note.id]);
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = totalSeconds % 60;
                                    return ` ${minutes}:${seconds.toString().padStart(2, '0')}`;
                                  })()
                                : ' 0:00'}
                            </span>
                          </div>
                          
                          <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                            <div className="progress-bar bg-blue-500 h-2 w-0 rounded-full transition-all"></div>
                          </div>
                        </div>
                      </div>

                      {/* Hidden native audio element but functional */}
                      <audio 
                        id={`audio-element-${note.id}`}
                        src={note.audio_url} 
                        onTimeUpdate={(e) => {
                          const audio = e.target;
                          const playerContainer = document.getElementById(`audio-player-${note.id}`);
                          if (audio && playerContainer) {
                            // Update progress bar
                            const progressBar = playerContainer.querySelector('.progress-bar');
                            const percent = (audio.currentTime / audio.duration) * 100;
                            progressBar.style.width = `${percent}%`;
                            
                            // Update current time
                            const currentTimeDisplay = playerContainer.querySelector('.current-time');
                            const currentMinutes = Math.floor(audio.currentTime / 60);
                            const currentSeconds = Math.floor(audio.currentTime % 60);
                            currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
                          }
                        }}
                        onPlay={() => {
                          const playerContainer = document.getElementById(`audio-player-${note.id}`);
                          if (playerContainer) {
                            playerContainer.classList.add('is-playing');
                            const playIcon = playerContainer.querySelector('.play-icon');
                            const pauseIcon = playerContainer.querySelector('.pause-icon');
                            if (playIcon && pauseIcon) {
                              playIcon.classList.add('hidden');
                              pauseIcon.classList.remove('hidden');
                            }
                          }
                        }}
                        onPause={() => {
                          const playerContainer = document.getElementById(`audio-player-${note.id}`);
                          if (playerContainer) {
                            playerContainer.classList.remove('is-playing');
                            const playIcon = playerContainer.querySelector('.play-icon');
                            const pauseIcon = playerContainer.querySelector('.pause-icon');
                            if (playIcon && pauseIcon) {
                              playIcon.classList.remove('hidden');
                              pauseIcon.classList.add('hidden');
                            }
                          }
                        }}
                        onLoadedData={(e) => {
                          const audio = e.target;
                          if (audio && !durations[note.id] && isFinite(audio.duration) && audio.duration > 0) {
                            setDurations(prev => ({ ...prev, [note.id]: audio.duration }));
                          }
                        }}
                      />
                    </div>
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