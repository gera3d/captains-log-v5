import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthButton({ className = "", variant = "standard" }) {
  const { user, loading, error, login, logout } = useAuth();

  const handleClick = async () => {
    if (loading) return;
    if (user) {
      await logout();
    } else {
      await login();
    }
  };

  // Different button styles based on variant and user state
  const getButtonClasses = () => {
    if (user) {
      return "bg-white/10 hover:bg-white/20 text-white border border-white/20";
    }
    
    switch (variant) {
      case "primary":
        return "bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-md";
      case "light":
        return "bg-white hover:bg-gray-50 text-gray-700 shadow-md border border-gray-200";
      case "dark":
        return "bg-gray-900 hover:bg-gray-800 text-white shadow-md";
      case "standard":
      default:
        return "bg-white hover:bg-gray-100 text-gray-700 shadow-md border border-gray-200";
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          rounded-md font-medium transition-all duration-200
          flex items-center justify-center
          ${getButtonClasses()}
          ${loading ? "opacity-70 cursor-not-allowed" : ""}
          h-10 min-w-[240px] overflow-hidden
        `}
        aria-busy={loading}
        aria-disabled={loading}
      >
        {loading && <LoadingSpinner size={18} className="inline-block mr-2" />}
        
        {!user && !loading && (
          <div className="flex items-center justify-start w-full">
            {variant === "primary" && (
              <div className="bg-white h-full w-[40px] flex items-center justify-center rounded-l-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </div>
            )}
            
            {variant !== "primary" && (
              <div className="bg-white h-full p-2 flex items-center justify-center rounded-l-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </div>
            )}
            
            <div className="flex-grow text-center font-roboto font-medium text-sm px-6">
              {user ? (loading ? "Signing Out..." : "Sign Out") : (loading ? "Signing In..." : "Sign in with Google")}
            </div>
          </div>
        )}
        
        {user && (
          <span className="flex items-center justify-center w-full">
            {loading ? "Signing Out..." : "Sign Out"}
          </span>
        )}
      </button>
      {error && (
        <div className="mt-2 text-red-500 text-sm font-semibold text-center" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}