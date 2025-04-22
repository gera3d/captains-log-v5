import React, { useState, useEffect, useRef } from 'react';

const PersonaSelector = ({ firstName, selectedPersona, setSelectedPersona }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
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
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white font-medium rounded-full px-4 py-1.5 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="mr-1.5 text-white/90">{firstName || 'User'} the</span>
        <span className="font-semibold">{selectedPersona}</span>
        <svg 
          className={`ml-2 h-4 w-4 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown with animation */}
      {isOpen && (
        <div className="absolute mt-2 w-72 right-0 origin-top-right transition-all duration-200 transform animate-dropdown">
          {/* Glass effect container */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-black/5 text-gray-800 overflow-hidden border border-indigo-100">
            <div className="px-4 py-2.5 text-xs font-semibold text-indigo-800 uppercase tracking-wider bg-indigo-50/80 border-b border-indigo-100">
              Choose your persona
            </div>
            <div className="max-h-80 overflow-auto">
              {personas.map((persona) => (
                <div key={persona.id} className="group relative">
                  <button
                    className={`flex w-full items-center px-4 py-3 text-sm hover:bg-indigo-50 transition-colors duration-150 ${
                      persona.label === selectedPersona 
                        ? 'bg-indigo-100 text-indigo-800 font-medium' 
                        : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedPersona(persona.label);
                      setIsOpen(false);
                    }}
                  >
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100/60 text-xl mr-3">
                      {persona.icon}
                    </span>
                    <span>{persona.label}</span>
                    
                    {persona.label === selectedPersona && (
                      <svg className="ml-auto h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Tooltip that appears on hover */}
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 w-64 p-3 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                    <div className="absolute top-1/2 transform -translate-y-1/2 -left-2 w-0 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-gray-800"></div>
                    <p className="font-medium mb-1">{persona.label} Goals:</p>
                    <p className="text-gray-300">{persona.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 text-xs flex justify-between items-center bg-gray-50 border-t border-gray-100">
              <span className="text-gray-500">Current: <span className="font-medium text-gray-700">{selectedPersona}</span></span>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaSelector;
