/*
  ROOT-TODO[HIGH]: App Structure & Release
  - Main entry point for Captain's Log app.
  - Keep this file organized and maintain top-level app logic only.
  - REVIEW: Review all feature integrations before major releases.
  - FEATURE: Ensure all new features are registered here.
*/
// TODO[progress-md][P1][App] See progress.md for all open UI polish, loading, error, and browser test tasks

import { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { supabase } from './supabaseClient';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import NotesList from './components/NotesList';
import VoiceRecorder from './components/VoiceRecorder';
import VoiceRecorderCard from './components/VoiceRecorderCard';
import { CheckIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon, RocketLaunchIcon, SparklesIcon, BoltIcon, CheckBadgeIcon, ShieldCheckIcon, ArrowRightIcon, ArrowPathIcon, LightBulbIcon, DocumentCheckIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GenerationProvider, useGeneration } from './contexts/GenerationContext';
import GenerationProgressHUD from './components/GenerationProgressHUD';
import AuthButton from './components/AuthButton';
import AuthModal, { AuthCard } from './components/AuthModal';
import FeaturesSection from './components/FeaturesSection';
import RoadmapSection from './components/RoadmapSection'; // Import the RoadmapSection
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'react-router-dom';
import PersonaSelector from './components/PersonaSelector'; // Import PersonaSelector
import IdeaMetricsDashboard from './components/IdeaMetricsDashboard';
import IntegrationsModal from './components/IntegrationsModal';
import { extractTitle, extractSummary } from './utils/extractTitle';
import { parseIdeaReportSummary } from './utils/parseIdeaReport';
import { ideaMarkdownComponents } from './utils/ideaMarkdownComponents';
import VentureScorecard from './components/VentureScorecard';
import CommunitySignals from './components/CommunitySignals';
import BuilderPromptKit from './components/BuilderPromptKit';
import VentureBentoCockpit from './components/VentureBentoCockpit';
import DomainBlueprintShowcase from './components/DomainBlueprintShowcase';

/*
  TODO[MEDIUM]: Dashboard Onboarding
  - FEATURE: Add user onboarding tips for first-time users.
  - UI: Consider a dismissible banner or modal for onboarding.
*/

function CTASection({ onOpenAuth }) {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-white/10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-4">
          Start Today
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight mb-4">
          Ready to Turn Your Voice Into Your Next Venture?
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Stop letting your best startup ideas get lost in note apps. Speak them out loud, validate market demand, and launch faster.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <RocketLaunchIcon className="w-5 h-5 text-slate-950" />
            <span>Create Your Free Account</span>
          </button>
          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white font-medium text-base rounded-xl px-7 py-4 transition border border-white/15 cursor-pointer backdrop-blur-sm"
          >
            Sign In with Existing Account
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          No credit card required • 100% free starter tier • Instant access
        </p>
      </div>
    </section>
  );
}

