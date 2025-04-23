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
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import NotesList from './components/NotesList';
import VoiceRecorder from './components/VoiceRecorder';
import VoiceRecorderCard from './components/VoiceRecorderCard';
import IdeaValidationFeedback from './components/IdeaValidationFeedback';
import { CheckIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon } from '@heroicons/react/24/outline';
import Button from './components/Button';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthButton from './components/AuthButton';
import FeaturesSection from './components/FeaturesSection';
import RoadmapSection from './components/RoadmapSection'; // Import the RoadmapSection
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import PersonaSelector from './components/PersonaSelector'; // Import PersonaSelector

/*
  TODO[MEDIUM]: Dashboard Onboarding
  - FEATURE: Add user onboarding tips for first-time users.
  - UI: Consider a dismissible banner or modal for onboarding.
*/

function LandingPage() {
  return (
    <div className="bg-gradient-primary text-primary-text overflow-hidden min-h-screen flex flex-col">
      {/* Remove header as logo will now be part of main content */}

      <main className="flex-1 flex items-center py-16"> {/* Added top and bottom padding */}
        <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* LEFT SIDE: Voice recorder card/microphone module */}
          <div className="lg:w-1/2 lg:order-1 order-2 relative pt-12"> {/* Added padding-top to make room for the banner */}
            <div className="transform transition-all hover:scale-105 relative z-10">
              {/* Glow effect */}
              <div className="absolute -inset-12 bg-blue-500/30 blur-3xl rounded-full"></div>
              
              
              {/* Voice recorder component */}
              <VoiceRecorderCard 
                onNoteSaved={() => {}} 
                className="relative z-20 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] border-2 border-white/20" 
                demoMode={true}
                hideGoogleSignIn={true}
              />
              
              {/* Enhanced decorative effects */}
              <div className="absolute -bottom-20 left-1/2 transform translate-y-1/2 -translate-x-1/2 w-[120%] h-40 bg-gradient-to-b from-transparent to-blue-500/20 blur-2xl rounded-full z-10"></div>
            </div>
          </div>
          
          {/* RIGHT SIDE: Logo and content */}
          <div className="lg:w-1/2 lg:order-2 order-1 flex flex-col items-center lg:items-start">
            {/* Large logo */}
            <img src="/goodideas.png" alt="GoodIdea Logo" className="h-28 w-auto mb-8" />
            
            {/* Text content */}
            <h1 className="font-display text-h1 mb-4 text-center lg:text-left">
              Turn Your Thoughts Into Startups — In Days, Not Months.
            </h1>
            <p className="text-lg mb-6 text-center lg:text-left">
              Speak your ideas out loud. We'll transcribe, organize, and tell you if it's a winner — backed by research.
            </p>
            <div className="flex space-x-4">
              <AuthButton />
              <button
                className="bg-secondary text-primary-text rounded-lg px-6 py-3 hover:bg-opacity-90 cursor-pointer"
                onClick={() => {
                  const section = document.getElementById('how-it-works');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Features and other sections with adjusted spacing */}
      <div className="mt-16"> {/* Reduced margin to balance spacing */}
        <FeaturesSection />
        <RoadmapSection /> {/* Add RoadmapSection before FAQSection */}
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}

function Dashboard({ notes, setNotes, user }) {
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

  // DEV MODE: If ?dev_user=1 is present, always show onboarding modal and mock user
  const isDevUser = typeof window !== "undefined" && window.location.search.includes("dev_user=1");
  const devMockUser = {
    id: "dev-user-1",
    email: "devuser@example.com",
    user_metadata: { full_name: "Dev User" }
  };
  const effectiveUser = isDevUser ? devMockUser : user;

  // Enhanced title extraction with better JSON and markdown handling
  const extractTitle = (idea) => {
    // Return manually set title if available
    if (idea.title) return idea.title;
    
    if (idea.business_idea) {
      let content = idea.business_idea.trim();
      
      // More aggressive cleanup of JSON formatting
      try {
        // Handle case where entire content might be JSON
        if (content.startsWith('{') && content.endsWith('}')) {
          try {
            const parsed = JSON.parse(content);
            if (parsed && typeof parsed === 'object' && parsed.text) {
              content = parsed.text;
            }
          } catch (e) {
            // Not valid JSON, continue with normal processing
          }
        }
      } catch (e) {
        console.log("JSON parsing attempted but failed:", e);
      }
      
      // Remove common text prefixes
      content = content
        .replace(/^text['"]\s*:\s*["']/, '')  // Remove text": or text': prefix
        .replace(/^["']text["']\s*:\s*["']/, '')  // Remove "text": or 'text': prefix
        .replace(/^["']/, '')  // Remove leading quotes
        .replace(/["']$/, '')  // Remove trailing quotes
        .trim();
      
      // Better H2 matching to find titles across content
      const h2Regex = /^##\s+([^\n]+)|[\n]##\s+([^\n]+)/m;
      const h2Match = content.match(h2Regex);
      
      if (h2Match) {
        // Use the first found H2 as the title (could be from first or second group)
        const h2Title = (h2Match[1] || h2Match[2]).trim();
        console.log(`H2 title found: "${h2Title}"`);
        return h2Title.length > 60 ? h2Title.substring(0, 57) + '...' : h2Title;
      }
      
      // If no H2, get the first non-empty line
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length > 0) {
        // Clean the first line to be used as title
        const firstLine = lines[0]
          .replace(/^#+\s+/, '')  // Remove any markdown headers (#, ##, ###)
          .replace(/\\["']/g, '')  // Remove escaped quotes
          .trim();
        
        console.log(`Using first line as title: "${firstLine}"`);
        return firstLine.length > 60 ? firstLine.substring(0, 57) + '...' : firstLine;
      }
      
      console.log("No good title found, using content start");
      return content.length > 60 ? content.substring(0, 57) + '...' : content;
    }
    
    // Fallback to transcription if available
    if (idea.transcription) {
      const text = idea.transcription.trim();
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
    
    return 'Untitled Idea';
  };

  // Format date to be more compact
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Improved active ideas selection logic - show all ideas with content except archived ones
  useEffect(() => {
    if (notes.length > 0) {
      // First, select all non-archived notes with business_idea content 
      const contentNotes = notes
        .filter(note => 
          // Must have business idea content
          note.business_idea && 
          note.business_idea.trim().length > 0 && 
          // Must not be archived
          note.archived !== true
        )
        .sort((a, b) => {
          // Sort by updated_at (for regenerated ideas) or created_at if no update time
          const dateA = new Date(a.updated_at || a.created_at);
          const dateB = new Date(b.updated_at || b.created_at);
          return dateB - dateA; // Newest first
        });

      // Prioritize featured/active notes first
      const featuredNotes = contentNotes.filter(note => 
        note.status === 'active' || note.is_featured === true
      );
      
      // Then include other content notes
      const otherContentNotes = contentNotes.filter(note => 
        !featuredNotes.some(f => f.id === note.id)
      );
      
      // Combine with priority to featured/active notes - show all non-archived ideas with content
      const allPrioritizedNotes = [...featuredNotes, ...otherContentNotes];
      
      // Set all content notes as active ideas (no limit)
      setActiveIdeas(allPrioritizedNotes);
      
      console.log(`Active ideas updated: ${allPrioritizedNotes.length} ideas found`);
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

  const promoteToActiveIdea = async (noteId) => {
    const noteToPromote = notes.find(note => note.id === noteId);
    if (!noteToPromote) return;
    
    try {
      const { data, error } = await supabase
        .from('voice_notes')
        .update({ is_featured: true, status: 'active' })
        .eq('id', noteId);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error promoting idea:", err);
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
            <div className="flex items-center">
              <img
                src="/goodideas.png"
                alt="GoodIdea Logo"
                className="h-12 w-auto drop-shadow-sm"
              />
            </div>
            
            {effectiveUser && (
              <div className="flex items-center space-x-4">
                <div className="relative flex items-center text-white/90 text-sm">
                  <svg className="h-3.5 w-3.5 mr-1.5 text-white/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {effectiveUser.user_metadata?.full_name 
                      ? effectiveUser.user_metadata.full_name.split(' ')[0] 
                      : effectiveUser.email.split('@')[0]}
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
          
          <main className="relative pt-10 pb-16 bg-gradient-to-b from-slate-100 to-white min-h-[calc(100vh-5rem)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-8 mb-16">
                {/* First container - Record Your Idea */}
                <div className="lg:w-1/2 order-1">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Record Your Idea</h2>
                  <div className="h-[600px]"> {/* Set explicit fixed height */}
                    <VoiceRecorderCard 
                      onNoteSaved={onNoteSaved} 
                      className="shadow-xl border border-indigo-100 h-full" 
                    />
                  </div>
                </div>
                
                {/* Second container - Active Ideas */}
                <div className="lg:w-1/2 order-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Active Ideas</h2>
                    <button 
                      className="text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
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
                              onClick={() => window.location.href = `/idea/${idea.id}`}
                            >
                              <div className="flex flex-col h-full">
                                <h3 className="font-medium text-sm text-gray-900 leading-tight mb-0.5 line-clamp-2">
                                  {extractTitle(idea)}
                                </h3>
                                <div className="flex justify-between items-center mt-auto pt-1">
                                  <span className="text-xs text-gray-400">
                                    {formatDate(idea.created_at)}
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
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomPersonaModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCustomPersona}
                  disabled={!customPersonaName.trim()}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
                    customPersonaName.trim() ? 'hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'
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
  const [prdContent, setPrdContent] = useState(null);
  const [activeTab, setActiveTab] = useState('idea');
  const [prdError, setPrdError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Fetch note error:', error);
        console.error('Full error object:', error);
      }
      else {
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
          }
          idea = idea.replace(/^["']?text["']?\s*:\s*["']?/, '');
          idea = idea.replace(/\\n/g, '\n').trim();
          data.business_idea = idea;
        }
        
        // Set PRD content if it exists in the database
        if (data?.prd_content) {
          setPrdContent(data.prd_content);
          console.log('PRD content loaded from database');
        }
        
        setNote(data);
      }
    };
    fetchNote();
  }, [id]);

  const copyIdea = async () => {
    if (note) {
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

  const handleCreatePRD = async () => {
    if (!note || generatingPRD) return;
    
    try {
      setGeneratingPRD(true);
      setPrdError(null);
      
      // Get content for the PRD
      const title = note.title || (note.business_idea?.split('\n')[0]) || 'Untitled Idea';
      const content = note.business_idea || note.transcript || '';
      
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
      const generatedPRD = data.text || data.prd || data.output || `# PRD for ${title}\n\nUnable to generate PRD content.`;
      
      // Save PRD to database
      const { error: updateError } = await supabase
        .from('voice_notes')
        .update({ prd_content: generatedPRD })
        .eq('id', note.id);
        
      if (updateError) {
        console.error('Error saving PRD to database:', updateError);
        // Continue with setting the PRD content in state even if saving to DB fails
      } else {
        console.log('PRD saved to database successfully');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main content card with improved spacing */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          {/* Clean header with back button and single title */}
          <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="mr-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Back to dashboard"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 flex-grow truncate">
                {note?.title || (note?.business_idea?.split('\n')[0]?.replace(/^#+\s*/, '')) || 'Loading idea...'}
              </h1>
            </div>
          </div>

          {/* Action buttons in a separate, well-spaced row */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-wrap gap-2 justify-end border-b border-gray-100">
            <button
              onClick={handleCopyIdea}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!note || !user}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 2v5a2 2 0 002 2h5" />
              </svg>
              Copy Markdown
            </button>
            
            {/* Create PRD button - new addition */}
            <button
              onClick={handleCreatePRD}
              disabled={!note || !user || generatingPRD}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {generatingPRD ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create PRD
                </>
              )}
            </button>
            
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={!note || !user}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Idea
            </button>
            
            <button
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              More Actions
            </button>
          </div>
          
          {/* Tab Navigation - Matching Dark Theme */}
          <div className="bg-[#1E1E1E] border-b border-gray-800">
            <div className="flex px-4 sm:px-6 relative">
              <button
                onClick={() => setActiveTab('idea')}
                className={`flex items-center py-3 px-4 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === 'idea'
                    ? 'text-white bg-[#121212]'
                    : 'text-gray-300 hover:text-gray-100'
                }`}
                aria-current={activeTab === 'idea' ? 'page' : undefined}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`mr-2 h-5 w-5 ${activeTab === 'idea' ? 'text-white' : 'text-gray-400'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Idea
              </button>
              <button
                onClick={() => prdContent && setActiveTab('prd')}
                disabled={!prdContent}
                className={`flex items-center py-3 px-4 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === 'prd'
                    ? 'text-white bg-purple-800'
                    : 'text-gray-300 hover:text-gray-100'
                } ${!prdContent ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-current={activeTab === 'prd' ? 'page' : undefined}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`mr-2 h-5 w-5 ${activeTab === 'prd' ? 'text-white' : 'text-gray-400'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PRD {!prdContent && '(Not Generated)'}
              </button>
            </div>
          </div>

          {/* Content section with improved transitions */}
          <div className={`px-4 py-6 sm:px-6 overflow-auto transition-all duration-200 ${
            activeTab === 'idea' ? 'block' : 'hidden'
          }`}>
            {/* Existing idea tab content */}
            {note ? (
              <>
                {note.created_at && (
                  <p className="text-sm text-gray-500 mb-3">
                    Created on {new Date(note.created_at).toLocaleString()}
                  </p>
                )}
                
                <div className="prose max-w-none">
                  {note.business_idea ? (
                    <ReactMarkdown>{note.business_idea}</ReactMarkdown>
                  ) : note.transcript ? (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-gray-800 whitespace-pre-wrap">{note.transcript}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No content available for this note.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <div className={`px-4 py-6 sm:px-6 overflow-auto transition-all duration-200 ${
            activeTab === 'prd' ? 'block' : 'hidden'
          }`}>
            {/* PRD tab content */}
            {prdContent ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{prdContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                {prdError ? (
                  <div className="text-red-600 mb-4">
                    <p className="font-semibold">Error generating PRD:</p>
                    <p>{prdError}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No PRD has been generated for this idea yet.</p>
                )}
                <button
                  onClick={handleCreatePRD}
                  disabled={generatingPRD}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {generatingPRD ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : 'Generate PRD'}
                </button>
              </div>
            )}
          </div>
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
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Fetch notes error:', error);
        console.error('Full error object:', error);
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
