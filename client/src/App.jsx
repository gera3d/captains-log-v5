/*
  ROOT-TODO[HIGH]: App Structure & Release
  - Main entry point for Captain's Log app.
  - Keep this file organized and maintain top-level app logic only.
  - REVIEW: Review all feature integrations before major releases.
  - FEATURE: Ensure all new features are registered here.
*/
// TODO[progress-md][P1][App] See progress.md for all open UI polish, loading, error, and browser test tasks

import { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { supabase } from './supabaseClient';
import { Routes, Route } from 'react-router-dom';
import NotesList from './components/NotesList';
import VoiceRecorder from './components/VoiceRecorder';
import { CheckIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon } from '@heroicons/react/24/outline';

  /*
    TODO[MEDIUM]: Dashboard Onboarding
    - FEATURE: Add user onboarding tips for first-time users.
    - UI: Consider a dismissible banner or modal for onboarding.
  */

function Dashboard({ notes, setNotes, user, signInWithGoogle, signOut }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
 
  // DEV MODE: If ?dev_user=1 is present, always show onboarding modal and mock user
  const isDevUser = typeof window !== "undefined" && window.location.search.includes("dev_user=1");
  const devMockUser = {
    id: "dev-user-1",
    email: "devuser@example.com",
    user_metadata: { full_name: "Dev User" }
  };
  const effectiveUser = isDevUser ? devMockUser : user;
 
  useEffect(() => {
    if (isDevUser) {
      setShowOnboarding(true);
      return;
    }
    if (effectiveUser) {
      const seen = localStorage.getItem('dashboardOnboardingSeen');
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, [effectiveUser, isDevUser]);

  const handleDismissOnboarding = () => {
    localStorage.setItem('dashboardOnboardingSeen', 'true');
    setShowOnboarding(false);
  };

  // FIX: Provide a no-op onNoteSaved handler to unblock dashboard and onboarding modal
  const onNoteSaved = () => {};

  const onboardingModal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-8 sm:p-10 relative border border-sky-100 animate-fade-in-up">
        <button
          className="absolute top-3 right-3 text-sky-400 hover:text-sky-600 text-2xl font-bold transition"
          onClick={handleDismissOnboarding}
          aria-label="Dismiss onboarding"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <span className="text-6xl mb-4 animate-bounce">🪄</span>
          <h2 className="text-3xl font-extrabold mb-2 text-sky-600 drop-shadow">Welcome to Captain's Log!</h2>
          <p className="text-gray-700 mb-4 text-center text-lg">
            Here’s a quick guide to get you started:
          </p>
          <ul className="text-left text-gray-600 space-y-3 mb-6 w-full max-w-xs">
            <li className="flex items-center">
              <MicrophoneIcon className="h-6 w-6 text-sky-500 mr-3" />
              <span><b>Record:</b> Tap the mic to capture voice notes instantly.</span>
            </li>
            <li className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-sky-500 mr-3" />
              <span><b>View:</b> See and organize all your notes below.</span>
            </li>
            <li className="flex items-center">
              <ShareIcon className="h-6 w-6 text-sky-500 mr-3" />
              <span><b>Share/Export:</b> Easily share or export your notes anytime.</span>
            </li>
          </ul>
          <button
            className="mt-2 px-10 py-3 bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-xl font-bold shadow-lg hover:from-sky-600 hover:to-sky-500 transition transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-300"
            onClick={handleDismissOnboarding}
          >
            Got it!
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          }
        `}
      </style>
    </div>
  );

  return (
    <div className="bg-white w-full max-w-full overflow-x-hidden">
      {/* Tailwind UI Hero with SVG background */}
      {!effectiveUser && (
        <header className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-400 to-sky-700">
          <div className="max-w-3xl mx-auto py-28 px-4 sm:px-8 text-center relative z-10 flex flex-col items-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="text-5xl">🧭</span>
              <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight">Captain's Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow">Capture & Transcribe Voice Notes</h1>
            <p className="mb-8 text-lg sm:text-xl text-sky-100 font-medium drop-shadow">Record your thoughts, save them securely, and share effortlessly.</p>
            <button
              onClick={async () => {
                setSigningIn(true);
                try {
                  await signInWithGoogle();
                } finally {
                  setSigningIn(false);
                }
              }}
              className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-sky-200 via-white to-sky-100 text-sky-700 font-bold shadow-lg hover:from-sky-100 hover:to-sky-200 hover:text-sky-900 transition focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={signingIn}
              aria-busy={signingIn}
              aria-disabled={signingIn}
            >
              {signingIn ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size={20} className="mr-2" />
                  Signing In...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1H12v2.8h5.35c-.23 1.2-1.4 3.5-5.35 3.5-3.22 0-5.85-2.67-5.85-5.9s2.63-5.9 5.85-5.9c1.83 0 3.06.78 3.76 1.45l2.57-2.5C17.09 3.9 14.77 2.7 12 2.7 6.48 2.7 2 7.18 2 12.7s4.48 10 10 10c5.75 0 9.54-4.03 9.54-9.7 0-.65-.07-1.13-.19-1.6z"/></svg>
                  Sign In with Google
                </>
              )}
            </button>
          </div>
          <svg className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-40" width="1000" height="1000" fill="none" viewBox="0 0 1000 1000">
            <circle cx="500" cy="500" r="400" fill="url(#grad1)" />
            <defs>
              <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </header>
      )}
      {effectiveUser && (
        <>
          {showOnboarding && onboardingModal}
          <div className="w-full flex flex-col justify-start items-center px-0 sm:px-8 py-8 bg-gradient-to-br from-sky-50 via-white to-indigo-50 min-h-[50vh] box-border">
            <nav className="w-full max-w-full sm:max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 px-4 sm:px-8 py-6 bg-white/80 rounded-2xl shadow-lg border border-sky-100 backdrop-blur mb-8 box-border"
              style={{ maxWidth: '100vw' }}>
              <div className="flex items-center gap-x-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-sky-700 tracking-tight drop-shadow">
                <span className="text-3xl md:text-4xl">🧭</span>
                <span className="whitespace-nowrap">Captain's Log</span>
              </div>
              <div className="flex items-center gap-x-4">
                <span className="text-sm font-light text-gray-400">{effectiveUser.email}</span>
                <button
                  onClick={async () => {
                    setSigningOut(true);
                    try {
                      await signOut();
                    } finally {
                      setSigningOut(false);
                    }
                  }}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 text-white font-semibold shadow-md transition
                  hover:from-sky-600 hover:to-sky-500 hover:shadow-lg hover:scale-102
                  active:scale-98
                  focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1
                  border-0 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={signingOut}
                  aria-busy={signingOut}
                  aria-disabled={signingOut}
                >
                  {signingOut ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size={18} className="mr-2" />
                      Signing Out...
                    </span>
                  ) : (
                    "Sign Out"
                  )}
                </button>
              </div>
            </nav>
            <div className="w-full max-w-full sm:max-w-2xl mx-auto mt-8 box-border" style={{ maxWidth: '100vw' }}>
              <div className="bg-gradient-to-br from-white via-sky-50 to-indigo-50 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(16,42,67,0.10)] border border-sky-100/70 p-6 sm:p-12 flex flex-col items-center box-border">
                {/* VoiceRecorder Card */}
                <VoiceRecorder onNoteSaved={onNoteSaved} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tailwind UI Features with icons */}
      {!effectiveUser && (
      <section className="bg-gradient-to-b from-sky-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg border border-sky-100 p-8 transition hover:shadow-2xl hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <MicrophoneIcon className="h-12 w-12 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-sky-700 mb-2">Fast Recording</h3>
              <p className="text-base text-gray-600 text-center">Quickly capture your thoughts with one tap.</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg border border-sky-100 p-8 transition hover:shadow-2xl hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <DocumentTextIcon className="h-12 w-12 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-sky-700 mb-2">Accurate Transcripts</h3>
              <p className="text-base text-gray-600 text-center">Get high-quality transcriptions of your voice notes.</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg border border-sky-100 p-8 transition hover:shadow-2xl hover:-translate-y-1">
              <div className="flex justify-center mb-4">
                <ShareIcon className="h-12 w-12 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-sky-700 mb-2">Easy Sharing</h3>
              <p className="text-base text-gray-600 text-center">Share your notes with friends or colleagues instantly.</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Tailwind UI Content Section */}
      {effectiveUser && (
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* NotesList now sits directly on the background for a more open, mobile-friendly feel */}
            <NotesList notes={notes} setNotes={setNotes} />
          </div>
        </section>
      )}

      {/* Tailwind UI CTA Section */}
      {!effectiveUser && (
        <section className="relative bg-gradient-to-br from-indigo-700 via-sky-600 to-indigo-900 py-20 overflow-hidden">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Ready to get started?</h2>
            <p className="mb-8 text-lg text-indigo-100 font-medium drop-shadow">Sign in to record and view your voice notes.</p>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-sky-200 via-white to-indigo-200 text-indigo-700 font-bold shadow-lg hover:from-sky-100 hover:to-indigo-100 hover:text-indigo-900 transition focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1H12v2.8h5.35c-.23 1.2-1.4 3.5-5.35 3.5-3.22 0-5.85-2.67-5.85-5.9s2.63-5.9 5.85-5.9c1.83 0 3.06.78 3.76 1.45l2.57-2.5C17.09 3.9 14.77 2.7 12 2.7 6.48 2.7 2 7.18 2 12.7s4.48 10 10 10c5.75 0 9.54-4.03 9.54-9.7 0-.65-.07-1.13-.19-1.6z"/></svg>
              Sign In with Google
            </button>
          </div>
          <svg className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-40" width="1000" height="1000" fill="none" viewBox="0 0 1000 1000">
            <circle cx="500" cy="500" r="400" fill="url(#grad2)" />
            <defs>
              <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </section>
      )}

      {/* Tailwind UI Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 overflow-hidden sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-400">&copy; 2025 Captains Log. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 19c7.732 0 11.946-6.41 11.946-11.946 0-.182 0-.364-.012-.545A8.548 8.548 0 0022 4.309a8.19 8.19 0 01-2.357.646A4.118 4.118 0 0021.448 3a8.224 8.224 0 01-2.605.996A4.107 4.107 0 0015.448 3c-2.266 0-4.104 1.838-4.104 4.104 0 .322.036.636.106.936A11.65 11.65 0 013 4.15a4.104 4.104 0 001.27 5.475 4.073 4.073 0 01-1.858-.513v.052c0 2.042 1.453 3.746 3.379 4.132a4.095 4.095 0 01-1.853.07c.522 1.63 2.037 2.816 3.833 2.85A8.233 8.233 0 012 19.54a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';

function FullIdeaPage({ user, session }) {
  const { id } = useParams();
  const [note, setNote] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
        /*
          DATA-FIXME: Error Handling
          - BUG: If fetching note fails, show a user-friendly error message instead of just logging to console.
          - CONTEXT: FullIdeaPage > fetchNote
        */

      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error('Fetch note error:', error);
      else {
        // Clean up business idea if it's JSON string
        if (data?.business_idea) {
          let idea = data.business_idea.trim();
          try {
            if (idea.startsWith('{') && idea.endsWith('}')) {
              const parsed = JSON.parse(idea);
              if (parsed && typeof parsed === 'object' && parsed.text) {
                idea = parsed.text;
              } else {
                idea = idea;
              }
            }
          } catch {
            // leave as is
          }
          // Remove leading 'text":"'
          idea = idea.replace(/^["']?text["']?\s*:\s*["']?/, '');
          // Replace escaped newlines with real newlines
          idea = idea.replace(/\\n/g, '\n').trim();
          data.business_idea = idea;
        }
        setNote(data);
      }
    };
    fetchNote();
  }, [id]);

  const copyIdea = () => {
    if (note?.business_idea) {
      navigator.clipboard.writeText(note.business_idea);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const [copied, setCopied] = useState('');

  const handleCopyIdea = () => {
    copyIdea();
    setCopied('idea');
    setTimeout(() => setCopied(''), 1500);
  };

  const handleCopyLink = () => {
    copyLink();
    setCopied('link');
    setTimeout(() => setCopied(''), 1500);
  };

    /*
      ANALYZE: Export to Google Docs
      - FEATURE: Check if we should support exporting multiple notes at once.
      - CONTEXT: FullIdeaPage > exportToGoogleDocs
    */

  const exportToGoogleDocs = async () => {
    if (!session?.provider_token) {
      alert('No Google access token found.');
      return;
    }
    if (!note?.business_idea) {
      alert('No idea content to export.');
      return;
    }

    try {
      const response = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Idea Export',
        }),
      });

      const doc = await response.json();

      if (!doc.documentId) {
        console.error('Failed to create doc:', doc);
        alert('Failed to create Google Doc.');
        return;
      }

      await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: note.business_idea,
              },
            },
          ],
        }),
      });

      window.open(`https://docs.google.com/document/d/${doc.documentId}/edit`, '_blank');
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      alert('Error exporting to Google Docs.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="bg-white shadow-xl rounded-3xl p-10 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 text-center sm:text-left">
              {(() => {
                if (!user) return "Your Gameplan";
                const meta = user.user_metadata || {};
                if (meta.full_name) {
                  const firstName = meta.full_name.split(' ')[0];
                  return `${firstName}'s Gameplan`;
                }
                if (user.email) return `${user.email.split('@')[0]}'s Gameplan`;
                return "Your Gameplan";
              })()}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleCopyIdea}
                className="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              >
                📋 Copy Idea
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex justify-center items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
              >
                🔗 Copy Link
              </button>
              <button
                onClick={exportToGoogleDocs}
                className="inline-flex justify-center items-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
              >
                📄 Export to Google Docs
              </button>
            </div>
          </div>
          {copied && (
            <div className="mb-4 text-center text-green-600 font-semibold">
              {copied === 'idea' ? 'Idea copied to clipboard!' : 'Link copied to clipboard!'}
            </div>
          )}
          {note ? (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{note.business_idea || 'No idea generated yet.'}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  // --- BYPASS AUTH FOR DEVELOPMENT ---
  useEffect(() => {
    if (import.meta.env.VITE_BYPASS_AUTH === "true") {
      // Set a mock user and session for development/testing
      const mockUser = {
        id: "dev-user-1",
        email: "devuser@example.com",
        user_metadata: {
          full_name: "Dev User"
        }
      };
      setUser(mockUser);
      setSession({ user: mockUser });
      return; // Skip Supabase auth
    }

    /*
      TODO[HIGH]: Auth Refactor
      - FEATURE: Refactor to support additional OAuth providers (e.g., GitHub, Microsoft).
      - CONTEXT: App > useEffect (auth)
    */

    supabase.auth.getSession().then(({ data }) => {
      console.log('Supabase session:', data?.session);
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      console.log('Auth state change session:', sessionData);
      setSession(sessionData ?? null);
      setUser(sessionData?.user ?? null);
    });
  }, []);

  useEffect(() => {
    /*
      TODO[MEDIUM]: Notes Pagination
      - FEATURE: Add pagination or infinite scroll for large note sets.
      - CONTEXT: App > useEffect (notes)
    */

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Fetch notes error:', error);
      else setNotes(data);
    };

    fetchNotes();

    const channel = supabase
      .channel('public:voice_notes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'voice_notes' },
        (payload) => {
          console.log('🔥🔥🔥 REALTIME INSERT EVENT:', payload);
          setNotes((prev) => {
            const filtered = prev.filter(note => !(note.id && note.id.toString().startsWith('temp-')));
            return [payload.new, ...filtered];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'voice_notes' },
        (payload) => {
          console.log('Note updated:', payload.new);
          setNotes((prev) =>
            prev.map((note) => (note.id === payload.new.id ? payload.new : note))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'voice_notes' },
        (payload) => {
          console.log('Note deleted:', payload.old);
          setNotes((prev) => prev.filter((note) => note.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /*
    FIXME: Sign-in Edge Case
    - BUG: Handle edge case where user closes OAuth popup before authenticating.
    - CONTEXT: App > signInWithGoogle
  */

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    // Optionally, force a reload to fully reset state/UI:
    // window.location.reload();
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard notes={notes} setNotes={setNotes} user={user} signInWithGoogle={signInWithGoogle} signOut={signOut} />} />
      <Route path="/idea/:id" element={<FullIdeaPage user={user} session={session} />} />
    </Routes>
  );
}
export default App;
