import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="navbar bg-primary text-primary-text">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <img src="/goodideas.png" alt="GoodIdea" className="h-8" />
        </Link>
      </div>
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/features">Features</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/docs">Docs</Link></li>
        </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user.email}</span>
            <button onClick={logout} className="btn btn-accent btn-sm">Sign Out</button>
          </div>
        ) : (
          <button onClick={login} className="btn btn-accent btn-sm">Sign In</button>
        )}
        <button onClick={() => setOpen(o => !o)} className="btn btn-square btn-ghost md:hidden ml-2">
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="w-full md:hidden">
          <ul className="menu menu-vertical p-2 bg-primary text-primary-text">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/docs">Docs</Link></li>
            <li>{user ? <button onClick={logout}>Sign Out</button> : <button onClick={login}>Sign In</button>}</li>
          </ul>
        </div>
      )}
    </div>
  );
}