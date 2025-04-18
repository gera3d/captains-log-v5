import React from 'react';

// Sample partner logos or media mentions
const logos = [
  'https://upload.wikimedia.org/wikipedia/commons/0/08/TechCrunch_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Forbes_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6b/Product_Hunt_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/Fast_Company_logo.svg',
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container text-center">
        <h2 className="text-h2 font-display text-gray-900 mb-8">Featured In</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center">
          {logos.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="Partner logo"
              className="mx-auto h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}