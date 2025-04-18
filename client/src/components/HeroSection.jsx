import React from 'react';
import AuthButton from './AuthButton';

export default function HeroSection() {
  return (
    <div className="hero min-h-screen bg-gradient-primary text-primary-text">
      <div className="hero-content text-center">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold">Turn Your Thoughts Into Startups — In Days, Not Months.</h1>
          <p className="py-6">Speak your ideas out loud. We'll transcribe, organize, and tell you if it's a winner — backed by research.</p>
          <AuthButton />
        </div>
      </div>
    </div>
  );
}