import React from 'react';

export default function PricingSection() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto text-center mb-12">
        <h2 className="text-h2 font-display text-gray-900">Pricing Plans</h2>
        <p className="mt-4 text-lg text-gray-700">Choose a plan that fits your needs</p>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
        <div className="card bg-base-100 shadow-xl p-6 rounded-box border">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Basic</h3>
          <p className="text-4xl font-extrabold mb-4 text-gray-900">$0<span className="text-lg font-normal">/mo</span></p>
          <ul className="mb-6 space-y-3 text-left text-gray-700">
            <li>3 voice notes per month</li>
            <li>Email support</li>
          </ul>
          <button className="btn btn-outline btn-primary w-full">Get Started</button>
        </div>
        <div className="card bg-base-100 shadow-xl p-6 rounded-box border">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Pro</h3>
          <p className="text-4xl font-extrabold mb-4 text-gray-900">$19<span className="text-lg font-normal">/mo</span></p>
          <ul className="mb-6 space-y-3 text-left text-gray-700">
            <li>Unlimited voice notes</li>
            <li>Priority email support</li>
            <li>Advanced analytics</li>
          </ul>
          <button className="btn btn-primary w-full">Choose Plan</button>
        </div>
        <div className="card bg-base-100 shadow-xl p-6 rounded-box border">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Team</h3>
          <p className="text-4xl font-extrabold mb-4 text-gray-900">$49<span className="text-lg font-normal">/mo</span></p>
          <ul className="mb-6 space-y-3 text-left text-gray-700">
            <li>Team collaboration</li>
            <li>Admin controls</li>
            <li>Dedicated support</li>
          </ul>
          <button className="btn btn-primary w-full">Get Started</button>
        </div>
      </div>
    </section>
  );
}