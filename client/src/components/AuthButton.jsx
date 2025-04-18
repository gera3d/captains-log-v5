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

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`btn ${user ? 'btn-secondary' : 'btn-primary'} ${loading ? 'loading' : ''}`}
      >
        {loading ? '' : user ? 'Sign Out' : 'Sign in with Google'}
      </button>
    </div>
  );
}