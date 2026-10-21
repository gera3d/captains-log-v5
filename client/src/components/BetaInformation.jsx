import { useEffect } from "react";
import { Link } from "react-router-dom";
import GoodIdeaWord from "./GoodIdeaWord";
import "./LandingPage.css";

// Scope: the verified beta collection description (AIW-549), not a full app policy.
export default function BetaInformation() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="home-page font-sans min-h-screen">
      <header className="home-header">
        <nav className="home-nav home-container" aria-label="Information navigation">
          <Link to="/" aria-label="GoodIdea home"><img className="home-wordmark" src="/goodideas.png" alt="GoodIdea" /></Link>
          <Link className="text-sm font-semibold text-white underline underline-offset-4 hover:text-indigo-100" to="/">Back to homepage</Link>
        </nav>
      </header>
      <main className="home-container py-12 sm:py-20 max-w-3xl" id="main-content">
        <p className="text-sm font-semibold text-indigo-600 mb-4"><GoodIdeaWord /> beta</p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-slate-900 mb-8">Beta access &amp; privacy</h1>
        <div className="space-y-8 text-base text-slate-600 leading-relaxed">
          <section aria-labelledby="waiting-list-info">
            <h2 id="waiting-list-info" className="text-xl font-semibold text-slate-900 mb-3">The waiting list</h2>
            <p>The beta waiting list asks for your email for beta access updates. Joining it doesn’t create a GoodIdea account.</p>
            <p className="mt-3">The waiting-list form opens in a separate tab on Google Forms. Submit the form there to join. Opening the form alone doesn’t save your email.</p>
          </section>
          <section aria-labelledby="existing-account-info">
            <h2 id="existing-account-info" className="text-xl font-semibold text-slate-900 mb-3">Already have an account?</h2>
            <p>Use Sign in on the homepage to open your existing account. The waiting list is separate from account sign-in and your idea workspace.</p>
          </section>
          <section aria-labelledby="information-scope">
            <h2 id="information-scope" className="text-xl font-semibold text-slate-900 mb-3">About this information</h2>
            <p>This page explains the beta waiting list. It is not a complete privacy policy for the GoodIdea app. Read the information shown on Google Forms before submitting your email.</p>
          </section>
          <Link className="home-secondary" to="/">Back to homepage</Link>
        </div>
      </main>
    </div>
  );
}
