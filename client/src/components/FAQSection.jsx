import React from 'react';

const faqs = [
  { question: 'How do I record my voice notes?', answer: 'Simply click on the microphone icon, provide permission to access your mic, and start speaking.' },
  { question: 'Can I transcribe existing audio files?', answer: 'Currently, only live voice recordings are supported. Upload support coming soon.' },
  { question: 'How accurate is the transcription?', answer: 'We use advanced speech-to-text services to ensure high accuracy, though results may vary based on audio quality.' },
  { question: 'Is my data secure?', answer: 'All data is encrypted and stored securely in our database. We never share your private recordings.' },
];

export default function FAQSection() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="container mx-auto text-center mb-12">
        <h2 className="text-h2 font-display text-gray-900">Frequently Asked Questions</h2>
      </div>
      <div className="container mx-auto max-w-2xl">
        <ul className="space-y-6">
          {faqs.map((item, idx) => (
            <li key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.question}</h3>
              <p className="text-gray-700">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}