import React from "react";

const IdeaValidationFeedback = () => {
  // For demo: hardcoded confidence, label, and color
  const confidence = 0.87; // 0-1 scale
  let confidenceLabel = "Strong Potential";
  let confidenceColor = "bg-green-400";
  let confidenceText = "text-green-500";
  if (confidence < 0.5) {
    confidenceLabel = "Needs Work";
    confidenceColor = "bg-red-400";
    confidenceText = "text-red-500";
  } else if (confidence < 0.75) {
    confidenceLabel = "Moderate Potential";
    confidenceColor = "bg-yellow-400";
    confidenceText = "text-yellow-500";
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6 flex flex-col items-start border border-gray-100 max-w-xl w-full mx-auto animate-fade-in-up">
      <h2 className="text-lg font-semibold flex items-center mb-2">
        <span role="img" aria-label="Validation">🧪</span>
        <span className="ml-2">Validation Result</span>
      </h2>
      <div className="flex items-center mb-2">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${confidenceColor}`} aria-label="Confidence indicator"></span>
        <span className={`font-semibold ${confidenceText}`}>{confidenceLabel}</span>
        <span className="ml-2 text-xs text-gray-400">({Math.round(confidence * 100)}% confidence)</span>
      </div>
      <p className="text-gray-700 mb-2">
        This idea has <span className={`font-semibold ${confidenceText}`}>{confidenceLabel.toLowerCase()}</span> based on keyword trends and competitor activity.
      </p>
      {/* Placeholder for market data */}
      <div className="w-full mt-2">
        <div className="bg-indigo-50 rounded-lg p-3 text-indigo-900 text-sm mb-2 flex items-center">
          <span className="mr-2">📊</span>
          <span>Market data integration coming soon...</span>
        </div>
        {/* Placeholder for action suggestions */}
        <div className="bg-sky-50 rounded-lg p-3 text-sky-900 text-sm flex items-center">
          <span className="mr-2">⚡</span>
          <span>Next step: <span className="font-semibold">Make a landing page</span> (action suggestions coming soon)</span>
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
};

export default IdeaValidationFeedback;