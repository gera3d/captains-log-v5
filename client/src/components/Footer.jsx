import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img src="/goodideas.png" alt="GoodIdea Logo" className="h-7 w-auto drop-shadow-md" />
            <span className="hidden sm:inline-block text-white/20">|</span>
            <p className="text-xs text-slate-400">
              The fastest way to capture and validate startup ideas with voice AI.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-2 text-sm">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} GoodIdea. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built for founders, innovators, and creators</span>
          </p>
        </div>
      </div>
    </footer>
  );
}