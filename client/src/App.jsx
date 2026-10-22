import { workflowUrl } from './runtimeConfig';
import { artifactTabs, clearLibraryContext } from './utils/libraryContext';
import IdeaIdentity from './components/IdeaIdentity';
import './components/IdeaReading.css';
/*
  ROOT-TODO[HIGH]: App Structure & Release
  - Main entry point for Captain's Log app.
  - Keep this file organized and maintain top-level app logic only.
  - REVIEW: Review all feature integrations before major releases.
  - FEATURE: Ensure all new features are registered here.
*/
// TODO[progress-md][P1][App] See progress.md for all open UI polish, loading, error, and browser test tasks

import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { savedText } from './components/NotePreview';
import LoadingSpinner from './components/LoadingSpinner';
import { supabase } from './supabaseClient';
import { Routes, Route, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import NotesList from './components/NotesList';
import './components/Dashboard.css';
import './components/OriginalDashboard.css';
import VoiceRecorderCard from './components/VoiceRecorderCard';
import { CheckIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon, RocketLaunchIcon, SparklesIcon, BoltIcon, CheckBadgeIcon, ShieldCheckIcon, ArrowRightIcon, ArrowPathIcon, LightBulbIcon, DocumentCheckIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GenerationProvider, useGeneration } from './contexts/GenerationContext';
import GenerationProgressHUD from './components/GenerationProgressHUD';
import AuthButton from './components/AuthButton';
import LandingPage from './components/LandingPage';
import BetaInformation from './components/BetaInformation';
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

const readingMarkdownComponents = { ...ideaMarkdownComponents, table: ({ children }) => <div className="idea-reading-table"><p className="idea-reading-table-hint">Scroll horizontally to read all columns →</p><div role="region" aria-label="Saved table, scroll horizontally" tabIndex={0}><table>{children}</table></div></div> };


/*
  TODO[MEDIUM]: Dashboard Onboarding
  - FEATURE: Add user onboarding tips for first-time users.
  - UI: Consider a dismissible banner or modal for onboarding.
*/

function Dashboard({ notes, setNotes, user, initialOpenIntegrations = false, loadingNotes = false, notesError = null, onReloadNotes }) {
  const { runGeneration } = useGeneration();
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(initialOpenIntegrations);
  const voiceCaptureRef = useRef(null);
  const textCaptureRef = useRef(null);
  const ideaComposerRef = useRef(null);
  const [selectedPersona, setSelectedPersona] = useState(() => {
    // Try to load saved persona from localStorage
    const savedPersona = localStorage.getItem('userPersona');
    return savedPersona || "Innovator";
  });
  const personaButtonRef = useRef(null);
  const [showCustomPersonaModal, setShowCustomPersonaModal] = useState(false);
  const closeCustomPersona = () => { setShowCustomPersonaModal(false); requestAnimationFrame(() => personaButtonRef.current?.focus()); };
  const [customPersonaName, setCustomPersonaName] = useState('');
  const [customPersonaGoals, setCustomPersonaGoals] = useState('');
  const [customPersonaIcon, setCustomPersonaIcon] = useState('🔮');

  // Text Monologue & Fast Ingestion State
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const voiceStatusRef = useRef('idle');
  const voiceBusy = ['preparing', 'recording', 'saving'].includes(voiceStatus);
  const isVoiceBusy = () => ['preparing', 'recording', 'saving'].includes(voiceStatusRef.current);
  const [captureTab, setCaptureTab] = useState('voice'); // 'voice' or 'text'
  const [monologueText, setMonologueText] = useState('');
  const [monologueTitle, setMonologueTitle] = useState('');
  const [isSubmittingMonologue, setIsSubmittingMonologue] = useState(false);
  const monologuePendingRef = useRef(false);
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

  const onNoteSaved = (newNote) => {
    const markedNote = newNote;
    const recordSource = String(newNote.id).startsWith('idea_') ? 'ambient' : 'voice_notes';
    setNotes(prev => [{ ...markedNote, recordSource, mirrorCheck: 'unverified' }, ...prev.filter(note => note.id !== markedNote.id)]);

  };

  const handleMonologueSubmit = async (synthesizeIdea = false) => {
    if (monologuePendingRef.current) return;
    if (!monologueText.trim()) {
      setMonologueStatus({ type: 'error', message: 'Please enter your monologue or idea text first.' });
      return;
    }

    monologuePendingRef.current = true;
    setIsSubmittingMonologue(true);
    setMonologueStatus(null);

    const submitAction = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id || authData.user.id !== effectiveUser?.id) throw new Error('Your current account could not be confirmed. Your text is kept.');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (sessionError || !token || sessionData.session.user?.id !== authData.user.id) throw new Error('Your session could not be confirmed. Your text is kept.');
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

      const createdIdea = await res.json().catch(() => null);
      const { data: currentAuth, error: currentAuthError } = await supabase.auth.getUser();
      if (!createdIdea || Array.isArray(createdIdea) || typeof createdIdea.id !== 'string' || !/^idea_[A-Za-z0-9_-]+$/.test(createdIdea.id) || createdIdea.userId !== authData.user.id || createdIdea.success === false || ['title', 'summary', 'transcript', 'businessIdeaMarkdown'].some(key => createdIdea[key] != null && typeof createdIdea[key] !== 'string') || (createdIdea.tags != null && (!Array.isArray(createdIdea.tags) || createdIdea.tags.some(tag => typeof tag !== 'string'))) || currentAuthError || currentAuth?.user?.id !== authData.user.id || (synthesizeIdea && !savedText(createdIdea.businessIdeaMarkdown).trim())) {
        throw new Error('Save could not be confirmed. Your text is kept; refresh before retrying.');
      }
      
      const newFormattedNote = {
        id: createdIdea.id,
        user_id: createdIdea.userId,
        title: createdIdea.title,
        summary: createdIdea.summary,
        transcript: createdIdea.transcript || monologueText.trim(),
        business_idea: createdIdea.businessIdeaMarkdown || '',
        tags: createdIdea.tags || ['monologue'],
        status: synthesizeIdea ? 'active' : 'raw',
        is_featured: createdIdea.isFeatured === true,
        created_at: createdIdea.createdAt || new Date().toISOString()
      };

      onNoteSaved(newFormattedNote);
      setMonologueText('');
      setMonologueTitle('');
      setMonologueStatus({
        type: 'success',
        message: synthesizeIdea
          ? 'Idea and report saved. Open it to read the result. Later development and management are not available for this text source here yet.'
          : 'Note saved. Open it to read your original. Later development and management are not available for this text source here yet.'
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
      monologuePendingRef.current = false;
    }
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
      closeCustomPersona();
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


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d1b8c] to-[#1355b8]"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_60%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="dashboard-header-row flex justify-between items-center h-20">
            <Link to="/" className="flex items-center group transition">
              <img 
                src="/goodideas.png" 
                alt="GoodIdea Logo" 
                className="h-8 sm:h-9 w-auto drop-shadow-md transition-transform group-hover:scale-[1.02]" 
              />
            </Link>
            
            {effectiveUser && (
              <div className="dashboard-account flex items-center space-x-4">
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
                  <Popover className="relative">{({ open, close }) => <>
                    <PopoverButton ref={personaButtonRef}
                      className="flex items-center text-white font-medium rounded-full px-3 py-1 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10"
                    >
                      <span className="mr-1">
                        {personas.find(p => p.label === selectedPersona)?.icon || '💡'}
                      </span>
                      <span className="font-semibold">{selectedPersona}</span>
                      <svg 
                        className={`ml-1.5 h-4 w-4 transition-transform duration-300 ${open ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </PopoverButton>
                    
                    {/* Dropdown content remains the same */}
                    {open && (
                      <PopoverPanel static
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
                                    close();
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
                                  
                                </button>
                                  {/* Delete button for custom personas */}
                                  {persona.isCustom && (
                                    <button 
                                      aria-label={`Delete persona ${persona.label}`} className="absolute right-2 top-2 text-gray-500 hover:text-red-600 p-1 min-h-11 min-w-11"
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
                              </div>
                            ))}
                          </div>
                          
                          {/* Create Your Own Persona Button */}
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <button
                              className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                              onClick={() => {
                                setShowCustomPersonaModal(true);
                                close();
                              }}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Create Your Own Persona
                            </button>
                          </div>
                        </div>
                      </PopoverPanel>
                    )}
                  </>}</Popover>
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
          <IntegrationsModal
            isOpen={showIntegrationsModal}
            onClose={() => setShowIntegrationsModal(false)}
            onIdeaCreated={(newIdea) => setNotes(prev => [newIdea, ...prev])}
          />
          
          <main className="original-dashboard">
            <NotesList notes={notes} setNotes={setNotes} loadingNotes={loadingNotes} notesError={notesError} onReloadNotes={onReloadNotes}
              onRecord={() => { if (isVoiceBusy() || isSubmittingMonologue) return; setCaptureTab('voice'); requestAnimationFrame(() => { voiceCaptureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); voiceCaptureRef.current?.focus(); }); }}
              onWrite={() => { if (isVoiceBusy() || isSubmittingMonologue) return; setCaptureTab('text'); requestAnimationFrame(() => { ideaComposerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); ideaComposerRef.current?.focus(); }); }}
              capture={<section className="original-capture" aria-labelledby="capture-title">
                <div className="original-section-heading"><h2 id="capture-title">Capture your idea</h2>
                  <div className="capture-tabs" aria-label="Capture method">
                    <button type="button" ref={voiceCaptureRef} onClick={() => { if (!isVoiceBusy()) setCaptureTab('voice'); }} disabled={voiceBusy || isSubmittingMonologue} aria-pressed={captureTab === 'voice'}><MicrophoneIcon aria-hidden="true" />Voice Memo</button>
                    <button type="button" ref={textCaptureRef} onClick={() => { if (!isVoiceBusy()) setCaptureTab('text'); }} disabled={voiceBusy || isSubmittingMonologue} aria-pressed={captureTab === 'text'}><DocumentTextIcon aria-hidden="true" />Text</button>
                  </div>
                </div>
                {captureTab === 'voice' ? <VoiceRecorderCard onNoteSaved={onNoteSaved} footerText="Your original stays saved. Develop it when you’re ready." className="original-voice-card !mt-0 !mb-0" onStatusChange={status => { voiceStatusRef.current = status; setVoiceStatus(status); }} /> :
                  <div className="original-text-card dashboard-text">
                    <h3>Write a note</h3><p className="dashboard-hint">Type or paste a rough thought. Save the original, or generate a report now. Later development and management of text notes are not available here yet.</p>
                    <label htmlFor="capture-title-input">Title <span>(optional)</span></label>
                    <input id="capture-title-input" value={monologueTitle} onChange={e => setMonologueTitle(e.target.value)} disabled={isSubmittingMonologue} placeholder="Give your idea a name" />
                    <label htmlFor="capture-idea-input">Your idea</label>
                    <textarea id="capture-idea-input" ref={ideaComposerRef} value={monologueText} onChange={e => setMonologueText(e.target.value)} disabled={isSubmittingMonologue} placeholder="What are you thinking about?" rows={6} />
                    <div className="original-text-actions"><button className="dashboard-primary" onClick={() => handleMonologueSubmit(false)} disabled={isSubmittingMonologue || !monologueText.trim()}>{isSubmittingMonologue ? 'Saving…' : 'Save note'}</button>
                    <button className="dashboard-secondary" onClick={() => handleMonologueSubmit(true)} disabled={isSubmittingMonologue || !monologueText.trim()}><SparklesIcon aria-hidden="true" />Generate business idea</button></div>
                    <p className="dashboard-hint">Saving or generating never pins an idea automatically.</p>
                  </div>}
                {monologueStatus && <p role={monologueStatus.type === 'error' ? 'alert' : 'status'} className={`capture-feedback ${monologueStatus.type}`}>{monologueStatus.message}</p>}
              </section>} />
          </main>
        </>
      )}

      {!effectiveUser && <LandingPage />}

      <Dialog open={showCustomPersonaModal} onClose={closeCustomPersona} className="persona-dialog relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPanel className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <DialogTitle className="font-medium text-lg text-gray-900">Create Your Own Persona</DialogTitle>
              <button 
                onClick={closeCustomPersona}
                aria-label="Close persona dialog" className="text-gray-500 hover:text-gray-700 min-h-11 min-w-11 flex items-center justify-center"
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
                  id="personaName" data-autofocus
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
                <div className="grid grid-cols-4 gap-2">
                  {["🔮", "🎯", "🧠", "🌟", "📈", "🛠️", "🧩", "✨"].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      aria-label={`Choose ${icon} icon`} aria-pressed={customPersonaIcon === icon}
                      className={`min-h-11 min-w-0 w-full flex items-center justify-center text-xl rounded-md ${
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
                  onClick={closeCustomPersona}
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
          </DialogPanel>
        </div>
      </Dialog>

      <footer className="bg-slate-900 text-white py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} GoodIdea. All rights reserved.</p>

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
  const location = useLocation();
  const clearDirectEntryContext = () => { if (location.state?.libraryUserId !== user?.id) clearLibraryContext(user?.id); };
  const [note, setNote] = useState(null);
  const savedReportRef = useRef(null);
  const canDevelopNote = Boolean(user?.id && note?.user_id === user.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(note.id));
  const [copied, setCopied] = useState('');
  const [generatingPRD, setGeneratingPRD] = useState(false);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [ideaError, setIdeaError] = useState(null);
  const { runGeneration, isGenerating, activeTask } = useGeneration();
  const [prdContent, setPrdContent] = useState(null);
  const [artifactParams, setArtifactParams] = useSearchParams();
  const requestedArtifact = artifactParams.get('artifact');
  const activeTab = Object.hasOwn(artifactTabs, requestedArtifact) ? artifactTabs[requestedArtifact] : 'cockpit';
  const setActiveTab = tab => {
    const artifact = Object.keys(artifactTabs).find(key => artifactTabs[key] === tab) || 'overview';
    setArtifactParams({ artifact }, { replace: true, preventScrollReset: true });
  };
  const [prdError, setPrdError] = useState(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const reportSummary = useMemo(
    () => parseIdeaReportSummary(note?.id === id ? (savedReportRef.current?.id === id ? savedReportRef.current.value : note.business_idea) : null),
    [note, id]
  );

  useEffect(() => {
    const fetchNote = async () => {
      savedReportRef.current = null;
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
            savedReportRef.current = { id: loaded.id, value: apiIdea.businessIdeaMarkdown || '' };
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
            savedReportRef.current = { id: loaded.id, value: apiIdea.businessIdeaMarkdown || '' };
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
        const savedReportSource = data?.business_idea;
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
        
        savedReportRef.current = { id: data?.id, value: savedReportSource };
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
    if (!canDevelopNote || generatingIdea) return;
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
      setIdeaError(null);
      await runGeneration({
        ideaId: note.id,
        title: note.title || 'Startup Blueprint',
        type: note.business_idea ? 'regenerate' : 'generate',
        execute: async () => {
          const response = await fetch(workflowUrl('summarize'), {
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

          const { data: savedIdea, error: saveError } = await supabase
            .from('voice_notes')
            .update({ business_idea: idea })
            .eq('id', note.id).eq('user_id', user.id)
            .select('id,business_idea').single();
          if (saveError || savedIdea?.id !== note.id || savedIdea.business_idea !== idea) {
            throw new Error('The generated idea could not be saved. Please retry.');
          }
          savedReportRef.current = { id: note.id, value: idea };
          setNote(prev => ({ ...prev, business_idea: idea, title: extractedTitle || prev.title, summary: extractedSummary || prev.summary }));
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
      setIdeaError(err.message || 'Failed to generate business idea. Please try again.');
    } finally {
      setGeneratingIdea(false);
    }
  };

  const handleCreatePRD = async () => {
    if (!canDevelopNote || generatingPRD) return;
    
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
        const response = await fetch(workflowUrl('prd'), {
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
        const { data: savedPRD, error: updateError } = await supabase
          .from('voice_notes')
          .update({ prd_content: generatedPRD })
          .eq('id', note.id).eq('user_id', user.id).select('id').single();
          
        if (updateError || savedPRD?.id !== note.id) throw new Error('The product document could not be saved. Please retry.');
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

  const savedFact = value => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
  const verdict = savedFact(reportSummary?.brutalTruth?.verdict);
  const isStrongBuild = verdict.includes('STRONG') || verdict.includes('HIGH CONFIDENCE');
  const isTrapOrRisk = verdict.includes('TRAP') || verdict.includes('RISK') || verdict.includes('WARNING');
  const verdictStyle = isStrongBuild 
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isTrapOrRisk
    ? 'bg-rose-50 text-rose-800 border-rose-300'
    : 'bg-amber-50 text-amber-800 border-amber-300';

  const categoryName = savedFact(reportSummary?.marketPosition);
  const savedVitals = [
    ['Viability grade', [savedFact(reportSummary?.brutalTruth?.score), savedFact(reportSummary?.brutalTruth?.grade)].filter(Boolean).join(' · ')],
    ['Primary audience', savedFact(reportSummary?.persona?.label)],
    ['Execution loop', savedFact(reportSummary?.scorecard?.executionDifficulty)],
    ['Distribution wedge', savedFact(reportSummary?.scorecard?.gtmScore)],
  ].filter(([, value]) => value !== '');
  const ideaTitle = note ? extractTitle(note) : 'Loading idea...';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Branded Dashboard Header */}
      <header className="relative z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d1b8c] to-[#1355b8]"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_60%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="idea-detail-header-row flex justify-between items-center h-20">
            <div className="idea-detail-header-brand flex items-center space-x-3 sm:space-x-4">
              <Link to="/" className="flex items-center group transition">
                <img 
                  src="/goodideas.png" 
                  alt="GoodIdea Logo" 
                  className="h-8 sm:h-9 w-auto drop-shadow-md transition-transform group-hover:scale-[1.02]" 
                />
              </Link>
              <span className="hidden sm:inline-block text-white/30 text-lg font-light">/</span>
              <Link
                to="/"
                onClick={clearDirectEntryContext}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition backdrop-blur-sm cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to library</span>
              </Link>
            </div>

            {/* Right side actions in global header */}
            <div className="idea-detail-header-actions flex items-center space-x-2 sm:space-x-3">
              {(note?.audio_url || (Number.isFinite(note?.duration) && note.duration > 0)) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-100 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                  Voice capture
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                  Text capture
                </span>
              )}

              {(note?.transcript || note?.transcription || note?.business_idea) && (
                <button
                  onClick={handleGenerateIdea}
                  disabled={!canDevelopNote || generatingIdea}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/20 bg-white/10 hover:bg-white/20 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  title={note?.business_idea ? 'Regenerate idea' : 'Generate idea'}
                >
                  {generatingIdea ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 mr-1.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-3.5 w-3.5 mr-1 text-white" />
                      <span>{note?.business_idea ? 'Regenerate' : 'Generate idea'}</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleCopyIdea}
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition shadow-sm cursor-pointer"
              >
                <DocumentTextIcon className="h-3.5 w-3.5 mr-1 text-white/70" />
                <span>{copied === 'idea' ? 'Copied!' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/20 text-xs font-bold text-emerald-100 hover:bg-emerald-500/30 transition shadow-sm cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{copied === 'link' ? 'Copied!' : 'Share'}</span>
              </button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(prev => !prev)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition shadow-sm cursor-pointer"
                  title="More actions"
                  aria-label="More actions"
                  aria-expanded={showMoreActions}
                >
                  <svg className="h-3.5 w-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
                {showMoreActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMoreActions(false)} />
                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white border border-slate-200 ring-1 ring-black ring-opacity-5 focus:outline-none z-20 p-1.5 space-y-1">
                      <button
                        onClick={() => {
                          handleCreatePRD();
                          setShowMoreActions(false);
                        }}
                        disabled={!canDevelopNote || generatingPRD}
                        className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Create Product Requirement Document
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Canvas with Dashboard Gradient */}
      <main className="idea-reading-canvas flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-white min-h-[calc(100vh-5rem)]">
        {ideaError && <div role="alert" className="max-w-7xl mx-auto mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p>{ideaError}</p><p className="mt-1">Your original content is still shown below.</p></div>}
        {note && !canDevelopNote && <p className="max-w-7xl mx-auto mb-5 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">You can read this idea. Generating an idea or product document isn’t available for this note here.</p>}
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="idea-reading-identity" aria-labelledby="idea-reading-title">
            <div className="idea-reading-eyebrow"><IdeaIdentity developed={Boolean(savedText(note?.business_idea).trim())} pinned={note?.is_featured === true || note?.is_featured === 'true'} voice={Boolean(note?.audio_url)} />{note?.created_at && <time>{new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>}</div>
            <h1 id="idea-reading-title">{ideaTitle}</h1>
            {(reportSummary?.elevatorPitch || note?.summary) && <p className="idea-reading-pitch">{reportSummary?.elevatorPitch || note?.summary}</p>}
            {/* Audio Memo Capsule */}
            {note?.audio_url && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 flex-shrink-0">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>Voice Memo:</span>
                </span>
                <audio controls src={note.audio_url} className="h-8 w-full max-w-lg rounded-lg" />
              </div>
            )}

          </section>
          <nav className="idea-reading-nav" aria-label="Idea content">
            {[
              ['cockpit', 'Overview', BoltIcon], ['dossier', 'Report', BookOpenIcon],
              ['prd', 'Product spec', DocumentCheckIcon], ['launch_kit', 'Build prompt', RocketLaunchIcon],
              ...(note?.transcript ? [['transcript', 'Original note', DocumentTextIcon]] : []),
            ].map(([tab, label, Icon]) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}><Icon aria-hidden="true" />{label}{tab === 'prd' && !prdContent && <span className="idea-reading-missing">Not created</span>}</button>)}
          </nav>
          <div className="idea-reading-output" aria-label="Saved idea content">
          {/* Tab Panel 1: Venture Cockpit */}
          <div className={`space-y-6 ${activeTab === 'cockpit' ? 'block' : 'hidden'}`}>
            {note ? (
              <>
                {savedVitals.some(([label]) => label !== 'Primary audience') && <dl className="idea-reading-facts">{savedVitals.filter(([label]) => label !== 'Primary audience').map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
                <VentureBentoCockpit
                  summary={reportSummary}
                  onOpenLaunchKit={() => setActiveTab('launch_kit')}
                  onOpenPRD={() => setActiveTab('prd')}
                />

                {reportSummary?.domainBlueprint && (
                  <DomainBlueprintShowcase blueprint={reportSummary.domainBlueprint} />
                )}

                {reportSummary?.communitySignals && (
                  <CommunitySignals communitySignals={reportSummary.communitySignals} />
                )}

                {activeTab === 'cockpit' && (
                  <BuilderPromptKit
                    builderKit={reportSummary?.builderKit}
                    title={ideaTitle}
                  />
                )}
              </>
            ) : (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>

          {/* Tab Panel 2: Launch Kit */}
          <div className={`space-y-6 ${activeTab === 'launch_kit' ? 'block' : 'hidden'}`}>
            {activeTab === 'launch_kit' && (
              <BuilderPromptKit
                builderKit={reportSummary?.builderKit}
                title={ideaTitle}
              />
            )}
          </div>

          {/* Tab Panel 3: Product Spec (PRD) */}
          <div className={`space-y-6 ${activeTab === 'prd' ? 'block' : 'hidden'}`}>
            {prdContent ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm prose max-w-none text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={readingMarkdownComponents}>{prdContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                  📋
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Product spec</h3>
                {prdError ? (
                  <div className="text-rose-600 mb-4 text-xs font-medium">
                    <p className="font-semibold">Error generating PRD:</p>
                    <p>{prdError}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                    Turn this structured startup idea into a comprehensive, engineer-ready Product Requirement Document with feature specifications, architecture, and user stories.
                  </p>
                )}
                <button
                  onClick={handleCreatePRD}
                  disabled={!canDevelopNote || generatingPRD}
                  className="inline-flex items-center px-6 py-2.5 rounded-full text-xs font-bold shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                >
                  {generatingPRD ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Document...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 mr-2 text-white" />
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={readingMarkdownComponents}>{note.business_idea}</ReactMarkdown>
              </div>
            ) : (
              <div className="idea-reading-unavailable" role="status"><h2>No report saved for this note</h2><p>A report hasn’t been created here.</p>{note?.transcript && <button onClick={() => setActiveTab('transcript')}>Read original note</button>}{note?.transcript && <button onClick={handleGenerateIdea} disabled={!canDevelopNote || generatingIdea}>Develop idea</button>}</div>
            )}
          </div>

          {activeTab === 'transcript' && note && !savedText(note.transcript).trim() && <div className="idea-reading-unavailable" role="status"><h2>No original text saved for this note</h2><p>This note has no saved transcript or original text.</p>{savedText(note.business_idea).trim() && <button onClick={() => setActiveTab('dossier')}>Read report</button>}{savedText(prdContent).trim() && <button onClick={() => setActiveTab('prd')}>Read product spec</button>}<Link to="/" onClick={clearDirectEntryContext}>Back to library</Link></div>}

          {/* Tab Panel 5: Raw Monologue */}
          {note?.transcript && (
            <div className={`space-y-6 ${activeTab === 'transcript' ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <span>🎙️</span> Original note
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {note.audio_url ? 'Speech-to-text transcript' : 'Saved text capture'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(note.transcript)}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition shadow-sm cursor-pointer"
                  >
                    Copy original
                  </button>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 font-sans text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {note.transcript}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState(null);
  const [notesRevision, setNotesRevision] = useState(0);
  const { user, session, logout, authError, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const visibleNotes = notes.filter(note => note.user_id === user?.id);

  useEffect(() => {
    if (!user?.id) {
      setNotes([]);
      setLoadingNotes(false);
      setNotesError(null);
      return;
    }
    let active = true;
    const fetchNotes = async () => {
      setLoadingNotes(true);
      setNotesError(null);
      const loadErrors = [];
      try {
        let rawSupabaseNotes = [];
        const { data, error } = await supabase
          .from('voice_notes')
.select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Fetch notes error:', error);
          loadErrors.push('Saved voice notes could not be loaded.');
        } else if (data) {
          rawSupabaseNotes = data.filter(note => note.user_id === user.id);
        }

        const seenIds = new Set();
        const deduplicated = [];

        // 1. Ingest Supabase voice notes
        for (const n of rawSupabaseNotes) {
          if (!n || !n.id) continue;
          const idStr = String(n.id);
          if (seenIds.has(idStr)) continue;
          seenIds.add(idStr);
          deduplicated.push({ ...n, recordSource: 'voice_notes', mirrorCheck: 'unverified' });
        }

        // 2. Also merge any ideas ingested via the GoodIdea harness API
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/v1/ideas?limit=100', { headers });
          if (res.ok) {
            const apiData = await res.json();
            if (!Array.isArray(apiData.ideas)) throw new Error('Invalid idea list.');
            const ideasList = apiData.ideas;
            // This list is scoped to the current account. Completeness only excludes known
            // account-visible mirrors; foreign or ownerless copies may still exist.
            const completeAccountList = Number.isInteger(apiData.total) && apiData.total >= 0 && apiData.total === ideasList.length && (apiData.offset === 0 || apiData.offset === undefined);
            for (const note of deduplicated) {
              const mirror = ideasList.find(idea => idea.supabaseId && String(idea.supabaseId) === String(note.id));
              note.mirrorCheck = mirror ? 'mirrored' : completeAccountList ? 'no-owned-mirror-seen' : 'unverified';
            }

            for (const i of ideasList) {
              if (!i || !i.id) continue;
              // Filter out seed/initial welcome mock ideas
              if (i.id === 'idea_initial_welcome') continue;
              if (i.userId !== user.id) continue;

              const idStr = String(i.id);
              const supaIdStr = i.supabaseId ? String(i.supabaseId) : null;

              if (seenIds.has(idStr)) continue;
              if (supaIdStr && seenIds.has(supaIdStr)) continue;

              seenIds.add(idStr);
              if (supaIdStr) seenIds.add(supaIdStr);

              deduplicated.push({
                id: i.id,
                recordSource: 'ambient',
                mirrorCheck: 'unverified',
                user_id: i.userId,
                title: i.title,
                author: i.author,
                summary: i.summary,
                tags: i.tags,
                transcript: i.transcript,
                business_idea: i.businessIdeaMarkdown || '',
                prd_content: i.prdContent || null,
                audio_url: i.audio_url || i.audioUrl || null,
                archived: i.archived === true || i.archived === 'true' || i.status === 'archived',
                status: i.status,
                is_featured: i.isFeatured,
                created_at: i.createdAt,
                updated_at: i.updatedAt
              });
            }
          } else {
            throw new Error('Idea library request failed.');
          }
        } catch (err) {
          loadErrors.push('Some ideas could not be loaded.');
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
          setNotesError(loadErrors.length ? loadErrors.join(' ') : null);
        }
      } catch (err) {
        console.error('fetchNotes error:', err);
        if (active) setNotesError('Your library could not be loaded. Please retry.');
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
        { event: 'INSERT', schema: 'public', table: 'voice_notes', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new?.user_id !== user.id) return;
          setNotes((prev) => {
            const filtered = prev.filter(note => !(note.id && note.id.toString().startsWith('temp-')) && note.id !== payload.new.id);
            return [{ ...payload.new, recordSource: 'voice_notes', mirrorCheck: 'unverified' }, ...filtered];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'voice_notes', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new?.user_id !== user.id) {
            setNotes(previous => previous.filter(note => note.id !== payload.new?.id));
            return;
          }
          setNotes((prev) =>
            prev.map((note) => (note.id === payload.new.id ? { ...note, ...payload.new } : note))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'voice_notes' },
        (payload) => {

          setNotes((prev) => prev.filter((note) => note.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, notesRevision]);

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
        <Route path="/privacy" element={<BetaInformation />} />
        <Route
          path="/"
          element={
            user ? (
              <Dashboard notes={visibleNotes} setNotes={setNotes} user={user} loadingNotes={loadingNotes} notesError={notesError} onReloadNotes={() => setNotesRevision(value => value + 1)} />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/integrations"
          element={
            user ? (
              <Dashboard notes={visibleNotes} setNotes={setNotes} user={user} initialOpenIntegrations={true} loadingNotes={loadingNotes} notesError={notesError} onReloadNotes={() => setNotesRevision(value => value + 1)} />
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
