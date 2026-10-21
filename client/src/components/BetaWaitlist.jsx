import { useRef } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { beta } from "../runtimeConfig";
import "./BetaWaitlist.css";

export default function BetaWaitlistDialog({ open, onClose }) {
  const closeRef = useRef(null);
  return (
    <Dialog open={open} onClose={onClose} initialFocus={closeRef} className="beta-dialog">
      <div className="beta-backdrop" aria-hidden="true" />
      <div className="beta-dialog-viewport">
        <DialogPanel className="beta-panel">
          <div className="beta-panel-brand">
            <img src="/goodideas.png" alt="GoodIdea" />
            <button ref={closeRef} aria-label="Close waiting list" onClick={onClose}>×</button>
          </div>
          <div className="beta-panel-content">
            <DialogTitle className="font-display">Join the beta waiting list.</DialogTitle>
            <p>Good Idea is in beta. Leave your email for an update when there’s room to try it. Joining the list doesn’t create an account.</p>
            {beta.responderUrl ? (
              <>
                <a className="home-primary beta-form-link" href={beta.responderUrl} target="_blank" rel="noopener noreferrer">Open the waiting-list form</a>
                <p className="beta-form-help">The form opens in a new tab. Submit it there to join the list. Opening it doesn’t save your email.</p>
              </>
            ) : (
              <p className="beta-unavailable" role="status">The waiting list isn’t open yet. Please check back soon.</p>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
