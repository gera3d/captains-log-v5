import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import HomepageOutputs from "./HomepageOutputs";
import "./LandingPage.css";

const steps = [
  [
    "Say it or type it.",
    "Record a voice memo or write down what you’re thinking. You don’t have to organize it first.",
  ],
  [
    "Work through the idea.",
    "When you’re ready, turn the note into a structured business idea. Review it, ask more questions, and decide what’s worth pursuing.",
  ],
  [
    "Come back to it.",
    "Keep the original note and organize related ideas in hubs, so you can pick up where you left off.",
  ],
];
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
              <button
                className="home-nav-create"
                onClick={() => setAuthMode("signup")}
              >
                Create an account
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
                Record what you’re thinking or just type it out. Good Idea keeps
                the original note and helps you work through the idea, so you
                can decide what to do next.
              </p>
              <button
                className="home-primary"
                onClick={() => setAuthMode("signup")}
              >
                Create an account
              </button>
              <a className="home-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>
          </section>
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
                  alt="GoodIdea dashboard showing a typed idea for a neighborhood tool library, alongside Active Ideas. The original thought asks whether neighbors could borrow tools they rarely use."
                  width="1088"
                  height="648"
                />
              </picture>
              <figcaption>
                <span className="home-example-label">Example content</span>
                <span>
                  Actual product screen with a synthetic note and mock result.
                  No real account or AI output is shown.
                </span>
              </figcaption>
            </figure>
          </section>
          <section
            id="how-it-works"
            className="home-process home-container home-section"
            aria-labelledby="home-process-title"
          >
            <div className="home-process-intro">
              <h2 id="home-process-title" className="font-display">
                Start with
                <br />
                what you’ve got.
              </h2>
              <p>
                You don’t need to have the whole thing figured out. Get the
                rough version down and work from there.
              </p>
            </div>
            <ol className="home-steps">
              {steps.map(([title, text], index) => (
                <li key={title}>
                  <span className="home-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-display">{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
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
              <p>Start with an idea you’ve been thinking about.</p>
            </div>
            <div className="home-final-actions">
              <button
                className="home-primary"
                onClick={() => setAuthMode("signup")}
              >
                Create an account
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
            <p>© {new Date().getFullYear()} GoodIdea</p>
          </div>
        </footer>
      </div>
      <AuthModal
        isOpen={authMode !== null}
        initialMode={authMode || "signin"}
        onClose={() => setAuthMode(null)}
      />
    </>
  );
}
