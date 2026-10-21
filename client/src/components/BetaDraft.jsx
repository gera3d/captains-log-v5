import { useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import "./BetaDraft.css";

export function BetaWaitlistDialog({ open, onClose }) {
  const [email, setEmail] = useState(""),
    [previewed, setPreviewed] = useState(false),
    closeRef = useRef(null);
  const close = () => {
    setEmail("");
    setPreviewed(false);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={close}
      initialFocus={closeRef}
      className="beta-dialog"
    >
      <div className="beta-backdrop" aria-hidden="true" />
      <div className="beta-dialog-viewport">
        <DialogPanel className="beta-panel">
          <div className="beta-panel-brand">
            <img src="/goodideas.png" alt="GoodIdea" />
            <button
              ref={closeRef}
              aria-label="Close waiting list"
              onClick={close}
            >
              ×
            </button>
          </div>
          <div className="beta-panel-content">
            <p className="beta-preview-note">
              Mock preview. Nothing is sent or saved.
            </p>
            <DialogTitle className="font-display">
              Join the beta waiting list.
            </DialogTitle>
            <p>
              Good Idea is in beta. Leave your email for an update when there’s
              room to try it.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPreviewed(true);
              }}
            >
              <label htmlFor="beta-waitlist-email">Email address</label>
              <input
                id="beta-waitlist-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setPreviewed(false);
                }}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
              <button className="home-primary" type="submit">
                Join the waiting list
              </button>
            </form>
            {previewed && (
              <p className="beta-preview-result" role="status">
                Preview only. Your email wasn’t sent or saved.
              </p>
            )}
            <Link
              className="beta-invitation-link"
              to="/friends-and-family?preview=homepage"
              onClick={close}
            >
              Have an invitation?
            </Link>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function BetaInvitationPage() {
  const [code, setCode] = useState(""),
    [previewed, setPreviewed] = useState(false),
    [showSignin, setShowSignin] = useState(false),
    [showWaitlist, setShowWaitlist] = useState(false);
  const waitlist = () => {
    setShowSignin(false);
    setShowWaitlist(true);
  };
  return (
    <div className="beta-invitation-page font-sans">
      <header className="home-header">
        <div className="home-container beta-invite-nav">
          <Link to="/?preview=homepage">
            <img src="/goodideas.png" alt="GoodIdea" />
          </Link>
          <button onClick={() => setShowSignin(true)}>Sign in</button>
        </div>
      </header>
      <main className="beta-invitation-main">
        <p className="beta-preview-note">
          Mock preview. Invitations aren’t connected.
        </p>
        <p className="beta-invite-label">Friends &amp; family beta</p>
        <h1 className="font-display">
          Have an invitation
          <br />
          from Gera?
        </h1>
        <p>Enter the code from your invitation to check access.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPreviewed(true);
          }}
        >
          <label htmlFor="beta-invitation-code">Invitation code</label>
          <input
            id="beta-invitation-code"
            autoComplete="off"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setPreviewed(false);
            }}
            placeholder="Code from your invitation"
            required
          />
          <button className="home-primary" type="submit">
            Check invitation
          </button>
        </form>
        {previewed && (
          <p className="beta-preview-result" role="status">
            Preview only. Your invitation wasn’t checked and no account was
            created.
          </p>
        )}
        <p className="beta-invite-help">
          No invitation yet?{" "}
          <button onClick={waitlist}>Join the waiting list.</button>
        </p>
        <p className="beta-invite-existing">
          Already have an account?{" "}
          <button onClick={() => setShowSignin(true)}>Sign in.</button>
        </p>
      </main>
      <AuthModal
        isOpen={showSignin}
        onClose={() => setShowSignin(false)}
        initialMode="signin"
        allowSignup={false}
        onRequestWaitlist={waitlist}
      />
      <BetaWaitlistDialog
        open={showWaitlist}
        onClose={() => setShowWaitlist(false)}
      />
    </div>
  );
}
