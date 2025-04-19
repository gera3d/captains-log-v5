import React from 'react';
import { MicrophoneIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function FeaturesSection() {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="container mx-auto text-center mb-12 px-4">
        <h2 className="text-h2 font-display text-gray-900 mb-4">How it works</h2>
        <p className="text-lg text-gray-700">Transform your spoken ideas into actionable insights in three steps.</p>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 px-4">
        <div className="group relative bg-white shadow-lg p-8 text-center rounded-lg border-2 border-transparent transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
          <div className="badge badge-secondary badge-lg absolute -top-4 left-1/2 transform -translate-x-1/2">1</div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <MicrophoneIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Record</h3>
          <p className="text-gray-600">Click the mic and speak freely to capture your idea.</p>
        </div>
        <div className="group relative bg-white shadow-lg p-8 text-center rounded-lg border-2 border-transparent transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
          <div className="badge badge-secondary badge-lg absolute -top-4 left-1/2 transform -translate-x-1/2">2</div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <DocumentTextIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Transcribe</h3>
          <p className="text-gray-600">Our AI transcribes your voice into structured text instantly.</p>
        </div>
        <div className="group relative bg-white shadow-lg p-8 text-center rounded-lg border-2 border-transparent transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
          <div className="badge badge-secondary badge-lg absolute -top-4 left-1/2 transform -translate-x-1/2">3</div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Validate</h3>
          <p className="text-gray-600">Receive data-driven feedback to refine and enhance your idea.</p>
        </div>
      </div>
    </section>
  );
}