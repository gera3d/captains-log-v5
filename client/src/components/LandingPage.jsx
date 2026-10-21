import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import { isBetaMode } from "../runtimeConfig";
import BetaWaitlistDialog from "./BetaWaitlist";
import HomepageOutputs from "./HomepageOutputs";
import CodingTools from "./CodingTools";
import GoodIdeaWord from "./GoodIdeaWord";
import "./LandingPage.css";

const questions = [
  [
    "Does it have to be a business idea?",
    "No. Start with a problem you’ve noticed or something you want to try. Save it as a note. You can decide later whether to work it into a business idea.",
  ],
  [
    "Can I just type it out?",
    "Yes. Choose Text Monologue in the dashboard to type or paste your thoughts. Voice Memo is there when you’d rather talk it through.",
  ],
  [
    "What does the AI actually do?",
    "It helps turn your note into a structured business idea you can review. You’ll still need to check the assumptions, do your own research, and decide whether it makes sense.",
  ],
  [
    "What happens to my original note?",
    "You can return to the original note in your dashboard. Keep related ideas together in hubs when you want to work through them as a group.",
  ],
];

export default function LandingPage() {
  const [authMode, setAuthMode] = useState(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const requestAccess = () => {
    if (isBetaMode) {
      setAuthMode(null);
      setShowWaitlist(true);
    } else {
      setAuthMode("signup");
    }
  };
  return (
    <>
      <div className="home-page font-sans">
        <a className="home-skip" href="#main-content">
          Skip to content
        </a>
        <header className="home-header">
          <nav className="home-nav home-container" aria-label="Main navigation">
            <a href="#" aria-label="GoodIdea home">
              <img
                className="home-wordmark"
                src="/goodideas.png"
                alt="GoodIdea"
              />
            </a>
            <div className="home-nav-links">
              <a href="#how-it-works">How it works</a>
              <a href="#workspace">The dashboard</a>
              <a href="#faq">Questions</a>
            </div>
            <div className="home-account-actions">
              <button
                className="home-signin"
                onClick={() => setAuthMode("signin")}
              >
                Sign in
              </button>
              <button className="home-nav-create" onClick={requestAccess}>
                {isBetaMode ? "Join the waiting list" : "Create an account"}
              </button>
            </div>
          </nav>
        </header>
        <main id="main-content" tabIndex={-1}>
          <section
            className="home-intro home-container"
            aria-labelledby="home-title"
          >
            <h1 id="home-title" className="font-display">
              Have an idea?
              <br />
              Let’s figure out what
              <br className="home-desktop-break" /> to do with it.
            </h1>
            <div className="home-intro-copy">
              <p>
                Record what you’re thinking. You can type it out, too.{" "}
                <GoodIdeaWord /> keeps your original note and helps you decide
                what to do next.
              </p>
              <div className="home-intro-actions">
                <button className="home-primary" onClick={requestAccess}>
                  {isBetaMode ? "Join the waiting list" : "Create an account"}
                </button>
                <a className="home-secondary" href="#how-it-works">See how it works</a>
              </div>
              {isBetaMode && <p className="beta-public-note"><GoodIdeaWord /> is in beta.</p>}
            </div>
          </section>
          <CodingTools />
          <section
            id="workspace"
            className="home-demo home-container"
            aria-label="The GoodIdea dashboard"
          >
            <div className="home-demo-heading">
              <p>Here’s what that looks like.</p>
              <span>A rough thought, in the actual dashboard</span>
            </div>
            <figure>
              <picture>
                <source
                  media="(max-width: 650px)"
                  srcSet="/images/homepage-workspace-mobile.png"
                />
                <img
                  src="/images/homepage-workspace-desktop.png"
                  alt="Actual GoodIdea dashboard with Voice Memo selected and the microphone idle, ready to record. Text Monologue is available as a secondary option; a synthetic tool-library idea is shown alongside."
                  width="1088"
                  height="656"
                />
              </picture>
              <figcaption>
                <span className="home-example-label">Voice Memo example</span>
                <span>
                  Actual dashboard, ready to record. Synthetic example idea; no
                  recording was made.
                </span>
              </figcaption>
            </figure>
          </section>
          <HomepageOutputs />
          <section
            id="faq"
            className="home-questions-section"
            aria-labelledby="home-faq-title"
          >
            <div className="home-container home-faq home-section">
              <div>
                <h2 id="home-faq-title" className="font-display">
                  A few questions
                  <br />
                  you might have.
                </h2>
                <p>
                  Something else on your mind?
                  <br />
                  <Link to="/contact">Get in touch.</Link>
                </p>
              </div>
              <div className="home-questions">
                {questions.map(([question, answer]) => (
                  <details key={question}>
                    <summary>
                      {question}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
          <section
            className="home-final home-container"
            aria-labelledby="home-final-title"
          >
            <div>
              <h2 id="home-final-title" className="font-display">
                Want to try it?
              </h2>
              <p>
                {isBetaMode
                  ? "Join the waiting list to hear when you can try it."
                  : "Start with an idea you’ve been thinking about."}
              </p>
            </div>
            <div className="home-final-actions">
              <button className="home-primary" onClick={requestAccess}>
                {isBetaMode ? "Join the waiting list" : "Create an account"}
              </button>
              <p>
                Already have an account?{" "}
                <button onClick={() => setAuthMode("signin")}>Sign in</button>
              </p>
            </div>
          </section>
        </main>
        <footer className="home-footer">
          <div className="home-container">
            <div className="home-footer-top">
              <a href="#" aria-label="GoodIdea home">
                <img
                  className="home-wordmark"
                  src="/goodideas.png"
                  alt="GoodIdea"
                />
              </a>
              <nav aria-label="Footer navigation">
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <Link to="/contact">Contact</Link>
              </nav>
            </div>
            <p>© {new Date().getFullYear()} <GoodIdeaWord /></p>
          </div>
        </footer>
      </div>
      <AuthModal
        isOpen={authMode !== null}
        initialMode={authMode || "signin"}
        allowSignup={!isBetaMode}
        onRequestWaitlist={requestAccess}
        onClose={() => setAuthMode(null)}
      />
      {isBetaMode && (
        <BetaWaitlistDialog
          open={showWaitlist}
          onClose={() => setShowWaitlist(false)}
        />
      )}
    </>
  );
}
