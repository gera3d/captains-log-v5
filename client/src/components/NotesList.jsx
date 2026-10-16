import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import 'react-h5-audio-player/lib/styles.css';
import { useAuth } from '../contexts/AuthContext';
import { useGeneration } from '../contexts/GenerationContext';
import { BookOpenIcon, ChartBarIcon, MagnifyingGlassIcon, DocumentTextIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { parseIdeaReportSummary } from '../utils/parseIdeaReport';
import { ideaMarkdownComponents } from '../utils/ideaMarkdownComponents';
import { extractTitle, extractSummary } from '../utils/extractTitle';

function ReportBadges({ ideaText }) {
  const summary = parseIdeaReportSummary(ideaText);
  if (!summary) return null;
  const items = [
    { icon: BookOpenIcon, value: summary.sourceCount, label: 'sources' },
    { icon: ChartBarIcon, value: summary.metrics.length, label: 'metrics' },
    { icon: MagnifyingGlassIcon, value: summary.keywordCount, label: 'keywords' },
  ].filter((i) => i.value > 0);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {items.map((i) => (
        <span
          key={i.label}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium"
        >
          <i.icon className="h-3 w-3" aria-hidden="true" />
          {i.value} {i.label}
        </span>
      ))}
    </div>
  );
}

export default function NotesList({ notes = [], setNotes, loadingNotes = false, onPromoteToActive }) {
  const [durations, setDurations] = useState({});
  const [loadingIdea, setLoadingIdea] = useState({});
  const [showFull, setShowFull] = useState({});
  const [showTranscript, setShowTranscript] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [pushingToGitHub, setPushingToGitHub] = useState({});
  const [gitHubError, setGitHubError] = useState(null);
  const [gitHubSuccess, setGitHubSuccess] = useState(null);

  const { session, loginWithGitHub } = useAuth();
  const { runGeneration, isGenerating, activeTask } = useGeneration();

  // Persist showArchived state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showArchived');
    if (saved !== null) {
      setShowArchived(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('showArchived', showArchived.toString());
  }, [showArchived]);

  // Set durations for notes with known duration
  useEffect(() => {
    const durMap = {};
    (notes || []).forEach(note => {
      if (note.duration && Number.isFinite(note.duration) && note.duration > 0) {
        durMap[note.id] = note.duration;
      }
    });
    setDurations(prev => ({ ...durMap, ...prev }));
  }, [notes]);

  const isArchived = (note) => {
    return note.archived === true || note.archived === 'true' || note.status === 'archived';
  };

  const activeCount = (notes || []).filter(note => !isArchived(note)).length;
  const archivedCount = (notes || []).filter(note => isArchived(note)).length;

  const displayedNotes = (notes || []).filter(note => {
    if (showArchived) return isArchived(note);
    return !isArchived(note);
  });

  const handleToggleArchive = async (note) => {
    const currentlyArchived = isArchived(note);
    const nextArchived = !currentlyArchived;
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, archived: nextArchived, status: nextArchived ? 'archived' : 'active' } : n));
    if (String(note.id).startsWith('idea_')) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch(`/api/v1/ideas/${note.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ archived: nextArchived, status: nextArchived ? 'archived' : 'active' })
        });
      } catch (err) {
        console.error('Failed to update ambient idea archive status:', err);
      }
    } else {
      try {
        await supabase
          .from('voice_notes')
          .update({ archived: nextArchived, status: nextArchived ? 'archived' : 'active' })
          .eq('id', note.id);
      } catch (err) {
        console.error('Failed to update archive status:', err);
      }
    }
  };

  const handleGenerateIdea = async (note) => {
    setLoadingIdea(prev => ({ ...prev, [note.id]: true }));
    const transcriptText = (() => {
      const raw = note.transcript || note.transcription || '';
      if (!raw) return note.business_idea || '';
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed.data || parsed.text || JSON.stringify(parsed);
        }
        return String(parsed);
      } catch {
        return raw;
      }
    })();

    if (!transcriptText || !transcriptText.trim()) {
      alert('This note does not have any content yet to structure.');
      setLoadingIdea(prev => ({ ...prev, [note.id]: false }));
      return;
    }

    try {
      await runGeneration({
        ideaId: note.id,
        title: note.title || 'Startup Blueprint',
        type: note.business_idea ? 'regenerate' : 'generate',
        execute: async () => {
          const response = await fetch('https://n8n.why57.com/webhook/transcript-summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcriptText.trim() }),
          });
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          const rawIdea = data.idea || data.text;
          if (typeof rawIdea !== 'string' || !rawIdea.trim()) {
            throw new Error('Webhook response did not include a valid idea.');
          }
          const idea = rawIdea.replace(/^[^\w#*]+/, '').trim();
          const extractedTitle = extractTitle({ business_idea: idea });
          const extractedSummary = extractSummary({ business_idea: idea });

          setNotes(prev =>
            prev.map(n =>
              n.id === note.id
                ? { ...n, business_idea: idea, title: extractedTitle || n.title, summary: extractedSummary || n.summary, is_featured: true, status: 'active' }
                : n
            )
          );

          if (onPromoteToActive) {
            onPromoteToActive(note.id);
          }

          if (String(note.id).startsWith('idea_')) {
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData?.session?.access_token;
              const headers = { 'Content-Type': 'application/json' };
              if (token) headers['Authorization'] = `Bearer ${token}`;
              await fetch(`/api/v1/ideas/${note.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                  business_idea: idea,
                  title: extractedTitle,
                  summary: extractedSummary,
                  is_featured: true,
                  status: 'active'
                })
              });
            } catch (err) {
              console.error('Failed to update ambient idea business_idea on server:', err);
            }
          } else {
            await supabase
              .from('voice_notes')
              .update({ business_idea: idea, is_featured: true, status: 'active' })
              .eq('id', note.id);
          }

          return {
            id: note.id,
            title: extractedTitle || note.title,
            summary: extractedSummary || note.summary,
            url: `/idea/${note.id}`
          };
        }
      });
    } catch (err) {
      console.error('Generate/Regenerate idea failed:', err);
      alert(err.message || 'Failed to generate business idea. Please try again.');
    } finally {
      setLoadingIdea(prev => ({ ...prev, [note.id]: false }));
    }
  };

  const handlePushToGitHub = async (note) => {
    setGitHubError(null);
    setGitHubSuccess(null);

    const isGitHubLinked = session?.user?.app_metadata?.providers?.includes('github');
    if (!isGitHubLinked || !session?.provider_token || !session?.access_token) {
      alert('Please log in specifically with GitHub first to use this feature.');
      try {
        await loginWithGitHub(); 
      } catch (error) {
        console.error('GitHub login initiation failed:', error);
        setGitHubError('Failed to initiate GitHub login.');
      }
      return;
    }

    const repoName = prompt("Enter GitHub repository name (e.g., my-captains-log-notes):");
    if (!repoName) return;

    const isNewRepo = confirm("Is this a new repository? (Click OK for Yes, Cancel for No)");
    setPushingToGitHub(prev => ({ ...prev, [note.id]: true }));

    try {
      const accessToken = session.access_token;
      const githubProviderToken = session.provider_token;
      if (!accessToken || !githubProviderToken) {
        throw new Error("Supabase or GitHub token not found in session.");
      }

      const { data, error } = await supabase.functions.invoke('push-to-github', {
        body: {
          note,
          repoName,
          isNewRepo,
          githubToken: githubProviderToken
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (error) throw error;
      setGitHubSuccess(`Successfully pushed to ${data.repoUrl || repoName}. File: ${data.fileUrl || 'link unavailable'}`);
      setTimeout(() => setGitHubSuccess(null), 5000);
    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      const errorMessage = error.message || (error.context?.error_description) || 'Failed to push note to GitHub.';
      setGitHubError(`Error: ${errorMessage}`);
      setTimeout(() => setGitHubError(null), 7000);
    } finally {
      setPushingToGitHub(prev => ({ ...prev, [note.id]: false }));
    }
  };

  return (
    <div className="w-full">
      {/* Tab Filter Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`
            rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm
            ${!showArchived 
              ? 'bg-indigo-600 text-white border border-indigo-600 font-bold' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}
          `}
          onClick={() => setShowArchived(false)}
          aria-pressed={!showArchived}
          aria-label="Show active notes"
        >
          <span>Active Notes</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${!showArchived ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {activeCount}
          </span>
        </button>
        <button
          className={`
            rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm
            ${showArchived 
              ? 'bg-indigo-600 text-white border border-indigo-600 font-bold' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}
          `}
          onClick={() => setShowArchived(true)}
          aria-pressed={showArchived}
          aria-label="Show archived notes"
        >
          <span>Archived Notes</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${showArchived ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {showArchived ? 'Archived Brainstorms & Notes' : 'Your Captured Notes & Ideas'}
      </h2>

      {/* GitHub Notification Banners */}
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
      ) : displayedNotes.length === 0 ? (
        <div className="text-center text-gray-500 py-16 text-lg font-medium bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {showArchived ? 'No archived notes found.' : 'No active notes yet. Record or capture your first idea!'}
        </div>
      ) : (
        <div className="flex flex-col gap-y-6 sm:gap-y-8">
          {displayedNotes.map((note) => {
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

            const title = extractTitle(note);
            const summary = extractSummary(note);

            return (
              <div
                key={note.id}
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-5 sm:p-7 flex flex-col gap-y-4 border border-gray-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-200 w-full"
              >
                {/* Header: Title, Metadata, Actions Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xl select-none" aria-hidden="true">💡</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors">
                        <Link to={`/idea/${note.id}`} className="hover:underline">
                          {title}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 mt-1">
                      <span>{new Date(note.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {note.audio_url ? (
                        Number.isFinite(durations[note.id]) && durations[note.id] > 0 ? (
                          <span className="inline-flex items-center text-blue-700 font-medium bg-blue-50 px-2.5 py-0.5 rounded-full text-[11px] border border-blue-100">
                            🎙️ Voice Memo ({(() => {
                              const totalSeconds = Math.round(durations[note.id]);
                              const minutes = Math.floor(totalSeconds / 60);
                              const seconds = totalSeconds % 60;
                              return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                            })()})
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-blue-700 font-medium bg-blue-50 px-2.5 py-0.5 rounded-full text-[11px] border border-blue-100">
                            🎙️ Voice Recording
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center text-indigo-700 font-medium bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[11px]">
                          ⚡ Transcript Capture (No Audio)
                        </span>
                      )}
                      {note.author && (
                        <span className="text-gray-400 font-medium">• By {note.author}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 self-start">
                    {/* Generate / Regenerate Idea Action */}
                    {(note.transcript || note.transcription || ideaText) && (
                      <button
                        onClick={() => handleGenerateIdea(note)}
                        disabled={loadingIdea[note.id]}
                        className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs font-semibold transition shadow-sm cursor-pointer ${
                          ideaText
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
                            : 'border-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white font-bold'
                        } disabled:opacity-50`}
                        title={ideaText ? 'Regenerate structured business idea from transcript' : 'Generate structured business idea from transcript'}
                        aria-label={ideaText ? 'Regenerate idea' : 'Generate idea'}
                      >
                        {loadingIdea[note.id] ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {ideaText ? 'Regenerating...' : 'Generating...'}
                          </>
                        ) : ideaText ? (
                          <>
                            <ArrowPathIcon className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                            Regenerate
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="h-3.5 w-3.5 mr-1 text-white" />
                            Generate Idea
                          </>
                        )}
                      </button>
                    )}

                    {ideaText && (
                      <button
                        onClick={() => setShowFull(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                        className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition shadow-sm cursor-pointer"
                        aria-label={showFull[note.id] ? 'Collapse idea' : 'Expand idea'}
                      >
                        {showFull[note.id] ? 'Collapse' : 'Expand Idea'}
                      </button>
                    )}

                    {note.transcript && (
                      <button
                        onClick={() => setShowTranscript(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                        className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs font-semibold transition shadow-sm cursor-pointer ${
                          showTranscript[note.id]
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                        aria-label={showTranscript[note.id] ? 'Hide raw transcript' : 'View raw transcript'}
                      >
                        <DocumentTextIcon className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        {showTranscript[note.id] ? 'Hide Transcript' : 'Transcript'}
                      </button>
                    )}

                    <Link
                      to={`/idea/${note.id}`}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-indigo-500 bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                      aria-label="Go to full note view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Note
                    </Link>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/idea/' + note.id);
                        setCopiedLink(note.id);
                        setTimeout(() => setCopiedLink(null), 1500);
                      }}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-green-300 bg-green-50 text-xs font-bold text-green-700 hover:bg-green-100 transition shadow-sm cursor-pointer"
                      aria-label="Copy public link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {copiedLink === note.id ? 'Copied!' : 'Share'}
                    </button>

                    <button
                      onClick={() => handlePushToGitHub(note)}
                      disabled={pushingToGitHub[note.id]}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-purple-300 bg-purple-50 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {pushingToGitHub[note.id] ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 mr-1 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Pushing...
                        </>
                      ) : (
                        'Push to GitHub'
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleArchive(note)}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                      aria-label={showArchived ? 'Restore note' : 'Archive note'}
                    >
                      {showArchived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>

                {/* Collapsible Raw Transcript Drawer */}
                {showTranscript[note.id] && note.transcript && (
                  <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-indigo-100">
                      <span className="font-semibold text-xs text-indigo-900 flex items-center gap-1.5">
                        <DocumentTextIcon className="h-4 w-4 text-indigo-500" />
                        Raw Monologue Transcript {!note.audio_url && '(Ambient Text Ingestion)'}
                      </span>
                      <button
                        onClick={() => {
                          const raw = (() => {
                            try {
                              const p = JSON.parse(note.transcript);
                              return p && typeof p === 'object' ? p.data || p.text || JSON.stringify(p) : String(p);
                            } catch {
                              return note.transcript;
                            }
                          })();
                          navigator.clipboard.writeText(raw);
                        }}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                      >
                        Copy Text
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200/80 shadow-inner">
                      {(() => {
                        try {
                          const p = JSON.parse(note.transcript);
                          return p && typeof p === 'object' ? p.data || p.text || JSON.stringify(p) : String(p);
                        } catch {
                          return note.transcript;
                        }
                      })()}
                    </p>
                  </div>
                )}

                {/* Card Body: Summary Preview (when collapsed) */}
                {!showFull[note.id] && (
                  <div
                    className="cursor-pointer group/preview"
                    onClick={() => ideaText && setShowFull(prev => ({ ...prev, [note.id]: true }))}
                  >
                    <ReportBadges ideaText={ideaText} />
                    <div className="text-gray-800 text-sm sm:text-base leading-relaxed">
                      {summary ? (
                        <p className="font-normal text-slate-700">
                          {summary}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic text-xs">
                          No structured summary generated yet.
                        </p>
                      )}
                    </div>
                    {ideaText && (
                      <div className="mt-2 text-xs font-semibold text-indigo-600 group-hover/preview:text-indigo-800 flex items-center gap-1">
                        <span>Read full structured idea</span>
                        <span className="transition-transform group-hover/preview:translate-x-0.5">→</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Prominent conversion callout for un-structured notes */}
                {!ideaText && (note.transcript || note.transcription) && (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="text-xs text-indigo-950">
                      <span className="font-bold text-indigo-950">Raw capture waiting for your decision:</span> Not every note needs to be organized. If this one is worthy, convert it into a structured idea.
                    </div>
                    <button
                      onClick={() => handleGenerateIdea(note)}
                      disabled={loadingIdea[note.id]}
                      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border border-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-50 flex-shrink-0 cursor-pointer"
                    >
                      {loadingIdea[note.id] ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Idea...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-3.5 w-3.5 mr-1.5 text-white" />
                          Generate Business Idea
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Card Body: Full Structured View (when expanded) */}
                {showFull[note.id] && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 shadow-inner overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-white/70">
                      <h4 className="font-semibold text-sm text-gray-700">Structured Business Plan</h4>
                      <button
                        onClick={() => setShowFull(prev => ({ ...prev, [note.id]: false }))}
                        className="text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                      >
                        Collapse
                      </button>
                    </div>
                    <div className="px-5 py-4">
                      <ReportBadges ideaText={ideaText} />
                      <div className="prose prose-sm prose-slate max-w-none leading-relaxed">
                        <ReactMarkdown components={ideaMarkdownComponents}>{ideaText}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Player (Only rendered when note has audio_url) */}
                {note.audio_url && (
                  <div className="mt-2 pt-3 border-t border-gray-100">
                    <div className="rounded-xl bg-gradient-to-r from-[#f3f4fd] to-[#eef5ff] p-4 shadow-sm border border-blue-100">
                      <div className="flex items-center w-full" id={`audio-player-${note.id}`}>
                        <button 
                          type="button"
                          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#4285F4] text-white shadow-md hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 mr-3 cursor-pointer"
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
                          <span className="play-icon text-lg leading-none" style={{marginLeft: "2px", marginTop: "-1px"}}>▶</span>
                          <span className="pause-icon hidden text-lg">⏸</span>
                        </button>
                        
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

                      <audio 
                        id={`audio-element-${note.id}`}
                        src={note.audio_url} 
                        onTimeUpdate={(e) => {
                          const audio = e.target;
                          const playerContainer = document.getElementById(`audio-player-${note.id}`);
                          if (audio && playerContainer) {
                            const progressBar = playerContainer.querySelector('.progress-bar');
                            const percent = (audio.currentTime / audio.duration) * 100;
                            progressBar.style.width = `${percent}%`;
                            
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}