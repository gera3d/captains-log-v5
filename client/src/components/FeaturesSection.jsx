import React from 'react';
import { MicrophoneIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function FeaturesSection() {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-h2 font-display text-gray-900">How it works</h2>
          <p className="mt-4 text-lg text-gray-600">Follow three simple steps to turn your idea into a startup plan.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="btn btn-circle btn-primary btn-sm mb-4">
                <MicrophoneIcon className="h-5 w-5 text-primary-text" />
              </div>
              <h3 className="card-title">Record Your Idea</h3>
              <p>Tap the mic and speak freely—your voice note is captured instantly.</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="btn btn-circle btn-primary btn-sm mb-4">
                <DocumentTextIcon className="h-5 w-5 text-primary-text" />
              </div>
              <h3 className="card-title">Transcribe & Analyze</h3>
              <p>We transcribe your words, extract the core idea, and structure it.</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="btn btn-circle btn-primary btn-sm mb-4">
                <CheckIcon className="h-5 w-5 text-primary-text" />
              </div>
              <h3 className="card-title">Get Insights</h3>
              <p>Receive data-driven feedback on market potential and next steps.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}