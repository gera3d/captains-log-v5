import { useEffect, useRef, useState } from 'react';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ArrowRightIcon, PencilSquareIcon, SparklesIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/react/24/outline';
import GoodIdeaFlaskLogo from './GoodIdeaFlaskLogo';
import './WelcomeDialog.css';

export default function WelcomeDialog({ onDismiss, onStart }) {
  const [bannerHeight, setBannerHeight] = useState(0);
  const titleRef = useRef(null);

  useEffect(() => {
    const banner = document.querySelector('[data-staging-banner], [data-live-preview-banner]');
    if (!banner) return;
    const updateHeight = () => setBannerHeight(banner.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <Dialog open onClose={onDismiss} initialFocus={titleRef} className="welcome-dialog font-sans" style={{ '--welcome-banner-height': `${bannerHeight}px` }}>
      <div className="welcome-backdrop" aria-hidden="true" />
      <div className="welcome-viewport">
        <DialogPanel className="welcome-panel">
          <div className="welcome-brand"><img src="/goodideas.png" alt="GoodIdea" /></div>
          <button type="button" className="welcome-close" onClick={onDismiss} aria-label="Dismiss onboarding">
            <XMarkIcon aria-hidden="true" />
          </button>
          <div className="welcome-content">
            <p className="welcome-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <DialogTitle as="h1" ref={titleRef} tabIndex={-1} className="welcome-title font-display">Big ideas start<br />with a <span>little spark.</span></DialogTitle>
            <Description className="welcome-description">A passing thought. A problem to solve. Give it a home here, and see what it could become.</Description>
            <ol className="welcome-steps" aria-label="How GoodIdea works">
              <li><PencilSquareIcon aria-hidden="true" /><div><strong>Capture the thought</strong><span>Write it down or record a voice memo.</span></div></li>
              <li><SparklesIcon aria-hidden="true" /><div><strong>Find its potential</strong><span>Choose when to turn it into a business idea.</span></div></li>
              <li><Squares2X2Icon aria-hidden="true" /><div><strong>Keep it moving</strong><span>Organize your ideas in your workspace.</span></div></li>
            </ol>
            <div className="welcome-actions">
              <button type="button" className="welcome-primary" onClick={onStart}>Write my first idea<ArrowRightIcon aria-hidden="true" /></button>
              <button type="button" className="welcome-secondary" onClick={onDismiss}>Explore my workspace</button>
            </div>
            <p className="welcome-reassurance">Start with a few words. No perfect pitch needed.</p>
          </div>
          <aside className="welcome-preview" aria-label="Example idea">
            <div className="welcome-spark" aria-hidden="true"><GoodIdeaFlaskLogo className="h-12 w-12" /></div>
            <div className="welcome-example">
              <div className="welcome-example-label"><PencilSquareIcon aria-hidden="true" /> EXAMPLE IDEA</div>
              <p>What if neighbors could share tools instead of buying them?</p>
              <div className="welcome-example-footer"><PencilSquareIcon aria-hidden="true" /> Example thought<span>Just now</span></div>
            </div>
            <div className="welcome-potential"><SparklesIcon aria-hidden="true" /><div><strong>Something worth exploring.</strong><span>Your next idea could start just like this.</span></div></div>
            <p className="welcome-preview-caption">From “what if” to what’s next.</p>
          </aside>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
