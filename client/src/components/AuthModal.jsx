import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export function AuthCard({ initialMode = 'signin', onAuthSuccess, className = '', allowSignup = true, onRequestWaitlist }) {
  const { signInWithPassword, signUpWithPassword, login, loginWithGitHub } = useAuth();
  const [mode, setMode] = useState(allowSignup ? initialMode : 'signin'); // 'signin' or 'signup'
  const [username, setUsername] = useState('');
  const [emailOrUser, setEmailOrUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!emailOrUser.trim() || !password) {
          throw new Error('Please enter both your username/email and password.');
        }
        await signInWithPassword(emailOrUser.trim(), password);
        if (onAuthSuccess) onAuthSuccess();
      } else {
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('Please fill in your username, email, and password.');
        }
        const res = await signUpWithPassword(username.trim(), email.trim(), password);
        if (res.requiresConfirmation) {
          setSuccessMsg(res.message || 'Account created! Please check your email to verify your address.');
        } else {
          if (onAuthSuccess) onAuthSuccess();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      if (provider === 'google') await login();
      else if (provider === 'github') await loginWithGitHub();
    } catch (err) {
      setErrorMsg(err.message || `Failed to sign in with ${provider}.`);
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-xl p-6 sm:p-7 text-gray-800 ${className}`}>
      {/* Mode Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/80">
        <button
          type="button"
          onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            mode === 'signin'
              ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { if (!allowSignup) { onRequestWaitlist?.(); return; } setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            mode === 'signup'
              ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {allowSignup ? 'Create Account' : 'Join waiting list'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
          <ExclamationCircleIcon className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
          <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. alex or gera"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Used for authoring notes and fast terminal login</p>
          </div>
        )}

        {mode === 'signin' ? (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <EnvelopeIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Username or your@email.com"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <EnvelopeIcon className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <LockClosedIcon className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin text-white" />
              {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Create Free Account'
          )}
        </button>
      </form>

      {/* Social Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-gray-400 bg-white/90 px-2 mx-auto w-max">
          Or continue with
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-semibold text-gray-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('github')}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </button>
      </div>

      <div className="mt-4 text-center">
        {mode === 'signin' ? (
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { if (!allowSignup) { onRequestWaitlist?.(); return; } setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              {allowSignup ? 'Create one now' : 'Join the waiting list'}
            </button>
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', allowSignup = true, onRequestWaitlist }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-w-md w-full animate-dropdown">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg border border-slate-600 transition"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <AuthCard initialMode={initialMode} onAuthSuccess={onClose} allowSignup={allowSignup} onRequestWaitlist={onRequestWaitlist} />
      </div>
    </div>
  );
}
