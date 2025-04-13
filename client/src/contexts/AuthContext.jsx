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
    setLoading(true);
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setError(error.message);
      setSession(data?.session || null);
      setUser(data?.session?.user || null);
      setLoading(false);
    });

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

  // Login with Google (popup)
  const login = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
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
