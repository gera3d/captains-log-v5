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
import { Routes, Route, useNavigate } from 'react-router-dom';
import NotesList from './components/NotesList';
import VoiceRecorder from './components/VoiceRecorder';
import VoiceRecorderCard from './components/VoiceRecorderCard';
import IdeaValidationFeedback from './components/IdeaValidationFeedback';
import { CheckIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon } from '@heroicons/react/24/outline';
import Button from './components/Button';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthButton from './components/AuthButton';
  /*
    TODO[MEDIUM]: Dashboard Onboarding
    - FEATURE: Add user onboarding tips for first-time users.
    - UI: Consider a dismissible banner or modal for onboarding.
  */

function Dashboard({ notes, setNotes, user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d3263] bg-gradient-to-br from-[#1d3263] via-[#223a6d] to-[#1d3263] animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-desc"
      tabIndex={-1}
      onKeyDown={e => { if (e.key === "Escape") handleDismissOnboarding(); }}
    >
      <div className="relative bg-white/5 rounded-3xl shadow-2xl max-w-md w-full px-8 py-10 sm:px-12 sm:py-12 border border-white/10 ring-1 ring-white/10 glass-gradient focus:outline-none outline-none"
        style={{ outline: "none" }}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-[#FCD24F] text-2xl font-bold transition focus:outline-none focus:ring-2 focus:ring-[#FCD24F] rounded-full bg-white/10 hover:bg-white/20 shadow"
          onClick={handleDismissOnboarding}
          aria-label="Dismiss onboarding"
          tabIndex={0}
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          {/* Flask logo icon */}
          <div className="mb-4" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" className="mx-auto drop-shadow-lg">
              <g>
                <rect width="56" height="56" rx="16" fill="#fff" fillOpacity="0.08"/>
                <path d="M28 12v13.5c0 1.1.9 2 2 2h1.5a2 2 0 012 2V36a7.5 7.5 0 11-15 0V29.5a2 2 0 012-2H26a2 2 0 002-2V12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <ellipse cx="28" cy="40" rx="7.5" ry="3.5" fill="#FCD24F" fillOpacity="0.85"/>
              </g>
            </svg>
          </div>
          {/* GoodIdea logo text */}
          <div className="font-extrabold text-2xl mb-1 text-[#d9d9d9] tracking-wide logo-text" style={{letterSpacing: "0.04em"}}>
            GoodIdea
          </div>
          <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-bold mb-2 text-[#f2f2f2] text-center drop-shadow-lg">
            Welcome aboard!
          </h2>
          <p id="onboarding-desc" className="text-[#d9d9d9] mb-5 text-center text-lg font-medium">
            Here’s how to get started:
          </p>
          <ul className="text-left space-y-4 mb-8 w-full max-w-xs">
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#FCD24F]/20 shadow">
                <MicrophoneIcon className="h-6 w-6 text-[#FCD24F]" aria-hidden="true" />
              </span>
              <span className="font-semibold text-[#FCD24F]">Record</span>
              <span className="text-[#d9d9d9] ml-2">Tap the mic to capture voice notes.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 shadow">
                <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <span className="font-semibold text-white">View</span>
              <span className="text-[#d9d9d9] ml-2">See and organize your notes.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 shadow">
                <ShareIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <span className="font-semibold text-white">Share</span>
              <span className="text-[#d9d9d9] ml-2">Export or share your notes anytime.</span>
            </li>
          </ul>
          <button
            className="mt-2 px-10 py-3 rounded-full bg-[#FCD24F] text-[#1d3263] text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105 hover:bg-[#ffe27a] focus:outline-none focus:ring-4 focus:ring-[#FCD24F]/60 active:scale-98"
            onClick={handleDismissOnboarding}
            autoFocus
            tabIndex={0}
            aria-label="Close onboarding and start using GoodIdea"
          >
            GOT IT!
          </button>
          <div className="mt-6 text-center">
            <span className="text-[#f2f2f2] underline underline-offset-4 decoration-2 decoration-[#f2f2f2] cursor-pointer transition hover:text-[#FCD24F]" tabIndex={0} role="button" aria-label="Learn more about GoodIdea">
              Learn more
            </span>
          </div>
        </div>
      </div>
      <style>
        {`
          .glass-gradient {
            background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);
            backdrop-filter: blur(12px);
          }
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .logo-text {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          }
        `}
      </style>
    </div>
  );

  return (
    <div className="bg-white w-full max-w-full overflow-x-hidden">
      {/* Tailwind UI Hero with SVG background */}
      {!effectiveUser && (
        <>
          <header className="relative overflow-hidden" style={{ background: "linear-gradient(90deg, #311B92 0%, #0D47A1 100%)" }}>
            <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 text-center relative z-10 flex flex-col items-center">
              <div className="mb-10 flex items-center justify-center">
                <img
                  src="/goodideas.png"
                  alt="Good Idea Logo"
                  className="h-[12rem] w-[12rem] sm:h-[16rem] sm:w-[16rem] object-contain"
                  style={{ display: 'inline-block' }}
                />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl font-display tracking-tight leading-tight">
                Turn Your Thoughts Into Startups — In Days, Not Months.
              </h1>
              <p className="mb-10 text-xl sm:text-2xl text-white/90 font-semibold drop-shadow font-sans max-w-2xl mx-auto leading-relaxed">
                Speak your ideas out loud.<br className="hidden sm:inline" /> We’ll transcribe, organize, and tell you if it’s a winner — backed by research.
              </p>
              <Button
                label="SPEAK YOUR IDEA"
                className="px-12 py-5 rounded-3xl text-xl font-extrabold shadow-2xl bg-[#FFD600] text-[#1A237E] tracking-widest transition-all duration-200 hover:bg-[#FFC400] hover:shadow-yellow-400/60 focus-visible:ring-4 focus-visible:ring-[#FFD600] focus-visible:ring-offset-2"
                style={{ boxShadow: '0 6px 32px 0 rgba(255, 214, 0, 0.25)' }}
                onClick={() => {}}
              />
<>
  <AuthButton className="mt-8" />
</>
              <p className="mt-10 text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto drop-shadow font-sans leading-relaxed">
                We turn your spoken thoughts into startup blueprints — and tell you if they’ll fly or flop, based on real market data.
              </p>
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
                    {/* VoiceRecorderCard below Hero */}
                    <div className="w-full flex flex-col items-center">
                      <VoiceRecorderCard />
                      <IdeaValidationFeedback />
                    </div>
                            </>
                          )}
      {effectiveUser && (
        <>
          {showOnboarding && onboardingModal}
          <div className="w-full flex flex-col justify-start items-center px-0 sm:px-8 py-8 bg-gradient-to-br from-sky-50 via-white to-indigo-50 min-h-[50vh] box-border">
            <nav className="w-full max-w-full sm:max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 px-4 sm:px-8 py-6 bg-white/80 rounded-2xl shadow-lg border border-sky-100 backdrop-blur mb-8 box-border"
              style={{ maxWidth: '100vw' }}>
              <div className="flex items-center gap-x-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-sky-700 tracking-tight drop-shadow">
                <img
                  src="/goodideas.png"
                  alt="Good Idea Logo"
                  className="h-8 w-8 md:h-10 md:w-10 object-contain"
                  style={{ display: 'inline-block' }}
                />
                <span className="whitespace-nowrap">GoodIdea</span>
              </div>
              <div className="flex items-center gap-x-4">
                <span className="text-sm font-light text-gray-400">{effectiveUser.email}</span>
                <AuthButton className="ml-2" />
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Modern Feature Card: Speak Your Ideas */}
            <div className="relative flex flex-col items-center bg-gradient-to-br from-yellow-50 via-white to-sky-50 rounded-3xl shadow-xl border border-yellow-100 p-10 sm:p-12 transition hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
              <div className="absolute -top-8 -right-8 opacity-20 group-hover:opacity-30 transition">
                <MicrophoneIcon className="h-28 w-28 text-yellow-300" />
              </div>
              <div className="flex justify-center mb-4 z-10">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-4 shadow-lg">
                  <MicrophoneIcon className="h-10 w-10 text-yellow-500" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-yellow-900 mb-2 text-center leading-tight drop-shadow">Speak Your Ideas</h3>
              <p className="text-lg text-yellow-800 text-center max-w-xs mx-auto leading-snug font-medium z-10">
                Instantly record voice notes and brainstorm out loud with a tap.
              </p>
            </div>
            {/* Modern Feature Card: AI-Powered Validation */}
            <div className="relative flex flex-col items-center bg-gradient-to-br from-indigo-50 via-white to-yellow-50 rounded-3xl shadow-xl border border-indigo-100 p-10 sm:p-12 transition hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
              <div className="absolute -top-8 -left-8 opacity-20 group-hover:opacity-30 transition">
                <DocumentTextIcon className="h-28 w-28 text-indigo-300" />
              </div>
              <div className="flex justify-center mb-4 z-10">
                <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 shadow-lg">
                  <DocumentTextIcon className="h-10 w-10 text-indigo-500" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-indigo-900 mb-2 text-center leading-tight drop-shadow">AI-Powered Validation</h3>
              <p className="text-lg text-indigo-800 text-center max-w-xs mx-auto leading-snug font-medium z-10">
                Get instant feedback and research on your startup ideas, powered by AI.
              </p>
            </div>
            {/* Modern Feature Card: Organize & Export */}
            <div className="relative flex flex-col items-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 rounded-3xl shadow-xl border border-sky-100 p-10 sm:p-12 transition hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
              <div className="absolute -bottom-8 -left-8 opacity-20 group-hover:opacity-30 transition">
                <ShareIcon className="h-28 w-28 text-sky-300" />
              </div>
              <div className="flex justify-center mb-4 z-10">
                <span className="inline-flex items-center justify-center rounded-full bg-sky-100 p-4 shadow-lg">
                  <ShareIcon className="h-10 w-10 text-sky-500" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-sky-900 mb-2 text-center leading-tight drop-shadow">Organize & Export</h3>
              <p className="text-lg text-sky-800 text-center max-w-xs mx-auto leading-snug font-medium z-10">
                Save, review, and export your best ideas anytime with one click.
              </p>
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

      {/* GoodIdea CTA Section */}
      {!effectiveUser && (
        <section
          className="py-20"
          style={{
            background: "linear-gradient(90deg, #311B92 0%, #0D47A1 100%)"
          }}
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Ready to get started?</h2>
            <p className="mb-8 text-lg text-white font-medium drop-shadow">Sign in to record and view your voice notes.</p>
            <AuthButton />
          </div>
        </section>
      )}

      {/* Tailwind UI Footer */}
      <footer
        className="border-t"
        style={{
          background: "linear-gradient(90deg, #311B92 0%, #0D47A1 100%)",
          borderColor: "#FFD600"
        }}
      >
        <div className="max-w-7xl mx-auto py-8 px-4 overflow-hidden sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-white">&copy; 2025 GoodIdea. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-[#81D4FA] hover:underline">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="#FFD600" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="text-[#81D4FA] hover:underline">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="#FFD600" viewBox="0 0 24 24">
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
    if (note) {
      // Generate markdown: title, content, and any relevant metadata
      const title = note.title || note.business_idea?.split('\n')[0] || 'Untitled Idea';
      const content = note.business_idea || '';
      const created = note.created_at ? `*Created: ${new Date(note.created_at).toLocaleString()}*` : '';
      const markdown = `# ${title}\n\n${content}\n\n${created}`.trim();
      navigator.clipboard.writeText(markdown);
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
              <Button
                onClick={handleCopyIdea}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                label="Copy Idea"
                leftIcon="📋"
              />
              <Button
                onClick={handleCopyLink}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                label="Copy Link"
                leftIcon="🔗"
              />
              <Button
                onClick={exportToGoogleDocs}
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                label="Export to Google Docs"
                leftIcon="📄"
              />
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
  const { user, authError, loading } = useAuth();

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

  const signOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await new Promise(resolve => {
        setSession(null);
        setUser(null);
        resolve();
      });
      
      window.location.href = '/';
    } catch (err) {
      console.error('SignOut failed:', err);
      alert('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Dashboard 
            notes={notes} 
            setNotes={setNotes} 
            user={user} 
          />
        } 
      />
      <Route 
        path="/idea/:id" 
        element={
          <FullIdeaPage 
            user={user} 
          />
        } 
      />
    </Routes>
  );
}
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
