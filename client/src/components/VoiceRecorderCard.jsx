import React from "react";
import VoiceRecorder from "./VoiceRecorder";

/**
 * Premium Voice Recording Card
 * - Sophisticated gradient and lighting effects
 * - Visual depth and dimension
 * - Optimized for engagement and delight
 */
const VoiceRecorderCard = ({ onNoteSaved, className = "", demoMode = false, hideGoogleSignIn = false }) => {
  // Add a handler for demo mode clicks
  const handleDemoClick = () => {
    if (demoMode) {
      // Show a tooltip or message encouraging sign up
      alert("Sign up to start recording your ideas!");
      // Or implement a more elegant solution like a tooltip or modal
    }
  };

  return (
    <section
      className={`relative max-w-2xl w-full mx-auto mt-4 mb-8 rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] group ${className}`}
    >
      {/* Dynamic background gradient with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 motion-safe:animate-gradient-slow"></div>
      
      {/* Subtle grid pattern for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2Utb3BhY2l0eT0iMC4wOCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      
      {/* Subtle glow effect */}
      <div className="absolute -inset-px bg-gradient-to-t from-blue-500/30 via-indigo-500/5 to-purple-500/10 opacity-30 group-hover:opacity-40 blur transition-opacity duration-500"></div>
      
      {/* Left corner decoration */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
      
      {/* Right corner decoration */}
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-tl from-indigo-600/20 to-transparent rounded-full translate-x-1/4 translate-y-1/4 blur-xl"></div>
      
      {/* Card content container */}
      <div className="relative flex flex-col items-center py-12 px-8 z-10">
        {/* Heading with premium typography */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white text-center mb-3 drop-shadow-lg">
          <span className="inline-block bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
            Speak Your Next Big Idea
          </span>
        </h1>
        
        {/* Subtitle with refined styling */}
        <p className="text-blue-100 text-center max-w-lg mb-10 font-medium text-lg opacity-90">
          Press the mic and share your thoughts — we'll analyze your idea instantly.
        </p>
        
        {/* Voice recorder component with clear placement */}
        <div className="w-full flex justify-center my-4 relative">
          <VoiceRecorder onNoteSaved={onNoteSaved} />
        </div>
        
        {/* Modify the recording button to handle demo mode */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          onClick={demoMode ? handleDemoClick : () => {}}
          disabled={demoMode ? false : false}
        >
          Start Recording
        </button>

        {/* Only show Google sign-in if not explicitly hidden */}
        {!hideGoogleSignIn && (
          <div className="mt-4">
            {/* Your existing Google sign-in button code */}
          </div>
        )}
        
        {/* Bottom info with styled divider */}
        <div className="w-full mt-6 pt-6 border-t border-white/10 flex flex-col items-center">
          <p className="text-blue-100/80 text-center text-sm max-w-lg flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Your recording will be transcribed, analyzed, and checked for market potential—instantly.
          </p>
        </div>
      </div>
      
      {/* Add styles for animation */}
      <style jsx>{`
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default VoiceRecorderCard;