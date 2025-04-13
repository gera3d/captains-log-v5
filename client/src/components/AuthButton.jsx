import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthButton({ className = "" }) {
  const { user, loading, error, login, logout } = useAuth();

  const handleClick = async () => {
    if (loading) return;
    if (user) {
      await logout();
    } else {
      await login();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-6 py-2 rounded-full font-bold shadow-lg transition-all duration-200
          ${user ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
          ${loading ? "opacity-70 cursor-not-allowed" : ""}
        `}
        aria-busy={loading}
        aria-disabled={loading}
      >
        {loading && <LoadingSpinner size={18} className="inline-block mr-2" />}
        {user ? (loading ? "Signing Out..." : "Sign Out") : (loading ? "Signing In..." : "Sign In with Google")}
      </button>
      {error && (
        <div className="mt-2 text-red-500 text-sm font-semibold text-center" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}