function LandingPage() {
  const { login, loginWithGitHub } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col selection:bg-amber-400 selection:text-slate-900 relative overflow-x-hidden font-sans">
      {/* Top Ambient Glows */}
      <div className="absolute top-[-100px] left-1/4 w-[650px] h-[500px] bg-indigo-600/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-[200px] right-10 w-[550px] h-[450px] bg-blue-500/15 blur-[160px] pointer-events-none rounded-full" />

      {/* Top Frosted Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/goodideas.png" alt="GoodIdea Logo" className="h-8 sm:h-9 w-auto drop-shadow-md" />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-amber-300 transition-colors">How It Works</a>
            <a href="#roadmap" className="hover:text-amber-300 transition-colors">Roadmap</a>
            <a href="#faq" className="hover:text-amber-300 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAuthModalMode('signin'); setShowAuthModal(true); }}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition border border-white/15 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('signup'); setShowAuthModal(true); }}
              className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </nav>

      {/* Main Hero with Restored Visual Harmony */}
      <main className="flex-1 flex items-center py-16 lg:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT SIDE: Original Glowing 3D Voice Recorder Card */}
          <div className="lg:w-1/2 lg:order-1 order-2 relative w-full flex justify-center">
            <div className="transform transition-all hover:scale-[1.02] relative z-10 w-full max-w-md">
              {/* Glow effect */}
              <div className="absolute -inset-10 bg-blue-500/25 blur-3xl rounded-full pointer-events-none"></div>
              
              {/* Voice recorder component */}
              <VoiceRecorderCard 
                onNoteSaved={() => {}} 
                className="relative z-20 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] border border-white/15 bg-slate-900/90 backdrop-blur-xl" 
                demoMode={true}
                hideGoogleSignIn={true}
              />
              
              {/* Enhanced decorative effects */}
              <div className="absolute -bottom-16 left-1/2 transform translate-y-1/2 -translate-x-1/2 w-[120%] h-32 bg-gradient-to-b from-transparent to-blue-500/20 blur-2xl rounded-full z-10 pointer-events-none"></div>
            </div>
          </div>
          
          {/* RIGHT SIDE: Logo and Content */}
          <div className="lg:w-1/2 lg:order-2 order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Gen Voice Ideation AI</span>
            </div>

            {/* Large original GoodIdea logo image */}
            <img src="/goodideas.png" alt="GoodIdea Logo" className="h-24 sm:h-28 w-auto mb-6 drop-shadow-2xl" />
            
            {/* Text content */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 text-white leading-[1.12] tracking-tight">
              Turn Your Thoughts Into Startups — <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">In Days, Not Months.</span>
            </h1>
            <p className="text-base sm:text-lg mb-8 text-slate-300 max-w-xl leading-relaxed">
              Speak your ideas out loud. We'll transcribe, structure, and benchmark them against market data — so you know what's worth building before writing code.
            </p>
            
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
              <button
                onClick={() => { setAuthModalMode('signin'); setShowAuthModal(true); }}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2.5"
              >
                <RocketLaunchIcon className="w-5 h-5 text-slate-950" />
                <span>Start Validating Free</span>
              </button>
              <button
                className="bg-white/10 hover:bg-white/15 text-white font-medium text-sm sm:text-base rounded-xl px-6 py-3.5 transition border border-white/15 cursor-pointer backdrop-blur-sm"
                onClick={() => {
                  const section = document.getElementById('how-it-works');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                How It Works
              </button>
            </div>

            {/* Quick OAuth Row */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Or instant sign in:</span>
              <button
                onClick={() => login()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer border border-white/15"
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>
              <button
                onClick={() => loginWithGitHub()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer border border-white/15"
                title="Sign in with GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Trust Reassurance Strip */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-center lg:justify-start items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <BoltIcon className="w-4 h-4 text-amber-400" />
                <span>Instant Whisper AI Transcription</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                <span>Objective Viability Index</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Encrypted & Private</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Features, Roadmap, FAQ, Final CTA & Footer */}
      <div>
        <FeaturesSection />
        <RoadmapSection />
        <FAQSection />
        <CTASection onOpenAuth={(mode) => { setAuthModalMode(mode); setShowAuthModal(true); }} />
        <Footer />
      </div>

      {/* High-Polish Auth Modal for Username/Password and Registration */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

function Dashboard({ notes, setNotes, user, initialOpenIntegrations = false, loadingNotes = false }) {
  const navigate = useNavigate();
  const { runGeneration } = useGeneration();
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(initialOpenIntegrations);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeIdeas, setActiveIdeas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(() => {
    // Try to load saved persona from localStorage
    const savedPersona = localStorage.getItem('userPersona');
    return savedPersona || "Innovator";
  });
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [showCustomPersonaModal, setShowCustomPersonaModal] = useState(false);
  const [customPersonaName, setCustomPersonaName] = useState('');
  const [customPersonaGoals, setCustomPersonaGoals] = useState('');
  const [customPersonaIcon, setCustomPersonaIcon] = useState('🔮');

  // Text Monologue & Fast Ingestion State
  const [captureTab, setCaptureTab] = useState('voice'); // 'voice' or 'text'
  const [monologueText, setMonologueText] = useState('');
  const [monologueTitle, setMonologueTitle] = useState('');
  const [isSubmittingMonologue, setIsSubmittingMonologue] = useState(false);
  const [monologueStatus, setMonologueStatus] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Load custom personas from localStorage
  const [customPersonas, setCustomPersonas] = useState(() => {
    const saved = localStorage.getItem('customPersonas');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save custom personas to localStorage when they change
  useEffect(() => {
    localStorage.setItem('customPersonas', JSON.stringify(customPersonas));
  }, [customPersonas]);

  // Enhanced personas with descriptions and goals
  const personas = [
    { 
      id: "innovator", 
      label: "Innovator", 
      icon: "💡",
      description: "Focus on generating novel ideas and creative solutions to problems."
    },
    { 
      id: "developer", 
      label: "Developer", 
      icon: "💻",
      description: "Prioritize technical feasibility, implementation details, and code architecture."
    },
    { 
      id: "marketer", 
      label: "Marketer", 
      icon: "📊",
      description: "Concentrate on market fit, customer acquisition, and promotional strategies."
    },
    { 
      id: "designer", 
      label: "Designer", 
      icon: "🎨",
      description: "Focus on user experience, visual appeal, and intuitive interactions."
    },
    { 
      id: "entrepreneur", 
      label: "Entrepreneur", 
      icon: "🚀",
      description: "Emphasize business viability, growth potential, and scaling strategies."
    },
    { 
      id: "product-manager", 
      label: "Product Manager", 
      icon: "📱",
      description: "Balance features, timeline, and resources to deliver maximum value."
    },
    { 
      id: "investor", 
      label: "Investor", 
      icon: "💰",
      description: "Evaluate ideas based on ROI potential, market trends, and financial viability."
    },
    ...customPersonas
  ];

  // Save persona selection to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userPersona', selectedPersona);
  }, [selectedPersona]);

  // Dev user check
  const isDevUser = user && user.id === "00000000-0000-0000-0000-000000000000";
  const devMockUser = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "devuser@example.com",
    user_metadata: { full_name: "Dev User" }
  };
  const effectiveUser = isDevUser ? devMockUser : user;

  // Format date to be more compact
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const options = { month: 'short', day: 'numeric' };
      return d.toLocaleDateString(undefined, options);
    } catch {
      return '';
    }
  };

  // Handle idea generation completion - promote to active idea
  const handleIdeaGenerated = async (noteId) => {
    // Find the updated note in our notes list
    const updatedNote = notes.find(note => note.id === noteId);
    // Don't promote archived notes to active ideas
    if (!updatedNote || !updatedNote.business_idea || updatedNote.archived) return;
    
    try {
      // Update the note in the database to be featured/active
      const { data, error } = await supabase
        .from('voice_notes')
        .update({ is_featured: true, status: 'active' })
        .eq('id', noteId);
        
      if (error) throw error;
      
      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === noteId ? {...note, status: 'active', is_featured: true} : note
      ));
      
      // Update active ideas list
      setActiveIdeas(prev => {
        if (prev.some(idea => idea.id === noteId)) {
          // Already in active ideas, just update it
          return prev.map(idea => 
            idea.id === noteId ? {...updatedNote, status: 'active', is_featured: true} : idea
          );
        } else {
          // Add to active ideas
          return [{...updatedNote, status: 'active', is_featured: true}, ...prev];
        }
      });
      
      console.log(`Note ${noteId} promoted to active idea after generation`);
    } catch (err) {
      console.error("Error promoting generated idea:", err);
    }
  };

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

  // Improved active ideas selection logic - show all ideas with content except archived ones, sorted strictly newest first
  useEffect(() => {
    const isArchived = (note) => note.archived === true || note.archived === 'true' || note.status === 'archived';

    const getNoteTimestamp = (item) => {
      if (!item) return 0;
      const d = item.created_at || item.createdAt || item.updated_at || item.updatedAt;
      if (!d) return 0;
      const t = new Date(d).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    if (notes && notes.length > 0) {
      // Select all non-archived notes with business_idea content, sorted strictly newest first
      const contentNotes = notes
        .filter(note => 
          note.business_idea && 
          note.business_idea.trim().length > 0 && 
          !isArchived(note)
        )
        .sort((a, b) => getNoteTimestamp(b) - getNoteTimestamp(a));

      setActiveIdeas(contentNotes);
      
      console.log(`Active ideas updated: ${contentNotes.length} ideas found`);
    } else {
      setActiveIdeas([]);
    }
  }, [notes]);

  // Listen for idea generation events
  useEffect(() => {
    // Set up listener for custom events when ideas are generated
    const handleIdeaGenerationComplete = (event) => {
      if (event.detail && event.detail.noteId) {
        handleIdeaGenerated(event.detail.noteId);
      }
    };
    
    window.addEventListener('ideaGenerated', handleIdeaGenerationComplete);
    
    return () => {
      window.removeEventListener('ideaGenerated', handleIdeaGenerationComplete);
    };
  }, [notes]); // Depend on notes so we always have latest state

  const handleDismissOnboarding = () => {
    localStorage.setItem('dashboardOnboardingSeen', 'true');
    setShowOnboarding(false);
  };

  const onNoteSaved = (newNote) => {
    const markedNote = newNote.business_idea 
      ? { ...newNote, is_featured: true } 
      : newNote;
    
    setNotes(prev => [markedNote, ...prev]);
    
    if (newNote.business_idea) {
      setActiveIdeas(prev => {
        const updated = [markedNote, ...prev];
        return updated;
      });
    }
  };

  const handleMonologueSubmit = async (synthesizeIdea = false) => {
    if (!monologueText.trim()) {
      setMonologueStatus({ type: 'error', message: 'Please enter your monologue or idea text first.' });
      return;
    }

    setIsSubmittingMonologue(true);
    setMonologueStatus(null);

    const submitAction = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/ideas/ingest', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: monologueText.trim(),
          title: monologueTitle.trim() || undefined,
          raw: !synthesizeIdea,
          synthesize: synthesizeIdea,
          source: 'dashboard_text_monologue'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const createdIdea = await res.json();
      
      const newFormattedNote = {
        id: createdIdea.id,
        user_id: createdIdea.userId,
        title: createdIdea.title,
        summary: createdIdea.summary,
        transcript: createdIdea.transcript || monologueText.trim(),
        business_idea: createdIdea.businessIdeaMarkdown || '',
        tags: createdIdea.tags || ['monologue'],
        status: synthesizeIdea ? 'active' : 'raw',
        is_featured: synthesizeIdea,
        created_at: createdIdea.createdAt || new Date().toISOString()
      };

      onNoteSaved(newFormattedNote);
      setMonologueText('');
      setMonologueTitle('');
      setMonologueStatus({
        type: 'success',
        message: synthesizeIdea
          ? '🎉 Idea captured and structured!'
          : '✅ Raw monologue captured! You can generate a business idea from it whenever you choose.'
      });

      return {
        id: createdIdea.id,
        title: createdIdea.title,
        summary: createdIdea.summary,
        url: `/idea/${createdIdea.id}`
      };
    };

    try {
      if (synthesizeIdea) {
        await runGeneration({
          title: monologueTitle.trim() || monologueText.trim().slice(0, 35) + '...',
          type: 'ingest',
          execute: submitAction
        });
      } else {
        await submitAction();
      }
    } catch (err) {
      console.error('Text monologue ingestion failed:', err);
      setMonologueStatus({ type: 'error', message: err.message || 'Failed to capture monologue.' });
    } finally {
      setIsSubmittingMonologue(false);
    }
  };

  const promoteToActiveIdea = async (noteId) => {
    const noteToPromote = notes.find(note => note.id === noteId);
    if (!noteToPromote) return;
    
    if (String(noteId).startsWith('idea_')) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch(`/api/v1/ideas/${noteId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ is_featured: true, status: 'active' })
        });
      } catch (err) {
        console.error("Error promoting ambient idea:", err);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('voice_notes')
          .update({ is_featured: true, status: 'active' })
          .eq('id', noteId);
          
        if (error) throw error;
      } catch (err) {
        console.error("Error promoting idea:", err);
      }
    }
    
    setNotes(prev => prev.map(note => 
      note.id === noteId ? {...note, status: 'active', is_featured: true} : note
    ));
    
    setActiveIdeas(prev => {
      if (prev.some(idea => idea.id === noteId)) return prev;
      
      const updatedNote = {...noteToPromote, status: 'active', is_featured: true};
      return [updatedNote, ...prev];
    });
  };

  const addCustomPersona = () => {
    if (customPersonaName.trim()) {
      const newPersona = {
        id: `custom-${Date.now()}`,
        label: customPersonaName.trim(),
        icon: customPersonaIcon,
        description: customPersonaGoals.trim() || 'Custom persona',
        isCustom: true
      };
      
      setCustomPersonas([...customPersonas, newPersona]);
      setSelectedPersona(newPersona.label);
      setShowCustomPersonaModal(false);
      setCustomPersonaName('');
      setCustomPersonaGoals('');
      setCustomPersonaIcon('🔮');
    }
  };

  const deleteCustomPersona = (id) => {
    setCustomPersonas(customPersonas.filter(p => p.id !== id));
    // If the deleted persona was selected, revert to Innovator
    if (customPersonas.find(p => p.id === id)?.label === selectedPersona) {
      setSelectedPersona('Innovator');
    }
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
          <div className="mb-4" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" className="mx-auto drop-shadow-lg">
              <g>
                <rect width="56" height="56" rx="16" fill="#fff" fillOpacity="0.08"/>
                <path d="M28 12v13.5c0 1.1.9 2 2 2h1.5a2 2 0 012 2V36a7.5 7.5 0 11-15 0V29.5a2 2 0 012-2H26a2 2 0 002-2V12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <ellipse cx="28" cy="40" rx="7.5" ry="3.5" fill="#FCD24F" fillOpacity="0.85"/>
              </g>
            </svg>
          </div>
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
      <header className="relative z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d1b8c] to-[#1355b8]"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_60%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center group transition">
              <img 
                src="/goodideas.png" 
                alt="GoodIdea Logo" 
                className="h-8 sm:h-9 w-auto drop-shadow-md transition-transform group-hover:scale-[1.02]" 
              />
            </Link>
            
            {effectiveUser && (
              <div className="flex items-center space-x-4">
                <div className="relative flex items-center text-white/90 text-sm">
                  <svg className="h-3.5 w-3.5 mr-1.5 text-white/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {effectiveUser.user_metadata?.username || 
                     (effectiveUser.user_metadata?.full_name 
                      ? effectiveUser.user_metadata.full_name.split(' ')[0] 
                      : effectiveUser.email.split('@')[0])}
                  </span>
                  <span className="mx-1">the</span>
                  
                  {/* Only the persona with its icon in the dropdown button */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                      className="flex items-center text-white font-medium rounded-full px-3 py-1 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10"
                      aria-haspopup="listbox"
                      aria-expanded={showPersonaDropdown}
                    >
                      <span className="mr-1">
                        {personas.find(p => p.label === selectedPersona)?.icon || '💡'}
                      </span>
                      <span className="font-semibold">{selectedPersona}</span>
                      <svg 
                        className={`ml-1.5 h-4 w-4 transition-transform duration-300 ${showPersonaDropdown ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown content remains the same */}
                    {showPersonaDropdown && (
                      <div 
                        className="absolute mt-2 w-64 right-0 origin-top-right animate-dropdown z-30"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                          <div className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                            Choose Your Persona
                          </div>
                          <div 
                            className="max-h-80 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                            onWheel={(e) => e.stopPropagation()}
                          >
                            {personas.map((persona) => (
                              <div key={persona.id} className="relative">
                                <button
                                  className={`flex w-full items-center px-4 py-3.5 text-sm hover:bg-indigo-50 transition-colors ${
                                    persona.label === selectedPersona 
                                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                      : 'bg-white text-gray-700'
                                  }`}
                                  onClick={() => {
                                    setSelectedPersona(persona.label);
                                    setShowPersonaDropdown(false);
                                  }}
                                  onMouseEnter={(e) => {
                                    // Create tooltip element
                                    const tooltip = document.getElementById('persona-tooltip');
                                    if (tooltip) {
                                      // Position tooltip relative to button
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      tooltip.style.top = `${rect.top + window.scrollY + rect.height/2}px`;
                                      tooltip.style.left = `${rect.right + window.scrollX + 10}px`;
                                      
                                      // Set content
                                      tooltip.innerHTML = `
                                        <div class="arrow"></div>
                                        <p class="font-medium mb-1">${persona.label} Goals:</p>
                                        <p class="text-xs text-gray-300">${persona.description}</p>
                                      `;
                                      
                                      // Show tooltip
                                      tooltip.classList.remove('hidden');
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    // Hide tooltip
                                    const tooltip = document.getElementById('persona-tooltip');
                                    if (tooltip) {
                                      tooltip.classList.add('hidden');
                                    }
                                  }}
                                >
                                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-lg mr-3">
                                    {persona.icon}
                                  </span>
                                  <span className="flex-grow text-left">{persona.label}</span>
                                  
                                  {persona.label === selectedPersona && (
                                    <svg className="h-5 w-5 text-indigo-500 ml-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  
                                  {/* Delete button for custom personas */}
                                  {persona.isCustom && (
                                    <button 
                                      className="absolute right-2 top-2 text-gray-400 hover:text-red-500 p-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCustomPersona(persona.id);
                                      }}
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Create Your Own Persona Button */}
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <button
                              className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                              onClick={() => {
                                setShowCustomPersonaModal(true);
                                setShowPersonaDropdown(false);
                              }}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Create Your Own Persona
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Integrations & Harness API Modal Button */}
                <button 
                  onClick={() => setShowIntegrationsModal(true)}
                  className="flex items-center text-white font-medium rounded-full px-3 py-1.5 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-xs shadow-sm cursor-pointer hover:border-amber-400/40"
                  title="Harness Integrations & API Keys"
                >
                  <span className="mr-1 text-amber-300 font-bold">⚡</span>
                  <span className="font-semibold">Integrations</span>
                </button>

                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-medium py-1.5 px-3.5 rounded-full transition-colors border border-indigo-500"
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
          <IntegrationsModal
            isOpen={showIntegrationsModal}
            onClose={() => setShowIntegrationsModal(false)}
            onIdeaCreated={(newIdea) => setNotes(prev => [newIdea, ...prev])}
          />
          
          <main className="relative pt-10 pb-16 bg-gradient-to-b from-slate-100 to-white min-h-[calc(100vh-5rem)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-8 mb-16">
                {/* First container - Capture Your Idea (Voice or Text) */}
                <div className="lg:w-1/2 order-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Capture Your Idea</h2>
                    
                    {/* Clean Pill Segmented Tabs matching toolbar palette */}
                    <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-full shadow-inner">
                      <button
                        type="button"
                        onClick={() => setCaptureTab('voice')}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          captureTab === 'voice'
                            ? 'bg-indigo-600 text-white shadow-sm font-bold border border-indigo-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                        }`}
                        aria-pressed={captureTab === 'voice'}
                      >
                        <MicrophoneIcon className={`w-3.5 h-3.5 mr-1.5 ${captureTab === 'voice' ? 'text-white' : 'text-slate-500'}`} />
                        <span>Voice Memo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCaptureTab('text')}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          captureTab === 'text'
                            ? 'bg-indigo-600 text-white shadow-sm font-bold border border-indigo-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                        }`}
                        aria-pressed={captureTab === 'text'}
                      >
                        <DocumentTextIcon className={`w-3.5 h-3.5 mr-1.5 ${captureTab === 'text' ? 'text-white' : 'text-slate-500'}`} />
                        <span>Text Monologue</span>
                      </button>
                    </div>
                  </div>

                  <div className="h-[600px]">
                    {captureTab === 'voice' ? (
                      <VoiceRecorderCard 
                        onNoteSaved={onNoteSaved} 
                        className="shadow-xl border border-indigo-100 h-full !mt-0 !mb-0" 
                      />
                    ) : (
                      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 h-full flex flex-col justify-between">
                        <div className="flex flex-col flex-1 min-h-0">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                                <span>Text Monologue</span>
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Type or paste your raw monologue, transcript, or startup brainstorm.
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Instant Capture
                            </span>
                          </div>

                          {monologueStatus && (
                            <div className={`mb-3 p-3 rounded-xl text-xs font-semibold border flex items-center justify-between ${
                              monologueStatus.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              <span>{monologueStatus.message}</span>
                              <button 
                                onClick={() => setMonologueStatus(null)}
                                className="text-slate-400 hover:text-slate-600 ml-2 text-base leading-none cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          <div className="mb-3">
                            <input
                              type="text"
                              placeholder="Idea Title (Optional, e.g. Shorts Story Builder)"
                              value={monologueTitle}
                              onChange={(e) => setMonologueTitle(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                              disabled={isSubmittingMonologue}
                            />
                          </div>

                          <div className="flex-1 min-h-0 flex flex-col mb-3">
                            <textarea
                              placeholder="Dump your stream of consciousness, transcript, or startup thoughts here...

e.g. In this idea, I want to explore how to use shorts as a way of telling an interesting story, and you build that story in a story builder..."
                              value={monologueText}
                              onChange={(e) => setMonologueText(e.target.value)}
                              disabled={isSubmittingMonologue}
                              className="w-full flex-1 p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none font-sans leading-relaxed transition"
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-auto">
                          <div className="flex flex-col sm:flex-row items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleMonologueSubmit(false)}
                              disabled={isSubmittingMonologue || !monologueText.trim()}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
                            >
                              <DocumentTextIcon className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                              <span>Save Transcript</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMonologueSubmit(true)}
                              disabled={isSubmittingMonologue || !monologueText.trim()}
                              className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full sm:flex-1"
                            >
                              {isSubmittingMonologue ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Generating Idea...</span>
                                </>
                              ) : (
                                <>
                                  <SparklesIcon className="w-3.5 h-3.5 mr-1.5 text-white" />
                                  <span>Generate Business Idea</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2 text-center">
                            You can also ingest ambiently from your IDE using the Antigravity skill or curl.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Second container - Active Ideas */}
                <div className="lg:w-1/2 order-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Active Ideas</h2>
                    <button 
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition shadow-sm cursor-pointer"
                      onClick={() => document.getElementById('all-notes-section').scrollIntoView({ behavior: 'smooth' })}
                    >
                      View All Notes
                    </button>
                  </div>
                  
                  {/* Set exact same height as Record Your Idea container */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 h-[600px] overflow-y-auto">
                    {activeIdeas.length > 0 ? (
                      <div className="overflow-y-auto pr-1 flex-grow">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 auto-rows-max">
                          {activeIdeas.map(idea => (
                            <div 
                              key={idea.id} 
                              className="p-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-blue-100 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 hover:shadow-md transition-all cursor-pointer group"
                              onClick={() => navigate(`/idea/${idea.id}`)}
                            >
                              <div className="flex flex-col h-full">
                                <h3 className="font-medium text-sm text-gray-900 leading-tight mb-0.5 line-clamp-2">
                                  {extractTitle(idea)}
                                </h3>
                                <div className="flex justify-between items-center mt-auto pt-1">
                                  <span className="text-xs text-gray-400">
                                    {formatDate(idea.created_at || idea.createdAt)}
                                  </span>
                                  <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div 
                            className="p-2.5 rounded-lg border border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center cursor-pointer h-full text-center"
                            onClick={() => document.querySelector('.voice-recorder-trigger')?.click()}
                          >
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mb-0.5">
                              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-600">New</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="bg-indigo-50 p-3 rounded-full mb-3">
                          <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">No Active Ideas Yet</h3>
                        <p className="text-sm text-gray-500 mb-3">Record an idea to get started!</p>
                        <button 
                          className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border border-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                          onClick={() => document.querySelector('.voice-recorder-trigger')?.click()}
                        >
                          Record Your First Idea
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <section id="all-notes-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">All Notes</h2>
                </div>
                <NotesList 
                  notes={notes} 
                  setNotes={setNotes} 
                  loadingNotes={loadingNotes}
                  onPromoteToActive={promoteToActiveIdea} 
                />
              </section>
            </div>
          </main>
        </>
      )}

      {!effectiveUser && <LandingPage />}

      {showCustomPersonaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-dropdown">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-lg text-gray-900">Create Your Own Persona</h3>
              <button 
                onClick={() => setShowCustomPersonaModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="personaName" className="block text-sm font-medium text-gray-700 mb-1">
                  Persona Name
                </label>
                <input
                  type="text"
                  id="personaName"
                  placeholder="e.g., UX Specialist"
                  value={customPersonaName}
                  onChange={(e) => setCustomPersonaName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {["🔮", "🎯", "🧠", "🌟", "📈", "🛠️", "🧩", "✨"].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`h-10 w-10 flex items-center justify-center text-xl rounded-md ${
                        customPersonaIcon === icon 
                          ? 'bg-indigo-100 border-2 border-indigo-500' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => setCustomPersonaIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="personaGoals" className="block text-sm font-medium text-gray-700 mb-1">
                  Persona Goals & Perspective
                </label>
                <textarea
                  id="personaGoals"
                  placeholder="Describe what this persona focuses on and values..."
                  value={customPersonaGoals}
                  onChange={(e) => setCustomPersonaGoals(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowCustomPersonaModal(false)}
                  className="px-4 py-1.5 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCustomPersona}
                  disabled={!customPersonaName.trim()}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer border ${
                    customPersonaName.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500' : 'bg-indigo-300 text-white border-transparent cursor-not-allowed opacity-60'
                  }`}
                >
                  Create Persona
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <path d="M8 19c7.732 0 11.946-6.41 11.946-11.946 0-.182 0-.364-.012-.545A8.548 8.548 0 0022 4.309a8.19 8.19 0 01-2.357.646A4.118 4.118 0 0021.448 3a8.224 8.224 0 01-2.605.996A4.107 4.107 0 0015.448 3c-2.266 0-4.104 1.838-4.104 4.104 0 .322.036.636.106.936A11.65 11.65 0 013 4.15a4.104 4.104 0 001.27 5.475 a4.073 4.073 0 01-1.858-.513v.052c0 2.042 1.453 3.746 3.379 4.132a4.095 4.095 0 01-1.853.07c.522 1.63 2.037 2.816 3.833 2.85A8.233 8.233 0 012 19.54a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Global tooltip container that will float above everything */}
      <div 
        id="persona-tooltip" 
        className="hidden fixed z-[9999] bg-gray-800 text-white p-3 rounded-md shadow-xl max-w-xs transform -translate-y-1/2 pointer-events-none"
      ></div>
    </div>
  );
}

function FullIdeaPage({ user, session }) {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [copied, setCopied] = useState('');
  const [generatingPRD, setGeneratingPRD] = useState(false);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const { runGeneration, isGenerating, activeTask } = useGeneration();
  const [prdContent, setPrdContent] = useState(null);
  const [activeTab, setActiveTab] = useState('cockpit');
  const [prdError, setPrdError] = useState(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const reportSummary = useMemo(
    () => parseIdeaReportSummary(note?.business_idea),
    [note?.business_idea]
  );

  useEffect(() => {
    const fetchNote = async () => {
      // 1. Direct fetch from API for ambient harness ideas (avoids invalid postgres UUID/bigint query)
      if (String(id).startsWith('idea_')) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch(`/api/v1/ideas/${id}`, { headers });
          if (res.ok) {
            const apiIdea = await res.json();
            let tr = apiIdea.transcript || '';
            try {
              if (typeof tr === 'string' && tr.trim().startsWith('{') && tr.trim().endsWith('}')) {
                const parsed = JSON.parse(tr.trim());
                if (parsed && typeof parsed === 'object') {
                  tr = parsed.transcript || parsed.text || parsed.data || tr;
                }
              }
            } catch {}
            if (typeof tr === 'string') {
              tr = tr.replace(/\\n/g, '\n').trim();
            }

            const loaded = {
              id: apiIdea.id,
              user_id: apiIdea.userId,
              title: apiIdea.title,
              author: apiIdea.author,
              summary: apiIdea.summary,
              tags: apiIdea.tags,
              transcript: tr,
              business_idea: apiIdea.businessIdeaMarkdown || '',
              prd_content: apiIdea.prdContent || null,
              audio_url: apiIdea.audio_url || apiIdea.audioUrl || null,
              created_at: apiIdea.createdAt
            };
            setNote(loaded);
            if (apiIdea.prdContent) {
              setPrdContent(apiIdea.prdContent);
            }
            return;
          }
        } catch (apiErr) {
          console.error('Fetch note from API error:', apiErr);
        }
      }

      // 2. Fetch from Supabase voice_notes
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Fetch note from Supabase error:', error);
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch(`/api/v1/ideas/${id}`, { headers });
          if (res.ok) {
            const apiIdea = await res.json();
            let tr = apiIdea.transcript || '';
            try {
              if (typeof tr === 'string' && tr.trim().startsWith('{') && tr.trim().endsWith('}')) {
                const parsed = JSON.parse(tr.trim());
                if (parsed && typeof parsed === 'object') {
                  tr = parsed.transcript || parsed.text || parsed.data || tr;
                }
              }
            } catch {}
            if (typeof tr === 'string') {
              tr = tr.replace(/\\n/g, '\n').trim();
            }

            const loaded = {
              id: apiIdea.id,
              user_id: apiIdea.userId,
              title: apiIdea.title,
              author: apiIdea.author,
              summary: apiIdea.summary,
              tags: apiIdea.tags,
              transcript: tr,
              business_idea: apiIdea.businessIdeaMarkdown || '',
              prd_content: apiIdea.prdContent || null,
              audio_url: apiIdea.audio_url || apiIdea.audioUrl || null,
              created_at: apiIdea.createdAt
            };
            setNote(loaded);
            if (apiIdea.prdContent) {
              setPrdContent(apiIdea.prdContent);
            }
            return;
          }
        } catch (apiErr) {
          console.error('Fetch note from API fallback error:', apiErr);
        }
      }
      else {
        if (data?.business_idea) {
          let idea = data.business_idea.trim();
          try {
            if (idea.startsWith('{') && idea.endsWith('}')) {
              const parsed = JSON.parse(idea);
              if (parsed && typeof parsed === 'object' && parsed.text) {
                idea = parsed.text;
              }
            }
          } catch {
          }
          idea = idea.replace(/^["']?text["']?\s*:\s*["']?/, '');
          idea = idea.replace(/\\n/g, '\n').trim();
          data.business_idea = idea;
        }

        if (data?.transcript) {
          let tr = data.transcript;
          try {
            if (typeof tr === 'string' && tr.trim().startsWith('{') && tr.trim().endsWith('}')) {
              const parsed = JSON.parse(tr.trim());
              if (parsed && typeof parsed === 'object') {
                tr = parsed.transcript || parsed.text || parsed.data || tr;
              }
            }
          } catch {}
          if (typeof tr === 'string') {
            tr = tr.replace(/\\n/g, '\n').trim();
          }
          data.transcript = tr;
        }
        
        // Set PRD content if it exists in the database
        if (data?.prd_content) {
          setPrdContent(data.prd_content);
        }
        
        setNote(data);
      }
    };
    fetchNote();
  }, [id]);

  const copyIdea = async () => {
    if (note) {
      const title = extractTitle(note);
      const description = note.description ? `\n\n${note.description}` : '';
      const content = note.business_idea || note.transcript || '';
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

  const handleGenerateIdea = async () => {
    if (!note || generatingIdea) return;
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
      return;
    }

    try {
      setGeneratingIdea(true);
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
          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errText}`);
          }
          const data = await response.json();
          const rawIdea = data.idea || data.text;
          if (typeof rawIdea !== 'string' || !rawIdea.trim()) {
            throw new Error('Webhook response did not include a valid idea.');
          }
          const idea = rawIdea.replace(/^[^\w#*]+/, '').trim();
          const extractedTitle = extractTitle({ business_idea: idea });
          const extractedSummary = extractSummary({ business_idea: idea });

          setNote(prev => ({
            ...prev,
            business_idea: idea,
            title: extractedTitle || prev.title,
            summary: extractedSummary || prev.summary
          }));

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
                  summary: extractedSummary
                })
              });
            } catch (err) {
              console.error('Failed to update ambient idea business_idea on server:', err);
            }
          } else {
            await supabase
              .from('voice_notes')
              .update({ business_idea: idea })
              .eq('id', note.id);
          }
          setActiveTab('cockpit');

          return {
            id: note.id,
            title: extractedTitle || note.title,
            summary: extractedSummary || note.summary,
            url: `/idea/${note.id}`
          };
        }
      });
    } catch (err) {
      console.error('Error generating idea:', err);
      alert(err.message || 'Failed to generate business idea. Please try again.');
    } finally {
      setGeneratingIdea(false);
    }
  };

  const handleCreatePRD = async () => {
    if (!note || generatingPRD) return;
    
    try {
      setGeneratingPRD(true);
      setPrdError(null);
      
      // Get content for the PRD
      const title = note.title || (note.business_idea?.split('\n')[0]) || 'Untitled Idea';
      const content = note.business_idea || note.transcript || '';
      let generatedPRD = '';

      if (String(note.id).startsWith('idea_')) {
        // Native GoodIdea backend endpoint for ambient harness ideas
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/v1/ideas/${note.id}/prd`, {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }

        const data = await res.json();
        generatedPRD = data.prdContent;
      } else {
        // Format the request body to include the chatInput field expected by n8n
        const requestBody = {
          chatInput: `Generate a PRD for the following business idea titled "${title}": \n\n${content}`,
          metadata: {
            noteId: note.id,
            title: title
          }
        };
        
        // Call n8n webhook with production URL
        const response = await fetch('https://n8n.why57.com/webhook/prd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }
        
        // Get the response data
        const data = await response.json();
        console.log('Response data:', data);
        
        // Check for content in text, prd, or output fields
        if (!data.text && !data.prd && !data.output) {
          throw new Error('No PRD content received from server');
        }
        
        // Use either text, prd, or output field depending on n8n workflow response format
        generatedPRD = data.text || data.prd || data.output || `# PRD for ${title}\n\nUnable to generate PRD content.`;
        
        // Save PRD to database
        const { error: updateError } = await supabase
          .from('voice_notes')
          .update({ prd_content: generatedPRD })
          .eq('id', note.id);
          
        if (updateError) {
          console.error('Error saving PRD to database:', updateError);
        } else {
          console.log('PRD saved to database successfully');
        }
      }
      
      setPrdContent(generatedPRD);
      setActiveTab('prd'); // Switch to PRD tab after generation
      
    } catch (error) {
      console.error('Error generating PRD:', error);
      setPrdError(error.message || 'Failed to generate PRD. Please try again later.');
    } finally {
      setGeneratingPRD(false);
    }
  };

  const verdict = reportSummary?.brutalTruth?.verdict || 'EVALUATING DEMAND';
  const isStrongBuild = verdict.includes('STRONG') || verdict.includes('HIGH CONFIDENCE');
  const isTrapOrRisk = verdict.includes('TRAP') || verdict.includes('RISK') || verdict.includes('WARNING');
  const verdictStyle = isStrongBuild 
    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
    : isTrapOrRisk
    ? 'bg-rose-950/70 border-rose-500/40 text-rose-300 shadow-rose-500/10'
    : 'bg-amber-950/70 border-amber-500/40 text-amber-300 shadow-amber-500/10';

  const categoryName = reportSummary?.marketPosition || 'AI Engineering Venture';
  const ideaTitle = note ? extractTitle(note) : 'Loading idea...';

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-slate-950 py-6 px-3 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-1/4 translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Main Header Card with Glassmorphic Styling */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Top Row: Back link & metadata badges on Left, Action Toolbar on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition shadow-sm cursor-pointer"
                aria-label="Back to dashboard"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Ideas</span>
              </Link>
              
              {note?.audio_url ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                  🎙️ Voice Memo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  ⚡ Text Monologue
                </span>
              )}

              {note?.created_at && (
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Action buttons toolbar matching dark studio palette */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {(note?.transcript || note?.transcription || note?.business_idea) && (
                <button
                  onClick={handleGenerateIdea}
                  disabled={generatingIdea}
                  className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold transition shadow-lg shadow-amber-500/10 cursor-pointer ${
                    note?.business_idea
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      : 'border-amber-400 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold'
                  } disabled:opacity-50`}
                  title={note?.business_idea ? 'Regenerate structured business idea from transcript' : 'Generate structured business idea from transcript'}
                  aria-label={note?.business_idea ? 'Regenerate idea' : 'Generate idea'}
                >
                  {generatingIdea ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {note?.business_idea ? 'Regenerating...' : 'Generating...'}
                    </>
                  ) : note?.business_idea ? (
                    <>
                      <ArrowPathIcon className="h-3.5 w-3.5 mr-1 text-amber-400" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-3.5 w-3.5 mr-1 text-slate-950" />
                      Generate Idea
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleCopyIdea}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
                disabled={!note}
              >
                <DocumentTextIcon className="h-3.5 w-3.5 mr-1 text-slate-400" />
                {copied === 'idea' ? 'Copied!' : 'Copy Markdown'}
              </button>
              
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-xs font-bold text-emerald-400 hover:bg-emerald-900/40 transition shadow-sm cursor-pointer"
                disabled={!note}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copied === 'link' ? 'Copied!' : 'Share Idea'}
              </button>
              
              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(prev => !prev)}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
                  disabled={!note}
                >
                  <svg className="h-3.5 w-3.5 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  More Actions
                </button>
                
                {/* Dropdown Menu */}
                {showMoreActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMoreActions(false)} />
                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-slate-900 border border-white/10 ring-1 ring-black ring-opacity-20 focus:outline-none z-20 p-1.5 space-y-1">
                      {(note?.transcript || note?.transcription || note?.business_idea) && (
                        <button
                          onClick={() => {
                            handleGenerateIdea();
                            setShowMoreActions(false);
                          }}
                          disabled={generatingIdea}
                          className="w-full flex items-center px-3.5 py-2 text-xs font-medium text-amber-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowPathIcon className="h-3.5 w-3.5 mr-2 text-amber-400" />
                          {note?.business_idea ? 'Regenerate Idea' : 'Generate Business Idea'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleCreatePRD();
                          setShowMoreActions(false);
                        }}
                        disabled={generatingPRD}
                        className="w-full flex items-center justify-center px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        {generatingPRD ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 mr-2 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Document...
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5 mr-2 text-slate-950 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Create Product Requirement Document
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hero Section: Badges + Bold Title + Elevator Pitch */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-amber-300">
                {categoryName}
              </span>
              
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm ${verdictStyle}`}>
                <span>{isStrongBuild ? '🔥' : isTrapOrRisk ? '💀' : '⚡'}</span>
                <span>{verdict}</span>
              </span>

              {reportSummary?.tam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">TAM:</span>
                  <span>{reportSummary.tam}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {ideaTitle}
            </h1>

            {/* Flagship Elevator Pitch Callout */}
            {(reportSummary?.elevatorPitch || note?.summary) && (
              <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent text-amber-100 text-sm sm:text-base leading-relaxed flex items-start gap-3.5 shadow-lg backdrop-blur-sm">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex-shrink-0 mt-0.5">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">Founder Elevator Pitch & Wedge</div>
                  <p className="font-medium text-amber-100/90 m-0 leading-relaxed">
                    {reportSummary?.elevatorPitch || note?.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Audio Recording Player Capsule (if audio exists) */}
            {note?.audio_url && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 px-4 bg-slate-800/60 rounded-xl border border-white/10">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 flex-shrink-0">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Voice Memo:</span>
                </span>
                <audio controls src={note.audio_url} className="h-8 w-full max-w-lg rounded-lg opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Segmented Pill Tabs */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-950/70 border border-white/10 rounded-full shadow-inner flex-wrap backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('cockpit')}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'cockpit'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                aria-pressed={activeTab === 'cockpit'}
              >
                <BoltIcon className="w-3.5 h-3.5 mr-1.5 text-current" />
                <span>Venture Cockpit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('launch_kit')}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'launch_kit'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                aria-pressed={activeTab === 'launch_kit'}
              >
                <RocketLaunchIcon className="w-3.5 h-3.5 mr-1.5 text-current" />
                <span>Launch Kit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prd')}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'prd'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                aria-pressed={activeTab === 'prd'}
              >
                <DocumentCheckIcon className="w-3.5 h-3.5 mr-1.5 text-current" />
                <span>Product Spec (PRD)</span>
                {!prdContent && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    activeTab === 'prd' ? 'bg-slate-900 text-amber-300' : 'bg-white/10 text-slate-400'
                  }`}>
                    Draft
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dossier')}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dossier'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                aria-pressed={activeTab === 'dossier'}
              >
                <BookOpenIcon className="w-3.5 h-3.5 mr-1.5 text-current" />
                <span>Full Architectural Dossier</span>
              </button>

              {note?.transcript && (
                <button
                  type="button"
                  onClick={() => setActiveTab('transcript')}
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'transcript'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  aria-pressed={activeTab === 'transcript'}
                >
                  <DocumentTextIcon className="w-3.5 h-3.5 mr-1.5 text-current" />
                  <span>Raw Monologue</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Panel 1: Venture Cockpit */}
        <div className={`space-y-6 ${activeTab === 'cockpit' ? 'block' : 'hidden'}`}>
          {note ? (
            <>
              {/* 1. Venture Bento Cockpit (Brutal Reality Check, 6-Axis Viability, ICP, Watering Holes, Unit Economics) */}
              <VentureBentoCockpit
                summary={reportSummary}
                onOpenLaunchKit={() => setActiveTab('launch_kit')}
                onOpenPRD={() => setActiveTab('prd')}
              />

              {/* 2. Domain Blueprint & Directing Matrix (e.g. 9-Beat Cinematic Framework) */}
              {reportSummary?.domainBlueprint && (
                <DomainBlueprintShowcase blueprint={reportSummary.domainBlueprint} />
              )}

              {/* 3. Community Signals (Reddit Threads & YouTube Demand) */}
              {reportSummary?.communitySignals && (
                <CommunitySignals communitySignals={reportSummary.communitySignals} />
              )}

              {/* 4. 1-Click Builder Kit */}
              <BuilderPromptKit
                builderKit={reportSummary?.builderKit}
                title={ideaTitle}
              />
            </>
          ) : (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
            </div>
          )}
        </div>

        {/* Tab Panel 2: Launch Kit */}
        <div className={`space-y-6 ${activeTab === 'launch_kit' ? 'block' : 'hidden'}`}>
          <BuilderPromptKit
            builderKit={reportSummary?.builderKit}
            title={ideaTitle}
          />
        </div>

        {/* Tab Panel 3: Product Spec (PRD) */}
        <div className={`space-y-6 ${activeTab === 'prd' ? 'block' : 'hidden'}`}>
          {prdContent ? (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm prose max-w-none text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={ideaMarkdownComponents}>{prdContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                📋
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Product Requirement Document (PRD)</h3>
              {prdError ? (
                <div className="text-rose-400 mb-4 text-xs font-medium">
                  <p className="font-semibold">Error generating PRD:</p>
                  <p>{prdError}</p>
                </div>
              ) : (
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Turn this structured startup idea into a comprehensive, engineer-ready Product Requirement Document with feature specifications, architecture, and user stories.
                </p>
              )}
              <button
                onClick={handleCreatePRD}
                disabled={generatingPRD}
                className="inline-flex items-center px-6 py-3 rounded-full text-xs font-bold shadow-lg shadow-amber-500/20 text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {generatingPRD ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Document...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2 text-slate-950" />
                    Generate Product Requirement Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tab Panel 4: Full Architectural Dossier */}
        <div className={`space-y-6 ${activeTab === 'dossier' ? 'block' : 'hidden'}`}>
          {note?.business_idea ? (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={ideaMarkdownComponents}>{note.business_idea}</ReactMarkdown>
            </div>
          ) : note?.transcript ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">Raw capture waiting for your decision</h4>
                  <p className="mt-1 text-slate-300 text-xs">
                    Not every note needs to be organized. If this idea is worthy, convert it into a structured startup plan backed by market research.
                  </p>
                </div>
                <button
                  onClick={handleGenerateIdea}
                  disabled={generatingIdea}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <SparklesIcon className="h-3.5 w-3.5 mr-1.5 text-slate-950" />
                  Generate Business Idea
                </button>
              </div>
              <div className="p-4 border border-white/10 rounded-xl bg-slate-950/60">
                <p className="text-slate-300 whitespace-pre-wrap font-sans text-sm">{note.transcript}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic text-center py-8">No dossier content available for this note.</p>
          )}
        </div>

        {/* Tab Panel 5: Raw Monologue */}
        {note?.transcript && (
          <div className={`space-y-6 ${activeTab === 'transcript' ? 'block' : 'hidden'}`}>
            <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>🎙️</span> Original Brainstorm Monologue
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {note.audio_url ? 'Speech-to-text transcript' : 'Captured via ambient coding harness (text-only)'}
                  </p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(note.transcript)}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition shadow-sm cursor-pointer"
                >
                  Copy Monologue
                </button>
              </div>
              <div className="bg-slate-950/70 p-5 rounded-xl border border-white/10 font-sans text-sm text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                {note.transcript}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const { user, session, logout, authError, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        let rawSupabaseNotes = [];
        const { data, error } = await supabase
          .from('voice_notes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Fetch notes error:', error);
        } else if (data) {
          rawSupabaseNotes = [...data];
        }

        const seenIds = new Set();
        const deduplicated = [];

        // 1. Ingest Supabase voice notes
        for (const n of rawSupabaseNotes) {
          if (!n || !n.id) continue;
          const idStr = String(n.id);
          if (seenIds.has(idStr)) continue;
          seenIds.add(idStr);
          deduplicated.push(n);
        }

        // 2. Also merge any ideas ingested via the GoodIdea harness API
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/v1/ideas?limit=100', { headers });
          if (res.ok) {
            const apiData = await res.json();
            const ideasList = apiData.ideas || [];

            for (const i of ideasList) {
              if (!i || !i.id) continue;
              // Filter out seed/initial welcome mock ideas
              if (i.id === 'idea_initial_welcome') continue;
              if (i.author && i.author.toLowerCase() === 'alex') continue;

              const idStr = String(i.id);
              const supaIdStr = i.supabaseId ? String(i.supabaseId) : null;

              if (seenIds.has(idStr)) continue;
              if (supaIdStr && seenIds.has(supaIdStr)) continue;

              seenIds.add(idStr);
              if (supaIdStr) seenIds.add(supaIdStr);

              deduplicated.push({
                id: i.id,
                user_id: i.userId,
                title: i.title,
                author: i.author,
                summary: i.summary,
                tags: i.tags,
                transcript: i.transcript,
                business_idea: i.businessIdeaMarkdown || '',
                prd_content: i.prdContent || null,
                audio_url: i.audio_url || i.audioUrl || null,
                archived: i.status === 'archived',
                is_featured: i.isFeatured,
                created_at: i.createdAt,
                updated_at: i.updatedAt
              });
            }
          }
        } catch (err) {
          console.warn('Harness ideas fetch error:', err);
        }

        const getNoteTimestamp = (item) => {
          if (!item) return 0;
          const d = item.created_at || item.createdAt || item.updated_at || item.updatedAt;
          if (!d) return 0;
          const t = new Date(d).getTime();
          return Number.isFinite(t) ? t : 0;
        };

        // Sort newest first
        deduplicated.sort((a, b) => getNoteTimestamp(b) - getNoteTimestamp(a));

        if (active) {
          setNotes(deduplicated);
        }
      } catch (err) {
        console.error('fetchNotes error:', err);
      } finally {
        if (active) {
          setLoadingNotes(false);
        }
      }
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
            const filtered = prev.filter(note => !(note.id && note.id.toString().startsWith('temp-')) && note.id !== payload.new.id);
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
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
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
              <Dashboard notes={notes} setNotes={setNotes} user={user} loadingNotes={loadingNotes} />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/integrations"
          element={
            user ? (
              <Dashboard notes={notes} setNotes={setNotes} user={user} initialOpenIntegrations={true} loadingNotes={loadingNotes} />
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
      <GenerationProgressHUD />
    </div>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <GenerationProvider>
        <App />
      </GenerationProvider>
    </AuthProvider>
  );
}
