import React from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthButton({ className = "", variant = "standard" }) {
  const { user, loading, error, login, loginWithGitHub, logout } = useAuth();

  const handleGoogleLogin = async () => {
    if (loading) return;
    await login();
  };

  const handleGitHubLogin = async () => {
    if (loading) return;
    await loginWithGitHub();
  };

  const handleLogout = async () => {
    if (loading) return;
    await logout();
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}>
      {loading ? (
        <LoadingSpinner />
      ) : user ? (
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`btn btn-secondary ${loading ? 'loading' : ''}`}
        >
          Sign Out
        </button>
      ) : (
        <>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
          >
            Sign in with Google
          </button>
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className={`btn btn-accent ${loading ? 'loading' : ''}`}
          >
            Sign in with GitHub
          </button>
        </>
      )}
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}