import React from "react";

export default function LoadingSpinner({ className = "" }) {
  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <svg
        className="animate-spin h-8 w-8 text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <span className="ml-3 text-indigo-600 font-medium text-lg">Loading...</span>
    </div>
  );
}