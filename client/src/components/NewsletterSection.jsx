import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate newsletter signup API
    alert(`Thank you for subscribing, ${email}!`);
    setEmail('');
  };

  return (
    <section className="bg-secondary py-16 px-4">
      <div className="container mx-auto text-center mb-8">
        <h2 className="text-h2 font-display text-white">Stay Updated</h2>
        <p className="mt-2 text-lg text-white">Subscribe to our newsletter for the latest updates and insights.</p>
      </div>
      <form onSubmit={handleSubmit} className="container mx-auto flex flex-col sm:flex-row max-w-md mx-auto px-4 gap-6">
        <input
          type="email"
          required
          placeholder="Your email address"
          className="input input-bordered flex-grow"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-accent">
          Subscribe
        </button>
      </form>
    </section>
  );
}