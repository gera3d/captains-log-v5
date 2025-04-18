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
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
  /*
    TODO[MEDIUM]: Dashboard Onboarding
    - FEATURE: Add user onboarding tips for first-time users.
    - UI: Consider a dismissible banner or modal for onboarding.
  */

function LandingPage() {
  return (
    <div className="bg-gradient-primary text-primary-text">
      <header className="container flex justify-between items-center py-6">
        <img src="/goodideas.png" alt="GoodIdea Logo" className="h-8" />
        <AuthButton />
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-16 flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="lg:w-1/2">
          <h1 className="font-display text-h1 mb-4">Turn Your Thoughts Into Startups — In Days, Not Months.</h1>
          <p className="text-lg mb-6">Speak your ideas out loud. We'll transcribe, organize, and tell you if it's a winner — backed by research.</p>
          <div className="flex space-x-4">
            <AuthButton />
            <button className="bg-secondary text-primary-text rounded-lg px-6 py-3 hover:bg-opacity-90">Learn More</button>
          </div>
        </div>
        <div className="lg:w-1/2">
          <img src="/goodideas.png" alt="Illustration of idea workflow" className="w-full" />
        </div>
      </main>
      {/* Features section */}
      <FeaturesSection />
      {/* Testimonials section */}
      <TestimonialsSection />
    </div>
  );
}

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

  // Handle new note saved from VoiceRecorder
  const onNoteSaved = (newNote) => {
    setNotes(prev => [newNote, ...prev]);
  };

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
    <div className="min-h-screen bg-slate-50">
      {/* Refined header with larger logo and subtle controls */}
      <header className="relative z-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#5f4def] to-[#6755f5]"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_60%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Larger, more prominent logo */}
            <div className="flex items-center">
              <img
                src="/goodideas.png"
                alt="GoodIdea Logo"
                className="h-12 w-auto drop-shadow-sm"
              />
            </div>
            
            {/* User info and sign out for logged-in users */}
            {effectiveUser && (
              <div className="flex items-center space-x-4">
                <div className="text-white/80 text-sm flex items-center">
                  <svg className="h-3.5 w-3.5 mr-1.5 text-white/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{effectiveUser.email}</span>
                </div>
                
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 text-xs font-medium py-1.5 px-3.5 rounded-full transition-colors border border-white/10"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {effectiveUser && (
        <>
          {showOnboarding && onboardingModal}
          
          {/* Content area with soft gradient background */}
          <main className="relative pt-10 pb-16 bg-gradient-to-b from-slate-100 to-white min-h-[calc(100vh-5rem)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Voice Recorder Card at the top */}
              <div className="mb-16">
                <VoiceRecorderCard onNoteSaved={onNoteSaved} />
              </div>
              
              {/* Notes List Section */}
              <section>
                <NotesList notes={notes} setNotes={setNotes} />
              </section>
            </div>
          </main>
        </>
      )}

      {/* Landing content for non-logged in users */}
      {!effectiveUser && <LandingPage />}

      {/* Simple, refined footer */}
      <footer className="bg-slate-900 text-white py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} GoodIdea. All rights reserved.</p>
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
      if (error) {
        console.error('Fetch note error:', error);
        console.error('Full error object:', error); // Log the full error object
      }
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

  const copyIdea = async () => {
    if (note) {
      // Generate markdown: title, content, and any relevant metadata
      const title = note.title || (note.business_idea?.split('\n')[0]) || 'Untitled Idea';
      const description = note.description ? `\n\n${note.description}` : '';
      const content = note.business_idea || '';
      const created = note.created_at ? `\n\n*Created: ${new Date(note.created_at).toLocaleString()}*` : '';
      const markdown = `# ${title}${description}\n\n${content}${created}`.trim();
      try {
        await navigator.clipboard.writeText(markdown);
        console.log("Markdown copied to clipboard:", markdown);
      } catch (err) {
        console.error("Failed to copy markdown:", err);
        alert("Failed to copy markdown. Please check your browser permissions.");
      }
    } else {
      console.warn("No note data to copy as markdown.");
      alert("No idea loaded to copy.");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log("Link copied to clipboard:", window.location.href);
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link. Please check your browser permissions.");
    }
  };

  const [copied, setCopied] = useState('');

  const handleCopyIdea = async () => {
    await copyIdea();
    setCopied('idea');
    setTimeout(() => setCopied(''), 1500);
  };

  const handleCopyLink = async () => {
    await copyLink();
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
    // Apply consistent background gradient
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="bg-white shadow-xl rounded-3xl p-10 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Title removed as requested */}
            <div
              className="flex items-center gap-4 bg-sky-50/80 border border-sky-100 rounded-xl px-4 py-3 shadow-inner relative"
              role="group"
              aria-label="Idea actions"
            >
              {user ? (
                <>
                  <Button
                    onClick={handleCopyIdea}
                    className="!rounded-lg !bg-indigo-600 !px-5 !py-3 !text-base !font-bold !text-white hover:!bg-indigo-700 focus-visible:!ring-2 focus-visible:!ring-indigo-400"
                    label="Copy Markdown"
                    leftIcon={<DocumentTextIcon className="h-6 w-6" aria-hidden="true" />}
                    ariaLabel="Copy idea as Markdown"
                    title="Copy a Markdown version of this idea"
                  />
                  <Button
                    onClick={handleCopyLink}
                    className="!rounded-lg !bg-green-600 !px-5 !py-3 !text-base !font-bold !text-white hover:!bg-green-700 focus-visible:!ring-2 focus-visible:!ring-green-400"
                    label="Share Idea"
                    leftIcon={<ShareIcon className="h-6 w-6" aria-hidden="true" />}
                    ariaLabel="Share public link to this idea"
                    title="Copy a public link to this idea"
                  />
                  <div className="h-8 w-px bg-sky-200 mx-2 hidden sm:block" aria-hidden="true"></div>
                  <div className="relative group">
                    <Button
                      disabled
                      className="!rounded-lg !bg-gray-200 !text-gray-400 !px-5 !py-3 !text-base !font-bold cursor-not-allowed"
                      label="More Actions"
                      leftIcon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      }
                      ariaLabel="More actions coming soon"
                      title="More actions coming soon"
                    />
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block pointer-events-none">
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-50 cursor-not-allowed text-left rounded-lg"
                        disabled
                        tabIndex={-1}
                        aria-label="Export to Google Docs (coming soon)"
                      >
                        <span>
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7L15 2.586A2 2 0 0 0 13.586 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z" />
                          </svg>
                        </span>
                        <span>Export to Google Docs</span>
                        <span className="ml-auto text-xs italic">(coming soon)</span>
                      </button>
                      {/* Future actions go here */}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    disabled
                    className="!rounded-lg !bg-indigo-100 !px-5 !py-3 !text-base !font-bold !text-gray-400 cursor-not-allowed"
                    label="Copy Markdown"
                    leftIcon={<DocumentTextIcon className="h-6 w-6" aria-hidden="true" />}
                    ariaLabel="Copy idea as Markdown (login required)"
                    title="Sign in to copy this idea"
                  />
                  <Button
                    disabled
                    className="!rounded-lg !bg-green-100 !px-5 !py-3 !text-base !font-bold !text-gray-400 cursor-not-allowed"
                    label="Share Idea"
                    leftIcon={<ShareIcon className="h-6 w-6" aria-hidden="true" />}
                    ariaLabel="Share public link to this idea (login required)"
                    title="Sign in to share this idea"
                  />
                  <div className="h-8 w-px bg-sky-200 mx-2 hidden sm:block" aria-hidden="true"></div>
                  <div className="relative group">
                    <Button
                      disabled
                      className="!rounded-lg !bg-gray-200 !text-gray-400 !px-5 !py-3 !text-base !font-bold cursor-not-allowed"
                      label="More Actions"
                      leftIcon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      }
                      ariaLabel="More actions coming soon"
                      title="More actions coming soon"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Show login required message for unauthenticated users */}
          {!user && (
            <div className="mb-6 text-center text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-semibold">
              Sign in to copy, share, or export this idea.
            </div>
          )}
          {/* Toast overlay for copy feedback */}
          {copied && user && (
            <div
              className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white font-bold px-6 py-3 rounded-full shadow-lg animate-fade-in-up"
              role="status"
              aria-live="polite"
            >
              {copied === 'idea' ? 'Markdown copied!' : 'Link copied!'}
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
  const [session, setSession] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

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
      if (error) {
        console.error('Fetch notes error:', error);
        console.error('Full error object:', error); // Log the full error object
      } else {
        setNotes(data);
      }
    };
    console.warn('No notes loaded.');

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

  // Sign out function
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
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Dashboard notes={notes} setNotes={setNotes} user={user} />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/idea/:id"
          element={<FullIdeaPage user={user} session={session} />}
        />
      </Routes>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
