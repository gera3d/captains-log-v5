import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Routes, Route } from 'react-router-dom';
import NotesList from './components/NotesList';
import VoiceRecorder from './components/VoiceRecorder';
import { CheckIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon } from '@heroicons/react/24/outline';

function Dashboard({ notes, setNotes, user, signInWithGoogle, signOut }) {
  return (
    <div className="bg-white">
      {/* Tailwind UI Hero with SVG background */}
      {!user && (
        <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">Capture & Transcribe Voice Notes</h1>
            <p className="mt-6 text-lg text-indigo-100">Record your thoughts, save them securely, and share effortlessly.</p>
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={signInWithGoogle} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">Sign In</button>
            </div>
          </div>
          <svg className="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-30" width="1000" height="1000" fill="none" viewBox="0 0 1000 1000">
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
      {user && (
        <div className="w-full flex flex-col justify-start items-center px-6 py-10 bg-gradient-to-b from-sky-100 to-white">
          <div className="w-full max-w-6xl flex justify-between items-center mb-10">
            <div className="flex items-center space-x-3 text-3xl font-bold text-sky-700">
              <span>🧭</span>
              <span>Captain's Log</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-600">{user.email}</span>
              <button onClick={signOut} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Sign Out</button>
            </div>
          </div>
          <div className="w-full max-w-3xl">
            <VoiceRecorder />
          </div>
        </div>
      )}

      {/* Tailwind UI Features with icons */}
      {!user && (
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MicrophoneIcon className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Fast Recording</h3>
              <p className="mt-2 text-base text-gray-500">Quickly capture your thoughts with one tap.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Accurate Transcripts</h3>
              <p className="mt-2 text-base text-gray-500">Get high-quality transcriptions of your voice notes.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ShareIcon className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Easy Sharing</h3>
              <p className="mt-2 text-base text-gray-500">Share your notes with friends or colleagues instantly.</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Tailwind UI Content Section */}
      {user && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="rounded-lg shadow p-8 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Your Voice Notes</h2>
              <NotesList notes={notes} setNotes={setNotes} />
            </div>
          </div>
        </section>
      )}

      {/* Tailwind UI CTA Section */}
      {!user && (
        <section className="relative bg-indigo-700 py-20 overflow-hidden">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-extrabold text-white">Please Sign In</h2>
            <p className="mt-4 text-lg text-indigo-100">Sign in to record and view your voice notes.</p>
            <button onClick={signInWithGoogle} className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">Sign In with Google</button>
          </div>
          <svg className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-30" width="1000" height="1000" fill="none" viewBox="0 0 1000 1000">
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

  useEffect(() => {
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
          console.log('New note received:', payload.new);
          setNotes((prev) => {
            const filtered = prev.filter(note => !(note.id && note.id.toString().startsWith('temp-')));
            return [payload.new, ...filtered];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard notes={notes} setNotes={setNotes} user={user} signInWithGoogle={signInWithGoogle} signOut={signOut} />} />
      <Route path="/idea/:id" element={<FullIdeaPage user={user} session={session} />} />
    </Routes>
  );
}

export default App;
