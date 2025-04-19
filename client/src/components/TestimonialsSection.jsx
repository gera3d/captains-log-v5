import React from 'react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alice Johnson',
      role: 'Founder at Airbnb',
      avatar: 'https://i.pravatar.cc/150?img=32',
      quote: 'Captain’s Log turned my raw ideas into structured plans in no time. An absolute game-changer!',
    },
    {
      name: 'Mark Thompson',
      role: 'Product Manager at Stripe',
      avatar: 'https://i.pravatar.cc/150?img=47',
      quote: 'The insights I received were spot on and saved us weeks of research.',
    },
    {
      name: 'Sofia Lee',
      role: 'CTO at Dropbox',
      avatar: 'https://i.pravatar.cc/150?img=51',
      quote: 'I can’t imagine creating a startup without these AI-driven suggestions.',
    },
  ];
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto text-center mb-12 px-4">
        <h2 className="text-h2 font-display text-gray-900">What our users say</h2>
        <p className="mt-2 text-lg text-gray-700">Real feedback from entrepreneurs like you</p>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {testimonials.map((t, idx) => (
          <div key={idx} className="card bg-base-100 shadow-lg p-6">
            <figure className="mb-4">
              <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mx-auto" />
            </figure>
            <blockquote className="italic text-gray-700 mb-4">“{t.quote}”</blockquote>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-600">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}