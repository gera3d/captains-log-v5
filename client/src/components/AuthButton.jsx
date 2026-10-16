import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import AuthModal from "./AuthModal";

export default function AuthButton({ className = "", variant = "standard" }) {
  const { user, loading, error, login, loginWithGitHub, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('signin');

  const handleGoogleLogin = async () => {
    if (loading) return;
    await login();
  };

  const handleLogout = async () => {
    if (loading) return;
    await logout();
  };

  return (
    <>
      <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
        {loading ? (
          <LoadingSpinner />
        ) : user ? (
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition shadow-sm cursor-pointer"
          >
            Sign Out
          </button>
        ) : (
          <>
            <button
              onClick={() => { setModalMode('signin'); setShowModal(true); }}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <span>🔑</span>
              <span>Sign In with Username / Email</span>
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-gray-800 font-semibold text-sm shadow-sm transition cursor-pointer flex items-center gap-2"
              title="Sign in with Google"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
          </>
        )}
        {error && <p className="w-full text-center text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialMode={modalMode}
      />
    </>
  );
}