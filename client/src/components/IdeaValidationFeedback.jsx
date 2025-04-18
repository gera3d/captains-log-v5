import React from "react";

const IdeaValidationFeedback = () => {
  // For demo: hardcoded confidence, label, and color
  const confidence = 0.87; // 0-1 scale
  let confidenceLabel = "Strong Potential";
  let confidenceColor = "text-green-600";
  let confidenceBg = "bg-green-100";
  let confidenceBorder = "border-green-200";
  let confidenceDot = "bg-green-500";
  
  if (confidence < 0.5) {
    confidenceLabel = "Needs Work";
    confidenceColor = "text-red-600";
    confidenceBg = "bg-red-50";
    confidenceBorder = "border-red-200";
    confidenceDot = "bg-red-500";
  } else if (confidence < 0.75) {
    confidenceLabel = "Moderate Potential";
    confidenceColor = "text-yellow-600";
    confidenceBg = "bg-yellow-50";
    confidenceBorder = "border-yellow-200";
    confidenceDot = "bg-yellow-500";
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border border-gray-200 max-w-xl w-full mx-auto">
      {/* Header with pencil icon */}
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" />
          </svg>
        </div>
        <div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${confidenceDot} mr-2`}></div>
            <span className={`font-semibold ${confidenceColor}`}>{confidenceLabel}</span>
            <span className="text-gray-400 text-sm ml-1 font-normal">({Math.round(confidence * 100)}% confidence)</span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <p className="text-gray-700 mb-4 text-sm">
        This idea has <span className="font-semibold text-green-600">strong potential</span> based on keyword trends and competitor activity.
      </p>
      
      {/* Market data info */}
      <div className={`rounded-lg ${confidenceBg} ${confidenceBorder} border px-4 py-3 flex items-center text-sm mb-2`}>
        <svg className="flex-shrink-0 w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" className={confidenceColor}/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" className={confidenceColor}/>
          <path d="M8 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={confidenceColor}/>
          <path d="M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={confidenceColor}/>
        </svg>
        <span className="text-gray-700">Market data integration coming soon...</span>
      </div>
    </div>
  );
};

export default IdeaValidationFeedback;