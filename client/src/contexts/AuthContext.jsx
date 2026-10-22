import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Context shape
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to auth state changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.warn("[AuthContext] getSession warning:", error.message);
          setError(error.message);
        }
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          if (window.location.hash && window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error("[AuthContext] Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      if (event === "SIGNED_OUT") {
        setError(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Resolve username to email (checks local cache first, then API)
  const resolveEmailFromUsername = async (username) => {
    if (!username || typeof username !== 'string') return '';
    const clean = username.trim().toLowerCase();
    if (clean.includes('@')) return clean;

    // Check localStorage cache
    try {
      const savedUsers = JSON.parse(localStorage.getItem('goodidea_username_cache') || '{}');
      if (savedUsers[clean]) return savedUsers[clean];
    } catch {}

    // Check API
    try {
      const res = await fetch(`/api/v1/auth/resolve-username?username=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          try {
            const savedUsers = JSON.parse(localStorage.getItem('goodidea_username_cache') || '{}');
            savedUsers[clean] = data.email;
            localStorage.setItem('goodidea_username_cache', JSON.stringify(savedUsers));
          } catch {}
          return data.email;
        }
      }
    } catch {}

    // Common default for single user system if username is gera/gerayeremin
    if (clean === 'gera' || clean === 'gerayeremin' || clean === 'gera3d') {
      return 'gera@why57.com';
    }

    return '';
  };

  // Sign In with Password (supports Email or Username)
  const signInWithPassword = useCallback(async (emailOrUsername, password) => {
    setError(null);
    try {
      let targetEmail = (emailOrUsername || '').trim();
      if (!targetEmail.includes('@')) {
        const resolved = await resolveEmailFromUsername(targetEmail);
        if (!resolved) {
          throw new Error(`Username "${targetEmail}" not found. Please enter your email address or create a new account.`);
        }
        targetEmail = resolved;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email/username or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email address not yet confirmed. Please check your inbox for the confirmation link.');
        }
        throw error;
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { success: true, user: data?.user };
    } catch (err) {
      setError(err?.message || 'Sign in failed');
      throw err;
    }
  }, []);

  // Sign Up with Username & Password
  const signUpWithPassword = useCallback(async (username, email, password) => {
    setError(null);
    try {
      const cleanUser = (username || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanUser || cleanUser.length < 2) {
        throw new Error('Please enter a username of at least 2 characters.');
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Register username mapping with API so login by username works immediately
      try {
        await fetch('/api/v1/auth/register-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, email: cleanEmail })
        });
        const savedUsers = JSON.parse(localStorage.getItem('goodidea_username_cache') || '{}');
        savedUsers[cleanUser.toLowerCase()] = cleanEmail;
        localStorage.setItem('goodidea_username_cache', JSON.stringify(savedUsers));
      } catch (regErr) {
        console.warn('Could not register username mapping:', regErr);
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            username: cleanUser,
            full_name: cleanUser
          }
        }
      });

      if (error) throw error;

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        return { success: true, user: data.user, requiresConfirmation: false };
      }

      return {
        success: true,
        user: data?.user,
        requiresConfirmation: true,
        message: 'Account created! Please check your email to verify your address, then sign in.'
      };
    } catch (err) {
      setError(err?.message || 'Sign up failed');
      throw err;
    }
  }, []);

  // Login with Google (popup/redirect)
  const login = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Initiate OAuth flow with redirectTo option
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      // redirect browser to OAuth URL returned
      if (data?.url) window.location.assign(data.url);
    } catch (err) {
      if (err?.message?.includes("popup")) {
        setError("Popup closed before completing sign in.");
      } else {
        setError(err?.message || "Sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with GitHub
  const loginWithGitHub = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Initiate GitHub OAuth flow with repo scope
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.origin,
          scopes: 'repo', // Request repository access
        }
      });
      if (error) throw error;
      // redirect browser to OAuth URL returned
      if (data?.url) window.location.assign(data.url);
    } catch (err) {
      if (err?.message?.includes("popup")) {
        setError("Popup closed before completing GitHub sign in.");
      } else {
        setError(err?.message || "GitHub Sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err?.message || "Sign out failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose context value
  const value = {
    user,
    session,
    loading,
    error,
    login,
    loginWithGitHub,
    signInWithPassword,
    signUpWithPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
