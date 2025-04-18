import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-secondary text-primary-text py-8">
      <div className="container flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm mb-4 md:mb-0">© {new Date().getFullYear()} GoodIdea. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link to="/privacy" className="hover:text-accent text-sm">Privacy</Link>
          <Link to="/terms" className="hover:text-accent text-sm">Terms</Link>
          <Link to="/contact" className="hover:text-accent text-sm">Contact</Link>
        </div>
      </div>
    </footer>
  );
}